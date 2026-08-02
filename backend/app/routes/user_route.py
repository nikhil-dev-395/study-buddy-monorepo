from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.db.database import get_session
from app.models.user_model import AuthResponse, User, UserCreate, UserRead
from app.repository.user_repository import UserRepository
from app.schemas.google_auth import GoogleAuthRequest
from app.services.auth.google_service import verify_google_token
from app.services.auth.token import create_access_token
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse
from app.utils.logger import logger
router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    session: Session = Depends(get_session)
):
    repo = UserRepository(session)

    # 1. Validation check
    existing_user = repo.get_user_by_email(user_in.email)
    if existing_user:
        logger.info(f"Attempted to create user with existing email: {user_in.email}")
        raise ApiError(
            message="User with this email already exists.",
            status_code=status.HTTP_400_BAD_REQUEST,
            metadata={"email": user_in.email}
        )

    # 2. Create record in Supabase
    new_user = repo.create_user(user_in)

    # 3. Format response
    user_data = UserRead.model_validate(new_user)
    logger.info(f"Successfully created user  {new_user} ({new_user.email})")
    return ApiResponse.success(
        message="User created successfully",
        status_code=status.HTTP_201_CREATED,
        data=user_data.model_dump(mode="json")
    )



@router.get("/all", response_model=list[UserRead])
def get_all_users(
    session: Session = Depends(get_session)
):
    repo = UserRepository(session)
    users = repo.get_all_users()
    return ApiResponse.success(
        message="Users retrieved successfully",
        status_code=status.HTTP_200_OK,
        data=[UserRead.model_validate(user).model_dump(mode="json") for user in users]
    )

@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    session: Session = Depends(get_session)
):
    repo = UserRepository(session)
    user = repo.get_user_by_id(user_id)

    if not user:
        logger.warning(f"User with ID {user_id} not found.")
        raise ApiError(
            message="User not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            metadata={"user_id": user_id}
        )

    logger.info(f"Retrieved user with ID: {user.id} ({user.email})")
    return ApiResponse.success(
        message="User retrieved successfully",
        status_code=status.HTTP_200_OK,
        data=UserRead.model_validate(user).model_dump(mode="json")
    )



@router.post("/google/auth", response_model=AuthResponse)
def login_user(
    token_data: GoogleAuthRequest,  # Request body containing the google_token
    session: Session = Depends(get_session)
):
    # 1. Verify the Google ID Token
    google_profile = verify_google_token(token_data.id_token)

    email = google_profile.get("email")
    name = google_profile.get("name")
    picture = google_profile.get("picture")

    if not email:
        raise ApiError(
            message="Google account must have an associated email.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # 2. Check if user already exists
    repo = UserRepository(session)
    existing_user = repo.get_user_by_email(email)

    if existing_user:
        logger.info(f"User with email {email} logged in.")
        user = existing_user
    else:
        logger.info(f"Creating new user for email {email}.")
        # 3. User does not exist -> Create new user record
        # Adjust fields based on your actual UserRepository and User model implementation
        user_in = UserCreate(
            email=email,
            username=name if name else 'Unknown User',              # Adjust field names to match your UserCreate schema
            avatar_url=picture      # Adjust or remove if not present in your schema
        )
        user = repo.create_user(user_in)

    # 4. Convert user model to response schema / JSON payload
    response_data = User.model_validate(user).model_dump(mode="json")
    user_read = UserRead.model_validate(user)
    token = create_access_token(user_id=user_read.id, email=user_read.email)
    # Optional: Generate your application's JWT access token here
    # access_token = create_access_token(data={"sub": str(user.id)})

    return ApiResponse.success(
        message="User logged in successfully" if existing_user else "User registered successfully",
        status_code=status.HTTP_200_OK if existing_user else status.HTTP_201_CREATED,
        data={**user_read.model_dump(mode="json"), "token": token},
        metadata={"user_id": user_read.id, "email": user_read.email}
    )



# generate response

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
from app.services.auth.dependency import get_current_user
from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session

from app.models.user_model import AuthResponse, UserCreate, UserRead
from app.schemas.google_auth import GoogleAuthRequest
from app.services.auth.google_service import create_access_token, verify_google_token

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






router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/google/auth")
def login_user(
    token_data: GoogleAuthRequest,
    response: Response,
    session: Session = Depends(get_session)
):
    # 1. Verify Google ID token
    google_profile = verify_google_token(token_data.id_token)

    email = google_profile.get("email")
    name = google_profile.get("name")
    picture = google_profile.get("picture")
    google_sub = google_profile.get("sub")  # Google's unique user ID

    if not email:
        raise ApiError(
            message="Google account must have an associated email.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # 2. Fetch or create user
    repo = UserRepository(session)
    existing_user = repo.get_user_by_email(email)

    if existing_user:
        logger.info("User with email %s logged in.", email)
        user = existing_user
        http_status = status.HTTP_200_OK
        message = "User logged in successfully"
    else:
        logger.info("Creating new user for email %s.", email)
        user_in = UserCreate(
            email=email,
            username=name if name else "Unknown User",
            avatar_url=picture,
            google_id=google_sub
        )
        user = repo.create_user(user_in)
        http_status = status.HTTP_201_CREATED
        message = "User registered successfully"

    response.status_code = http_status

    # 3. Generate access token
    user_read = UserRead.model_validate(user)
    access_token = create_access_token(user_id=user_read.id, email=user_read.email)

    # 4. Construct payload matching AuthResponse schema
    auth_data = AuthResponse(
        user=user_read,
        access_token=access_token,
        token_type="bearer"
    )

    return ApiResponse.success(
        message=message,
        status_code=http_status,
        data=auth_data.model_dump(mode="json")
    )

@router.get("/me")
def get_my_profile(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Example Protected Route: Requires header 'Authorization: Bearer <token>'
    """
    repo = UserRepository(session)
    user = repo.get_user_by_id(current_user["user_id"])

    if not user:
        raise ApiError(
            message="User not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    return ApiResponse.success(
        message="Profile retrieved successfully",
        status_code=status.HTTP_200_OK,
        data=UserRead.model_validate(user).model_dump(mode="json")
    )

# generate response

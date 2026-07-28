from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.db.database import get_session
from app.models.user_model import UserCreate, UserRead
from app.repository.user_repository import UserRepository
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

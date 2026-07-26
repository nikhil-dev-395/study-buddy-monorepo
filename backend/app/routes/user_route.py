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
    logger.info(f"Successfully created user with ID: {new_user.id} ({new_user.email})")
    return ApiResponse.success(
        message="User created successfully",
        status_code=status.HTTP_201_CREATED,
        data=user_data.model_dump(mode="json")
    )

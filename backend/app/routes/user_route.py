from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.db.database import get_session
from app.models.user_model import UserCreate, UserRead
from app.repository.user_repository import UserRepository

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    session: Session = Depends(get_session)
):
    repo = UserRepository(session)

    #  Business Logic / Validation Check
    existing_user = repo.get_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )

    #  Create User via Repository
    new_user = repo.create(user_in)
    return new_user

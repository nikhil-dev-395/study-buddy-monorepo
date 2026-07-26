# we need only user related create data

from sqlmodel import Session,select
from typing import List, Optional
from app.models.user_model import User, UserBase


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_user(self, user_in: UserBase) -> UserBase:
        user = User(**user_in.model_dump())
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_user_by_id(self, user_id: int) -> Optional[UserBase]:
        statement = select(UserBase).where(UserBase.id == user_id)
        result = self.session.exec(statement).first()
        return result

    def get_all_users(self) -> List[UserBase]:
        statement = select(UserBase)
        result = self.session.exec(statement).all()
        return result

    def get_user_by_email(self, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()

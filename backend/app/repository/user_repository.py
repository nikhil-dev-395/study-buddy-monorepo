# we need only user related create data

from sqlmodel import Session,select
from typing import List, Optional,Tuple
from sqlmodel import Session, col, func, or_, select
from app.models.user_model import User, UserBase, UserRead
from app.models.user_model import UserProfile

class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_user(self, user_in: UserBase) -> UserBase:
        user = User(**user_in.model_dump())
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        statement = select(User).where(User.id == user_id)
        result = self.session.exec(statement).first()
        return result

    def get_all_users(self) -> List[User]:
        statement = select(User)
        return list(self.session.exec(statement).all())

    def get_user_by_email(self, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()

    def search_users(self, query: str, current_user_id: Optional[int] = None) -> List[Tuple[User, Optional[UserProfile]]]:
        """Searches across name, headline, location, and study_specs JSON."""
        search_pattern = f"%{query.lower()}%"

        statement = (
            select(User, UserProfile)
            .outerjoin(UserProfile, User.id == UserProfile.user_id) # type: ignore
            .where(
                or_(
                    func.lower(User.username).like(search_pattern),
                    func.lower(UserProfile.name).like(search_pattern),
                    func.lower(UserProfile.headline).like(search_pattern),
                    func.lower(UserProfile.location).like(search_pattern),
                    func.lower(UserProfile.about).like(search_pattern),
                    func.cast(UserProfile.study_specs, col(UserProfile.headline).type).ilike(search_pattern), # type: ignore
                )
            )
        )

        if current_user_id:
            statement = statement.where(User.id != current_user_id)

        return self.session.exec(statement).all() # type: ignore

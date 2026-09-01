# app/repository/profile_repo.py
from typing import Optional, Sequence
from sqlmodel import Session, select
from app.models.user_model import UserProfile, ProfileCreate, ProfileUpdate

class ProfileRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_or_update(self, user_id: int, profile_in: ProfileCreate) -> UserProfile:
        existing = self.get_by_user_id(user_id)
        if existing:
            update_data = profile_in.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(existing, key, value)
            self.session.add(existing)
            self.session.commit()
            self.session.refresh(existing)
            return existing

        profile = UserProfile(**profile_in.model_dump(), user_id=user_id)
        self.session.add(profile)
        self.session.commit()
        self.session.refresh(profile)
        return profile

    def get_by_user_id(self, user_id: int) -> Optional[UserProfile]:
        statement = select(UserProfile).where(UserProfile.user_id == user_id)
        return self.session.exec(statement).first()

    def get_all_profiles(self, skip: int = 0, limit: int = 20) -> Sequence[UserProfile]:
        statement = select(UserProfile).offset(skip).limit(limit)
        return self.session.exec(statement).all()

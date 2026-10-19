# app/repository/study_session_repo.py
from typing import Optional, Sequence
from sqlmodel import Session, or_, select
from app.models.study_session_model import StudySession


class StudySessionRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, study_session: StudySession) -> StudySession:
        self.session.add(study_session)
        self.session.commit()
        self.session.refresh(study_session)
        return study_session

    def get(self, session_id: int) -> Optional[StudySession]:
        return self.session.get(StudySession, session_id)

    def list_for_user(self, user_id: int) -> Sequence[StudySession]:
        statement = (
            select(StudySession)
            .where(or_(StudySession.host_id == user_id, StudySession.buddy_id == user_id))
            .order_by(StudySession.starts_at)  # type: ignore
        )
        return self.session.exec(statement).all()

    def save(self, study_session: StudySession) -> StudySession:
        self.session.add(study_session)
        self.session.commit()
        self.session.refresh(study_session)
        return study_session

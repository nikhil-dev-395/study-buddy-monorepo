# app/repository/study_session_repo.py
from typing import Iterable, Optional, Sequence
from sqlmodel import Session, col, or_, select
from app.models.study_session_model import StudySession, StudySessionParticipant


class StudySessionRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, study_session: StudySession, participant_ids: Iterable[int]) -> StudySession:
        self.session.add(study_session)
        self.session.flush()  # assigns study_session.id
        for uid in participant_ids:
            self.session.add(
                StudySessionParticipant(
                    session_id=study_session.id,  # type: ignore
                    user_id=uid,
                    invited_by=study_session.host_id,
                )
            )
        self.session.commit()
        self.session.refresh(study_session)
        return study_session

    def get(self, session_id: int) -> Optional[StudySession]:
        return self.session.get(StudySession, session_id)

    def participant_ids(self, session_id: int) -> list[int]:
        statement = select(StudySessionParticipant.user_id).where(
            StudySessionParticipant.session_id == session_id
        )
        return list(self.session.exec(statement).all())

    def is_member(self, s: StudySession, user_id: int) -> bool:
        return user_id == s.host_id or user_id in self.participant_ids(s.id)  # type: ignore

    def list_for_user(self, user_id: int) -> Sequence[StudySession]:
        joined = select(StudySessionParticipant.session_id).where(
            StudySessionParticipant.user_id == user_id
        )
        statement = (
            select(StudySession)
            .where(or_(StudySession.host_id == user_id, col(StudySession.id).in_(joined)))
            .order_by(StudySession.starts_at)  # type: ignore
        )
        return self.session.exec(statement).all()

    def add_participants(self, session_id: int, user_ids: Iterable[int], invited_by: int):
        for uid in user_ids:
            self.session.add(
                StudySessionParticipant(session_id=session_id, user_id=uid, invited_by=invited_by)
            )
        self.session.commit()

    def remove_participant(self, session_id: int, user_id: int):
        row = self.session.exec(
            select(StudySessionParticipant).where(
                (StudySessionParticipant.session_id == session_id)
                & (StudySessionParticipant.user_id == user_id)
            )
        ).first()
        if row:
            self.session.delete(row)
            self.session.commit()

    def save(self, study_session: StudySession) -> StudySession:
        self.session.add(study_session)
        self.session.commit()
        self.session.refresh(study_session)
        return study_session

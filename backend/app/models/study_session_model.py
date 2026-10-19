# app/models/study_session_model.py
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import declared_attr
from sqlmodel import Field, SQLModel


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class StudySessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"


class StudySession(SQLModel, table=True):
    @declared_attr  # type: ignore
    def __tablename__(cls) -> str:  # type: ignore
        return "study_sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    host_id: int = Field(foreign_key="user.id", index=True)
    title: str
    skill_tag: Optional[str] = None
    notes: Optional[str] = None
    starts_at: datetime = Field(index=True)
    ends_at: datetime
    status: StudySessionStatus = Field(default=StudySessionStatus.SCHEDULED)
    room_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=get_utc_now)


class StudySessionParticipant(SQLModel, table=True):
    """Everyone invited to a session besides the host (group sessions)."""

    @declared_attr  # type: ignore
    def __tablename__(cls) -> str:  # type: ignore
        return "study_session_participants"

    __table_args__ = (UniqueConstraint("session_id", "user_id", name="uq_session_participant"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="study_sessions.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    invited_by: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=get_utc_now)


MAX_PARTICIPANTS = 8  # host + 7 invitees keeps a Jitsi room usable


class CreateStudySessionSchema(BaseModel):
    participant_ids: List[int]
    title: str
    skill_tag: Optional[str] = None
    notes: Optional[str] = None
    starts_at: datetime
    ends_at: datetime


class AddParticipantsSchema(BaseModel):
    user_ids: List[int]


class RescheduleStudySessionSchema(BaseModel):
    starts_at: datetime
    ends_at: datetime


class ParticipantSchema(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    is_host: bool = False


class StudySessionResponseSchema(BaseModel):
    """`status` here is derived from time: upcoming / live / completed / cancelled.
    `participants` lists everyone in the session (host included) except the viewer."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    host_id: int
    is_host: bool
    title: str
    skill_tag: Optional[str] = None
    notes: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    status: str
    room_id: str
    created_at: datetime
    participants: List[ParticipantSchema]

# app/models/study_session_model.py
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict
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
    buddy_id: int = Field(foreign_key="user.id", index=True)
    title: str
    skill_tag: Optional[str] = None
    notes: Optional[str] = None
    starts_at: datetime = Field(index=True)
    ends_at: datetime
    status: StudySessionStatus = Field(default=StudySessionStatus.SCHEDULED)
    room_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=get_utc_now)


class CreateStudySessionSchema(BaseModel):
    buddy_id: int
    title: str
    skill_tag: Optional[str] = None
    notes: Optional[str] = None
    starts_at: datetime
    ends_at: datetime


class RescheduleStudySessionSchema(BaseModel):
    starts_at: datetime
    ends_at: datetime


class StudySessionResponseSchema(BaseModel):
    """`status` here is derived from time: upcoming / live / completed / cancelled."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    host_id: int
    buddy_id: int
    title: str
    skill_tag: Optional[str] = None
    notes: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    status: str
    room_id: str
    created_at: datetime
    partner_id: int
    partner_name: str
    partner_avatar: Optional[str] = None

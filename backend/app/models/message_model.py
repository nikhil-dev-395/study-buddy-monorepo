# app/models/message_model.py
from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import BaseModel
from sqlmodel import Field, SQLModel


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MessageBase(SQLModel):
    sender_id: int = Field(foreign_key="user.id", index=True)
    receiver_id: int = Field(foreign_key="user.id", index=True)
    content: str


class Message(MessageBase, table=True):
    __tablename__: Literal["messages"]  # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=get_utc_now)


class SendMessageSchema(BaseModel):
    receiver_id: int
    content: str


class MessageResponseSchema(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationPreviewSchema(BaseModel):
    peer_id: int
    name: str
    avatar_url: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0

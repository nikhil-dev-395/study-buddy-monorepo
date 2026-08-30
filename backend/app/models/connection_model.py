# app/models/connection_model.py
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import declared_attr
from sqlmodel import Field, SQLModel


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ConnectionStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class ConnectionRequestBase(SQLModel):
    sender_id: int = Field(foreign_key="user.id", index=True)
    receiver_id: int = Field(foreign_key="user.id", index=True)
    message: Optional[str] = Field(default=None)


class ConnectionRequest(ConnectionRequestBase, table=True):

    @declared_attr # type: ignore
    def __tablename__(cls) -> str: # type: ignore
        return "connection_requests"

    __table_args__ = (
        UniqueConstraint(
            "sender_id", "receiver_id", name="uq_sender_receiver_connection"
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    status: ConnectionStatus = Field(
        default=ConnectionStatus.PENDING, index=True
    )
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)


class SendConnectionSchema(BaseModel):
    receiver_id: int
    message: Optional[str] = None


class ConnectionActionSchema(BaseModel):
    request_id: int


# Fixed: Added from_attributes=True
class ConnectionResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    receiver_id: int
    status: ConnectionStatus
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

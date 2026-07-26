from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)
class UserBase(SQLModel ,table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str
    created_at: datetime = Field(default_factory=get_utc_now,
        nullable=False,)
    updated_at: datetime = Field(default_factory=get_utc_now,
                                 sa_column_kwargs={"onupdate": get_utc_now},
                                 nullable=False,)


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    pass

class User(UserBase, table=True):
    id : Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=get_utc_now, nullable=False)

# app/models/user_model.py
from typing import Optional
from datetime import datetime, timezone
from pydantic import EmailStr
from sqlmodel import SQLModel, Field

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

# 1. Non-table schema for shared input fields
class UserBase(SQLModel):
    username: str
    email: EmailStr = Field(unique=True, index=True)
    time_zone: str = "UTC"

# 2. Database table model
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=get_utc_now)

# 3. Request schema
class UserCreate(UserBase):
    pass

# 4. Response schema
class UserRead(UserBase):
    id: int
    created_at: datetime

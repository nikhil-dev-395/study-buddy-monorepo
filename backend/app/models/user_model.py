from typing import Optional, Dict, Any, List, ClassVar,Literal
from datetime import datetime, timezone
from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declared_attr

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class UserBase(SQLModel):
    username: str
    email: EmailStr = Field(unique=True, index=True)
    avatar_url: Optional[str] = None
    time_zone: str = "UTC"

class User(UserBase, table=True):
    __tablename__: Literal['user'] # type: ignore


    id: Optional[int] = Field(default=None, primary_key=True)
    google_id: Optional[str] = Field(default=None, unique=True, index=True)
    created_at: datetime = Field(default_factory=get_utc_now)

    profile: Optional["UserProfile"] = Relationship(back_populates="user")

    # Optional 1-to-1 relationship to Profile
    # profile: Optional["UserProfile"] = Relationship(back_populates="user")
    profile: Optional["UserProfile"] = Relationship(back_populates="user")
class UserCreate(UserBase):
    google_id: Optional[str] = None

class UserRead(UserBase):
    id: Optional[int]
    google_id: Optional[str] = None
    created_at: datetime

class AuthResponse(SQLModel):
    user: UserRead
    access_token: str
    token_type: str = "bearer"


# --- 2. New Peer Profile Models (Safe Additions) ---

class UserProfileBase(SQLModel):
    name: str
    headline: Optional[str] = None  # e.g., "Computer Science • Junior • Stanford University"
    location: Optional[str] = None
    study_mode: Optional[str] = "Hybrid Mode"
    about: Optional[str] = None
    trust_score: str = "Verified Learner"

    # Social Contacts
    discord_handle: Optional[str] = None
    linkedin_url: Optional[str] = None

    # Dynamic Nested Data
    proof_of_work: Dict[str, Any] = Field(default={}, sa_column=Column(JSONB))
    featured_posts: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSONB))
    study_specs: Dict[str, Any] = Field(default={}, sa_column=Column(JSONB))
    work_history: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSONB))

class UserProfile(UserProfileBase, table=True):
    __tablename__: str = "user_profiles" # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    updated_at: datetime = Field(default_factory=get_utc_now)

    user: Optional[User] = Relationship(back_populates="profile")

class ProfileCreate(UserProfileBase):
    pass

class ProfileUpdate(SQLModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    study_mode: Optional[str] = None
    about: Optional[str] = None
    trust_score: Optional[str] = None
    discord_handle: Optional[str] = None
    linkedin_url: Optional[str] = None
    proof_of_work: Optional[Dict[str, Any]] = None
    featured_posts: Optional[List[Dict[str, Any]]] = None
    study_specs: Optional[Dict[str, Any]] = None
    work_history: Optional[List[Dict[str, Any]]] = None

class ProfileRead(UserProfileBase):
    id: int
    user_id: int
    updated_at: datetime
    # Optionally expose parent user info (email/avatar/username)
    username: Optional[str] = None
    avatar_url: Optional[str] = None

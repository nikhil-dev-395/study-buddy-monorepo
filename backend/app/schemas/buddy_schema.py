# app/schemas/buddy_schema.py
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AcademicDetails(BaseModel):
    institution: Optional[str] = None
    major: Optional[str] = None
    year: Optional[str] = None


class StudyPreferences(BaseModel):
    subjects: List[str] = []
    mode: str = "hybrid"  # "online" | "in-person" | "hybrid"


class UserStatus(BaseModel):
    isSearching: bool = True


class BuddyCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    avatarUrl: Optional[str] = None
    location: Optional[str] = None
    academicDetails: AcademicDetails
    studyPreferences: StudyPreferences
    status: UserStatus
    isRequestAccepted: bool
    connectionRequestId: int

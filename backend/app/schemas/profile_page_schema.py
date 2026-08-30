# app/schemas/profile_page_schema.py
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class AcademicDetails(BaseModel):
    institution: str = "Not Specified"
    major: str = "General Studies"
    year: str = "Student"


class UserStatus(BaseModel):
    isSearching: bool = True
    lastActive: str = "Active recently"


class StudyPreferences(BaseModel):
    mode: str = "hybrid"  # "hybrid" | "online" | "in-person"
    timeZone: str = "UTC"
    availability: List[str] = []
    learningStyle: str = "Collaborative Learning"


class Skills(BaseModel):
    learning: List[str] = []
    teaching: List[str] = []


class WorkExperience(BaseModel):
    role: str
    company: str
    duration: str
    description: str


class ProofOfWork(BaseModel):
    github: Optional[Dict[str, Any]] = None
    medium: Optional[Dict[str, Any]] = None
    dribbble: Optional[Dict[str, Any]] = None
    devTo: Optional[Dict[str, Any]] = None
    kaggle: Optional[Dict[str, Any]] = None
    personalWebsite: Optional[str] = None


class FeaturedPost(BaseModel):
    id: str
    platform: str
    title: str
    url: str
    stars: Optional[int] = None
    claps: Optional[int] = None
    likes: Optional[int] = None
    date: str


class Socials(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None
    discord: Optional[str] = None


class FullUserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    username: str
    avatarUrl: Optional[str] = None
    location: str
    bio: str
    userType: str = "student"
    academicDetails: AcademicDetails
    status: UserStatus
    studyPreferences: StudyPreferences
    skills: Skills
    workExperience: List[WorkExperience]
    proofOfWork: ProofOfWork
    featuredPosts: List[FeaturedPost]
    socials: Socials

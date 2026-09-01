# app/routes/profile_route.py
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from typing import Optional

from app.db.database import get_session
from app.models.user_model import ProfileCreate, ProfileRead ,User,UserProfile
from app.repository.profile_repo import ProfileRepository
from app.repository.user_repository import UserRepository
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse
from app.schemas.profile_page_schema import (
    AcademicDetails,
    FeaturedPost,
    FullUserProfileResponse,
    ProofOfWork,
    Skills,
    Socials,
    StudyPreferences,
    UserStatus,
    WorkExperience,
)
from app.services.auth.dependency import get_current_user
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse

# router = APIRouter(prefix="/profile", tags=["Profiles"])

router = APIRouter(prefix="/profile", tags=["Profiles"])


@router.post("/onboard", status_code=status.HTTP_201_CREATED)
def onboard_or_update_profile(
    payload: ProfileCreate,
    user_id: int,
    session: Session = Depends(get_session),
):
    repo = ProfileRepository(session)
    profile = repo.create_or_update(user_id=user_id, profile_in=payload)
    return ApiResponse.success(
        message="User profile saved successfully",
        status_code=status.HTTP_201_CREATED,
        data=ProfileRead.model_validate(profile).model_dump(mode="json"),
    )


@router.get("/{user_id}")
def get_peer_profile(user_id: int, session: Session = Depends(get_session)):
    repo = ProfileRepository(session)
    profile = repo.get_by_user_id(user_id)
    if not profile:
        raise ApiError(
            message="Profile not found for this user.",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    return ApiResponse.success(
        message="Profile retrieved successfully",
        status_code=status.HTTP_200_OK,
        data=ProfileRead.model_validate(profile).model_dump(mode="json"),
    )


@router.get("/peers/all")
def get_all_peers(
    skip: int = 0, limit: int = 20, session: Session = Depends(get_session)
):
    repo = ProfileRepository(session)
    profiles = repo.get_all_profiles(skip=skip, limit=limit)
    return ApiResponse.success(
        message="Peer listings retrieved successfully",
        status_code=status.HTTP_200_OK,
        data=[
            ProfileRead.model_validate(p).model_dump(mode="json")
            for p in profiles
        ],
    )






def build_full_profile(
    user: User, profile: Optional[UserProfile]
) -> FullUserProfileResponse:
    """Transforms User + UserProfile database entities into React component structure."""
    # 1. Headline breakdown
    headline = (profile.headline if profile else "") or ""
    parts = [p.strip() for p in headline.split("•")]
    major = parts[0] if len(parts) > 0 and parts[0] else "Computer Science"
    year = parts[1] if len(parts) > 1 and parts[1] else "Junior"
    institution = (
        parts[2] if len(parts) > 2 and parts[2] else "Stanford University"
    )

    # 2. Specs breakdown
    specs = (profile.study_specs if profile else {}) or {}
    mode_raw = (
        (profile.study_mode if profile else "hybrid")
        .lower()  #type:ignore
        .replace(" mode", "")
    )
    mode = (
        mode_raw if mode_raw in ["online", "in-person", "hybrid"] else "hybrid"
    )

    pow_dict = (profile.proof_of_work if profile else {}) or {}
    posts_list = (profile.featured_posts if profile else []) or []
    work_list = (profile.work_history if profile else []) or []

    # 3. Socials
    gh_url = pow_dict.get("github", {}).get(
        "url"
    ) or f"https://github.com/{user.username.lower().replace(' ', '')}"
    li_url = (
        profile.linkedin_url if profile else None
    ) or "https://linkedin.com"
    discord = (profile.discord_handle if profile else None) or "study_buddy#0001"

    return FullUserProfileResponse(
        id=f"usr_{user.id}",
        name=profile.name
        if (profile and profile.name)
        else (user.username or "Student"),
        username=user.username.lower().replace(" ", "_"),
        avatarUrl=user.avatar_url,
        location=profile.location if profile else "Global / Remote", #type:ignore
        bio=profile.about
        if (profile and profile.about)
        else "Passionate learner on Study Buddy.",
        userType="student",
        academicDetails=AcademicDetails(
            institution=institution, major=major, year=year
        ),
        status=UserStatus(isSearching=True, lastActive="Just now"),
        studyPreferences=StudyPreferences(
            mode=mode,
            timeZone=specs.get("timezone", user.time_zone or "UTC"),
            availability=specs.get(
                "availability",
                ["Mon/Wed/Fri - Evenings", "Weekends - Flexible"],
            ),
            learningStyle=specs.get(
                "learning_approach",
                "Active Recall & Mock Technical Interviews",
            ),
        ),
        skills=Skills(
            learning=specs.get(
                "wants_to_learn", ["System Design", "Algorithms"]
            ),
            teaching=specs.get("can_teach", ["Python", "JavaScript"]),
        ),
        workExperience=[
            WorkExperience(
                role=w.get("role", "Developer"),
                company=w.get("company", "Tech"),
                duration=w.get("duration", "2025 - 2026"),
                description=w.get("description", "Built software solutions."),
            )
            for w in work_list
        ],
        proofOfWork=ProofOfWork(
            github=pow_dict.get("github"),
            medium=pow_dict.get("medium"),
            dribbble=pow_dict.get("dribbble"),
            devTo=pow_dict.get("devTo"),
            kaggle=pow_dict.get("kaggle"),
            personalWebsite=pow_dict.get("personalWebsite"),
        ),
        featuredPosts=[
            FeaturedPost(
                id=p.get("id", "post_1"),
                platform=p.get("platform", "GitHub"),
                title=p.get("title", "Project Repository"),
                url=p.get("url", "https://github.com"),
                stars=p.get("stars"),
                claps=p.get("claps"),
                likes=p.get("likes"),
                date=p.get("date", "Recent"),
            )
            for p in posts_list
        ],
        socials=Socials(github=gh_url, linkedin=li_url, discord=discord),
    )


@router.get("/full/{user_id}")
def get_user_full_profile(
    user_id: int, session: Session = Depends(get_session)
):
    """Fetch complete profile for ANY user (used for viewing peers)."""
    user_repo = UserRepository(session)
    user = user_repo.get_user_by_id(user_id)
    if not user:
        raise ApiError(
            message="User not found", status_code=status.HTTP_404_NOT_FOUND
        )

    profile_repo = ProfileRepository(session)
    profile = profile_repo.get_by_user_id(user_id)

    full_profile = build_full_profile(user, profile)
    return ApiResponse.success(
        message="Full profile retrieved successfully",
        status_code=status.HTTP_200_OK,
        data=full_profile.model_dump(mode="json"),
    )

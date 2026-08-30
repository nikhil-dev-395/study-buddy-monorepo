# app/routes/profile_route.py
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db.database import get_session
from app.models.user_model import ProfileCreate, ProfileRead
from app.repository.profile_repo import ProfileRepository
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse

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

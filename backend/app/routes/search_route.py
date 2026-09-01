# app/routes/search_route.py
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.db.database import get_session
from app.models.connection_model import ConnectionRequest, ConnectionStatus
from app.repository.connection_repo import ConnectionRepository
from app.repository.user_repository import UserRepository
from app.schemas.buddy_schema import (
    AcademicDetails,
    BuddyCardResponse,
    StudyPreferences,
    UserStatus,
)
from app.utils.api.api_response import ApiResponse

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/peers")
def search_peers(
    q: str = Query(..., min_length=1, description="Search term (e.g. Pune, React, DSA, IIT)"),
    current_user_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
):
    user_repo = UserRepository(session)
    conn_repo = ConnectionRepository(session)

    results = user_repo.search_users(query=q, current_user_id=current_user_id)

    formatted_users = []
    for user, profile in results:
        # Check connection status if current_user_id is supplied
        is_accepted = False
        conn_req_id = 0
        if current_user_id:
            conn = conn_repo.get_existing_interaction(current_user_id, user.id) # type:ignore
            if conn:
                is_accepted = (conn.status == ConnectionStatus.ACCEPTED)
                conn_req_id = conn.id

        headline = (profile.headline if profile else "") or ""
        parts = [p.strip() for p in headline.split("•")]

        major = parts[0] if len(parts) > 0 else "Student"
        year = parts[1] if len(parts) > 1 else "Undergraduate"
        institution = parts[2] if len(parts) > 2 else "University"

        study_specs = (profile.study_specs if profile else {}) or {}
        subjects = study_specs.get("wants_to_learn", []) + study_specs.get("can_teach", [])

        mode_raw = (profile.study_mode.lower().replace(" mode", "") if profile and profile.study_mode else "hybrid")
        mode = mode_raw if mode_raw in ["online", "in-person", "hybrid"] else "hybrid"

        formatted_users.append(
            BuddyCardResponse(
                id=user.id, # type:ignore
                name=profile.name if (profile and profile.name) else user.username,
                avatarUrl=user.avatar_url,
                location=profile.location if profile else "India",
                academicDetails=AcademicDetails(
                    institution=institution,
                    major=major,
                    year=year,
                ),
                studyPreferences=StudyPreferences(
                    subjects=subjects if subjects else ["General Studies"],
                    mode=mode,
                ),
                status=UserStatus(isSearching=True),
                isRequestAccepted=is_accepted,
                connectionRequestId=conn_req_id, # type:ignore
            )
        )

    return ApiResponse.success(
        message=f"Found {len(formatted_users)} matches for '{q}'",
        status_code=status.HTTP_200_OK,
        data=[u.model_dump(mode="json") for u in formatted_users],
    )

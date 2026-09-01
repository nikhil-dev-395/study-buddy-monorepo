# app/routes/connection_route.py
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from app.models.connection_model import ConnectionStatus
from app.schemas.buddy_schema import (
    AcademicDetails,
    BuddyCardResponse,
    StudyPreferences,
    UserStatus,
)
from app.db.database import get_session
from app.models.connection_model import (
    ConnectionActionSchema,
    ConnectionResponseSchema,
    ConnectionStatus,
    SendConnectionSchema,
)
from app.repository.connection_repo import ConnectionRepository
from app.repository.user_repository import UserRepository
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse

router = APIRouter(prefix="/connections", tags=["Connections"])


@router.post("/send", status_code=status.HTTP_201_CREATED)
def send_connection_request(
    payload: SendConnectionSchema,
    sender_id: int,
    session: Session = Depends(get_session),
):
    """Triggered by clicking the 'Connect' button on a user card."""
    if sender_id == payload.receiver_id:
        raise ApiError(
            message="You cannot send a connection request to yourself.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    user_repo = UserRepository(session)
    if not user_repo.get_user_by_id(
        sender_id
    ) or not user_repo.get_user_by_id(payload.receiver_id):
        raise ApiError(
            message="Sender or receiver user does not exist.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    conn_repo = ConnectionRepository(session)
    existing = conn_repo.get_existing_interaction(
        sender_id, payload.receiver_id
    )

    if existing:
        if existing.status == ConnectionStatus.PENDING:
            raise ApiError(
                message="A connection request is already pending.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        if existing.status == ConnectionStatus.ACCEPTED:
            raise ApiError(
                message="You are already connected with this user.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        # If cancelled or rejected before, revive/update it
        if existing.sender_id == sender_id:
            updated = conn_repo.update_status(existing, ConnectionStatus.PENDING)
            return ApiResponse.success(
                message="Connection request re-sent.",
                status_code=status.HTTP_200_OK,
                data=ConnectionResponseSchema.model_validate(
                    updated
                ).model_dump(mode="json"),
            )

    new_request = conn_repo.create_request(
        sender_id=sender_id,
        receiver_id=payload.receiver_id,
        message=payload.message,
    )
    return ApiResponse.success(
        message="Connection request sent successfully.",
        status_code=status.HTTP_201_CREATED,
        data=ConnectionResponseSchema.model_validate(new_request).model_dump(
            mode="json"
        ),
    )


@router.post("/requested/{user_id}")
def get_incoming_requests(
    user_id: int, session: Session = Depends(get_session)
):
    """Get all pending requests waiting for this user's approval."""
    conn_repo = ConnectionRepository(session)
    requests = conn_repo.get_pending_received_requests(user_id)
    return ApiResponse.success(
        message="Pending incoming requests retrieved successfully.",
        status_code=status.HTTP_200_OK,
        data=[
            ConnectionResponseSchema.model_validate(r).model_dump(mode="json")
            for r in requests
        ],
    )


@router.post("/accept")
def accept_connection_request(
    payload: ConnectionActionSchema,
    user_id: int,
    session: Session = Depends(get_session),
):
    """Accept an incoming connection request."""
    conn_repo = ConnectionRepository(session)
    req = conn_repo.get_by_id(payload.request_id)

    if not req or req.receiver_id != user_id:
        raise ApiError(
            message="Connection request not found or unauthorized.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    updated = conn_repo.update_status(req, ConnectionStatus.ACCEPTED)
    return ApiResponse.success(
        message="Connection accepted! You can now start conversations.",
        status_code=status.HTTP_200_OK,
        data=ConnectionResponseSchema.model_validate(updated).model_dump(
            mode="json"
        ),
    )


@router.post("/reject")
def reject_connection_request(
    payload: ConnectionActionSchema,
    user_id: int,
    session: Session = Depends(get_session),
):
    """Reject an incoming connection request."""
    conn_repo = ConnectionRepository(session)
    req = conn_repo.get_by_id(payload.request_id)

    if not req or req.receiver_id != user_id:
        raise ApiError(
            message="Connection request not found or unauthorized.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    updated = conn_repo.update_status(req, ConnectionStatus.REJECTED)
    return ApiResponse.success(
        message="Connection request rejected.",
        status_code=status.HTTP_200_OK,
        data=ConnectionResponseSchema.model_validate(updated).model_dump(
            mode="json"
        ),
    )


@router.post("/cancel")
def cancel_sent_request(
    payload: ConnectionActionSchema,
    sender_id: int,
    session: Session = Depends(get_session),
):
    """Cancel/Withdraw a request that you previously sent."""
    conn_repo = ConnectionRepository(session)
    req = conn_repo.get_by_id(payload.request_id)

    if not req or req.sender_id != sender_id:
        raise ApiError(
            message="Connection request not found or unauthorized.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    updated = conn_repo.update_status(req, ConnectionStatus.CANCELLED)
    return ApiResponse.success(
        message="Connection request withdrawn successfully.",
        status_code=status.HTTP_200_OK,
        data=ConnectionResponseSchema.model_validate(updated).model_dump(
            mode="json"
        ),
    )



@router.get("/my-buddies/sent/{user_id}")
def get_my_sent_buddy_requests(
    user_id: int, session: Session = Depends(get_session)
):
    """Returns all requested/connected users formatted for the frontend BuddiesPage."""
    conn_repo = ConnectionRepository(session)
    results = conn_repo.get_sent_requests_with_profiles(sender_id=user_id)

    formatted_buddies = []
    for req, receiver_user, receiver_profile in results:
        # Fallback profile parsing from headline or DB fields
        headline = (
            receiver_profile.headline if receiver_profile else ""
        ) or ""
        headline_parts = [p.strip() for p in headline.split("•")]

        major = headline_parts[0] if len(headline_parts) > 0 else "Student"
        year = (
            headline_parts[1]
            if len(headline_parts) > 1
            else "Undergraduate"
        )
        institution = (
            headline_parts[2] if len(headline_parts) > 2 else "University"
        )

        study_specs = (
            receiver_profile.study_specs if receiver_profile else {}
        ) or {}
        subjects = study_specs.get("wants_to_learn", []) + study_specs.get(
            "can_teach", []
        )

        mode_raw = (
            (receiver_profile.study_mode if receiver_profile else "hybrid")
            .lower()  # type: ignore
            .replace(" mode", "")
        )
        mode = (
            mode_raw
            if mode_raw in ["online", "in-person", "hybrid"]
            else "hybrid"
        )

        formatted_buddies.append(
            BuddyCardResponse(
                id=receiver_user.id, # type: ignore
                name=receiver_profile.name
                if (receiver_profile and receiver_profile.name)
                else receiver_user.username,
                avatarUrl=receiver_user.avatar_url,
                location=receiver_profile.location
                if receiver_profile
                else "Remote",
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
                isRequestAccepted=(req.status == ConnectionStatus.ACCEPTED),
                connectionRequestId=req.id,  # type: ignore
            )
        )

    return ApiResponse.success(
        message="Sent buddy requests retrieved successfully",
        status_code=status.HTTP_200_OK,
        data=[b.model_dump(mode="json") for b in formatted_buddies],
    )



@router.get("/my-buddies/connected/{user_id}")
def get_my_connected_buddies(
    user_id: int, session: Session = Depends(get_session)
):
    """Returns all accepted connections ready for messaging/chatting."""
    conn_repo = ConnectionRepository(session)
    results = conn_repo.get_connected_peers_with_profiles(user_id=user_id)

    connected_buddies = []
    for req, peer_user, peer_profile in results:
        headline = (peer_profile.headline if peer_profile else "") or ""
        headline_parts = [p.strip() for p in headline.split("•")]

        major = headline_parts[0] if len(headline_parts) > 0 else "Student"
        year = headline_parts[1] if len(headline_parts) > 1 else "Undergraduate"
        institution = headline_parts[2] if len(headline_parts) > 2 else "University"

        study_specs = (peer_profile.study_specs if peer_profile else {}) or {}
        subjects = study_specs.get("wants_to_learn", []) + study_specs.get(
            "can_teach", []
        )

        mode_raw = (
            (peer_profile.study_mode if peer_profile else "hybrid")
            .lower()  # type: ignore
            .replace(" mode", "")
        )
        mode = mode_raw if mode_raw in ["online", "in-person", "hybrid"] else "hybrid"

        connected_buddies.append(
            BuddyCardResponse(
                id=peer_user.id,  # type: ignore
                name=peer_profile.name if (peer_profile and peer_profile.name) else peer_user.username,
                avatarUrl=peer_user.avatar_url,
                location=peer_profile.location if peer_profile else "Remote",
                academicDetails=AcademicDetails(
                    institution=institution,
                    major=major,
                    year=year,
                ),
                studyPreferences=StudyPreferences(
                    subjects=subjects if subjects else ["General Studies"],
                    mode=mode,
                ),
                status=UserStatus(isSearching=False),  # Already paired/connected
                isRequestAccepted=True,
                connectionRequestId=req.id, # type: ignore
            )
        )

    return ApiResponse.success(
        message="Connected chat buddies retrieved successfully",
        status_code=status.HTTP_200_OK,
        data=[b.model_dump(mode="json") for b in connected_buddies],
    )

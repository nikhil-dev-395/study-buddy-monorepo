# app/routes/study_session_route.py
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select

from app.db.database import get_session
from app.models.connection_model import ConnectionStatus
from app.models.study_session_model import (
    MAX_PARTICIPANTS,
    AddParticipantsSchema,
    CreateStudySessionSchema,
    ParticipantSchema,
    RescheduleStudySessionSchema,
    StudySession,
    StudySessionResponseSchema,
    StudySessionStatus,
)
from app.models.user_model import User, UserProfile
from app.repository.connection_repo import ConnectionRepository
from app.repository.study_session_repo import StudySessionRepository
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse

router = APIRouter(prefix="/sessions", tags=["Study Sessions"])


def _as_utc(dt: datetime) -> datetime:
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def _derive_status(s: StudySession) -> str:
    if s.status == StudySessionStatus.CANCELLED:
        return "cancelled"
    now = datetime.now(timezone.utc)
    if now < _as_utc(s.starts_at):
        return "upcoming"
    if now <= _as_utc(s.ends_at):
        return "live"
    return "completed"


def _participant(db: Session, user_id: int, host_id: int) -> ParticipantSchema:
    user = db.get(User, user_id)
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == user_id)).first()
    name = (profile.name if profile and profile.name else None) or (
        user.username if user else f"User #{user_id}"
    )
    return ParticipantSchema(
        id=user_id,
        name=name,
        avatar_url=user.avatar_url if user else None,
        is_host=user_id == host_id,
    )


def _serialize(db: Session, repo: StudySessionRepository, s: StudySession, viewer_id: int) -> dict:
    member_ids = [s.host_id, *repo.participant_ids(s.id)]  # type: ignore
    return StudySessionResponseSchema(
        **s.model_dump(exclude={"status"}),
        status=_derive_status(s),
        is_host=viewer_id == s.host_id,
        participants=[_participant(db, uid, s.host_id) for uid in member_ids if uid != viewer_id],
    ).model_dump(mode="json")


def _get_member_session(repo: StudySessionRepository, session_id: int, user_id: int) -> StudySession:
    s = repo.get(session_id)
    if not s or not repo.is_member(s, user_id):
        raise ApiError(message="Session not found.", status_code=status.HTTP_404_NOT_FOUND)
    return s


def _require_host(s: StudySession, user_id: int, action: str):
    if s.host_id != user_id:
        raise ApiError(
            message=f"Only the host can {action} this session.",
            status_code=status.HTTP_403_FORBIDDEN,
        )


def _require_open(s: StudySession):
    if _derive_status(s) in ("cancelled", "completed"):
        raise ApiError(
            message="This session has already ended or was cancelled.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


def _validate_times(starts_at: datetime, ends_at: datetime):
    if _as_utc(ends_at) <= _as_utc(starts_at):
        raise ApiError(
            message="End time must be after start time.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


def _assert_buddies(db: Session, user_id: int, other_ids: list[int]):
    conn_repo = ConnectionRepository(db)
    for other in other_ids:
        existing = conn_repo.get_existing_interaction(user_id, other)
        if not existing or existing.status != ConnectionStatus.ACCEPTED:
            raise ApiError(
                message="You can only invite your accepted study buddies.",
                status_code=status.HTTP_403_FORBIDDEN,
            )


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_session(
    payload: CreateStudySessionSchema,
    user_id: int,
    db: Session = Depends(get_session),
):
    """Schedule a 1:1 or group session with accepted buddies. A video room id is generated."""
    if not payload.title.strip():
        raise ApiError(message="Title is required.", status_code=status.HTTP_400_BAD_REQUEST)
    invitees = sorted({uid for uid in payload.participant_ids if uid != user_id})
    if not invitees:
        raise ApiError(
            message="Invite at least one study buddy.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    if len(invitees) + 1 > MAX_PARTICIPANTS:
        raise ApiError(
            message=f"A session can have at most {MAX_PARTICIPANTS} people.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    _validate_times(payload.starts_at, payload.ends_at)
    if _as_utc(payload.ends_at) <= datetime.now(timezone.utc):
        raise ApiError(
            message="You can't schedule a session in the past.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    _assert_buddies(db, user_id, invitees)

    repo = StudySessionRepository(db)
    s = repo.create(
        StudySession(
            host_id=user_id,
            title=payload.title.strip(),
            skill_tag=payload.skill_tag,
            notes=payload.notes,
            starts_at=_as_utc(payload.starts_at),
            ends_at=_as_utc(payload.ends_at),
            room_id=f"studybuddy-{secrets.token_urlsafe(10)}",
        ),
        invitees,
    )
    return ApiResponse.success(
        message="Session scheduled.",
        status_code=status.HTTP_201_CREATED,
        data=_serialize(db, repo, s, user_id),
    )


@router.get("/user/{user_id}")
def list_sessions(user_id: int, db: Session = Depends(get_session)):
    """All sessions the user hosts or was invited to, with time-derived status."""
    repo = StudySessionRepository(db)
    return ApiResponse.success(
        message="Sessions retrieved.",
        status_code=status.HTTP_200_OK,
        data=[_serialize(db, repo, s, user_id) for s in repo.list_for_user(user_id)],
    )


@router.get("/{session_id}")
def get_session_detail(session_id: int, user_id: int, db: Session = Depends(get_session)):
    repo = StudySessionRepository(db)
    s = _get_member_session(repo, session_id, user_id)
    return ApiResponse.success(
        message="Session retrieved.",
        status_code=status.HTTP_200_OK,
        data=_serialize(db, repo, s, user_id),
    )


@router.post("/{session_id}/participants")
def add_participants(
    session_id: int,
    payload: AddParticipantsSchema,
    user_id: int,
    db: Session = Depends(get_session),
):
    """Any member can bring in their own accepted buddies (turns 1:1 into a group)."""
    repo = StudySessionRepository(db)
    s = _get_member_session(repo, session_id, user_id)
    _require_open(s)

    current = {s.host_id, *repo.participant_ids(session_id)}
    new_ids = sorted({uid for uid in payload.user_ids if uid not in current})
    if not new_ids:
        raise ApiError(
            message="Everyone selected is already in this session.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    if len(current) + len(new_ids) > MAX_PARTICIPANTS:
        raise ApiError(
            message=f"A session can have at most {MAX_PARTICIPANTS} people.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    _assert_buddies(db, user_id, new_ids)

    repo.add_participants(session_id, new_ids, invited_by=user_id)
    return ApiResponse.success(
        message=f"Added {len(new_ids)} {'person' if len(new_ids) == 1 else 'people'}.",
        status_code=status.HTTP_200_OK,
        data=_serialize(db, repo, s, user_id),
    )


@router.post("/{session_id}/participants/{participant_id}/remove")
def remove_participant(
    session_id: int,
    participant_id: int,
    user_id: int,
    db: Session = Depends(get_session),
):
    """Host removes someone, or a member removes themself (leave)."""
    repo = StudySessionRepository(db)
    s = _get_member_session(repo, session_id, user_id)
    if participant_id == s.host_id:
        raise ApiError(
            message="The host can't leave — cancel the session instead.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    if participant_id != user_id:
        _require_host(s, user_id, "remove people from")
    repo.remove_participant(session_id, participant_id)

    left = participant_id == user_id
    return ApiResponse.success(
        message="You left the session." if left else "Participant removed.",
        status_code=status.HTTP_200_OK,
        data=None if left else _serialize(db, repo, s, user_id),
    )


@router.post("/{session_id}/reschedule")
def reschedule_session(
    session_id: int,
    payload: RescheduleStudySessionSchema,
    user_id: int,
    db: Session = Depends(get_session),
):
    repo = StudySessionRepository(db)
    s = _get_member_session(repo, session_id, user_id)
    _require_host(s, user_id, "reschedule")
    _validate_times(payload.starts_at, payload.ends_at)
    s.starts_at = _as_utc(payload.starts_at)
    s.ends_at = _as_utc(payload.ends_at)
    s.status = StudySessionStatus.SCHEDULED
    s = repo.save(s)
    return ApiResponse.success(
        message="Session rescheduled.",
        status_code=status.HTTP_200_OK,
        data=_serialize(db, repo, s, user_id),
    )


@router.post("/{session_id}/cancel")
def cancel_session(session_id: int, user_id: int, db: Session = Depends(get_session)):
    repo = StudySessionRepository(db)
    s = _get_member_session(repo, session_id, user_id)
    _require_host(s, user_id, "cancel")
    s.status = StudySessionStatus.CANCELLED
    s = repo.save(s)
    return ApiResponse.success(
        message="Session cancelled.",
        status_code=status.HTTP_200_OK,
        data=_serialize(db, repo, s, user_id),
    )

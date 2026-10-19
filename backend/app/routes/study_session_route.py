# app/routes/study_session_route.py
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db.database import get_session
from app.models.connection_model import ConnectionStatus
from app.models.study_session_model import (
    CreateStudySessionSchema,
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
from sqlmodel import select

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


def _serialize(db: Session, s: StudySession, viewer_id: int) -> dict:
    partner_id = s.buddy_id if s.host_id == viewer_id else s.host_id
    user = db.get(User, partner_id)
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == partner_id)).first()
    name = (profile.name if profile and profile.name else None) or (user.username if user else "Study Partner")
    return StudySessionResponseSchema(
        **s.model_dump(exclude={"status"}),
        status=_derive_status(s),
        partner_id=partner_id,
        partner_name=name,
        partner_avatar=user.avatar_url if user else None,
    ).model_dump(mode="json")


def _get_owned(repo: StudySessionRepository, session_id: int, user_id: int) -> StudySession:
    s = repo.get(session_id)
    if not s or user_id not in (s.host_id, s.buddy_id):
        raise ApiError(message="Session not found.", status_code=status.HTTP_404_NOT_FOUND)
    return s


def _validate_times(starts_at: datetime, ends_at: datetime):
    if _as_utc(ends_at) <= _as_utc(starts_at):
        raise ApiError(
            message="End time must be after start time.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_session(
    payload: CreateStudySessionSchema,
    user_id: int,
    db: Session = Depends(get_session),
):
    """Schedule a study session with an accepted buddy. A video room id is generated."""
    if not payload.title.strip():
        raise ApiError(message="Title is required.", status_code=status.HTTP_400_BAD_REQUEST)
    _validate_times(payload.starts_at, payload.ends_at)
    if _as_utc(payload.ends_at) <= datetime.now(timezone.utc):
        raise ApiError(
            message="You can't schedule a session in the past.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    existing = ConnectionRepository(db).get_existing_interaction(user_id, payload.buddy_id)
    if not existing or existing.status != ConnectionStatus.ACCEPTED:
        raise ApiError(
            message="You can only schedule sessions with accepted study buddies.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    s = StudySessionRepository(db).create(
        StudySession(
            host_id=user_id,
            buddy_id=payload.buddy_id,
            title=payload.title.strip(),
            skill_tag=payload.skill_tag,
            notes=payload.notes,
            starts_at=_as_utc(payload.starts_at),
            ends_at=_as_utc(payload.ends_at),
            room_id=f"studybuddy-{secrets.token_urlsafe(10)}",
        )
    )
    return ApiResponse.success(
        message="Session scheduled.",
        status_code=status.HTTP_201_CREATED,
        data=_serialize(db, s, user_id),
    )


@router.get("/user/{user_id}")
def list_sessions(user_id: int, db: Session = Depends(get_session)):
    """All sessions the user hosts or is invited to, with time-derived status."""
    sessions = StudySessionRepository(db).list_for_user(user_id)
    return ApiResponse.success(
        message="Sessions retrieved.",
        status_code=status.HTTP_200_OK,
        data=[_serialize(db, s, user_id) for s in sessions],
    )


@router.get("/{session_id}")
def get_session_detail(session_id: int, user_id: int, db: Session = Depends(get_session)):
    s = _get_owned(StudySessionRepository(db), session_id, user_id)
    return ApiResponse.success(
        message="Session retrieved.",
        status_code=status.HTTP_200_OK,
        data=_serialize(db, s, user_id),
    )


@router.post("/{session_id}/reschedule")
def reschedule_session(
    session_id: int,
    payload: RescheduleStudySessionSchema,
    user_id: int,
    db: Session = Depends(get_session),
):
    repo = StudySessionRepository(db)
    s = _get_owned(repo, session_id, user_id)
    _validate_times(payload.starts_at, payload.ends_at)
    s.starts_at = _as_utc(payload.starts_at)
    s.ends_at = _as_utc(payload.ends_at)
    s.status = StudySessionStatus.SCHEDULED
    s = repo.save(s)
    return ApiResponse.success(
        message="Session rescheduled.",
        status_code=status.HTTP_200_OK,
        data=_serialize(db, s, user_id),
    )


@router.post("/{session_id}/cancel")
def cancel_session(session_id: int, user_id: int, db: Session = Depends(get_session)):
    repo = StudySessionRepository(db)
    s = _get_owned(repo, session_id, user_id)
    s.status = StudySessionStatus.CANCELLED
    s = repo.save(s)
    return ApiResponse.success(
        message="Session cancelled.",
        status_code=status.HTTP_200_OK,
        data=_serialize(db, s, user_id),
    )

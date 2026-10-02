# app/routes/message_route.py
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.db.database import get_session
from app.models.connection_model import ConnectionStatus
from app.models.message_model import (
    ConversationPreviewSchema,
    MessageResponseSchema,
    SendMessageSchema,
)
from app.repository.connection_repo import ConnectionRepository
from app.repository.message_repo import MessageRepository
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse

router = APIRouter(prefix="/messages", tags=["Messages"])


def _assert_connected(conn_repo: ConnectionRepository, user_a: int, user_b: int):
    existing = conn_repo.get_existing_interaction(user_a, user_b)
    if not existing or existing.status != ConnectionStatus.ACCEPTED:
        raise ApiError(
            message="You can only message accepted study buddies.",
            status_code=status.HTTP_403_FORBIDDEN,
        )


@router.post("/send", status_code=status.HTTP_201_CREATED)
def send_message(
    payload: SendMessageSchema,
    sender_id: int,
    session: Session = Depends(get_session),
):
    """Send a message to a connected study buddy."""
    if sender_id == payload.receiver_id:
        raise ApiError(
            message="You cannot message yourself.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    if not payload.content.strip():
        raise ApiError(
            message="Message content cannot be empty.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    conn_repo = ConnectionRepository(session)
    _assert_connected(conn_repo, sender_id, payload.receiver_id)

    msg_repo = MessageRepository(session)
    new_message = msg_repo.create_message(
        sender_id=sender_id,
        receiver_id=payload.receiver_id,
        content=payload.content.strip(),
    )

    return ApiResponse.success(
        message="Message sent.",
        status_code=status.HTTP_201_CREATED,
        data=MessageResponseSchema.model_validate(new_message).model_dump(mode="json"),
    )


@router.get("/thread/{user_id}/{peer_id}")
def get_thread(
    user_id: int,
    peer_id: int,
    after_id: int = 0,
    session: Session = Depends(get_session),
):
    """
    Fetch full message history between two users.
    Pass `after_id` (the highest message id you already have) to poll for new
    messages only — used by the frontend's live-update loop.
    """
    msg_repo = MessageRepository(session)
    messages = msg_repo.get_thread(user_id, peer_id, after_id=after_id)

    return ApiResponse.success(
        message="Thread retrieved successfully.",
        status_code=status.HTTP_200_OK,
        data=[
            MessageResponseSchema.model_validate(m).model_dump(mode="json")
            for m in messages
        ],
    )


@router.post("/thread/{user_id}/{peer_id}/read")
def mark_thread_read(
    user_id: int,
    peer_id: int,
    session: Session = Depends(get_session),
):
    """Mark all messages received by `user_id` from `peer_id` as read."""
    msg_repo = MessageRepository(session)
    updated_count = msg_repo.mark_thread_read(user_id, peer_id)

    return ApiResponse.success(
        message="Thread marked as read.",
        status_code=status.HTTP_200_OK,
        data={"updated_count": updated_count},
    )


@router.get("/conversations/{user_id}")
def get_conversations(user_id: int, session: Session = Depends(get_session)):
    """
    Conversation previews for every accepted study buddy: peer info,
    last message, and unread count — powers the chat sidebar.
    """
    conn_repo = ConnectionRepository(session)
    msg_repo = MessageRepository(session)

    peers = conn_repo.get_connected_peers_with_profiles(user_id=user_id)

    previews = []
    for _req, peer_user, peer_profile in peers:
        last_message = msg_repo.get_last_message(user_id, peer_user.id)
        unread_count = msg_repo.get_unread_count(user_id, peer_user.id)

        previews.append(
            ConversationPreviewSchema(
                peer_id=peer_user.id,
                name=(peer_profile.name if peer_profile and peer_profile.name else peer_user.username),
                avatar_url=peer_user.avatar_url,
                last_message=last_message.content if last_message else None,
                last_message_time=last_message.created_at if last_message else None,
                unread_count=unread_count,
            )
        )

    previews.sort(
        key=lambda p: p.last_message_time or datetime.min,
        reverse=True,
    )

    return ApiResponse.success(
        message="Conversations retrieved successfully.",
        status_code=status.HTTP_200_OK,
        data=[p.model_dump(mode="json") for p in previews],
    )

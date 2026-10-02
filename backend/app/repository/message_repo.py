# app/repository/message_repo.py
from datetime import datetime, timezone
from typing import Sequence
from sqlmodel import Session, and_, or_, select
from app.models.message_model import Message


class MessageRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_message(self, sender_id: int, receiver_id: int, content: str) -> Message:
        msg = Message(sender_id=sender_id, receiver_id=receiver_id, content=content)
        self.session.add(msg)
        self.session.commit()
        self.session.refresh(msg)
        return msg

    def get_thread(self, user_id: int, peer_id: int, after_id: int = 0) -> Sequence[Message]:
        statement = (
            select(Message)
            .where(
                or_(
                    and_(Message.sender_id == user_id, Message.receiver_id == peer_id),
                    and_(Message.sender_id == peer_id, Message.receiver_id == user_id),
                )
            )
            .where(Message.id > after_id)  # type: ignore
            .order_by(Message.created_at)  # type: ignore
        )
        return self.session.exec(statement).all()

    def get_last_message(self, user_id: int, peer_id: int):
        statement = (
            select(Message)
            .where(
                or_(
                    and_(Message.sender_id == user_id, Message.receiver_id == peer_id),
                    and_(Message.sender_id == peer_id, Message.receiver_id == user_id),
                )
            )
            .order_by(Message.created_at.desc())  # type: ignore
        )
        return self.session.exec(statement).first()

    def get_unread_count(self, user_id: int, peer_id: int) -> int:
        statement = select(Message).where(
            and_(
                Message.sender_id == peer_id,
                Message.receiver_id == user_id,
                Message.is_read == False,  # noqa: E712
            )
        )
        return len(self.session.exec(statement).all())

    def mark_thread_read(self, user_id: int, peer_id: int) -> int:
        statement = select(Message).where(
            and_(
                Message.sender_id == peer_id,
                Message.receiver_id == user_id,
                Message.is_read == False,  # noqa: E712
            )
        )
        unread = self.session.exec(statement).all()
        for msg in unread:
            msg.is_read = True
            self.session.add(msg)
        if unread:
            self.session.commit()
        return len(unread)

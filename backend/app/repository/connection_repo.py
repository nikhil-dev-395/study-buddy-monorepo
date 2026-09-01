# app/repository/connection_repo.py
from datetime import datetime, timezone
from typing import Optional, Sequence
from sqlmodel import Session, or_, select
from app.models.connection_model import ConnectionRequest, ConnectionStatus
from app.models.connection_model import ConnectionRequest, ConnectionStatus
from app.models.user_model import User, UserProfile
from sqlmodel import Session, or_, select

class ConnectionRepository:

    def __init__(self, session: Session):
        self.session = session

    def get_existing_interaction(
        self, user_a: int, user_b: int
    ) -> Optional[ConnectionRequest]:
        statement = select(ConnectionRequest).where(
            or_(
                (
                    (ConnectionRequest.sender_id == user_a)
                    & (ConnectionRequest.receiver_id == user_b)
                ),
                (
                    (ConnectionRequest.sender_id == user_b)
                    & (ConnectionRequest.receiver_id == user_a)
                ),
            )
        )
        return self.session.exec(statement).first()

    def get_by_id(self, request_id: int) -> Optional[ConnectionRequest]:
        return self.session.get(ConnectionRequest, request_id)

    def create_request(
        self, sender_id: int, receiver_id: int, message: Optional[str] = None
    ) -> ConnectionRequest:
        req = ConnectionRequest(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message,
            status=ConnectionStatus.PENDING,
        )
        self.session.add(req)
        self.session.commit()
        self.session.refresh(req)
        return req

    def update_status(
        self, request: ConnectionRequest, new_status: ConnectionStatus
    ) -> ConnectionRequest:
        request.status = new_status
        request.updated_at = datetime.now(timezone.utc)
        self.session.add(request)
        self.session.commit()
        self.session.refresh(request)
        return request

    def get_pending_received_requests(
        self, user_id: int
    ) -> Sequence[ConnectionRequest]:
        """People who sent a request to this user."""
        statement = select(ConnectionRequest).where(
            (ConnectionRequest.receiver_id == user_id)
            & (ConnectionRequest.status == ConnectionStatus.PENDING)
        )
        return self.session.exec(statement).all()

    def get_sent_pending_requests(
        self, user_id: int
    ) -> Sequence[ConnectionRequest]:
        """Requests this user has sent out that are waiting."""
        statement = select(ConnectionRequest).where(
            (ConnectionRequest.sender_id == user_id)
            & (ConnectionRequest.status == ConnectionStatus.PENDING)
        )
        return self.session.exec(statement).all()

    def get_accepted_connections(
        self, user_id: int
    ) -> Sequence[ConnectionRequest]:
        """All mutual/accepted connections (LinkedIn '1st Degree')."""
        statement = select(ConnectionRequest).where(
            (
                (ConnectionRequest.sender_id == user_id)
                | (ConnectionRequest.receiver_id == user_id)
            )
            & (ConnectionRequest.status == ConnectionStatus.ACCEPTED)
        )
        return self.session.exec(statement).all()


    def get_sent_requests_with_profiles(self, sender_id: int):
        """Fetch all requests sent by this user along with receiver's User and Profile info."""
        statement = (
            select(ConnectionRequest, User, UserProfile)
            .join(User, ConnectionRequest.receiver_id == User.id) # type: ignore
            .outerjoin(UserProfile, User.id == UserProfile.user_id) # type: ignore
            .where(ConnectionRequest.sender_id == sender_id)
            .where(
                ConnectionRequest.status.in_( # type: ignore
                    [ConnectionStatus.PENDING, ConnectionStatus.ACCEPTED]
                )
            )
        )
        return self.session.exec(statement).all()

    def get_connected_peers_with_profiles(self, user_id: int):
        """Fetches all mutual accepted connections and loads the peer's User and Profile."""
        # 1. Fetch all accepted connection records involving this user
        conn_stmt = select(ConnectionRequest).where(
            (
                (ConnectionRequest.sender_id == user_id)
                | (ConnectionRequest.receiver_id == user_id)
            )
            & (ConnectionRequest.status == ConnectionStatus.ACCEPTED)
        )
        connections = self.session.exec(conn_stmt).all()
        if not connections:
            return []

        # 2. Extract the other person's user_id from each connection
        peer_to_req = {}
        for req in connections:
            peer_id = (
                req.receiver_id if req.sender_id == user_id else req.sender_id
            )
            peer_to_req[peer_id] = req

        peer_ids = list(peer_to_req.keys())

        # 3. Query the User and UserProfile records for all peer_ids
        user_stmt = (
            select(User, UserProfile)
            .outerjoin(UserProfile, User.id == UserProfile.user_id) #type: ignore
            .where(User.id.in_(peer_ids)) #type: ignore
        )
        user_results = self.session.exec(user_stmt).all()

        # 4. Pair connection request with user and profile
        combined = []
        for user_obj, profile_obj in user_results:
            req_obj = peer_to_req.get(user_obj.id)
            combined.append((req_obj, user_obj, profile_obj))

        return combined

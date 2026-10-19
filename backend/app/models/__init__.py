# alembic/env.py (or app/models/__init__.py)
from app.models.connection_model import ConnectionRequest
from app.models.user_model import User, UserProfile
from app.models.message_model import Message
from app.models.study_session_model import StudySession
from sqlmodel import SQLModel

target_metadata = SQLModel.metadata

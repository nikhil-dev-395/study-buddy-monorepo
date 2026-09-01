# alembic/env.py (or app/models/__init__.py)
from app.models.connection_model import ConnectionRequest
from app.models.user_model import User, UserProfile
from sqlmodel import SQLModel

target_metadata = SQLModel.metadata

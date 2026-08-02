import os
from datetime import datetime, timedelta, timezone
import jwt
from app.env import ENV
SECRET_KEY = ENV.JWT_SECRET_KEY
ALGORITHM = "HS256"
# 30-day token duration for small apps
ACCESS_TOKEN_EXPIRE_DAYS = 30

def create_access_token(user_id: int | None, email: str) -> str:
    if user_id is None:
        raise ValueError("Cannot create access token for a user without an ID.")

    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),  # Safely converts int to str
        "email": email,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

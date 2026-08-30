import os
from datetime import datetime, timedelta, timezone
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import status
from app.env import ENV
from app.utils.api.api_error import ApiError

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
SECRET_KEY = ENV.JWT_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


def verify_google_token(token: str) -> dict:
    """
    Verifies the Google ID token sent from the frontend.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Confirm issuer
        if id_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")

        # Security check: Ensure email is verified by Google
        if not id_info.get("email_verified", False):
            raise ApiError(
                message="Google email address is not verified.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        return id_info

    except ValueError:
        raise ApiError(
            message="Invalid or expired Google token.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


def create_access_token(user_id: int | None, email: str) -> str:
    """
    Creates an application Bearer JWT access token.
    """
    if user_id is None:
        raise ValueError("Cannot create access token for a user without an ID.")

    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

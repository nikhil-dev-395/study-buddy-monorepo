import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session  # or your ORM Session
from google.oauth2 import id_token
from google.auth.transport import requests
from app.utils.api.api_response import ApiResponse
from app.utils.api.api_error import ApiError

# Ensure GOOGLE_CLIENT_ID is set in your environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def verify_google_token(token: str) -> dict:
    """
    Verifies the Google ID token sent from the frontend.
    Returns the user's Google profile payload if valid, raises HTTPException if invalid.
    """
    try:
        # Verify token integrity and signature against Google's public keys
        id_info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Confirm the issuer is Google
        if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")

        return id_info

    except ValueError as e:
        # Invalid token signature, expired token, or wrong client ID
        raise ApiError(
            message="Invalid Google token.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )





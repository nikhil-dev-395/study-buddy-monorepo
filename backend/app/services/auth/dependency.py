import jwt
from fastapi import Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.env import ENV
from app.utils.api.api_error import ApiError

security = HTTPBearer()
SECRET_KEY = ENV.JWT_SECRET_KEY
ALGORITHM = "HS256"


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    FastAPI dependency that decodes and validates the Bearer JWT token from HTTP headers.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id or not email:
            raise ApiError(
                message="Invalid token payload.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        return {"user_id": int(user_id), "email": email}

    except jwt.ExpiredSignatureError:
        raise ApiError(
            message="Access token has expired. Please log in again.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    except jwt.InvalidTokenError:
        raise ApiError(
            message="Invalid authentication credentials.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

# app/utils/api/api_error.py
from typing import Any, Optional
from fastapi import HTTPException, status
from app.utils.api.api_response import TypeApiResponse

class ApiError(HTTPException):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        metadata: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.metadata = metadata

        error_payload = TypeApiResponse(
            status="error",
            status_code=status_code,
            message=message,
            metadata=metadata,
            data=None
        ).model_dump(mode="json")

        super().__init__(status_code=status_code, detail=error_payload)

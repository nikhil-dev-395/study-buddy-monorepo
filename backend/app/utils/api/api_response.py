from typing import Any, Optional
from fastapi.responses import JSONResponse
from pydantic import BaseModel

class TypeApiResponse(BaseModel):
    status: str
    status_code: int
    message: str
    metadata: Optional[Any] = None
    data: Optional[Any] = None

class ApiResponse:
    @staticmethod
    def success(
        message: str,
        status_code: int = 200,
        data: Optional[Any] = None,
        metadata: Optional[Any] = None
    ) -> JSONResponse:

        response = TypeApiResponse(
            status="success",
            status_code=status_code,
            message=message,
            data=data,
            metadata=metadata
        )
        return JSONResponse(status_code=status_code, content=response.model_dump(mode="json"))

    @staticmethod
    def error(
        message: str,
        status_code: int = 400,
        metadata: Optional[Any] = None
    ) -> JSONResponse:
        response = TypeApiResponse(
            status="error",
            status_code=status_code,
            message=message,
            metadata=metadata,
            data=None
        )
        return JSONResponse(status_code=status_code, content=response.model_dump(mode="json"))

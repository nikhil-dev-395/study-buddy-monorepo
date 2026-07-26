# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request,status
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.db.database import init_db
from app.routes.user_route import router as user_router
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Study Buddy API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)


@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return ApiResponse.success(message="Welcome to the Study Buddy API!", status_code=200, data=None)


# Catch both ApiError and default FastAPI/Starlette HTTP errors (like 404s)
@app.exception_handler(StarletteHTTPException)
async def global_http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"[{request.method}] {request.url.path} - Validation Error: {exc.message} , Status Code: {exc.status_code}")
    if isinstance(exc.detail, dict):
        return ApiResponse.error(
            message=exc.detail.get("message", "An error occurred"),
            status_code=exc.status_code,
            metadata=exc.detail.get("metadata")
        )
    return ApiResponse.error(
        message=str(exc.detail),
        status_code=exc.status_code
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.critical(f"[{request.method}] {request.url.path} - Unhandled Exception: {str(exc)}", exc_info=True)
    return ApiResponse.error(
        message="Validation failed for incoming request data.",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        metadata=exc.errors()  # Contains details about missing/invalid fields
    )

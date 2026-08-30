from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
from app.db.database import init_db
from app.routes.user_route import router as user_router
from app.utils.api.api_error import ApiError
from app.utils.api.api_response import ApiResponse
from app.utils.logger import logger
from app.routes.profile_route import router as profile_router


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

# If user_router has prefix="/users" inside user_route.py, keep this as-is.
# If it does NOT, add prefix="/users" here: app.include_router(user_router, prefix="/users")
app.include_router(user_router)
app.include_router(profile_router)

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return ApiResponse.success(message="Welcome to the Study Buddy API!", status_code=200, data=None)


# Catch default FastAPI/Starlette HTTP errors (404, 401, 403, etc.)
@app.exception_handler(StarletteHTTPException)
async def global_http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Fixed: Changed exc.message -> exc.detail
    error_trace = traceback.format_exc()
    logger.critical(
        f"[{request.method}] {request.url.path} - Unhandled Exception: {error_trace}"
    )
    logger.warning(
        f"[{request.method}] {request.url.path} - HTTP Error: {exc.detail}, Status Code: {exc.status_code}"
    )

    logger.error(f"{exc}")
    if isinstance(exc.detail, dict):

        return ApiResponse.error(
            message=exc.detail.get("message", "An error occurred"),
            status_code=exc.status_code,
            metadata=exc.detail.get("metadata"),
        )
    return ApiResponse.error(
        message=str(exc.detail),
        status_code=exc.status_code,
    )


# Catch Pydantic/Request body validation errors (422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(
        f"[{request.method}] {request.url.path} - Validation Error: {exc.errors()}"
    )
    return ApiResponse.error(
        message="Validation failed for incoming request data.",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        metadata=exc.errors(),
    )


# Catch any unhandled 500 server errors
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.critical(
        f"[{request.method}] {request.url.path} - Unhandled Exception: {str(exc)}",
        exc_info=True,
    )
    return ApiResponse.error(
        message="Internal Server Error",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.db.database import init_db
from contextlib import asynccontextmanager
from app.env import ENV
from app.utils.logger import logger
# app = FastAPI()


from app.db.database import init_db
from app.routes.user_route import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database
    init_db()
    yield

app = FastAPI(title="Study Buddy API", version="1.0.0", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production (e.g., http://localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user_router)

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "server is running"}

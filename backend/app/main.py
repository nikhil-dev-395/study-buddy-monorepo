
from fastapi import FastAPI
from pathlib import Path
from app.db.database import init_db
from contextlib import asynccontextmanager
from app.env import ENV
from app.utils.logger import logger
# app = FastAPI()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "server is running"}

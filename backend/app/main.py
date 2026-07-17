
from fastapi import FastAPI
from pathlib import Path

from app.env import ENV
from app.utils.logger import logger
app = FastAPI()



logger.info(f"Host: {ENV.host}, POSTGRES_URL: {ENV.POSTGRES_URL}")

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "server is running"}

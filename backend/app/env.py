import os
from types import SimpleNamespace
from dotenv import load_dotenv
from pathlib import Path
from app.utils.logger import logger

# setting up .env file path
env_path = Path(__file__).resolve().parent.parent / '.env'

logger.info(f"Loading environment variables from: {env_path}")

load_dotenv(dotenv_path=env_path)

ENV = SimpleNamespace(
    host  = os.getenv("HOST","localhost"),
    port = int(os.getenv("PORT",8000)),
    LOG_LEVEL = os.getenv("LOG_LEVEL","DEBUG"),
    POSTGRES_URL = os.getenv("POSTGRES_URL")
)

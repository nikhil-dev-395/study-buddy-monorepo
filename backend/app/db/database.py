
# setting up supabase client #
from app.utils.logger import logger
from supabase import create_client , Client
from sqlmodel import SQLModel

from app.env import ENV


engine = create_client(ENV.POSTGRES_URL)

def init_db():
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")


# setting up supabase client #
from app.utils.logger import logger
from supabase import create_client , Client
from sqlmodel import SQLModel, Session,create_engine, text

from app.env import ENV


engine = create_engine(ENV.POSTGRES_URL,echo=True)


print(ENV.POSTGRES_URL)

def init_db():
    try:
        SQLModel.metadata.create_all(engine)
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
        logger.info("Successfully connected to the PostgreSQL database!")
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")


def  get_session():
    with Session(engine) as session:
        yield session

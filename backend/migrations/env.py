from logging.config import fileConfig
import sys
from pathlib import Path

from alembic import context
from sqlmodel import SQLModel, create_engine

# Ensure app imports resolve cleanly from backend/ root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.env import ENV
import app.models.user_model  # noqa: F401 (registers all SQLModel tables)

# Alembic Config
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 1. Point Alembic to SQLModel's metadata
target_metadata = SQLModel.metadata

# 2. Prepare database URL
url = ENV.POSTGRES_URL or ""
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)
config.set_main_option("sqlalchemy.url", url)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = create_engine(url)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

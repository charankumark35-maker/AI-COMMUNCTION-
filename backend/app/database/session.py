from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings
import logging

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL or "sqlite:///./aicoach.db"

def build_engine(url: str):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    return create_engine(url, connect_args=connect_args)

try:
    engine = build_engine(db_url)
    with engine.connect() as conn:
        pass
except Exception as e:
    logger.warning(f"Primary DB connection ({db_url}) failed: {e}. Falling back to SQLite database.")
    db_url = "sqlite:///./aicoach.db"
    engine = build_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency to get the database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    education = Column(String, nullable=True)
    skill_level = Column(String, nullable=True)
    target_role = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    practice_sessions = relationship("PracticeSession", back_populates="user", cascade="all, delete-orphan")
    resumes           = relationship("Resume",          back_populates="user", cascade="all, delete-orphan")
    mock_histories    = relationship("MockInterviewHistory", back_populates="user", cascade="all, delete-orphan")

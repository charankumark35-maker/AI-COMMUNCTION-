from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.session import Base

class MockInterviewHistory(Base):
    __tablename__ = "mock_interview_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, index=True, nullable=False)
    interview_type = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    
    overall_score = Column(Float, nullable=False)
    technical_score = Column(Float, nullable=False)
    communication_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    
    total_questions = Column(Integer, nullable=False)
    report_data = Column(Text, nullable=False) # Store the JSON payload of the final report
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="mock_histories")

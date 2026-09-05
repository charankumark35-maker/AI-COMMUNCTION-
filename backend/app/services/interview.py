from typing import Optional
from sqlalchemy.orm import Session
from app.models.interview import InterviewQuestion
from app.services.gemini_service import generate_gemini_question

def generate_and_store_question(
    db: Session,
    category: str,
    user_education: Optional[str] = None,
    skill_level: Optional[str] = None,
    target_role: Optional[str] = None
) -> InterviewQuestion:
    """
    Generates an interview question using Google Gemini AI tailored to user context and stores it in DB.
    """
    # 1. AI Generation via Gemini
    generated_text = generate_gemini_question(
        category=category,
        user_education=user_education,
        skill_level=skill_level,
        target_role=target_role
    )
    
    # 2. Store in Database
    new_question = InterviewQuestion(
        category=category,
        question_text=generated_text
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    return new_question


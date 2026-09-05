from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.interview import QuestionGenerateRequest, QuestionResponse
from app.services.interview import generate_and_store_question
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/generate-question", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def generate_question(
    request: QuestionGenerateRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_categories = ["HR Interview", "Technical Interview", "Communication Practice"]
    if request.category not in valid_categories:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )
        
    question = generate_and_store_question(
        db=db,
        category=request.category,
        user_education=getattr(current_user, "education", None),
        skill_level=getattr(current_user, "skill_level", None),
        target_role=getattr(current_user, "target_role", None)
    )
    return question


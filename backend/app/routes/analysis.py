import json
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.schemas.analysis import AnswerAnalyzeRequest, AnswerAnalyzeResponse, UserStatsResponse
from app.services.auth import get_current_user
from app.models.user import User
from app.models.session import PracticeSession
from app.services.gemini_service import analyze_gemini_answer

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("/analyze-answer", response_model=AnswerAnalyzeResponse, status_code=status.HTTP_201_CREATED)
def analyze_answer(
    request: AnswerAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Run Gemini AI Evaluation
    analysis_data = analyze_gemini_answer(
        question=request.question or "General Communication Practice",
        answer=request.answer
    )
    
    grammar_score = analysis_data["grammar_score"]
    vocabulary_score = analysis_data["vocabulary_score"]
    confidence_score = analysis_data["confidence_score"]
    overall_score = analysis_data["overall_score"]

    feedback_data = {
        "grammar_mistakes": analysis_data.get("grammar_mistakes", []),
        "vocabulary_suggestions": analysis_data.get("vocabulary_suggestions", []),
        "tone": analysis_data.get("tone", "confident"),
        "strengths": analysis_data.get("strengths", []),
        "weaknesses": analysis_data.get("weaknesses", []),
        "improvement_suggestions": analysis_data.get("improvement_suggestions", [])
    }
    
    # 2. Save Result in Database
    practice_session = PracticeSession(
        user_id=current_user.id,
        question=request.question,
        answer=request.answer,
        grammar_score=grammar_score,
        vocabulary_score=vocabulary_score,
        confidence_score=confidence_score,
        overall_score=overall_score,
        feedback=json.dumps(feedback_data)
    )
    
    db.add(practice_session)
    db.commit()
    db.refresh(practice_session)
    
    # 3. Return Feedback
    return {
        "id": practice_session.id,
        "grammar_score": practice_session.grammar_score,
        "vocabulary_score": practice_session.vocabulary_score,
        "confidence_score": practice_session.confidence_score,
        "overall_score": practice_session.overall_score,
        "feedback": feedback_data
    }

@router.get("/stats", response_model=UserStatsResponse)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stats = db.query(
        func.count(PracticeSession.id).label('total_sessions'),
        func.avg(PracticeSession.grammar_score).label('grammar_score'),
        func.avg(PracticeSession.vocabulary_score).label('vocabulary_score'),
        func.avg(PracticeSession.confidence_score).label('confidence_score'),
        func.avg(PracticeSession.overall_score).label('overall_score')
    ).filter(PracticeSession.user_id == current_user.id).first()

    total_sessions = stats.total_sessions or 0

    if total_sessions == 0:
        return UserStatsResponse(
            grammar_score=0.0,
            vocabulary_score=0.0,
            confidence_score=0.0,
            overall_score=0.0,
            total_sessions=0
        )
    
    return UserStatsResponse(
        grammar_score=round(stats.grammar_score, 1) if stats.grammar_score else 0.0,
        vocabulary_score=round(stats.vocabulary_score, 1) if stats.vocabulary_score else 0.0,
        confidence_score=round(stats.confidence_score, 1) if stats.confidence_score else 0.0,
        overall_score=round(stats.overall_score, 1) if stats.overall_score else 0.0,
        total_sessions=total_sessions
    )

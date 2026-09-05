import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.database.session import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.history import MockInterviewHistory
from app.schemas.history import HistoryListResponse, HistoryDetailResponse, HistoryStatsResponse, HistoryCreateRequest

router = APIRouter(tags=["History"])

# Helper function to compute performance stats
def calculate_user_stats(records: List[MockInterviewHistory]) -> dict:
    total = len(records)
    if total == 0:
        return {
            "total_interviews": 0,
            "average_score": 0.0,
            "best_score": 0.0,
            "latest_score": 0.0,
            "improvement_percentage": 0.0,
            "overall_average": 0.0,
            "technical_average": 0.0,
            "communication_average": 0.0,
            "confidence_average": 0.0,
            "progress_data": []
        }

    overall_avg = sum(r.overall_score for r in records) / total
    tech_avg = sum(r.technical_score for r in records) / total
    comm_avg = sum(r.communication_score for r in records) / total
    conf_avg = sum(r.confidence_score for r in records) / total
    best = max(r.overall_score for r in records)
    latest = records[-1].overall_score # records ordered by created_at asc

    # Improvement calculation (latest vs earliest)
    if total >= 2:
        earliest = records[0].overall_score
        if earliest > 0:
            improvement = ((latest - earliest) / earliest) * 100
        else:
            improvement = 0.0
    else:
        improvement = 0.0

    recent_records = records[-10:]
    progress_data = [
        {"date": r.created_at.strftime("%b %d"), "score": round(r.overall_score)}
        for r in recent_records
    ]

    return {
        "total_interviews": total,
        "average_score": round(overall_avg, 1),
        "best_score": round(best, 1),
        "latest_score": round(latest, 1),
        "improvement_percentage": round(improvement, 1),
        "overall_average": round(overall_avg, 1),
        "technical_average": round(tech_avg, 1),
        "communication_average": round(comm_avg, 1),
        "confidence_average": round(conf_avg, 1),
        "progress_data": progress_data
    }

# ── Stats & Performance Endpoints ──────────────────────────────────────────────
@router.get("/history/stats", response_model=HistoryStatsResponse)
@router.get("/interview/performance", response_model=HistoryStatsResponse)
def get_interview_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(MockInterviewHistory).filter(
        MockInterviewHistory.user_id == current_user.id
    ).order_by(MockInterviewHistory.created_at.asc(), MockInterviewHistory.id.asc()).all()


    return calculate_user_stats(records)

# ── History List Endpoints ──────────────────────────────────────────────────────
@router.get("/history", response_model=List[HistoryListResponse])
@router.get("/interview/history", response_model=List[HistoryListResponse])
def get_interview_history(
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MockInterviewHistory).filter(MockInterviewHistory.user_id == current_user.id)
    if type and type.lower() != "all":
        # Handle matching e.g., "HR", "Technical", "Voice", "Resume-Based", "Project"
        query = query.filter(MockInterviewHistory.interview_type.ilike(f"%{type}%"))
        
    records = query.order_by(desc(MockInterviewHistory.created_at)).all()
    return records

# ── Create History Endpoint ─────────────────────────────────────────────────────
@router.post("/history", response_model=HistoryDetailResponse, status_code=status.HTTP_201_CREATED)
@router.post("/interview/history", response_model=HistoryDetailResponse, status_code=status.HTTP_201_CREATED)
def create_interview_history(
    request: HistoryCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_id = request.session_id or f"sess_{uuid.uuid4().hex[:10]}"
    
    if request.report_data:
        report_data = request.report_data
    else:
        # Build report_data JSON structure from request fields
        report_data = {
            "overall_score": request.overall_score,
            "technical_score": request.technical_score,
            "communication_score": request.communication_score,
            "confidence_score": request.confidence_score,
            "strengths": request.strengths or ["Demonstrated good understanding."],
            "weaknesses": request.weaknesses or ["Can provide more detailed examples."],
            "improvement_suggestions": request.suggestions or ["Practice answering with the STAR method."],
            "recommended_topics": request.recommended_topics or ["System Design", "Behavioral Scenarios"],
            "evaluations": [
                {
                    "question": q,
                    "answer": request.answers[idx] if idx < len(request.answers) else "",
                    "evaluation": {"score": request.overall_score, "feedback_summary": "Good response."}
                }
                for idx, q in enumerate(request.questions or ["General Interview Question"])
            ]

        }

    history_record = MockInterviewHistory(
        user_id=current_user.id,
        session_id=session_id,
        interview_type=request.interview_type,
        difficulty=request.difficulty or "Medium",
        overall_score=request.overall_score,
        technical_score=request.technical_score or request.overall_score,
        communication_score=request.communication_score or request.overall_score,
        confidence_score=request.confidence_score or request.overall_score,
        total_questions=request.total_questions or max(1, len(request.questions or [])),
        report_data=json.dumps(report_data)
    )

    db.add(history_record)
    db.commit()
    db.refresh(history_record)

    return {
        "id": history_record.id,
        "session_id": history_record.session_id,
        "interview_type": history_record.interview_type,
        "difficulty": history_record.difficulty,
        "overall_score": history_record.overall_score,
        "technical_score": history_record.technical_score,
        "communication_score": history_record.communication_score,
        "confidence_score": history_record.confidence_score,
        "total_questions": history_record.total_questions,
        "created_at": history_record.created_at,
        "status": "Completed",
        "report_data": report_data
    }

# ── History Detail Endpoints ────────────────────────────────────────────────────
@router.get("/history/{history_id}", response_model=HistoryDetailResponse)
@router.get("/interview/history/{history_id}", response_model=HistoryDetailResponse)
def get_interview_details(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MockInterviewHistory).filter(
        MockInterviewHistory.id == history_id,
        MockInterviewHistory.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Interview record not found")
        
    return {
        "id": record.id,
        "session_id": record.session_id,
        "interview_type": record.interview_type,
        "difficulty": record.difficulty,
        "overall_score": record.overall_score,
        "technical_score": record.technical_score,
        "communication_score": record.communication_score,
        "confidence_score": record.confidence_score,
        "total_questions": record.total_questions,
        "created_at": record.created_at,
        "status": "Completed",
        "report_data": json.loads(record.report_data)
    }

# ── Delete History Endpoints ────────────────────────────────────────────────────
@router.delete("/history/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/interview/history/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MockInterviewHistory).filter(
        MockInterviewHistory.id == history_id,
        MockInterviewHistory.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Interview record not found")
        
    db.delete(record)
    db.commit()
    return None


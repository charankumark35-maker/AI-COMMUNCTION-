import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.session import PracticeSession
from app.models.history import MockInterviewHistory
from app.schemas.mock_interview import (
    MockInterviewStartRequest, MockInterviewStartResponse,
    MockInterviewAnswerRequest, MockInterviewAnswerResponse,
    MockInterviewFinishRequest, MockInterviewReportResponse,
    MockQuestionItem, AnswerEvaluationItem
)
from app.services.gemini_service import (
    generate_gemini_mock_question,
    evaluate_gemini_mock_answer,
    generate_gemini_mock_report
)

router = APIRouter(prefix="/mock-interview", tags=["Mock Interview"])

@router.post("/start", response_model=MockInterviewStartResponse, status_code=status.HTTP_201_CREATED)
def start_mock_interview(
    request: MockInterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Initialize a new multi-question AI Mock Interview session and return Question #1.
    """
    session_id = f"mock_{uuid.uuid4().hex[:8]}"
    
    user_details = {
        "target_role": current_user.target_role,
        "education": current_user.education,
        "skill_level": current_user.skill_level
    }

    q_data = generate_gemini_mock_question(
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        question_index=1,
        total_questions=request.total_questions,
        previous_questions=[],
        user_details=user_details
    )

    return {
        "session_id": session_id,
        "interview_type": request.interview_type,
        "difficulty": request.difficulty,
        "total_questions": request.total_questions,
        "current_question_index": 1,
        "question": q_data
    }


@router.post("/submit-answer", response_model=MockInterviewAnswerResponse, status_code=status.HTTP_200_OK)
@router.post("/evaluate-answer", response_model=MockInterviewAnswerResponse, status_code=status.HTTP_200_OK)
def evaluate_mock_answer(
    request: MockInterviewAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluate a candidate's answer for the current question using Gemini AI,
    persist progress in practice_sessions, and generate the next question if remaining.
    """
    if not request.answer_text.strip():
        raise HTTPException(status_code=400, detail="Answer text cannot be empty.")

    # 1. Evaluate answer via Gemini AI
    eval_data = evaluate_gemini_mock_answer(
        question=request.question_text,
        answer=request.answer_text,
        interview_type=request.interview_type,
        difficulty=request.difficulty
    )

    # 2. Persist practice session record
    session_record = PracticeSession(
        user_id=current_user.id,
        question=request.question_text,
        answer=request.answer_text,
        grammar_score=eval_data.get("communication_score", 80.0),
        vocabulary_score=eval_data.get("technical_correctness", 80.0),
        confidence_score=eval_data.get("confidence_score", 80.0),
        overall_score=eval_data.get("score", 80.0),
        feedback=json.dumps({
            "mock_session_id": request.session_id,
            "interview_type": request.interview_type,
            "difficulty": request.difficulty,
            "question_index": request.question_index,
            "evaluation": eval_data
        })
    )
    db.add(session_record)
    db.commit()

    is_finished = request.question_index >= request.total_questions
    next_question = None

    # 3. Generate Next Question if not finished
    if not is_finished:
        prev_qs = request.previous_questions or []
        prev_qs.append(request.question_text)
        
        user_details = {
            "target_role": current_user.target_role,
            "education": current_user.education,
            "skill_level": current_user.skill_level
        }

        next_q_data = generate_gemini_mock_question(
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            question_index=request.question_index + 1,
            total_questions=request.total_questions,
            previous_questions=prev_qs,
            user_details=user_details
        )
        next_question = next_q_data

    return {
        "question_index": request.question_index,
        "total_questions": request.total_questions,
        "is_finished": is_finished,
        "evaluation": eval_data,
        "next_question": next_question
    }


@router.post("/finish", response_model=MockInterviewReportResponse, status_code=status.HTTP_200_OK)
@router.post("/report", response_model=MockInterviewReportResponse, status_code=status.HTTP_200_OK)
def finish_mock_interview(
    request: MockInterviewFinishRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate final Interview Performance Report across all answered questions in the session.
    """
    report = generate_gemini_mock_report(
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        evaluations=request.evaluations
    )
    
    # Save the history to the database
    history_record = MockInterviewHistory(
        user_id=current_user.id,
        session_id=request.session_id,
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        overall_score=report.get("overall_score", 0.0),
        technical_score=report.get("technical_score", 0.0),
        communication_score=report.get("communication_score", 0.0),
        confidence_score=report.get("confidence_score", 0.0),
        total_questions=len(request.evaluations),
        report_data=json.dumps(report)
    )
    db.add(history_record)
    db.commit()

    return report

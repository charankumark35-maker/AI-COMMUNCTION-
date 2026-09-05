import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.session import PracticeSession
from app.services.resume import process_resume
from app.schemas.advanced import ResumeUploadResponse, VoiceAnalyzeRequest, VoiceAnalyzeResponse
from app.services.gemini_service import analyze_gemini_voice

router = APIRouter(prefix="/advanced", tags=["Advanced AI"])

# ── Resume Interview ──────────────────────────────────────────────────────────

@router.post("/resume/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a PDF resume.
    Returns extracted skills, detected projects, and Gemini AI-generated
    personalised interview questions.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    if file.size and file.size > 5 * 1024 * 1024:   # 5 MB guard
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5 MB.")

    pdf_bytes = await file.read()

    try:
        result = process_resume(db, current_user.id, file.filename, pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return result


# ── Voice Interview ───────────────────────────────────────────────────────────

@router.post("/voice/analyze", response_model=VoiceAnalyzeResponse, status_code=status.HTTP_201_CREATED)
def analyze_voice(
    request: VoiceAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Receive a speech-to-text transcript from the frontend.
    Run voice-specific Gemini AI analysis and persist the practice session.
    """
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    data = analyze_gemini_voice(request.transcript, request.question)

    scores    = data.get("scores", {})
    speech_fb = data.get("speech_feedback", {})
    feedback  = data.get("feedback", {})

    grammar_score     = scores.get("grammar_score", 0.0)
    vocabulary_score  = scores.get("vocabulary_score", 0.0)
    confidence_score  = scores.get("confidence_score", 0.0)
    pace_score        = scores.get("pace_score", 0.0)
    overall_score     = scores.get("overall_score", 0.0)
    speaking_score    = scores.get("speaking_score", overall_score)
    fluency_score     = scores.get("fluency_score", round((confidence_score + pace_score) / 2, 1) if (confidence_score and pace_score) else overall_score)
    pronunciation_score = scores.get("pronunciation_score", round((grammar_score + 90.0) / 2, 1) if grammar_score else 85.0)

    # Persist as a PracticeSession
    session = PracticeSession(
        user_id          = current_user.id,
        question         = request.question,
        answer           = request.transcript,
        grammar_score    = grammar_score,
        vocabulary_score = vocabulary_score,
        confidence_score = confidence_score,
        overall_score    = overall_score,
        feedback         = json.dumps({
            **feedback,
            "speech_feedback": speech_fb,
            "fluency_score": fluency_score,
            "pronunciation_score": pronunciation_score,
            "speaking_score": speaking_score
        }),
    )
    db.add(session)
    db.commit()

    return {
        "grammar_score":       grammar_score,
        "vocabulary_score":    vocabulary_score,
        "confidence_score":    confidence_score,
        "pace_score":          pace_score,
        "overall_score":       overall_score,
        "speaking_score":      speaking_score,
        "fluency_score":       fluency_score,
        "pronunciation_score": pronunciation_score,
        "speech_feedback":     speech_fb,
        "feedback":            feedback,
    }

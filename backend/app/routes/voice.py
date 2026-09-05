import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.session import PracticeSession
from app.schemas.advanced import VoiceAnalyzeRequest, VoiceAnalyzeResponse
from app.services.gemini_service import analyze_gemini_voice

router = APIRouter(prefix="/voice", tags=["Voice Interview"])

@router.post("/analyze", response_model=VoiceAnalyzeResponse, status_code=status.HTTP_201_CREATED)
def analyze_voice_endpoint(
    request: VoiceAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Receive speech-to-text transcript from the frontend.
    Run Gemini AI analysis for voice communication, fluency, pronunciation, pacing, filler words, and confidence.
    Persist the session and return complete feedback metrics.
    """
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty. Please record your voice answer first.")

    data = analyze_gemini_voice(request.transcript, request.question)

    scores    = data.get("scores", {})
    speech_fb = data.get("speech_feedback", {})
    feedback  = data.get("feedback", {})

    grammar_score     = scores.get("grammar_score", 80.0)
    vocabulary_score  = scores.get("vocabulary_score", 80.0)
    confidence_score  = scores.get("confidence_score", 80.0)
    pace_score        = scores.get("pace_score", 85.0)
    overall_score     = scores.get("overall_score", 82.0)
    speaking_score    = scores.get("speaking_score", overall_score)
    fluency_score     = scores.get("fluency_score", round((confidence_score + pace_score) / 2, 1))
    pronunciation_score = scores.get("pronunciation_score", round((grammar_score + 90.0) / 2, 1))

    # Persist as a PracticeSession in DB
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

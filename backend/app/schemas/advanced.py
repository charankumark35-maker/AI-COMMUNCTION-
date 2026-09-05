from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResumeUploadResponse(BaseModel):
    resume_id: int
    filename:  str
    skills:    Dict[str, List[str]]
    projects:  List[str]
    questions: List[Dict[str, Any]]


class VoiceAnalyzeRequest(BaseModel):
    question:   Optional[str] = "Voice Interview Practice"
    transcript: str            # STT text from the browser Web Speech API


class SpeechFeedback(BaseModel):
    filler_count:      int
    filler_ratio_pct:  float
    clarity_bonus:     int
    word_count:        int
    pace_assessment:   str
    fillers_detected:  List[str]


class VoiceAnalyzeResponse(BaseModel):
    grammar_score:       float
    vocabulary_score:    float
    confidence_score:    float
    pace_score:          float
    overall_score:       float
    speaking_score:      Optional[float] = None
    fluency_score:       Optional[float] = None
    pronunciation_score: Optional[float] = None
    speech_feedback:     SpeechFeedback
    feedback:            Dict[str, Any]

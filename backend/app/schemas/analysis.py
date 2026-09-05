from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AnswerAnalyzeRequest(BaseModel):
    question: Optional[str] = "General Communication Practice"
    answer: str

class AnalysisFeedback(BaseModel):
    grammar_mistakes: List[Dict[str, Any]]
    vocabulary_suggestions: List[Dict[str, Any]]
    tone: str
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    improvement_suggestions: Optional[List[str]] = []


class AnswerAnalyzeResponse(BaseModel):
    id: int
    grammar_score: float
    vocabulary_score: float
    confidence_score: float
    overall_score: float
    feedback: AnalysisFeedback

class UserStatsResponse(BaseModel):
    grammar_score: float
    vocabulary_score: float
    confidence_score: float
    overall_score: float
    total_sessions: int

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class HistoryCreateRequest(BaseModel):
    interview_type: str
    difficulty: Optional[str] = "Medium"
    overall_score: float
    technical_score: Optional[float] = 0.0
    communication_score: Optional[float] = 0.0
    confidence_score: Optional[float] = 0.0
    total_questions: Optional[int] = 1
    session_id: Optional[str] = None
    questions: Optional[List[str]] = []
    answers: Optional[List[str]] = []
    scores: Optional[Dict[str, Any]] = {}
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    suggestions: Optional[List[str]] = []
    recommended_topics: Optional[List[str]] = []
    report_data: Optional[Dict[str, Any]] = None

class HistoryListResponse(BaseModel):
    id: int
    session_id: str
    interview_type: str
    difficulty: str
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    total_questions: int
    created_at: datetime
    status: Optional[str] = "Completed"
    
    class Config:
        orm_mode = True

class HistoryDetailResponse(HistoryListResponse):
    report_data: Dict[str, Any]

class HistoryStatsResponse(BaseModel):
    total_interviews: int
    average_score: float
    best_score: float
    latest_score: float
    improvement_percentage: float
    overall_average: float
    technical_average: float
    communication_average: float
    confidence_average: float
    progress_data: List[Dict[str, Any]]


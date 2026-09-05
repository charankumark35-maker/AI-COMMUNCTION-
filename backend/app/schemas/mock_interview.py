from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class MockInterviewStartRequest(BaseModel):
    interview_type: str = "HR Interview"      # HR Interview | Technical Interview | Resume-Based Interview | Project Interview
    difficulty: str = "Medium"               # Easy | Medium | Hard
    total_questions: int = 5                  # 3 | 5 | 10

class MockQuestionItem(BaseModel):
    id: int
    question_text: str
    category: str
    focus_area: str

class MockInterviewStartResponse(BaseModel):
    session_id: str
    interview_type: str
    difficulty: str
    total_questions: int
    current_question_index: int
    question: MockQuestionItem

class MockInterviewAnswerRequest(BaseModel):
    session_id: str
    interview_type: str = "HR Interview"
    difficulty: str = "Medium"
    question_index: int
    total_questions: int
    question_text: str
    answer_text: str
    previous_questions: Optional[List[str]] = []

class AnswerEvaluationItem(BaseModel):
    quality_score: float
    relevance_score: float
    technical_correctness: float
    communication_score: float
    confidence_score: float
    score: float
    feedback_summary: str
    strengths: List[str]
    improvements: List[str]

class MockInterviewAnswerResponse(BaseModel):
    question_index: int
    total_questions: int
    is_finished: bool
    evaluation: AnswerEvaluationItem
    next_question: Optional[MockQuestionItem] = None

class MockInterviewFinishRequest(BaseModel):
    session_id: str
    interview_type: str
    difficulty: str
    evaluations: List[Dict[str, Any]]

class MockInterviewReportResponse(BaseModel):
    overall_score: float
    communication_score: float
    technical_score: float
    confidence_score: float
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    recommended_topics: List[str]

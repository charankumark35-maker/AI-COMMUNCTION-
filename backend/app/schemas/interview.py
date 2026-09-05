from pydantic import BaseModel
from datetime import datetime

class QuestionGenerateRequest(BaseModel):
    category: str

class QuestionResponse(BaseModel):
    id: int
    category: str
    question_text: str
    created_at: datetime

    class Config:
        from_attributes = True

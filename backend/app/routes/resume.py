import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.services.resume import process_resume, extract_text_from_file
from app.services.gemini_service import analyze_gemini_resume_full

router = APIRouter(prefix="/resume", tags=["Resume Analysis"])

class ResumeAnalyzeRequest(BaseModel):
    resume_id: Optional[int] = None
    raw_text: Optional[str] = None
    filename: Optional[str] = "Uploaded_Resume.pdf"

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Accept resume file (.pdf or .docx).
    Extract text from file, store record in DB, and return extracted data.
    """
    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Only PDF (.pdf) and Word (.docx) files are supported.")

    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds maximum limit of 5 MB.")

    file_bytes = await file.read()

    try:
        result = process_resume(db, current_user.id, file.filename, file_bytes)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume file: {str(e)}")


@router.post("/analyze", status_code=status.HTTP_200_OK)
def analyze_resume_endpoint(
    request: ResumeAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Use Gemini AI to analyze the uploaded resume text.
    Extracts candidate profile, resume quality score, skill gap analysis, and tailored interview questions.
    """
    raw_text = request.raw_text

    # If resume_id provided, fetch raw text or resume details from DB
    if not raw_text and request.resume_id:
        resume_rec = db.query(Resume).filter(Resume.id == request.resume_id, Resume.user_id == current_user.id).first()
        if resume_rec:
            raw_text = f"Skills: {resume_rec.extracted_skills}\nProjects: {resume_rec.detected_projects}"

    if not raw_text or not raw_text.strip():
        raw_text = f"Candidate target role: {current_user.target_role or 'Software Engineer'}. Education: {current_user.education or 'Degree'}. Skill level: {current_user.skill_level or 'Intermediate'}."

    analysis = analyze_gemini_resume_full(raw_text)
    return analysis

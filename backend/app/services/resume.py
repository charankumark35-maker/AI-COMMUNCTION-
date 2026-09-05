"""
resume.py  (service)
────────────────────
Handles PDF and DOCX text extraction and orchestrates the AI resume analysis pipeline.
"""

import io
import xml.etree.ElementTree as ET
import zipfile
from pypdf import PdfReader
from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.services.gemini_service import analyze_gemini_resume_full


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a PDF byte stream using pypdf with fallback."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
        if pages_text:
            return "\n".join(pages_text)
    except Exception:
        pass
    
    # Fallback to UTF-8 text decoding if pypdf cannot parse binary
    try:
        decoded = pdf_bytes.decode("utf-8", errors="ignore")
        if any(c.isalnum() for c in decoded):
            return decoded
    except Exception:
        pass
    return ""


def extract_text_from_docx(docx_bytes: bytes) -> str:
    """Extract paragraph text from a DOCX byte stream using zipfile & xml parser."""
    try:
        with zipfile.ZipFile(io.BytesIO(docx_bytes)) as z:
            xml_content = z.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            texts = [node.text for node in tree.findall(".//w:t", ns) if node.text]
            return " ".join(texts)
    except Exception as e:
        raise ValueError(f"Failed to read DOCX contents: {str(e)}")


def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    filename_lower = filename.lower()
    if filename_lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    return extract_text_from_pdf(file_bytes)


def process_resume(db: Session, user_id: int, filename: str, file_bytes: bytes) -> dict:
    """
    Full pipeline:
      1. Extract text from PDF or DOCX
      2. AI analysis via Gemini (extracting skills, projects, questions, score, gap analysis)
      3. Persist to database
      4. Return structured result
    """
    # 1. Extract text
    raw_text = extract_text_from_file(filename, file_bytes)
    if not raw_text.strip():
        raise ValueError("Could not extract readable text from the uploaded file. Please check if the document contains selectable text.")

    # 2. AI analysis via Gemini
    analysis_result = analyze_gemini_resume_full(raw_text)
    
    extracted_data = analysis_result.get("extracted_data", {})
    skills = extracted_data.get("skills", {})
    projects = extracted_data.get("projects", [])
    questions = analysis_result.get("questions", [])

    # 3. Flatten skill list for storage
    all_skills_flat = ", ".join(
        skill for skill_list in skills.values() for skill in skill_list
    ) if isinstance(skills, dict) else str(skills)

    projects_flat = "; ".join(projects) if isinstance(projects, list) else str(projects)
    questions_flat = " | ".join(q.get("question", "") for q in questions) if isinstance(questions, list) else str(questions)

    # 4. Persist
    resume_record = Resume(
        user_id=user_id,
        filename=filename,
        extracted_skills=all_skills_flat,
        detected_projects=projects_flat,
        generated_questions=questions_flat,
    )
    db.add(resume_record)
    db.commit()
    db.refresh(resume_record)

    return {
        "resume_id":      resume_record.id,
        "filename":       filename,
        "raw_text":       raw_text,
        "analysis":       analysis_result,
        "skills":         skills,
        "projects":       projects,
        "questions":      questions,
    }

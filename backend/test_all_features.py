import sys
import json
import logging
from fastapi.testclient import TestClient

# Import app and database dependencies
from app.main import app
from app.database.session import engine, Base
from app.services.auth import get_password_hash, verify_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestEngine")

def run_tests():
    logger.info("Starting Senior QA Test Suite for AI Communication Coach...")
    
    # 1. Database & Table Creation Test
    logger.info("[1/6] Testing Database & Table Creation...")
    Base.metadata.create_all(bind=engine)
    logger.info("[OK] Database tables initialized successfully.")

    
    # Initialize TestClient
    client = TestClient(app)
    
    # 2. Authentication & JWT Security Test
    logger.info("[2/6] Testing Password Security & Auth APIs...")
    raw_pass = "SecurePass123!"
    hashed_pass = get_password_hash(raw_pass)
    assert verify_password(raw_pass, hashed_pass), "Password verification failed!"
    assert not verify_password("WrongPass", hashed_pass), "Password verification accepted invalid password!"
    logger.info("[OK] Password hashing & verification passed.")


    test_user = {
        "name": "Test Candidate",
        "email": "test.candidate@example.com",
        "password": raw_pass,
        "education": "B.S. Computer Science",
        "skill_level": "Intermediate",
        "target_role": "Full Stack Engineer"
    }

    # Register Test User
    res_reg = client.post("/auth/register", json=test_user)
    if res_reg.status_code == 400 and "already registered" in res_reg.text:
        logger.info("User already registered from previous run, proceeding to login.")
    else:
        assert res_reg.status_code == 201, f"Registration failed: {res_reg.text}"
        assert res_reg.json()["email"] == test_user["email"]
        logger.info("[OK] User registration API passed.")

    # Login Test User
    res_login = client.post("/auth/login", data={"username": test_user["email"], "password": raw_pass})
    assert res_login.status_code == 200, f"Login failed: {res_login.text}"
    token_data = res_login.json()
    assert "access_token" in token_data, "No access_token returned!"
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    logger.info("[OK] JWT authentication & login API passed.")

    # Profile Test User
    res_profile = client.get("/auth/profile", headers=headers)
    assert res_profile.status_code == 200, f"Profile fetch failed: {res_profile.text}"
    assert res_profile.json()["email"] == test_user["email"]
    logger.info("[OK] User profile authentication guard passed.")

    # 3. Interview Question Generation Test
    logger.info("[3/6] Testing AI Question Generation API...")
    res_q = client.post("/interview/generate-question", json={"category": "Technical Interview"}, headers=headers)
    assert res_q.status_code == 201, f"Question generation failed: {res_q.text}"
    q_data = res_q.json()
    assert "question_text" in q_data and len(q_data["question_text"]) > 0
    logger.info(f"[OK] Generated Question: '{q_data['question_text']}'")

    # 4. Multi-dimensional Answer Analysis Test
    logger.info("[4/6] Testing Answer Analysis API...")
    sample_answer = (
        "In my previous project, I led the development of a microservices backend using FastAPI and React. "
        "I was confident in my approach and we reduced latency by 35% through query optimization."
    )
    res_ans = client.post(
        "/analysis/analyze-answer",
        json={"question": q_data["question_text"], "answer": sample_answer},
        headers=headers
    )
    assert res_ans.status_code == 201, f"Answer analysis failed: {res_ans.text}"
    ans_data = res_ans.json()
    assert "overall_score" in ans_data and ans_data["overall_score"] > 0
    feedback = ans_data.get("feedback", {})
    assert "strengths" in feedback and "weaknesses" in feedback and "improvement_suggestions" in feedback
    logger.info(f"[OK] Analysis Scores: Overall={ans_data['overall_score']}, Grammar={ans_data['grammar_score']}, Vocab={ans_data['vocabulary_score']}, Confidence={ans_data['confidence_score']}")
    logger.info(f"[OK] Feedback Strengths Count: {len(feedback['strengths'])}")

    # 5. Voice Speech-to-Text Analysis Test
    logger.info("[5/6] Testing Voice Speech-to-Text Analysis API...")
    sample_transcript = "Um, I think that software engineering requires good team communication and problem solving."
    res_voice = client.post(
        "/advanced/voice/analyze",
        json={"question": "Tell me about your software philosophy.", "transcript": sample_transcript},
        headers=headers
    )
    assert res_voice.status_code == 201, f"Voice analysis failed: {res_voice.text}"
    voice_data = res_voice.json()
    assert "speech_feedback" in voice_data
    logger.info(f"[OK] Voice Analysis Pace/Clarity: {voice_data['speech_feedback'].get('clarity', 'N/A')}")

    # 6. Invalid Input & Error Handling Guard Test
    logger.info("[6/6] Testing Invalid Inputs & Error Handling Guards...")
    # Invalid token test
    res_bad_token = client.get("/auth/profile", headers={"Authorization": "Bearer InvalidToken123"})
    assert res_bad_token.status_code == 401
    
    # Invalid category test
    res_bad_cat = client.post("/interview/generate-question", json={"category": "InvalidCategory"}, headers=headers)
    assert res_bad_cat.status_code == 400
    
    # Empty transcript voice test
    res_bad_voice = client.post("/advanced/voice/analyze", json={"question": "Q", "transcript": "   "}, headers=headers)
    assert res_bad_voice.status_code == 400
    logger.info("[OK] Error handling & input validation guards verified.")

    logger.info("==========================================================")
    logger.info("[SUCCESS] ALL QA TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!")
    logger.info("==========================================================")


if __name__ == "__main__":
    run_tests()

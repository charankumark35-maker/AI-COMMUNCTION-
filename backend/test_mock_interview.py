from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_mock_interview_pipeline():
    print("=== Testing Mock Interview API Pipeline ===")
    
    # 1. Auth Setup
    email = "mockuser@example.com"
    password = "password123"
    
    client.post("/auth/register", json={
        "name": "Mock Interviewer",
        "email": email,
        "password": password,
        "target_role": "Backend Architect",
        "education": "Master of Computer Science"
    })
    
    login_res = client.post("/auth/login", data={"username": email, "password": password})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Start Mock Interview
    start_res = client.post("/mock-interview/start", json={
        "interview_type": "Technical Interview",
        "difficulty": "Medium",
        "total_questions": 3
    }, headers=headers)
    
    print("Start API Status:", start_res.status_code)
    assert start_res.status_code == 201, f"Start failed: {start_res.text}"
    start_data = start_res.json()
    session_id = start_data["session_id"]
    q1 = start_data["question"]
    print("[OK] Mock Session Started ID:", session_id)
    print("[OK] Question #1 Prompt:", q1["question_text"])

    # 3. Submit Answer for Question #1
    ans1_res = client.post("/mock-interview/submit-answer", json={
        "session_id": session_id,
        "interview_type": "Technical Interview",
        "difficulty": "Medium",
        "question_index": 1,
        "total_questions": 3,
        "question_text": q1["question_text"],
        "answer_text": "I prioritize database indexing, asynchronous request handling, and caching frequently requested data with Redis.",
        "previous_questions": []
    }, headers=headers)

    print("Submit Answer Q1 Status:", ans1_res.status_code)
    assert ans1_res.status_code == 200, f"Answer Q1 failed: {ans1_res.text}"
    ans1_data = ans1_res.json()
    eval1 = ans1_data["evaluation"]
    q2 = ans1_data["next_question"]
    print("[OK] Q1 Evaluation Score:", eval1["score"])
    print("[OK] Q2 Prompt Received:", q2["question_text"])

    # 4. Submit Answer for Question #2
    ans2_res = client.post("/mock-interview/submit-answer", json={
        "session_id": session_id,
        "interview_type": "Technical Interview",
        "difficulty": "Medium",
        "question_index": 2,
        "total_questions": 3,
        "question_text": q2["question_text"],
        "answer_text": "Processes have separate memory spaces, whereas threads within a process share the same memory heap.",
        "previous_questions": [q1["question_text"]]
    }, headers=headers)

    assert ans2_res.status_code == 200, f"Answer Q2 failed: {ans2_res.text}"
    ans2_data = ans2_res.json()
    eval2 = ans2_data["evaluation"]
    q3 = ans2_data["next_question"]
    print("[OK] Q2 Evaluation Score:", eval2["score"])
    print("[OK] Q3 Prompt Received:", q3["question_text"])


    # 5. Submit Answer for Question #3 (Last Question)
    ans3_res = client.post("/mock-interview/submit-answer", json={
        "session_id": session_id,
        "interview_type": "Technical Interview",
        "difficulty": "Medium",
        "question_index": 3,
        "total_questions": 3,
        "question_text": q3["question_text"],
        "answer_text": "REST relies on standard HTTP verbs and endpoint URIs, whereas GraphQL allows clients to request exact JSON field structures.",
        "previous_questions": [q1["question_text"], q2["question_text"]]
    }, headers=headers)

    assert ans3_res.status_code == 200, f"Answer Q3 failed: {ans3_res.text}"
    ans3_data = ans3_res.json()
    assert ans3_data["is_finished"] == True, "Session should mark finished after Q3"
    print("[OK] Q3 Evaluated and Session marked Finished.")


    # 6. Generate Final Mock Interview Report
    evaluations_list = [
        {"question": q1["question_text"], "answer": "Answer 1", "evaluation": eval1},
        {"question": q2["question_text"], "answer": "Answer 2", "evaluation": eval2},
        {"question": q3["question_text"], "answer": "Answer 3", "evaluation": ans3_data["evaluation"]}
    ]

    report_res = client.post("/mock-interview/finish", json={
        "session_id": session_id,
        "interview_type": "Technical Interview",
        "difficulty": "Medium",
        "evaluations": evaluations_list
    }, headers=headers)

    print("Finish Report API Status:", report_res.status_code)
    assert report_res.status_code == 200, f"Finish report failed: {report_res.text}"
    report_data = report_res.json()
    
    print("[OK] Overall Score:", report_data["overall_score"])
    print("[OK] Communication Score:", report_data["communication_score"])
    print("[OK] Technical Score:", report_data["technical_score"])
    print("[OK] Confidence Score:", report_data["confidence_score"])
    print("[OK] Strengths Count:", len(report_data["strengths"]))
    print("[OK] Weaknesses Count:", len(report_data["weaknesses"]))
    print("[OK] Recommended Topics:", report_data["recommended_topics"])

    print("\n[SUCCESS] All Mock Interview API endpoints verified with zero errors!")


if __name__ == "__main__":
    test_mock_interview_pipeline()

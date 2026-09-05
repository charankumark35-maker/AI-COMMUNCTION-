from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_history_pipeline():
    print("=== Testing History API Pipeline ===")
    
    # 1. Auth Setup
    email = "historyuser@example.com"
    password = "password123"
    
    client.post("/auth/register", json={
        "name": "History User",
        "email": email,
        "password": password,
        "target_role": "Backend Architect",
        "education": "Master of Computer Science"
    })
    
    login_res = client.post("/auth/login", data={"username": email, "password": password})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add some history records directly using mock interview endpoints
    for i in range(2):
        start_res = client.post("/mock-interview/start", json={
            "interview_type": "Technical Interview",
            "difficulty": "Medium",
            "total_questions": 1
        }, headers=headers)
        assert start_res.status_code == 201
        session_id = start_res.json()["session_id"]
        
        ans_res = client.post("/mock-interview/submit-answer", json={
            "session_id": session_id,
            "interview_type": "Technical Interview",
            "difficulty": "Medium",
            "question_index": 1,
            "total_questions": 1,
            "question_text": "What is Python?",
            "answer_text": "A programming language.",
            "previous_questions": []
        }, headers=headers)
        assert ans_res.status_code == 200
        
        report_res = client.post("/mock-interview/finish", json={
            "session_id": session_id,
            "interview_type": "Technical Interview",
            "difficulty": "Medium",
            "evaluations": [
                {"question": "What is Python?", "answer": "A programming language.", "evaluation": ans_res.json()["evaluation"]}
            ]
        }, headers=headers)
        assert report_res.status_code == 200

    # 3. Test History List
    history_res = client.get("/history", headers=headers)
    assert history_res.status_code == 200
    records = history_res.json()
    print(f"Total History Records: {len(records)}")
    assert len(records) >= 2
    
    # 4. Test History Details
    first_record_id = records[0]["id"]
    detail_res = client.get(f"/history/{first_record_id}", headers=headers)
    assert detail_res.status_code == 200
    print("Detailed Record Fetched Successfully")
    assert "report_data" in detail_res.json()

    # 5. Test History Stats
    stats_res = client.get("/history/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    print(f"Stats fetched: {stats['overall_average']}")
    assert stats["total_interviews"] >= 2
    
    # 6. Test Delete History
    del_res = client.delete(f"/history/{first_record_id}", headers=headers)
    assert del_res.status_code == 204
    
    after_del_res = client.get(f"/history/{first_record_id}", headers=headers)
    assert after_del_res.status_code == 404
    print("Delete History API Verified")
    print("\n[SUCCESS] All History API endpoints verified with zero errors!")


if __name__ == "__main__":
    test_history_pipeline()

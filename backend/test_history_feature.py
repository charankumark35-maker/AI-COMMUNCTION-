import os
import sys
import unittest
from fastapi.testclient import TestClient
import json

# Add backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.database.session import Base, engine

class TestInterviewHistoryFeature(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def test_full_history_and_performance_workflow(self):
        import uuid
        uid = uuid.uuid4().hex[:6]
        user1_email = f"history_user1_{uid}@example.com"
        user1_pass = "Password123!"
        reg_res = self.client.post("/auth/register", json={
            "email": user1_email,
            "password": user1_pass,
            "name": "History Tester 1",
            "target_role": "Software Engineer"
        })
        self.assertEqual(reg_res.status_code, 201)
        login_res = self.client.post("/auth/login", data={"username": user1_email, "password": user1_pass})
        self.assertEqual(login_res.status_code, 200)
        token1 = login_res.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}

        user2_email = f"history_user2_{uid}@example.com"
        user2_pass = "Password123!"
        self.client.post("/auth/register", json={
            "email": user2_email,
            "password": user2_pass,
            "name": "History Tester 2"
        })
        login_res2 = self.client.post("/auth/login", data={"username": user2_email, "password": user2_pass})
        token2 = login_res2.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}


        # 3. Create interview history record for User 1
        create_payload = {
            "interview_type": "Technical Interview",
            "difficulty": "Hard",
            "overall_score": 88.0,
            "technical_score": 90.0,
            "communication_score": 85.0,
            "confidence_score": 89.0,
            "total_questions": 3,
            "questions": ["Explain binary search", "What is Big O?", "Explain REST APIs"],
            "answers": ["Binary search divides in half.", "Big O measures complexity.", "REST uses standard HTTP methods."],
            "strengths": ["Clear technical explanations", "Good vocabulary"],
            "weaknesses": ["Pacing could be slightly faster"],
            "suggestions": ["Practice system design questions"],
            "recommended_topics": ["Data Structures", "Web Protocols"]
        }

        post_res = self.client.post("/interview/history", json=create_payload, headers=headers1)
        self.assertEqual(post_res.status_code, 201, f"Create history failed: {post_res.text}")
        created_data = post_res.json()
        history_id = created_data["id"]
        self.assertEqual(created_data["interview_type"], "Technical Interview")
        self.assertEqual(created_data["overall_score"], 88.0)

        # 4. Create second record for User 1 to test score progression & stats
        create_payload2 = {
            "interview_type": "HR Interview",
            "difficulty": "Medium",
            "overall_score": 94.0,
            "technical_score": 92.0,
            "communication_score": 95.0,
            "confidence_score": 95.0,
            "total_questions": 2,
            "questions": ["Tell me about yourself", "What is your weakness?"],
            "answers": ["I am a developer...", "I tend to work too hard."],
        }
        post_res2 = self.client.post("/interview/history", json=create_payload2, headers=headers1)
        self.assertEqual(post_res2.status_code, 201)

        # 5. Fetch history list for User 1
        list_res = self.client.get("/interview/history", headers=headers1)
        self.assertEqual(list_res.status_code, 200)
        items = list_res.json()
        self.assertGreaterEqual(len(items), 2)

        # Filter by type
        filter_res = self.client.get("/interview/history?type=Technical", headers=headers1)
        self.assertEqual(filter_res.status_code, 200)
        filtered_items = filter_res.json()
        self.assertTrue(all("Technical" in item["interview_type"] for item in filtered_items))

        # 6. Fetch performance analytics for User 1
        perf_res = self.client.get("/interview/performance", headers=headers1)
        self.assertEqual(perf_res.status_code, 200)
        perf_data = perf_res.json()
        self.assertGreaterEqual(perf_data["total_interviews"], 2)
        self.assertEqual(perf_data["best_score"], 94.0)
        self.assertEqual(perf_data["latest_score"], 94.0)
        self.assertGreater(perf_data["improvement_percentage"], 0)

        # 7. Fetch report details for User 1
        detail_res = self.client.get(f"/interview/history/{history_id}", headers=headers1)
        self.assertEqual(detail_res.status_code, 200)
        detail_data = detail_res.json()
        self.assertEqual(detail_data["id"], history_id)
        self.assertIn("report_data", detail_data)

        # 8. User Data Isolation Test: User 2 must NOT be able to view User 1's history record
        user2_access = self.client.get(f"/interview/history/{history_id}", headers=headers2)
        self.assertEqual(user2_access.status_code, 404, "Security violation: User 2 accessed User 1's history record!")

        # 9. Delete history record for User 1
        del_res = self.client.delete(f"/interview/history/{history_id}", headers=headers1)
        self.assertEqual(del_res.status_code, 204)

        # Verify record is deleted
        detail_after_del = self.client.get(f"/interview/history/{history_id}", headers=headers1)
        self.assertEqual(detail_after_del.status_code, 404)

        print("[SUCCESS] All backend interview history & performance tests passed cleanly!")

if __name__ == "__main__":
    unittest.main()

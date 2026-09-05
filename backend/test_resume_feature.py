import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_resume_pipeline():
    print("--- Testing Resume Pipeline ---")
    
    # 1. Register & Login User
    email = "resumetes-user@example.com"
    password = "password123"
    
    register_res = client.post("/auth/register", json={
        "name": "Resume Tester",
        "email": email,
        "password": password,
        "education": "B.Tech Computer Science",
        "target_role": "Full Stack Engineer"
    })
    
    login_res = client.post("/auth/login", data={"username": email, "password": password})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Test Resume Upload with a sample PDF content
    pdf_content = b"%PDF-1.4 sample PDF with text Skills: Python, React, FastAPI, SQL. Experience: Built scalable Web Apps."
    files = {"file": ("test_resume.pdf", pdf_content, "application/pdf")}
    
    upload_res = client.post("/resume/upload", files=files, headers=headers)
    print("Upload Status:", upload_res.status_code)
    assert upload_res.status_code == 201, f"Upload failed: {upload_res.text}"
    upload_data = upload_res.json()
    print("Upload Result Keys:", list(upload_data.keys()))
    
    # 3. Test Resume Analyze API
    analyze_res = client.post("/resume/analyze", json={
        "resume_id": upload_data.get("resume_id"),
        "raw_text": upload_data.get("raw_text"),
        "filename": upload_data.get("filename")
    }, headers=headers)
    print("Analyze Status:", analyze_res.status_code)
    assert analyze_res.status_code == 200, f"Analyze failed: {analyze_res.text}"
    
    analyze_data = analyze_res.json()
    print("Analyze Result Keys:", list(analyze_data.keys()))
    assert "resume_score" in analyze_data, "Missing resume_score"
    assert "questions" in analyze_data, "Missing questions"
    assert "skill_gap_analysis" in analyze_data, "Missing skill_gap_analysis"
    
    print("\nSUCCESS: All Resume API endpoints verified!")

if __name__ == "__main__":
    test_resume_pipeline()

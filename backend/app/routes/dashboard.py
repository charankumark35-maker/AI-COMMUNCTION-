import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database.session import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.history import MockInterviewHistory
from app.models.session import PracticeSession
from app.models.resume import Resume
from app.services.gemini_service import generate_gemini_dashboard_insights

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])


def _readiness_score(total_interviews: int, overall_avg: float, comm_avg: float,
                     conf_avg: float, tech_avg: float) -> float:
    """
    Readiness Score — data-driven composite, no arbitrary values:
      35% overall interview average score
      20% communication average
      15% confidence average
      15% technical average
      15% consistency bonus  (min(100, total_interviews * 10))
    A new user with 0 interviews always gets 0.
    """
    if total_interviews == 0:
        return 0.0
    consistency = min(100.0, total_interviews * 10.0)
    score = (
        overall_avg * 0.35
        + comm_avg * 0.20
        + conf_avg * 0.15
        + tech_avg * 0.15
        + consistency * 0.15
    )
    return round(min(100.0, score), 1)


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Comprehensive dashboard analytics aggregated from real user data.
    No mocked / placeholder values — every metric is calculated from the DB.
    """
    # All interviews ordered ascending (for trend calculation)
    interviews = (
        db.query(MockInterviewHistory)
        .filter(MockInterviewHistory.user_id == current_user.id)
        .order_by(MockInterviewHistory.created_at.asc())
        .all()
    )
    total_interviews = len(interviews)

    # Practice sessions total
    total_practice = (
        db.query(func.count(PracticeSession.id))
        .filter(PracticeSession.user_id == current_user.id)
        .scalar()
        or 0
    )

    # Aggregate interview scores
    if total_interviews > 0:
        overall_avg = sum(i.overall_score for i in interviews) / total_interviews
        tech_avg = sum(i.technical_score for i in interviews) / total_interviews
        comm_avg = sum(i.communication_score for i in interviews) / total_interviews
        conf_avg = sum(i.confidence_score for i in interviews) / total_interviews
        best_score = max(i.overall_score for i in interviews)
        latest_score = interviews[-1].overall_score
        improvement = (
            ((latest_score - interviews[0].overall_score) / max(1.0, interviews[0].overall_score)) * 100.0
            if total_interviews >= 2 else 0.0
        )
    else:
        overall_avg = tech_avg = comm_avg = conf_avg = 0.0
        best_score = latest_score = improvement = 0.0

    # Resume-Based interview score proxy
    resume_interviews = [i for i in interviews if "resume" in i.interview_type.lower()]
    resume_score = (
        round(sum(i.overall_score for i in resume_interviews) / len(resume_interviews), 1)
        if resume_interviews else 0.0
    )

    # Readiness score
    readiness = _readiness_score(total_interviews, overall_avg, comm_avg, conf_avg, tech_avg)

    # Progress over time — last 10 interviews
    progress_data = [
        {
            "date": r.created_at.strftime("%b %d"),
            "score": round(r.overall_score, 1),
            "type": r.interview_type,
        }
        for r in interviews[-10:]
    ]

    # Per-type breakdown
    type_map: dict = {}
    for r in interviews:
        t = r.interview_type
        if t not in type_map:
            type_map[t] = {"count": 0, "total": 0.0}
        type_map[t]["count"] += 1
        type_map[t]["total"] += r.overall_score

    interview_type_data = [
        {
            "type": t,
            "count": v["count"],
            "avg_score": round(v["total"] / v["count"], 1),
        }
        for t, v in type_map.items()
    ]

    # Problem solving — derived (tech 70% + overall 30%)
    problem_solving = round(tech_avg * 0.7 + overall_avg * 0.3, 1) if total_interviews > 0 else 0.0

    return {
        "total_interviews": total_interviews,
        "total_practice_sessions": total_practice,
        "average_score": round(overall_avg, 1),
        "best_score": round(best_score, 1),
        "latest_score": round(latest_score, 1),
        "resume_score": resume_score,
        "improvement_percentage": round(improvement, 1),
        "technical_average": round(tech_avg, 1),
        "communication_average": round(comm_avg, 1),
        "confidence_average": round(conf_avg, 1),
        "problem_solving_average": problem_solving,
        "readiness_score": readiness,
        "progress_data": progress_data,
        "interview_type_data": interview_type_data,
        "skill_data": [
            {"skill": "Technical", "score": round(tech_avg, 1)},
            {"skill": "Communication", "score": round(comm_avg, 1)},
            {"skill": "Confidence", "score": round(conf_avg, 1)},
            {"skill": "Problem Solving", "score": problem_solving},
        ],
    }


# ── Recent Activity ───────────────────────────────────────────────────────────

@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Combined chronological activity feed from interviews, practice sessions,
    and resume uploads — most recent first, max 10 items.
    """
    interviews = (
        db.query(MockInterviewHistory)
        .filter(MockInterviewHistory.user_id == current_user.id)
        .order_by(desc(MockInterviewHistory.created_at))
        .limit(5)
        .all()
    )
    sessions = (
        db.query(PracticeSession)
        .filter(PracticeSession.user_id == current_user.id)
        .order_by(desc(PracticeSession.created_at))
        .limit(5)
        .all()
    )
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(desc(Resume.created_at))
        .limit(3)
        .all()
    )

    activities = []

    for item in interviews:
        activities.append({
            "type": "interview",
            "title": item.interview_type,
            "subtitle": f"{item.total_questions} questions • {item.difficulty}",
            "score": round(item.overall_score, 1),
            "created_at": item.created_at.isoformat(),
            "id": item.id,
        })

    for item in sessions:
        q = item.question or ""
        activities.append({
            "type": "practice",
            "title": "Communication Practice",
            "subtitle": (q[:65] + "…") if len(q) > 65 else q,
            "score": round(item.overall_score or 0, 1),
            "created_at": item.created_at.isoformat(),
            "id": item.id,
        })

    for item in resumes:
        activities.append({
            "type": "resume",
            "title": "Resume Uploaded",
            "subtitle": item.filename,
            "score": None,
            "created_at": item.created_at.isoformat(),
            "id": item.id,
        })

    activities.sort(key=lambda x: x["created_at"], reverse=True)
    return activities[:10]


# ── AI Insights ───────────────────────────────────────────────────────────────

@router.get("/insights")
def get_dashboard_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Gemini AI-powered performance insights based on real interview data.
    Falls back to rule-based insights when no Gemini API key is present.
    """
    interviews = (
        db.query(MockInterviewHistory)
        .filter(MockInterviewHistory.user_id == current_user.id)
        .order_by(MockInterviewHistory.created_at.asc())
        .all()
    )

    if not interviews:
        return {
            "insights": [
                "Start your first mock interview to unlock AI-powered coaching insights.",
                "Try different interview types to discover your strengths and growth areas.",
            ],
            "strong_skill": None,
            "weak_skill": None,
            "most_improved": None,
            "recommendations": [
                "Complete your first mock interview to get personalized AI insights.",
                "Try all interview types: HR, Technical, and Resume-Based.",
                "Practice daily for at least 15 minutes for consistent improvement.",
                "Use the Voice Interview feature to improve verbal delivery.",
            ],
        }

    total = len(interviews)
    overall_avg = sum(i.overall_score for i in interviews) / total
    tech_avg = sum(i.technical_score for i in interviews) / total
    comm_avg = sum(i.communication_score for i in interviews) / total
    conf_avg = sum(i.confidence_score for i in interviews) / total
    best = max(i.overall_score for i in interviews)

    type_map: dict = {}
    for r in interviews:
        t = r.interview_type
        if t not in type_map:
            type_map[t] = []
        type_map[t].append(r.overall_score)
    type_avgs = {t: round(sum(v) / len(v), 1) for t, v in type_map.items()}

    stats_for_ai = {
        "total_interviews": total,
        "overall_avg": round(overall_avg, 1),
        "technical_avg": round(tech_avg, 1),
        "communication_avg": round(comm_avg, 1),
        "confidence_avg": round(conf_avg, 1),
        "best_score": round(best, 1),
        "interview_type_averages": type_avgs,
    }

    return generate_gemini_dashboard_insights(stats_for_ai)

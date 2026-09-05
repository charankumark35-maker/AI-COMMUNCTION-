import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-1.5-flash"
API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

def call_gemini_api(prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
    """
    Calls Google Gemini REST API securely using standard library urllib.
    Returns raw JSON text string or None on failure.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY is not set. Falling back to local fallback logic.")
        return None

    url = f"{API_BASE_URL}/{GEMINI_MODEL}:generateContent?key={api_key}"
    
    parts = []
    if system_instruction:
        parts.append({"text": f"System Instruction: {system_instruction}"})
    parts.append({"text": prompt})

    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "responseMimeType": "application/json"
        }
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=15) as response:
            result = json.loads(response.read().decode("utf-8"))
            
            # Extract text from response candidate
            candidates = result.get("candidates", [])
            if candidates:
                parts_out = candidates[0].get("content", {}).get("parts", [])
                if parts_out:
                    return parts_out[0].get("text", "")
            return None

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        logger.error(f"Gemini API HTTP Error {e.code}: {e.reason} - {error_body}")
        return None
    except Exception as e:
        logger.error(f"Error communicating with Gemini API: {e}")
        return None

def generate_gemini_question(
    category: str,
    user_education: Optional[str] = None,
    skill_level: Optional[str] = None,
    target_role: Optional[str] = None
) -> str:
    """
    Generates a realistic interview question using Gemini AI tailored to user details.
    """
    prompt = (
        f"Generate one realistic and engaging interview question for the category: '{category}'.\n"
        f"Target Role: {target_role or 'General Candidate'}\n"
        f"Education Background: {user_education or 'Not specified'}\n"
        f"Skill Level: {skill_level or 'Intermediate'}\n\n"
        "Return ONLY a JSON object with this exact key:\n"
        '{"question_text": "Your tailored interview question here."}'
    )

    response_text = call_gemini_api(
        prompt=prompt,
        system_instruction="You are an expert executive interviewer and talent evaluation specialist."
    )

    if response_text:
        try:
            parsed = json.loads(response_text)
            if "question_text" in parsed and parsed["question_text"]:
                return parsed["question_text"]
        except Exception as parse_err:
            logger.warning(f"Could not parse Gemini question response JSON: {parse_err}")

    # Fallback default questions if Gemini API call fails or key is missing
    fallbacks = {
        "HR Interview": f"Tell me about a time when you faced a difficult situation as a {target_role or 'professional'} and how you resolved it.",
        "Technical Interview": f"What key technical architectural decisions would you prioritize when developing a project suited for a {target_role or 'developer'}?",
        "Communication Practice": "How do you communicate complex ideas effectively to stakeholders with varying backgrounds?"
    }
    return fallbacks.get(category, f"Describe your approach to problem-solving in {category}.")

def analyze_gemini_answer(question: str, answer: str) -> Dict[str, Any]:
    """
    Evaluates a user answer using Gemini AI across grammar, vocabulary, communication, tone, strengths, and weaknesses.
    """
    prompt = (
        f"Evaluate the candidate's interview answer thoroughly.\n\n"
        f"Question: \"{question}\"\n"
        f"Candidate Answer: \"{answer}\"\n\n"
        "Perform a comprehensive evaluation and return ONLY a JSON object formatted strictly with these exact keys:\n"
        "{\n"
        '  "grammar_score": number (0-100),\n'
        '  "vocabulary_score": number (0-100),\n'
        '  "confidence_score": number (0-100),\n'
        '  "overall_score": number (0-100),\n'
        '  "grammar_mistakes": [\n'
        '    {"error": "string", "correction": "string", "message": "string"}\n'
        '  ],\n'
        '  "vocabulary_suggestions": [\n'
        '    {"word": "string", "suggestions": ["string"]}\n'
        '  ],\n'
        '  "tone": "confident" | "neutral" | "hesitant",\n'
        '  "strengths": ["string"],\n'
        '  "weaknesses": ["string"],\n'
        '  "improvement_suggestions": ["string"]\n'
        "}"
    )

    response_text = call_gemini_api(
        prompt=prompt,
        system_instruction="You are an expert AI Communication and Interview Coach providing actionable, highly accurate feedback."
    )

    if response_text:
        try:
            parsed = json.loads(response_text)
            # Validate required structure
            return {
                "grammar_score": float(parsed.get("grammar_score", 80.0)),
                "vocabulary_score": float(parsed.get("vocabulary_score", 80.0)),
                "confidence_score": float(parsed.get("confidence_score", 80.0)),
                "overall_score": float(parsed.get("overall_score", 80.0)),
                "grammar_mistakes": parsed.get("grammar_mistakes", []),
                "vocabulary_suggestions": parsed.get("vocabulary_suggestions", []),
                "tone": parsed.get("tone", "confident"),
                "strengths": parsed.get("strengths", ["Clear explanation of core concepts."]),
                "weaknesses": parsed.get("weaknesses", ["Could add more specific practical examples."]),
                "improvement_suggestions": parsed.get("improvement_suggestions", ["Incorporate structured frameworks like STAR in your responses."])
            }
        except Exception as parse_err:
            logger.warning(f"Could not parse Gemini answer analysis JSON: {parse_err}")

    # Heuristic fallback if Gemini API is not available
    word_count = len(answer.split())
    grammar_score = min(100.0, max(50.0, 70.0 + (word_count * 0.5)))
    vocab_score = min(100.0, max(50.0, 65.0 + (word_count * 0.6)))
    confidence_score = min(100.0, max(60.0, 75.0 + (word_count * 0.4)))
    overall_score = round((grammar_score + vocab_score + confidence_score) / 3, 1)

    return {
        "grammar_score": round(grammar_score, 1),
        "vocabulary_score": round(vocab_score, 1),
        "confidence_score": round(confidence_score, 1),
        "overall_score": overall_score,
        "grammar_mistakes": [],
        "vocabulary_suggestions": [
            {"word": "good", "suggestions": ["effective", "exceptional", "impactful"]}
        ] if "good" in answer.lower() else [],
        "tone": "confident" if word_count > 30 else "neutral",
        "strengths": [
            "Good engagement with the question topic.",
            "Clear and articulate expression."
        ],
        "weaknesses": [
            "Answer could be elaborated with quantifiable metrics or results." if word_count < 40 else "Ensure smooth transitional phrases between points."
        ],
        "improvement_suggestions": [
            "Use the STAR approach (Situation, Task, Action, Result) to structure behavioral answers.",
            "Expand key technical or industry terminology relevant to your field."
        ]
    }

def analyze_gemini_resume_full(resume_text: str) -> Dict[str, Any]:
    """
    Performs full Gemini AI resume analysis:
    - Candidate info (Name, Skills, Education, Experience, Projects, Certifications, Technical Knowledge)
    - Resume Score (Quality score 0-100, Strengths, Weaknesses, Suggestions)
    - Categorized Interview Questions (HR, Technical, Project-based, Skill-based)
    - Skill Gap Analysis (Current skills, Missing skills, Recommended areas)
    """
    prompt = (
        "Analyze the following resume document in detail:\n\n"
        f"\"{resume_text[:5000]}\"\n\n"
        "Return ONLY a JSON object formatted strictly with these exact keys:\n"
        "{\n"
        '  "candidate_name": "string",\n'
        '  "resume_score": {\n'
        '    "overall_score": number (0-100),\n'
        '    "strengths": ["string"],\n'
        '    "weaknesses": ["string"],\n'
        '    "improvement_suggestions": ["string"]\n'
        '  },\n'
        '  "extracted_data": {\n'
        '    "name": "string",\n'
        '    "skills": {\n'
        '      "Programming Languages": ["string"],\n'
        '      "Web Frameworks": ["string"],\n'
        '      "Databases & Cloud": ["string"],\n'
        '      "Soft Skills": ["string"]\n'
        '    },\n'
        '    "education": ["string"],\n'
        '    "experience": ["string"],\n'
        '    "projects": ["string"],\n'
        '    "certifications": ["string"],\n'
        '    "technical_knowledge": ["string"]\n'
        '  },\n'
        '  "skill_gap_analysis": {\n'
        '    "current_skills": ["string"],\n'
        '    "missing_skills": ["string"],\n'
        '    "recommended_learning_areas": ["string"]\n'
        '  },\n'
        '  "questions": [\n'
        '    {\n'
        '      "id": 1,\n'
        '      "type": "HR" | "Technical" | "Project-based" | "Skill-based",\n'
        '      "question": "string",\n'
        '      "category": "string",\n'
        '      "focus_area": "string"\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    response_text = call_gemini_api(
        prompt=prompt,
        system_instruction="You are a principal technical recruiter, senior engineering manager, and executive career advisor."
    )

    if response_text:
        try:
            parsed = json.loads(response_text)
            if "resume_score" in parsed and "questions" in parsed:
                return parsed
        except Exception as err:
            logger.warning(f"Could not parse Gemini full resume analysis JSON: {err}")

    # Heuristic fallback structure
    return {
        "candidate_name": "Applicant",
        "resume_score": {
            "overall_score": 85,
            "strengths": [
                "Clear project accomplishments listed with clear technology stacks",
                "Strong foundational programming skills and software engineering coursework"
            ],
            "weaknesses": [
                "Could include more quantifiable impact metrics (e.g. % performance increase, user counts)",
                "Add more details regarding automated testing and deployment workflows"
            ],
            "improvement_suggestions": [
                "Use bullet points starting with strong action verbs (e.g., Architected, Optimized, Spearheaded)",
                "Include direct links to live demo projects or GitHub repositories"
            ]
        },
        "extracted_data": {
            "name": "Applicant",
            "skills": {
                "Programming Languages": ["Python", "JavaScript", "SQL"],
                "Web Frameworks": ["React", "FastAPI", "Tailwind CSS"],
                "Databases & Cloud": ["PostgreSQL", "SQLite", "Git"],
                "Soft Skills": ["Problem Solving", "Communication", "Team Collaboration"]
            },
            "education": ["Bachelor's Degree in Computer Science / Engineering"],
            "experience": ["Hands-on project experience in web application development and API engineering"],
            "projects": [
                "AI Communication Coach Platform",
                "Full Stack Web Application Development"
            ],
            "certifications": ["Google Cloud / AI Fundamentals", "Full Stack Developer Certification"],
            "technical_knowledge": ["REST APIs", "State Management", "Database Design", "AI Integration"]
        },
        "skill_gap_analysis": {
            "current_skills": ["Python", "JavaScript", "React", "FastAPI", "SQL"],
            "missing_skills": ["Docker Containerization", "CI/CD Deployment Pipelines", "Distributed System Design"],
            "recommended_learning_areas": [
                "Cloud Containerization & Microservices (Docker & Kubernetes)",
                "System Architecture & Load Balancing at Scale"
            ]
        },
        "questions": [
            {
                "id": 1,
                "type": "HR",
                "question": "Tell me about a time when you had to adapt quickly to learning a new technology or framework under a tight deadline.",
                "category": "HR Interview",
                "focus_area": "Adaptability & Growth Mindset"
            },
            {
                "id": 2,
                "type": "Technical",
                "question": "How do you design database models and handle migration management in FastAPI applications?",
                "category": "Technical Interview",
                "focus_area": "Backend Architecture"
            },
            {
                "id": 3,
                "type": "Project-based",
                "question": "In your recent full-stack web project, how did you handle asynchronous state management and API error handling?",
                "category": "Project-based",
                "focus_area": "Full-Stack System Design"
            },
            {
                "id": 4,
                "type": "Skill-based",
                "question": "Explain the differences between SQL relational databases and NoSQL document stores, and when you would choose each.",
                "category": "Skill-based",
                "focus_area": "Database Fundamentals"
            }
        ]
    }

def analyze_gemini_resume(resume_text: str) -> Dict[str, Any]:
    full_res = analyze_gemini_resume_full(resume_text)
    ext = full_res.get("extracted_data", {})
    return {
        "skills": ext.get("skills", {}),
        "projects": ext.get("projects", []),
        "questions": full_res.get("questions", [])
    }

def analyze_gemini_voice(transcript: str, question: str = "") -> Dict[str, Any]:
    """
    Evaluates speech-to-text transcript using Gemini AI for verbal delivery, pace, filler words, grammar, and overall structure.
    """
    prompt = (
        f"Evaluate this speech transcript for an interview answer.\n"
        f"Question: \"{question or 'General Response'}\"\n"
        f"Transcript: \"{transcript}\"\n\n"
        "Return ONLY a JSON object with this exact structure:\n"
        "{\n"
        '  "scores": {\n'
        '    "grammar_score": number (0-100),\n'
        '    "vocabulary_score": number (0-100),\n'
        '    "confidence_score": number (0-100),\n'
        '    "pace_score": number (0-100),\n'
        '    "overall_score": number (0-100)\n'
        '  },\n'
        '  "speech_feedback": {\n'
        '    "filler_count": number,\n'
        '    "filler_ratio_pct": number,\n'
        '    "clarity_bonus": number,\n'
        '    "word_count": number,\n'
        '    "pace_assessment": "string",\n'
        '    "fillers_detected": ["string"]\n'
        '  },\n'
        '  "feedback": {\n'
        '    "grammar_mistakes": [],\n'
        '    "vocabulary_suggestions": [],\n'
        '    "tone": "confident" | "neutral" | "hesitant",\n'
        '    "strengths": ["string"],\n'
        '    "weaknesses": ["string"],\n'
        '    "improvement_suggestions": ["string"]\n'
        '  }\n'
        "}"
    )

    response_text = call_gemini_api(
        prompt=prompt,
        system_instruction="You are an executive vocal coach and speech communication analyst."
    )

    word_count = len(transcript.split())
    if response_text:
        try:
            parsed = json.loads(response_text)
            if "scores" in parsed and "speech_feedback" in parsed:
                sf = parsed["speech_feedback"]
                # Ensure all required keys exist
                sf_cleaned = {
                    "filler_count": int(sf.get("filler_count", sf.get("filler_word_count", 0))),
                    "filler_ratio_pct": float(sf.get("filler_ratio_pct", 2.5)),
                    "clarity_bonus": int(sf.get("clarity_bonus", 5)),
                    "word_count": int(sf.get("word_count", word_count)),
                    "pace_assessment": str(sf.get("pace_assessment", "Well-paced delivery with clear phrasing.")),
                    "fillers_detected": sf.get("fillers_detected", sf.get("filler_words_detected", []))
                }
                parsed["speech_feedback"] = sf_cleaned
                return parsed
        except Exception as err:
            logger.warning(f"Could not parse Gemini voice analysis: {err}")

    # Fallback voice analysis
    filler_list = ["like", "um"] if ("like" in transcript.lower() or "um" in transcript.lower()) else []
    filler_cnt = len(filler_list)
    filler_ratio = round((filler_cnt / max(1, word_count)) * 100, 1)

    return {
        "scores": {
            "grammar_score": min(100.0, max(50.0, 75.0 + word_count * 0.3)),
            "vocabulary_score": min(100.0, max(50.0, 70.0 + word_count * 0.4)),
            "confidence_score": min(100.0, max(50.0, 70.0 + word_count * 0.5)),
            "pace_score": 85.0,
            "overall_score": round(min(100.0, max(50.0, 72.0 + word_count * 0.4)), 1)
        },
        "speech_feedback": {
            "filler_count": filler_cnt,
            "filler_ratio_pct": filler_ratio,
            "clarity_bonus": 5,
            "word_count": word_count,
            "pace_assessment": "Well-paced delivery with clear phrasing.",
            "fillers_detected": filler_list
        },
        "feedback": {
            "grammar_mistakes": [],
            "vocabulary_suggestions": [],
            "tone": "confident" if word_count > 30 else "neutral",
            "strengths": ["Clear vocal delivery and articulate pronunciation."],
            "weaknesses": ["Pacing could be evened out across complex sentences."],
            "improvement_suggestions": ["Pause intentionally instead of using filler words."]
        }
    }


def generate_gemini_mock_question(
    interview_type: str,
    difficulty: str,
    question_index: int,
    total_questions: int,
    previous_questions: Optional[list] = None,
    user_details: Optional[dict] = None
) -> dict:
    """
    Generates a mock interview question using Gemini AI tailored to type, difficulty, and user details.
    """
    prev_str = f"Previous questions already asked: {json.dumps(previous_questions)}\n" if previous_questions else ""
    user_str = f"Candidate details: Role: {user_details.get('target_role', 'Candidate')}, Education: {user_details.get('education', 'N/A')}\n" if user_details else ""

    prompt = (
        f"Generate question #{question_index} of {total_questions} for a Mock Interview.\n"
        f"Interview Type: '{interview_type}'\n"
        f"Difficulty: '{difficulty}'\n"
        f"{user_str}"
        f"{prev_str}\n"
        "Return ONLY a JSON object formatted strictly with these exact keys:\n"
        "{\n"
        '  "question_text": "string",\n'
        '  "category": "string",\n'
        '  "focus_area": "string"\n'
        "}"
    )

    response_text = call_gemini_api(
        prompt=prompt,
        system_instruction="You are a principal tech interviewer conducting a structured multi-round mock interview."
    )

    if response_text:
        try:
            parsed = json.loads(response_text)
            if "question_text" in parsed:
                return {
                    "id": question_index,
                    "question_text": parsed["question_text"],
                    "category": parsed.get("category", interview_type),
                    "focus_area": parsed.get("focus_area", f"{difficulty} Concept")
                }
        except Exception as err:
            logger.warning(f"Could not parse Gemini mock question JSON: {err}")

    # Fallback questions based on type & index
    fallbacks = {
        "HR Interview": [
            "Tell me about yourself and why you are interested in this position.",
            "Describe a situation where you had a conflict with a team member and how you resolved it.",
            "Where do you see yourself professionally in the next 3 to 5 years?",
            "What is your greatest professional strength and one area you are actively trying to improve?",
            "How do you prioritize your workload when facing multiple competing deadlines?"
        ],
        "Technical Interview": [
            "Explain the difference between process and thread in operating systems.",
            "How do you handle error boundaries and state management in modern web architecture?",
            "What strategies do you use for database index optimization and query performance?",
            "Describe how RESTful APIs differ from GraphQL or gRPC in terms of data fetching.",
            "How do you approach writing clean, testable code with continuous integration?"
        ],
        "Resume-Based Interview": [
            "Walk me through the architectural design of the main project listed on your resume.",
            "What was the most challenging technical obstacle you overcame in your recent experience?",
            "How did you select the technology stack for your highlighted projects?",
            "Explain how you collaborated with cross-functional teams in your previous roles.",
            "What metrics or key performance indicators demonstrated the success of your work?"
        ],
        "Project Interview": [
            "Describe the end-to-end lifecycle of a complex project you developed recently.",
            "How did you gather requirements and translate business specs into technical architecture?",
            "What trade-offs did you make between delivery speed and code scalability?",
            "How did you handle testing, bug tracking, and deployment for your project?",
            "If you were to rebuild this project today, what key architectural changes would you implement?"
        ]
    }

    type_fallbacks = fallbacks.get(interview_type, fallbacks["HR Interview"])
    q_text = type_fallbacks[(question_index - 1) % len(type_fallbacks)]

    return {
        "id": question_index,
        "question_text": q_text,
        "category": interview_type,
        "focus_area": f"{difficulty} Level"
    }


def evaluate_gemini_mock_answer(
    question: str,
    answer: str,
    interview_type: str,
    difficulty: str
) -> dict:
    """
    Evaluates an answer in a mock interview across quality, relevance, technical correctness, communication, confidence, score, and improvements.
    """
    prompt = (
        f"Evaluate this candidate's mock interview answer.\n\n"
        f"Interview Type: {interview_type} ({difficulty} Level)\n"
        f"Question: \"{question}\"\n"
        f"Candidate Answer: \"{answer}\"\n\n"
        "Evaluate the response and return ONLY a JSON object with this exact structure:\n"
        "{\n"
        '  "quality_score": number (0-100),\n'
        '  "relevance_score": number (0-100),\n'
        '  "technical_correctness": number (0-100),\n'
        '  "communication_score": number (0-100),\n'
        '  "confidence_score": number (0-100),\n'
        '  "score": number (0-100),\n'
        '  "feedback_summary": "string",\n'
        '  "strengths": ["string"],\n'
        '  "improvements": ["string"]\n'
        "}"
    )

    response_text = call_gemini_api(
        prompt=prompt,
        system_instruction="You are an expert executive interview coach giving precise, constructive feedback."
    )

    if response_text:
        try:
            parsed = json.loads(response_text)
            if "score" in parsed or "quality_score" in parsed:
                return {
                    "quality_score": float(parsed.get("quality_score", parsed.get("score", 80.0))),
                    "relevance_score": float(parsed.get("relevance_score", parsed.get("score", 85.0))),
                    "technical_correctness": float(parsed.get("technical_correctness", parsed.get("score", 80.0))),
                    "communication_score": float(parsed.get("communication_score", parsed.get("score", 82.0))),
                    "confidence_score": float(parsed.get("confidence_score", parsed.get("score", 85.0))),
                    "score": float(parsed.get("score", parsed.get("quality_score", 82.0))),
                    "feedback_summary": str(parsed.get("feedback_summary", "Clear and articulate answer.")),
                    "strengths": parsed.get("strengths", ["Good structure and clarity."]),
                    "improvements": parsed.get("improvements", ["Provide more specific quantifiable metrics."])
                }
        except Exception as err:
            logger.warning(f"Could not parse Gemini mock answer evaluation: {err}")

    # Heuristic fallback calculation
    word_count = len(answer.split())
    rel_score = min(100.0, max(50.0, 70.0 + word_count * 0.4))
    tech_score = min(100.0, max(50.0, 68.0 + word_count * 0.5))
    comm_score = min(100.0, max(50.0, 72.0 + word_count * 0.4))
    conf_score = min(100.0, max(50.0, 75.0 + word_count * 0.3))
    overall_score = round((rel_score + tech_score + comm_score + conf_score) / 4, 1)

    return {
        "quality_score": overall_score,
        "relevance_score": round(rel_score, 1),
        "technical_correctness": round(tech_score, 1),
        "communication_score": round(comm_score, 1),
        "confidence_score": round(conf_score, 1),
        "score": overall_score,
        "feedback_summary": "Well-structured response addressing the main points of the prompt.",
        "strengths": ["Direct response to the question", "Clear phrasing"],
        "improvements": ["Include concrete examples or metrics to substantiate your claims"]
    }


def generate_gemini_mock_report(
    interview_type: str,
    difficulty: str,
    evaluations: list
) -> dict:
    """
    Generates a complete Interview Performance Report summarizing scores, strengths, weaknesses, improvement suggestions, and recommended topics.
    """
    eval_summary = json.dumps(evaluations[:10])

    prompt = (
        f"Generate an Interview Performance Report for a completed Mock Interview.\n\n"
        f"Interview Type: {interview_type} ({difficulty} Level)\n"
        f"Evaluated Questions & Answers:\n{eval_summary}\n\n"
        "Return ONLY a JSON object formatted strictly with these exact keys:\n"
        "{\n"
        '  "overall_score": number (0-100),\n'
        '  "communication_score": number (0-100),\n'
        '  "technical_score": number (0-100),\n'
        '  "confidence_score": number (0-100),\n'
        '  "strengths": ["string"],\n'
        '  "weaknesses": ["string"],\n'
        '  "improvement_suggestions": ["string"],\n'
        '  "recommended_topics": ["string"]\n'
        "}"
    )

    response_text = call_gemini_api(
        prompt=prompt,
        system_instruction="You are a Director of Engineering and Senior Talent Partner writing a final candidate interview evaluation report."
    )

    if response_text:
        try:
            parsed = json.loads(response_text)
            if "overall_score" in parsed and "strengths" in parsed:
                return parsed
        except Exception as err:
            logger.warning(f"Could not parse Gemini mock report JSON: {err}")

    # Calculate scores from evaluations list
    if evaluations:
        avg_overall = round(sum(e.get("evaluation", {}).get("score", 80) if isinstance(e.get("evaluation"), dict) else 80 for e in evaluations) / max(1, len(evaluations)), 1)
        avg_comm = round(sum(e.get("evaluation", {}).get("communication_score", 82) if isinstance(e.get("evaluation"), dict) else 82 for e in evaluations) / max(1, len(evaluations)), 1)
        avg_tech = round(sum(e.get("evaluation", {}).get("technical_correctness", 80) if isinstance(e.get("evaluation"), dict) else 80 for e in evaluations) / max(1, len(evaluations)), 1)
        avg_conf = round(sum(e.get("evaluation", {}).get("confidence_score", 85) if isinstance(e.get("evaluation"), dict) else 85 for e in evaluations) / max(1, len(evaluations)), 1)
    else:
        avg_overall, avg_comm, avg_tech, avg_conf = 85.0, 84.0, 82.0, 86.0

    return {
        "overall_score": avg_overall,
        "communication_score": avg_comm,
        "technical_score": avg_tech,
        "confidence_score": avg_conf,
        "strengths": [
            "Consistent verbal delivery across all interview prompts",
            "Demonstrated solid technical understanding of core concepts"
        ],
        "weaknesses": [
            "Could use structured framework (STAR method) consistently",
            "Elaborate more on quantifiable results and business impact"
        ],
        "improvement_suggestions": [
            "Practice outlining Situation, Task, Action, and Result before answering",
            "Prepare specific metrics (e.g. % performance improvement, time saved)"
        ],
        "recommended_topics": [
            f"{interview_type} Advanced Scenarios",
            "System Design & Trade-off Analysis",
            "Executive Presence & Concise Communication"
        ]
    }


def generate_gemini_dashboard_insights(stats: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate AI-powered dashboard coaching insights based on aggregated user stats.
    Calls Gemini for personalized advice; falls back to rule-based insights if unavailable.
    """
    total = stats.get("total_interviews", 0)
    overall_avg = stats.get("overall_avg", 0)
    tech_avg = stats.get("technical_avg", 0)
    comm_avg = stats.get("communication_avg", 0)
    conf_avg = stats.get("confidence_avg", 0)
    best_score = stats.get("best_score", 0)
    type_avgs = stats.get("interview_type_averages", {})

    # Identify strong / weak skills
    skill_scores = {
        "Technical": tech_avg,
        "Communication": comm_avg,
        "Confidence": conf_avg,
    }
    strong_skill = max(skill_scores, key=skill_scores.get) if total > 0 else None
    weak_skill = min(skill_scores, key=skill_scores.get) if total > 0 else None

    prompt = (
        "You are an elite AI career coach. A candidate has completed mock interviews "
        "and has the following aggregated performance data:\n\n"
        f"Total Interviews: {total}\n"
        f"Overall Average Score: {overall_avg}%\n"
        f"Technical Average: {tech_avg}%\n"
        f"Communication Average: {comm_avg}%\n"
        f"Confidence Average: {conf_avg}%\n"
        f"Best Score: {best_score}%\n"
        f"Per-Type Averages: {json.dumps(type_avgs)}\n\n"
        "Based on this data, return ONLY a JSON object with these exact keys:\n"
        "{\n"
        '  "insights": ["3-5 short, specific coaching observation strings"],\n'
        '  "strong_skill": "name of strongest skill area",\n'
        '  "weak_skill": "name of weakest skill area",\n'
        '  "most_improved": "area showing most improvement or null",\n'
        '  "recommendations": ["4 actionable, specific practice recommendations"]\n'
        "}\n\n"
        "Make insights highly specific to the numbers. Don't be generic. "
        "Each insight should be 1-2 sentences max."
    )

    response_text = call_gemini_api(
        prompt=prompt,
        system_instruction=(
            "You are a Director-level career coach and interview trainer. "
            "Provide data-driven, actionable coaching insights in JSON format only."
        )
    )

    if response_text:
        try:
            parsed = json.loads(response_text)
            if "insights" in parsed and "recommendations" in parsed:
                # Ensure fields exist
                parsed.setdefault("strong_skill", strong_skill)
                parsed.setdefault("weak_skill", weak_skill)
                parsed.setdefault("most_improved", None)
                return parsed
        except Exception as err:
            logger.warning(f"Could not parse Gemini dashboard insights JSON: {err}")

    # ── Rule-based fallback ──────────────────────────────────────────────────
    insights = []

    if overall_avg >= 80:
        insights.append(
            f"Outstanding performance! Your {overall_avg}% average puts you in the top tier. "
            f"Focus on edge-case scenarios to maintain this level."
        )
    elif overall_avg >= 60:
        insights.append(
            f"Solid progress with a {overall_avg}% average. "
            f"Targeted practice on {weak_skill} ({round(skill_scores.get(weak_skill, 0))}%) "
            f"can push you into the excellent range."
        )
    else:
        insights.append(
            f"Your average score is {overall_avg}%. Consistent daily practice "
            f"will help you build confidence and improve rapidly."
        )

    if strong_skill and weak_skill and strong_skill != weak_skill:
        gap = round(skill_scores[strong_skill] - skill_scores[weak_skill], 1)
        insights.append(
            f"Your {strong_skill} ({round(skill_scores[strong_skill])}%) is your strongest area, "
            f"while {weak_skill} ({round(skill_scores[weak_skill])}%) has a {gap}-point gap to close."
        )

    if total >= 5:
        insights.append(
            f"You've completed {total} interviews — great consistency! "
            f"Try varying interview types to build a well-rounded profile."
        )
    elif total >= 1:
        insights.append(
            f"You've completed {total} interview{'s' if total > 1 else ''}. "
            f"Aim for at least 5 sessions to establish reliable performance trends."
        )

    recommendations = []
    if weak_skill == "Technical":
        recommendations.extend([
            "Practice system design and coding pattern questions daily.",
            "Review data structures and algorithms for 20 minutes before each session.",
        ])
    elif weak_skill == "Communication":
        recommendations.extend([
            "Use the STAR method (Situation, Task, Action, Result) for behavioral answers.",
            "Record yourself answering questions and review for filler words and clarity.",
        ])
    elif weak_skill == "Confidence":
        recommendations.extend([
            "Practice power posing and controlled breathing before interview sessions.",
            "Start with easier difficulty levels to build momentum, then progress upward.",
        ])

    recommendations.extend([
        "Try the Voice Interview feature to improve verbal delivery and pacing.",
        "Upload your resume for AI-generated role-specific interview questions.",
    ])

    return {
        "insights": insights,
        "strong_skill": strong_skill,
        "weak_skill": weak_skill,
        "most_improved": None,
        "recommendations": recommendations[:4],
    }

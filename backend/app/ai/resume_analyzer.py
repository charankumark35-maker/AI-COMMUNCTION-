"""
resume_analyzer.py
──────────────────
Extracts skills, projects, and key information from resume text,
then generates personalised interview questions based on the findings.

Ready to be upgraded with spaCy / HuggingFace NER models.
"""

import re
import random

# ── Skill Taxonomy ────────────────────────────────────────────────────────────
SKILL_TAXONOMY = {
    "Programming Languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go",
        "rust", "swift", "kotlin", "php", "ruby", "scala", "r",
    ],
    "Web Frameworks": [
        "react", "nextjs", "next.js", "vue", "angular", "svelte",
        "fastapi", "django", "flask", "express", "nestjs", "spring boot",
    ],
    "Databases": [
        "postgresql", "mysql", "mongodb", "redis", "sqlite", "cassandra",
        "dynamodb", "firebase", "supabase", "elasticsearch",
    ],
    "Cloud & DevOps": [
        "aws", "gcp", "azure", "docker", "kubernetes", "terraform",
        "ci/cd", "github actions", "jenkins", "ansible",
    ],
    "AI & Data": [
        "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
        "scikit-learn", "pandas", "numpy", "opencv", "huggingface",
        "langchain", "openai",
    ],
    "Soft Skills": [
        "leadership", "communication", "teamwork", "problem solving",
        "project management", "agile", "scrum", "critical thinking",
    ],
}

# ── Question Templates ────────────────────────────────────────────────────────
SKILL_QUESTION_TEMPLATES = [
    "Can you describe a project where you used {skill} and the challenges you faced?",
    "How proficient are you with {skill}, and how have you applied it professionally?",
    "Walk me through a complex problem you solved using {skill}.",
    "What best practices do you follow when working with {skill}?",
    "How do you stay updated with the latest developments in {skill}?",
]

PROJECT_QUESTION_TEMPLATES = [
    'Tell me more about your project "{project}". What was your role?',
    'What was the biggest technical challenge in "{project}" and how did you overcome it?',
    'How did you ensure the quality and scalability of "{project}"?',
    'What would you do differently if you were to rebuild "{project}" today?',
    'How did "{project}" impact the end users or business outcomes?',
]

GENERAL_RESUME_QUESTIONS = [
    "Walk me through your resume and highlight the experience most relevant to this role.",
    "Which of your past projects are you most proud of and why?",
    "Describe a situation where you had to learn a new technology quickly.",
    "How do you prioritize tasks when working on multiple projects simultaneously?",
    "Tell me about a time when you disagreed with a team decision and how you handled it.",
]


def extract_skills(text: str) -> dict:
    """Match resume text against skill taxonomy. Returns categorized skills."""
    text_lower = text.lower()
    found = {}
    for category, skills in SKILL_TAXONOMY.items():
        matched = [s for s in skills if re.search(rf"\b{re.escape(s)}\b", text_lower)]
        if matched:
            found[category] = matched
    return found


def extract_projects(text: str) -> list:
    """
    Heuristic project detection using common resume section headers.
    Returns a list of detected project names/descriptions.
    """
    projects = []

    # Look for PROJECT section blocks
    project_section = re.search(
        r"(projects?|personal projects?|key projects?)(.*?)(experience|education|skills|certifications|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if project_section:
        block = project_section.group(2)
        # Extract lines that look like project titles (capitalised, short)
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        for line in lines[:6]:          # cap at 6 projects
            if 5 < len(line) < 80 and not line.lower().startswith(("•", "-", "*")):
                projects.append(line)

    # Fallback: look for "Project:" or "• ProjectName –" patterns
    if not projects:
        matches = re.findall(r"(?:project[:\s]+|•\s+)([A-Z][^\n]{4,60})", text)
        projects = matches[:4]

    return projects[:5]  # at most 5


def generate_resume_questions(skills: dict, projects: list) -> list:
    """Generate personalised interview questions from extracted resume content."""
    questions = []

    # Skill-based questions (up to 2 per category, max 6 total)
    for category, skill_list in skills.items():
        for skill in skill_list[:2]:
            template = random.choice(SKILL_QUESTION_TEMPLATES)
            questions.append({
                "type": "skill",
                "category": category,
                "skill": skill,
                "question": template.format(skill=skill.title()),
            })
        if len(questions) >= 6:
            break

    # Project-based questions (up to 3)
    for project in projects[:3]:
        template = random.choice(PROJECT_QUESTION_TEMPLATES)
        questions.append({
            "type": "project",
            "category": "Project Discussion",
            "skill": project,
            "question": template.format(project=project),
        })

    # Always add 2 general questions
    for q in random.sample(GENERAL_RESUME_QUESTIONS, min(2, len(GENERAL_RESUME_QUESTIONS))):
        questions.append({
            "type": "general",
            "category": "General",
            "skill": None,
            "question": q,
        })

    random.shuffle(questions)
    return questions

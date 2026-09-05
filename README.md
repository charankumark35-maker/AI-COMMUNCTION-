# AI Communication Coach

An AI-powered web application that helps users improve their communication skills through mock interviews and resume analysis. It provides personalized feedback using Gemini AI.

## Features

- **Voice Interview**: Conduct mock interviews with AI-generated voice and questions.
- **Resume Analysis**: Upload your resume to get insights and tailored interview preparation.
- **Personalized Feedback**: Detailed feedback on your responses and communication style.
- **Authentication**: Secure user login and registration.
- **Dashboard**: Track your progress and past interview sessions.

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: FastAPI (Python), SQLite
- **AI Integration**: Google Gemini AI
- **Authentication**: JWT based auth

## Installation Steps

1. Clone the repository
```bash
git clone <your-repository-url>
cd AI-Communication-Coach
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd ../backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Unix: source venv/bin/activate
pip install -r requirements.txt
```

## Environment Setup

1. Backend: Create a `.env` file in the `backend` directory based on `.env.example`
```env
DATABASE_URL=sqlite:///./aicoach.db
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:5173
ENVIRONMENT=development
GEMINI_API_KEY=your_gemini_api_key_here
```

2. Frontend: Create a `.env` file in the `frontend` directory
```env
VITE_API_URL=http://localhost:8000
```

## Running Instructions

### Run Backend Server
```bash
cd backend
# Make sure your virtual environment is activated
uvicorn app.main:app --reload
```

### Run Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend API will run on `http://localhost:8000`.

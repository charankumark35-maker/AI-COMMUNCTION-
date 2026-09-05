from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database.session import engine, Base
from app.routes import auth, interview, analysis, advanced, voice, resume, mock_interview, history, dashboard
from app.config import settings
import logging

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Database ──────────────────────────────────────────────────────────────────
# Import all models so SQLAlchemy registers them before create_all()
import app.models  # noqa: F401
Base.metadata.create_all(bind=engine)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Communication Coach API",
    description=(
        "Full-stack AI platform that helps students and job seekers improve "
        "communication skills, interview skills, grammar, vocabulary, and confidence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# In production, ALLOWED_ORIGINS is set via environment variable
allowed_origins = settings.ALLOWED_ORIGINS.split(",") if settings.ALLOWED_ORIGINS else [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(analysis.router)
app.include_router(advanced.router)
app.include_router(voice.router)
app.include_router(resume.router)
app.include_router(mock_interview.router)
app.include_router(history.router)
app.include_router(dashboard.router)

# ── Health Endpoints ──────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def read_root():
    return {"message": "AI Communication Coach API is running", "version": "1.0.0"}

@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "healthy"}

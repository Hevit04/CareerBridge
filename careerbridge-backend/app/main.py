from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users, assessments, interviews, internships, analytics, admin, notifications
from app.core.database import engine, Base
from app.models.backup import BackupRecord

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerBridge API",
    description="Intelligent Interview Coaching and Internship Matching Platform",
    version="1.0.0",
)

# ✅ FIXED CORS CONFIG FOR PRODUCTION
origins = [
    "https://career-bridge-alpha.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(internships.router, prefix="/api/internships", tags=["Internships"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

# Root
@app.get("/")
def root():
    return {"message": "CareerBridge API is running", "version": "1.0.0"}

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}
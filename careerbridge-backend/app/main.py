from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users, assessments, interviews, internships, analytics, admin, notifications
from app.core.database import engine, Base

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerBridge API",
    description="Intelligent Interview Coaching and Internship Matching Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,         prefix="/api/auth",         tags=["Auth"])
app.include_router(users.router,        prefix="/api/users",        tags=["Users"])
app.include_router(assessments.router,  prefix="/api/assessments",  tags=["Assessments"])
app.include_router(interviews.router,   prefix="/api/interviews",   tags=["Interviews"])
app.include_router(internships.router,  prefix="/api/internships",  tags=["Internships"])
app.include_router(analytics.router,    prefix="/api/analytics",    tags=["Analytics"])
app.include_router(admin.router,        prefix="/api/admin",        tags=["Admin"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


@app.get("/")
def root():
    return {"message": "CareerBridge API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}

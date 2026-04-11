from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
import shutil, os

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's full profile."""
    return current_user


@router.patch("/me", response_model=UserOut)
def update_my_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update editable profile fields."""
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/resume")
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload / replace resume PDF."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    safe_name = f"{current_user.id}_{file.filename}"
    dest = os.path.join(UPLOAD_DIR, safe_name)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    current_user.resume_filename = safe_name
    current_user.resume_uploaded_at = datetime.utcnow()
    db.commit()

    return {
        "message": "Resume uploaded successfully",
        "filename": safe_name,
        "uploaded_at": current_user.resume_uploaded_at,
    }


@router.get("/me/readiness")
def get_readiness_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Compute a simple readiness score from test attempts + interview sessions.
    Formula: average of all attempt percentages, capped at 100.
    """
    from app.models.assessment import TestAttempt
    from app.models.interview import InterviewSession

    attempts = db.query(TestAttempt).filter(TestAttempt.user_id == current_user.id).all()
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).all()

    scores = [a.percentage for a in attempts if a.percentage is not None]
    scores += [s.overall_score for s in sessions if s.overall_score is not None]

    readiness = round(sum(scores) / len(scores), 1) if scores else 0.0
    return {"readiness_score": min(readiness, 100.0)}

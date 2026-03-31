from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.internship import Internship, Application
from app.models.user import User
from app.schemas.internship import InternshipOut, ApplicationCreate, ApplicationOut
from app.services.notification_service import create_notification

router = APIRouter()


def _compute_match(internship: Internship, user: User) -> int:
    """
    Simple skill-overlap match score (0-100).
    Replace with an ML model for production.
    """
    if not user.skills or not internship.tags:
        return internship.base_match

    user_skills = {s.strip().lower() for s in user.skills.split(",")}
    intern_tags = {t.lower() for t in internship.tags}
    overlap = len(user_skills & intern_tags)
    if not intern_tags:
        return internship.base_match

    overlap_pct = min(int(overlap / len(intern_tags) * 100), 100)
    # Blend 60% overlap score + 40% base_match
    return int(overlap_pct * 0.6 + internship.base_match * 0.4)


def _cleanup_expired_internships(db: Session):
    """Delete internships that have passed their deadline (YYYY-MM-DD format)."""
    today = date.today().isoformat()
    # Simple string comparison works for YYYY-MM-DD
    expired = db.query(Internship).filter(
        Internship.deadline < today,
        Internship.deadline.like("____-__-__") # Only target standardized dates
    ).all()
    if expired:
        for i in expired:
            db.delete(i)
        db.commit()


@router.get("/", response_model=List[InternshipOut])
def list_internships(
    domain: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return active internships, filtered by domain if provided, with personalised match scores."""
    _cleanup_expired_internships(db)
    query = db.query(Internship).filter(Internship.is_active == True)
    if domain and domain != "all":
        query = query.filter(Internship.domain == domain)

    internships = query.order_by(Internship.created_at.desc()).all()
    result = []
    for i in internships:
        out = InternshipOut.model_validate(i)
        out.match = _compute_match(i, current_user)
        result.append(out)

    result.sort(key=lambda x: x.match, reverse=True)
    return result


@router.get("/{internship_id}", response_model=InternshipOut)
def get_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    i = db.query(Internship).filter(Internship.id == internship_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Internship not found")
    out = InternshipOut.model_validate(i)
    out.match = _compute_match(i, current_user)
    return out


@router.post("/apply", response_model=ApplicationOut, status_code=201)
def apply_to_internship(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit an application for an internship."""
    internship = db.query(Internship).filter(Internship.id == payload.internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    # Check duplicate application
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.internship_id == payload.internship_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this internship")

    match_score = _compute_match(internship, current_user)
    app = Application(
        user_id=current_user.id,
        internship_id=payload.internship_id,
        match_score=match_score,
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    # Trigger notification
    create_notification(
        db=db,
        user_id=current_user.id,
        type="application",
        title="Application Submitted",
        message=f"You have successfully applied for the {internship.role} position at {internship.company}.",
        link="/dashboard"
    )

    return app


@router.get("/applications/me", response_model=List[ApplicationOut])
def my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all applications submitted by the logged-in student."""
    return (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )

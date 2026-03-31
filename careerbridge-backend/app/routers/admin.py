from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.models.assessment import Test, Question, TestAttempt
from app.models.interview import InterviewSession
from app.models.internship import Internship, Application
from app.schemas.user import UserOut, AdminUserAction
from app.schemas.assessment import TestCreate, TestUpdate, TestOut, QuestionCreate, QuestionOut
from app.schemas.internship import InternshipCreate, InternshipUpdate, InternshipOut
from app.services.notification_service import notify_all_students

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# USER MANAGEMENT  (/api/admin/users)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/users", response_model=List[dict])
def list_users(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """Return all registered users with activity info."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        last_seen_str = "Never"
        if u.last_seen:
            from datetime import datetime, timezone
            delta = datetime.utcnow() - u.last_seen
            if delta.seconds < 3600:
                last_seen_str = f"{delta.seconds // 60}m ago"
            elif delta.days == 0:
                last_seen_str = f"{delta.seconds // 3600}h ago"
            else:
                last_seen_str = f"{delta.days}d ago"

        result.append({
            "id":            u.id,
            "name":          f"{u.first_name} {u.last_name}",
            "enrollment_no": u.enrollment_no,
            "email":         u.email,
            "role":          u.role,
            "status":        "Active" if u.is_active else "Blocked",
            "is_active":     u.is_active,
            "last_seen":     last_seen_str,
            "created_at":    u.created_at.isoformat(),
        })
    return result


@router.post("/users/{user_id}/action")
def user_action(
    user_id: int,
    payload: AdminUserAction,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """Block, unblock, or trigger a password reset for a student."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.action == "block":
        user.is_active = False
        db.commit()
        return {"message": f"{user.first_name} {user.last_name} has been blocked"}

    elif payload.action == "unblock":
        user.is_active = True
        db.commit()
        return {"message": f"{user.first_name} {user.last_name} has been unblocked"}

    elif payload.action == "reset_password":
        # In production: generate token and email the user
        return {"message": f"Password reset email sent to {user.email}"}

    raise HTTPException(status_code=400, detail="Unknown action")


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
# TEST MANAGEMENT  (/api/admin/tests)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/tests", response_model=List[TestOut])
def admin_list_tests(db: Session = Depends(get_db), admin=Depends(require_admin)):
    return db.query(Test).order_by(Test.created_at.desc()).all()


@router.post("/tests", response_model=TestOut, status_code=201)
def create_test(
    payload: TestCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    count = db.query(Test).count()
    test = Test(
        test_id=f"T-{1000 + count + 1}",
        title=payload.title,
        type=payload.type,
        total_questions=payload.total_questions,
        duration_secs=payload.duration_secs,
        points_per_question=payload.points_per_question,
        cadence=payload.cadence,
        status=payload.status,
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return test


@router.patch("/tests/{test_id}", response_model=TestOut)
def update_test(
    test_id: int,
    payload: TestUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(test, field, value)
    db.commit()
    db.refresh(test)
    return test


@router.delete("/tests/{test_id}", status_code=204)
def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    db.delete(test)
    db.commit()


# ── Question bank management ──────────────────────────────────────────────────

@router.post("/tests/{test_id}/questions", response_model=QuestionOut, status_code=201)
def add_question(
    test_id: int,
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    q = Question(test_id=test_id, **payload.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.get("/tests/{test_id}/questions", response_model=List[QuestionOut])
def list_questions(
    test_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return db.query(Question).filter(Question.test_id == test_id).order_by(Question.order).all()


@router.delete("/tests/{test_id}/questions/{q_id}", status_code=204)
def delete_question(
    test_id: int,
    q_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    q = db.query(Question).filter(Question.id == q_id, Question.test_id == test_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()


@router.patch("/tests/{test_id}/questions/{q_id}", response_model=QuestionOut)
def update_question(
    test_id: int,
    q_id: int,
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    q = db.query(Question).filter(Question.id == q_id, Question.test_id == test_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for field, value in payload.model_dump().items():
        setattr(q, field, value)
    
    db.commit()
    db.refresh(q)
    return q


# ══════════════════════════════════════════════════════════════════════════════
# INTERNSHIP MANAGEMENT  (/api/admin/internships)
# ══════════════════════════════════════════════════════════════════════════════

def _cleanup_expired_internships(db: Session):
    """Delete internships that have passed their deadline (YYYY-MM-DD format)."""
    today = date.today().isoformat()
    expired = db.query(Internship).filter(
        Internship.deadline < today,
        Internship.deadline.like("____-__-__")
    ).all()
    if expired:
        for i in expired:
            db.delete(i)
        db.commit()


@router.get("/internships", response_model=List[InternshipOut])
def admin_list_internships(db: Session = Depends(get_db), admin=Depends(require_admin)):
    _cleanup_expired_internships(db)
    return db.query(Internship).order_by(Internship.created_at.desc()).all()


@router.post("/internships", response_model=InternshipOut, status_code=201)
def create_internship(
    payload: InternshipCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    letter = payload.letter or (payload.company[0].upper() if payload.company else "?")
    intern = Internship(letter=letter, **payload.model_dump(exclude={"letter"}))
    intern.letter = letter
    db.add(intern)
    db.commit()
    db.refresh(intern)

    # Notify all students
    notify_all_students(
        db=db,
        type="internship",
        title="New Internship Posted",
        message=f"{intern.company} is hiring for {intern.role}.",
        link="/internships"
    )

    return intern


@router.patch("/internships/{intern_id}", response_model=InternshipOut)
def update_internship(
    intern_id: int,
    payload: InternshipUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    i = db.query(Internship).filter(Internship.id == intern_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Internship not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(i, field, value)
    db.commit()
    db.refresh(i)
    return i


@router.delete("/internships/{intern_id}", status_code=204)
def delete_internship(
    intern_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    i = db.query(Internship).filter(Internship.id == intern_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Internship not found")
    db.delete(i)
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
# ANALYTICS  (/api/admin/analytics)
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/analytics")
def admin_analytics(db: Session = Depends(get_db), admin=Depends(require_admin)):
    """System-wide analytics for AdminAnalytics page."""
    attempts  = db.query(TestAttempt).all()
    sessions  = db.query(InterviewSession).filter(InterviewSession.overall_score.isnot(None)).all()
    users     = db.query(User).filter(User.role == "student").all()
    apps      = db.query(Application).all()

    avg_test      = round(sum(a.percentage for a in attempts) / len(attempts), 1) if attempts else 0
    avg_interview = round(sum(s.overall_score for s in sessions) / len(sessions), 1) if sessions else 0

    # Skill gap index: % of students with avg score < 70
    below_70 = sum(1 for u in users if _user_avg(db, u.id) < 70)
    gap_index = round(below_70 / len(users) * 100, 1) if users else 0

    # Per-student performance
    student_perf = []
    for u in users:
        u_attempts  = [a for a in attempts if a.user_id == u.id]
        u_sessions  = [s for s in sessions if s.user_id == u.id]
        avg_t = round(sum(x.percentage for x in u_attempts) / len(u_attempts), 1) if u_attempts else 0
        avg_iv = round(sum(x.overall_score for x in u_sessions) / len(u_sessions), 1) if u_sessions else 0
        student_perf.append({
            "name":            f"{u.first_name} {u.last_name}",
            "enrollment_no":   u.enrollment_no,
            "avg_test_score":  avg_t,
            "avg_interview":   avg_iv,
            "primary_gap":     _primary_gap(db, u.id),
        })

    return {
        "avg_test_score":      avg_test,
        "avg_interview_score": avg_interview,
        "skill_gap_index":     gap_index,
        "report_requests":     len(apps),
        "total_students":      len(users),
        "student_performances": student_perf,
    }


def _user_avg(db: Session, user_id: int) -> float:
    from app.models.assessment import TestAttempt as TA
    attempts = db.query(TA).filter(TA.user_id == user_id).all()
    return sum(a.percentage for a in attempts) / len(attempts) if attempts else 0.0


def _primary_gap(db: Session, user_id: int) -> str:
    """Return the test type where the student scored lowest."""
    from app.models.assessment import TestAttempt as TA
    attempts = db.query(TA).filter(TA.user_id == user_id).all()
    type_scores: dict = {}
    for a in attempts:
        test = db.query(Test).filter(Test.id == a.test_id).first()
        if test:
            type_scores.setdefault(test.type, []).append(a.percentage)

    if not type_scores:
        return "N/A"

    avg_by_type = {t: sum(v) / len(v) for t, v in type_scores.items()}
    return min(avg_by_type, key=avg_by_type.get)

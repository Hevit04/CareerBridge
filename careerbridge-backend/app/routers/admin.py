from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import io, datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.models.assessment import Test, Question, TestAttempt
from app.models.interview import InterviewSession
from app.models.internship import Internship, Application
from app.models.backup import BackupRecord
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
    
    # Store in backup
    u_dict = {c.name: getattr(user, c.name) for c in user.__table__.columns}
    # datetime objects need to be stringified for JSON compatibility
    for k, v in u_dict.items():
        if isinstance(v, datetime.datetime) or isinstance(v, datetime.date):
            u_dict[k] = v.isoformat()
            
    backup = BackupRecord(table_name="users", original_id=user.id, data=u_dict)
    db.add(backup)
    
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
        
    t_dict = {c.name: getattr(test, c.name) for c in test.__table__.columns}
    for k, v in t_dict.items():
        if isinstance(v, datetime.datetime) or isinstance(v, datetime.date):
            t_dict[k] = v.isoformat()
            
    backup = BackupRecord(table_name="tests", original_id=test.id, data=t_dict)
    db.add(backup)
    
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
        
    q_dict = {c.name: getattr(q, c.name) for c in q.__table__.columns}
    backup = BackupRecord(table_name="questions", original_id=q.id, data=q_dict)
    db.add(backup)
    
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

@router.get("/internships", response_model=List[InternshipOut])
def admin_list_internships(db: Session = Depends(get_db), admin=Depends(require_admin)):
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
        
    i_dict = {c.name: getattr(i, c.name) for c in i.__table__.columns}
    for k, v in i_dict.items():
        if isinstance(v, datetime.datetime) or isinstance(v, datetime.date):
            i_dict[k] = v.isoformat()
            
    backup = BackupRecord(table_name="internships", original_id=i.id, data=i_dict)
    db.add(backup)
    
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
            "id":               u.id,
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


# ════════════════════════════════════════════════════════════════════════════════
# ADMIN REPORT  (/api/admin/report/{user_id})
# ════════════════════════════════════════════════════════════════════════════════

@router.get("/report/{user_id}")
def admin_generate_student_report(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """Generate the same PDF report a student gets from their own dashboard."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Student not found")

    # ── Gather data for this student ─────────────────────────────────────────────
    attempts = (
        db.query(TestAttempt)
        .filter(TestAttempt.user_id == user_id)
        .order_by(TestAttempt.completed_at.desc())
        .all()
    )
    interview_sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user_id, InterviewSession.overall_score.isnot(None))
        .order_by(InterviewSession.completed_at.desc())
        .all()
    )

    all_scores = [a.percentage for a in attempts]
    all_scores += [s.overall_score for s in interview_sessions]
    overall = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0.0

    test_avg = (sum(a.percentage for a in attempts) / len(attempts)) if attempts else 0
    iv_avg = (sum(s.overall_score for s in interview_sessions) / len(interview_sessions)) if interview_sessions else 0
    readiness = round(test_avg * 0.7 + iv_avg * 0.3, 1)

    type_scores: dict = {}
    for attempt in attempts:
        test = db.query(Test).filter(Test.id == attempt.test_id).first()
        if test:
            type_scores.setdefault(test.type, []).append(attempt.percentage)
    skill_breakdown = [
        {"label": k, "pct": round(sum(v) / len(v), 1)}
        for k, v in type_scores.items()
    ]

    recent_activity = []
    for a in attempts[:5]:
        test = db.query(Test).filter(Test.id == a.test_id).first()
        recent_activity.append({
            "name": test.title if test else "Test",
            "type": test.type if test else "Test",
            "score": f"{a.score} / {a.total}",
            "date": a.completed_at.strftime("%b %d, %Y"),
        })
    for s in interview_sessions[:3]:
        recent_activity.append({
            "name": f"{s.session_type.title()} Mock Interview",
            "type": "Interview",
            "score": f"{s.overall_score}/100" if s.overall_score else "—",
            "date": s.completed_at.strftime("%b %d, %Y") if s.completed_at else "—",
        })

    # ── Build PDF (mirrors student report exactly) ───────────────────────────────
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    full_name = f"{target_user.first_name} {target_user.last_name}"

    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width / 2, height - 50, "CareerBridge Readiness Report")
    p.setFont("Helvetica", 12)
    p.drawCentredString(width / 2, height - 70, f"Prepared for: {full_name}")
    p.drawCentredString(width / 2, height - 85, f"Date: {datetime.datetime.now().strftime('%B %d, %Y')}")
    p.line(50, height - 100, width - 50, height - 100)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 130, "Overview")
    p.setFont("Helvetica", 12)
    p.drawString(70, height - 150, f"Overall Career Score: {overall}%")
    p.drawString(70, height - 165, f"Career Readiness Level: {readiness}%")
    p.drawString(70, height - 180, f"Tests Completed: {len(attempts)}")
    p.drawString(70, height - 195, f"Mock Interviews Completed: {len(interview_sessions)}")

    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 225, "Skill Breakdown")
    y = height - 245
    for skill in skill_breakdown:
        p.setFont("Helvetica", 12)
        p.drawString(70, y, f"{skill['label']}: {skill['pct']}%")
        p.setStrokeColor(colors.lightgrey)
        p.rect(250, y - 2, 200, 10)
        p.setFillColor(colors.HexColor("#00F5D4") if skill['pct'] > 70 else colors.HexColor("#7B2FFF"))
        p.rect(250, y - 2, 200 * (skill['pct'] / 100), 10, fill=1)
        p.setFillColor(colors.black)
        y -= 25

    # Mock Interview Performance
    y -= 10
    if y < 100:
        p.showPage(); y = height - 50
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, "Mock Interview Performance")
    y -= 20
    if interview_sessions:
        p.setFont("Helvetica-Bold", 10)
        p.drawString(70, y, "Interview Type"); p.drawString(230, y, "Overall Score")
        p.drawString(340, y, "Communication"); p.drawString(450, y, "Date")
        y -= 12; p.line(65, y + 10, width - 50, y + 10); y -= 5
        p.setFont("Helvetica", 10)
        for s in interview_sessions:
            if y < 60: p.showPage(); y = height - 50
            p.drawString(70, y, f"{s.session_type.title()} Mock Interview")
            p.drawString(230, y, f"{s.overall_score}/100" if s.overall_score else "—")
            p.drawString(340, y, f"{s.communication_score}/100" if s.communication_score else "—")
            p.drawString(450, y, s.completed_at.strftime("%b %d, %Y") if s.completed_at else "—")
            y -= 18
    else:
        p.setFont("Helvetica", 11); p.setFillColor(colors.grey)
        p.drawString(70, y, "No mock interviews completed yet."); p.setFillColor(colors.black); y -= 20

    # Recent Activity
    y -= 10
    if y < 100: p.showPage(); y = height - 50
    p.setFont("Helvetica-Bold", 16); p.drawString(50, y, "Recent Activity"); y -= 25
    p.setFont("Helvetica-Bold", 10)
    p.drawString(70, y, "Activity"); p.drawString(250, y, "Type")
    p.drawString(350, y, "Score"); p.drawString(450, y, "Date")
    y -= 15; p.line(65, y + 12, width - 50, y + 12)
    p.setFont("Helvetica", 10)
    for act in recent_activity:
        if y < 60: p.showPage(); y = height - 50
        p.drawString(70, y, act['name'][:30]); p.drawString(250, y, act['type'])
        p.drawString(350, y, act['score']); p.drawString(450, y, act['date'])
        y -= 20

    p.setFont("Helvetica-Oblique", 8)
    p.drawCentredString(width / 2, 30, "Generated by CareerBridge — Elevating Your Professional Journey")
    p.showPage()
    p.save()
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=CareerBridge_Report_{full_name.replace(' ', '_')}.pdf"}
    )

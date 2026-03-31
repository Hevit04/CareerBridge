from fastapi import APIRouter, Depends, Response
import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.assessment import TestAttempt, Test
from app.models.interview import InterviewSession
from app.models.internship import Application, Internship

router = APIRouter()


@router.get("/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    All data needed to render the student Dashboard page:
    - KPI cards
    - Skill breakdown bars
    - Top internship matches
    - Recent activity table
    """
    attempts = (
        db.query(TestAttempt)
        .filter(TestAttempt.user_id == current_user.id)
        .order_by(TestAttempt.completed_at.desc())
        .all()
    )
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .all()
    )
    applications = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .all()
    )

    # ── Overall score ─────────────────────────────────────────────────────────
    all_scores = [a.percentage for a in attempts]
    all_scores += [s.overall_score for s in sessions if s.overall_score]
    overall = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0.0

    # ── Readiness (weighted: 70% tests, 30% interviews) ──────────────────────
    test_avg = (sum(a.percentage for a in attempts) / len(attempts)) if attempts else 0
    iv_avg   = (sum(s.overall_score for s in sessions if s.overall_score) / len(sessions)) if sessions else 0
    readiness = round(test_avg * 0.7 + iv_avg * 0.3, 1)

    # ── Skill breakdown — grouped by test type ────────────────────────────────
    type_scores: dict = {}
    for attempt in attempts:
        test = db.query(Test).filter(Test.id == attempt.test_id).first()
        if test:
            key = test.type
            type_scores.setdefault(key, []).append(attempt.percentage)

    skill_colors = {
        "Technical":     "var(--P)",
        "Aptitude":      "var(--A)",
        "Communication": "var(--E)",
    }
    skill_breakdown = [
        {
            "label": k,
            "pct":   round(sum(v) / len(v), 1),
            "color": skill_colors.get(k, "var(--t2)"),
        }
        for k, v in type_scores.items()
    ]

    # ── Top internship matches ────────────────────────────────────────────────
    user_skills = {s.strip().lower() for s in (current_user.skills or "").split(",") if s.strip()}
    internships = db.query(Internship).filter(Internship.is_active == True).all()

    def match_score(i):
        tags = {t.lower() for t in (i.tags or [])}
        overlap = len(user_skills & tags)
        return int(overlap / len(tags) * 100 * 0.6 + i.base_match * 0.4) if tags else i.base_match

    top = sorted(internships, key=match_score, reverse=True)[:4]
    top_matches = [
        {
            "company":  i.company,
            "role":     f"{i.role} · {i.location}",
            "pct":      f"{match_score(i)}%",
            "badge":    i.badge,
        }
        for i in top
    ]

    # ── Recent activity ───────────────────────────────────────────────────────
    activity = []
    for a in attempts[:3]:
        test = db.query(Test).filter(Test.id == a.test_id).first()
        activity.append({
            "name":           test.title if test else "Test",
            "type":           test.type if test else "Test",
            "score":          f"{a.score} / {a.total}",
            "score_color":    "var(--P)",
            "date":           a.completed_at.strftime("%b %d, %Y"),
            "status":         "Completed",
            "status_variant": "bg",
        })
    for s in sessions[:2]:
        activity.append({
            "name":           f"{s.session_type.title()} Mock Interview",
            "type":           "Interview",
            "score":          f"{s.overall_score}/100" if s.overall_score else "—",
            "score_color":    "var(--A)",
            "date":           s.completed_at.strftime("%b %d, %Y"),
            "status":         "Completed",
            "status_variant": "bg",
        })
    for ap in applications[:2]:
        intern = db.query(Internship).filter(Internship.id == ap.internship_id).first()
        activity.append({
            "name":           f"{intern.company if intern else 'Company'} Application",
            "type":           "Applied",
            "score":          "—",
            "score_color":    "var(--t3)",
            "date":           ap.applied_at.strftime("%b %d, %Y"),
            "status":         ap.status,
            "status_variant": "bb",
        })

    return {
        "overall_score":       overall,
        "tests_completed":     len(attempts),
        "internship_matches":  len(internships),
        "readiness_level":     readiness,
        "skill_breakdown":     skill_breakdown,
        "top_matches":         top_matches,
        "recent_activity":     activity,
    }


@router.get("/report")
def generate_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generates a PDF career readiness report for the student.
    """
    # ── Fetch Data ──────────────────────────────────────────────────────────
    data = dashboard_stats(db, current_user)
    
    # ── Create PDF ──────────────────────────────────────────────────────────
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width/2, height - 50, "CareerBridge Readiness Report")
    
    p.setFont("Helvetica", 12)
    full_name = f"{current_user.first_name} {current_user.last_name}"
    p.drawCentredString(width/2, height - 70, f"Prepared for: {full_name}")
    p.drawCentredString(width/2, height - 85, f"Date: {datetime.datetime.now().strftime('%B %d, %Y')}")
    
    p.line(50, height - 100, width - 50, height - 100)
    
    # Overview Section
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 130, "Overview")
    
    p.setFont("Helvetica", 12)
    p.drawString(70, height - 150, f"Overall Career Score: {data['overall_score']}%")
    p.drawString(70, height - 165, f"Career Readiness Level: {data['readiness_level']}%")
    p.drawString(70, height - 180, f"Tests Completed: {data['tests_completed']}")
    
    # Skill Breakdown
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 210, "Skill Breakdown")
    
    y = height - 230
    for skill in data['skill_breakdown']:
        p.setFont("Helvetica", 12)
        p.drawString(70, y, f"{skill['label']}: {skill['pct']}%")
        
        # Simple progress bar
        p.setStrokeColor(colors.lightgrey)
        p.rect(250, y-2, 200, 10)
        p.setFillColor(colors.HexColor("#00F5D4") if skill['pct'] > 70 else colors.HexColor("#7B2FFF"))
        p.rect(250, y-2, 200 * (skill['pct']/100), 10, fill=1)
        p.setFillColor(colors.black)
        y -= 25
        
    # Recent Activity
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y - 10, "Recent Activity")
    y -= 35
    
    p.setFont("Helvetica-Bold", 10)
    p.drawString(70, y, "Activity")
    p.drawString(250, y, "Type")
    p.drawString(350, y, "Score")
    p.drawString(450, y, "Date")
    y -= 15
    p.line(65, y+12, width - 50, y+12)
    
    p.setFont("Helvetica", 10)
    for act in data['recent_activity']:
        p.drawString(70, y, act['name'][:30])
        p.drawString(250, y, act['type'])
        p.drawString(350, y, act['score'])
        p.drawString(450, y, act['date'])
        y -= 20
        if y < 50:
            p.showPage()
            y = height - 50
            
    # Footer
    p.setFont("Helvetica-Oblique", 8)
    p.drawCentredString(width/2, 30, "Generated by CareerBridge — Elevating Your Professional Journey")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    full_name = f"{current_user.first_name} {current_user.last_name}"
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=CareerBridge_Report_{full_name.replace(' ', '_')}.pdf"
        }
    )

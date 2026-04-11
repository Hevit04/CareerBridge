from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import random

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.interview import InterviewSession, InterviewResponse
from app.models.user import User
from app.schemas.interview import (
    StartSessionRequest, SessionOut,
    SubmitResponseRequest, ResponseOut,
    CompleteSessionRequest, SessionSummary,
)
from app.services.notification_service import create_notification

router = APIRouter()

# Static question bank (mirrors frontend quizData IVQ)
IVQ = {
    "technical": [
        "How would you implement an LRU Cache? What data structures and why?",
        "Explain the differences between TCP and UDP. When would you choose each?",
        "How does garbage collection work in Java? Describe different GC algorithms.",
        "Design a URL shortener like bit.ly at scale — walk me through your architecture.",
        "What is the difference between a process and a thread? How does context switching work?",
    ],
    "hr": [
        "Tell me about yourself and why you want this role.",
        "Describe a challenging project and how you overcame the obstacles.",
        "Where do you see yourself in 5 years?",
        "Tell me about a conflict with a teammate and how you resolved it.",
        "What is your biggest technical weakness and how are you improving it?",
    ],
    "system": [
        "Design a distributed key-value store like Redis at 1M req/s.",
        "Design Twitter's newsfeed for a read-heavy system at scale.",
        "Design a real-time collaborative document editor like Google Docs.",
    ],
}


@router.post("/start", response_model=SessionOut)
def start_session(
    payload: StartSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new interview session and return the questions."""
    if payload.session_type not in IVQ:
        raise HTTPException(status_code=400, detail="Invalid session_type. Use: technical | hr | system")

    questions = IVQ[payload.session_type]
    session = InterviewSession(
        user_id=current_user.id,
        session_type=payload.session_type,
        total_questions=len(questions),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionOut(
        id=session.id,
        session_type=session.session_type,
        questions=questions,
    )


@router.post("/response", response_model=ResponseOut)
def submit_response(
    payload: SubmitResponseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a single answer for a question in a session."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == payload.session_id,
        InterviewSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    word_count = len(payload.answer.strip().split()) if payload.answer.strip() else 0

    response = InterviewResponse(
        session_id=payload.session_id,
        question=payload.question,
        answer=payload.answer,
        word_count=word_count,
        order=payload.order,
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    return response


@router.post("/complete", response_model=SessionSummary)
def complete_session(
    payload: CompleteSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a session as complete and compute mock scores.
    In production, replace the random scoring with an NLP/AI evaluation.
    """
    session = db.query(InterviewSession).filter(
        InterviewSession.id == payload.session_id,
        InterviewSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Mock scoring — replace with NLP model in production
    responses = db.query(InterviewResponse).filter(
        InterviewResponse.session_id == session.id
    ).all()

    avg_words = (sum(r.word_count for r in responses) / len(responses)) if responses else 0
    clarity   = min(round(avg_words / 2, 1), 100)   # naive proxy
    confidence = round(random.uniform(55, 90), 1)
    overall   = round((clarity + confidence) / 2, 1)
    comm      = round((clarity * 0.6 + confidence * 0.4), 1)

    session.duration_secs       = payload.duration_secs
    session.overall_score       = overall
    session.communication_score = comm
    session.pace_label          = "Good" if avg_words > 30 else "Slow"
    session.clarity_pct         = clarity
    session.confidence_pct      = confidence
    db.commit()
    db.refresh(session)

    # Trigger notification
    create_notification(
        db=db,
        user_id=current_user.id,
        type="interview",
        title="Mock Interview Completed",
        message=f"You scored {overall}/100 in your {session.session_type} interview.",
        link="/interview"
    )

    return session


@router.get("/sessions/me", response_model=List[SessionSummary])
def my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all past interview sessions for the logged-in student."""
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.completed_at.desc())
        .all()
    )
    return sessions


@router.get("/stats/me")
def my_interview_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """KPI stats shown on Interview home page."""
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.overall_score.isnot(None),
    ).all()

    if not sessions:
        return {"sessions_completed": 0, "avg_score": 0, "avg_comm_score": 0}

    avg_score = round(sum(s.overall_score for s in sessions) / len(sessions), 1)
    avg_comm  = round(sum(s.communication_score for s in sessions if s.communication_score) / len(sessions), 1)

    return {
        "sessions_completed": len(sessions),
        "avg_score":          avg_score,
        "avg_comm_score":     avg_comm,
    }

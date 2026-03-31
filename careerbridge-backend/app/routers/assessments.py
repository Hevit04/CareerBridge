from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.assessment import Test, Question, TestAttempt
from app.models.user import User
from app.schemas.assessment import (
    TestOut, QuestionPublic, SubmitAttempt, AttemptResult, AttemptOut
)
from app.services import ai_service
from app.services.notification_service import create_notification

router = APIRouter()


# ── Public / student endpoints ────────────────────────────────────────────────

@router.get("/tests", response_model=List[TestOut])
def list_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all active tests visible to students."""
    tests = db.query(Test).filter(Test.status == "Active").all()
    return tests


@router.get("/tests/{test_id}/questions", response_model=List[QuestionPublic])
def get_test_questions(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch questions for a test (AI-generated for variety)."""
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Generate fresh questions using AI
    generated = ai_service.generate_questions(test.title, test.total_questions)
    
    if generated:
        # Map generated JSON to the public schema (id=0 to indicate dynamic)
        return [
            QuestionPublic(
                id=-(i+1), # Use negative IDs to avoid DB conflicts and signal dynamic
                question=q["question"],
                options=q["options"],
                domain=test.title,
                order=i
            )
            for i, q in enumerate(generated)
        ]
    
    # Fallback to database questions if AI fails
    questions = (
        db.query(Question)
        .filter(Question.test_id == test_id)
        .order_by(Question.order)
        .all()
    )
    return questions


@router.post("/submit", response_model=AttemptResult)
def submit_attempt(
    payload: SubmitAttempt,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a completed test attempt.
    Returns score + per-question breakdown with explanations.
    """
    test = db.query(Test).filter(Test.id == payload.test_db_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    all_questions = db.query(Question).filter(Question.test_id == test.id).order_by(Question.order).all()
    if not all_questions:
        raise HTTPException(status_code=400, detail="Test has no database questions to grade")

    score = 0
    breakdown = []
    recorded_answers = []
    
    # Map student's answers by question_id
    answers_map = {item.question_id: item.answer_idx for item in payload.answers}

    for q in all_questions:
        chosen_idx = answers_map.get(q.id)
        is_correct = False
        
        if chosen_idx is not None:
            is_correct = (chosen_idx == q.answer_idx)
            if is_correct:
                score += test.points_per_question
            recorded_answers.append(chosen_idx)
        else:
            recorded_answers.append(-1) # unattempted

        breakdown.append({
            "question":     q.question,
            "options":      q.options,
            "chosen_idx":   chosen_idx if chosen_idx is not None else -1,
            "correct_idx":  q.answer_idx,
            "explanation":  q.explanation if q.explanation else "No explanation provided.",
            "is_correct":   is_correct,
        })

    total_possible = len(all_questions) * test.points_per_question
    pct = round(score / total_possible * 100, 1) if total_possible > 0 else 0

    attempt = TestAttempt(
        user_id=current_user.id,
        test_id=test.id,
        score=score,
        total=total_possible,
        percentage=pct,
        time_taken_secs=payload.time_taken_secs,
        answers=recorded_answers,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Notify student
    create_notification(
        db=db,
        user_id=current_user.id,
        type="assessment",
        title="Assessment Completed",
        message=f"You scored {pct}% on the '{test.title}' assessment.",
        link="/assessment"
    )

    return AttemptResult(
        id=attempt.id,
        user_id=attempt.user_id,
        test_id=attempt.test_id,
        score=attempt.score,
        total=attempt.total,
        percentage=attempt.percentage,
        time_taken_secs=attempt.time_taken_secs,
        completed_at=attempt.completed_at,
        breakdown=breakdown,
    )


@router.get("/attempts/me", response_model=List[AttemptOut])
def my_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all past test attempts for the logged-in student."""
    attempts = (
        db.query(TestAttempt)
        .filter(TestAttempt.user_id == current_user.id)
        .order_by(TestAttempt.completed_at.desc())
        .all()
    )
    return attempts


@router.get("/stats/me")
def my_assessment_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregate stats shown on the Assessment page KPI cards."""
    attempts = (
        db.query(TestAttempt)
        .filter(TestAttempt.user_id == current_user.id)
        .all()
    )
    if not attempts:
        return {"tests_done": 0, "avg_score": 0, "best_score": 0}

    avg = round(sum(a.percentage for a in attempts) / len(attempts), 1)
    best = max(a.percentage for a in attempts)
    return {
        "tests_done": len(attempts),
        "avg_score":  avg,
        "best_score": best,
    }

from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ── Question ──────────────────────────────────────────────────────────────────

class QuestionCreate(BaseModel):
    question: str
    options: List[str]
    answer_idx: int
    explanation: Optional[str] = None
    domain: Optional[str] = None
    order: int = 0


class QuestionOut(QuestionCreate):
    id: int
    test_id: int

    class Config:
        from_attributes = True


class QuestionPublic(BaseModel):
    """Question sent to student — no answer_idx exposed."""
    id: int
    question: str
    options: List[str]
    domain: Optional[str]
    order: int

    class Config:
        from_attributes = True


# ── Test ──────────────────────────────────────────────────────────────────────

class TestCreate(BaseModel):
    title: str
    type: str                  # Technical | Aptitude | Communication
    total_questions: int = 10
    duration_secs: int = 1200
    points_per_question: int = 10
    cadence: str = "Weekly"
    status: str = "Draft"


class TestUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    total_questions: Optional[int] = None
    duration_secs: Optional[int] = None
    points_per_question: Optional[int] = None
    cadence: Optional[str] = None
    status: Optional[str] = None


class TestOut(BaseModel):
    id: int
    test_id: str
    title: str
    type: str
    total_questions: int
    duration_secs: int
    points_per_question: int
    cadence: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Attempt ───────────────────────────────────────────────────────────────────

class SubmitAnswer(BaseModel):
    question_id: int
    answer_idx: int

class SubmitAttempt(BaseModel):
    test_db_id: int
    answers: List[SubmitAnswer]  # list of {question_id, answer_idx}
    time_taken_secs: int


class AttemptOut(BaseModel):
    id: int
    user_id: int
    test_id: int
    score: int
    total: int
    percentage: float
    time_taken_secs: int
    completed_at: datetime

    class Config:
        from_attributes = True


class AttemptResult(AttemptOut):
    """Full result with per-question breakdown returned after submission."""
    breakdown: List[dict]      # [{question, options, chosen_idx, correct_idx, explanation, is_correct}]

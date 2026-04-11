from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class StartSessionRequest(BaseModel):
    session_type: str   # technical | hr | system


class SessionOut(BaseModel):
    id: int
    session_type: str
    questions: List[str]   # list of question strings for the session

    class Config:
        from_attributes = True


class SubmitResponseRequest(BaseModel):
    session_id: int
    question: str
    answer: str
    order: int


class ResponseOut(BaseModel):
    id: int
    session_id: int
    question: str
    answer: str
    word_count: int
    order: int
    submitted_at: datetime

    class Config:
        from_attributes = True


class CompleteSessionRequest(BaseModel):
    session_id: int
    duration_secs: int


class SessionSummary(BaseModel):
    id: int
    session_type: str
    total_questions: int
    duration_secs: int
    overall_score: Optional[float]
    communication_score: Optional[float]
    pace_label: Optional[str]
    clarity_pct: Optional[float]
    confidence_pct: Optional[float]
    completed_at: datetime

    class Config:
        from_attributes = True

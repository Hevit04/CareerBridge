from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class InterviewSession(Base):
    """A mock interview session (technical | hr | system)."""
    __tablename__ = "interview_sessions"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_type    = Column(String(20), nullable=False)   # technical | hr | system
    total_questions = Column(Integer, default=0)
    duration_secs   = Column(Integer, default=0)

    # Aggregated scores (0-100)
    overall_score       = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)   # clarity, confidence, pace
    pace_label          = Column(String(20), nullable=True)
    clarity_pct         = Column(Float, nullable=True)
    confidence_pct      = Column(Float, nullable=True)

    completed_at = Column(DateTime, default=datetime.utcnow)

    responses   = relationship("InterviewResponse", back_populates="session", cascade="all, delete-orphan")
    user        = relationship("User", back_populates="interview_sessions")


class InterviewResponse(Base):
    """One Q&A pair within an interview session."""
    __tablename__ = "interview_responses"

    id          = Column(Integer, primary_key=True, index=True)
    session_id  = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question    = Column(Text, nullable=False)
    answer      = Column(Text, nullable=True)
    word_count  = Column(Integer, default=0)
    order       = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    session     = relationship("InterviewSession", back_populates="responses")

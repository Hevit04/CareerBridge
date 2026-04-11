from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Test(Base):
    """A test definition created by admin."""
    __tablename__ = "tests"

    id          = Column(Integer, primary_key=True, index=True)
    test_id     = Column(String(20), unique=True, index=True)   # e.g. T-1001
    title       = Column(String(200), nullable=False)
    type        = Column(String(50), nullable=False)            # Technical | Aptitude | Communication
    total_questions = Column(Integer, default=10)
    duration_secs   = Column(Integer, default=1200)            # seconds
    points_per_question = Column(Integer, default=10)
    cadence     = Column(String(50), default="Weekly")          # Daily | Weekly | Mon/Wed/Fri ...
    status      = Column(String(20), default="Draft")           # Draft | Active | Paused | Archived
    created_at  = Column(DateTime, default=datetime.utcnow)

    questions   = relationship("Question", back_populates="test", cascade="all, delete-orphan")
    attempts    = relationship("TestAttempt", back_populates="test")


class Question(Base):
    """A single MCQ question belonging to a test."""
    __tablename__ = "questions"

    id          = Column(Integer, primary_key=True, index=True)
    test_id     = Column(Integer, ForeignKey("tests.id"), nullable=False)
    question    = Column(Text, nullable=False)
    options     = Column(JSON, nullable=False)    # list of 4 strings
    answer_idx  = Column(Integer, nullable=False) # 0-based correct option index
    explanation = Column(Text, nullable=True)
    domain      = Column(String(50), nullable=True)  # dsa | aptitude | system | verbal
    order       = Column(Integer, default=0)

    test        = relationship("Test", back_populates="questions")


class TestAttempt(Base):
    """A student's completed attempt at a test."""
    __tablename__ = "test_attempts"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    test_id         = Column(Integer, ForeignKey("tests.id"), nullable=False)
    score           = Column(Integer, default=0)
    total           = Column(Integer, default=0)
    percentage      = Column(Float, default=0.0)
    time_taken_secs = Column(Integer, default=0)
    answers         = Column(JSON, nullable=True)  # list of chosen option indices
    completed_at    = Column(DateTime, default=datetime.utcnow)

    user    = relationship("User", back_populates="test_attempts")
    test    = relationship("Test", back_populates="attempts")

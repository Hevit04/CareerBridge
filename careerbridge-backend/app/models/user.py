from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    enrollment_no   = Column(String(20), unique=True, index=True, nullable=True)
    first_name      = Column(String(60), nullable=False)
    last_name       = Column(String(60), nullable=False)
    email           = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(String(10), default="student")   # student | admin
    branch          = Column(String(100), nullable=True)
    semester        = Column(Integer, nullable=True)
    phone           = Column(String(20), nullable=True)

    # Career preferences
    preferred_role  = Column(String(100), nullable=True)
    location_pref   = Column(String(200), nullable=True)

    # Skills (comma-separated for simplicity; can be normalised)
    skills          = Column(Text, nullable=True)

    # Resume
    resume_filename = Column(String(255), nullable=True)
    resume_uploaded_at = Column(DateTime, nullable=True)

    # Account state
    is_active       = Column(Boolean, default=True)
    last_seen       = Column(DateTime, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    test_attempts   = relationship("TestAttempt", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    applications    = relationship("Application", back_populates="user", cascade="all, delete-orphan")

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Internship(Base):
    """An internship opportunity published by admin."""
    __tablename__ = "internships"

    id          = Column(Integer, primary_key=True, index=True)
    company     = Column(String(100), nullable=False)
    role        = Column(String(200), nullable=False)
    location    = Column(String(100), nullable=False)
    duration    = Column(String(50), nullable=False)
    domain      = Column(String(30), nullable=False)   # swe | ml | data | backend | frontend
    tags        = Column(JSON, nullable=True)           # list of skill strings
    description = Column(Text, nullable=True)
    deadline    = Column(String(50), nullable=False)
    color       = Column(String(10), default="#7b2fff")
    letter      = Column(String(1), nullable=True)
    badge       = Column(String(5), default="bb")
    is_new      = Column(Boolean, default=True)
    is_active   = Column(Boolean, default=True)
    base_match  = Column(Integer, default=70)           # default match %
    apply_link  = Column(String(500), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("Application", back_populates="internship", cascade="all, delete-orphan")


class Application(Base):
    """A student's application to an internship."""
    __tablename__ = "applications"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    internship_id   = Column(Integer, ForeignKey("internships.id"), nullable=False)
    status          = Column(String(30), default="Applied")  # Applied | Under Review | Shortlisted | Rejected
    match_score     = Column(Integer, default=0)
    applied_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user        = relationship("User", back_populates="applications")
    internship  = relationship("Internship", back_populates="applications")

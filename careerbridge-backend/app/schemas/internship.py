from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class InternshipCreate(BaseModel):
    company: str
    role: str
    location: str
    duration: str
    domain: str         # swe | ml | data | backend | frontend
    tags: Optional[List[str]] = []
    description: Optional[str] = None
    deadline: str
    color: str = "#7b2fff"
    letter: Optional[str] = None
    badge: str = "bb"
    base_match: int = 70
    apply_link: str


class InternshipUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    domain: Optional[str] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None
    deadline: Optional[str] = None
    is_active: Optional[bool] = None
    base_match: Optional[int] = None
    apply_link: Optional[str] = None


class InternshipOut(BaseModel):
    id: int
    company: str
    role: str
    location: str
    duration: str
    domain: str
    tags: Optional[List[str]]
    description: Optional[str]
    deadline: str
    color: str
    letter: Optional[str]
    badge: str
    is_new: bool
    is_active: bool
    base_match: int
    apply_link: Optional[str] = None
    match: Optional[int] = None   # personalised match score, injected at runtime
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    internship_id: int


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    internship_id: int
    status: str
    match_score: int
    applied_at: datetime

    class Config:
        from_attributes = True

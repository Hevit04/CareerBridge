from pydantic import BaseModel
from typing import List, Optional


class SkillBreakdown(BaseModel):
    label: str
    pct: float
    color: str


class DashboardStats(BaseModel):
    overall_score: float
    tests_completed: int
    internship_matches: int
    readiness_level: float
    skill_breakdown: List[SkillBreakdown]
    top_matches: List[dict]


class RecentActivity(BaseModel):
    name: str
    type: str
    score: str
    score_color: str
    date: str
    status: str
    status_variant: str


class AdminAnalyticsSummary(BaseModel):
    avg_test_score: float
    avg_interview_score: float
    skill_gap_index: float
    report_requests: int
    student_performances: List[dict]

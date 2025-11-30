from pydantic import BaseModel, Field
from typing import Dict
from datetime import datetime


class CriteriaScore(BaseModel):
    accuracy: float = Field(..., ge=0, le=10)
    relevance: float = Field(..., ge=0, le=10)
    communication: float = Field(..., ge=0, le=10)
    clarity: float = Field(..., ge=0, le=10)
    confidence: float = Field(..., ge=0, le=10)


class QuestionEvaluation(BaseModel):
    question_id: str
    question_text: str
    answer_text: str
    criteria_scores: CriteriaScore
    overall_score: float
    feedback: str
    timestamp: datetime


class InterviewEvaluation(BaseModel):
    interview_id: str
    candidate_id: str
    candidate_name: str
    job_role: str
    technical_score: float
    hr_score: float
    overall_score: float
    question_evaluations: list[QuestionEvaluation]
    video_recording_url: str
    summary: str
    recommendation: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class EvaluationSummary(BaseModel):
    interview_id: str
    overall_score: float
    technical_score: float
    hr_score: float
    recommendation: str
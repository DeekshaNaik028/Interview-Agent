from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional
from datetime import datetime
from app.utils.constants import InterviewRound


class CriteriaScore(BaseModel):
    accuracy: float = Field(..., ge=0, le=10, description="Accuracy score (0-10)")
    relevance: float = Field(..., ge=0, le=10, description="Relevance score (0-10)")
    communication: float = Field(..., ge=0, le=10, description="Communication score (0-10)")
    clarity: float = Field(..., ge=0, le=10, description="Clarity score (0-10)")
    confidence: float = Field(..., ge=0, le=10, description="Confidence score (0-10)")
    
    @validator('accuracy', 'relevance', 'communication', 'clarity', 'confidence')
    def validate_score(cls, v):
        if v < 0 or v > 10:
            raise ValueError('Score must be between 0 and 10')
        return round(v, 2)


class QuestionEvaluation(BaseModel):
    question_id: str
    question_text: str
    answer_text: str
    round_type: InterviewRound
    criteria_scores: CriteriaScore
    overall_score: float = Field(..., ge=0, le=10)
    feedback: str
    timestamp: datetime
    
    @validator('overall_score')
    def validate_overall_score(cls, v):
        return round(v, 2)


class InterviewEvaluation(BaseModel):
    interview_id: str
    candidate_id: str
    candidate_name: str
    candidate_email: Optional[str] = None
    job_role: str
    technical_score: float = Field(..., ge=0, le=10)
    hr_score: float = Field(..., ge=0, le=10)
    overall_score: float = Field(..., ge=0, le=10)
    question_evaluations: List[QuestionEvaluation]
    video_recording_url: Optional[str] = None
    audio_recordings: Optional[List[str]] = None
    summary: str
    recommendation: str = Field(..., description="Hiring recommendation")
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
    
    @validator('technical_score', 'hr_score', 'overall_score')
    def validate_scores(cls, v):
        return round(v, 2)


class EvaluationSummary(BaseModel):
    interview_id: str
    candidate_name: str
    job_role: str
    overall_score: float
    technical_score: float
    hr_score: float
    recommendation: str
    interview_date: Optional[datetime] = None
    
    @validator('overall_score', 'technical_score', 'hr_score')
    def validate_scores(cls, v):
        return round(v, 2)


class EvaluationRequest(BaseModel):
    """Request to generate or regenerate evaluation"""
    interview_id: str
    force_regenerate: bool = Field(default=False, description="Force regeneration if evaluation exists")


class EvaluationResponse(BaseModel):
    """Response after evaluation generation"""
    success: bool
    message: str
    evaluation_id: Optional[str] = None
    evaluation: Optional[InterviewEvaluation] = None


class BatchEvaluationRequest(BaseModel):
    """Request to evaluate multiple interviews"""
    interview_ids: List[str] = Field(..., min_items=1, max_items=50)


class BatchEvaluationResponse(BaseModel):
    """Response for batch evaluation"""
    total: int
    successful: int
    failed: int
    results: List[Dict[str, str]]  # List of {interview_id, status, message}


class EvaluationStats(BaseModel):
    """Statistics about evaluations"""
    total_evaluations: int
    average_overall_score: float
    average_technical_score: float
    average_hr_score: float
    recommendation_distribution: Dict[str, int]
    score_distribution: Dict[str, int]  # Ranges like "0-2", "2-4", etc.
    
    @validator('average_overall_score', 'average_technical_score', 'average_hr_score')
    def validate_averages(cls, v):
        return round(v, 2)
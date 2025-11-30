from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.utils.constants import InterviewStatus, InterviewRound


class InterviewCreate(BaseModel):
    candidate_id: str = Field(..., description="ID of the candidate")
    company_id: str = Field(..., description="ID of the company")
    job_role: str = Field(..., min_length=2, max_length=100, description="Job role for the interview")
    scheduled_date: Optional[datetime] = Field(None, description="Scheduled interview date")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    @validator('job_role')
    def validate_job_role(cls, v):
        return v.strip()


class InterviewStart(BaseModel):
    interview_id: str = Field(..., description="ID of the interview to start")


class InterviewResponse(BaseModel):
    id: str
    candidate_id: str
    company_id: str
    job_role: str
    status: InterviewStatus
    current_round: InterviewRound
    current_question_index: int
    total_questions: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class AnswerSubmit(BaseModel):
    interview_id: str = Field(..., description="Interview ID")
    question_id: str = Field(..., description="Question ID")
    audio_data: str = Field(..., description="Base64 encoded audio data")
    video_chunk_url: Optional[str] = Field(None, description="URL to uploaded video chunk")
    answer_text: Optional[str] = Field(None, description="Transcribed answer text")
    duration_seconds: Optional[int] = Field(None, ge=0, description="Answer duration in seconds")
    
    @validator('audio_data')
    def validate_audio_data(cls, v):
        if not v or len(v) < 10:
            raise ValueError('Invalid audio data')
        return v


class AnswerResponse(BaseModel):
    """Response after submitting an answer"""
    success: bool
    message: str
    next_question: Optional[dict] = None
    interview_completed: bool = False
    current_progress: Optional[int] = None
    total_questions: Optional[int] = None


class InterviewClosingResponse(BaseModel):
    message: str
    interview_id: str
    completed_at: datetime
    total_questions_answered: int


class InterviewStatusResponse(BaseModel):
    """Detailed interview status"""
    interview_id: str
    status: InterviewStatus
    current_round: InterviewRound
    progress: dict = Field(..., description="Progress information")
    started_at: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None


class InterviewListItem(BaseModel):
    """Simplified interview data for list views"""
    id: str
    candidate_name: str
    candidate_email: str
    job_role: str
    status: InterviewStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    overall_score: Optional[float] = None


class InterviewUpdate(BaseModel):
    """Update interview details"""
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)
    status: Optional[InterviewStatus] = None


class InterviewCancel(BaseModel):
    """Cancel interview request"""
    interview_id: str
    reason: Optional[str] = Field(None, max_length=200)


class InterviewProgress(BaseModel):
    """Interview progress information"""
    interview_id: str
    total_questions: int
    answered_questions: int
    current_question_index: int
    completion_percentage: float
    current_round: InterviewRound
    time_elapsed_minutes: Optional[int] = None
    estimated_time_remaining_minutes: Optional[int] = None
    
    @validator('completion_percentage')
    def validate_percentage(cls, v):
        return round(min(max(v, 0), 100), 2)
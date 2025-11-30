from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.utils.constants import InterviewStatus, InterviewRound


class InterviewCreate(BaseModel):
    candidate_id: str
    company_id: str
    job_role: str


class InterviewStart(BaseModel):
    interview_id: str


class InterviewResponse(BaseModel):
    id: str
    candidate_id: str
    company_id: str
    job_role: str
    status: InterviewStatus
    current_round: InterviewRound
    current_question_index: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class AnswerSubmit(BaseModel):
    interview_id: str
    question_id: str
    audio_data: str  # Base64 encoded audio
    video_chunk_url: Optional[str] = None  # URL to uploaded video chunk
    answer_text: Optional[str] = None  # Transcribed text


class InterviewClosingResponse(BaseModel):
    message: str
    interview_id: str
from pydantic import BaseModel
from typing import Optional
from app.utils.constants import InterviewRound, QuestionDifficulty


class QuestionGenerate(BaseModel):
    job_role: str
    resume_skills: list[str]
    round_type: InterviewRound
    count: int = 5


class QuestionResponse(BaseModel):
    id: str
    question_text: str
    round_type: InterviewRound
    difficulty: QuestionDifficulty
    expected_keywords: list[str]
    
    class Config:
        from_attributes = True


class QuestionWithAudio(QuestionResponse):
    audio_url: Optional[str] = None  # URL to generated voice question
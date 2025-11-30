from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.utils.constants import InterviewRound, QuestionDifficulty


class QuestionGenerate(BaseModel):
    job_role: str = Field(..., min_length=2, description="Job role for question generation")
    resume_skills: List[str] = Field(..., min_items=1, description="Candidate's skills")
    round_type: InterviewRound = Field(..., description="Interview round type")
    count: int = Field(default=5, ge=1, le=20, description="Number of questions to generate")
    difficulty_preference: Optional[str] = Field(None, description="Preferred difficulty mix")
    
    @validator('resume_skills')
    def validate_skills(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one skill is required')
        return [skill.strip() for skill in v if skill.strip()]


class QuestionResponse(BaseModel):
    id: str
    question_text: str
    round_type: InterviewRound
    difficulty: QuestionDifficulty
    expected_keywords: List[str]
    order: Optional[int] = None
    max_duration_seconds: Optional[int] = Field(default=180, description="Max answer duration")
    
    class Config:
        from_attributes = True


class QuestionWithAudio(QuestionResponse):
    audio_url: Optional[str] = Field(None, description="URL to generated voice question")
    audio_duration: Optional[int] = Field(None, description="Audio duration in seconds")


class QuestionDetail(BaseModel):
    """Detailed question information for company review"""
    id: str
    interview_id: str
    question_text: str
    round_type: InterviewRound
    difficulty: QuestionDifficulty
    expected_keywords: List[str]
    order: int
    created_at: Optional[datetime] = None
    answer_submitted: bool = False
    answer_text: Optional[str] = None
    answer_score: Optional[float] = None


class QuestionCreate(BaseModel):
    """Manually create a custom question"""
    interview_id: str
    question_text: str = Field(..., min_length=10, max_length=500)
    round_type: InterviewRound
    difficulty: QuestionDifficulty
    expected_keywords: List[str] = Field(..., min_items=1)
    order: int = Field(..., ge=0)
    
    @validator('question_text')
    def validate_question(cls, v):
        v = v.strip()
        if len(v) < 10:
            raise ValueError('Question must be at least 10 characters')
        if not v.endswith('?'):
            v += '?'
        return v
    
    @validator('expected_keywords')
    def validate_keywords(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one expected keyword is required')
        return [kw.strip().lower() for kw in v if kw.strip()]


class QuestionUpdate(BaseModel):
    """Update question details"""
    question_text: Optional[str] = Field(None, min_length=10, max_length=500)
    difficulty: Optional[QuestionDifficulty] = None
    expected_keywords: Optional[List[str]] = None
    order: Optional[int] = Field(None, ge=0)


class QuestionBulkCreate(BaseModel):
    """Create multiple questions at once"""
    interview_id: str
    questions: List[QuestionCreate] = Field(..., min_items=1, max_items=20)


class QuestionStats(BaseModel):
    """Statistics about questions"""
    total_questions: int
    by_round: dict = Field(..., description="Count by round type")
    by_difficulty: dict = Field(..., description="Count by difficulty")
    average_expected_keywords: float
    
    @validator('average_expected_keywords')
    def validate_average(cls, v):
        return round(v, 2)


class QuestionBank(BaseModel):
    """Question bank for reuse"""
    id: str
    job_role: str
    questions: List[QuestionResponse]
    created_by: str
    created_at: datetime
    times_used: int = 0
    
    class Config:
        from_attributes = True


class QuestionTemplate(BaseModel):
    """Template for generating similar questions"""
    template_text: str = Field(..., description="Question template with placeholders")
    round_type: InterviewRound
    difficulty: QuestionDifficulty
    placeholders: List[str] = Field(..., description="List of placeholder names")
    
    @validator('template_text')
    def validate_template(cls, v):
        if '{' not in v or '}' not in v:
            raise ValueError('Template must contain placeholders in {placeholder} format')
        return v
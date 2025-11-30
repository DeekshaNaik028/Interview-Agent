from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime


class ResumeData(BaseModel):
    skills: List[str] = Field(..., min_items=1, description="List of technical skills")
    experience_years: int = Field(..., ge=0, le=50, description="Years of experience")
    education: str = Field(..., min_length=2, description="Educational background")
    previous_roles: List[str] = Field(default=[], description="Previous job roles")
    certifications: Optional[List[str]] = Field(default=[], description="Professional certifications")
    
    @validator('skills')
    def validate_skills(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one skill is required')
        return [skill.strip() for skill in v if skill.strip()]
    
    @validator('education')
    def validate_education(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Education must be at least 2 characters')
        return v.strip()


class CandidateRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    resume_data: ResumeData
    job_role: str = Field(..., min_length=2, max_length=100)
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters')
        return v.strip()
    
    @validator('phone')
    def validate_phone(cls, v):
        # Remove common phone number characters
        cleaned = ''.join(c for c in v if c.isdigit() or c == '+')
        if len(cleaned) < 10:
            raise ValueError('Phone number must be at least 10 digits')
        return v


class CandidateLogin(BaseModel):
    email: EmailStr
    password: str


class CandidateResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    phone: str
    job_role: str
    created_at: datetime
    resume_data: Optional[ResumeData] = None
    
    class Config:
        from_attributes = True


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    resume_data: Optional[ResumeData] = None
    job_role: Optional[str] = Field(None, min_length=2, max_length=100)


class CandidateProfile(BaseModel):
    """Detailed candidate profile for company view"""
    id: str
    email: EmailStr
    full_name: str
    phone: str
    job_role: str
    resume_data: ResumeData
    total_interviews: int = 0
    average_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
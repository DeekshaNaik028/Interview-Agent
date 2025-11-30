from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class ResumeData(BaseModel):
    skills: List[str]
    experience_years: int
    education: str
    previous_roles: List[str]
    certifications: Optional[List[str]] = []


class CandidateRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    phone: str
    resume_data: ResumeData
    job_role: str


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
    
    class Config:
        from_attributes = True


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    resume_data: Optional[ResumeData] = None
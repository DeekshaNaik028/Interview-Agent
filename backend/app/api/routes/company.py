from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.evaluation import InterviewEvaluation, EvaluationSummary
from app.api.dependencies import get_current_company
from app.services.firebase_service import firebase_service
from app.utils.constants import COLLECTIONS
from typing import Dict, List


router = APIRouter(prefix="/company", tags=["Company Dashboard"])


@router.get("/interviews", response_model=List[Dict])
async def get_company_interviews(
    company: Dict = Depends(get_current_company)
):
    """Get all interviews for the company"""
    
    interviews = await firebase_service.get_company_interviews(company["id"])
    
    # Enrich with candidate info
    enriched_interviews = []
    for interview in interviews:
        candidate = await firebase_service.get_document(
            COLLECTIONS["CANDIDATES"],
            interview["candidate_id"]
        )
        
        enriched_interviews.append({
            **interview,
            "candidate_name": candidate["full_name"] if candidate else "Unknown",
            "candidate_email": candidate["email"] if candidate else "Unknown"
        })
    
    return enriched_interviews


@router.get("/evaluation/{interview_id}", response_model=InterviewEvaluation)
async def get_interview_evaluation(
    interview_id: str,
    company: Dict = Depends(get_current_company)
):
    """Get detailed evaluation for an interview"""
    
    # Verify interview belongs to company
    interview = await firebase_service.get_document(
        COLLECTIONS["INTERVIEWS"],
        interview_id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    if interview["company_id"] != company["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this evaluation"
        )
    
    # Get evaluation
    evaluation = await firebase_service.get_interview_evaluation(interview_id)
    
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found. Interview may not be completed yet."
        )
    
    return evaluation


@router.get("/evaluations/summary", response_model=List[EvaluationSummary])
async def get_evaluations_summary(
    company: Dict = Depends(get_current_company)
):
    """Get summary of all evaluations"""
    
    # Get all company interviews
    interviews = await firebase_service.get_company_interviews(company["id"])
    
    summaries = []
    for interview in interviews:
        evaluation = await firebase_service.get_interview_evaluation(
            interview["id"]
        )
        
        if evaluation:
            summaries.append({
                "interview_id": interview["id"],
                "overall_score": evaluation["overall_score"],
                "technical_score": evaluation["technical_score"],
                "hr_score": evaluation["hr_score"],
                "recommendation": evaluation["recommendation"]
            })
    
    return summaries


@router.get("/candidate/{candidate_id}")
async def get_candidate_details(
    candidate_id: str,
    company: Dict = Depends(get_current_company)
):
    """Get candidate details"""
    
    candidate = await firebase_service.get_document(
        COLLECTIONS["CANDIDATES"],
        candidate_id
    )
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Remove sensitive info
    candidate.pop("password", None)
    
    return candidate
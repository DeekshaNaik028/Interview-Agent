from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.candidate import CandidateResponse, CandidateUpdate
from app.api.dependencies import get_current_candidate
from app.services.firebase_service import firebase_service
from app.utils.constants import COLLECTIONS
from typing import Dict, List


router = APIRouter(prefix="/candidate", tags=["Candidate"])


@router.get("/me", response_model=CandidateResponse)
async def get_current_candidate_profile(
    candidate: Dict = Depends(get_current_candidate)
):
    """Get current candidate profile"""
    # Remove sensitive data
    candidate.pop("password", None)
    return candidate


@router.put("/me", response_model=CandidateResponse)
async def update_candidate_profile(
    update_data: CandidateUpdate,
    candidate: Dict = Depends(get_current_candidate)
):
    """Update candidate profile"""
    
    # Prepare update data (only non-None fields)
    update_dict = {}
    
    if update_data.full_name:
        update_dict["full_name"] = update_data.full_name
    
    if update_data.phone:
        update_dict["phone"] = update_data.phone
    
    if update_data.resume_data:
        update_dict["resume_data"] = update_data.resume_data.dict()
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update in database
    await firebase_service.update_document(
        COLLECTIONS["CANDIDATES"],
        candidate["id"],
        update_dict
    )
    
    # Get updated candidate
    updated_candidate = await firebase_service.get_document(
        COLLECTIONS["CANDIDATES"],
        candidate["id"]
    )
    
    # Remove password
    updated_candidate.pop("password", None)
    
    return updated_candidate


@router.get("/interviews", response_model=List[Dict])
async def get_candidate_interviews(
    candidate: Dict = Depends(get_current_candidate)
):
    """Get all interviews for the current candidate"""
    
    interviews = await firebase_service.query_documents(
        COLLECTIONS["INTERVIEWS"],
        filters=[("candidate_id", "==", candidate["id"])]
    )
    
    return interviews


@router.get("/interview/{interview_id}/status")
async def get_interview_status(
    interview_id: str,
    candidate: Dict = Depends(get_current_candidate)
):
    """Get interview status"""
    
    interview = await firebase_service.get_document(
        COLLECTIONS["INTERVIEWS"],
        interview_id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    if interview["candidate_id"] != candidate["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return {
        "interview_id": interview["id"],
        "status": interview["status"],
        "current_question_index": interview["current_question_index"],
        "started_at": interview.get("started_at"),
        "completed_at": interview.get("completed_at")
    }
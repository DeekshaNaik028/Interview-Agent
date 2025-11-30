from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.interview import (
    InterviewCreate,
    InterviewResponse,
    InterviewStart,
    AnswerSubmit,
    InterviewClosingResponse
)
from app.schemas.question import QuestionWithAudio
from app.api.dependencies import get_current_candidate, get_current_company
from app.services.firebase_service import firebase_service
from app.services.question_generator import question_generator
from app.services.storage_service import storage_service
from app.services.evaluation_service import evaluation_service
from app.utils.constants import (
    COLLECTIONS,
    InterviewStatus,
    InterviewRound,
    INTERVIEW_CLOSING_MESSAGE,
    TOTAL_QUESTIONS
)
from datetime import datetime
from typing import Dict


router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/create", response_model=InterviewResponse)
async def create_interview(
    interview_data: InterviewCreate,
    company: Dict = Depends(get_current_company)
):
    """Create a new interview session (Company only)"""
    
    # Verify candidate exists
    candidate = await firebase_service.get_document(
        COLLECTIONS["CANDIDATES"],
        interview_data.candidate_id
    )
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    # Create interview
    interview_dict = {
        "candidate_id": interview_data.candidate_id,
        "company_id": company["id"],
        "job_role": interview_data.job_role,
        "status": InterviewStatus.PENDING,
        "current_round": InterviewRound.TECHNICAL,
        "current_question_index": 0,
        "started_at": None,
        "completed_at": None,
        "created_at": datetime.utcnow()
    }
    
    interview_id = await firebase_service.create_document(
        COLLECTIONS["INTERVIEWS"],
        interview_dict
    )
    
    # Generate questions
    await question_generator.generate_interview_questions(
        interview_id=interview_id,
        job_role=interview_data.job_role,
        candidate_skills=candidate["resume_data"]["skills"]
    )
    
    interview = await firebase_service.get_document(
        COLLECTIONS["INTERVIEWS"],
        interview_id
    )
    
    return interview


@router.post("/start", response_model=QuestionWithAudio)
async def start_interview(
    start_data: InterviewStart,
    candidate: Dict = Depends(get_current_candidate)
):
    """Start interview and get first question"""
    
    # Get interview
    interview = await firebase_service.get_document(
        COLLECTIONS["INTERVIEWS"],
        start_data.interview_id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Verify candidate
    if interview["candidate_id"] != candidate["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this interview"
        )
    
    # Update interview status
    await firebase_service.update_document(
        COLLECTIONS["INTERVIEWS"],
        start_data.interview_id,
        {
            "status": InterviewStatus.IN_PROGRESS,
            "started_at": datetime.utcnow()
        }
    )
    
    # Get first question
    question = await question_generator.get_next_question(
        interview_id=start_data.interview_id,
        current_index=0
    )
    
    return question


@router.post("/submit-answer")
async def submit_answer(
    answer_data: AnswerSubmit,
    candidate: Dict = Depends(get_current_candidate)
):
    """Submit answer for current question"""
    
    # Verify interview belongs to candidate
    interview = await firebase_service.get_document(
        COLLECTIONS["INTERVIEWS"],
        answer_data.interview_id
    )
    
    if not interview or interview["candidate_id"] != candidate["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Upload audio to storage
    audio_url = await storage_service.upload_base64_audio(
        base64_audio=answer_data.audio_data,
        interview_id=answer_data.interview_id,
        question_id=answer_data.question_id
    )
    
    # Save answer
    answer_dict = {
        "interview_id": answer_data.interview_id,
        "question_id": answer_data.question_id,
        "audio_url": audio_url,
        "video_chunk_url": answer_data.video_chunk_url,
        "answer_text": answer_data.answer_text,
        "timestamp": datetime.utcnow()
    }
    
    await firebase_service.create_document("answers", answer_dict)
    
    # Update interview progress
    next_index = interview["current_question_index"] + 1
    
    # Check if interview is complete
    if next_index >= TOTAL_QUESTIONS:
        # Mark as completed
        await firebase_service.update_document(
            COLLECTIONS["INTERVIEWS"],
            answer_data.interview_id,
            {
                "status": InterviewStatus.COMPLETED,
                "completed_at": datetime.utcnow(),
                "current_question_index": next_index
            }
        )
        
        # Generate evaluation
        await evaluation_service.generate_final_evaluation(
            interview_id=answer_data.interview_id
        )
        
        return {
            "completed": True,
            "message": INTERVIEW_CLOSING_MESSAGE,
            "next_question": None
        }
    
    # Update progress
    await firebase_service.update_document(
        COLLECTIONS["INTERVIEWS"],
        answer_data.interview_id,
        {"current_question_index": next_index}
    )
    
    # Get next question
    next_question = await question_generator.get_next_question(
        interview_id=answer_data.interview_id,
        current_index=next_index
    )
    
    return {
        "completed": False,
        "message": "Answer submitted successfully",
        "next_question": next_question
    }


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: str,
    candidate: Dict = Depends(get_current_candidate)
):
    """Get interview details"""
    
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
    
    return interview
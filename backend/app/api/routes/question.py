from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.question import QuestionGenerate, QuestionResponse, QuestionWithAudio
from app.api.dependencies import get_current_candidate, get_current_company
from app.services.firebase_service import firebase_service
from app.services.question_generator import question_generator
from app.utils.constants import COLLECTIONS
from typing import Dict, List


router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("/generate", response_model=List[QuestionResponse])
async def generate_questions(
    question_data: QuestionGenerate,
    company: Dict = Depends(get_current_company)
):
    """
    Generate interview questions manually (Company only)
    This is typically done automatically during interview creation,
    but can be called separately for testing or preview.
    """
    
    try:
        from app.services.gemini_service import gemini_service
        
        questions = await gemini_service.generate_questions(
            job_role=question_data.job_role,
            skills=question_data.resume_skills,
            round_type=question_data.round_type,
            count=question_data.count
        )
        
        # Format response
        formatted_questions = []
        for q in questions:
            formatted_questions.append({
                "id": "",  # Will be assigned when saved
                "question_text": q["question"],
                "round_type": question_data.round_type,
                "difficulty": q["difficulty"],
                "expected_keywords": q["expected_keywords"]
            })
        
        return formatted_questions
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating questions: {str(e)}"
        )


@router.get("/interview/{interview_id}", response_model=List[QuestionResponse])
async def get_interview_questions(
    interview_id: str,
    candidate: Dict = Depends(get_current_candidate)
):
    """
    Get all questions for an interview (Candidate view - during interview only)
    Returns only the current question, not all questions at once
    """
    
    # Verify interview belongs to candidate
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
            detail="Not authorized to view this interview"
        )
    
    # Get current question only (for security - don't reveal all questions)
    current_index = interview["current_question_index"]
    
    question = await question_generator.get_next_question(
        interview_id=interview_id,
        current_index=current_index
    )
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No more questions available"
        )
    
    return [question]  # Return as list for consistency


@router.get("/interview/{interview_id}/all", response_model=List[QuestionResponse])
async def get_all_interview_questions(
    interview_id: str,
    company: Dict = Depends(get_current_company)
):
    """
    Get all questions for an interview (Company only - for review)
    """
    
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
            detail="Not authorized to view this interview"
        )
    
    # Get all questions
    questions = await firebase_service.get_interview_questions(interview_id)
    
    # Sort by order
    questions.sort(key=lambda x: x.get("order", 0))
    
    return questions


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: str,
    candidate: Dict = Depends(get_current_candidate)
):
    """
    Get a specific question by ID
    """
    
    question = await firebase_service.get_document(
        COLLECTIONS["QUESTIONS"],
        question_id
    )
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Verify candidate has access to this question's interview
    interview = await firebase_service.get_document(
        COLLECTIONS["INTERVIEWS"],
        question["interview_id"]
    )
    
    if not interview or interview["candidate_id"] != candidate["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this question"
        )
    
    return question


@router.get("/interview/{interview_id}/current", response_model=QuestionResponse)
async def get_current_question(
    interview_id: str,
    candidate: Dict = Depends(get_current_candidate)
):
    """
    Get the current question for an ongoing interview
    """
    
    # Verify interview belongs to candidate
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
    
    # Get current question
    current_index = interview["current_question_index"]
    
    question = await question_generator.get_next_question(
        interview_id=interview_id,
        current_index=current_index
    )
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No current question available"
        )
    
    return question


@router.get("/interview/{interview_id}/stats")
async def get_interview_question_stats(
    interview_id: str,
    company: Dict = Depends(get_current_company)
):
    """
    Get statistics about questions in an interview (Company only)
    """
    
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
            detail="Not authorized"
        )
    
    # Get all questions
    questions = await firebase_service.get_interview_questions(interview_id)
    
    # Calculate stats
    total_questions = len(questions)
    technical_questions = sum(1 for q in questions if q["round_type"] == "technical")
    hr_questions = sum(1 for q in questions if q["round_type"] == "hr")
    
    difficulty_count = {
        "easy": sum(1 for q in questions if q["difficulty"] == "easy"),
        "medium": sum(1 for q in questions if q["difficulty"] == "medium"),
        "hard": sum(1 for q in questions if q["difficulty"] == "hard")
    }
    
    return {
        "interview_id": interview_id,
        "total_questions": total_questions,
        "technical_questions": technical_questions,
        "hr_questions": hr_questions,
        "difficulty_distribution": difficulty_count,
        "current_progress": interview["current_question_index"],
        "completion_percentage": round(
            (interview["current_question_index"] / total_questions * 100) if total_questions > 0 else 0,
            2
        )
    }
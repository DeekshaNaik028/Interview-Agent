from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies import get_current_candidate, get_current_company
from app.services.firebase_service import firebase_service
from app.services.evaluation_service import evaluation_service
from app.utils.constants import COLLECTIONS, InterviewStatus
from typing import Dict


router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.post("/generate/{interview_id}")
async def generate_evaluation(
    interview_id: str,
    company: Dict = Depends(get_current_company)
):
    """
    Generate evaluation for a completed interview (Company only)
    This is typically called automatically after interview completion,
    but can be manually triggered if needed.
    """
    
    # Get interview
    interview = await firebase_service.get_document(
        COLLECTIONS["INTERVIEWS"],
        interview_id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Verify interview belongs to company
    if interview["company_id"] != company["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to evaluate this interview"
        )
    
    # Check if interview is completed
    if interview["status"] != InterviewStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview must be completed before evaluation"
        )
    
    # Check if evaluation already exists
    existing_evaluation = await firebase_service.get_interview_evaluation(interview_id)
    
    if existing_evaluation:
        return {
            "message": "Evaluation already exists",
            "evaluation": existing_evaluation
        }
    
    # Generate evaluation
    try:
        evaluation = await evaluation_service.generate_final_evaluation(interview_id)
        
        return {
            "message": "Evaluation generated successfully",
            "evaluation": evaluation
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating evaluation: {str(e)}"
        )


@router.get("/{interview_id}/status")
async def get_evaluation_status(
    interview_id: str,
    company: Dict = Depends(get_current_company)
):
    """
    Check if evaluation exists for an interview
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
    
    # Check evaluation
    evaluation = await firebase_service.get_interview_evaluation(interview_id)
    
    return {
        "interview_id": interview_id,
        "evaluation_exists": evaluation is not None,
        "interview_status": interview["status"],
        "evaluation_summary": {
            "overall_score": evaluation.get("overall_score"),
            "recommendation": evaluation.get("recommendation")
        } if evaluation else None
    }


@router.delete("/{interview_id}")
async def delete_evaluation(
    interview_id: str,
    company: Dict = Depends(get_current_company)
):
    """
    Delete evaluation for an interview (allows regeneration)
    Company only - useful if evaluation needs to be regenerated
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
    
    # Get evaluation
    evaluation = await firebase_service.get_interview_evaluation(interview_id)
    
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )
    
    # Delete evaluation
    await firebase_service.delete_document(
        COLLECTIONS["EVALUATIONS"],
        evaluation["id"]
    )
    
    return {
        "message": "Evaluation deleted successfully",
        "interview_id": interview_id
    }


@router.get("/candidate/{candidate_id}/summary")
async def get_candidate_evaluation_summary(
    candidate_id: str,
    company: Dict = Depends(get_current_company)
):
    """
    Get evaluation summary for all interviews of a candidate
    """
    
    # Get all interviews for candidate from this company
    interviews = await firebase_service.query_documents(
        COLLECTIONS["INTERVIEWS"],
        filters=[
            ("candidate_id", "==", candidate_id),
            ("company_id", "==", company["id"])
        ]
    )
    
    if not interviews:
        return {
            "candidate_id": candidate_id,
            "total_interviews": 0,
            "evaluations": []
        }
    
    # Get evaluations for each interview
    evaluations_summary = []
    
    for interview in interviews:
        evaluation = await firebase_service.get_interview_evaluation(interview["id"])
        
        if evaluation:
            evaluations_summary.append({
                "interview_id": interview["id"],
                "job_role": interview["job_role"],
                "interview_date": interview.get("completed_at"),
                "overall_score": evaluation["overall_score"],
                "technical_score": evaluation["technical_score"],
                "hr_score": evaluation["hr_score"],
                "recommendation": evaluation["recommendation"]
            })
    
    # Calculate average scores
    if evaluations_summary:
        avg_overall = sum(e["overall_score"] for e in evaluations_summary) / len(evaluations_summary)
        avg_technical = sum(e["technical_score"] for e in evaluations_summary) / len(evaluations_summary)
        avg_hr = sum(e["hr_score"] for e in evaluations_summary) / len(evaluations_summary)
    else:
        avg_overall = avg_technical = avg_hr = 0
    
    return {
        "candidate_id": candidate_id,
        "total_interviews": len(interviews),
        "completed_evaluations": len(evaluations_summary),
        "average_scores": {
            "overall": round(avg_overall, 2),
            "technical": round(avg_technical, 2),
            "hr": round(avg_hr, 2)
        },
        "evaluations": evaluations_summary
    }
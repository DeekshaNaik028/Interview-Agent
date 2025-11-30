from app.services.gemini_service import gemini_service
from app.services.firebase_service import firebase_service
from app.utils.constants import (
    COLLECTIONS,
    InterviewRound,
    SCORING_WEIGHTS
)
from typing import Dict, List
from datetime import datetime


class EvaluationService:
    
    async def evaluate_answer(
        self,
        question_id: str,
        answer_text: str
    ) -> Dict:
        """Evaluate a single answer"""
        
        # Get question details
        question = await firebase_service.get_document(
            COLLECTIONS["QUESTIONS"],
            question_id
        )
        
        if not question:
            raise ValueError("Question not found")
        
        # Evaluate using Gemini
        evaluation = await gemini_service.evaluate_answer(
            question=question["question_text"],
            answer=answer_text,
            expected_keywords=question["expected_keywords"]
        )
        
        # Calculate overall score (weighted average)
        overall_score = (
            evaluation["accuracy"] * SCORING_WEIGHTS["accuracy"] +
            evaluation["relevance"] * SCORING_WEIGHTS["relevance"] +
            evaluation["communication"] * SCORING_WEIGHTS["communication"] +
            evaluation["clarity"] * SCORING_WEIGHTS["clarity"] +
            evaluation["confidence"] * SCORING_WEIGHTS["confidence"]
        )
        
        return {
            "question_id": question_id,
            "question_text": question["question_text"],
            "answer_text": answer_text,
            "criteria_scores": {
                "accuracy": evaluation["accuracy"],
                "relevance": evaluation["relevance"],
                "communication": evaluation["communication"],
                "clarity": evaluation["clarity"],
                "confidence": evaluation["confidence"]
            },
            "overall_score": round(overall_score, 2),
            "feedback": evaluation["feedback"],
            "timestamp": datetime.utcnow()
        }
    
    async def generate_final_evaluation(
        self,
        interview_id: str
    ) -> Dict:
        """Generate final evaluation report for the interview"""
        
        # Get interview details
        interview = await firebase_service.get_document(
            COLLECTIONS["INTERVIEWS"],
            interview_id
        )
        
        if not interview:
            raise ValueError("Interview not found")
        
        # Get candidate details
        candidate = await firebase_service.get_document(
            COLLECTIONS["CANDIDATES"],
            interview["candidate_id"]
        )
        
        # Get all questions
        questions = await firebase_service.get_interview_questions(interview_id)
        
        # Get all answers
        answers = await firebase_service.query_documents(
            "answers",
            filters=[("interview_id", "==", interview_id)]
        )
        
        # Evaluate each answer
        question_evaluations = []
        technical_scores = []
        hr_scores = []
        
        for answer in answers:
            evaluation = await self.evaluate_answer(
                question_id=answer["question_id"],
                answer_text=answer.get("answer_text", "")
            )
            
            question_evaluations.append(evaluation)
            
            # Get question round type
            question = next(
                (q for q in questions if q["id"] == answer["question_id"]),
                None
            )
            
            if question:
                if question["round_type"] == InterviewRound.TECHNICAL:
                    technical_scores.append(evaluation["overall_score"])
                else:
                    hr_scores.append(evaluation["overall_score"])
        
        # Calculate average scores
        technical_score = (
            sum(technical_scores) / len(technical_scores) 
            if technical_scores else 0
        )
        hr_score = (
            sum(hr_scores) / len(hr_scores) 
            if hr_scores else 0
        )
        overall_score = (technical_score + hr_score) / 2
        
        # Generate final report using Gemini
        report = await gemini_service.generate_final_report(
            candidate_name=candidate["full_name"],
            job_role=interview["job_role"],
            evaluations=[{
                "question": e["question_text"],
                "score": e["overall_score"],
                "feedback": e["feedback"]
            } for e in question_evaluations]
        )
        
        # Prepare final evaluation
        final_evaluation = {
            "interview_id": interview_id,
            "candidate_id": interview["candidate_id"],
            "candidate_name": candidate["full_name"],
            "job_role": interview["job_role"],
            "technical_score": round(technical_score, 2),
            "hr_score": round(hr_score, 2),
            "overall_score": round(overall_score, 2),
            "question_evaluations": question_evaluations,
            "video_recording_url": interview.get("video_recording_url", ""),
            "summary": report["summary"],
            "recommendation": report["recommendation"],
            "created_at": datetime.utcnow()
        }
        
        # Save evaluation
        await firebase_service.create_document(
            COLLECTIONS["EVALUATIONS"],
            final_evaluation
        )
        
        return final_evaluation


# Global instance
evaluation_service = EvaluationService()
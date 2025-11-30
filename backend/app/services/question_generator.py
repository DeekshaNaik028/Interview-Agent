from app.services.gemini_service import gemini_service
from app.services.firebase_service import firebase_service
from app.utils.constants import (
    InterviewRound, 
    TECHNICAL_QUESTIONS_COUNT, 
    HR_QUESTIONS_COUNT,
    COLLECTIONS
)
from typing import List, Dict
import uuid


class QuestionGeneratorService:
    
    async def generate_interview_questions(
        self,
        interview_id: str,
        job_role: str,
        candidate_skills: List[str]
    ) -> List[Dict]:
        """Generate all questions for an interview"""
        
        all_questions = []
        
        # Generate Technical Questions
        technical_questions = await gemini_service.generate_questions(
            job_role=job_role,
            skills=candidate_skills,
            round_type=InterviewRound.TECHNICAL,
            count=TECHNICAL_QUESTIONS_COUNT
        )
        
        # Save technical questions
        for idx, q in enumerate(technical_questions):
            question_data = {
                "id": str(uuid.uuid4()),
                "interview_id": interview_id,
                "question_text": q["question"],
                "round_type": InterviewRound.TECHNICAL,
                "difficulty": q["difficulty"],
                "expected_keywords": q["expected_keywords"],
                "order": idx
            }
            await firebase_service.create_document(
                COLLECTIONS["QUESTIONS"],
                question_data
            )
            all_questions.append(question_data)
        
        # Generate HR Questions
        hr_questions = await gemini_service.generate_questions(
            job_role=job_role,
            skills=["communication", "teamwork", "problem-solving"],
            round_type=InterviewRound.HR,
            count=HR_QUESTIONS_COUNT
        )
        
        # Save HR questions
        for idx, q in enumerate(hr_questions):
            question_data = {
                "id": str(uuid.uuid4()),
                "interview_id": interview_id,
                "question_text": q["question"],
                "round_type": InterviewRound.HR,
                "difficulty": q["difficulty"],
                "expected_keywords": q["expected_keywords"],
                "order": idx + TECHNICAL_QUESTIONS_COUNT
            }
            await firebase_service.create_document(
                COLLECTIONS["QUESTIONS"],
                question_data
            )
            all_questions.append(question_data)
        
        return all_questions
    
    async def get_next_question(
        self,
        interview_id: str,
        current_index: int
    ) -> Dict:
        """Get the next question for an interview"""
        
        questions = await firebase_service.get_interview_questions(interview_id)
        
        # Sort by order
        questions.sort(key=lambda x: x.get("order", 0))
        
        if current_index < len(questions):
            return questions[current_index]
        
        return None


# Global instance
question_generator = QuestionGeneratorService()
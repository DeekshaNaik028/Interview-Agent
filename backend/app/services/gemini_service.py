import google.generativeai as genai
from app.core.config import settings
from typing import Dict, List
import json


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    async def generate_text(self, prompt: str) -> str:
        """Generate text response from Gemini"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error generating text: {e}")
            raise
    
    async def generate_questions(
        self, 
        job_role: str, 
        skills: List[str], 
        round_type: str,
        count: int
    ) -> List[Dict]:
        """Generate interview questions based on job role and skills"""
        
        prompt = f"""
        Generate {count} {round_type} interview questions for a {job_role} position.
        
        Candidate Skills: {', '.join(skills)}
        
        Requirements:
        - Questions should be relevant to the job role
        - Mix of easy, medium, and hard difficulty
        - Focus on practical scenarios
        {"- Technical questions should assess programming, problem-solving, and technical knowledge" if round_type == "technical" else "- HR questions should assess soft skills, cultural fit, and behavioral aspects"}
        
        Return ONLY a JSON array with this exact structure:
        [
            {{
                "question": "question text here",
                "difficulty": "easy|medium|hard",
                "expected_keywords": ["keyword1", "keyword2", "keyword3"]
            }}
        ]
        """
        
        response_text = await self.generate_text(prompt)
        
        # Parse JSON from response
        try:
            # Clean the response if it contains markdown code blocks
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            questions = json.loads(cleaned.strip())
            return questions
        except json.JSONDecodeError as e:
            print(f"Error parsing questions JSON: {e}")
            print(f"Response: {response_text}")
            raise
    
    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        expected_keywords: List[str]
    ) -> Dict:
        """Evaluate candidate's answer using Gemini"""
        
        prompt = f"""
        Evaluate this interview answer on a scale of 0-10 for each criterion.
        
        Question: {question}
        Expected Keywords: {', '.join(expected_keywords)}
        Candidate's Answer: {answer}
        
        Evaluate based on:
        1. Accuracy: How correct is the answer?
        2. Relevance: How relevant is the answer to the question?
        3. Communication: How well is the answer communicated?
        4. Clarity: How clear and structured is the answer?
        5. Confidence: How confident does the answer seem?
        
        Return ONLY a JSON object with this exact structure:
        {{
            "accuracy": 7.5,
            "relevance": 8.0,
            "communication": 7.0,
            "clarity": 8.5,
            "confidence": 7.5,
            "feedback": "Detailed feedback explaining the scores"
        }}
        """
        
        response_text = await self.generate_text(prompt)
        
        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            evaluation = json.loads(cleaned.strip())
            return evaluation
        except json.JSONDecodeError as e:
            print(f"Error parsing evaluation JSON: {e}")
            raise
    
    async def generate_final_report(
        self,
        candidate_name: str,
        job_role: str,
        evaluations: List[Dict]
    ) -> Dict:
        """Generate final interview report"""
        
        prompt = f"""
        Generate a comprehensive interview evaluation report.
        
        Candidate: {candidate_name}
        Position: {job_role}
        
        Question Evaluations: {json.dumps(evaluations, indent=2)}
        
        Provide:
        1. Overall summary of performance
        2. Strengths and weaknesses
        3. Hiring recommendation (Strongly Recommend, Recommend, Maybe, Not Recommend)
        
        Return ONLY a JSON object:
        {{
            "summary": "Overall performance summary",
            "recommendation": "Strongly Recommend|Recommend|Maybe|Not Recommend"
        }}
        """
        
        response_text = await self.generate_text(prompt)
        
        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            report = json.loads(cleaned.strip())
            return report
        except json.JSONDecodeError:
            return {
                "summary": "Unable to generate summary",
                "recommendation": "Manual Review Required"
            }


# Global instance
gemini_service = GeminiService()
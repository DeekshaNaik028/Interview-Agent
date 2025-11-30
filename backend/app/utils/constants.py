from enum import Enum


class UserRole(str, Enum):
    CANDIDATE = "candidate"
    COMPANY = "company"
    ADMIN = "admin"


class InterviewStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class InterviewRound(str, Enum):
    TECHNICAL = "technical"
    HR = "hr"


class QuestionDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class EvaluationCriteria(str, Enum):
    ACCURACY = "accuracy"
    RELEVANCE = "relevance"
    COMMUNICATION = "communication"
    CLARITY = "clarity"
    CONFIDENCE = "confidence"


# Firestore Collections
COLLECTIONS = {
    "CANDIDATES": "candidates",
    "COMPANIES": "companies",
    "INTERVIEWS": "interviews",
    "QUESTIONS": "questions",
    "EVALUATIONS": "evaluations",
    "RESUMES": "resumes",
    "RECORDINGS": "recordings"
}


# Interview Configuration
TECHNICAL_QUESTIONS_COUNT = 8
HR_QUESTIONS_COUNT = 5
TOTAL_QUESTIONS = TECHNICAL_QUESTIONS_COUNT + HR_QUESTIONS_COUNT


# Evaluation Scoring
SCORING_WEIGHTS = {
    EvaluationCriteria.ACCURACY: 0.30,
    EvaluationCriteria.RELEVANCE: 0.25,
    EvaluationCriteria.COMMUNICATION: 0.20,
    EvaluationCriteria.CLARITY: 0.15,
    EvaluationCriteria.CONFIDENCE: 0.10
}


# Messages
INTERVIEW_CLOSING_MESSAGE = "Thank you for attending the interview. Your responses have been recorded and will be reviewed by our team. We will get back to you soon."
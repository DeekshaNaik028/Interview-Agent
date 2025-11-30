from app.schemas.candidate import (
    ResumeData,
    CandidateRegister,
    CandidateLogin,
    CandidateResponse,
    CandidateUpdate,
    CandidateProfile
)
from app.schemas.interview import (
    InterviewCreate,
    InterviewStart,
    InterviewResponse,
    AnswerSubmit,
    AnswerResponse,
    InterviewClosingResponse,
    InterviewStatusResponse,
    InterviewListItem,
    InterviewUpdate,
    InterviewCancel,
    InterviewProgress
)
from app.schemas.question import (
    QuestionGenerate,
    QuestionResponse,
    QuestionWithAudio,
    QuestionDetail,
    QuestionCreate,
    QuestionUpdate,
    QuestionBulkCreate,
    QuestionStats,
    QuestionBank,
    QuestionTemplate
)
from app.schemas.evaluation import (
    CriteriaScore,
    QuestionEvaluation,
    InterviewEvaluation,
    EvaluationSummary,
    EvaluationRequest,
    EvaluationResponse,
    BatchEvaluationRequest,
    BatchEvaluationResponse,
    EvaluationStats
)

__all__ = [
    # Candidate schemas
    "ResumeData",
    "CandidateRegister",
    "CandidateLogin",
    "CandidateResponse",
    "CandidateUpdate",
    "CandidateProfile",
    # Interview schemas
    "InterviewCreate",
    "InterviewStart",
    "InterviewResponse",
    "AnswerSubmit",
    "AnswerResponse",
    "InterviewClosingResponse",
    "InterviewStatusResponse",
    "InterviewListItem",
    "InterviewUpdate",
    "InterviewCancel",
    "InterviewProgress",
    # Question schemas
    "QuestionGenerate",
    "QuestionResponse",
    "QuestionWithAudio",
    "QuestionDetail",
    "QuestionCreate",
    "QuestionUpdate",
    "QuestionBulkCreate",
    "QuestionStats",
    "QuestionBank",
    "QuestionTemplate",
    # Evaluation schemas
    "CriteriaScore",
    "QuestionEvaluation",
    "InterviewEvaluation",
    "EvaluationSummary",
    "EvaluationRequest",
    "EvaluationResponse",
    "BatchEvaluationRequest",
    "BatchEvaluationResponse",
    "EvaluationStats"
]
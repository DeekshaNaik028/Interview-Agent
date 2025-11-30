export const USER_ROLES = {
  CANDIDATE: 'candidate',
  COMPANY: 'company',
  ADMIN: 'admin',
};

export const INTERVIEW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const INTERVIEW_ROUNDS = {
  TECHNICAL: 'technical',
  HR: 'hr',
};

export const QUESTION_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Total questions in an interview
export const TOTAL_QUESTIONS = 13;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CANDIDATE_DASHBOARD: '/candidate/dashboard',
  CANDIDATE_PROFILE: '/candidate/profile',
  CANDIDATE_INTERVIEWS: '/candidate/interviews',
  INTERVIEW_LOBBY: '/interview/:id/lobby',
  INTERVIEW_ROOM: '/interview/:id/room',
  INTERVIEW_COMPLETE: '/interview/:id/complete',
  COMPANY_DASHBOARD: '/company/dashboard',
  COMPANY_INTERVIEWS: '/company/interviews',
  COMPANY_CANDIDATES: '/company/candidates',
  COMPANY_EVALUATION: '/company/evaluation/:id',
  COMPANY_CREATE_INTERVIEW: '/company/create-interview',
};

export const API_ENDPOINTS = {
  // Auth
  REGISTER_CANDIDATE: '/auth/register/candidate',
  LOGIN_CANDIDATE: '/auth/login/candidate',
  LOGIN_COMPANY: '/auth/login/company',
  
  // Candidate
  CANDIDATE_PROFILE: '/candidate/me',
  CANDIDATE_INTERVIEWS: '/candidate/interviews',
  
  // Interview
  CREATE_INTERVIEW: '/interview/create',
  START_INTERVIEW: '/interview/start',
  SUBMIT_ANSWER: '/interview/submit-answer',
  GET_INTERVIEW: '/interview',
  
  // Questions
  GET_CURRENT_QUESTION: '/questions/interview',
  
  // Company
  COMPANY_INTERVIEWS: '/company/interviews',
  COMPANY_EVALUATION: '/company/evaluation',
  
  // Evaluation
  GENERATE_EVALUATION: '/evaluation/generate',
};

export const MEDIA_CONSTRAINTS = {
  VIDEO: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  AUDIO: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  INTERVIEW_STATE: 'interview_state',
};
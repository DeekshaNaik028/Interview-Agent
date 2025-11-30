export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'Interview Agent System',
  maxVideoSizeMB: parseInt(import.meta.env.VITE_MAX_VIDEO_SIZE_MB) || 500,
  maxAudioSizeMB: parseInt(import.meta.env.VITE_MAX_AUDIO_SIZE_MB) || 50,
  interviewTimeLimit: parseInt(import.meta.env.VITE_INTERVIEW_TIME_LIMIT_MINUTES) || 60,
  questionTimeLimit: parseInt(import.meta.env.VITE_QUESTION_TIME_LIMIT_SECONDS) || 180,
};
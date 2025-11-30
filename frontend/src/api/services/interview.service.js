import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '@/utils/constants';

export const interviewService = {
  getInterview: async (interviewId) => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.GET_INTERVIEW}/${interviewId}`
    );
    return response.data;
  },

  startInterview: async (interviewId) => {
    const response = await axiosInstance.post(API_ENDPOINTS.START_INTERVIEW, {
      interview_id: interviewId,
    });
    return response.data;
  },

  submitAnswer: async (answerData) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.SUBMIT_ANSWER,
      answerData
    );
    return response.data;
  },

  getCurrentQuestion: async (interviewId) => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.GET_CURRENT_QUESTION}/${interviewId}/current`
    );
    return response.data;
  },
};
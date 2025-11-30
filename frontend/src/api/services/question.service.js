import axiosInstance from '../axios.config';

export const questionService = {
  generateQuestions: async (data) => {
    const response = await axiosInstance.post('/questions/generate', data);
    return response.data;
  },

  getInterviewQuestions: async (interviewId) => {
    const response = await axiosInstance.get(
      `/questions/interview/${interviewId}`
    );
    return response.data;
  },

  getAllInterviewQuestions: async (interviewId) => {
    const response = await axiosInstance.get(
      `/questions/interview/${interviewId}/all`
    );
    return response.data;
  },

  getQuestionStats: async (interviewId) => {
    const response = await axiosInstance.get(
      `/questions/interview/${interviewId}/stats`
    );
    return response.data;
  },
};
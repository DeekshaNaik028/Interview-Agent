import axiosInstance from '../axios.config';

export const evaluationService = {
  generateEvaluation: async (interviewId) => {
    const response = await axiosInstance.post(
      `/evaluation/generate/${interviewId}`
    );
    return response.data;
  },

  getEvaluationStatus: async (interviewId) => {
    const response = await axiosInstance.get(
      `/evaluation/${interviewId}/status`
    );
    return response.data;
  },

  deleteEvaluation: async (interviewId) => {
    const response = await axiosInstance.delete(
      `/evaluation/${interviewId}`
    );
    return response.data;
  },

  getCandidateEvaluationSummary: async (candidateId) => {
    const response = await axiosInstance.get(
      `/evaluation/candidate/${candidateId}/summary`
    );
    return response.data;
  },
};

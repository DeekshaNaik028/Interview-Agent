import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '@/utils/constants';

export const companyService = {
  createInterview: async (data) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.CREATE_INTERVIEW,
      data
    );
    return response.data;
  },

  getInterviews: async () => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.COMPANY_INTERVIEWS
    );
    return response.data;
  },

  getEvaluation: async (interviewId) => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.COMPANY_EVALUATION}/${interviewId}`
    );
    return response.data;
  },

  getEvaluationSummary: async () => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.COMPANY_EVALUATION}s/summary`
    );
    return response.data;
  },

  getCandidateDetails: async (candidateId) => {
    const response = await axiosInstance.get(
      `/company/candidate/${candidateId}`
    );
    return response.data;
  },
};

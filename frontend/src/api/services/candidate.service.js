import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '@/utils/constants';

export const candidateService = {
  getProfile: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.CANDIDATE_PROFILE);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.CANDIDATE_PROFILE,
      data
    );
    return response.data;
  },

  getInterviews: async () => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.CANDIDATE_INTERVIEWS
    );
    return response.data;
  },

  getInterviewStatus: async (interviewId) => {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.CANDIDATE_INTERVIEWS}/${interviewId}/status`
    );
    return response.data;
  },
};
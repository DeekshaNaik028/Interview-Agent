import axiosInstance from '../axios.config';
import { storage } from '@/utils/storage';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants';

export const authService = {
  registerCandidate: async (data) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.REGISTER_CANDIDATE,
      data
    );
    return response.data;
  },

  loginCandidate: async (credentials) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.LOGIN_CANDIDATE,
      credentials
    );
    return response.data;
  },

  loginCompany: async (credentials) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.LOGIN_COMPANY,
      credentials
    );
    return response.data;
  },

  logout: () => {
    // Clear local storage
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_DATA);
  },
};
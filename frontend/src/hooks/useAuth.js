import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS, ROUTES } from '@/utils/constants';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    const userData = storage.get(STORAGE_KEYS.USER_DATA);

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const login = async (credentials, role = 'candidate') => {
    try {
      setLoading(true);
      const response = role === 'candidate' 
        ? await authService.loginCandidate(credentials)
        : await authService.loginCompany(credentials);

      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
      storage.set(STORAGE_KEYS.USER_DATA, response.user);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      
      // Navigate based on role
      const dashboardRoute = role === 'candidate' 
        ? ROUTES.CANDIDATE_DASHBOARD 
        : ROUTES.COMPANY_DASHBOARD;
      navigate(dashboardRoute);
      
      return response;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      await authService.registerCandidate(data);
      toast.success('Registration successful! Please login.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };
};
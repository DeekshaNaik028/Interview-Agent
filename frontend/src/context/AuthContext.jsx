import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/services/auth.service';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS, ROUTES, USER_ROLES } from '@/utils/constants';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
      console.log('Login attempt:', { email: credentials.email, role });
      
      const response = role === USER_ROLES.CANDIDATE
        ? await authService.loginCandidate(credentials)
        : await authService.loginCompany(credentials);

      console.log('Login response:', response);

      // Store token and user data
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
      storage.set(STORAGE_KEYS.USER_DATA, response.user);

      setUser(response.user);
      setIsAuthenticated(true);

      toast.success('Login successful!');

      // Navigate based on role
      if (role === USER_ROLES.CANDIDATE) {
        navigate(ROUTES.CANDIDATE_DASHBOARD);
      } else {
        navigate(ROUTES.COMPANY_DASHBOARD);
      }

      return response;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const register = async (data) => {
    try {
      await authService.registerCandidate(data);
      toast.success('Registration successful! Please login.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  const updateUser = (userData) => {
    setUser(userData);
    storage.set(STORAGE_KEYS.USER_DATA, userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
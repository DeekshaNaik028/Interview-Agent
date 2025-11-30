import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/api';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    const response = role === 'candidate'
      ? await authService.loginCandidate(credentials)
      : await authService.loginCompany(credentials);

    storage.set(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
    storage.set(STORAGE_KEYS.USER_DATA, response.user);

    setUser(response.user);
    setIsAuthenticated(true);

    return response;
  };

  const register = async (data) => {
    await authService.registerCandidate(data);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
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
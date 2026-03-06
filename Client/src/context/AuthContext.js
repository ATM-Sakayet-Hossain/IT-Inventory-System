import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      delete axiosInstance.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      const apiMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg;

      let message = apiMessage;
      if (!message) {
        if (!error.response) {
          // Network / CORS / unreachable backend
          message = `Network error: ${error.message || 'Unable to reach server'}`;
        } else {
          message = 'Login failed';
        }
      }

      // Helpful for debugging in browser devtools
      // eslint-disable-next-line no-console
      console.error('Login error:', {
        message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return {
        success: false,
        message,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await axiosInstance.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isITStaff: user?.role === 'IT Staff' || user?.role === 'Admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

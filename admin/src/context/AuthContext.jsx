import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/users/profile');
      if (response.data.success && response.data.data.user.role === 'admin') {
        setUser(response.data.data.user);
      }
    } catch (error) {
      // Handle error - clear tokens if unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if token exists and fetch user profile
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;
        console.log('User from login:', user);
        
        if (user.role !== 'admin') {
          return {
            success: false,
            message: 'Access denied. Admin role required.'
          };
        }
        
        // Store tokens in localStorage
        if (token) {
          localStorage.setItem('access_token', token);
        }
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        
        setUser(user);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.error?.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.error?.message || error.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


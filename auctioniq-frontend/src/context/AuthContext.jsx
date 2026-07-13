import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('auctioniq_token');
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to restore auth session:", error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, ...userData } = response.data;
      localStorage.setItem('auctioniq_token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid username or password'
      };
    }
  };

  const register = async (username, email, password, favoriteTeam) => {
    try {
      const response = await api.post('/auth/register', { username, email, password, favoriteTeam });
      const { token, ...userData } = response.data;
      localStorage.setItem('auctioniq_token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auctioniq_token');
    setUser(null);
  };

  const updateProfile = async (email, favoriteTeam) => {
    try {
      const response = await api.put(`/auth/profile?email=${encodeURIComponent(email)}&favoriteTeam=${encodeURIComponent(favoriteTeam)}`);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

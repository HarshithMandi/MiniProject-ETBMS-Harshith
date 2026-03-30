import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/endpoints.js';
import { getToken, setToken, getUser, setUser, clearAuth } from '../utils/token.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (token && userData) {
      setUserState(userData);
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (email, password, role = 'customer') => {
    try {
      setError(null);
      const normalizedEmail = (email || '').trim().toLowerCase();
      const response = await authApi.register({ email: normalizedEmail, password, role });
      const { access_token, user: userData } = response.data || {};

      if (access_token) {
        setToken(access_token);
      }

      if (userData) {
        setUser(userData);
        setUserState(userData);
        return { success: true, data: userData };
      }

      // Fallback: if backend didn't include user, fetch it.
      if (access_token) {
        const me = await authApi.getProfile();
        setUser(me.data);
        setUserState(me.data);
        return { success: true, data: me.data };
      }

      return { success: true, data: null };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const normalizedEmail = (email || '').trim().toLowerCase();
      const response = await authApi.login({ email: normalizedEmail, password });
      const { access_token, user: userData } = response.data || {};

      if (access_token) {
        setToken(access_token);
      }

      if (userData) {
        setUser(userData);
        setUserState(userData);
        return { success: true, data: userData };
      }

      // Fallback: if backend didn't include user, fetch it.
      if (access_token) {
        const me = await authApi.getProfile();
        setUser(me.data);
        setUserState(me.data);
        return { success: true, data: me.data };
      }

      return { success: true, data: null };
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      clearAuth();
      setUserState(null);
      setError(null);
    }
  }, []);

  const getProfile = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      const userData = response.data;
      setUser(userData);
      setUserState(userData);
      return { success: true, data: userData };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to fetch profile';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    setError,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    getProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

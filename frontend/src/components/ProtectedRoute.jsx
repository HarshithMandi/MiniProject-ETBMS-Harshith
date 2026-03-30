import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loader } from './Loader.jsx';
import { normalizeRole } from '../utils/constants.js';
import { getToken } from '../utils/token.js';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const userRole = normalizeRole(user?.role);
  const targetRole = normalizeRole(requiredRole);
  const token = getToken();

  if (loading) {
    return <Loader />;
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (targetRole && userRole !== targetRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loader } from './Loader.jsx';
import { normalizeRole } from '../utils/constants.js';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const userRole = normalizeRole(user?.role);
  const targetRole = normalizeRole(requiredRole);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (targetRole && userRole !== targetRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

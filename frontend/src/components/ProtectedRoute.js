import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkAnyPermission } from '../utils/permissions';

const ProtectedRoute = ({ children, roles = [], permissions = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role OR permissions
  const hasRole = roles.length === 0 || roles.includes(user.role);
  const hasPermission = permissions.length === 0 || checkAnyPermission(user, permissions);
  
  if (!hasRole && !hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

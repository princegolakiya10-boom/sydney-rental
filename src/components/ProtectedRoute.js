// ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="page-loader"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (role && user.role !== role) return (
    <div className="page-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2>Access restricted</h2>
      <p className="text-muted" style={{ marginTop: 8 }}>
        This page requires a <strong>{role}</strong> account.
      </p>
    </div>
  );

  return children;
}

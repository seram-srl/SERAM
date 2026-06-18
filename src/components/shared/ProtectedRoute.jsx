import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * ProtectedRoute Component
 * Redirects unauthenticated users to `/login`
 */
export default function ProtectedRoute({ children }) {
  const { supabaseUser, activeRole } = useApp();
  const location = useLocation();

  const isAuth = !!supabaseUser || activeRole === 'AdminMod';

  if (!isAuth) {
    // Redirige al login, guardando la ubicación previa
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

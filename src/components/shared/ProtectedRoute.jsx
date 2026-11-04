import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const PARTNER_EMAILS = [
  'barrientoso2401@gmail.com',
  'fernandoaraujo1912@gmail.com'
];

/**
 * ProtectedRoute Component
 * Redirige usuarios sin autenticar a `/login`.
 * Valida la coherencia de sesión y roles para prevenir accesos no autorizados.
 */
export default function ProtectedRoute({ children }) {
  const { supabaseUser, activeRole, currentSocio } = useApp();
  const location = useLocation();

  // Validación estricta de sesión:
  // 1. Usuario regular con sesión activa de Supabase
  // 2. O socio institucional directivo con rol AdminMod y perfil verificado
  const isDirectivoAuth =
    activeRole === 'AdminMod' &&
    !!currentSocio?.email &&
    PARTNER_EMAILS.includes(currentSocio.email.toLowerCase());

  const isStandardAuth = !!supabaseUser;

  const isAuth = isStandardAuth || isDirectivoAuth;

  if (!isAuth) {
    // Redirige al login, guardando la ubicación previa
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

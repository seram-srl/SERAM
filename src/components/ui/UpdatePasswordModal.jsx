import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, X, Loader2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * @component UpdatePasswordModal
 * @description Modal Neuform de actualización de contraseña tras recovery link de Supabase (#type=recovery).
 */
export default function UpdatePasswordModal() {
  const navigate = useNavigate();
  const {
    showUpdatePasswordModal,
    setShowUpdatePasswordModal,
    handleUpdateUserPassword,
    triggerToast
  } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const hasMinLength = password.length >= 8;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = hasMinLength && passwordsMatch && !isSubmitting;

  const handleClose = useCallback(() => {
    setShowUpdatePasswordModal(false);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMsg('');
    setIsSuccess(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [setShowUpdatePasswordModal]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showUpdatePasswordModal) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUpdatePasswordModal, handleClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hasMinLength) {
      setErrorMsg('La contraseña debe tener al minímo 8 caracteres.');
      triggerToast('La contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg('Las contraseñas no coinciden.');
      triggerToast('Las contraseñas no coinciden.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await handleUpdateUserPassword(password);
    setIsSubmitting(false);

    if (result && result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
        if (result.isPartner) {
          navigate('/dashboard');
        }
      }, 1200);
    } else {
      setErrorMsg(result?.error?.message || 'Error al actualizar la contraseña');
    }
  };

  if (!showUpdatePasswordModal) return null;

  return (
    <div
      className="fixed inset-0 z-[125] flex items-center justify-center overflow-hidden animate-fadeIn px-4"
      role="dialog"
      aria-modal="true"
    >
      {/* FONDO CINEMATOGRÁFICO CON PAISAJE HERO */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <img
          src="/assets/3d-backend/bg_home.webp"
          alt=""
          className="w-full h-full object-cover object-center filter blur-[6px] brightness-[0.70] contrast-[1.05]"
        />
        {/* Capa de oscurecimiento y gradiente para contraste Neuform y legibilidad WCAG AAA */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/85" />
        {/* Retícula técnica Neuform */}
        <div className="absolute inset-0 neuform-grid-bg opacity-25" />
      </div>

      {/* Círculos de luz atmosféricos */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#00e03c]/10 blur-[150px] pointer-events-none" />

      <div className="rounded-3xl w-full max-w-md p-8 sm:p-10 shadow-2xl shadow-black/95 relative z-10 animate-fadeIn bg-[#080f08]/90 backdrop-blur-2xl border border-[#1a3a1a]/80">
        {/* Botón Cerrar */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 bg-white/[0.04] hover:bg-white/10 rounded-full border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          data-cursor-text="CERRAR"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-center">
              <div className="bg-[#00e03c]/20 border border-[#00e03c]/40 p-4 rounded-full animate-bounce shadow-[0_0_30px_rgba(0,224,60,0.3)]">
                <CheckCircle2 className="w-12 h-12 text-[#00e03c]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none font-tech">
                Contraseña Actualizada
              </h3>
              <p className="text-xs text-slate-300 animate-pulse font-medium mt-2">
                Credenciales renovadas exitosamente en Supabase Auth...
              </p>
            </div>
            <div className="w-full bg-[#05100a]/80 border border-[#1a3a1a] rounded-2xl p-4 flex items-center justify-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#00e03c]" />
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider">
                REDIRECTION IN PROGRESS
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-[#00e03c]/15 border border-[#00e03c]/40 p-4 rounded-2xl shadow-[0_0_20px_rgba(0,224,60,0.15)] animate-pulse">
                  <ShieldCheck className="w-8 h-8 text-[#00e03c]" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#00e03c] uppercase tracking-widest bg-[#00e03c]/15 border border-[#00e03c]/35 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,224,60,0.15)]">
                Recuperación Segura
              </span>
              <h2 className="text-xl font-black text-white tracking-tight uppercase font-tech mt-3">
                Restablecer Contraseña
              </h2>
              <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
                Define tu nueva contraseña segura para recuperar el acceso a tu cuenta en SERAM.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-left flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nueva Contraseña */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-slate-300 uppercase tracking-[0.2em]">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Mínimo 8 caracteres"
                    disabled={isSubmitting}
                    className="w-full bg-[#05100a]/80 border border-[#1a3a1a] focus:border-[#00e03c] text-white text-xs px-4 py-3.5 pl-11 pr-11 rounded-xl focus:outline-none transition-all font-mono placeholder:text-slate-600 focus:ring-1 focus:ring-[#00e03c]/40"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') setShowPassword(true);
                    }}
                    onKeyUp={() => setShowPassword(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                    title="Mantén presionado para ver la contraseña"
                    aria-label="Mantén presionado para ver la contraseña"
                    tabIndex={-1}
                  >
                    {showPassword ? <Eye className="w-4 h-4 text-[#00e03c]" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Contraseña */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-slate-300 uppercase tracking-[0.2em]">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Repite tu contraseña"
                    disabled={isSubmitting}
                    className="w-full bg-[#05100a]/80 border border-[#1a3a1a] focus:border-[#00e03c] text-white text-xs px-4 py-3.5 pl-11 pr-11 rounded-xl focus:outline-none transition-all font-mono placeholder:text-slate-600 focus:ring-1 focus:ring-[#00e03c]/40"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    onTouchStart={() => setShowConfirmPassword(true)}
                    onTouchEnd={() => setShowConfirmPassword(false)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') setShowConfirmPassword(true);
                    }}
                    onKeyUp={() => setShowConfirmPassword(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                    title="Mantén presionado para ver la contraseña"
                    aria-label="Mantén presionado para ver la contraseña"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <Eye className="w-4 h-4 text-[#00e03c]" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Indicadores de requisitos */}
              <div className="p-3 bg-[#05100a]/50 rounded-xl border border-[#1a3a1a]/60 space-y-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-[#00e03c]' : 'text-slate-600'}`} />
                  <span className={hasMinLength ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    Mínimo 8 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-[#00e03c]' : 'text-slate-600'}`} />
                  <span className={passwordsMatch ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    Las contraseñas coinciden
                  </span>
                </div>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-[#00e03c] text-slate-950 py-3.5 rounded-xl font-black uppercase tracking-wider text-[11px] hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                data-cursor-text="GUARDAR"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Actualizando en Supabase...
                  </>
                ) : (
                  'Actualizar y Acceder'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  AlertCircle,
  X,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import AuthHeroBackground from '../../components/ui/AuthHeroBackground';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    handleLoginSupabase,
    handleResendConfirmation,
    handleResetPassword,
    registeredUsers
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Estados de Asistencia (Reenviar confirmación / Restablecer contraseña)
  const [showAssistModal, setShowAssistModal] = useState(false);
  const [assistMode, setAssistMode] = useState('resend'); // 'resend' | 'reset'
  const [assistEmail, setAssistEmail] = useState('');
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistStatus, setAssistStatus] = useState(null);

  // Detecta si el email ingresado coincide con un socio directivo
  const detectedPartner = (registeredUsers || []).find(
    u => (u.role === 'AdminMod' || u.name?.startsWith('Ing.')) && u.email?.toLowerCase() === email.trim().toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setLastError(null);
    const result = await handleLoginSupabase(email, password);
    setLoading(false);

    if (result.success) {
      if (result.redirectTo === '/dashboard' || result.isPartner) {
        navigate('/dashboard');
      } else {
        navigate('/academy');
      }
    } else {
      const errMsg = result.error?.message || 'Error de autenticación';
      setLastError(errMsg);
    }
  };

  const isEmailNotConfirmed = lastError && lastError.toLowerCase().includes('email not confirmed');

  const handleOpenAssist = (mode) => {
    setAssistMode(mode);
    setAssistEmail(email.trim());
    setAssistStatus(null);
    setShowAssistModal(true);
  };

  const handleExecuteAssist = async (e) => {
    e.preventDefault();
    if (!assistEmail.trim()) return;

    setAssistLoading(true);
    setAssistStatus(null);

    let res;
    if (assistMode === 'resend') {
      res = await handleResendConfirmation(assistEmail);
    } else {
      res = await handleResetPassword(assistEmail);
    }

    setAssistLoading(false);
    if (res?.success) {
      setAssistStatus({
        type: 'success',
        text: assistMode === 'resend'
          ? 'Enlace de confirmación reenviado. Revisa tu bandeja de entrada o spam.'
          : 'Instrucciones para restablecer contraseña enviadas a tu correo.'
      });
    } else {
      setAssistStatus({
        type: 'error',
        text: res?.error?.message || 'No se pudo procesar la solicitud. Verifica el correo ingresado.'
      });
    }
  };

  return (
    <div className="inner-page relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <AuthHeroBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md neuform-card p-8 z-10 backdrop-blur-xl relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/brand/logo-seram-white.webp"
              alt="SERAM - Una Experiencia Ambiental"
              className="h-10 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,224,60,0.35)]"
            />
          </div>
          <span className="neuform-badge neuform-badge-accent mb-3">SERAM AUTH</span>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-400 mt-2 tracking-wide">
            Ingresa a tu cuenta de servicios y academia ambiental
          </p>
        </div>

        {/* Alerta contextual si hay error de correo no verificado */}
        {isEmailNotConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2"
          >
            <div className="flex items-start gap-2.5 text-xs font-semibold text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold">Correo Electrónico No Confirmado</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Tu cuenta aún no ha sido activada en Supabase.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAssist('resend')}
              className="w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reenviar Correo de Activación
            </button>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="section-label" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (lastError) setLastError(null);
                }}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00e03c] transition-all"
                placeholder="tu@correo.com"
                style={{ cursor: 'none' }}
              />
            </div>
          </div>

          {/* Reconocimiento sobrio de Socio Fundador sin credenciales expuestas */}
          {detectedPartner && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/30 text-left space-y-0.5 shadow-[0_0_15px_rgba(0,224,60,0.1)]"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#00e03c]">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#00e03c]" />
                <span>Perfil Directivo Detectado: {detectedPartner.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                Ingresa con tu contraseña institucional registrada en Supabase.
              </p>
            </motion.div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="section-label" htmlFor="password">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => handleOpenAssist('reset')}
                className="text-[11px] text-[#00e03c] hover:underline transition-colors cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (lastError) setLastError(null);
                }}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00e03c] transition-all"
                placeholder="••••••••"
                style={{ cursor: 'none' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/30 text-[#00e03c] hover:bg-[#00e03c]/20 hover:border-[#00e03c]/50 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-none disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Opciones de Asistencia de Acceso */}
        <div className="mt-4 pt-3 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => handleOpenAssist('resend')}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-[#00e03c]" /> Reenviar confirmación
          </button>
          <span className="text-white/20">•</span>
          <button
            type="button"
            onClick={() => handleOpenAssist('reset')}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3 h-3 text-[#00e03c]" /> Recuperar clave
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center border-t border-white/5 pt-4 text-xs text-slate-400">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="text-[#00e03c] font-semibold hover:underline"
            style={{ cursor: 'none' }}
          >
            Regístrate aquí
          </Link>
        </div>
      </motion.div>

      {/* Modal de Asistencia de Acceso (Reenvío y Recuperación) */}
      <AnimatePresence>
        {showAssistModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[#080f08]/98 backdrop-blur-2xl border border-[#1a3a1a]/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative"
            >
              {/* Cerrar */}
              <button
                type="button"
                onClick={() => setShowAssistModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#00e03c]/15 border border-[#00e03c]/40 text-[#00e03c]">
                  {assistMode === 'resend' ? (
                    <RefreshCw className="w-5 h-5" />
                  ) : (
                    <KeyRound className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                    {assistMode === 'resend' ? 'Reenviar Confirmación' : 'Recuperar Contraseña'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {assistMode === 'resend'
                      ? 'Reenvía el correo para activar tu cuenta'
                      : 'Recibe un enlace para restablecer tu clave'}
                  </p>
                </div>
              </div>

              {/* Pestañas rápidas */}
              <div className="grid grid-cols-2 p-1 bg-black/40 border border-[#1a3a1a] rounded-xl text-center mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAssistMode('resend');
                    setAssistStatus(null);
                  }}
                  className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                    assistMode === 'resend'
                      ? 'bg-[#00e03c] text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Confirmación
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssistMode('reset');
                    setAssistStatus(null);
                  }}
                  className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                    assistMode === 'reset'
                      ? 'bg-[#00e03c] text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Restablecer
                </button>
              </div>

              <form onSubmit={handleExecuteAssist} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={assistEmail}
                      onChange={(e) => setAssistEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full bg-[#05100a]/80 border border-[#1a3a1a] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#00e03c] transition-colors"
                    />
                  </div>
                </div>

                {assistStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      assistStatus.type === 'success'
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/15 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {assistStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00e03c] mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    )}
                    <span>{assistStatus.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={assistLoading}
                  className="w-full py-2.5 px-4 bg-[#00e03c] hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {assistLoading ? (
                    'Enviando...'
                  ) : assistMode === 'resend' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Enviar Correo de Activación
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" /> Enviar Enlace de Recuperación
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

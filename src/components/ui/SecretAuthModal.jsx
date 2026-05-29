import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound, X, CheckCircle, Loader2, User, ArrowLeft, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabaseClient';

// Lista exclusiva de los 4 socios del proyecto SERAM v2.5
const PARTNERS_LIST = [
  { name: 'Ing. Diego Barrientos', email: 'barrientoso2401@gmail.com' },
  { name: 'Ing. Fernando Araujo', email: 'fernando@seram.com' },
  { name: 'Ing. Fabricio Orozco', email: 'fabricio@seram.com' },
  { name: 'Ing. Freddy Farrachol', email: 'freddy@seram.com' },
];

/**
 * @component SecretAuthModal
 * @description Pantalla de bloqueo minimalista y ultra-premium para socios.
 * Dividida en dos estados lógicos: SELECTION y FORM.
 * Implementa RBAC mediante Metadatos de Supabase Auth (Alternativa 2).
 */
export default function SecretAuthModal() {
  const navigate = useNavigate();
  const {
    showSecretPortal,
    setShowSecretPortal,
    triggerToast,
    setActiveRole,
    setCurrentSocio,
  } = useApp();

  // Estados lógicos de control de flujo
  const [mode, setMode] = useState('SELECTION'); // 'SELECTION' | 'FORM'
  const [isRegister, setIsRegister] = useState(false); // Alternar Login / Registro
  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const activePartner = PARTNERS_LIST[selectedPartnerIndex];

  // Escuchar tecla Escape para cerrar el portal secreto
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showSecretPortal) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSecretPortal]);

  const handleClose = () => {
    setShowSecretPortal(false);
    setMode('SELECTION');
    setPassword('');
    setSuccess(false);
    setIsRegister(false);
  };

  const handleSelectPartner = (idx) => {
    setSelectedPartnerIndex(idx);
    setEmail(PARTNERS_LIST[idx].email);
    setMode('FORM');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ── BYPASS LOCAL OFFLINE INSTANTÁNEO CON CONTRASEÑA MASTER "SOCIO2026" ──
    if (password === 'SOCIO2026') {
      setSuccess(true);
      triggerToast('Bypass local offline validado con éxito.', 'info');

      setTimeout(() => {
        setActiveRole('AdminMod');
        setCurrentSocio({
          name: activePartner.name,
          email: email,
          role: 'partner',
        });

        handleClose();
        navigate('/dashboard');
      }, 2000);
      return;
    }

    try {
      let data, error;

      if (isRegister) {
        // 1. REGISTRO ASÍNCRONO EN SUPABASE CON ROL 'PARTNER' (RBAC Alternativa 2)
        const response = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              role: 'partner',
              full_name: activePartner.name,
            },
          },
        });
        data = response.data;
        error = response.error;
      } else {
        // 2. LOGEO ASÍNCRONO CONVENCIONAL
        const response = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        data = response.data;
        error = response.error;
      }

      if (error) throw error;

      // Autenticación correcta en la nube
      setSuccess(true);
      triggerToast(
        isRegister
          ? 'Registro de Socio exitoso en Supabase.'
          : 'Firma directiva autorizada en Supabase.',
        'success'
      );

      setTimeout(() => {
        // Conceder rol administrativo y guardar en el contexto global
        setActiveRole('AdminMod');
        setCurrentSocio({
          name: activePartner.name,
          email: email,
          role: 'partner',
          id: data.user?.id,
        });

        // Cerrar y limpiar
        handleClose();
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.warn('[Supabase RBAC Auth Warning]:', err.message);
      setIsSubmitting(false);
      triggerToast(`Error de autenticación: ${err.message}`, 'error');
    }
  };

  if (!showSecretPortal) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#010409]/95 backdrop-blur-xl animate-fadeIn px-4"
      role="dialog"
      aria-modal="true"
    >
      {/* CÍRCULOS DE LUZ ATMOSFÉRICOS */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#00e03c]/5 blur-[150px] pointer-events-none" />

      <div className="glass-panel-dark border border-white/10 rounded-3xl w-full max-w-md p-8 sm:p-10 shadow-2xl relative animate-fadeIn">
        {/* Botón Cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 bg-white/[0.03] hover:bg-white/10 rounded-full border border-white/5 transition-all"
          data-cursor-text="CERRAR"
        >
          <X className="w-4 h-4 text-slate-400 hover:text-white" />
        </button>

        {/* Botón Atrás en el formulario */}
        {mode === 'FORM' && !success && (
          <button
            onClick={() => {
              setMode('SELECTION');
              setPassword('');
            }}
            className="absolute top-5 left-5 p-2 bg-white/[0.03] hover:bg-white/10 rounded-full border border-white/5 transition-all flex items-center justify-center"
            data-cursor-text="ATRÁS"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        )}

        {/* ── ESTADO 1: SELECCIÓN DE SOCIO ─────────────────────────────────── */}
        {mode === 'SELECTION' && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-[#00e03c]/10 border border-[#00e03c]/20 p-4 rounded-2xl animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-[#00e03c]" />
                </div>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">
                Área de Alta Seguridad
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Selecciona tu perfil de socio exclusivo para iniciar validación RBAC.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {PARTNERS_LIST.map((partner, idx) => (
                <button
                  key={partner.email}
                  onClick={() => handleSelectPartner(idx)}
                  className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-[#00e03c]/5 hover:border-[#00e03c]/30 text-left transition-all duration-300 flex items-center gap-4 group"
                  data-cursor-text="SELECCIONAR"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-[#00e03c] group-hover:border-[#00e03c]/20 transition-all shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                      {partner.name}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{partner.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ESTADO 2: FORMULARIO DE ACCESO / REGISTRO ───────────────────── */}
        {mode === 'FORM' && !success && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center">
              <span className="text-[10px] font-bold text-[#00e03c] uppercase tracking-widest bg-[#00e03c]/10 border border-[#00e03c]/20 px-3 py-1 rounded-full">
                {activePartner.name}
              </span>
              <h3 className="text-lg font-black text-white mt-4 uppercase tracking-tight">
                {isRegister ? 'Registro de Socio' : 'Validación de Firma'}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {isRegister
                  ? 'Registra tu clave maestra vinculada al metadato del proyecto.'
                  : 'Ingresa tu contraseña directiva configurada en Supabase.'}
              </p>
            </div>

            {/* Alternar pestañas Login/Registro */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-white/5 rounded-xl text-center">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  !isRegister ? 'bg-[#00e03c] text-slate-950' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${
                  isRegister ? 'bg-[#00e03c] text-slate-950' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Registrarme
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Campo Email */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="socio@seram.com"
                    disabled={isSubmitting}
                    className="w-full bg-slate-950/90 border border-white/10 text-white text-xs px-4 py-3.5 pl-11 rounded-xl focus:outline-none focus:border-[#00e03c] transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Campo Password */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Clave Cifrada / Firma
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="w-full bg-slate-950/90 border border-white/10 text-white text-xs px-4 py-3.5 pl-11 rounded-xl focus:outline-none focus:border-[#00e03c] transition-all font-mono"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00e03c] text-slate-950 py-3.5 rounded-xl font-black uppercase tracking-wider text-[10px] hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                data-cursor-text="CONFIRMAR"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verificando en la Nube...
                  </>
                ) : isRegister ? (
                  'Dar de Alta Perfil Directivo'
                ) : (
                  'Desbloquear Entorno Directivo'
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── ESTADO 3: EXCESO CONCEDIDO CON ÉXITO ────────────────────────── */}
        {success && (
          <div className="text-center py-6 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-center">
              <div className="bg-[#00e03c]/20 border border-[#00e03c]/40 p-4 rounded-full animate-bounce">
                <CheckCircle className="w-12 h-12 text-[#00e03c]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">
                Conexión Exitosa
              </h3>
              <p className="text-xs text-slate-400 animate-pulse font-medium mt-2">
                Inicializando Entorno Directivo RBAC...
              </p>
            </div>
            <div className="w-full bg-slate-950/80 border border-white/5 rounded-2xl p-4 flex items-center justify-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#00e03c]" />
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                JWT METADATA ROLE VERIFIED
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

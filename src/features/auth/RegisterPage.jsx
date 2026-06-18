import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { handleRegisterSupabase } = useApp();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    setLoading(true);
    const result = await handleRegisterSupabase(email, password, name);
    setLoading(false);
    
    if (result.success) {
      setRegistered(true);
    }
  };

  return (
    <div className="inner-page min-h-screen flex items-center justify-center bg-[#050508] px-4">
      {/* Grid Lines for technical look */}
      <div className="absolute inset-0 neuform-grid-bg opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md neuform-card p-8 z-10 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <span className="neuform-badge neuform-badge-accent mb-3">SERAM REGISTRO</span>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            Crear Cuenta
          </h2>
          <p className="text-xs text-slate-400 mt-2 tracking-wide">
            Únete a la plataforma líder en servicios y capacitación ambiental
          </p>
        </div>

        {registered ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 bg-[#00e03c]/10 border border-[#00e03c]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#00e03c]" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">¡Casi listo!</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Hemos enviado un enlace de confirmación a <strong className="text-white">{email}</strong>.
            </p>
            <p className="text-xs text-slate-400">
              Por favor revisa tu bandeja de entrada y spam para activar tu cuenta antes de iniciar sesión.
            </p>
            <div className="pt-6">
              <Link
                to="/login"
                className="w-full inline-flex py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold text-xs uppercase tracking-widest items-center justify-center gap-2 cursor-none"
                style={{ cursor: 'none' }}
              >
                Ir al Inicio de Sesión
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="section-label" htmlFor="name">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00e03c] transition-all"
                  placeholder="Ej. Ing. Juan Pérez"
                  style={{ cursor: 'none' }}
                />
              </div>
            </div>

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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00e03c] transition-all"
                  placeholder="tu@correo.com"
                  style={{ cursor: 'none' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="section-label" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00e03c] transition-all"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
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
              {loading ? 'Creando Cuenta...' : 'Registrarse'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* Footer info */}
        {!registered && (
          <div className="mt-8 text-center border-t border-white/5 pt-6 text-xs text-slate-400">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="text-[#00e03c] font-semibold hover:underline"
              style={{ cursor: 'none' }}
            >
              Inicia sesión aquí
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

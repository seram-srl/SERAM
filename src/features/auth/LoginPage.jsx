import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import AuthHeroBackground from '../../components/ui/AuthHeroBackground';

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleLoginSupabase, registeredUsers } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Detecta si el email ingresado coincide con un socio directivo
  const detectedPartner = (registeredUsers || []).find(
    u => (u.role === 'AdminMod' || u.name?.startsWith('Ing.')) && u.email?.toLowerCase() === email.trim().toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    const result = await handleLoginSupabase(email, password);
    setLoading(false);
    
    if (result.success) {
      if (result.redirectTo === '/dashboard' || result.isPartner) {
        navigate('/dashboard');
      } else {
        navigate('/academy');
      }
    }
  };

  return (
    <div className="inner-page relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <AuthHeroBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md neuform-card p-8 z-10 backdrop-blur-xl"
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00e03c] transition-all"
                placeholder="tu@correo.com"
                style={{ cursor: 'none' }}
              />
            </div>
          </div>

          {/* Banner de Socio Fundador Detectado */}
          {detectedPartner && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/30 text-left space-y-1 shadow-[0_0_15px_rgba(0,224,60,0.1)]"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#00e03c]">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#00e03c]" />
                <span>🏛️ Socio Fundador Detectado: {detectedPartner.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                Puedes ingresar con tu contraseña o con tu clave maestra institucional (<span className="text-[#00e03c] font-mono font-bold">socio2026</span> / <span className="text-[#00e03c] font-mono font-bold">seram2026</span>).
              </p>
            </motion.div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="section-label" htmlFor="password">
                Contraseña
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

        {/* Footer info */}
        <div className="mt-6 text-center border-t border-white/5 pt-5 text-xs text-slate-400">
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
    </div>
  );
}

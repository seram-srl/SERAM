import React from 'react';
import { Lock, X, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function PartnerModal() {
  const navigate = useNavigate();
  const {
    showSecretModal, setShowSecretModal,
    secretPassword, setSecretPassword,
    selectedPartnerIndex, setSelectedPartnerIndex,
    registeredUsers, handlePartnerLogin,
  } = useApp();

  if (!showSecretModal) return null;

  const partners = registeredUsers.filter(u => u.role === 'AdminMod');

  const onSubmit = (e) => {
    const result = handlePartnerLogin(e);
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn px-4">
      <div className="bg-[#080f08]/98 backdrop-blur-2xl border border-[#1a3a1a]/70 rounded-3xl w-full max-w-sm p-8 shadow-2xl shadow-black/95 relative animate-fadeIn mx-4">
        {/* Close */}
        <button
          onClick={() => setShowSecretModal(false)}
          className="absolute top-4 right-4 p-2 bg-white/[0.04] hover:bg-white/10 rounded-full border border-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-[#00e03c]/15 border border-[#00e03c]/40 p-4 rounded-2xl shadow-[0_0_20px_rgba(0,224,60,0.15)]">
              <Shield className="w-8 h-8 text-[#00e03c] animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight font-tech">Portal de Socios Directivos</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Acceso exclusivo para los 3 Ingenieros Socios Fundadores de SERAM.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Partner selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Selecciona tu Perfil de Socio
            </label>
            <div className="grid grid-cols-1 gap-2">
              {partners.map((user, idx) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => setSelectedPartnerIndex(idx)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                    selectedPartnerIndex === idx
                      ? 'border-[#00e03c] bg-[#00e03c]/15 text-white shadow-md shadow-emerald-950/40'
                      : 'border-[#1a3a1a] bg-[#05100a]/70 text-slate-300 hover:border-[#00e03c]/40 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono truncate mt-0.5">{user.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Contraseña Maestra
            </label>
            <input
              type="password"
              required
              value={secretPassword}
              onChange={(e) => setSecretPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#05100a]/80 border border-[#1a3a1a] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e03c] transition-colors placeholder:text-slate-600 focus:ring-1 focus:ring-[#00e03c]/40 font-mono"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#00e03c] text-slate-950 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" /> Validar y Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

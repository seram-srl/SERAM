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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-dark border border-white/10 rounded-3xl w-full max-w-sm p-8 shadow-2xl relative animate-fadeIn mx-4">
        {/* Close */}
        <button
          onClick={() => setShowSecretModal(false)}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-[#00e03c]/10 border border-[#00e03c]/30 p-4 rounded-2xl">
              <Shield className="w-8 h-8 text-[#00e03c] animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-black text-white">Portal de Socios Directivos</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Acceso exclusivo para los 3 Ingenieros Socios Fundadores de SERAM.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Partner selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Selecciona tu Perfil de Socio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {partners.map((user, idx) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => setSelectedPartnerIndex(idx)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                    selectedPartnerIndex === idx
                      ? 'border-[#00e03c] bg-[#00e03c]/10 text-white shadow-md shadow-emerald-950/40'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{user.name.split(' ').slice(1).join(' ')}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Contraseña Maestra
            </label>
            <input
              type="password"
              required
              value={secretPassword}
              onChange={(e) => setSecretPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950/80 border border-white/10 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e03c] transition-colors placeholder:text-slate-700"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#00e03c] text-slate-950 py-3 rounded-xl font-black uppercase tracking-wider text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <Lock className="w-4 h-4" /> Validar y Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

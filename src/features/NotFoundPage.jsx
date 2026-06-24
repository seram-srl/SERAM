import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

/**
 * @component NotFoundPage
 * @description Página 404 premium utilizando el fondo de menú oficial y diseño Neuform.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="inner-page min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/assets/3d-backend/bg_menu.webp')",
      }}
    >
      {/* Vignette/Overlay oscuro para mayor legibilidad */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="neuform-card max-w-md w-full text-center p-10 relative z-10 mx-4 border border-white/10 shadow-2xl flex flex-col items-center gap-6"
      >
        <div className="bg-[#00e03c]/15 border border-[#00e03c]/30 p-4 rounded-2xl animate-pulse">
          <AlertCircle className="w-12 h-12 text-[#00e03c]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase font-display leading-none">
            404
          </h1>
          <h2 className="text-lg font-bold text-slate-200 uppercase tracking-wide">
            Página No Encontrada
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            El enlace que has seguido puede estar roto o la página ha sido eliminada del servidor.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="neuform-btn-primary inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300"
        >
          <Home className="w-4 h-4" /> Volver al Inicio
        </button>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, Check } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('seram_cookie_consent');
      if (!consent) {
        // Mostrar con un leve retraso estético de 1.5s
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (_) {
      // Ignorar error de almacenamiento
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('seram_cookie_consent', 'accepted');
    } catch (_) {
      // Ignorar error de almacenamiento
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          role="region"
          aria-label="Aviso de privacidad y almacenamiento web"
          className="fixed bottom-5 right-5 sm:right-8 z-[150] max-w-md w-[calc(100vw-2.5rem)] sm:w-auto pointer-events-auto"
        >
          <div className="neuform-card !p-5 sm:!p-6 bg-[#020617]/90 backdrop-blur-2xl border border-[#126c0f]/40 hover:border-[#00e03c]/50 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30 shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  Privacidad & Almacenamiento Técnico
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                  En SERAM utilizamos almacenamiento técnico esencial para el funcionamiento seguro de la plataforma, el aula virtual y tus cotizaciones. <strong>No utilizamos rastreadores publicitarios ni vendemos tus datos.</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
              <Link
                to="/cookies"
                className="text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-wider underline transition-colors focus:outline-none focus:ring-1 focus:ring-[#00e03c] rounded px-1"
              >
                Ver Política
              </Link>
              <button
                onClick={handleAccept}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#126c0f] hover:bg-[#168512] active:bg-[#00e03c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#126c0f]/30 focus:outline-none focus:ring-2 focus:ring-[#00e03c]"
              >
                <Check className="w-3.5 h-3.5" /> Aceptar y Continuar
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

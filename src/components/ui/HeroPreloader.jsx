import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @component HeroPreloader
 * @description Pantalla de carga cinematográfica para el Hero de SERAM.
 * Muestra el imagotipo oficial en plano principal, un spinner circular independiente
 * en verde esmeralda y alterna sutilmente entre las dos frases institucionales
 * hasta que el video de fondo y la escena WebGL estén completamente listos.
 */
export default function HeroPreloader() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [videoReady, setVideoReady] = useState(() => {
    return typeof window !== 'undefined' && Boolean(window.__seram_hero_video_ready);
  });
  const [isVisible, setIsVisible] = useState(true);

  // 1. Alternancia sutil de las frases (Fase 1: 0s - 1.5s, Fase 2: 1.5s+)
  useEffect(() => {
    const phraseTimer = setTimeout(() => {
      setPhraseIndex(1);
    }, 1500);

    return () => clearTimeout(phraseTimer);
  }, []);

  // 2. Garantizar tiempo mínimo de permanencia (2.2s) para lectura fluida
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2200);

    return () => clearTimeout(minTimer);
  }, []);

  // 3. Timeout de seguridad de 5s para conexiones lentas
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      setVideoReady(true);
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  // 4. Escucha del evento de video listo emitido por EnvironmentalCanvas
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.__seram_hero_video_ready) {
      setVideoReady(true);
    }

    const handleVideoReady = () => {
      setVideoReady(true);
    };

    window.addEventListener('seram-hero-video-ready', handleVideoReady);
    return () => window.removeEventListener('seram-hero-video-ready', handleVideoReady);
  }, []);

  // 5. Determinar cuándo iniciar la salida suave
  const shouldDismiss = minTimePassed && videoReady;

  return (
    <AnimatePresence onExitComplete={() => setIsVisible(false)}>
      {isVisible && !shouldDismiss ? (
        <motion.div
          key="hero-preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#050b08] flex flex-col items-center justify-center select-none overflow-hidden"
          style={{ willChange: 'opacity' }}
          aria-label="Cargando experiencia ambiental SERAM"
        >
          {/* Atmósfera luminosa ambiental en degradé esmeralda */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00e03c]/10 blur-[130px] pointer-events-none" />
          <div className="absolute inset-0 neuform-grid-bg opacity-10 pointer-events-none" />

          {/* Contenedor Central */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
            {/* Logotipo Oficial en plano principal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center mb-6"
            >
              <img
                src="/assets/brand/logo-seram-white.webp"
                alt="SERAM — Una Experiencia Ambiental"
                className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,224,60,0.35)]"
                draggable="false"
              />
            </motion.div>

            {/* Spinner circular independiente verde esmeralda (#00e03c) */}
            <div className="relative w-12 h-12 flex items-center justify-center my-4">
              <svg className="w-10 h-10 animate-spin" viewBox="0 0 40 40" fill="none">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#00e03c"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="75 40"
                  className="filter drop-shadow-[0_0_8px_#00e03c]"
                />
              </svg>
            </div>

            {/* Frases Alternantes sutiles */}
            <div className="h-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="text-xs sm:text-sm font-medium tracking-wider text-slate-300 font-sans flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c] animate-pulse shadow-[0_0_6px_#00e03c]" />
                  <span>
                    {phraseIndex === 0
                      ? 'Cargando sitio web...'
                      : 'Preparando una Experiencia Ambiental'}
                  </span>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, MapPinOff } from 'lucide-react';

/**
 * @component MagneticButton
 * @description Botón interactivo con efecto magnético en escritorio (sigue sutilmente al cursor)
 * y respuesta háptica con compresión elástica al pulsar en dispositivos móviles.
 */
function MagneticButton({ onClick, children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 16, stiffness: 180, mass: 0.2 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Desplazamiento elástico magnético de hasta 12px
    x.set((clientX - centerX) * 0.28);
    y.set((clientY - centerY) * 0.28);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: smoothX, y: smoothY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`group cursor-pointer select-none ${className}`}
    >
      {children}
    </motion.button>
  );
}

/**
 * @component NotFoundPage
 * @description Pantalla 404 cinematográfica de SERAM con fondo oficial bg_menu.webp,
 * copywriting ambiental empático y botón dinámico magnético interactivo.
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden select-none px-4 py-16"
      style={{
        backgroundImage: "url('/assets/3d-backend/bg_menu.webp')",
      }}
    >
      {/* ── Overlay oscuro con desenfoque suave y viñeta perimetral ── */}
      <div className="absolute inset-0 bg-[#050b08]/80 backdrop-blur-[6px] z-0 pointer-events-none" />
      <div className="absolute inset-0 neuform-grid-bg opacity-15 z-0 pointer-events-none" />

      {/* Atmósfera luminosa ambiental en verde esmeralda */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00e03c]/10 blur-[130px] pointer-events-none z-0" />

      {/* ── Tarjeta Central Neuform ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="neuform-card max-w-lg w-full text-center p-8 sm:p-12 relative z-10 mx-auto border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center gap-6"
      >
        {/* Logotipo Oficial en cabecera de la tarjeta */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center"
        >
          <img
            src="/assets/brand/logo-seram-white.webp"
            alt="SERAM — Consultoría e Ingeniería Ambiental"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,224,60,0.3)]"
            draggable="false"
          />
        </motion.div>

        {/* Badge de Estado Ambiental */}
        <div className="neuform-badge neuform-badge-accent">
          <span className="w-2 h-2 rounded-full bg-[#00e03c] animate-pulse shadow-[0_0_8px_#00e03c]" />
          <span>Coordenada Fuera de Mapa // Error 404</span>
        </div>

        {/* Bloque Tipográfico de Error y Mensaje */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <MapPinOff className="w-8 h-8 text-[#00e03c]/80 animate-bounce" />
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter uppercase font-display leading-none">
              404
            </h1>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-slate-100 uppercase tracking-wider font-display">
            Desvío en el Camino
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto font-sans font-light">
            Parece que este sendero aún no ha sido explorado o la conexión se desvió.
            Regresemos al campamento base para continuar cuidando el entorno.
          </p>
        </div>

        {/* ── Botones de Acción (Principal Dinámico Magnético + Secundario) ── */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Botón Principal Dinámico: Magnético en Desktop + Rebote Elástico en Móvil */}
          <MagneticButton
            onClick={() => navigate('/')}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#00e03c] text-black font-black uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(0,224,60,0.35)] hover:shadow-[0_0_30px_rgba(0,224,60,0.65)] hover:bg-white transition-colors duration-300 active:scale-95"
          >
            <Compass className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
            <span>Volver al Inicio</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </MagneticButton>

          {/* Botón Secundario: Página Anterior */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 hover:text-white transition-all duration-300 cursor-pointer active:scale-95"
            title="Regresar a la página previa"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Página Anterior</span>
          </button>
        </div>

        {/* Micro-etiqueta institucional */}
        <div className="pt-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          SERAM S.R.L. · Ingeniería & Gestión Ambiental Integral
        </div>
      </motion.div>
    </div>
  );
}

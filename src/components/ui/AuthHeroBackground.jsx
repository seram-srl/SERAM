import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * @component AuthHeroBackground
 * @description Fondo inmersivo para el flujo de autenticación (Login/Register).
 * Renderiza el paisaje Hero oficial de SERAM con desenfoque estético, gradiente
 * para contraste Neuform (WCAG AAA) y paralaje suave reactivo al cursor con Framer Motion.
 */
export default function AuthHeroBackground() {
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  // Amortiguación elástica suave sin tirones
  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const smoothX = useSpring(targetX, springConfig);
  const smoothY = useSpring(targetY, springConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detectar si el dispositivo cuenta con puntero fino (mouse/trackpad)
    const isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Normalizado de -1 a 1 respecto al centro
      const normX = centerX > 0 ? (e.clientX - centerX) / centerX : 0;
      const normY = centerY > 0 ? (e.clientY - centerY) / centerY : 0;

      // Desplazamiento reactivo sutil: contra-movimiento de cámara (-20px a 20px en X, -14px a 14px en Y)
      targetX.set(-normX * 20);
      targetY.set(-normY * 14);
    };

    const handleMouseLeave = () => {
      // Retorno suave al centro al salir del viewport
      targetX.set(0);
      targetY.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [targetX, targetY]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none"
      aria-hidden="true"
    >
      {/* Paisaje Hero de SERAM con escala y paralaje acelerado por GPU */}
      <motion.div
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          x: smoothX,
          y: smoothY,
          scale: 1.1,
        }}
      >
        <img
          src="/assets/3d-backend/bg_home.webp"
          alt=""
          className="w-full h-full object-cover object-center filter blur-[7px] brightness-[0.85] contrast-[1.05]"
        />
      </motion.div>

      {/* Capa de oscurecimiento y gradiente para contraste Neuform y legibilidad WCAG AAA */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />

      {/* Retícula técnica de identidad visual de SERAM */}
      <div className="absolute inset-0 neuform-grid-bg opacity-25" />
    </div>
  );
}

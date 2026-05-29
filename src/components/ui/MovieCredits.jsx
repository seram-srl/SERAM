import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * @component MovieCredits
 * @description Footer cinematográfico no tradicional.
 * Se ancla al final de la experiencia de scroll (bajo el tramo de HomePage).
 * Utiliza GSAP ScrollTrigger para animar el bloque de créditos subiendo de abajo
 * hacia arriba de forma pausada y cinemática a medida que el usuario hace scroll final.
 */
export default function MovieCredits() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Animación de subida cinematográfica y stagger de opacidad
    const anim = gsap.fromTo(
      el.querySelectorAll('.credits-column'),
      { y: 120, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',      // Se activa en el tramo final del viewport
          end: 'bottom bottom',
          scrub: 1.5             // Factor de suavizado para el avance progresivo
        }
      }
    );

    return () => {
      if (anim.scrollTrigger) {
        anim.scrollTrigger.kill();
      }
      anim.kill();
    };
  }, []);

  return (
    <footer
      ref={containerRef}
      className="cinematic-footer relative py-24 px-6 sm:px-12 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent border-t border-white/[0.04] mt-32"
      style={{ pointerEvents: 'auto' }} // Permitir interacciones si las hay
    >
      {/* Brillo ambiental verde sutil de fondo */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-emerald-500/[0.02] blur-[120px] pointer-events-none rounded-full" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center sm:text-left">
        {/* Columna 1: Socios */}
        <div className="credits-column space-y-4">
          <h4 className="text-[10px] font-black tracking-[0.3em] text-[#00e03c] uppercase font-mono">
            Dirección & Socios
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium font-mono leading-relaxed">
            <li>Ing. Carlos Mendoza</li>
            <li>Ing. Elena Rostova</li>
            <li>Ing. Javier Altamirano</li>
          </ul>
        </div>

        {/* Columna 2: Ingeniería */}
        <div className="credits-column space-y-4">
          <h4 className="text-[10px] font-black tracking-[0.3em] text-[#00e03c] uppercase font-mono">
            Desarrollo & AI
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium font-mono leading-relaxed">
            <li>Antigravity AI Agent</li>
            <li>SERAM Development Team</li>
            <li>Open Source Ecosystem</li>
          </ul>
        </div>

        {/* Columna 3: Tecnología */}
        <div className="credits-column space-y-4">
          <h4 className="text-[10px] font-black tracking-[0.3em] text-[#00e03c] uppercase font-mono">
            Core Tecnológico
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium font-mono leading-relaxed">
            <li>React 18 & Vite</li>
            <li>Three.js & WebGL</li>
            <li>GSAP (ScrollTrigger)</li>
            <li>Tailwind CSS & Supabase</li>
          </ul>
        </div>

        {/* Columna 4: Metadatos de la Plataforma */}
        <div className="credits-column space-y-4 text-center sm:text-right">
          <h4 className="text-[10px] font-black tracking-[0.3em] text-[#00e03c] uppercase font-mono">
            Producción
          </h4>
          <p className="text-2xl font-black text-white tracking-widest font-sans leading-none">
            SERAM
          </p>
          <p className="text-[9px] text-slate-500 font-mono tracking-[0.2em] leading-relaxed pt-2">
            PROYECTO AMBIENTAL DE ÉLITE<br />
            v2.5 — © 2026
          </p>
        </div>
      </div>

      {/* Marca de tiempo y confidencialidad al pie */}
      <div 
        className="mt-20 border-t border-white/[0.02] pt-8 text-center text-[9px] font-mono tracking-[0.35em] text-slate-600 uppercase"
        aria-hidden="true"
      >
        TIMECODE // SECURE DECOUPLED ENVIRONMENT // ALL RIGHTS RESERVED
      </div>
    </footer>
  );
}

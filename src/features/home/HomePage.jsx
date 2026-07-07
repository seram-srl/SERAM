/**
 * @file HomePage.jsx
 * @description Página principal de SERAM con scroll híbrido AAA.
 * GSAP ScrollTrigger maneja las secciones de Servicios y Tienda (Scale-on-Scroll).
 */

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, Briefcase, Award, ChevronRight, ShoppingCart, Instagram, Youtube,
} from 'lucide-react';
import { useApp, AppContext } from '../../context/AppContext';
import EnvironmentalCanvas from '../../components/ui/EnvironmentalCanvas';
import BrandParticleText from '../../components/ui/BrandParticleText';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// ─── FRAMER MOTION VARIANTS ───────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const staggerChild = {
  initial: { opacity: 0, y: 32 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
// LERP_SPEED removido: scroll hijacking ahora manejado por GSAP ScrollTrigger

// ─── CARD BASE STYLES ─────────────────────────────────────────────────────────
const cardBaseStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  borderRadius: '1.5rem',
  overflow: 'hidden',
  willChange: 'width, height, right, transform, border-radius',
  boxShadow: '-10px 0 30px rgba(0,0,0,0.7)',
};

// TikTok SVG Icon (high fidelity, styled)
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.58-.73v6.52c0 2.22-.73 4.56-2.5 5.97-1.81 1.44-4.5 1.76-6.79 1.03-2.76-.88-4.71-3.66-4.58-6.57.12-3.13 2.76-5.87 5.92-5.83.69-.01 1.38.12 2.03.38v3.96c-.63-.22-1.32-.28-1.98-.17-1.39.22-2.51 1.48-2.61 2.89-.14 1.8 1.49 3.4 3.28 3.19 1.25-.15 2.19-1.21 2.21-2.47V.02z"/>
  </svg>
);

// ─── DATOS DE PILARES ─────────────────────────────────────────────────────────
const PILLARS = [
  {
    id: 'services',
    title: 'SERAM SERVICES',
    sub: 'Pilar 01 // Consultoría',
    imageUrl: '/assets/3d-backend/panel2-service-background.webp',
    cursorText: 'SERVICIOS',
    icon: <Briefcase className="w-6 h-6" />,
    headline: 'Evita multas y paralizaciones: asegura tu cumplimiento ambiental hoy mismo.',
    desc: 'Garantiza la continuidad de tu negocio con consultoría ambiental y monitoreo de alta precisión. Convertimos la complejidad de las licencias ambientales en un proceso ágil, mitigando riesgos normativos antes de que se conviertan en sanciones.',
    cta: 'Ver Servicios y Asegurar Cumplimiento',
    route: '/services',
    ctaCursor: 'SERVICIOS',
    variant: 'light',
  },
  {
    id: 'academy',
    title: 'SERAM ACADEMY',
    sub: 'Pilar 02 // Formación',
    imageUrl: '/assets/3d-backend/bg_academy.webp',
    cursorText: 'APRENDER',
    icon: <BookOpen className="w-6 h-6" />,
    headline: 'CAPACITACIÓN ECOLÓGICA Y TÉCNICA',
    desc: 'Accede a nuestra ala formativa especializada. Cursos de SIG aplicado, auditoría y legislación bajo normativas ISO internacionales. Diseñamos planes gratis, de pago y membresías premium académicas.',
    cta: 'Ingresar a Academy',
    route: '/academy',
    ctaCursor: 'ACADEMIA',
    variant: 'dark',
  },
  {
    id: 'experience',
    title: 'SERAM EXPERIENCE',
    sub: 'Pilar 03 // Vivencial',
    imageUrl: '/assets/3d-backend/bg_experience.webp',
    cursorText: 'VIVIR',
    icon: <Award className="w-6 h-6" />,
    headline: 'RESTAURACIÓN ECOLÓGICA ACTIVA',
    desc: 'Conectamos personas y corporaciones con la conservación terrestre. Únete a voluntariados en el Valle de Zongo, expediciones científicas y talleres de huertos urbanos diseñados por biólogos expertos.',
    cta: 'Conocer Experiencias',
    route: '/experience',
    ctaCursor: 'VIVIR',
    variant: 'light',
  },
  {
    id: 'store',
    title: 'SERAM STORE',
    sub: 'Pilar 04 // Tienda',
    imageUrl: '/assets/3d-backend/landspace-backgroundstore.webp',
    cursorText: 'TIENDA',
    icon: <ShoppingCart className="w-6 h-6" />,
    headline: 'BIBLIOTECA DE RECURSOS Y ECO-COMPRAS',
    desc: 'Descubre libros técnicos, guías ecológicas y bio-insumos. Aplica interlinking directo para desbloquear ebooks en la academia tras adquirirlos en la tienda. Envíos carbono neutro rápidos.',
    cta: 'Ver SERAM STORE',
    route: '/shop',
    ctaCursor: 'TIENDA',
    variant: 'dark',
  },
];

// ─── TILT GLASS CARD ─────────────────────────────────────────────────────────
function TiltGlassCard({ imageUrl, cursorText = 'EXPLORAR' }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useTransform(y, [0, 1], [12, -12]);
  const rotateY = useTransform(x, [0, 1], [-12, 12]);
  const springCfg = { damping: 25, stiffness: 220, mass: 0.6 };
  const rXs = useSpring(rotateX, springCfg);
  const rYs = useSpring(rotateY, springCfg);

  return (
    <motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { x.set(0.5); y.set(0.5); }}
      style={{ rotateX: rXs, rotateY: rYs, transformStyle: 'preserve-3d' }}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden glass-panel-dark border border-white/10 hover:border-[#00e03c]/40 shadow-[0_16px_40px_rgba(0,0,0,0.65)] cursor-none transition-all duration-300 pointer-events-auto"
      data-cursor-text={cursorText}
    >
      <div style={{ transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }} className="w-full h-full p-2.5">
        <img
          src={imageUrl}
          alt="SERAM Visual"
          className="w-full h-full object-cover rounded-xl opacity-90 select-none"
          draggable="false"
        />
      </div>
    </motion.div>
  );
}

// ─── PANEL A: TÍTULO + IMAGEN ─────────────────────────────────────────────────
function PanelA({ pillar }) {
  return (
    <div className="w-[100vw] h-screen flex flex-col md:flex-row items-center justify-center gap-12 px-10 sm:px-24 flex-shrink-0 select-none bg-transparent">
      <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <h2 className="text-[3.5rem] sm:text-[5.5rem] font-black text-white leading-none tracking-tighter uppercase font-display filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
          {pillar.title}
        </h2>
      </div>
      <div className="md:w-1/2 flex items-center justify-center max-w-lg w-full">
        <TiltGlassCard imageUrl={pillar.imageUrl} cursorText={pillar.cursorText} />
      </div>
    </div>
  );
}

// ─── PANEL B: DETALLE + CTA ───────────────────────────────────────────────────
function PanelB({ pillar }) {
  const navigate = useNavigate();

  return (
    <div className="w-[100vw] h-screen flex items-center justify-center px-10 sm:px-24 flex-shrink-0 bg-transparent">
      <div className="max-w-2xl p-8 sm:p-12 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-start gap-6 text-left">
        <div className="w-12 h-12 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/30">
          {pillar.icon}
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          {pillar.headline}
        </h3>
        <p className="text-sm leading-relaxed text-slate-300">
          {pillar.desc}
        </p>
        <button
          onClick={() => navigate('/services')}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/45 text-[#00e03c] rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300"
          data-cursor-text="SERVICIOS"
        >
          Ver Todos los Servicios <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function HeroSection() {
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 120, mass: 0.6 };
  
  // Capa Logo/BrandParticleText (movimiento intermedio)
  const logoX = useSpring(useTransform(mouseX, [-window.innerWidth / 2, window.innerWidth / 2], [-20, 20]), springConfig);
  const logoY = useSpring(useTransform(mouseY, [-window.innerHeight / 2, window.innerHeight / 2], [-20, 20]), springConfig);

  // Capa H2 (movimiento ligeramente diferente)
  const h2X = useSpring(useTransform(mouseX, [-window.innerWidth / 2, window.innerWidth / 2], [-12, 12]), springConfig);
  const h2Y = useSpring(useTransform(mouseY, [-window.innerHeight / 2, window.innerHeight / 2], [-12, 12]), springConfig);

  // Capa H3 (movimiento sutil)
  const h3X = useSpring(useTransform(mouseX, [-window.innerWidth / 2, window.innerWidth / 2], [-7, 7]), springConfig);
  const h3Y = useSpring(useTransform(mouseY, [-window.innerHeight / 2, window.innerHeight / 2], [-7, 7]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(clientX - centerX);
      mouseY.set(clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useGSAP(() => {
    // Animación de salida al hacer scroll hacia abajo para H2
    gsap.to('#hero-h2', {
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      opacity: 0,
      y: -50,
      ease: 'power1.in',
    });

    // Salida para el H3 (descripción)
    gsap.to('#hero-desc', {
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      opacity: 0,
      y: -30,
      ease: 'power1.in',
    });
  }, { scope: heroRef });

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden min-h-screen w-full flex flex-col items-center justify-center py-20 px-6 sm:px-12 select-none bg-transparent"
      aria-label="Portada SERAM"
    >
      <div className="text-center space-y-8 z-10 w-full max-w-4xl flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center gap-3">
          {/* Logo con animación de entrada y paralaje */}
          <motion.div
            custom={1}
            variants={staggerChild}
            initial="initial"
            animate="animate"
            style={{ x: logoX, y: logoY }}
            className="w-full will-change-transform flex justify-center"
          >
            <BrandParticleText />
          </motion.div>

          {/* H2 con animación de entrada, hover verde y paralaje */}
          <motion.h2
            id="hero-h2"
            custom={2}
            variants={staggerChild}
            initial="initial"
            animate="animate"
            style={{ x: h2X, y: h2Y }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white font-display uppercase tracking-[0.3em] mt-4 text-center select-none will-change-transform"
          >
            SERVICIOS <span className="hover:text-[#00e03c] transition-colors duration-300 cursor-pointer">AMBIENTALES.</span>
          </motion.h2>

          {/* H3 con animación de entrada, palabras clave subrayadas y paralaje sutil */}
          <motion.h3
            id="hero-desc"
            custom={3}
            variants={staggerChild}
            initial="initial"
            animate="animate"
            style={{ x: h3X, y: h3Y }}
            className="text-xs sm:text-sm md:text-base text-slate-300/95 font-sans tracking-wide max-w-2xl mt-4 text-center leading-relaxed select-none will-change-transform"
          >
            Ingeniería y consultoría de precisión para el <span className="underline decoration-[#00e03c] decoration-2 underline-offset-2 font-medium text-slate-300">cumplimiento normativo</span>, <span className="underline decoration-[#00e03c] decoration-2 underline-offset-2 font-medium text-slate-300">monitoreo ecosistémico</span> y <span className="underline decoration-[#00e03c] decoration-2 underline-offset-2 font-medium text-slate-300">desarrollo sostenible</span> en Bolivia.
          </motion.h3>
        </div>
      </div>

      {/* Indicador de deslizar centrado */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <motion.div
          custom={4}
          variants={staggerChild}
          initial="initial"
          animate="animate"
          className="opacity-60 flex flex-col items-center gap-2 pointer-events-auto"
        >
          {/* Indicador de Mouse para pantallas de escritorio */}
          <div className="hidden sm:flex w-[24px] h-[40px] border-2 border-white/50 rounded-full justify-center p-1.5">
            <div className="w-[3px] h-[7px] bg-[#00e03c] rounded-full animate-scrollIndicator" />
          </div>
          {/* Indicador de Smartphone para pantallas táctiles móviles */}
          <div className="flex sm:hidden w-[26px] h-[44px] border-2 border-white/50 rounded-[6px] justify-center p-1 relative">
            <div className="absolute top-1 w-3 h-[2px] bg-white/30 rounded-full" />
            <div className="w-[4px] h-[8px] bg-[#00e03c] rounded-full animate-scrollIndicator mt-2" />
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-tech select-none">
            Desliza para explorar
          </span>
        </motion.div>
      </div>
    </section>
  );
}

// ─── GSAP SERVICES SCALE-ON-SCROLL ──────────────────────────────────────────────────────
function ServicesHorizontalSection() {
  const triggerRef = useRef(null);
  const pinRef = useRef(null);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getCardStyle = (index) => {
    const rights = ['25vw', '1vw', '-23vw', '-47vw'];
    return {
      ...cardBaseStyle,
      right: rights[index],
      width: '20vw',
      height: '65vh',
      zIndex: (index + 2) * 10,
    };
  };

  useGSAP(() => {
    if (isMobile) {
      // Limpiar y revertir explícitamente cualquier ScrollTrigger de esta sección al cambiar a móvil
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === triggerRef.current) {
          trigger.kill(true);
        }
      });
      return;
    }

    const triggerEl = triggerRef.current;
    const pinEl = pinRef.current;
    if (!triggerEl || !pinEl) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top top',
        end: '+=700%', // Desacelera la velocidad física del scroll
        scrub: 1,
        pin: pinEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // TIMELINE PARA ESCRITORIO
    // Transición 1: Intro fade + Tarjeta 1 se expande (0 a 3)
    tl.to('#svc-intro', { opacity: 0, x: -100, duration: 1.8, ease: 'power2.inOut' }, 0)
      .to('#svc-card-1', { width: '100vw', height: '100vh', right: 0, top: 0, transform: 'translateY(0)', borderRadius: 0, duration: 2.5, ease: 'power2.inOut' }, 0)
      .to('#svc-card-1 .card-content', { opacity: 1, duration: 0.5 }, 1.8)
      .fromTo('#svc-card-1 .card-tag', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.9)
      .fromTo('#svc-card-1 .card-title', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 2.0)
      .fromTo('#svc-card-1 .card-subtitle', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 2.1)
      .fromTo('#svc-card-1 .card-desc', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 2.2)
      .fromTo('#svc-card-1 .card-btn', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 2.3)
      .to('#svc-card-3', { right: '-10vw', duration: 2.5, ease: 'power2.inOut' }, 0)
      .to('#svc-card-4', { right: '-35vw', duration: 2.5, ease: 'power2.inOut' }, 0);

    // PAUSA DE LECTURA 1 (3 a 5)
    tl.to({}, { duration: 2 }, 3);

    // Transición 2: Tarjeta 2 cubre la 1 (5 a 8)
    tl.to('#svc-card-1 .card-content', { opacity: 0, duration: 0.8 }, 5)
      .to('#svc-card-2', { width: '100vw', height: '100vh', right: 0, top: 0, transform: 'translateY(0)', borderRadius: 0, duration: 2.5, ease: 'power2.inOut' }, 5)
      .to('#svc-card-2 .card-content', { opacity: 1, duration: 0.5 }, 6.8)
      .fromTo('#svc-card-2 .card-tag', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 6.9)
      .fromTo('#svc-card-2 .card-title', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 7.0)
      .fromTo('#svc-card-2 .card-desc', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 7.1)
      .fromTo('#svc-card-2 .card-btn', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 7.2)
      .to('#svc-card-3', { right: '10vw', duration: 2.5, ease: 'power2.inOut' }, 5)
      .to('#svc-card-4', { right: '-10vw', duration: 2.5, ease: 'power2.inOut' }, 5);

    // PAUSA DE LECTURA 2 (8 a 10)
    tl.to({}, { duration: 2 }, 8);

    // Transición 3: Tarjeta 3 cubre la 2 (10 a 13)
    tl.to('#svc-card-2 .card-content', { opacity: 0, duration: 0.8 }, 10)
      .to('#svc-card-3', { width: '100vw', height: '100vh', right: 0, top: 0, transform: 'translateY(0)', borderRadius: 0, duration: 2.5, ease: 'power2.inOut' }, 10)
      .to('#svc-card-3 .card-content', { opacity: 1, duration: 0.5 }, 11.8)
      .fromTo('#svc-card-3 .card-tag', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 11.9)
      .fromTo('#svc-card-3 .card-title', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 12.0)
      .fromTo('#svc-card-3 .card-desc', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 12.1)
      .fromTo('#svc-card-3 .card-btn', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 12.2)
      .to('#svc-card-4', { right: '10vw', duration: 2.5, ease: 'power2.inOut' }, 10);

    // PAUSA DE LECTURA 3 (13 a 15)
    tl.to({}, { duration: 2 }, 13);

    // Transición 4: Tarjeta 4 cubre la 3 (15 a 18)
    tl.to('#svc-card-3 .card-content', { opacity: 0, duration: 0.8 }, 15)
      .to('#svc-card-4', { width: '100vw', height: '100vh', right: 0, top: 0, transform: 'translateY(0)', borderRadius: 0, duration: 2.5, ease: 'power2.inOut' }, 15)
      .to('#svc-card-4 .card-content', { opacity: 1, duration: 0.5 }, 16.8)
      .fromTo('#svc-card-4 .card-tag', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 16.9)
      .fromTo('#svc-card-4 .card-title', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 17.0)
      .fromTo('#svc-card-4 .card-desc', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 17.1)
      .fromTo('#svc-card-4 .card-btn', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 17.2)
      .fromTo('#svc-card-4 .card-extra', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 17.3);

    // PAUSA DE LECTURA 4 (18 a 20)
    tl.to({}, { duration: 2 }, 18);

  }, { scope: triggerRef, dependencies: [isMobile] });

  if (isMobile) {
    return (
      <div ref={triggerRef} className="relative w-full py-20 px-4 flex flex-col gap-12 bg-transparent text-slate-100 z-10">
        {/* Intro panel */}
        <div id="svc-intro-mobile" className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <span className="text-[10px] text-[#00e03c] tracking-[0.3em] uppercase font-tech font-bold block mb-2 select-none">
            SERAM Services
          </span>
          <h2 className="mt-3 font-black text-slate-100 leading-tight font-display select-none">
            <span className="text-2xl uppercase block mb-2">
              Evita <span className="hover:text-[#68a379] transition-colors duration-300 cursor-pointer font-extrabold underline decoration-[#4e7a5c]/60 decoration-2 underline-offset-4 pointer-events-auto inline-block">multas y paralizaciones</span>:
            </span>
            <span className="text-xl text-[#00e03c] hover:text-white transition-colors duration-300 cursor-pointer font-extrabold underline decoration-[#00e03c]/50 decoration-2 underline-offset-4 pointer-events-auto block mt-1 text-left">
              Asegura tu cumplimiento ambiental
            </span>
            <span className="text-xl block mt-1">
              hoy mismo
            </span>
          </h2>
          <p className="mt-5 text-slate-300 font-light leading-relaxed text-sm select-none">
            Garantiza la <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">continuidad de tu negocio</span> con consultoría ambiental y <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 pointer-events-auto">monitoreo de alta precisión</span>. Convertimos la complejidad de las <span className="underline decoration-slate-400/50 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">licencias ambientales</span> en un proceso ágil, mitigando riesgos normativos antes de que se conviertan en <span className="underline decoration-[#4e7a5c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#68a379] transition-colors duration-300 cursor-pointer pointer-events-auto">sanciones</span>.
          </p>
          <button onClick={() => navigate('/services')} className="mt-8 px-8 py-3.5 bg-white text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-[#00e03c] transition-colors duration-300 pointer-events-auto w-full">
            Ver Servicios y Asegurar Cumplimiento
          </button>
        </div>

        {/* Tarjeta 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10" 
          style={{ height: '480px' }}
        >
          <img src="/assets/3d-backend/licencias_fnca.png" alt="Licencias Ambientales" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00e03c]/90 font-tech mb-1.5 block">Regularización y Licencias Ambientales</span>
              <h3 className="text-lg font-black text-white mb-1.5 leading-tight select-none">
                ¿Tu proyecto está listo para iniciar pero te falta la Categorización Ambiental?
              </h3>
              <h4 className="text-xs font-bold text-[#00e03c] mb-2 leading-tight select-none">
                No arriesgues tu inversión por frenos administrativos o sanciones.
              </h4>
              <p className="text-slate-300 mb-4 text-[11px] font-light leading-relaxed select-none">
                El Formulario de Nivel de Categorización Ambiental (FNCA) es el Instrumento de Regulación de Alcance Particular (IRAP) obligatorio por normativa boliviana. Nosotros lo gestionamos con precisión técnica para que tu obra civil o comercial empiece a generar ingresos.
              </p>
              <button onClick={() => navigate('/quote')} className="w-full py-3 bg-[#00e03c] text-black font-black rounded-full text-[10px] tracking-wider uppercase hover:bg-white transition-colors duration-300">Categorizar Mi Proyecto y Cotizar Gratis</button>
            </div>
          </div>
        </motion.div>

        {/* Tarjeta 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10" 
          style={{ height: '480px' }}
        >
          {/* Fondo estilo HUD tecnológico futurista */}
          <div className="absolute inset-0 bg-slate-950 overflow-hidden">
            <img 
              src="/assets/3d-backend/registro_rai_inspiration.jpg" 
              alt="Registro Ambiental Industrial" 
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `radial-gradient(rgba(0, 224, 60, 0.4) 1px, transparent 1px)`,
                backgroundSize: '16px 16px'
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,224,60,0.08),transparent_70%)] animate-[pulse_6s_infinite]" />
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(0, 224, 60, 1) 50%, transparent 50%)',
                backgroundSize: '100% 4px'
              }}
            />
            <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00e03c]/40 to-transparent top-0 animate-[scan_4s_linear_infinite]" />
            <div className="absolute inset-4 pointer-events-none border border-white/[0.03]">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00e03c] shadow-[0_0_6px_rgba(0,224,60,0.5)]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00e03c] shadow-[0_0_6px_rgba(0,224,60,0.5)]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00e03c] shadow-[0_0_6px_rgba(0,224,60,0.5)]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00e03c] shadow-[0_0_6px_rgba(0,224,60,0.5)]" />
            </div>
            <div className="absolute top-4 right-4 w-12 h-12 pointer-events-none opacity-30">
              <div className="absolute inset-0 rounded-full border border-dashed border-[#00e03c]/30 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-[#00e03c]/15" />
              <div className="absolute inset-3 rounded-full border-2 border-t-transparent border-r-transparent border-b-transparent border-[#00e03c]/60 animate-[spin_3s_linear_infinite]" />
            </div>
            <div className="absolute top-4 left-6 font-tech text-[7px] text-[#00e03c]/40 uppercase tracking-widest pointer-events-none select-none">
              SYS_STATUS: ACTIVE // COORD_LOCK: 16.489-S
            </div>
          </div>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00e03c]/90 font-tech mb-1.5 block">Regularización Industrial</span>
              <h3 className="text-lg font-black text-white mb-2 leading-tight">Registro Ambiental Industrial (RAI): Evita Clausuras y Sanciones</h3>
              <p className="text-slate-300 mb-4 text-[11px] font-light leading-relaxed">
                Protege tu fábrica de precintos y multas. Gestionamos tu Registro Ambiental Industrial (RAI) y la categorización industrial obligatoria para industrias manufactureras urbanas de categorías 3 y 4 con blindaje legal garantizado.
              </p>
              <button onClick={() => navigate('/quote')} className="w-full py-3 bg-[#00e03c] text-black font-black rounded-full text-[10px] tracking-wider uppercase hover:bg-white transition-colors duration-300">Obtener RAI y Blindar Fábrica</button>
            </div>
          </div>
        </motion.div>

        {/* Tarjeta 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10" 
          style={{ height: '480px' }}
        >
          <img src="/assets/3d-backend/prospeccion_minera_es.png" alt="Prospección Minera y EMAP" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00e03c]/90 font-tech mb-1.5 block">Minería sin Frenos Administrativos</span>
              <h3 className="text-lg font-black text-white mb-2 leading-tight">Prospección Minera y EMAP: Asegura tu Licencia de Explotación</h3>
              <p className="text-slate-300 mb-4 text-[11px] font-light leading-relaxed">
                Evita retrasos críticos en el inicio de tus operaciones. Diseñamos soluciones cartográficas exactas y elaboramos carpetas rápidas para minería para la aprobación ágil del plan EMAP en tus concesiones mineras.
              </p>
              <button onClick={() => navigate('/quote')} className="w-full py-3 bg-[#00e03c] text-black font-black rounded-full text-[10px] tracking-wider uppercase hover:bg-white transition-colors duration-300">Aprobar Trámite Minero y Explotar</button>
            </div>
          </div>
        </motion.div>

        {/* Tarjeta 4 — SIG en la Gestión Ambiental */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10" 
          style={{ height: '560px' }}
        >
          <img src="/assets/3d-backend/gis_satellite_mapping.webp" alt="SIG en la Gestión Ambiental — Mapas Ambientales SERAM" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 pb-20">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00e03c]/90 font-tech mb-1.5 block">SIG en la Gestión Ambiental — SERAM</span>
              <h3 className="text-lg font-black text-white mb-2 leading-tight">Mapas Ambientales que Aprueban: Diseñamos tu Plan de Aplicación SIG</h3>
              <p className="text-slate-300 mb-3 text-[11px] font-light leading-relaxed">
                Tu proyecto ambiental merece mapas que no sean observados. En la <strong className="text-white">consultora ambiental SERAM</strong> ejecutamos tu <strong className="text-[#00e03c]">Plan de Aplicación SIG</strong> completo. ¿Prefieres capacitar a tu equipo? Adquiere nuestro <strong className="text-white">Curso de SIG Básico</strong> y domina las herramientas desde cero.
              </p>
              <button onClick={() => navigate('/quote')} className="w-full py-2.5 bg-[#00e03c] text-black font-black rounded-full text-[10px] tracking-wider uppercase hover:bg-white transition-colors duration-300 mb-2">Cotizar Mi Plan de Aplicación SIG</button>
              <motion.button
                onClick={() => navigate('/services')}
                className="w-full text-center text-[9px] font-black text-white hover:text-[#00e03c] transition-colors duration-300 block py-1 leading-normal uppercase"
              >
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block mr-1 text-[#00e03c]"
                  style={{ fontSize: '13px' }}
                >→</motion.span>
                ¿TU PROYECTO TIENE PLAZOS, MULTAS O PARALIZACIONES? CONOCE LA SOLUCIÓN EXACTA PARA CADA CASO
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    // triggerRef: define la sección en el scroll.
    <div ref={triggerRef} className="relative w-full z-10">
      {/* pinRef: el contenedor que GSAP fijará. Tiene overflow: hidden y es relative. */}
      <div ref={pinRef} className="relative w-full h-screen overflow-hidden bg-transparent">
        {/* Intro panel */}
        <div id="svc-intro" className="absolute inset-0 flex items-center px-8 md:px-24 z-10 pointer-events-none">
          <div className="w-full md:w-1/2 max-w-lg p-10 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
            <span className="text-[10px] text-[#00e03c] tracking-[0.3em] uppercase font-tech font-bold block mb-2 select-none">
              SERAM Services
            </span>
            <h2 className="mt-3 font-black text-slate-100 leading-tight font-display select-none">
              <span className="text-2xl md:text-3xl uppercase block mb-2">
                Evita <span className="hover:text-[#68a379] transition-colors duration-300 cursor-pointer font-extrabold underline decoration-[#4e7a5c]/60 decoration-2 underline-offset-4 pointer-events-auto inline-block">multas y paralizaciones</span>:
              </span>
              <span className="text-xl md:text-2xl text-[#00e03c] hover:text-white transition-colors duration-300 cursor-pointer font-extrabold underline decoration-[#00e03c]/50 decoration-2 underline-offset-4 pointer-events-auto block mt-1 text-left">
                Asegura tu cumplimiento ambiental
              </span>
              <span className="text-xl md:text-2xl block mt-1">
                hoy mismo
              </span>
            </h2>
            <p className="mt-5 text-slate-300 font-light leading-relaxed text-base select-none">
              Garantiza la <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">continuidad de tu negocio</span> con consultoría ambiental y <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">monitoreo de alta precisión</span>. Convertimos la complejidad de las <span className="underline decoration-slate-400/50 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">licencias ambientales</span> en un proceso ágil, mitigando riesgos normativos antes de que se conviertan en <span className="underline decoration-[#4e7a5c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#68a379] transition-colors duration-300 cursor-pointer pointer-events-auto">sanciones</span>.
            </p>
            <button onClick={() => navigate('/services')} className="mt-8 px-8 py-3.5 bg-white text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-[#00e03c] transition-colors duration-300 pointer-events-auto">
              Ver Servicios y Asegurar Cumplimiento
            </button>
          </div>
        </div>

        {/* Tarjeta 1: Regularización y Licencias Ambientales (FNCA) — z-20 */}
        <div id="svc-card-1" style={getCardStyle(0)}>
          <img src="/assets/3d-backend/licencias_fnca.png" alt="Licencias Ambientales" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="card-content opacity-0 absolute inset-0 flex flex-col justify-center px-8 md:px-24">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl max-w-xl shadow-2xl">
              <span className="card-tag text-[11px] uppercase tracking-wider font-extrabold text-[#00e03c]/90 font-tech mb-2 block">Regularización y Licencias Ambientales</span>
              <h3 className="card-title text-2xl md:text-3xl font-black text-white mb-2 leading-tight select-none">
                ¿Tu proyecto está listo para iniciar pero te falta la Categorización Ambiental?
              </h3>
              <h4 className="card-subtitle text-base font-bold text-[#00e03c] mb-3 leading-tight select-none">
                No arriesgues tu inversión por frenos administrativos o sanciones.
              </h4>
              <p className="card-desc text-slate-200 mb-6 text-sm font-light leading-relaxed select-none">
                El <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">Formulario de Nivel de Categorización Ambiental (FNCA)</span> es el <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">Instrumento de Regulación de Alcance Particular (IRAP)</span> obligatorio por normativa boliviana para definir el rumbo legal de tu <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">Licencia Ambiental</span>. Nosotros lo gestionamos con precisión técnica para que tu <span className="underline decoration-slate-400/50 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">obra civil o comercial</span> empiece a <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">generar ingresos</span> sin mirar atrás.
              </p>
              <button onClick={() => navigate('/quote')} className="card-btn px-6 py-3.5 bg-[#00e03c] text-black font-black rounded-full text-[11px] tracking-wider uppercase hover:bg-white transition-colors duration-300 pointer-events-auto">Categorizar Mi Proyecto y Cotizar Gratis</button>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Registro Ambiental Industrial (RAI) — z-30 */}
        <div id="svc-card-2" style={getCardStyle(1)}>
          {/* Fondo estilo HUD tecnológico futurista */}
          <div className="absolute inset-0 bg-slate-950 overflow-hidden">
            <img 
              src="/assets/3d-backend/registro_rai_inspiration.jpg" 
              alt="Registro Ambiental Industrial" 
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `radial-gradient(rgba(0, 224, 60, 0.4) 1px, transparent 1px)`,
                backgroundSize: '16px 16px'
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0, 224, 60, 0.08),transparent_70%)] animate-[pulse_6s_infinite]" />
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(0, 224, 60, 1) 50%, transparent 50%)',
                backgroundSize: '100% 4px'
              }}
            />
            <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00e03c]/40 to-transparent top-0 animate-[scan_4s_linear_infinite]" />
            <div className="absolute inset-8 pointer-events-none border border-white/[0.03]">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00e03c] shadow-[0_0_8px_rgba(0,224,60,0.5)]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00e03c] shadow-[0_0_8px_rgba(0,224,60,0.5)]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00e03c] shadow-[0_0_8px_rgba(0,224,60,0.5)]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00e03c] shadow-[0_0_8px_rgba(0,224,60,0.5)]" />
            </div>
            <div className="absolute top-8 right-8 w-16 h-16 pointer-events-none opacity-40">
              <div className="absolute inset-0 rounded-full border border-dashed border-[#00e03c]/30 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-[#00e03c]/15" />
              <div className="absolute inset-4 rounded-full border-2 border-t-transparent border-r-transparent border-b-transparent border-[#00e03c]/60 animate-[spin_3s_linear_infinite]" />
            </div>
            <div className="absolute top-6 left-8 font-tech text-[8px] text-[#00e03c]/40 uppercase tracking-widest pointer-events-none select-none">
              SYS_STATUS: ACTIVE // COORD_LOCK: 16.489-S_68.119-W
            </div>
          </div>
          <div className="absolute inset-0 bg-black/45" />
          <div className="card-content opacity-0 absolute inset-0 flex flex-col justify-center px-8 md:px-24">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl max-w-xl shadow-2xl">
              <span className="card-tag text-[10px] uppercase tracking-wider font-extrabold text-[#00e03c]/90 font-tech mb-2 block">Regularización Industrial</span>
              <h3 className="card-title text-xl md:text-2xl font-black text-white mb-3 leading-tight">Registro Ambiental Industrial (RAI): Evita Clausuras y Sanciones</h3>
              <p className="card-desc text-slate-200 mb-6 text-sm font-light leading-relaxed">
                Protege tu fábrica de precintos y multas. Gestionamos tu <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">Registro Ambiental Industrial (RAI)</span> y la <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">categorización industrial</span> obligatoria para <span className="underline decoration-slate-400/50 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">industrias manufactureras</span> urbanas (Categorías 3 y 4) con velocidad express y blindaje legal garantizado.
              </p>
              <button onClick={() => navigate('/quote')} className="card-btn px-8 py-3.5 bg-[#00e03c] text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-white transition-colors duration-300 pointer-events-auto">Obtener RAI y Blindar Fábrica</button>
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Formulario de Prospección Minera & EMAP — z-40 */}
        <div id="svc-card-3" style={getCardStyle(2)}>
          <img src="/assets/3d-backend/prospeccion_minera_es.png" alt="Prospección Minera y EMAP" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="card-content opacity-0 absolute inset-0 flex flex-col justify-center px-8 md:px-24">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl max-w-xl shadow-2xl">
              <span className="card-tag text-[10px] uppercase tracking-wider font-extrabold text-[#00e03c]/90 font-tech mb-2 block">Minería sin Frenos Administrativos</span>
              <h3 className="card-title text-xl md:text-2xl font-black text-white mb-3 leading-tight">Prospección Minera y EMAP: Asegura tu Licencia de Explotación</h3>
              <p className="card-desc text-slate-200 mb-6 text-sm font-light leading-relaxed">
                Evita retrasos críticos en el inicio de tus operaciones. Diseñamos <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">soluciones cartográficas</span> exactas y elaboramos <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">carpetas rápidas para minería</span> para la aprobación ágil del plan <span className="underline decoration-slate-400/50 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">EMAP</span> y trámites de <span className="underline decoration-slate-400/50 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">prospección minera</span> en tus <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">concesiones mineras</span>.
              </p>
              <button onClick={() => navigate('/quote')} className="card-btn px-8 py-3.5 bg-[#00e03c] text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-white transition-colors duration-300 pointer-events-auto">Aprobar Trámite Minero y Explotar</button>
            </div>
          </div>
        </div>

        {/* Tarjeta 4: SIG en la Gestión Ambiental — Mapas Ambientales SERAM — z-50 */}
        <div id="svc-card-4" style={getCardStyle(3)}>
          <img src="/assets/3d-backend/gis_satellite_mapping.webp" alt="SIG en la Gestión Ambiental — Mapas Ambientales SERAM" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="card-content opacity-0 absolute inset-0 flex flex-col justify-center px-8 md:px-24">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl max-w-xl shadow-2xl">
              <span className="card-tag text-[10px] uppercase tracking-wider font-extrabold text-[#00e03c]/90 font-tech mb-2 block">SIG en la Gestión Ambiental — SERAM Consultora Ambiental</span>
              <h3 className="card-title text-xl md:text-2xl font-black text-white mb-3 leading-tight">Mapas Ambientales que Aprueban: Diseñamos tu Plan de Aplicación SIG</h3>
              <p className="card-desc text-slate-200 mb-5 text-sm font-light leading-relaxed">
                Tu proyecto ambiental merece <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">mapas ambientales</span> que no sean observados. En la <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">consultora ambiental SERAM</span> ejecutamos tu <span className="underline decoration-[#00e03c]/60 decoration-2 underline-offset-2 font-medium text-white hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">Plan de Aplicación SIG para Proyectos Ambientales</span>. ¿Prefieres formar a tu equipo? Adquiere nuestro <span className="underline decoration-slate-400/50 decoration-2 underline-offset-2 font-medium text-slate-100 hover:text-[#00e03c] transition-colors duration-300 cursor-pointer pointer-events-auto">Curso de SIG Básico</span> y domina las herramientas desde cero.
              </p>
              <button onClick={() => navigate('/quote')} className="card-btn px-8 py-3.5 bg-[#00e03c] text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-white transition-colors duration-300 pointer-events-auto mb-4">Cotizar Mi Plan de Aplicación SIG</button>
              <div className="card-extra flex flex-col gap-3">
                <motion.button
                  onClick={() => navigate('/services')}
                  className="text-sm font-black text-white hover:text-[#00e03c] transition-colors duration-300 pointer-events-auto text-left leading-snug uppercase"
                >
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-block mr-2 text-[#00e03c]"
                    style={{ fontSize: '18px' }}
                  >→</motion.span>
                  ¿TU PROYECTO TIENE PLAZOS, MULTAS O PARALIZACIONES? CONOCE LA SOLUCIÓN EXACTA PARA CADA CASO
                </motion.button>
              </div>
            </div>
            
            {/* Indicador DESLIZA — Desktop centrado en la parte inferior (afuera de la tarjeta de cristal) */}
            <div className="absolute bottom-6 left-0 right-0 hidden sm:flex flex-col items-center justify-center pointer-events-none z-20">
              <div className="flex flex-col items-center gap-2 pointer-events-auto">
                <div className="flex w-[24px] h-[40px] border-2 border-white/50 rounded-full justify-center p-1.5 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  <div className="w-[3px] h-[7px] bg-[#00e03c] rounded-full animate-scrollIndicator" />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-tech select-none">
                  Desliza para explorar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── ACADEMY VERTICAL SECTION ─────────────────────────────────────────────────────
function AcademyVerticalSection() {
  const academyPillar = PILLARS[1];
  const navigate = useNavigate();

  return (
    <section className="min-h-screen w-full flex items-center justify-center py-20 px-6 sm:px-12 select-none bg-transparent relative z-10">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12 sm:gap-16">
        <div className="w-full md:w-1/2 flex flex-col items-start text-left space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter uppercase font-display filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
              {academyPillar.title}
            </h2>
          </div>
          <div className="w-full p-8 sm:p-10 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/30">
              {academyPillar.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">{academyPillar.headline}</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">{academyPillar.desc}</p>
            <button
              onClick={() => navigate(academyPillar.route)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/5 hover:bg-[#00e03c]/10 border border-white/10 hover:border-[#00e03c]/40 text-white hover:text-[#00e03c] rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300"
              data-cursor-text={academyPillar.ctaCursor}
            >
              {academyPillar.cta} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <img src={academyPillar.imageUrl} alt={academyPillar.title} className="w-full max-w-lg rounded-3xl object-cover aspect-video shadow-2xl border border-white/10" />
        </div>
      </div>
    </section>
  );
}

// ─── EXPERIENCE VERTICAL SECTION ──────────────────────────────────────────────────────
function ExperienceVerticalSection() {
  const experiencePillar = PILLARS[2];
  const navigate = useNavigate();

  return (
    <section className="min-h-screen w-full flex items-center justify-center py-20 px-6 sm:px-12 select-none bg-transparent relative z-10">
      <div className="max-w-6xl w-full flex flex-col md:flex-row-reverse items-center justify-between gap-12 sm:gap-16">
        <div className="w-full md:w-1/2 flex flex-col items-start text-left space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter uppercase font-display filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
              {experiencePillar.title}
            </h2>
          </div>
          <div className="w-full p-8 sm:p-10 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/30">
              {experiencePillar.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">{experiencePillar.headline}</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">{experiencePillar.desc}</p>
            <button
              onClick={() => navigate(experiencePillar.route)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/45 text-[#00e03c] rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300"
              data-cursor-text={experiencePillar.ctaCursor}
            >
              {experiencePillar.cta} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <img src={experiencePillar.imageUrl} alt={experiencePillar.title} className="w-full max-w-lg rounded-3xl object-cover aspect-video shadow-2xl border border-white/10" />
        </div>
      </div>
    </section>
  );
}

// ─── GSAP STORE SCALE-ON-SCROLL ──────────────────────────────────────────────────
function StoreHorizontalSection() {
  // triggerRef: el elemento exterior estable en el flujo del scroll
  const triggerRef = useRef(null);
  // pinRef: el contenedor interior que se fijará (con overflow: hidden para las tarjetas)
  const pinRef = useRef(null);
  const navigate = useNavigate();
  const { handleAddToCart, handleAccessItem, productList } = useApp();

  useGSAP(() => {
    const triggerEl = triggerRef.current;
    const pinEl = pinRef.current;
    if (!triggerEl || !pinEl) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top top',
        end: '+=400%',
        scrub: 1,
        pin: pinEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to('#store-intro', { opacity: 0, x: -100, duration: 1 }, 0)
      .to('#store-card-1', { width: '100vw', height: '100vh', right: 0, top: 0, transform: 'translateY(0)', borderRadius: 0, duration: 2, ease: 'power2.inOut' }, 0)
      .to('#store-card-1 .card-content', { opacity: 1, duration: 1 }, 1.5)
      .to('#store-card-3', { right: '-15vw', duration: 2, ease: 'power2.inOut' }, 0);

    tl.to('#store-card-1 .card-content', { opacity: 0, duration: 0.5 }, 3)
      .to('#store-card-2', { width: '100vw', height: '100vh', right: 0, top: 0, transform: 'translateY(0)', borderRadius: 0, duration: 2, ease: 'power2.inOut' }, 3)
      .to('#store-card-2 .card-content', { opacity: 1, duration: 1 }, 4.5)
      .to('#store-card-3', { right: '5vw', duration: 2, ease: 'power2.inOut' }, 3);

    tl.to('#store-card-2 .card-content', { opacity: 0, duration: 0.5 }, 6)
      .to('#store-card-3', { width: '100vw', height: '100vh', right: 0, top: 0, transform: 'translateY(0)', borderRadius: 0, duration: 2, ease: 'power2.inOut' }, 6)
      .to('#store-card-3 .card-content', { opacity: 1, duration: 1 }, 7.5);

  }, { scope: triggerRef });

  const handleBuyProduct = (product) => {
    handleAccessItem(product, 'product', () => handleAddToCart(product));
  };
  const featured = productList.slice(0, 3);

  return (
    // triggerRef: define la sección en el scroll.
    <div ref={triggerRef} className="relative w-full z-10">
      {/* pinRef: el contenedor que GSAP fijará. Tiene overflow: hidden y es relative. */}
      <div ref={pinRef} className="relative w-full h-screen overflow-hidden bg-transparent">
        {/* Intro panel */}
        <div id="store-intro" className="absolute inset-0 flex items-center px-8 md:px-24 z-10 pointer-events-none">
          <div className="w-full md:w-1/2 max-w-lg p-10 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
            <span className="text-[10px] text-[#00e03c] tracking-[0.3em] uppercase font-tech font-bold">Pilar 04 // Tienda</span>
            <h2 className="mt-3 text-5xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase font-display">
              SERAM <br /><span className="text-[#00e03c]">STORE</span>
            </h2>
            <p className="mt-5 text-slate-300 font-light leading-relaxed text-sm">
              Biblioteca de recursos y eco-compras. Libros técnicos, guías ecológicas y bio-insumos con envíos carbono neutro.
            </p>
            <button onClick={() => navigate('/shop')} className="mt-8 px-8 py-3.5 bg-white text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-[#00e03c] transition-colors duration-300 pointer-events-auto">
              Ver tienda completa
            </button>
          </div>
        </div>

        {/* Tarjeta 1: Insumos Orgánicos — z-20 */}
        <div id="store-card-1" style={{ ...cardBaseStyle, right: '30vw', width: '22vw', height: '65vh', zIndex: 20 }}>
          <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop" alt="Insumos Orgánicos" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="card-content opacity-0 absolute inset-0 flex flex-col justify-center px-8 md:px-24">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl max-w-xl shadow-2xl">
              <span className="text-xs text-[#00e03c] font-tech tracking-widest uppercase">Categoría 01</span>
              <h3 className="mt-2 text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Insumos Orgánicos</h3>
              <p className="text-slate-200 mb-8 font-light leading-relaxed">Bio-fertilizantes de lombricompostaje, sustratos premium y soluciones naturales para jardines y proyectos de reforestación.</p>
              {featured[0] && (
                <button onClick={() => handleBuyProduct(featured[0])} className="px-8 py-3.5 bg-[#00e03c] text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-white transition-colors duration-300 pointer-events-auto">
                  Añadir al carrito — Bs. {featured[0].price}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Biblioteca Técnica — z-30 */}
        <div id="store-card-2" style={{ ...cardBaseStyle, right: '5vw', width: '22vw', height: '65vh', zIndex: 30 }}>
          <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop" alt="Biblioteca Técnica" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="card-content opacity-0 absolute inset-0 flex flex-col justify-center px-8 md:px-24">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl max-w-xl shadow-2xl">
              <span className="text-xs text-[#00e03c] font-tech tracking-widest uppercase">Categoría 02</span>
              <h3 className="mt-2 text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Biblioteca Técnica</h3>
              <p className="text-slate-200 mb-8 font-light leading-relaxed">Guías SIG, manuales de auditoría ambiental, ebooks de legislación y recursos didácticos exclusivos de SERAM ACADEMY.</p>
              {featured[1] && (
                <button onClick={() => handleBuyProduct(featured[1])} className="px-8 py-3.5 bg-[#00e03c] text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-white transition-colors duration-300 pointer-events-auto">
                  Añadir al carrito — Bs. {featured[1].price}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Membresía Premium — z-40 */}
        <div id="store-card-3" style={{ ...cardBaseStyle, right: '-20vw', width: '22vw', height: '65vh', zIndex: 40 }}>
          <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop" alt="Membresía" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="card-content opacity-0 absolute inset-0 flex flex-col justify-center px-8 md:px-24">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl max-w-xl shadow-2xl">
              <span className="text-xs text-[#00e03c] font-tech tracking-widest uppercase">Categoría 03</span>
              <h3 className="mt-2 text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Membresía Premium</h3>
              <p className="text-slate-200 mb-6 font-light leading-relaxed">Accede a todos los cursos de Academy, descuentos en consultoría y envíos prioritarios. El plan para profesionales comprometidos.</p>
              {featured[2] && (
                <button onClick={() => handleBuyProduct(featured[2])} className="px-8 py-3.5 bg-[#00e03c] text-black font-black rounded-full text-xs tracking-widest uppercase hover:bg-white transition-colors duration-300 pointer-events-auto">
                  Añadir al carrito — Bs. {featured[2].price}
                </button>
              )}
              <div className="mt-6">
                <button onClick={() => navigate('/shop')} className="text-sm font-medium text-slate-300 hover:text-[#00e03c] transition-colors duration-300 pointer-events-auto">
                  Explora todos nuestros productos &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER SECTION ───────────────────────────────────────────────────────────
function FooterSection() {
  return (
    <footer className="w-full bg-slate-950/40 border-t border-white/10 py-16 px-6 sm:px-12 md:px-24 select-none relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
        {/* Columna 1: Socios Fundadores */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src="/assets/brand/ícono_logo.png" alt="SERAM" className="w-6 h-6 object-contain" />
            <span className="text-xs font-black text-white uppercase tracking-widest font-tech">SERAM</span>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Socios Fundadores</p>
          <ul className="space-y-2 text-xs font-bold text-slate-300">
            <li className="hover:text-[#00e03c] transition-colors">Ing. Diego Barrientos</li>
            <li className="hover:text-[#00e03c] transition-colors">Ing. Fernando Araujo</li>
            <li className="hover:text-[#00e03c] transition-colors">Ing. Fabricio Orosco</li>
          </ul>
        </div>

        {/* Columna 2: Redes Sociales */}
        <div className="space-y-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Conéctate con nosotros</p>
          <div className="flex items-center gap-4 pt-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-slate-400 hover:text-[#00e03c] flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md pointer-events-auto"
              data-cursor-text="INSTAGRAM"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-slate-400 hover:text-[#00e03c] flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md pointer-events-auto"
              data-cursor-text="TIKTOK"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-slate-400 hover:text-[#00e03c] flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md pointer-events-auto"
              data-cursor-text="YOUTUBE"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-tech">
            Innovación tecnológica y compromiso socio-ambiental de élite.
          </p>
        </div>

        {/* Columna 3: Información de Contacto e Enlaces Legales */}
        <div className="space-y-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Ubicación y Legalidad</p>
          <div className="text-xs text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-300">Oficina Central Bolivia:</p>
            <p>Calle Presbítero Medina N° 2026, Sopocachi, La Paz</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Link to="/contact" className="hover:text-white transition-colors pointer-events-auto">Contacto</Link>
            <a href="#" className="hover:text-white transition-colors pointer-events-auto">Términos</a>
            <a href="#" className="hover:text-white transition-colors pointer-events-auto">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors pointer-events-auto">Cookies</a>
          </div>
          <p className="text-[10px] text-slate-600 font-mono mt-4">
            © 2026 SERAM SRL. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── HOME PAGE PRINCIPAL ──────────────────────────────────────────────────────
export default function HomePage() {
  const outsideAppValue = useApp();

  // Ref compartido con EnvironmentalCanvas — el canvas lee este valor en su propio
  // scroll listener interno (InteractiveScene), así evitamos listeners duplicados.
  const hProgressRef = useRef(0);

  return (
    <div className="relative w-full min-h-screen neuform-bg text-slate-100 overflow-x-clip">
      {/* 1. Canvas WebGL Fijo — recibe la ref de progreso horizontal */}
      <EnvironmentalCanvas isStorytelling={true} hProgressRef={hProgressRef} />

      {/* 2. Contenido HTML sobre el canvas */}
      <div className="relative z-10 w-full">
        <AppContext.Provider value={outsideAppValue}>
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full flex flex-col"
          >
            {/* ── HERO ── */}
            <HeroSection />

            {/* ── SERVICIOS HORIZONTAL ── */}
            <ServicesHorizontalSection />

            {/* ── ACADEMIA VERTICAL ── */}
            <AcademyVerticalSection />

            {/* ── EXPERIENCIA VERTICAL ── */}
            <ExperienceVerticalSection />

            {/* ── TIENDA HORIZONTAL ── */}
            <StoreHorizontalSection />

            {/* ── FOOTER FINAL ── */}
            <FooterSection />
          </motion.div>
        </AppContext.Provider>
      </div>
    </div>
  );
}

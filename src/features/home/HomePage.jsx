/**
 * @file HomePage.jsx
 * @description Página principal de SERAM con scroll híbrido (vertical-horizontal-vertical-horizontal-vertical) AAA.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Briefcase, Award, ChevronRight, ShoppingCart, Instagram, Youtube,
} from 'lucide-react';
import { useApp, AppContext } from '../../context/AppContext';
import EnvironmentalCanvas from '../../components/ui/EnvironmentalCanvas';
import BrandParticleText from '../../components/ui/BrandParticleText';

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
const LERP_SPEED = 0.09;    // Amortiguación orgánica

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
    headline: 'DIAGNÓSTICO Y SOLUCIONES DE VANGUARDIA',
    desc: 'Consultoría ambiental corporativa y monitoreo de alta precisión. Asegura el cumplimiento de licencias ambientales y mitiga riesgos normativos con SIG especializado, gestión de residuos y lombricultura a gran escala.',
    cta: 'Cotizar Gratis con Diagnóstico Digital',
    route: '/quote',
    ctaCursor: 'COTIZAR',
    variant: 'light',
  },
  {
    id: 'academy',
    title: 'SERAM ACADEMY',
    sub: 'Pilar 02 // Formación',
    imageUrl: '/assets/3d-backend/fondo SERAM-ACADEMY2.webp',
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
    imageUrl: '/assets/3d-backend/Seram-Exp-background.webp',
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
  return (
    <section
      className="relative overflow-hidden min-h-screen w-full flex flex-col items-center justify-center py-20 px-6 sm:px-12 select-none bg-transparent"
      aria-label="Portada SERAM"
    >
      <div className="text-center space-y-8 z-10 w-full max-w-4xl flex flex-col items-center justify-center">
        <motion.div custom={1} variants={staggerChild} initial="initial" animate="animate" className="w-full flex flex-col items-center gap-3">
          <BrandParticleText />
          <p className="text-[10px] sm:text-xs text-slate-400 font-tech uppercase tracking-[0.25em] max-w-lg mt-2 text-center select-none leading-relaxed">
            SERVICIOS AMBIENTALES.
          </p>
        </motion.div>
      </div>

      <motion.div
        custom={2}
        variants={staggerChild}
        initial="initial"
        animate="animate"
        className="absolute bottom-6 opacity-60 flex flex-col items-center gap-2 z-20"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      >
        <div className="w-[24px] h-[40px] border-2 border-white/50 rounded-full flex justify-center p-1.5">
          <div className="w-[3px] h-[7px] bg-[#00e03c] rounded-full animate-scrollIndicator" />
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-tech select-none">
          Desliza para explorar
        </span>
      </motion.div>
    </section>
  );
}

// ─── SERVICES HORIZONTAL SECTION ──────────────────────────────────────────────
function PanelServicesList() {
  const services = [
    {
      title: 'Monitoreo Ambiental',
      desc: 'Medición de precisión para aire, agua y suelos bajo estándares internacionales.',
      icon: '📊',
    },
    {
      title: 'Sistemas de Info Geográfica (SIG)',
      desc: 'Cartografía avanzada y análisis espacial para ordenamiento territorial y licencias.',
      icon: '🗺️',
    },
    {
      title: 'Gestión de Residuos',
      desc: 'Soluciones de economía circular y lombricultura industrial a gran escala.',
      icon: '♻️',
    },
  ];

  return (
    <div className="w-[100vw] h-screen flex flex-col justify-center px-10 sm:px-24 flex-shrink-0 bg-transparent select-none">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        <div className="text-left space-y-2">
          <span className="text-[10px] text-[#00e03c] tracking-[0.25em] uppercase font-tech font-bold">Portafolio</span>
          <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
            Servicios Destacados
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col items-start gap-4 transition-all duration-300 hover:bg-white/10 hover:border-[#00e03c]/30"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00e03c]/10 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/20 text-xl font-bold">
                {s.icon}
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesHorizontalSection() {
  const outerRef = useRef(null);
  const trackRef = useRef(null);
  const targetXRef = useRef(0);
  const currentXRef = useRef(0);
  const rafIdRef = useRef(null);

  const rafLoop = useCallback(() => {
    const curr = currentXRef.current;
    const target = targetXRef.current;
    const next = curr + (target - curr) * LERP_SPEED;

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-next}px)`;
    }
    currentXRef.current = next;

    rafIdRef.current = requestAnimationFrame(rafLoop);
  }, []);

  const handleScroll = useCallback(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const outerTop = outer.offsetTop;
    const scrollY = window.scrollY;
    const relativeY = scrollY - outerTop;

    if (relativeY < 0) {
      targetXRef.current = 0;
    } else {
      const scrollableHeight = outer.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, relativeY / scrollableHeight));
      const maxX = window.innerWidth * 2; // Translates exactly 200vw
      targetXRef.current = progress * maxX;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafIdRef.current = requestAnimationFrame(rafLoop);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [handleScroll, rafLoop]);

  const servicesPillar = PILLARS[0];

  return (
    <div ref={outerRef} style={{ height: '300vh' }} className="relative bg-transparent z-10">
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }} className="flex flex-col justify-center">
        <div className="absolute left-8 top-24 z-20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e03c] animate-pulse" />
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest font-tech">Servicios Ambientales</span>
        </div>

        <div
          ref={trackRef}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            height: '100%',
            width: '300vw',
            willChange: 'transform',
            transform: 'translateX(0px)',
          }}
        >
          <PanelA pillar={servicesPillar} />
          <PanelServicesList />
          <PanelB pillar={servicesPillar} />
        </div>
      </div>
    </div>
  );
}

// ─── ACADEMY VERTICAL SECTION ─────────────────────────────────────────────────
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
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {academyPillar.headline}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              {academyPillar.desc}
            </p>
            <button
              onClick={() => navigate(academyPillar.route)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/5 hover:bg-[#00e03c]/10 border border-white/10 hover:border-[#00e03c]/40 text-white hover:text-[#00e03c] rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300"
              data-cursor-text={academyPillar.ctaCursor}
            >
              {academyPillar.cta} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center max-w-lg">
          <TiltGlassCard imageUrl={academyPillar.imageUrl} cursorText={academyPillar.cursorText} />
        </div>
      </div>
    </section>
  );
}

// ─── EXPERIENCE VERTICAL SECTION ──────────────────────────────────────────────
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
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {experiencePillar.headline}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              {experiencePillar.desc}
            </p>
            <button
              onClick={() => navigate(experiencePillar.route)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/45 text-[#00e03c] rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300"
              data-cursor-text={experiencePillar.ctaCursor}
            >
              {experiencePillar.cta} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center max-w-lg">
          <TiltGlassCard imageUrl={experiencePillar.imageUrl} cursorText={experiencePillar.cursorText} />
        </div>
      </div>
    </section>
  );
}

// ─── STORE HORIZONTAL SECTION ─────────────────────────────────────────────────
function StoreHorizontalSection() {
  const navigate = useNavigate();
  const { productList, handleAddToCart, handleAccessItem } = useApp();
  const outerRef = useRef(null);
  const trackRef = useRef(null);
  const targetXRef = useRef(0);
  const currentXRef = useRef(0);
  const rafIdRef = useRef(null);

  const rafLoop = useCallback(() => {
    const curr = currentXRef.current;
    const target = targetXRef.current;
    const next = curr + (target - curr) * LERP_SPEED;

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-next}px)`;
    }
    currentXRef.current = next;

    rafIdRef.current = requestAnimationFrame(rafLoop);
  }, []);

  const handleScroll = useCallback(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const outerTop = outer.offsetTop;
    const scrollY = window.scrollY;
    const relativeY = scrollY - outerTop;

    if (relativeY < 0) {
      targetXRef.current = 0;
    } else {
      const scrollableHeight = outer.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, relativeY / scrollableHeight));
      const maxX = window.innerWidth;
      targetXRef.current = progress * maxX;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafIdRef.current = requestAnimationFrame(rafLoop);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [handleScroll, rafLoop]);

  const storePillar = PILLARS[3];

  const handleBuyProduct = (product) => {
    handleAccessItem(product, 'product', () => {
      handleAddToCart(product);
    });
  };

  return (
    <div ref={outerRef} style={{ height: '200vh' }} className="relative bg-transparent z-10">
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }} className="flex flex-col justify-center">
        <div className="absolute left-8 top-24 z-20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e03c] animate-pulse" />
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest font-tech">Eco-Tienda y Recursos</span>
        </div>

        <div
          ref={trackRef}
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            height: '100%',
            width: '200vw',
            willChange: 'transform',
            transform: 'translateX(0px)',
          }}
        >
          {/* Panel A: Intro */}
          <div className="w-[100vw] h-screen flex flex-col md:flex-row items-center justify-center gap-12 px-10 sm:px-24 flex-shrink-0 select-none bg-transparent">
            <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <h2 className="text-[3.5rem] sm:text-[5.5rem] font-black text-white leading-none tracking-tighter uppercase font-display filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
                {storePillar.title}
              </h2>
            </div>
            <div className="md:w-1/2 flex items-center justify-center max-w-lg w-full">
              <TiltGlassCard imageUrl={storePillar.imageUrl} cursorText={storePillar.cursorText} />
            </div>
          </div>

          {/* Panel B: Productos */}
          <div className="w-[100vw] h-screen flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 flex-shrink-0 bg-transparent relative">
            <div className="max-w-6xl w-full text-left mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {storePillar.headline}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Desliza horizontalmente para explorar nuestros insumos orgánicos, libros técnicos y herramientas SIG.
              </p>
            </div>

            <div className="w-full max-w-6xl overflow-x-auto py-6 px-2 flex gap-6 flex-nowrap scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#00e03c]/20 scroll-smooth pointer-events-auto">
              {productList.map((product) => (
                <div
                  key={product.id}
                  className="w-72 bg-white/[0.08] border border-white/[0.14] rounded-2xl p-5 flex flex-col justify-between shrink-0 transition-all duration-300 shadow-lg hover:border-[#00e03c]/40 hover:shadow-[0_0_15px_rgba(0,224,60,0.15)] group relative"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900/60 border border-white/5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-wider bg-[#00e03c]/20 border border-[#00e03c]/35 text-[#00e03c] px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-white line-clamp-1 group-hover:text-[#00e03c] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-2">
                        {product.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
                    <span className="text-sm font-black text-[#00e03c]">
                      Bs. {product.price}
                    </span>
                    <button
                      onClick={() => handleBuyProduct(product)}
                      className="px-3.5 py-1.5 bg-[#00e03c] text-slate-950 font-black uppercase tracking-wider text-[9px] rounded-lg hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end max-w-6xl w-full">
              <button
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-[#00e03c]/15 border border-white/10 hover:border-[#00e03c]/40 text-white hover:text-[#00e03c] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 pointer-events-auto"
              >
                Ir a Tienda Completa <ChevronRight className="w-4.5 h-4.5" />
              </button>
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

  // Ref compartido con EnvironmentalCanvas para sincronización WebGL sin re-render
  const hProgressRef = useRef(0);

  // Listener para el scroll global de la página
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      hProgressRef.current = progress;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

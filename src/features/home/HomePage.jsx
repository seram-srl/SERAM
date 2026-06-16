import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Briefcase, Award, ChevronRight,
  ShoppingCart, Lock, Leaf, Globe
} from 'lucide-react';
import { useApp, AppContext } from '../../context/AppContext';
import EnvironmentalCanvas from '../../components/ui/EnvironmentalCanvas';
import BrandParticleText from '../../components/ui/BrandParticleText';

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

/**
 * @component TiltGlassCard
 * @description Tarjeta de cristal 3D interactiva que rota elásticamente según la posición del cursor.
 */
function TiltGlassCard({ imageUrl, cursorText = "EXPLORAR" }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [12, -12]);
  const rotateY = useTransform(x, [0, 1], [-12, 12]);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.6 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
      }}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden glass-panel-dark border border-white/10 hover:border-[#00e03c]/40 shadow-[0_16px_40px_rgba(0,0,0,0.65)] cursor-none transition-all duration-300 pointer-events-auto"
      data-cursor-text={cursorText}
    >
      <div 
        style={{ transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}
        className="w-full h-full p-2.5"
      >
        <img
          src={imageUrl}
          alt="SERAM Visual Continuity"
          className="w-full h-full object-cover rounded-xl opacity-90 hover:scale-102 transition-transform duration-500 select-none"
          draggable="false"
        />
      </div>
    </motion.div>
  );
}

/**
 * @component HeroSection
 * @description Portada minimalista con tipografía de partículas reactivas y watermark de hoja en 3D.
 */
function HeroSection() {
  return (
    <section
      className="relative overflow-hidden min-h-screen w-full flex flex-col items-center justify-center py-20 px-6 sm:px-12 select-none bg-transparent"
      aria-label="Portada SERAM"
    >
      {/* Marca de agua flotante de la hoja en el fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none z-0">
        <motion.img
          src="/assets/brand/ícono_logo.png"
          alt="Watermark SERAM"
          className="w-[280px] h-[280px] sm:w-[480px] sm:h-[480px] object-contain"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 1.5, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="text-center space-y-8 z-10 w-full max-w-4xl flex flex-col items-center justify-center">
        {/* Marca SERAM interactiva con partículas Canvas */}
        <motion.div
          custom={1}
          variants={staggerChild}
          initial="initial"
          animate="animate"
          className="w-full"
        >
          <BrandParticleText />
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div
          custom={2}
          variants={staggerChild}
          initial="initial"
          animate="animate"
          className="pt-8 opacity-60 flex flex-col items-center gap-2"
        >
          <div className="w-[24px] h-[40px] border-2 border-white/50 rounded-full flex justify-center p-1.5">
            <div className="w-[3px] h-[7px] bg-[#00e03c] rounded-full animate-scrollIndicator" />
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-tech select-none">
            Desliza para explorar
          </span>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const outsideAppValue = useApp();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Vincular scroll vertical a traslación horizontal
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
    mass: 0.8,
  });

  // Mapear el recorrido del scroll vertical a la traslación del contenedor horizontal en vw
  // Son 8 paneles de 100vw cada uno. Mapeamos desde 0vw a -700vw (para revelar el 8vo panel)
  const xTranslation = useTransform(smoothProgress, [0.18, 0.95], ["0vw", "-700vw"]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* 1. Fondo Canvas WebGL Fijo */}
      <EnvironmentalCanvas isStorytelling={true} />

      {/* 2. Contenido HTML */}
      <div className="relative z-10 w-full">
        <AppContext.Provider value={outsideAppValue}>
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full flex flex-col"
          >
            {/* Portada Hero Inicial */}
            <HeroSection />

            {/* SECCIÓN NARRATIVA DE DESPLAZAMIENTO HORIZONTAL (PILARES - 2 PANALES CADA UNO) */}
            <div ref={containerRef} className="relative h-[650vh] bg-transparent">
              <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
                <motion.div
                  style={{ x: xTranslation }}
                  className="flex flex-row flex-nowrap items-center h-full w-[800vw] will-change-transform"
                >
                  
                  {/* ──────────────────────────────────────────────────────── */}
                  {/* PILAR 01: SERAM SERVICES */}
                  {/* ──────────────────────────────────────────────────────── */}

                  {/* Panel 1: Título & Imagen 2D */}
                  <div className="w-[100vw] h-screen flex flex-col md:flex-row items-center justify-center gap-12 px-10 sm:px-24 flex-shrink-0 select-none bg-transparent">
                    <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                      <h2 className="text-[3.5rem] sm:text-[5.5rem] font-black text-white leading-none tracking-tighter uppercase font-display pilar-title filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
                        SERAM SERVICES
                      </h2>
                      <span className="text-[10px] text-[#00e03c] tracking-[0.25em] uppercase font-tech font-bold">
                        Pilar 01 // Consultoría
                      </span>
                    </div>
                    <div className="md:w-1/2 flex items-center justify-center max-w-lg w-full">
                      <TiltGlassCard 
                        imageUrl="/assets/3d-backend/panel2-service-background.webp" 
                        cursorText="SERVICIOS" 
                      />
                    </div>
                  </div>

                  {/* Panel 2: Detalle Informativo + CTA (Caja Clara) */}
                  <div className="w-[100vw] h-screen flex items-center justify-center px-10 sm:px-24 flex-shrink-0 bg-transparent">
                    <div className="max-w-2xl p-8 sm:p-12 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-start gap-6 text-left">
                      <div className="w-12 h-12 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/30">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        DIAGNÓSTICO Y SOLUCIONES DE VANGUARDIA
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Brindamos consultoría ambiental corporativa y monitoreo de alta precisión. Asegura el cumplimiento de licencias ambientales y mitiga riesgos normativos con SIG especializado, gestión de residuos y lombricultura a gran escala.
                      </p>
                      <button
                        onClick={() => navigate('/quote')}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/45 text-[#00e03c] text-xs font-black uppercase tracking-wider transition-all duration-300"
                        data-cursor-text="COTIZAR"
                      >
                        Cotizar Gratis con Diagnóstico Digital <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ──────────────────────────────────────────────────────── */}
                  {/* PILAR 02: SERAM ACADEMY */}
                  {/* ──────────────────────────────────────────────────────── */}

                  {/* Panel 1: Título & Imagen 2D */}
                  <div className="w-[100vw] h-screen flex flex-col md:flex-row items-center justify-center gap-12 px-10 sm:px-24 flex-shrink-0 select-none bg-transparent">
                    <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                      <h2 className="text-[3.5rem] sm:text-[5.5rem] font-black text-white leading-none tracking-tighter uppercase font-display pilar-title filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
                        SERAM ACADEMY
                      </h2>
                      <span className="text-[10px] text-[#00e03c] tracking-[0.25em] uppercase font-tech font-bold">
                        Pilar 02 // Formación
                      </span>
                    </div>
                    <div className="md:w-1/2 flex items-center justify-center max-w-lg w-full">
                      <TiltGlassCard 
                        imageUrl="/assets/3d-backend/fondo SERAM-ACADEMY2.webp" 
                        cursorText="APRENDER" 
                      />
                    </div>
                  </div>

                  {/* Panel 2: Detalle Informativo + CTA (Caja Oscura) */}
                  <div className="w-[100vw] h-screen flex items-center justify-center px-10 sm:px-24 flex-shrink-0 bg-transparent">
                    <div className="max-w-2xl p-8 sm:p-12 rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-start gap-6 text-left">
                      <div className="w-12 h-12 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/30">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        CAPACITACIÓN ECOLÓGICA Y TÉCNICA
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Accede a nuestra ala formativa especializada. Cursos de SIG aplicado, auditoría y legislación bajo normativas ISO internacionales. Diseñamos planes gratis, de pago y membresías premium académicas.
                      </p>
                      <button
                        onClick={() => navigate('/academy')}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-[#00e03c]/10 border border-white/10 hover:border-[#00e03c]/40 text-white hover:text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all duration-300"
                        data-cursor-text="ACADEMIA"
                      >
                        Ingresar a Academy <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ──────────────────────────────────────────────────────── */}
                  {/* PILAR 03: SERAM EXPERIENCE */}
                  {/* ──────────────────────────────────────────────────────── */}

                  {/* Panel 1: Título & Imagen 2D */}
                  <div className="w-[100vw] h-screen flex flex-col md:flex-row items-center justify-center gap-12 px-10 sm:px-24 flex-shrink-0 select-none bg-transparent">
                    <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                      <h2 className="text-[3.5rem] sm:text-[5.5rem] font-black text-white leading-none tracking-tighter uppercase font-display pilar-title filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
                        SERAM EXPERIENCE
                      </h2>
                      <span className="text-[10px] text-[#00e03c] tracking-[0.25em] uppercase font-tech font-bold">
                        Pilar 03 // Vivencial
                      </span>
                    </div>
                    <div className="md:w-1/2 flex items-center justify-center max-w-lg w-full">
                      <TiltGlassCard 
                        imageUrl="/assets/3d-backend/Seram-Exp-background.webp" 
                        cursorText="VIVIR" 
                      />
                    </div>
                  </div>

                  {/* Panel 2: Detalle Informativo + CTA (Caja Clara) */}
                  <div className="w-[100vw] h-screen flex items-center justify-center px-10 sm:px-24 flex-shrink-0 bg-transparent">
                    <div className="max-w-2xl p-8 sm:p-12 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-start gap-6 text-left">
                      <div className="w-12 h-12 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/30">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        RESTAURACIÓN ECOLÓGICA ACTIVA
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Conectamos personas y corporaciones con la conservación terrestre. Únete a voluntariados en el Valle de Zongo, expediciones científicas y talleres de huertos urbanos diseñados por biólogos expertos.
                      </p>
                      <button
                        onClick={() => navigate('/experience')}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-[#00e03c]/10 border border-white/10 hover:border-[#00e03c]/40 text-white hover:text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all duration-300"
                        data-cursor-text="VIVIR"
                      >
                        Conocer Experiencias <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ──────────────────────────────────────────────────────── */}
                  {/* PILAR 04: SERAM STORE */}
                  {/* ──────────────────────────────────────────────────────── */}

                  {/* Panel 1: Título & Imagen 2D */}
                  <div className="w-[100vw] h-screen flex flex-col md:flex-row items-center justify-center gap-12 px-10 sm:px-24 flex-shrink-0 select-none bg-transparent">
                    <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                      <h2 className="text-[3.5rem] sm:text-[5.5rem] font-black text-white leading-none tracking-tighter uppercase font-display pilar-title filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]">
                        SERAM STORE
                      </h2>
                      <span className="text-[10px] text-[#00e03c] tracking-[0.25em] uppercase font-tech font-bold">
                        Pilar 04 // Tienda
                      </span>
                    </div>
                    <div className="md:w-1/2 flex items-center justify-center max-w-lg w-full">
                      <TiltGlassCard 
                        imageUrl="/assets/3d-backend/landspace-backgroundstore.webp" 
                        cursorText="TIENDA" 
                      />
                    </div>
                  </div>

                  {/* Panel 2: Detalle Informativo + CTA (Caja Oscura) */}
                  <div className="w-[100vw] h-screen flex items-center justify-center px-10 sm:px-24 flex-shrink-0 bg-transparent">
                    <div className="max-w-2xl p-8 sm:p-12 rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-start gap-6 text-left">
                      <div className="w-12 h-12 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/30">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                        BIBLIOTECA DE RECURSOS Y ECO-COMPRAS
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Descubre libros técnicos, guías ecológicas y bio-insumos. Aplica interlinking directo para desbloquear ebooks en la academia tras adquirirlos en la tienda. Envíos carbono neutro rápidos.
                      </p>
                      <button
                        onClick={() => navigate('/shop')}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/45 text-[#00e03c] text-xs font-black uppercase tracking-wider transition-all duration-300"
                        data-cursor-text="TIENDA"
                      >
                        Ver SERAM STORE <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </motion.div>
              </div>
            </div>

            {/* SECCIÓN FINAL */}
            <div className="h-[20vh] bg-transparent flex items-center justify-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-tech select-none">
                SERAM © 2026 · Tecno-Ecología Estratégica
              </p>
            </div>

          </motion.div>
        </AppContext.Provider>
      </div>
    </div>
  );
}

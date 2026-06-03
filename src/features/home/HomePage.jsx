import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Briefcase, Award, ChevronRight,
  ShoppingCart, Lock,
} from 'lucide-react';
import { useApp, AppContext } from '../../context/AppContext';
import EnvironmentalCanvas from '../../components/ui/EnvironmentalCanvas';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

/**
 * @component TiltIcon
 * @description Contenedor elástico 3D para íconos de servicios.
 */
function TiltIcon({ children }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [15, -15]);
  const rotateY = useTransform(x, [0, 1], [-15, 15]);

  const springConfig = { damping: 22, stiffness: 300, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      className="w-16 h-16 sm:w-20 sm:h-20 cursor-pointer select-none pointer-events-auto bg-emerald-900/10 border border-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-800 shadow-md"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * @component HeroSection
 * @description Hero principal de la página, alineado a la izquierda con cristal esmerilado premium.
 */
function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-start py-24 px-6 sm:px-12 lg:px-24 bg-transparent select-none">
      {/* Contenedor con Cristal Esmerilado Premium */}
      <div className="relative max-w-md backdrop-blur-md bg-white/10 border border-white/20 shadow-lg rounded-3xl p-8 sm:p-10 flex flex-col items-start justify-center space-y-5 text-left animate-fadeIn">
        
        {/* Título de Marca y Eslogan */}
        <div className="space-y-1">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tighter font-display select-none">
            <span className="text-white">SER</span>
            <span className="text-[#00e03c]">A</span>
            <span className="text-white">M</span>
          </h1>
          <p className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] font-tech select-none">
            Servicios Ambientales
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const outsideAppValue = useApp();
  const navigate = useNavigate();

  const {
    handleAddToCart, handleAccessItem,
    hasPremiumAccess, products,
  } = outsideAppValue;

  // Manejador de scroll para el bucle continuo nativo
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Si llegamos al final del scroll, teletransportamos arriba (al Hero original)
      if (scrollY >= maxScroll - 2) {
        window.scrollTo(0, 5); 
      }
      // Si subimos al tope absoluto, teletransportamos abajo (al Hero duplicado/clon)
      else if (scrollY <= 0) {
        window.scrollTo(0, maxScroll - 5);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* 1. Fondo Canvas WebGL Fijo */}
      <EnvironmentalCanvas isStorytelling={true} />

      {/* 2. Contenido HTML que fluye libremente sobre el canvas (pointer-events: none) */}
      <div className="relative z-10 w-full pointer-events-none">
        <AppContext.Provider value={outsideAppValue}>
          <motion.div 
            variants={pageVariants} 
            initial="initial" 
            animate="animate" 
            exit="exit" 
            className="w-full flex flex-col pointer-events-none"
          >
            {/* Activar eventos de ratón en las secciones reales */}
            <div className="pointer-events-auto w-full">
              {/* ── BLOQUE 1: INICIO / HERO ── */}
              <HeroSection />

              {/* ── BLOQUE 2: SERAM SERVICE (Pilar 01) ── */}
              <section className="relative min-h-screen flex items-center justify-start py-24 px-6 sm:px-12 lg:px-24 bg-transparent select-none">
                <div className="relative max-w-2xl w-full backdrop-blur-md bg-white/10 border border-white/20 shadow-lg rounded-3xl p-8 sm:p-12 flex flex-col items-start justify-center space-y-6 text-left animate-fadeIn">
                  
                  {/* Icono de Pilar Inclinable */}
                  <TiltIcon>
                    <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 filter drop-shadow-[0_4px_8px_rgba(0,127,26,0.15)]" />
                  </TiltIcon>

                  {/* Tag de Pilar */}
                  <div className="inline-flex items-center gap-2 bg-emerald-900/10 border border-emerald-900/20 px-4 py-1.5 rounded-full text-emerald-950 text-[11px] sm:text-xs font-bold uppercase tracking-widest font-tech">
                    Pilar 01 // Consultoría Ambiental
                  </div>

                  {/* Título y Subtítulo */}
                  <div className="space-y-1">
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-none tracking-tight uppercase select-none">
                      SERAM_SERVICES
                    </h2>
                    <p className="text-emerald-800 text-xs sm:text-sm font-black uppercase tracking-[0.2em] font-tech select-none">
                      Análisis Territorial y Cumplimiento Normativo
                    </p>
                  </div>

                  {/* Descripción */}
                  <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-semibold">
                    Ofrecemos análisis territorial avanzado mediante Sistemas de Información Geográfica (SIG), 
                    auditorías ambientales completas, diseño de planes de mitigación ambiental y estudios de impacto 
                    regulados para asegurar el cumplimiento normativo industrial.
                  </p>

                  {/* Botón Explorar */}
                  <div className="pt-2">
                    <button 
                      onClick={() => navigate('/services')} 
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/10 border border-slate-900/20 hover:border-emerald-800 text-slate-900 hover:text-emerald-800 text-xs font-bold uppercase tracking-wider transition-all pointer-events-auto"
                      style={{ cursor: 'none' }}
                    >
                      Explorar Servicios <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* ── BLOQUE 3: SERAM ACADEMY (Pilar 02) ── */}
              <section className="relative min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="glass-panel-dark max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 border border-white/[0.08] hover:border-[#00e03c]/20 transition-all flex flex-col items-center text-center space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <div className="p-4 bg-slate-900/80 rounded-2xl text-[#00e03c] border border-white/10">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-[#00e03c] uppercase font-tech">Pilar 02 // E-Learning</span>
                  <h2 className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight uppercase">
                    SERAM_ACADEMY
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                    Nuestra ala formativa especializada de élite. Diseñamos e impartimos diplomados y cursos 
                    para profesionales, estudiantes y docentes en materias de evaluación de impacto, cartografía SIG, 
                    legislación y educación ecosistemica de vanguardia bajo normativas ISO.
                  </p>
                  <div className="pt-4">
                    <button 
                      onClick={() => navigate('/academy')} 
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-white hover:text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all"
                      style={{ cursor: 'none' }}
                    >
                      Ingresar a Academy <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* ── BLOQUE 4: SERAM EXPERIENCE (Pilar 03) ── */}
              <section className="relative min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="glass-panel-dark max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 border border-white/[0.08] hover:border-[#00e03c]/20 transition-all flex flex-col items-center text-center space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <div className="p-4 bg-slate-900/80 rounded-2xl text-[#00e03c] border border-white/10">
                    <Award className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-[#00e03c] uppercase font-tech">Pilar 03 // Experiencias</span>
                  <h2 className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight uppercase">
                    SERAM_EXPERIENCE
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                    Experiencias corporativas y vivenciales que conectan el talento con el ecosistema. 
                    Estructuramos voluntariados de restauración ecológica activa, talleres vivenciales de conservación, 
                    diseño de huertos urbanos y expediciones científicas orientadas al ecoturismo.
                  </p>
                  <div className="pt-4">
                    <button 
                      onClick={() => navigate('/experience')} 
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-white hover:text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all"
                      style={{ cursor: 'none' }}
                    >
                      Conocer Experiencias <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* ── BLOQUE 5: ECO-TIENDA SERAM (Pilar 04) ── */}
              <section className="relative min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-7xl mx-auto w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
                    <div>
                      <span className="text-xs font-black tracking-widest text-[#00e03c] uppercase font-tech">Pilar 04 // Consumo</span>
                      <h2 className="text-4xl font-black text-white font-display uppercase tracking-tight">Eco-Tienda SERAM</h2>
                      <p className="text-xs text-slate-500 mt-1">Apoya la educación y conservación adquiriendo artículos ecológicos oficiales.</p>
                    </div>
                    <button onClick={() => navigate('/shop')} className="mt-4 md:mt-0 glass-panel-dark px-5 py-2.5 rounded-xl font-bold text-xs uppercase hover:border-white/20 transition-colors tracking-wider text-slate-300" style={{ cursor: 'none' }}>
                      Ver Tienda Completa
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.slice(0, 4).map(product => (
                      <div key={product.id} className="glass-panel-dark rounded-2xl overflow-hidden flex flex-col h-full group hover:border-white/15 transition-all">
                        <div className="relative aspect-square overflow-hidden bg-slate-900">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-slate-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-white/10">
                            {product.category}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-white mb-1 group-hover:text-[#00e03c] transition-colors">{product.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{product.desc}</p>
                          </div>
                          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between mt-4">
                            <span className="text-lg font-black text-[#00e03c]">${product.price} USD</span>
                            <button
                              onClick={() => handleAccessItem(product, 'product', () => handleAddToCart(product))}
                              className="bg-white/10 hover:bg-[#00e03c]/20 text-white p-2 rounded-xl transition-colors border border-white/10 hover:border-[#00e03c]/40"
                              style={{ cursor: 'none' }}
                            >
                              {product.isPremium && !hasPremiumAccess ? <Lock className="w-4 h-4 text-amber-400" /> : <ShoppingCart className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── BLOQUE 6: INICIO / CLON PARA BUCLE CONTINUO ── */}
              <HeroSection />
            </div>
          </motion.div>
        </AppContext.Provider>
      </div>
    </div>
  );
}

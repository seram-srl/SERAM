import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Briefcase, Award, Leaf, ChevronRight,
  ShoppingCart, Lock,
} from 'lucide-react';
import { useApp, AppContext } from '../../context/AppContext';
import EnvironmentalCanvas from '../../components/ui/EnvironmentalCanvas';
import { Scroll } from '@react-three/drei';
import fondo1erPanel from '../../assets/fondo_1er_panel.webp';
import fondo2doPanel from '../../assets/fondo2_2do_panel.webp';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export default function HomePage() {
  const outsideAppValue = useApp();
  const navigate = useNavigate();

  const {
    handleAddToCart, handleAccessItem,
    hasPremiumAccess, products,
  } = outsideAppValue;

  // Estado y manejadores para el efecto 3D Tilt interactivo del logotipo (Panel 1)
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);

  const handleMouseMoveTilt = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Inclinación sutil de hasta 15 grados en base al movimiento del cursor
    const tiltX = -(y / (rect.height / 2)) * 15;
    const tiltY = (x / (rect.width / 2)) * 15;
    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  const handleMouseLeaveTilt = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Estado y manejadores para el efecto 3D Tilt interactivo del ícono de servicios (Panel 2)
  const [tilt2, setTilt2] = React.useState({ x: 0, y: 0 });

  const handleMouseMoveTilt2 = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 15;
    const tiltY = (x / (rect.width / 2)) * 15;
    setTilt2({ x: tiltX, y: tiltY });
  };

  const handleMouseLeaveTilt2 = () => {
    setTilt2({ x: 0, y: 0 });
  };

  const renderHeroSection = (isClone = false) => {
    return (
      <section className="relative overflow-hidden min-h-screen flex items-center justify-start py-24 px-6 sm:px-12 lg:px-24 bg-transparent select-none">
        {/* Panel de Contenido Izquierdo con Efecto Cristal Esmerilado Premium y letras oscuras de alto contraste */}
        <div className="relative max-w-2xl w-full backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-12 flex flex-col items-start justify-center space-y-6 text-left border-l-white/30 border-t-white/30 animate-fadeIn">
          
          {/* Logotipo Central de Bienvenida con Efecto 3D Tilt Interactivo */}
          <motion.div
            className="w-20 h-20 sm:w-24 sm:h-24 cursor-pointer select-none pointer-events-auto"
            onMouseMove={handleMouseMoveTilt}
            onMouseLeave={handleMouseLeaveTilt}
            style={{
              rotateX: rotateX,
              rotateY: rotateY,
              transformStyle: "preserve-3d",
            }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(0,127,26,0.22)]">
              <defs>
                <linearGradient id={isClone ? "leafGradMainHeroClone" : "leafGradMainHero"} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E03C" />
                  <stop offset="100%" stopColor="#007F1A" />
                </linearGradient>
              </defs>
              <circle cx="28" cy="22" r="7" fill="#007F1A" />
              <circle cx="56" cy="25" r="5" fill="#007F1A" />
              <circle cx="44" cy="33" r="3.5" fill="#007F1A" />
              <circle cx="23.5" cy="40.5" r="3.5" fill="#007F1A" />
              <path d="M72 32 C70 55, 62 82, 42 82 C22 82, 18 64, 28 48 C38 32, 60 25, 72 32 Z" fill={`url(#${isClone ? "leafGradMainHeroClone" : "leafGradMainHero"})`} />
              <path d="M28 82 C34 72, 43 55, 59 47" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>

          {/* Tag de Especialidad */}
          <div className="inline-flex items-center gap-2 bg-emerald-900/10 border border-emerald-900/20 px-4 py-1.5 rounded-full text-emerald-950 text-[11px] sm:text-xs font-bold uppercase tracking-widest font-tech">
            <Leaf className="w-3.5 h-3.5 text-emerald-800" /> Consultoría Ambiental y Capacitación de Élite
          </div>

          {/* Título de Marca y Subtítulo */}
          <div className="space-y-1">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 leading-none tracking-tighter font-display select-none">
              SERAM
            </h1>
            <p className="text-emerald-800 text-sm sm:text-base font-black uppercase tracking-[0.35em] font-tech select-none">
              Servicios Ambientales
            </p>
          </div>

          {/* Descripción Detallada */}
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-semibold">
            Ingenieros expertos en Ecología y Medio Ambiente. Diseñamos soluciones técnicas,
            promovemos la capacitación acreditada de élite y estructuramos experiencias sostenibles integrales.
          </p>

          {/* Separador Fino y KPIs de Resistencia Técnica */}
          <div className="flex items-center justify-between gap-6 pt-6 border-t border-slate-950/10 w-full">
            <div className="text-center">
              <h4 className="text-slate-950 font-black text-lg sm:text-xl leading-none font-display">3 Socios</h4>
              <p className="text-slate-600 text-[9px] uppercase tracking-wider mt-1 font-mono">Especialidades</p>
            </div>
            <div className="text-center">
              <h4 className="text-emerald-900 font-black text-lg sm:text-xl leading-none font-display">100%</h4>
              <p className="text-slate-600 text-[9px] uppercase tracking-wider mt-1 font-mono">Compromiso</p>
            </div>
            <div className="text-center">
              <h4 className="text-slate-950 font-black text-lg sm:text-xl leading-none font-display">SaaS</h4>
              <p className="text-slate-600 text-[9px] uppercase tracking-wider mt-1 font-mono">Ambiental</p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', touchAction: 'none', position: 'relative' }}>
      <EnvironmentalCanvas isStorytelling={true}>
        <Scroll html style={{ width: '100%', pointerEvents: 'auto' }}>
        <AppContext.Provider value={outsideAppValue}>
          <motion.div 
            variants={pageVariants} 
            initial="initial" 
            animate="animate" 
            exit="exit" 
            className="relative"
          >
            {/* Estilos reactivos locales para anular por completo el scroll nativo de la ventana del navegador */}
            <style>{`
              html, body {
                overflow: hidden !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            `}</style>
            
            {/* ─────────────────────────────────────────────────────────────────────
                BLOQUE 1: INICIO / LOGO (Hero Principal de Paisaje Claro y Esmerilado)
                ───────────────────────────────────────────────────────────────────── */}
            {renderHeroSection(false)}

            {/* ─────────────────────────────────────────────────────────────────────
                BLOQUE 2: SERAM SERVICE (Pilar 01 - Cristal Esmerilado Claro y Paisaje)
                ───────────────────────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-start py-24 px-6 sm:px-12 lg:px-24 bg-transparent select-none">
              {/* Panel de Contenido Izquierdo con Cristal Esmerilado Premium y letras oscuras */}
              <div className="relative max-w-2xl w-full backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-12 flex flex-col items-start justify-center space-y-6 text-left border-l-white/30 border-t-white/30 animate-fadeIn">
                
                {/* Icono de Pilar con Efecto 3D Tilt Interactivo */}
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 cursor-pointer select-none pointer-events-auto bg-emerald-900/10 border border-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-800 shadow-md"
                  onMouseMove={handleMouseMoveTilt2}
                  onMouseLeave={handleMouseLeaveTilt2}
                  style={{
                    rotateX: tilt2.x,
                    rotateY: tilt2.y,
                    transformStyle: "preserve-3d",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                >
                  <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 filter drop-shadow-[0_4px_8px_rgba(0,127,26,0.15)]" />
                </motion.div>

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
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/10 border border-slate-900/20 hover:border-emerald-800 text-slate-900 hover:text-emerald-800 text-xs font-bold uppercase tracking-wider transition-all cursor-none pointer-events-auto"
                    style={{ cursor: 'none' }}
                  >
                    Explorar Servicios <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────────────
                BLOQUE 3: SERAM ACADEMY (Pilar 02)
                ───────────────────────────────────────────────────────────────────── */}
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

            {/* ─────────────────────────────────────────────────────────────────────
                BLOQUE 4: SERAM EXPERIENCE (Pilar 03)
                ───────────────────────────────────────────────────────────────────── */}
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

            {/* ─────────────────────────────────────────────────────────────────────
                BLOQUE 5: ECO-TIENDA SERAM (Pilar 04)
                ───────────────────────────────────────────────────────────────────── */}
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

            {/* ─────────────────────────────────────────────────────────────────────
                BLOQUE 6: INICIO / CLON PARA BUCLE CONTINUO
                ───────────────────────────────────────────────────────────────────── */}
            {renderHeroSection(true)}

          </motion.div>
        </AppContext.Provider>
      </Scroll>
    </EnvironmentalCanvas>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, Briefcase, Award, Leaf, ChevronRight,
  ShoppingCart, Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import EnvironmentalCanvas from '../../components/ui/EnvironmentalCanvas';
import { Scroll } from '@react-three/drei';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export default function HomePage() {
  const {
    handleAddToCart, handleAccessItem,
    hasPremiumAccess, products,
  } = useApp();

  return (
    // ── 1. CANVASES Y CONTENEDOR PRINCIPAL VIRTUALIZADO ──────────────────────
    // isStorytelling habilita el ScrollControls y el loop infinito de Drei
    <EnvironmentalCanvas isStorytelling={true}>
      
      {/* ── 2. CAPA HTML VIRTUALIZADA DE CONTENIDO (Scroll html de Drei) ────────── */}
      {/* El contenido HTML se desplaza suavemente sincronizado con el WebGL por detrás */}
      <Scroll html style={{ width: '100%', pointerEvents: 'auto' }}>
        <motion.div 
          variants={pageVariants} 
          initial="initial" 
          animate="animate" 
          exit="exit" 
          className="relative"
        >
          {/* ─────────────────────────────────────────────────────────────────
              PANELE 1: INICIO / LOGO (Hero Principal)
              ───────────────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-transparent select-none">
            <div className="absolute inset-0 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1600"
                alt="Bosque natural"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#010409]/60 via-[#010409]/40 to-[#00e03c]/10" />
            
            <div className="relative max-w-4xl mx-auto text-center w-full py-12 flex flex-col items-center justify-center space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#00e03c]/10 border border-[#00e03c]/20 px-4 py-2 rounded-full text-[#00e03c] text-xs font-bold uppercase tracking-widest font-tech">
                <Leaf className="w-3.5 h-3.5" /> Consultoría Ambiental y Capacitación de Élite
              </div>

              <div className="space-y-3">
                <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black text-white leading-none tracking-tighter font-display cinematic-hover-text">
                  SERAM
                </h1>
                <p className="text-[#00e03c] text-lg sm:text-xl font-black uppercase tracking-[0.35em] font-tech">
                  Servicios Ambientales
                </p>
              </div>

              <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
                Ingenieros expertos en Ecología y Medio Ambiente. Diseñamos soluciones técnicas,
                promovemos la capacitación acreditada de élite y estructuramos experiencias sostenibles integrales.
              </p>

              <div className="flex items-center justify-center gap-10 sm:gap-16 pt-6 border-t border-white/10 w-full max-w-lg">
                <div className="text-center">
                  <h4 className="text-white font-black text-xl sm:text-2xl leading-none font-display">3 Socios</h4>
                  <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-1 font-mono">Especialidades</p>
                </div>
                <div className="text-center">
                  <h4 className="text-[#00e03c] font-black text-xl sm:text-2xl leading-none font-display">100%</h4>
                  <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-1 font-mono">Compromiso</p>
                </div>
                <div className="text-center">
                  <h4 className="text-white font-black text-xl sm:text-2xl leading-none font-display">SaaS</h4>
                  <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-1 font-mono">Ambiental</p>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────────
              PANELE 2: SERAM SERVICE (Pilar 01)
              ───────────────────────────────────────────────────────────────── */}
          <section className="relative min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="glass-panel-dark max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 border border-white/[0.08] hover:border-[#00e03c]/20 transition-all flex flex-col items-center text-center space-y-6 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
              <div className="p-4 bg-slate-900/80 rounded-2xl text-[#00e03c] border border-white/10">
                <Briefcase className="w-8 h-8" />
              </div>
              <span className="text-xs font-black tracking-widest text-[#00e03c] uppercase font-tech">Pilar 01 // Consultoría</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight uppercase">
                SERAM_SERVICES
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                Ofrecemos análisis territorial avanzado mediante Sistemas de Información Geográfica (SIG), 
                auditorías ambientales completas, diseño de planes de mitigación ambiental y estudios de impacto 
                regulados para asegurar el cumplimiento normativo industrial.
              </p>
              <div className="pt-4">
                <Link 
                  to="/services" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-white hover:text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all"
                  style={{ cursor: 'none' }}
                >
                  Explorar Servicios <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────────
              PANELE 3: SERAM ACADEMY (Pilar 02)
              ───────────────────────────────────────────────────────────────── */}
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
                <Link 
                  to="/academy" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-white hover:text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all"
                  style={{ cursor: 'none' }}
                >
                  Ingresar a Academy <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────────
              PANELE 4: SERAM EXPERIENCE (Pilar 03)
              ───────────────────────────────────────────────────────────────── */}
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
                <Link 
                  to="/experience" 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-white hover:text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all"
                  style={{ cursor: 'none' }}
                >
                  Conocer Experiencias <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────────
              PANELE 5: ECO-TIENDA SERAM (Pilar 04)
              ───────────────────────────────────────────────────────────────── */}
          <section className="relative min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
                <div>
                  <span className="text-xs font-black tracking-widest text-[#00e03c] uppercase font-tech">Pilar 04 // Consumo</span>
                  <h2 className="text-4xl font-black text-white font-display uppercase tracking-tight">Eco-Tienda SERAM</h2>
                  <p className="text-xs text-slate-500 mt-1">Apoya la educación y conservación adquiriendo artículos ecológicos oficiales.</p>
                </div>
                <Link to="/shop" className="mt-4 md:mt-0 glass-panel-dark px-5 py-2.5 rounded-xl font-bold text-xs uppercase hover:border-white/20 transition-colors tracking-wider text-slate-300" style={{ cursor: 'none' }}>
                  Ver Tienda Completa
                </Link>
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
        </motion.div>
      </Scroll>
    </EnvironmentalCanvas>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, Briefcase, Award, Leaf, Globe, ChevronRight,
  ShoppingCart, Lock, CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import MovieCredits from '../../components/ui/MovieCredits';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export default function HomePage() {
  const {
    isRegistered, registerEmail, setRegisterEmail,
    handleRegister, handleAddToCart, handleAccessItem,
    hasPremiumAccess, products,
  } = useApp();

  const pillars = [
    {
      to: '/academy',
      icon: <BookOpen className="w-10 h-10 mb-4 text-emerald-100" />,
      tag: 'E-Learning',
      name: 'SERAM_ACADEMY',
      desc: 'Nuestra ala formativa especializada. Diseñamos e impartimos cursos, posgrados y diplomados para profesionales, estudiantes y docentes en materias de evaluación de impacto, cartografía, legislación y educación ecosistémica de vanguardia.',
      label: 'Ingresar a Academy',
      headerCls: 'bg-gradient-to-r from-emerald-600 to-[#009E28]',
    },
    {
      to: '/services',
      icon: <Briefcase className="w-10 h-10 mb-4 text-[#009E28]" />,
      tag: 'Consultoría',
      name: 'SERAM_SERVICES',
      desc: 'Servicios avanzados de consultoría corporativa. Análisis territorial mediante SIG, auditorías ambientales completas, diseño de planes de mitigación y estudios de impacto regulados para la industria.',
      label: 'Explorar Servicios',
      headerCls: 'bg-gradient-to-r from-slate-900 to-slate-800',
    },
    {
      to: '/experience',
      icon: <Award className="w-10 h-10 mb-4 text-emerald-300" />,
      tag: 'Sostenibilidad',
      name: 'SERAM_EXPERIENCE',
      desc: 'Experiencias inmersivas que conectan el talento humano con el valor ambiental real. Voluntariados, huertos urbanos corporativos, talleres vivenciales y campamentos científicos orientados al ecoturismo.',
      label: 'Conocer Experiencias',
      headerCls: 'bg-gradient-to-r from-emerald-800 to-emerald-950',
    },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="relative">
      {/* ── PROXY DE SCROLL WEBGL (300vh para narrativa 3D) ────────────────── */}
      <div
        className="scroll-proxy pointer-events-none absolute left-0 right-0 top-0 w-full"
        style={{ height: '300vh', zIndex: -1 }}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-8 bg-transparent">
        {/* Background image */}
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1600"
            alt="Bosque natural"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#010409]/60 via-[#010409]/40 to-[#00e03c]/10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#010409]/60 to-transparent" />

        <div className="relative max-w-4xl mx-auto text-center w-full py-12 flex flex-col items-center justify-center space-y-8">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#00e03c]/10 border border-[#00e03c]/20 px-4 py-2 rounded-full text-[#00e03c] text-xs font-bold uppercase tracking-widest"
          >
            <Leaf className="w-3.5 h-3.5" /> Consultoría Ambiental y Capacitación de Élite
          </motion.div>

          {/* Titles */}
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter"
            >
              SERAM
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-[#00e03c] text-lg sm:text-xl font-black uppercase tracking-[0.35em]"
            >
              Servicios Ambientales
            </motion.p>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed font-medium"
          >
            Somos un equipo consolidado de ingenieros expertos en Ecología y Medio Ambiente.
            Diseñamos soluciones técnicas, promovemos la educación ambiental con rigor académico
            y estructuramos experiencias sostenibles integrales para el sector corporativo y público.
          </motion.p>

          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-10 sm:gap-16 pt-6 border-t border-white/10 w-full max-w-xl"
          >
            <div className="text-center">
              <h4 className="text-white font-black text-xl sm:text-2xl leading-none">3 Socios</h4>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Especialidades</p>
            </div>
            <div className="text-center">
              <h4 className="text-[#00e03c] font-black text-xl sm:text-2xl leading-none">100%</h4>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Compromiso</p>
            </div>
            <div className="text-center">
              <h4 className="text-white font-black text-xl sm:text-2xl leading-none">SaaS</h4>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Educativo</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-[#00e03c] uppercase">Fundamentos Corporativos</span>
            <h2 className="text-3xl font-black text-white mt-2">Misión & Visión de SERAM</h2>
            <div className="w-16 h-1 bg-[#00e03c] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Leaf className="w-8 h-8" />, title: 'Nuestra Misión',
                text: 'Ofrecer servicios de ingeniería en ecología y medio ambiente con el más alto estándar de rigor técnico, fusionando la innovación digital con metodologías aplicadas para resolver las complejas demandas ambientales del presente.',
                bg: 'bg-[#00e03c]/10',
              },
              {
                icon: <Globe className="w-8 h-8" />, title: 'Nuestra Visión',
                text: 'Consolidarse para el año 2030 como la plataforma líder en el Cono Sur para la gestión ambiental inteligente, e-learning acreditado y el diseño de experiencias organizacionales regenerativas con enfoque en los ODS.',
                bg: 'bg-slate-900/80',
              },
            ].map((card) => (
              <div key={card.title} className="glass-panel-dark p-8 sm:p-10 rounded-2xl flex gap-6 items-start hover:border-[#00e03c]/20 transition-colors">
                <div className={`${card.bg} p-4 rounded-2xl text-[#00e03c] shrink-0`}>{card.icon}</div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-4">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-[#00e03c] uppercase">Nuestra Estructura</span>
            <h2 className="text-3xl font-black text-white mt-2">Los Tres Pilares Estratégicos</h2>
            <p className="text-sm text-slate-500 mt-2">Cada pilar representa un vector clave de desarrollo e impacto ecológico.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <div key={p.name} className="glass-panel-dark rounded-2xl overflow-hidden flex flex-col h-full hover:border-white/15 transition-all duration-300 hover:-translate-y-1 group">
                <div className={`${p.headerCls} p-6 text-white relative`}>
                  <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded">{p.tag}</div>
                  {p.icon}
                  <h3 className="text-lg font-black tracking-wider uppercase">{p.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                  <div className="border-t border-white/[0.06] pt-4">
                    <Link to={p.to} className="inline-flex items-center gap-2 text-xs font-bold text-[#00e03c] uppercase tracking-wider hover:text-emerald-300 transition-colors">
                      {p.label} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SHOP */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#00e03c] uppercase">Consumo Consciente</span>
              <h2 className="text-3xl font-black text-white mt-2">Nuestra Eco-Tienda SERAM</h2>
              <p className="text-sm text-slate-500 mt-1">Apoya el activismo y la difusión adquiriendo artículos con causa ecológica.</p>
            </div>
            <Link to="/shop" className="mt-4 md:mt-0 glass-panel-dark px-5 py-2.5 rounded-xl font-bold text-xs uppercase hover:border-white/20 transition-colors tracking-wider text-slate-300">
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
                      data-cursor-text="COMPRAR"
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

      {/* ── FOOTER CINEMATOGRÁFICO DE CRÉDITOS (Animado por ScrollTrigger) ── */}
      <MovieCredits />

    </motion.div>
  );
}

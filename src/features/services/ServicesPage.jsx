import React from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Globe, FileText, Leaf, BookOpen,
  Map, Compass, Trash2, Activity, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const getIcon = (name) => {
  const icons = {
    Briefcase: <Briefcase className="w-5 h-5" />,
    Globe: <Globe className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    Leaf: <Leaf className="w-5 h-5" />,
    BookOpen: <BookOpen className="w-5 h-5" />,
    Map: <Map className="w-5 h-5" />,
    Compass: <Compass className="w-5 h-5" />,
    Trash2: <Trash2 className="w-5 h-5" />,
    Activity: <Activity className="w-5 h-5" />,
  };
  return icons[name] || <Briefcase className="w-5 h-5" />;
};

const getServiceColors = (line) => {
  if (line === 'Trámites Ambientales Express') {
    return {
      color: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'hover:border-emerald-500/30',
    };
  } else if (line === 'Ingeniería y Seguridad Industrial') {
    return {
      color: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'hover:border-blue-500/30',
    };
  } else {
    // Servicios GIS Ambientales y Sostenibilidad
    return {
      color: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'hover:border-purple-500/30',
    };
  }
};

function ServiceCard({ service }) {
  const navigate = useNavigate();
  const colors = getServiceColors(service.line);

  return (
    <motion.div
      variants={cardVariants}
      onClick={() => navigate('/quote')}
      className={`group neuform-card p-6 flex flex-col gap-5 cursor-none pointer-events-auto overflow-hidden ${colors.borderColor}`}
      data-cursor-text="COTIZAR"
    >
      {/* Gradient fill (decorative) */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.25rem]`} />

      {/* Icon + Tag */}
      <div className="relative flex items-center justify-between z-10">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/70 group-hover:text-[#00e03c] group-hover:border-[#00e03c]/25 transition-all duration-300">
          {getIcon(service.icon)}
        </div>
        <span className="neuform-badge text-white/30 group-hover:text-white/50">
          {service.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-2 flex-1">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00e03c]/70">{service.line}</span>
          <h3 className="font-bold text-[0.9rem] text-white/85 group-hover:text-white transition-colors duration-200 leading-snug">
            {service.title}
          </h3>
        </div>
        <p className="text-xs text-white/35 leading-relaxed group-hover:text-white/50 transition-colors duration-300">
          {service.desc || service.description}
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-white/25 group-hover:text-[#00e03c] transition-colors duration-200 uppercase tracking-wider">
        Cotizar ahora <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { publicServices } = useApp();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="inner-page min-h-screen"
    >
      {/* ── Atmospheric gradient blobs ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vh] rounded-full bg-blue-700/20 blur-[120px] animate-blob" />
        <div className="absolute top-[-5%] right-[-10%] w-[40vw] h-[45vh] rounded-full bg-indigo-700/15 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[30vw] h-[30vh] rounded-full bg-emerald-500/5 blur-[80px] animate-blob" style={{ animationDelay: '8s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* ── PAGE HERO ── */}
        <div className="pt-8 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-5 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="neuform-badge-accent neuform-badge">
                  <Briefcase className="w-3 h-3" />
                  SERAM SERVICES · Catálogo Activo
                </span>
                <button
                  onClick={() => navigate('/')}
                  className="neuform-badge text-white/30 hover:text-white/60 transition-colors duration-200"
                >
                  ← Inicio
                </button>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-[0.95] tracking-tighter">
                Servicios y<br />
                <span className="text-white/40">Soluciones</span>
              </h1>
              <p className="text-sm text-white/40 leading-relaxed max-w-xl">
                Soluciones técnicas de alta precisión para empresas, municipios y proyectos que requieren rigor científico, cumplimiento normativo y sostenibilidad industrial en Bolivia.
              </p>
            </div>

            <button
              onClick={() => navigate('/quote')}
              className="neuform-btn-primary shrink-0 pointer-events-auto cursor-none"
              data-cursor-text="COTIZAR"
            >
              Iniciar Diagnóstico Gratis <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-12 neuform-divider" />
          <div className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
            {[
              { num: '3', label: 'Líneas de servicio' },
              { num: '+50', label: 'Proyectos ejecutados' },
              { num: '3', label: 'Socios peritos habilitados' },
              { num: 'ISO', label: 'Normativa internacional' },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <span className="text-2xl font-black text-white/90">{stat.num}</span>
                <span className="section-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION HEADER ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label-accent mb-1">Catálogo Completo</p>
            <h2 className="text-xl font-black text-white/80">
              {publicServices.length} servicios activos
            </h2>
          </div>
          <span className="section-label">Consultoría técnica a medida</span>
        </div>

        {/* ── SERVICES GRID ── */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {publicServices.map((service) => (
            <ServiceCard key={service.id || service.title} service={service} />
          ))}
        </motion.div>

        {/* ── CTA FOOTER PANEL ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.7 } }}
          className="mt-12 neuform-card p-8 sm:p-12 overflow-hidden"
        >
          {/* Background gradient decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 rounded-[1.25rem]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-left">
              <p className="section-label-accent">¿Listo para optimizar tu cumplimiento regulatorio?</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Maximiza tu viabilidad técnica y legal
              </h3>
              <p className="text-sm text-white/35 leading-relaxed">
                Nuestros ingenieros peritos analizan tu caso frente a la Ley 1333 para asegurar el éxito operativo. Diagnóstico técnico y propuesta presupuestaria sin compromiso.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => navigate('/quote')}
                className="neuform-btn-primary pointer-events-auto cursor-none"
                data-cursor-text="COTIZAR"
              >
                Iniciar Diagnóstico <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="neuform-btn-accent pointer-events-auto"
              >
                Ver Home
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

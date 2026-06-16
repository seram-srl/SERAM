import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Globe, FileText, Leaf, BookOpen,
  Map, Compass, Trash2, Activity, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const SERVICES = [
  {
    icon: <Activity className="w-6 h-6" />,
    title: 'Monitoreo Ambiental',
    desc: 'Diseño e implementación de redes de monitoreo continuo de calidad del aire, agua y suelo. Análisis de parámetros fisicoquímicos y biológicos conforme a normativas nacionales e internacionales.',
    tag: 'Monitoreo',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Informes Ambientales',
    desc: 'Elaboración de Estudios de Impacto Ambiental (EsIA), informes técnicos de auditoría, fichas ambientales y términos de referencia para proyectos sujetos a licencia ambiental.',
    tag: 'Consultoría',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Educación Ambiental',
    desc: 'Programas de sensibilización y formación en cultura ecológica para comunidades, instituciones educativas y personal corporativo. Talleres, campañas y materiales didácticos personalizados.',
    tag: 'Formación',
  },
  {
    icon: <Trash2 className="w-6 h-6" />,
    title: 'Gestión de Residuos Sólidos',
    desc: 'Diagnóstico, planificación e implementación de planes integrales de manejo de residuos sólidos municipales e industriales. Estrategias de reducción, reutilización y reciclaje (3R).',
    tag: 'Gestión',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Lombricultura',
    desc: 'Asesoría técnica en sistemas de compostaje con lombrices (lombricompostaje) para transformar residuos orgánicos en fertilizante natural de alta calidad. Solución sostenible para empresas y comunidades.',
    tag: 'Bioeconomía',
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: 'Mapas Ambientales',
    desc: 'Elaboración de cartografía ambiental temática mediante herramientas de teledetección e imágenes satelitales: mapas de cobertura vegetal, uso de suelo, riesgos naturales y áreas de conservación.',
    tag: 'Cartografía',
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: 'Rutas Ecoturísticas',
    desc: 'Diseño técnico de circuitos y rutas de ecoturismo sostenible que integran atractivos naturales, culturales y comunitarios. Planificación de señalización, capacidad de carga y materiales interpretativos.',
    tag: 'Ecoturismo',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Sistemas de Información Geográfica (SIG)',
    desc: 'Desarrollo de proyectos SIG para análisis espacial avanzado: ordenamiento territorial, gestión de cuencas hidrográficas, zonificación ecológica y modelado de escenarios ambientales.',
    tag: 'SIG',
  },
];

/**
 * @component ServiceCard
 * @description Tarjeta elegante para cada servicio del catálogo.
 */
function ServiceCard({ service, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate('/quote')}
      className="group glass-panel-dark rounded-2xl p-6 border border-white/[0.06] hover:border-[#00e03c]/25 transition-colors duration-300 flex flex-col gap-4 cursor-none pointer-events-auto"
      data-cursor-text="COTIZAR"
    >
      {/* Icon + Tag */}
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-[#00e03c]/[0.08] text-[#00e03c] flex items-center justify-center border border-[#00e03c]/20 group-hover:bg-[#00e03c]/15 transition-colors duration-300">
          {service.icon}
        </div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
          {service.tag}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2 flex-1">
        <h3 className="font-bold text-base text-white group-hover:text-[#00e03c] transition-colors duration-300 leading-snug">
          {service.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {service.desc}
        </p>
      </div>

      {/* CTA subtle */}
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 group-hover:text-[#00e03c] transition-colors duration-300 uppercase tracking-wider mt-auto">
        Iniciar cotización rápida <ChevronRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* ── Hero Banner ── */}
      <div className="glass-panel-dark rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-white/[0.06]">
        {/* Decorative watermark */}
        <div className="absolute right-0 bottom-0 opacity-[0.04] pointer-events-none">
          <Briefcase className="w-72 h-72 -mb-16 -mr-8" />
        </div>

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#00e03c]/10 border border-[#00e03c]/25 text-[#00e03c] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3 h-3" />
            SERAM SERVICES · Pilar 01
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Consultoría Ambiental Especializada
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Ofrecemos servicios técnicos de alta precisión para empresas, municipios y proyectos 
            que requieren rigor científico, cumplimiento normativo y responsabilidad ambiental. 
            Cada servicio es diseñado a medida según la realidad territorial y las necesidades del cliente.
          </p>
        </div>

        <div className="shrink-0 z-10">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel-dark border border-white/[0.08] hover:border-[#00e03c]/30 text-slate-300 hover:text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all duration-300"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>

      {/* ── Section Title ── */}
      <div className="mb-8">
        <h2 className="text-lg font-extrabold text-white tracking-tight">
          Catálogo de Servicios
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          8 áreas de especialización ambiental · Consultoría técnica a medida
        </p>
      </div>

      {/* ── Services Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {SERVICES.map((service, i) => (
          <ServiceCard key={service.title} service={service} index={i} />
        ))}
      </motion.div>

      {/* ── Contact CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.6 } }}
        className="mt-16 glass-panel-dark rounded-2xl p-8 border border-white/[0.06] text-center space-y-4"
      >
        <p className="text-xs font-black text-[#00e03c] uppercase tracking-widest">
          ¿Listo para optimizar tu cumplimiento regulatorio?
        </p>
        <h3 className="text-2xl font-black text-white">
          Maximiza tu viabilidad técnica y legal reduciendo riesgos ambientales
        </h3>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Nuestros ingenieros peritos analizan tu caso frente a la Ley 1333 para asegurar el éxito operativo. Completa nuestro asistente interactivo de cotización para recibir un diagnóstico técnico y propuesta presupuestaria gratis sin compromisos.
        </p>
        <button
          onClick={() => navigate('/quote')}
          className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-xl bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/40 text-[#00e03c] text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-none pointer-events-auto"
          data-cursor-text="COTIZAR"
        >
          Iniciar Diagnóstico y Cotización Digital <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

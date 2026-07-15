import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

const experiences = [
  {
    img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600',
    title: 'Reforestación Colectiva',
    desc: <>Campañas corporativas para compensación de <span className="italic">huella ambiental</span>. Incluye <span className="italic">medición de carbono</span> pos-siembra y certificado oficial.</>,
    cta: 'Postular Empresa',
    toast: 'Consulta sobre Voluntariado enviada',
  },
  {
    img: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=600',
    title: 'Biocampamento de Campo',
    desc: <>Inmersión para estudiantes y profesionales en <span className="italic">ecosistemas vulnerables</span> con guía técnica de nuestros 3 socios ingenieros.</>,
    cta: 'Ver Calendario',
    toast: 'Registro de Campamento abierto en Agosto',
  },
  {
    img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=600',
    title: 'Huertos Corporativos',
    desc: <>Habilitación de espacios ociosos en oficinas para convertirlos en <span className="italic">micro-reservas</span> y huertos funcionales para colaboradores.</>,
    cta: 'Solicitar Factibilidad',
    toast: 'Estudio de factibilidad para huerto agendado',
  },
];

export default function ExperiencePage() {
  const { triggerToast } = useApp();

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="inner-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
    >
      {/* Hero Banner */}
      <div className="neuform-card p-8 sm:p-12 overflow-hidden relative text-left">
        {/* Background gradient decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 rounded-[1.25rem] pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <span className="neuform-badge-accent neuform-badge">
            <Award className="w-3 h-3" />
            SERAM EXPERIENCE · Pilar 03
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-[0.95] tracking-tighter">
            Experiencias y<br />
            <span className="text-white/40">Conservación Activa</span>
          </h1>
          <p className="text-sm text-white/40 leading-relaxed max-w-xl">
            Creamos dinámicas corporativas y estudiantiles fuera del aula. Reclutamiento de voluntarios para <span className="italic text-white">reforestación</span>, campamentos científicos de <span className="italic text-white">biodiversidad</span> y diseño de huertos regenerativos.
          </p>
        </div>
      </div>

      {/* Grid of experiences */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiences.map((exp) => (
          <div key={exp.title} className="group relative overflow-hidden neuform-card flex flex-col justify-between h-full text-left">
            <div>
              <div className="overflow-hidden aspect-video bg-slate-900">
                <img src={exp.img} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-extrabold text-white text-lg group-hover:text-[#00e03c] transition-colors duration-300">
                  {exp.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">{exp.desc}</p>
              </div>
            </div>
            <div className="p-6 border-t border-white/[0.06] mt-auto">
              <button
                onClick={() => triggerToast(exp.toast)}
                className="neuform-btn-accent cursor-none w-full justify-center !rounded-xl"
                data-cursor-text={exp.cta.toUpperCase()}
              >
                {exp.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

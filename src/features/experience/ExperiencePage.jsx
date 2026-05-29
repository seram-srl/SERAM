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
    desc: 'Campañas corporativas para compensación de huella ambiental. Incluye medición de carbono pos-siembra y certificado oficial.',
    cta: 'Postular Empresa',
    toast: 'Consulta sobre Voluntariado enviada',
  },
  {
    img: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=600',
    title: 'Biocampamento de Campo',
    desc: 'Inmersión para estudiantes y profesionales en ecosistemas vulnerables con guía técnica de nuestros 3 socios ingenieros.',
    cta: 'Ver Calendario',
    toast: 'Registro de Campamento abierto en Agosto',
  },
  {
    img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=600',
    title: 'Huertos Corporativos',
    desc: 'Habilitación de espacios ociosos en oficinas para convertirlos en micro-reservas y huertos funcionales para colaboradores.',
    cta: 'Solicitar Factibilidad',
    toast: 'Estudio de factibilidad para huerto agendado',
  },
];

export default function ExperiencePage() {
  const { triggerToast } = useApp();

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Hero Banner */}
      <div className="glass-panel-dark border border-emerald-500/20 rounded-2xl p-8 mb-12 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-800/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            <Award className="w-3 h-3" /> SERAM EXPERIENCE
          </div>
          <h1 className="text-3xl font-black text-white">Experiencias y Voluntariados de Conservación</h1>
          <p className="text-sm text-emerald-300/70 max-w-2xl">
            Creamos dinámicas corporativas y estudiantiles fuera del aula. Reclutamiento de voluntarios para reforestación,
            campamentos científicos de biodiversidad y diseño de huertos regenerativos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiences.map((exp) => (
          <div key={exp.title} className="glass-panel-dark rounded-xl overflow-hidden flex flex-col justify-between border border-white/[0.06] hover:border-white/12 transition-all group">
            <div>
              <div className="overflow-hidden aspect-video">
                <img src={exp.img} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-extrabold text-white text-lg">{exp.title}</h3>
                <p className="text-xs text-slate-400">{exp.desc}</p>
              </div>
            </div>
            <div className="p-6 border-t border-white/[0.06]">
              <button
                onClick={() => triggerToast(exp.toast)}
                className="w-full glass-border text-slate-200 py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-[#00e03c]/10 hover:border-[#00e03c]/30 hover:text-[#00e03c] transition-all"
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

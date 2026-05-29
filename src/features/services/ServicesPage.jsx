import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Globe, FileText, Leaf, Award, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

const services = [
  { icon: <Globe className="w-5 h-5" />, title: 'Análisis SIG & Teledetección', desc: 'Cartografía de alta precisión utilizando imágenes satelitales multiespectrales para ordenamiento territorial y conservación ecológica.' },
  { icon: <FileText className="w-5 h-5" />, title: 'Estudios de Impacto (EsIA)', desc: 'Elaboramos informes, términos de referencia y auditorías detalladas para proyectos que requieran el aval del Ministerio Ambiental.' },
  { icon: <Leaf className="w-5 h-5" />, title: 'Eco-Huella Corporativa', desc: 'Cálculo preciso de la Huella de Carbono e Hídrica con planes ejecutables para neutralizar emisiones corporativas.' },
  { icon: <Award className="w-5 h-5" />, title: 'Certificaciones ODS', desc: 'Asesoría estratégica para guiar a corporaciones en el cumplimiento alineado con los Objetivos de Desarrollo Sostenible.' },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const { activeServices, activeRole } = useApp();

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Hero Banner */}
      <div className="glass-panel-dark rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-white/[0.06]">
        <div className="absolute right-0 bottom-0 opacity-5">
          <Briefcase className="w-64 h-64 -mb-12" />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00e03c] text-slate-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3 h-3" /> SERAM SERVICE
          </div>
          <h1 className="text-3xl font-black text-white">Servicios de Consultoría Ambiental Avanzada</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Ofrecemos soluciones ecológicas con rigurosidad ingenieril. Nuestro equipo brinda estudios georreferenciados para empresas que buscan el cumplimiento legal y la excelencia regenerativa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-extrabold text-lg text-white border-b border-white/[0.06] pb-3">Nuestra Cartera de Servicios Técnicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((s) => (
              <div key={s.title} className="glass-panel-dark rounded-xl p-6 space-y-3 border border-white/[0.06] hover:border-[#00e03c]/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#00e03c]/10 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/20">{s.icon}</div>
                <h3 className="font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Project Tracker Widget */}
        <div className="space-y-6">
          <div className="glass-panel-dark rounded-xl border border-white/[0.06] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00e03c]" />
                <h3 className="font-bold text-sm text-white">Estado de Proyectos Activos</h3>
              </div>
              <span className="bg-white/10 text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-400">SaaS Monitor</span>
            </div>

            <div className="space-y-4">
              {activeServices.map(proj => (
                <div key={proj.id} className="space-y-1.5 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-white">{proj.client}</span>
                    <span className="text-[10px] text-slate-500">Resp: {proj.lead.split(' ')[0]}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{proj.type}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00e03c] h-full transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">{proj.progress}%</span>
                  </div>
                </div>
              ))}
            </div>

            {activeRole === 'AdminMod' && (
              <div className="pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-[#00e03c]/10 border border-[#00e03c]/30 text-[#00e03c] py-2 rounded-lg font-bold text-xs uppercase hover:bg-[#00e03c]/20 transition-colors flex items-center justify-center gap-1"
                >
                  Gestionar en Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

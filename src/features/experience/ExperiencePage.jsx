import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Play, X, Volume2, VolumeX, Sparkles, MapPin, Trees, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

const experiences = [
  {
    id: 'reforestacion',
    title: 'Reforestación Corporativa y Compensación de Huella',
    tag: 'Empresas & Reportes ESG · ISO 14064',
    location: 'Valle de Zongo & Cordillera Real (La Paz)',
    impact: 'Compensación de Carbono Auditada',
    poster: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200',
    video: '/assets/videos/cambio_climatico_bolivia.mp4',
    hasVideo: true,
    badge: 'HIGGSFIELD AI · 4K DRONE VIEW',
    desc: '¿Tu empresa necesita cumplir metas ESG sin caer en greenwashing? Ejecutamos jornadas corporativas con siembra georreferenciada, tasa de prendimiento >90% y certificado técnico de compensación de CO₂ con validez legal.',
    fullDesc: 'Supera las actividades superficiales de RSE. Nuestro equipo de ingenieros planifica la restauración con especies nativas adaptadas, monitoreo multitemporal satelital con SIG y cálculo riguroso de captura de biomasa bajo la norma ISO 14064. Entregamos carpeta técnica y material audiovisual de alta calidad para tus memorias corporativas.',
    cta: 'Cotizar Reforestación Corporativa',
    toast: 'Solicitud de propuesta de reforestación corporativa enviada',
  },
  {
    id: 'biocampamento',
    title: 'Biocampamentos de Inmersión y Monitoreo en Campo',
    tag: 'Profesionales & Universitarios · Práctica Real',
    location: 'Parque Nacional Cotapata & Yungas',
    impact: 'Mentoría Directa de 3 Ingenieros Socios',
    poster: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=1200',
    video: '/assets/3d-backend/bg_home.mp4',
    hasVideo: true,
    badge: 'HIGGSFIELD AI · FIELD MOTION',
    desc: '¿Cansado de la teoría que no sirve en el mercado laboral? Aprende a muestrear agua in-situ, usar multiparámetros certificados, evaluar bioindicadores y resolver problemas ambientales reales en ecosistemas de alta montaña.',
    fullDesc: 'Una experiencia intensiva diseñada para cerrar la brecha entre el aula y la consultoría ambiental de élite. Trabajarás codo a codo con los socios fundadores de SERAM en estaciones de monitoreo reales, aprendiendo criterios de fiscalización, muestreo normado según la Ley 1333 y procesamiento cartográfico en campamento.',
    cta: 'Asegurar Cupo en Biocampamento',
    toast: 'Pre-registro para el Biocampamento de Campo confirmado',
  },
  {
    id: 'huertos',
    title: 'Huertos Corporativos y Micro-reservas Urbanas',
    tag: 'Infraestructura Sostenible & Bienestar Laboral',
    location: 'La Paz, Cochabamba y Santa Cruz',
    impact: 'Regeneración Urbana y Clima Laboral',
    poster: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1200',
    video: '/assets/videos/seram_academy_funcionamiento.mp4',
    hasVideo: true,
    badge: 'HIGGSFIELD AI · TIMELAPSE',
    desc: '¿Espacios ociosos en tu oficina que solo generan costos y estrés? Convertimos azoteas y terrazas en módulos bio-regenerativos productivos que potencian el bienestar de tus colaboradores y tus certificaciones de sostenibilidad.',
    fullDesc: 'Diseñamos e instalamos sistemas modulares de cultivo hidropónico y orgánico con aprovechamiento de agua pluvial y compostaje cerrado. Incluye talleres mensuales de integración para tu equipo, transformando el espacio laboral en un activo tangible de sostenibilidad corporativa.',
    cta: 'Solicitar Estudio de Factibilidad',
    toast: 'Estudio de factibilidad para huerto agendado con éxito',
  },
];

export default function ExperiencePage() {
  const { triggerToast } = useApp();
  const [activeVideoExp, setActiveVideoExp] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const modalVideoRef = useRef(null);

  const openVideoModal = (exp) => {
    setActiveVideoExp(exp);
    setIsMuted(false);
  };

  const closeVideoModal = () => {
    setActiveVideoExp(null);
  };

  const toggleModalMute = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = !modalVideoRef.current.muted;
      setIsMuted(modalVideoRef.current.muted);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="inner-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-24 text-left"
    >
      {/* Hero Banner enfocado en Dolor -> Solución */}
      <div className="neuform-card p-8 sm:p-14 overflow-hidden relative text-left border border-white/10 shadow-2xl">
        {/* Background gradient decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00e03c]/10 via-transparent to-[#029907]/10 rounded-[1.25rem] pointer-events-none" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#00e03c]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="neuform-badge-accent neuform-badge !py-1 !px-3 font-tech text-xs tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#00e03c]" />
              SERAM EXPERIENCE · Pilar 03
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-tech font-bold text-emerald-300 uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-[#00e03c]" />
              Compensación Auditada & Práctica Real
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[0.95] tracking-tighter uppercase font-display">
            Acción Climática Medible.<br />
            <span className="text-[#00e03c]">Cero Greenwashing.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-light">
            Las actividades de RSE superficiales ya no convencen ni resisten una auditoría ambiental. En <strong className="text-white font-medium">SERAM EXPERIENCE</strong> diseñamos programas de <strong className="text-emerald-400 font-medium">reforestación corporativa con cálculo de carbono ISO 14064</strong>, <strong className="text-white font-medium">biocampamentos de inmersión técnica en campo</strong> y <strong className="text-white font-medium">huertos regenerativos</strong> con respaldo de ingenieros ambientales senior.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5">
              <Trees className="w-4 h-4 text-[#00e03c]" />
              <span>+1,500 árboles georreferenciados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00e03c]" />
              <span>Certificación oficial para reportes ESG y Ley 1333</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of experiences with video support */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="group relative overflow-hidden neuform-card flex flex-col justify-between h-full text-left border border-white/10 hover:border-[#00e03c]/40 transition-all duration-500 shadow-xl hover:shadow-[0_0_30px_rgba(0,224,60,0.15)] rounded-3xl"
          >
            <div>
              {/* Media Container (Video autoplay preview or Poster) */}
              <div className="relative overflow-hidden aspect-video bg-slate-950 rounded-2xl m-3 border border-white/10 group-hover:border-[#00e03c]/30 transition-colors">
                {exp.hasVideo && exp.video ? (
                  <video
                    src={exp.video}
                    poster={exp.poster}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <img
                    src={exp.poster}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070e0b] via-transparent to-black/30 pointer-events-none" />

                {/* Badge AI / Higgsfield */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-[9px] font-tech font-bold text-white uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-[#00e03c] rounded-full animate-pulse shadow-[0_0_6px_#00e03c]" />
                  {exp.badge}
                </div>

                {/* Play Button Overlay */}
                <button
                  onClick={() => openVideoModal(exp)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all group/btn cursor-none"
                  data-cursor-text="VER VIDEO"
                  title="Reproducir video interactivo"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#00e03c] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,224,60,0.6)] group-hover/btn:scale-110 group-hover/btn:bg-white transition-all duration-300">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>

                {/* Location indicator */}
                <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[10px] text-slate-300 font-mono">
                  <MapPin className="w-3 h-3 text-[#00e03c]" />
                  <span className="truncate max-w-[200px]">{exp.location}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 pt-3 space-y-3">
                <span className="text-[10px] font-tech uppercase tracking-widest font-extrabold text-[#00e03c] block">
                  {exp.tag}
                </span>
                <h3 className="font-black text-white text-xl group-hover:text-[#00e03c] transition-colors duration-300 leading-tight">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  {exp.desc}
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  ⚡ Impacto: <span className="text-slate-200 font-medium">{exp.impact}</span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="p-6 pt-2 border-t border-white/[0.06] mt-auto flex flex-col gap-2">
              <button
                onClick={() => openVideoModal(exp)}
                className="w-full py-2.5 rounded-xl border border-[#00e03c]/40 text-[#00e03c] hover:bg-[#00e03c]/10 text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-none"
                data-cursor-text="VIDEO"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Ver Clip Cinemático
              </button>
              <button
                onClick={() => triggerToast(exp.toast)}
                className="neuform-btn-accent cursor-none w-full justify-center !rounded-xl !py-3 text-xs"
                data-cursor-text={exp.cta.toUpperCase()}
              >
                {exp.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── MODAL CINEMÁTICO DE VIDEO ─── */}
      <AnimatePresence>
        {activeVideoExp && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop con desenfoque profundo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeVideoModal}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />

            {/* Contenedor Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-4xl rounded-3xl bg-[#070e0b] border border-[#00e03c]/30 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center border border-[#00e03c]/40">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">
                      {activeVideoExp.title}
                    </h4>
                    <p className="text-[10px] text-[#00e03c] font-tech uppercase tracking-widest">
                      {activeVideoExp.badge}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleModalMute}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-[#00e03c] transition-all cursor-none"
                    title={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-[#00e03c]" />}
                  </button>
                  <button
                    onClick={closeVideoModal}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all cursor-none"
                    title="Cerrar reproductor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={modalVideoRef}
                  src={activeVideoExp.video}
                  poster={activeVideoExp.poster}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Footer Info Modal */}
              <div className="p-6 space-y-4 bg-[#0a140f] border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-200 font-light leading-relaxed max-w-xl">
                      {activeVideoExp.fullDesc}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      📍 Ubicación: <span className="text-white">{activeVideoExp.location}</span> · 🎯 Impacto: <span className="text-[#00e03c]">{activeVideoExp.impact}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerToast(activeVideoExp.toast);
                      closeVideoModal();
                    }}
                    className="neuform-btn-accent whitespace-nowrap !py-3.5 !px-6 cursor-none flex-shrink-0"
                    data-cursor-text="POSTULAR"
                  >
                    {activeVideoExp.cta} <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf, Globe, TreePine, Sprout, Cloud, Play, X,
  Sparkles, Users, HeartHandshake, MapPin, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  useSeramSeo,
  ZenzeHeroSection,
  ZenzePillarsSection,
  ZenzeTechOverviewSection,
  ZenzeBottomCtaBanner
} from '../../components/shared/ZenzeShowcaseSections';
import RotatingVegetation from '../../components/ui/RotatingVegetation';
import MotionFrame from '../../components/ui/MotionFrame';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.25 } }
};

const CORE_EXPERIENCE_PROGRAMS = [
  {
    id: 'exp-reforest',
    category: 'Sostenibilidad Corporativa ESG',
    title: 'Programa de *Reforestación y Adopción* de Árboles Nativos',
    subtitle: 'Restauración ecológica trazable con GPS e informe de impacto anual.',
    desc: 'Plantación de especies forestales endémicas georreferenciadas para empresas e instituciones con monitoreo de supervivencia a 12 y 24 meses.',
    impactStat: '25,000+ Árboles',
    badge: 'Trazabilidad GPS',
    videoUrl: '/assets/videos/cambio_climatico_bolivia.mp4',
    poster: '/assets/3d-backend/bg_experience.webp',
    cta: 'Cotizar Programa Corporativo'
  },
  {
    id: 'exp-carbon',
    category: 'Descarbonización ISO 14064',
    title: 'Cálculo y Compensación de *Huella de Carbono*',
    subtitle: 'Inventario corporativo de emisiones GEI Alcance 1, 2 y 3.',
    desc: 'Medición auditada de emisiones de gases de efecto invernadero e implementación de planes de compensación con bonos y sumideros forestales en Bolivia.',
    impactStat: 'ISO 14064-1',
    badge: 'Reporte Auditado',
    videoUrl: '/assets/videos/seram_academy_funcionamiento.mp4',
    poster: '/assets/3d-backend/huella_carbono_iso.webp',
    cta: 'Evaluar Huella de Carbono'
  },
  {
    id: 'exp-biocamp',
    category: 'Cultura Ambiental & Voluntariado',
    title: '*Bio-Campamentos*, Huertos y Diseño Verde Urbano',
    subtitle: 'Jardines verticales, lombricultura y jornadas de impacto ESG.',
    desc: 'Experiencias prácticas de voluntariado empresarial, educación climática para equipos y paisajismo nativo funcional de bajo consumo hídrico.',
    impactStat: '94% Supervivencia',
    badge: 'Voluntariado ESG',
    videoUrl: '/assets/videos/cambio_climatico_bolivia.mp4',
    poster: '/assets/3d-backend/bg_experience_.webp',
    cta: 'Organizar Jornada ESG'
  }
];

const renderFormattedText = (text) => {
  if (!text) return '';
  const parts = String(text).split(/(\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <span key={index} className="text-[#4ade80] italic">{part.slice(1, -1)}</span>;
    }
    return part;
  });
};

export default function ExperiencePage() {
  const { experiences: ctxExperiences, openChatbot } = useApp();
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  useSeramSeo({
    title: 'Reforestación y Huella de Carbono ESG',
    description: 'Sostenibilidad corporativa y ESG en Bolivia. Reforestación con GPS, cálculo de huella de carbono ISO 14064 y voluntariado ambiental con SERAM Experience.',
    keywords: 'reforestación corporativa Bolivia, huella de carbono ISO 14064, programas ESG empresas, turismo regenerativo SERAM Experience',
    canonicalUrl: 'https://seram.bo/experience',
    ogImage: '/assets/3d-backend/bg_experience.webp',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'SERAM Experience - Reforestación y Programas ESG',
      serviceType: 'Reforestación Corporativa, Huella de Carbono ISO 14064 y Sostenibilidad ESG',
      description: 'Programas corporativos de adopción forestal con geolocalización GPS, inventario de gases de efecto invernadero y voluntariado ambiental.',
      url: 'https://seram.bo/experience',
      provider: {
        '@type': 'Organization',
        name: 'SERAM SRL',
        url: 'https://seram.bo'
      },
      areaServed: {
        '@type': 'Country',
        name: 'Bolivia'
      }
    }
  });

  const experiencePillars = [
    {
      id: 'reforest',
      icon: TreePine,
      iconBgClass: 'bg-[#029907]/25 text-[#4ade80] border border-[#4ade80]/35',
      title: 'Reforestación & Adopción',
      desc: 'Polígonos forestales con especies nativas certificadas, etiquetas QR por árbol e informes de retención hídrica.',
      actionLabel: 'Adoptar Polígono',
      onAction: () => openChatbot('q2_experience')
    },
    {
      id: 'carbon',
      icon: Cloud,
      iconBgClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/35',
      title: 'Huella de Carbono ISO 14064',
      desc: 'Cuantificación rigurosa de CO2 equivalente, métricas Scope 1-3 y estrategia de neutralización verificable.',
      actionLabel: 'Medir Emisiones',
      onAction: () => openChatbot('q2_experience')
    },
    {
      id: 'soil',
      icon: Sprout,
      iconBgClass: 'bg-amber-500/20 text-amber-300 border border-amber-400/35',
      title: 'Suelos & Paisajismo Verde',
      desc: 'Bio-insumos regenerativos, compostaje industrial, huertos urbanos y muros vegetales de alto impacto climático.',
      actionLabel: 'Diseñar Infraestructura',
      onAction: () => openChatbot('q2_experience')
    },
    {
      id: 'community',
      icon: Users,
      iconBgClass: 'bg-violet-500/20 text-violet-300 border border-violet-400/35',
      title: 'Voluntariado & Bio-Camps',
      desc: 'Jornadas vivenciales corporativas y escolares que fortalecen el propósito de tu organización y comunidades locales.',
      actionLabel: 'Agendar Voluntariado',
      onAction: () => openChatbot('q2_experience')
    }
  ];

  // Unir experiencias del Dashboard (si existen) con los programas emblema de video
  const combinedShowcase = useMemo(() => {
    const customList = Array.isArray(ctxExperiences)
      ? ctxExperiences.map((exp, i) => ({
          id: `dash-exp-${exp.id || i}`,
          category: exp.location || 'Programa SERAM Experience',
          title: exp.title || 'Iniciativa Ambiental SERAM',
          subtitle: exp.date ? `Próxima edición: ${exp.date}` : 'Edición Abierta / Corporativa',
          desc: exp.description || exp.impact || 'Programa de impacto ambiental positivo certificado por SERAM.',
          impactStat: `${exp.spots || exp.participants || 30} cupos`,
          badge: exp.status || 'Activo',
          videoUrl: '/assets/videos/cambio_climatico_bolivia.mp4',
          poster: '/assets/3d-backend/bg_experience_.webp',
          cta: 'Consultar Participación'
        }))
      : [];
    return [...CORE_EXPERIENCE_PROGRAMS, ...customList];
  }, [ctxExperiences]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="inner-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20"
    >
      {/* ── SECCIÓN 1: HERO ARQUITECTÓNICO DESACOPLADO SERAM EXPERIENCE ── */}
      <ZenzeHeroSection
        titleWhite="Reforestación y Carbono Neutro."
        titleAccent="Impulsando Tu Impacto ESG Real."
        accentColorClass="text-[#4ade80]"
        buttonAccentClass="bg-[#4ade80] hover:bg-white text-slate-950 shadow-[0_0_25px_rgba(74,222,128,0.3)]"
        barColorClass="bg-[#4ade80]"
        backgroundImage="/assets/3d-backend/bg_experience.webp"
        backgroundAlt="SERAM Experience Restauración Forestal e Impacto Ambiental"
        description="Unimos ciencia ambiental, biotecnología de suelos y trazabilidad satelital para que empresas e instituciones transformen su compromiso climático en bosques vivos y carbono neutralidad real."
        primaryCtaLabel="Participar o Cotizar ESG"
        onPrimaryCta={() => openChatbot('q2_experience')}
        secondaryCtaLabel="Ver Video y Programas"
        onSecondaryCta={() => setActiveVideoModal(CORE_EXPERIENCE_PROGRAMS[0])}
        livePanelTitle="Impacto Biológico en Vivo"
        livePanelCtaLabel="Unirse →"
        onLivePanelCta={() => openChatbot('q2_experience')}
        showVegetation={true}
        liveMetrics={[
          { label: 'Supervivencia Forestal en Polígonos', value: '94%', percent: 94, barClass: 'bg-[#4ade80]' },
          { label: 'Humedad Óptima de Suelo Regenerado', value: '68%', percent: 68, barClass: 'bg-emerald-400' },
          { label: 'Temperatura de Biocorredor Activo', value: '24°C', percent: 76, barClass: 'bg-amber-400' }
        ]}
        kpis={[
          { icon: TreePine, value: '25K+', label: 'Árboles Nativos Plantados' },
          { icon: Globe, value: '1.2K+', label: 'Hectáreas Monitoreadas' },
          { icon: Sparkles, value: '40%', label: 'Captura CO₂ Incremental' },
          { icon: HeartHandshake, value: '30%', label: 'Ahorro Hídrico Nativo' }
        ]}
      />

      {/* ── SECCIÓN 2: QUÉ HACEMOS (4 PILARES ARQUITECTÓNICOS BIO-SOSTENIBILIDAD) ── */}
      <ZenzePillarsSection
        eyebrow="QUÉ HACEMOS"
        title="Soluciones Regenerativas para Cada Ecosistema"
        subtitle="Desde la medición científica de gases de efecto invernadero hasta la restauración participativa de cuencas y jardines urbanos, convertimos metas ESG en legado medible."
        accentColorClass="text-[#4ade80]"
        cards={experiencePillars}
      />

      {/* ── SECCIÓN 3: NUESTRA TECNOLOGÍA BIO-FOREST & CARBON OVERVIEW ── */}
      <ZenzeTechOverviewSection
        eyebrow="CIENCIA Y TRAZABILIDAD"
        title="Ciencia. Biodiversidad. Trazabilidad. Mejor Juntos."
        description="Cada árbol adoptado y cada tonelada de CO2 compensada cuenta con coordenadas georreferenciadas, seguimiento hídrico de campo y reporte ejecutivo listo para memoria anual de sostenibilidad."
        checks={[
          'Monitoreo satelital NDVI de cobertura vegetal en tiempo real',
          'Cálculo estandarizado de Huella de Carbono ISO 14064-1',
          'Sensores climáticos y seguimiento agronómico de supervivencia',
          'Experiencias vivenciales curadas para equipos corporativos y familias'
        ]}
        ctaLabel="Diseñar Mi Programa ESG"
        onCtaClick={() => openChatbot('q2_experience')}
        accentColorClass="text-[#4ade80]"
        buttonAccentClass="bg-[#4ade80] hover:bg-white text-slate-950 shadow-[0_0_25px_rgba(74,222,128,0.25)]"
        overviewTitle="Bio-Forest & Carbon Overview"
        statsCol={{ label1: 'Polígonos Activos', val1: '14', label2: 'Especies Nativas', val2: '22' }}
        trendCard={{ label: 'Captura Estimada', value: '3.6 tCO₂/ha', sub: '+18% vs ciclo previo' }}
        donutCard={{ label: 'Salud del Bosque', percent: 94, statusText: 'Óptimo', leg1: 'Vigoroso', leg2: 'Riego' }}
        recentActivities={[
          { title: 'Riego Goteo Activado', time: 'Polígono Sur · hace 2h' },
          { title: 'Biofertilización Nativa', time: 'Lote 4 · hace 5h' },
          { title: 'Control Fitosanitario', time: 'Parcela 2 · ayer' }
        ]}
        mapImage="/assets/3d-backend/huella_carbono_iso.webp"
        mapPins={[
          { top: '36%', left: '34%', label: 'Polígono Bosque Nativo · Tajibo & Mara', stat: '96% Vida' },
          { top: '58%', left: '52%', label: 'Corredor Biológico Amboró · Captura CO₂', stat: '3.8 t/ha' },
          { top: '42%', left: '72%', label: 'Bio-Huerto & Vivero SERAM Experience', stat: '24°C OK' }
        ]}
        weatherWidget={{
          temp: '24°C',
          condition: 'Vivero y Polígono N° 3',
          metric1: 'Viento: 12 km/h',
          metric2: 'Humedad: 68%',
          metric3: 'Lluvia: 0 mm'
        }}
      />

      {/* ── CATÁLOGO DE EXPERIENCIAS CON MOTION FRAME & VEGETACIÓN ROTATIVA ── */}
      <MotionFrame variant="experience" className="p-6 sm:p-8 bg-[#040905]/70 relative">
        <RotatingVegetation size={220} duration={28} opacity={0.12} className="absolute -bottom-8 -right-8 pointer-events-none" />

        <section id="experience-catalog" className="space-y-6 text-left relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#4ade80] font-tech block">
                EXPERIENCIAS EN TERRENO &amp; VIDEO DOCUMENTAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 font-display">
                Programas Activos para Empresas, Equipos y Familias
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                to="/services"
                className="text-xs font-semibold text-[#4ade80] hover:underline flex items-center gap-1"
              >
                Servicios Ambientales <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => openChatbot('q2_experience')}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-[#4ade80] text-slate-200 hover:text-slate-950 border border-white/10 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#4ade80]" /> Solicitar Cotización a Medida
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combinedShowcase.map((exp, idx) => (
              <motion.article
                key={exp.id || idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="group neuform-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#4ade80]/50 flex flex-col justify-between transition-all shadow-xl"
              >
                <div>
                  <div
                    onClick={() => setActiveVideoModal(exp)}
                    className="relative h-52 bg-slate-950 overflow-hidden cursor-pointer"
                  >
                    <video
                      src={exp.videoUrl}
                      poster={exp.poster}
                      autoPlay
                      loop
                      muted
                      playsInline
                      aria-label={`Video demostrativo de ${String(exp.title || '').replace(/\*/g, '')}`}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071108] via-black/25 to-black/30" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#4ade80] font-bold bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                        {exp.badge}
                      </span>
                      <span className="text-white font-semibold bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                        {exp.impactStat}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white group-hover:text-[#4ade80] group-hover:scale-110 transition-all">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#4ade80] font-tech block">
                      {exp.category}
                    </span>
                    <h3 className="text-lg font-black text-white leading-snug">
                      {renderFormattedText(exp.title)}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-300">
                      {exp.subtitle}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      {exp.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openChatbot('q2_experience')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#4ade80] hover:bg-white text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{exp.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(exp)}
                    className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Ampliar video"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </MotionFrame>

      {/* ── SECCIÓN 4: BANNER HORIZONTAL INFERIOR ZENZE (MANO CON PLANTA) ── */}
      <ZenzeBottomCtaBanner
        image="/assets/3d-backend/bg_experience_.webp"
        imageAlt="Sembrando un futuro sostenible con SERAM Experience"
        title="Construyamos juntos un futuro verde y medible."
        subtitle="Únete a nuestros programas corporativos de adopción forestal, neutralidad de carbono y voluntariado regenerativo con trazabilidad real."
        trustLabel="Impacto verificado en bosques y empresas de Bolivia"
        ctaLabel="Unirse a Experience"
        onCtaClick={() => openChatbot('q2_experience')}
        buttonAccentClass="bg-[#4ade80] hover:bg-white text-slate-950 shadow-[0_0_25px_rgba(74,222,128,0.3)]"
      />

      {/* Modal Reproductor de Video HD */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-slate-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 text-left">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#4ade80] tracking-wider font-tech">
                    {activeVideoModal.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {renderFormattedText(activeVideoModal.title)}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-video bg-black">
                <video
                  src={activeVideoModal.videoUrl}
                  poster={activeVideoModal.poster}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <p className="text-xs text-slate-400">
                  {activeVideoModal.subtitle}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveVideoModal(null);
                    openChatbot('q2_experience');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4ade80] hover:bg-white text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{activeVideoModal.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

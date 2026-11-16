import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TreePine, Sprout, Cloud, Play, X, MapPin, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  useSeramSeo,
  EditorialHeroSection,
  EditorialPillarsSection,
  EditorialBentoSection,
  EditorialShowcaseSection,
  EditorialConnectSection
} from '../../components/shared/ZenzeShowcaseSections';
import RotatingVegetation from '../../components/ui/RotatingVegetation';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.25 } }
};

const CORE_EXPERIENCE_PROGRAMS = [
  {
    id: 'exp-reforest',
    category: 'Sostenibilidad Corporativa ESG',
    title: 'Programa de *Reforestación y Adopción* de Árboles Nativos',
    subtitle: 'Restauración ecológica trazable con GPS e informe de impacto anual.',
    desc: 'Plantación de especies forestales endémicas georreferenciadas para empresas e instituciones con monitoreo de supervivencia a 12 y 24 meses.',
    impactStat: 'Especies Nativas',
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
    desc: 'Medición técnica de emisiones de gases de efecto invernadero e implementación de planes de compensación con sumideros forestales en Bolivia.',
    impactStat: 'ISO 14064-1',
    badge: 'Reporte Verificado',
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
    impactStat: 'Campañas 2026',
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
      return <span key={index} className="text-[#126c0f] font-bold">{part.slice(1, -1)}</span>;
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
      title: 'Reforestación & Adopción',
      desc: 'Polígonos forestales con especies nativas, etiquetas QR por árbol e informes periódicos de seguimiento y retención hídrica.',
      actionLabel: 'Adoptar Polígono',
      onAction: () => openChatbot('q2_experience')
    },
    {
      id: 'carbon',
      icon: Cloud,
      title: 'Huella de Carbono ISO 14064',
      desc: 'Cuantificación rigurosa de CO2 equivalente, métricas Scope 1-3 y estrategia de compensación verificable para organizaciones.',
      actionLabel: 'Medir Emisiones',
      onAction: () => openChatbot('q2_experience')
    },
    {
      id: 'soil',
      icon: Sprout,
      title: 'Suelos, Huertos & Voluntariado',
      desc: 'Bio-insumos regenerativos, compostaje, huertos urbanos y jornadas vivenciales corporativas que fortalecen la cultura ESG.',
      actionLabel: 'Organizar Jornada',
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
          desc: exp.description || exp.impact || 'Programa de impacto ambiental positivo acompañado por SERAM.',
          impactStat: `${exp.spots || exp.participants || 30} cupos`,
          badge: exp.status || 'Activo',
          videoUrl: '/assets/videos/cambio_climatico_bolivia.mp4',
          poster: '/assets/3d-backend/bg_experience_.webp',
          cta: 'Consultar Participación'
        }))
      : [];
    return [...CORE_EXPERIENCE_PROGRAMS, ...customList];
  }, [ctxExperiences]);

  const scrollToCatalog = () => {
    const el = document.getElementById('experience-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="inner-page bg-[#f9f9f9] text-[#1a1c1c] min-h-screen"
    >
      {/* Franja superior sólida detrás del Navbar fijo para mantener contraste */}
      <div className="h-20 -mt-20 bg-[#071109]" aria-hidden="true" />

      {/* 1. HERO EDITORIAL */}
      <EditorialHeroSection
        kicker="SOSTENIBILIDAD CORPORATIVA · SERAM EXPERIENCE"
        title="Reforestación y Carbono Neutro"
        titleAccent="con impacto ESG verificable."
        description="Unimos ciencia ambiental, restauración de suelos y trazabilidad georreferenciada para que empresas e instituciones transformen su compromiso climático en acciones medibles en Bolivia."
        backgroundImage="/assets/3d-backend/bg_experience.webp"
        backgroundAlt="SERAM Experience Restauración Forestal e Impacto Ambiental"
        primaryCtaLabel="Cotizar Programa ESG"
        onPrimaryCta={() => openChatbot('q2_experience')}
        secondaryCtaLabel="Ver Programas y Videos"
        onSecondaryCta={scrollToCatalog}
      />

      {/* 2. PILARES EDITORIALES */}
      <EditorialPillarsSection
        title="Soluciones Regenerativas para Cada Ecosistema"
        subtitle="Desde la medición de gases de efecto invernadero hasta la restauración participativa de espacios verdes, convertimos metas ESG en resultados tangibles."
        cards={experiencePillars}
      />

      {/* 3. BENTO CIENCIA Y TRAZABILIDAD */}
      <EditorialBentoSection
        kicker="CIENCIA Y TRAZABILIDAD"
        title="Ciencia, biodiversidad y seguimiento en cada hectárea."
        description="Cada árbol adoptado y cada inventario de CO2 cuenta con coordenadas georreferenciadas, seguimiento agronómico de campo y reporte ejecutivo listo para memoria de sostenibilidad."
        ctaLabel="Diseñar mi programa ESG"
        onCtaClick={() => openChatbot('q2_experience')}
        stats={[
          { value: 'ISO 14064-1', label: 'Estándar de cálculo de huella GEI' },
          { value: 'GPS + QR', label: 'Trazabilidad individual por polígono' }
        ]}
        image="/assets/3d-backend/huella_carbono_iso.webp"
        imageAlt="Trazabilidad de Huella de Carbono y Reforestación SERAM Experience"
        imageCaptionTitle="Restauración Ecológica en Bolivia"
        imageCaptionText="Seguimiento agronómico de supervivencia y reportes anuales ESG."
      />

      {/* 4. SHOWCASE INICIATIVAS */}
      <EditorialShowcaseSection
        title="Del Diagnóstico Climático a la Acción en Terreno"
        subtitle="Acompañamos a organizaciones en la medición de emisiones, diseño de campañas de reforestación y jornadas de voluntariado."
        actionLabel="Ver servicios ambientales"
        actionTo="/services"
        featuredImage="/assets/3d-backend/bg_experience_.webp"
        featuredAlt="Jornadas de reforestación y sostenibilidad SERAM Experience"
        featuredKicker="IMPACTO AMBIENTAL POSITIVO"
        featuredTitle="Reforestación Nativa, Bio-Campamentos y Carbono Neutro"
        items={[
          {
            title: 'Inventario de Emisiones Alcance 1, 2 y 3',
            desc: 'Cuantificación técnica bajo ISO 14064-1 para identificar focos de reducción y compensación.'
          },
          {
            title: 'Adopción de Polígonos Forestales',
            desc: 'Selección de especies nativas adaptadas al ecosistema local con monitoreo de supervivencia.'
          },
          {
            title: 'Voluntariado Corporativo y Educativo',
            desc: 'Jornadas guiadas en campo y talleres prácticos que conectan a tu equipo con la naturaleza.'
          }
        ]}
      />

      {/* CATÁLOGO DE EXPERIENCIAS EN TERRENO & VIDEO DOCUMENTAL */}
      <section id="experience-catalog" className="py-16 md:py-24 bg-white border-b border-[#bdcbb4]/50 relative overflow-hidden">
        <RotatingVegetation size={220} duration={28} opacity={0.08} className="absolute -bottom-8 -right-8 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10 text-left relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#126c0f]">
                EXPERIENCIAS EN TERRENO &amp; VIDEO DOCUMENTAL
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1a1c1c] mt-2 font-display">
                Programas Activos para Empresas y Equipos
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/services"
                className="text-xs font-bold uppercase tracking-wider text-[#126c0f] hover:text-[#029907] border-b border-[#126c0f] pb-0.5 flex items-center gap-1"
              >
                <span>Servicios Ambientales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => openChatbot('q2_experience')}
                className="px-5 py-2.5 bg-[#126c0f] hover:bg-[#029907] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Solicitar Cotización</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {combinedShowcase.map((exp, idx) => (
              <motion.article
                key={exp.id || idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="group bg-white border border-[#bdcbb4] hover:border-[#126c0f] flex flex-col justify-between transition-all"
              >
                <div>
                  <div
                    onClick={() => setActiveVideoModal(exp)}
                    className="relative h-52 bg-[#1a1c1c] overflow-hidden cursor-pointer"
                  >
                    <video
                      src={exp.videoUrl}
                      poster={exp.poster}
                      autoPlay
                      loop
                      muted
                      playsInline
                      aria-label={`Video demostrativo de ${String(exp.title || '').replace(/\*/g, '')}`}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/25" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold">
                      <span className="text-white bg-[#126c0f] px-2.5 py-1 uppercase tracking-wider">
                        {exp.badge}
                      </span>
                      <span className="text-[#1a1c1c] bg-white/95 px-2.5 py-1">
                        {exp.impactStat}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 border border-[#126c0f]/30 flex items-center justify-center text-[#126c0f] group-hover:bg-[#126c0f] group-hover:text-white group-hover:scale-110 transition-all">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#126c0f] block">
                      {exp.category}
                    </span>
                    <h3 className="text-lg font-bold text-[#1a1c1c] leading-snug font-display">
                      {renderFormattedText(exp.title)}
                    </h3>
                    <p className="text-xs font-semibold text-[#3e4a39]">
                      {exp.subtitle}
                    </p>
                    <p className="text-sm text-[#3e4a39] leading-relaxed pt-1">
                      {exp.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-4 border-t border-[#bdcbb4]/50 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openChatbot('q2_experience')}
                    className="flex-1 py-3 px-4 bg-[#126c0f] hover:bg-[#029907] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{exp.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(exp)}
                    className="p-3 border border-[#bdcbb4] hover:border-[#126c0f] text-[#126c0f] hover:bg-[#126c0f]/5 transition-colors cursor-pointer"
                    title="Ampliar video"
                    aria-label="Ampliar video demostrativo"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CONECTEMOS */}
      <EditorialConnectSection
        title="Conectemos"
        subtitle="¿Tu organización busca medir su huella de carbono o impulsar una campaña de reforestación en Bolivia? Conversemos."
        interestOptions={[
          'Reforestación Corporativa & Adopción',
          'Huella de Carbono ISO 14064-1',
          'Voluntariado Ambiental & Bio-Campamentos',
          'Sostenibilidad Corporativa ESG'
        ]}
        onConnectSubmit={() => openChatbot('q2_experience')}
      />

      {/* Modal Reproductor de Video HD */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white border border-[#bdcbb4] overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#bdcbb4] text-left bg-[#f9f9f9]">
                <div>
                  <span className="text-xs font-bold uppercase text-[#126c0f] tracking-wider">
                    {activeVideoModal.category}
                  </span>
                  <h4 className="text-base font-bold text-[#1a1c1c] font-display">
                    {renderFormattedText(activeVideoModal.title)}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="w-8 h-8 border border-[#bdcbb4] text-[#1a1c1c] hover:bg-[#126c0f] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Cerrar reproductor de video"
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

              <div className="p-4 bg-[#f9f9f9] flex flex-col sm:flex-row items-center justify-between gap-3 text-left border-t border-[#bdcbb4]">
                <p className="text-xs text-[#3e4a39]">
                  {activeVideoModal.subtitle}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveVideoModal(null);
                    openChatbot('q2_experience');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#126c0f] hover:bg-[#029907] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

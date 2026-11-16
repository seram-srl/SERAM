import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Factory, Layers, CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  useSeramSeo,
  EditorialHeroSection,
  EditorialPillarsSection,
  EditorialBentoSection,
  EditorialShowcaseSection,
  EditorialConnectSection
} from '../../components/shared/ZenzeShowcaseSections';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.25 } }
};

function getChatbotStepForService(category = '', title = '') {
  const txt = `${category} ${title}`.toLowerCase();
  if (txt.includes('industr') || txt.includes('rai') || txt.includes('laboratorio') || txt.includes('psst') || txt.includes('residuo')) {
    return 'q2_industrial';
  }
  if (txt.includes('min') || txt.includes('emap') || txt.includes('prosp')) {
    return 'q2_mining';
  }
  if (txt.includes('territor') || txt.includes('plano') || txt.includes('dron') || txt.includes('cuenca') || txt.includes('monitoreo')) {
    return 'q2_sig';
  }
  return 'q2_civil';
}

export default function ServicesPage() {
  const { publicServices, openChatbot } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useSeramSeo({
    title: 'Servicios Ambientales en Bolivia (FNCA, RAI, EMAP)',
    description: 'Consultoría ambiental en Bolivia. Gestionamos Licencias Ambientales FNCA, RAI Industrial, EMAP y estudios territoriales con el equipo técnico de SERAM.',
    keywords: 'consultora ambiental Bolivia, licencia ambiental FNCA, registro ambiental industrial RAI, EMAP minería, evaluacion ambiental AACD AACN',
    canonicalUrl: 'https://seram.bo/services',
    ogImage: '/assets/3d-backend/panel2-service-background.webp',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Servicios de Consultoría Ambiental SERAM',
      serviceType: 'Consultoría Ambiental, Licenciamiento Normativo y Gestión Territorial',
      description: 'Gestión de Licencias Ambientales FNCA, Registro Ambiental Industrial RAI, EMAP y estudios técnicos ambientales en Bolivia.',
      url: 'https://seram.bo/services',
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

  const pillars = [
    {
      id: 'civil',
      icon: FileText,
      title: 'Licencias y FNCA',
      desc: 'Categorización Ambiental (Cat. 1 a 4), formularios ambientales, estudios EEIA, PPM-PASA y atención a observaciones administrativas.',
      actionLabel: 'Precalificar Trámite',
      onAction: () => openChatbot('q2_civil')
    },
    {
      id: 'industrial',
      icon: Factory,
      title: 'Industria & RAI',
      desc: 'Registro Ambiental Industrial (RAI), Manifiestos, monitoreos con laboratorio acreditado y Programas de Seguridad PSST.',
      actionLabel: 'Evaluar Planta',
      onAction: () => openChatbot('q2_industrial')
    },
    {
      id: 'mining',
      icon: Layers,
      title: 'Minería & Plan EMAP',
      desc: 'Documentación técnica para Formulario de Prospección Minera, habilitación EMAP y planimetría georreferenciada en WGS-84.',
      actionLabel: 'Evaluar Concesión',
      onAction: () => openChatbot('q2_mining')
    }
  ];

  const categories = useMemo(() => {
    const cats = new Set(['Todos']);
    (publicServices || []).forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats);
  }, [publicServices]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'Todos') return publicServices || [];
    return (publicServices || []).filter((s) => s.category === selectedCategory);
  }, [publicServices, selectedCategory]);

  const scrollToCatalog = () => {
    const el = document.getElementById('services-catalog');
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
        kicker="CONSULTORÍA AMBIENTAL EN BOLIVIA"
        title="Consultoría y Licencias Ambientales"
        titleAccent="para tu operación en Bolivia."
        description="Combinamos gestión regulatoria, relevamiento territorial bajo demanda y trámite ordenado ante AACD y AACN para respaldar proyectos civiles, industriales y mineros."
        backgroundImage="/assets/3d-backend/panel2-service-background.webp"
        backgroundAlt="Consultoría Ambiental SERAM SRL en Bolivia"
        primaryCtaLabel="Iniciar Diagnóstico"
        onPrimaryCta={() => openChatbot('q1')}
        secondaryCtaLabel="Explorar Portafolio"
        onSecondaryCta={scrollToCatalog}
      />

      {/* 2. PILARES EDITORIALES */}
      <EditorialPillarsSection
        title="Soluciones Técnicas para Cada Operación"
        subtitle="Desde el relevamiento en campo hasta la gestión formal de tu Licencia Ambiental o RAI, acompañamos cada etapa normativa de tu empresa."
        cards={pillars}
      />

      {/* 3. BENTO METODOLOGÍA */}
      <EditorialBentoSection
        kicker="METODOLOGÍA SERAM"
        title="Datos, territorio y normativa en un mismo flujo técnico."
        description="Integramos análisis territorial, control documental y seguimiento técnico ordenado para entregarte trámites claros y trazables ante la autoridad competente."
        ctaLabel="Evaluar mi proyecto"
        onCtaClick={() => openChatbot('q1')}
        stats={[
          { value: 'Ley 1333', label: 'Alineación normativa y D.S. 3549' },
          { value: '24/48h', label: 'Respuesta inicial de diagnóstico' }
        ]}
        image="/assets/3d-backend/gis_satellite_mapping.webp"
        imageAlt="Relevamiento territorial y georreferenciación WGS-84 SERAM"
        imageCaptionTitle="Datum Oficial WGS-84"
        imageCaptionText="Relevamiento técnico y documentación lista para AACD y AACN."
      />

      {/* 4. SHOWCASE OPERATIVO */}
      <EditorialShowcaseSection
        title="Gestión Documental sin Contratiempos"
        subtitle="Estructuramos cada expediente técnico para prevenir observaciones y resguardar la continuidad operativa de tu proyecto."
        actionLabel="Abrir formulario de cotización"
        actionTo="/quote"
        featuredImage="/assets/3d-backend/licencias_fnca.webp"
        featuredAlt="Gestión de Licencias Ambientales FNCA en Bolivia"
        featuredKicker="TRÁMITES REGULATORIOS"
        featuredTitle="Expedientes Ambientales FNCA, RAI y EMAP"
        items={[
          {
            title: 'Precalificación Regulatoria',
            desc: 'Identificamos la categoría ambiental y requisitos exactos de tu actividad antes de iniciar cualquier gestión.'
          },
          {
            title: 'Levantamiento en Campo',
            desc: 'Relevamiento técnico, georreferenciación WGS-84 y análisis territorial bajo demanda según el alcance del proyecto.'
          },
          {
            title: 'Seguimiento ante AACD y AACN',
            desc: 'Atención oportuna a observaciones técnicas y acompañamiento ordenado hasta la emisión de tu licencia.'
          }
        ]}
      />

      {/* CATÁLOGO DINÁMICO DE SERVICIOS (ESTILO EDITORIAL CLARO) */}
      <section id="services-catalog" className="py-16 md:py-24 bg-white border-b border-[#bdcbb4]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#126c0f]">
                PORTAFOLIO TÉCNICO
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1a1c1c] mt-2 font-display">
                Servicios Ambientales Listos para Cotizar
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold border transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#126c0f] text-white border-[#126c0f]'
                      : 'bg-[#f9f9f9] text-[#3e4a39] border-[#bdcbb4] hover:border-[#126c0f]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((srv, idx) => {
              const chatbotStep = getChatbotStepForService(srv.category, srv.title);
              return (
                <motion.article
                  key={srv.id || idx}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className="bg-white border border-[#bdcbb4] hover:border-[#126c0f] p-7 flex flex-col justify-between space-y-6 transition-all text-left group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#126c0f]">
                        {srv.category || 'Consultoría'}
                      </span>
                      <span className="text-xs font-bold text-[#1a1c1c] bg-[#eeeeee] px-2.5 py-1">
                        {srv.price ? `Desde ${srv.price}` : 'A medida'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1a1c1c] group-hover:text-[#126c0f] transition-colors leading-snug font-display">
                      {srv.title}
                    </h3>

                    <p className="text-sm text-[#3e4a39] leading-relaxed">
                      {srv.desc}
                    </p>

                    {Array.isArray(srv.features) && srv.features.length > 0 && (
                      <ul className="space-y-2 pt-3 border-t border-[#bdcbb4]/50">
                        {srv.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="text-xs text-[#3e4a39] flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#126c0f] flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#bdcbb4]/50 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => openChatbot(chatbotStep)}
                      className="flex-1 py-3 px-4 bg-[#126c0f] hover:bg-[#029907] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cotizar con Asistente</span>
                    </button>
                    <Link
                      to="/quote"
                      className="p-3 border border-[#bdcbb4] hover:border-[#126c0f] text-[#126c0f] hover:bg-[#126c0f]/5 transition-colors inline-flex items-center justify-center"
                      title="Abrir formulario completo"
                      aria-label="Abrir formulario completo de cotización"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CONECTEMOS */}
      <EditorialConnectSection
        title="Conectemos"
        subtitle="Cuéntanos sobre tu proyecto, planta industrial o concesión en Bolivia. Te respondemos con una ruta técnica clara."
        interestOptions={[
          'Licencias Ambientales FNCA',
          'Registro Ambiental Industrial (RAI)',
          'Minería & Plan EMAP',
          'Análisis Territorial & Dron'
        ]}
        onConnectSubmit={() => openChatbot('q1')}
      />
    </motion.div>
  );
}

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
      title: 'Licencias para Construir y Operar',
      desc: 'Definimos exactamente qué permiso necesita tu proyecto, armamos tu expediente completo y resolvemos observaciones para que tu obra no se detenga.',
      actionLabel: 'Evaluar mi Proyecto',
      onAction: () => openChatbot('q2_civil')
    },
    {
      id: 'industrial',
      icon: Factory,
      title: 'Industria sin Multas ni Clausuras',
      desc: 'Ponemos al día tu Registro Ambiental Industrial (RAI), reportes periódicos, análisis con laboratorio acreditado y planes de seguridad laboral.',
      actionLabel: 'Revisar mi Planta',
      onAction: () => openChatbot('q2_industrial')
    },
    {
      id: 'mining',
      icon: Layers,
      title: 'Minería con Respaldo Normativo',
      desc: 'Preparamos la documentación ambiental y los planos georreferenciados que exige tu operación minera para trabajar con seguridad jurídica.',
      actionLabel: 'Evaluar Operación',
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
        kicker="GESTIÓN AMBIENTAL PARA EMPRESAS EN BOLIVIA"
        title="Tus Licencias Ambientales al día,"
        titleAccent="sin frenar tu operación."
        description="Te ayudamos a resolver permisos, ordenar el cumplimiento ambiental de tu negocio y evitar multas o paralizaciones con un acompañamiento claro de principio a fin."
        backgroundImage="/assets/3d-backend/panel2-service-background.webp"
        backgroundAlt="Consultoría Ambiental SERAM SRL en Bolivia"
        primaryCtaLabel="Evaluar mi Caso Ahora"
        onPrimaryCta={() => openChatbot('q1')}
        secondaryCtaLabel="Ver Servicios"
        onSecondaryCta={scrollToCatalog}
      />

      {/* 2. PILARES EDITORIALES */}
      <EditorialPillarsSection
        title="Soluciones Claras para el Crecimiento de tu Empresa"
        subtitle="Nos encargamos de todo el proceso —desde la visita a terreno hasta la entrega de tu licencia o registro— para que tú te enfoques en hacer producir tu negocio."
        cards={pillars}
      />

      {/* 3. BENTO METODOLOGÍA */}
      <EditorialBentoSection
        kicker="CÓMO TRABAJAMOS"
        title="Orden, rapidez y tranquilidad frente a cada inspección."
        description="Centralizamos la información de tu empresa, verificamos tu terreno y hacemos seguimiento directo ante la autoridad ambiental para entregarte trámites claros y sin sorpresas."
        ctaLabel="Solicitar diagnóstico"
        onCtaClick={() => openChatbot('q1')}
        stats={[
          { value: '100% Legal', label: 'Cumplimiento garantizado ante Ley 1333' },
          { value: '24/48h', label: 'Diagnóstico inicial para tu empresa' }
        ]}
        image="/assets/3d-backend/gis_satellite_mapping.webp"
        imageAlt="Relevamiento territorial y georreferenciación SERAM"
        imageCaptionTitle="Precisión en Campo"
        imageCaptionText="Levantamiento técnico y expedientes listos para aprobación oficial."
      />

      {/* 4. SHOWCASE OPERATIVO */}
      <EditorialShowcaseSection
        title="Trámites Ambientales sin Contratiempos ni Demoras"
        subtitle="Preparamos cada expediente a la medida de tu actividad para prevenir observaciones y resguardar la continuidad de tu empresa."
        actionLabel="Solicitar cotización formal"
        actionTo="/quote"
        featuredImage="/assets/3d-backend/licencias_fnca.webp"
        featuredAlt="Gestión de Licencias Ambientales en Bolivia"
        featuredKicker="CONTINUIDAD OPERATIVA"
        featuredTitle="Licencias Ambientales, Registros Industriales y Planes de Manejo"
        items={[
          {
            title: '1. Diagnóstico sin Rodeos',
            desc: 'Te decimos desde el primer día qué permiso corresponde a tu negocio, cuánto tiempo toma y qué requisitos necesitas.'
          },
          {
            title: '2. Visita y Levantamiento en Terreno',
            desc: 'Nuestro equipo recopila los datos y planos de tu planta, obra o proyecto sin interrumpir tus actividades diarias.'
          },
          {
            title: '3. Seguimiento hasta la Aprobación',
            desc: 'Atendemos cada consulta u observación de la autoridad ambiental hasta entregarte tu resolución vigente.'
          }
        ]}
      />

      {/* CATÁLOGO DINÁMICO DE SERVICIOS (ESTILO EDITORIAL CLARO) */}
      <section id="services-catalog" className="py-16 md:py-24 bg-white border-b border-[#bdcbb4]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#126c0f] font-sans">
                PORTAFOLIO DE SERVICIOS
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1a1c1c] mt-2 font-display">
                Elige la Solución que tu Empresa Necesita
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#126c0f] text-white border-[#126c0f] shadow-md shadow-[#126c0f]/20'
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
                  className="bg-white rounded-xl border border-[#bdcbb4] hover:border-[#126c0f] hover:shadow-lg hover:shadow-[#126c0f]/5 p-7 flex flex-col justify-between space-y-6 transition-all duration-300 text-left group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#126c0f] font-sans">
                        {srv.category || 'Consultoría'}
                      </span>
                      <span className="text-xs font-bold text-[#1a1c1c] bg-[#eeeeee] rounded-md px-2.5 py-1 font-sans">
                        {srv.price ? `Desde ${srv.price}` : 'A medida'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-[#1a1c1c] group-hover:text-[#126c0f] transition-colors leading-snug font-display">
                      {srv.title}
                    </h3>

                    <p className="text-sm text-[#3e4a39] font-sans leading-relaxed">
                      {srv.desc}
                    </p>

                    {Array.isArray(srv.features) && srv.features.length > 0 && (
                      <ul className="space-y-2 pt-3 border-t border-[#bdcbb4]/50">
                        {srv.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="text-xs text-[#3e4a39] font-sans flex items-center gap-2">
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
                      className="flex-1 py-3 px-4 rounded-xl bg-[#126c0f] hover:bg-[#029907] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#126c0f]/20 hover:shadow-[#029907]/30 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cotizar con Asistente</span>
                    </button>
                    <Link
                      to="/quote"
                      className="group/link p-3 rounded-xl border border-[#126c0f]/40 hover:border-[#126c0f] bg-white/80 backdrop-blur-sm text-[#126c0f] hover:bg-[#126c0f]/5 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 inline-flex items-center justify-center"
                      title="Abrir formulario completo"
                      aria-label="Abrir formulario completo de cotización"
                    >
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
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
        title="Hablemos de tu Empresa"
        subtitle="Cuéntanos sobre tu proyecto, planta industrial u operación en Bolivia. Te respondemos con una ruta clara para poner todo en regla."
        interestOptions={[
          'Licencias Ambientales y Permisos',
          'Registro Ambiental Industrial (RAI)',
          'Minería y Planes Ambientales',
          'Evaluación en Terreno'
        ]}
        onConnectSubmit={() => openChatbot('q1')}
      />
    </motion.div>
  );
}

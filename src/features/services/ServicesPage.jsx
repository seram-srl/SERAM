import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Globe, FileText, Compass, Factory, Layers,
  CheckCircle2, ArrowRight, Sparkles, Zap, FileCheck2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  useSeramSeo,
  ZenzeHeroSection,
  ZenzePillarsSection,
  ZenzeTechOverviewSection,
  ZenzeBottomCtaBanner
} from '../../components/shared/ZenzeShowcaseSections';
import MotionFrame from '../../components/ui/MotionFrame';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.25 } }
};

function mapCategoryToChatbotStep(category = '', title = '') {
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
  const navigate = useNavigate();
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
      iconBgClass: 'bg-[#029907]/25 text-[#00e03c] border border-[#00e03c]/35',
      title: 'Licencias y FNCA',
      desc: 'Categorización Ambiental (Cat. 1 a 4), Estudios EEIA, PPM-PASA y levantamiento de observaciones sin frenos administrativos.',
      actionLabel: 'Precalificar Trámite',
      onAction: () => openChatbot('q2_civil')
    },
    {
      id: 'industrial',
      icon: Factory,
      iconBgClass: 'bg-sky-500/20 text-sky-400 border border-sky-400/35',
      title: 'Industria & RAI Express',
      desc: 'Registro Ambiental Industrial, Manifiestos, Monitoreos de laboratorio certificado y Programas de Seguridad PSST.',
      actionLabel: 'Blindar Planta',
      onAction: () => openChatbot('q2_industrial')
    },
    {
      id: 'mining',
      icon: Layers,
      iconBgClass: 'bg-amber-500/20 text-amber-400 border border-amber-400/35',
      title: 'Minería & Plan EMAP',
      desc: 'Carpetas rápidas para Formulario de Prospección Minera, habilitación EMAP y planimetría vectorial AJAM.',
      actionLabel: 'Evaluar Concesión',
      onAction: () => openChatbot('q2_mining')
    },
    {
      id: 'territorio',
      icon: Compass,
      iconBgClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/35',
      title: 'Análisis Territorial & Dron',
      desc: 'Relevamiento aéreo, delimitación hidrográfica, análisis multitemporal ABT y planos técnicos bajo demanda en WGS-84.',
      actionLabel: 'Cotizar Estudio',
      onAction: () => openChatbot('q2_sig')
    }
  ];

  const categories = useMemo(() => {
    const cats = new Set(['Todos']);
    (publicServices || []).forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats);
  }, [publicServices]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'Todos') return publicServices || [];
    return (publicServices || []).filter(s => s.category === selectedCategory);
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
      className="inner-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20"
    >
      {/* ── SECCIÓN 1: HERO ARQUITECTÓNICO DESACOPLADO SERAM SERVICES ── */}
      <ZenzeHeroSection
        titleWhite="Consultoría y Licencias Ambientales."
        titleAccent="Acompañando Tu Operación en Bolivia."
        accentColorClass="text-[#00e03c]"
        buttonAccentClass="bg-[#00e03c] hover:bg-white text-slate-950 shadow-[0_0_25px_rgba(0,224,60,0.3)]"
        backgroundImage="/assets/3d-backend/panel2-service-background.webp"
        backgroundAlt="Consultoría Ambiental SERAM Services"
        description="Combinamos gestión regulatoria, relevamiento territorial bajo demanda y trámite ordenado ante AACD/AACN para respaldar tus proyectos civiles, industriales y mineros."
        primaryCtaLabel="Iniciar Diagnóstico Técnico"
        onPrimaryCta={() => openChatbot('q1')}
        secondaryCtaLabel="Explorar Portafolio de Servicios"
        onSecondaryCta={scrollToCatalog}
        livePanelTitle="Seguimiento Operativo en Vivo"
        livePanelCtaLabel="Evaluar Caso →"
        onLivePanelCta={() => openChatbot('q1')}
        liveMetrics={[
          { label: 'Cumplimiento Normativo Ley 1333', value: '98%', percent: 98, barClass: 'bg-[#00e03c]' },
          { label: 'Precisión Geodésica WGS-84', value: 'RTK', percent: 95, barClass: 'bg-sky-400' },
          { label: 'Trazabilidad Documental SERAM', value: '100%', percent: 100, barClass: 'bg-emerald-400' }
        ]}
        kpis={[
          { icon: Briefcase, value: '100%', label: 'Enfoque Normativo' },
          { icon: Globe, value: 'WGS-84', label: 'Georreferenciación' },
          { icon: FileCheck2, value: 'AACD/N', label: 'Gestión Formal' },
          { icon: Zap, value: '24/48h', label: 'Respuesta Inicial' }
        ]}
      />

      {/* ── SECCIÓN 2: QUÉ HACEMOS (4 PILARES OSCUROS ARQUITECTÓNICOS) ── */}
      <ZenzePillarsSection
        eyebrow="QUÉ HACEMOS"
        title="Soluciones Técnicas para Cada Operación"
        subtitle="Desde el relevamiento en campo hasta la gestión formal de la Licencia Ambiental o RAI, acompañamos técnica y legalmente cada etapa de tu empresa."
        cards={pillars}
      />

      {/* ── SECCIÓN 3: NUESTRA TECNOLOGÍA (PANEL INTERACTIVO SERAM OPERATIONS) ── */}
      <ZenzeTechOverviewSection
        eyebrow="NUESTRA METODOLOGÍA"
        title="Datos. Territorio. Normativa. Mejor Juntos."
        description="Integramos análisis territorial, control documental y seguimiento técnico en tiempo real para entregarte trámites ordenados y trazabilidad completa."
        checks={[
          'Monitoreo georreferenciado en datum oficial WGS-84',
          'Precalificación regulatoria inmediata en el Asistente Digital',
          'Relevamiento con drones, ortofotos y análisis de cuencas bajo demanda',
          'Seguimiento transparente sincronizado con nuestro panel operativo'
        ]}
        ctaLabel="Cotizar Mi Proyecto Ahora"
        onCtaClick={() => openChatbot('q1')}
        overviewTitle="SERAM Operations Overview"
        statsCol={{ label1: 'Trámites Activos', val1: '18', label2: 'Estudios Ambientales', val2: '9' }}
        trendCard={{ label: 'Eficiencia Operativa', value: '+38%', sub: 'en gestión documental' }}
        donutCard={{ label: 'Viabilidad Técnica', percent: 98, statusText: 'Óptimo', leg1: 'Conforme', leg2: 'Observ.' }}
        recentActivities={[
          { title: 'FNCA Cat. 3 Presentado', time: 'Hace 2 horas' },
          { title: 'Plano WGS-84 Validado', time: 'Hace 5 horas' },
          { title: 'RAI Industrial Emitido', time: 'Ayer' }
        ]}
        mapImage="/assets/3d-backend/gis_satellite_mapping.webp"
        mapPins={[
          { top: '34%', left: '30%', label: 'Parque Industrial Norte · RAI Cat. 3', stat: 'Aprobado' },
          { top: '55%', left: '54%', label: 'Concesión Minera Chiquitanía · EMAP', stat: 'En Curso' },
          { top: '42%', left: '72%', label: 'Cuenca Hidrográfica Piraí · Relevamiento', stat: 'WGS-84' }
        ]}
        weatherWidget={{
          temp: '98.4%',
          condition: 'Tasa de Conformidad IRAP',
          metric1: 'WGS-84: OK',
          metric2: 'AACD/N: OK',
          metric3: 'D.S. 3549'
        }}
      />

      {/* ── CATÁLOGO HÍBRIDO DINÁMICO DE SERVICIOS SERAM ── */}
      <MotionFrame variant="services" className="p-6 sm:p-8 bg-[#040905]/70">
        <section id="services-catalog" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00e03c] font-tech block">
                PORTAFOLIO TÉCNICO DETALLADO
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 font-display">
                Servicios Especializados Listos para Cotizar
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#00e03c] text-slate-950 border-[#00e03c]'
                      : 'bg-[#0b150d] text-slate-300 border-white/10 hover:border-[#00e03c]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((srv, idx) => {
              const chatbotStep = mapCategoryToChatbotStep(srv.category, srv.title);
              return (
                <motion.article
                  key={srv.id || idx}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className="neuform-card rounded-2xl p-6 flex flex-col justify-between space-y-5 border border-white/10 hover:border-[#00e03c]/45 transition-all text-left group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00e03c] font-mono">
                        {srv.category || 'Consultoría'}
                      </span>
                      <span className="text-xs font-black text-white font-mono">
                        {srv.price ? `Desde ${srv.price}` : 'A medida'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-[#00e03c] transition-colors leading-snug">
                      {srv.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {srv.desc}
                    </p>

                    {Array.isArray(srv.features) && srv.features.length > 0 && (
                      <ul className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                        {srv.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="text-[11px] text-slate-300 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00e03c] flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openChatbot(chatbotStep)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#00e03c] hover:bg-white text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Cotizar con Asistente
                    </button>
                    <Link
                      to="/quote"
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
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
        </section>
      </MotionFrame>

      {/* ── SECCIÓN 4: BANNER HORIZONTAL INFERIOR ZENZE ── */}
      <ZenzeBottomCtaBanner
        image="/assets/3d-backend/licencias_fnca.webp"
        imageAlt="Regularización Ambiental y Licencias SERAM"
        title="Blindemos juntos la continuidad de tu proyecto."
        subtitle="Evita paralizaciones y responde conminatorias con respaldo técnico certificado ante autoridades departamentales y nacionales."
        trustLabel="Más de 150 empresas en Bolivia operan con respaldo SERAM"
        ctaLabel="Hablar con Asistente SERAM"
        onCtaClick={() => openChatbot('q1')}
      />
    </motion.div>
  );
}

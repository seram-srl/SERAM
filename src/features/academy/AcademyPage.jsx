import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Download, Compass, Award, User, Clock, ArrowRight,
  Search, GraduationCap, ShieldCheck, Sparkles, X, Layers,
  RotateCcw, Building2, PhoneCall, Film, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  useSeramSeo,
  ZenzeHeroSection,
  ZenzePillarsSection,
  ZenzeTechOverviewSection,
  ZenzeBottomCtaBanner
} from '../../components/shared/ZenzeShowcaseSections';
import MotionFrame from '../../components/ui/MotionFrame';
import '../../styles/academy-cinematic.css';

const TICKET_TABS = [
  {
    id: 'todos',
    label: 'Todos los Recursos',
    badge: 'Catálogo',
    desc: 'Catálogo integral: cursos en video HD, e-books y entregables técnicos',
    icon: Layers,
    activeClass: 'border-[#00e03c] bg-[#00e03c]/15 text-white shadow-[0_0_20px_rgba(0,224,60,0.25)]',
    badgeClass: 'bg-[#00e03c]/20 text-[#00e03c] border-[#00e03c]/40'
  },
  {
    id: 'gratis',
    label: 'Gratis (Lead Magnets)',
    badge: 'Bs. 0',
    desc: 'E-books, carimbos, planos y guías descargables en PDF - Bs. 0',
    icon: Download,
    activeClass: 'border-emerald-500 bg-emerald-500/15 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  {
    id: 'low_ticket',
    label: 'Low Ticket',
    badge: 'Bs. 20 - 60',
    desc: 'Manuales, talleres prácticos SIG y cursos introductorios rápidos',
    icon: BookOpen,
    activeClass: 'border-sky-500 bg-sky-500/15 text-white shadow-[0_0_20px_rgba(14,165,233,0.25)]',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  },
  {
    id: 'mid_ticket',
    label: 'Mid Ticket',
    badge: 'Bs. 80 - 200',
    desc: 'Programas técnicos especializados y metodologías aplicables',
    icon: GraduationCap,
    activeClass: 'border-amber-500 bg-amber-500/15 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    id: 'high_ticket',
    label: 'High Ticket (Élite)',
    badge: 'Bs. 220+',
    desc: 'Programas integrales de alta especialidad, auditoría y mentoría',
    icon: Award,
    activeClass: 'border-violet-500 bg-violet-500/15 text-white shadow-[0_0_20px_rgba(139,92,246,0.25)]',
    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40'
  }
];

const TRACKS = [
  'Todas',
  'Geomática & SIG',
  'Trámites & Licencias',
  'Derecho & Normativa',
  'Formatos & Carimbos',
  'Gestión de Residuos'
];

const LEVELS = [
  'Todos',
  'Básico / Fundamentos',
  'Intermedio / Aplicado',
  'Avanzado / Especialista'
];

const FORMATS = [
  { id: 'all', label: 'Todos los formatos' },
  { id: 'video', label: 'Cursos en Video' },
  { id: 'pdf', label: 'E-books & Documentos PDF' }
];

const renderFormattedText = (text) => {
  if (!text) return '';
  const parts = String(text).split(/(\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <span key={index} className="text-[#00e03c] font-bold">{part.slice(1, -1)}</span>;
    }
    return part;
  });
};

export default function AcademyPage() {
  const navigate = useNavigate();
  const { courses, openChatbot } = useApp();

  const [selectedTicket, setSelectedTicket] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('Todas');
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [selectedFormat, setSelectedFormat] = useState('all');

  useSeramSeo({
    title: 'Cursos de QGIS, Ley 1333 y Licencias FNCA',
    description: 'Cursos técnicos con certificación QR en Bolivia. Domina Geomática QGIS, Licencias Ambientales FNCA, Ley 1333 y gestión de residuos con ingenieros SERAM.',
    keywords: 'cursos SIG QGIS Bolivia, curso licencia ambiental FNCA, capacitacion Ley 1333, carimbos WGS84, SERAM Academy Crehana',
    canonicalUrl: 'https://seram.bo/academy',
    ogImage: '/assets/3d-backend/bg_academy.webp',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'SERAM Academy',
      url: 'https://seram.bo/academy',
      description: 'Campus Virtual Técnico Especializado en Ingeniería Ambiental, QGIS y Licencias en Bolivia',
      provider: {
        '@type': 'Organization',
        name: 'SERAM SRL',
        url: 'https://seram.bo'
      }
    }
  });

  // Mostrar solo cursos publicados (sincronizado con Odoo eLearning en PartnerDashboard)
  const publishedCourses = useMemo(() => {
    return (courses || []).filter(c => c && c.status !== 'Borrador');
  }, [courses]);

  const scrollToCatalog = (trackName = null) => {
    if (trackName) setSelectedTrack(trackName);
    const el = document.getElementById('academy-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const academyPillars = [
    {
      id: 'sig',
      icon: Compass,
      iconBgClass: 'bg-[#029907]/25 text-[#00e03c] border border-[#00e03c]/35',
      title: 'Geomática & SIG Aplicado',
      desc: 'QGIS, delimitación de cuencas hidrográficas, ortofotos y cartografía oficial en datum WGS-84 sin observaciones.',
      actionLabel: 'Ver Ruta SIG',
      onAction: () => scrollToCatalog('Geomática & SIG')
    },
    {
      id: 'fnca',
      icon: Layers,
      iconBgClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/35',
      title: 'Trámites & Licencias FNCA',
      desc: 'Categorización ambiental Cat. 1 a 4, matrices PPM-PASA y expedientes ante AACD y AACN bajo D.S. 3549.',
      actionLabel: 'Ver Ruta Trámites',
      onAction: () => scrollToCatalog('Trámites & Licencias')
    },
    {
      id: 'legal',
      icon: ShieldCheck,
      iconBgClass: 'bg-amber-500/20 text-amber-400 border border-amber-400/35',
      title: 'Derecho & Auditoría Legal',
      desc: 'Compendios interpretados Ley 1333, atención a conminatorias, clausuras preventivas y defensa técnica.',
      actionLabel: 'Ver Ruta Legal',
      onAction: () => scrollToCatalog('Derecho & Normativa')
    },
    {
      id: 'corp',
      icon: Building2,
      iconBgClass: 'bg-sky-500/20 text-sky-400 border border-sky-400/35',
      title: 'Talleres In-Company B2B',
      desc: 'Programas cerrados a medida para equipos de ingeniería, consultores RENCA, plantas industriales y gobiernos locales.',
      actionLabel: 'Cotizar Taller',
      onAction: () => openChatbot('q2_training')
    }
  ];

  const getTicketCounts = useMemo(() => {
    const counts = { todos: publishedCourses.length, gratis: 0, low_ticket: 0, mid_ticket: 0, high_ticket: 0 };
    publishedCourses.forEach(c => {
      if (counts[c.type] !== undefined) counts[c.type]++;
    });
    return counts;
  }, [publishedCourses]);

  const filteredCourses = useMemo(() => {
    return publishedCourses.filter(c => {
      if (selectedTicket !== 'todos' && c.type !== selectedTicket) return false;
      if (selectedTrack !== 'Todas' && c.track !== selectedTrack) return false;
      if (selectedLevel !== 'Todos' && c.level !== selectedLevel) return false;
      if (selectedFormat === 'video' && (c.format === 'pdf' || c.hasVideo === false)) return false;
      if (selectedFormat === 'pdf' && c.format !== 'pdf' && c.hasVideo !== false) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const hay = `${c.title} ${c.desc} ${c.instructor} ${c.track}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [publishedCourses, selectedTicket, selectedTrack, selectedLevel, selectedFormat, searchQuery]);

  const activeTicketData = TICKET_TABS.find(t => t.id === selectedTicket) || TICKET_TABS[0];

  const getTicketBadge = (type, price) => {
    switch (type) {
      case 'gratis':
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">GRATIS</span>;
      case 'low_ticket':
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">Bs. {price}</span>;
      case 'mid_ticket':
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">Bs. {price}</span>;
      case 'high_ticket':
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">Bs. {price} · ÉLITE</span>;
      default:
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">Bs. {price}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inner-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20"
    >
      {/* ── SECCIÓN 1: HERO ARQUITECTÓNICO DESACOPLADO SERAM ACADEMY ── */}
      <ZenzeHeroSection
        titleWhite="Capacitación Ambiental y SIG."
        titleAccent="Elevando Tu Nivel Profesional."
        accentColorClass="text-emerald-400"
        buttonAccentClass="bg-[#00e03c] hover:bg-white text-slate-950 shadow-[0_0_25px_rgba(0,224,60,0.3)]"
        backgroundImage="/assets/3d-backend/bg_academy.webp"
        backgroundAlt="Campus Virtual SERAM Academy"
        description="Domina Sistemas de Información Geográfica (QGIS), Ley 1333, Fichas FNCA y matrices PPM-PASA con clases prácticas en video HD, apuntes interactivos y certificados verificables por QR."
        primaryCtaLabel="Asesoría de Capacitación"
        onPrimaryCta={() => openChatbot('q2_training')}
        secondaryCtaLabel="Explorar Catálogo Completo"
        onSecondaryCta={() => scrollToCatalog()}
        livePanelTitle="Métricas del Campus en Vivo"
        livePanelCtaLabel="Consultar Rutas →"
        onLivePanelCta={() => openChatbot('q2_training')}
        liveMetrics={[
          { label: 'Aplicabilidad Práctica en Proyectos', value: '94%', percent: 94, barClass: 'bg-emerald-400' },
          { label: 'Dominio SIG & Cartografía WGS-84', value: '89%', percent: 89, barClass: 'bg-sky-400' },
          { label: 'Validez de Certificación QR Verificada', value: '100%', percent: 100, barClass: 'bg-amber-400' }
        ]}
        kpis={[
          { icon: User, value: '500+', label: 'Profesionales Capacitados' },
          { icon: Film, value: '120+', label: 'Horas HD y Entregables' },
          { icon: Award, value: '98%', label: 'Satisfacción Técnica' },
          { icon: ShieldCheck, value: '100%', label: 'Normativa 2026 Vigente' }
        ]}
      />

      {/* ── SECCIÓN 2: NUESTRAS RUTAS DE ESPECIALIZACIÓN (4 TARJETAS ARQUITECTÓNICAS) ── */}
      <ZenzePillarsSection
        eyebrow="NUESTRAS RUTAS DE APRENDIZAJE"
        title="Formación Inteligente para Cada Especialista"
        subtitle="Elige entre e-books gratuitos descargables, talleres intensivos en QGIS y programas ejecutivos de auditoría o capacitación in-company para equipos completos."
        accentColorClass="text-emerald-400"
        cards={academyPillars}
      />

      {/* ── SECCIÓN 3: NUESTRA METODOLOGÍA (LEARNING OVERVIEW CREHANA + ODOO) ── */}
      <ZenzeTechOverviewSection
        eyebrow="NUESTRA METODOLOGÍA"
        title="Práctica. Normativa. SIG. Mejor Juntos."
        description="Nuestro ecosistema educativo combina el reproductor interactivo estilo Crehana con plantillas reales de ingeniería boliviana para que apliques cada lección desde el día uno."
        checks={[
          'Aula Virtual con notas por marca de tiempo y foro técnico',
          'Videos HD subidos directamente por ingenieros especialistas',
          'Descarga inmediata de carimbos DWG/DXF, shapefiles y matrices Excel',
          'Certificado digital descargable con validación QR y folio único'
        ]}
        ctaLabel="Solicitar Capacitación Corporativa"
        onCtaClick={() => openChatbot('q2_training')}
        accentColorClass="text-emerald-400"
        overviewTitle="SERAM Academy Campus Overview"
        statsCol={{ label1: 'Programas Activos', val1: String(publishedCourses.length), label2: 'Entregables PDF', val2: String(publishedCourses.filter(c => c.format === 'pdf').length || 2) }}
        trendCard={{ label: 'Tasa Finalización', value: '91%', sub: 'metodología Crehana' }}
        donutCard={{ label: 'Calificación Alumnos', percent: 96, statusText: '4.9 ★', leg1: 'Aprobados', leg2: 'En Curso' }}
        recentActivities={[
          { title: 'Curso QGIS Publicado', time: 'Sincronizado Odoo' },
          { title: 'Guía Ley 1333 Actualizada', time: 'Edición 2026' },
          { title: 'Certificado QR Generado', time: 'Hace 1 hora' }
        ]}
        mapImage="/assets/covers/cover_qgis_basico.png"
        mapPins={[
          { top: '38%', left: '28%', label: 'Módulo 1 · Cartografía Base WGS-84', stat: 'Video HD' },
          { top: '52%', left: '55%', label: 'Módulo 2 · Cuencas & FNCA Práctico', stat: 'Plantillas' },
          { top: '44%', left: '76%', label: 'Evaluación Final & Certificado QR', stat: 'Verificado' }
        ]}
        weatherWidget={{
          temp: '24/7',
          condition: 'Acceso Campus Virtual',
          metric1: 'Video HD',
          metric2: 'PDF Dossier',
          metric3: 'Cert. QR'
        }}
      />

      {/* ── CATÁLOGO HÍBRIDO DINÁMICO DE CURSOS CON MOTION FRAME ACADEMY ── */}
      <MotionFrame variant="academy" className="p-6 sm:p-8 bg-[#040905]/70">
        <section id="academy-catalog" className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00e03c] font-tech block">
                CATÁLOGO OFICIAL EN VIVO
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 font-display">
                Cursos, Talleres y Dossiers Descargables
              </h2>
            </div>

            <button
              type="button"
              onClick={() => openChatbot('q2_training')}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-[#00e03c] text-slate-200 hover:text-slate-950 border border-white/10 text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00e03c]" /> ¿No sabes cuál elegir? Te orientamos
            </button>
          </div>

          {/* Pestañas por Nivel de Ticket */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {TICKET_TABS.map((tab) => {
              const IconComp = tab.icon;
              const isSelected = selectedTicket === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTicket(tab.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? tab.activeClass
                      : 'bg-[#0b150d]/80 border-white/10 hover:border-white/25 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-2 rounded-lg border ${isSelected ? tab.badgeClass : 'bg-white/5 border-white/10 text-slate-400'}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-slate-400 font-mono">
                      {getTicketCounts[tab.id]}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-white leading-tight">{tab.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tab.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Barra de Búsqueda + Filtros */}
          <div className="neuform-card rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar curso, norma (Ley 1333, FNCA), QGIS..."
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00e03c]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="lg:col-span-3">
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#00e03c]"
                >
                  {TRACKS.map(t => <option key={t} value={t}>Ruta: {t}</option>)}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#00e03c]"
                >
                  {LEVELS.map(l => <option key={l} value={l}>Nivel: {l}</option>)}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-[#00e03c]"
                >
                  {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
              <span>{activeTicketData.desc}</span>
              {(selectedTicket !== 'todos' || selectedTrack !== 'Todas' || selectedLevel !== 'Todos' || selectedFormat !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTicket('todos');
                    setSelectedTrack('Todas');
                    setSelectedLevel('Todos');
                    setSelectedFormat('all');
                    setSearchQuery('');
                  }}
                  className="text-[#00e03c] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Grid de Cursos */}
          {filteredCourses.length === 0 ? (
            <div className="neuform-card rounded-2xl p-12 text-center space-y-3 border border-white/10">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-black text-white">No encontramos cursos con esa combinación de filtros</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedTicket('todos');
                  setSelectedTrack('Todas');
                  setSelectedLevel('Todos');
                  setSelectedFormat('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs uppercase cursor-pointer"
              >
                Ver Todo el Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, idx) => {
                const isPdf = course.format === 'pdf' || course.hasVideo === false;
                const lessonsCount = (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
                return (
                  <motion.article
                    key={course.id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                    onClick={() => navigate(`/academy/course/${course.id}`)}
                    className="group neuform-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#00e03c]/50 flex flex-col justify-between transition-all cursor-pointer shadow-xl"
                  >
                    <div>
                      {/* Carátula con lazy loading */}
                      <div className="relative h-48 overflow-hidden bg-slate-950">
                        <img
                          src={course.image || '/assets/covers/cover_taller_fichas.png'}
                          alt={String(course.title || '').replace(/\*/g, '')}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#081209] via-transparent to-black/35" />

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          {getTicketBadge(course.type, course.price)}
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/75 text-slate-300 font-mono flex items-center gap-1">
                            {isPdf ? <FileText className="w-3 h-3 text-emerald-400" /> : <Film className="w-3 h-3 text-[#00e03c]" />}
                            {isPdf ? 'Dossier PDF' : `${lessonsCount || 5} Clases`}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold text-slate-300">
                          <span className="truncate">{course.track || 'Ruta Técnica'}</span>
                          <span className="flex items-center gap-1 text-slate-200 flex-shrink-0">
                            <Clock className="w-3 h-3 text-[#00e03c]" /> {course.duration}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <h3 className="text-base font-black text-white group-hover:text-[#00e03c] transition-colors leading-snug">
                          <Link to={`/academy/course/${course.id}`} className="hover:underline">
                            {renderFormattedText(course.title)}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {course.desc}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 truncate">
                        <span className="text-slate-200 font-semibold block truncate">{course.instructor}</span>
                        <span>{course.students || 0} estudiantes</span>
                      </div>

                      <Link
                        to={`/academy/course/${course.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 rounded-xl bg-[#00e03c] hover:bg-white text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
                        aria-label={`Acceder al curso ${String(course.title || '').replace(/\*/g, '')}`}
                      >
                        <span>{isPdf ? 'Abrir PDF' : 'Entrar al Aula'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Bloque In-Company Corporativo conectado al Chatbot */}
          <div className="neuform-card rounded-2xl p-6 sm:p-8 border border-[#00e03c]/25 bg-gradient-to-r from-[#07150a] via-[#0b1b0e] to-[#07150a] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00e03c] font-tech flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> CAPACITACIÓN IN-COMPANY B2B
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                ¿Necesitas entrenar a todo tu equipo de ingeniería o gestión ambiental?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Preparamos programas corporativos presenciales o en línea en QGIS, Ley 1333, Seguridad Industrial y Residuos Ley 755 con certificación oficial SERAM.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openChatbot('q2_training')}
              className="px-6 py-3.5 rounded-full bg-[#00e03c] hover:bg-white text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 flex-shrink-0 shadow-lg shadow-[#00e03c]/20 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" /> Cotizar Taller Corporativo
            </button>
          </div>
        </section>
      </MotionFrame>

      {/* ── SECCIÓN 4: BANNER HORIZONTAL INFERIOR ZENZE ── */}
      <ZenzeBottomCtaBanner
        image="/assets/covers/cover_mentoria_consultoria.png"
        imageAlt="Mentoría y Certificación SERAM Academy"
        title="Domina la normativa y la cartografía SIG hoy."
        subtitle="Accede a mentorías técnicas, descargas de plantillas oficiales y orientación directa sobre la ruta ideal para tu perfil profesional."
        trustLabel="Más de 500 ingenieros y consultores formados en SERAM Academy"
        ctaLabel="Consultar en Asistente"
        onCtaClick={() => openChatbot('q2_training')}
      />
    </motion.div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Download, Compass, Award, Clock, ArrowRight,
  Search, GraduationCap, ShieldCheck, Sparkles, X, Layers,
  RotateCcw, Building2, PhoneCall, Film, FileText
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

const TICKET_TABS = [
  {
    id: 'todos',
    label: 'Todos los Recursos',
    badge: 'Catálogo',
    desc: 'Catálogo integral: cursos en video HD, e-books y entregables técnicos',
    icon: Layers
  },
  {
    id: 'gratis',
    label: 'Gratis (Lead Magnets)',
    badge: 'Bs. 0',
    desc: 'E-books, carimbos, planos y guías descargables en PDF - Bs. 0',
    icon: Download
  },
  {
    id: 'low_ticket',
    label: 'Low Ticket',
    badge: 'Bs. 20 - 60',
    desc: 'Manuales, guías prácticas y cursos introductorios rápidos',
    icon: BookOpen
  },
  {
    id: 'mid_ticket',
    label: 'Mid Ticket',
    badge: 'Bs. 80 - 200',
    desc: 'Programas técnicos aplicados y metodologías de gestión',
    icon: GraduationCap
  },
  {
    id: 'high_ticket',
    label: 'High Ticket',
    badge: 'Bs. 220+',
    desc: 'Programas integrales de evaluación ambiental, regularización y mentoría',
    icon: Award
  }
];

const TRACKS = [
  'Todas',
  'Trámites & Licencias',
  'Derecho & Normativa',
  'Formatos & Carimbos',
  'Gestión de Residuos'
];

const LEVELS = [
  'Todos',
  'Básico / Fundamentos',
  'Intermedio / Aplicado',
  'Avanzado / Profesional'
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
      return <span key={index} className="text-[#126c0f] font-bold">{part.slice(1, -1)}</span>;
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
    title: 'Cursos de Ley 1333, Gestión de Residuos y Licencias FNCA',
    description: 'Cursos técnicos con certificación QR en Bolivia. Aprende normativa ambiental, Licencias Ambientales FNCA, Ley 1333 y gestión de residuos con el equipo de SERAM.',
    keywords: 'cursos Ley 1333 Bolivia, curso licencia ambiental FNCA, capacitacion ambiental, gestion residuos Ley 755, SERAM Academy',
    canonicalUrl: 'https://seram.bo/academy',
    ogImage: '/assets/3d-backend/bg_academy.webp',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'SERAM Academy',
      url: 'https://seram.bo/academy',
      description: 'Campus Virtual Técnico en Normativa Ambiental, Gestión de Residuos y Licencias en Bolivia',
      provider: {
        '@type': 'Organization',
        name: 'SERAM SRL',
        url: 'https://seram.bo'
      }
    }
  });

  // Mostrar solo cursos publicados (sincronizado con Odoo eLearning en PartnerDashboard)
  const publishedCourses = useMemo(() => {
    return (courses || []).filter((c) => c && c.status !== 'Borrador');
  }, [courses]);

  const scrollToCatalog = (trackName = null) => {
    if (trackName) setSelectedTrack(trackName);
    const el = document.getElementById('academy-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const academyPillars = [
    {
      id: 'residuos',
      icon: Compass,
      title: 'Gestión de Residuos & Ley 755',
      desc: 'Clasificación, manifiestos de transporte, acopio, economía circular y manejo integral de residuos sólidos bajo normativa vigente.',
      actionLabel: 'Ver Ruta Residuos',
      onAction: () => scrollToCatalog('Gestión de Residuos')
    },
    {
      id: 'fnca',
      icon: Layers,
      title: 'Trámites & Licencias FNCA',
      desc: 'Categorización ambiental Cat. 1 a 4, matrices PPM-PASA y expedientes técnicos ante AACD y AACN bajo D.S. 3549.',
      actionLabel: 'Ver Ruta Trámites',
      onAction: () => scrollToCatalog('Trámites & Licencias')
    },
    {
      id: 'legal',
      icon: ShieldCheck,
      title: 'Derecho, Bioseguridad & Normativa',
      desc: 'Compendios interpretados Ley 1333, gestión sostenible, bioseguridad operativa y respuesta técnica a conminatorias.',
      actionLabel: 'Ver Ruta Legal',
      onAction: () => scrollToCatalog('Derecho & Normativa')
    }
  ];

  const getTicketCounts = useMemo(() => {
    const counts = { todos: publishedCourses.length, gratis: 0, low_ticket: 0, mid_ticket: 0, high_ticket: 0 };
    publishedCourses.forEach((c) => {
      if (counts[c.type] !== undefined) counts[c.type]++;
    });
    return counts;
  }, [publishedCourses]);

  const filteredCourses = useMemo(() => {
    return publishedCourses.filter((c) => {
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

  const activeTicketData = TICKET_TABS.find((t) => t.id === selectedTicket) || TICKET_TABS[0];

  const getTicketBadge = (type, price) => {
    switch (type) {
      case 'gratis':
        return <span className="text-[10px] font-bold px-2.5 py-1 bg-[#126c0f] text-white uppercase tracking-wider">GRATIS</span>;
      case 'low_ticket':
        return <span className="text-[10px] font-bold px-2.5 py-1 bg-white text-[#126c0f] border border-[#126c0f]">Bs. {price}</span>;
      case 'mid_ticket':
        return <span className="text-[10px] font-bold px-2.5 py-1 bg-white text-[#1a1c1c] border border-[#bdcbb4]">Bs. {price}</span>;
      case 'high_ticket':
        return <span className="text-[10px] font-bold px-2.5 py-1 bg-[#1a1c1c] text-white">Bs. {price} · INTEGRAL</span>;
      default:
        return <span className="text-[10px] font-bold px-2.5 py-1 bg-white text-[#1a1c1c]">Bs. {price}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="inner-page bg-[#f9f9f9] text-[#1a1c1c] min-h-screen"
    >
      {/* Franja superior sólida detrás del Navbar fijo para mantener contraste */}
      <div className="h-20 -mt-20 bg-[#071109]" aria-hidden="true" />

      {/* 1. HERO EDITORIAL */}
      <EditorialHeroSection
        kicker="CAMPUS VIRTUAL · SERAM ACADEMY"
        title="Capacitación Ambiental Práctica"
        titleAccent="para fortalecer tu gestión."
        description="Aprende normativa Ley 1333, Formularios FNCA, gestión sostenible, economía circular y bioseguridad con clases prácticas en video HD, apuntes y certificados verificables por QR."
        backgroundImage="/assets/3d-backend/bg_academy.webp"
        backgroundAlt="Campus Virtual SERAM Academy en Bolivia"
        primaryCtaLabel="Asesoría de Capacitación"
        onPrimaryCta={() => openChatbot('q2_training')}
        secondaryCtaLabel="Explorar Catálogo"
        onSecondaryCta={() => scrollToCatalog()}
      />

      {/* 2. PILARES EDITORIALES */}
      <EditorialPillarsSection
        title="Formación Práctica para Cada Profesional"
        subtitle="Elige entre guías gratuitas descargables, talleres normativos en economía circular y bioseguridad, o programas de capacitación in-company."
        cards={academyPillars}
      />

      {/* 3. BENTO METODOLOGÍA */}
      <EditorialBentoSection
        kicker="METODOLOGÍA DEL CAMPUS"
        title="Práctica, normativa y gestión aplicadas a tu trabajo diario."
        description="Nuestro campus virtual combina reproductor interactivo, plantillas de gestión ambiental boliviana y evaluación continua con certificado digital verificable por QR."
        ctaLabel="Solicitar capacitación corporativa"
        onCtaClick={() => openChatbot('q2_training')}
        stats={[
          { value: String(publishedCourses.length || 4), label: 'Programas activos en catálogo' },
          { value: 'QR', label: 'Certificación digital verificable' }
        ]}
        image="/assets/covers/cover_ebook_ley1333.png"
        imageAlt="Material Técnico SERAM Academy Ley 1333 y Ley 755"
        imageCaptionTitle="Normativa Vigente 2026"
        imageCaptionText="Contenidos preparados por el equipo técnico de SERAM SRL en Bolivia."
      />

      {/* 4. SHOWCASE AULA VIRTUAL */}
      <EditorialShowcaseSection
        title="Aula Virtual y Entregables Descargables"
        subtitle="Estudia a tu ritmo con lecciones en video HD, notas por marca de tiempo y documentos PDF listos para aplicar."
        actionLabel="Consultar rutas de aprendizaje"
        onAction={() => openChatbot('q2_training')}
        featuredImage="/assets/covers/cover_mentoria_consultoria.png"
        featuredAlt="Aula Virtual Interactiva SERAM Academy"
        featuredKicker="EXPERIENCIA DE APRENDIZAJE"
        featuredTitle="Clases en Video HD, Matrices y Certificación QR"
        items={[
          {
            title: 'Notas por Marca de Tiempo',
            desc: 'Guarda apuntes directamente vinculados al minuto exacto de cada clase dentro del reproductor.'
          },
          {
            title: 'Plantillas y Formatos Oficiales',
            desc: 'Descarga guías PDF, matrices de seguimiento ambiental y carimbos técnicos de referencia.'
          },
          {
            title: 'Programas In-Company B2B',
            desc: 'Capacitación cerrada para equipos de ingeniería, plantas industriales y gobiernos locales.'
          }
        ]}
      />

      {/* CATÁLOGO DINÁMICO DE CURSOS (ESTILO EDITORIAL CLARO) */}
      <section id="academy-catalog" className="py-16 md:py-24 bg-white border-b border-[#bdcbb4]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#126c0f]">
                CATÁLOGO OFICIAL EN VIVO
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1a1c1c] mt-2 font-display">
                Cursos, Talleres y Documentos Descargables
              </h2>
            </div>

            <button
              type="button"
              onClick={() => openChatbot('q2_training')}
              className="px-5 py-2.5 border-2 border-[#126c0f] text-[#126c0f] hover:bg-[#126c0f] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>¿No sabes cuál elegir? Te orientamos</span>
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
                  className={`p-4 border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-[#126c0f] bg-[#126c0f] text-white'
                      : 'bg-[#f9f9f9] border-[#bdcbb4] hover:border-[#126c0f] text-[#1a1c1c]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-2 ${isSelected ? 'bg-white/15 text-white' : 'bg-[#126c0f]/10 text-[#126c0f]'}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-bold font-mono ${isSelected ? 'text-white/90' : 'text-[#3e4a39]'}`}>
                      {getTicketCounts[tab.id]}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{tab.label}</div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#3e4a39]'}`}>
                      {tab.badge}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Barra de Búsqueda + Filtros */}
          <div className="bg-[#f9f9f9] p-5 border border-[#bdcbb4] space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-[#3e4a39] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar curso, norma (Ley 1333, FNCA), residuos..."
                  className="w-full bg-white border border-[#bdcbb4] pl-10 pr-8 py-2.5 text-xs text-[#1a1c1c] placeholder-[#3e4a39]/60 outline-none focus:border-[#126c0f]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3e4a39] hover:text-[#1a1c1c] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="lg:col-span-3">
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full bg-white border border-[#bdcbb4] px-3 py-2.5 text-xs text-[#1a1c1c] outline-none focus:border-[#126c0f]"
                >
                  {TRACKS.map((t) => <option key={t} value={t}>Ruta: {t}</option>)}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-white border border-[#bdcbb4] px-3 py-2.5 text-xs text-[#1a1c1c] outline-none focus:border-[#126c0f]"
                >
                  {LEVELS.map((l) => <option key={l} value={l}>Nivel: {l}</option>)}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-white border border-[#bdcbb4] px-3 py-2.5 text-xs text-[#1a1c1c] outline-none focus:border-[#126c0f]"
                >
                  {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#3e4a39] pt-1">
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
                  className="text-[#126c0f] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Grid de Cursos */}
          {filteredCourses.length === 0 ? (
            <div className="bg-[#f9f9f9] p-12 text-center space-y-4 border border-[#bdcbb4]">
              <BookOpen className="w-10 h-10 text-[#126c0f] mx-auto" />
              <h3 className="text-lg font-bold text-[#1a1c1c]">
                No encontramos cursos con esa combinación de filtros
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedTicket('todos');
                  setSelectedTrack('Todas');
                  setSelectedLevel('Todos');
                  setSelectedFormat('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-[#126c0f] hover:bg-[#029907] text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Ver Todo el Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className="group bg-white border border-[#bdcbb4] hover:border-[#126c0f] flex flex-col justify-between transition-all cursor-pointer"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-[#1a1c1c]">
                        <img
                          src={course.image || '/assets/covers/cover_ebook_ley1333.png'}
                          alt={String(course.title || '').replace(/\*/g, '')}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          {getTicketBadge(course.type, course.price)}
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-bold px-2.5 py-1 bg-black/75 text-white flex items-center gap-1">
                            {isPdf ? <FileText className="w-3 h-3 text-[#00e03c]" /> : <Film className="w-3 h-3 text-[#00e03c]" />}
                            {isPdf ? 'Documento PDF' : `${lessonsCount || 5} Clases`}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white">
                          <span className="truncate">{course.track || 'Ruta Técnica'}</span>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3.5 h-3.5 text-[#00e03c]" /> {course.duration}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-2.5">
                        <h3 className="text-lg font-bold text-[#1a1c1c] group-hover:text-[#126c0f] transition-colors leading-snug font-display">
                          <Link to={`/academy/course/${course.id}`} className="hover:underline">
                            {renderFormattedText(course.title)}
                          </Link>
                        </h3>
                        <p className="text-sm text-[#3e4a39] line-clamp-2 leading-relaxed">
                          {course.desc}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-4 border-t border-[#bdcbb4]/50 flex items-center justify-between gap-3">
                      <div className="text-xs text-[#3e4a39] truncate">
                        <span className="text-[#1a1c1c] font-bold block truncate">{course.instructor}</span>
                        <span>{course.students || 0} estudiantes</span>
                      </div>

                      <Link
                        to={`/academy/course/${course.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2.5 bg-[#126c0f] hover:bg-[#029907] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
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
          <div className="bg-[#126c0f] text-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> CAPACITACIÓN IN-COMPANY B2B
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display">
                ¿Necesitas entrenar a tu equipo de ingeniería o gestión ambiental?
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Preparamos programas corporativos presenciales o en línea en Ley 1333, Bioseguridad, Economía Circular y Gestión de Residuos Ley 755 con certificación oficial SERAM.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openChatbot('q2_training')}
              className="px-7 py-3.5 bg-white text-[#126c0f] hover:bg-[#eeeeee] font-bold text-xs uppercase tracking-wider flex items-center gap-2 flex-shrink-0 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" /> Cotizar Taller Corporativo
            </button>
          </div>
        </div>
      </section>

      {/* 5. CONECTEMOS */}
      <EditorialConnectSection
        title="Conectemos"
        subtitle="¿Tienes dudas sobre un curso, taller in-company o certificación QR? Escríbenos y te orientamos."
        interestOptions={[
          'Cursos de Normativa Ley 1333 & FNCA',
          'Gestión de Residuos Ley 755',
          'Economía Circular & Bioseguridad',
          'Taller In-Company para Empresas'
        ]}
        onConnectSubmit={() => openChatbot('q2_training')}
      />
    </motion.div>
  );
}

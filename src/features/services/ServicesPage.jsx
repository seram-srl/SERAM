import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Globe, FileText, Leaf, BookOpen,
  Map, Compass, Trash2, Activity, ChevronRight, ArrowUpRight, Shield, Award, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

// ── CUSTOM SEO HOOK ─────────────────────────────────────────────────────────
function useSEO({ title, description, keywords }) {
  useEffect(() => {
    document.title = title ? `${title} | SERAM` : "SERAM | Servicios Ambientales, Consultoría y Capacitación";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || '');

    let metaKey = document.querySelector('meta[name="keywords"]');
    if (!metaKey) {
      metaKey = document.createElement('meta');
      metaKey.setAttribute('name', 'keywords');
      document.head.appendChild(metaKey);
    }
    metaKey.setAttribute('content', keywords || '');
  }, [title, description, keywords]);
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const getIcon = (name) => {
  const icons = {
    Briefcase: <Briefcase className="w-5 h-5" />,
    Globe: <Globe className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    Leaf: <Leaf className="w-5 h-5" />,
    BookOpen: <BookOpen className="w-5 h-5" />,
    Map: <Map className="w-5 h-5" />,
    Compass: <Compass className="w-5 h-5" />,
    Trash2: <Trash2 className="w-5 h-5" />,
    Activity: <Activity className="w-5 h-5" />,
  };
  return icons[name] || <Briefcase className="w-5 h-5" />;
};

const getServiceColors = (line) => {
  if (line === 'Trámites Ambientales Express') {
    return {
      color: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'hover:border-emerald-500/30',
    };
  } else if (line === 'Ingeniería y Seguridad Industrial') {
    return {
      color: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'hover:border-blue-500/30',
    };
  } else {
    // Servicios GIS Ambientales y Sostenibilidad
    return {
      color: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'hover:border-purple-500/30',
    };
  }
};

const renderFormattedText = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <span key={index} className="italic">{part.slice(1, -1)}</span>;
    }
    return part;
  });
};

function ServiceCard({ service }) {
  const navigate = useNavigate();
  const colors = getServiceColors(service.line);

  return (
    <motion.div
      variants={cardVariants}
      onClick={() => navigate('/quote')}
      className="group neuform-card p-6 flex flex-col gap-5 cursor-none pointer-events-auto overflow-hidden bg-slate-50 border border-[#126c0f]/15 hover:border-[#126c0f]/35 hover:shadow-lg transition-all duration-300"
      data-cursor-text="COTIZAR"
    >
      {/* Decorative gradient fill */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.25rem]`} />

      {/* Icon + Tag */}
      <div className="relative flex items-center justify-between z-10">
        <div className="w-10 h-10 rounded-xl bg-white border border-[#126c0f]/20 flex items-center justify-center text-[#126c0f] group-hover:text-[#029907] group-hover:border-[#029907]/50 transition-all duration-300">
          {getIcon(service.icon)}
        </div>
        <span className="neuform-badge text-[#126c0f] border-[#126c0f]/20 bg-[#126c0f]/5 group-hover:text-[#029907] group-hover:border-[#029907]/30 transition-all duration-300">
          {service.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-2 flex-1">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#126c0f] group-hover:text-[#029907] transition-colors duration-300">{service.line}</span>
          <h3 className="font-bold text-[0.9rem] text-slate-900 group-hover:text-[#126c0f] transition-colors duration-200 leading-snug">
            {renderFormattedText(service.title)}
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium transition-colors duration-300">
          {renderFormattedText(service.desc || service.description)}
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 py-2.5 bg-[#126c0f] text-white hover:bg-[#029907] active:bg-[#029907] rounded-full text-[10px] font-bold transition-all duration-300 uppercase tracking-wider">
        Cotizar ahora <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-white" />
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { publicServices } = useApp();

  const serviceImages = [
    '/assets/3d-backend/licencias_fnca.png',             // Para Licencias (Mitigación y Blindaje)
    '/assets/3d-backend/gis_satellite_mapping.webp',     // Para Cartografía y SIG (Precisión Geodésica)
    '/assets/3d-backend/registro_rai_inspiration.png'    // Para RAI y Trámites Express (Certificaciones y Trámites Express)
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Auto-play unificado para imágenes y textos del Panel 2 (5 segundos)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % serviceImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % serviceImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
  };

  const serviceSolutions = [
    {
      focus: "Garantía de continuidad operativa frente a fiscalizaciones y auditorías oficiales",
      title: "Mitigación de Riesgos y Cumplimiento de la Ley 1333",
      desc: "Elaboramos e implementamos Instrumentos de Regulación de Alcance Particular (IRAP) y auditorías ambientales técnicas, asegurando la aprobación rápida y sin observaciones de licencias para proyectos de gran envergadura.",
      imageLabel: "INSTRUMENTOS IRAP · LICENCIAS AMBIENTALES · AUDITORÍAS TÉCNICAS"
    },
    {
      focus: "Prevención de rechazos y demoras por delimitación territorial imprecisa",
      title: "Precisión Cartográfica y Geodesia de Alta Fidelidad",
      desc: "Desarrollamos planos temáticos y georreferenciación bajo estándares geodésicos rigurosos, garantizando validaciones exitosas ante el INRA, la ABT y ministerios sectoriales.",
      imageLabel: "CARTOGRAFÍA GIS · PLANOS GEODÉSICOS · VALIDACIÓN INRA / ABT"
    },
    {
      focus: "Mitigación de demoras burocráticas en la obtención de registros regulatorios",
      title: "Optimización del Flujo de Expedientes y Gestiones Express",
      desc: "Aceleramos el flujo administrativo para la obtención del Registro Ambiental Industrial (RAI) y trámites mineros críticos, reduciendo los plazos del proyecto y asegurando el inicio de operaciones.",
      imageLabel: "REGISTRO AMBIENTAL INDUSTRIAL · RAI · CONCESIONES MINERAS"
    }
  ];

  const activePilar = serviceSolutions[currentIndex];

  // ── SEO & COPYWRITING INJECTION ──────────────────────────────────────────
  useSEO({
    title: "Servicios Ambientales y Consultoría de Cumplimiento",
    description: "Evita multas y paralizaciones. Consultoría ambiental especializada en Bolivia: Licencias FNCA, Registro Ambiental Industrial (RAI), EMAP y Cartografía SIG.",
    keywords: "servicios ambientales bolivia, consultoria ambiental, licencias fnca, registro rai, emap mineria, sistemas de informacion geografica, sig bolivia"
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Servicios Ambientales y Consultoría de Cumplimiento SERAM",
    "provider": {
      "@type": "LocalBusiness",
      "name": "SERAM",
      "image": "https://seram.bo/assets/brand/logo.png"
    },
    "areaServed": "BO",
    "description": "Estudios e instrumentos de regulación de alcance particular (IRAP), Licencias FNCA, Registro RAI, Prospección Minera EMAP y Sistemas de Información Geográfica (SIG) en Bolivia."
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="inner-page min-h-screen relative overflow-hidden bg-transparent"
    >
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* PANEL 1: HERO HEADER (Fondo Oscuro Cinemático) */}
      <div className="relative z-10 w-full pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Columna Izquierda: Hero Title y Descripciones */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex items-center gap-3">
                <span className="neuform-badge-accent neuform-badge font-semibold">
                  <Briefcase className="w-3 h-3" />
                  SERAM SERVICES · Catálogo Activo
                </span>
                <button
                  onClick={() => navigate('/')}
                  className="neuform-badge text-white/30 hover:text-white/60 transition-colors duration-200"
                >
                  ← Inicio
                </button>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-[0.95] tracking-tighter">
                Evita Clausuras y Multas:<br />
                <span className="text-[#029907]">Asegura Tu Cumplimiento</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed max-w-xl bg-black/45 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] font-light">
                El incumplimiento de la Ley 1333 puede paralizar tu industria u obra civil. Nuestro equipo de ingenieros peritos diseña y gestiona licencias, registros y cartografía oficial para blindar legal y técnicamente tu inversión en Bolivia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => navigate('/quote')}
                  className="neuform-btn-primary pointer-events-auto cursor-none"
                  data-cursor-text="COTIZAR"
                >
                  Iniciar Diagnóstico Gratis <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Columna Derecha: Floating Visual Device */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-slate-950 p-2 group hover:border-[#029907]/30 transition-all duration-300">
                <img 
                  src="/assets/3d-backend/gis_satellite_mapping.webp" 
                  alt="Ecosystem GIS Interface" 
                  className="w-full h-full object-cover rounded-xl opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-3.5 rounded-xl text-left">
                  <span className="text-[8px] font-bold text-[#029907] uppercase font-tech tracking-wider">TECNOLOGÍA DE MONITOREO</span>
                  <p className="text-[10px] text-slate-300 leading-tight mt-1 font-light">Suite integrada con precisión de nivel geodésico y mapeo satelital.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* PANEL 2: NUESTRO MARCO DE TRABAJO (Fondo Blanco - Slider Sincronizado con Textos) */}
      <div className="w-full bg-white text-slate-900 border-y border-slate-200 py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Columna Izquierda: Slider sincronizado con el texto */}
            <div className="lg:col-span-6 flex justify-center order-last lg:order-first">
              <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden border border-[#126c0f]/20 shadow-xl bg-slate-50 group/slider">
                {/* Carrusel de Imágenes */}
                <div className="w-full h-full relative">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentIndex}
                      src={serviceImages[currentIndex]}
                      alt="Servicio Ambiental SERAM"
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
                    />
                  </AnimatePresence>
                  
                  {/* Overlay gradiente suave */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* HUD Frame decorativo */}
                  <div className="absolute inset-6 border border-[#126c0f]/20 pointer-events-none rounded-xl">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#126c0f] shadow-[0_0_4px_rgba(18,108,15,0.4)]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#126c0f] shadow-[0_0_4px_rgba(18,108,15,0.4)]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#126c0f] shadow-[0_0_4px_rgba(18,108,15,0.4)]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#126c0f] shadow-[0_0_4px_rgba(18,108,15,0.4)]" />
                  </div>

                  {/* Label de contexto sobre la imagen (sincronizado con el texto) */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute bottom-4 left-5 right-5"
                    >
                      <span className="text-[8px] font-bold text-[#4ade80] uppercase tracking-widest font-tech block drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {activePilar.imageLabel}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Controles de Navegación del Slider */}
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#126c0f] text-white flex items-center justify-center border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-auto"
                    aria-label="Imagen anterior"
                  >
                    ←
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#126c0f] text-white flex items-center justify-center border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-auto"
                    aria-label="Siguiente imagen"
                  >
                    →
                  </button>

                  {/* Indicador de imagen activa (dots) */}
                  <div className="absolute bottom-4 right-5 flex gap-1.5 z-10">
                    {serviceImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${idx === currentIndex ? 'w-5 bg-[#029907]' : 'w-1.5 bg-white/40'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Nuestro Marco de Trabajo + Slideshow Rotativo de Soluciones Técnicas */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div>
                <p className="text-[10px] text-[#126c0f] tracking-[0.25em] font-extrabold uppercase font-tech">NUESTRO MARCO DE TRABAJO</p>
                <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-1">Garantía de Continuidad y Cumplimiento Normativo</h2>
              </div>
              
              <div className="bg-slate-50 border border-slate-200/60 p-8 rounded-3xl min-h-[240px] flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[4px] h-full bg-[#126c0f]" />
                
                {/* Animación de rotación de texto */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#029907] font-tech block">
                    FOCO DE PREVENCIÓN TÉCNICA:
                  </span>
                  <h4 className="text-sm font-bold text-[#126c0f] uppercase tracking-wide leading-tight flex items-center gap-1.5">
                    🛡️ {activePilar.focus}
                  </h4>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                      {activePilar.title}
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {activePilar.desc}
                    </p>
                  </div>
                </motion.div>
                
                {/* Indicadores visuales de posición (dots) */}
                <div className="flex gap-2 justify-end mt-4 pt-2">
                  {serviceImages.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-[#126c0f]' : 'w-1.5 bg-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* PANEL 3: BAR DE MÉTRICAS DE IMPACTO — Fondo Negro, Datos Alarmánticos Reales */}
      <div className="w-full bg-[#030a04] text-white border-y border-[#126c0f]/20 py-14 relative z-20 overflow-hidden">
        {/* Fondo con grid sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(2,153,7,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(2,153,7,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
            className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#126c0f]/20"
          >
            {[
              {
                num: '85%',
                numColor: 'text-[#4ade80]',
                label: 'Cooperativas Mineras Sin Licencia',
                desc: 'Operan sin licencia ambiental en Bolivia \u2014 Fuente: Informes CEDIB / Opinion.com.bo',
                icon: '⚠️',
              },
              {
                num: '+25%',
                numColor: 'text-[#facc15]',
                label: 'del Ingreso Anual en Riesgo',
                desc: 'Costo de remediación post-incumplimiento para empresas en América Latina \u2014 Fuente: Global ESG Report 2024',
                icon: '📉',
              },
              {
                num: '30%+',
                numColor: 'text-[#f87171]',
                label: 'Caída en Valor Accionario',
                desc: 'Registrado por empresas tras violaciones regulatorias ambientales verificadas \u2014 Fuente: Market Impact Studies',
                icon: '🔴',
              },
              {
                num: '<13%',
                numColor: 'text-[#60a5fa]',
                label: 'de PYMEs con Plan de Cumplimiento',
                desc: 'Han adoptado una estrategia formal de sostenibilidad en América Latina \u2014 Fuente: REDLAFICA 2024',
                icon: '📊',
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
                }}
                className={`flex flex-col gap-2 px-6 py-6 md:py-0 text-left ${idx > 0 ? 'md:pl-8' : ''}`}
              >
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-4xl sm:text-5xl font-black tracking-tighter leading-none ${stat.numColor}`}>
                  {stat.num}
                </span>
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider leading-tight">
                  {stat.label}
                </span>
                <span className="text-[10px] text-slate-400 font-light leading-relaxed">
                  {stat.desc}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* PANEL 4: CATÁLOGO COMPLETO DE SERVICIOS (Fondo Blanco - Letras Negras) */}
      <div className="w-full bg-white text-slate-900 py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-left border-b border-slate-100 pb-6">
              <div>
                <p className="text-[10px] text-[#126c0f] tracking-[0.25em] font-extrabold uppercase font-tech">CATÁLOGO COMPLETO</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
                  {publicServices.length} Servicios Activos
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Consultoría e ingeniería especializada bajo demanda</span>
            </div>

            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {publicServices.map((service) => (
                <ServiceCard key={service.id || service.title} service={service} />
              ))}
            </motion.div>
          </section>
        </div>
      </div>

      {/* PANEL 5: CTA FOOTER (Fondo Off-White - Letras Negras) */}
      <div className="w-full bg-slate-50 text-slate-900 border-t border-slate-200 py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section>
            <div className="bg-white border border-slate-200 p-8 sm:p-12 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#126c0f]/5 via-transparent to-transparent" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
                <div className="space-y-3 max-w-xl">
                  <p className="text-[10px] font-extrabold text-[#126c0f] uppercase tracking-wider">¿LISTO PARA OPTIMIZAR TU CUMPLIMIENTO REGULATORIO?</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                    Evita Clausuras y Sanciones Administrativas
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Analizamos la viabilidad técnica y legal de tu proyecto frente a las exigencias ambientales vigentes en Bolivia. Obtén tu cotización presupuestaria hoy mismo de la mano de ingenieros peritos acreditados.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => navigate('/quote')}
                    className="neuform-btn-primary pointer-events-auto cursor-none w-full sm:w-auto text-center justify-center"
                    data-cursor-text="COTIZAR"
                  >
                    Iniciar Diagnóstico <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="neuform-btn-accent pointer-events-auto w-full sm:w-auto text-center justify-center"
                  >
                    Regresar al Inicio
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

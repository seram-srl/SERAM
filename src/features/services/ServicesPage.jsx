import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
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
      className="group neuform-card p-6 flex flex-col gap-5 cursor-none pointer-events-auto overflow-hidden bg-black/55 backdrop-blur-md border border-white/10 hover:border-[#00e03c]/30 transition-all duration-300"
      data-cursor-text="COTIZAR"
    >
      {/* Decorative gradient fill */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.25rem]`} />

      {/* Icon + Tag */}
      <div className="relative flex items-center justify-between z-10">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-white group-hover:text-[#00e03c] group-hover:border-[#00e03c]/50 transition-all duration-300">
          {getIcon(service.icon)}
        </div>
        <span className="neuform-badge text-slate-300 border-white/10 bg-white/5 group-hover:text-[#00e03c] group-hover:border-[#00e03c]/20 transition-all duration-300">
          {service.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-2 flex-1">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00e03c]">{service.line}</span>
          <h3 className="font-bold text-[0.9rem] text-white transition-colors duration-200 leading-snug">
            {renderFormattedText(service.title)}
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-light transition-colors duration-300">
          {renderFormattedText(service.desc || service.description)}
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 py-2.5 bg-white text-black hover:bg-[#00e03c] active:bg-[#00e03c] rounded-full text-[10px] font-bold transition-all duration-300 uppercase tracking-wider">
        Cotizar ahora <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-black" />
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { publicServices } = useApp();

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const painPoints = [
    {
      pain: "Clausuras inminentes por incumplimiento legal",
      title: "Mitigación y Blindaje de Licencias",
      desc: "Elaboramos e implementamos los instrumentos de regulación de alcance particular (IRAP) y auditorías técnicas libres de observaciones para garantizar la continuidad ininterrumpida de tu planta o proyecto."
    },
    {
      pain: "Rechazos constantes por cartografía deficiente",
      title: "Precisión Geodésica Quirúrgica",
      desc: "Realizamos delimitación espacial, mapeo satelital y planos temáticos exactos que aprueban los filtros de control del INRA, la ABT y ministerios correspondientes sin observaciones."
    },
    {
      pain: "Cuellos de botella y demoras en trámites",
      title: "Certificaciones y Trámites Express",
      desc: "Optimizamos y aceleramos los flujos de expedientes para la obtención rápida de tu Registro Ambiental Industrial (RAI) y concesiones mineras, reduciendo plazos críticos."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % painPoints.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activePilar = painPoints[currentIndex];

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
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
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

      {/* PANEL 2: NUESTRO MARCO DE TRABAJO (Fondo Blanco - Letras Negras - Slideshow de Puntos de Dolor) */}
      <div className="w-full bg-white text-slate-900 border-y border-slate-200 py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Columna Izquierda: Visual HUD de marca */}
            <div className="lg:col-span-6 flex justify-center order-last lg:order-first">
              <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden border border-[#126c0f]/20 shadow-xl bg-slate-50">
                <img 
                  src="/assets/3d-backend/bg_home.webp" 
                  alt="Ecosistema protegido boliviano" 
                  className="w-full h-full object-cover opacity-20 mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#126c0f]/10 to-transparent" />
                <div className="absolute inset-6 border border-[#126c0f]/10 pointer-events-none rounded-xl">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#126c0f]" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#126c0f]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#126c0f]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#126c0f]" />
                </div>
                {/* Tech text details */}
                <div className="absolute bottom-4 left-6 font-tech text-[8px] text-[#126c0f]/60 tracking-wider">
                  SERAM_SYS_MODULE: BRAND_COMPLIANCE // VERIFICATION: SUCCESS
                </div>
              </div>
            </div>

            {/* Columna Derecha: Nuestro Marco de Trabajo + Slideshow Rotativo de Puntos de Dolor */}
            <div className="lg:col-span-6 space-y-8 text-left">
              <div>
                <p className="text-[10px] text-[#126c0f] tracking-[0.25em] font-extrabold uppercase font-tech">NUESTRO MARCO DE TRABAJO</p>
                <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-1">Cómo Resolvemos Tus Puntos de Dolor</h2>
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
                    PUNTO DE DOLOR DEL CLIENTE:
                  </span>
                  <h4 className="text-sm font-bold text-red-600 uppercase tracking-wide leading-tight">
                    ⚡ {activePilar.pain}
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
                  {painPoints.map((_, idx) => (
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

      {/* PANEL 3: BARRA DE ESTADÍSTICAS (Fondo Off-White - Letras Negras) */}
      <div className="w-full bg-slate-50 text-slate-900 border-b border-slate-200 py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#126c0f]/5 to-transparent pointer-events-none" />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y-0 divide-x-0 md:divide-x divide-slate-100">
              {[
                { num: '3', label: 'Líneas de Servicio', desc: 'Trámites, Ingeniería y SIG' },
                { num: '+50', label: 'Proyectos Ejecutados', desc: 'Con 100% de tasa de aprobación' },
                { num: '3', label: 'Socios Peritos Habilitados', desc: 'Inscritos en el registro pericial' },
                { num: 'ISO', label: 'Estándar de Calidad', desc: 'Metodologías de nivel internacional' },
              ].map((stat, idx) => (
                <div key={idx} className={`flex flex-col gap-1 text-center md:text-left ${idx > 0 ? 'md:pl-8' : ''}`}>
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">{stat.num}</span>
                  <span className="text-[10px] font-extrabold text-[#126c0f] uppercase tracking-wider">{stat.label}</span>
                  <span className="text-[10px] text-slate-500 font-light mt-0.5 leading-tight">{stat.desc}</span>
                </div>
              ))}
            </div>
          </section>
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

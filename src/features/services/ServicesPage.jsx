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

function ServiceCard({ service }) {
  const navigate = useNavigate();
  const colors = getServiceColors(service.line);

  return (
    <motion.div
      variants={cardVariants}
      onClick={() => navigate('/quote')}
      className={`group neuform-card p-6 flex flex-col gap-5 cursor-none pointer-events-auto overflow-hidden ${colors.borderColor}`}
      data-cursor-text="COTIZAR"
    >
      {/* Decorative gradient fill */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.25rem]`} />

      {/* Icon + Tag */}
      <div className="relative flex items-center justify-between z-10">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/70 group-hover:text-[#00e03c] group-hover:border-[#00e03c]/25 transition-all duration-300">
          {getIcon(service.icon)}
        </div>
        <span className="neuform-badge text-white/30 group-hover:text-white/50">
          {service.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-2 flex-1">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00e03c]/70">{service.line}</span>
          <h3 className="font-bold text-[0.9rem] text-white/85 group-hover:text-white transition-colors duration-200 leading-snug">
            {service.title}
          </h3>
        </div>
        <p className="text-xs text-white/35 leading-relaxed group-hover:text-white/50 transition-colors duration-300">
          {service.desc || service.description}
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold text-white/25 group-hover:text-[#00e03c] transition-colors duration-200 uppercase tracking-wider">
        Cotizar ahora <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { publicServices } = useApp();

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
      className="inner-page min-h-screen relative overflow-hidden"
    >
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* Atmospheric gradient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vh] rounded-full bg-blue-700/10 blur-[120px] animate-blob" />
        <div className="absolute top-[-5%] right-[-10%] w-[40vw] h-[45vh] rounded-full bg-indigo-700/10 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[30vw] h-[30vh] rounded-full bg-emerald-500/5 blur-[80px] animate-blob" style={{ animationDelay: '8s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24">

        {/* ── SECCIÓN 1: HERO HEADER SPLIT ── */}
        <section className="pt-8 pb-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <span className="neuform-badge-accent neuform-badge">
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
              <span className="text-[#00e03c]">Asegura Tu Cumplimiento</span>
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
            <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-slate-950 p-2 group hover:border-[#00e03c]/30 transition-all duration-300">
              <img 
                src="/assets/3d-backend/gis_satellite_mapping.webp" 
                alt="Ecosystem GIS Interface" 
                className="w-full h-full object-cover rounded-xl opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-3.5 rounded-xl text-left">
                <span className="text-[8px] font-bold text-[#00e03c]/90 uppercase font-tech tracking-wider">TECNOLOGÍA DE MONITOREO</span>
                <p className="text-[10px] text-slate-300 leading-tight mt-1 font-light">Suite integrada con precisión de nivel geodésico y mapeo satelital.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 2: SPLIT DE INFORMACIÓN (GARANTÍA TÉCNICA) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Imagen de Ecosistema sin humanos de frente */}
          <div className="lg:col-span-6 flex justify-center order-last lg:order-first">
            <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="/assets/3d-backend/bg_home.webp" 
                alt="Ecosistema protegido boliviano" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-slate-950/15" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,224,60,0.08),transparent_70%)]" />
              {/* Subtle tech overlay */}
              <div className="absolute inset-6 border border-white/[0.04] pointer-events-none rounded-xl">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00e03c]/50" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00e03c]/50" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00e03c]/50" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00e03c]/50" />
              </div>
            </div>
          </div>

          {/* Pilares Informativos */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div>
              <p className="text-[10px] text-[#00e03c] tracking-[0.25em] font-extrabold uppercase font-tech">NUESTRO MARCO DE TRABAJO</p>
              <h2 className="text-3xl font-black text-white tracking-tight mt-1">Garantía Técnica de Extremo a Extremo</h2>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  icon: <Shield className="w-5 h-5 text-[#00e03c]" />,
                  title: "Mitigación y Blindaje Legal",
                  desc: "Diseñamos instrumentos regulados (IRAP) y auditorías técnicas libres de observaciones para blindar tu empresa ante inspecciones gubernamentales."
                },
                {
                  icon: <Award className="w-5 h-5 text-[#00e03c]" />,
                  title: "Precisión Geodésica Quirúrgica",
                  desc: "Mapeo y delimitación espacial exacta que cumple estrictamente con los estándares y normativas vigentes del INRA, ABT y Ministerios."
                },
                {
                  icon: <Zap className="w-5 h-5 text-[#00e03c]" />,
                  title: "Trámites y Certificaciones Express",
                  desc: "Flujos de optimización de expedientes para la aprobación rápida del RAI industrial y concesiones mineras sin cuellos de botella administrativos."
                }
              ].map((pilar, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                    {pilar.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{pilar.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{pilar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: BARRA DE ESTADÍSTICAS LIMPIA ── */}
        <section className="neuform-card p-8 sm:p-10 backdrop-blur-xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y-0 divide-x-0 md:divide-x divide-white/[0.06]">
            {[
              { num: '3', label: 'Líneas de Servicio', desc: 'Trámites, Ingeniería y SIG' },
              { num: '+50', label: 'Proyectos Ejecutados', desc: 'Con 100% de tasa de aprobación' },
              { num: '3', label: 'Socios Peritos Habilitados', desc: 'Inscritos en el registro pericial' },
              { num: 'ISO', label: 'Estándar de Calidad', desc: 'Metodologías de nivel internacional' },
            ].map((stat, idx) => (
              <div key={idx} className={`flex flex-col gap-1 text-center md:text-left ${idx > 0 ? 'md:pl-8' : ''}`}>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{stat.num}</span>
                <span className="text-[10px] font-extrabold text-[#00e03c] uppercase tracking-wider">{stat.label}</span>
                <span className="text-[10px] text-slate-400 font-light mt-0.5 leading-tight">{stat.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 4: CATÁLOGO DE SERVICIOS ACTIVO ── */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-left">
            <div>
              <p className="text-[10px] text-[#00e03c] tracking-[0.25em] font-extrabold uppercase font-tech">CATÁLOGO COMPLETO</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {publicServices.length} Servicios Activos
              </h2>
            </div>
            <span className="text-xs text-slate-400">Consultoría e ingeniería especializada bajo demanda</span>
          </div>

          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {publicServices.map((service) => (
              <ServiceCard key={service.id || service.title} service={service} />
            ))}
          </motion.div>
        </section>

        {/* ── SECCIÓN 5: CTA FOOTER PANEL ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="neuform-card p-8 sm:p-12 overflow-hidden relative border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
              <div className="space-y-3 max-w-xl">
                <p className="text-[10px] font-extrabold text-[#00e03c] uppercase tracking-wider">¿LISTO PARA OPTIMIZAR TU CUMPLIMIENTO REGULATORIO?</p>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Evita Clausuras y Sanciones Administrativas
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Analizamos la viabilidad técnica y legal de tu proyecto frente a las exigencias ambientales vigentes en Bolivia. Obtén tu cotización presupuestaria hoy mismo de la mano de ingenieros peritos acreditados.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => navigate('/quote')}
                  className="neuform-btn-primary pointer-events-auto cursor-none w-full sm:w-auto"
                  data-cursor-text="COTIZAR"
                >
                  Iniciar Diagnóstico <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="neuform-btn-accent pointer-events-auto w-full sm:w-auto"
                >
                  Regresar al Inicio
                </button>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </motion.div>
  );
}

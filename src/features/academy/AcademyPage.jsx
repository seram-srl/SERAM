import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BookOpenCheck, Lock, Trash2, Star, Shield, Play, Library, Award, Headphones, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
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

export default function AcademyPage() {
  const navigate = useNavigate();
  const {
    courses, activeRole, hasPremiumAccess, currentSocio,
    handleAccessItem, handleDeleteCourse, triggerToast,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categorías de "Canal de Marca" estilo Disney+
  const CATEGORIES = [
    { id: 'all', label: 'Todo', icon: <Library className="w-4 h-4" /> },
    { id: 'curso_gratis', label: 'Cursos Gratis', icon: <BookOpenCheck className="w-4 h-4" /> },
    { id: 'curso_pago', label: 'Cursos Pro', icon: <Award className="w-4 h-4" /> },
    { id: 'taller', label: 'Talleres', icon: <Shield className="w-4 h-4" /> },
    { id: 'masterclass', label: 'Masterclasses', icon: <Play className="w-4 h-4" /> },
    { id: 'libro', label: 'Ebooks', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'audiolibro', label: 'Audiolibros', icon: <Headphones className="w-4 h-4" /> }
  ];

  // Filtrar cursos según el canal seleccionado
  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(c => c.type === selectedCategory);

  // Curso Destacado para el Banner Superior (QGIS)
  const featuredCourse = courses.find(c => c.id === 2) || courses[0];

  const handleOpenCourse = (course) => {
    handleAccessItem(course, 'course', () => {
      triggerToast(`Accediendo a: ${course.title}`, 'success');
      navigate(`/academy/course/${course.id}`);
    });
  };

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="inner-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
    >
      {/* ── 1. DISNEY+ HERO BANNER (Curso Destacado) ── */}
      {featuredCourse && (
        <div className="relative w-full h-[40vh] sm:h-[50vh] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] group border border-white/10 pointer-events-auto">
          {/* Imagen de fondo degradada */}
          <div className="absolute inset-0">
            <img
              src={featuredCourse.image}
              alt={featuredCourse.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-[6s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent" />
          </div>

          {/* Información del Curso Destacado */}
          <div className="absolute bottom-0 left-0 p-6 sm:p-10 space-y-3 max-w-2xl text-left">
            <div className="neuform-badge-accent neuform-badge">
              <Star className="w-3 h-3 text-amber-400 fill-current" /> DESTACADO DE LA ACADEMIA
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight uppercase font-display drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {renderFormattedText(featuredCourse.title)}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg hidden sm:block">
              {renderFormattedText(featuredCourse.desc)}
            </p>
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => handleOpenCourse(featuredCourse)}
                className="neuform-btn-primary cursor-none"
                data-cursor-text="REPRODUCIR"
              >
                <Play className="w-4 h-4 fill-current" /> Ver Contenido
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Instructor: {featuredCourse.instructor} · {featuredCourse.duration}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. BRAND CHANNELS GRID (Categorías Estilo Disney+) ── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`relative py-4 px-3 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-none transition-all duration-300 ${
                isActive
                  ? 'bg-[#00e03c]/15 border-[#00e03c] text-[#00e03c] shadow-[0_0_20px_rgba(0,224,60,0.25)] scale-105'
                  : 'bg-white/[0.05] border-white/[0.12] hover:border-[#00e03c]/40 text-slate-300 hover:text-white hover:scale-105 hover:bg-[#00e03c]/5 hover:shadow-[0_0_15px_rgba(0,224,60,0.15)]'
              }`}
            >
              <div className={`p-2.5 rounded-xl border ${isActive ? 'bg-[#00e03c]/20 border-[#00e03c]/30 text-[#00e03c]' : 'bg-white/8 border-white/20'}`}>
                {cat.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-center">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. LISTADO DE CONTENIDOS FILTRADOS (Disney+ Row Sliders) ── */}
      <div className="space-y-6 text-left">
        <div className="flex justify-between items-center">
          <h2 className="font-extrabold text-lg text-white uppercase tracking-wider flex items-center gap-2">
            <Library className="w-4 h-4 text-[#00e03c]" /> 
            {CATEGORIES.find(c => c.id === selectedCategory)?.label} Disponibles
          </h2>
          <span className="section-label">{filteredCourses.length} recursos encontrados</span>
        </div>
        <div className="neuform-divider mt-2 mb-6" />

        {filteredCourses.length === 0 ? (
          <div className="neuform-card p-10 text-center text-slate-500 text-xs">
            No hay recursos disponibles en este canal actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                onClick={() => handleOpenCourse(course)}
                className="group relative overflow-hidden neuform-card flex flex-col h-full cursor-none pointer-events-auto"
                data-cursor-text="INGRESAR"
              >
                {/* Imagen del Curso - Aspecto Video Ancho */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Tipo de Recurso */}
                  <span className="absolute top-3 left-3 neuform-badge backdrop-blur-md">
                    {course.type.replace('_', ' ')}
                  </span>

                  {/* Icono de Play / Lock al centro */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#00e03c] text-slate-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      {course.isPremium && !hasPremiumAccess ? (
                        <Lock className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalles */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-white text-base group-hover:text-[#00e03c] transition-colors leading-snug">
                      {renderFormattedText(course.title)}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {renderFormattedText(course.desc)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                      {course.instructor}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-300 bg-white/5 border border-white/15 px-2 py-0.5 rounded">
                        {course.duration}
                      </span>
                      {course.isPremium ? (
                        <span className="neuform-badge text-amber-400 border-amber-400/30 bg-amber-400/10 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" /> Premium
                        </span>
                      ) : (
                        <span className="neuform-badge neuform-badge-accent">
                          Gratis
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón de Borrado para Administrador */}
                {activeRole === 'AdminMod' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-rose-500/20 text-rose-400 border border-white/10 hover:border-rose-500/40 rounded-xl transition-all pointer-events-auto"
                    title="Eliminar curso"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. SUBSCRIPCIÓN PREMIUM CTA ── */}
      {!hasPremiumAccess && (
        <div className="neuform-card p-8 sm:p-12 overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400 fill-current animate-spin-slow" />
              Suscripción Academia Premium
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Únete a la membresía de élite académica de SERAM. Accede a todos los cursos de pago, talleres avanzados de <span className="italic text-white">SIG en QGIS</span>, cálculo de <span className="italic text-white">Huella de Carbono</span>, y descarga recursos vectoriales exclusivos de por vida por una única cuota anual.
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="neuform-btn-primary cursor-none shrink-0 !bg-amber-400 !border-amber-300 hover:!bg-amber-300 shadow-[0_4px_15px_rgba(251,191,36,0.3)] text-slate-950"
            data-cursor-text="PREMIUM"
          >
            Adquirir Membresía Premium
          </button>
        </div>
      )}
    </motion.div>
  );
}

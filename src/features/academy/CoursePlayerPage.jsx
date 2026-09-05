import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, RotateCw, 
  ArrowLeft, BookOpen, Lock, Download, MessageSquare, Info, Star, 
  HelpCircle, FileSpreadsheet, Map, Upload, Check, Award, 
  FileText, ChevronDown, ChevronRight, Edit3, Settings, 
  GraduationCap, Paperclip, ExternalLink, ShieldCheck, UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import '../../styles/academy-cinematic.css';

// Estructura modular del curso idéntica a Crehana
const COURSE_MODULES = [
  {
    id: 1,
    title: '1. Fundamentos y Normativa Ambiental',
    classes: [
      { id: '1.1', title: 'Bienvenidos al Programa & Metodología', duration: '5m 20s', durationSec: 320, isPremium: false, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' },
      { id: '1.2', title: 'Marco Teórico del Impacto Ambiental en Bolivia', duration: '12m 45s', durationSec: 765, isPremium: false, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4' }
    ]
  },
  {
    id: 2,
    title: '2. Herramientas Técnicas & QGIS Práctico',
    classes: [
      { id: '2.1', title: 'Introducción a Herramientas SIG y QGIS', duration: '6m 04s', durationSec: 364, isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-undergrowth-of-a-green-forest-40283-large.mp4' },
      { id: '2.2', title: 'Delimitación de Cuencas Hidrográficas', duration: '4m 54s', durationSec: 294, isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' },
      { id: '2.3', title: 'Generación de Mapas de Pendientes y Cobertura', duration: '8m 15s', durationSec: 495, isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4' }
    ]
  },
  {
    id: 3,
    title: '3. Fichas Ambientales y Categorización FNCA',
    classes: [
      { id: '3.1', title: 'Ley 1333 y Estructura Regulatoria Sectorial', duration: '14m 30s', durationSec: 870, isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-undergrowth-of-a-green-forest-40283-large.mp4' },
      { id: '3.2', title: 'Llenado del Formulario de Nivel de Categorización', duration: '18m 10s', durationSec: 1090, isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' }
    ]
  },
  {
    id: 4,
    title: '4. Proyecto Final & Certificación Oficial',
    classes: [
      { id: '4.1', title: 'Defensa de Caso Real & Requisitos de Egreso', duration: '7m 40s', durationSec: 460, isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4' }
    ]
  }
];

// Aplanar lista para facilitar navegación
const ALL_LESSONS = COURSE_MODULES.flatMap(m => m.classes);

const renderFormattedText = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <span key={index} className="text-[#00e03c] font-semibold">{part.slice(1, -1)}</span>;
    }
    return part;
  });
};

export default function CoursePlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    courses, 
    hasPremiumAccess, 
    triggerToast,
    completedLessons,
    courseExamsApproved,
    courseAssignments,
    toggleLessonCompleted,
    approveCourseExam,
    submitAssignment,
    currentSocio
  } = useApp();

  const course = courses.find(c => c.id === parseInt(id)) || courses[0];

  // Modo de visualización Crehana: 'overview' (Captura 1) o 'player' (Captura 2)
  const [viewMode, setViewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'player' ? 'player' : 'overview';
  });

  // Pestaña en vista Overview: 'sobre-el-curso' | 'clases-y-adjuntos'
  const [overviewTab, setOverviewTab] = useState('sobre-el-curso');

  // Pestaña en barra lateral del Player: 'modulos' | 'apuntes' | 'comentarios'
  const [playerTab, setPlayerTab] = useState('modulos');

  // Lección actual
  const [currentLesson, setCurrentLesson] = useState(ALL_LESSONS[0]);

  // Módulos desplegados en el acordeón de Crehana
  const [openModules, setOpenModules] = useState({ 1: true, 2: true, 3: false, 4: false });

  // Modales adicionales de Crehana
  const [showCertModal, setShowCertModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);

  // Estados de video y reproducción
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Apuntes interactivos con timestamp
  const [notes, setNotes] = useState([
    { id: 1, time: 24, text: 'Revisar Art. 25 de la Ley 1333 sobre Fichas Ambientales e IRAPs.' },
    { id: 2, time: 145, text: 'Descargar el DEM SRTM de 30m desde USGS EarthExplorer para cuencas.' }
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Comentarios / Q&A
  const [comments, setComments] = useState([
    { id: 1, user: 'Rodrigo Camacho', date: 'Hace 2 horas', text: '¿Dónde puedo descargar las capas SHP del Valle de Zongo para hacer la práctica?' },
    { id: 2, user: 'Ing. Diego Barrientos', isInstructor: true, date: 'Hace 1 hora', text: 'Hola Rodrigo, las capas están disponibles en el botón superior "Descarga los adjuntos aquí" y en la pestaña de recursos.' }
  ]);
  const [newComment, setNewComment] = useState('');

  // Estados locales para tareas y evaluación
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({ 1: null, 2: null, 3: null });

  const videoRef = useRef(null);
  const progressRef = useRef(null);

  // Calcular progreso total del curso
  const courseCompletedList = completedLessons[course.id] || [];
  const progressPercent = Math.round((courseCompletedList.length / ALL_LESSONS.length) * 100);

  // Cambiar video al seleccionar lección
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentLesson]);

  // Manejo de reproducción
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  }, [isPlaying]);

  const handleVideoEnded = useCallback(() => {
    if (!courseCompletedList.includes(currentLesson.id)) {
      toggleLessonCompleted(course.id, currentLesson.id);
      triggerToast(`¡Lección "${currentLesson.title}" completada!`, 'success');
    }
  }, [courseCompletedList, course.id, currentLesson, toggleLessonCompleted, triggerToast]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      const seekTime = pct * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  }, [duration]);

  const skipSeconds = useCallback((sec) => {
    if (videoRef.current) {
      const nextTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + sec));
      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  }, [duration]);

  const handleVolumeChange = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
      if (nextMute) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume;
      }
    }
  }, [isMuted, volume]);

  const changeSpeed = useCallback((speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      triggerToast(`Velocidad: ${speed}x`, 'info');
    }
  }, [triggerToast]);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  }, []);

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectLesson = useCallback((lesson) => {
    if (lesson.isPremium && !hasPremiumAccess) {
      triggerToast('Esta lección requiere membresía o compra del curso.', 'error');
      return;
    }
    setCurrentLesson(lesson);
    setViewMode('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [hasPremiumAccess, triggerToast]);

  // Manejar creación de apunte
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note = {
      id: Date.now(),
      time: Math.floor(currentTime),
      text: newNoteText.trim()
    };
    setNotes(prev => [note, ...prev]);
    setNewNoteText('');
    triggerToast(`Apunte guardado en ${formatTime(currentTime)}`, 'success');
  };

  const jumpToNoteTime = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  // Manejar nuevo comentario
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: Date.now(),
        user: currentSocio?.name || 'Tú (Estudiante)',
        date: 'Hace un momento',
        text: newComment.trim()
      }
    ]);
    setNewComment('');
    triggerToast('Comentario publicado en el foro.', 'success');
  };

  // Manejo de Tarea
  const handleUploadTask = useCallback(() => {
    if (!selectedFile) return;
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          submitAssignment(course.id, selectedFile.name);
          triggerToast('¡Tarea entregada correctamente!', 'success');
          setSelectedFile(null);
          setUploadProgress(null);
          return null;
        }
        return prev + 20;
      });
    }, 150);
  }, [course.id, selectedFile, submitAssignment, triggerToast]);

  // Manejo de Examen
  const handleSubmitQuiz = useCallback((e) => {
    e.preventDefault();
    let correctCount = 0;
    if (quizAnswers[1] === 'B') correctCount++;
    if (quizAnswers[2] === 'C') correctCount++;
    if (quizAnswers[3] === 'A') correctCount++;

    if (correctCount >= 2) {
      approveCourseExam(course.id);
      triggerToast(`¡Examen aprobado con éxito! (${correctCount}/3 correctas)`, 'success');
    } else {
      triggerToast(`Obtuviste ${correctCount}/3 correctas. Se requiere al menos 2/3 para certificar.`, 'error');
    }
  }, [course.id, quizAnswers, approveCourseExam, triggerToast]);

  const toggleModuleAccordion = (modId) => {
    setOpenModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Porcentaje de progreso de video
  const videoProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Próxima lección pendiente para el CTA
  const nextPendingLesson = useMemo(() => {
    return ALL_LESSONS.find(l => !courseCompletedList.includes(l.id)) || ALL_LESSONS[0];
  }, [courseCompletedList]);

  // =========================================================================
  // RENDER VISTA 1: CREHANA COURSE HUB / OVERVIEW (Captura 1)
  // =========================================================================
  if (viewMode === 'overview') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#040804] text-slate-100 font-sans pb-24 text-left"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-10">
          
          {/* 1. Miga de pan / Breadcrumb superior */}
          <nav className="flex items-center gap-6 text-xs font-semibold text-slate-400">
            <button 
              onClick={() => navigate('/')}
              className="hover:text-[#00e03c] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00e03c]" /> Regresar al inicio
            </button>
            <button 
              onClick={() => navigate('/academy')}
              className="hover:text-[#00e03c] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00e03c]" /> Regresar a mis rutas
            </button>
          </nav>

          {/* 2. Hero Dividido (Split Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Columna Izquierda: Información Principal */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                  {renderFormattedText(course.title)}
                </h1>
                <p className="text-sm font-semibold text-[#00e03c] flex items-center gap-1.5">
                  Por {course.instructor || 'Ing. Diego Barrientos'}
                </p>
              </div>

              <p className="text-sm text-slate-300 font-light leading-relaxed max-w-xl">
                {course.desc || 'En este curso especializado aprenderás todo lo necesario para dominar los aspectos técnicos, herramientas geográficas y normativas ambientales con aplicación directa en el contexto boliviano.'}
              </p>

              {/* Acceso a lección activa */}
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-full bg-[#00e03c]/20 border border-[#00e03c]/40 flex items-center justify-center text-[#00e03c]">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span className="font-medium text-slate-200">
                  {nextPendingLesson ? `Módulo ${nextPendingLesson.id.split('.')[0]}: Clase ${nextPendingLesson.id}: ${nextPendingLesson.title}` : 'Curso completado'}
                </span>
              </div>

              {/* Botón CTA Primario Crehana en Verde Esmeralda SERAM */}
              <div>
                <button
                  onClick={() => {
                    selectLesson(nextPendingLesson || ALL_LESSONS[0]);
                  }}
                  className="px-8 py-4 bg-[#00e03c] hover:bg-[#00c534] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(0,224,60,0.3)] hover:shadow-[0_0_35px_rgba(0,224,60,0.5)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {progressPercent > 0 ? 'Continuar curso' : 'Empezar curso'}
                </button>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Vista Previa y Progreso */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => selectLesson(nextPendingLesson || ALL_LESSONS[0])}
                className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black group cursor-pointer"
              >
                <img 
                  src={course.image || '/assets/covers/cover_qgis_basico.png'} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />

                {/* Botón de Play Flotante */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:text-[#00e03c] group-hover:border-[#00e03c]/60 group-hover:scale-110 transition-all shadow-xl">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>

                {/* Barra Inferior de Progreso Degradada */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white">{progressPercent}% Completado</span>
                    <span className="text-[10px] text-slate-400">{courseCompletedList.length} de {ALL_LESSONS.length} clases</span>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#00e03c] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#00e03c]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Pestañas de Navegación Inferiores (Sobre el curso / Clases y adjuntos) */}
          <div className="border-b border-white/10 pt-6">
            <div className="flex gap-8">
              <button
                onClick={() => setOverviewTab('sobre-el-curso')}
                className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${
                  overviewTab === 'sobre-el-curso' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sobre el curso
                {overviewTab === 'sobre-el-curso' && (
                  <motion.div 
                    layoutId="crehana-tab-underline"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00e03c] shadow-[0_0_10px_#00e03c]" 
                  />
                )}
              </button>

              <button
                onClick={() => setOverviewTab('clases-y-adjuntos')}
                className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${
                  overviewTab === 'clases-y-adjuntos' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Clases y adjuntos
                {overviewTab === 'clases-y-adjuntos' && (
                  <motion.div 
                    layoutId="crehana-tab-underline"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00e03c] shadow-[0_0_10px_#00e03c]" 
                  />
                )}
              </button>
            </div>
          </div>

          {/* 4. Contenido Dinámico de Pestañas */}
          {overviewTab === 'sobre-el-curso' ? (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Te damos la bienvenida al curso
              </h2>

              {/* Grid de 3 Tarjetas Crehana */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tarjeta 1: Sobre este curso */}
                <div className="bg-[#081208]/80 border border-white/10 hover:border-[#00e03c]/30 rounded-2xl p-6 space-y-4 backdrop-blur-xl transition-all">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Sobre este curso
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Diseñado específicamente para consultores ambientales, ingenieros de proyectos y técnicos que requieren dominar el marco regulatorio boliviano e instrumentos SIG con rigor profesional.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Nivel:</span>
                      <strong className="text-white">Intermedio - Avanzado</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Acreditación:</span>
                      <strong className="text-[#00e03c]">Certificado SERAM</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Modalidad:</span>
                      <strong className="text-white">100% Online y a tu ritmo</strong>
                    </div>
                  </div>
                </div>

                {/* Tarjeta 2: Acerca del profesor */}
                <div className="bg-[#081208]/80 border border-white/10 hover:border-[#00e03c]/30 rounded-2xl p-6 space-y-4 backdrop-blur-xl transition-all">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Acerca del profesor
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#126c0f]/40 border border-[#00e03c]/40 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      <UserCheck className="w-6 h-6 text-[#00e03c]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{course.instructor || 'Ing. Diego Barrientos'}</h3>
                      <p className="text-[11px] text-[#00e03c]">Especialista Senior en Medio Ambiente</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Más de 10 años de experiencia liderando auditorías ambientales, licencias industriales y proyectos de teledetección en los sectores minero, energético y municipal.
                  </p>
                </div>

                {/* Tarjeta 3: Valoración del curso */}
                <div className="bg-[#081208]/80 border border-white/10 hover:border-[#00e03c]/30 rounded-2xl p-6 space-y-4 backdrop-blur-xl transition-all">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Valoración del curso
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-white">4.9</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Basado en <strong>128 opiniones</strong> de estudiantes graduados.
                  </p>
                  <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>5 ★</span>
                      <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00e03c] h-full w-[92%]" />
                      </div>
                      <span>92%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>4 ★</span>
                      <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00e03c] h-full w-[6%]" />
                      </div>
                      <span>6%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Tab: Clases y adjuntos */
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Estructura curricular y recursos
                </h2>
                <button
                  onClick={() => setShowFilesModal(true)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-[#00e03c]/10 border border-white/10 hover:border-[#00e03c]/40 text-xs font-bold text-slate-200 hover:text-[#00e03c] transition-all flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar adjuntos del curso
                </button>
              </div>

              {/* Lista completa de módulos */}
              <div className="space-y-4">
                {COURSE_MODULES.map(mod => (
                  <div key={mod.id} className="bg-[#081208]/60 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                      <span className="text-sm font-black text-white">{mod.title}</span>
                      <span className="text-xs text-slate-400">{mod.classes.length} clases</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {mod.classes.map(cl => {
                        const isDone = courseCompletedList.includes(cl.id);
                        return (
                          <div 
                            key={cl.id}
                            onClick={() => selectLesson(cl)}
                            className="p-4 flex items-center justify-between hover:bg-[#00e03c]/5 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                                isDone 
                                  ? 'bg-[#00e03c]/20 border-[#00e03c] text-[#00e03c]'
                                  : 'bg-white/5 border-white/10 text-slate-400'
                              }`}>
                                {isDone ? '✓' : <Play className="w-3 h-3 fill-current" />}
                              </div>
                              <span className="text-xs font-bold text-slate-200">{cl.title}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span>{cl.duration}</span>
                              <button className="text-[#00e03c] hover:underline font-bold text-[11px]">
                                Reproducir →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // RENDER VISTA 2: CREHANA CLASSROOM / VIDEO PLAYER (Captura 2)
  // =========================================================================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#020502] text-slate-100 font-sans flex flex-col text-left"
    >
      {/* Barra de cabecera superior Crehana sobre el video */}
      <header className="w-full bg-[#030703] border-b border-white/10 pl-20 sm:pl-24 pr-4 sm:pr-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => {
              setViewMode('overview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00e03c]" /> Regresar al panel
          </button>
          
          <div className="truncate">
            <h1 className="text-xs sm:text-sm font-black text-white truncate">
              {course.title.replace(/\*/g, '')}
            </h1>
            <p className="text-[11px] text-[#00e03c] font-medium truncate">
              {currentLesson.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            SERAM ACADEMY
          </span>
          <div className="w-8 h-8 rounded-full bg-[#00e03c]/20 border border-[#00e03c]/40 flex items-center justify-center text-white text-xs font-black">
            {currentSocio?.name ? currentSocio.name[0] : 'S'}
          </div>
        </div>
      </header>

      {/* Contenedor Principal: Reproductor a la Izquierda + Barra Lateral Crehana a la Derecha */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* ================================================================= */}
        {/* ÁREA IZQUIERDA: REPRODUCTOR DE VIDEO                              */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 bg-black flex flex-col justify-between relative group select-none min-h-[400px] lg:min-h-auto">
          
          {/* Elemento de Video */}
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
            <video
              ref={videoRef}
              src={currentLesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain max-h-[85vh] cursor-pointer"
            />

            {/* Overlay de pausa en el centro */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-[#00e03c] hover:scale-110 transition-all shadow-2xl">
                  <Play className="w-9 h-9 fill-current ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* BARRA DE CONTROLES INFERIOR CREHANA ESTILO SERAM                 */}
          {/* =============================================================== */}
          <div className="bg-gradient-to-t from-black via-black/90 to-transparent p-3 sm:p-4 flex flex-col gap-2 z-20">
            
            {/* Scrubber / Barra de Progreso en Verde Neón Esmeralda */}
            <div 
              ref={progressRef}
              onClick={handleSeek}
              className="w-full h-2 bg-white/20 hover:h-2.5 rounded-full cursor-pointer relative flex items-center transition-all"
            >
              <div 
                className="h-full bg-[#00e03c] rounded-full shadow-[0_0_10px_#00e03c]" 
                style={{ width: `${videoProgressPercent}%` }}
              />
              <div 
                className="w-3.5 h-3.5 rounded-full bg-white border border-[#00e03c] shadow absolute"
                style={{ left: `calc(${videoProgressPercent}% - 7px)` }}
              />
            </div>

            {/* Controles de Reproducción y Accesorios */}
            <div className="flex items-center justify-between text-white pt-1">
              
              {/* Lado Izquierdo: Rebobinar 10s, Play/Pausa, Adelantar 10s, Timestamp, Volumen */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button 
                  onClick={() => skipSeconds(-10)} 
                  className="p-1 text-slate-300 hover:text-[#00e03c] transition-colors cursor-pointer"
                  title="Retroceder 10 segundos"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button 
                  onClick={togglePlay} 
                  className="p-1 text-white hover:text-[#00e03c] transition-colors cursor-pointer"
                  title={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button 
                  onClick={() => skipSeconds(10)} 
                  className="p-1 text-slate-300 hover:text-[#00e03c] transition-colors cursor-pointer"
                  title="Adelantar 10 segundos"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono text-slate-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* Volumen */}
                <div className="flex items-center gap-1.5 pl-2">
                  <button onClick={toggleMute} className="p-1 text-slate-300 hover:text-[#00e03c] transition-colors cursor-pointer">
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-14 sm:w-18 accent-[#00e03c] h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Lado Derecho: Atajo de Apunte (+📝), CC, AUTO, Velocidad, Pantalla Completa */}
              <div className="flex items-center gap-3 relative">
                
                {/* Atajo Crehana: Agregar Apunte rápido */}
                <button
                  onClick={() => {
                    setPlayerTab('apuntes');
                    triggerToast(`Toma tu nota en el minuto ${formatTime(currentTime)}`, 'info');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-[#00e03c]/20 hover:text-[#00e03c] text-xs font-bold transition-all cursor-pointer"
                  title="Tomar apunte en este segundo"
                >
                  <span className="text-sm">+</span>
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Calidad AUTO */}
                <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                  AUTO
                </span>

                {/* Selector de Velocidad */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="p-1 text-slate-300 hover:text-[#00e03c] transition-colors cursor-pointer"
                    title="Velocidad de reproducción"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  {showSpeedMenu && (
                    <div className="absolute right-0 bottom-8 bg-[#0a140a] border border-white/15 rounded-xl p-1 shadow-2xl z-30 flex flex-col min-w-[80px]">
                      {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => changeSpeed(speed)}
                          className={`text-left px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            playbackSpeed === speed ? 'bg-[#00e03c]/20 text-[#00e03c]' : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pantalla Completa */}
                <button 
                  onClick={handleFullscreen} 
                  className="p-1 text-slate-300 hover:text-[#00e03c] transition-colors cursor-pointer"
                  title="Pantalla completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ÁREA DERECHA: SIDEBAR ESTILO CREHANA (Captura 2)                  */}
        {/* ================================================================= */}
        <aside className="lg:col-span-4 bg-[#050b05] border-l border-white/10 flex flex-col h-[600px] lg:h-auto overflow-hidden">
          
          {/* 1. Cabecera Crehana con Marca SERAM ACADEMY y Avatar */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00e03c] shadow-[0_0_8px_#00e03c]" />
              <span className="text-xs font-black tracking-widest text-white uppercase">
                SERAM <span className="text-[#00e03c]">ACADEMY</span>
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#126c0f]/60 border border-[#00e03c]/30 flex items-center justify-center text-white text-[11px] font-bold">
              {currentSocio?.name ? currentSocio.name[0] : 'S'}
            </div>
          </div>

          {/* 2. Dos Botones de Acción Rápida Crehana */}
          <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/10 bg-black/20">
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00e03c]/10 border border-white/10 hover:border-[#00e03c]/40 text-left transition-all cursor-pointer group"
            >
              <GraduationCap className="w-4 h-4 text-[#00e03c] shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-extrabold text-white block leading-tight group-hover:text-[#00e03c] truncate">
                  Requisitos de
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  certificación
                </span>
              </div>
            </button>

            <button
              onClick={() => setShowFilesModal(true)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00e03c]/10 border border-white/10 hover:border-[#00e03c]/40 text-left transition-all cursor-pointer group"
            >
              <Download className="w-4 h-4 text-[#00e03c] shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-extrabold text-white block leading-tight group-hover:text-[#00e03c] truncate">
                  Descarga los
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  adjuntos aquí
                </span>
              </div>
            </button>
          </div>

          {/* 3. Tres Pestañas Crehana: Módulos | Apuntes | Comentarios */}
          <div className="flex border-b border-white/10 bg-[#070f07]">
            {[
              { id: 'modulos', label: 'Módulos' },
              { id: 'apuntes', label: 'Apuntes' },
              { id: 'comentarios', label: 'Comentarios' }
            ].map(tab => {
              const isActive = playerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPlayerTab(tab.id)}
                  className={`flex-1 py-3 text-xs font-bold text-center transition-all relative cursor-pointer ${
                    isActive ? 'text-[#00e03c]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="player-tab-underline"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00e03c] shadow-[0_0_8px_#00e03c]" 
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* 4. Contenido Dinámico del Sidebar Crehana */}
          <div className="flex-1 overflow-y-auto crehana-scrollbar p-3 space-y-3">
            
            {/* ---------------- TAB: MÓDULOS ---------------- */}
            {playerTab === 'modulos' && (
              <div className="space-y-3">
                {COURSE_MODULES.map(mod => {
                  const isOpen = openModules[mod.id] ?? true;
                  const hasCurrentLesson = mod.classes.some(c => c.id === currentLesson.id);

                  return (
                    <div key={mod.id} className="rounded-xl border border-white/5 bg-black/25 overflow-hidden">
                      {/* Cabecera del Módulo */}
                      <button
                        onClick={() => toggleModuleAccordion(mod.id)}
                        className={`w-full p-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                          hasCurrentLesson ? 'bg-[#00e03c]/5' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-[#00e03c]">{mod.id}.</span> {mod.title.replace(/^\d+\.\s*/, '')}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {mod.classes.length} clases
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      {/* Lista de Clases con Línea Temporal Conectada */}
                      {isOpen && (
                        <div className="relative py-2 px-3 space-y-1">
                          {/* Línea conectora vertical */}
                          <div className="crehana-timeline-track" />

                          {mod.classes.map(cl => {
                            const isCurrent = currentLesson.id === cl.id;
                            const isDone = courseCompletedList.includes(cl.id);
                            const isLocked = cl.isPremium && !hasPremiumAccess;

                            return (
                              <div
                                key={cl.id}
                                onClick={() => selectLesson(cl)}
                                className={`relative pl-8 pr-2 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                                  isCurrent 
                                    ? 'bg-[#00e03c]/10 border border-[#00e03c]/30 text-white' 
                                    : 'hover:bg-white/[0.03] text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {/* Nodo en la línea temporal */}
                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">
                                  {isDone ? (
                                    <div className="w-4 h-4 rounded-full bg-[#00e03c] flex items-center justify-center text-black text-[9px] font-black shadow-[0_0_6px_#00e03c]">
                                      ✓
                                    </div>
                                  ) : isCurrent ? (
                                    <div className="w-4 h-4 rounded-full bg-[#00e03c] border-2 border-black flex items-center justify-center shadow-[0_0_8px_#00e03c]">
                                      <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                    </div>
                                  ) : isLocked ? (
                                    <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 text-[8px]">
                                      <Lock className="w-2 h-2" />
                                    </div>
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600" />
                                  )}
                                </div>

                                {/* Título de la clase y duración */}
                                <div className="min-w-0 pr-2">
                                  <div className={`text-xs font-semibold leading-snug truncate ${isCurrent ? 'text-white' : ''}`}>
                                    {cl.title}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    {cl.duration}
                                  </div>
                                </div>

                                {/* Badge REPRODUCIENDO si es la clase activa */}
                                {isCurrent ? (
                                  <span className="badge-reproduciendo shrink-0">
                                    REPRODUCIENDO
                                  </span>
                                ) : (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleLessonCompleted(course.id, cl.id);
                                    }}
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                      isDone
                                        ? 'bg-[#00e03c]/20 border-[#00e03c] text-[#00e03c]'
                                        : 'border-white/10 hover:border-[#00e03c] text-transparent'
                                    }`}
                                    title={isDone ? "Marcar como no completada" : "Marcar como completada"}
                                  >
                                    <span className="text-[9px]">✓</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ---------------- TAB: APUNTES ---------------- */}
            {playerTab === 'apuntes' && (
              <div className="space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>Nuevo Apunte</span>
                    <span className="text-[#00e03c] font-mono">{formatTime(currentTime)}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Escribe tu nota técnica asociada a este segundo del video..."
                    className="w-full bg-[#020602] border border-white/10 focus:border-[#00e03c] rounded-lg p-2.5 text-xs text-white outline-none resize-none placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#00e03c] hover:bg-[#00c534] text-black font-extrabold text-xs uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Guardar Apunte
                  </button>
                </form>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Tus apuntes guardados ({notes.length})
                  </span>
                  {notes.map(note => (
                    <div 
                      key={note.id}
                      onClick={() => jumpToNoteTime(note.time)}
                      className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[#00e03c]/30 rounded-xl space-y-1.5 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono text-[#00e03c] font-bold bg-[#00e03c]/10 px-2 py-0.5 rounded group-hover:bg-[#00e03c] group-hover:text-black transition-colors">
                          ⏱ {formatTime(note.time)}
                        </span>
                        <span className="text-slate-600">Saltar al minuto →</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- TAB: COMENTARIOS ---------------- */}
            {playerTab === 'comentarios' && (
              <div className="space-y-4">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe una pregunta para el docente..."
                    className="flex-1 bg-black/50 border border-white/10 focus:border-[#00e03c] rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00e03c] hover:bg-[#00c534] text-black font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Enviar
                  </button>
                </form>

                <div className="space-y-2.5">
                  {comments.map(c => (
                    <div key={c.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={`font-bold ${c.isInstructor ? 'text-[#00e03c]' : 'text-slate-300'}`}>
                          {c.user} {c.isInstructor && '✓ (Profesor)'}
                        </span>
                        <span className="text-slate-600">{c.date}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </aside>

      </div>

      {/* =================================================================== */}
      {/* MODAL / DRAWER: REQUISITOS DE CERTIFICACIÓN & EVALUACIÓN            */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a140a] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto crehana-scrollbar text-left"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#00e03c]" />
                  <h3 className="text-base font-black text-white uppercase">
                    Requisitos de Certificación Oficial SERAM
                  </h3>
                </div>
                <button
                  onClick={() => setShowCertModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Checklist de requisitos */}
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    progressPercent === 100 ? 'bg-[#00e03c] text-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {progressPercent === 100 ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <strong className="text-white block">1. Completar 100% de las lecciones</strong>
                    <span className="text-[11px] text-slate-400">Progreso actual: {progressPercent}% ({courseCompletedList.length}/{ALL_LESSONS.length})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    courseAssignments[course.id] ? 'bg-[#00e03c] text-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {courseAssignments[course.id] ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <strong className="text-white block">2. Entregar Proyecto Práctico / Tarea</strong>
                    <span className="text-[11px] text-slate-400">
                      {courseAssignments[course.id] ? `Archivo recibido: ${courseAssignments[course.id].fileName}` : 'Sube tu práctica o informe'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    courseExamsApproved[course.id] ? 'bg-[#00e03c] text-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {courseExamsApproved[course.id] ? '✓' : '3'}
                  </div>
                  <div className="flex-1">
                    <strong className="text-white block">3. Aprobar Evaluación Técnica (Mín. 2/3)</strong>
                    <span className="text-[11px] text-slate-400">
                      {courseExamsApproved[course.id] ? '¡Evaluación Aprobada con Honores!' : 'Evaluación disponible al finalizar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subida de tarea */}
              {!courseAssignments[course.id] && (
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-white block">Subir Proyecto Técnico</span>
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/20 hover:border-[#00e03c] rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-[#00e03c] mb-1" />
                    <span className="text-xs text-slate-300">
                      {selectedFile ? selectedFile.name : 'Haz clic para seleccionar tu PDF o ZIP'}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                    />
                  </label>
                  {selectedFile && (
                    <button
                      onClick={handleUploadTask}
                      className="w-full py-2 bg-[#00e03c] text-black font-black text-xs uppercase rounded-lg"
                    >
                      Enviar Proyecto
                    </button>
                  )}
                </div>
              )}

              {/* Examen si está aprobado */}
              {courseExamsApproved[course.id] ? (
                <div className="p-6 bg-[#00e03c]/10 border border-[#00e03c]/30 rounded-2xl text-center space-y-3">
                  <Award className="w-10 h-10 text-[#00e03c] mx-auto animate-bounce" />
                  <h4 className="text-sm font-black text-white uppercase">¡Certificado Emitido!</h4>
                  <p className="text-xs text-slate-300">Cumpliste todos los requisitos del curso {course.title.replace(/\*/g, '')}.</p>
                  <button
                    onClick={() => triggerToast('Descargando Certificado Oficial SERAM (PDF)...', 'success')}
                    className="px-6 py-2.5 bg-[#00e03c] text-black font-black text-xs uppercase rounded-xl shadow-lg"
                  >
                    Descargar Certificado (PDF)
                  </button>
                </div>
              ) : (
                /* Formulario del Quiz */
                <form onSubmit={handleSubmitQuiz} className="space-y-4 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-extrabold text-white uppercase">Evaluación Rápida</h4>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-300 font-medium">1. ¿Cuál es el marco normativo ambiental central de Bolivia?</p>
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      {['Ley General del Trabajo', 'Ley 1333 del Medio Ambiente', 'Código de Minería'].map((opt, i) => {
                        const key = ['A', 'B', 'C'][i];
                        return (
                          <label key={key} className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer ${
                            quizAnswers[1] === key ? 'bg-[#00e03c]/10 border-[#00e03c] text-white' : 'bg-black/30 border-white/5 text-slate-400'
                          }`}>
                            <input 
                              type="radio" 
                              name="q1" 
                              checked={quizAnswers[1] === key}
                              onChange={() => setQuizAnswers(p => ({ ...p, 1: key }))}
                              className="accent-[#00e03c]"
                            />
                            <span>{key}) {opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!quizAnswers[1]}
                    className="w-full py-2.5 bg-[#00e03c] disabled:opacity-40 text-black font-black text-xs uppercase rounded-xl"
                  >
                    Calificar Evaluación
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: DESCARGA DE ADJUNTOS DEL CURSO                               */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showFilesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a140a] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#00e03c]" />
                  <h3 className="text-base font-black text-white uppercase">
                    Adjuntos y Recursos de Clase
                  </h3>
                </div>
                <button
                  onClick={() => setShowFilesModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00e03c]/10 text-[#00e03c]">
                      <Map className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Capas SHP Cuencas y Ríos</div>
                      <div className="text-[10px] text-slate-400">Shapefiles vectoriales (ZIP · 14 MB)</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => triggerToast('Descargando Capas SHP...', 'success')}
                    className="p-2 bg-white/5 hover:bg-[#00e03c]/20 rounded-lg text-slate-300 hover:text-[#00e03c] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00e03c]/10 text-[#00e03c]">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Calculadora FNCA y Mitigación</div>
                      <div className="text-[10px] text-slate-400">Matriz en Excel (XLSX · 2.1 MB)</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => triggerToast('Descargando Plantilla Excel...', 'success')}
                    className="p-2 bg-white/5 hover:bg-[#00e03c]/20 rounded-lg text-slate-300 hover:text-[#00e03c] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00e03c]/10 text-[#00e03c]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Guía Interpretada Ley 1333</div>
                      <div className="text-[10px] text-slate-400">Documento de consulta (PDF · 4.8 MB)</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => triggerToast('Descargando Guía PDF...', 'success')}
                    className="p-2 bg-white/5 hover:bg-[#00e03c]/20 rounded-lg text-slate-300 hover:text-[#00e03c] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowFilesModal(false)}
                  className="px-5 py-2 bg-white/10 hover:bg-white/15 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

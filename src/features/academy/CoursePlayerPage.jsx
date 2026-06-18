import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, SkipForward, ArrowLeft, 
  BookOpen, Lock, Download, MessageSquare, Info, Star, HelpCircle, FileSpreadsheet, Map,
  Upload, Check, Award 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LESSONS = [
  { id: '1.1', title: '1.1 Bienvenidos al Programa', duration: '12 min', isPremium: false, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' },
  { id: '1.2', title: '1.2 Marco Teórico del Impacto Ambiental', duration: '25 min', isPremium: false, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4' },
  { id: '2.1', title: '2.1 Ley 1333 y Estructura Regulatoria', duration: '35 min', isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-undergrowth-of-a-green-forest-40283-large.mp4' },
  { id: '2.2', title: '2.2 Fichas Ambientales y Categorización', duration: '40 min', isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' },
  { id: '3.1', title: '3.1 Introducción a Herramientas SIG y QGIS', duration: '30 min', isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4' },
  { id: '3.2', title: '3.2 Delimitación de Cuencas Hidrográficas', duration: '45 min', isPremium: true, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-undergrowth-of-a-green-forest-40283-large.mp4' }
];

const LessonItem = React.memo(({ 
  lesson, 
  isLocked, 
  isActive, 
  isLessonCompleted, 
  onSelect, 
  onToggleCompleted 
}) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-none ${
        isActive
          ? 'bg-[#00e03c]/10 border-[#00e03c] text-[#00e03c] shadow-[0_0_15px_rgba(0,224,60,0.15)]'
          : isLocked
          ? 'bg-slate-950/40 border-white/5 text-slate-600'
          : 'bg-white/[0.02] border-white/10 hover:border-[#00e03c]/30 text-slate-400 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
          isActive
            ? 'bg-[#00e03c]/20 border-[#00e03c]/30 text-[#00e03c]'
            : isLocked
            ? 'bg-white/5 border-white/5 text-slate-700'
            : 'bg-white/5 border-white/10 text-slate-400'
        }`}>
          {isLocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : isLessonCompleted ? (
            <span className="text-[#00e03c] font-black text-sm">✓</span>
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </div>
        <div>
          <div className={`text-xs font-bold ${isActive ? 'text-white' : isLocked ? 'text-slate-600' : 'text-slate-300'}`}>
            {lesson.title}
          </div>
          <div className="text-[9px] text-slate-500 font-medium">{lesson.duration}</div>
        </div>
      </div>

      {!isLocked && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompleted();
          }}
          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
            isLessonCompleted
              ? 'bg-[#00e03c]/20 border-[#00e03c] text-[#00e03c]'
              : 'border-white/20 hover:border-[#00e03c] text-transparent hover:text-slate-500'
          }`}
          title={isLessonCompleted ? "Marcar como no completado" : "Marcar como completado"}
        >
          <span className="text-[10px]">✓</span>
        </div>
      )}
    </button>
  );
});

LessonItem.displayName = 'LessonItem';

export default function CoursePlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    courses, 
    hasPremiumAccess, 
    triggerToast,
    completedLessons,
    courseExamsApproved,
    courseAssignments,
    toggleLessonCompleted,
    approveCourseExam,
    submitAssignment
  } = useApp();

  const course = courses.find(c => c.id === parseInt(id)) || courses[0];

  // Prerrequisito
  const prerequisiteCourse = course.prerequisiteId ? courses.find(c => c.id === course.prerequisiteId) : null;
  const isPrerequisiteMet = !prerequisiteCourse || (() => {
    const prqCompleted = completedLessons[prerequisiteCourse.id] || [];
    return prqCompleted.length === LESSONS.length;
  })();

  const [currentLesson, setCurrentLesson] = useState(LESSONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'q&a' | 'about'

  // Estados locales para Tareas y Examen
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({ 1: null, 2: null, 3: null });

  const videoRef = useRef(null);
  const progressRef = useRef(null);

  // Cargar lección y reproducir automáticamente
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentLesson]);

  // Manejar eventos de actualización del video con useCallback
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback failed:', err);
      });
    }
  }, [isPlaying]);

  const handleVideoEnded = useCallback(() => {
    const currentList = completedLessons[course.id] || [];
    if (!currentList.includes(currentLesson.id)) {
      toggleLessonCompleted(course.id, currentLesson.id);
      triggerToast(`¡Lección "${currentLesson.title}" completada automáticamente!`, 'success');
    }
  }, [completedLessons, course.id, currentLesson, toggleLessonCompleted, triggerToast]);

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
        return prev + 10;
      });
    }, 200);
  }, [course.id, selectedFile, submitAssignment, triggerToast]);

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
      triggerToast(`Obtuviste ${correctCount}/3 correctas. Se requiere al menos 2/3 para aprobar. Intenta de nuevo.`, 'error');
    }
  }, [course.id, quizAnswers, approveCourseExam, triggerToast]);

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

  const handleSeek = useCallback((e) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const seekTime = percentage * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  }, [duration]);

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
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectLesson = useCallback((lesson) => {
    if (lesson.isPremium && !hasPremiumAccess) {
      triggerToast('Esta lección requiere membresía Premium.', 'error');
      return;
    }
    setCurrentLesson(lesson);
    triggerToast(`Cargando: ${lesson.title}`, 'info');
  }, [hasPremiumAccess, triggerToast]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Q&A Mock
  const [comments, setComments] = useState([
    { id: 1, user: 'Rodrigo Camacho', date: 'Hace 2 horas', text: '¿Dónde puedo descargar las capas SHP del Valle de Zongo para hacer la práctica?' },
    { id: 2, user: 'Ing. Diego Barrientos', date: 'Hace 1 hora', text: 'Hola Rodrigo, las capas están en la pestaña "Recursos" justo al lado de esta sección de preguntas.' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = useCallback((e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      { id: Date.now(), user: 'Tú (Estudiante)', date: 'Hace un momento', text: newComment }
    ]);
    setNewComment('');
    triggerToast('Comentario agregado al foro.', 'success');
  }, [newComment, triggerToast]);

  if (!isPrerequisiteMet && prerequisiteCourse) {
    return (
      <div className="inner-page max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="neuform-card p-12 space-y-6 backdrop-blur-xl">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Curso Bloqueado</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Para desbloquear este programa avanzado, debes completar primero el curso troncal:
            <br />
            <span className="text-white font-extrabold text-base mt-2 block">{prerequisiteCourse.title}</span>
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate('/academy')}
              className="neuform-btn-accent px-8 py-3 rounded-xl cursor-none text-xs font-black tracking-widest uppercase"
            >
              Ir a la Academia
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="inner-page max-w-7xl mx-auto space-y-6 text-left"
    >
      {/* Volver */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/academy')}
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-slate-400 hover:text-[#00e03c] hover:border-[#00e03c]/30 transition-all cursor-none pointer-events-auto shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          data-cursor-text="VOLVER"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-tech">SERAM ACADEMY · REPRODUCTOR</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">{course.title}</h1>
        </div>
      </div>

      {/* Grid del Reproductor y el Temario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Reproductor de Video (Capa de Video) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 group flex flex-col justify-end pointer-events-auto">
            
            {/* Elemento de Video Nativo */}
            <video
              ref={videoRef}
              src={currentLesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover"
            />

            {/* Controles Vidriomórficos (z-20) */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3 z-20 pointer-events-auto">
              
              {/* Barra de Progreso */}
              <div 
                ref={progressRef}
                onClick={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-full cursor-none relative flex items-center"
              >
                <div 
                  className="h-full bg-[#00e03c] rounded-full" 
                  style={{ width: `${progressPercent}%` }}
                />
                <div 
                  className="w-3.5 h-3.5 rounded-full bg-white shadow absolute"
                  style={{ left: `calc(${progressPercent}% - 7px)` }}
                />
              </div>

              {/* Botones de Control */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="p-1 text-white hover:text-[#00e03c] transition-colors cursor-none">
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                  <button onClick={() => triggerToast('Siguiente lección', 'info')} className="p-1 text-white hover:text-[#00e03c] transition-colors cursor-none">
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                  <span className="text-xs text-slate-300 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Volumen */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="p-1 text-white hover:text-[#00e03c] transition-colors cursor-none">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 accent-[#00e03c] h-1 bg-white/20 rounded-lg cursor-none"
                    />
                  </div>
                  <button onClick={handleFullscreen} className="p-1 text-white hover:text-[#00e03c] transition-colors cursor-none">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas de Apoyo (Recursos, Discusión, Acerca de) */}
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap border-b border-white/[0.06] pb-2">
              {[
                { id: 'resources', label: 'Recursos Descargables', icon: <Download className="w-4 h-4" /> },
                { id: 'homework', label: 'Subir Tarea', icon: <Upload className="w-4 h-4" /> },
                { id: 'exam', label: 'Examen Final', icon: <Award className="w-4 h-4" /> },
                { id: 'q&a', label: 'Foro de Consultas (Q&A)', icon: <MessageSquare className="w-4 h-4" /> },
                { id: 'about', label: 'Acerca del Curso', icon: <Info className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-none pointer-events-auto ${
                    activeTab === tab.id
                      ? 'border-[#00e03c] text-[#00e03c]'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              {activeTab === 'resources' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pointer-events-auto">
                  <div className="neuform-card p-4 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#00e03c]/10 text-[#00e03c] rounded-xl">
                        <Map className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">Capas SIG Valle de Zongo</div>
                        <div className="text-[10px] text-slate-500">Shapefiles vectoriales comprimidos (ZIP · 12 MB)</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => triggerToast('Descargando Shapefiles...', 'success')}
                      className="p-2 bg-white/5 hover:bg-[#00e03c]/10 rounded-lg text-slate-400 hover:text-[#00e03c] cursor-none"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="neuform-card p-4 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#00e03c]/10 text-[#00e03c] rounded-xl">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">Calculadora de Huella de Carbono</div>
                        <div className="text-[10px] text-slate-500">Plantilla automatizada de factores (XLSX · 1.5 MB)</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => triggerToast('Descargando Calculadora...', 'success')}
                      className="p-2 bg-white/5 hover:bg-[#00e03c]/10 rounded-lg text-slate-400 hover:text-[#00e03c] cursor-none"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'homework' && (
                <div className="space-y-4 pointer-events-auto">
                  {courseAssignments[course.id] ? (
                    <div className="neuform-card p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#00e03c]/10 border border-[#00e03c]/30 flex items-center justify-center text-[#00e03c]">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white uppercase font-sans">Tarea Entregada</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Archivo: <span className="text-white font-mono">{courseAssignments[course.id].fileName}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Enviado el: {new Date(courseAssignments[course.id].submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => submitAssignment(course.id, null)}
                        className="text-xs text-red-400 hover:text-red-300 underline cursor-none"
                      >
                        Eliminar entrega y volver a subir
                      </button>
                    </div>
                  ) : (
                    <div className="neuform-card p-8 text-center space-y-6">
                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mx-auto text-slate-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white uppercase font-sans">Evidencia de Aprendizaje</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                          Sube tu archivo de práctica (capas QGIS, informe PDF, factor de cálculo) para comprobar tu aprendizaje en este curso.
                        </p>
                      </div>

                      {selectedFile ? (
                        <div className="space-y-4 max-w-xs mx-auto">
                          <div className="text-xs font-bold text-white bg-slate-900 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                            <span className="truncate pr-2">{selectedFile.name}</span>
                            <button onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-300 font-extrabold cursor-none">✕</button>
                          </div>
                          {uploadProgress !== null ? (
                            <div className="space-y-2">
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#00e03c] h-full rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-400 font-tech">Subiendo... {uploadProgress}%</span>
                            </div>
                          ) : (
                            <button
                              onClick={handleUploadTask}
                              className="neuform-btn-accent w-full justify-center !rounded-xl text-xs py-3 font-bold uppercase tracking-wider"
                            >
                              Entregar Tarea
                            </button>
                          )}
                        </div>
                      ) : (
                        <label className="inline-block">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setSelectedFile(e.target.files[0]);
                              }
                            }}
                          />
                          <span className="neuform-btn-primary cursor-none inline-flex items-center gap-2 py-3 px-6 !rounded-xl text-xs font-black uppercase tracking-wider">
                            Seleccionar Archivo
                          </span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'exam' && (() => {
                const prgCount = (completedLessons[course.id] || []).length;
                const isExamUnlocked = prgCount === LESSONS.length;
                const isApproved = courseExamsApproved[course.id];

                if (!isExamUnlocked) {
                  return (
                    <div className="neuform-card p-8 text-center space-y-4 pointer-events-auto">
                      <div className="w-16 h-16 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center mx-auto text-slate-600">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-extrabold text-white uppercase font-sans">Examen Bloqueado</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Debes visualizar y completar el 100% de las lecciones del temario para poder desbloquear tu examen final.
                        <br />
                        <span className="text-[#00e03c] font-bold mt-1 block">Progreso actual: {prgCount} de {LESSONS.length} lecciones</span>
                      </p>
                    </div>
                  );
                }

                if (isApproved) {
                  return (
                    <div className="neuform-card p-8 text-center space-y-6 pointer-events-auto">
                      <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400 animate-bounce">
                        <Award className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white uppercase font-sans">¡Certificación Aprobada!</h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                          Has superado con éxito la evaluación final de <strong>{course.title}</strong> con una calificación sobresaliente. Tu certificado digital ha sido emitido.
                        </p>
                      </div>
                      <button
                        onClick={() => triggerToast('Descargando Certificado Oficial SERAM (PDF)...', 'success')}
                        className="neuform-btn-accent cursor-none px-8 py-3 !rounded-xl text-xs font-black uppercase tracking-widest"
                      >
                        Descargar Certificado
                      </button>
                    </div>
                  );
                }

                return (
                  <form onSubmit={handleSubmitQuiz} className="neuform-card p-6 space-y-6 pointer-events-auto text-left">
                    <div className="border-b border-white/5 pb-4 flex justify-between items-center">
                      <h4 className="text-sm font-extrabold text-white uppercase font-sans">Evaluación Final Interactiva</h4>
                      <span className="neuform-badge neuform-badge-accent">3 Preguntas</span>
                    </div>

                    <div className="space-y-6">
                      {/* Q1 */}
                      <div className="space-y-2.5">
                        <p className="text-xs font-bold text-slate-300">1. ¿Cuál es el marco normativo principal para la prevención y control ambiental en Bolivia?</p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { key: 'A', label: 'Ley de Autonomías' },
                            { key: 'B', label: 'Ley 1333 del Medio Ambiente' },
                            { key: 'C', label: 'Ley General del Trabajo' }
                          ].map(opt => (
                            <label key={opt.key} className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-none transition-all ${
                              quizAnswers[1] === opt.key ? 'bg-[#00e03c]/5 border-[#00e03c] text-white' : 'bg-slate-950/20 border-white/5 text-slate-400 hover:border-white/20'
                            }`}>
                              <input
                                type="radio"
                                name="q1"
                                checked={quizAnswers[1] === opt.key}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, 1: opt.key }))}
                                className="accent-[#00e03c] cursor-none"
                              />
                              <span>{opt.key}) {opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q2 */}
                      <div className="space-y-2.5">
                        <p className="text-xs font-bold text-slate-300">2. ¿Qué herramienta SIG es más empleada y recomendada para la delimitación de cuencas?</p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { key: 'A', label: 'AutoCAD Map 3D' },
                            { key: 'B', label: 'Adobe Illustrator' },
                            { key: 'C', label: 'QGIS (Software Libre)' }
                          ].map(opt => (
                            <label key={opt.key} className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-none transition-all ${
                              quizAnswers[2] === opt.key ? 'bg-[#00e03c]/5 border-[#00e03c] text-white' : 'bg-slate-950/20 border-white/5 text-slate-400 hover:border-white/20'
                            }`}>
                              <input
                                type="radio"
                                name="q2"
                                checked={quizAnswers[2] === opt.key}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, 2: opt.key }))}
                                className="accent-[#00e03c] cursor-none"
                              />
                              <span>{opt.key}) {opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Q3 */}
                      <div className="space-y-2.5">
                        <p className="text-xs font-bold text-slate-300">3. ¿Qué representa una Ficha Ambiental en la categorización del impacto?</p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { key: 'A', label: 'Un documento de inicio para definir la categoría del proyecto' },
                            { key: 'B', label: 'El título final de licencia ambiental' },
                            { key: 'C', label: 'Una multa de cobro por infracciones' }
                          ].map(opt => (
                            <label key={opt.key} className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-none transition-all ${
                              quizAnswers[3] === opt.key ? 'bg-[#00e03c]/5 border-[#00e03c] text-white' : 'bg-slate-950/20 border-white/5 text-slate-400 hover:border-white/20'
                            }`}>
                              <input
                                type="radio"
                                name="q3"
                                checked={quizAnswers[3] === opt.key}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, 3: opt.key }))}
                                className="accent-[#00e03c] cursor-none"
                              />
                              <span>{opt.key}) {opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <button
                        type="submit"
                        disabled={!quizAnswers[1] || !quizAnswers[2] || !quizAnswers[3]}
                        className="neuform-btn-accent cursor-none px-6 py-3 !rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Enviar Examen
                      </button>
                    </div>
                  </form>
                );
              })()}

              {activeTab === 'q&a' && (
                <div className="space-y-4 pointer-events-auto">
                  {/* Lista de comentarios */}
                  <div className="space-y-3">
                    {comments.map(c => (
                      <div key={c.id} className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-300">{c.user}</span>
                          <span className="text-slate-600">{c.date}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Escribir comentario */}
                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Haz una pregunta o deja una duda..."
                      className="flex-1 bg-slate-950/40 border border-white/10 focus:border-[#00e03c]/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:shadow-[0_0_12px_rgba(0,224,60,0.1)] transition-all"
                    />
                    <button
                      type="submit"
                      className="neuform-btn-accent cursor-none px-5 py-2.5 !rounded-xl text-xs font-black uppercase tracking-wider"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="neuform-card p-6 space-y-3 pointer-events-auto">
                  <div className="flex gap-2 items-center text-xs font-extrabold text-[#00e03c] uppercase">
                    <Info className="w-4 h-4" /> Resumen Académico del Módulo
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Este programa académico tiene como propósito transferir metodologías prácticas aplicadas directamente al contexto geográfico boliviano. El instructor <strong>{course.instructor}</strong> responde activamente consultas en el foro técnico durante los días hábiles.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Temario / Lista de Lecciones Lateral */}
        <div className="lg:col-span-4 space-y-4 pointer-events-auto">
          <div className="neuform-card p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00e03c]" /> Temario del Programa
            </h3>

            {/* Curso Progress Bar */}
            {(() => {
              const currentList = completedLessons[course.id] || [];
              const prg = Math.round((currentList.length / LESSONS.length) * 100);
              return (
                <div className="space-y-1.5 border-b border-white/5 pb-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Progreso del Curso</span>
                    <span className="text-[#00e03c]">{prg}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00e03c] h-full rounded-full transition-all duration-300" style={{ width: `${prg}%` }} />
                  </div>
                </div>
              );
            })()}
            
            <div className="space-y-2.5">
              {LESSONS.map(lesson => {
                const isLocked = lesson.isPremium && !hasPremiumAccess;
                const isActive = currentLesson.id === lesson.id;
                const courseCompletedList = completedLessons[course.id] || [];
                const isLessonCompleted = courseCompletedList.includes(lesson.id);
                
                return (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isLocked={isLocked}
                    isActive={isActive}
                    isLessonCompleted={isLessonCompleted}
                    onSelect={() => selectLesson(lesson)}
                    onToggleCompleted={() => toggleLessonCompleted(course.id, lesson.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

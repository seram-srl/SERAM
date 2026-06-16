import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, SkipForward, ArrowLeft, 
  BookOpen, Lock, Download, MessageSquare, Info, Star, HelpCircle, FileSpreadsheet, Map 
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

export default function CoursePlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, hasPremiumAccess, triggerToast } = useApp();

  const course = courses.find(c => c.id === parseInt(id)) || courses[0];

  const [currentLesson, setCurrentLesson] = useState(LESSONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'q&a' | 'about'

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

  // Manejar eventos de actualización del video
  const togglePlay = () => {
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
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
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
  };

  const handleSeek = (e) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const seekTime = percentage * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectLesson = (lesson) => {
    if (lesson.isPremium && !hasPremiumAccess) {
      triggerToast('Esta lección requiere membresía Premium.', 'error');
      return;
    }
    setCurrentLesson(lesson);
    triggerToast(`Cargando: ${lesson.title}`, 'info');
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Q&A Mock
  const [comments, setComments] = useState([
    { id: 1, user: 'Rodrigo Camacho', date: 'Hace 2 horas', text: '¿Dónde puedo descargar las capas SHP del Valle de Zongo para hacer la práctica?' },
    { id: 2, user: 'Ing. Diego Barrientos', date: 'Hace 1 hora', text: 'Hola Rodrigo, las capas están en la pestaña "Recursos" justo al lado de esta sección de preguntas.' }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      { id: Date.now(), user: 'Tú (Estudiante)', date: 'Hace un momento', text: newComment }
    ]);
    setNewComment('');
    triggerToast('Comentario agregado al foro.', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 text-left"
    >
      {/* Volver */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/academy')}
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all cursor-none pointer-events-auto"
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
              className="w-full h-full object-cover"
              loop
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
            <div className="flex gap-4 border-b border-white/[0.06] pb-2">
              {[
                { id: 'resources', label: 'Recursos Descargables', icon: <Download className="w-4 h-4" /> },
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
                  <div className="glass-panel-dark p-4 rounded-2xl border border-white/[0.06] flex items-center justify-between hover:border-[#00e03c]/20 transition-all">
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

                  <div className="glass-panel-dark p-4 rounded-2xl border border-white/[0.06] flex items-center justify-between hover:border-[#00e03c]/20 transition-all">
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
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] focus:border-[#00e03c]/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#00e03c] text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#00e03c]/90 cursor-none"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="glass-panel-dark rounded-2xl p-6 border border-white/[0.06] space-y-3 pointer-events-auto">
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
          <div className="glass-panel-dark rounded-2xl p-5 border border-white/[0.06] space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00e03c]" /> Temario del Programa
            </h3>
            
            <div className="space-y-2.5">
              {LESSONS.map(lesson => {
                const isLocked = lesson.isPremium && !hasPremiumAccess;
                const isActive = currentLesson.id === lesson.id;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-none ${
                      isActive
                        ? 'bg-[#00e03c]/10 border-[#00e03c] text-[#00e03c]'
                        : isLocked
                        ? 'bg-slate-950/20 border-white/[0.03] text-slate-600'
                        : 'bg-white/[0.03] border-white/[0.05] hover:border-white/12 text-slate-400 hover:text-white'
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
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isActive ? 'text-white' : isLocked ? 'text-slate-600' : 'text-slate-300'}`}>
                          {lesson.title}
                        </div>
                        <div className="text-[9px] text-slate-500 font-medium">{lesson.duration}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

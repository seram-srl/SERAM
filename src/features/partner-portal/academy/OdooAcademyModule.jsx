import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenCheck, Plus, Search, LayoutGrid, List, Edit2, Trash2, Copy,
  Eye, EyeOff, ExternalLink, UploadCloud, Video, FileText, Image as ImageIcon,
  CheckCircle2, Clock, Users, Layers, X, Film, Paperclip, Globe,
  Award, Lock, Unlock, Play, RefreshCw, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { uploadProjectDocument } from '../../../services/projectStorageService';
import {
  saveCourseMediaBlob,
  resolveCourseMediaUrl,
  fileToDataUrlCompressed,
  formatFileSize,
  isIndexedDbMediaUrl
} from '../../../services/courseMediaStorage';

const ODOO_COVER_GALLERY = [
  { label: 'Guía Ley 1333', url: '/assets/covers/cover_ebook_ley1333.png' },
  { label: 'Regularización AACD / Mentoría', url: '/assets/covers/cover_mentoria_consultoria.png' },
  { label: 'Industria & Seguridad', url: '/assets/3d-backend/panel2-service-background.webp' },
  { label: 'Huella de Carbono ISO', url: '/assets/3d-backend/huella_carbono_iso.webp' },
  { label: 'Registro Ambiental RAI', url: '/assets/3d-backend/registro_rai_inspiration.png' }
];

const TRACK_OPTIONS = [
  'Trámites & Licencias',
  'Derecho & Normativa',
  'Formatos & Carimbos',
  'Gestión de Residuos'
];

const CATEGORY_OPTIONS = [
  { id: 'tramites', label: 'Trámites & Licencias' },
  { id: 'regularizacion', label: 'Evaluación & Regularización' },
  { id: 'formatos', label: 'Formatos, E-Books & Carimbos' },
  { id: 'residuos', label: 'Residuos Sólidos (Ley 755)' }
];

const LEVEL_OPTIONS = [
  'Básico / Fundamentos',
  'Intermedio / Aplicado',
  'Avanzado / Profesional'
];

const TICKET_OPTIONS = [
  { id: 'gratis', label: 'Gratis (Lead Magnet / Bs. 0)', defaultPrice: 0 },
  { id: 'low_ticket', label: 'Low Ticket (Bs. 20 - 60)', defaultPrice: 45 },
  { id: 'mid_ticket', label: 'Mid Ticket (Bs. 80 - 200)', defaultPrice: 120 },
  { id: 'high_ticket', label: 'High Ticket (Bs. 220+)', defaultPrice: 350 }
];

const ODOO_STATUS_FLOW = ['Borrador', 'En Revisión', 'Publicado'];

function normalizeTitlePlain(title) {
  return String(title || '').replace(/\*/g, '');
}

function getStatusBadgeClass(status) {
  if (status === 'Publicado' || status === 'Activo') {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }
  if (status === 'En Revisión') {
    return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  }
  return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
}

function buildEmptyCourse(registeredEngineers = []) {
  const defaultInstructor = registeredEngineers?.[0]?.name || 'Ing. Diego Barrientos';
  return {
    id: null,
    title: '',
    instructor: defaultInstructor,
    students: 0,
    status: 'Borrador',
    isPremium: true,
    type: 'mid_ticket',
    format: 'video',
    hasVideo: true,
    price: 120,
    image: '/assets/covers/cover_ebook_ley1333.png',
    duration: '12 horas prácticas',
    pages: 60,
    version: 'Edición 2026',
    desc: '',
    category: 'tramites',
    tags: ['tramites'],
    level: 'Intermedio / Aplicado',
    track: 'Trámites & Licencias',
    pdfUrl: '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf',
    pdfName: 'Documento_Tecnico_SERAM.pdf',
    resources: [],
    modules: [
      {
        id: `mod-${Date.now()}`,
        title: 'Módulo 1: Fundamentos y Marco Normativo',
        lessons: [
          {
            id: `les-${Date.now()}`,
            title: '1.1 Introducción y Alcance Técnico del Programa',
            duration: '14:20 min',
            videoUrl: '/assets/videos/seram_academy_funcionamiento.mp4',
            isPremium: false
          }
        ]
      }
    ]
  };
}

function VideoPreviewPlayer({ videoUrl }) {
  const [resolvedUrl, setResolvedUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!videoUrl) {
        setResolvedUrl('');
        return;
      }
      setLoading(true);
      const url = await resolveCourseMediaUrl(videoUrl);
      if (active) {
        setResolvedUrl(url);
        setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 text-[11px] text-slate-500 flex items-center gap-2">
        <Film className="w-4 h-4 text-slate-600" /> Sin archivo de video asignado todavía
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00e03c]" /> Cargando vista previa del video...
      </div>
    );
  }

  if (!resolvedUrl) {
    return (
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" /> Video local guardado en otro dispositivo/sesión. Vuelve a subirlo o pega una URL HTTPS.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
      <video
        src={resolvedUrl}
        controls
        className="w-full max-h-44 object-contain bg-black"
        preload="metadata"
      />
    </div>
  );
}

export default function OdooAcademyModule({
  courses = [],
  registeredEngineers = [],
  currentSocio = null,
  handlers = {}
}) {
  const navigate = useNavigate();
  const {
    handleAddCourse: ctxAddCourse,
    handleUpdateCourse: ctxUpdateCourse,
    handleDeleteCourse: ctxDeleteCourse,
    handleToggleCoursePremium: ctxTogglePremium,
    handleToggleCoursePublished: ctxTogglePublished,
    handleDuplicateCourse: ctxDuplicateCourse,
    triggerToast
  } = useApp();

  const onAddCourse = handlers.handleAddCourse || ctxAddCourse;
  const onUpdateCourse = handlers.handleUpdateCourse || ctxUpdateCourse;
  const onDeleteCourse = handlers.handleDeleteCourse || ctxDeleteCourse;
  const onTogglePremium = handlers.handleToggleCoursePremium || ctxTogglePremium;
  const onTogglePublished = handlers.handleToggleCoursePublished || ctxTogglePublished;
  const onDuplicateCourse = handlers.handleDuplicateCourse || ctxDuplicateCourse;

  // Sub-tabs de Odoo eLearning
  const [subApp, setSubApp] = useState('courses'); // 'courses' | 'materials' | 'analytics'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [facetFilter, setFacetFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'video' | 'pdf'

  // Modal Odoo 360 Form Sheet
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTab, setFormTab] = useState('general'); // 'general' | 'curriculum' | 'materials'
  const [editingCourse, setEditingCourse] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingLessonId, setUploadingLessonId] = useState(null);
  const [savingForm, setSavingForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [previewLessonVideoUrl, setPreviewLessonVideoUrl] = useState(null);

  const normalizedCourses = useMemo(() => {
    return (courses || []).map(c => ({
      ...c,
      status: c.status === 'Activo' ? 'Publicado' : (c.status || 'Publicado'),
      format: c.format || (c.hasVideo === false ? 'pdf' : 'video')
    }));
  }, [courses]);

  const metrics = useMemo(() => {
    const total = normalizedCourses.length;
    const published = normalizedCourses.filter(c => c.status === 'Publicado').length;
    const drafts = normalizedCourses.filter(c => c.status !== 'Publicado').length;
    const videoCount = normalizedCourses.filter(c => c.format !== 'pdf').length;
    const pdfCount = normalizedCourses.filter(c => c.format === 'pdf').length;
    const totalStudents = normalizedCourses.reduce((acc, c) => acc + (Number(c.students) || 0), 0);
    const totalLessons = normalizedCourses.reduce(
      (acc, c) => acc + (c.modules || []).reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0),
      0
    );
    return { total, published, drafts, videoCount, pdfCount, totalStudents, totalLessons };
  }, [normalizedCourses]);

  const filteredCourses = useMemo(() => {
    return normalizedCourses.filter(course => {
      if (subApp === 'materials' && course.format !== 'pdf' && !course.pdfUrl) return false;
      if (facetFilter === 'published' && course.status !== 'Publicado') return false;
      if (facetFilter === 'draft' && course.status === 'Publicado') return false;
      if (facetFilter === 'video' && course.format === 'pdf') return false;
      if (facetFilter === 'pdf' && course.format !== 'pdf') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${course.title} ${course.instructor} ${course.track || ''} ${course.desc || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [normalizedCourses, subApp, facetFilter, searchQuery]);

  const openCreateModal = (defaultFormat = 'video') => {
    const draft = buildEmptyCourse(registeredEngineers);
    if (defaultFormat === 'pdf') {
      draft.format = 'pdf';
      draft.hasVideo = false;
      draft.type = 'gratis';
      draft.price = 0;
      draft.duration = 'Documento Descargable (PDF)';
      draft.image = '/assets/covers/cover_ebook_ley1333.png';
      draft.track = 'Formatos & Carimbos';
      draft.category = 'formatos';
    }
    setEditingCourse(draft);
    setFormTab('general');
    setPreviewLessonVideoUrl(null);
    setIsFormOpen(true);
  };

  const openEditModal = (course, initialTab = 'general') => {
    const cloned = JSON.parse(JSON.stringify(course));
    if (!Array.isArray(cloned.modules) || cloned.modules.length === 0) {
      cloned.modules = buildEmptyCourse(registeredEngineers).modules;
    }
    if (!Array.isArray(cloned.resources)) {
      cloned.resources = [];
    }
    cloned.status = cloned.status === 'Activo' ? 'Publicado' : (cloned.status || 'Publicado');
    setEditingCourse(cloned);
    setFormTab(initialTab);
    setPreviewLessonVideoUrl(null);
    setIsFormOpen(true);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingCourse) return;
    if (!file.type.startsWith('image/')) {
      triggerToast?.('Selecciona un archivo de imagen (PNG, JPG o WebP)', 'error');
      return;
    }
    setUploadingCover(true);
    try {
      const compressedDataUrl = await fileToDataUrlCompressed(file, 960, 0.84);
      setEditingCourse(prev => ({ ...prev, image: compressedDataUrl }));
      triggerToast?.('Carátula personalizada cargada y optimizada', 'success');
    } catch {
      triggerToast?.('No se pudo procesar la carátula seleccionada', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingCourse) return;
    if (file.type !== 'application/pdf') {
      triggerToast?.('Sube un archivo en formato PDF válido', 'error');
      return;
    }
    setUploadingPdf(true);
    try {
      const projectId = editingCourse.id || 'temp_course';
      const result = await uploadProjectDocument(file, projectId);
      setEditingCourse(prev => ({
        ...prev,
        pdfUrl: result.url,
        pdfName: result.name
      }));
      triggerToast?.(`Material PDF cargado (${result.name})`, 'success');
    } catch (err) {
      triggerToast?.(err.message || 'Error al cargar PDF', 'error');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleResourceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingCourse) return;
    try {
      const uploaded = await uploadProjectDocument(file, editingCourse.id || 'resource');
      setEditingCourse(prev => ({
        ...prev,
        resources: [
          ...(prev.resources || []),
          {
            name: uploaded.name,
            size: formatFileSize(uploaded.size || file.size),
            url: uploaded.url
          }
        ]
      }));
      triggerToast?.(`Adjunto "${uploaded.name}" añadido al material`, 'success');
    } catch (err) {
      triggerToast?.(err.message || 'No se pudo adjuntar el documento', 'error');
    }
  };

  const handleAddModule = () => {
    setEditingCourse(prev => ({
      ...prev,
      modules: [
        ...(prev.modules || []),
        {
          id: `mod-${Date.now()}`,
          title: `Módulo ${(prev.modules?.length || 0) + 1}: Nuevo Módulo Temático`,
          lessons: []
        }
      ]
    }));
  };

  const handleUpdateModuleTitle = (modIdx, title) => {
    setEditingCourse(prev => {
      const mods = [...(prev.modules || [])];
      mods[modIdx] = { ...mods[modIdx], title };
      return { ...prev, modules: mods };
    });
  };

  const handleDeleteModule = (modIdx) => {
    setEditingCourse(prev => ({
      ...prev,
      modules: (prev.modules || []).filter((_, i) => i !== modIdx)
    }));
  };

  const handleAddLesson = (modIdx) => {
    setEditingCourse(prev => {
      const mods = [...(prev.modules || [])];
      const mod = mods[modIdx];
      const nextIndex = (mod.lessons?.length || 0) + 1;
      const newLesson = {
        id: `les-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `${modIdx + 1}.${nextIndex} Nueva Clase Práctica`,
        duration: '15:00 min',
        videoUrl: '/assets/videos/seram_academy_funcionamiento.mp4',
        isPremium: prev.isPremium ?? true
      };
      mods[modIdx] = { ...mod, lessons: [...(mod.lessons || []), newLesson] };
      return { ...prev, format: 'video', hasVideo: true, modules: mods };
    });
  };

  const handleUpdateLesson = (modIdx, lesIdx, field, value) => {
    setEditingCourse(prev => {
      const mods = [...(prev.modules || [])];
      const lessons = [...(mods[modIdx].lessons || [])];
      lessons[lesIdx] = { ...lessons[lesIdx], [field]: value };
      mods[modIdx] = { ...mods[modIdx], lessons };
      return { ...prev, modules: mods };
    });
  };

  const handleDeleteLesson = (modIdx, lesIdx) => {
    setEditingCourse(prev => {
      const mods = [...(prev.modules || [])];
      mods[modIdx] = {
        ...mods[modIdx],
        lessons: (mods[modIdx].lessons || []).filter((_, i) => i !== lesIdx)
      };
      return { ...prev, modules: mods };
    });
  };

  const handleLessonVideoUpload = async (modIdx, lesIdx, file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      triggerToast?.('Formato no válido. Sube un video MP4, WebM o MOV', 'error');
      return;
    }
    const lessonObj = editingCourse?.modules?.[modIdx]?.lessons?.[lesIdx];
    setUploadingLessonId(lessonObj?.id || `${modIdx}-${lesIdx}`);
    try {
      const saved = await saveCourseMediaBlob(file, `course_${editingCourse?.id || 'new'}`);
      setEditingCourse(prev => {
        const mods = [...(prev.modules || [])];
        const lessons = [...(mods[modIdx].lessons || [])];
        lessons[lesIdx] = {
          ...lessons[lesIdx],
          videoUrl: saved.url,
          videoFileName: saved.name,
          duration: saved.durationLabel || lessons[lesIdx].duration || '15:00 min'
        };
        mods[modIdx] = { ...mods[modIdx], lessons };
        return { ...prev, format: 'video', hasVideo: true, modules: mods };
      });
      setPreviewLessonVideoUrl(saved.url);
      triggerToast?.(`Video "${saved.name}" guardado (${formatFileSize(saved.size)})`, 'success');
    } catch (err) {
      triggerToast?.(err.message || 'Error al subir el video', 'error');
    } finally {
      setUploadingLessonId(null);
    }
  };

  const handleSaveCourseForm = async (e) => {
    if (e) e.preventDefault();
    if (!editingCourse?.title?.trim() || !editingCourse?.instructor?.trim()) {
      triggerToast?.('El título y el docente/instructor son obligatorios', 'error');
      return;
    }
    setSavingForm(true);
    try {
      const payload = {
        ...editingCourse,
        hasVideo: editingCourse.format !== 'pdf',
        price: Number(editingCourse.price) || 0,
        isPremium: editingCourse.type !== 'gratis' && (Number(editingCourse.price) || 0) > 0
          ? editingCourse.isPremium
          : editingCourse.type !== 'gratis',
        tags: [editingCourse.category, editingCourse.format === 'pdf' ? 'formatos' : 'video'].filter(Boolean)
      };

      if (editingCourse.id) {
        await onUpdateCourse(editingCourse.id, payload);
      } else {
        await onAddCourse(payload);
      }
      setIsFormOpen(false);
      setEditingCourse(null);
    } finally {
      setSavingForm(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    await onDeleteCourse(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* ── 1. ODOO eLEARNING SUB-NAVBAR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0f172a]/90 border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2.5 pr-3 border-r border-white/10">
            <div className="w-8 h-8 rounded-lg bg-[#00e03c]/15 border border-[#00e03c]/30 flex items-center justify-center">
              <BookOpenCheck className="w-4 h-4 text-[#00e03c]" />
            </div>
            <div>
              <p className="text-xs font-black text-white leading-none">Odoo eLearning</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Sincronizado con Crehana</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubApp('courses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subApp === 'courses'
                ? 'bg-[#00e03c] text-slate-950 shadow-md shadow-[#00e03c]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Cursos y Programas ({metrics.total})
          </button>
          <button
            type="button"
            onClick={() => setSubApp('materials')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subApp === 'materials'
                ? 'bg-[#00e03c] text-slate-950 shadow-md shadow-[#00e03c]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Material Informativo &amp; PDF ({metrics.pdfCount})
          </button>
          <button
            type="button"
            onClick={() => setSubApp('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subApp === 'analytics'
                ? 'bg-[#00e03c] text-slate-950 shadow-md shadow-[#00e03c]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Analítica del Campus
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openCreateModal('pdf')}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" /> + Nuevo Material PDF
          </button>
          <button
            type="button"
            onClick={() => openCreateModal('video')}
            className="px-4 py-2 rounded-xl bg-[#00e03c] hover:bg-white text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-[#00e03c]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Curso / Aula
          </button>
        </div>
      </div>

      {/* ── 2. ODOO SMART STATS BAR ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Catálogo', value: metrics.total, icon: Layers, accent: 'text-white' },
          { label: 'Publicados Web', value: metrics.published, icon: Globe, accent: 'text-emerald-400' },
          { label: 'En Borrador / Rev.', value: metrics.drafts, icon: EyeOff, accent: 'text-amber-400' },
          { label: 'Clases en Video', value: metrics.totalLessons, icon: Film, accent: 'text-sky-400' },
          { label: 'Alumnos Inscritos', value: metrics.totalStudents, icon: Users, accent: 'text-[#00e03c]' }
        ].map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <div key={i} className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                <p className={`text-xl font-black mt-0.5 ${stat.accent}`}>{stat.value}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center">
                <IconComp className={`w-4 h-4 ${stat.accent}`} />
              </div>
            </div>
          );
        })}
      </div>

      {subApp === 'analytics' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00e03c]" /> Rendimiento por Programa
            </h3>
            <div className="space-y-3">
              {normalizedCourses.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={c.image} alt={normalizeTitlePlain(c.title)} className="w-12 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{normalizeTitlePlain(c.title)}</p>
                      <p className="text-[10px] text-slate-400">{c.track || 'General'} · {c.instructor}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-[#00e03c]">{c.students || 0} alumnos</p>
                    <p className="text-[10px] text-slate-400">{c.price > 0 ? `Bs. ${c.price}` : 'Gratuito'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Estado de Sincronización Crehana &amp; Odoo
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <p className="font-bold text-emerald-300">Publicación Directa al Campus Público</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Todo curso en estado <strong>Publicado</strong> aparece automáticamente en SERAM Academy (`/academy`). Al cambiarlo a <strong>Borrador</strong> se oculta sin perder alumnos ni videos.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                <p className="font-bold text-sky-300">Almacenamiento Local IndexedDB para Videos HD</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Los videos subidos desde PC se guardan en IndexedDB sin saturar la cuota de navegador y se reproducen instantáneamente en el Aula Virtual estilo Crehana.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <span>Socio Responsable Actual:</span>
                <span className="font-bold text-white">{currentSocio?.name || 'Director SERAM'}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── 3. ODOO CONTROL PANEL (BUSCADOR, FACETAS, VISTAS) ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0f172a]/60 border border-white/10 rounded-2xl p-3.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, docente, ruta o descripción..."
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00e03c]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'published', label: 'Publicados' },
                { id: 'draft', label: 'Borradores' },
                { id: 'video', label: 'Video HD' },
                { id: 'pdf', label: 'PDF / E-Book' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFacetFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    facetFilter === f.id
                      ? 'bg-[#00e03c]/15 text-[#00e03c] border-[#00e03c]/40'
                      : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <div className="flex items-center bg-slate-950 border border-white/10 rounded-lg p-0.5 ml-1">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  title="Vista Kanban Odoo"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-[#00e03c] text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Vista Lista Odoo"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-[#00e03c] text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── 4. KANBAN O LISTA ── */}
          {filteredCourses.length === 0 ? (
            <div className="bg-[#0f172a]/70 border border-dashed border-white/15 rounded-2xl p-12 text-center space-y-3">
              <BookOpenCheck className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No hay cursos o materiales que coincidan con este filtro</p>
              <button
                type="button"
                onClick={() => openCreateModal('video')}
                className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 text-xs font-black uppercase cursor-pointer"
              >
                + Crear Primer Curso
              </button>
            </div>
          ) : viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCourses.map(course => {
                const isPublished = course.status === 'Publicado';
                const lessonsCount = (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
                return (
                  <div
                    key={course.id}
                    className="group bg-[#0f172a]/90 border border-white/10 hover:border-[#00e03c]/40 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 shadow-lg"
                  >
                    {/* Carátula personalizada */}
                    <div className="relative h-44 bg-slate-950 overflow-hidden">
                      <img
                        src={course.image || '/assets/covers/cover_ebook_ley1333.png'}
                        alt={normalizeTitlePlain(course.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-black/40" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border backdrop-blur-md ${getStatusBadgeClass(course.status)}`}>
                          {course.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-slate-200 border border-white/15 backdrop-blur-md">
                          {course.format === 'pdf' ? 'PDF Técnico' : `${lessonsCount} Clases`}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <button
                          type="button"
                          onClick={() => onTogglePremium(course.id)}
                          title="Alternar acceso Premium / Libre"
                          className={`p-1.5 rounded-lg border backdrop-blur-md cursor-pointer ${
                            course.isPremium
                              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                              : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                          }`}
                        >
                          {course.isPremium ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-slate-300 font-bold">
                        <span className="truncate">{course.track || 'Ruta Técnica'}</span>
                        <span className="text-[#00e03c] font-black">
                          {course.price > 0 ? `Bs. ${course.price}` : 'Gratis'}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-sm font-black text-white leading-snug line-clamp-2">
                          {normalizeTitlePlain(course.title)}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{course.instructor}</span>
                          <span>·</span>
                          <span>{course.students || 0} alumnos</span>
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                          {course.desc || 'Sin descripción registrada.'}
                        </p>
                      </div>

                      {/* Acciones estilo Odoo */}
                      <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onTogglePublished(course.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 border transition-all cursor-pointer ${
                              isPublished
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-amber-500/15 hover:text-amber-300 hover:border-amber-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/30'
                            }`}
                            title={isPublished ? 'Pasar a Borrador' : 'Publicar en SERAM Academy'}
                          >
                            {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {isPublished ? 'Publicado' : 'Publicar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/academy/course/${course.id}`)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/[0.05] hover:bg-[#00e03c] text-slate-300 hover:text-slate-950 border border-white/10 flex items-center gap-1 transition-all cursor-pointer"
                            title="Abrir reproductor Crehana"
                          >
                            <ExternalLink className="w-3 h-3" /> Aula
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(course, 'curriculum')}
                            className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors cursor-pointer"
                            title="Gestionar Videos y Temario"
                          >
                            <Video className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(course, 'general')}
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                            title="Editar detalles y carátula"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateCourse(course.id)}
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                            title="Duplicar en Borrador"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(course.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                            title="Eliminar curso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#0f172a]/90 border border-white/10 rounded-2xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                    <th className="py-3 px-4">Curso / Carátula</th>
                    <th className="py-3 px-4">Ruta &amp; Docente</th>
                    <th className="py-3 px-4">Formato</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Estado Odoo</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredCourses.map(course => (
                    <tr key={course.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.image || '/assets/covers/cover_ebook_ley1333.png'}
                            alt={normalizeTitlePlain(course.title)}
                            className="w-14 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white line-clamp-1">{normalizeTitlePlain(course.title)}</p>
                            <p className="text-[10px] text-slate-400">{course.duration}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-200 font-medium">{course.track || 'General'}</p>
                        <p className="text-[10px] text-slate-400">{course.instructor}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-bold text-slate-300">
                          {course.format === 'pdf' ? 'PDF' : 'Video HD'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-[#00e03c]">
                        {course.price > 0 ? `Bs. ${course.price}` : 'Gratis'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onTogglePublished(course.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer ${getStatusBadgeClass(course.status)}`}
                        >
                          {course.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/academy/course/${course.id}`)}
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#00e03c] hover:text-slate-950 text-slate-300 cursor-pointer"
                            title="Abrir en Crehana"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(course, 'general')}
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-300 cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(course.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── 5. ODOO 360° FORM SHEET MODAL ── */}
      <AnimatePresence>
        {isFormOpen && editingCourse && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-4xl max-h-[92vh] bg-[#0b1322] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Statusbar Odoo */}
              <div className="px-5 py-3.5 bg-[#0f172a] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {ODOO_STATUS_FLOW.map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditingCourse(prev => ({ ...prev, status: st }))}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        editingCourse.status === st
                          ? 'bg-[#00e03c] text-slate-950 border-[#00e03c]'
                          : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {editingCourse.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        navigate(`/academy/course/${editingCourse.id}`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#00e03c]" /> Ver en Crehana
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notebook Tabs Odoo */}
              <div className="px-5 pt-3 bg-[#0d1627] border-b border-white/10 flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'general', label: '1. General y Carátula', icon: ImageIcon },
                  { id: 'curriculum', label: `2. Temario y Videos (${editingCourse.modules?.length || 0} mód.)`, icon: Video },
                  { id: 'materials', label: '3. Material Informativo y PDF', icon: FileText }
                ].map(t => {
                  const IconComp = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormTab(t.id)}
                      className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                        formTab === t.id
                          ? 'border-[#00e03c] text-[#00e03c]'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" /> {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveCourseForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {formTab === 'general' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna izquierda: Carátula personalizada */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
                        Carátula del Curso
                      </label>
                      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950 aspect-video">
                        <img
                          src={editingCourse.image || '/assets/covers/cover_ebook_ley1333.png'}
                          alt="Carátula"
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-[#00e03c] text-white hover:text-slate-950 text-[10px] font-black uppercase border border-white/20 flex items-center gap-1.5 cursor-pointer transition-colors">
                          <UploadCloud className="w-3.5 h-3.5" />
                          {uploadingCover ? 'Procesando...' : 'Subir Carátula PC'}
                          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                        </label>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">URL de Carátula o Ruta Local</label>
                        <input
                          type="text"
                          value={editingCourse.image || ''}
                          onChange={e => setEditingCourse(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="/assets/covers/..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-bold mb-1.5">Galería Rápida SERAM:</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {ODOO_COVER_GALLERY.map((cov, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setEditingCourse(prev => ({ ...prev, image: cov.url }))}
                              title={cov.label}
                              className={`rounded-lg overflow-hidden border-2 aspect-video cursor-pointer transition-all ${
                                editingCourse.image === cov.url ? 'border-[#00e03c] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={cov.url} alt={cov.label} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Columna derecha: Metadatos Odoo */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                          Título del Programa / Material *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCourse.title}
                          onChange={e => setEditingCourse(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ej. Taller Práctico de *Licencias Ambientales* FNCA"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#00e03c]"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Usa *asteriscos* para resaltar palabras en cursiva verde.</p>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Instructor / Autor *</label>
                        <input
                          type="text"
                          required
                          value={editingCourse.instructor}
                          onChange={e => setEditingCourse(prev => ({ ...prev, instructor: e.target.value }))}
                          list="seram-instructors-list"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        />
                        <datalist id="seram-instructors-list">
                          {registeredEngineers.map((eng, i) => (
                            <option key={i} value={eng.name} />
                          ))}
                          <option value="Equipo Técnico Especializado SERAM" />
                          <option value="SERAM Legal & Normativa" />
                        </datalist>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Ruta de Especialización</label>
                        <select
                          value={editingCourse.track || TRACK_OPTIONS[0]}
                          onChange={e => setEditingCourse(prev => ({ ...prev, track: e.target.value }))}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        >
                          {TRACK_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Categoría</label>
                        <select
                          value={editingCourse.category || 'tramites'}
                          onChange={e => setEditingCourse(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        >
                          {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Nivel Técnico</label>
                        <select
                          value={editingCourse.level || LEVEL_OPTIONS[1]}
                          onChange={e => setEditingCourse(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        >
                          {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Modalidad Crehana</label>
                        <select
                          value={editingCourse.format || 'video'}
                          onChange={e => setEditingCourse(prev => ({
                            ...prev,
                            format: e.target.value,
                            hasVideo: e.target.value !== 'pdf'
                          }))}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        >
                          <option value="video">Curso en Video HD (Aula Virtual)</option>
                          <option value="pdf">Material Informativo / E-Book PDF</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Categoría de Ticket / Inversión</label>
                        <select
                          value={editingCourse.type || 'mid_ticket'}
                          onChange={e => {
                            const found = TICKET_OPTIONS.find(t => t.id === e.target.value);
                            setEditingCourse(prev => ({
                              ...prev,
                              type: e.target.value,
                              price: found ? found.defaultPrice : prev.price,
                              isPremium: e.target.value !== 'gratis'
                            }));
                          }}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        >
                          {TICKET_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Precio Oficial (Bs.)</label>
                        <input
                          type="number"
                          min="0"
                          value={editingCourse.price}
                          onChange={e => setEditingCourse(prev => ({
                            ...prev,
                            price: e.target.value,
                            isPremium: Number(e.target.value) > 0
                          }))}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Duración / Extensión</label>
                        <input
                          type="text"
                          value={editingCourse.duration || ''}
                          onChange={e => setEditingCourse(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="Ej. 18 horas o 80 páginas"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">Descripción / Objetivos Técnicos</label>
                        <textarea
                          rows={3}
                          value={editingCourse.desc || ''}
                          onChange={e => setEditingCourse(prev => ({ ...prev, desc: e.target.value }))}
                          placeholder="Describe entregables, normativa cubierta y aplicación práctica..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#00e03c]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formTab === 'curriculum' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] border border-white/10 rounded-2xl p-4">
                      <div>
                        <h4 className="text-sm font-black text-white">Estructura de Módulos y Clases (Crehana)</h4>
                        <p className="text-[11px] text-slate-400">
                          Sube archivos `.mp4`, `.webm` o `.mov` desde tu PC o pega URLs externas. Se guardan sin saturar el navegador.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddModule}
                        className="px-3.5 py-2 rounded-xl bg-[#00e03c] text-slate-950 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Añadir Módulo
                      </button>
                    </div>

                    {(editingCourse.modules || []).map((mod, modIdx) => (
                      <div key={mod.id || modIdx} className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={mod.title}
                            onChange={e => handleUpdateModuleTitle(modIdx, e.target.value)}
                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#00e03c]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddLesson(modIdx)}
                            className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> + Clase / Video
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(modIdx)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                            title="Eliminar módulo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2.5 pl-2 border-l-2 border-[#00e03c]/25">
                          {(mod.lessons || []).map((les, lesIdx) => {
                            const isUploadingThis = uploadingLessonId === (les.id || `${modIdx}-${lesIdx}`);
                            return (
                              <div key={les.id || lesIdx} className="bg-slate-950/75 border border-white/[0.08] rounded-xl p-3 space-y-2.5">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                                  <div className="md:col-span-5">
                                    <input
                                      type="text"
                                      value={les.title}
                                      onChange={e => handleUpdateLesson(modIdx, lesIdx, 'title', e.target.value)}
                                      placeholder="Título de la clase"
                                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00e03c]"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <input
                                      type="text"
                                      value={les.duration || ''}
                                      onChange={e => handleUpdateLesson(modIdx, lesIdx, 'duration', e.target.value)}
                                      placeholder="15:00 min"
                                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[#00e03c]"
                                    />
                                  </div>
                                  <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-1.5">
                                    <label className="px-2.5 py-1.5 rounded-lg bg-[#00e03c]/15 hover:bg-[#00e03c] text-[#00e03c] hover:text-slate-950 border border-[#00e03c]/30 text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors">
                                      {isUploadingThis ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <UploadCloud className="w-3 h-3" />
                                      )}
                                      {isUploadingThis ? 'Subiendo...' : 'Subir Video'}
                                      <input
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime,video/*"
                                        onChange={e => handleLessonVideoUpload(modIdx, lesIdx, e.target.files?.[0])}
                                        className="hidden"
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      onClick={() => setPreviewLessonVideoUrl(previewLessonVideoUrl === les.videoUrl ? null : les.videoUrl)}
                                      className="px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-[10px] font-bold text-slate-300 border border-white/10 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Play className="w-3 h-3 text-[#00e03c]" /> Ver
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLesson(modIdx, lesIdx, 'isPremium', !les.isPremium)}
                                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                                        les.isPremium
                                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      }`}
                                    >
                                      {les.isPremium ? 'Premium' : 'Libre'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLesson(modIdx, lesIdx)}
                                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-500 flex-shrink-0">Fuente Video:</span>
                                  <input
                                    type="text"
                                    value={les.videoUrl || ''}
                                    onChange={e => handleUpdateLesson(modIdx, lesIdx, 'videoUrl', e.target.value)}
                                    placeholder="https://... o /assets/videos/..."
                                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-300 outline-none focus:border-[#00e03c]"
                                  />
                                  {isIndexedDbMediaUrl(les.videoUrl) && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold flex-shrink-0">
                                      PC ({les.videoFileName || 'IndexedDB'})
                                    </span>
                                  )}
                                </div>

                                {previewLessonVideoUrl && previewLessonVideoUrl === les.videoUrl && (
                                  <VideoPreviewPlayer videoUrl={les.videoUrl} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formTab === 'materials' && (
                  <div className="space-y-5">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-black text-white">Documento Técnico Principal del Curso (PDF)</h4>
                          <p className="text-[11px] text-slate-400">
                            Visible en el visor PDF integrado de Crehana y disponible para descarga de estudiantes.
                          </p>
                        </div>
                        <label className="px-4 py-2 rounded-xl bg-[#00e03c] hover:bg-white text-slate-950 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer transition-colors">
                          <UploadCloud className="w-4 h-4" />
                          {uploadingPdf ? 'Subiendo PDF...' : 'Subir PDF desde PC'}
                          <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Nombre Visible del Documento</label>
                          <input
                            type="text"
                            value={editingCourse.pdfName || ''}
                            onChange={e => setEditingCourse(prev => ({ ...prev, pdfName: e.target.value }))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Ruta / URL del PDF</label>
                          <input
                            type="text"
                            value={editingCourse.pdfUrl || ''}
                            onChange={e => setEditingCourse(prev => ({ ...prev, pdfUrl: e.target.value }))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-[#00e03c]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCourse(prev => ({
                            ...prev,
                            pdfUrl: '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf',
                            pdfName: 'Compendio_Normativo_Ley_1333_SERAM.pdf'
                          }))}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-[11px] font-bold text-slate-300 border border-white/10 cursor-pointer"
                        >
                          Usar Compendio Ley 1333
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCourse(prev => ({
                            ...prev,
                            pdfUrl: '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf',
                            pdfName: 'Propuesta_Tecnica_y_Carimbos_SERAM.pdf'
                          }))}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-[11px] font-bold text-slate-300 border border-white/10 cursor-pointer"
                        >
                          Usar Propuesta Técnica Modelo
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white">Archivos y Material Informativo Complementario</h4>
                        <label className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-bold text-white border border-white/10 flex items-center gap-1.5 cursor-pointer">
                          <Paperclip className="w-3.5 h-3.5 text-[#00e03c]" /> Adjuntar Archivo
                          <input type="file" onChange={handleResourceUpload} className="hidden" />
                        </label>
                      </div>
                      {(editingCourse.resources || []).length === 0 ? (
                        <p className="text-xs text-slate-500">Sin adjuntos extra añadidos. El alumno verá los archivos estándar de SERAM.</p>
                      ) : (
                        <div className="space-y-2">
                          {(editingCourse.resources || []).map((res, rIdx) => (
                            <div key={rIdx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-[#00e03c] flex-shrink-0" />
                                <span className="text-white font-semibold truncate">{res.name}</span>
                                <span className="text-slate-500 text-[10px]">{res.size}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingCourse(prev => ({
                                  ...prev,
                                  resources: (prev.resources || []).filter((_, i) => i !== rIdx)
                                }))}
                                className="p-1 text-rose-400 hover:bg-rose-500/15 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>

              {/* Footer Modal */}
              <div className="px-5 py-4 bg-[#0f172a] border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Cambios visibles al instante en el Catálogo y Reproductor Crehana
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCourseForm}
                    disabled={savingForm}
                    className="px-5 py-2 rounded-xl bg-[#00e03c] hover:bg-white text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00e03c]/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {savingForm ? 'Guardando...' : 'Guardar en Odoo y Crehana'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 6. MODAL CONFIRMAR ELIMINACIÓN ── */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0f172a] border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-2xl"
            >
              <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-white">¿Eliminar este curso o material?</h4>
                <p className="text-xs text-slate-400">Se retirará del catálogo Odoo y de la vista pública de SERAM Academy.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-black text-white cursor-pointer"
                >
                  Sí, Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

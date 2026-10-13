import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Clock, Plus, Filter, User, Building2,
  Calendar, AlertCircle, ArrowRight, Trash2, Edit2, Check,
  X, Search, Briefcase, FileText, ChevronDown, CheckCircle2,
  ListFilter, Sparkles, Phone, Mail, MapPin, ExternalLink,
  Layers, BarChart2, TrendingUp, ChevronRight, PanelRightClose,
  ShieldCheck, Award, Scale, Gift, Table, ChevronLeft,
  Target, Users, UserCheck, Link2, Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateTaskXP, validateCrossApproval } from './gamification/xpEngine';
import SpecialMissionsModule from './gamification/SpecialMissionsModule';
import InterdisciplinarySynergies from './gamification/InterdisciplinarySynergies';

// ── COMPONENTE TARJETA DE CRISTAL ──────────────────────────────────────────
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/[0.05] border border-white/[0.12] rounded-2xl shadow-lg backdrop-blur-md ${className}`}>
    {children}
  </div>
);

// ── 5 HITOS ESTÁNDAR DE EJECUCIÓN (NOTION STYLE) ───────────────────────────
const STANDARD_MILESTONES = [
  { step: 1, label: 'Levantamiento & Datos', short: '1. Datos' },
  { step: 2, label: 'Diagnóstico & SIG', short: '2. SIG' },
  { step: 3, label: 'Redacción Técnica', short: '3. Redacción' },
  { step: 4, label: 'Control Calidad / Firma', short: '4. Calidad' },
  { step: 5, label: 'Trámite & Entrega', short: '5. Entrega' },
];

// ── BADGES DE ESTADO Y PRIORIDAD ────────────────────────────────────────────
const PRIORITY_STYLES = {
  Baja: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Media: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Alta: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Urgente: 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse',
};

const STATUS_COLUMNS = [
  { id: 'Pendiente', label: 'Pendiente', color: 'border-slate-500/30 text-slate-300 bg-slate-500/10' },
  { id: 'En curso', label: 'En Curso', color: 'border-blue-500/30 text-blue-300 bg-blue-500/10' },
  { id: 'En revisión', label: 'En Revisión', color: 'border-amber-500/30 text-amber-300 bg-amber-500/10' },
  { id: 'Concluido', label: 'Concluido', color: 'border-[#00e03c]/30 text-[#00e03c] bg-[#00e03c]/10' },
];

// ── HELPERS DE FORMATEO ESTILO NOTION ──────────────────────────────────────
const formatDateRange = (startDate, dueDate) => {
  if (!dueDate && !startDate) return 'Sin fecha';
  const formatMonth = (dStr) => {
    if (!dStr) return '';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const day = parseInt(parts[2], 10);
        const mIdx = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        return `${day} ${months[mIdx] || ''} ${year}`;
      }
    } catch (e) {}
    return dStr;
  };

  if (startDate && dueDate && startDate !== dueDate) {
    return `${formatMonth(startDate)} → ${formatMonth(dueDate)}`;
  }
  return formatMonth(dueDate || startDate);
};

const getPartnerInitials = (name) => {
  if (!name) return { initials: 'SR', short: 'Socio' };
  if (name.includes('Fabricio') || name.includes('Sebastian')) return { initials: 'FS', short: 'Fabricio Seb' };
  if (name.includes('Diego')) return { initials: 'DB', short: 'Diego Barrie' };
  if (name.includes('Fernando')) return { initials: 'FA', short: 'FAAJ 19' };
  const parts = name.replace('Ing. ', '').split(' ');
  const inits = parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return { initials: inits, short: parts[0] || 'Socio' };
};

const getProgressPercent = (act) => {
  if (act.status === 'Concluido') return 100;
  const step = act.milestoneStep !== undefined && act.milestoneStep !== null ? Number(act.milestoneStep) : 0;
  if (step > 0) return Math.min(100, step * 20);
  if (act.status === 'En revisión') return 80;
  if (act.status === 'En curso') return 40;
  return 0;
};

// Aro de Progreso Circular SVG estilo Notion
const CircularProgressRing = ({ percent }) => {
  const size = 16;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const color = percent === 100 ? '#00e03c' : percent >= 60 ? '#38bdf8' : percent > 0 ? '#fbbf24' : '#64748b';

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-300">
      <svg width={size} height={size} className="transform -rotate-90 shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-300"
        />
      </svg>
      <span className={percent === 100 ? 'text-[#00e03c]' : 'text-slate-300'}>{percent}%</span>
    </div>
  );
};

// Píldoras de Proyectos estilo Notion
const renderProjectBadge = (projectTitle) => {
  if (!projectTitle) return <span className="text-slate-500 text-[10px] italic">General</span>;
  const pLower = projectTitle.toLowerCase();
  let style = 'bg-white/[0.08] text-slate-300 border-white/[0.12]';
  let icon = '📁';
  if (pLower.includes('seram s.r.l') || pLower.includes('directorio') || pLower.includes('gobernanza')) {
    style = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    icon = '🏛️';
  } else if (pLower.includes('página web') || pLower.includes('web')) {
    style = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    icon = '💻';
  } else if (pLower.includes('valle de las agujas') || pLower.includes('campo')) {
    style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    icon = '🏔️';
  } else if (pLower.includes('redes') || pLower.includes('contenido')) {
    style = 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    icon = '📱';
  } else if (pLower.includes('academy') || pLower.includes('syso')) {
    style = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    icon = '🎓';
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap shadow-sm ${style}`}>
      <span>{icon}</span>
      <span className="truncate max-w-[150px]">{projectTitle}</span>
    </span>
  );
};

// Píldoras de Objetivos Estratégicos estilo Notion
const renderObjectiveBadge = (obj) => {
  const oLower = String(obj).toLowerCase();
  let style = 'bg-white/[0.08] text-slate-300 border-white/[0.12]';
  let icon = '🎯';
  if (oLower.includes('legalizar') || oLower.includes('formalizar')) {
    style = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    icon = '⚖️';
  } else if (oLower.includes('liderar')) {
    style = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    icon = '🚀';
  } else if (oLower.includes('rentabilidad')) {
    style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    icon = '💰';
  } else if (oLower.includes('cartera') || oLower.includes('clientes')) {
    style = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    icon = '🤝';
  }
  return (
    <span key={obj} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap shadow-sm ${style}`}>
      <span>{icon}</span>
      <span>{obj}</span>
    </span>
  );
};

export default function ActivitiesAndClientsModule({ currentSocio }) {
  const {
    activities = [],
    clients = [],
    prospects = [],
    activeServices = [],
    handleAddActivity,
    handleUpdateActivityStatus,
    handleEditActivity,
    handleDeleteActivity,
    handleAddClient,
    handleEditClient,
    handleDeleteClient,
    handleUpdateProspect,
    handleConvertProspectToClient,
    triggerToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('table'); // 'table' (Notion), 'kanban', 'clients', 'prospects', 'progress', 'missions', 'synergies'
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all' (Grupal) | 'personal' (Mis actividades)
  const [pageSize, setPageSize] = useState(10); // 10 (default: últimas 10) | 25 | 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados Prospección B2B Global
  const [prospectSearch, setProspectSearch] = useState('');
  const [prospectDept, setProspectDept] = useState('all');
  const [prospectStatusFilter, setProspectStatusFilter] = useState('all');
  const [prospectServiceFilter, setProspectServiceFilter] = useState('all');

  // Modales
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Slide-over Drawer lateral (Ficha detallada sin modales invasivos)
  const [drawerActivity, setDrawerActivity] = useState(null);
  const [drawerData, setDrawerData] = useState(null);

  const getMilestoneStep = (act) => {
    if (!act) return 0;
    if (act.milestoneStep !== undefined && act.milestoneStep !== null) return Number(act.milestoneStep);
    if (act.status === 'Concluido') return 5;
    if (act.status === 'En revisión') return 4;
    if (act.status === 'En curso') return 2;
    return 0;
  };

  // Sync drawer form state when an activity is selected
  React.useEffect(() => {
    if (drawerActivity) {
      setDrawerData({
        ...drawerActivity,
        milestoneStep: getMilestoneStep(drawerActivity)
      });
    } else {
      setDrawerData(null);
    }
  }, [drawerActivity]);

  // Resetear paginación al cambiar cualquier filtro
  React.useEffect(() => {
    setCurrentPage(1);
  }, [scopeFilter, partnerFilter, projectFilter, searchQuery, pageSize]);

  const handleApproveActivity = (act) => {
    const validation = validateCrossApproval(currentSocio, act);
    if (!validation.canApprove) {
      triggerToast(validation.reason, 'error');
      return;
    }

    const hours = Number(act.actualHours) || Number(act.estimatedHours) || 2;
    const diff = act.priority === 'Alta' ? 'Alta' : (act.priority === 'Urgente' ? 'Critica' : 'Media');
    const xpResult = calculateTaskXP({
      hours,
      difficulty: diff,
      deadline: act.dueDate,
      completedAt: new Date(),
    });

    const comboMultiplier = act.coPartner ? 1.35 : 1.0;
    const finalAwardedXP = Math.round(xpResult.finalXP * comboMultiplier);

    handleEditActivity(act.id, {
      status: 'Concluido',
      milestoneStep: 5,
      approved_by: currentSocio.name,
      approved_at: new Date().toISOString(),
      xp_awarded: finalAwardedXP,
    });

    if (drawerActivity && drawerActivity.id === act.id) {
      setDrawerData(prev => ({
        ...prev,
        status: 'Concluido',
        milestoneStep: 5,
        approved_by: currentSocio.name,
        approved_at: new Date().toISOString(),
        xp_awarded: finalAwardedXP,
      }));
    }

    triggerToast(
      `¡Entregable aprobado por ${currentSocio.name}! Se otorgaron +${finalAwardedXP} XP a ${act.assignedPartner}${act.coPartner ? ` y a su co-ejecutor ${act.coPartner} (Bono Combo +35%)` : ''}.`,
      'success'
    );
  };

  const handleRejectActivity = (act, reason = 'Requiere ajustes técnicos en gabinete') => {
    const validation = validateCrossApproval(currentSocio, act);
    if (!validation.canApprove) {
      triggerToast(validation.reason, 'error');
      return;
    }

    handleEditActivity(act.id, {
      status: 'En curso',
      milestoneStep: 3,
      reviewNotes: reason,
    });

    if (drawerActivity && drawerActivity.id === act.id) {
      setDrawerData(prev => ({
        ...prev,
        status: 'En curso',
        milestoneStep: 3,
        reviewNotes: reason,
      }));
    }

    triggerToast(`Entregable devuelto a "En curso" para corrección de observaciones`, 'info');
  };

  const handleRequestStatusChange = (act, targetStatus) => {
    if (targetStatus === 'Concluido') {
      if (currentSocio?.name === act.assignedPartner) {
        handleEditActivity(act.id, {
          status: 'En revisión',
          milestoneStep: 4,
        });
        triggerToast('Entregable enviado a "En revisión". Para garantizar equidad imparcial, otro socio debe auditar y aprobar el trabajo.', 'info');
        return;
      }
      handleApproveActivity(act);
      return;
    }

    if (targetStatus === 'En revisión') {
      handleEditActivity(act.id, {
        status: 'En revisión',
        milestoneStep: 4,
      });
      triggerToast('Actividad movida a "En revisión" pericial', 'info');
      return;
    }

    handleUpdateActivityStatus(act.id, targetStatus);
  };

  const handleMilestoneClick = (act, targetStep) => {
    const currentStep = getMilestoneStep(act);
    const newStep = currentStep === targetStep ? Math.max(0, targetStep - 1) : targetStep;

    if (newStep === 5) {
      if (currentSocio?.name === act.assignedPartner) {
        handleEditActivity(act.id, {
          milestoneStep: 4,
          status: 'En revisión',
        });
        if (drawerActivity && drawerActivity.id === act.id) {
          setDrawerData(prev => ({ ...prev, milestoneStep: 4, status: 'En revisión' }));
        }
        triggerToast('Hito 4 completado. Entregable enviado a "En revisión". Requiere auditoría de otro socio para completar el Hito 5.', 'info');
        return;
      }
      handleApproveActivity(act);
      return;
    }

    let newStatus = act.status;
    if (newStep === 4) newStatus = 'En revisión';
    else if (newStep >= 1) newStatus = 'En curso';
    else newStatus = 'Pendiente';

    handleEditActivity(act.id, {
      milestoneStep: newStep,
      status: newStatus
    });

    if (drawerActivity && drawerActivity.id === act.id) {
      setDrawerData(prev => ({
        ...prev,
        milestoneStep: newStep,
        status: newStatus
      }));
    }
  };

  const saveDrawerData = () => {
    if (!drawerData) return;
    handleEditActivity(drawerData.id, drawerData);
    setDrawerActivity(null);
    triggerToast('Ficha de actividad actualizada correctamente', 'success');
  };

  // Form State Actividad
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actProjectId, setActProjectId] = useState('');
  const [actPartner, setActPartner] = useState(currentSocio?.name || 'Ing. Diego Barrientos');
  const [actCoPartner, setActCoPartner] = useState('');
  const [actCategory, setActCategory] = useState('SIG / Cartografía');
  const [actPriority, setActPriority] = useState('Media');
  const [actDueDate, setActDueDate] = useState('');
  const [actEstHours, setActEstHours] = useState('');

  // Form State Cliente
  const [clName, setClName] = useState('');
  const [clType, setClType] = useState('Municipal / Público');
  const [clContact, setClContact] = useState('');
  const [clPhone, setClPhone] = useState('');
  const [clEmail, setClEmail] = useState('');
  const [clLocation, setClLocation] = useState('');
  const [clNotes, setClNotes] = useState('');

  // Filtro de Actividades (Personal vs Grupal, Proyectos, Búsqueda y Ordenamiento)
  const filteredActivities = useMemo(() => {
    const list = activities.filter((act) => {
      // 1. Filtro Personal (Mis Actividades) vs Grupal (Todo el Equipo)
      if (scopeFilter === 'personal') {
        const myName = currentSocio?.name || '';
        const isMe =
          act.assignedPartner === myName ||
          act.coPartner === myName ||
          (myName.includes('Fabricio') && (act.assignedPartner?.includes('Sebastian') || act.assignedPartner?.includes('Fabricio'))) ||
          (myName.includes('Diego') && act.assignedPartner?.includes('Diego')) ||
          (myName.includes('Fernando') && act.assignedPartner?.includes('Fernando'));
        if (!isMe) return false;
      }

      // 2. Filtro por Socio específico
      const matchPartner =
        partnerFilter === 'all' ||
        act.assignedPartner === partnerFilter ||
        act.coPartner === partnerFilter ||
        (partnerFilter.includes('Fabricio') && act.assignedPartner?.includes('Sebastian'));

      // 3. Filtro por Proyecto
      const matchProject =
        projectFilter === 'all' ||
        String(act.projectId) === String(projectFilter) ||
        (act.projectTitle && act.projectTitle.toLowerCase().includes(String(projectFilter).toLowerCase()));

      // 4. Búsqueda por texto
      const matchSearch =
        !searchQuery.trim() ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.description && act.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.projectTitle && act.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.assignedPartner && act.assignedPartner.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchPartner && matchProject && matchSearch;
    });

    // Ordenar por ID o fecha descendente (últimas actividades primero)
    return [...list].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [activities, scopeFilter, partnerFilter, projectFilter, searchQuery, currentSocio]);

  // Paginación (Por defecto: últimas 10 actividades)
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredActivities.length / pageSize) || 1;
  const paginatedActivities = useMemo(() => {
    if (pageSize === 'all') return filteredActivities;
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  // Lista de Socios Únicos
  const partnersList = [
    { name: 'Ing. Diego Barrientos', email: 'barrientoso2401@gmail.com', role: 'Especialista SIG & Monitoreo' },
    { name: 'Ing. Fernando Araujo', email: 'fernandoaraujo1912@gmail.com', role: 'Gestión Legal & Ambiental' },
    { name: 'Ing. Fabricio Orosco', email: 'sebastiansbs51@gmail.com', role: 'Operaciones & Campo' },
  ];

  // Submit Nueva Actividad
  const onSubmitActivity = (e) => {
    e.preventDefault();
    if (!actTitle.trim()) {
      triggerToast('Ingresa el título de la actividad', 'error');
      return;
    }

    const selectedProj = activeServices.find((p) => String(p.id) === String(actProjectId));

    if (editingActivity) {
      handleEditActivity(editingActivity.id, {
        title: actTitle,
        description: actDesc,
        projectId: actProjectId ? (isNaN(actProjectId) ? actProjectId : parseInt(actProjectId)) : null,
        projectTitle: selectedProj ? selectedProj.client || selectedProj.type : 'Proyecto General',
        assignedPartner: actPartner,
        coPartner: actCoPartner || null,
        category: actCategory,
        priority: actPriority,
        dueDate: actDueDate,
        estimatedHours: parseFloat(actEstHours) || 0,
      });
      setEditingActivity(null);
    } else {
      handleAddActivity({
        title: actTitle,
        description: actDesc,
        projectId: actProjectId ? (isNaN(actProjectId) ? actProjectId : parseInt(actProjectId)) : null,
        projectTitle: selectedProj ? selectedProj.client || selectedProj.type : 'Proyecto General',
        assignedPartner: actPartner,
        coPartner: actCoPartner || null,
        category: actCategory,
        priority: actPriority,
        dueDate: actDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedHours: parseFloat(actEstHours) || 0,
        actualHours: 0,
        status: 'Pendiente',
      });
    }

    // Reset
    setActTitle('');
    setActDesc('');
    setActProjectId('');
    setActCoPartner('');
    setActEstHours('');
    setShowNewActivityModal(false);
  };

  // Submit Nuevo Cliente
  const onSubmitClient = (e) => {
    e.preventDefault();
    if (!clName.trim()) {
      triggerToast('Ingresa el nombre o razón social del cliente', 'error');
      return;
    }
    handleAddClient({
      name: clName,
      type: clType,
      contactPerson: clContact,
      contactPhone: clPhone,
      contactEmail: clEmail,
      location: clLocation,
      notes: clNotes,
    });
    setClName('');
    setClContact('');
    setClPhone('');
    setClEmail('');
    setClLocation('');
    setClNotes('');
    setShowNewClientModal(false);
  };

  const openEditActivity = (act) => {
    setEditingActivity(act);
    setActTitle(act.title);
    setActDesc(act.description || '');
    setActProjectId(act.projectId || '');
    setActPartner(act.assignedPartner || 'Ing. Diego Barrientos');
    setActCoPartner(act.coPartner || '');
    setActCategory(act.category || 'SIG / Cartografía');
    setActPriority(act.priority || 'Media');
    setActDueDate(act.dueDate || '');
    setActEstHours(act.estimatedHours || '');
    setShowNewActivityModal(true);
  };

  // Estadísticas Rápidas
  const totalAct = activities.length;
  const doneAct = activities.filter((a) => a.status === 'Concluido').length;
  const inProgressAct = activities.filter((a) => a.status === 'En curso').length;
  const pendingAct = activities.filter((a) => a.status === 'Pendiente').length;
  const progressPercent = totalAct > 0 ? Math.round((doneAct / totalAct) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── BARRA SUPERIOR DE RESUMEN Y CONTROLES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center justify-between border-emerald-500/20">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avance Actividades</span>
            <h3 className="text-2xl font-black text-[#00e03c] mt-0.5">{progressPercent}%</h3>
            <p className="text-[11px] text-slate-400">{doneAct} de {totalAct} tareas concluidas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/30 flex items-center justify-center text-[#00e03c]">
            <CheckSquare className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Curso</span>
            <h3 className="text-2xl font-black text-blue-400 mt-0.5">{inProgressAct}</h3>
            <p className="text-[11px] text-slate-400">Actividades en ejecución</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clientes / Entidades</span>
            <h3 className="text-2xl font-black text-purple-400 mt-0.5">{clients.length}</h3>
            <p className="text-[11px] text-slate-400">Alcaldías, mineras e industrias</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proyectos Activos</span>
            <h3 className="text-2xl font-black text-amber-400 mt-0.5">{activeServices.length}</h3>
            <p className="text-[11px] text-slate-400">Monitoreo & Consultoría B2B</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* ── BOTONES DE NAVEGACIÓN DE VISTAS Y ACCIONES RÁPIDAS ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        {/* Pestañas de Vista */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'table'
                ? 'bg-blue-600 text-white shadow-md font-black shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-sky-300" /> ⊞ Base de Datos (Notion)
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'kanban'
                ? 'bg-[#00e03c] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Tablero Kanban
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-[#00e03c] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Clientes ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('prospects')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'prospects'
                ? 'bg-[#00e03c] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Prospección B2B Global ({prospects.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'progress'
                ? 'bg-[#00e03c] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Progreso de Socios
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'missions'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" /> Misiones Especiales
          </button>
          <button
            onClick={() => setActiveTab('synergies')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'synergies'
                ? 'bg-purple-500 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Sinergias & Combos
          </button>
        </div>

        {/* Botones de Creación */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingActivity(null);
              setActTitle('');
              setActDesc('');
              setActProjectId(activeServices[0]?.id || '');
              setShowNewActivityModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#00e03c]/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Registrar Actividad Clave
          </button>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-purple-400" /> Inscribir Cliente
          </button>
        </div>
      </div>

      {/* ── BARRA DE HERRAMIENTAS Y FILTROS ESTILO NOTION ── */}
      {(activeTab === 'kanban' || activeTab === 'table') && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1522]/90 p-3 rounded-2xl border border-white/[0.08] shadow-md">
          {/* Grupo 1: Filtro Personal vs Grupal & Intercambio de Vistas */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Personal vs Grupal */}
            <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setScopeFilter('personal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  scopeFilter === 'personal'
                    ? 'bg-[#00e03c] text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title="Filtrar actividades donde estás asignado"
              >
                <User className="w-3.5 h-3.5" />
                <span>Mis Actividades (Personal)</span>
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'bg-white/[0.14] text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title="Ver todas las actividades grupales de SERAM"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Todo el Equipo (Grupal)</span>
              </button>
            </div>

            {/* Sub-Switch de Vistas (Tabla Notion vs Tablero) */}
            <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Vista Base de Datos / Tabla tipo Notion"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kanban')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Vista Tablero de Columnas Kanban"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tablero</span>
              </button>
            </div>
          </div>

          {/* Grupo 2: Filtros Selectores, Paginación y Búsqueda */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end min-w-[260px]">
            {/* Selector de Límite (Últimas 10 por defecto) */}
            <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Ver:</span>
              <button
                type="button"
                onClick={() => setPageSize(10)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pageSize === 10 ? 'bg-[#00e03c] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Últimas 10
              </button>
              <button
                type="button"
                onClick={() => setPageSize(25)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pageSize === 25 ? 'bg-[#00e03c] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                25
              </button>
              <button
                type="button"
                onClick={() => setPageSize('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pageSize === 'all' ? 'bg-[#00e03c] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({filteredActivities.length})
              </button>
            </div>

            {/* Filtro por Socio */}
            <div className="flex items-center gap-1.5">
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
              >
                <option value="all">Todos los Socios</option>
                {partnersList.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Proyecto */}
            <div className="flex items-center gap-1.5">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white max-w-[170px] truncate cursor-pointer"
              >
                <option value="all">Todos los Proyectos</option>
                <option value="SERAM S.R.L.">SERAM S.R.L.</option>
                <option value="Página Web">Página Web</option>
                <option value="Valle de las Agujas">Valle de las Agujas</option>
                <option value="Contenido Redes Sociales">Contenido Redes</option>
                <option value="Lanzamiento de SERAM Academy">SERAM Academy</option>
                {activeServices.map((p) => (
                  <option key={p.id} value={p.id}>{p.client || p.type}</option>
                ))}
              </select>
            </div>

            {/* Búsqueda */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar actividad o tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENEDOR DE VISTAS CON CROSSFADE SIMULTÁNEO ── */}
      <div className="grid grid-cols-1 items-start relative min-h-[500px]">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="col-start-1 row-start-1 w-full"
          >
            {/* ── VISTA 1: TABLERO KANBAN (CENTRAL DE ACTIVIDADES) ── */}
            {activeTab === 'kanban' && (
              <div className="space-y-3">
                {pageSize !== 'all' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#0c141f] border border-white/[0.08] px-4 py-2.5 rounded-2xl text-xs text-slate-300 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span>Mostrando las <strong>{paginatedActivities.length}</strong> actividades más recientes de <strong>{filteredActivities.length}</strong>.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPageSize('all')}
                        className="text-[#00e03c] font-black hover:underline cursor-pointer"
                      >
                        Ver todas en Kanban ➔
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('table')}
                        className="text-sky-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Table className="w-3 h-3" /> Ver en Base de Datos
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {STATUS_COLUMNS.map((col) => {
                    const colActivities = paginatedActivities.filter((a) => a.status === col.id);
                    return (
                      <div key={col.id} className="flex flex-col space-y-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3.5 min-h-[500px]">
                {/* Cabecera Columna */}
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.id === 'Concluido' ? 'bg-[#00e03c]' : col.id === 'En curso' ? 'bg-blue-400' : col.id === 'En revisión' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">{col.label}</h4>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300">
                    {colActivities.length}
                  </span>
                </div>

                {/* Tarjetas de la Columna */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colActivities.length === 0 ? (
                    <div className="h-32 border border-dashed border-white/[0.08] rounded-xl flex items-center justify-center text-[11px] text-slate-500">
                      Sin actividades
                    </div>
                  ) : (
                    colActivities.map((act) => (
                      <motion.div
                        layout
                        key={act.id}
                        className="bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] hover:border-[#00e03c]/40 rounded-xl p-3.5 space-y-2.5 transition-all shadow-md group relative"
                      >
                        {/* Categoría y Prioridad */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="font-bold text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded">
                            {act.category || 'General'}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-black border ${PRIORITY_STYLES[act.priority] || PRIORITY_STYLES.Media}`}>
                            {act.priority}
                          </span>
                        </div>

                        {/* Título */}
                        <h5 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                          {act.title}
                        </h5>

                        {/* Proyecto Vinculado */}
                        {act.projectTitle && (
                          <div className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1 truncate">
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span className="truncate">{act.projectTitle}</span>
                          </div>
                        )}

                        {/* Descripción opcional */}
                        {act.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-2">
                            {act.description}
                          </p>
                        )}

                        {/* Validación Cruzada / XP Status */}
                        {act.status === 'En revisión' && (
                          <div className="pt-1.5 pb-0.5">
                            {currentSocio?.name !== act.assignedPartner ? (
                              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-1">
                                <span className="text-[9px] font-black text-amber-300 flex items-center gap-1">
                                  <Scale className="w-2.5 h-2.5 text-amber-400 animate-pulse" /> Auditoría
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveActivity(act);
                                  }}
                                  className="px-2 py-0.5 rounded-md bg-[#00e03c] text-slate-950 font-black text-[9px] hover:bg-[#00e03c]/90 transition-all flex items-center gap-1 cursor-pointer"
                                  title="Aprobar entregable y asignar XP"
                                >
                                  <ShieldCheck className="w-2.5 h-2.5" /> Aprobar (+XP)
                                </button>
                              </div>
                            ) : (
                              <div className="p-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-center text-[8px] font-bold text-amber-300 flex items-center justify-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> En espera de auditoría par
                              </div>
                            )}
                          </div>
                        )}

                        {act.status === 'Concluido' && (
                          <div className="pt-1 pb-0.5 flex items-center justify-between text-[9px] text-[#00e03c]">
                            <span className="font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {act.approved_by ? `Validado (${act.approved_by.replace('Ing. ', '')})` : 'Auditado'}
                            </span>
                            {act.xp_awarded ? (
                              <span className="font-black font-mono">+{act.xp_awarded} XP</span>
                            ) : null}
                          </div>
                        )}

                        {/* Pie de Tarjeta: Socio Asignado, Fecha y Horas */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-1 font-bold text-slate-300">
                            <User className="w-3 h-3 text-[#00e03c]" />
                            <span className="truncate max-w-[90px]">{act.assignedPartner.replace('Ing. ', '')}</span>
                          </div>

                          {act.dueDate && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{act.dueDate.slice(5)}</span>
                            </div>
                          )}
                        </div>

                        {/* Indicador de Combo Interdisciplinario */}
                        {act.coPartner && (
                          <div className="pt-1.5 pb-0.5">
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full shadow-sm">
                              <Zap className="w-2.5 h-2.5 text-amber-400" />
                              Combo: {act.coPartner.replace('Ing. ', '')} (+35% XP)
                            </span>
                          </div>
                        )}

                        {/* Acciones Rápidas de Cambio de Estado y Edición */}
                        <div className="pt-1.5 flex items-center justify-between border-t border-white/[0.04]">
                          <div className="flex items-center gap-1">
                            {STATUS_COLUMNS.map((sc) => (
                              <button
                                key={sc.id}
                                title={`Mover a ${sc.label}`}
                                onClick={() => handleRequestStatusChange(act, sc.id)}
                                className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center transition-all ${
                                  act.status === sc.id
                                    ? 'bg-[#00e03c] text-slate-950 font-black ring-2 ring-white/20'
                                    : 'bg-white/[0.1] hover:bg-white/[0.25] text-transparent'
                                }`}
                              >
                                •
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setDrawerActivity(act)}
                              className="p-1 rounded hover:bg-[#00e03c]/20 text-slate-400 hover:text-[#00e03c] transition-colors"
                              title="Abrir Ficha Técnica (Drawer)"
                            >
                              <FileText className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditActivity(act)}
                              className="p-1 rounded hover:bg-white/[0.1] text-slate-400 hover:text-white"
                              title="Editar actividad"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteActivity(act.id)}
                              className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                              title="Eliminar actividad"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

      {/* ── VISTA 2: BASE DE DATOS / TABLA TIPO NOTION (IDÉNTICA A LA CAPTURA DE SERAM) ── */}
      {activeTab === 'table' && (
        <div className="space-y-3">
          <GlassCard className="p-0 overflow-hidden border-white/[0.1] bg-[#0c131d]/90 shadow-2xl rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-white/[0.04] border-b border-white/[0.08] text-[10px] uppercase font-bold tracking-wider text-slate-400 select-none">
                  <tr>
                    <th className="p-3 pl-4 min-w-[220px]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00e03c]" /> Actividad
                      </span>
                    </th>
                    <th className="p-3 min-w-[150px]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha
                      </span>
                    </th>
                    <th className="p-3 min-w-[160px]">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400" /> Encargado del Proyecto
                      </span>
                    </th>
                    <th className="p-3 min-w-[110px]">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Última ed...
                      </span>
                    </th>
                    <th className="p-3 text-center min-w-[125px]">
                      <span className="flex items-center justify-center gap-1" title="Hitos de Ejecución Técnica (1 a 5)">
                        <span className="text-[10px] font-mono">☑️ 1-5 Hitos</span>
                      </span>
                    </th>
                    <th className="p-3 min-w-[90px]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00e03c]" /> Progreso
                      </span>
                    </th>
                    <th className="p-3 min-w-[200px]">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> Descripción de Actividad
                      </span>
                    </th>
                    <th className="p-3 min-w-[150px]">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> PROYECTOS
                      </span>
                    </th>
                    <th className="p-3 min-w-[170px]">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-amber-400" /> OBJETIVOS
                      </span>
                    </th>
                    <th className="p-3 min-w-[120px]">
                      <span className="flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-sky-400" /> URL
                      </span>
                    </th>
                    <th className="p-3 pr-4 text-right min-w-[90px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {paginatedActivities.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="p-12 text-center text-slate-500">
                        <div className="max-w-sm mx-auto space-y-2">
                          <p className="font-bold text-slate-400">No hay actividades para este filtro</p>
                          <p className="text-[11px] text-slate-500">Prueba cambiando el filtro de socio o el selector de límite a 'Todas'.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedActivities.map((act) => {
                      const currentStep = getMilestoneStep(act);
                      const progressPct = getProgressPercent(act);
                      const { initials, short } = getPartnerInitials(act.assignedPartner);

                      return (
                        <tr
                          key={act.id}
                          onClick={(e) => {
                            if (e.target.closest('button') || e.target.closest('select') || e.target.closest('a') || e.target.closest('input')) return;
                            setDrawerActivity(act);
                          }}
                          className="hover:bg-white/[0.04] transition-colors group cursor-pointer border-b border-white/[0.04]"
                        >
                          {/* 1. Actividad */}
                          <td className="p-3 pl-4">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30 flex items-center justify-center shrink-0 shadow-sm shadow-[#00e03c]/20">
                                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                              </span>
                              <span className="font-bold text-white group-hover:text-[#00e03c] transition-colors line-clamp-1">
                                {act.title}
                              </span>
                            </div>
                          </td>

                          {/* 2. Fecha */}
                          <td className="p-3 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                            {formatDateRange(act.startDate, act.dueDate)}
                          </td>

                          {/* 3. Encargado del Proyecto */}
                          <td className="p-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-200">
                              <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center">
                                <User className="w-2.5 h-2.5" />
                              </span>
                              <span className="text-[11px] tracking-wide">
                                {act.assignedPartner ? act.assignedPartner.toUpperCase() : 'SIN ASIGNAR'}
                              </span>
                            </span>
                          </td>

                          {/* 4. Última edición / Autor */}
                          <td className="p-3 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-slate-700/80 text-[8px] font-black text-slate-200 flex items-center justify-center border border-white/10 shadow-sm">
                                {initials}
                              </span>
                              <span className="text-[11px] text-slate-300 font-medium">{short}</span>
                            </div>
                          </td>

                          {/* 5. 5 Checkboxes Interactivos estilo Notion (Azul con Check Blanco) */}
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((step) => {
                                const isChecked = currentStep >= step;
                                return (
                                  <button
                                    key={step}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMilestoneClick(act, step);
                                    }}
                                    title={`Hito ${step}: ${STANDARD_MILESTONES[step - 1]?.label || ''}`}
                                    className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center transition-all cursor-pointer ${
                                      isChecked
                                        ? 'bg-[#0070f3] hover:bg-blue-500 text-white shadow-sm ring-1 ring-blue-400/40'
                                        : 'border border-white/20 hover:border-white/50 bg-white/[0.04]'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* 6. Progreso circular */}
                          <td className="p-3 whitespace-nowrap">
                            <CircularProgressRing percent={progressPct} />
                          </td>

                          {/* 7. Descripción */}
                          <td className="p-3 text-slate-400 text-[11px] max-w-[220px]">
                            <span className="line-clamp-1" title={act.description}>
                              {act.description || 'Sin notas'}
                            </span>
                          </td>

                          {/* 8. PROYECTOS */}
                          <td className="p-3 whitespace-nowrap">
                            {renderProjectBadge(act.projectTitle || (act.projectId === 2 ? 'Plataforma Digital & Ecosistema SERAM' : 'SERAM S.R.L.'))}
                          </td>

                          {/* 9. OBJETIVOS */}
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
                              {Array.isArray(act.strategicObjectives) && act.strategicObjectives.length > 0 ? (
                                act.strategicObjectives.map(obj => renderObjectiveBadge(obj))
                              ) : (
                                renderObjectiveBadge(act.category?.includes('Legal') ? 'LEGALIZAR Y FORMALIZAR' : 'LIDERAR EL SECTOR')
                              )}
                            </div>
                          </td>

                          {/* 10. URL */}
                          <td className="p-3 whitespace-nowrap">
                            {act.url || act.deliverableUrl ? (
                              <a
                                href={act.url || act.deliverableUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-mono underline decoration-sky-500/40 hover:decoration-sky-400 transition-colors max-w-[120px] truncate"
                                title={act.url || act.deliverableUrl}
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{(act.url || act.deliverableUrl).replace(/^https?:\/\//, '')}</span>
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDrawerActivity(act);
                                }}
                                className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 transition-colors cursor-pointer"
                                title="Adjuntar link en la ficha"
                              >
                                <Plus className="w-2.5 h-2.5" /> Link
                              </button>
                            )}
                          </td>

                          {/* 11. Acciones */}
                          <td className="p-3 pr-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDrawerActivity(act);
                              }}
                              className="p-1 rounded hover:bg-[#00e03c]/10 text-slate-400 hover:text-[#00e03c] transition-colors cursor-pointer"
                              title="Abrir ficha detallada (Slide-over lateral)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditActivity(act);
                              }}
                              className="p-1 rounded hover:bg-white/[0.1] text-slate-400 hover:text-white cursor-pointer"
                              title="Editar actividad"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteActivity(act.id);
                              }}
                              className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 cursor-pointer"
                              title="Eliminar actividad"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie de Tabla: Paginación ergonómica ("Últimas 10") */}
            <div className="p-3.5 bg-white/[0.02] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Mostrando</span>
                <span className="font-bold text-white">
                  {filteredActivities.length === 0 ? 0 : (currentPage - 1) * (pageSize === 'all' ? filteredActivities.length : pageSize) + 1}
                  {' - '}
                  {pageSize === 'all' ? filteredActivities.length : Math.min(currentPage * pageSize, filteredActivities.length)}
                </span>
                <span>de</span>
                <span className="font-bold text-white">{filteredActivities.length}</span>
                <span>actividades</span>
                {pageSize !== 'all' && (
                  <span className="text-[10px] text-[#00e03c] bg-[#00e03c]/10 px-2 py-0.5 rounded-full font-mono border border-[#00e03c]/20">
                    Pág. {currentPage} de {totalPages}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#00e03c] text-slate-950 font-black shadow-md'
                        : 'border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── VISTA 3: DIRECTORIO DE CLIENTES E INSTITUCIONES ── */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((cl) => {
              const clientProjects = activeServices.filter(
                (p) => String(p.client).toLowerCase().includes(cl.name.toLowerCase()) || String(p.clientId) === String(cl.id)
              );
              return (
                <GlassCard key={cl.id} className="p-5 space-y-3 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {cl.type}
                      </span>
                      <button
                        onClick={() => handleDeleteClient(cl.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-black text-white leading-snug">{cl.name}</h4>

                    {cl.location && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{cl.location}</span>
                      </p>
                    )}

                    <div className="space-y-1 pt-1 text-[11px] text-slate-300">
                      {cl.contactPerson && (
                        <p className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <User className="w-3 h-3 text-[#00e03c]" /> {cl.contactPerson}
                        </p>
                      )}
                      {cl.contactPhone && (
                        <p className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <Phone className="w-3 h-3 text-blue-400" /> {cl.contactPhone}
                        </p>
                      )}
                      {cl.contactEmail && (
                        <p className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <Mail className="w-3 h-3 text-purple-400" /> {cl.contactEmail}
                        </p>
                      )}
                    </div>

                    {cl.notes && (
                      <p className="text-[10px] text-slate-400 bg-white/[0.04] p-2 rounded-lg border border-white/[0.06] italic">
                        &ldquo;{cl.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">Proyectos Asociados:</span>
                    <span className="font-black text-[#00e03c] bg-[#00e03c]/10 px-2 py-0.5 rounded-full border border-[#00e03c]/20">
                      {clientProjects.length} Activo(s)
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VISTA 4: PROSPECCIÓN B2B GLOBAL (BASE DE DATOS EMPRESAS SEPREC) ── */}
      {activeTab === 'prospects' && (
        <div className="space-y-4">
          {/* Barra de Filtros de Prospección */}
          <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Base de Datos Global SERAM (SEPREC Bolivia)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Directorio de empresas con datos de contacto verificados para captación de trámites (RAI, FNCA, SIG, etc.)
                </p>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                {prospects.length} Empresas Objetivo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar empresa, rubro..."
                  value={prospectSearch}
                  onChange={(e) => setProspectSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Filtro Departamento */}
              <div>
                <select
                  value={prospectDept}
                  onChange={(e) => setProspectDept(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white"
                >
                  <option value="all">Todos los Departamentos</option>
                  <option value="LA PAZ">La Paz</option>
                  <option value="SANTA CRUZ">Santa Cruz</option>
                  <option value="COCHABAMBA">Cochabamba</option>
                  <option value="ORURO">Oruro</option>
                  <option value="POTOSI">Potosí</option>
                  <option value="CHUQUISACA">Chuquisaca</option>
                  <option value="TARIJA">Tarija</option>
                  <option value="BENI">Beni</option>
                  <option value="PANDO">Pando</option>
                </select>
              </div>

              {/* Filtro Estado Gestión */}
              <div>
                <select
                  value={prospectStatusFilter}
                  onChange={(e) => setProspectStatusFilter(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="Prospecto Nuevo">Prospecto Nuevo</option>
                  <option value="Contactado">Contactado</option>
                  <option value="Cotización Enviada">Cotización Enviada</option>
                  <option value="Cliente Cerrado">Cliente Cerrado</option>
                </select>
              </div>

              {/* Filtro Servicio Sugerido */}
              <div>
                <select
                  value={prospectServiceFilter}
                  onChange={(e) => setProspectServiceFilter(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white"
                >
                  <option value="all">Todos los Servicios</option>
                  <option value="RAI">Registro Industrial (RAI)</option>
                  <option value="FNCA">Categorización (FNCA)</option>
                  <option value="EMAP">Formulario Minero (EMAP)</option>
                  <option value="Auditoría">Auditoría Ambiental</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Prospectos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prospects
              .filter((p) => {
                const matchSearch =
                  p.razonSocial.toLowerCase().includes(prospectSearch.toLowerCase()) ||
                  p.actividad.toLowerCase().includes(prospectSearch.toLowerCase()) ||
                  p.matricula.includes(prospectSearch);
                const matchDept = prospectDept === 'all' || p.departamento === prospectDept;
                const matchStatus = prospectStatusFilter === 'all' || p.estadoGestion === prospectStatusFilter;
                const matchService =
                  prospectServiceFilter === 'all' || p.servicioInteres.includes(prospectServiceFilter);
                return matchSearch && matchDept && matchStatus && matchService;
              })
              .map((p) => (
                <GlassCard key={p.id} className="p-4 space-y-3 flex flex-col justify-between hover:border-amber-400/30 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {p.departamento} · {p.municipio}
                      </span>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          p.estadoGestion === 'Cliente Cerrado'
                            ? 'bg-[#00e03c]/20 text-[#00e03c] border-[#00e03c]/30'
                            : p.estadoGestion === 'Cotización Enviada'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-white/[0.08] text-slate-300 border-white/[0.12]'
                        }`}
                      >
                        {p.estadoGestion}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white leading-tight">{p.razonSocial}</h4>
                    <p className="text-[9px] text-slate-500 font-mono">Matrícula: {p.matricula}</p>

                    <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                      {p.actividad}
                    </p>

                    {/* Servicio sugerido de SERAM */}
                    <div className="bg-white/[0.04] p-2 rounded-lg border border-white/[0.06] text-[10px]">
                      <span className="text-slate-400 font-bold block">Servicio sugerido SERAM:</span>
                      <span className="text-emerald-400 font-black">{p.servicioInteres}</span>
                    </div>

                    {/* Contacto */}
                    <div className="space-y-1 pt-1 text-[11px]">
                      {p.telefono && (
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-blue-400" /> {p.telefono}
                          </span>
                          <a
                            href={`https://wa.me/591${p.telefono.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-black text-[#00e03c] bg-[#00e03c]/10 hover:bg-[#00e03c]/20 px-2 py-0.5 rounded transition-colors"
                          >
                            WhatsApp ➔
                          </a>
                        </div>
                      )}
                      {p.email && (
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 font-mono text-[10px] truncate max-w-[170px]">
                            <Mail className="w-3 h-3 text-purple-400 shrink-0" /> {p.email}
                          </span>
                          <a
                            href={`mailto:${p.email}?subject=Asesoramiento%20Ambiental%20SERAM`}
                            className="text-[9px] font-black text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded transition-colors"
                          >
                            Email
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones de Gestión y Conversión a Cliente */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={p.estadoGestion}
                        onChange={(e) => handleUpdateProspect(p.id, { estadoGestion: e.target.value })}
                        className="text-[10px] font-bold px-2 py-1 rounded bg-white/[0.06] border border-white/[0.1] text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white flex-1"
                      >
                        <option value="Prospecto Nuevo">Prospecto Nuevo</option>
                        <option value="Contactado">Contactado</option>
                        <option value="Cotización Enviada">Cotización Enviada</option>
                        <option value="Cliente Cerrado">Cliente Cerrado</option>
                      </select>

                      <select
                        value={p.socioAsignado}
                        onChange={(e) => handleUpdateProspect(p.id, { socioAsignado: e.target.value })}
                        className="text-[10px] font-bold px-2 py-1 rounded bg-white/[0.06] border border-white/[0.1] text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white flex-1"
                      >
                        <option value="Sin Asignar">Sin Asignar</option>
                        <option value="Ing. Diego Barrientos">Diego</option>
                        <option value="Ing. Fernando Araujo">Fernando</option>
                        <option value="Ing. Fabricio Orosco">Fabricio</option>
                      </select>
                    </div>

                    {p.estadoGestion !== 'Cliente Cerrado' ? (
                      <button
                        onClick={() => handleConvertProspectToClient(p.id)}
                        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-[#00e03c] text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#00e03c]/10 hover:brightness-110 transition-all"
                      >
                        <Sparkles className="w-3 h-3" /> Convertir en Cliente SERAM
                      </button>
                    ) : (
                      <div className="text-center py-1 text-[10px] font-black text-[#00e03c] bg-[#00e03c]/10 rounded-lg border border-[#00e03c]/20 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Cliente Oficial Registrado
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
          </div>
        </div>
      )}

      {/* ── VISTA 4: PROGRESO Y MERITOCRACIA DE SOCIOS ── */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {partnersList.map((partner) => {
              const partnerActivities = activities.filter((a) => a.assignedPartner === partner.name);
              const pDone = partnerActivities.filter((a) => a.status === 'Concluido').length;
              const pInProgress = partnerActivities.filter((a) => a.status === 'En curso').length;
              const pPending = partnerActivities.filter((a) => a.status === 'Pendiente').length;
              const pTotal = partnerActivities.length;
              const pPct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;

              return (
                <GlassCard key={partner.name} className="p-5 space-y-4 border-[#00e03c]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#00e03c]/10 border border-[#00e03c]/30 flex items-center justify-center text-[#00e03c] font-black text-lg">
                      {partner.name.replace('Ing. ', '').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{partner.name}</h4>
                      <p className="text-[11px] text-[#00e03c] font-bold">{partner.role}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{partner.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Avance de Actividades</span>
                      <span className="text-[#00e03c] font-black">{pPct}%</span>
                    </div>
                    <div className="w-full bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-[#00e03c] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center">
                    <div className="bg-white/[0.04] p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Hechas</span>
                      <span className="text-base font-black text-[#00e03c]">{pDone}</span>
                    </div>
                    <div className="bg-white/[0.04] p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">En curso</span>
                      <span className="text-base font-black text-blue-400">{pInProgress}</span>
                    </div>
                    <div className="bg-white/[0.04] p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Pendientes</span>
                      <span className="text-base font-black text-slate-400">{pPending}</span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VISTA 6: MISIONES ESPECIALES & COFRES DE RESPLANDOR (OCTALYSIS) ── */}
      {activeTab === 'missions' && (
        <SpecialMissionsModule currentSocio={currentSocio} />
      )}

      {/* ── VISTA 7: SINERGIAS & COMBOS INTERDISCIPLINARIOS (OCTALYSIS CD3 & CD5) ── */}
      {activeTab === 'synergies' && (
        <InterdisciplinarySynergies currentSocio={currentSocio} />
      )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── MODAL: REGISTRAR / EDITAR ACTIVIDAD CLAVE ── */}
      <AnimatePresence>
        {showNewActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e1622] border border-white/[0.15] rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-5 h-5 text-[#00e03c]" />
                  <h3 className="text-base font-black text-white">
                    {editingActivity ? 'Editar Actividad Clave' : 'Nueva Actividad Clave (Notion ➔ SERAM)'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewActivityModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmitActivity} className="space-y-4 text-xs">
                {/* Título */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Título de la Actividad / Tarea *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Análisis multitemporal satelital en ArcGIS Pro"
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                  />
                </div>

                {/* Proyecto y Socio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Proyecto Vinculado</label>
                    <select
                      value={actProjectId}
                      onChange={(e) => setActProjectId(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
                    >
                      <option value="">Proyecto General / Interno</option>
                      {activeServices.map((p) => (
                        <option key={p.id} value={p.id}>{p.client || p.type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Socio Responsable *</label>
                    <select
                      value={actPartner}
                      onChange={(e) => setActPartner(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
                    >
                      {partnersList.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Co-Ejecutor / Combo Interdisciplinario */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black uppercase text-amber-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Socio Co-Ejecutor (Combo Interdisciplinario)
                      </span>
                      <span className="text-[9px] text-amber-300 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                        +35% XP & Consorcio
                      </span>
                    </label>
                    <select
                      value={actCoPartner}
                      onChange={(e) => setActCoPartner(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white"
                    >
                      <option value="">-- Sin Co-ejecutor (Misión Individual) --</option>
                      {partnersList.filter(p => p.name !== actPartner).map((p) => (
                        <option key={p.name} value={p.name}>⚡ Combo Interdisciplinario con {p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Categoría y Prioridad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Categoría Técnica</label>
                    <select
                      value={actCategory}
                      onChange={(e) => setActCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
                    >
                      <option value="SIG / Cartografía">SIG / Cartografía</option>
                      <option value="Desarrollo Web & Sistemas">Desarrollo Web & Sistemas</option>
                      <option value="Propuestas Técnicas & Proyectos">Propuestas Técnicas & Proyectos</option>
                      <option value="Legal & Corporativo">Legal & Corporativo</option>
                      <option value="Trámite Ambiental FNCA/RAI">Trámite Ambiental FNCA/RAI</option>
                      <option value="Trabajo de Campo / Muestreo">Trabajo de Campo / Muestreo</option>
                      <option value="Elaboración Informe / TDR">Elaboración Informe / TDR</option>
                      <option value="Gestión Comercial / Reunión">Gestión Comercial / Reunión</option>
                      <option value="Administración & Finanzas">Administración & Finanzas</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Prioridad</label>
                    <select
                      value={actPriority}
                      onChange={(e) => setActPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>
                </div>

                {/* Fecha Límite y Horas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Fecha Límite (Deadline)</label>
                    <input
                      type="date"
                      value={actDueDate}
                      onChange={(e) => setActDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Horas Estimadas</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Ej: 8"
                      value={actEstHours}
                      onChange={(e) => setActEstHours(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                    />
                  </div>
                </div>

                {/* Descripción Detallada */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Detalles Técnicos / Entregable</label>
                  <textarea
                    rows="3"
                    placeholder="Instrucciones o requerimientos específicos de este hito..."
                    value={actDesc}
                    onChange={(e) => setActDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c] resize-none"
                  />
                </div>

                {/* Botones */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewActivityModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black shadow-lg shadow-[#00e03c]/20"
                  >
                    {editingActivity ? 'Guardar Cambios' : 'Registrar Actividad'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: INSCRIBIR NUEVO CLIENTE ── */}
      <AnimatePresence>
        {showNewClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e1622] border border-white/[0.15] rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-black text-white">Inscribir Nuevo Cliente / Entidad</h3>
                </div>
                <button
                  onClick={() => setShowNewClientModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmitClient} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Razón Social / Nombre de la Institución *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Gobierno Autónomo Municipal de Mapiri"
                    value={clName}
                    onChange={(e) => setClName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Sector / Tipo</label>
                    <select
                      value={clType}
                      onChange={(e) => setClType(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-purple-400 [&>option]:bg-[#0d1622] [&>option]:text-white"
                    >
                      <option value="Municipal / Público">Municipal / Público</option>
                      <option value="Minería / Cooperativa">Minería / Cooperativa</option>
                      <option value="Industrial / Fabril">Industrial / Fabril</option>
                      <option value="Privado / Particular">Privado / Particular</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Persona de Contacto / Cargo</label>
                    <input
                      type="text"
                      placeholder="Ej: Ing. Jefe de Medio Ambiente"
                      value={clContact}
                      onChange={(e) => setClContact(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="+591 7XXXXXXX"
                      value={clPhone}
                      onChange={(e) => setClPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="contacto@entidad.gob.bo"
                      value={clEmail}
                      onChange={(e) => setClEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Ubicación / Municipio</label>
                  <input
                    type="text"
                    placeholder="Ej: Mapiri, Larecaja - La Paz"
                    value={clLocation}
                    onChange={(e) => setClLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Notas / Antecedentes</label>
                  <textarea
                    rows="2"
                    placeholder="Requerimientos iniciales, antecedentes de fiscalización..."
                    value={clNotes}
                    onChange={(e) => setClNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewClientModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black shadow-lg shadow-purple-500/20"
                  >
                    Registrar Cliente
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SLIDE-OVER DRAWER LATERAL: FICHA TÉCNICA NOTION-STYLE ── */}
      <AnimatePresence>
        {drawerActivity && drawerData && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop oscuro translúcido */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerActivity(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="w-screen max-w-xl bg-[#0c141f] border-l border-white/[0.12] p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative z-10 overflow-y-auto space-y-6"
              >
                {/* Header del Drawer */}
                <div className="space-y-4 border-b border-white/[0.08] pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/[0.08] text-slate-300">
                        {drawerData.category || 'General'}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${PRIORITY_STYLES[drawerData.priority] || PRIORITY_STYLES.Media}`}>
                        Prioridad {drawerData.priority}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDrawerActivity(null)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="Cerrar ficha"
                    >
                      <PanelRightClose className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Input Título editable directamente */}
                  <input
                    type="text"
                    value={drawerData.title || ''}
                    onChange={(e) => setDrawerData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-lg sm:text-xl font-black text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#00e03c] focus:outline-none transition-colors px-1 py-0.5"
                    placeholder="Título de la actividad..."
                  />

                  {/* Proyecto Vinculado */}
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>{drawerData.projectTitle || 'Proyecto General'}</span>
                  </div>
                </div>

                {/* Sección de 5 Hitos Interactivos */}
                <div className="space-y-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00e03c]" /> Hitos de Ejecución Técnica (5 Fases)
                    </h5>
                    <span className="text-[11px] font-black text-[#00e03c] bg-[#00e03c]/10 px-2 py-0.5 rounded-full border border-[#00e03c]/20">
                      {Math.round(((drawerData.milestoneStep || 0) / 5) * 100)}% Completado
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#00e03c] h-full transition-all duration-300 shadow-sm shadow-[#00e03c]"
                      style={{ width: `${((drawerData.milestoneStep || 0) / 5) * 100}%` }}
                    />
                  </div>

                  {/* Lista de hitos interactivos */}
                  <div className="space-y-2 pt-1">
                    {STANDARD_MILESTONES.map((m) => {
                      const isDone = (drawerData.milestoneStep || 0) >= m.step;
                      return (
                        <div
                          key={m.step}
                          onClick={() => handleMilestoneClick(drawerActivity, m.step)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isDone
                              ? 'bg-[#00e03c]/10 border-[#00e03c]/30 text-white'
                              : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                              isDone ? 'bg-[#00e03c] text-slate-950 font-black' : 'border border-white/20 text-slate-500'
                            }`}>
                              {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : m.step}
                            </div>
                            <span className={isDone ? 'font-bold text-white' : 'font-medium'}>
                              {m.label}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold ${isDone ? 'text-[#00e03c]' : 'text-slate-500'}`}>
                            {isDone ? 'Completado' : 'Pendiente'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Panel de Auditoría Pericial y Validación Cruzada (Anti-Cheat) */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/25 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Auditoría Societaria & Validación Cruzada
                      </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      drawerData.status === 'Concluido' ? 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30' :
                      drawerData.status === 'En revisión' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                      'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {drawerData.status}
                    </span>
                  </div>

                  {drawerData.status === 'En revisión' && (
                    <div className="space-y-3">
                      {currentSocio?.name === drawerData.assignedPartner ? (
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-amber-300">
                            <Clock className="w-3.5 h-3.5" /> Entregable a la espera de auditoría técnica
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Principio Anti-Cheat: Como autor responsable no puedes auto-aprobarte esta actividad. Requiere que Fernando, Fabricio o Diego revisen el entregable para acreditarte los puntos de XP.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/[0.08] to-transparent border border-emerald-500/30 space-y-2.5">
                          <div className="text-xs text-slate-200">
                            <span className="font-bold text-white">{drawerData.assignedPartner}</span> ha marcado este entregable como concluido y solicita tu validación pericial.
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleApproveActivity(drawerData)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00e03c]/20"
                            >
                              <ShieldCheck className="w-4 h-4" /> Aprobar y Acreditar XP
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectActivity(drawerData)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
                            >
                              Solicitar Corrección
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {drawerData.status === 'Concluido' && (
                    <div className="p-3 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/20 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00e03c]" />
                        <div>
                          <span className="font-bold text-white block">Aprobado y Auditado</span>
                          <span className="text-[10px] text-slate-400">
                            Por {drawerData.approved_by || 'Directorio SERAM'} {drawerData.approved_at && `· ${new Date(drawerData.approved_at).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">XP Acreditado</span>
                        <span className="text-sm font-black text-[#00e03c] font-mono">+{drawerData.xp_awarded || 200} XP</span>
                      </div>
                    </div>
                  )}

                  {drawerData.status !== 'En revisión' && drawerData.status !== 'Concluido' && (
                    <p className="text-[11px] text-slate-400 italic">
                      Cuando se concluyan los 4 primeros hitos técnicos, la tarea pasará a revisión y otro socio validará la calidad técnica antes del cierre.
                    </p>
                  )}
                </div>

                {/* Formulario en línea de Propiedades y Metadatos */}
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Estado */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Estado de Flujo</label>
                      <select
                        value={drawerData.status || 'Pendiente'}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
                      >
                        {STATUS_COLUMNS.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Prioridad */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Prioridad</label>
                      <select
                        value={drawerData.priority || 'Media'}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
                      >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Socio Asignado */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Socio Responsable</label>
                      <select
                        value={drawerData.assignedPartner || ''}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, assignedPartner: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
                      >
                        {partnersList.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rango de Fechas (Inicio y Límite) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Rango de Fechas (Inicio ➔ Límite)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={drawerData.startDate || ''}
                          onChange={(e) => setDrawerData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-2.5 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-[#00e03c]"
                          title="Fecha de inicio"
                        />
                        <input
                          type="date"
                          value={drawerData.dueDate || ''}
                          onChange={(e) => setDrawerData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full px-2.5 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-[#00e03c]"
                          title="Fecha límite"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Horas Estimadas */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Horas Estimadas</label>
                      <input
                        type="number"
                        step="0.5"
                        value={drawerData.estimatedHours || 0}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-mono focus:outline-none focus:border-[#00e03c]"
                      />
                    </div>

                    {/* Horas Ejecutadas */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Horas Reales Ejecutadas</label>
                      <input
                        type="number"
                        step="0.5"
                        value={drawerData.actualHours || 0}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, actualHours: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-[#00e03c] font-black font-mono focus:outline-none focus:border-[#00e03c]"
                      />
                    </div>
                  </div>

                  {/* Enlace URL de Entregable (Google Docs, Drive, TikTok, etc.) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-sky-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5" /> Enlace de Entregable / Documento URL
                      </span>
                      {(drawerData.url || drawerData.deliverableUrl) && (
                        <a
                          href={drawerData.url || drawerData.deliverableUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-sky-300 underline font-mono flex items-center gap-1 hover:text-white"
                        >
                          Abrir Link ➔
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/... o https://drive.google.com/..."
                      value={drawerData.url || drawerData.deliverableUrl || ''}
                      onChange={(e) => setDrawerData(prev => ({ ...prev, url: e.target.value, deliverableUrl: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-sky-500/30 rounded-xl text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  {/* Descripción / Entregable */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Detalles Técnicos & Requerimientos del Entregable</label>
                    <textarea
                      rows="4"
                      value={drawerData.description || ''}
                      onChange={(e) => setDrawerData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Escribe notas, especificaciones o enlaces a los entregables..."
                      className="w-full px-3.5 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c] resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Pie del Drawer con Acciones */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Seguro que deseas eliminar esta actividad?')) {
                        handleDeleteActivity(drawerData.id);
                        setDrawerActivity(null);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerActivity(null)}
                      className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={saveDrawerData}
                      className="px-5 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs shadow-lg shadow-[#00e03c]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Guardar Ficha
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

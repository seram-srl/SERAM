import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Clock, Plus, Filter, User, Building2,
  Calendar, AlertCircle, ArrowRight, Trash2, Edit2, Check,
  X, Search, Briefcase, FileText, ChevronDown, ChevronUp, CheckCircle2,
  ListFilter, Sparkles, Phone, Mail, MapPin, ExternalLink,
  Layers, BarChart2, TrendingUp, ChevronRight, PanelRightClose,
  ShieldCheck, Award, Scale, Gift, Table, ChevronLeft,
  Target, Users, UserCheck, Link2, Zap,
  Download, Upload, Paperclip, Share2, FileDown, Timer, Flame,
  Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateTaskXP, validateCrossApproval } from './gamification/xpEngine';
import SpecialMissionsModule from './gamification/SpecialMissionsModule';
import InterdisciplinarySynergies from './gamification/InterdisciplinarySynergies';
import { FLASH_CONTINGENCY_TEMPLATES, calculateTimeRemaining } from './gamification/FlashMissionsEngine';

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
    } catch (e) {
      // Formato inválido, retornar string original
    }
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
  if (!act) return 0;
  if (act.status === 'Concluido') return 100;
  const mType = act.milestoneType || 'phases';
  if (mType === 'weekdays') {
    const days = act.weekdays || {};
    const dayKeys = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    const checkedCount = dayKeys.filter(d => Boolean(days[d])).length;
    return Math.round((checkedCount / 7) * 100);
  }
  if (mType === 'custom_subtasks') {
    const subs = Array.isArray(act.customSubtasks) ? act.customSubtasks : [];
    if (subs.length === 0) return act.status === 'En curso' ? 50 : (act.status === 'En revisión' ? 80 : 0);
    const doneCount = subs.filter(s => s.done).length;
    return Math.round((doneCount / subs.length) * 100);
  }
  if (mType === 'numeric') {
    const curr = Number(act.currentValue) || 0;
    const target = Number(act.targetValue) || 1;
    return Math.min(100, Math.round((curr / target) * 100));
  }
  // Default 'phases' (5 standard milestones)
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

// ── TEMPORIZADOR REGRESIVO FLASH (COUNTDOWN EN VIVO) ───────────────────────────
const FlashCountdownBadge = ({ expiresAt, compact = false, totalDurationHours = 72 }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(expiresAt, totalDurationHours));

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(expiresAt, totalDurationHours));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, totalDurationHours]);

  if (!expiresAt) return null;

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold shadow-sm">
        <Timer className="w-3 h-3 text-rose-400" />
        <span>Expirada</span>
      </span>
    );
  }

  if (timeLeft.isCritical) {
    return (
      <span
        title={`Vence: ${new Date(expiresAt).toLocaleString()}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold animate-pulse shadow-sm shadow-rose-500/20"
      >
        <Flame className="w-3 h-3 text-rose-400 animate-bounce" />
        <span>{compact ? timeLeft.formattedTime.slice(0, 5) : timeLeft.formattedTime}</span>
      </span>
    );
  }

  if (timeLeft.isUrgent) {
    return (
      <span
        title={`Vence: ${new Date(expiresAt).toLocaleString()}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold shadow-sm"
      >
        <Timer className="w-3 h-3 text-amber-400" />
        <span>{compact ? timeLeft.formattedTime.slice(0, 5) : timeLeft.formattedTime}</span>
      </span>
    );
  }

  return (
    <span
      title={`Vence: ${new Date(expiresAt).toLocaleString()}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold shadow-sm"
    >
      <Timer className="w-3 h-3 text-emerald-400" />
      <span>{compact ? timeLeft.formattedTime.slice(0, 5) : timeLeft.formattedTime}</span>
    </span>
  );
};

// ── COMPARTIR AL CORREO (MAILTO EJECUTIVO) ──────────────────────────────────
const handleShareActivityEmail = (act) => {
  const subject = `[SERAM S.R.L.] Reporte Técnico de Actividad Clave: ${act.title}`;
  const deliverableText = act.deliverableUrl || act.url || 'Sin enlace adjunto aún';
  const fileName = act.deliverableName ? ` (${act.deliverableName})` : '';
  const body = `Estimado Directorio y Equipo SERAM S.R.L.,

Por medio del presente se comparte el resumen ejecutivo y estado de ejecución técnica de la siguiente actividad:

• Actividad Clave: ${act.title}
• Tipo de Misión: ${act.isFlash || act.activityType === 'flash' ? '⚡ Misión Flash de Contingencia (Urgente)' : (act.activityType === 'secundaria' ? 'Secundaria' : 'Principal')}
• Proyecto Vinculado: ${act.projectTitle || 'SERAM S.R.L.'}
• Responsable: ${act.assignedPartner || 'Directorio SERAM'}
• Co-Ejecutor (Combo): ${act.coPartner || 'N/A'}
• Estado Actual: ${act.status} (Hito ${act.milestoneStep || 0}/5)
• Prioridad: ${act.priority || 'Media'}
• Fecha de Inicio: ${act.startDate || 'N/A'}
• Fecha Límite: ${act.dueDate || 'Sin fecha definida'}${act.flashExpiresAt ? ` (Expiración Flash: ${new Date(act.flashExpiresAt).toLocaleString()})` : ''}
• Horas Ejecutadas: ${act.actualHours || 0} hrs / Estimadas: ${act.estimatedHours || 0} hrs
• Entregable / Enlace de Descarga: ${deliverableText}${fileName}
• Especificaciones / Alcance: ${act.description || 'Sin notas adicionales'}

Atentamente,
Ecosistema de Operaciones SERAM S.R.L.
La Paz, Bolivia`;

  const mailtoUrl = `mailto:${act.assignedPartnerEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
};

// ── MOTOR INTELIGENTE DE DESCARGA DE ENTREGABLES (BASE64, GOOGLE DOCS/SHEETS/DRIVE & URLS) ───
const handleDownloadDeliverable = (act, triggerToast = null) => {
  if (!act) return;
  const url = act.deliverableUrl || act.url;
  if (!url) {
    if (triggerToast) triggerToast('No hay documento o enlace disponible para descargar', 'error');
    return;
  }

  const title = act.title || 'entregable_seram';
  const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const defaultBaseName = act.deliverableName || `${cleanTitle}_entregable`;

  // 1. Google Docs: Exportación directa a PDF (/export?format=pdf)
  const docMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i);
  if (docMatch && docMatch[1]) {
    const exportUrl = `https://docs.google.com/document/d/${docMatch[1]}/export?format=pdf`;
    const link = document.createElement('a');
    link.href = exportUrl;
    link.setAttribute('download', defaultBaseName.endsWith('.pdf') ? defaultBaseName : `${defaultBaseName}.pdf`);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (triggerToast) triggerToast('Iniciando descarga directa de Google Docs en formato PDF...', 'info');
    return;
  }

  // 2. Google Sheets: Exportación directa a PDF (/export?format=pdf)
  const sheetMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/i);
  if (sheetMatch && sheetMatch[1]) {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=pdf`;
    const link = document.createElement('a');
    link.href = exportUrl;
    link.setAttribute('download', defaultBaseName.endsWith('.pdf') ? defaultBaseName : `${defaultBaseName}_planilla.pdf`);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (triggerToast) triggerToast('Iniciando descarga directa de Google Sheets en formato PDF...', 'info');
    return;
  }

  // 3. Google Drive: Enlace de descarga directa (uc?export=download&id=...)
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+)|uc\?id=([a-zA-Z0-9_-]+))/i);
  if (driveMatch) {
    const fileId = driveMatch[1] || driveMatch[2] || driveMatch[3];
    if (fileId) {
      const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const link = document.createElement('a');
      link.href = directDownloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (triggerToast) triggerToast('Descargando archivo desde Google Drive...', 'info');
      return;
    }
  }

  // 4. DataURI (Base64) o archivo con extensión directa (.pdf, .jpg, .png, .md, .docx, .zip, etc.)
  if (url.startsWith('data:') || /\.(pdf|jpg|jpeg|png|md|txt|docx|xlsx|zip|rar|csv)($|\?)/i.test(url)) {
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultBaseName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (triggerToast) triggerToast(`Descargando entregable: ${act.deliverableName || 'Documento'}`, 'info');
    return;
  }

  // 5. Cualquier otra URL web: abrir en pestaña segura
  window.open(url, '_blank', 'noopener,noreferrer');
  if (triggerToast) triggerToast('Abriendo enlace del documento en nueva pestaña...', 'info');
};

export default function ActivitiesAndClientsModule({ currentSocio }) {
  const {
    activities = [],
    activeServices = [],
    handleAddActivity,
    handleUpdateActivityStatus,
    handleEditActivity,
    handleDeleteActivity,
    triggerToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('table'); // 'table', 'kanban', 'missions', 'progress', 'synergies'
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all' (Grupal) | 'personal' (Mis actividades)
  const [pageSize, setPageSize] = useState(10); // 10 (default: últimas 10) | 25 | 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [okrFilter, setOkrFilter] = useState('all'); // 'all' | 'anual' | 'semestral' | 'trimestral' | 'mensual' | 'semanal' | 'diario'
  const [missionFilter, setMissionFilter] = useState('all'); // 'all' | 'flash' | 'principal' | 'secundaria' | 'combo'
  const [missionSubTab, setMissionSubTab] = useState('missions'); // 'missions' | 'chests'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandAllConcluido, setExpandAllConcluido] = useState(false);
  const [drawerNewSubtaskInput, setDrawerNewSubtaskInput] = useState('');

  // Modales
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Slide-over Drawer lateral (Ficha detallada sin modales invasivos)
  const [drawerActivity, setDrawerActivity] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Copiado al Portapapeles con Feedback Visual y Toast
  const handleCopyLink = async (url, id = 'drawer') => {
    if (!url) {
      if (triggerToast) triggerToast('No hay enlace disponible para copiar', 'error');
      return;
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      if (triggerToast) {
        triggerToast('¡Enlace copiado al portapapeles!', 'success');
      }
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    } catch (err) {
      console.warn('Error al copiar enlace:', err);
      if (triggerToast) {
        triggerToast('No se pudo copiar el enlace', 'error');
      }
    }
  };

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
  }, [scopeFilter, partnerFilter, projectFilter, okrFilter, searchQuery, pageSize]);

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

  const handleCompleteActivityValidation = (act, finalFields = {}) => {
    const criteria = act.validationCriteria || 'cross_audit';

    // 1. Bolsa Provisional de Horas (Sin bloqueo operativo, ratificación en Directorio)
    if (criteria === 'provisional_pool') {
      const hours = Number(act.actualHours) || Number(act.estimatedHours) || 2;
      const diff = act.priority === 'Alta' ? 'Alta' : (act.priority === 'Urgente' ? 'Critica' : 'Media');
      const xpResult = calculateTaskXP({ hours, difficulty: diff, deadline: act.dueDate, completedAt: new Date() });
      const comboMultiplier = act.coPartner ? 1.35 : 1.0;
      const finalXP = Math.round(xpResult.finalXP * comboMultiplier);

      const updateObj = {
        ...finalFields,
        status: 'Concluido',
        milestoneStep: 5,
        isProvisional: true,
        xp_awarded: finalXP,
        approved_by: 'Bolsa Provisional (Directorio)',
        approved_at: new Date().toISOString()
      };
      handleEditActivity(act.id, updateObj);
      if (drawerActivity && drawerActivity.id === act.id) {
        setDrawerData(prev => ({ ...prev, ...updateObj }));
      }
      triggerToast(`¡Concluido en Bolsa Provisional de Horas (+${finalXP} XP)! Se ratificará en la reunión de Directorio semanal.`, 'success');
      return;
    }

    // 2. Auto-completar con Comprobante Obligatorio
    if (criteria === 'auto_proof') {
      const activeObj = (drawerActivity && drawerActivity.id === act.id && drawerData) ? drawerData : act;
      const hasProof = Boolean(
        activeObj.deliverableUrl || activeObj.url || activeObj.deliverableName ||
        (Array.isArray(activeObj.attachments) && activeObj.attachments.length > 0) ||
        finalFields.deliverableUrl || finalFields.url
      );
      if (!hasProof) {
        triggerToast('⚠️ Se requiere URL o comprobante obligatorio para concluir este entregable al 100%.', 'error');
        if (!drawerActivity || drawerActivity.id !== act.id) {
          setDrawerActivity(act);
        }
        return;
      }
      const hours = Number(act.actualHours) || Number(act.estimatedHours) || 2;
      const diff = act.priority === 'Alta' ? 'Alta' : (act.priority === 'Urgente' ? 'Critica' : 'Media');
      const xpResult = calculateTaskXP({ hours, difficulty: diff, deadline: act.dueDate, completedAt: new Date() });
      const comboMultiplier = act.coPartner ? 1.35 : 1.0;
      const finalXP = Math.round(xpResult.finalXP * comboMultiplier);

      const updateObj = {
        ...finalFields,
        status: 'Concluido',
        milestoneStep: 5,
        xp_awarded: finalXP,
        approved_by: `${act.assignedPartner} (Comprobante)`,
        approved_at: new Date().toISOString()
      };
      handleEditActivity(act.id, updateObj);
      if (drawerActivity && drawerActivity.id === act.id) {
        setDrawerData(prev => ({ ...prev, ...updateObj }));
      }
      triggerToast(`¡Comprobante validado y entregable concluido al 100%! (+${finalXP} XP)`, 'success');
      return;
    }

    // 3. Auditoría Cruzada Pericial (cross_audit)
    if (currentSocio?.name === act.assignedPartner) {
      handleEditActivity(act.id, {
        ...finalFields,
        milestoneStep: 4,
        status: 'En revisión',
      });
      if (drawerActivity && drawerActivity.id === act.id) {
        setDrawerData(prev => ({ ...prev, ...finalFields, milestoneStep: 4, status: 'En revisión' }));
      }
      triggerToast('Entregable pericial enviado a "En revisión". Para garantizar equidad, otro socio directivo debe auditarlo.', 'info');
      return;
    }

    handleApproveActivity(act);
  };

  const handleRequestStatusChange = (act, targetStatus) => {
    if (targetStatus === 'Concluido') {
      handleCompleteActivityValidation(act);
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
      handleCompleteActivityValidation(act, { milestoneStep: 5 });
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

  const handleToggleWeekday = (act, dayKey) => {
    const targetAct = (drawerActivity && drawerActivity.id === act.id && drawerData) ? drawerData : act;
    const currentWeekdays = targetAct.weekdays || { lun: false, mar: false, mie: false, jue: false, vie: false, sab: false, dom: false };
    const updatedWeekdays = {
      ...currentWeekdays,
      [dayKey]: !currentWeekdays[dayKey]
    };
    const dayKeys = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    const checkedCount = dayKeys.filter(k => updatedWeekdays[k]).length;

    if (checkedCount === 7) {
      handleCompleteActivityValidation(targetAct, { weekdays: updatedWeekdays });
      return;
    }

    const newStatus = checkedCount > 0 ? 'En curso' : 'Pendiente';
    handleEditActivity(act.id, {
      weekdays: updatedWeekdays,
      status: newStatus
    });
    if (drawerActivity && drawerActivity.id === act.id) {
      setDrawerData(prev => ({
        ...prev,
        weekdays: updatedWeekdays,
        status: newStatus
      }));
    }
  };

  const handleToggleCustomSubtask = (act, subtaskId) => {
    const targetAct = (drawerActivity && drawerActivity.id === act.id && drawerData) ? drawerData : act;
    const subs = Array.isArray(targetAct.customSubtasks) ? targetAct.customSubtasks : [];
    const updatedSubs = subs.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s);
    const doneCount = updatedSubs.filter(s => s.done).length;

    if (updatedSubs.length > 0 && doneCount === updatedSubs.length) {
      handleCompleteActivityValidation(targetAct, { customSubtasks: updatedSubs });
      return;
    }

    const newStatus = doneCount > 0 ? 'En curso' : 'Pendiente';
    handleEditActivity(act.id, {
      customSubtasks: updatedSubs,
      status: newStatus
    });
    if (drawerActivity && drawerActivity.id === act.id) {
      setDrawerData(prev => ({
        ...prev,
        customSubtasks: updatedSubs,
        status: newStatus
      }));
    }
  };

  const handleNumericChange = (act, delta) => {
    const targetAct = (drawerActivity && drawerActivity.id === act.id && drawerData) ? drawerData : act;
    const curr = Number(targetAct.currentValue) || 0;
    const target = Number(targetAct.targetValue) || 10;
    const newCurr = Math.max(0, curr + delta);

    if (newCurr >= target) {
      handleCompleteActivityValidation(targetAct, { currentValue: newCurr });
      return;
    }

    const newStatus = newCurr > 0 ? 'En curso' : 'Pendiente';
    handleEditActivity(act.id, {
      currentValue: newCurr,
      status: newStatus
    });
    if (drawerActivity && drawerActivity.id === act.id) {
      setDrawerData(prev => ({
        ...prev,
        currentValue: newCurr,
        status: newStatus
      }));
    }
  };

  const handleAddDrawerSubtask = () => {
    if (!drawerNewSubtaskInput.trim() || !drawerData || !drawerActivity) return;
    const currentSubs = Array.isArray(drawerData.customSubtasks) ? [...drawerData.customSubtasks] : [];
    const newSub = { id: `st_${Date.now()}`, label: drawerNewSubtaskInput.trim(), done: false };
    const updated = [...currentSubs, newSub];
    setDrawerData(prev => ({ ...prev, customSubtasks: updated }));
    handleEditActivity(drawerActivity.id, { customSubtasks: updated });
    setDrawerNewSubtaskInput('');
  };

  const handleRemoveDrawerSubtask = (stId) => {
    if (!drawerData || !drawerActivity) return;
    const currentSubs = Array.isArray(drawerData.customSubtasks) ? [...drawerData.customSubtasks] : [];
    const updated = currentSubs.filter(s => s.id !== stId);
    setDrawerData(prev => ({ ...prev, customSubtasks: updated }));
    handleEditActivity(drawerActivity.id, { customSubtasks: updated });
  };

  const saveDrawerData = () => {
    if (!drawerData) return;
    handleEditActivity(drawerData.id, drawerData);
    setDrawerActivity(null);
    triggerToast('Ficha de actividad actualizada correctamente', 'success');
  };

  // Estados para Misiones Rápidas y Modal de Asignación Flash
  const [showQuickMissionModal, setShowQuickMissionModal] = useState(false);
  const [quickMissionTab, setQuickMissionTab] = useState('templates'); // 'templates' | 'custom'
  const [customMissionTitle, setCustomMissionTitle] = useState('');
  const [customMissionDesc, setCustomMissionDesc] = useState('');
  const [customMissionDuration, setCustomMissionDuration] = useState(72);
  const [customMissionPartner, setCustomMissionPartner] = useState(currentSocio?.name || 'Ing. Diego Barrientos');
  const [customMissionCoPartner, setCustomMissionCoPartner] = useState('');
  const [customMissionCategory, setCustomMissionCategory] = useState('EIA / Legal Ambiental');

  // Form State Actividad
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actProjectId, setActProjectId] = useState('');
  const [actPartner, setActPartner] = useState(currentSocio?.name || 'Ing. Diego Barrientos');
  const [actCoPartner, setActCoPartner] = useState('');
  const [actCategory, setActCategory] = useState('SIG / Cartografía');
  const [actPriority, setActPriority] = useState('Media');
  const [actDueDate, setActDueDate] = useState('');
  const [actStartDate, setActStartDate] = useState('');
  const [actEstHours, setActEstHours] = useState('');
  const [actActivityType, setActActivityType] = useState('principal'); // 'principal' | 'secundaria' | 'flash'
  const [actFlashDuration, setActFlashDuration] = useState(72);
  const [actDeliverableUrl, setActDeliverableUrl] = useState('');
  const [actDeliverableName, setActDeliverableName] = useState('');
  const [actAttachments, setActAttachments] = useState([]);

  // Multi-modal milestone & governance states
  const [actMilestoneType, setActMilestoneType] = useState('phases'); // 'phases' | 'weekdays' | 'custom_subtasks' | 'numeric'
  const [actCustomSubtasks, setActCustomSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [actWeekdays, setActWeekdays] = useState({ lun: false, mar: false, mie: false, jue: false, vie: false, sab: false, dom: false });
  const [actCurrentValue, setActCurrentValue] = useState(0);
  const [actTargetValue, setActTargetValue] = useState(10);
  const [actValidationCriteria, setActValidationCriteria] = useState('cross_audit'); // 'cross_audit' | 'auto_proof' | 'provisional_pool'
  const [actOkrLevel, setActOkrLevel] = useState('semanal'); // 'anual' | 'semestral' | 'trimestral' | 'mensual' | 'semanal' | 'diario'
  const [actTimeLimitHours, setActTimeLimitHours] = useState('');

  // Filtro de Actividades (Personal vs Grupal, Proyectos, Búsqueda, OKR y Ordenamiento)
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

      // 5. Filtro por Jerarquía OKR
      const matchOkr = okrFilter === 'all' || (act.okrLevel || 'semanal') === okrFilter;

      return matchPartner && matchProject && matchSearch && matchOkr;
    });

    // Ordenar por ID o fecha descendente (últimas actividades primero)
    return [...list].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [activities, scopeFilter, partnerFilter, projectFilter, okrFilter, searchQuery, currentSocio]);

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

  // Asignar misión flash desde plantilla predefinida de contingencias
  const handleSelectFlashTemplate = (tpl) => {
    const durationHours = tpl.durationHours || 72;
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();
    const selectedProj = activeServices[0];

    handleAddActivity({
      title: tpl.title,
      description: tpl.desc,
      projectId: selectedProj?.id || null,
      projectTitle: tpl.context || 'Contingencia Ambiental Flash',
      assignedPartner: tpl.defaultAssigned?.[0] || currentSocio?.name || 'Ing. Diego Barrientos',
      coPartner: tpl.defaultAssigned?.[1] || null,
      category: tpl.requiredRole || 'EIA / Legal Ambiental',
      priority: 'Urgente',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + durationHours * 3600 * 1000).toISOString().split('T')[0],
      estimatedHours: Math.min(40, Math.round(durationHours / 2)),
      actualHours: 0,
      status: 'En curso',
      milestoneStep: 1,
      isFlash: true,
      activityType: 'flash',
      flashExpiresAt: expiresAt,
      strategicObjectives: ['LIDERAR EL SECTOR', 'RENTABILIDAD']
    });

    setShowQuickMissionModal(false);
    triggerToast(`⚡ Misión Flash activada: ${durationHours}h límite de contingencia`, 'success');
  };

  // Asignar misión flash personalizada
  const handleSubmitCustomQuickMission = (e) => {
    e.preventDefault();
    if (!customMissionTitle.trim()) {
      triggerToast('Ingresa el título de la contingencia flash', 'error');
      return;
    }
    const durationHours = parseInt(customMissionDuration, 10) || 72;
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();
    const selectedProj = activeServices[0];

    handleAddActivity({
      title: customMissionTitle,
      description: customMissionDesc || 'Misión flash de contingencia prioritaria asignada por el Directorio.',
      projectId: selectedProj?.id || null,
      projectTitle: selectedProj ? selectedProj.client || selectedProj.type : 'Misión Flash SERAM',
      assignedPartner: customMissionPartner,
      coPartner: customMissionCoPartner || null,
      category: customMissionCategory,
      priority: 'Urgente',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + durationHours * 3600 * 1000).toISOString().split('T')[0],
      estimatedHours: Math.min(40, Math.round(durationHours / 2)),
      actualHours: 0,
      status: 'En curso',
      milestoneStep: 1,
      isFlash: true,
      activityType: 'flash',
      flashExpiresAt: expiresAt,
      strategicObjectives: ['LIDERAR EL SECTOR', 'RENTABILIDAD']
    });

    setCustomMissionTitle('');
    setCustomMissionDesc('');
    setShowQuickMissionModal(false);
    triggerToast(`⚡ Misión Flash personalizada creada (${durationHours}h restantes)`, 'success');
  };

  // Helper para procesar subida de archivo a Base64 DataURI con redundancia
  const handleFileUpload = (file, isDrawer = false) => {
    if (!file) return;
    const maxBytes = 25 * 1024 * 1024; // 25MB
    if (file.size > maxBytes) {
      triggerToast('El archivo supera el límite de 25 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target.result;
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const newAttachment = {
        name: file.name,
        size: file.size,
        type: file.type || fileExt,
        data: dataUri,
        uploadedAt: new Date().toISOString()
      };

      if (isDrawer) {
        setDrawerData(prev => {
          const currentAtts = Array.isArray(prev.attachments) ? prev.attachments : [];
          return {
            ...prev,
            deliverableUrl: dataUri,
            deliverableName: file.name,
            deliverableType: fileExt,
            url: dataUri,
            attachments: [newAttachment, ...currentAtts]
          };
        });
        triggerToast(`Archivo "${file.name}" adjuntado a la ficha`, 'success');
      } else {
        setActDeliverableUrl(dataUri);
        setActDeliverableName(file.name);
        setActAttachments(prev => [newAttachment, ...prev]);
        triggerToast(`Archivo "${file.name}" cargado`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Nueva Actividad
  const onSubmitActivity = (e) => {
    e.preventDefault();
    if (!actTitle.trim()) {
      triggerToast('Ingresa el título de la actividad', 'error');
      return;
    }

    const selectedProj = activeServices.find((p) => String(p.id) === String(actProjectId));
    const isFlashMission = actActivityType === 'flash';
    const expiresAt = isFlashMission
      ? new Date(Date.now() + (parseInt(actFlashDuration, 10) || 72) * 3600 * 1000).toISOString()
      : null;

    if (editingActivity) {
      handleEditActivity(editingActivity.id, {
        title: actTitle,
        description: actDesc,
        projectId: actProjectId ? (isNaN(actProjectId) ? actProjectId : parseInt(actProjectId)) : null,
        projectTitle: selectedProj ? selectedProj.client || selectedProj.type : 'Proyecto General',
        assignedPartner: actPartner,
        coPartner: actCoPartner || null,
        category: actCategory,
        priority: isFlashMission ? 'Urgente' : actPriority,
        startDate: actStartDate || null,
        dueDate: actDueDate,
        estimatedHours: parseFloat(actEstHours) || 0,
        activityType: actActivityType,
        isFlash: isFlashMission,
        flashExpiresAt: expiresAt || editingActivity.flashExpiresAt || null,
        deliverableUrl: actDeliverableUrl || editingActivity.deliverableUrl || null,
        deliverableName: actDeliverableName || editingActivity.deliverableName || null,
        url: actDeliverableUrl || editingActivity.url || null,
        attachments: actAttachments.length > 0 ? actAttachments : (editingActivity.attachments || []),
        milestoneType: actMilestoneType,
        customSubtasks: actCustomSubtasks,
        weekdays: actWeekdays,
        currentValue: Number(actCurrentValue) || 0,
        targetValue: Number(actTargetValue) || 10,
        validationCriteria: actValidationCriteria,
        okrLevel: actOkrLevel,
        timeLimitHours: actTimeLimitHours ? parseFloat(actTimeLimitHours) : null
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
        priority: isFlashMission ? 'Urgente' : actPriority,
        startDate: actStartDate || new Date().toISOString().split('T')[0],
        dueDate: actDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedHours: parseFloat(actEstHours) || 0,
        actualHours: 0,
        status: 'Pendiente',
        activityType: actActivityType,
        isFlash: isFlashMission,
        flashExpiresAt: expiresAt,
        deliverableUrl: actDeliverableUrl || null,
        deliverableName: actDeliverableName || null,
        url: actDeliverableUrl || null,
        attachments: actAttachments,
        milestoneType: actMilestoneType,
        customSubtasks: actCustomSubtasks,
        weekdays: actWeekdays,
        currentValue: Number(actCurrentValue) || 0,
        targetValue: Number(actTargetValue) || 10,
        validationCriteria: actValidationCriteria,
        okrLevel: actOkrLevel,
        timeLimitHours: actTimeLimitHours ? parseFloat(actTimeLimitHours) : null
      });
    }

    // Reset
    setActTitle('');
    setActDesc('');
    setActProjectId('');
    setActCoPartner('');
    setActStartDate('');
    setActEstHours('');
    setActActivityType('principal');
    setActFlashDuration(72);
    setActDeliverableUrl('');
    setActDeliverableName('');
    setActAttachments([]);
    setActMilestoneType('phases');
    setActCustomSubtasks([]);
    setNewSubtaskText('');
    setActWeekdays({ lun: false, mar: false, mie: false, jue: false, vie: false, sab: false, dom: false });
    setActCurrentValue(0);
    setActTargetValue(10);
    setActValidationCriteria('cross_audit');
    setActOkrLevel('semanal');
    setActTimeLimitHours('');
    setShowNewActivityModal(false);
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
    setActStartDate(act.startDate || '');
    setActDueDate(act.dueDate || '');
    setActEstHours(act.estimatedHours || '');
    setActActivityType(act.activityType || (act.isFlash ? 'flash' : 'principal'));
    setActDeliverableUrl(act.deliverableUrl || act.url || '');
    setActDeliverableName(act.deliverableName || '');
    setActAttachments(Array.isArray(act.attachments) ? act.attachments : []);
    setActMilestoneType(act.milestoneType || 'phases');
    setActCustomSubtasks(Array.isArray(act.customSubtasks) ? act.customSubtasks : []);
    setActWeekdays(act.weekdays || { lun: false, mar: false, mie: false, jue: false, vie: false, sab: false, dom: false });
    setActCurrentValue(act.currentValue !== undefined ? Number(act.currentValue) : 0);
    setActTargetValue(act.targetValue !== undefined ? Number(act.targetValue) : 10);
    setActValidationCriteria(act.validationCriteria || 'cross_audit');
    setActOkrLevel(act.okrLevel || 'semanal');
    setActTimeLimitHours(act.timeLimitHours || '');
    setShowNewActivityModal(true);
  };

  // ── CÁLCULO DE MÉTRICAS DINÁMICAS SUPERIORES (SEGÚN PESTAÑA ACTIVA) ──
  const tabMetrics = useMemo(() => {
    if (activeTab === 'kanban') {
      const pending = activities.filter(a => a.status === 'Pendiente').length;
      const inProg = activities.filter(a => a.status === 'En curso').length;
      const inRev = activities.filter(a => a.status === 'En revisión').length;
      const done = activities.filter(a => a.status === 'Concluido').length;
      return [
        { label: 'Backlog / Pendientes', value: pending, sub: 'Por iniciar en sprint', color: 'text-slate-300', icon: Layers, bg: 'bg-slate-500/10 border-slate-500/30' },
        { label: 'En Ejecución Activa', value: inProg, sub: 'En proceso de gabinete', color: 'text-blue-400', icon: Clock, bg: 'bg-blue-500/10 border-blue-500/30' },
        { label: 'En Revisión Pericial', value: inRev, sub: 'Auditoría entre pares', color: 'text-amber-400', icon: Scale, bg: 'bg-amber-500/10 border-amber-500/30' },
        { label: 'Tareas Finalizadas', value: done, sub: 'Completadas al 100%', color: 'text-[#00e03c]', icon: CheckCircle2, bg: 'bg-[#00e03c]/10 border-[#00e03c]/30' },
      ];
    }
    if (activeTab === 'missions') {
      const flash = activities.filter(a => a.isFlash || a.activityType === 'flash').length;
      const primary = activities.filter(a => !a.isFlash && (a.activityType === 'principal' || !a.activityType)).length;
      const secondary = activities.filter(a => a.activityType === 'secundaria' || a.coPartner).length;
      const totalXP = activities.reduce((sum, a) => sum + (Number(a.xp_awarded) || 50), 0);
      return [
        { label: 'Misiones Flash ⚡', value: flash, sub: 'Contingencias con countdown', color: 'text-amber-400', icon: Flame, bg: 'bg-amber-500/10 border-amber-500/30' },
        { label: 'Misiones Primarias', value: primary, sub: 'Objetivos troncales SERAM', color: 'text-sky-400', icon: Target, bg: 'bg-sky-500/10 border-sky-500/30' },
        { label: 'Secundarias & Combos', value: secondary, sub: 'Sinergias interdisciplinarias', color: 'text-purple-400', icon: Zap, bg: 'bg-purple-500/10 border-purple-500/30' },
        { label: 'Bolsa Global XP', value: `${totalXP.toLocaleString()} XP`, sub: 'Meritocracia acumulada', color: 'text-[#00e03c]', icon: Award, bg: 'bg-[#00e03c]/10 border-[#00e03c]/30' },
      ];
    }
    if (activeTab === 'progress') {
      const totalHours = activities.reduce((sum, a) => sum + (Number(a.actualHours) || 0), 0);
      const doneCount = activities.filter(a => a.status === 'Concluido').length;
      const totalCount = activities.length;
      const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      return [
        { label: 'Socios Fundadores', value: '3 Socios', sub: 'Diego, Fernando, Fabricio', color: 'text-purple-400', icon: Users, bg: 'bg-purple-500/10 border-purple-500/30' },
        { label: 'Horas Homologadas', value: `${totalHours.toFixed(1)}h`, sub: 'Dedicación registrada', color: 'text-blue-400', icon: Clock, bg: 'bg-blue-500/10 border-blue-500/30' },
        { label: 'Rendimiento Global', value: `${pct}%`, sub: `${doneCount} de ${totalCount} concluidas`, color: 'text-[#00e03c]', icon: TrendingUp, bg: 'bg-[#00e03c]/10 border-[#00e03c]/30' },
        { label: 'Rango Promedio', value: 'Grado 11', sub: 'Consultor Senior Certificado', color: 'text-amber-400', icon: Award, bg: 'bg-amber-500/10 border-amber-500/30' },
      ];
    }
    if (activeTab === 'synergies') {
      const coExecCount = activities.filter(a => a.coPartner).length;
      return [
        { label: 'Sinergias Activas', value: '3 Troncales', sub: 'Combos habilitados CD3/CD5', color: 'text-purple-400', icon: Sparkles, bg: 'bg-purple-500/10 border-purple-500/30' },
        { label: 'Multiplicador Combo', value: '+35% XP', sub: 'Bono por co-ejecución', color: 'text-amber-400', icon: Zap, bg: 'bg-amber-500/10 border-amber-500/30' },
        { label: 'Impacto Planetario', value: '+2,850 PIP', sub: 'Puntos de impacto biofísico', color: 'text-[#00e03c]', icon: ShieldCheck, bg: 'bg-[#00e03c]/10 border-[#00e03c]/30' },
        { label: 'Proyectos Cruzados', value: `${coExecCount} Tareas`, sub: 'Colaboración entre socios', color: 'text-sky-400', icon: Briefcase, bg: 'bg-sky-500/10 border-sky-500/30' },
      ];
    }
    // Default: 'table' (Base de Datos Notion)
    const total = activities.length;
    const inProg = activities.filter(a => a.status === 'En curso').length;
    const done = activities.filter(a => a.status === 'Concluido').length;
    const totalEst = activities.reduce((sum, a) => sum + (Number(a.estimatedHours) || 0), 0);
    const totalAct = activities.reduce((sum, a) => sum + (Number(a.actualHours) || 0), 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return [
      { label: 'Avance General', value: `${pct}%`, sub: `${done} de ${total} concluidas`, color: 'text-[#00e03c]', icon: CheckSquare, bg: 'bg-[#00e03c]/10 border-[#00e03c]/30' },
      { label: 'En Ejecución', value: inProg, sub: 'Gabinete y peritaje activo', color: 'text-blue-400', icon: Clock, bg: 'bg-blue-500/10 border-blue-500/30' },
      { label: 'Total Registros BD', value: total, sub: 'Tareas sincronizadas Notion', color: 'text-purple-400', icon: Table, bg: 'bg-purple-500/10 border-purple-500/30' },
      { label: 'Horas Reales / Est.', value: `${totalAct.toFixed(0)}h / ${totalEst.toFixed(0)}h`, sub: 'Balance de carga horaria', color: 'text-amber-400', icon: BarChart2, bg: 'bg-amber-500/10 border-amber-500/30' },
    ];
  }, [activeTab, activities]);

  return (
    <div className="space-y-4 relative z-10">
      {/* ── ENCABEZADO DEL MÓDULO: ACTIVIDADES Y TAREAS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Actividades y Tareas
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
              Notion BD & OKRs
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Base de datos sincronizada en tiempo real, matriz de gobernanza y seguimiento meritocrático de socios.
          </p>
        </div>
      </div>

      {/* ── TARJETAS MÉTRICAS SUPERIORES DINÁMICAS (CAMBIAN SEGÚN PESTAÑA ACTIVA) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <GlassCard key={idx} className="p-4 flex items-center justify-between hover:border-white/[0.2] transition-all">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                <h3 className={`text-2xl font-black mt-0.5 ${m.color}`}>{m.value}</h3>
                <p className="text-[11px] text-slate-400">{m.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${m.bg} ${m.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── BARRA DE PESTAÑAS (PILL SEGMENTED SIMÉTRICO SIN ÍCONOS) Y ACCIONES ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-white/[0.08] pb-2.5 relative z-10">
        {/* Pestañas de Vista en un solo segmento simétrico */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08] w-full lg:max-w-3xl">
          {[
            { id: 'table', label: 'Base de Datos' },
            { id: 'kanban', label: 'Tablero Kanban' },
            { id: 'missions', label: 'Tablero de Misiones' },
            { id: 'progress', label: 'Progreso de Socios' },
            { id: 'synergies', label: 'Sinergias & Combos' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all text-center cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#00e03c] text-slate-950 shadow-md font-black shadow-[#00e03c]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Botones de Creación y Misión Rápida */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQuickMissionModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 border border-amber-300/40 cursor-pointer"
            title="Activar contingencia ambiental inmediata con temporizador regresivo de 48h, 72h o 96h"
          >
            <Flame className="w-3.5 h-3.5 text-slate-950 fill-current animate-pulse" />
            <span>⚡ Asignar Misión Rápida</span>
          </button>
          <button
            onClick={() => {
              setEditingActivity(null);
              setActTitle('');
              setActDesc('');
              setActProjectId(activeServices[0]?.id || '');
              setActStartDate('');
              setActActivityType('principal');
              setActFlashDuration(72);
              setActDeliverableUrl('');
              setActDeliverableName('');
              setActAttachments([]);
              setShowNewActivityModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-[#00e03c]/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Registrar Actividad Clave
          </button>
        </div>
      </div>

      {/* ── BARRA DE HERRAMIENTAS Y FILTROS ESTILO NOTION ── */}
      {(activeTab === 'kanban' || activeTab === 'table') && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0d1522]/90 px-3 py-2 rounded-xl border border-white/[0.08] shadow-md relative z-10">
          {/* Grupo 1: Filtro Personal vs Grupal */}
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

          {/* Grupo 2: Filtros Selectores, Paginación y Búsqueda */}
          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end min-w-[260px]">
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

            {/* Filtro por Jerarquía OKR */}
            <div className="flex items-center gap-1.5">
              <select
                value={okrFilter}
                onChange={(e) => setOkrFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
              >
                <option value="all">Todas las Jerarquías OKR</option>
                <option value="anual">🎯 Macro Anual</option>
                <option value="semestral">🧭 Semestral</option>
                <option value="trimestral">📈 Trimestral</option>
                <option value="mensual">🗓️ Mensual</option>
                <option value="semanal">⚡ Semanal</option>
                <option value="diario">✅ Diario</option>
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
      <div className="grid grid-cols-1 items-start relative min-h-0">
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
                {pageSize !== 'all' && paginatedActivities.length < filteredActivities.length && (
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
                    const isDoneCol = col.id === 'Concluido';
                    const displayedActivities = (isDoneCol && !expandAllConcluido && colActivities.length > 3)
                      ? colActivities.slice(0, 3)
                      : colActivities;

                    return (
                      <div
                        key={col.id}
                        className="flex flex-col bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3 h-[580px] xl:h-[calc(100vh-270px)] xl:min-h-[480px] xl:max-h-[640px] overflow-hidden shadow-sm"
                      >
                        {/* Cabecera Columna */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] shrink-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${col.id === 'Concluido' ? 'bg-[#00e03c]' : col.id === 'En curso' ? 'bg-blue-400' : col.id === 'En revisión' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">{col.label}</h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isDoneCol && colActivities.length > 3 && (
                              <button
                                type="button"
                                onClick={() => setExpandAllConcluido(!expandAllConcluido)}
                                className="text-[10px] font-bold text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/30 hover:bg-[#00e03c]/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                                title={expandAllConcluido ? "Colapsar anteriores" : "Mostrar todas"}
                              >
                                {expandAllConcluido ? "Ver 3" : `+${colActivities.length - 3}`}
                              </button>
                            )}
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300">
                              {colActivities.length}
                            </span>
                          </div>
                        </div>

                        {/* Tarjetas de la Columna */}
                        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1 kanban-scrollbar">
                          {displayedActivities.length === 0 ? (
                            <div className="h-32 border border-dashed border-white/[0.08] rounded-xl flex items-center justify-center text-[11px] text-slate-500">
                              Sin actividades
                            </div>
                          ) : (
                            <>
                              {displayedActivities.map((act) => (
                                <motion.div
                                  layout
                                  key={act.id}
                                  className={`border transition-all shadow-md group relative rounded-xl ${
                                    isDoneCol
                                      ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-[#00e03c]/40 p-2.5 space-y-1.5'
                                      : 'bg-white/[0.05] hover:bg-white/[0.09] border-white/[0.1] hover:border-[#00e03c]/40 p-3 space-y-2'
                                  }`}
                                >
                                  {/* Categoría y Prioridad */}
                                  <div className="flex items-center justify-between gap-1 text-[10px]">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="font-bold text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded text-[9px]">
                                        {act.category || 'General'}
                                      </span>
                                      {(act.isFlash || act.activityType === 'flash') && (
                                        <FlashCountdownBadge expiresAt={act.flashExpiresAt} compact={true} />
                                      )}
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded font-black border text-[9px] ${PRIORITY_STYLES[act.priority] || PRIORITY_STYLES.Media}`}>
                                      {act.priority}
                                    </span>
                                  </div>

                                  {/* Título */}
                                  <h5 className={`text-xs font-bold text-white leading-snug ${isDoneCol ? 'line-clamp-1' : 'line-clamp-2'}`}>
                                    {act.title}
                                  </h5>

                                  {/* Proyecto Vinculado */}
                                  {act.projectTitle && (
                                    <div className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1 truncate">
                                      <Briefcase className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{act.projectTitle}</span>
                                    </div>
                                  )}

                                  {/* Descripción (oculta en Concluido para evitar altura excesiva) */}
                                  {!isDoneCol && act.description && (
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
                                    <div className="pt-0.5 flex items-center justify-between text-[9px] text-[#00e03c]">
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
                                  <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
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
                                  {!isDoneCol && act.coPartner && (
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
                                          className={`w-3.5 h-3.5 rounded-full text-[8px] flex items-center justify-center transition-all ${
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
                                      {(act.deliverableUrl || act.url) && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDownloadDeliverable(act, triggerToast);
                                            }}
                                            className="p-1 rounded hover:bg-[#00e03c]/20 text-[#00e03c] transition-colors cursor-pointer"
                                            title="Descargar documento compartido / entregable"
                                          >
                                            <Download className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCopyLink(act.url || act.deliverableUrl, `kanban-${act.id}`);
                                            }}
                                            className={`p-1 rounded transition-colors cursor-pointer ${
                                              copiedId === `kanban-${act.id}`
                                                ? 'bg-[#00e03c]/20 text-[#00e03c]'
                                                : 'hover:bg-white/[0.1] text-slate-400 hover:text-white'
                                            }`}
                                            title={copiedId === `kanban-${act.id}` ? "¡Enlace copiado!" : "Copiar enlace al portapapeles"}
                                          >
                                            {copiedId === `kanban-${act.id}` ? (
                                              <Check className="w-3 h-3 text-[#00e03c]" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                          <a
                                            href={act.url || act.deliverableUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 rounded hover:bg-sky-500/20 text-sky-400 transition-colors cursor-pointer"
                                            title="Abrir enlace externo"
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleShareActivityEmail(act);
                                        }}
                                        className="p-1 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                                        title="Compartir por correo (mailto)"
                                      >
                                        <Mail className="w-3 h-3" />
                                      </button>
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
                              ))}
                            </>
                          )}
                        </div>

                        {/* Botón Acordeón en Concluido si hay más de 3 (Fijado al pie) */}
                        {isDoneCol && colActivities.length > 3 && (
                          <div className="pt-2 border-t border-white/[0.06] shrink-0 mt-auto">
                            <button
                              type="button"
                              onClick={() => setExpandAllConcluido(!expandAllConcluido)}
                              className="w-full py-1.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-bold text-slate-300 hover:text-[#00e03c] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              {expandAllConcluido ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5 text-[#00e03c]" />
                                  <span>Colapsar anteriores (mostrar 3)</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5 text-[#00e03c]" />
                                  <span>Ver {colActivities.length - 3} concluidas anteriores ({colActivities.length} total)</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
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
                          <p className="text-[11px] text-slate-500">Prueba cambiando el filtro de socio o el selector de límite a &apos;Todas&apos;.</p>
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
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white group-hover:text-[#00e03c] transition-colors line-clamp-1">
                                  {act.title}
                                </span>
                                {(act.isFlash || act.activityType === 'flash') && (
                                  <FlashCountdownBadge expiresAt={act.flashExpiresAt} compact={true} />
                                )}
                                {act.activityType === 'secundaria' && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-500/20 text-slate-400 border border-slate-500/30">
                                    Secundaria
                                  </span>
                                )}
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-sky-500/15 text-sky-300 border border-sky-500/25">
                                  {act.okrLevel ? `OKR: ${act.okrLevel}` : 'OKR: Semanal'}
                                </span>
                                {act.isProvisional && (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Bolsa Provisional
                                  </span>
                                )}
                              </div>
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

                          {/* 5. Checkboxes / Hitos Multi-modal según tipo */}
                          <td className="p-3 text-center whitespace-nowrap">
                            {act.milestoneType === 'weekdays' ? (
                              <div className="flex items-center justify-center gap-0.5">
                                {['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'].map((d) => {
                                  const isDone = Boolean(act.weekdays?.[d]);
                                  return (
                                    <button
                                      key={d}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleWeekday(act, d);
                                      }}
                                      title={`Día ${d.toUpperCase()}: ${isDone ? 'Completado' : 'Pendiente'}`}
                                      className={`w-4 h-4 rounded text-[9px] font-black uppercase flex items-center justify-center cursor-pointer transition-all ${
                                        isDone ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400/40' : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.1] border border-white/10'
                                      }`}
                                    >
                                      {d.slice(0, 1).toUpperCase()}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : act.milestoneType === 'custom_subtasks' ? (
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  {(act.customSubtasks || []).filter(s => s.done).length}/{(act.customSubtasks || []).length} subs
                                </span>
                              </div>
                            ) : act.milestoneType === 'numeric' ? (
                              <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                                <span className="text-amber-400 font-bold">{act.currentValue || 0} / {act.targetValue || 10}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNumericChange(act, 1);
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 text-[10px] font-black"
                                >
                                  +1
                                </button>
                              </div>
                            ) : (
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
                            )}
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

                          {/* 10. URL & Entregables / Descargas */}
                          <td className="p-3 whitespace-nowrap">
                            {act.url || act.deliverableUrl ? (
                              <div className="flex items-center gap-1.5">
                                {/* Botón Descargar con Nombre/Icono */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadDeliverable(act, triggerToast);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/30 text-[11px] text-[#00e03c] font-mono font-medium transition-colors max-w-[130px] truncate cursor-pointer shadow-sm"
                                  title={`Descargar entregable: ${act.deliverableName || act.url || act.deliverableUrl}`}
                                >
                                  <Download className="w-3 h-3 shrink-0 text-[#00e03c]" />
                                  <span className="truncate">{act.deliverableName || (act.url || act.deliverableUrl).replace(/^https?:\/\//, '')}</span>
                                </button>

                                {/* Botón Copiar Enlace al Portapapeles */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyLink(act.url || act.deliverableUrl, act.id);
                                  }}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    copiedId === act.id
                                      ? 'bg-[#00e03c]/20 border-[#00e03c]/50 text-[#00e03c]'
                                      : 'bg-white/[0.04] hover:bg-white/[0.1] border-white/[0.08] text-slate-300 hover:text-white'
                                  }`}
                                  title={copiedId === act.id ? "¡Enlace copiado al portapapeles!" : "Copiar enlace al portapapeles"}
                                >
                                  {copiedId === act.id ? (
                                    <Check className="w-3 h-3 text-[#00e03c]" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>

                                {/* Botón Abrir Enlace en pestaña externa */}
                                <a
                                  href={act.url || act.deliverableUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-white/[0.08] transition-colors cursor-pointer"
                                  title="Abrir enlace externo en nueva pestaña"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>

                                {/* Botón Compartir al Correo */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareActivityEmail(act);
                                  }}
                                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-white/[0.08] transition-colors cursor-pointer"
                                  title="Compartir al correo (mailto)"
                                >
                                  <Mail className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDrawerActivity(act);
                                  }}
                                  className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Adjuntar entregable o enlace en la ficha"
                                >
                                  <Paperclip className="w-2.5 h-2.5 text-sky-400" /> + Adjunto
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareActivityEmail(act);
                                  }}
                                  className="p-1 rounded-lg bg-white/[0.04] hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-white/[0.08] transition-colors cursor-pointer"
                                  title="Compartir al correo (mailto)"
                                >
                                  <Share2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* 11. Acciones */}
                          <td className="p-3 pr-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareActivityEmail(act);
                              }}
                              className="p-1 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                              title="Compartir ficha por correo (mailto)"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* ── VISTA 3: TABLERO DE MISIONES (OCTALYSIS GAMIFICATION & CONTINGENCIAS FLASH) ── */}
      {activeTab === 'missions' && (
        <div className="space-y-5">
          {/* Sub-selector de Pestañas de Misiones */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setMissionSubTab('missions')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  missionSubTab === 'missions' ? 'bg-[#00e03c] text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Misiones Operativas & Flash ({activities.filter(a => a.status !== 'Concluido').length} activas)
              </button>
              <button
                type="button"
                onClick={() => setMissionSubTab('chests')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  missionSubTab === 'chests' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                🎁 Cofres de Resplandor & Impacto Planetario
              </button>
            </div>

            {missionSubTab === 'missions' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickMissionModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span>+ Misión Flash</span>
                </button>
              </div>
            )}
          </div>

          {missionSubTab === 'chests' ? (
            <SpecialMissionsModule currentSocio={currentSocio} />
          ) : (
            <div className="space-y-4">
              {/* Filtros de Misiones */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0d1522]/90 p-3 rounded-2xl border border-white/[0.08]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Todas las Misiones' },
                    { id: 'flash', label: '⚡ Flash (Urgentes)' },
                    { id: 'principal', label: '🎯 Primarias' },
                    { id: 'secundaria', label: '🛡️ Secundarias' },
                    { id: 'combo', label: '👥 Combos Interdisciplinarios' }
                  ].map(mf => (
                    <button
                      key={mf.id}
                      type="button"
                      onClick={() => setMissionFilter(mf.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        missionFilter === mf.id
                          ? 'bg-[#00e03c] text-slate-950 font-black shadow-md'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {mf.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={okrFilter}
                    onChange={(e) => setOkrFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                  >
                    <option value="all">Jerarquía OKR</option>
                    <option value="anual">🎯 Macro Anual</option>
                    <option value="semestral">🧭 Semestral</option>
                    <option value="trimestral">📈 Trimestral</option>
                    <option value="mensual">🗓️ Mensual</option>
                    <option value="semanal">⚡ Semanal</option>
                    <option value="diario">✅ Diario</option>
                  </select>
                </div>
              </div>

              {/* Grid de Tarjetas de Misiones */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities
                  .filter(act => {
                    if (missionFilter === 'flash') return act.isFlash || act.activityType === 'flash';
                    if (missionFilter === 'principal') return !act.isFlash && (act.activityType === 'principal' || !act.activityType);
                    if (missionFilter === 'secundaria') return act.activityType === 'secundaria';
                    if (missionFilter === 'combo') return Boolean(act.coPartner);
                    return true;
                  })
                  .filter(act => okrFilter === 'all' || (act.okrLevel || 'semanal') === okrFilter)
                  .filter(act => {
                    if (scopeFilter === 'personal') {
                      const myName = currentSocio?.name || '';
                      return act.assignedPartner === myName || act.coPartner === myName;
                    }
                    return true;
                  })
                  .map(act => {
                    const isDone = act.status === 'Concluido';
                    const isFlash = act.isFlash || act.activityType === 'flash';
                    const hasCombo = Boolean(act.coPartner);
                    const progressPct = getProgressPercent(act);

                    return (
                      <GlassCard
                        key={act.id}
                        className={`p-5 space-y-3 flex flex-col justify-between transition-all hover:scale-[1.01] ${
                          isFlash
                            ? 'border-amber-500/50 shadow-amber-500/10'
                            : hasCombo
                            ? 'border-purple-500/40 shadow-purple-500/10'
                            : 'hover:border-[#00e03c]/40'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Badges superiores */}
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              isFlash
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                : hasCombo
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : act.activityType === 'secundaria'
                                ? 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                                : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            }`}>
                              {isFlash ? '⚡ Flash Contingencia' : hasCombo ? '👥 Combo +35% XP' : act.activityType === 'secundaria' ? '🛡️ Secundaria' : '🎯 Troncal'}
                            </span>

                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                              {act.okrLevel ? `OKR: ${act.okrLevel}` : 'OKR: Semanal'}
                            </span>

                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                              act.status === 'Concluido' ? 'bg-[#00e03c]/20 text-[#00e03c] border-[#00e03c]/30' :
                              act.status === 'En revisión' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                              act.status === 'En curso' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}>
                              {act.status}
                            </span>
                          </div>

                          {/* Countdown o Fecha Límite */}
                          <div className="flex items-center justify-between text-xs">
                            {isFlash && act.flashExpiresAt ? (
                              <FlashCountdownBadge expiresAt={act.flashExpiresAt} />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-sky-400" />
                                {act.dueDate ? `Límite: ${act.dueDate}` : 'Sin deadline estricto'}
                              </span>
                            )}

                            <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                              +{Number(act.xp_awarded) || 50} XP
                            </span>
                          </div>

                          {/* Título y Proyecto */}
                          <div>
                            <h4 className="text-sm font-black text-white leading-snug group-hover:text-[#00e03c] transition-colors">
                              {act.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{act.projectTitle || 'Proyecto General'}</span>
                            </p>
                          </div>

                          {/* Socios Asignados */}
                          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Responsable:</span>
                              <span className="font-bold text-white">{act.assignedPartner}</span>
                            </div>
                            {act.coPartner && (
                              <div className="flex items-center justify-between text-[11px] text-amber-300">
                                <span>Co-ejecutor:</span>
                                <span className="font-bold flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> {act.coPartner}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Barra y Modalidad de Hitos */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span>Progreso de Hitos ({act.milestoneType || '5 fases'}):</span>
                              <span className="font-mono text-[#00e03c] font-black">{progressPct}%</span>
                            </div>
                            <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#00e03c] h-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setDrawerActivity(act)}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Ver Ficha</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {!isDone && (
                            <button
                              type="button"
                              onClick={() => handleCompleteActivityValidation(act)}
                              className="px-3 py-1.5 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs transition-all shadow-md shadow-[#00e03c]/15 cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Completar</span>
                            </button>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })}
              </div>
            </div>
          )}
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

      {/* ── VISTA 5: SINERGIAS & COMBOS INTERDISCIPLINARIOS (OCTALYSIS CD3 & CD5) ── */}
      {activeTab === 'synergies' && (
        <InterdisciplinarySynergies currentSocio={currentSocio} />
      )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── MODAL: ASIGNACIÓN RÁPIDA DE MISIONES FLASH DE CONTINGENCIA ── */}
      <AnimatePresence>
        {showQuickMissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0c141f] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      ⚡ Asignación Rápida de Misiones Flash
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Contingencias ambientales críticas y licitaciones express con cuenta regresiva en tiempo real.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickMissionModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selector de Pestañas: Templates vs Personalizada */}
              <div className="flex items-center gap-2 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setQuickMissionTab('templates')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    quickMissionTab === 'templates'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Contingencias Predefinidas ({FLASH_CONTINGENCY_TEMPLATES.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickMissionTab('custom')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    quickMissionTab === 'custom'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Misión Flash Personalizada</span>
                </button>
              </div>

              {/* Tab 1: Plantillas Predefinidas */}
              {quickMissionTab === 'templates' && (
                <div className="space-y-3">
                  {FLASH_CONTINGENCY_TEMPLATES.map((tpl, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <Timer className="w-3 h-3 text-rose-400" /> {tpl.durationHours} Horas Límite
                          </span>
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            {tpl.requiredRole}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tpl.streakBonus}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {tpl.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {tpl.desc}
                        </p>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3 text-sky-400" />
                          <span>Responsables sugeridos: {tpl.defaultAssigned?.join(' y ')}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectFlashTemplate(tpl)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 shrink-0 cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center"
                      >
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>⚡ Asignar Misión</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Personalizada */}
              {quickMissionTab === 'custom' && (
                <form onSubmit={handleSubmitCustomQuickMission} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Título de la Contingencia Flash *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Emergencia por Derrame de Ácido en Cuenca Alta 48h"
                      value={customMissionTitle}
                      onChange={(e) => setCustomMissionTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Duración de la Misión Flash
                      </label>
                      <select
                        value={customMissionDuration}
                        onChange={(e) => setCustomMissionDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-amber-500/30 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        <option value={24}>⚡ 24 Horas (Extrema Urgencia)</option>
                        <option value={48}>⚡ 48 Horas (Fiscalización / Inspección)</option>
                        <option value={72}>⚡ 72 Horas (Licitación SICOES / Decretos)</option>
                        <option value={96}>⚡ 96 Horas (Cisne Negro / Modelación Hidrológica)</option>
                        <option value={120}>⚡ 120 Horas (Expediente Ampliado)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Categoría Técnica</label>
                      <select
                        value={customMissionCategory}
                        onChange={(e) => setCustomMissionCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        <option value="EIA / Legal Ambiental">EIA / Legal Ambiental</option>
                        <option value="Hidrología & SIG">Hidrología & SIG</option>
                        <option value="Teledetección & Geomática">Teledetección & Geomática</option>
                        <option value="Compliance & Legal">Compliance & Legal</option>
                        <option value="Biodiversidad & Carbono">Biodiversidad & Carbono</option>
                        <option value="Trabajo de Campo / Muestreo">Trabajo de Campo / Muestreo</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Socio Responsable Principal *</label>
                      <select
                        value={customMissionPartner}
                        onChange={(e) => setCustomMissionPartner(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        {partnersList.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-amber-400 flex items-center justify-between">
                        <span>Co-Ejecutor (Combo +35% XP)</span>
                      </label>
                      <select
                        value={customMissionCoPartner}
                        onChange={(e) => setCustomMissionCoPartner(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        <option value="">-- Sin co-ejecutor --</option>
                        {partnersList.filter(p => p.name !== customMissionPartner).map((p) => (
                          <option key={p.name} value={p.name}>⚡ {p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Instrucciones & Alcance Crítico</label>
                    <textarea
                      rows="3"
                      placeholder="Objetivos periciales de esta contingencia ambiental..."
                      value={customMissionDesc}
                      onChange={(e) => setCustomMissionDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setShowQuickMissionModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>⚡ Lanzar Misión Flash</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: REGISTRAR / EDITAR ACTIVIDAD CLAVE ── */}
      <AnimatePresence>
        {showNewActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e1622] border border-white/[0.15] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-5 h-5 text-[#00e03c]" />
                  <h3 className="text-base font-black text-white">
                    {editingActivity ? 'Editar Actividad Clave' : 'Nueva Actividad Clave (Notion ➔ SERAM)'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewActivityModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmitActivity} className="space-y-4 text-xs">
                {/* Tipo de Actividad & Duración Flash */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Tipo de Actividad</label>
                    <select
                      value={actActivityType}
                      onChange={(e) => setActActivityType(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                    >
                      <option value="principal">Actividad Principal</option>
                      <option value="secundaria">Actividad Secundaria</option>
                      <option value="flash">⚡ Misión Flash (Contingencia)</option>
                    </select>
                  </div>

                  {actActivityType === 'flash' ? (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Duración Flash Límite
                      </label>
                      <select
                        value={actFlashDuration}
                        onChange={(e) => setActFlashDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-amber-500/30 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        <option value={24}>24 Horas</option>
                        <option value={48}>48 Horas</option>
                        <option value={72}>72 Horas</option>
                        <option value={96}>96 Horas</option>
                        <option value={120}>120 Horas</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Fecha de Inicio</label>
                      <input
                        type="date"
                        value={actStartDate}
                        onChange={(e) => setActStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c]"
                      />
                    </div>
                  )}
                </div>

                {/* Jerarquía OKR & Criterio de Validación Anti-Cheat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-white/[0.03] border border-amber-500/25">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Jerarquía Estratégica OKR</label>
                    <select
                      value={actOkrLevel}
                      onChange={(e) => setActOkrLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                    >
                      <option value="anual">🎯 Macro Anual (Visión SEPREC)</option>
                      <option value="semestral">🧭 Semestral (Hitos Clave)</option>
                      <option value="trimestral">📈 Trimestral (OKRs Q1 - Q4)</option>
                      <option value="mensual">🗓️ Mensual (Entregables)</option>
                      <option value="semanal">⚡ Semanal (Sprint de Gabinete)</option>
                      <option value="diario">✅ Diario (Checklist & Tareas)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                      <Scale className="w-3 h-3 text-amber-400" /> Criterio Validación (Anti-Cheat)
                    </label>
                    <select
                      value={actValidationCriteria}
                      onChange={(e) => setActValidationCriteria(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-amber-500/30 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                    >
                      <option value="cross_audit">⚖️ Auditoría Cruzada Pericial</option>
                      <option value="auto_proof">📎 Comprobante Obligatorio</option>
                      <option value="provisional_pool">🛡️ Bolsa Provisional de Horas</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 text-[10px] text-slate-400 italic">
                    {actValidationCriteria === 'cross_audit' && '⚖️ Auditoría Cruzada: Al llegar a 100%, requiere aprobación pericial de otro socio directivo.'}
                    {actValidationCriteria === 'auto_proof' && '📎 Auto-completar: Concluye al 100% de inmediato exigiendo link o archivo de respaldo adjunto.'}
                    {actValidationCriteria === 'provisional_pool' && '🛡️ Bolsa Provisional: Concluye al instante sin bloquear al socio; se ratifica semanalmente en Directorio.'}
                  </div>
                </div>

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
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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
                      className="w-full px-3 py-2 bg-white/[0.06] border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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

                {/* Enlace y Entregable */}
                <div className="space-y-2 p-3 rounded-2xl bg-white/[0.03] border border-sky-500/20">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-sky-400 flex items-center gap-1">
                        <Link2 className="w-3 h-3" /> URL del Entregable / Carpeta Drive
                      </label>
                      {actDeliverableUrl && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(actDeliverableUrl, 'modal-url')}
                            className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            title="Copiar enlace"
                          >
                            {copiedId === 'modal-url' ? <Check className="w-2.5 h-2.5 text-[#00e03c]" /> : <Copy className="w-2.5 h-2.5" />}
                            <span>{copiedId === 'modal-url' ? '¡Copiado!' : 'Copiar'}</span>
                          </button>
                          <a
                            href={actDeliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-sky-300 hover:text-white flex items-center gap-0.5 underline font-medium"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Abrir
                          </a>
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/... o https://drive.google.com/..."
                      value={actDeliverableUrl}
                      onChange={(e) => setActDeliverableUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-sky-500/30 rounded-xl text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> Subir Archivo Adjunto (.pdf, .jpg, .md)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.md"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0], false);
                        }
                      }}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                    />
                    {actDeliverableName && (
                      <p className="text-[10px] text-emerald-400 font-mono">
                        ✓ Archivo cargado: {actDeliverableName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Modalidad de Hitos de Ejecución */}
                <div className="space-y-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-300">Modalidad de Hitos & Seguimiento</label>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                      {actMilestoneType === 'phases' ? '5 Fases Estándar' :
                       actMilestoneType === 'weekdays' ? 'Días Semana (Lun-Dom)' :
                       actMilestoneType === 'custom_subtasks' ? 'Subtareas Personalizadas' : 'Avance Numérico'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'phases', label: '5 Fases', desc: 'Estándar SERAM' },
                      { id: 'weekdays', label: 'Semanal', desc: 'Lun a Dom' },
                      { id: 'custom_subtasks', label: 'Subtareas', desc: 'Texto custom' },
                      { id: 'numeric', label: 'Numérico', desc: 'Meta cuant.' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActMilestoneType(m.id)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          actMilestoneType === m.id
                            ? 'bg-[#00e03c]/20 border-[#00e03c] text-white font-black shadow-sm'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[9px] text-slate-500">{m.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Configuración de Modalidad */}
                  {actMilestoneType === 'phases' && (
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1">
                      <span className="font-bold text-slate-300">5 Fases Técnicas:</span>
                      <div className="grid grid-cols-5 gap-1 text-[9px] text-center pt-1 font-mono">
                        <span className="p-1 rounded bg-white/[0.04]">1. Datos</span>
                        <span className="p-1 rounded bg-white/[0.04]">2. SIG</span>
                        <span className="p-1 rounded bg-white/[0.04]">3. Redac.</span>
                        <span className="p-1 rounded bg-white/[0.04]">4. Calidad</span>
                        <span className="p-1 rounded bg-white/[0.04]">5. Entrega</span>
                      </div>
                    </div>
                  )}

                  {actMilestoneType === 'weekdays' && (
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <span className="text-[10px] font-bold text-slate-300 block">Días de la semana para completar la rutina:</span>
                      <div className="grid grid-cols-7 gap-1">
                        {['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setActWeekdays(prev => ({ ...prev, [d]: !prev[d] }))}
                            className={`py-1.5 rounded-lg text-[10px] font-black uppercase text-center transition-all cursor-pointer ${
                              actWeekdays[d] ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400/50' : 'bg-white/[0.04] text-slate-400 border border-white/[0.08]'
                            }`}
                          >
                            {d.slice(0, 2)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {actMilestoneType === 'custom_subtasks' && (
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Escribir subtarea específica..."
                          value={newSubtaskText}
                          onChange={(e) => setNewSubtaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newSubtaskText.trim()) {
                                setActCustomSubtasks(prev => [...prev, { id: Date.now().toString(), label: newSubtaskText.trim(), done: false }]);
                                setNewSubtaskText('');
                              }
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newSubtaskText.trim()) {
                              setActCustomSubtasks(prev => [...prev, { id: Date.now().toString(), label: newSubtaskText.trim(), done: false }]);
                              setNewSubtaskText('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 cursor-pointer"
                        >
                          + Añadir
                        </button>
                      </div>

                      {actCustomSubtasks.length > 0 && (
                        <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                          {actCustomSubtasks.map((st) => (
                            <div key={st.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs">
                              <span className="text-slate-300 truncate max-w-[220px]">{st.label}</span>
                              <button
                                type="button"
                                onClick={() => setActCustomSubtasks(prev => prev.filter(item => item.id !== st.id))}
                                className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {actMilestoneType === 'numeric' && (
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold">Valor Actual</label>
                        <input
                          type="number"
                          value={actCurrentValue}
                          onChange={(e) => setActCurrentValue(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00e03c]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold">Meta Numérica (Target)</label>
                        <input
                          type="number"
                          value={actTargetValue}
                          onChange={(e) => setActTargetValue(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#00e03c]"
                        />
                      </div>
                    </div>
                  )}
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
                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black shadow-lg shadow-[#00e03c]/20 cursor-pointer"
                  >
                    {editingActivity ? 'Guardar Cambios' : 'Registrar Actividad'}
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
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/[0.08] text-slate-300">
                        {drawerData.category || 'General'}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${PRIORITY_STYLES[drawerData.priority] || PRIORITY_STYLES.Media}`}>
                        Prioridad {drawerData.priority}
                      </span>
                      {drawerData.okrLevel && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {drawerData.okrLevel === 'anual' ? 'OKR Anual' :
                           drawerData.okrLevel === 'semestral' ? 'OKR Semestral' :
                           drawerData.okrLevel === 'trimestral' ? 'OKR Trimestral' :
                           drawerData.okrLevel === 'mensual' ? 'OKR Mensual' :
                           drawerData.okrLevel === 'semanal' ? 'OKR Semanal' : 'Tarea Diaria'}
                        </span>
                      )}
                      {drawerData.validationCriteria && (
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          drawerData.validationCriteria === 'provisional_pool' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          drawerData.validationCriteria === 'auto_proof' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          <Scale className="w-3 h-3" />
                          {drawerData.validationCriteria === 'provisional_pool' ? 'Bolsa Provisional' :
                           drawerData.validationCriteria === 'auto_proof' ? 'Comprobante Obligatorio' :
                           'Auditoría Cruzada'}
                        </span>
                      )}
                      {drawerData.isProvisional && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> Bolsa Provisional (Por Regularizar)
                        </span>
                      )}
                      {(drawerData.isFlash || drawerData.activityType === 'flash') && (
                        <FlashCountdownBadge expiresAt={drawerData.flashExpiresAt} />
                      )}
                      {drawerData.activityType === 'secundaria' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-500/20 text-slate-400 border border-slate-500/30">
                          Secundaria
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleShareActivityEmail(drawerData)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/[0.1] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Compartir ficha por correo (mailto)"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Compartir Correo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDrawerActivity(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                        title="Cerrar ficha"
                      >
                        <PanelRightClose className="w-5 h-5" />
                      </button>
                    </div>
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

                {/* Sección de Hitos Multi-Modales Interactivos */}
                <div className="space-y-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00e03c]" />
                      {(drawerData.milestoneType === 'weekdays' && 'Checklist Semanal (Lun - Dom)') ||
                       (drawerData.milestoneType === 'custom_subtasks' && 'Subtareas Específicas') ||
                       (drawerData.milestoneType === 'numeric' && 'Métrica Cuantitativa') ||
                       'Hitos de Ejecución Técnica (5 Fases)'}
                    </h5>
                    <span className="text-[11px] font-black text-[#00e03c] bg-[#00e03c]/10 px-2 py-0.5 rounded-full border border-[#00e03c]/20 font-mono">
                      {getProgressPercent(drawerData)}% Completado
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#00e03c] h-full transition-all duration-300 shadow-sm shadow-[#00e03c]"
                      style={{ width: `${getProgressPercent(drawerData)}%` }}
                    />
                  </div>

                  {/* Modalidad 1: 5 Fases Estándar */}
                  {(!drawerData.milestoneType || drawerData.milestoneType === 'phases') && (
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
                  )}

                  {/* Modalidad 2: Días de la Semana */}
                  {drawerData.milestoneType === 'weekdays' && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-7 gap-1.5">
                        {[
                          { key: 'lun', label: 'Lun' },
                          { key: 'mar', label: 'Mar' },
                          { key: 'mie', label: 'Mié' },
                          { key: 'jue', label: 'Jue' },
                          { key: 'vie', label: 'Vie' },
                          { key: 'sab', label: 'Sáb' },
                          { key: 'dom', label: 'Dom' },
                        ].map((day) => {
                          const isDone = Boolean(drawerData.weekdays?.[day.key]);
                          return (
                            <button
                              key={day.key}
                              type="button"
                              onClick={() => handleToggleWeekday(drawerActivity, day.key)}
                              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                                isDone
                                  ? 'bg-[#00e03c]/20 border-[#00e03c]/50 text-[#00e03c] shadow-sm shadow-[#00e03c]/20 font-black'
                                  : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{day.label}</span>
                              <span className="text-xs font-black mt-0.5">{isDone ? '✓' : '—'}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 text-center italic pt-1">
                        Marca los días ejecutados. Al completar los 7 días se iniciará la validación societaria.
                      </p>
                    </div>
                  )}

                  {/* Modalidad 3: Subtareas Personalizadas */}
                  {drawerData.milestoneType === 'custom_subtasks' && (
                    <div className="space-y-2 pt-1">
                      {Array.isArray(drawerData.customSubtasks) && drawerData.customSubtasks.length > 0 ? (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {drawerData.customSubtasks.map((st) => (
                            <div
                              key={st.id}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                                st.done
                                  ? 'bg-[#00e03c]/10 border-[#00e03c]/30 text-white'
                                  : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                              }`}
                            >
                              <div
                                onClick={() => handleToggleCustomSubtask(drawerActivity, st.id)}
                                className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                              >
                                <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] transition-colors shrink-0 ${
                                  st.done ? 'bg-[#00e03c] text-slate-950 font-black' : 'border border-white/20'
                                }`}>
                                  {st.done && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className={`truncate ${st.done ? 'line-through text-slate-400' : 'font-medium'}`}>
                                  {st.label}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDrawerSubtask(st.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0 ml-2 cursor-pointer"
                                title="Eliminar subtarea"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-slate-400">
                          No hay subtareas añadidas todavía.
                        </div>
                      )}

                      {/* Input para agregar subtarea */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Nueva subtarea específica..."
                          value={drawerNewSubtaskInput}
                          onChange={(e) => setDrawerNewSubtaskInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddDrawerSubtask();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                        />
                        <button
                          type="button"
                          onClick={handleAddDrawerSubtask}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-[#00e03c]/20 hover:text-[#00e03c] border border-white/[0.12] text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Añadir
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Modalidad 4: Métrica Cuantitativa */}
                  {drawerData.milestoneType === 'numeric' && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block">Progreso Cuantitativo</span>
                          <div className="text-xl font-black text-white font-mono mt-0.5">
                            <span className="text-[#00e03c]">{drawerData.currentValue || 0}</span>
                            <span className="text-slate-500 text-sm font-normal"> / {drawerData.targetValue || 10}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleNumericChange(drawerActivity, -5)}
                            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-mono font-bold cursor-pointer"
                            title="-5 unidades"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumericChange(drawerActivity, -1)}
                            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-mono font-bold cursor-pointer"
                            title="-1 unidad"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumericChange(drawerActivity, 1)}
                            className="px-2.5 py-1 rounded-lg bg-[#00e03c]/20 hover:bg-[#00e03c]/30 text-[#00e03c] border border-[#00e03c]/30 text-xs font-mono font-black cursor-pointer"
                            title="+1 unidad"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNumericChange(drawerActivity, 5)}
                            className="px-2.5 py-1 rounded-lg bg-[#00e03c]/20 hover:bg-[#00e03c]/30 text-[#00e03c] border border-[#00e03c]/30 text-xs font-mono font-black cursor-pointer"
                            title="+5 unidades"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Valor Actual:</label>
                          <input
                            type="number"
                            value={drawerData.currentValue ?? 0}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setDrawerData(prev => ({ ...prev, currentValue: val }));
                              handleEditActivity(drawerActivity.id, { currentValue: val });
                            }}
                            className="w-full px-3 py-1.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#00e03c]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Meta Objetivo:</label>
                          <input
                            type="number"
                            value={drawerData.targetValue ?? 10}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 10;
                              setDrawerData(prev => ({ ...prev, targetValue: val }));
                              handleEditActivity(drawerActivity.id, { targetValue: val });
                            }}
                            className="w-full px-3 py-1.5 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#00e03c]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botón de Validación Inmediata al 100% */}
                  {drawerData.status !== 'Concluido' && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => handleCompleteActivityValidation(drawerActivity, drawerData)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00e03c] to-emerald-400 hover:from-[#00e03c]/90 hover:to-emerald-400/90 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00e03c]/20 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Validar & Completar Actividad (100%)</span>
                      </button>
                    </div>
                  )}
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
                  {/* Tipo de Actividad & Duración Flash */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Tipo de Actividad</label>
                      <select
                        value={drawerData.activityType || (drawerData.isFlash ? 'flash' : 'principal')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDrawerData(prev => {
                            const isF = val === 'flash';
                            const expires = isF && !prev.flashExpiresAt
                              ? new Date(Date.now() + 72 * 3600 * 1000).toISOString()
                              : prev.flashExpiresAt;
                            return {
                              ...prev,
                              activityType: val,
                              isFlash: isF,
                              flashExpiresAt: expires,
                              priority: isF ? 'Urgente' : prev.priority
                            };
                          });
                        }}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        <option value="principal">Actividad Principal</option>
                        <option value="secundaria">Actividad Secundaria</option>
                        <option value="flash">⚡ Misión Flash (Contingencia)</option>
                      </select>
                    </div>

                    {(drawerData.activityType === 'flash' || drawerData.isFlash) ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-amber-400 flex items-center justify-between">
                          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Duración Regresiva</span>
                          <span className="text-[9px] text-amber-300 font-mono">En vivo</span>
                        </label>
                        <select
                          onChange={(e) => {
                            const hrs = Number(e.target.value);
                            if (hrs > 0) {
                              const newExp = new Date(Date.now() + hrs * 3600 * 1000).toISOString();
                              setDrawerData(prev => ({
                                ...prev,
                                flashExpiresAt: newExp
                              }));
                            }
                          }}
                          className="w-full px-3 py-2 bg-white/[0.06] border border-amber-500/30 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                        >
                          <option value="">Ajustar tiempo (+horas)...</option>
                          <option value={24}>Reiniciar a 24 Horas</option>
                          <option value={48}>Reiniciar a 48 Horas</option>
                          <option value={72}>Reiniciar a 72 Horas</option>
                          <option value={96}>Reiniciar a 96 Horas</option>
                          <option value={120}>Reiniciar a 120 Horas</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Objetivo Estratégico</label>
                        <div className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 text-[11px] font-bold truncate">
                          {drawerData.category?.includes('Legal') ? 'LEGALIZAR Y FORMALIZAR' : 'LIDERAR EL SECTOR'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Estado */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Estado de Flujo</label>
                      <select
                        value={drawerData.status || 'Pendiente'}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Modalidad de Hitos */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Modalidad de Hitos</label>
                      <select
                        value={drawerData.milestoneType || 'phases'}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, milestoneType: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        <option value="phases">5 Fases Estándar</option>
                        <option value="weekdays">Días de la Semana (Lun - Dom)</option>
                        <option value="custom_subtasks">Tareas Específicas Personalizadas</option>
                        <option value="numeric">Cuantitativo / Numérico</option>
                      </select>
                    </div>

                    {/* Cascada OKR */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Cascada OKR</label>
                      <select
                        value={drawerData.okrLevel || 'semanal'}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, okrLevel: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                      >
                        <option value="anual">OKR Anual (Misión Estratégica)</option>
                        <option value="semestral">OKR Semestral</option>
                        <option value="trimestral">OKR Trimestral (Hito Pericial)</option>
                        <option value="mensual">OKR Mensual</option>
                        <option value="semanal">OKR Semanal (Sprint Operativo)</option>
                        <option value="diario">Tarea Diaria / Rutina</option>
                      </select>
                    </div>
                  </div>

                  {/* Criterio de Validación Anti-Cheat */}
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-amber-500/20 space-y-1">
                    <label className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" /> Criterio de Validación Anti-Cheat
                    </label>
                    <select
                      value={drawerData.validationCriteria || 'cross_audit'}
                      onChange={(e) => setDrawerData(prev => ({ ...prev, validationCriteria: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-amber-500/30 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                    >
                      <option value="cross_audit">🛡️ Auditoría Cruzada Pericial (Aprobación de otro socio)</option>
                      <option value="auto_proof">📎 Comprobante Obligatorio (Exige link o documento adjunto)</option>
                      <option value="provisional_pool">⏱️ Bolsa Provisional de Horas (Sin bloqueo, ratificación semanal)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Socio Asignado */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Socio Responsable</label>
                      <select
                        value={drawerData.assignedPartner || ''}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, assignedPartner: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white font-bold focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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

                  {/* Zona de Entregables, Enlace y Subida de Archivos (.pdf, .jpg, .md) */}
                  <div className="space-y-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-sky-400 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" /> Entregables & Documentación Técnica
                      </label>
                      <span className="text-[10px] text-slate-400">PDF, JPG, PNG, MD (Hasta 25 MB)</span>
                    </div>

                    {/* Tarjeta Destacada de Documento Compartido por el Otro Socio */}
                    {(drawerData.url || drawerData.deliverableUrl) && drawerData.assignedPartner && currentSocio?.name && drawerData.assignedPartner !== currentSocio?.name && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-sky-500/10 to-transparent border border-emerald-500/30 text-xs space-y-2.5 shadow-md">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-bold text-xs flex items-center gap-1.5 flex-wrap">
                              <span>📄 Documento Compartido por</span>
                              <span className="text-emerald-400 font-black">{drawerData.assignedPartner}:</span>
                            </p>
                            <p className="text-[11px] text-slate-300 font-mono mt-0.5 truncate max-w-full">
                              {drawerData.deliverableName || drawerData.url || drawerData.deliverableUrl}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-white/[0.08]">
                          <button
                            type="button"
                            onClick={() => handleDownloadDeliverable(drawerData, triggerToast)}
                            className="px-3 py-1.5 rounded-lg bg-[#00e03c]/20 hover:bg-[#00e03c]/30 text-[#00e03c] border border-[#00e03c]/40 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Descargar Documento Compartido
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyLink(drawerData.url || drawerData.deliverableUrl, 'drawer-shared')}
                            className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              copiedId === 'drawer-shared'
                                ? 'bg-[#00e03c]/20 border-[#00e03c]/50 text-[#00e03c]'
                                : 'bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border-white/[0.15]'
                            }`}
                          >
                            {copiedId === 'drawer-shared' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#00e03c]" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Enlace</span>
                              </>
                            )}
                          </button>

                          <a
                            href={drawerData.url || drawerData.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Abrir
                          </a>
                        </div>
                      </div>
                    )}

                    {/* URL Externa */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Enlace Web o Drive:</span>
                        {(drawerData.url || drawerData.deliverableUrl) && (
                          <a
                            href={drawerData.url || drawerData.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-sky-300 underline font-mono flex items-center gap-1 hover:text-white"
                          >
                            Abrir enlace ➔
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="https://docs.google.com/... o https://drive.google.com/..."
                        value={drawerData.url || drawerData.deliverableUrl || ''}
                        onChange={(e) => setDrawerData(prev => ({ ...prev, url: e.target.value, deliverableUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/[0.06] border border-sky-500/30 rounded-xl text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-sky-400"
                      />

                      {/* Barra de Acciones Inmediatas para el Enlace / Documento URL */}
                      {(drawerData.url || drawerData.deliverableUrl) && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(drawerData.url || drawerData.deliverableUrl, 'drawer-input')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                              copiedId === 'drawer-input'
                                ? 'bg-[#00e03c]/20 border-[#00e03c]/50 text-[#00e03c]'
                                : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.12] text-slate-300'
                            }`}
                          >
                            {copiedId === 'drawer-input' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#00e03c]" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Enlace</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadDeliverable(drawerData, triggerToast)}
                            className="px-2.5 py-1 rounded-lg bg-[#00e03c]/20 hover:bg-[#00e03c]/30 text-[#00e03c] border border-[#00e03c]/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Descargar Documento
                          </button>

                          <a
                            href={drawerData.url || drawerData.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Abrir Enlace
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Dropzone / Upload de archivo */}
                    <div className="relative border-2 border-dashed border-white/20 hover:border-sky-400/50 rounded-2xl p-4 text-center transition-all bg-white/[0.02] hover:bg-white/[0.04] group cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.md,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], true);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="space-y-1 pointer-events-none">
                        <Upload className="w-6 h-6 text-sky-400 mx-auto group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-white">Haz clic o arrastra un archivo aquí</p>
                        <p className="text-[10px] text-slate-400">Soporta informes periciales (.pdf), planos/fotos (.jpg, .png) o minutas (.md)</p>
                      </div>
                    </div>

                    {/* Lista de Archivos Adjuntos / Entregable Principal */}
                    {((drawerData.deliverableName && (drawerData.deliverableUrl || drawerData.url)) || (Array.isArray(drawerData.attachments) && drawerData.attachments.length > 0)) && (
                      <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Archivos Adjuntos Disponibles para Descarga:
                        </span>

                        {/* Entregable Principal si tiene nombre */}
                        {drawerData.deliverableName && (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-sky-500/30 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                              <span className="text-white font-bold truncate max-w-[240px]">
                                {drawerData.deliverableName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDownloadDeliverable(drawerData, triggerToast)}
                                className="px-2.5 py-1 rounded-lg bg-[#00e03c]/20 hover:bg-[#00e03c]/30 text-[#00e03c] border border-[#00e03c]/30 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" /> Descargar
                              </button>
                              {(drawerData.deliverableUrl || drawerData.url) && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(drawerData.deliverableUrl || drawerData.url, 'drawer-file-main')}
                                  className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                                    copiedId === 'drawer-file-main'
                                      ? 'bg-[#00e03c]/20 border-[#00e03c]/50 text-[#00e03c]'
                                      : 'bg-white/[0.04] hover:bg-white/[0.1] border-white/[0.08] text-slate-300'
                                  }`}
                                  title={copiedId === 'drawer-file-main' ? "¡Copiado!" : "Copiar enlace"}
                                >
                                  {copiedId === 'drawer-file-main' ? <Check className="w-3.5 h-3.5 text-[#00e03c]" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setDrawerData(prev => ({ ...prev, deliverableName: null, deliverableUrl: null }))}
                                className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Quitar archivo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Adjuntos en array */}
                        {Array.isArray(drawerData.attachments) && drawerData.attachments.map((att, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-white font-medium block truncate max-w-[220px]">{att.name}</span>
                                {att.size && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {(att.size / 1024).toFixed(1)} KB
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = att.data;
                                  link.download = att.name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" /> Descargar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDrawerData(prev => ({
                                    ...prev,
                                    attachments: prev.attachments.filter((_, idx) => idx !== i)
                                  }));
                                }}
                                className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Eliminar adjunto"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {drawerData.status !== 'Concluido' && (
                      <button
                        type="button"
                        onClick={() => handleCompleteActivityValidation(drawerActivity, drawerData)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-[#00e03c] border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Validar 100%
                      </button>
                    )}
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

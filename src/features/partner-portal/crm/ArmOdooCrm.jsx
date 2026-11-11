/**
 * @file ArmOdooCrm.jsx
 * @description Suite Integral Odoo CRM & ARM (Automated Relationship Machine) para SERAM SRL.
 * Diseñada mediante ingeniería inversa de Odoo CRM con el sistema de diseño Neuform:
 * - Barra de navegación superior Odoo: CRM | Ventas | Reportes | Configuración.
 * - Botón Nuevo + Menú Generar (Directorio SEPREC, Comando Telegram, Formulario Web, Importar CSV).
 * - Vista Kanban con Creación Rápida Inline (+), Drag & Drop entre columnas, Estrellas de prioridad (1-3)
 *   y Popover de Actividades Planificadas en cada tarjeta.
 * - Conexión intrínseca con Misiones Clave (Flash, Grupal, Secundaria, Personal, Especialidad), Evidencias y Meritocracia XP.
 * - Integración de Clientes Reales existentes de SERAM (en etapa Nuevo) + Maquetas etiquetadas como '(EJEMPLO)'.
 * - Moneda Dual Dinámica (USD y Bolivianos Bs. a T.C. 6.96).
 * - Ficha 360° de Oportunidad con Chatter lateral estilo Odoo.
 *
 * Directrices: Cero emoticones, 100% en español, validación estricta de runtime.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, List, BarChart3, Plus, Search, Filter, Phone, Mail,
  Calendar, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
  RefreshCw, ChevronRight, ChevronDown, X, Clock, Sparkles, Building2,
  User, Users, DollarSign, MessageSquare, Send, Check, ExternalLink,
  Award, PauseCircle, PlayCircle, Eye, Star, Trash2, Edit2, FileText,
  Terminal, Settings, Layers, TrendingUp, Briefcase, MapPin, Link2,
  Zap, CheckSquare
} from 'lucide-react';
import {
  armService,
  ARM_STAGES,
  ARM_TEMPERATURES,
  ARM_TAG_COLORS,
  MISSION_CATEGORY_BADGES,
  USD_TO_BOB_RATE,
  formatDualCurrency
} from '../../../services/armService';
import { useApp } from '../../../context/AppContext';
import OdooCalendarModule from '../calendar/OdooCalendarModule';

const PartnersInitials = {
  'Ing. Diego Barrientos': { initials: 'DB', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'Ing. Fernando Araujo': { initials: 'FA', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' }
};

function getPartnerBadge(name) {
  if (!name) return { initials: 'SR', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  if (name.includes('Diego')) return PartnersInitials['Ing. Diego Barrientos'];
  if (name.includes('Fernando')) return PartnersInitials['Ing. Fernando Araujo'];
  return {
    initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  };
}

export default function ArmOdooCrm({ currentSocio }) {
  const {
    clients = [],
    handleAddClient,
    handleEditClient,
    handleDeleteClient,
    prospects = [],
    handleUpdateProspect,
    handleConvertProspectToClient,
    activities: globalActivities = [],
    handleAddActivity,
    handleUpdateActivityStatus,
    triggerToast
  } = useApp();

  // ── NAVEGACIÓN SUPERIOR ESTILO ODOO CRM ──
  // 'pipeline' | 'my_activities' | 'teams' | 'customers' | 'seprec' | 'reporting' | 'activity_types' | 'fast_capture'
  const [activeSection, setActiveSection] = useState('pipeline');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list' | 'activities' | 'reporting'
  const [openTopMenu, setOpenTopMenu] = useState(null); // 'ventas' | 'reportes' | 'config' | 'generar' | null

  // ── MONEDA DUAL DINÁMICA (USD / BOB Bs.) ──
  const [currencyMode, setCurrencyMode] = useState('USD'); // 'USD' | 'BOB'

  // ── DATOS PRINCIPALES DEL CRM ──
  const [leads, setLeads] = useState([]);
  const [leadActivities, setLeadActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── FILTROS DE LA BARRA DE BÚSQUEDA ODOO ──
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMyLeads, setFilterMyLeads] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [tempFilter, setTempFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  // ── CREACIÓN RÁPIDA INLINE EN COLUMNA KANBAN (CAPTURA #6 DE ODOO) ──
  const [quickAddStage, setQuickAddStage] = useState(null); // id de columna o null
  const [quickAddForm, setQuickAddForm] = useState({
    empresa: '',
    titulo_oportunidad: '',
    email: '',
    telefono: '',
    monto: '',
    prioridad_estrellas: 2
  });

  // ── DRAG & DROP ENTRE COLUMNAS KANBAN (CAPTURA #3 DE ODOO) ──
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);

  // ── POPOVER DE ACTIVIDADES PLANIFICADAS EN TARJETA (CAPTURA #4 DE ODOO) ──
  const [openActivityPopoverLeadId, setOpenActivityPopoverLeadId] = useState(null);
  const [completingActivityId, setCompletingActivityId] = useState(null);
  const [evidenceInput, setEvidenceInput] = useState({ url: '', nota: '' });

  // ── MODAL PROGRAMAR NUEVA ACTIVIDAD / MISIÓN ──
  const [scheduleModalLead, setScheduleModalLead] = useState(null);
  const [newMissionForm, setNewMissionForm] = useState({
    activity_type_code: 'CALL_BANT',
    titulo: '',
    resumen: '',
    categoria_mision: 'flash',
    responsable: currentSocio?.name || 'Ing. Diego Barrientos',
    fecha_vencimiento: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    xp_otorgado: 75,
    syncToGlobalActivities: true
  });

  // ── FICHA 360° DE OPORTUNIDAD + CHATTER (CAPTURA #5 DE ODOO) ──
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeSheetTab, setActiveSheetTab] = useState('missions'); // 'notes' | 'missions' | 'cadence' | 'bant'
  const [chatterMessages, setChatterMessages] = useState([]);
  const [newChatterText, setNewChatterText] = useState('');
  const [newChatterType, setNewChatterType] = useState('nota_interna');

  // ── GESTIÓN DE CLIENTES DEL DIRECTORIO (CAPTURA #10 DE ODOO) ──
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    type: 'Municipal / Público',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    location: 'La Paz, Bolivia',
    notes: ''
  });

  // ── FILTROS DE PROSPECCIÓN SEPREC ──
  const [seprecSearch, setSeprecSearch] = useState('');
  const [seprecDept, setSeprecDept] = useState('all');

  // ── CAPTURA RÁPIDA TELEGRAM / FORMULARIO ──
  const [telegramCommandInput, setTelegramCommandInput] = useState('');
  const [newActivityTypeForm, setNewActivityTypeForm] = useState({
    nombre: '',
    resumen_predeterminado: '',
    planeado_en_dias: 2,
    categoria_mision: 'secundaria',
    xp_recompensa: 60
  });

  // ── CARGA INICIAL Y SINCRONIZACIÓN CON BASE DE DATOS DE CLIENTES ──
  const loadCrmData = useCallback(async () => {
    setLoading(true);
    try {
      const syncedLeads = await armService.getLeads(clients);
      setLeads(syncedLeads || []);
      setLeadActivities(armService.getAllLeadActivities());
      setActivityTypes(armService.getActivityTypes());
    } catch {
      triggerToast?.('Error al sincronizar el flujo del CRM', 'error');
    } finally {
      setLoading(false);
    }
  }, [clients, triggerToast]);

  useEffect(() => {
    loadCrmData();
  }, [loadCrmData]);

  useEffect(() => {
    if (selectedLead) {
      setChatterMessages(armService.getChatter(selectedLead.id));
    } else {
      setChatterMessages([]);
    }
  }, [selectedLead]);

  // ── MANEJO DE NAVEGACIÓN HISTORIAL (POPSTATE) Y TECLA ESCAPE ──
  const handleOpenLeadDetail = useCallback((lead) => {
    setSelectedLead(lead);
    try {
      window.history.pushState({ seramModal: 'arm-lead-detail', leadId: lead?.id }, '');
    } catch (_) {
      // Ignorar restricciones en entornos sin soporte de historial completo
    }
  }, []);

  const handleCloseLeadDetail = useCallback(() => {
    setSelectedLead(null);
    try {
      if (window.history.state?.seramModal === 'arm-lead-detail') {
        window.history.back();
      }
    } catch (_) {
      // Fallback seguro
    }
  }, []);

  // Interceptar el botón Atrás del navegador para cerrar la ficha en lugar de salir a la Home
  useEffect(() => {
    const handlePopState = () => {
      if (selectedLead) {
        setSelectedLead(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedLead]);

  // Soporte para cerrar con tecla Escape (Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedLead) {
          handleCloseLeadDetail();
        } else if (openActivityPopoverLeadId) {
          setOpenActivityPopoverLeadId(null);
        } else if (scheduleModalLead) {
          setScheduleModalLead(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLead, openActivityPopoverLeadId, scheduleModalLead, handleCloseLeadDetail]);

  // ── FILTRADO DINÁMICO DE OPORTUNIDADES ──
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (!showExamples && (lead.is_example || String(lead.titulo_oportunidad || '').includes('(EJEMPLO)'))) {
        return false;
      }
      if (filterMyLeads && currentSocio?.name && lead.socio_asignado !== currentSocio.name) {
        return false;
      }
      if (tempFilter !== 'all' && lead.temperatura !== tempFilter) {
        return false;
      }
      if (stageFilter !== 'all' && lead.etapa_pipeline !== stageFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (lead.titulo_oportunidad && lead.titulo_oportunidad.toLowerCase().includes(q)) ||
          (lead.nombre && lead.nombre.toLowerCase().includes(q)) ||
          (lead.empresa && lead.empresa.toLowerCase().includes(q)) ||
          (lead.que_busca && lead.que_busca.toLowerCase().includes(q)) ||
          (lead.telefono && lead.telefono.includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [leads, showExamples, filterMyLeads, currentSocio, tempFilter, stageFilter, searchQuery]);

  // ── COLUMNAS KANBAN ──
  const kanbanColumns = useMemo(() => {
    const cols = {};
    ARM_STAGES.forEach(st => {
      cols[st.id] = [];
    });
    filteredLeads.forEach(l => {
      const stId = cols[l.etapa_pipeline] ? l.etapa_pipeline : 'nuevo';
      cols[stId].push(l);
    });
    return cols;
  }, [filteredLeads]);

  // ── MÉTRICAS Y MERITOCRACIA ──
  const crmMetrics = useMemo(() => {
    const activeLeads = filteredLeads.filter(l => l.etapa_pipeline !== 'perdido');
    const totalPipelineUsd = activeLeads.reduce((acc, l) => acc + (Number(l.presupuesto_estimado_usd) || 0), 0);
    const weightedUsd = activeLeads.reduce(
      (acc, l) => acc + ((Number(l.presupuesto_estimado_usd) || 0) * ((Number(l.probabilidad_cierre) || 20) / 100)),
      0
    );
    const wonLeads = filteredLeads.filter(l => l.etapa_pipeline === 'ganado');
    const wonUsd = wonLeads.reduce((acc, l) => acc + (Number(l.presupuesto_estimado_usd) || 0), 0);

    const completedMissions = leadActivities.filter(a => a.estado === 'completada');
    const pendingMissions = leadActivities.filter(a => a.estado === 'pendiente');
    const totalMeritXp = completedMissions.reduce((acc, a) => acc + (Number(a.xp_otorgado) || 0), 0);

    const xpByPartner = {
      'Ing. Diego Barrientos': completedMissions
        .filter(a => a.responsable?.includes('Diego'))
        .reduce((acc, a) => acc + (Number(a.xp_otorgado) || 0), 0),
      'Ing. Fernando Araujo': completedMissions
        .filter(a => a.responsable?.includes('Fernando'))
        .reduce((acc, a) => acc + (Number(a.xp_otorgado) || 0), 0)
    };

    return {
      totalCount: filteredLeads.length,
      totalPipelineUsd,
      weightedUsd: Math.round(weightedUsd),
      wonCount: wonLeads.length,
      wonUsd,
      completedMissionsCount: completedMissions.length,
      pendingMissionsCount: pendingMissions.length,
      totalMeritXp,
      xpByPartner
    };
  }, [filteredLeads, leadActivities]);

  // ── HANDLERS DE OPORTUNIDADES (ETAPAS, ESTRELLAS, CREACIÓN INLINE) ──
  const handleStageChange = async (leadId, newStageId) => {
    const updated = await armService.updateLead(leadId, { etapa_pipeline: newStageId });
    if (updated) {
      setLeads(prev => prev.map(l => String(l.id) === String(leadId) ? updated : l));
      if (selectedLead && String(selectedLead.id) === String(leadId)) {
        setSelectedLead(updated);
      }
      const stLabel = ARM_STAGES.find(s => s.id === newStageId)?.label || newStageId;
      armService.addChatterMessage(leadId, {
        tipo: 'cambio_etapa',
        autor: currentSocio?.name || 'Socio SERAM',
        contenido: `Etapa actualizada a "${stLabel}" (${updated.probabilidad_cierre}% de probabilidad).`
      });
      if (selectedLead && String(selectedLead.id) === String(leadId)) {
        setChatterMessages(armService.getChatter(leadId));
      }
      triggerToast?.(`Oportunidad movida a: ${stLabel}`, 'success');
    }
  };

  const handleTogglePriorityStars = async (lead, starCount, e) => {
    if (e) e.stopPropagation();
    const nextStars = lead.prioridad_estrellas === starCount ? starCount - 1 : starCount;
    const updated = await armService.updateLead(lead.id, { prioridad_estrellas: Math.max(0, nextStars) });
    if (updated) {
      setLeads(prev => prev.map(l => String(l.id) === String(lead.id) ? updated : l));
      if (selectedLead && String(selectedLead.id) === String(lead.id)) {
        setSelectedLead(updated);
      }
    }
  };

  const handleQuickAddSubmit = async (openFullFormAfter = false) => {
    if (!quickAddForm.titulo_oportunidad.trim() && !quickAddForm.empresa.trim()) {
      triggerToast?.('Ingresa el nombre de la oportunidad o el contacto', 'error');
      return;
    }

    const rawAmount = parseFloat(quickAddForm.monto) || 0;
    const usdAmount = currencyMode === 'BOB' ? Math.round(rawAmount / USD_TO_BOB_RATE) : rawAmount;

    const created = await armService.createLead({
      titulo_oportunidad: quickAddForm.titulo_oportunidad.trim() || `Oportunidad - ${quickAddForm.empresa.trim()}`,
      nombre: quickAddForm.empresa.trim() || 'Contacto Directo',
      empresa: quickAddForm.empresa.trim() || 'Institución / Empresa',
      email: quickAddForm.email.trim(),
      telefono: quickAddForm.telefono.trim(),
      que_busca: quickAddForm.titulo_oportunidad.trim() || 'Consultoría Ambiental / SIG',
      presupuesto_estimado_usd: usdAmount,
      prioridad_estrellas: quickAddForm.prioridad_estrellas,
      etapa_pipeline: quickAddStage || 'nuevo',
      socio_asignado: currentSocio?.name || 'Ing. Diego Barrientos',
      origen: 'Creación Rápida Kanban Odoo'
    });

    setLeads(prev => [created, ...prev]);
    setQuickAddForm({
      empresa: '',
      titulo_oportunidad: '',
      email: '',
      telefono: '',
      monto: '',
      prioridad_estrellas: 2
    });
    setQuickAddStage(null);
    triggerToast?.('Oportunidad agregada al flujo', 'success');

    if (openFullFormAfter) {
      handleOpenLeadDetail(created);
    }
  };

  // ── HANDLERS DRAG & DROP ──
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverColumn = (e, stageId) => {
    e.preventDefault();
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDropOnColumn = async (e, targetStageId) => {
    e.preventDefault();
    setDragOverStageId(null);
    if (!draggedLeadId) return;

    const targetLead = leads.find(l => String(l.id) === String(draggedLeadId));
    setDraggedLeadId(null);
    if (targetLead && targetLead.etapa_pipeline !== targetStageId) {
      await handleStageChange(targetLead.id, targetStageId);
    }
  };

  // ── HANDLERS DE MISIONES, EVIDENCIAS Y MERITOCRACIA XP ──
  const handleOpenScheduleMission = (lead, e) => {
    if (e) e.stopPropagation();
    setOpenActivityPopoverLeadId(null);
    setScheduleModalLead(lead);
    setNewMissionForm({
      activity_type_code: 'CALL_BANT',
      titulo: `Seguimiento Técnico: ${lead.titulo_oportunidad || lead.empresa}`,
      resumen: `Avanzar gestión comercial para ${lead.empresa || lead.nombre}`,
      categoria_mision: 'flash',
      responsable: lead.socio_asignado || currentSocio?.name || 'Ing. Diego Barrientos',
      fecha_vencimiento: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      xp_otorgado: 75,
      syncToGlobalActivities: true
    });
  };

  const handleCreateMissionSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleModalLead || !newMissionForm.titulo.trim()) return;

    const createdAct = armService.scheduleLeadActivity(scheduleModalLead.id, newMissionForm);
    setLeadActivities(armService.getAllLeadActivities());

    if (selectedLead && String(selectedLead.id) === String(scheduleModalLead.id)) {
      setChatterMessages(armService.getChatter(scheduleModalLead.id));
    }

    // Doble vinculación con la tabla global de actividades de SERAM si está activo
    if (newMissionForm.syncToGlobalActivities && handleAddActivity) {
      await handleAddActivity({
        title: `[CRM] ${createdAct.titulo}`,
        description: `${createdAct.resumen || ''} | Oportunidad: ${scheduleModalLead.empresa}`,
        responsible: createdAct.responsable,
        participants: createdAct.participantes,
        status: 'Pendiente',
        priority: createdAct.categoria_mision === 'flash' ? 'Alta' : 'Media',
        dueDate: createdAct.fecha_vencimiento,
        is_flash_mission: createdAct.categoria_mision === 'flash',
        is_group_task: createdAct.categoria_mision === 'grupal',
        mission_type: createdAct.categoria_mision,
        xp_awarded: createdAct.xp_otorgado
      });
    }

    setScheduleModalLead(null);
    triggerToast?.(`Misión programada (+${createdAct.xp_otorgado} XP al completar con evidencia)`, 'success');
  };

  const handleCompleteMissionWithEvidence = async (activity) => {
    if (!evidenceInput.nota.trim() && !evidenceInput.url.trim()) {
      triggerToast?.('Por mérito y trazabilidad, registra la nota de resultado o enlace de evidencia', 'error');
      return;
    }

    const completed = await armService.completeLeadActivityWithEvidence(activity.id, {
      evidencia_url: evidenceInput.url.trim(),
      evidencia_nota: evidenceInput.nota.trim(),
      autor: currentSocio?.name || activity.responsable
    });

    setLeadActivities(armService.getAllLeadActivities());
    setCompletingActivityId(null);
    setEvidenceInput({ url: '', nota: '' });

    // Si el lead estaba en 'nuevo', avanzarlo automáticamente a 'nurturing' o 'calificado'
    const parentLead = leads.find(l => String(l.id) === String(activity.lead_id));
    if (parentLead && parentLead.etapa_pipeline === 'nuevo') {
      await handleStageChange(parentLead.id, 'nurturing');
    } else if (selectedLead && String(selectedLead.id) === String(activity.lead_id)) {
      setChatterMessages(armService.getChatter(activity.lead_id));
    }

    triggerToast?.(`Misión verificada: +${completed?.xp_otorgado || 50} XP acreditados por cumplimiento evidente`, 'success');
  };

  // ── HANDLER AVANCE DE CADENCIA 14 DÍAS ──
  const handleAdvanceCadence = async (lead) => {
    await armService.advanceCadenceStep(lead.id, lead.contacto_actual || 0, 'Contacto ejecutado bajo protocolo anti-baneo');
    const refreshed = await armService.getLeads(clients);
    setLeads(refreshed);
    const updated = refreshed.find(l => String(l.id) === String(lead.id));
    if (updated) setSelectedLead(updated);
    setChatterMessages(armService.getChatter(lead.id));
    triggerToast?.('Contacto de cadencia 14D registrado', 'success');
  };

  // ── HANDLER COMANDO RÁPIDO TELEGRAM ──
  const handleTelegramCommandSubmit = async (e) => {
    e.preventDefault();
    if (!telegramCommandInput.trim()) return;
    const created = await armService.createLeadFromTelegramCommand(
      telegramCommandInput,
      currentSocio?.name || 'Ing. Diego Barrientos'
    );
    setLeads(prev => [created, ...prev]);
    setTelegramCommandInput('');
    triggerToast?.(`Lead "${created.empresa}" creado vía comando rápido`, 'success');
    setActiveSection('pipeline');
  };

  // ── HANDLER CLIENTES DEL DIRECTORIO REAL ──
  const handleSaveDirectoryClient = async (e) => {
    e.preventDefault();
    if (!clientFormData.name.trim()) {
      triggerToast?.('El nombre de la institución o cliente es obligatorio', 'error');
      return;
    }
    if (editingClient) {
      await handleEditClient(editingClient.id, clientFormData);
    } else {
      await handleAddClient(clientFormData);
    }
    setShowClientModal(false);
    setTimeout(() => loadCrmData(), 200);
  };

  // ── IMPORTAR PROSPECTO SEPREC AL PIPELINE ──
  const handleImportSeprecToPipeline = async (prospect) => {
    const created = await armService.createLead({
      titulo_oportunidad: `${prospect.servicioInteres || 'Registro Ambiental Industrial (RAI)'} - ${prospect.razonSocial}`,
      nombre: prospect.razonSocial,
      empresa: prospect.razonSocial,
      cargo: prospect.tipoSocietario || 'Empresa SEPREC',
      email: prospect.email || '',
      telefono: prospect.telefono || '',
      ubicacion: `${prospect.municipio || ''}, ${prospect.departamento || 'Bolivia'}`,
      que_busca: prospect.servicioInteres || 'Registro Ambiental Industrial (RAI)',
      cuando_necesita: 'Corto Plazo (15 a 45 días)',
      cuanto_invertir: 'USD 500 - USD 1,500',
      presupuesto_estimado_usd: 650,
      etiquetas: ['RAI Industrial'],
      etapa_pipeline: 'nuevo',
      socio_asignado: currentSocio?.name || 'Ing. Diego Barrientos',
      origen: `Directorio SEPREC (Matrícula ${prospect.matricula || 'N/A'})`,
      notas_internas: `Actividad económica: ${prospect.actividad || 'Industrial'}. Dirección: ${prospect.direccion || 'No especificada'}.`
    });
    if (handleUpdateProspect) {
      handleUpdateProspect(prospect.id, { estadoGestion: 'Contactado', socioAsignado: currentSocio?.name });
    }
    setLeads(prev => [created, ...prev]);
    triggerToast?.(`Empresa ${prospect.razonSocial} incorporada al flujo del CRM`, 'success');
    setActiveSection('pipeline');
  };

  return (
    <div
      className="min-h-[82vh] rounded-3xl bg-[#070d08]/95 border border-white/[0.09] shadow-2xl overflow-hidden flex flex-col relative z-10"
      onClick={() => {
        if (openTopMenu) setOpenTopMenu(null);
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════════════
          1. BARRA SUPERIOR DE NAVEGACIÓN ESTILO ODOO CRM (CAPTURAS #6, #7, #8, #9)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#0b150d] border-b border-white/[0.09] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Izquierda: Marca CRM + Menús Desplegables */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveSection('pipeline');
              setViewMode('kanban');
            }}
            className="flex items-center gap-2 pr-3 py-1 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#00e03c]/20 border border-[#00e03c]/40 flex items-center justify-center text-[#00e03c]">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-sm font-black text-white tracking-wider font-tech">CRM</span>
          </button>

          {/* Menú VENTAS (Captura #8) */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenTopMenu(openTopMenu === 'ventas' ? null : 'ventas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                ['pipeline', 'my_activities', 'teams', 'customers', 'seprec'].includes(activeSection)
                  ? 'bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>Ventas</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {openTopMenu === 'ventas' && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-2xl bg-[#0e1a10] border border-white/[0.12] shadow-2xl py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('pipeline');
                    setViewMode('kanban');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] flex items-center justify-between cursor-pointer"
                >
                  <span>Mi flujo (Pipeline)</span>
                  <span className="text-[10px] font-mono text-slate-400">{filteredLeads.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('my_activities');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] flex items-center justify-between cursor-pointer"
                >
                  <span>Mis actividades y misiones</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                    {crmMetrics.pendingMissionsCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('teams');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] cursor-pointer"
                >
                  Equipos y Meritocracia
                </button>
                <div className="my-1 border-t border-white/[0.08]" />
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('customers');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] flex items-center justify-between cursor-pointer"
                >
                  <span>Clientes (Directorio SERAM)</span>
                  <span className="text-[10px] font-mono text-slate-400">{clients.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('seprec');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] flex items-center justify-between cursor-pointer"
                >
                  <span>Directorio B2B (SEPREC 150)</span>
                  <span className="text-[10px] font-mono text-amber-400">{prospects.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Menú REPORTES (Captura #9) */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenTopMenu(openTopMenu === 'reportes' ? null : 'reportes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                activeSection === 'reporting'
                  ? 'bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>Reportes</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {openTopMenu === 'reportes' && (
              <div className="absolute left-0 mt-1.5 w-52 rounded-2xl bg-[#0e1a10] border border-white/[0.12] shadow-2xl py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('reporting');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] cursor-pointer"
                >
                  Pronóstico e Ingresos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('reporting');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] cursor-pointer"
                >
                  Análisis de Flujo y Conversión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('reporting');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] cursor-pointer"
                >
                  Cumplimiento de Actividades y XP
                </button>
              </div>
            )}
          </div>

          {/* Menú CONFIGURACIÓN (Captura #11) */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenTopMenu(openTopMenu === 'config' ? null : 'config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                ['activity_types', 'fast_capture'].includes(activeSection)
                  ? 'bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>Configuración</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {openTopMenu === 'config' && (
              <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-[#0e1a10] border border-white/[0.12] shadow-2xl py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('activity_types');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] cursor-pointer"
                >
                  Tipos de actividad y misiones
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('fast_capture');
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-[#00e03c]/15 hover:text-[#00e03c] cursor-pointer"
                >
                  Captura Rápida (Telegram / Google Forms)
                </button>
                <div className="my-1 border-t border-white/[0.08]" />
                <button
                  type="button"
                  onClick={() => {
                    setShowExamples(prev => !prev);
                    setOpenTopMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-amber-300 hover:bg-amber-500/15 cursor-pointer flex items-center justify-between"
                >
                  <span>{showExamples ? 'Ocultar maquetas (EJEMPLO)' : 'Mostrar maquetas (EJEMPLO)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const remaining = armService.purgeExampleLeads();
                    setLeads(remaining);
                    setOpenTopMenu(null);
                    triggerToast?.('Maquetas (EJEMPLO) depuradas de la vista', 'info');
                  }}
                  className="w-full px-4 py-2 text-left text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                >
                  Eliminar maquetas (EJEMPLO)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const restored = armService.restoreExampleLeads();
                    setLeads(restored);
                    setShowExamples(true);
                    setOpenTopMenu(null);
                    triggerToast?.('Maquetas (EJEMPLO) restauradas para pruebas', 'success');
                  }}
                  className="w-full px-4 py-2 text-left text-emerald-400 hover:bg-emerald-500/15 cursor-pointer"
                >
                  Restaurar maquetas (EJEMPLO)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Derecha: Indicadores de Actividades, Moneda Dual (USD/Bs) y Socio Activo */}
        <div className="flex items-center gap-2">
          {/* Píldora de Meritocracia XP */}
          <button
            type="button"
            onClick={() => setActiveSection('my_activities')}
            className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/25 transition-colors"
            title="Puntos de Meritocracia ganados por actividades con evidencia"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{crmMetrics.totalMeritXp} XP</span>
            <span className="text-slate-400">|</span>
            <span>{crmMetrics.pendingMissionsCount} pendientes</span>
          </button>

          {/* Selector de Moneda Dual Dinámica (USD / Bs.) */}
          <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setCurrencyMode('USD')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                currencyMode === 'USD' ? 'bg-[#00e03c] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD $
            </button>
            <button
              type="button"
              onClick={() => setCurrencyMode('BOB')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                currencyMode === 'BOB' ? 'bg-[#00e03c] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bs. (6.96)
            </button>
          </div>

          {/* Usuario Activo */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black ${getPartnerBadge(currentSocio?.name || 'Ing. Diego Barrientos').color}`}>
              {getPartnerBadge(currentSocio?.name || 'Ing. Diego Barrientos').initials}
            </div>
            <span className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
              {currentSocio?.name || 'Ing. Diego Barrientos'}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. PANEL DE CONTROL SECUNDARIO ESTILO ODOO (Nuevo | Generar | Buscador | Vistas)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#09120a] border-b border-white/[0.08] px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Izquierda: Botón Nuevo + Botón Generar + Título de Vista */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (activeSection === 'customers') {
                setEditingClient(null);
                setClientFormData({
                  name: '',
                  type: 'Municipal / Público',
                  contactPerson: '',
                  contactPhone: '',
                  contactEmail: '',
                  location: 'La Paz, Bolivia',
                  notes: ''
                });
                setShowClientModal(true);
              } else {
                setActiveSection('pipeline');
                setViewMode('kanban');
                setQuickAddStage('nuevo');
              }
            }}
            className="px-4 py-1.5 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md shadow-[#00e03c]/20"
          >
            Nuevo
          </button>

          {/* Menú GENERAR (Captura #7 de Odoo) */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenTopMenu(openTopMenu === 'generar' ? null : 'generar')}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Generar Leads</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#00e03c]" />
            </button>

            {openTopMenu === 'generar' && (
              <div className="absolute left-0 mt-2 w-[340px] sm:w-[480px] rounded-2xl bg-[#0f1d12] border border-white/[0.14] shadow-2xl p-3 z-50 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('seprec');
                    setOpenTopMenu(null);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00e03c]/15 border border-white/[0.06] hover:border-[#00e03c]/40 text-left flex items-start gap-2.5 transition-all cursor-pointer"
                >
                  <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Directorio B2B SEPREC</p>
                    <p className="text-[10px] text-slate-400">Busca en la base de empresas verificadas de Bolivia</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('fast_capture');
                    setOpenTopMenu(null);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00e03c]/15 border border-white/[0.06] hover:border-[#00e03c]/40 text-left flex items-start gap-2.5 transition-all cursor-pointer"
                >
                  <Terminal className="w-5 h-5 text-[#00e03c] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Comando Rápido / Telegram</p>
                    <p className="text-[10px] text-slate-400">Registra un cliente en 3 segundos con una línea de texto</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('fast_capture');
                    setOpenTopMenu(null);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00e03c]/15 border border-white/[0.06] hover:border-[#00e03c]/40 text-left flex items-start gap-2.5 transition-all cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Webhook Google Forms</p>
                    <p className="text-[10px] text-slate-400">Conecta encuestas externas directo a Supabase</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('customers');
                    setOpenTopMenu(null);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00e03c]/15 border border-white/[0.06] hover:border-[#00e03c]/40 text-left flex items-start gap-2.5 transition-all cursor-pointer"
                >
                  <Users className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Sincronizar Directorio</p>
                    <p className="text-[10px] text-slate-400">Convierte clientes actuales en oportunidades activas</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <span className="text-sm font-black text-white pl-1">
            {activeSection === 'pipeline' && 'Flujo de Oportunidades'}
            {activeSection === 'my_activities' && 'Mis Actividades y Misiones Clave'}
            {activeSection === 'teams' && 'Equipos de Venta y Meritocracia'}
            {activeSection === 'customers' && `Clientes (${clients.length})`}
            {activeSection === 'seprec' && `Directorio B2B SEPREC (${prospects.length})`}
            {activeSection === 'reporting' && 'Pronóstico y Analítica de Ventas'}
            {activeSection === 'activity_types' && 'Tipos de Actividad (Configuración Odoo)'}
            {activeSection === 'fast_capture' && 'Captura Rápida (Telegram Bot & Google Forms)'}
          </span>
        </div>

        {/* Centro: Barra de Búsqueda con Píldoras de Filtro estilo Odoo */}
        <div className="flex-1 max-w-xl flex items-center gap-1.5 bg-black/50 border border-white/[0.12] rounded-xl px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          {filterMyLeads && (
            <span className="px-2 py-0.5 rounded-lg bg-purple-500/25 border border-purple-500/40 text-purple-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
              Mis oportunidades
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterMyLeads(false)} />
            </span>
          )}

          {showExamples && (
            <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/35 text-rose-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
              Incluye (EJEMPLO)
              <X className="w-3 h-3 cursor-pointer" title="Ocultar maquetas (EJEMPLO)" onClick={() => setShowExamples(false)} />
            </span>
          )}

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar oportunidad, cliente, servicio o teléfono..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
          />

          <button
            type="button"
            onClick={() => setFilterMyLeads(prev => !prev)}
            title="Filtrar solo mis oportunidades"
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              filterMyLeads ? 'text-[#00e03c] bg-[#00e03c]/15' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Derecha: Conmutador de Vistas Odoo (Kanban | Lista | Actividades | Reportes) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              setActiveSection('pipeline');
              setViewMode('kanban');
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              activeSection === 'pipeline' && viewMode === 'kanban'
                ? 'bg-[#00e03c] text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Kanban Odoo"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSection('pipeline');
              setViewMode('list');
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              activeSection === 'pipeline' && viewMode === 'list'
                ? 'bg-[#00e03c] text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Lista Odoo"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('calendar')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              activeSection === 'calendar'
                ? 'bg-[#00e03c] text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Calendario Odoo (4.5h / 8.0h)"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('my_activities')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              activeSection === 'my_activities'
                ? 'bg-[#00e03c] text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Actividades y Misiones"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('reporting')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              activeSection === 'reporting'
                ? 'bg-[#00e03c] text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Pronóstico y Reportes"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={loadCrmData}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00e03c] transition-colors cursor-pointer"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00e03c]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. CUERPO PRINCIPAL SEGÚN SECCIÓN ACTIVA
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* ── SECCIÓN A: FLUJO DE OPORTUNIDADES (KANBAN / LISTA) ── */}
        {activeSection === 'pipeline' && viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none">
            {ARM_STAGES.filter(st => st.id !== 'perdido').map(stage => {
              const colLeads = kanbanColumns[stage.id] || [];
              const colUsd = colLeads.reduce((sum, l) => sum + (Number(l.presupuesto_estimado_usd) || 0), 0);
              const formattedTotal = formatDualCurrency(colUsd, currencyMode);

              // Contar actividades de la columna para la barra de progreso estilo Odoo
              const withCompletedAct = colLeads.filter(l =>
                leadActivities.some(a => String(a.lead_id) === String(l.id) && a.estado === 'completada')
              ).length;
              const withPendingAct = colLeads.filter(l =>
                leadActivities.some(a => String(a.lead_id) === String(l.id) && a.estado === 'pendiente')
              ).length;
              const totalInCol = Math.max(1, colLeads.length);

              return (
                <div
                  key={stage.id}
                  onDragOver={e => handleDragOverColumn(e, stage.id)}
                  onDrop={e => handleDropOnColumn(e, stage.id)}
                  className={`w-[305px] sm:w-[325px] flex-shrink-0 flex flex-col rounded-2xl bg-[#0c160e]/90 border transition-colors ${
                    dragOverStageId === stage.id
                      ? 'border-[#00e03c] bg-[#00e03c]/[0.05]'
                      : 'border-white/[0.07]'
                  }`}
                >
                  {/* Cabecera de Columna Odoo (Título, Botón +, Barra de progreso y Valor total) */}
                  <div className="p-3.5 border-b border-white/[0.07] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">{stage.label}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.08] text-slate-300">
                          {colLeads.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuickAddStage(quickAddStage === stage.id ? null : stage.id)}
                        title={`Agregar rápido en ${stage.label}`}
                        className="p-1 rounded-lg text-slate-400 hover:text-[#00e03c] hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Barra de progreso segmentada Odoo + Total Monetario */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden flex">
                        <div
                          className="bg-[#00e03c] h-full transition-all"
                          style={{ width: `${(withCompletedAct / totalInCol) * 100}%` }}
                        />
                        <div
                          className="bg-amber-400 h-full transition-all"
                          style={{ width: `${(withPendingAct / totalInCol) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-200 shrink-0">
                        {formattedTotal.primary}
                      </span>
                    </div>
                  </div>

                  {/* Formulario Inline de Creación Rápida (Captura #6 de Odoo) */}
                  {quickAddStage === stage.id && (
                    <div className="m-2.5 p-3 rounded-xl bg-[#132216] border border-[#00e03c]/40 shadow-xl space-y-2.5 text-xs">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          list="seram-existing-clients-list"
                          value={quickAddForm.empresa}
                          onChange={e => setQuickAddForm({ ...quickAddForm, empresa: e.target.value })}
                          placeholder="Organización / Contacto"
                          className="w-full bg-transparent text-white placeholder-slate-500 outline-none"
                        />
                        <datalist id="seram-existing-clients-list">
                          {clients.map(c => (
                            <option key={c.id} value={c.name} />
                          ))}
                        </datalist>
                      </div>

                      <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={quickAddForm.titulo_oportunidad}
                          onChange={e => setQuickAddForm({ ...quickAddForm, titulo_oportunidad: e.target.value })}
                          placeholder="Nombre de la oportunidad *"
                          className="w-full bg-transparent text-white placeholder-slate-500 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="email"
                          value={quickAddForm.email}
                          onChange={e => setQuickAddForm({ ...quickAddForm, email: e.target.value })}
                          placeholder="Correo electrónico del contacto"
                          className="w-full bg-transparent text-white placeholder-slate-500 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="tel"
                          value={quickAddForm.telefono}
                          onChange={e => setQuickAddForm({ ...quickAddForm, telefono: e.target.value })}
                          placeholder="Teléfono / WhatsApp del contacto"
                          className="w-full bg-transparent text-white placeholder-slate-500 outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="flex items-center gap-1.5 flex-1 border-b border-white/10 pb-1">
                          <DollarSign className="w-3.5 h-3.5 text-[#00e03c] shrink-0" />
                          <input
                            type="number"
                            value={quickAddForm.monto}
                            onChange={e => setQuickAddForm({ ...quickAddForm, monto: e.target.value })}
                            placeholder={`0.00 ${currencyMode === 'BOB' ? 'Bs.' : 'USD'}`}
                            className="w-full bg-transparent text-white placeholder-slate-500 outline-none font-mono"
                          />
                        </div>

                        {/* Selector de 3 Estrellas */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setQuickAddForm({ ...quickAddForm, prioridad_estrellas: st })}
                              className="p-0.5 cursor-pointer"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  quickAddForm.prioridad_estrellas >= st
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAddSubmit(false)}
                            className="px-3 py-1.5 rounded-lg bg-[#00e03c] text-slate-950 font-black text-[11px] hover:bg-white transition-colors cursor-pointer"
                          >
                            Agregar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAddSubmit(true)}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setQuickAddStage(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Tarjetas Kanban de la Columna */}
                  <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-21rem)] min-h-[180px]">
                    {colLeads.map(lead => {
                      const money = formatDualCurrency(lead.presupuesto_estimado_usd, currencyMode);
                      const cardActs = leadActivities.filter(a => String(a.lead_id) === String(lead.id));
                      const pendingActs = cardActs.filter(a => a.estado === 'pendiente');
                      const partnerAv = getPartnerBadge(lead.socio_asignado);
                      const isPopoverOpen = openActivityPopoverLeadId === lead.id;

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={e => handleDragStart(e, lead.id)}
                          onClick={() => handleOpenLeadDetail(lead)}
                          className={`relative p-3.5 rounded-xl bg-white/[0.035] hover:bg-white/[0.07] border transition-all duration-150 cursor-pointer shadow-md group space-y-2 ${
                            lead.is_example
                              ? 'border-l-4 border-l-amber-400/80 border-white/[0.09]'
                              : 'border-l-4 border-l-[#00e03c] border-white/[0.09]'
                          }`}
                        >
                          {/* Título de la Oportunidad */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-black text-white leading-snug group-hover:text-[#00e03c] transition-colors">
                              {lead.titulo_oportunidad || lead.que_busca}
                            </h4>
                          </div>

                          {/* Monto en Moneda Dual + Probabilidad */}
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs font-mono font-black text-slate-100">{money.primary}</span>
                              <span className="text-[10px] font-mono text-slate-400">({money.secondary})</span>
                            </div>
                            {lead.contacto_actual > 0 && (
                              <span className="text-[9.5px] font-mono text-[#00e03c]">
                                14D: {lead.contacto_actual}/7
                              </span>
                            )}
                          </div>

                          {/* Nombre del Cliente / Institución */}
                          <p className="text-[11px] text-slate-300 font-medium truncate">
                            {lead.empresa || lead.nombre}
                          </p>

                          {/* Etiquetas (Tags) estilo Odoo */}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {(lead.etiquetas || []).map((tag, idx) => (
                              <span
                                key={idx}
                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                  ARM_TAG_COLORS[tag] || 'bg-white/10 text-slate-300 border-white/15'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Fila Inferior Odoo: Estrellas de Prioridad + Icono de Actividad Planificada + Avatar */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              {/* 3 Estrellas Interactivas */}
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3].map(starIdx => (
                                  <button
                                    key={starIdx}
                                    type="button"
                                    onClick={e => handleTogglePriorityStars(lead, starIdx, e)}
                                    className="cursor-pointer p-0.5"
                                    title={`Prioridad ${starIdx}`}
                                  >
                                    <Star
                                      className={`w-3.5 h-3.5 transition-colors ${
                                        (lead.prioridad_estrellas || 0) >= starIdx
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-slate-600 hover:text-slate-400'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>

                              {/* Botón de Actividades Planificadas (Abre Popover Captura #4) */}
                              <button
                                type="button"
                                onClick={() => setOpenActivityPopoverLeadId(isPopoverOpen ? null : lead.id)}
                                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                  pendingActs.length > 0
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]'
                                }`}
                                title="Ver o programar misiones y actividades"
                              >
                                <Clock className="w-3 h-3" />
                                {pendingActs.length > 0 && <span>{pendingActs.length}</span>}
                              </button>

                              {/* Botón rápido de WhatsApp */}
                              <a
                                href={armService.createWhatsAppUrl(
                                  lead.telefono,
                                  `Estimado/a ${lead.nombre.replace('(EJEMPLO) ', '')}, nos comunicamos de SERAM respecto a ${lead.que_busca}.`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg text-[#25D366] hover:bg-[#25D366]/15 transition-colors"
                                title="Contactar por WhatsApp"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            </div>

                            {/* Avatar del Socio Asignado */}
                            <div
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[9.5px] font-black ${partnerAv.color}`}
                              title={`Asignado a: ${lead.socio_asignado}`}
                            >
                              {partnerAv.initials}
                            </div>
                          </div>

                          {/* POPOVER DE ACTIVIDADES PLANIFICADAS EN TARJETA (CAPTURA #4 DE ODOO) */}
                          {isPopoverOpen && (
                            <div
                              onClick={e => e.stopPropagation()}
                              className="mt-2 p-3 rounded-xl bg-[#0e1c11] border border-[#00e03c]/40 shadow-2xl space-y-2.5 text-xs z-30"
                            >
                              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#00e03c]">
                                  Planificado ({pendingActs.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setOpenActivityPopoverLeadId(null)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {pendingActs.length === 0 ? (
                                <p className="text-[11px] text-slate-400 py-1">
                                  Sin misiones pendientes para esta oportunidad.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {pendingActs.map(act => {
                                    const badge = MISSION_CATEGORY_BADGES[act.categoria_mision] || MISSION_CATEGORY_BADGES.secundaria;
                                    const isCompleting = completingActivityId === act.id;

                                    return (
                                      <div key={act.id} className="p-2 rounded-lg bg-black/40 border border-white/[0.08] space-y-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold border ${badge.className}`}>
                                              {badge.label} · +{act.xp_otorgado} XP
                                            </span>
                                            <p className="text-[11px] font-bold text-white mt-1">{act.titulo}</p>
                                            <p className="text-[10px] text-slate-400">
                                              {act.responsable} · Vence: {act.fecha_vencimiento}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setCompletingActivityId(isCompleting ? null : act.id)}
                                            title="Marcar como hecho con evidencia"
                                            className="p-1 rounded-lg bg-[#00e03c]/20 hover:bg-[#00e03c] text-[#00e03c] hover:text-slate-950 transition-colors cursor-pointer"
                                          >
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                          </button>
                                        </div>

                                        {isCompleting && (
                                          <div className="pt-1.5 border-t border-white/10 space-y-1.5">
                                            <input
                                              type="text"
                                              value={evidenceInput.nota}
                                              onChange={e => setEvidenceInput({ ...evidenceInput, nota: e.target.value })}
                                              placeholder="Resultado / Evidencia verificable *"
                                              className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-[#00e03c]"
                                            />
                                            <input
                                              type="text"
                                              value={evidenceInput.url}
                                              onChange={e => setEvidenceInput({ ...evidenceInput, url: e.target.value })}
                                              placeholder="Enlace a documento, acta o Drive (opcional)"
                                              className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-[#00e03c]"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleCompleteMissionWithEvidence(act)}
                                              className="w-full py-1 rounded-lg bg-[#00e03c] text-slate-950 font-black text-[10px] hover:bg-white transition-colors cursor-pointer"
                                            >
                                              Confirmar Cumplimiento (+{act.xp_otorgado} XP)
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={e => handleOpenScheduleMission(lead, e)}
                                className="w-full py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 text-[#00e03c]" /> Programar una actividad / misión
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SECCIÓN A.2: FLUJO EN VISTA LISTA / TABLA ODOO ── */}
        {activeSection === 'pipeline' && viewMode === 'list' && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 font-tech uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Oportunidad</th>
                    <th className="py-3 px-4">Cliente / Organización</th>
                    <th className="py-3 px-4">Correo / Teléfono</th>
                    <th className="py-3 px-4">Etapa</th>
                    <th className="py-3 px-4">Misiones / Cadencia</th>
                    <th className="py-3 px-4 text-right">Ingreso Estimado</th>
                    <th className="py-3 px-4">Probabilidad</th>
                    <th className="py-3 px-4">Vendedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredLeads.map(lead => {
                    const money = formatDualCurrency(lead.presupuesto_estimado_usd, currencyMode);
                    const stMeta = ARM_STAGES.find(s => s.id === lead.etapa_pipeline) || ARM_STAGES[0];
                    const acts = leadActivities.filter(a => String(a.lead_id) === String(lead.id) && a.estado === 'pendiente');

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => handleOpenLeadDetail(lead)}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-bold text-white">{lead.titulo_oportunidad || lead.que_busca}</td>
                        <td className="py-3 px-4 text-slate-300">{lead.empresa}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{lead.telefono || lead.email}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${stMeta.color}`}>
                            {stMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          {acts.length > 0 ? `${acts.length} misión(es)` : `Contacto ${lead.contacto_actual || 0}/7`}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {money.primary}
                          <span className="block text-[9.5px] text-slate-500">{money.secondary}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{lead.probabilidad_cierre}%</td>
                        <td className="py-3 px-4 text-slate-300 text-[11px]">{lead.socio_asignado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SECCIÓN B: MIS ACTIVIDADES Y MISIONES POR TIPO (MERITOCRACIA) ── */}
        {activeSection === 'my_activities' && (
          <div className="space-y-4">
            {/* Resumen por Tipo de Misión */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(MISSION_CATEGORY_BADGES).map(([key, info]) => {
                const count = leadActivities.filter(a => a.categoria_mision === key).length;
                const done = leadActivities.filter(a => a.categoria_mision === key && a.estado === 'completada').length;
                return (
                  <div key={key} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                    <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold border ${info.className}`}>
                      {info.label}
                    </span>
                    <p className="text-lg font-black text-white pt-1">
                      {done} / {count} <span className="text-xs font-normal text-slate-400">cumplidas</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Recompensa base: +{info.xpBase} XP</p>
                  </div>
                );
              })}
            </div>

            {/* Tabla de Actividades Vinculadas al CRM */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Matriz de Misiones Comerciales y Evidencias Verificables
                </h3>
                <span className="text-xs text-[#00e03c] font-bold">
                  Total Acreditado: {crmMetrics.totalMeritXp} XP
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 font-tech uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Misión / Actividad</th>
                      <th className="py-3 px-4">Tipo de Misión</th>
                      <th className="py-3 px-4">Oportunidad / Cliente</th>
                      <th className="py-3 px-4">Responsable</th>
                      <th className="py-3 px-4">Fecha Límite</th>
                      <th className="py-3 px-4">Mérito XP</th>
                      <th className="py-3 px-4">Estado / Evidencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {leadActivities.map(act => {
                      const parent = leads.find(l => String(l.id) === String(act.lead_id));
                      const badge = MISSION_CATEGORY_BADGES[act.categoria_mision] || MISSION_CATEGORY_BADGES.secundaria;

                      return (
                        <tr key={act.id} className="hover:bg-white/[0.03]">
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{act.titulo}</p>
                            {act.resumen && <p className="text-[10px] text-slate-400">{act.resumen}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold border ${badge.className}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {parent ? (
                              <button
                                type="button"
                                onClick={() => handleOpenLeadDetail(parent)}
                                className="hover:text-[#00e03c] underline cursor-pointer text-left"
                              >
                                {parent.empresa}
                              </button>
                            ) : (
                              act.lead_id
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{act.responsable}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{act.fecha_vencimiento}</td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-300">+{act.xp_otorgado} XP</td>
                          <td className="py-3 px-4">
                            {act.estado === 'completada' ? (
                              <div className="space-y-0.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e03c]/20 text-[#00e03c] font-bold inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Verificada
                                </span>
                                <p className="text-[10px] text-slate-400">{act.evidencia_nota}</p>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (parent) handleOpenLeadDetail(parent);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#00e03c] text-slate-950 font-black text-[10px] hover:bg-white transition-colors cursor-pointer"
                              >
                                Completar con Evidencia
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SECCIÓN C: EQUIPOS Y MERITOCRACIA BIPARTITA ── */}
        {activeSection === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Ing. Diego Barrientos', 'Ing. Fernando Araujo'].map(partnerName => {
              const partnerLeads = filteredLeads.filter(l => l.socio_asignado === partnerName);
              const partnerUsd = partnerLeads.reduce((s, l) => s + (Number(l.presupuesto_estimado_usd) || 0), 0);
              const formatted = formatDualCurrency(partnerUsd, currencyMode);
              const partnerMissions = leadActivities.filter(a => a.responsable === partnerName);
              const completedCount = partnerMissions.filter(a => a.estado === 'completada').length;
              const xpEarned = crmMetrics.xpByPartner[partnerName] || 0;

              return (
                <div key={partnerName} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.09] space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm ${getPartnerBadge(partnerName).color}`}>
                        {getPartnerBadge(partnerName).initials}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">{partnerName}</h4>
                        <p className="text-xs text-slate-400">Dirección Técnica & Comercial SERAM</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs">
                      {xpEarned} XP Mérito
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 uppercase font-tech block">Oportunidades</span>
                      <span className="text-lg font-black text-white">{partnerLeads.length}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 uppercase font-tech block">Cartera Activa</span>
                      <span className="text-sm font-black text-[#00e03c] font-mono">{formatted.primary}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 uppercase font-tech block">Misiones Cumplidas</span>
                      <span className="text-lg font-black text-amber-300">
                        {completedCount}/{partnerMissions.length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SECCIÓN D: CLIENTES - DIRECTORIO ESTILO ODOO (CAPTURA #10) ── */}
        {activeSection === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Base de datos oficial de clientes e instituciones de SERAM SRL sincronizada con el flujo del CRM.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingClient(null);
                  setClientFormData({
                    name: '',
                    type: 'Municipal / Público',
                    contactPerson: '',
                    contactPhone: '',
                    contactEmail: '',
                    location: 'La Paz, Bolivia',
                    notes: ''
                  });
                  setShowClientModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Cliente
              </button>
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 font-tech uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Nombre / Institución</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Correo electrónico</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Ubicación / País</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {clients.map(cl => (
                    <tr key={cl.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#00e03c]/15 border border-[#00e03c]/30 flex items-center justify-center text-[#00e03c] font-black text-[11px]">
                          {(cl.name || 'C')[0]}
                        </div>
                        <span>{cl.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{cl.contactPerson || 'Dirección'}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{cl.contactEmail || '-'}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{cl.contactPhone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                          {cl.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{cl.location || 'Bolivia'}</td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClient(cl);
                            setClientFormData({
                              name: cl.name || '',
                              type: cl.type || 'Municipal / Público',
                              contactPerson: cl.contactPerson || '',
                              contactPhone: cl.contactPhone || '',
                              contactEmail: cl.contactEmail || '',
                              location: cl.location || 'Bolivia',
                              notes: cl.notes || ''
                            });
                            setShowClientModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.15] text-slate-300 cursor-pointer"
                          title="Editar cliente"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(cl.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 cursor-pointer"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SECCIÓN E: DIRECTORIO B2B SEPREC (150 EMPRESAS DE BOLIVIA) ── */}
        {activeSection === 'seprec' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
              <input
                type="text"
                value={seprecSearch}
                onChange={e => setSeprecSearch(e.target.value)}
                placeholder="Filtrar empresas SEPREC por razón social, actividad o matrícula..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
              />
              <select
                value={seprecDept}
                onChange={e => setSeprecDept(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="all">Todos los Departamentos</option>
                <option value="LA PAZ">LA PAZ</option>
                <option value="SANTA CRUZ">SANTA CRUZ</option>
                <option value="COCHABAMBA">COCHABAMBA</option>
                <option value="ORURO">ORURO</option>
                <option value="POTOSI">POTOSÍ</option>
              </select>
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 font-tech uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="py-3 px-4">Razón Social / Matrícula</th>
                      <th className="py-3 px-4">Depto / Municipio</th>
                      <th className="py-3 px-4">Contacto</th>
                      <th className="py-3 px-4">Servicio Sugerido</th>
                      <th className="py-3 px-4 text-right">Incorporar al Flujo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {prospects
                      .filter(p => {
                        const q = seprecSearch.toLowerCase();
                        const matchQ =
                          !q ||
                          (p.razonSocial && p.razonSocial.toLowerCase().includes(q)) ||
                          (p.actividad && p.actividad.toLowerCase().includes(q));
                        const matchD = seprecDept === 'all' || p.departamento === seprecDept;
                        return matchQ && matchD;
                      })
                      .slice(0, 60)
                      .map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.03]">
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{p.razonSocial}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Matrícula: {p.matricula}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {p.departamento} · {p.municipio}
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                            {p.telefono} · {p.email}
                          </td>
                          <td className="py-3 px-4 text-amber-300 text-[11px]">{p.servicioInteres}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleImportSeprecToPipeline(p)}
                              className="px-3 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-[10px] hover:bg-white transition-colors cursor-pointer"
                            >
                              + Enviar a Flujo CRM
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SECCIÓN F: REPORTES Y PRONÓSTICO (CAPTURA #9) ── */}
        {activeSection === 'reporting' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] font-black text-slate-400 uppercase font-tech">Pipeline Bruto</span>
                <p className="text-xl font-black text-white mt-1">
                  {formatDualCurrency(crmMetrics.totalPipelineUsd, currencyMode).primary}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatDualCurrency(crmMetrics.totalPipelineUsd, currencyMode).secondary}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] font-black text-slate-400 uppercase font-tech">Ingreso Ponderado (Pronóstico)</span>
                <p className="text-xl font-black text-[#00e03c] mt-1">
                  {formatDualCurrency(crmMetrics.weightedUsd, currencyMode).primary}
                </p>
                <p className="text-[11px] text-slate-400">Según probabilidad por etapa</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] font-black text-slate-400 uppercase font-tech">Contratos Ganados</span>
                <p className="text-xl font-black text-amber-300 mt-1">
                  {formatDualCurrency(crmMetrics.wonUsd, currencyMode).primary}
                </p>
                <p className="text-[11px] text-slate-400">{crmMetrics.wonCount} oportunidades cerradas</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[10px] font-black text-slate-400 uppercase font-tech">Meritocracia Acumulada</span>
                <p className="text-xl font-black text-purple-300 mt-1">{crmMetrics.totalMeritXp} XP</p>
                <p className="text-[11px] text-slate-400">{crmMetrics.completedMissionsCount} evidencias validadas</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Distribución Financiera por Etapa del Embudo
              </h4>
              {ARM_STAGES.map(st => {
                const stLeads = filteredLeads.filter(l => l.etapa_pipeline === st.id);
                const stUsd = stLeads.reduce((s, l) => s + (Number(l.presupuesto_estimado_usd) || 0), 0);
                const pct = crmMetrics.totalPipelineUsd > 0 ? Math.round((stUsd / crmMetrics.totalPipelineUsd) * 100) : 0;
                return (
                  <div key={st.id} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-200">{st.label} ({stLeads.length})</span>
                      <span className="font-mono text-slate-300">
                        {formatDualCurrency(stUsd, currencyMode).primary} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className={`h-full ${st.barColor}`} style={{ width: `${Math.max(3, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECCIÓN F2: CALENDARIO ODOO INTEGRADO EN CRM ── */}
        {activeSection === 'calendar' && (
          <OdooCalendarModule currentSocio={currentSocio} compactMode />
        )}

        {/* ── SECCIÓN G: TIPOS DE ACTIVIDAD (CAPTURA #11 DE ODOO) ── */}
        {activeSection === 'activity_types' && (
          <div className="space-y-4">
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newActivityTypeForm.nombre.trim()) return;
                const updated = armService.saveActivityType(newActivityTypeForm);
                setActivityTypes(updated);
                setNewActivityTypeForm({
                  nombre: '',
                  resumen_predeterminado: '',
                  planeado_en_dias: 2,
                  categoria_mision: 'secundaria',
                  xp_recompensa: 60
                });
                triggerToast?.('Tipo de actividad registrado', 'success');
              }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs"
            >
              <input
                type="text"
                required
                value={newActivityTypeForm.nombre}
                onChange={e => setNewActivityTypeForm({ ...newActivityTypeForm, nombre: e.target.value })}
                placeholder="Nombre del tipo de actividad *"
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
              />
              <input
                type="text"
                value={newActivityTypeForm.resumen_predeterminado}
                onChange={e => setNewActivityTypeForm({ ...newActivityTypeForm, resumen_predeterminado: e.target.value })}
                placeholder="Resumen predeterminado"
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
              />
              <select
                value={newActivityTypeForm.categoria_mision}
                onChange={e => setNewActivityTypeForm({ ...newActivityTypeForm, categoria_mision: e.target.value })}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none"
              >
                <option value="flash">Misión Flash</option>
                <option value="secundaria">Misión Secundaria</option>
                <option value="grupal">Misión Grupal</option>
                <option value="personal">Misión Personal</option>
                <option value="especialidad">Misión de Especialidad</option>
              </select>
              <input
                type="number"
                value={newActivityTypeForm.xp_recompensa}
                onChange={e => setNewActivityTypeForm({ ...newActivityTypeForm, xp_recompensa: e.target.value })}
                placeholder="XP Mérito"
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer"
              >
                + Agregar Tipo
              </button>
            </form>

            {/* Tabla idéntica a Captura #11 de Odoo */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 font-tech uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Resumen predeterminado</th>
                    <th className="py-3 px-4">Planeado en</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Categoría SERAM / XP</th>
                    <th className="py-3 px-4">Usuario predeterminado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {activityTypes.map(t => {
                    const badge = MISSION_CATEGORY_BADGES[t.categoria_mision] || MISSION_CATEGORY_BADGES.secundaria;
                    return (
                      <tr key={t.id} className="hover:bg-white/[0.03]">
                        <td className="py-3 px-4 font-bold text-white">{t.nombre}</td>
                        <td className="py-3 px-4 text-slate-300">{t.resumen_predeterminado}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{t.planeado_en_dias} días</td>
                        <td className="py-3 px-4 text-slate-400">{t.tipo_regla}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold border ${badge.className}`}>
                            {badge.label} (+{t.xp_recompensa} XP)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{t.usuario_predeterminado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SECCIÓN H: CAPTURA RÁPIDA (TELEGRAM BOT & WEBHOOK GOOGLE FORMS) ── */}
        {activeSection === 'fast_capture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.09] space-y-4">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-[#00e03c]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Consola de Comando Rápido (Estilo Bot de Telegram)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Registra un prospecto en menos de 5 segundos usando el formato separado por barras verticales:
                <code className="block mt-1 p-2 rounded-lg bg-black/60 text-[#00e03c] font-mono text-[11px]">
                  /lead Empresa | Contacto | Teléfono | Servicio | MontoUSD
                </code>
              </p>
              <form onSubmit={handleTelegramCommandSubmit} className="space-y-2.5">
                <input
                  type="text"
                  value={telegramCommandInput}
                  onChange={e => setTelegramCommandInput(e.target.value)}
                  placeholder="/lead Constructora Andina | Ing. Luis Paz | +59171599000 | Licencia FNCA | 1200"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#00e03c]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
                >
                  Ejecutar Comando e Inyectar al Flujo
                </button>
              </form>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.09] space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Endpoint Webhook Seguro (Telegram & Google Forms)
                </h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                La Edge Function <code className="text-cyan-300">supabase/functions/arm-lead-webhook/index.ts</code> se encuentra estructurada con validación de token y sanitización contra XSS para recibir leads desde un Bot de Telegram o desde un Formulario de Google externo.
              </p>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-300 space-y-1">
                <p className="text-[#00e03c]">POST /functions/v1/arm-lead-webhook</p>
                <p>Header: x-seram-webhook-token: [SERAM_ARM_WEBHOOK_SECRET]</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. MODAL FICHA 360° DE OPORTUNIDAD + CHATTER LATERAL (CAPTURA #5 DE ODOO)
         ══════════════════════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedLead && (
            <div
              className="fixed inset-0 z-[9999] flex items-start justify-center p-2 sm:p-4 md:p-6 pt-4 sm:pt-6 bg-black/90 backdrop-blur-md overflow-y-auto"
              onClick={handleCloseLeadDetail}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-6xl bg-[#0a130b] border border-white/[0.14] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] sm:max-h-[90vh]"
            >
              {/* Barra Superior de Ficha Odoo: Breadcrumb + Smart Buttons + Botón Cerrar (X) Destacado */}
              <div className="px-4 sm:px-6 py-3 bg-[#060d07] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleCloseLeadDetail}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-[#00e03c]/20 text-[#00e03c] border border-white/10 hover:border-[#00e03c]/40 font-bold transition-all cursor-pointer"
                    title="Volver al Flujo Kanban de Oportunidades"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Flujo</span>
                  </button>
                  <span className="text-slate-600">/</span>
                  <span className="font-bold text-white truncate max-w-[200px] sm:max-w-md">
                    {selectedLead.titulo_oportunidad || selectedLead.empresa}
                  </span>
                </div>

                {/* Smart Buttons estilo Odoo (Captura #5) + Botón Cerrar (X) */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSheetTab('missions')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-[#00e03c]" />
                    <div className="text-left leading-none">
                      <span className="font-black text-white block">
                        {leadActivities.filter(a => String(a.lead_id) === String(selectedLead.id)).length}
                      </span>
                      <span className="text-[9.5px] text-slate-400">Misiones</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSheetTab('cadence')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <div className="text-left leading-none">
                      <span className="font-black text-white block">{selectedLead.contacto_actual || 0}/7</span>
                      <span className="text-[9.5px] text-slate-400">Cadencia 14D</span>
                    </div>
                  </button>

                  {/* BOTÓN (X) DE SALIDA EVIDENTE Y PRINCIPAL */}
                  <button
                    type="button"
                    onClick={handleCloseLeadDetail}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 hover:text-white font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95"
                    title="Cerrar ventana de cliente y volver al CRM (Esc)"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    <span className="font-extrabold tracking-wide">Cerrar (X)</span>
                    <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 text-[9px] font-mono bg-black/50 text-slate-300 rounded border border-white/15">Esc</kbd>
                  </button>
                </div>
              </div>

              {/* Barra de Acciones y Stepper de Etapas Odoo (Captura #5) */}
              <div className="px-4 sm:px-6 py-2.5 bg-[#0d180f] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleStageChange(selectedLead.id, 'ganado');
                      if (handleAddClient && !selectedLead.is_example) {
                        const alreadyInDir = clients.some(
                          c => c.name.toLowerCase() === (selectedLead.empresa || '').toLowerCase()
                        );
                        if (!alreadyInDir) {
                          await handleAddClient({
                            name: selectedLead.empresa || selectedLead.nombre,
                            type: 'Privado / Particular',
                            contactPerson: selectedLead.nombre,
                            contactPhone: selectedLead.telefono,
                            contactEmail: selectedLead.email,
                            location: selectedLead.ubicacion || 'La Paz, Bolivia',
                            notes: `Ganado en CRM: ${selectedLead.que_busca}`
                          });
                        }
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
                  >
                    Ganado
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStageChange(selectedLead.id, 'perdido')}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Perdido
                  </button>

                  <button
                    type="button"
                    onClick={e => handleOpenScheduleMission(selectedLead, e)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" /> + Asignar Misión
                  </button>

                  <a
                    href={armService.createWhatsAppUrl(
                      selectedLead.telefono,
                      `Estimado/a ${selectedLead.nombre.replace('(EJEMPLO) ', '')}, le escribimos de SERAM SRL sobre ${selectedLead.que_busca}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-[#25D366] font-bold text-xs flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" /> WhatsApp
                  </a>

                  {/* Botón de Salida Secundario en la Barra de Acciones */}
                  <button
                    type="button"
                    onClick={handleCloseLeadDetail}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/35 text-slate-300 hover:text-rose-300 font-bold text-xs transition-all cursor-pointer"
                    title="Cerrar ficha y volver al flujo (X)"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Cerrar</span>
                  </button>
                </div>

                {/* Stepper de Etapas Clickable a la Derecha */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {ARM_STAGES.filter(s => s.id !== 'perdido').map((st, idx) => {
                    const isCurrent = selectedLead.etapa_pipeline === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStageChange(selectedLead.id, st.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                            : 'bg-white/[0.04] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{st.label}</span>
                        {idx < 5 && <ChevronRight className="w-3 h-3 opacity-50" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cuerpo en 2 Columnas Odoo: Hoja Principal (7/12) + Chatter Lateral (5/12) */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
                {/* Columna Izquierda: Hoja de la Oportunidad */}
                <div className="lg:col-span-7 p-5 space-y-5 overflow-y-auto">
                  <div>
                    {selectedLead.is_example && (
                      <span className="inline-block mb-1 text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black">
                        REGISTRO DE (EJEMPLO) - DATOS DE DEMOSTRACIÓN
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {selectedLead.titulo_oportunidad || selectedLead.que_busca}
                    </h2>
                  </div>

                  {/* Ingreso Estimado (USD y Bs.) + Probabilidad (Captura #5) */}
                  <div className="flex flex-wrap items-baseline gap-6 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07]">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-tech block">Ingreso Estimado (Dual)</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black text-[#00e03c] font-mono">
                          USD {(Number(selectedLead.presupuesto_estimado_usd) || 0).toLocaleString()}
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-300">
                          / {Math.round((Number(selectedLead.presupuesto_estimado_usd) || 0) * USD_TO_BOB_RATE).toLocaleString()} Bs.
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-tech block">Probabilidad</span>
                      <span className="text-2xl font-black text-white font-mono">
                        al {selectedLead.probabilidad_cierre || 25}.00 %
                      </span>
                    </div>

                    <div className="ml-auto">
                      <span className="text-[10px] text-slate-400 uppercase font-tech block">Score Inbound</span>
                      <span className="text-lg font-black text-amber-300 font-mono">
                        {selectedLead.lead_score}/100 ({selectedLead.clasificacion_inbound})
                      </span>
                    </div>
                  </div>

                  {/* Campos en 2 Columnas como Odoo (Customer, Email, Phone | Salesperson, Priority, Tags) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2.5">
                      <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                        <span className="text-slate-400">Cliente / Organización</span>
                        <span className="font-bold text-white text-right">{selectedLead.empresa}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                        <span className="text-slate-400">Contacto</span>
                        <span className="font-bold text-slate-200">{selectedLead.nombre}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                        <span className="text-slate-400">Correo electrónico</span>
                        <span className="font-mono text-slate-200">{selectedLead.email || 'No registrado'}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                        <span className="text-slate-400">Teléfono</span>
                        <span className="font-mono text-slate-200">{selectedLead.telefono || 'No registrado'}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-1.5">
                        <span className="text-slate-400">Vendedor / Socio</span>
                        <select
                          value={selectedLead.socio_asignado}
                          onChange={async e => {
                            const updated = await armService.updateLead(selectedLead.id, { socio_asignado: e.target.value });
                            setLeads(prev => prev.map(l => String(l.id) === String(selectedLead.id) ? updated : l));
                            setSelectedLead(updated);
                          }}
                          className="bg-black/60 border border-white/10 rounded-lg px-2 py-0.5 text-white text-xs outline-none"
                        >
                          <option value="Ing. Diego Barrientos">Ing. Diego Barrientos</option>
                          <option value="Ing. Fernando Araujo">Ing. Fernando Araujo</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-1.5">
                        <span className="text-slate-400">Prioridad</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map(st => (
                            <Star
                              key={st}
                              onClick={e => handleTogglePriorityStars(selectedLead, st, e)}
                              className={`w-4 h-4 cursor-pointer ${
                                (selectedLead.prioridad_estrellas || 0) >= st
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-1.5">
                        <span className="text-slate-400">Origen</span>
                        <span className="text-slate-300">{selectedLead.origen}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-1.5">
                        <span className="text-slate-400">Etiquetas</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {(selectedLead.etiquetas || []).map((t, i) => (
                            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pestañas del Cuaderno Inferior (Notebook Odoo) */}
                  <div className="border-b border-white/[0.08] flex flex-wrap gap-2 pt-2">
                    {[
                      { id: 'missions', label: 'Misiones y Evidencias (XP)' },
                      { id: 'cadence', label: 'Seguimiento 14 Días (7 Contactos)' },
                      { id: 'notes', label: 'Notas Internas' },
                      { id: 'bant', label: 'Información Extra (BANT)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSheetTab(tab.id)}
                        className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors cursor-pointer ${
                          activeSheetTab === tab.id
                            ? 'bg-[#00e03c]/15 text-[#00e03c] border-b-2 border-[#00e03c]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Contenido Pestaña 1: Misiones y Evidencias */}
                  {activeSheetTab === 'missions' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          Actividades clave vinculadas a esta oportunidad (Misiones Flash, Grupales, Secundarias y de Especialidad).
                        </p>
                        <button
                          type="button"
                          onClick={e => handleOpenScheduleMission(selectedLead, e)}
                          className="px-3 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
                        >
                          + Programar Misión
                        </button>
                      </div>

                      {leadActivities.filter(a => String(a.lead_id) === String(selectedLead.id)).length === 0 ? (
                        <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                          No hay misiones registradas para esta oportunidad aún.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {leadActivities
                            .filter(a => String(a.lead_id) === String(selectedLead.id))
                            .map(act => {
                              const badge = MISSION_CATEGORY_BADGES[act.categoria_mision] || MISSION_CATEGORY_BADGES.secundaria;
                              return (
                                <div
                                  key={act.id}
                                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold border ${badge.className}`}>
                                      {badge.label} · +{act.xp_otorgado} XP
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                      Vence: {act.fecha_vencimiento}
                                    </span>
                                  </div>
                                  <p className="font-bold text-white">{act.titulo}</p>
                                  {act.resumen && <p className="text-slate-400 text-[11px]">{act.resumen}</p>}

                                  {act.estado === 'completada' ? (
                                    <div className="p-2 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/30 text-[11px] text-emerald-300 flex items-center justify-between">
                                      <span>Cumplida con evidencia: {act.evidencia_nota}</span>
                                      <span className="font-black">+{act.xp_otorgado} XP</span>
                                    </div>
                                  ) : (
                                    <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row gap-2">
                                      <input
                                        type="text"
                                        placeholder="Describe el resultado o pega enlace de evidencia verificable..."
                                        value={completingActivityId === act.id ? evidenceInput.nota : ''}
                                        onChange={e => {
                                          setCompletingActivityId(act.id);
                                          setEvidenceInput({ ...evidenceInput, nota: e.target.value });
                                        }}
                                        className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-white outline-none focus:border-[#00e03c]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleCompleteMissionWithEvidence(act)}
                                        className="px-3 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer shrink-0"
                                      >
                                        Validar y Acreditar XP
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contenido Pestaña 2: Cadencia 14 Días */}
                  {activeSheetTab === 'cadence' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-bold">
                          Contacto actual: {selectedLead.contacto_actual || 0} de 7 (Día {selectedLead.ciclo_dia_actual || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdvanceCadence(selectedLead)}
                          className="px-3 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
                        >
                          Registrar Avance de Contacto
                        </button>
                      </div>

                      <div className="space-y-2">
                        {armService.getLeadCadenceSteps(selectedLead).map(st => (
                          <div
                            key={st.step}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                              st.isCurrent
                                ? 'bg-[#00e03c]/10 border-[#00e03c]/40'
                                : st.isPast
                                ? 'bg-white/[0.02] border-white/[0.05] opacity-60'
                                : 'bg-white/[0.02] border-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">
                                Contacto {st.step} (Día {st.day} · {st.channel}): {st.subject}
                              </span>
                              <a
                                href={armService.createWhatsAppUrl(selectedLead.telefono, st.personalizedMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#25D366] font-bold hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" /> Enviar WhatsApp
                              </a>
                            </div>
                            <p className="text-[11px] text-slate-300 italic">&ldquo;{st.personalizedMessage}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contenido Pestaña 3: Notas Internas */}
                  {activeSheetTab === 'notes' && (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={selectedLead.notas_internas || ''}
                        onChange={async e => {
                          const val = e.target.value;
                          setSelectedLead({ ...selectedLead, notas_internas: val });
                          await armService.updateLead(selectedLead.id, { notas_internas: val });
                        }}
                        placeholder="Escribe antecedentes técnicos, requerimientos específicos o acuerdos..."
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-[#00e03c]"
                      />
                    </div>
                  )}

                  {/* Contenido Pestaña 4: BANT */}
                  {activeSheetTab === 'bant' && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">1. ¿Qué busca? (Necesidad Técnica)</span>
                        <span className="font-bold text-white">{selectedLead.que_busca}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">2. ¿Cuándo lo necesita? (Urgencia)</span>
                        <span className="font-bold text-white">{selectedLead.cuando_necesita}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">3. ¿Cuánto quiere invertir? (Presupuesto)</span>
                        <span className="font-bold text-[#00e03c]">{selectedLead.cuanto_invertir}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Chatter Estilo Odoo (Captura #5) */}
                <div className="lg:col-span-5 p-5 bg-[#070e08] flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setNewChatterType('mensaje_cliente')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            newChatterType === 'mensaje_cliente'
                              ? 'bg-[#00e03c] text-slate-950 font-black'
                              : 'bg-white/[0.05] text-slate-300'
                          }`}
                        >
                          Enviar mensaje
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewChatterType('nota_interna')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            newChatterType === 'nota_interna'
                              ? 'bg-[#00e03c] text-slate-950 font-black'
                              : 'bg-white/[0.05] text-slate-300'
                          }`}
                        >
                          Registrar nota
                        </button>
                        <button
                          type="button"
                          onClick={e => handleOpenScheduleMission(selectedLead, e)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/[0.05] text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                        >
                          Actividades
                        </button>
                      </div>
                    </div>

                    {/* Input de Chatter */}
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (!newChatterText.trim()) return;
                        armService.addChatterMessage(selectedLead.id, {
                          tipo: newChatterType,
                          autor: currentSocio?.name || 'Socio SERAM',
                          contenido: newChatterText.trim()
                        });
                        setChatterMessages(armService.getChatter(selectedLead.id));
                        setNewChatterText('');
                      }}
                      className="space-y-2"
                    >
                      <textarea
                        rows={2}
                        value={newChatterText}
                        onChange={e => setNewChatterText(e.target.value)}
                        placeholder="Escribe una nota en el historial o registra acuerdo con el cliente..."
                        className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#00e03c]"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
                        >
                          Publicar en Chatter
                        </button>
                      </div>
                    </form>

                    {/* Feed Cronológico del Chatter */}
                    <div className="space-y-2.5 overflow-y-auto max-h-[390px] pr-1">
                      {chatterMessages.map((msg, idx) => (
                        <div key={msg.id || idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-bold text-white">{msg.autor}</span>
                            <span className="font-mono">
                              {new Date(msg.created_at).toLocaleDateString('es-BO')} ·{' '}
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed">{msg.contenido}</p>
                          {msg.xp_ganado > 0 && (
                            <span className="inline-block text-[9.5px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                              +{msg.xp_ganado} XP Acreditados
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* ══════════════════════════════════════════════════════════════════════════
          5. MODAL PARA PROGRAMAR NUEVA MISIÓN / ACTIVIDAD EN EL LEAD
         ══════════════════════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {scheduleModalLead && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0c160e] border border-[#00e03c]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00e03c]" /> Programar Actividad / Misión Clave
                </h3>
                <button
                  type="button"
                  onClick={() => setScheduleModalLead(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMissionSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Categoría de Misión</label>
                    <select
                      value={newMissionForm.categoria_mision}
                      onChange={e => {
                        const cat = e.target.value;
                        const xp = MISSION_CATEGORY_BADGES[cat]?.xpBase || 50;
                        setNewMissionForm({ ...newMissionForm, categoria_mision: cat, xp_otorgado: xp });
                      }}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="flash">Misión Flash (+75 XP)</option>
                      <option value="grupal">Misión Grupal (+140 XP)</option>
                      <option value="especialidad">Misión de Especialidad (+120 XP)</option>
                      <option value="secundaria">Misión Secundaria (+50 XP)</option>
                      <option value="personal">Misión Personal (+40 XP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Responsable</label>
                    <select
                      value={newMissionForm.responsable}
                      onChange={e => setNewMissionForm({ ...newMissionForm, responsable: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="Ing. Diego Barrientos">Ing. Diego Barrientos</option>
                      <option value="Ing. Fernando Araujo">Ing. Fernando Araujo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Título de la Misión / Actividad *</label>
                  <input
                    type="text"
                    required
                    value={newMissionForm.titulo}
                    onChange={e => setNewMissionForm({ ...newMissionForm, titulo: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Resumen / Entregable Esperado</label>
                  <textarea
                    rows={2}
                    value={newMissionForm.resumen}
                    onChange={e => setNewMissionForm({ ...newMissionForm, resumen: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Fecha Límite</label>
                    <input
                      type="date"
                      value={newMissionForm.fecha_vencimiento}
                      onChange={e => setNewMissionForm({ ...newMissionForm, fecha_vencimiento: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Recompensa Mérito (XP)</label>
                    <input
                      type="number"
                      value={newMissionForm.xp_otorgado}
                      onChange={e => setNewMissionForm({ ...newMissionForm, xp_otorgado: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newMissionForm.syncToGlobalActivities}
                    onChange={e => setNewMissionForm({ ...newMissionForm, syncToGlobalActivities: e.target.checked })}
                  />
                  <span>Sincronizar también con el tablero general de Actividades y Tareas de SERAM</span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setScheduleModalLead(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer"
                  >
                    Programar Misión
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* ══════════════════════════════════════════════════════════════════════════
          6. MODAL PARA CREAR / EDITAR CLIENTE EN EL DIRECTORIO REAL
         ══════════════════════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showClientModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0c160e] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white">
                  {editingClient ? 'Editar Cliente del Directorio' : 'Registrar Nuevo Cliente en Base de Datos'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDirectoryClient} className="space-y-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Institución o Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={clientFormData.name}
                    onChange={e => setClientFormData({ ...clientFormData, name: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Sector</label>
                    <select
                      value={clientFormData.type}
                      onChange={e => setClientFormData({ ...clientFormData, type: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="Municipal / Público">Municipal / Público</option>
                      <option value="Minería / Cooperativa">Minería / Cooperativa</option>
                      <option value="Industrial / Fabril">Industrial / Fabril</option>
                      <option value="Privado / Particular">Privado / Particular</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Persona de Contacto</label>
                    <input
                      type="text"
                      value={clientFormData.contactPerson}
                      onChange={e => setClientFormData({ ...clientFormData, contactPerson: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={clientFormData.contactPhone}
                      onChange={e => setClientFormData({ ...clientFormData, contactPhone: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      value={clientFormData.contactEmail}
                      onChange={e => setClientFormData({ ...clientFormData, contactEmail: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Requerimiento / Antecedentes</label>
                  <textarea
                    rows={2}
                    value={clientFormData.notes}
                    onChange={e => setClientFormData({ ...clientFormData, notes: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer"
                  >
                    Guardar y Sincronizar con Flujo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
}

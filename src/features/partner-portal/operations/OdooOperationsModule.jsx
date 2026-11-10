/**
 * @file OdooOperationsModule.jsx
 * @description Suite de Operaciones & Proyectos Ambientales bajo arquitectura Odoo ERP para SERAM.
 * Incluye:
 * - Sub-Navbar superior Odoo: Operaciones | Proyectos | Propuestas Municipales | Catálogo B2B | Especialistas.
 * - Buscador con filtros y selector de vistas (Kanban de Fases Técnicas, Lista, Métricas).
 * - Drag & Drop interactivo entre etapas de ingeniería ambiental y SIG.
 * - Ficha 360° de Proyecto con Smart Buttons (Cliente CRM, Finanzas UN, Horas, Drive/PDF) y Chatter Lateral.
 * - Cero emoticones, 100% en español, paleta Neuform de SERAM (Verde #00e03c, Oro #c9a84c y Cian #06b6d4).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Search, Filter, LayoutGrid, List, BarChart3,
  Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
  X, Check, Building2, User, Users, DollarSign, FileText, ExternalLink,
  ChevronRight, ChevronDown, Edit2, Trash2, MapPin, Link2, Copy,
  Download, UploadCloud, ShieldCheck, Zap, MessageSquare, Send
} from 'lucide-react';
import MunicipalProposalsView from '../MunicipalProposalsView';

// Fases Operativas estándar de Ingeniería Ambiental y SIG
const OPERATION_STAGES = [
  { id: 'fase1', label: '1. Planificación & Diseño', min: 0, max: 25, color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { id: 'fase2', label: '2. Trabajo de Campo & Muestreo', min: 26, max: 50, color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'fase3', label: '3. Gabinete & Modelación SIG', min: 51, max: 75, color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
  { id: 'fase4', label: '4. Revisión Técnica & Trámite', min: 76, max: 99, color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
  { id: 'fase5', label: '5. Concluido & Entregado', min: 100, max: 100, color: 'border-[#00e03c]/40 text-[#00e03c] bg-[#00e03c]/10' },
];

export default function OdooOperationsModule({
  activeServices = [],
  registeredEngineers = [],
  handlers = {},
  publicServices = [],
  specialists = [],
  municipalProposals = [],
  onNavigate
}) {
  const {
    handleAddProject,
    handleUpdateProjectProgress,
    handleDeleteProject,
    handleEditProject,
    handleConcludeProject,
    triggerToast,
    handleAddPublicService,
    handleEditPublicService,
    handleDeletePublicService,
    handleAddSpecialist,
    handleEditSpecialist,
    handleDeleteSpecialist
  } = handlers;

  // Estado de navegación contextual Odoo
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'municipal' | 'catalog' | 'specialists'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list' | 'metrics'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Drag & drop
  const [draggedProjectId, setDraggedProjectId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);

  // Ficha 360° de Proyecto y Chatter
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectChatterText, setProjectChatterText] = useState('');
  const [projectChatterNotes, setProjectChatterNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('seram_project_chatters');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal para Nuevo Proyecto
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    client: '',
    type: 'Estudio de Evaluación de Impacto Ambiental (EEIA)',
    code: '',
    location: 'La Paz, Bolivia',
    lead: registeredEngineers[0]?.name || 'Ing. Diego Barrientos',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
    involved: [],
    budget: '',
    labCosts: '',
    subcontractorCosts: '',
    taxRegime: 'Régimen General',
    description: '',
    pdfUrl: '',
    pdfName: ''
  });

  // Escuchar tecla Escape para cerrar modales
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedProject) setSelectedProject(null);
        if (showNewProjectModal) setShowNewProjectModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, showNewProjectModal]);

  // Cálculos financieros precisos según régimen tributario de SERAM
  const calculateFinancials = (p) => {
    const budget = Number(p.budget) || 0;
    const labCosts = Number(p.labCosts) || 0;
    const subcontractorCosts = Number(p.subcontractorCosts) || 0;
    const isSiete = p.taxRegime === 'Régimen SIETE (5%)';
    const taxes = isSiete ? budget * 0.05 : budget * 0.16; // SIETE 5%; General 13% IVA + 3% IT = 16%
    const UN = Math.max(0, budget - taxes - labCosts - subcontractorCosts);
    const margin = budget > 0 ? Math.round((UN / budget) * 100) : 0;
    return { taxes, UN, margin };
  };

  // Filtrado de proyectos
  const filteredProjects = useMemo(() => {
    return (activeServices || []).filter(p => {
      const isCompleted = (Number(p.progress) || 0) >= 100;
      if (statusFilter === 'active' && isCompleted) return false;
      if (statusFilter === 'completed' && !isCompleted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (p.client && p.client.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.type && p.type.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.lead && p.lead.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [activeServices, statusFilter, searchQuery]);

  // Agrupación en columnas Kanban por fase porcentual
  const kanbanColumns = useMemo(() => {
    const cols = {
      fase1: [],
      fase2: [],
      fase3: [],
      fase4: [],
      fase5: []
    };

    filteredProjects.forEach(p => {
      const prog = Number(p.progress) || 0;
      if (prog <= 25) cols.fase1.push(p);
      else if (prog <= 50) cols.fase2.push(p);
      else if (prog <= 75) cols.fase3.push(p);
      else if (prog < 100) cols.fase4.push(p);
      else cols.fase5.push(p);
    });

    return cols;
  }, [filteredProjects]);

  // Métricas generales operativas
  const metrics = useMemo(() => {
    const total = (activeServices || []).length;
    const completed = (activeServices || []).filter(p => (Number(p.progress) || 0) >= 100).length;
    const inProgress = total - completed;
    const totalBudget = (activeServices || []).reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    const totalUN = (activeServices || []).reduce((sum, p) => sum + calculateFinancials(p).UN, 0);

    return { total, completed, inProgress, totalBudget, totalUN };
  }, [activeServices]);

  // Handlers Drag & Drop
  const handleDragStart = (e, projectId) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnStage = async (e, stageId) => {
    e.preventDefault();
    setDragOverStageId(null);
    if (!draggedProjectId) return;

    const proj = activeServices.find(p => String(p.id) === String(draggedProjectId));
    setDraggedProjectId(null);
    if (!proj) return;

    const targetStage = OPERATION_STAGES.find(s => s.id === stageId);
    if (!targetStage) return;

    // Asignar el porcentaje medio de la fase destino
    let newProgress = 0;
    if (stageId === 'fase1') newProgress = 20;
    else if (stageId === 'fase2') newProgress = 45;
    else if (stageId === 'fase3') newProgress = 70;
    else if (stageId === 'fase4') newProgress = 90;
    else if (stageId === 'fase5') newProgress = 100;

    if (handleUpdateProjectProgress) {
      await handleUpdateProjectProgress(proj.id, newProgress);
      triggerToast?.(`Proyecto ${proj.code || proj.client} movido a ${targetStage.label} (${newProgress}%)`, 'success');
    }
  };

  // Guardar nuevo proyecto
  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!newProjectForm.client.trim() || !newProjectForm.code.trim()) {
      triggerToast?.('Cliente y código de proyecto son requeridos', 'error');
      return;
    }

    if (handleAddProject) {
      await handleAddProject({
        ...newProjectForm,
        budget: Number(newProjectForm.budget) || 0,
        labCosts: Number(newProjectForm.labCosts) || 0,
        subcontractorCosts: Number(newProjectForm.subcontractorCosts) || 0,
        progress: 0
      });
      setShowNewProjectModal(false);
      setNewProjectForm({
        client: '',
        type: 'Estudio de Evaluación de Impacto Ambiental (EEIA)',
        code: '',
        location: 'La Paz, Bolivia',
        lead: registeredEngineers[0]?.name || 'Ing. Diego Barrientos',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
        involved: [],
        budget: '',
        labCosts: '',
        subcontractorCosts: '',
        taxRegime: 'Régimen General',
        description: '',
        pdfUrl: '',
        pdfName: ''
      });
      triggerToast?.('Proyecto técnico registrado en el ecosistema', 'success');
    }
  };

  // Publicar nota en Chatter de proyecto
  const handleAddProjectChatter = (e) => {
    e.preventDefault();
    if (!selectedProject || !projectChatterText.trim()) return;

    const pId = String(selectedProject.id);
    const existing = projectChatterNotes[pId] || [];
    const newEntry = {
      id: Date.now(),
      author: selectedProject.lead || 'Ing. Diego Barrientos',
      date: new Date().toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' }),
      text: projectChatterText.trim()
    };

    const updated = { ...projectChatterNotes, [pId]: [newEntry, ...existing] };
    setProjectChatterNotes(updated);
    try {
      localStorage.setItem('seram_project_chatters', JSON.stringify(updated));
    } catch {
      // Ignorar error de cuota local
    }
    setProjectChatterText('');
    triggerToast?.('Nota técnica publicada en el Chatter de proyecto', 'success');
  };

  return (
    <div className="space-y-4">
      {/* ══════════════════════════════════════════════════════════════════════════
          1. SUB-NAVBAR SUPERIOR ESTILO ODOO ERP (OPERACIONES AMBIENTALES & SIG)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-[#09120b] border border-white/[0.1] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl select-none">
        {/* Izquierda: Selector de Pestañas Principales Odoo */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-xs font-black text-[#00e03c] uppercase tracking-wider px-2 border-r border-white/10 hidden sm:inline">
            Operaciones
          </span>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Proyectos Activos ({activeServices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('municipal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'municipal'
                ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Propuestas Municipales ({(municipalProposals || []).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Catálogo Web B2B ({(publicServices || []).length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specialists')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'specialists'
                ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Especialistas ({(specialists || []).length})
          </button>
        </div>

        {/* Derecha: Botón Nuevo Proyecto + Conmutador de Vistas */}
        <div className="flex items-center gap-2">
          {activeTab === 'projects' && (
            <>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#00e03c] hover:bg-white text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nuevo Proyecto</span>
              </button>

              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'kanban'
                      ? 'bg-[#00e03c] text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista Kanban de Fases Técnicas"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#00e03c] text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Vista Lista Odoo"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('metrics')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'metrics'
                      ? 'bg-[#00e03c] text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Métricas Operativas"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. FILTROS Y BÚSQUEDA RÁPIDA DE PROYECTOS (ESTILO ODOO)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'projects' && viewMode !== 'metrics' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-black/30 border border-white/[0.06] p-3 rounded-2xl">
          <div className="flex-1 max-w-md flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar proyecto por cliente, código, tipo o ubicación..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
            />
            {searchQuery && (
              <X className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-mono">Estado:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({activeServices.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/35' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              En Curso ({metrics.inProgress})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Concluidos ({metrics.completed})
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          3. CONTENIDO SEGÚN PESTAÑA Y VISTA SELECCIONADA
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'projects' && viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 select-none pt-1">
          {OPERATION_STAGES.map(stage => {
            const stageProjects = kanbanColumns[stage.id] || [];
            const isDragOver = dragOverStageId === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={e => {
                  e.preventDefault();
                  if (dragOverStageId !== stage.id) setDragOverStageId(stage.id);
                }}
                onDrop={e => handleDropOnStage(e, stage.id)}
                className={`w-[305px] sm:w-[325px] flex-shrink-0 flex flex-col rounded-2xl bg-[#0c160e]/90 border transition-all ${
                  isDragOver
                    ? 'border-[#00e03c] bg-[#00e03c]/[0.05]'
                    : 'border-white/[0.08]'
                }`}
              >
                {/* Cabecera de Columna Odoo */}
                <div className="p-3.5 border-b border-white/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{stage.label}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.08] text-slate-300">
                      {stageProjects.length}
                    </span>
                  </div>
                </div>

                {/* Lista de Tarjetas en Columna */}
                <div className="p-2.5 space-y-2.5 overflow-y-auto max-h-[68vh]">
                  {stageProjects.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-[11px] font-mono border border-dashed border-white/[0.06] rounded-xl">
                      Arrastra proyectos aquí
                    </div>
                  ) : (
                    stageProjects.map(proj => {
                      const financials = calculateFinancials(proj);
                      const isDone = (Number(proj.progress) || 0) >= 100;

                      return (
                        <div
                          key={proj.id}
                          draggable
                          onDragStart={e => handleDragStart(e, proj.id)}
                          onClick={() => setSelectedProject(proj)}
                          className={`p-3.5 rounded-xl bg-white/[0.035] hover:bg-white/[0.07] border transition-all duration-150 cursor-pointer shadow-md group space-y-2.5 ${
                            isDone
                              ? 'border-l-4 border-l-[#00e03c] border-white/[0.09]'
                              : 'border-l-4 border-l-cyan-400 border-white/[0.09]'
                          }`}
                        >
                          {/* Código & Tipo */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded">
                              {proj.code || 'SERAM-PRJ'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {proj.progress || 0}%
                            </span>
                          </div>

                          {/* Cliente / Título */}
                          <div>
                            <h4 className="text-xs font-black text-white group-hover:text-[#00e03c] transition-colors leading-snug">
                              {proj.client}
                            </h4>
                            <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-0.5">
                              {proj.type}
                            </p>
                          </div>

                          {/* Barra de Progreso Odoo */}
                          <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isDone ? 'bg-[#00e03c]' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, proj.progress || 0))}%` }}
                            />
                          </div>

                          {/* Fila Financiera y Datos */}
                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
                            <div>
                              <span className="text-slate-500 uppercase block font-tech">Presupuesto</span>
                              <span className="font-mono font-bold text-white">
                                Bs. {(Number(proj.budget) || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-slate-500 uppercase block font-tech">Utilidad Neta</span>
                              <span className="font-mono font-bold text-amber-300">
                                Bs. {financials.UN.toLocaleString()} ({financials.margin}%)
                              </span>
                            </div>
                          </div>

                          {/* Fila Inferior: Especialista Líder y Documento */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-black text-[9px] text-[#00e03c]">
                                {proj.lead ? proj.lead.replace('Ing. ', '').split(' ').map(n => n[0]).join('').slice(0, 2) : 'DB'}
                              </span>
                              <span className="truncate max-w-[120px]">{proj.lead || 'Diego Barrientos'}</span>
                            </div>

                            {proj.pdfUrl && (
                              <a
                                href={proj.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                                title="Abrir Documento Técnico / Drive"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VISTA LISTA ODOO ── */}
      {activeTab === 'projects' && viewMode === 'list' && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 font-tech uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Cliente / Organización</th>
                  <th className="py-3 px-4">Tipo de Servicio</th>
                  <th className="py-3 px-4">Avance</th>
                  <th className="py-3 px-4 text-right">Presupuesto</th>
                  <th className="py-3 px-4 text-right">Utilidad Neta</th>
                  <th className="py-3 px-4">Ingeniero Líder</th>
                  <th className="py-3 px-4">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredProjects.map(proj => {
                  const fin = calculateFinancials(proj);
                  const isDone = (Number(proj.progress) || 0) >= 100;

                  return (
                    <tr
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">{proj.code || 'PRJ'}</td>
                      <td className="py-3 px-4 font-bold text-white">{proj.client}</td>
                      <td className="py-3 px-4 text-slate-300">{proj.type}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-white/[0.1] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isDone ? 'bg-[#00e03c]' : 'bg-cyan-400'}`}
                              style={{ width: `${Math.min(100, Math.max(0, proj.progress || 0))}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-300">{proj.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        Bs. {(Number(proj.budget) || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                        Bs. {fin.UN.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{proj.lead}</td>
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        {proj.pdfUrl ? (
                          <a
                            href={proj.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" /> Drive
                          </a>
                        ) : (
                          <span className="text-slate-500 font-mono text-[10px]">Sin adjunto</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VISTA MÉTRICAS OPERATIVAS ── */}
      {activeTab === 'projects' && viewMode === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Proyectos</span>
            <p className="text-2xl font-black text-white">{metrics.total}</p>
            <p className="text-[11px] text-slate-400">{metrics.completed} concluidos exitosamente</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">En Ejecución</span>
            <p className="text-2xl font-black text-cyan-300">{metrics.inProgress}</p>
            <p className="text-[11px] text-slate-400">Estudios activos con levantamiento o modelación</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00e03c]">Facturación Cartera</span>
            <p className="text-2xl font-black text-[#00e03c] font-mono">Bs. {metrics.totalBudget.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400">Volumen contractual total</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Utilidad Neta Estimada</span>
            <p className="text-2xl font-black text-amber-300 font-mono">Bs. {metrics.totalUN.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400">Descontando impuestos, laboratorio y contratistas</p>
          </div>
        </div>
      )}

      {/* ── PESTAÑA: PROPUESTAS MUNICIPALES ── */}
      {activeTab === 'municipal' && (
        <div className="space-y-4">
          <MunicipalProposalsView
            proposals={municipalProposals}
            registeredEngineers={registeredEngineers}
            onAddProposal={handlers.handleAddMunicipalProposal}
            onEditProposal={handlers.handleEditMunicipalProposal}
            onDeleteProposal={handlers.handleDeleteMunicipalProposal}
          />
        </div>
      )}

      {/* ── PESTAÑA: CATÁLOGO WEB B2B ── */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Catálogo de Servicios Públicos Ambientales (Portal Web B2B)
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(publicServices || []).map(serv => (
                <div key={serv.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                    {serv.category || 'Consultoría'}
                  </span>
                  <h4 className="text-sm font-black text-white">{serv.title}</h4>
                  <p className="text-xs text-slate-400">{serv.shortDesc || serv.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PESTAÑA: ESPECIALISTAS ── */}
      {activeTab === 'specialists' && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/[0.08] pb-3">
            Plantel Técnico de Ingenieros y Consultores Especialistas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(specialists || []).map(spec => (
              <div key={spec.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00e03c]/15 text-[#00e03c] font-black flex items-center justify-center text-sm border border-[#00e03c]/30">
                    {spec.name ? spec.name.slice(0, 2).toUpperCase() : 'ES'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{spec.name}</h4>
                    <p className="text-[10px] text-slate-400">{spec.role || 'Especialista'}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">{spec.specialty || spec.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          4. MODAL FICHA 360° DE PROYECTO + CHATTER LATERAL (ESTILO ODOO ERP)
         ══════════════════════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedProject && (
            <div
              className="fixed inset-0 z-[9999] flex items-start justify-center p-2 sm:p-4 md:p-6 pt-4 sm:pt-6 bg-black/90 backdrop-blur-md overflow-y-auto"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 15 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-6xl bg-[#0a130b] border border-white/[0.14] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] sm:max-h-[90vh]"
              >
                {/* Barra Superior Odoo: Breadcrumb + Smart Buttons + Botón Cerrar (X) */}
                <div className="px-4 sm:px-6 py-3 bg-[#060d07] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedProject(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-[#00e03c]/20 text-[#00e03c] border border-white/10 hover:border-[#00e03c]/40 font-bold transition-all cursor-pointer"
                      title="Volver a la vista de proyectos"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Proyectos</span>
                    </button>
                    <span className="text-slate-600">/</span>
                    <span className="font-mono font-bold text-cyan-300">{selectedProject.code}</span>
                    <span className="text-slate-600">/</span>
                    <span className="font-bold text-white truncate max-w-[200px] sm:max-w-md">
                      {selectedProject.client}
                    </span>
                  </div>

                  {/* Smart Buttons Odoo */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón Inteligente: Cliente en CRM */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProject(null);
                        onNavigate?.('clients');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#00e03c]/15 border border-white/[0.08] hover:border-[#00e03c]/40 text-xs flex items-center gap-2 cursor-pointer transition-colors"
                      title="Saltar a la ficha del cliente en el CRM"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#00e03c]" />
                      <div className="text-left leading-none">
                        <span className="font-black text-white block">CRM Clientes</span>
                        <span className="text-[9.5px] text-slate-400">Ver Ficha</span>
                      </div>
                    </button>

                    {/* Botón Inteligente: Horas en Time Tracker */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProject(null);
                        onNavigate?.('timetracker');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-amber-400/15 border border-white/[0.08] hover:border-amber-400/40 text-xs flex items-center gap-2 cursor-pointer transition-colors"
                      title="Abrir Time Tracker para este proyecto"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <div className="text-left leading-none">
                        <span className="font-black text-white block">Time Tracker</span>
                        <span className="text-[9.5px] text-slate-400">Auditar Horas</span>
                      </div>
                    </button>

                    {/* BOTÓN (X) DE SALIDA EVIDENTE */}
                    <button
                      type="button"
                      onClick={() => setSelectedProject(null)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 hover:text-white font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95"
                      title="Cerrar ficha de proyecto (Esc)"
                    >
                      <X className="w-4 h-4 stroke-[3]" />
                      <span className="font-extrabold tracking-wide">Cerrar (X)</span>
                      <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 text-[9px] font-mono bg-black/50 text-slate-300 rounded border border-white/15">Esc</kbd>
                    </button>
                  </div>
                </div>

                {/* Barra de Acciones y Etapas */}
                <div className="px-4 sm:px-6 py-2.5 bg-[#0d180f] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botón Concluir Proyecto */}
                    {(Number(selectedProject.progress) || 0) < 100 ? (
                      <button
                        type="button"
                        onClick={async () => {
                          if (handleConcludeProject) {
                            await handleConcludeProject(selectedProject.id);
                            setSelectedProject({ ...selectedProject, progress: 100 });
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Concluir al 100%
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-[#00e03c]/20 text-[#00e03c] font-black text-xs border border-[#00e03c]/35 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Proyecto Entregado
                      </span>
                    )}

                    {selectedProject.pdfUrl && (
                      <a
                        href={selectedProject.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 font-bold text-xs flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Abrir en Google Drive
                      </a>
                    )}
                  </div>

                  {/* Stepper de Fases Técnicas */}
                  <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                    {OPERATION_STAGES.map((st, idx) => {
                      const prog = Number(selectedProject.progress) || 0;
                      const isCurrent = prog >= st.min && prog <= st.max;

                      return (
                        <div
                          key={st.id}
                          className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-[#00e03c] text-slate-950 font-black'
                              : 'bg-white/[0.04] text-slate-400'
                          }`}
                        >
                          <span>{st.label}</span>
                          {idx < 4 && <ChevronRight className="w-3 h-3 opacity-50" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cuerpo Odoo en 2 Columnas: Hoja Técnica (7/12) + Chatter Lateral (5/12) */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
                  {/* Columna Izquierda: Ficha Técnica */}
                  <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 overflow-y-auto">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        {selectedProject.code} · {selectedProject.taxRegime || 'Régimen General'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 leading-tight">
                        {selectedProject.client}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">{selectedProject.type}</p>
                    </div>

                    {/* Fila de Métricas Financieras de Proyecto */}
                    {(() => {
                      const f = calculateFinancials(selectedProject);
                      return (
                        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-tech block">Presupuesto</span>
                            <span className="text-base font-black text-white">
                              Bs. {(Number(selectedProject.budget) || 0).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-tech block">Costos Totales</span>
                            <span className="text-base font-bold text-slate-300">
                              Bs. {(f.taxes + (Number(selectedProject.labCosts) || 0) + (Number(selectedProject.subcontractorCosts) || 0)).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-tech block">Utilidad Neta (UN)</span>
                            <span className="text-base font-black text-amber-300">
                              Bs. {f.UN.toLocaleString()} ({f.margin}%)
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Slider Interactivo de Avance Físico */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.07] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">Progreso Físico del Estudio / Obra</span>
                        <span className="font-mono font-black text-[#00e03c] text-sm">
                          {selectedProject.progress || 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedProject.progress || 0}
                        onChange={async e => {
                          const val = Number(e.target.value);
                          setSelectedProject({ ...selectedProject, progress: val });
                          if (handleUpdateProjectProgress) {
                            await handleUpdateProjectProgress(selectedProject.id, val);
                          }
                        }}
                        className="w-full accent-[#00e03c] cursor-pointer"
                      />
                      <p className="text-[10.5px] text-slate-400">
                        Mueve el control para sincronizar el avance con las columnas Kanban del ecosistema
                      </p>
                    </div>

                    {/* Datos Clave de Ingeniería */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ingeniero Responsable:</span>
                        <span className="font-bold text-white mt-0.5 block">{selectedProject.lead || 'Ing. Diego Barrientos'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ubicación del Proyecto:</span>
                        <span className="font-bold text-white mt-0.5 block">{selectedProject.location || 'La Paz, Bolivia'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Fecha de Inicio:</span>
                        <span className="font-mono text-slate-200 mt-0.5 block">{selectedProject.startDate || 'No definida'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Fecha Límite / Entrega:</span>
                        <span className="font-mono text-slate-200 mt-0.5 block">{selectedProject.endDate || 'No definida'}</span>
                      </div>
                    </div>

                    {selectedProject.description && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Alcance Técnico:</span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                          {selectedProject.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Columna Derecha: Chatter Lateral de Proyecto (Estilo Odoo) */}
                  <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col bg-[#070e08]/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#00e03c]" />
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          Chatter de Proyecto & Minutas
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Trazabilidad Técnica</span>
                    </div>

                    {/* Formulario de Nueva Nota */}
                    <form onSubmit={handleAddProjectChatter} className="space-y-2">
                      <textarea
                        rows={3}
                        value={projectChatterText}
                        onChange={e => setProjectChatterText(e.target.value)}
                        placeholder="Escribe un avance técnico, acuerdo de campo o minuta..."
                        className="w-full bg-black/60 border border-white/15 focus:border-[#00e03c] rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!projectChatterText.trim()}
                        className="w-full py-2 rounded-xl bg-[#00e03c] disabled:opacity-50 text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Registrar en Chatter
                      </button>
                    </form>

                    {/* Historial de Notas del Chatter */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[40vh] pr-1">
                      {((projectChatterNotes[String(selectedProject.id)]) || []).length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center italic">
                          Sin minutas registradas aún para este proyecto.
                        </p>
                      ) : (
                        (projectChatterNotes[String(selectedProject.id)]).map(item => (
                          <div key={item.id} className="p-3 rounded-xl bg-black/40 border border-white/[0.07] space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-bold text-[#00e03c]">{item.author}</span>
                              <span className="font-mono">{item.date}</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{item.text}</p>
                          </div>
                        ))
                      )}
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
          5. MODAL PARA REGISTRAR NUEVO PROYECTO TÉCNICO
         ══════════════════════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showNewProjectModal && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
              onClick={() => setShowNewProjectModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#0c160e] border border-[#00e03c]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#00e03c]" /> Nuevo Proyecto Ambiental / SIG
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateProjectSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Cliente / Organización *</label>
                      <input
                        type="text"
                        required
                        value={newProjectForm.client}
                        onChange={e => setNewProjectForm({ ...newProjectForm, client: e.target.value })}
                        placeholder="Ej. Minera San Cristóbal / GAM Palos Blancos"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Código del Proyecto *</label>
                      <input
                        type="text"
                        required
                        value={newProjectForm.code}
                        onChange={e => setNewProjectForm({ ...newProjectForm, code: e.target.value })}
                        placeholder="Ej. SERAM-EEIA-2026-04"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-cyan-300 font-mono outline-none focus:border-[#00e03c]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Tipo de Servicio</label>
                      <select
                        value={newProjectForm.type}
                        onChange={e => setNewProjectForm({ ...newProjectForm, type: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        <option value="Estudio de Evaluación de Impacto Ambiental (EEIA)">EEIA (Impacto Ambiental)</option>
                        <option value="Registro Ambiental Industrial (RAI)">RAI (Industrial)</option>
                        <option value="Monitoreo de Mercurio & Calidad Hídrica">Monitoreo de Mercurio / Agua</option>
                        <option value="Catastro & Cartografía SIG">Catastro & Cartografía SIG</option>
                        <option value="Plan de Cierre y Rehabilitación">Plan de Cierre</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Ingeniero Líder</label>
                      <select
                        value={newProjectForm.lead}
                        onChange={e => setNewProjectForm({ ...newProjectForm, lead: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        {registeredEngineers.map(eng => (
                          <option key={eng.email} value={eng.name}>{eng.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Presupuesto (Bs.)</label>
                      <input
                        type="number"
                        value={newProjectForm.budget}
                        onChange={e => setNewProjectForm({ ...newProjectForm, budget: e.target.value })}
                        placeholder="Ej. 35000"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Costos Lab (Bs.)</label>
                      <input
                        type="number"
                        value={newProjectForm.labCosts}
                        onChange={e => setNewProjectForm({ ...newProjectForm, labCosts: e.target.value })}
                        placeholder="Ej. 4000"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Régimen</label>
                      <select
                        value={newProjectForm.taxRegime}
                        onChange={e => setNewProjectForm({ ...newProjectForm, taxRegime: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        <option value="Régimen General">General (16%)</option>
                        <option value="Régimen SIETE (5%)">SIETE (5%)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Enlace a Google Drive del Proyecto (Opcional)</label>
                    <input
                      type="url"
                      value={newProjectForm.pdfUrl}
                      onChange={e => setNewProjectForm({ ...newProjectForm, pdfUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewProjectModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer"
                    >
                      Crear Proyecto
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

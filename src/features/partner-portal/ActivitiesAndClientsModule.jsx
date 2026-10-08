import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Clock, Plus, Filter, User, Building2,
  Calendar, AlertCircle, ArrowRight, Trash2, Edit2, Check,
  X, Search, Briefcase, FileText, ChevronDown, CheckCircle2,
  ListFilter, Sparkles, Phone, Mail, MapPin, ExternalLink,
  Layers, BarChart2, TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ── COMPONENTE TARJETA DE CRISTAL ──────────────────────────────────────────
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/[0.05] border border-white/[0.12] rounded-2xl shadow-lg backdrop-blur-md ${className}`}>
    {children}
  </div>
);

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

  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'table', 'clients', 'prospects', 'progress'
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

  // Form State Actividad
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actProjectId, setActProjectId] = useState('');
  const [actPartner, setActPartner] = useState(currentSocio?.name || 'Ing. Diego Barrientos');
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

  // Filtro de Actividades
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchPartner = partnerFilter === 'all' || act.assignedPartner === partnerFilter;
      const matchProject = projectFilter === 'all' || String(act.projectId) === String(projectFilter);
      const matchSearch =
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.description && act.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (act.projectTitle && act.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchPartner && matchProject && matchSearch;
    });
  }, [activities, partnerFilter, projectFilter, searchQuery]);

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
            onClick={() => setActiveTab('table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'table'
                ? 'bg-[#00e03c] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" /> Vista Tabla (Notion)
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
            className="px-4 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#00e03c]/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Registrar Actividad Clave
          </button>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.15] text-white font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Building2 className="w-4 h-4 text-purple-400" /> Inscribir Cliente
          </button>
        </div>
      </div>

      {/* ── BARRA DE FILTROS (Búsqueda, Socio, Proyecto) ── */}
      {(activeTab === 'kanban' || activeTab === 'table') && (
        <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar actividad o entregable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
            />
          </div>

          {/* Filtro por Socio */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Socio:</span>
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
            >
              <option value="all">Todos los Socios</option>
              {partnersList.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Proyecto */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Proyecto:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white max-w-[200px] truncate"
            >
              <option value="all">Todos los Proyectos</option>
              {activeServices.map((p) => (
                <option key={p.id} value={p.id}>{p.client || p.type}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── CONTENEDOR DE VISTAS CON CROSSFADE SIMULTÁNEO ── */}
      <div className="grid grid-cols-1 items-start relative min-h-[500px]">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="col-start-1 row-start-1 w-full"
          >
            {/* ── VISTA 1: TABLERO KANBAN (CENTRAL DE ACTIVIDADES) ── */}
            {activeTab === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colActivities = filteredActivities.filter((a) => a.status === col.id);
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

                        {/* Acciones Rápidas de Cambio de Estado y Edición */}
                        <div className="pt-1.5 flex items-center justify-between border-t border-white/[0.04]">
                          <div className="flex items-center gap-1">
                            {STATUS_COLUMNS.map((sc) => (
                              <button
                                key={sc.id}
                                title={`Mover a ${sc.label}`}
                                onClick={() => handleUpdateActivityStatus(act.id, sc.id)}
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
                              onClick={() => openEditActivity(act)}
                              className="p-1 rounded hover:bg-white/[0.1] text-slate-400 hover:text-white"
                              title="Editar actividad"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
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
      )}

      {/* ── VISTA 2: TABLA TIPO NOTION (LISTA DETALLADA) ── */}
      {activeTab === 'table' && (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.06] border-b border-white/[0.1] text-[10px] uppercase font-black tracking-wider text-slate-400">
                <tr>
                  <th className="p-3.5">Actividad Clave / Entregable</th>
                  <th className="p-3.5">Proyecto / Cliente</th>
                  <th className="p-3.5">Socio Asignado</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Prioridad</th>
                  <th className="p-3.5">Fecha Límite</th>
                  <th className="p-3.5">Horas</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500">
                      No se encontraron actividades con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3.5 font-bold text-white max-w-xs">
                        <div className="line-clamp-1">{act.title}</div>
                        {act.description && <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{act.description}</div>}
                      </td>
                      <td className="p-3.5 text-emerald-400 font-medium">
                        {act.projectTitle || 'General'}
                      </td>
                      <td className="p-3.5">
                        <span className="flex items-center gap-1.5 font-bold text-slate-300">
                          <User className="w-3 h-3 text-[#00e03c]" />
                          {act.assignedPartner}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={act.status}
                          onChange={(e) => handleUpdateActivityStatus(act.id, e.target.value)}
                          className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white/[0.08] border border-white/[0.12] text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white"
                        >
                          {STATUS_COLUMNS.map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${PRIORITY_STYLES[act.priority] || PRIORITY_STYLES.Media}`}>
                          {act.priority}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">
                        {act.dueDate || 'Sin fecha'}
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">
                        {act.actualHours > 0 ? `${act.actualHours}h / ` : ''}{act.estimatedHours || 0}h
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => openEditActivity(act)}
                          className="p-1 rounded hover:bg-white/[0.1] text-slate-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
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
    </div>
  );
}

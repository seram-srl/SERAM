import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Droplets, Mountain, Satellite,
  Search, Filter, Plus, Edit2, Trash2, Check, X,
  Clock, DollarSign, MapPin, UserCheck, Shield,
  FileText, CheckCircle2, ChevronRight, Layers,
  Activity, ExternalLink, Sparkles, Building2,
  Calendar, Award, BookOpen
} from 'lucide-react';

const AXIS_CONFIG = {
  mercurio: {
    label: 'Mercurio & Minería Aurífera',
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: AlertTriangle,
    gradient: 'from-amber-500/10 to-rose-500/5',
    accentBorder: 'hover:border-amber-500/40',
    accentText: 'text-amber-400'
  },
  riego: {
    label: 'Riego Tecnificado & Agua',
    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: Droplets,
    gradient: 'from-cyan-500/10 to-blue-500/5',
    accentBorder: 'hover:border-cyan-500/40',
    accentText: 'text-cyan-400'
  },
  cuencas: {
    label: 'Manejo de Cuencas (PMIC)',
    color: 'text-[#00e03c] bg-[#00e03c]/10 border-[#00e03c]/30',
    badgeBg: 'bg-[#00e03c]/20 text-[#00e03c] border-[#00e03c]/30',
    icon: Mountain,
    gradient: 'from-emerald-500/10 to-teal-500/5',
    accentBorder: 'hover:border-[#00e03c]/40',
    accentText: 'text-[#00e03c]'
  },
  teledeteccion: {
    label: 'Teledetección & Catastro Agrícola',
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Satellite,
    gradient: 'from-purple-500/10 to-indigo-500/5',
    accentBorder: 'hover:border-purple-500/40',
    accentText: 'text-purple-400'
  }
};

export default function MunicipalProposalsView({
  proposals = [],
  handlers = {},
  registeredEngineers = []
}) {
  const {
    handleAddMunicipalProposal,
    handleEditMunicipalProposal,
    handleDeleteMunicipalProposal
  } = handlers;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAxis, setSelectedAxis] = useState('all');
  const [selectedMuni, setSelectedMuni] = useState('all');
  const [selectedModalProposal, setSelectedModalProposal] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const defaultLead = registeredEngineers.find(e => e.name?.includes('Diego Barrientos'))?.name || 'Ing. Diego Barrientos';
  const [form, setForm] = useState({
    title: '',
    shortTitle: '',
    axis: 'mercurio',
    targetMunicipalities: 'Guanay, Mapiri, Palos Blancos',
    lead: defaultLead,
    leadRole: 'Especialista SIG & Monitoreo Ambiental - SERAM',
    problem: '',
    legalFramework: 'Ley 1333 de Medio Ambiente\nConvenio de Minamata\nLey 535 de Minería',
    methodology: '',
    deliverables: 'Informe Técnico de Línea Base\nGeodatabase y Mapas SIG\nPropuesta de Ley Municipal',
    budget: 65000,
    duration: '90 días calendario',
    priority: 'Alta Prioridad',
    status: 'Propuesta en Formulación'
  });

  // Extract all unique municipalities across proposals
  const allMunicipalities = useMemo(() => {
    const set = new Set();
    proposals.forEach(p => {
      (p.targetMunicipalities || []).forEach(m => set.add(m));
    });
    return Array.from(set);
  }, [proposals]);

  // Filtered proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.targetMunicipalities || []).some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAxis = selectedAxis === 'all' || p.axis === selectedAxis;

      const matchesMuni =
        selectedMuni === 'all' ||
        (p.targetMunicipalities || []).includes(selectedMuni);

      return matchesSearch && matchesAxis && matchesMuni;
    });
  }, [proposals, searchQuery, selectedAxis, selectedMuni]);

  const totalPortfolioValue = useMemo(() => {
    return proposals.reduce((acc, curr) => acc + (curr.budget || 0), 0);
  }, [proposals]);

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      shortTitle: p.shortTitle || p.title,
      axis: p.axis || 'mercurio',
      targetMunicipalities: (p.targetMunicipalities || []).join(', '),
      lead: p.lead || defaultLead,
      leadRole: p.leadRole || 'Especialista Técnico SERAM',
      problem: p.problem,
      legalFramework: Array.isArray(p.legalFramework) ? p.legalFramework.join('\n') : p.legalFramework,
      methodology: p.methodology,
      deliverables: Array.isArray(p.deliverables) ? p.deliverables.join('\n') : p.deliverables,
      budget: p.budget || 50000,
      duration: p.duration || '90 días calendario',
      priority: p.priority || 'Alta Prioridad',
      status: p.status || 'Propuesta en Formulación'
    });
    setIsCreating(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.problem || !form.methodology) return;

    const formattedPayload = {
      ...form,
      axisLabel: AXIS_CONFIG[form.axis]?.label || form.axis,
      targetMunicipalities: form.targetMunicipalities.split(',').map(s => s.trim()).filter(Boolean),
      legalFramework: typeof form.legalFramework === 'string'
        ? form.legalFramework.split('\n').map(s => s.trim()).filter(Boolean)
        : form.legalFramework,
      deliverables: typeof form.deliverables === 'string'
        ? form.deliverables.split('\n').map(s => s.trim()).filter(Boolean)
        : form.deliverables,
      budget: parseFloat(form.budget) || 0
    };

    if (editingId) {
      handleEditMunicipalProposal(editingId, formattedPayload);
      setEditingId(null);
    } else {
      handleAddMunicipalProposal(formattedPayload);
    }

    setIsCreating(false);
    setForm({
      title: '',
      shortTitle: '',
      axis: 'mercurio',
      targetMunicipalities: 'Guanay, Mapiri, Palos Blancos',
      lead: defaultLead,
      leadRole: 'Especialista SIG & Monitoreo Ambiental - SERAM',
      problem: '',
      legalFramework: '',
      methodology: '',
      deliverables: '',
      budget: 65000,
      duration: '90 días calendario',
      priority: 'Alta Prioridad',
      status: 'Propuesta en Formulación'
    });
  };

  const inputCls = "w-full text-xs px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c] transition-all";
  const selectCls = "w-full text-xs px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white";

  return (
    <div className="space-y-6">
      {/* ── HEADER HERO BANNER ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00e03c]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase bg-emerald-500/10 text-[#00e03c] border border-emerald-500/30">
                <Building2 className="w-3.5 h-3.5" />
                Gobiernos Autónomos Municipales de Bolivia
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Cuenca Amazónica / Yungas (Norte de La Paz)
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
              Banco de Propuestas Técnicas & Líneas Base Socioambientales
            </h2>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Propuestas de consultoría estratégica y blindaje técnico diseñadas para presentación ante concejales municipales.
              Abordan el impacto del mercurio por minería aurífera, resiliencia hídrica con riego tecnificado,
              planes de manejo de cuencas (PMIC) y auditoría predial con teledetección satelital.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.08]">
                <UserCheck className="w-4 h-4 text-[#00e03c]" />
                <span>Proyectista Líder:</span>
                <strong className="text-white font-black">Ing. Diego Barrientos</strong>
              </div>
              <div className="text-xs text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.08]">
                Cartera Activa: <strong className="text-emerald-400 font-black">{proposals.length} Proyectos</strong>
              </div>
              <div className="text-xs text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.08]">
                Presupuesto Global: <strong className="text-white font-black">Bs. {totalPortfolioValue.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => {
                setEditingId(null);
                setIsCreating(prev => !prev);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-[#00c935] hover:shadow-lg hover:shadow-[#00e03c]/20 transition-all duration-300 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {isCreating ? 'Cerrar Formulario' : '+ Nueva Propuesta Municipal'}
            </button>
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT FORM COLLAPSIBLE ──────────────────────────────── */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/[0.03] border border-white/[0.1] rounded-2xl p-6 space-y-5 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00e03c]" />
                  <h3 className="font-extrabold text-white text-sm">
                    {editingId ? 'Editar Propuesta Técnica Municipal' : 'Registrar Nueva Propuesta para Concejo Municipal'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Título Oficial del Proyecto</label>
                    <input
                      className={inputCls}
                      placeholder="Ej. Línea Base y Monitoreo de Mercurio..."
                      value={form.title}
                      onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Título Corto / Subtítulo</label>
                    <input
                      className={inputCls}
                      placeholder="Ej. Monitoreo de Mercurio & Minería"
                      value={form.shortTitle}
                      onChange={e => setForm(s => ({ ...s, shortTitle: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Eje Temático</label>
                    <select
                      className={selectCls}
                      value={form.axis}
                      onChange={e => setForm(s => ({ ...s, axis: e.target.value }))}
                    >
                      <option value="mercurio">Mercurio & Minería Aurífera</option>
                      <option value="riego">Riego Tecnificado & Agua</option>
                      <option value="cuencas">Manejo de Cuencas (PMIC)</option>
                      <option value="teledeteccion">Teledetección & Catastro Agrícola</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Municipios Objetivo (Separados por coma)</label>
                    <input
                      className={inputCls}
                      placeholder="Guanay, Mapiri, Palos Blancos"
                      value={form.targetMunicipalities}
                      onChange={e => setForm(s => ({ ...s, targetMunicipalities: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Proponente Técnico</label>
                    <select
                      className={selectCls}
                      value={form.lead}
                      onChange={e => setForm(s => ({ ...s, lead: e.target.value }))}
                    >
                      {registeredEngineers.map(e => (
                        <option key={e.name} value={e.name}>{e.name}</option>
                      ))}
                      {!registeredEngineers.some(e => e.name?.includes('Diego Barrientos')) && (
                        <option value="Ing. Diego Barrientos">Ing. Diego Barrientos (SERAM)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Problemática Socioambiental a Resolver</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Describe los impactos ecológicos, de salud pública o productivos que afectan al municipio..."
                    value={form.problem}
                    onChange={e => setForm(s => ({ ...s, problem: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Metodología Técnica & Tecnologías</label>
                    <textarea
                      rows={3}
                      className={inputCls}
                      placeholder="Ensayos AAS, Drones, Modelación EPANET, Teledetección..."
                      value={form.methodology}
                      onChange={e => setForm(s => ({ ...s, methodology: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Marco Legal Boliviano (Uno por línea)</label>
                    <textarea
                      rows={3}
                      className={inputCls}
                      placeholder="Ley 1333 de Medio Ambiente&#10;Convenio de Minamata..."
                      value={form.legalFramework}
                      onChange={e => setForm(s => ({ ...s, legalFramework: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Presupuesto Referencial (Bs.)</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="65000"
                      value={form.budget}
                      onChange={e => setForm(s => ({ ...s, budget: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Plazo de Ejecución</label>
                    <input
                      className={inputCls}
                      placeholder="90 días calendario"
                      value={form.duration}
                      onChange={e => setForm(s => ({ ...s, duration: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nivel de Prioridad</label>
                    <select
                      className={selectCls}
                      value={form.priority}
                      onChange={e => setForm(s => ({ ...s, priority: e.target.value }))}
                    >
                      <option value="Alta Prioridad">Alta Prioridad</option>
                      <option value="Media-Alta">Media-Alta</option>
                      <option value="Planificada">Planificada</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Entregables Formales para el Concejo (Uno por línea)</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Informe pericial de línea base&#10;Mapas temáticos en Geodatabase&#10;Anteproyecto de Ley Municipal..."
                    value={form.deliverables}
                    onChange={e => setForm(s => ({ ...s, deliverables: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.08]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#00e03c] text-slate-950 hover:bg-[#00c935] flex items-center gap-1.5 transition-all shadow-md shadow-[#00e03c]/20"
                  >
                    <Check className="w-4 h-4" />
                    {editingId ? 'Guardar Cambios' : 'Registrar Propuesta Municipal'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FILTERS AND SEARCH BAR ───────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full text-xs pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
            placeholder="Buscar por problemática, río o municipio..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Eje:</span>
          </div>
          <select
            className="text-xs px-3 py-1.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622]"
            value={selectedAxis}
            onChange={e => setSelectedAxis(e.target.value)}
          >
            <option value="all">Todos los Ejes ({proposals.length})</option>
            <option value="mercurio">Mercurio & Minería</option>
            <option value="riego">Riego Tecnificado</option>
            <option value="cuencas">Manejo de Cuencas</option>
            <option value="teledeteccion">Teledetección Agrícola</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Municipio:</span>
          </div>
          <select
            className="text-xs px-3 py-1.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622]"
            value={selectedMuni}
            onChange={e => setSelectedMuni(e.target.value)}
          >
            <option value="all">Todos ({allMunicipalities.length})</option>
            {allMunicipalities.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── PROPOSALS GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredProposals.map((p) => {
          const cfg = AXIS_CONFIG[p.axis] || AXIS_CONFIG.cuencas;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group relative bg-white/[0.03] border border-white/[0.08] ${cfg.accentBorder} rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-black/50 overflow-hidden`}
            >
              {/* Subtle gradient glow */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${cfg.gradient} rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity`} />

              <div className="relative z-10 space-y-4">
                {/* Top Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${cfg.badgeBg}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                      {p.priority || 'Alta Prioridad'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      title="Editar propuesta"
                      className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMunicipalProposal(p.id)}
                      title="Eliminar propuesta"
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#00e03c]" />
                    <span>Proyectista: <strong className="text-slate-200">{p.lead}</strong></span>
                  </p>
                </div>

                {/* Target Municipalities */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500">Municipios:</span>
                  {(p.targetMunicipalities || []).map(m => (
                    <span key={m} className="text-[10px] font-semibold text-slate-300 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-md">
                      {m}
                    </span>
                  ))}
                </div>

                {/* Problem snippet */}
                <div className="bg-black/30 border border-white/[0.04] rounded-xl p-3.5 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  <strong className="text-slate-400 block text-[10px] uppercase font-black tracking-wider mb-1">
                    Problemática Diagnosticada:
                  </strong>
                  {p.problem}
                </div>

                {/* Phases Preview */}
                {p.phases && p.phases.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Cronograma por Fases</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {p.phases.map((ph, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2 text-center">
                          <p className="text-[9px] font-black text-[#00e03c]">Fase {idx + 1}</p>
                          <p className="text-[8px] text-slate-400 mt-0.5 truncate" title={ph.name}>{ph.name.replace(/Fase \d+:\s*/, '')}</p>
                          <p className="text-[8px] text-slate-500">{ph.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Info + CTA */}
              <div className="relative z-10 pt-5 mt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 block">Presupuesto Ref.</span>
                    <strong className="text-sm font-black text-white">Bs. {(p.budget || 0).toLocaleString()}</strong>
                  </div>
                  <div className="h-6 w-px bg-white/[0.08]" />
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 block">Plazo de Entrega</span>
                    <span className="text-xs font-bold text-slate-300">{p.duration}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedModalProposal(p)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-[#00e03c] text-white hover:text-slate-950 font-bold text-xs border border-white/[0.1] hover:border-[#00e03c] transition-all duration-300 active:scale-95 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Ver Ficha Técnica Completa
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProposals.length === 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-extrabold text-slate-300">No se encontraron propuestas con los filtros actuales</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba ajustando el término de búsqueda o seleccionando "Todos los Ejes" y "Todos los Municipios".
          </p>
        </div>
      )}

      {/* ── DETAILED TECHNICAL SHEET MODAL (FICHA TÉCNICA) ──────────────── */}
      <AnimatePresence>
        {selectedModalProposal && (
          <MunicipalProposalModal
            proposal={selectedModalProposal}
            onClose={() => setSelectedModalProposal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function MunicipalProposalModal({ proposal, onClose }) {
  if (!proposal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c131f] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-y-auto z-10 text-slate-200 p-6 md:p-8 space-y-6"
      >
        {/* Header with SERAM Branding */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#00e03c] text-slate-950 uppercase tracking-widest">
                SERAM S.R.L.
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Consultoría Ambiental & Sistemas de Información Geográfica
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
              {proposal.title}
            </h3>
            <p className="text-xs text-emerald-400 font-bold">
              Ficha Técnica de Proyecto para Gobiernos Autónomos Municipales de Bolivia
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-xs">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-500 block">Proponente Líder</span>
            <strong className="text-white font-black">{proposal.lead || 'Ing. Diego Barrientos'}</strong>
            <span className="text-[10px] text-slate-400 block">{proposal.leadRole || 'Especialista SIG & Consultoría Ambiental'}</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-slate-500 block">Presupuesto Referencial</span>
            <strong className="text-emerald-400 text-sm font-black">
              Bs. {(proposal.budget || 0).toLocaleString()}
            </strong>
            <span className="text-[10px] text-slate-400 block">Moneda Nacional (BOB)</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-slate-500 block">Plazo de Ejecución</span>
            <strong className="text-white font-black">{proposal.duration || '90 días'}</strong>
            <span className="text-[10px] text-slate-400 block">Con informe final pericial</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-slate-500 block">Área de Intervención</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {(proposal.targetMunicipalities || []).map(m => (
                <span key={m} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-bold text-slate-300">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 1: Problemática */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#00e03c]">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              1. Diagnóstico de la Problemática Socioambiental Municipal
            </h4>
          </div>
          <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
            {proposal.problem}
          </div>
        </div>

        {/* Section 2: Marco Legal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#00e03c]">
            <Shield className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              2. Marco Normativo & Legislación Boliviana Aplicable
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(proposal.legalFramework || []).map((norm, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-lg text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{norm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Metodología */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#00e03c]">
            <Activity className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              3. Metodología Técnica, Equipamiento & Tecnologías Aplicadas
            </h4>
          </div>
          <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
            {proposal.methodology}
          </div>
        </div>

        {/* Section 4: Fases & Cronograma */}
        {proposal.phases && proposal.phases.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#00e03c]">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                4. Estructura de Fases y Cronograma de Trabajo
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {proposal.phases.map((ph, idx) => (
                <div key={idx} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-black text-[#00e03c] uppercase">Fase {idx + 1}</span>
                  <p className="text-xs font-bold text-white">{ph.name.replace(/Fase \d+:\s*/, '')}</p>
                  <p className="text-[11px] text-slate-400">Duración: {ph.duration}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Entregables para el Concejo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#00e03c]">
            <CheckCircle2 className="w-4 h-4 text-[#00e03c]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              5. Productos y Entregables Formales para el Concejo Municipal
            </h4>
          </div>
          <div className="space-y-2">
            {(proposal.deliverables || []).map((d, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-emerald-500/[0.04] border border-emerald-500/20 p-3 rounded-xl text-xs text-slate-200">
                <div className="w-6 h-6 rounded-lg bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <span className="font-medium">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="border-t border-white/[0.08] pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span>Sello Técnico: </span>
            <strong className="text-white">{proposal.lead || 'Ing. Diego Barrientos'}</strong> — Proponente Consultor Ambiental SERAM S.R.L.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold transition-all ml-auto"
          >
            Cerrar Ficha Técnica
          </button>
        </div>
      </motion.div>
    </div>
  );
}

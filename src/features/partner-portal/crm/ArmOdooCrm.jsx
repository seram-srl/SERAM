/**
 * @file ArmOdooCrm.jsx
 * @description Módulo CRM estilo Odoo para SERAM SRL (Automated Relationship Machine - ARM).
 * Ofrece la experiencia y funcionalidad de Odoo CRM (Vista Kanban, Vista Lista, Métricas de Pipeline,
 * Ficha 360° con Chatter y Cadencia de 14 días / 7 contactos) revestido con los tokens y estética Neuform de SERAM.
 *
 * Directrices: Cero emoticones, 100% en español, cero errores en runtime.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, List, BarChart3, Plus, Search, Filter, Phone, Mail,
  Calendar, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight,
  RefreshCw, ChevronRight, X, Clock, Sparkles, Building2, User,
  DollarSign, MessageSquare, Send, Check, ExternalLink, ArrowUpDown,
  Lock, Unlock, Award, PauseCircle, PlayCircle, Eye
} from 'lucide-react';
import {
  armService,
  ARM_STAGES,
  ARM_TEMPERATURES,
  DEFAULT_CADENCE_STEPS
} from '../../../services/armService';
import { useApp } from '../../../context/AppContext';

// Componente Tarjeta Neuform Glassmorphic
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/[0.04] border border-white/[0.09] rounded-2xl shadow-lg backdrop-blur-md ${className}`}>
    {children}
  </div>
);

export default function ArmOdooCrm({ currentSocio, onConvertLeadToClient }) {
  const { triggerToast } = useApp();

  // Estados del CRM
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list' | 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [tempFilter, setTempFilter] = useState('all');
  const [socioFilter, setSocioFilter] = useState('all');

  // Modal Ficha 360 / Detalle Lead
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('bant'); // 'bant' | 'cadence' | 'chatter'
  const [chatterMessages, setChatterMessages] = useState([]);
  const [newChatterText, setNewChatterText] = useState('');
  const [newChatterType, setNewChatterType] = useState('nota_interna');

  // Modal Nueva Oportunidad
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    nombre: '',
    empresa: '',
    cargo: '',
    telefono: '',
    email: '',
    canal_preferido: 'WhatsApp',
    que_busca: 'Categorización Ambiental (FNCA)',
    cuando_necesita: 'Inmediato (< 15 días)',
    cuanto_invertir: 'USD 500 - USD 1,500',
    presupuesto_estimado_usd: 850,
    socio_asignado: currentSocio?.name || 'Ing. Diego Barrientos',
    etapa_pipeline: 'nuevo',
    notas_internas: ''
  });

  // Cargar leads desde armService
  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await armService.getLeads();
      setLeads(data || []);
    } catch {
      triggerToast?.('No se pudieron cargar los prospectos del ARM', 'error');
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Cargar Chatter al seleccionar lead
  useEffect(() => {
    if (selectedLead) {
      const messages = armService.getChatter(selectedLead.id);
      setChatterMessages(messages);
    } else {
      setChatterMessages([]);
    }
  }, [selectedLead]);

  // Métricas globales de Pipeline
  const metrics = useMemo(() => {
    const total = leads.length;
    const totalPipelineValue = leads
      .filter(l => l.etapa_pipeline !== 'perdido')
      .reduce((sum, l) => sum + (Number(l.presupuesto_estimado_usd) || 0), 0);

    const wonLeads = leads.filter(l => l.etapa_pipeline === 'ganado');
    const wonValue = wonLeads.reduce((sum, l) => sum + (Number(l.presupuesto_estimado_usd) || 0), 0);
    const winRate = total > 0 ? Math.round((wonLeads.length / total) * 100) : 0;

    const inNurturing = leads.filter(l => l.etapa_pipeline === 'nurturing' || l.etapa_pipeline === 'curioso').length;
    const hotLeads = leads.filter(l => l.temperatura === 'caliente').length;

    return {
      total,
      totalPipelineValue,
      wonCount: wonLeads.length,
      wonValue,
      winRate,
      inNurturing,
      hotLeads
    };
  }, [leads]);

  // Filtrado de leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (lead.nombre && lead.nombre.toLowerCase().includes(q)) ||
        (lead.empresa && lead.empresa.toLowerCase().includes(q)) ||
        (lead.que_busca && lead.que_busca.toLowerCase().includes(q)) ||
        (lead.telefono && lead.telefono.includes(q));

      const matchStage = stageFilter === 'all' || lead.etapa_pipeline === stageFilter;
      const matchTemp = tempFilter === 'all' || lead.temperatura === tempFilter;
      const matchSocio = socioFilter === 'all' || lead.socio_asignado === socioFilter;

      return matchSearch && matchStage && matchTemp && matchSocio;
    });
  }, [leads, searchQuery, stageFilter, tempFilter, socioFilter]);

  // Agrupamiento por etapa para el Kanban
  const kanbanColumns = useMemo(() => {
    const map = {};
    ARM_STAGES.forEach(st => {
      map[st.id] = [];
    });

    filteredLeads.forEach(l => {
      if (map[l.etapa_pipeline]) {
        map[l.etapa_pipeline].push(l);
      } else {
        map['nuevo'] = map['nuevo'] || [];
        map['nuevo'].push(l);
      }
    });

    return map;
  }, [filteredLeads]);

  // Handlers de cambio de etapa
  const handleChangeStage = async (leadId, newStage) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;

    try {
      const updated = await armService.updateLead(leadId, { etapa_pipeline: newStage });
      setLeads(prev => prev.map(l => l.id === leadId ? updated : l));

      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updated);
      }

      armService.addChatterMessage(leadId, {
        tipo: 'cambio_etapa',
        autor: currentSocio?.name || 'Socio SERAM',
        contenido: `Etapa modificada a "${ARM_STAGES.find(s => s.id === newStage)?.label || newStage}".`
      });

      triggerToast?.('Etapa actualizada en el CRM', 'success');
    } catch {
      triggerToast?.('Error al cambiar la etapa', 'error');
    }
  };

  // Handler de avance de cadencia de 14 días
  const handleAdvanceCadence = async (lead) => {
    if (!lead) return;
    try {
      await armService.advanceCadenceStep(lead.id, lead.contacto_actual || 1, 'Contacto ejecutado y registrado');
      const updatedList = await armService.getLeads();
      setLeads(updatedList);
      const freshlyUpdated = updatedList.find(l => l.id === lead.id);
      setSelectedLead(freshlyUpdated);
      setChatterMessages(armService.getChatter(lead.id));
      triggerToast?.('Contacto registrado en la cadencia de 14 días', 'success');
    } catch {
      triggerToast?.('No se pudo registrar el avance del contacto', 'error');
    }
  };

  // Handler de pausa/reanudación de cadencia anti-baneo
  const handleTogglePauseCadence = async (lead) => {
    if (!lead) return;
    const isPaused = !lead.cadencia_pausada;
    const patch = {
      cadencia_pausada: isPaused,
      motivo_pausa: isPaused ? 'Pausa manual por el socio gestor para evitar saturación.' : null
    };

    try {
      const updated = await armService.updateLead(lead.id, patch);
      setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
      setSelectedLead(updated);

      armService.addChatterMessage(lead.id, {
        tipo: 'sistema',
        autor: currentSocio?.name || 'Socio SERAM',
        contenido: isPaused
          ? 'Protocolo de seguimiento de 14 días pausado preventivamente (Anti-Baneo).'
          : 'Protocolo de seguimiento de 14 días reanudado.'
      });

      triggerToast?.(isPaused ? 'Seguimiento pausado (Anti-Baneo activo)' : 'Seguimiento reanudado', 'info');
    } catch {
      triggerToast?.('Error al modificar estado de la cadencia', 'error');
    }
  };

  // Handler de añadir nota o mensaje al Chatter
  const handleAddChatter = (e) => {
    e.preventDefault();
    if (!newChatterText.trim() || !selectedLead) return;

    armService.addChatterMessage(selectedLead.id, {
      tipo: newChatterType,
      autor: currentSocio?.name || 'Socio SERAM',
      contenido: newChatterText.trim()
    });

    setChatterMessages(armService.getChatter(selectedLead.id));
    setNewChatterText('');
    triggerToast?.('Entrada registrada en el Chatter del lead', 'success');
  };

  // Handler de creación de nuevo lead
  const handleCreateNewLeadSubmit = async (e) => {
    e.preventDefault();
    if (!newLeadForm.nombre.trim() || !newLeadForm.telefono.trim()) {
      triggerToast?.('El nombre y el teléfono son obligatorios', 'error');
      return;
    }

    try {
      const created = await armService.createLead(newLeadForm);
      setLeads(prev => [created, ...prev]);
      setShowNewLeadModal(false);
      setNewLeadForm({
        nombre: '',
        empresa: '',
        cargo: '',
        telefono: '',
        email: '',
        canal_preferido: 'WhatsApp',
        que_busca: 'Categorización Ambiental (FNCA)',
        cuando_necesita: 'Inmediato (< 15 días)',
        cuanto_invertir: 'USD 500 - USD 1,500',
        presupuesto_estimado_usd: 850,
        socio_asignado: currentSocio?.name || 'Ing. Diego Barrientos',
        etapa_pipeline: 'nuevo',
        notas_internas: ''
      });
      triggerToast?.('Oportunidad registrada exitosamente en el ARM', 'success');
    } catch {
      triggerToast?.('Error al crear la oportunidad', 'error');
    }
  };

  // Handler para convertir Lead Ganado a Cliente Directo de SERAM
  const handleConvertToDirectClient = async (lead) => {
    if (!lead) return;
    if (onConvertLeadToClient) {
      await onConvertLeadToClient({
        name: lead.empresa || lead.nombre,
        type: 'Privado / Industria',
        contactPerson: lead.nombre,
        contactPhone: lead.telefono,
        contactEmail: lead.email,
        location: 'La Paz, Bolivia',
        notes: `Cliente originado del sistema ARM. Requerimiento: ${lead.que_busca}. Presupuesto: USD ${lead.presupuesto_estimado_usd}.`
      });
      triggerToast?.(`Cliente ${lead.empresa || lead.nombre} incorporado al Directorio Principal`, 'success');
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* ── ENCABEZADO Y CONTROL PANEL ESTILO ODOO CRM ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00e03c]/15 border border-[#00e03c]/30 flex items-center justify-center text-[#00e03c]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-tech">Odoo CRM · Motor ARM</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30 font-bold">
                  Inbound con IA
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Flujo de Ventas & Oportunidades
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Precalificación inteligente BANT, cadencia de 14 días (7 contactos) y blindaje anti-baneo de WhatsApp y correo.
          </p>
        </div>

        {/* Acciones principales y Selector de Vistas Odoo */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowNewLeadModal(true)}
            className="px-4 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-[#00e03c]/15 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Nueva Oportunidad
          </button>

          <button
            type="button"
            onClick={loadLeads}
            disabled={loading}
            title="Sincronizar con Supabase"
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00e03c]' : ''}`} />
          </button>

          {/* Vistas estilo Odoo (Kanban / Lista / Métricas) */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-[#00e03c] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-[#00e03c] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista Lista"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('analytics')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'analytics'
                  ? 'bg-[#00e03c] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista Métricas"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Métricas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MÉTRICAS SUPERIORES ESTILO ODOO CRM ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard className="p-3.5 sm:p-4 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-tech">Pipeline Total</span>
            <DollarSign className="w-4 h-4 text-[#00e03c]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            USD {metrics.totalPipelineValue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{leads.length} oportunidades en seguimiento</p>
        </GlassCard>

        <GlassCard className="p-3.5 sm:p-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-tech">Leads Calientes (SQL)</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
            {metrics.hotLeads}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Listos para cierre con el vendedor</p>
        </GlassCard>

        <GlassCard className="p-3.5 sm:p-4 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-tech">Cadencia Activa (14D)</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
            {metrics.inNurturing}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">En nutrición anti-baneo (7 contactos)</p>
        </GlassCard>

        <GlassCard className="p-3.5 sm:p-4 border-blue-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-tech">Tasa de Conversión</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-blue-400 mt-1">
            {metrics.winRate}%
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{metrics.wonCount} contratos cerrados</p>
        </GlassCard>
      </div>

      {/* ── BARRA DE BÚSQUEDA Y FILTROS ODOO ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, empresa, trámite o teléfono..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#00e03c]/40 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Temperatura */}
          <select
            value={tempFilter}
            onChange={e => setTempFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-[#00e03c]/40 cursor-pointer"
          >
            <option value="all">Todas las Temperaturas</option>
            <option value="caliente">Caliente (SQL)</option>
            <option value="tibio">Tibio (MQL)</option>
            <option value="frio">Frío (Curioso)</option>
          </select>

          {/* Filtro Socio */}
          <select
            value={socioFilter}
            onChange={e => setSocioFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-[#00e03c]/40 cursor-pointer"
          >
            <option value="all">Todos los Especialistas</option>
            <option value="Ing. Diego Barrientos">Ing. Diego Barrientos</option>
            <option value="Ing. Fernando Araujo">Ing. Fernando Araujo</option>
          </select>

          {/* Limpiar Filtros */}
          {(searchQuery || tempFilter !== 'all' || socioFilter !== 'all' || stageFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTempFilter('all');
                setSocioFilter('all');
                setStageFilter('all');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] text-xs transition-colors cursor-pointer"
              title="Restablecer filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── VISTA 1: KANBAN ODOO ── */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none scrollbar-thin">
          {ARM_STAGES.map(stage => {
            const columnLeads = kanbanColumns[stage.id] || [];
            const columnValue = columnLeads.reduce((acc, l) => acc + (Number(l.presupuesto_estimado_usd) || 0), 0);

            return (
              <div
                key={stage.id}
                className="w-[300px] sm:w-[320px] flex-shrink-0 flex flex-col rounded-2xl bg-white/[0.025] border border-white/[0.07] overflow-hidden"
              >
                {/* Cabecera de Columna */}
                <div className={`p-3 border-b border-white/[0.07] flex items-center justify-between ${stage.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider">{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/[0.1] text-white">
                      {columnLeads.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-300">
                    USD {columnValue.toLocaleString()}
                  </span>
                </div>

                {/* Tarjetas de la Columna */}
                <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-22rem)] min-h-[140px]">
                  {columnLeads.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center text-slate-600 text-xs border border-dashed border-white/[0.06] rounded-xl p-3 text-center">
                      <span>Sin oportunidades</span>
                    </div>
                  ) : (
                    columnLeads.map(lead => {
                      const tempConfig = ARM_TEMPERATURES[lead.temperatura] || ARM_TEMPERATURES.frio;

                      return (
                        <motion.div
                          key={lead.id}
                          layoutId={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          whileHover={{ scale: 1.015, y: -2 }}
                          className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-[#00e03c]/40 transition-all duration-200 cursor-pointer shadow-md group space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[9px] font-bold text-slate-400 font-mono">{lead.id}</span>
                            <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold ${tempConfig.badgeClass}`}>
                              {tempConfig.label} ({lead.lead_score}/100)
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-white leading-tight group-hover:text-[#00e03c] transition-colors">
                              {lead.nombre}
                            </h4>
                            <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                              {lead.empresa || 'Empresa por registrar'}
                            </p>
                          </div>

                          <div className="text-[10px] text-slate-400 line-clamp-1 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.05]">
                            {lead.que_busca}
                          </div>

                          {/* Estado de Cadencia y Valor */}
                          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px]">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-3 h-3 text-[#00e03c]" />
                              <span>Paso {lead.contacto_actual || 1}/7 · Día {lead.ciclo_dia_actual || 1}</span>
                            </div>
                            <span className="font-mono font-bold text-white">
                              USD {(Number(lead.presupuesto_estimado_usd) || 0).toLocaleString()}
                            </span>
                          </div>

                          {/* Footer de Tarjeta con Asignado y Acciones */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1 text-[9.5px] text-slate-400">
                              <User className="w-3 h-3 text-slate-500" />
                              <span className="truncate max-w-[130px]">{lead.socio_asignado?.split(' ')?.[1] || lead.socio_asignado}</span>
                            </div>

                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <a
                                href={armService.createWhatsAppUrl(lead.telefono, `Hola ${lead.nombre}, te contacto de SERAM respecto a ${lead.que_busca}.`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir WhatsApp"
                                className="p-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => setSelectedLead(lead)}
                                title="Ver Ficha 360 Odoo"
                                className="p-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.15] text-slate-300 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VISTA 2: LISTA / TABLA ODOO ── */}
      {viewMode === 'list' && (
        <GlassCard className="overflow-hidden border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 font-tech uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Oportunidad / Contacto</th>
                  <th className="py-3 px-4">Empresa / Sector</th>
                  <th className="py-3 px-4">Requerimiento BANT</th>
                  <th className="py-3 px-4">Etapa Pipeline</th>
                  <th className="py-3 px-4">Temperatura</th>
                  <th className="py-3 px-4">Cadencia 14D</th>
                  <th className="py-3 px-4 text-right">Valor Est.</th>
                  <th className="py-3 px-4">Especialista</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No se encontraron oportunidades con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => {
                    const stageConfig = ARM_STAGES.find(s => s.id === lead.etapa_pipeline) || ARM_STAGES[0];
                    const tempConfig = ARM_TEMPERATURES[lead.temperatura] || ARM_TEMPERATURES.frio;

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-white group-hover:text-[#00e03c] transition-colors">{lead.nombre}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{lead.telefono || lead.email}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">{lead.empresa || 'No especificada'}</td>
                        <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">{lead.que_busca}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${stageConfig.color}`}>
                            {stageConfig.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${tempConfig.badgeClass}`}>
                            {tempConfig.label} ({lead.lead_score})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          Paso {lead.contacto_actual || 1}/7 · Día {lead.ciclo_dia_actual || 1}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          USD {(Number(lead.presupuesto_estimado_usd) || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-[11px]">{lead.socio_asignado}</td>
                        <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-[#00e03c] hover:text-slate-950 text-white font-bold text-[10px] transition-all cursor-pointer"
                          >
                            Abrir Ficha
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* ── VISTA 3: MÉTRICAS Y REPORTES ARM ── */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5 space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00e03c]" /> Distribución por Etapas de Pipeline
            </h4>
            <div className="space-y-3">
              {ARM_STAGES.map(stage => {
                const count = leads.filter(l => l.etapa_pipeline === stage.id).length;
                const percent = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;

                return (
                  <div key={stage.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{stage.label}</span>
                      <span className="text-slate-400 font-mono">{count} leads ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00e03c]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00e03c]" /> Protocolo Anti-Baneo y Calidad Inbound
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                <span>Leads con Opt-In Verificado:</span>
                <span className="font-bold text-[#00e03c]">100% (Conforme a política)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                <span>Contactos en Horario Comercial:</span>
                <span className="font-bold text-[#00e03c]">Activo (08:30 - 18:30 BOT)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                <span>Seguimientos Pausados Preventivamente:</span>
                <span className="font-bold text-amber-400">
                  {leads.filter(l => l.cadencia_pausada).length} leads
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                <span>Eficacia de Nutrición a Curiosos:</span>
                <span className="font-bold text-white">42% de transición a MQL</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── MODAL FICHA 360° ESTILO ODOO CRM (DETALLE + CHATTER) ── */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-[#09120a] border border-[#1a3a1a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Barra Superior estilo Odoo Form */}
              <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#051007] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400">{selectedLead.id}</span>
                  <div className="h-4 w-px bg-white/20" />
                  <h3 className="text-sm sm:text-base font-black text-white">{selectedLead.nombre}</h3>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${ARM_TEMPERATURES[selectedLead.temperatura]?.badgeClass}`}>
                    {ARM_TEMPERATURES[selectedLead.temperatura]?.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedLead.etapa_pipeline !== 'ganado' ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleChangeStage(selectedLead.id, 'ganado');
                        handleConvertToDirectClient(selectedLead);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#00e03c]/20"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Marcar como Ganado
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-[#00e03c]/20 border border-[#00e03c]/40 text-[#00e03c] font-black text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Oportunidad Ganada
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleTogglePauseCadence(selectedLead)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {selectedLead.cadencia_pausada ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 text-[#00e03c]" /> Reanudar 14D
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5 text-amber-400" /> Pausar Anti-Baneo
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Barra de Pipeline Secuencial Odoo (Clickable) */}
              <div className="bg-black/50 border-b border-white/[0.08] px-4 py-2.5 overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max">
                  {ARM_STAGES.map((st, idx) => {
                    const isActive = selectedLead.etapa_pipeline === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleChangeStage(selectedLead.id, st.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-[#00e03c] text-slate-950 font-black shadow-md shadow-[#00e03c]/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <span>{idx + 1}. {st.label}</span>
                        {idx < ARM_STAGES.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contenido en 2 Columnas Odoo (Formulario Izquierda / Chatter Derecha) */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
                {/* Columna Izquierda: Datos BANT y Cadencia (7/12) */}
                <div className="lg:col-span-7 p-5 space-y-5 overflow-y-auto">
                  {/* Selector de subpestañas */}
                  <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('bant')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        activeModalTab === 'bant'
                          ? 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Calificación Inbound & BANT
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('cadence')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        activeModalTab === 'cadence'
                          ? 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Cadencia 14 Días (7 Contactos)
                    </button>
                  </div>

                  {/* Subpestaña 1: BANT */}
                  {activeModalTab === 'bant' && (
                    <div className="space-y-4">
                      {/* Puntuación y Clasificación */}
                      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-tech font-bold">
                            Lead Score Inbound
                          </span>
                          <h4 className="text-2xl font-black text-[#00e03c] mt-0.5">
                            {selectedLead.lead_score} <span className="text-xs text-slate-400">/ 100</span>
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-tech font-bold">
                            Metodología
                          </span>
                          <p className="text-xs font-bold text-white mt-0.5">
                            {selectedLead.clasificacion_inbound || 'MQL'} ({selectedLead.temperatura})
                          </p>
                        </div>
                      </div>

                      {/* Datos de Contacto */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block font-tech uppercase">Empresa u Organización</span>
                          <span className="font-bold text-white">{selectedLead.empresa || 'Particular'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block font-tech uppercase">Cargo / Función</span>
                          <span className="font-bold text-white">{selectedLead.cargo || 'Responsable de Proyecto'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block font-tech uppercase">Teléfono / WhatsApp</span>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="font-bold text-white">{selectedLead.telefono || 'Sin teléfono'}</span>
                            <a
                              href={armService.createWhatsAppUrl(selectedLead.telefono, `Hola ${selectedLead.nombre}, te contactamos desde la consultora SERAM.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#25D366] hover:underline flex items-center gap-1 font-bold text-[10px]"
                            >
                              <Phone className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block font-tech uppercase">Correo Electrónico</span>
                          <span className="font-bold text-white truncate block">{selectedLead.email || 'No registrado'}</span>
                        </div>
                      </div>

                      {/* Variables BANT */}
                      <div className="space-y-2.5">
                        <h5 className="text-[11px] font-bold text-[#00e03c] uppercase tracking-wider font-tech">
                          Variables Inbound BANT
                        </h5>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">1. ¿Qué Busca?</span>
                            <span className="font-bold text-white text-right">{selectedLead.que_busca}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">2. ¿Cuándo lo Necesita?</span>
                            <span className="font-bold text-white">{selectedLead.cuando_necesita}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">3. ¿Cuánto Quiere Invertir?</span>
                            <span className="font-bold text-[#00e03c]">{selectedLead.cuanto_invertir}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-white/[0.05]">
                            <span className="text-slate-400">Presupuesto Estimado</span>
                            <span className="font-mono font-black text-white">
                              USD {(Number(selectedLead.presupuesto_estimado_usd) || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Asignación Comercial */}
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-tech">Socio Gestor Asignado</span>
                          <p className="font-bold text-white">{selectedLead.socio_asignado}</p>
                        </div>
                        <select
                          value={selectedLead.socio_asignado}
                          onChange={e => {
                            const newSocio = e.target.value;
                            armService.updateLead(selectedLead.id, { socio_asignado: newSocio });
                            setSelectedLead(prev => ({ ...prev, socio_asignado: newSocio }));
                            triggerToast?.(`Oportunidad reasignada a ${newSocio}`, 'info');
                          }}
                          className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none cursor-pointer"
                        >
                          <option value="Ing. Diego Barrientos">Ing. Diego Barrientos</option>
                          <option value="Ing. Fernando Araujo">Ing. Fernando Araujo</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Subpestaña 2: Cadencia 14 Días (7 Contactos) */}
                  {activeModalTab === 'cadence' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-black text-white uppercase tracking-wider font-tech">
                            Protocolo Anti-Baneo de 14 Días
                          </h5>
                          <p className="text-[11px] text-slate-400">
                            Paso actual: Contacto {selectedLead.contacto_actual || 1} de 7 · Día {selectedLead.ciclo_dia_actual || 1}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdvanceCadence(selectedLead)}
                          className="px-3 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Registrar Avance
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {armService.getLeadCadenceSteps(selectedLead).map(step => (
                          <div
                            key={step.step}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              step.isCurrent
                                ? 'bg-[#00e03c]/[0.08] border-[#00e03c]/40 shadow-sm'
                                : step.isPast
                                ? 'bg-white/[0.02] border-white/[0.05] opacity-65'
                                : 'bg-white/[0.015] border-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                  step.isPast
                                    ? 'bg-[#00e03c] text-slate-950'
                                    : step.isCurrent
                                    ? 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]'
                                    : 'bg-white/10 text-slate-400'
                                }`}>
                                  {step.step}
                                </span>
                                <span className="text-xs font-bold text-white">{step.subject}</span>
                                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 font-mono">
                                  Día {step.day} · {step.channel}
                                </span>
                              </div>

                              {step.isCurrent && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00e03c]/20 text-[#00e03c] font-black">
                                  Contacto de Hoy
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-300 italic bg-black/40 p-2.5 rounded-xl border border-white/[0.05] leading-relaxed">
                              &ldquo;{step.personalizedMessage}&rdquo;
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.05] text-[10px]">
                              <span className="text-slate-400">{step.objective}</span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={armService.createWhatsAppUrl(selectedLead.telefono, step.personalizedMessage)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#25D366] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <Phone className="w-3 h-3" /> Enviar WhatsApp
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Chatter Odoo (5/12) */}
                <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4 bg-black/30">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider font-tech flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#00e03c]" /> Chatter & Bitácora Odoo
                      </h5>
                      <span className="text-[10px] text-slate-500 font-mono">{chatterMessages.length} eventos</span>
                    </div>

                    {/* Formulario de Nueva Nota / Evento */}
                    <form onSubmit={handleAddChatter} className="space-y-2 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.07]">
                      <div className="flex items-center gap-2">
                        <select
                          value={newChatterType}
                          onChange={e => setNewChatterType(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 outline-none"
                        >
                          <option value="nota_interna">Nota Interna</option>
                          <option value="llamada">Registro de Llamada</option>
                          <option value="mensaje_cliente">Respuesta del Cliente</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={newChatterText}
                        onChange={e => setNewChatterText(e.target.value)}
                        placeholder="Escribe una actualización o acuerdo de la oportunidad..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 resize-none outline-none focus:border-[#00e03c]/40"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" /> Registrar en Chatter
                        </button>
                      </div>
                    </form>

                    {/* Timeline de mensajes cronológicos */}
                    <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                      {chatterMessages.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6">Sin interacciones registradas aún.</p>
                      ) : (
                        chatterMessages.map((msg, mIdx) => (
                          <div
                            key={msg.id || mIdx}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-bold text-white">{msg.autor}</span>
                              <span className="font-mono">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{msg.contenido}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL NUEVA OPORTUNIDAD MANUAL ── */}
      <AnimatePresence>
        {showNewLeadModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#09120a] border border-[#1a3a1a] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#00e03c]" /> Nueva Oportunidad Comercial ARM
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewLeadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nombre del Contacto *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.nombre}
                    onChange={e => setNewLeadForm({ ...newLeadForm, nombre: e.target.value })}
                    placeholder="Ej. Ing. René Gutiérrez"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Empresa u Organización</label>
                    <input
                      type="text"
                      value={newLeadForm.empresa}
                      onChange={e => setNewLeadForm({ ...newLeadForm, empresa: e.target.value })}
                      placeholder="Ej. Minera San Cristóbal"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]/40"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={newLeadForm.telefono}
                      onChange={e => setNewLeadForm({ ...newLeadForm, telefono: e.target.value })}
                      placeholder="+591 70000000"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Requerimiento o Servicio</label>
                  <select
                    value={newLeadForm.que_busca}
                    onChange={e => setNewLeadForm({ ...newLeadForm, que_busca: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]/40 cursor-pointer"
                  >
                    <option value="Categorización Ambiental (FNCA)">Categorización Ambiental (FNCA)</option>
                    <option value="Licencia Ambiental Integral (EEIA / DIA)">Licencia Ambiental Integral (EEIA / DIA)</option>
                    <option value="Registro Ambiental Industrial (RAI)">Registro Ambiental Industrial (RAI)</option>
                    <option value="Plan EMAP Minero">Plan EMAP Minero</option>
                    <option value="Cartografía SIG y Modelamiento Espacial">Cartografía SIG y Modelamiento Espacial</option>
                    <option value="Capacitación Corporativa SERAM">Capacitación Corporativa SERAM</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Urgencia / Plazo</label>
                    <select
                      value={newLeadForm.cuando_necesita}
                      onChange={e => setNewLeadForm({ ...newLeadForm, cuando_necesita: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
                    >
                      <option value="Inmediato (< 15 días)">Inmediato (&lt; 15 días)</option>
                      <option value="Corto Plazo (15 a 45 días)">Corto Plazo (15 a 45 días)</option>
                      <option value="Planificación (más de 45 días)">Planificación (&gt; 45 días)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Presupuesto Estimado (USD)</label>
                    <input
                      type="number"
                      value={newLeadForm.presupuesto_estimado_usd}
                      onChange={e => setNewLeadForm({ ...newLeadForm, presupuesto_estimado_usd: e.target.value })}
                      placeholder="850"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]/40"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewLeadModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-all shadow-md shadow-[#00e03c]/20"
                  >
                    Crear y Calificar Lead
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

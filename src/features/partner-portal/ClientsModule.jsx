import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Sparkles, Plus, Search, Filter, Phone, Mail,
  MapPin, User, Trash2, Edit2, CheckCircle2, X, Briefcase,
  ExternalLink, TrendingUp, Users, ArrowRight, Check, AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// ── COMPONENTE TARJETA DE CRISTAL GLASSMORPHIC (NEUFORM) ────────────────────
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/[0.05] border border-white/[0.12] rounded-2xl shadow-lg backdrop-blur-md ${className}`}>
    {children}
  </div>
);

export default function ClientsModule({ currentSocio, onNavigate }) {
  const {
    clients = [],
    handleAddClient,
    handleEditClient,
    handleDeleteClient,
    prospects = [],
    handleUpdateProspect,
    handleConvertProspectToClient,
    activeServices = [],
    triggerToast
  } = useApp();

  // ── ESTADOS DE PESTAÑAS Y VISTA ──
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'seprec'
  const [seprecViewMode, setSeprecViewMode] = useState('cards'); // 'cards' | 'table'

  // ── ESTADOS DE FILTRO PARA DIRECTORIO DE CLIENTES ──
  const [clientSearch, setClientSearch] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('all');

  // ── ESTADOS DE FILTRO PARA PROSPECCIÓN SEPREC ──
  const [prospectSearch, setProspectSearch] = useState('');
  const [prospectDept, setProspectDept] = useState('all');
  const [prospectStatusFilter, setProspectStatusFilter] = useState('all');
  const [prospectServiceFilter, setProspectServiceFilter] = useState('all');

  // ── MODAL NUEVO / EDITAR CLIENTE ──
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    type: 'Municipal / Público',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    notes: ''
  });

  // ── CÁLCULO DE MÉTRICAS DINÁMICAS ──
  const totalClients = clients.length;

  const clientsWithActiveProjects = useMemo(() => {
    return clients.filter(cl =>
      activeServices.some(s =>
        String(s.client || '').toLowerCase().includes(cl.name.toLowerCase()) ||
        String(s.clientId || '') === String(cl.id)
      )
    ).length;
  }, [clients, activeServices]);

  const totalProspects = prospects.length;

  const activeOpportunities = useMemo(() => {
    return prospects.filter(p =>
      p.estadoGestion === 'Cotización Enviada' || p.estadoGestion === 'Contactado'
    ).length;
  }, [prospects]);

  // ── FILTRADO DE CLIENTES ──
  const filteredClients = useMemo(() => {
    return clients.filter(cl => {
      const matchSearch =
        cl.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (cl.contactPerson && cl.contactPerson.toLowerCase().includes(clientSearch.toLowerCase())) ||
        (cl.location && cl.location.toLowerCase().includes(clientSearch.toLowerCase()));
      const matchType = clientTypeFilter === 'all' || cl.type === clientTypeFilter;
      return matchSearch && matchType;
    });
  }, [clients, clientSearch, clientTypeFilter]);

  // ── FILTRADO DE PROSPECTOS SEPREC ──
  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const q = prospectSearch.toLowerCase();
      const matchSearch =
        (p.razonSocial && p.razonSocial.toLowerCase().includes(q)) ||
        (p.actividad && p.actividad.toLowerCase().includes(q)) ||
        (p.matricula && p.matricula.includes(q)) ||
        (p.municipio && p.municipio.toLowerCase().includes(q));
      const matchDept = prospectDept === 'all' || p.departamento === prospectDept;
      const matchStatus = prospectStatusFilter === 'all' || p.estadoGestion === prospectStatusFilter;
      const matchService = prospectServiceFilter === 'all' || (p.servicioInteres && p.servicioInteres.includes(prospectServiceFilter));
      return matchSearch && matchDept && matchStatus && matchService;
    });
  }, [prospects, prospectSearch, prospectDept, prospectStatusFilter, prospectServiceFilter]);

  // ── HANDLERS DE FORMULARIO CLIENTE ──
  const handleOpenNewClientModal = () => {
    setEditingClient(null);
    setClientFormData({
      name: '',
      type: 'Municipal / Público',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      location: '',
      notes: ''
    });
    setShowClientModal(true);
  };

  const handleOpenEditClientModal = (cl) => {
    setEditingClient(cl);
    setClientFormData({
      name: cl.name || '',
      type: cl.type || 'Municipal / Público',
      contactPerson: cl.contactPerson || '',
      contactPhone: cl.contactPhone || '',
      contactEmail: cl.contactEmail || '',
      location: cl.location || '',
      notes: cl.notes || ''
    });
    setShowClientModal(true);
  };

  const handleSubmitClient = async (e) => {
    e.preventDefault();
    if (!clientFormData.name.trim()) {
      triggerToast?.('El nombre del cliente es obligatorio', 'error');
      return;
    }

    if (editingClient) {
      await handleEditClient(editingClient.id, clientFormData);
    } else {
      await handleAddClient(clientFormData);
    }
    setShowClientModal(false);
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* ── ENCABEZADO Y TÍTULO DEL MÓDULO ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Directorio & Gestión de Clientes
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  B2B & Público
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Alcaldías, Gobiernos Autónomos, Minería e Industrias bajo normativa boliviana (SEPREC 150).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenNewClientModal}
            className="px-4 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-[#00e03c]/15 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Registrar Nuevo Cliente
          </button>
        </div>
      </div>

      {/* ── TARJETAS MÉTRICAS SUPERIORES DINÁMICAS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center justify-between border-purple-500/20">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Clientes</span>
            <h3 className="text-2xl font-black text-purple-400 mt-0.5">{totalClients}</h3>
            <p className="text-[11px] text-slate-400">Instituciones en directorio</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Building2 className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between border-emerald-500/20">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clientes Activos</span>
            <h3 className="text-2xl font-black text-[#00e03c] mt-0.5">{clientsWithActiveProjects}</h3>
            <p className="text-[11px] text-slate-400">Con contratos y proyectos en curso</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/30 flex items-center justify-center text-[#00e03c]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between border-amber-500/20">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas SEPREC</span>
            <h3 className="text-2xl font-black text-amber-400 mt-0.5">{totalProspects}</h3>
            <p className="text-[11px] text-slate-400">Base comercial de prospección</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between border-blue-500/20">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oportunidades</span>
            <h3 className="text-2xl font-black text-blue-400 mt-0.5">{activeOpportunities}</h3>
            <p className="text-[11px] text-slate-400">Cotizaciones y en negociación</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* ── BARRA DE PESTAÑAS SIMÉTRICA (PILL SEGMENTED) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-1.5 bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-[#00e03c] text-slate-950 shadow-md font-black shadow-[#00e03c]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Directorio de Clientes ({filteredClients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seprec')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'seprec'
                ? 'bg-[#00e03c] text-slate-950 shadow-md font-black shadow-[#00e03c]/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Prospección B2B Global (SEPREC 150)
          </button>
        </div>

        {activeTab === 'seprec' && (
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setSeprecViewMode('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                seprecViewMode === 'cards' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tarjetas
            </button>
            <button
              type="button"
              onClick={() => setSeprecViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                seprecViewMode === 'table' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tabla
            </button>
          </div>
        )}
      </div>

      {/* ── CONTENIDO: PESTAÑA 1 - DIRECTORIO DE CLIENTES ── */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, contacto, ubicación..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={clientTypeFilter}
                onChange={(e) => setClientTypeFilter(e.target.value)}
                className="w-full sm:w-auto text-xs px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-purple-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
              >
                <option value="all">Todos los Sectores</option>
                <option value="Municipal / Público">Municipal / Público</option>
                <option value="Minería / Cooperativa">Minería / Cooperativa</option>
                <option value="Industrial / Fabril">Industrial / Fabril</option>
                <option value="Privado / Particular">Privado / Particular</option>
              </select>
            </div>
          </div>

          {/* Grid de Clientes */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-2xl">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">No se encontraron clientes</p>
              <p className="text-xs text-slate-500 mt-1">Ajusta los filtros o registra un nuevo cliente en el directorio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((cl) => {
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
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditClientModal(cl)}
                            className="text-slate-400 hover:text-white p-1 transition-colors"
                            title="Editar datos del cliente"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar ${cl.name} del directorio?`)) {
                                handleDeleteClient(cl.id);
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                          <p className="flex items-center justify-between text-slate-400 font-mono">
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-blue-400" /> {cl.contactPhone}
                            </span>
                            <a
                              href={`https://wa.me/591${cl.contactPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-black text-[#00e03c] bg-[#00e03c]/10 hover:bg-[#00e03c]/20 px-2 py-0.5 rounded transition-colors"
                            >
                              WhatsApp ➔
                            </a>
                          </p>
                        )}
                        {cl.contactEmail && (
                          <p className="flex items-center justify-between text-slate-400 font-mono">
                            <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-purple-400 shrink-0" /> {cl.contactEmail}
                            </span>
                            <a
                              href={`mailto:${cl.contactEmail}`}
                              className="text-[9px] font-black text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded transition-colors"
                            >
                              Email
                            </a>
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
                      <span className="font-black text-[#00e03c] bg-[#00e03c]/10 px-2.5 py-0.5 rounded-full border border-[#00e03c]/20">
                        {clientProjects.length} Activo(s)
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CONTENIDO: PESTAÑA 2 - PROSPECCIÓN B2B SEPREC ── */}
      {activeTab === 'seprec' && (
        <div className="space-y-4">
          {/* Barra de Filtros de Prospección */}
          <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Directorio Global de Empresas SEPREC Bolivia
                </h4>
                <p className="text-[11px] text-slate-400">
                  Empresas con datos de contacto verificados para captación de trámites (RAI, FNCA, SIG, etc.)
                </p>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                {filteredProspects.length} de {totalProspects} Empresas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar empresa, matrícula, rubro..."
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
                  className="w-full text-xs px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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
                  className="w-full text-xs px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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
                  className="w-full text-xs px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
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

          {/* VISTA 1: Tarjetas de Prospección */}
          {seprecViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProspects.map((p) => (
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
                        className="text-[10px] font-bold px-2 py-1 rounded bg-white/[0.06] border border-white/[0.1] text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white flex-1 cursor-pointer"
                      >
                        <option value="Prospecto Nuevo">Prospecto Nuevo</option>
                        <option value="Contactado">Contactado</option>
                        <option value="Cotización Enviada">Cotización Enviada</option>
                        <option value="Cliente Cerrado">Cliente Cerrado</option>
                      </select>

                      <select
                        value={p.socioAsignado || 'Sin Asignar'}
                        onChange={(e) => handleUpdateProspect(p.id, { socioAsignado: e.target.value })}
                        className="text-[10px] font-bold px-2 py-1 rounded bg-white/[0.06] border border-white/[0.1] text-white focus:outline-none focus:border-amber-400 [&>option]:bg-[#0d1622] [&>option]:text-white flex-1 cursor-pointer"
                      >
                        <option value="Sin Asignar">Sin Asignar</option>
                        <option value="Ing. Diego Barrientos">Diego</option>
                        <option value="Ing. Fernando Araujo">Fernando</option>
                        <option value="Ing. Fabricio Orosco">Fabricio</option>
                      </select>
                    </div>

                    {p.estadoGestion !== 'Cliente Cerrado' ? (
                      <button
                        type="button"
                        onClick={() => handleConvertProspectToClient(p.id)}
                        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-[#00e03c] text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#00e03c]/10 hover:brightness-110 transition-all cursor-pointer"
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
          )}

          {/* VISTA 2: Tabla de Prospección */}
          {seprecViewMode === 'table' && (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.04] text-[10px] uppercase tracking-wider text-slate-400 font-black">
                    <th className="p-3">Razón Social & Matrícula</th>
                    <th className="p-3">Ubicación</th>
                    <th className="p-3">Actividad / Rubro</th>
                    <th className="p-3">Servicio Sugerido</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-3">Estado Gestión</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {filteredProspects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white text-xs">{p.razonSocial}</div>
                        <div className="text-[10px] font-mono text-slate-500">Mat: {p.matricula}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {p.departamento}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.municipio}</div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="line-clamp-2 text-[11px] text-slate-300">{p.actividad}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-black text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {p.servicioInteres}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                        {p.telefono && (
                          <a
                            href={`https://wa.me/591${p.telefono.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 block"
                          >
                            WA: {p.telefono}
                          </a>
                        )}
                        {p.email && (
                          <a href={`mailto:${p.email}`} className="text-purple-400 hover:text-purple-300 block text-[10px] truncate max-w-[140px]">
                            {p.email}
                          </a>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <select
                          value={p.estadoGestion}
                          onChange={(e) => handleUpdateProspect(p.id, { estadoGestion: e.target.value })}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-white/[0.06] border border-white/[0.1] text-white focus:outline-none [&>option]:bg-[#0d1622] [&>option]:text-white"
                        >
                          <option value="Prospecto Nuevo">Prospecto Nuevo</option>
                          <option value="Contactado">Contactado</option>
                          <option value="Cotización Enviada">Cotización Enviada</option>
                          <option value="Cliente Cerrado">Cliente Cerrado</option>
                        </select>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {p.estadoGestion !== 'Cliente Cerrado' ? (
                          <button
                            type="button"
                            onClick={() => handleConvertProspectToClient(p.id)}
                            className="px-2.5 py-1 rounded bg-[#00e03c] text-slate-950 font-black text-[10px] hover:bg-[#00e03c]/90 transition-all cursor-pointer"
                          >
                            Convertir
                          </button>
                        ) : (
                          <span className="text-[10px] font-black text-[#00e03c]">✓ Cerrado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: REGISTRAR / EDITAR CLIENTE ── */}
      <AnimatePresence>
        {showClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e1622] border border-white/[0.15] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-[#00e03c]" />
                  <h3 className="text-base font-black text-white">
                    {editingClient ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente en Directorio'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitClient} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nombre / Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Gobierno Autónomo Municipal de Coroico"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Tipo de Cliente</label>
                    <select
                      value={clientFormData.type}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-[#00e03c] [&>option]:bg-[#0d1622] [&>option]:text-white cursor-pointer"
                    >
                      <option value="Municipal / Público">Municipal / Público</option>
                      <option value="Minería / Cooperativa">Minería / Cooperativa</option>
                      <option value="Industrial / Fabril">Industrial / Fabril</option>
                      <option value="Privado / Particular">Privado / Particular</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Ubicación (Dpto / Municipio)</label>
                    <input
                      type="text"
                      placeholder="Ej: Coroico - Nor Yungas, La Paz"
                      value={clientFormData.location}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Persona de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: Ing. Gonzalo Miranda - Director de Medio Ambiente"
                    value={clientFormData.contactPerson}
                    onChange={(e) => setClientFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="Ej: +591 76543210"
                      value={clientFormData.contactPhone}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="contacto@alcaldia.bo"
                      value={clientFormData.contactEmail}
                      onChange={(e) => setClientFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Notas / Antecedentes</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles de interés ambiental, historial de reuniones, etc."
                    value={clientFormData.notes}
                    onChange={(e) => setClientFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/[0.06] border border-white/[0.12] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c] resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black transition-all shadow-md shadow-[#00e03c]/20 cursor-pointer"
                  >
                    {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
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

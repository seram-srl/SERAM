import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Shield, DollarSign, BookOpenCheck, Briefcase, Leaf,
  Plus, Trash2, Loader2, Edit2, Check, X, Calendar,
  Clock, Award, TrendingUp, BarChart2, ShoppingBag,
  Globe, Users, ChevronLeft, ChevronRight, Settings,
  MapPin, UserCheck, Package, Star, AlertCircle, Lock,
  Wallet, Target, Layers, ArrowUpRight, ArrowDownRight, Percent,
  PieChart as LucidePie, Activity, CreditCard
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabaseClient';

// ── ANIMATION VARIANTS ─────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0 },
};
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

// ── SIDEBAR CONFIG ─────────────────────────────────────────────────────────
const SIDEBAR_MODULES = [
  { id: 'overview',    icon: <BarChart2 className="w-5 h-5" />,    label: 'Resumen General' },
  { id: 'services',   icon: <Briefcase className="w-5 h-5" />,    label: 'SERAM SERVICES' },
  { id: 'timetracker', icon: <Clock className="w-5 h-5" />,        label: 'Time Tracker' },
  { id: 'academy',    icon: <BookOpenCheck className="w-5 h-5" />, label: 'Gestión de Info-productos y Oferta Académica' },
  { id: 'experience', icon: <Globe className="w-5 h-5" />,         label: 'SERAM EXPERIENCE' },
  { id: 'store',      icon: <ShoppingBag className="w-5 h-5" />,   label: 'SERAM STORE' },
  { id: 'users',      icon: <Users className="w-5 h-5" />,         label: 'Socios & Usuarios' },
  { id: 'finances',   icon: <DollarSign className="w-5 h-5" />,    label: 'Finanzas' },
];

// ── RECHARTS CUSTOM TOOLTIP ────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 shadow-2xl text-xs backdrop-blur-md">
      <p className="font-bold text-slate-200 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-black" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('bs')
            ? `Bs. ${entry.value.toLocaleString()}`
            : entry.value}
        </p>
      ))}
    </div>
  );
};

// ── CHART DATA ─────────────────────────────────────────────────────────────
const studentGrowthData = [
  { month: 'Ene', Estudiantes: 45 },
  { month: 'Feb', Estudiantes: 72 },
  { month: 'Mar', Estudiantes: 98 },
  { month: 'Abr', Estudiantes: 125 },
  { month: 'May', Estudiantes: 143 },
  { month: 'Jun', Estudiantes: 162 },
];

const revenueByPillarData = [
  { pilar: 'ACADEMY',    'Bs. Ingresos': 11500 },
  { pilar: 'SERVICES',   'Bs. Ingresos': 9850 },
  { pilar: 'EXPERIENCE', 'Bs. Ingresos': 3500 },
  { pilar: 'STORE',      'Bs. Ingresos': 2100 },
];

// ── GLASS CARD ─────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/[0.08] border border-white/[0.14] rounded-2xl shadow-md backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
function OverviewModule({ kpis, metrics }) {
  return (
    <div className="space-y-8">
      {/* KPI Cards — Visibles Permanentemente al 100% */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white/[0.04] border border-white/[0.08] hover:border-[#00e03c]/35 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 cursor-default hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 opacity-100 visible relative z-10"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</span>
              <h3 className="text-2xl font-black text-white tracking-tight">{kpi.value}</h3>
              <p className="text-[10px] text-[#00e03c] font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {kpi.trend}
              </p>
            </div>
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.color} shadow-sm`}
            >
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="opacity-100 visible">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-extrabold text-white text-sm">Crecimiento de Estudiantes</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Progreso acumulado — SERAM ACADEMY</p>
              </div>
              <span className="text-[9px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-1 rounded-full uppercase tracking-widest">
                Live Data
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={studentGrowthData}>
                <defs>
                  <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e03c" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00e03c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="Estudiantes" stroke="#00e03c" strokeWidth={2.5} fill="url(#studentGrad)" dot={{ fill: '#00e03c', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Bar Chart */}
        <div className="opacity-100 visible">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-extrabold text-white text-sm">Distribución por Pilares</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Ingresos en Bs. por pilar comercial</p>
              </div>
              <span className="text-[9px] font-black text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2 py-1 rounded-full uppercase tracking-widest">
                Metrics AI
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueByPillarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Bs.${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="pilar" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Bs. Ingresos" fill="#00e03c" radius={[0, 6, 6, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </div>

      {/* ── RECOMENDACIONES ESTRATEGICAS ── */}
      <div className="opacity-100 visible">
        <GlassCard className="p-6 space-y-4 border-[#00e03c]/20">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <TrendingUp className="w-4 h-4 text-[#00e03c]" />
            <div>
              <h3 className="font-extrabold text-white text-sm">💡 Recomendaciones Tácticas y Estratégicas (Lanzamiento Lean)</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Sugerencias dinámicas de negocio calculadas por Inteligencia de Negocios para maximizar la rentabilidad a corto plazo.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-2">
              <span className="text-[9px] font-black uppercase text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-0.5 rounded-full">Táctica (Corto Plazo)</span>
              <p className="text-xs font-bold text-white">Enfoque B2B y Outsourcing Cartográfico</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Invertir el presupuesto de marketing (35,000 Bs) en campañas de Google Ads específicas para multas/clausuras ambientales y LinkedIn Ads ofreciendo Soporte Cartográfico B2B a consultoras grandes bolivianas que deseen subcontratar la planimetría de sus proyectos de forma discreta y profesional.
              </p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-2">
              <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">Operativa & Técnica</span>
              <p className="text-xs font-bold text-white">Retenciones de Ley Preventivas</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Asegurar la aplicación del cálculo del 15.5% de retenciones de ley (12.5% IUE + 3% IT) a todo consultor independiente externo que no emita factura boliviana. Esto mantendrá los estados contables transparentes y listos ante eventuales fiscalizaciones del SIN.
              </p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-2">
              <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">Estratégica (Medio Plazo)</span>
              <p className="text-xs font-bold text-white">Certificación SySO Interna</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Reinvertir el 20% de los honorarios acumulados del fondo de socios en capacitar y certificar a uno de los tres socios (Diego, Fernando o Fabricio) para obtener el carnet SySO del Ministerio de Trabajo. Esto eliminará la necesidad del brokerage y elevará el margen de utilidad en PSST del 52% al 85%.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: SERVICES
// ─────────────────────────────────────────────────────────────────────────────
function ServicesModule({ activeServices, registeredEngineers, handlers, publicServices, specialists }) {
  const { handleAddProject, handleUpdateProjectProgress, handleDeleteProject,
          handleEditProject, handleConcludeProject, triggerToast,
          handleAddPublicService, handleEditPublicService, handleDeletePublicService,
          handleAddSpecialist, handleEditSpecialist, handleDeleteSpecialist } = handlers;

  const [subModule, setSubModule] = useState('projects'); // 'projects', 'catalog', 'specialists'

  const [newProjClient, setNewProjClient] = useState('');
  const [newProjType, setNewProjType] = useState('');
  const [newProjLead, setNewProjLead] = useState(registeredEngineers[0]?.name || '');
  const [newProjStartDate, setNewProjStartDate] = useState('');
  const [newProjEndDate, setNewProjEndDate] = useState('');
  const [newProjInvolved, setNewProjInvolved] = useState([]);
  
  const [newProjBudget, setNewProjBudget] = useState('');
  const [newProjLabCosts, setNewProjLabCosts] = useState('');
  const [newProjSubcontractorCosts, setNewProjSubcontractorCosts] = useState('');
  const [newProjTaxRegime, setNewProjTaxRegime] = useState('Régimen General');

  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({});

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditState({ client: p.client, type: p.type, lead: p.lead, startDate: p.startDate || '', endDate: p.endDate || '', progress: p.progress, involved: p.involved || [], budget: p.budget || 0, labCosts: p.labCosts || 0, subcontractorCosts: p.subcontractorCosts || 0, taxRegime: p.taxRegime || 'Régimen General' });
  };

  const calculateTimeProgress = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start), e = new Date(end), now = new Date();
    const total = e - s;
    if (total <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round(((now - s) / total) * 100)));
  };

  const calculateFinancials = (p) => {
    const budget = p.budget || 0;
    const labCosts = p.labCosts || 0;
    const subcontractorCosts = p.subcontractorCosts || 0;
    const isSiete = p.taxRegime === 'Régimen SIETE (5%)';
    const taxes = isSiete ? budget * 0.05 : budget * 0.16; // SIETE 5%; General 13% IVA + 3% IT = 16%
    const UN = Math.max(0, budget - taxes - labCosts - subcontractorCosts);
    const margin = budget > 0 ? Math.round((UN / budget) * 100) : 0;
    return { taxes, UN, margin };
  };

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#00e03c] transition-all";
  const selectCls = "w-full text-xs px-3 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white";

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex border-b border-white/[0.06] mb-4">
        <button
          onClick={() => setSubModule('projects')}
          className={`px-4 py-2 text-xs font-bold transition-all ${subModule === 'projects' ? 'text-[#00e03c] border-b-2 border-[#00e03c]' : 'text-slate-400 hover:text-white'}`}
        >
          Monitor de Proyectos
        </button>
        <button
          onClick={() => setSubModule('catalog')}
          className={`px-4 py-2 text-xs font-bold transition-all ${subModule === 'catalog' ? 'text-[#00e03c] border-b-2 border-[#00e03c]' : 'text-slate-400 hover:text-white'}`}
        >
          Catálogo de Servicios Públicos
        </button>
        <button
          onClick={() => setSubModule('specialists')}
          className={`px-4 py-2 text-xs font-bold transition-all ${subModule === 'specialists' ? 'text-[#00e03c] border-b-2 border-[#00e03c]' : 'text-slate-400 hover:text-white'}`}
        >
          Red de Especialistas
        </button>
      </div>

      {subModule === 'projects' && (
        <div className="space-y-8">
          {/* Time Progress Table */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="font-extrabold text-white text-sm">Monitor Financiero y Avance de Proyectos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 font-extrabold uppercase tracking-widest border-b border-white/[0.06]">
                    {['Proyecto / Cliente', 'Líder', 'Finanzas (i)', 'Físico vs Temporal', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {activeServices.map((p) => {
                    const tp = calculateTimeProgress(p.startDate, p.endDate);
                    const done = p.progress >= 100;
                    const late = !done && p.progress < tp;
                    const badge = done ? 'bg-slate-700 text-slate-300' : late ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-[#00e03c]/10 text-[#00e03c] border border-[#00e03c]/20';
                    const status = done ? 'Concluido' : late ? 'Retrasado' : 'Al Día';
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <p className="font-extrabold text-white">{p.client}</p>
                          <p className="text-[10px] text-slate-500">{p.type}</p>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">{p.lead}</td>
                        <td className="p-3">
                          {(() => {
                            const { taxes, UN, margin } = calculateFinancials(p);
                            return (
                              <div className="text-[10px] text-slate-400 space-y-0.5">
                                <p className="font-extrabold text-white">Presupuesto: Bs. {p.budget?.toLocaleString() || 0}</p>
                                <p className="flex items-center gap-1">
                                  <span>Impuestos: Bs. {taxes.toLocaleString()}</span>
                                  <span className="text-slate-500 cursor-help" title={p.taxRegime === 'Régimen SIETE (5%)' ? "Monotributo simplificado del 5% consolidado (IVA/IT/IUE)." : "Régimen General: 13% IVA efectivo + 3% IT (16% total)."}>ⓘ</span>
                                </p>
                                <p>Tercerización: Bs. {((p.labCosts || 0) + (p.subcontractorCosts || 0)).toLocaleString()}</p>
                                <p className="font-black text-[#00e03c] flex items-center gap-1">
                                  Utilidad Neta: Bs. {UN.toLocaleString()} ({margin}%)
                                  <span className="text-slate-500 cursor-help" title="Fórmula: Presupuesto - Impuestos - Lab/Equipos - Subcontratistas externos. Representa el dinero libre para distribución meritocrática de honorarios.">ⓘ</span>
                                </p>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-3">
                          <div className="space-y-1.5 w-40">
                            <div>
                              <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"><span>Físico</span><span className="text-[#00e03c]">{p.progress}%</span></div>
                              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden"><div className="bg-[#00e03c] h-full rounded-full" style={{ width: `${p.progress}%` }} /></div>
                            </div>
                            {!done && (
                              <div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5"><span>Temporal</span><span className="text-blue-400">{tp}%</span></div>
                                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full rounded-full" style={{ width: `${tp}%` }} /></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${badge}`}>{status}</span></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(p)} className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            {!done && <button onClick={() => handleConcludeProject(p.id)} className="p-1.5 bg-[#00e03c]/10 border border-[#00e03c]/20 text-[#00e03c] hover:bg-[#00e03c]/20 rounded-lg transition-colors text-[9px] font-black px-2">✓</button>}
                            {!done && <button onClick={() => { handleUpdateProjectProgress(p.id); triggerToast(`${p.client} +10%`, 'success'); }} className="p-1.5 bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] rounded-lg transition-colors text-[9px] font-black px-2">+10%</button>}
                            <button onClick={() => { if (confirm(`¿Eliminar "${p.client}"?`)) handleDeleteProject(p.id); }} className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Edit Modal Inline */}
          <AnimatePresence>
            {editingId && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GlassCard className="p-6 space-y-4 border-[#00e03c]/20">
                  <div className="flex items-center justify-between"><h4 className="font-extrabold text-white text-sm">Editar Proyecto</h4><button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button></div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input className={inputCls} placeholder="Cliente" value={editState.client || ''} onChange={e => setEditState(s => ({ ...s, client: e.target.value }))} />
                    <input className={inputCls} placeholder="Tipo de Estudio" value={editState.type || ''} onChange={e => setEditState(s => ({ ...s, type: e.target.value }))} />
                    <select className={selectCls} value={editState.lead || ''} onChange={e => setEditState(s => ({ ...s, lead: e.target.value }))}>{registeredEngineers.map(e => <option key={e.email} value={e.name}>{e.name}</option>)}</select>
                    <input className={inputCls} type="range" min="0" max="100" step="5" value={editState.progress || 0} onChange={e => setEditState(s => ({ ...s, progress: +e.target.value }))} />
                    <input className={inputCls} type="date" value={editState.startDate || ''} onChange={e => setEditState(s => ({ ...s, startDate: e.target.value }))} />
                    <input className={inputCls} type="date" value={editState.endDate || ''} onChange={e => setEditState(s => ({ ...s, endDate: e.target.value }))} />
                    <input className={inputCls} type="number" placeholder="Presupuesto" value={editState.budget || ''} onChange={e => setEditState(s => ({ ...s, budget: e.target.value }))} />
                    <input className={inputCls} type="number" placeholder="Costos Lab" value={editState.labCosts || ''} onChange={e => setEditState(s => ({ ...s, labCosts: e.target.value }))} />
                    <input className={inputCls} type="number" placeholder="Costos Tercerizados" value={editState.subcontractorCosts || ''} onChange={e => setEditState(s => ({ ...s, subcontractorCosts: e.target.value }))} />
                    <select className={selectCls} value={editState.taxRegime || 'Régimen General'} onChange={e => setEditState(s => ({ ...s, taxRegime: e.target.value }))}>
                      <option value="Régimen General">Régimen General (16%)</option>
                      <option value="Régimen SIETE (5%)">Régimen SIETE (5% Monotributo)</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-lg text-xs font-bold">Cancelar</button>
                    <button onClick={() => { handleEditProject(editingId, { ...editState, progress: +editState.progress }); setEditingId(null); }} className="px-4 py-2 bg-[#00e03c] text-slate-950 rounded-lg text-xs font-black flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Guardar</button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Project Form */}
          <GlassCard className="p-6 space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/[0.06] pb-3">Registrar Nuevo Proyecto B2B</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newProjClient || !newProjType || !newProjLead) { triggerToast('Completa todos los campos requeridos', 'error'); return; }
              handleAddProject(newProjClient, newProjType, newProjLead, newProjStartDate, newProjEndDate, newProjInvolved, newProjBudget || 0, newProjLabCosts || 0, newProjSubcontractorCosts || 0, newProjTaxRegime);
              setNewProjClient(''); setNewProjType(''); setNewProjStartDate(''); setNewProjEndDate(''); setNewProjInvolved([]);
              setNewProjBudget(''); setNewProjLabCosts(''); setNewProjSubcontractorCosts('');
            }} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input required className={inputCls} placeholder="Cliente" value={newProjClient} onChange={e => setNewProjClient(e.target.value)} />
                <input required className={inputCls} placeholder="Tipo de Servicio" value={newProjType} onChange={e => setNewProjType(e.target.value)} />
                <select required className={selectCls} value={newProjLead} onChange={e => setNewProjLead(e.target.value)}>{registeredEngineers.map(e => <option key={e.email} value={e.name}>{e.name}</option>)}</select>
                <input className={inputCls} type="date" value={newProjStartDate} onChange={e => setNewProjStartDate(e.target.value)} />
                <input className={inputCls} type="date" value={newProjEndDate} onChange={e => setNewProjEndDate(e.target.value)} />
                <input className={inputCls} type="number" placeholder="Presupuesto Inicial (Bs.)" value={newProjBudget} onChange={e => setNewProjBudget(e.target.value)} />
                <input className={inputCls} type="number" placeholder="Costos Lab/Equipos (Bs.)" value={newProjLabCosts} onChange={e => setNewProjLabCosts(e.target.value)} />
                <input className={inputCls} type="number" placeholder="Costo Firma Externa (Bs.)" value={newProjSubcontractorCosts} onChange={e => setNewProjSubcontractorCosts(e.target.value)} />
                <select className={selectCls} value={newProjTaxRegime} onChange={e => setNewProjTaxRegime(e.target.value)}>
                  <option value="Régimen General">Régimen General (16% Impuestos)</option>
                  <option value="Régimen SIETE (5%)">Régimen SIETE (5% Monotributo)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#00e03c] text-slate-950 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors">
                <Plus className="w-4 h-4" /> Registrar Proyecto
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {subModule === 'catalog' && (
        <CatalogManager publicServices={publicServices} handlers={{ handleAddPublicService, handleEditPublicService, handleDeletePublicService }} />
      )}

      {subModule === 'specialists' && (
        <SpecialistManager specialists={specialists} handlers={{ handleAddSpecialist, handleEditSpecialist, handleDeleteSpecialist }} />
      )}
    </div>
  );
}

function CatalogManager({ publicServices, handlers }) {
  const { handleAddPublicService, handleEditPublicService, handleDeletePublicService } = handlers;
  const [title, setTitle] = useState('');
  const [line, setLine] = useState('Trámites Ambientales Express');
  const [desc, setDesc] = useState('');
  const [tag, setTag] = useState('RENCA A');
  const [icon, setIcon] = useState('FileText');
  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({});

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#00e03c] transition-all";
  const selectCls = "w-full text-xs px-3 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white";

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 space-y-4">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/[0.06] pb-3">Registrar Nuevo Servicio Público</h4>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!title || !desc) return;
          handleAddPublicService({ title, line, desc, tag, icon });
          setTitle(''); setDesc('');
        }} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input required className={inputCls} placeholder="Nombre del Servicio" value={title} onChange={e => setTitle(e.target.value)} />
            <select className={selectCls} value={line} onChange={e => setLine(e.target.value)}>
              <option value="Trámites Ambientales Express">Trámites Ambientales Express (Firma Propia)</option>
              <option value="Ingeniería y Seguridad Industrial">Ingeniería y Seguridad Industrial (Broker/Subcontratado)</option>
              <option value="Servicios GIS Ambientales">Servicios GIS Ambientales (Firma Propia/No Renca)</option>
            </select>
            <input className={inputCls} placeholder="Etiqueta (ej. RENCA A, Brokerage, SIG)" value={tag} onChange={e => setTag(e.target.value)} />
            <select className={selectCls} value={icon} onChange={e => setIcon(e.target.value)}>
              {['FileText', 'Activity', 'Compass', 'Briefcase', 'Trash2', 'Leaf', 'Globe', 'Map', 'BookOpen'].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <textarea required className={`${inputCls} min-h-[60px]`} placeholder="Descripción comercial del servicio..." value={desc} onChange={e => setDesc(e.target.value)} />
          <button type="submit" className="w-full bg-[#00e03c] text-slate-950 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors">
            <Plus className="w-4 h-4" /> Agregar al Catálogo Público
          </button>
        </form>
      </GlassCard>

      <AnimatePresence>
        {editingId && (
          <GlassCard className="p-6 space-y-4 border-[#00e03c]/20">
            <div className="flex items-center justify-between"><h4 className="font-extrabold text-white text-sm">Editar Servicio Público</h4><button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Nombre" value={editState.title || ''} onChange={e => setEditState(s => ({ ...s, title: e.target.value }))} />
              <select className={selectCls} value={editState.line || ''} onChange={e => setEditState(s => ({ ...s, line: e.target.value }))}>
                <option value="Trámites Ambientales Express">Trámites Ambientales Express</option>
                <option value="Ingeniería y Seguridad Industrial">Ingeniería y Seguridad Industrial</option>
                <option value="Servicios GIS Ambientales">Servicios GIS Ambientales</option>
              </select>
              <input className={inputCls} placeholder="Etiqueta" value={editState.tag || ''} onChange={e => setEditState(s => ({ ...s, tag: e.target.value }))} />
              <select className={selectCls} value={editState.icon || 'FileText'} onChange={e => setEditState(s => ({ ...s, icon: e.target.value }))}>
                {['FileText', 'Activity', 'Compass', 'Briefcase', 'Trash2', 'Leaf', 'Globe', 'Map', 'BookOpen'].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <textarea className={`${inputCls} min-h-[60px]`} placeholder="Descripción" value={editState.desc || ''} onChange={e => setEditState(s => ({ ...s, desc: e.target.value }))} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-lg text-xs font-bold">Cancelar</button>
              <button onClick={() => { handleEditPublicService(editingId, editState); setEditingId(null); }} className="px-4 py-2 bg-[#00e03c] text-slate-950 rounded-lg text-xs font-black flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Guardar</button>
            </div>
          </GlassCard>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {publicServices.map(s => (
          <div key={s.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-white/[0.10] transition-colors">
            <div>
              <p className="font-extrabold text-sm text-white">{s.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.line} · Etiqueta: <span className="text-[#00e03c]">{s.tag}</span> · Icono: {s.icon}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{s.desc}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditingId(s.id); setEditState({ title: s.title, line: s.line, tag: s.tag, icon: s.icon, desc: s.desc }); }} className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDeletePublicService(s.id)} className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecialistManager({ specialists, handlers }) {
  const { handleAddSpecialist, handleEditSpecialist, handleDeleteSpecialist } = handlers;
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [renca, setRenca] = useState('');
  const [syso, setSyso] = useState('');
  const [city, setCity] = useState('Santa Cruz');
  const [rate, setRate] = useState('');
  const [hasFactura, setHasFactura] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({});

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#00e03c] transition-all";
  const selectCls = "w-full text-xs px-3 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white";

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 space-y-4">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/[0.06] pb-3">Registrar Especialista de Firma Externa</h4>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!name || !contact) return;
          handleAddSpecialist({ name, contact, renca: renca || 'N/A', syso: syso || 'N/A', city, rate: parseFloat(rate) || 0, hasFactura });
          setName(''); setContact(''); setRenca(''); setSyso(''); setRate('');
        }} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input required className={inputCls} placeholder="Nombre Completo" value={name} onChange={e => setName(e.target.value)} />
            <input required className={inputCls} placeholder="Teléfono / Contacto" value={contact} onChange={e => setContact(e.target.value)} />
            <input className={inputCls} placeholder="Registro RENCA (B/C)" value={renca} onChange={e => setRenca(e.target.value)} />
            <input className={inputCls} placeholder="Registro SySO Min. Trabajo" value={syso} onChange={e => setSyso(e.target.value)} />
            <select className={selectCls} value={city} onChange={e => setCity(e.target.value)}>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="La Paz">La Paz</option>
              <option value="Cochabamba">Cochabamba</option>
              <option value="Oruro">Oruro</option>
              <option value="Potosí">Potosí</option>
              <option value="Tarija">Tarija</option>
              <option value="Chuquisaca">Chuquisaca</option>
              <option value="Beni">Beni</option>
              <option value="Pando">Pando</option>
            </select>
            <input className={inputCls} type="number" placeholder="Tarifa por Firma (Bs.)" value={rate} onChange={e => setRate(e.target.value)} />
            <div className="flex items-center gap-2 px-3">
              <input type="checkbox" id="hasFactura" checked={hasFactura} onChange={e => setHasFactura(e.target.checked)} className="rounded bg-white/[0.08]" />
              <label htmlFor="hasFactura" className="text-xs text-slate-300">¿Emite Factura?</label>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#00e03c] text-slate-950 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors">
            <Plus className="w-4 h-4" /> Agregar Especialista
          </button>
        </form>
      </GlassCard>

      <AnimatePresence>
        {editingId && (
          <GlassCard className="p-6 space-y-4 border-[#00e03c]/20">
            <div className="flex items-center justify-between"><h4 className="font-extrabold text-white text-sm">Editar Especialista</h4><button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Nombre" value={editState.name || ''} onChange={e => setEditState(s => ({ ...s, name: e.target.value }))} />
              <input className={inputCls} placeholder="Contacto" value={editState.contact || ''} onChange={e => setEditState(s => ({ ...s, contact: e.target.value }))} />
              <input className={inputCls} placeholder="RENCA" value={editState.renca || ''} onChange={e => setEditState(s => ({ ...s, renca: e.target.value }))} />
              <input className={inputCls} placeholder="SySO" value={editState.syso || ''} onChange={e => setEditState(s => ({ ...s, syso: e.target.value }))} />
              <input className={inputCls} type="number" placeholder="Tarifa" value={editState.rate || ''} onChange={e => setEditState(s => ({ ...s, rate: parseFloat(e.target.value) || 0 }))} />
              <div className="flex items-center gap-2 px-3">
                <input type="checkbox" id="editHasFactura" checked={editState.hasFactura || false} onChange={e => setEditState(s => ({ ...s, hasFactura: e.target.checked }))} className="rounded" />
                <label htmlFor="editHasFactura" className="text-xs text-slate-300">¿Emite Factura?</label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-lg text-xs font-bold">Cancelar</button>
              <button onClick={() => { handleEditSpecialist(editingId, editState); setEditingId(null); }} className="px-4 py-2 bg-[#00e03c] text-slate-950 rounded-lg text-xs font-black flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Guardar</button>
            </div>
          </GlassCard>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialists.map(s => (
          <div key={s.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3 hover:border-[#00e03c]/20 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-extrabold text-sm text-white leading-snug">{s.name}</p>
                <p className="text-[10px] text-slate-500">{s.city} · Tel: {s.contact}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingId(s.id); setEditState(s); }} className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDeleteSpecialist(s.id)} className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              <p>RENCA: <span className="text-[#00e03c] font-mono">{s.renca}</span></p>
              <p>SySO: <span className="text-blue-400 font-mono">{s.syso}</span></p>
              <p>Tarifa Firma: <span className="text-white font-bold">Bs. {s.rate}</span> ({s.hasFactura ? 'Factura' : 'Con Retención'})</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: ACADEMY
// ─────────────────────────────────────────────────────────────────────────────
function AcademyModule({ courses, registeredEngineers, handlers }) {
  const { handleAddCourse, handleUpdateCourse, handleDeleteCourse, triggerToast } = handlers;
  
  // Create state
  const [form, setForm] = useState({
    title: '',
    instructor: registeredEngineers[0]?.name || 'Ing. Diego Barrientos',
    type: 'gratis',
    price: 0,
    duration: '10 horas',
    desc: '',
    image: '/assets/covers/cover_ebook_ley1333.png'
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    instructor: '',
    type: 'gratis',
    price: 0,
    duration: '',
    desc: '',
    image: ''
  });

  // Preset covers based on type
  const PRESET_COVERS = {
    gratis: '/assets/covers/cover_ebook_ley1333.png',
    low_ticket: '/assets/covers/cover_qgis_basico.png',
    mid_ticket: '/assets/covers/cover_taller_fichas.png',
    high_ticket: '/assets/covers/cover_mentoria_consultoria.png'
  };

  const handleTypeChange = (type, isEdit = false) => {
    const cover = PRESET_COVERS[type] || PRESET_COVERS.gratis;
    if (isEdit) {
      setEditForm(prev => ({ ...prev, type, image: cover, price: type === 'gratis' ? 0 : prev.price }));
    } else {
      setForm(prev => ({ ...prev, type, image: cover, price: type === 'gratis' ? 0 : prev.price }));
    }
  };

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]/40 transition-all";
  const selectCls = "w-full text-xs px-3 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white";

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title || !form.instructor) {
      triggerToast('Título e Instructor son requeridos', 'error');
      return;
    }
    handleAddCourse({
      ...form,
      isPremium: form.type !== 'gratis'
    });
    setForm({
      title: '',
      instructor: registeredEngineers[0]?.name || 'Ing. Diego Barrientos',
      type: 'gratis',
      price: 0,
      duration: '10 horas',
      desc: '',
      image: '/assets/covers/cover_ebook_ley1333.png'
    });
  };

  const handleStartEdit = (course) => {
    setEditingId(course.id);
    setEditForm({
      title: course.title,
      instructor: course.instructor,
      type: course.type || 'gratis',
      price: course.price || 0,
      duration: course.duration || '10 horas',
      desc: course.desc || '',
      image: course.image || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.instructor) {
      triggerToast('Título e Instructor son requeridos', 'error');
      return;
    }
    handleUpdateCourse(editingId, {
      ...editForm,
      isPremium: editForm.type !== 'gratis'
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORMULARIO CRUD (Izquierda / 1 Columna) */}
        <div className="lg:col-span-1 space-y-6">
          
          {editingId === null ? (
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Plus className="w-4 h-4 text-[#00e03c]" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Añadir Recurso</h4>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Título de la Lección / Recurso</label>
                  <input required className={inputCls} placeholder="Ej: QGIS Básico para Cuencas" value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Categoría</label>
                    <select className={selectCls} value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                      <option value="gratis">Gratis (Lead Magnet)</option>
                      <option value="low_ticket">Low Ticket (Base)</option>
                      <option value="mid_ticket">Mid Ticket (Taller)</option>
                      <option value="high_ticket">High Ticket (VIP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Precio (Bs.)</label>
                    <input type="number" min={0} disabled={form.type === 'gratis'} className={inputCls} value={form.price} onChange={e => setForm(s => ({ ...s, price: +e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Instructor / Mentor</label>
                    <select className={selectCls} value={form.instructor} onChange={e => setForm(s => ({ ...s, instructor: e.target.value }))}>
                      {registeredEngineers.map(e => <option key={e.email} value={e.name}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Duración / Páginas</label>
                    <input className={inputCls} placeholder="Ej: 15 horas, 90 págs" value={form.duration} onChange={e => setForm(s => ({ ...s, duration: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Descripción Corta</label>
                  <textarea className={`${inputCls} h-20 resize-none`} placeholder="Describe brevemente el contenido..." value={form.desc} onChange={e => setForm(s => ({ ...s, desc: e.target.value }))} />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Ruta de Portada (Assets)</label>
                  <input className={inputCls} placeholder="Ruta de imagen" value={form.image} onChange={e => setForm(s => ({ ...s, image: e.target.value }))} />
                </div>

                <button type="submit" className="w-full bg-[#00e03c] text-slate-950 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors mt-2 shadow-[0_0_15px_rgba(0,224,60,0.15)]"><Plus className="w-4 h-4" /> Agregar Recurso</button>
              </form>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 space-y-4 border-[#00e03c]/40">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Editar Recurso</h4>
                </div>
                <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Título de la Lección / Recurso</label>
                  <input required className={inputCls} placeholder="Título" value={editForm.title} onChange={e => setEditForm(s => ({ ...s, title: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Categoría</label>
                    <select className={selectCls} value={editForm.type} onChange={e => handleTypeChange(e.target.value, true)}>
                      <option value="gratis">Gratis (Lead Magnet)</option>
                      <option value="low_ticket">Low Ticket (Base)</option>
                      <option value="mid_ticket">Mid Ticket (Taller)</option>
                      <option value="high_ticket">High Ticket (VIP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Precio (Bs.)</label>
                    <input type="number" min={0} disabled={editForm.type === 'gratis'} className={inputCls} value={editForm.price} onChange={e => setEditForm(s => ({ ...s, price: +e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Instructor / Mentor</label>
                    <select className={selectCls} value={editForm.instructor} onChange={e => setEditForm(s => ({ ...s, instructor: e.target.value }))}>
                      {registeredEngineers.map(e => <option key={e.email} value={e.name}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Duración / Páginas</label>
                    <input className={inputCls} placeholder="Duración" value={editForm.duration} onChange={e => setEditForm(s => ({ ...s, duration: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Descripción Corta</label>
                  <textarea className={`${inputCls} h-20 resize-none`} placeholder="Descripción" value={editForm.desc} onChange={e => setEditForm(s => ({ ...s, desc: e.target.value }))} />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Ruta de Portada (Assets)</label>
                  <input className={inputCls} placeholder="Ruta de imagen" value={editForm.image} onChange={e => setEditForm(s => ({ ...s, image: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button type="button" onClick={() => setEditingId(null)} className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl font-bold text-xs uppercase transition-colors flex items-center justify-center gap-1.5"><X className="w-3.5 h-3.5" /> Cancelar</button>
                  <button type="submit" className="w-full bg-amber-500 text-slate-950 py-2 rounded-xl font-black text-xs uppercase hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5"><Check className="w-3.5 h-3.5" /> Guardar</button>
                </div>
              </form>
            </GlassCard>
          )}

        </div>

        {/* LISTADO DINÁMICO (Derecha / 2 Columnas) */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Catálogo Activo</h4>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{courses.length} Recursos</span>
            </div>
            
            <div className="space-y-3">
              {courses.map(c => (
                <motion.div
                  key={c.id}
                  layout
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/15 transition-all gap-4 text-left"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Thumbnail */}
                    <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-[#050505] border border-white/5">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-white">{c.title.replace(/\*/g, '')}</h5>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 mt-1 font-mono">
                        <span className="text-[#00e03c] font-semibold uppercase">{c.type?.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Instructor: {c.instructor}</span>
                        <span>•</span>
                        <span>{c.duration}</span>
                        <span>•</span>
                        <span className="text-white font-bold">{c.price === 0 ? 'Gratuito' : `Bs. ${c.price}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-lg transition-colors"
                      title="Editar recurso"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente "${c.title.replace(/\*/g, '')}"?`)) {
                          handleDeleteCourse(c.id);
                        }
                      }}
                      className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                      title="Eliminar recurso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: EXPERIENCE
// ─────────────────────────────────────────────────────────────────────────────
function ExperienceModule({ experiences, handlers }) {
  const { handleAddExperience, handleEditExperience, handleDeleteExperience, triggerToast } = handlers;
  const [form, setForm] = useState({ name: '', date: '', location: '', capacity: 20, price: 0, type: 'Voluntariado' });

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-[#00e03c]/40";
  const typeColors = { Voluntariado: 'text-[#00e03c] bg-[#00e03c]/10 border-[#00e03c]/20', Ecoturismo: 'text-blue-400 bg-blue-400/10 border-blue-400/20', Taller: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 space-y-4">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/[0.06] pb-3">Nueva Experiencia / Evento</h4>
        <form onSubmit={(e) => { e.preventDefault(); if (!form.name || !form.date || !form.location) return; handleAddExperience(form); setForm({ name: '', date: '', location: '', capacity: 20, price: 0, type: 'Voluntariado' }); }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input required className={inputCls} placeholder="Nombre de la Experiencia" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
          <input required className={inputCls} type="date" value={form.date} onChange={e => setForm(s => ({ ...s, date: e.target.value }))} />
          <input required className={inputCls} placeholder="Ubicación" value={form.location} onChange={e => setForm(s => ({ ...s, location: e.target.value }))} />
          <input className={inputCls} type="number" placeholder="Cupo máx." min={1} value={form.capacity} onChange={e => setForm(s => ({ ...s, capacity: +e.target.value }))} />
          <input className={inputCls} type="number" placeholder="Precio (Bs.)" min={0} value={form.price} onChange={e => setForm(s => ({ ...s, price: +e.target.value }))} />
          <select className="w-full text-xs px-3 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white" value={form.type} onChange={e => setForm(s => ({ ...s, type: e.target.value }))}>
            {['Voluntariado', 'Ecoturismo', 'Taller', 'Expedición', 'Corporativo'].map(t => <option key={t}>{t}</option>)}
          </select>
          <button type="submit" className="col-span-full bg-[#00e03c] text-slate-950 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors"><Plus className="w-4 h-4" /> Registrar Experiencia</button>
        </form>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiences.map(exp => {
          const pct = Math.round((exp.enrolled / exp.capacity) * 100);
          return (
            <motion.div key={exp.id} variants={fadeUp} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3 hover:border-white/[0.10] transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-extrabold text-sm text-white leading-snug">{exp.name}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider mt-1 inline-block ${typeColors[exp.type] || 'text-slate-400 bg-white/[0.04] border-white/[0.08]'}`}>{exp.type}</span>
                </div>
                <button onClick={() => { if (confirm(`¿Eliminar "${exp.name}"?`)) handleDeleteExperience(exp.id); }} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-1 text-[11px] text-slate-500">
                <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {exp.date}</p>
                <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {exp.location}</p>
                <p className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> {exp.price === 0 ? 'Gratuito' : `Bs. ${exp.price}`}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {exp.enrolled}/{exp.capacity} inscritos</span>
                  <span className={exp.status === 'Lleno' ? 'text-rose-400' : 'text-[#00e03c]'}>{exp.status}</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${exp.status === 'Lleno' ? 'bg-rose-500' : 'bg-[#00e03c]'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: STORE
// ─────────────────────────────────────────────────────────────────────────────
function StoreModule({ productList, handlers }) {
  const { handleAddProduct, handleEditProduct, handleDeleteProduct, handleToggleProductPremium, triggerToast } = handlers;
  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({});

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#00e03c] transition-all";

  return (
    <div className="space-y-4">
      <GlassCard className="p-6 overflow-x-auto">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
          <h4 className="text-sm font-extrabold text-white">Inventario del Catálogo</h4>
          <span className="text-[9px] text-slate-500 font-bold">{productList.length} productos</span>
        </div>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="text-slate-500 uppercase tracking-widest text-[9px] font-black border-b border-white/[0.06]">
              {['Producto', 'Categoría', 'Precio (Bs.)', 'Stock', 'Tipo', 'Acciones'].map(h => <th key={h} className="p-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {productList.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                {editingId === p.id ? (
                  <>
                    <td className="p-2"><input className={inputCls} value={editState.name || ''} onChange={e => setEditState(s => ({ ...s, name: e.target.value }))} /></td>
                    <td className="p-2"><input className={inputCls} value={editState.category || ''} onChange={e => setEditState(s => ({ ...s, category: e.target.value }))} /></td>
                    <td className="p-2"><input type="number" className={inputCls} value={editState.price || 0} onChange={e => setEditState(s => ({ ...s, price: +e.target.value }))} /></td>
                    <td className="p-2"><input type="number" className={inputCls} value={editState.stock || 0} onChange={e => setEditState(s => ({ ...s, stock: +e.target.value }))} /></td>
                    <td className="p-2 text-slate-400">{p.isPremium ? 'Premium' : 'Normal'}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <button onClick={() => { handleEditProduct(editingId, editState); setEditingId(null); }} className="p-1.5 bg-[#00e03c]/20 text-[#00e03c] rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-white/[0.04] text-slate-400 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 font-bold text-white">{p.name}</td>
                    <td className="p-3 text-slate-400">{p.category}</td>
                    <td className="p-3 font-black text-[#00e03c]">Bs. {p.price}</td>
                    <td className="p-3 text-slate-300">{p.stock}</td>
                    <td className="p-3">
                      <button onClick={() => handleToggleProductPremium(p.id)} className={`text-[9px] font-black px-2 py-1 rounded-lg border transition-colors ${p.isPremium ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/[0.04] border-white/[0.08] text-slate-500'}`}>{p.isPremium ? '★ Premium' : 'Normal'}</button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingId(p.id); setEditState({ name: p.name, category: p.category, price: p.price, stock: p.stock }); }} className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm(`¿Eliminar "${p.name}"?`)) handleDeleteProduct(p.id); }} className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: USERS
// ─────────────────────────────────────────────────────────────────────────────
function UsersModule({ registeredUsers, handlers }) {
  const { handleToggleUserPremium, handleRevokeUserAccess, triggerToast } = handlers;
  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <h3 className="font-extrabold text-white text-sm">Auditoría de Usuarios del SaaS</h3>
        <span className="text-[9px] text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-3 py-1 rounded-full font-black uppercase">{registeredUsers.length} Cuentas</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="text-slate-500 uppercase text-[9px] font-black tracking-widest border-b border-white/[0.06]">
              {['Usuario', 'Correo', 'Rol', 'Estado', 'Acción'].map(h => <th key={h} className="p-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {registeredUsers.map(u => {
              const isAdmin = u.role === 'AdminMod';
              const initials = u.name.replace('Ing. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <tr key={u.email} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${isAdmin ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-[#00e03c]/10 text-[#00e03c] border border-[#00e03c]/20'}`}>{initials || 'U'}</div>
                    <div><p className="font-extrabold text-white">{u.name}</p><p className="text-[9px] text-slate-500 uppercase tracking-widest">{isAdmin ? 'Socio Fundador' : 'Cliente'}</p></div>
                  </td>
                  <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-[9px] font-bold border ${isAdmin ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-[#00e03c]/10 border-[#00e03c]/20 text-[#00e03c]'}`}>{u.role}</span></td>
                  <td className="p-3">{isAdmin ? <span className="text-amber-400 font-bold text-[9px] bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">Vitalicio Pro</span> : <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${u.isPremiumApproved ? 'bg-[#00e03c]/10 text-[#00e03c] border-[#00e03c]/20' : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'}`}>{u.isPremiumApproved ? 'Pro Premium' : 'Básico'}</span>}</td>
                  <td className="p-3">{isAdmin ? <span className="text-slate-600 text-[10px] italic">Socio Fundador</span> : (
                    <div className="flex gap-1.5">
                      <button onClick={() => { handleToggleUserPremium(u.email); triggerToast(u.isPremiumApproved ? `Premium removido para ${u.name}` : `Premium concedido a ${u.name}`, 'success'); }} className={`px-2 py-1 rounded-lg text-[9px] font-black border transition-colors ${u.isPremiumApproved ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' : 'bg-[#00e03c]/10 border-[#00e03c]/20 text-[#00e03c] hover:bg-[#00e03c]/20'}`}>{u.isPremiumApproved ? 'Degradar' : 'Aprobar Premium'}</button>
                      <button onClick={() => { if (confirm(`¿Revocar acceso para ${u.name}?`)) handleRevokeUserAccess(u.email); }} className="px-2 py-1 rounded-lg text-[9px] font-black border bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors">Eliminar</button>
                    </div>
                  )}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: FINANCES (Executive Cockpit Financial Suite)
// ─────────────────────────────────────────────────────────────────────────────
function FinancesModule() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [inflowFilter, setInflowFilter] = useState('Inflow');

  // Datos de Flujo de Caja Mensual (12 Meses)
  const cashflowMonthly = [
    { month: 'Ene', Inflow: 14.5, Outflow: 9.2, Net: 5.3 },
    { month: 'Feb', Inflow: 16.8, Outflow: 10.5, Net: 6.3 },
    { month: 'Mar', Inflow: 19.2, Outflow: 11.4, Net: 7.8 },
    { month: 'Abr', Inflow: 21.5, Outflow: 13.2, Net: 8.3 },
    { month: 'May', Inflow: 23.1, Outflow: 14.8, Net: 8.3 },
    { month: 'Jun', Inflow: 24.85, Outflow: 16.15, Net: 8.7, isPeak: true },
    { month: 'Jul', Inflow: 26.4, Outflow: 16.5, Net: 9.9 },
    { month: 'Ago', Inflow: 28.0, Outflow: 17.2, Net: 10.8 },
    { month: 'Sep', Inflow: 27.5, Outflow: 17.0, Net: 10.5 },
    { month: 'Oct', Inflow: 29.8, Outflow: 18.1, Net: 11.7 },
    { month: 'Nov', Inflow: 31.2, Outflow: 18.9, Net: 12.3 },
    { month: 'Dic', Inflow: 34.5, Outflow: 20.1, Net: 14.4 },
  ];

  // Mini Sparkline para el Balance (VAN)
  const vanSparkline = [
    { m: 'Ene', val: 78 },
    { m: 'Feb', val: 86 },
    { m: 'Mar', val: 95 },
    { m: 'Abr', val: 106 },
    { m: 'May', val: 115 },
    { m: 'Jun', val: 124.5 },
  ];

  // Radar de Estructura Multidimensional
  const radarStructure = [
    { subject: 'Inflow', value: 95 },
    { subject: 'Planning', value: 85 },
    { subject: 'Saving', value: 72 },
    { subject: 'Online Consult', value: 88 },
    { subject: 'Research', value: 65 },
  ];

  // Desglose EBITDA & Estructura de Costos
  const ebitdaBreakdown = [
    { name: 'Consultores & Planillas', value: 7268, percent: 45, color: '#00e03c' },
    { name: 'Costos Fijos & Lab', value: 4845, percent: 30, color: '#00b4d8' },
    { name: 'Impuestos (SIETE 5%)', value: 2422, percent: 15, color: '#7b2cbf' },
    { name: 'Margen EBITDA', value: 1618, percent: 10, color: '#38bdf8' },
  ];

  // Comparativa de Costos vs Break-Even vs Ingresos
  const breakEvenTimeline = [
    { month: 'Ene', Ingresos: 14500, Costos: 9200, Equilibrio: 12400 },
    { month: 'Feb', Ingresos: 16800, Costos: 10500, Equilibrio: 12400 },
    { month: 'Mar', Ingresos: 19200, Costos: 11400, Equilibrio: 12400 },
    { month: 'Abr', Ingresos: 21500, Costos: 13200, Equilibrio: 12400 },
    { month: 'May', Ingresos: 23100, Costos: 14800, Equilibrio: 12400 },
    { month: 'Jun', Ingresos: 24850, Costos: 16153, Equilibrio: 12400 },
  ];

  // Planes Anuales
  const annualPlans = [
    { year: '2024', Projected: 120, Actual: 114 },
    { year: '2025', Projected: 180, Actual: 195 },
    { year: '2026', Projected: 280, Actual: 298 },
  ];

  return (
    <div className="space-y-6 select-none opacity-100 visible">
      
      {/* ── TOP HEADER / FILTER BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#081018]/90 border border-cyan-500/20 rounded-2xl px-6 py-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              Personal & Corporate Finance <span className="text-[10px] text-[#00e03c] font-bold bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">SERAM PRO</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Cockpit Financiero de Retorno, Flujo de Caja y Métricas Ejecutivas</p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
            {['Dashboard', 'Structure', 'Costs', 'Budget'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === t
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
            {['2024', '2025', '2026'].map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedYear === y
                    ? 'bg-[#00e03c] text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN SUPERIOR: 3 COLUMNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COL 1: BALANCE & VAN CARD (3.5 cols) */}
        <div className="lg:col-span-4 bg-[#081018]/90 border border-cyan-500/20 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Balance Total · VAN</span>
              <span className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 text-xs font-bold">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">Bs. 124,500</h3>
              <p className="text-[11px] text-[#00e03c] font-bold flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Valor Actual Neto (Tasa 12%)
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs border-t border-white/[0.06]">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Inflow</span>
                <span className="text-lg font-black text-white">Bs. 24,850</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Budget Load</span>
                <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                  41%
                </span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-20 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vanSparkline}>
                  <defs>
                    <linearGradient id="vanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e03c" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00e03c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="val" stroke="#00e03c" strokeWidth={2.5} fill="url(#vanGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metas / Goals */}
          <div className="space-y-3 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Goals: Bs. 124.5k / 150k</span>
              <span className="text-[#00e03c] font-black">83%</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Consultoría B2B (EsIA / RAI)</span>
                  <span className="text-white font-bold">Bs. 9,850 (85%)</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>SERAM Academy & Cursos</span>
                  <span className="text-white font-bold">Bs. 11,500 (92%)</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00e03c] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Store & Experiencias</span>
                  <span className="text-white font-bold">Bs. 3,500 (70%)</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COL 2: INFLOW BAR CHART (5 cols) */}
        <div className="lg:col-span-5 bg-[#081018]/90 border border-cyan-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inflow & Cashflow Projections</span>
              <h4 className="text-xl font-black text-white tracking-tight">Bs. 24,850 <span className="text-xs text-[#00e03c] font-bold">↑ +12.4%</span></h4>
            </div>

            <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[11px]">
              {['Crédito', 'Débito', 'Inflow'].map(f => (
                <button
                  key={f}
                  onClick={() => setInflowFilter(f)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    inflowFilter === f ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowMonthly} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `Bs.${v}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-[#0b131b]/95 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs shadow-2xl backdrop-blur-md">
                        <p className="font-bold text-slate-300 uppercase tracking-widest mb-1">{label}</p>
                        <p className="font-black text-[#00e03c]">Inflow: Bs. {(payload[0].value * 1000).toLocaleString()}</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="Inflow"
                  radius={[6, 6, 0, 0]}
                  shape={(props) => {
                    const { fill, x, y, width, height, payload } = props;
                    const isJun = payload.month === 'Jun';
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx={6}
                        fill={isJun ? '#00e03c' : '#00b4d8'}
                        fillOpacity={isJun ? 1 : 0.65}
                        stroke={isJun ? '#00e03c' : 'none'}
                        className="transition-all hover:opacity-100"
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]" /> Promedio Q1: Bs. 16.8k</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00e03c]" /> Actual Q2: Bs. 24.8k (Pico)</span>
          </div>
        </div>

        {/* COL 3: RADAR STRUCTURE (3 cols) */}
        <div className="lg:col-span-3 bg-[#081018]/90 border border-cyan-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
          <div className="border-b border-white/[0.06] pb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Structure Performance</span>
            <h4 className="text-base font-extrabold text-white">Análisis Multidimensional</h4>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarStructure}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                <Radar name="SERAM" dataKey="value" stroke="#00e03c" fill="#00e03c" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Eficiencia Global: 85.2%</span>
          </div>
        </div>

      </div>

      {/* ── SECCIÓN MEDIA: DONUTS & DESGLOSES (EBITDA & TIR) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* DONUT 1: EBITDA & COSTOS (7 cols) */}
        <div className="lg:col-span-7 bg-[#081018]/90 border border-cyan-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EBITDA & Margen Operativo</span>
              <h4 className="text-lg font-black text-white">Distribución de Egresos y Utilidad Operativa</h4>
            </div>
            <span className="text-xs font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-3 py-1 rounded-full">
              35% Margen
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-5 h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ebitdaBreakdown}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ebitdaBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#081018" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs font-bold text-slate-400">EBITDA</span>
                <span className="text-lg font-black text-white">Bs. 8,697</span>
              </div>
            </div>

            {/* List breakdown */}
            <div className="sm:col-span-7 space-y-3">
              {ebitdaBreakdown.map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-300 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-white font-bold font-mono">Bs. {item.value.toLocaleString()} ({item.percent}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DONUT 2: TIR & RENTABILIDAD B2B (5 cols) */}
        <div className="lg:col-span-5 bg-[#081018]/90 border border-cyan-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TIR (Tasa Interna de Retorno)</span>
              <h4 className="text-lg font-black text-white">Rentabilidad del Portafolio B2B</h4>
            </div>
            <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
              TIR: 28.6%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-5 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Retorno TIR', value: 28.6, color: '#00e03c' },
                      { name: 'Tasa Oportunidad', value: 12.0, color: '#00b4d8' },
                      { name: 'Reserva', value: 59.4, color: '#1e293b' },
                    ]}
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#00e03c" stroke="#081018" />
                    <Cell fill="#00b4d8" stroke="#081018" />
                    <Cell fill="#1e293b" stroke="#081018" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-[#00e03c]">28.6%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Rentabilidad</span>
              </div>
            </div>

            {/* KPIs Rápidos */}
            <div className="sm:col-span-7 space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                <span className="text-slate-400">Payback (Recuperación):</span>
                <span className="text-white font-bold font-mono">4.2 Meses</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                <span className="text-slate-400">Índice Beneficio/Costo:</span>
                <span className="text-[#00e03c] font-bold font-mono">1.68x</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                <span className="text-slate-400">Ratio de Solvencia:</span>
                <span className="text-cyan-400 font-bold font-mono">2.1x</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/[0.06] pt-2">
            El rendimiento supera con holgura la tasa de corte bancaria y de oportunidad de mercado (12%), garantizando autosuficiencia de capital para proyectos mineros e industriales.
          </p>
        </div>

      </div>

      {/* ── SECCIÓN INFERIOR: BREAK-EVEN & ANNUAL PLANS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* BREAK-EVEN COMPARISON (8 cols) */}
        <div className="lg:col-span-8 bg-[#081018]/90 border border-cyan-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Punto de Equilibrio (Break-Even) vs Ingresos</span>
              <h4 className="text-lg font-black text-white">Evolución de Ingresos vs Costos Operativos</h4>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="px-2.5 py-1 rounded-full bg-[#00e03c]/10 text-[#00e03c] border border-[#00e03c]/20">Ingresos (Bs. 24.8k)</span>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Costos (Bs. 16.1k)</span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Punto Equilibrio (Bs. 12.4k)</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={breakEvenTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ingresosGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e03c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e03c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="costosGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `Bs.${v/1000}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-[#0b131b]/95 border border-cyan-500/30 rounded-xl px-4 py-3 text-xs shadow-2xl backdrop-blur-md space-y-1">
                        <p className="font-bold text-slate-300 uppercase tracking-widest">{label}</p>
                        {payload.map(p => (
                          <p key={p.name} className="font-bold" style={{ color: p.color }}>
                            {p.name}: Bs. {p.value.toLocaleString()}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="Ingresos" stroke="#00e03c" strokeWidth={2.5} fill="url(#ingresosGrad)" />
                <Area type="monotone" dataKey="Costos" stroke="#f43f5e" strokeWidth={2} fill="url(#costosGrad)" />
                <Line type="monotone" dataKey="Equilibrio" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ANNUAL PLANS (4 cols) */}
        <div className="lg:col-span-4 bg-[#081018]/90 border border-cyan-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
          <div className="border-b border-white/[0.06] pb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Annual Plans</span>
            <h4 className="text-lg font-black text-white">Meta vs Ejecutado Real</h4>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualPlans} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `Bs.${v}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-[#0b131b]/95 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs shadow-2xl backdrop-blur-md">
                        <p className="font-bold text-slate-300 uppercase tracking-widest mb-1">Año {label}</p>
                        <p className="text-cyan-400 font-bold">Proyectado: Bs. {payload[0]?.value * 1000}</p>
                        <p className="text-[#00e03c] font-black">Real: Bs. {payload[1]?.value * 1000}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="Projected" fill="#00b4d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#00e03c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
            <span className="text-xs font-extrabold text-cyan-300">Cumplimiento Presupuestario: 106.4%</span>
          </div>
        </div>

      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE: TIME TRACKER
// ─────────────────────────────────────────────────────────────────────────────
function TimeTrackerModule({ timeLogs, activeServices, currentSocio, handlers }) {
  const { handleAddTimeLog, handleDeleteTimeLog, triggerToast } = handlers;
  const [selectedProjectId, setSelectedProjectId] = useState(activeServices[0]?.id || '');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#00e03c] transition-all";
  const selectCls = "w-full text-xs px-3 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white";

  // Partners list for meritocracy calculations
  const partnersList = [
    { email: 'barrientoso2401@gmail.com', name: 'Ing. Diego Barrientos' },
    { email: 'fernandoaraujo1912@gmail.com', name: 'Ing. Fernando Araujo' },
    { email: 'sebastiansbs51@gmail.com', name: 'Ing. Fabricio Orosco' }
  ];

  // Calcular horas totales registradas por este socio
  const myLogs = timeLogs.filter(l => l.partner_id === currentSocio?.email || l.partner_id === currentSocio?.id || l.partner_name === currentSocio?.name);
  const totalHours = myLogs.reduce((acc, curr) => acc + curr.hours, 0);

  // Calcular honorarios meritocráticos por proyecto
  const meritocraticShares = activeServices
    .filter(p => (p.budget || 0) > 0)
    .map(p => {
      const projectLogs = timeLogs.filter(l => l.project_id === p.id || l.project_id === parseInt(p.id));
      const HT = projectLogs.reduce((acc, curr) => acc + curr.hours, 0);

      // Calcular Utilidad Neta del proyecto
      const budget = p.budget || 0;
      const labCosts = p.labCosts || 0;
      const subcontractorCosts = p.subcontractorCosts || 0;
      const isSiete = p.taxRegime === 'Régimen SIETE (5%)';
      const taxes = isSiete ? budget * 0.05 : budget * 0.16; // SIETE 5%; General 16%
      const UN = Math.max(0, budget - taxes - labCosts - subcontractorCosts);

      // Calcular participación por socio
      const shares = partnersList.map(u => {
        const partnerLogs = projectLogs.filter(l => l.partner_id === u.email || l.partner_name === u.name);
        const partnerH = partnerLogs.reduce((acc, curr) => acc + curr.hours, 0);
        const sharePct = HT > 0 ? (partnerH / HT) : 0;
        const shareVal = UN * sharePct;
        return {
          name: u.name,
          hours: partnerH,
          percent: Math.round(sharePct * 100),
          shareBs: Math.round(shareVal)
        };
      });

      return {
        id: p.id,
        client: p.client,
        type: p.type,
        totalHours: HT,
        netProfit: UN,
        shares
      };
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProjectId || !hours || !description) {
      triggerToast('Completa todos los campos del registro', 'error');
      return;
    }
    if (parseFloat(hours) <= 0) {
      triggerToast('Las horas deben ser mayores a 0', 'error');
      return;
    }
    handleAddTimeLog(parseInt(selectedProjectId), parseFloat(hours), description);
    setHours('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Horas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tus Horas Registradas</span>
            <h3 className="text-3xl font-black text-white">{totalHours.toFixed(1)} hrs</h3>
            <p className="text-[10px] text-slate-500 font-bold">Total acumulado en el portal</p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logs Registrados por ti</span>
            <h3 className="text-3xl font-black text-white">{myLogs.length} registros</h3>
            <p className="text-[10px] text-[#00e03c] font-bold">Actividades de consultoría directiva</p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#00e03c]/10 text-[#00e03c] border border-[#00e03c]/20">
            <Calendar className="w-5 h-5" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Registro */}
        <GlassCard className="p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <Plus className="w-4 h-4 text-[#00e03c]" />
            <h3 className="font-extrabold text-white text-sm">Registrar Tiempo</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proyecto</label>
              <select
                required
                className={selectCls}
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
              >
                <option value="" disabled>Selecciona un proyecto</option>
                {activeServices.map(p => (
                  <option key={p.id} value={p.id}>{p.client} — {p.type.slice(0, 30)}...</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horas Dedicadas</label>
              <input
                required
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                className={inputCls}
                placeholder="Ej. 4.5"
                value={hours}
                onChange={e => setHours(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción del Trabajo</label>
              <textarea
                required
                className={`${inputCls} min-h-[80px] resize-none`}
                placeholder="Describe la actividad realizada..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00e03c] text-slate-950 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Clock className="w-4 h-4" /> Registrar Horas
            </button>
          </form>
        </GlassCard>

        {/* Listado de Logs */}
        <GlassCard className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="font-extrabold text-white text-sm">Historial de Tiempos</h3>
            <span className="text-[9px] text-slate-500 font-bold">{timeLogs.length} logs totales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 font-extrabold uppercase tracking-widest border-b border-white/[0.06] text-[9px]">
                  {['Socio', 'Proyecto', 'Descripción', 'Horas', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} className="p-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {timeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">No hay registros de tiempo en el sistema.</td>
                  </tr>
                ) : (
                  timeLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <p className="font-extrabold text-white">{l.partner_name}</p>
                        <p className="text-[9px] text-slate-500 truncate max-w-[120px]">{l.partner_id}</p>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-300">{l.project_title}</span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="text-slate-400 line-clamp-2">{l.description}</p>
                      </td>
                      <td className="p-3">
                        <span className="font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-0.5 rounded-full text-[10px]">{l.hours}h</span>
                      </td>
                      <td className="p-3 text-[10px] text-slate-500 font-mono">
                        {new Date(l.logged_at).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="p-3">
                        {(l.partner_id === currentSocio?.email || l.partner_id === currentSocio?.id || l.partner_name === currentSocio?.name) && (
                          <button
                            onClick={() => { if (confirm('¿Eliminar este registro de horas?')) handleDeleteTimeLog(l.id); }}
                            className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Módulo Meritocrático */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <div>
            <h3 className="font-extrabold text-white text-sm">Distribución Meritocrática de Honorarios</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">La utilidad neta de cada proyecto se reparte proporcionalmente a las horas registradas por cada socio.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meritocraticShares.map(ms => (
            <div key={ms.id} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-3">
              <div>
                <p className="font-extrabold text-xs text-white truncate">{ms.client}</p>
                <p className="text-[9px] text-slate-500 truncate">{ms.type}</p>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Utilidad Neta: <strong className="text-[#00e03c]">Bs. {ms.netProfit.toLocaleString()}</strong></span>
                <span>Horas Totales: <strong>{ms.totalHours.toFixed(1)}h</strong></span>
              </div>
              <div className="space-y-1.5 border-t border-white/[0.04] pt-2">
                {ms.shares.map(s => (
                  <div key={s.name} className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-300 font-semibold">{s.name}</span>
                    <span className="text-slate-500 font-mono">{s.hours.toFixed(1)}h ({s.percent}%)</span>
                    <span className="font-bold text-white">Bs. {s.shareBs.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ── INLINE PARTNER LOGIN COMPONENT ─────────────────────────────────────────
function InlinePartnerLogin({ registeredEngineers, onLogin }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pwd, setPwd] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const navigate = useNavigate();

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setLoadingAuth(true);
    setTimeout(() => {
      onLogin(e, pwd, selectedIdx);
      setLoadingAuth(false);
    }, 350);
  };

  return (
    <div className="min-h-screen neuform-bg flex items-center justify-center p-4 relative z-10">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#00e03c]/10 blur-[140px] pointer-events-none" />

      <div className="bg-[#080f08]/98 backdrop-blur-2xl border border-[#1a3a1a]/70 rounded-3xl w-full max-w-md p-8 sm:p-10 shadow-2xl shadow-black/95 relative animate-fadeIn">
        <div className="text-center mb-6 space-y-3">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-[#00e03c]/15 border border-[#00e03c]/40 p-4 rounded-2xl shadow-[0_0_20px_rgba(0,224,60,0.15)] animate-pulse">
              <Shield className="w-8 h-8 text-[#00e03c]" />
            </div>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight font-tech">Portal de Socios Directivos</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Identifícate para acceder al panel de control integral, proyectos, Time Tracker y finanzas de SERAM S.R.L.
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Selecciona tu Perfil de Socio
            </label>
            <div className="grid grid-cols-1 gap-2">
              {registeredEngineers.map((user, idx) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 ${
                    selectedIdx === idx
                      ? 'border-[#00e03c] bg-[#00e03c]/15 text-white shadow-md shadow-emerald-950/40'
                      : 'border-[#1a3a1a] bg-[#05100a]/70 text-slate-300 hover:border-[#00e03c]/40 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    selectedIdx === idx ? 'bg-[#00e03c] text-slate-950 font-black' : 'bg-white/[0.08] text-slate-300'
                  }`}>
                    {user.name?.replace('Ing. ', '').slice(0, 2).toUpperCase() || 'SO'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono truncate mt-0.5">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Clave Maestra / Firma Directiva
            </label>
            <input
              type="password"
              required
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full bg-[#05100a]/80 border border-[#1a3a1a] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#00e03c] transition-colors placeholder:text-slate-600 focus:ring-1 focus:ring-[#00e03c]/40 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loadingAuth}
            className="w-full bg-[#00e03c] text-slate-950 py-3 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {loadingAuth ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Desbloquear Dashboard
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline"
            >
              ← Volver al Inicio Público
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PartnerDashboard() {
  const {
    activeRole, currentSocio, handleLogoutPartner, handlePartnerLogin,
    registeredUsers, courses, activeServices, experiences, productList,
    timeLogs, handleAddTimeLog, handleDeleteTimeLog,
    handleAddCourse, handleUpdateCourse, handleDeleteCourse, handleToggleCoursePremium,
    handleAddProject, handleUpdateProjectProgress, handleDeleteProject,
    handleEditProject, handleConcludeProject,
    handleToggleUserPremium, handleRevokeUserAccess,
    handleAddExperience, handleEditExperience, handleDeleteExperience, handleEnrollExperience,
    handleAddProduct, handleEditProduct, handleDeleteProduct, handleToggleProductPremium,
    publicServices, setPublicServices, specialists, setSpecialists,
    handleAddPublicService, handleEditPublicService, handleDeletePublicService,
    handleAddSpecialist, handleEditSpecialist, handleDeleteSpecialist,
    triggerToast,
  } = useApp();

  const [activeModule, setActiveModule] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const mainRef = React.useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeModule]);

  useEffect(() => {
    let mounted = true;
    async function fetchMetrics() {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
        const fetchPromise = supabase.from('company_metrics').select('*').limit(1);
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
        if (!error && data?.length > 0 && mounted) setMetrics(data[0]);
      } catch (_) {
        // Fallback inmediato a métricas locales
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (activeRole === 'AdminMod') fetchMetrics();
    else setLoading(false);
    return () => { mounted = false; };
  }, [activeRole]);

  const registeredEngineers = (registeredUsers || []).filter(u => u.role === 'AdminMod' || u.name?.startsWith('Ing.'));
  const safeEngineers = registeredEngineers.length > 0 ? registeredEngineers : [
    { email: 'barrientoso2401@gmail.com', role: 'AdminMod', name: 'Ing. Diego Barrientos', isPremiumApproved: true },
    { email: 'fernandoaraujo1912@gmail.com', role: 'AdminMod', name: 'Ing. Fernando Araujo', isPremiumApproved: true },
    { email: 'sebastiansbs51@gmail.com', role: 'AdminMod', name: 'Ing. Fabricio Orosco', isPremiumApproved: true },
  ];

  const activeSocio = currentSocio || safeEngineers[0] || { name: 'Socio Directivo', email: 'socio@seram.com' };

  const handlers = {
    handleAddCourse, handleUpdateCourse, handleDeleteCourse, handleToggleCoursePremium,
    handleAddProject, handleUpdateProjectProgress, handleDeleteProject,
    handleEditProject, handleConcludeProject,
    handleToggleUserPremium, handleRevokeUserAccess,
    handleAddExperience, handleEditExperience, handleDeleteExperience, handleEnrollExperience,
    handleAddProduct, handleEditProduct, handleDeleteProduct, handleToggleProductPremium,
    handleAddTimeLog, handleDeleteTimeLog,
    handleAddPublicService, handleEditPublicService, handleDeletePublicService,
    handleAddSpecialist, handleEditSpecialist, handleDeleteSpecialist,
    triggerToast,
  };

  const kpis = [
    { label: 'Ingresos Totales', value: metrics?.total_revenue ? `Bs. ${metrics.total_revenue.toLocaleString()}` : 'Bs. 24,850', unit: '', trend: metrics?.revenue_trend || '↑ +12.4% este mes', icon: <DollarSign className="w-5 h-5" />, color: 'bg-[#00e03c]/10 text-[#00e03c] border border-[#00e03c]/20' },
    { label: 'Alumnos Directos', value: metrics?.total_students ? metrics.total_students.toString() : '143', unit: '', trend: '↑ +18 desde abril', icon: <BookOpenCheck className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    { label: 'Proyectos Activos', value: (activeServices || []).filter(p => (p.progress || 0) < 100).length.toString(), unit: '', trend: `${(activeServices || []).filter(p => (p.progress || 0) === 100).length} Completados`, icon: <Briefcase className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
    { label: 'CO₂ Compensado', value: metrics?.co2_compensated ? metrics.co2_compensated.toLocaleString() : '1,240', unit: 'Tons', trend: 'Meta: 1,500T anuales', icon: <Leaf className="w-5 h-5" />, color: 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen neuform-bg flex items-center justify-center relative z-10">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#00e03c]/10 border border-[#00e03c]/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 text-[#00e03c] animate-spin" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cargando Panel Directivo…</p>
        </div>
      </div>
    );
  }

  if (activeRole !== 'AdminMod') {
    return <InlinePartnerLogin registeredEngineers={safeEngineers} onLogin={handlePartnerLogin} />;
  }

  return (
    <div className="min-h-screen neuform-bg text-slate-100 flex relative z-10">

      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex-shrink-0 h-screen sticky top-0 bg-white/[0.03] backdrop-blur-md border-r border-white/[0.12] flex flex-col z-20 overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06] h-16">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00e03c] shrink-0" />
                <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">Panel SERAM</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSidebarOpen(p => !p)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white transition-colors shrink-0 ml-auto">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Socio Info */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Conectado como</p>
              <p className="text-xs font-extrabold text-[#00e03c] mt-0.5 truncate">{activeSocio?.name}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {SIDEBAR_MODULES.map(mod => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                activeModule === mod.id
                  ? 'bg-[#00e03c]/10 border border-[#00e03c]/20 text-[#00e03c]'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              <span className="shrink-0">{mod.icon}</span>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="text-xs font-bold whitespace-nowrap overflow-hidden">
                    {mod.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/[0.06]">
          <button onClick={handleLogoutPartner} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all">
            <X className="w-5 h-5 shrink-0" />
            <AnimatePresence>{sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-bold whitespace-nowrap">Cerrar Sesión</motion.span>}</AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 pt-20 max-w-7xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {SIDEBAR_MODULES.find(m => m.id === activeModule)?.label}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Panel Directivo SERAM · Bienvenido, <span className="text-[#00e03c] font-bold">{activeSocio?.name}</span>
              </p>
            </div>
            <span className="text-[9px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-3 h-3 animate-pulse" /> Socio Directivo
            </span>
          </div>

          {/* Module Content — Permanente al 100% sin desvanecimiento */}
          <div key={activeModule} className="opacity-100 visible space-y-8">
            {activeModule === 'overview'    && <OverviewModule kpis={kpis} metrics={metrics} />}
            {activeModule === 'services'    && <ServicesModule activeServices={activeServices || []} registeredEngineers={safeEngineers} handlers={handlers} publicServices={publicServices || []} specialists={specialists || []} />}
            {activeModule === 'timetracker' && <TimeTrackerModule timeLogs={timeLogs || []} activeServices={activeServices || []} currentSocio={activeSocio} handlers={handlers} />}
            {activeModule === 'academy'     && <AcademyModule courses={courses || []} registeredEngineers={safeEngineers} handlers={handlers} />}
            {activeModule === 'experience'  && <ExperienceModule experiences={experiences || []} handlers={handlers} />}
            {activeModule === 'store'       && <StoreModule productList={productList || []} handlers={handlers} />}
            {activeModule === 'users'       && <UsersModule registeredUsers={registeredUsers || []} handlers={handlers} />}
            {activeModule === 'finances'    && <FinancesModule />}
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Shield, DollarSign, BookOpenCheck, Briefcase, Leaf,
  Plus, Trash2, Loader2, Edit2, Check, X, Calendar,
  Clock, Award, TrendingUp, BarChart2, ShoppingBag,
  Globe, Users, ChevronLeft, ChevronRight, Settings,
  MapPin, UserCheck, Package, Star, AlertCircle, Lock,
  Wallet, Target, Layers, ArrowRight, ArrowUpRight, ArrowDownRight, Percent,
  PieChart as LucidePie, Activity, CreditCard, Building2,
  FileText, Smartphone, Laptop, Radio, Wifi,
  UploadCloud, ExternalLink, FileCheck, Paperclip, CheckSquare,
  Play, Pause, RotateCcw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabaseClient';
import { uploadProjectDocument } from '../../services/projectStorageService';
import MunicipalProposalsView, { MunicipalProposalModal } from './MunicipalProposalsView';
import VirtualOfficeView from './VirtualOfficeView';
import ActivitiesAndClientsModule from './ActivitiesAndClientsModule';

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
  { id: 'office',      icon: <Building2 className="w-5 h-5" />,    label: 'Oficina Virtual · Metaverso' },
  { id: 'activities',  icon: <CheckSquare className="w-5 h-5" />,  label: 'Central de Actividades & Clientes' },
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
function OverviewModule({ kpis, metrics, partnerPresences, timeLogs, onNavigate, activeServices, courses = [], currentSocio }) {
  const { activities = [] } = useApp();
  return (
    <div className="space-y-8">
      {/* KPI Cards — Visibles Permanentemente al 100% */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {/* ── VENTANA PRINCIPAL DE LA OFICINA VIRTUAL / METAVERSO SERAM ── */}
      <div className="space-y-3">
        <VirtualOfficeView
          activeServices={activeServices || []}
          courses={courses || []}
          timeLogs={timeLogs || []}
          partnerPresences={partnerPresences || {}}
          currentSocio={currentSocio}
          onNavigateModule={onNavigate}
        />
      </div>

      {/* ── EQUIPO DIRECTIVO: CONEXIÓN Y TRABAJO EN TIEMPO REAL ── */}
      <GlassCard className="p-5 sm:p-6 space-y-4 border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e03c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e03c]"></span>
            </span>
            <div>
              <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                Conexión y Trabajo en Tiempo Real del Equipo de Socios
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Seguimiento de sesión activa, dispositivos y últimas actividades técnicas realizadas
              </p>
            </div>
          </div>
          <span className="text-[9px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 self-start sm:self-auto">
            <Radio className="w-3 h-3 text-[#00e03c] animate-pulse" /> Intranet en Vivo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { email: 'barrientoso2401@gmail.com', name: 'Ing. Diego Barrientos', role: 'Socio Fundador · Especialista SIG & Hidráulica', defaultSector: '02. DIRECCIÓN' },
            { email: 'fernandoaraujo1912@gmail.com', name: 'Ing. Fernando Araujo', role: 'Socio Fundador · Especialista Ambiental & Legal', defaultSector: '03. OPERACIONES Y PLANIFICACIÓN' },
            { email: 'sebastiansbs51@gmail.com', name: 'Ing. Fabricio Orosco', role: 'Socio Fundador · Especialista Residuos & Auditoría', defaultSector: '11. EXPERIENCIA Y CAMPO' },
          ].map((def) => {
            const email = def.email;
            const presence = (partnerPresences || {})[email] || {};
            const p = {
              ...def,
              ...presence
            };
            const partnerLogs = (timeLogs || []).filter(l => l.partner_id === email || l.partner_name === p.name);
            const totalHours = partnerLogs.reduce((acc, curr) => acc + (curr.hours || 0), 0);
            const latestLog = partnerLogs[0] || (p.lastWork ? {
              project_title: p.lastWork.project,
              description: p.lastWork.description,
              hours: p.lastWork.hours,
              logged_at: p.lastWork.loggedAt
            } : null);

            const initials = p.name ? p.name.replace('Ing. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SO';
            const isCurrent = currentSocio?.email === email;
            const isOnline = isCurrent ? true : (presence.isOnline === true);

            return (
              <div
                key={email}
                className={`bg-white/[0.02] border rounded-2xl p-4 space-y-3 transition-all ${
                  isOnline
                    ? 'border-[#00e03c]/35 shadow-lg shadow-[#00e03c]/5'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {/* Header socio */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isOnline
                        ? 'bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30 ring-2 ring-[#00e03c]/20'
                        : 'bg-white/[0.05] text-slate-400 border border-white/[0.10]'
                    }`}>
                      {initials}
                      {isOnline && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00e03c] rounded-full border-2 border-[#0c131f] animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-extrabold text-white text-xs leading-tight">{p.name}</p>
                        {isCurrent && (
                          <span className="text-[8px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded-full uppercase">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.role}</p>
                    </div>
                  </div>
                  {isOnline ? (
                    <span className="text-[8px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c] animate-ping" /> Online
                    </span>
                  ) : (
                    <span className="text-[8px] font-semibold text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                      Offline
                    </span>
                  )}
                </div>

                {/* Sector en Oficina 2.5D & Sesión en Vivo */}
                <div className="space-y-1.5 pt-1 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Sector Oficina:</span>
                    <span className="font-extrabold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full text-[9px] truncate max-w-[140px] flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                      {p.currentSectorName || '02. DIRECCIÓN'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Sesión en Curso:</span>
                    {p.isTimerRunning ? (
                      <span className="inline-flex items-center gap-1 font-mono font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-0.5 rounded-full text-[9px] animate-pulse">
                        <Clock className="w-2.5 h-2.5 text-[#00e03c]" />
                        {Math.floor((p.timerSeconds || 0) / 3600)}h {Math.floor(((p.timerSeconds || 0) % 3600) / 60)}m {((p.timerSeconds || 0) % 60)}s
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[9px] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                        {p.timerSeconds ? `${(p.timerSeconds / 3600).toFixed(1)}h sesión previa` : 'En pausa'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Estado de Conexión:</span>
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1 font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-0.5 rounded-full text-[9px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c] animate-ping" /> En línea ahora
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] text-[9px]">
                        {new Date(p.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Dispositivo:</span>
                    <span className="text-slate-200 font-semibold flex items-center gap-1">
                      {p.device?.includes('Móvil') ? <Smartphone className="w-3 h-3 text-[#00e03c]" /> : <Laptop className="w-3 h-3 text-blue-400" />}
                      {p.device || 'Escritorio'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Horas Acumuladas:</span>
                    <span className="font-black text-[#00e03c] bg-[#00e03c]/10 px-2 py-0.5 rounded-full border border-[#00e03c]/20">
                      {totalHours.toFixed(1)} hrs
                    </span>
                  </div>
                </div>

                {/* Botón para ubicar en maqueta 2.5D */}
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('office')}
                  className="w-full py-1.5 px-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl text-amber-300 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>Ubicar en Oficina Virtual</span>
                </button>

                {/* Trabajo Realizado Reciente */}
                <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase font-black">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Clock className="w-2.5 h-2.5" /> Trabajo Reciente
                    </span>
                    {latestLog?.hours && (
                      <span className="font-mono text-[9px] text-[#00e03c]">
                        +{latestLog.hours}h
                      </span>
                    )}
                  </div>
                  {latestLog ? (
                    <div>
                      <p className="font-bold text-white text-[11px] leading-tight line-clamp-1">
                        {latestLog.project_title || 'Proyecto'}
                      </p>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {latestLog.description}
                      </p>
                      <span className="text-[8px] text-slate-500 font-mono block mt-1">
                        {new Date(latestLog.logged_at).toLocaleDateString([], { day: '2-digit', month: 'short' })} · {new Date(latestLog.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">Sin registros de trabajo recientes.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ── CENTRAL DE ACTIVIDADES CLAVES & HITOS (NOTION ➔ WEB SERAM) ── */}
      <GlassCard className="p-5 sm:p-6 space-y-4 border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm tracking-tight">
                Central de Actividades Claves & Entregables de Socios
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Seguimiento en tiempo real de tareas operativas, trámites y entregables periciales
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('activities')}
            className="text-xs font-bold text-[#00e03c] hover:text-[#00e03c]/80 flex items-center gap-1.5 transition-colors self-start sm:self-auto bg-[#00e03c]/10 border border-[#00e03c]/20 px-3 py-1.5 rounded-xl"
          >
            Abrir Central de Gestión <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mini lista de tareas en curso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['Ing. Diego Barrientos', 'Ing. Fernando Araujo', 'Ing. Fabricio Orosco'].map((pName) => {
            const socioAct = (activities || []).filter(a => a.assignedPartner === pName);
            const activeAct = socioAct.find(a => a.status === 'En curso') || socioAct[0];
            const doneCount = socioAct.filter(a => a.status === 'Concluido').length;

            return (
              <div key={pName} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-white">{pName.replace('Ing. ', '')}</span>
                  <span className="text-[9px] font-bold text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-full">
                    {doneCount}/{socioAct.length} Hechas
                  </span>
                </div>
                {activeAct ? (
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-200 font-bold line-clamp-1">{activeAct.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-emerald-400 font-medium truncate max-w-[120px]">{activeAct.category}</span>
                      <span className={`px-1.5 py-0.2 rounded font-black text-[9px] ${activeAct.status === 'Concluido' ? 'text-[#00e03c]' : 'text-blue-300'}`}>
                        {activeAct.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">Sin tareas pendientes</p>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

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
function ServicesModule({ activeServices, registeredEngineers, handlers, publicServices, specialists, municipalProposals = [] }) {
  const { handleAddProject, handleUpdateProjectProgress, handleDeleteProject,
          handleEditProject, handleConcludeProject, triggerToast,
          handleAddPublicService, handleEditPublicService, handleDeletePublicService,
          handleAddSpecialist, handleEditSpecialist, handleDeleteSpecialist } = handlers;

  const [subModule, setSubModule] = useState('projects'); // 'projects', 'municipal', 'catalog', 'specialists'
  const [projectFilter, setProjectFilter] = useState('all'); // 'all', 'active', 'proposals'
  const [selectedProposalForModal, setSelectedProposalForModal] = useState(null);

  const [newProjClient, setNewProjClient] = useState('');
  const [newProjType, setNewProjType] = useState('');
  const [newProjCode, setNewProjCode] = useState('');
  const [newProjLocation, setNewProjLocation] = useState('');
  const [newProjLead, setNewProjLead] = useState(registeredEngineers[0]?.name || '');
  const [newProjStartDate, setNewProjStartDate] = useState('');
  const [newProjEndDate, setNewProjEndDate] = useState('');
  const [newProjInvolved, setNewProjInvolved] = useState([]);
  
  const [newProjBudget, setNewProjBudget] = useState('');
  const [newProjLabCosts, setNewProjLabCosts] = useState('');
  const [newProjSubcontractorCosts, setNewProjSubcontractorCosts] = useState('');
  const [newProjTaxRegime, setNewProjTaxRegime] = useState('Régimen General');
  const [newProjDesc, setNewProjDesc] = useState('');

  const [isProposalMode, setIsProposalMode] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // PDF Upload state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [useSamplePdf, setUseSamplePdf] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({});
  const [editPdfFile, setEditPdfFile] = useState(null);
  const [editPdfUploading, setEditPdfUploading] = useState(false);

  const displayedServices = activeServices.filter(p => {
    const isProp = p.isProposal || p.tag === 'Propuesta';
    if (projectFilter === 'proposals') return isProp;
    if (projectFilter === 'active') return !isProp;
    return true;
  });

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditPdfFile(null);
    setEditState({
      client: p.client || '',
      type: p.type || '',
      code: p.code || '',
      location: p.location || '',
      description: p.description || '',
      lead: p.lead || registeredEngineers[0]?.name || '',
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      progress: p.progress || 0,
      involved: p.involved || [],
      budget: p.budget || 0,
      labCosts: p.labCosts || 0,
      subcontractorCosts: p.subcontractorCosts || 0,
      taxRegime: p.taxRegime || 'Régimen General',
      pdfUrl: p.pdfUrl || null,
      pdfName: p.pdfName || null
    });
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
      <div className="flex flex-wrap border-b border-white/[0.06] mb-4 gap-1">
        <button
          onClick={() => setSubModule('projects')}
          className={`px-4 py-2 text-xs font-bold transition-all ${subModule === 'projects' ? 'text-[#00e03c] border-b-2 border-[#00e03c]' : 'text-slate-400 hover:text-white'}`}
        >
          Monitor de Proyectos
        </button>
        <button
          onClick={() => setSubModule('municipal')}
          className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${subModule === 'municipal' ? 'text-[#00e03c] border-b-2 border-[#00e03c]' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Propuestas Concejales & Municipios
          <span className="text-[10px] bg-[#00e03c]/20 text-[#00e03c] px-1.5 py-0.5 rounded-full font-black ml-1">
            {(municipalProposals || []).length}
          </span>
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
        <div className="space-y-6">
          {/* Quick Filter Tabs for Proyectos vs Propuestas */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setProjectFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  projectFilter === 'all'
                    ? 'bg-[#00e03c] text-slate-950 font-black shadow-md shadow-[#00e03c]/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                Todos ({activeServices.length})
              </button>
              <button
                onClick={() => setProjectFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  projectFilter === 'active'
                    ? 'bg-blue-500 text-white font-black shadow-md shadow-blue-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                Proyectos B2B ({activeServices.filter(p => !p.isProposal && p.tag !== 'Propuesta').length})
              </button>
              <button
                onClick={() => setProjectFilter('proposals')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  projectFilter === 'proposals'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20'
                    : 'bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Propuestas ({activeServices.filter(p => p.isProposal || p.tag === 'Propuesta').length})
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#00e03c]" />
              <span>Propuestas asignadas a: <strong className="text-white font-bold">Ing. Diego Barrientos</strong></span>
            </div>
          </div>

          {/* Time Progress Table */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="font-extrabold text-white text-sm">Monitor Financiero y Avance de Proyectos</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {displayedServices.length} registros visualizados
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 font-extrabold uppercase tracking-widest border-b border-white/[0.06]">
                    {['Proyecto / Código', 'Líder / Proponente', 'Finanzas (i)', 'Físico vs Temporal', 'Documento PDF', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {displayedServices.map((p) => {
                    const isProp = p.isProposal || p.tag === 'Propuesta';
                    const tp = calculateTimeProgress(p.startDate, p.endDate);
                    const done = p.progress >= 100;
                    const late = !done && !isProp && p.progress < tp;
                    const badge = isProp
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                      : done
                        ? 'bg-slate-700 text-slate-300'
                        : late
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                          : 'bg-[#00e03c]/10 text-[#00e03c] border border-[#00e03c]/20';
                    const status = isProp ? 'Propuesta Activa' : done ? 'Concluido' : late ? 'Retrasado' : 'Al Día';
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            {isProp ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/15 border border-amber-400/30 text-amber-300">
                                <FileText className="w-2.5 h-2.5" /> Propuesta
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                <Briefcase className="w-2.5 h-2.5" /> {p.tag || 'Proyecto B2B'}
                              </span>
                            )}
                            {p.code && (
                              <span className="text-[9px] font-mono font-bold text-slate-300 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">
                                {p.code}
                              </span>
                            )}
                          </div>
                          <p className="font-extrabold text-white text-xs leading-snug">{p.client}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{p.type}</p>
                          {p.location && (
                            <p className="text-[10px] text-emerald-400/90 flex items-center gap-1 mt-1 font-medium">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{p.location}</span>
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="text-white font-black text-xs flex items-center gap-1">
                            {isProp && <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c] animate-pulse" />}
                            {p.lead}
                          </p>
                          {isProp && (
                            <span className="text-[9px] text-[#00e03c] font-semibold uppercase tracking-wider block mt-0.5">
                              Proponente Técnico
                            </span>
                          )}
                        </td>
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
                          <div className="space-y-1.5 w-36">
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
                        <td className="p-3">
                          {p.pdfUrl ? (
                            <a
                              href={p.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] transition-all group shadow-sm shadow-emerald-500/10"
                              title={p.pdfName || "Ver Términos de Referencia o Propuesta"}
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                              <span className="truncate max-w-[100px] font-mono">{p.pdfName ? p.pdfName.replace(/\.pdf$/i, '') : 'TDR / PDF'}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-emerald-400 opacity-70" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic flex items-center gap-1">
                              <Paperclip className="w-3 h-3 opacity-40" /> Sin TDR
                            </span>
                          )}
                        </td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${badge}`}>{status}</span></td>
                        <td className="p-3">
                          <div className="flex gap-1 items-center flex-wrap">
                            {isProp && (
                              <button
                                onClick={() => {
                                  const matched = municipalProposals.find(mp => mp.id === p.proposalId) || {
                                    title: p.type,
                                    axis: 'mercurio',
                                    targetMunicipalities: [p.client],
                                    lead: p.lead || 'Ing. Diego Barrientos',
                                    leadRole: 'Especialista SIG & Consultoría Ambiental - SERAM',
                                    problem: 'Diagnóstico técnico socioambiental formulado para su presentación formal ante el Concejo Municipal.',
                                    legalFramework: ['Ley 1333 de Medio Ambiente (RMCH)', 'Convenio de Minamata', 'Ley 535 de Minería'],
                                    methodology: 'Monitoreo pericial mediante muestreo multiparamétrico in-situ y ensayos de laboratorio acreditado.',
                                    deliverables: ['Informe Pericial para Concejo Municipal', 'Cartografía y Geodatabase SIG 1:25.000', 'Anteproyecto de Ley Municipal'],
                                    budget: p.budget,
                                    duration: '90 días'
                                  };
                                  setSelectedProposalForModal(matched);
                                }}
                                className="px-2.5 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all"
                                title="Ver Ficha Técnica para Concejos"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Ficha</span>
                              </button>
                            )}
                            <button onClick={() => startEdit(p)} className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Editar proyecto"><Edit2 className="w-3.5 h-3.5" /></button>
                            {!done && <button onClick={() => handleConcludeProject(p.id)} className="p-1.5 bg-[#00e03c]/10 border border-[#00e03c]/20 text-[#00e03c] hover:bg-[#00e03c]/20 rounded-lg transition-colors text-[9px] font-black px-2" title="Concluir proyecto">✓</button>}
                            {!done && <button onClick={() => { handleUpdateProjectProgress(p.id); triggerToast(`${p.client} +10%`, 'success'); }} className="p-1.5 bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] rounded-lg transition-colors text-[9px] font-black px-2">+10%</button>}
                            <button onClick={() => { if (confirm(`¿Eliminar "${p.client}"?`)) handleDeleteProject(p.id); }} className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <GlassCard className="p-6 space-y-4 border-[#00e03c]/30">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-[#00e03c]" />
                      <h4 className="font-extrabold text-white text-sm">Editar Proyecto Técnico</h4>
                    </div>
                    <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Cliente / Entidad</label>
                      <input className={inputCls} placeholder="Cliente" value={editState.client || ''} onChange={e => setEditState(s => ({ ...s, client: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tipo de Servicio</label>
                      <input className={inputCls} placeholder="Tipo de Estudio" value={editState.type || ''} onChange={e => setEditState(s => ({ ...s, type: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Código SRM</label>
                      <input className={inputCls} placeholder="Ej: SRM-2026-B2B-01" value={editState.code || ''} onChange={e => setEditState(s => ({ ...s, code: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Ubicación / Municipio</label>
                      <input className={inputCls} placeholder="Ej: Palos Blancos, La Paz" value={editState.location || ''} onChange={e => setEditState(s => ({ ...s, location: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Socio Responsable</label>
                      <select className={selectCls} value={editState.lead || ''} onChange={e => setEditState(s => ({ ...s, lead: e.target.value }))}>
                        {registeredEngineers.map(e => <option key={e.email} value={e.name}>{e.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Avance Físico ({editState.progress}%)</label>
                      <input className={inputCls} type="range" min="0" max="100" step="5" value={editState.progress || 0} onChange={e => setEditState(s => ({ ...s, progress: +e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Fecha de Inicio</label>
                      <input className={inputCls} type="date" value={editState.startDate || ''} onChange={e => setEditState(s => ({ ...s, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Fecha de Entrega</label>
                      <input className={inputCls} type="date" value={editState.endDate || ''} onChange={e => setEditState(s => ({ ...s, endDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Presupuesto Total (Bs.)</label>
                      <input className={inputCls} type="number" placeholder="Presupuesto" value={editState.budget || ''} onChange={e => setEditState(s => ({ ...s, budget: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Costos Lab / Equipos (Bs.)</label>
                      <input className={inputCls} type="number" placeholder="Costos Lab" value={editState.labCosts || ''} onChange={e => setEditState(s => ({ ...s, labCosts: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Costos Tercerizados (Bs.)</label>
                      <input className={inputCls} type="number" placeholder="Costos Tercerizados" value={editState.subcontractorCosts || ''} onChange={e => setEditState(s => ({ ...s, subcontractorCosts: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Régimen Tributario</label>
                      <select className={selectCls} value={editState.taxRegime || 'Régimen General'} onChange={e => setEditState(s => ({ ...s, taxRegime: e.target.value }))}>
                        <option value="Régimen General">Régimen General (16%)</option>
                        <option value="Régimen SIETE (5%)">Régimen SIETE (5% Monotributo)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Descripción / Objetivos Técnicos</label>
                    <textarea
                      rows="2"
                      className={`${inputCls} resize-none`}
                      placeholder="Alcance técnico, metodologías o normativas aplicables..."
                      value={editState.description || ''}
                      onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                    />
                  </div>

                  <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">Documento Técnico / TDR (PDF)</span>
                        <span className="text-[10px] text-slate-400">
                          {editPdfFile ? `Nuevo archivo: ${editPdfFile.name}` : (editState.pdfName || 'Sin archivo adjunto')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{editPdfFile || editState.pdfUrl ? 'Cambiar PDF' : 'Adjuntar PDF'}</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) setEditPdfFile(e.target.files[0]);
                          }}
                        />
                      </label>
                      {editState.pdfUrl && (
                        <a
                          href={editState.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-lg border border-white/10"
                          title="Ver PDF actual"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-lg text-xs font-bold hover:text-white">Cancelar</button>
                    <button
                      disabled={editPdfUploading}
                      onClick={async () => {
                        setEditPdfUploading(true);
                        try {
                          let finalPdfUrl = editState.pdfUrl;
                          let finalPdfName = editState.pdfName;
                          if (editPdfFile) {
                            const uploadRes = await uploadProjectDocument(editPdfFile, editingId, 'projects');
                            finalPdfUrl = uploadRes.url;
                            finalPdfName = uploadRes.name;
                          }
                          await handleEditProject(editingId, {
                            ...editState,
                            progress: +editState.progress,
                            pdfUrl: finalPdfUrl,
                            pdfName: finalPdfName
                          });
                          setEditingId(null);
                        } catch (err) {
                          console.error(err);
                          triggerToast('Error guardando cambios del proyecto', 'error');
                        } finally {
                          setEditPdfUploading(false);
                        }
                      }}
                      className="px-4 py-2 bg-[#00e03c] text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      {editPdfUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Guardar Cambios
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Project Form */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#00e03c]" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {isProposalMode ? 'Registrar Nueva Propuesta Técnica / Licitación' : 'Registrar Nuevo Proyecto B2B / Contrato Adjudicado'}
                </h4>
              </div>
              <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsProposalMode(false)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    !isProposalMode ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💼 Proyecto B2B
                </button>
                <button
                  type="button"
                  onClick={() => setIsProposalMode(true)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isProposalMode ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📄 Propuesta Comercial
                </button>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newProjClient.trim() || !newProjType.trim() || !newProjLead) {
                triggerToast('Completa cliente, tipo de servicio y socio líder', 'error');
                return;
              }
              setPdfUploading(true);
              try {
                let finalPdfUrl = null;
                let finalPdfName = null;

                if (pdfFile) {
                  const docRes = await uploadProjectDocument(pdfFile, Date.now(), 'projects');
                  finalPdfUrl = docRes.url;
                  finalPdfName = docRes.name;
                } else if (useSamplePdf) {
                  finalPdfUrl = '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf';
                  finalPdfName = 'Propuesta_Tecnica_Oficial_SERAM_2026.pdf';
                }

                const prefix = isProposalMode ? 'PROP' : 'B2B';
                const generatedCode = newProjCode.trim() || `SRM-2026-${prefix}-${String(activeServices.length + 1).padStart(2, '0')}`;

                await handleAddProject({
                  code: generatedCode,
                  client: newProjClient.trim(),
                  type: newProjType.trim(),
                  lead: newProjLead,
                  location: newProjLocation.trim() || 'Bolivia',
                  description: newProjDesc.trim(),
                  startDate: newProjStartDate || new Date().toISOString().split('T')[0],
                  endDate: newProjEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  involved: newProjInvolved.length > 0 ? newProjInvolved : [newProjLead],
                  budget: parseFloat(newProjBudget) || 0,
                  labCosts: parseFloat(newProjLabCosts) || 0,
                  subcontractorCosts: parseFloat(newProjSubcontractorCosts) || 0,
                  taxRegime: newProjTaxRegime,
                  pdfUrl: finalPdfUrl,
                  pdfName: finalPdfName,
                  isProposal: isProposalMode,
                  tag: isProposalMode ? 'Propuesta' : 'Proyecto B2B',
                  progress: isProposalMode ? 0 : 10
                });

                // Clear form
                setNewProjClient('');
                setNewProjType('');
                setNewProjCode('');
                setNewProjLocation('');
                setNewProjDesc('');
                setNewProjStartDate('');
                setNewProjEndDate('');
                setNewProjInvolved([]);
                setNewProjBudget('');
                setNewProjLabCosts('');
                setNewProjSubcontractorCosts('');
                setPdfFile(null);
                setUseSamplePdf(false);
                setShowAdvancedOptions(false);
              } catch (err) {
                console.error('Error registrando proyecto:', err);
                triggerToast('Error al registrar proyecto', 'error');
              } finally {
                setPdfUploading(false);
              }
            }} className="space-y-4">
              
              {/* Sección Principal y Esencial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Cliente / Municipio / Entidad *
                  </label>
                  <input
                    required
                    className={inputCls}
                    placeholder="Ej: G.A.M. Palos Blancos, Minera San Cristóbal, etc."
                    value={newProjClient}
                    onChange={e => setNewProjClient(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    {isProposalMode ? 'Título de la Propuesta / Servicio Técnico *' : 'Nombre del Proyecto / Servicio Técnico *'}
                  </label>
                  <input
                    required
                    className={inputCls}
                    placeholder="Ej: Línea Base Hidrogeoquímica, Mitigación de Mercurio, etc."
                    value={newProjType}
                    onChange={e => setNewProjType(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Socio Responsable / Líder *
                  </label>
                  <select
                    required
                    className={selectCls}
                    value={newProjLead}
                    onChange={e => setNewProjLead(e.target.value)}
                  >
                    {registeredEngineers.map(e => (
                      <option key={e.email} value={e.name}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Presupuesto Ofertado (Bs.)
                  </label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    placeholder="Ej: 68000"
                    value={newProjBudget}
                    onChange={e => setNewProjBudget(e.target.value)}
                  />
                </div>
              </div>

              {/* UPLOADER DE DOCUMENTO PDF EN SUPABASE STORAGE */}
              <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Documento Técnico / Términos de Referencia (PDF)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Se guardará en Supabase Storage vinculado a la base de datos
                      </span>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-slate-300 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useSamplePdf}
                      disabled={!!pdfFile}
                      onChange={e => setUseSamplePdf(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-[#00e03c] focus:ring-0"
                    />
                    <span>Usar PDF Modelo SERAM</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto cursor-pointer px-4 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-dashed border-white/20 hover:border-emerald-400/50 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span>{pdfFile ? 'Reemplazar archivo PDF' : 'Seleccionar PDF del equipo'}</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setPdfFile(e.target.files[0]);
                          setUseSamplePdf(false);
                        }
                      }}
                    />
                  </label>

                  {pdfFile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono truncate max-w-[200px]">{pdfFile.name}</span>
                      <span className="text-[10px] opacity-75">({(pdfFile.size / 1024).toFixed(1)} KB)</span>
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="text-slate-400 hover:text-white ml-1"
                        title="Quitar archivo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {!pdfFile && useSamplePdf && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-300 text-xs">
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <span className="font-mono">ejemplo_propuesta_tecnica_seram.pdf</span>
                      <a
                        href="/assets/documents/ejemplo_propuesta_tecnica_seram.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-200 ml-1"
                        title="Ver PDF modelo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón Acordeón para Opciones Avanzadas */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-xs font-semibold text-slate-400 hover:text-[#00e03c] flex items-center gap-1.5 transition-colors py-1"
                >
                  <span>{showAdvancedOptions ? '▼ Ocultar detalles adicionales' : '▶ Configurar fechas, desglose financiero o ubicación (Opcional)'}</span>
                </button>

                {showAdvancedOptions && (
                  <div className="mt-3 p-4 bg-white/[0.015] border border-white/[0.06] rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Código Personalizado SRM</label>
                        <input
                          className={inputCls}
                          placeholder={`Auto: SRM-2026-${isProposalMode ? 'PROP' : 'B2B'}-${String(activeServices.length + 1).padStart(2, '0')}`}
                          value={newProjCode}
                          onChange={e => setNewProjCode(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Ubicación / Municipio</label>
                        <input
                          className={inputCls}
                          placeholder="Ej: Cobija, Pando / Palos Blancos"
                          value={newProjLocation}
                          onChange={e => setNewProjLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Fecha de Inicio</label>
                        <input
                          className={inputCls}
                          type="date"
                          value={newProjStartDate}
                          onChange={e => setNewProjStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Fecha de Conclusión</label>
                        <input
                          className={inputCls}
                          type="date"
                          value={newProjEndDate}
                          onChange={e => setNewProjEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Régimen Tributario</label>
                        <select
                          className={selectCls}
                          value={newProjTaxRegime}
                          onChange={e => setNewProjTaxRegime(e.target.value)}
                        >
                          <option value="Régimen General">Régimen General (16% Impuestos)</option>
                          <option value="Régimen SIETE (5%)">Régimen SIETE (5% Monotributo)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Costos Lab / Equipos (Bs.)</label>
                        <input
                          className={inputCls}
                          type="number"
                          min="0"
                          placeholder="Ej: 12000"
                          value={newProjLabCosts}
                          onChange={e => setNewProjLabCosts(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Costos Tercerizados (Bs.)</label>
                        <input
                          className={inputCls}
                          type="number"
                          min="0"
                          placeholder="Ej: 8000"
                          value={newProjSubcontractorCosts}
                          onChange={e => setNewProjSubcontractorCosts(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Descripción / Alcance Técnico</label>
                      <textarea
                        rows="2"
                        className={`${inputCls} resize-none`}
                        placeholder="Entregables, marco regulatorio o metodologías..."
                        value={newProjDesc}
                        onChange={e => setNewProjDesc(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={pdfUploading}
                className="w-full bg-[#00e03c] text-slate-950 py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,224,60,0.2)] disabled:opacity-50"
              >
                {pdfUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en Supabase y Subiendo Documento Técnico...</span>
                  </>
                ) : isProposalMode ? (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Guardar Propuesta Comercial en Base de Datos</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Registrar Proyecto Operativo en Base de Datos</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {subModule === 'municipal' && (
        <MunicipalProposalsView
          proposals={municipalProposals}
          handlers={handlers}
          registeredEngineers={registeredEngineers}
        />
      )}

      {subModule === 'catalog' && (
        <CatalogManager publicServices={publicServices} handlers={{ handleAddPublicService, handleEditPublicService, handleDeletePublicService }} />
      )}

      {subModule === 'specialists' && (
        <SpecialistManager specialists={specialists} handlers={{ handleAddSpecialist, handleEditSpecialist, handleDeleteSpecialist }} />
      )}

      {/* Modal Ficha Técnica Directo desde Monitor de Proyectos */}
      <AnimatePresence>
        {selectedProposalForModal && (
          <MunicipalProposalModal
            proposal={selectedProposalForModal}
            onClose={() => setSelectedProposalForModal(null)}
          />
        )}
      </AnimatePresence>
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
function AcademyModule({ courses, registeredEngineers, currentSocio, handlers }) {
  const { handleAddCourse, handleUpdateCourse, handleDeleteCourse, triggerToast } = handlers;
  
  const defaultInstructor = currentSocio?.name || registeredEngineers[0]?.name || 'Ing. Fernando Araujo';

  // Create state
  const [form, setForm] = useState({
    title: '',
    instructor: defaultInstructor,
    type: 'mid_ticket',
    format: 'video', // 'video' | 'pdf'
    pages: 120,
    version: 'Edición 2026',
    price: 350,
    duration: '40 horas prácticas',
    desc: '',
    image: '/assets/3d-backend/gis_satellite_mapping.webp'
  });

  useEffect(() => {
    if (currentSocio?.name) {
      setForm(prev => ({ ...prev, instructor: currentSocio.name }));
    }
  }, [currentSocio?.name]);

  const [coursePdfFile, setCoursePdfFile] = useState(null);
  const [coursePdfUploading, setCoursePdfUploading] = useState(false);
  const [useSampleCoursePdf, setUseSampleCoursePdf] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    instructor: '',
    type: 'mid_ticket',
    format: 'video',
    pages: 120,
    version: 'Edición 2026',
    price: 0,
    duration: '',
    desc: '',
    image: '',
    pdfUrl: null,
    pdfName: null
  });
  const [editCoursePdfFile, setEditCoursePdfFile] = useState(null);
  const [editCoursePdfUploading, setEditCoursePdfUploading] = useState(false);

  // Preset covers based on type
  const PRESET_COVERS = {
    gratis: '/assets/covers/cover_ebook_ley1333.png',
    low_ticket: '/assets/covers/cover_qgis_basico.png',
    mid_ticket: '/assets/3d-backend/gis_satellite_mapping.webp',
    high_ticket: '/assets/covers/cover_mentoria_consultoria.png'
  };

  const handleTypeChange = (type, isEdit = false) => {
    const cover = PRESET_COVERS[type] || PRESET_COVERS.mid_ticket;
    if (isEdit) {
      setEditForm(prev => ({ ...prev, type, image: cover, price: type === 'gratis' ? 0 : prev.price }));
    } else {
      setForm(prev => ({ ...prev, type, image: cover, price: type === 'gratis' ? 0 : prev.price }));
    }
  };

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]/40 transition-all";
  const selectCls = "w-full text-xs px-3 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white";

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.instructor) {
      triggerToast('Título e Instructor son requeridos', 'error');
      return;
    }
    setCoursePdfUploading(true);
    try {
      let finalPdfUrl = null;
      let finalPdfName = null;

      if (coursePdfFile) {
        const uploadRes = await uploadProjectDocument(coursePdfFile, Date.now(), 'academy');
        finalPdfUrl = uploadRes.url;
        finalPdfName = uploadRes.name;
      } else if (useSampleCoursePdf || form.format === 'pdf') {
        finalPdfUrl = '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf';
        finalPdfName = form.format === 'pdf' ? `${form.title.slice(0, 30).replace(/\s+/g, '_')}_SERAM.pdf` : 'Syllabus_Curso_Oficial_SERAM_2026.pdf';
      }

      await handleAddCourse({
        ...form,
        isPremium: form.type !== 'gratis',
        hasVideo: form.format === 'video',
        format: form.format,
        pages: form.format === 'pdf' ? (Number(form.pages) || 120) : undefined,
        version: form.version || 'Edición 2026',
        pdfUrl: finalPdfUrl,
        pdfName: finalPdfName
      });

      setForm({
        title: '',
        instructor: currentSocio?.name || registeredEngineers[0]?.name || 'Ing. Fernando Araujo',
        type: 'mid_ticket',
        format: 'video',
        pages: 120,
        version: 'Edición 2026',
        price: 350,
        duration: '40 horas prácticas',
        desc: '',
        image: '/assets/3d-backend/gis_satellite_mapping.webp'
      });
      setCoursePdfFile(null);
      setUseSampleCoursePdf(false);
    } catch (err) {
      console.error(err);
      triggerToast('Error al registrar recurso académico', 'error');
    } finally {
      setCoursePdfUploading(false);
    }
  };

  const handleStartEdit = (course) => {
    setEditingId(course.id);
    setEditCoursePdfFile(null);
    setEditForm({
      title: course.title,
      instructor: course.instructor,
      type: course.type || 'mid_ticket',
      format: course.format || (course.hasVideo === false ? 'pdf' : 'video'),
      pages: course.pages || 120,
      version: course.version || 'Edición 2026',
      price: course.price || 0,
      duration: course.duration || '10 horas',
      desc: course.desc || '',
      image: course.image || '',
      pdfUrl: course.pdfUrl || null,
      pdfName: course.pdfName || null
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.instructor) {
      triggerToast('Título e Instructor son requeridos', 'error');
      return;
    }
    setEditCoursePdfUploading(true);
    try {
      let finalPdfUrl = editForm.pdfUrl;
      let finalPdfName = editForm.pdfName;

      if (editCoursePdfFile) {
        const uploadRes = await uploadProjectDocument(editCoursePdfFile, editingId, 'academy');
        finalPdfUrl = uploadRes.url;
        finalPdfName = uploadRes.name;
      }

      await handleUpdateCourse(editingId, {
        ...editForm,
        isPremium: editForm.type !== 'gratis',
        hasVideo: editForm.format === 'video',
        format: editForm.format,
        pages: editForm.format === 'pdf' ? (Number(editForm.pages) || 120) : undefined,
        version: editForm.version || 'Edición 2026',
        pdfUrl: finalPdfUrl,
        pdfName: finalPdfName
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      triggerToast('Error al actualizar recurso académico', 'error');
    } finally {
      setEditCoursePdfUploading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORMULARIO CRUD (Izquierda / 1 Columna) */}
        <div className="lg:col-span-1 space-y-6">
          
          {editingId === null ? (
            <GlassCard className="p-6 space-y-4 border-emerald-500/20">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <div className="w-8 h-8 rounded-lg bg-[#00e03c]/10 text-[#00e03c] flex items-center justify-center">
                  <BookOpenCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Publicar Recurso / Curso</h4>
                  <p className="text-[10px] text-slate-400">Guías técnicas, sílabos o cursos con persistencia en Supabase</p>
                </div>
              </div>
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Título del Documento / Curso *</label>
                  <input required className={inputCls} placeholder="Ej: Guía Técnica de Lombricultura Urbana" value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} />
                </div>

                {/* Selector de Modalidad */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Modalidad del Recurso *</label>
                  <select
                    className={selectCls}
                    value={form.format}
                    onChange={e => setForm(s => ({
                      ...s,
                      format: e.target.value,
                      duration: e.target.value === 'pdf' ? `${s.pages || 120} págs. (PDF)` : '40 horas prácticas'
                    }))}
                  >
                    <option value="video">🎥 Curso con Videos HD (Plataforma Multimedia)</option>
                    <option value="pdf">📄 Documento Entregable / Guía Técnica (Modalidad PDF)</option>
                  </select>
                </div>

                {form.format === 'pdf' && (
                  <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl">
                    <div>
                      <label className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block mb-1">Páginas Técnicas</label>
                      <input
                        type="number"
                        min={1}
                        className={inputCls}
                        placeholder="Ej: 180"
                        value={form.pages}
                        onChange={e => setForm(s => ({ ...s, pages: +e.target.value, duration: `${e.target.value} págs. (PDF)` }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block mb-1">Versión / Edición</label>
                      <input
                        className={inputCls}
                        placeholder="Ej: Edición 2026"
                        value={form.version}
                        onChange={e => setForm(s => ({ ...s, version: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Formato / Tipo</label>
                    <select className={selectCls} value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                      <option value="mid_ticket">Guía Técnica en PDF</option>
                      <option value="low_ticket">Manual / E-Book</option>
                      <option value="high_ticket">Curso Especializado / Taller</option>
                      <option value="gratis">Documento Gratuito</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Precio (Bs.)</label>
                    <input type="number" min={0} disabled={form.type === 'gratis'} className={inputCls} placeholder="0 si es libre" value={form.price} onChange={e => setForm(s => ({ ...s, price: +e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Socio Autor / Instructor *</label>
                    <select className={selectCls} value={form.instructor} onChange={e => setForm(s => ({ ...s, instructor: e.target.value }))}>
                      {registeredEngineers.map(e => <option key={e.email} value={e.name}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Carga Horaria / Formato</label>
                    <input className={inputCls} placeholder="Ej: Lectura técnica / 20 hrs" value={form.duration} onChange={e => setForm(s => ({ ...s, duration: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Descripción / Objetivos</label>
                  <textarea className={`${inputCls} h-16 resize-none`} placeholder="Resumen del contenido, metodología o público destinatario..." value={form.desc} onChange={e => setForm(s => ({ ...s, desc: e.target.value }))} />
                </div>

                {/* PDF Syllabus Uploader Simplificado */}
                <div className="p-3.5 bg-emerald-500/[0.04] border border-emerald-500/25 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-300 font-extrabold uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Adjuntar Documento PDF (Guía / Sílabo)
                    </span>
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useSampleCoursePdf}
                        disabled={!!coursePdfFile}
                        onChange={e => setUseSampleCoursePdf(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-[#00e03c]"
                      />
                      <span>PDF Modelo SERAM</span>
                    </label>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer px-3.5 py-2.5 bg-white/[0.05] hover:bg-white/[0.09] border border-dashed border-emerald-400/40 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all">
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>{coursePdfFile ? 'Reemplazar archivo PDF' : 'Seleccionar PDF desde mi equipo'}</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            setCoursePdfFile(e.target.files[0]);
                            setUseSampleCoursePdf(false);
                          }
                        }}
                      />
                    </label>
                    {coursePdfFile && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs">
                        <span className="font-mono truncate max-w-[200px]">{coursePdfFile.name}</span>
                        <button type="button" onClick={() => setCoursePdfFile(null)} className="text-slate-400 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={coursePdfUploading}
                  className="w-full bg-[#00e03c] text-slate-950 py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,224,60,0.2)] disabled:opacity-50"
                >
                  {coursePdfUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {coursePdfUploading ? 'Guardando y Subiendo PDF...' : 'Publicar en SERAM Academy'}
                </button>
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

                {/* Selector de Modalidad Edit */}
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Modalidad del Recurso</label>
                  <select
                    className={selectCls}
                    value={editForm.format}
                    onChange={e => setEditForm(s => ({
                      ...s,
                      format: e.target.value,
                      duration: e.target.value === 'pdf' ? `${s.pages || 120} págs. (PDF)` : s.duration
                    }))}
                  >
                    <option value="video">🎥 Curso con Videos HD (Plataforma Multimedia)</option>
                    <option value="pdf">📄 Documento Entregable / Guía Técnica (Modalidad PDF)</option>
                  </select>
                </div>

                {editForm.format === 'pdf' && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl">
                    <div>
                      <label className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block mb-1">Páginas Técnicas</label>
                      <input
                        type="number"
                        min={1}
                        className={inputCls}
                        placeholder="180"
                        value={editForm.pages}
                        onChange={e => setEditForm(s => ({ ...s, pages: +e.target.value, duration: `${e.target.value} págs. (PDF)` }))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block mb-1">Versión / Edición</label>
                      <input
                        className={inputCls}
                        placeholder="Edición 2026"
                        value={editForm.version}
                        onChange={e => setEditForm(s => ({ ...s, version: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

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
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Duración / Horas</label>
                    <input className={inputCls} placeholder="Duración" value={editForm.duration} onChange={e => setEditForm(s => ({ ...s, duration: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Descripción Corta</label>
                  <textarea className={`${inputCls} h-20 resize-none`} placeholder="Descripción" value={editForm.desc} onChange={e => setEditForm(s => ({ ...s, desc: e.target.value }))} />
                </div>

                {/* Edit PDF Syllabus */}
                <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Syllabus / Guía en PDF</span>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{editCoursePdfFile ? editCoursePdfFile.name : (editForm.pdfName || 'Cambiar/Subir PDF')}</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) setEditCoursePdfFile(e.target.files[0]);
                        }}
                      />
                    </label>
                    {editForm.pdfUrl && (
                      <a href={editForm.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-emerald-400 hover:text-emerald-300">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Ruta de Portada (Assets)</label>
                  <input className={inputCls} placeholder="Ruta de imagen" value={editForm.image} onChange={e => setEditForm(s => ({ ...s, image: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button type="button" onClick={() => setEditingId(null)} className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl font-bold text-xs uppercase transition-colors flex items-center justify-center gap-1.5"><X className="w-3.5 h-3.5" /> Cancelar</button>
                  <button
                    type="submit"
                    disabled={editCoursePdfUploading}
                    className="w-full bg-amber-500 text-slate-950 py-2 rounded-xl font-black text-xs uppercase hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {editCoursePdfUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Guardar
                  </button>
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
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-500 mt-1 font-mono">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                          c.format === 'pdf' || c.hasVideo === false
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        }`}>
                          {c.format === 'pdf' || c.hasVideo === false ? '📄 PDF Entregable' : '🎥 Video HD'}
                        </span>
                        <span className="text-[#00e03c] font-semibold uppercase">{c.type?.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{c.instructor}</span>
                        <span>•</span>
                        <span>{c.duration}</span>
                        <span>•</span>
                        <span className="text-white font-bold">{c.price === 0 ? 'Gratuito' : `Bs. ${c.price}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {c.pdfUrl && (
                      <a
                        href={c.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold transition-all"
                        title={c.pdfName || "Ver Syllabus PDF"}
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Syllabus PDF</span>
                        <ExternalLink className="w-2.5 h-2.5 text-emerald-400 opacity-70" />
                      </a>
                    )}
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
function UsersModule({ registeredUsers, handlers, partnerPresences }) {
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
                    <div>
                      <p className="font-extrabold text-white">{u.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{isAdmin ? 'Socio Fundador' : 'Cliente'}</p>
                        {isAdmin && (
                          partnerPresences?.[u.email]?.isOnline ? (
                            <span className="inline-flex items-center gap-1 text-[8px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-1.5 py-0.5 rounded-full">
                              <span className="w-1 h-1 rounded-full bg-[#00e03c] animate-ping" /> En línea
                            </span>
                          ) : (
                            <span className="text-[8px] text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                              Últ. conexión: {partnerPresences?.[u.email]?.lastLogin ? new Date(partnerPresences[u.email].lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hoy'}
                            </span>
                          )
                        )}
                      </div>
                    </div>
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
// MODULE: TIME TRACKER (Sesión en Vivo, Cronómetro Multi-Socio y Horas Efectivas)
// ─────────────────────────────────────────────────────────────────────────────
function TimeTrackerModule({ timeLogs, activeServices, currentSocio, handlers, onNavigate }) {
  const { handleAddTimeLog, handleDeleteTimeLog, triggerToast } = handlers;
  const {
    activeTimer,
    startPartnerTimer,
    pausePartnerTimer,
    resetPartnerTimer,
    savePartnerTimerLog,
    setPartnerSector,
    partnerPresences
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState(() => activeTimer?.projectId || activeServices[0]?.id || 101);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  // Modal / Inline Drawer para guardar la sesión activa
  const [showSaveLogModal, setShowSaveLogModal] = useState(false);
  const [saveLogDesc, setSaveLogDesc] = useState('');
  const [customSaveHours, setCustomSaveHours] = useState('');

  const inputCls = "w-full text-xs px-3 py-2 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#00e03c] transition-all";
  const selectCls = "w-full text-xs px-3 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded-lg text-white focus:outline-none focus:border-[#00e03c] transition-all [&>option]:bg-[#0d1622] [&>option]:text-white";

  // Despachos y Sectores disponibles en la Oficina 2.5D
  const OFFICE_SECTORS_LIST = [
    { id: 'direction', name: '02. DIRECCIÓN (Presidencia & Estrategia)', wing: 'Ala Ejecutiva' },
    { id: 'operations', name: '03. OPERACIONES (Hidráulica, Riego & Obras)', wing: 'Ala Técnica' },
    { id: 'experience', name: '11. EXPERIENCIA Y CAMPO (Drones & Monitoreo)', wing: 'Ala Operativa' },
    { id: 'commercial', name: '04. COMERCIAL (Licitaciones & SICOES)', wing: 'Ala Comercial' },
    { id: 'service', name: '07. SERVICE (Consultoría Ambiental & SIG)', wing: 'Núcleo Central' },
    { id: 'research', name: '13. INVESTIGACIÓN (Laboratorio de Mercurio Hg)', wing: 'Ala Científica' },
    { id: 'marketing', name: '06. MARKETING Y VENTAS (Growth & Pipeline)', wing: 'Núcleo Central' },
    { id: 'finances', name: '05. FINANZAS (Flujo de Caja, VAN & TIR)', wing: 'Núcleo Central' },
    { id: 'academy', name: '08. ACADEMY (Cursos & Capacitación)', wing: 'Ala Académica' },
    { id: 'legal', name: '10. LEGAL (Ley 1333 & Minería 535)', wing: 'Ala Legal' },
    { id: 'store', name: '09. STORE (Kits & Equipos Ambientales)', wing: 'Ala Comercial' },
    { id: 'admin', name: '01. ADMINISTRACIÓN (Gobierno & Socios)', wing: 'Ala Ejecutiva' },
    { id: 'social_media', name: '12. SOCIAL MEDIA (Estudio Audiovisual)', wing: 'Ala Creativa' },
    { id: 'meeting', name: 'Sala de Directorio (Reunión General)', wing: 'Zona Central' },
    { id: 'recreation', name: 'Área de Café & Descanso', wing: 'Zona Social' },
  ];

  const formatTimer = (totalSec) => {
    const sec = Math.max(0, Math.floor(totalSec || 0));
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    const project = activeServices.find(p => p.id === parseInt(selectedProjectId) || p.id === selectedProjectId);
    const pTitle = project ? (project.client || project.type || 'Proyecto Seleccionado') : 'Consultoría SERAM';
    startPartnerTimer(selectedProjectId, pTitle);
  };

  const handleOpenSaveModal = () => {
    const computedHours = Math.max(0.1, parseFloat(((activeTimer?.seconds || 0) / 3600).toFixed(2)));
    setCustomSaveHours(computedHours.toString());
    setSaveLogDesc('');
    setShowSaveLogModal(true);
  };

  const handleConfirmSaveSession = async (e) => {
    e.preventDefault();
    if (!saveLogDesc || saveLogDesc.trim() === '') {
      triggerToast('Ingresa una breve descripción de la actividad efectuada', 'error');
      return;
    }
    const success = await savePartnerTimerLog(saveLogDesc, customSaveHours ? parseFloat(customSaveHours) : null);
    if (success) {
      setShowSaveLogModal(false);
      setSaveLogDesc('');
    }
  };

  // Partners list for meritocracy calculations & team live monitor
  const partnersConfig = [
    { email: 'barrientoso2401@gmail.com', name: 'Ing. Diego Barrientos', role: 'Socio Fundador · Presidencia & SIG', defaultRoom: '02. DIRECCIÓN' },
    { email: 'fernandoaraujo1912@gmail.com', name: 'Ing. Fernando Araujo', role: 'Socio Fundador · Hidráulica & Obras', defaultRoom: '03. OPERACIONES' },
    { email: 'sebastiansbs51@gmail.com', name: 'Ing. Fabricio Orosco', role: 'Socio Fundador · Residuos & Campo', defaultRoom: '11. EXPERIENCIA Y CAMPO' }
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
      const taxes = isSiete ? budget * 0.05 : budget * 0.16;
      const UN = Math.max(0, budget - taxes - labCosts - subcontractorCosts);

      // Calcular participación por socio
      const shares = partnersConfig.map(u => {
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

  const handleManualSubmit = (e) => {
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

  const timerSec = activeTimer?.seconds || 0;
  const isTimerRunning = activeTimer?.isRunning || false;
  const dailyTargetHours = 4.5;
  const progressPct = Math.min(100, Math.round(((timerSec / 3600) / dailyTargetHours) * 100));

  return (
    <div className="space-y-6 text-left">
      
      {/* ── PANEL PRINCIPAL: SESIÓN EN VIVO & CRONÓMETRO MULTI-SOCIO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA 1: TU SESIÓN ACTIVA (TIME TRACKER EN TIEMPO REAL) (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#0c1622]/95 via-[#0b131f]/95 to-[#080d16]/95 border border-[#00e03c]/30 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
          {/* Luz de fondo ambiental */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#00e03c]/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header de la Sesión */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                isTimerRunning
                  ? 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/40 ring-4 ring-[#00e03c]/10 animate-pulse'
                  : 'bg-white/[0.05] text-slate-400 border border-white/[0.10]'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Time Tracker en Vivo · Intranet SERAM
                </span>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Sesión de Trabajo en Tiempo Real
                  {isTimerRunning && (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c] animate-ping" /> Jornada Activa
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">Meta Diaria: {dailyTargetHours}h</span>
              <span className="text-xs font-black text-[#00e03c] bg-[#00e03c]/10 px-2.5 py-1 rounded-xl border border-[#00e03c]/20">
                {progressPct}%
              </span>
            </div>
          </div>

          {/* Gran Display Cronómetro Digital */}
          <div className="bg-black/50 border border-white/[0.08] rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                Tiempo Transcurrido (Horas : Minutos : Segundos)
              </span>
              <div className="font-mono text-4xl sm:text-6xl font-black text-[#00e03c] tracking-widest drop-shadow-[0_0_25px_rgba(0,224,60,0.35)] select-all">
                {formatTimer(timerSec)}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Equivalente efectivo: <strong className="text-white">{((timerSec / 3600)).toFixed(2)} horas</strong> decimales
              </p>
            </div>

            {/* Barra de Progreso Dinámica */}
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-[#00e03c] to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,224,60,0.5)]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Selectores de Contexto: Proyecto & Sector en Oficina 2.5D */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#00e03c]" /> Proyecto / Propuesta Asignada
              </label>
              <select
                className={selectCls}
                value={selectedProjectId}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedProjectId(val);
                  const p = activeServices.find(item => item.id === parseInt(val) || item.id === val);
                  if (p && isTimerRunning) {
                    startPartnerTimer(val, p.client || p.type || 'Proyecto');
                  }
                }}
              >
                {activeServices.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.isProposal || p.tag === 'Propuesta' ? '📋 [PROPUESTA] ' : '💼 '}
                    {p.client} — {p.type.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Sector Físico en Oficina 2.5D
              </label>
              <select
                className={selectCls}
                value={activeTimer?.sectorId || 'direction'}
                onChange={e => {
                  const sId = e.target.value;
                  const item = OFFICE_SECTORS_LIST.find(s => s.id === sId);
                  setPartnerSector(sId, null, item?.name);
                  triggerToast(`Avatar reubicado en: ${item?.name}`, 'info');
                }}
              >
                {OFFICE_SECTORS_LIST.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botonera de Acción en Vivo */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isTimerRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="flex-1 py-3 px-5 rounded-2xl bg-[#00e03c] hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,224,60,0.3)] transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Sesión en Vivo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pausePartnerTimer}
                className="flex-1 py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all active:scale-95"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar Jornada</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenSaveModal}
              disabled={timerSec < 60}
              className="py-3 px-4 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              title="Registrar las horas efectivas directamente a la base de datos de proyectos"
            >
              <FileCheck className="w-4 h-4 text-blue-400" />
              <span>Registrar a Proyecto</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('¿Reiniciar el cronómetro de la sesión a 00:00:00?')) {
                  resetPartnerTimer();
                  triggerToast('Cronómetro reiniciado a cero', 'info');
                }
              }}
              className="py-3 px-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] text-slate-400 hover:text-white text-xs font-bold transition-all"
              title="Reiniciar a cero"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* COLUMNA 2: MONITOR DEL EQUIPO DE SOCIOS EN TIEMPO REAL (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1622]/95 via-[#0b131f]/95 to-[#080d16]/95 border border-emerald-500/25 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e03c] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e03c]"></span>
                </span>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight">Monitor del Equipo de Socios</h4>
                  <p className="text-[10px] text-slate-400">Presencia en vivo, sector 2.5D y cronómetro activo</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
                En Vivo
              </span>
            </div>

            {/* Listado de los 3 Socios con su estado en vivo */}
            <div className="space-y-3.5">
              {partnersConfig.map(partner => {
                const presence = partnerPresences?.[partner.email] || {};
                const isOnline = presence.isOnline ?? (partner.email === currentSocio?.email);
                const isTimerOn = presence.isTimerRunning || false;
                const pSecs = presence.timerSeconds || 0;
                const initials = partner.name.replace('Ing. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <div
                    key={partner.email}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isOnline
                        ? 'bg-white/[0.03] border-[#00e03c]/35 shadow-md shadow-[#00e03c]/5'
                        : 'bg-white/[0.015] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isOnline
                            ? 'bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30 ring-2 ring-[#00e03c]/20'
                            : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                        }`}>
                          {initials}
                          {isOnline && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00e03c] rounded-full border-2 border-[#0c131f] animate-pulse" />
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs leading-tight">{partner.name}</p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{partner.role}</span>
                        </div>
                      </div>

                      {/* Badge Online */}
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1 text-[8px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-2 py-0.5 rounded-full uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c] animate-ping" /> Online
                        </span>
                      ) : (
                        <span className="text-[8px] font-semibold text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                          Offline
                        </span>
                      )}
                    </div>

                    {/* Sector y Cronómetro */}
                    <div className="mt-2.5 pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Sector Oficina:</span>
                        <span className="font-bold text-amber-300 flex items-center gap-1 truncate mt-0.5">
                          <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                          {presence.currentSectorName || partner.defaultRoom}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Cronómetro Sesión:</span>
                        {isTimerOn ? (
                          <span className="font-mono font-black text-[#00e03c] inline-flex items-center gap-1 animate-pulse mt-0.5">
                            <Clock className="w-3 h-3 text-[#00e03c]" />
                            {formatTimer(pSecs)}
                          </span>
                        ) : (
                          <span className="font-mono text-slate-400 block mt-0.5">
                            {pSecs ? `${(pSecs / 3600).toFixed(1)}h pausa` : 'En pausa'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tarea / Actividad */}
                    <div className="mt-2 bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/[0.04] flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 truncate max-w-[200px]" title={presence.activeTaskTitle || 'Consultoría técnica'}>
                        📌 {presence.activeTaskTitle || 'Consultoría ambiental & proyectos'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate('office')}
                        className="text-[9px] font-black text-amber-400 hover:text-amber-200 underline ml-2 flex items-center gap-0.5 shrink-0"
                      >
                        Ubicar <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('office')}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 rounded-xl text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Abrir Oficina Virtual 2.5D (13 Despachos)</span>
          </button>
        </div>

      </div>

      {/* ── MODAL FLOTANTE: REGISTRAR SESIÓN ACTIVA A PROYECTO ── */}
      <AnimatePresence>
        {showSaveLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b131e] border border-[#00e03c]/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00e03c]/20 text-[#00e03c] flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Registrar Horas Efectivas</h3>
                    <p className="text-[10px] text-slate-400">Asignar tiempo acumulado a la base de datos de proyectos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSaveLogModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmSaveSession} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Proyecto / Propuesta de Destino
                  </label>
                  <select
                    className={selectCls}
                    value={activeTimer?.projectId || selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                  >
                    {activeServices.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.client} — {p.type.slice(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Horas Calculadas (Ajustables)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0.1"
                    className={inputCls}
                    value={customSaveHours}
                    onChange={e => setCustomSaveHours(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Cronómetro actual: {formatTimer(timerSec)} ({((timerSec / 3600)).toFixed(2)}h)
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Descripción del Trabajo Realizado *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Ej: Modelación geoespacial de vulnerabilidad hídrica en ArcGIS Pro y redacción de informe pericial..."
                    value={saveLogDesc}
                    onChange={e => setSaveLogDesc(e.target.value)}
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveLogModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#00e03c] hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-[#00e03c]/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar y Resetear</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SECCIÓN INFERIOR: RESUMEN HISTÓRICO Y FORMULARIO MANUAL ── */}
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
        {/* Formulario de Registro Manual Retroactivo */}
        <GlassCard className="p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <Plus className="w-4 h-4 text-[#00e03c]" />
            <h3 className="font-extrabold text-white text-sm">Registro Manual Retroactivo</h3>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proyecto</label>
              <select
                required
                className={selectCls}
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
              >
                <option value="" disabled>Selecciona un proyecto o propuesta</option>
                {activeServices.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.isProposal || p.tag === 'Propuesta' ? '📋 [PROPUESTA] ' : '💼 '}
                    {p.client} — {p.type.slice(0, 32)}...
                  </option>
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
              className="w-full bg-[#00e03c] text-slate-950 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Clock className="w-4 h-4" /> Registrar Horas Manualmente
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
                        {new Date(l.logged_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('¿Eliminar este registro de tiempo?')) {
                              handleDeleteTimeLog(l.id);
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Eliminar registro"
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
      </div>

      {/* ── CALCULADORA MERITOCRÁTICA DE HONORARIOS POR PROYECTO ── */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="font-extrabold text-white text-sm">Distribución Meritocrática de Utilidades</h3>
            <p className="text-[10px] text-slate-500">Cálculo en base a Horas Efectivas Totales trabajadas por proyecto</p>
          </div>
          <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full uppercase">
            Estatutos SERAM SRL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meritocraticShares.map(p => (
            <div key={p.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{p.client}</h4>
                  <p className="text-[10px] text-slate-400 truncate max-w-xs">{p.type}</p>
                </div>
                <span className="font-mono text-xs font-black text-[#00e03c]">
                  UN: Bs. {p.netProfit.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                {p.shares.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{s.name}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400 text-[10px]">{s.hours}h ({s.percent}%)</span>
                      <span className="font-bold text-white">Bs. {s.shareBs.toLocaleString()}</span>
                    </div>
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
    activeRole, currentSocio, handleLogoutPartner, handlePartnerLogin, handleSwitchPartner,
    registeredUsers, courses, activeServices, experiences, productList,
    municipalProposals, handleAddMunicipalProposal, handleEditMunicipalProposal, handleDeleteMunicipalProposal,
    timeLogs, handleAddTimeLog, handleDeleteTimeLog,
    partnerPresences,
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
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem('seram_company_metrics');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });
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
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
        const fetchPromise = supabase.from('company_metrics').select('*').limit(1);
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
        if (!error && data?.length > 0 && mounted) {
          setMetrics(data[0]);
          try {
            localStorage.setItem('seram_company_metrics', JSON.stringify(data[0]));
          } catch (err) {
            // Ignorar error de cuota de localStorage
          }
        }
      } catch (_) {
        // Fallback silencioso e inmediato a métricas cacheadas/locales
      }
    }
    if (activeRole === 'AdminMod') fetchMetrics();
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
    handleAddMunicipalProposal, handleEditMunicipalProposal, handleDeleteMunicipalProposal,
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
    { label: 'Propuestas Municipales', value: (municipalProposals || []).length.toString(), unit: 'Líneas Base', trend: 'Líder: Ing. Diego Barrientos', icon: <Building2 className="w-5 h-5" />, color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    { label: 'CO₂ Compensado', value: metrics?.co2_compensated ? metrics.co2_compensated.toLocaleString() : '1,240', unit: 'Tons', trend: 'Meta: 1,500T anuales', icon: <Leaf className="w-5 h-5" />, color: 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30' },
  ];

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {SIDEBAR_MODULES.find(m => m.id === activeModule)?.label}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Panel Directivo SERAM · Bienvenido, <span className="text-[#00e03c] font-bold">{activeSocio?.name}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Selector Rápido de Perfil de Socio para Verificar Multisesión en Tiempo Real */}
              <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-md">
                <span className="text-[9px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">
                  Ver como:
                </span>
                {safeEngineers.map((eng) => {
                  const isCurrent = activeSocio?.email === eng.email;
                  const presence = partnerPresences?.[eng.email];
                  const isOnline = isCurrent || (presence?.isOnline === true);
                  const initials = eng.name?.replace('Ing. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SO';
                  return (
                    <button
                      key={eng.email}
                      type="button"
                      onClick={() => handleSwitchPartner && handleSwitchPartner(eng.email)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#00e03c] text-slate-950 shadow-md shadow-[#00e03c]/20'
                          : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.1] hover:text-white'
                      }`}
                      title={`${eng.name} · ${isOnline ? 'En línea' : 'Ausente'} (Haz clic para alternar)`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? (isCurrent ? 'bg-slate-950' : 'bg-[#00e03c] animate-pulse') : 'bg-slate-500'}`} />
                      <span>{initials}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[9px] font-black text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-[#00e03c]/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c] animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c]" />
                En Línea · Tiempo Real
              </span>
              <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Socio Directivo
              </span>
            </div>
          </div>

          {/* Module Content — Permanente al 100% sin desvanecimiento */}
          <div key={activeModule} className="opacity-100 visible space-y-8">
            {activeModule === 'overview'    && <OverviewModule kpis={kpis} metrics={metrics} partnerPresences={partnerPresences} timeLogs={timeLogs || []} onNavigate={setActiveModule} activeServices={activeServices || []} courses={courses || []} currentSocio={activeSocio} />}
            {activeModule === 'office'      && <VirtualOfficeView activeServices={activeServices || []} courses={courses || []} timeLogs={timeLogs || []} partnerPresences={partnerPresences || {}} currentSocio={activeSocio} onNavigateModule={setActiveModule} />}
            {activeModule === 'activities'  && <ActivitiesAndClientsModule currentSocio={activeSocio} />}
            {activeModule === 'services'    && <ServicesModule activeServices={activeServices || []} registeredEngineers={safeEngineers} handlers={handlers} publicServices={publicServices || []} specialists={specialists || []} municipalProposals={municipalProposals || []} />}
            {activeModule === 'timetracker' && <TimeTrackerModule timeLogs={timeLogs || []} activeServices={activeServices || []} currentSocio={activeSocio} handlers={handlers} onNavigate={setActiveModule} />}
            {activeModule === 'academy'     && <AcademyModule courses={courses || []} registeredEngineers={safeEngineers} currentSocio={activeSocio} handlers={handlers} />}
            {activeModule === 'experience'  && <ExperienceModule experiences={experiences || []} handlers={handlers} />}
            {activeModule === 'store'       && <StoreModule productList={productList || []} handlers={handlers} />}
            {activeModule === 'users'       && <UsersModule registeredUsers={registeredUsers || []} handlers={handlers} partnerPresences={partnerPresences} />}
            {activeModule === 'finances'    && <FinancesModule />}
          </div>
        </div>
      </main>
    </div>
  );
}

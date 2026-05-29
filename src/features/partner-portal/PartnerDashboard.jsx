import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import {
  Shield, DollarSign, BookOpenCheck, Briefcase, Leaf,
  Plus, Trash2, Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabaseClient';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export default function PartnerDashboard() {
  const {
    activeRole, currentSocio, handleLogoutPartner,
    registeredUsers, courses, activeServices,
    handleAddCourse, handleDeleteCourse, handleToggleCoursePremium,
    handleAddProject, handleUpdateProjectProgress, handleDeleteProject,
    handleToggleUserPremium, handleRevokeUserAccess,
    triggerToast,
  } = useApp();

  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseInstructor, setNewCourseInstructor] = useState('');

  // --- SUPABASE DATA FETCH (Fase 3) ---
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchCompanyMetrics() {
      try {
        setLoading(true);
        // Consulta real a Supabase
        const { data, error } = await supabase
          .from('company_metrics')
          .select('*')
          .limit(1);

        if (error) throw error;

        if (isMounted && data && data.length > 0) {
          setMetrics(data[0]);
        }
      } catch (err) {
        console.warn('[Supabase Metrics Fetch]:', err.message);
        // Fallback local silencioso si la tabla no está creada
      } finally {
        // Retrasar sutilmente la carga (800ms) para percibir el skeleton premium de carga
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 800);
      }
    }

    if (activeRole === 'AdminMod') {
      fetchCompanyMetrics();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [activeRole]);

  // Guard: redirect non-admin users
  if (activeRole !== 'AdminMod') {
    return <Navigate to="/" replace />;
  }

  // --- PANTALLA DE CARGA CON SKELETONS CINEMÁTICOS ---
  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        {/* Skeleton Header */}
        <div className="glass-panel-dark border border-white/10 rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden animate-pulse">
          <div className="space-y-3 w-full lg:w-2/3">
            <div className="h-6 bg-white/5 rounded-md w-1/4" />
            <div className="h-10 bg-white/5 rounded-md w-3/4" />
            <div className="h-4 bg-white/5 rounded-md w-1/2" />
          </div>
          <div className="h-12 bg-white/5 rounded-xl w-40 shrink-0" />
        </div>

        {/* Skeleton KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className="glass-panel-dark border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between animate-pulse">
               <div className="space-y-2.5 w-2/3">
                 <div className="h-3 bg-white/5 rounded w-1/2" />
                 <div className="h-8 bg-white/5 rounded w-3/4" />
                 <div className="h-3 bg-white/5 rounded w-1/3" />
               </div>
               <div className="w-12 h-12 rounded-2xl bg-white/5 shrink-0" />
             </div>
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
             <div key={i} className="glass-panel-dark border border-white/[0.06] rounded-2xl p-6 h-64 animate-pulse">
               <div className="h-5 bg-white/5 rounded w-1/3 mb-4" />
               <div className="h-full bg-white/[0.02] rounded-xl w-full flex items-center justify-center">
                 <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
               </div>
             </div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Ingresos Totales', 
      value: metrics?.total_revenue 
        ? `$${metrics.total_revenue.toLocaleString()}` 
        : '$24,850', 
      unit: 'USD', 
      trend: metrics?.revenue_trend || '↑ +12.4% este mes', 
      icon: <DollarSign className="w-6 h-6" />, 
      color: 'bg-[#00e03c]/10 text-[#00e03c]' 
    },
    { 
      label: 'Alumnos Directos', 
      value: metrics?.total_students 
        ? metrics.total_students.toString() 
        : '143', 
      unit: 'Alumnos', 
      trend: metrics?.students_trend || '↑ +18 desde abril', 
      icon: <BookOpenCheck className="w-6 h-6" />, 
      color: 'bg-[#00e03c]/10 text-[#00e03c]' 
    },
    { 
      label: 'Proyectos Activos', 
      value: metrics?.active_projects 
        ? metrics.active_projects.toString() 
        : activeServices.length.toString(), 
      unit: 'En Curso', 
      trend: '2 Completados este ciclo', 
      icon: <Briefcase className="w-6 h-6" />, 
      color: 'bg-slate-900 text-emerald-400' 
    },
    { 
      label: 'CO2 Compensado', 
      value: metrics?.co2_compensated 
        ? metrics.co2_compensated.toLocaleString() 
        : '1,240', 
      unit: 'Tons', 
      trend: 'Meta anual: 1,500T', 
      icon: <Leaf className="w-6 h-6" />, 
      color: 'bg-[#00e03c] text-white' 
    },
  ];

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10"
    >
      {/* Dashboard Header */}
      <div className="glass-panel-dark border border-white/10 rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 opacity-5 blur-xl w-96 h-96 bg-[#00e03c] rounded-full -mr-20 -mt-20" />
        <div className="space-y-2 relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-[#00e03c]/20 text-[#00e03c] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[#00e03c]/30">
            <Shield className="w-3.5 h-3.5 animate-pulse" /> Socio Directivo Conectado
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Panel de Control SERAM</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Bienvenido, <strong className="text-white font-extrabold">{currentSocio?.name}</strong>.
            Desde este portal puedes auditar el tráfico, monitorear ingresos globales y gestionar la oferta de consultoría y academia.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <button
            onClick={handleLogoutPartner}
            className="bg-rose-950/80 border border-rose-800/50 hover:bg-rose-900 text-rose-300 px-5 py-3 rounded-xl font-bold text-xs uppercase transition-all tracking-wider"
          >
            Cerrar Sesión Directiva
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-panel-dark border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between hover:border-white/12 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</span>
              <h3 className="text-3xl font-black text-white">{kpi.value} <span className="text-xs font-bold text-slate-500">{kpi.unit}</span></h3>
              <p className="text-[10px] text-[#00e03c] font-bold">{kpi.trend}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart: Student Growth */}
        <div className="glass-panel-dark border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base">Crecimiento de Estudiantes</h3>
              <p className="text-xs text-slate-500">Progreso acumulado mensual en SERAM ACADEMY</p>
            </div>
            <span className="bg-[#00e03c]/10 text-[#00e03c] text-[10px] font-bold px-2 py-0.5 rounded border border-[#00e03c]/20">SaaS Engine</span>
          </div>
          <div className="relative pt-4">
            <svg viewBox="0 0 500 220" className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E03C" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00E03C" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {[20, 65, 110, 155, 200].map(y => (
                <line key={y} x1="40" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,3" />
              ))}
              <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
              {[['150',24],['110',69],['75',114],['35',159],['0',204]].map(([v,y]) => (
                <text key={v} x="30" y={y} fill="#475569" fontSize="10" fontWeight="bold" textAnchor="end">{v}</text>
              ))}
              {[['Ene',60],['Feb',160],['Mar',260],['Abr',360],['May',460]].map(([m,x]) => (
                <text key={m} x={x} y="218" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">{m}</text>
              ))}
              <path d="M 60 200 L 60 155 L 160 120 L 260 90 L 360 45 L 460 27 L 460 200 Z" fill="url(#chartAreaGrad)" />
              <path d="M 60 155 L 160 120 L 260 90 L 360 45 L 460 27" fill="none" stroke="#00e03c" strokeWidth="3" strokeLinecap="round" />
              {[[60,155,'45'],[160,120,'72'],[260,90,'98'],[360,45,'125'],[460,27,'143']].map(([x,y,v]) => (
                <g key={x}>
                  <circle cx={x} cy={y} r={x===460?6:5} fill={x===460?"#00e03c":"rgba(1,4,9,0.8)"} stroke="#00e03c" strokeWidth="2.5" />
                  <text x={x} y={y-13} fill={x===460?"#00e03c":"#94a3b8"} fontSize="9" fontWeight="800" textAnchor="middle">{v}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Bar Chart: Revenue by Pillar */}
        <div className="glass-panel-dark border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base">Distribución por Pilares</h3>
              <p className="text-xs text-slate-500">Ingresos divididos por pilares comerciales</p>
            </div>
            <span className="bg-white/10 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">Metrics AI</span>
          </div>
          <div className="relative pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
              {[120,210,300,390,480].map(x => (
                <line key={x} x1={x} y1="20" x2={x} y2="180" stroke={x===120?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)"} strokeWidth={x===120?1.5:1} strokeDasharray={x===120?undefined:"3,3"} />
              ))}
              <text x="15" y="54" fill="#cbd5e1" fontSize="11" fontWeight="bold">ACADEMY</text>
              <rect x="120" y="38" width="220" height="28" rx="6" fill="#00e03c" />
              <text x="350" y="55" fill="#00e03c" fontSize="11" fontWeight="800">$11,500 <tspan fill="#475569" fontSize="9">(46%)</tspan></text>
              <text x="15" y="104" fill="#cbd5e1" fontSize="11" fontWeight="bold">SERVICES</text>
              <rect x="120" y="88" width="190" height="28" rx="6" fill="#0f172a" />
              <text x="320" y="105" fill="#e2e8f0" fontSize="11" fontWeight="800">$9,850 <tspan fill="#475569" fontSize="9">(40%)</tspan></text>
              <text x="15" y="154" fill="#cbd5e1" fontSize="11" fontWeight="bold">EXPERIENCE</text>
              <rect x="120" y="138" width="70" height="28" rx="6" fill="#10b981" />
              <text x="200" y="155" fill="#10b981" fontSize="11" fontWeight="800">$3,500 <tspan fill="#475569" fontSize="9">(14%)</tspan></text>
              {[['$0',120],['$3k',210],['$6k',300],['$9k',390],['$12k',480]].map(([v,x]) => (
                <text key={v} x={x} y="198" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">{v}</text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* User Audit Table */}
      <div className="glass-panel-dark border border-white/[0.06] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h3 className="font-extrabold text-white text-lg">Auditoría Ecológica: Usuarios del SaaS</h3>
            <p className="text-xs text-slate-500">Lista completa de cuentas registradas</p>
          </div>
          <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-3 py-1 rounded-full border border-rose-500/20">
            {registeredUsers.length} Usuarios
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-slate-500 font-extrabold uppercase tracking-widest border-b border-white/[0.06]">
                {['Usuario', 'Correo', 'Rol', 'Estado', 'Acción'].map(h => (
                  <th key={h} className={`p-4 ${h === 'Acción' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {registeredUsers.map((u) => {
                const isDirectivo = u.role === 'AdminMod';
                const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr key={u.email} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${isDirectivo ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-[#00e03c]/10 text-[#00e03c] border border-[#00e03c]/20'}`}>
                        {initials || 'U'}
                      </div>
                      <div>
                        <p className="font-extrabold text-white">{u.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{isDirectivo ? 'Socio Fundador' : 'Cliente Registrado'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${isDirectivo ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-[#00e03c]/10 border-[#00e03c]/20 text-[#00e03c]'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {isDirectivo ? (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded text-[9px] font-bold uppercase">Vitalicio Pro</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase border ${u.isPremiumApproved ? 'bg-[#00e03c]/10 border-[#00e03c]/20 text-[#00e03c]' : 'bg-white/[0.03] border-white/[0.06] text-slate-500'}`}>
                          {u.isPremiumApproved ? 'Pro Premium' : 'Básico'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isDirectivo ? (
                        <span className="text-[10px] text-slate-600 italic">Socio Fundador</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { handleToggleUserPremium(u.email); triggerToast(u.isPremiumApproved ? `Premium removido para ${u.name}` : `Premium concedido a ${u.name}`, 'success'); }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase transition-colors border ${u.isPremiumApproved ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' : 'text-[#00e03c] bg-[#00e03c]/10 border-[#00e03c]/20 hover:bg-[#00e03c]/20'}`}
                          >
                            {u.isPremiumApproved ? 'Degradar' : 'Aprobar Premium'}
                          </button>
                          <button
                            onClick={() => { if (confirm(`¿Revocar acceso para ${u.name}?`)) handleRevokeUserAccess(u.email); }}
                            className="text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Management Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Management */}
        <div className="glass-panel-dark border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <BookOpenCheck className="w-5 h-5 text-[#00e03c]" />
            <h3 className="font-extrabold text-white text-base">Módulos Académicos Curriculares</h3>
          </div>
          <p className="text-xs text-slate-500">Crea y administra los cursos y diplomados que se ofrecen en SERAM ACADEMY.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); handleAddCourse(newCourseTitle, newCourseInstructor); setNewCourseTitle(''); setNewCourseInstructor(''); }}
            className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]"
          >
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Añadir Nuevo Curso</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Título</label>
                <input
                  type="text" required value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)}
                  placeholder="p. ej. Cartografía Digital"
                  className="w-full text-xs px-3 py-2 bg-slate-950/80 border border-white/10 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-[#00e03c]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Instructor</label>
                <input
                  type="text" required value={newCourseInstructor} onChange={e => setNewCourseInstructor(e.target.value)}
                  placeholder="Nombre del Ingeniero"
                  className="w-full text-xs px-3 py-2 bg-slate-950/80 border border-white/10 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-[#00e03c]"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#00e03c]/10 border border-[#00e03c]/30 text-[#00e03c] py-2 rounded-lg font-bold text-xs uppercase hover:bg-[#00e03c]/20 flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Agregar a Academy
            </button>
          </form>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {courses.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-xs text-white">{c.title}</p>
                  <p className="text-[9px] text-slate-500">Docente: {c.instructor}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleCoursePremium(c.id)}
                    className={`text-[9px] font-bold px-2 py-1 rounded-lg border uppercase ${c.isPremium ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/[0.03] border-white/[0.06] text-slate-500'}`}
                  >
                    {c.isPremium ? 'Premium' : 'Normal'}
                  </button>
                  <button onClick={() => handleDeleteCourse(c.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Management */}
        <div className="glass-panel-dark border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <Briefcase className="w-5 h-5 text-slate-300" />
            <h3 className="font-extrabold text-white text-base">Cartera de Proyectos de Consultoría</h3>
          </div>
          <p className="text-xs text-slate-500">Agrega y actualiza el avance de los estudios y auditorías para clientes del sector.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const client = e.target.elements.projClient.value;
              const type = e.target.elements.projType.value;
              if (!client || !type) return;
              handleAddProject(client, type);
              e.target.reset();
            }}
            className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]"
          >
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crear Registro de Estudio</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Cliente</label>
                <input
                  type="text" name="projClient" required placeholder="p. ej. Minera Los Andes"
                  className="w-full text-xs px-3 py-2 bg-slate-950/80 border border-white/10 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-[#00e03c]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Tipo de Servicio</label>
                <input
                  type="text" name="projType" required placeholder="p. ej. Auditoría de Residuos"
                  className="w-full text-xs px-3 py-2 bg-slate-950/80 border border-white/10 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-[#00e03c]"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#00e03c]/10 border border-[#00e03c]/30 text-[#00e03c] py-2 rounded-lg font-bold text-xs uppercase hover:bg-[#00e03c]/20 flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Registrar Proyecto
            </button>
          </form>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activeServices.map(p => (
              <div key={p.id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-xs text-white">{p.client}</p>
                    <p className="text-[9px] text-slate-500">{p.type} • Resp: {p.lead.split(' ')[0]}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { handleUpdateProjectProgress(p.id); triggerToast(`Avance de ${p.client} actualizado`, 'success'); }}
                      className="bg-[#00e03c]/10 hover:bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/20 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                    >
                      +10%
                    </button>
                    <button onClick={() => handleDeleteProject(p.id)} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded">
                      <Trash2 className="w-4 h-4" strokeWidth="2" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00e03c] h-full transition-all duration-300" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

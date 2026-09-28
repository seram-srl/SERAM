import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, Bot, Maximize2, Minimize2, ZoomIn, ZoomOut,
  RotateCcw, Sparkles, Shield, DollarSign, Clock, CheckCircle2,
  AlertCircle, ChevronRight, X, Search, Filter, Play, ExternalLink,
  Laptop, Smartphone, Award, TrendingUp, Layers, Compass, Target,
  Briefcase, BookOpenCheck, Globe, HelpCircle, Info
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA DEFINITIONS: DEPARTMENTS & AGENTS
// ─────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  { id: 'all', name: 'Toda la oficina', count: 18 },
  { id: 'direccion', name: 'Dirección & Estrategia', count: 3 },
  { id: 'operaciones', name: 'Operaciones SIG', count: 3 },
  { id: 'hidraulica', name: 'Ing. Hidráulica & Riego', count: 3 },
  { id: 'legal', name: 'Legal & Fichas Ambientales', count: 3 },
  { id: 'comercial', name: 'Comercial & Municipal', count: 3 },
  { id: 'academia', name: 'Academia & Capacitación', count: 3 },
];

const INITIAL_OFFICE_AGENTS = [
  // ── DIRECCIÓN GENERAL
  {
    id: 'socio-diego',
    deptId: 'direccion',
    name: 'Ing. Diego Barrientos',
    role: 'Socio Fundador · Dirección General',
    type: 'socio',
    isUser: true,
    status: 'online',
    currentActivity: 'Liderando Propuestas Técnicas de Agua y Minería Aurífera ante Municipios',
    hoursToday: 4.2,
    targetHours: 4.5,
    totalCycleHours: 46.5,
    ratePerHour: 300,
    avatarColor: 'from-amber-400 to-yellow-600',
    avatarChar: 'DB',
    device: 'Móvil & Escritorio',
    assignedModule: 'services',
    x: 480, // SVG Isometric layout coords
    y: 210,
    gender: 'male',
    standing: true
  },
  {
    id: 'socio-fernando',
    deptId: 'direccion',
    name: 'Ing. Fernando Araujo',
    role: 'Socio Directivo · Hidráulica & Proyectos',
    type: 'socio',
    isUser: false,
    status: 'online',
    currentActivity: 'Revisión técnica de memorias de cálculo para redes de microriego',
    hoursToday: 3.5,
    targetHours: 4.5,
    totalCycleHours: 32.0,
    ratePerHour: 300,
    avatarColor: 'from-blue-500 to-indigo-600',
    avatarChar: 'FA',
    device: 'Escritorio',
    assignedModule: 'services',
    x: 360,
    y: 220,
    gender: 'male',
    standing: false
  },
  {
    id: 'socio-fabricio',
    deptId: 'direccion',
    name: 'Ing. Fabricio Orosco',
    role: 'Socio Directivo · Calidad Ambiental & Expansión',
    type: 'socio',
    isUser: false,
    status: 'online',
    currentActivity: 'Planificación de muestreo hidroquímico y alianzas interinstitucionales',
    hoursToday: 2.8,
    targetHours: 4.5,
    totalCycleHours: 24.5,
    ratePerHour: 300,
    avatarColor: 'from-emerald-500 to-teal-700',
    avatarChar: 'FO',
    device: 'Escritorio',
    assignedModule: 'experience',
    x: 420,
    y: 170,
    gender: 'male',
    standing: true
  },

  // ── OPERACIONES SIG & TELEDETECCIÓN
  {
    id: 'bot-sentinel',
    deptId: 'operaciones',
    name: 'Bot Sentinel-2 NDVI',
    role: 'Agente IA · Procesamiento Espectral',
    type: 'bot',
    status: 'active',
    currentActivity: 'Descarga y corrección atmosférica de bandas Sentinel-2 L2A (Cuenca Madre de Dios)',
    efficiency: '99.4%',
    tasksDone: 142,
    avatarChar: '🛰️',
    assignedModule: 'services',
    x: 740,
    y: 230,
    standing: false
  },
  {
    id: 'bot-qgis',
    deptId: 'operaciones',
    name: 'Bot QGIS Cuencas',
    role: 'Agente IA · Delimitación Hidrológica',
    type: 'bot',
    status: 'active',
    currentActivity: 'Generación de curvas de nivel y red de drenaje desde modelos DEM ALOS PALSAR',
    efficiency: '98.8%',
    tasksDone: 89,
    avatarChar: '🗺️',
    assignedModule: 'services',
    x: 820,
    y: 270,
    standing: false
  },
  {
    id: 'bot-drones',
    deptId: 'operaciones',
    name: 'Bot Fotogrametría Drones',
    role: 'Agente IA · Nubes de Puntos & Ortomosaicos',
    type: 'bot',
    status: 'idle',
    currentActivity: 'En espera de nuevos vuelos LiDAR / RGB de expediciones',
    efficiency: '97.5%',
    tasksDone: 34,
    avatarChar: '🛸',
    assignedModule: 'services',
    x: 900,
    y: 310,
    standing: false
  },

  // ── INGENIERÍA HIDRÁULICA & RIEGO
  {
    id: 'bot-epanet',
    deptId: 'hidraulica',
    name: 'Bot EPANET Riego',
    role: 'Agente IA · Modelación de Presiones',
    type: 'bot',
    status: 'active',
    currentActivity: 'Simulación de pérdidas de carga por fricción (Hazen-Williams) en redes secundarias',
    efficiency: '99.1%',
    tasksDone: 68,
    avatarChar: '💧',
    assignedModule: 'services',
    x: 730,
    y: 470,
    standing: false
  },
  {
    id: 'bot-cropwat',
    deptId: 'hidraulica',
    name: 'Bot CROPWAT Balance',
    role: 'Agente IA · Demanda Hídrica de Cultivos',
    type: 'bot',
    status: 'active',
    currentActivity: 'Cálculo de evapotranspiración de referencia ETo mediante Penman-Monteith',
    efficiency: '98.2%',
    tasksDone: 51,
    avatarChar: '🌱',
    assignedModule: 'services',
    x: 810,
    y: 510,
    standing: false
  },
  {
    id: 'bot-mercurio',
    deptId: 'hidraulica',
    name: 'Bot Calidad de Agua & Mercurio',
    role: 'Agente IA · Monitoreo de Metales Pesados',
    type: 'bot',
    status: 'active',
    currentActivity: 'Cálculo de índices de dispersión de Hg en sedimentos fluviales por minería aluvial',
    efficiency: '99.7%',
    tasksDone: 112,
    avatarChar: '🔬',
    assignedModule: 'services',
    x: 890,
    y: 550,
    standing: false
  },

  // ── ÁREA LEGAL & FICHAS AMBIENTALES
  {
    id: 'bot-ley1333',
    deptId: 'legal',
    name: 'Bot Ley 1333 Clasificador',
    role: 'Agente IA · Categorización Ambiental',
    type: 'bot',
    status: 'active',
    currentActivity: 'Clasificación automática de actividades económicas según D.S. 3549 / Ley 1333',
    efficiency: '99.9%',
    tasksDone: 215,
    avatarChar: '⚖️',
    assignedModule: 'services',
    x: 180,
    y: 460,
    standing: false
  },
  {
    id: 'bot-renca',
    deptId: 'legal',
    name: 'Bot Licencias RENCA',
    role: 'Agente IA · Gestión de Registros',
    type: 'bot',
    status: 'active',
    currentActivity: 'Monitoreo de vigencia de consultores certificados y firmas técnicas autorizadas',
    efficiency: '99.5%',
    tasksDone: 77,
    avatarChar: '📜',
    assignedModule: 'services',
    x: 260,
    y: 500,
    standing: false
  },
  {
    id: 'bot-rai',
    deptId: 'legal',
    name: 'Bot RAI & Auditorías',
    role: 'Agente IA · Registro Ambiental Industrial',
    type: 'bot',
    status: 'idle',
    currentActivity: 'Plantillas listas para Registro Ambiental Industrial de plantas procesadoras',
    efficiency: '98.0%',
    tasksDone: 42,
    avatarChar: '🏭',
    assignedModule: 'services',
    x: 340,
    y: 540,
    standing: false
  },

  // ── COMERCIAL & CONCEJALES MUNICIPALES
  {
    id: 'bot-dossier',
    deptId: 'comercial',
    name: 'Bot Dossier Concejales',
    role: 'Agente IA · Propuestas Técnicas Municipales',
    type: 'bot',
    status: 'active',
    currentActivity: 'Estructurando pliego técnico sobre remediación de mercurio para Gobiernos Municipales',
    efficiency: '99.3%',
    tasksDone: 84,
    avatarChar: '🏛️',
    assignedModule: 'services',
    x: 770,
    y: 90,
    standing: false
  },
  {
    id: 'bot-cotizador',
    deptId: 'comercial',
    name: 'Bot Cotizador B2B',
    role: 'Agente IA · Presupuestos de Consultoría',
    type: 'bot',
    status: 'active',
    currentActivity: 'Computando costos de brigada de campo y análisis de laboratorio acreditado',
    efficiency: '97.9%',
    tasksDone: 63,
    avatarChar: '💼',
    assignedModule: 'services',
    x: 850,
    y: 130,
    standing: false
  },
  {
    id: 'bot-sicoes',
    deptId: 'comercial',
    name: 'Bot Licitaciones SICOES',
    role: 'Agente IA · Vigilancia de Contrataciones Estatales',
    type: 'bot',
    status: 'active',
    currentActivity: 'Escaneo de Documentos Base de Contratación (DBC) en saneamiento y cuencas',
    efficiency: '98.5%',
    tasksDone: 190,
    avatarChar: '📑',
    assignedModule: 'services',
    x: 930,
    y: 170,
    standing: false
  },

  // ── ACADEMIA & CAPACITACIÓN
  {
    id: 'bot-tutor',
    deptId: 'academia',
    name: 'Bot Tutor Teledetección',
    role: 'Agente IA · Soporte a Estudiantes',
    type: 'bot',
    status: 'active',
    currentActivity: 'Resolviendo consultas de alumnos sobre índices espectrales en Google Earth Engine',
    efficiency: '99.0%',
    tasksDone: 340,
    avatarChar: '🎓',
    assignedModule: 'academy',
    x: 450,
    y: 430,
    standing: false
  },
  {
    id: 'bot-certificados',
    deptId: 'academia',
    name: 'Bot Certificados Digitales',
    role: 'Agente IA · Emisión y Validación QR',
    type: 'bot',
    status: 'active',
    currentActivity: 'Generación de credenciales verificables con código hash institucional',
    efficiency: '100%',
    tasksDone: 512,
    avatarChar: '🏅',
    assignedModule: 'academy',
    x: 520,
    y: 470,
    standing: false
  },
  {
    id: 'bot-campus',
    deptId: 'academia',
    name: 'Bot Campus Virtual',
    role: 'Agente IA · Aulas & Videoteca',
    type: 'bot',
    status: 'idle',
    currentActivity: 'Streaming optimizado y sincronización de recursos formativos',
    efficiency: '98.7%',
    tasksDone: 120,
    avatarChar: '💻',
    assignedModule: 'academy',
    x: 590,
    y: 510,
    standing: false
  },
];

export default function VirtualOfficeView({
  activeServices = [],
  timeLogs = [],
  partnerPresences = [],
  currentSocio,
  onNavigateModule
}) {
  // Navigation / Filter States
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(INITIAL_OFFICE_AGENTS[0]); // default to Diego Barrientos
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMeritocracyModal, setShowMeritocracyModal] = useState(false);
  const [showScheduleInfo, setShowScheduleInfo] = useState(false);

  // Zoom and Pan States
  const [zoomLevel, setZoomLevel] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 0.58;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 0.85;
    return 1;
  });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const officeFloorRef = useRef(null);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const next = !prev;
      if (next && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!next && document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      return next;
    });
  };

  // Meritocratic calculations based on active logs & services
  const meritocracyStats = useMemo(() => {
    // Total hours logged in timeLogs
    const totalPartnerHours = timeLogs.reduce((acc, l) => acc + (Number(l.hours) || 0), 0) || 103;
    const partnerDiegoHours = timeLogs.filter(l => l.partner_name?.toLowerCase().includes('diego')).reduce((acc, l) => acc + (Number(l.hours) || 0), 0) || 46.5;
    const partnerFernandoHours = timeLogs.filter(l => l.partner_name?.toLowerCase().includes('fernando')).reduce((acc, l) => acc + (Number(l.hours) || 0), 0) || 32.0;
    const partnerFabricioHours = timeLogs.filter(l => l.partner_name?.toLowerCase().includes('fabricio')).reduce((acc, l) => acc + (Number(l.hours) || 0), 0) || 24.5;

    // Standard SERAM Project Pool (Bs. calculated from active services)
    const baseProjectPool = 35000;
    const diegoShare = (partnerDiegoHours / totalPartnerHours);
    const fernandoShare = (partnerFernandoHours / totalPartnerHours);
    const fabricioShare = (partnerFabricioHours / totalPartnerHours);

    return {
      totalHours: totalPartnerHours,
      projectPool: baseProjectPool,
      partners: [
        {
          name: 'Ing. Diego Barrientos',
          role: 'Dirección General & Estrategia',
          hours: partnerDiegoHours,
          today: 4.2,
          sharePercent: Math.round(diegoShare * 100),
          estimatedEarnings: Math.round(baseProjectPool * diegoShare),
          ratePerHour: 300,
          status: 'online'
        },
        {
          name: 'Ing. Fernando Araujo',
          role: 'Hidráulica & Obras',
          hours: partnerFernandoHours,
          today: 3.5,
          sharePercent: Math.round(fernandoShare * 100),
          estimatedEarnings: Math.round(baseProjectPool * fernandoShare),
          ratePerHour: 300,
          status: 'online'
        },
        {
          name: 'Ing. Fabricio Orosco',
          role: 'Gestión Ambiental & Calidad',
          hours: partnerFabricioHours,
          today: 2.8,
          sharePercent: Math.round(fabricioShare * 100),
          estimatedEarnings: Math.round(baseProjectPool * fabricioShare),
          ratePerHour: 300,
          status: 'online'
        }
      ]
    };
  }, [timeLogs]);

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return INITIAL_OFFICE_AGENTS.filter(agent => {
      const matchDept = selectedDept === 'all' || agent.deptId === selectedDept;
      const matchSearch = !searchQuery || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.currentActivity.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [selectedDept, searchQuery]);

  // Handle Drag / Pan events (Mouse & Touch)
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.no-drag')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(0.7, prev + delta), 2.2));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Keyboard escape for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div className={`relative transition-all duration-300 select-none ${
      isFullscreen 
        ? 'fixed inset-0 z-50 bg-[#080d14] flex flex-col p-2 sm:p-4 overflow-hidden' 
        : 'w-full rounded-2xl border border-white/10 bg-[#070b10] shadow-2xl overflow-hidden'
    }`}>
      {/* ── TOP HEADER HUD & STATUS ── */}
      <div className="bg-white/[0.03] border-b border-white/[0.08] backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Oficina Virtual SERAM
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Metaverso 2.5D
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">
              Piso Operativo & Estratégico · Socios, Consultores y Bots de Inteligencia Especializada
            </p>
          </div>
        </div>

        {/* Quick Rules & Meritocracy Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Daily Schedule Pill */}
          <button
            onClick={() => setShowScheduleInfo(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-slate-300 font-bold transition-all"
            title="Ver pautas de horario y conexión flexible"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>4.5 hrs / día</span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(09:00 AM pref · 24/7 libre)</span>
            <Info className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {/* Meritocracy Pill */}
          <button
            onClick={() => setShowMeritocracyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold transition-all shadow-sm shadow-emerald-500/10"
            title="Ver modelo meritocrático de ganancias"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quien trabaja más gana más</span>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded font-mono text-white">
              Bs. {meritocracyStats.projectPool.toLocaleString()}
            </span>
          </button>

          {/* Fullscreen toggle button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white font-bold transition-all ml-auto lg:ml-0"
            title={isFullscreen ? "Salir de pantalla completa (Esc)" : "Pantalla completa optimizada para mobile"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Minimizar' : 'Pantalla Completa'}</span>
          </button>
        </div>
      </div>

      {/* ── DEPARTMENT NAVIGATION CHIPS & SEARCH ── */}
      <div className="bg-white/[0.02] border-b border-white/[0.06] px-4 py-2.5 sm:px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 z-20">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedDept === dept.id
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <span>{dept.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedDept === dept.id ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/5 text-slate-500'
              }`}>
                {dept.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search agent */}
        <div className="relative w-full md:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar socio o bot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── ISOMETRIC CANVAS CONTAINER ── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full overflow-hidden bg-gradient-to-b from-[#0a0f18] via-[#080d15] to-[#04070b] cursor-grab active:cursor-grabbing ${
          isFullscreen ? 'flex-1 h-full' : 'h-[560px] sm:h-[640px]'
        }`}
      >
        {/* Subtle Isometric Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Zoom & Pan Stage */}
        <div
          ref={officeFloorRef}
          className="absolute origin-center transition-transform duration-75 will-change-transform"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            left: '50%',
            top: '50%',
            marginLeft: '-550px',
            marginTop: '-360px',
            width: '1100px',
            height: '720px'
          }}
        >
          {/* ── SVG ISOMETRIC ARCHITECTURE ── */}
          <svg viewBox="0 0 1100 720" className="w-full h-full drop-shadow-2xl">
            <defs>
              {/* Gradients for floor & walls */}
              <linearGradient id="mainFloorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0a0f1d" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="officeWallWood" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3d2817" />
                <stop offset="100%" stopColor="#22150a" />
              </linearGradient>

              <linearGradient id="glassWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
              </linearGradient>

              <linearGradient id="neonEmeraldLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
              </linearGradient>

              <filter id="glowDrop" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* ── 1. MAIN RAISED PLATFORM (Piso Principal Isométrico) ── */}
            {/* Base Shadow */}
            <polygon points="100,280 550,50 1000,280 550,670" fill="#000000" opacity="0.6" filter="url(#glowDrop)" />
            
            {/* Slab Thickness */}
            <polygon points="100,280 550,670 550,695 100,305" fill="#0b111c" />
            <polygon points="1000,280 550,670 550,695 1000,305" fill="#06090f" />
            
            {/* Main Floor Surface */}
            <polygon points="100,280 550,50 1000,280 550,670" fill="url(#mainFloorGrad)" stroke="#334155" strokeWidth="1.5" />

            {/* Neon Border Accent on Floor Edge */}
            <polyline points="100,280 550,670 1000,280" fill="none" stroke="url(#neonEmeraldLine)" strokeWidth="3" />

            {/* ── 2. DEPARTMENT DIVISIONS & GLASS WALLS ── */}

            {/* Back Accent Wall - Corporate Wood & Screens */}
            {/* Wall 1: Dirección General (Top Center) */}
            <polygon points="300,140 550,30 550,110 300,220" fill="url(#officeWallWood)" stroke="#57381e" strokeWidth="1" />
            {/* Strategic Wall Dashboard */}
            <polygon points="330,135 520,40 520,95 330,190" fill="#0c1e19" stroke="#10b981" strokeWidth="1" opacity="0.9" />
            <text x="350" y="145" fill="#34d399" fontSize="9" fontWeight="bold" transform="rotate(22, 350, 145)">SERAM 2026 · ESTRATEGIA & METAS</text>

            {/* Wall 2: Comercial & Concejales (Top Right) */}
            <polygon points="550,30 800,140 800,220 550,110" fill="url(#officeWallWood)" stroke="#57381e" strokeWidth="1" />
            <polygon points="580,45 770,135 770,190 580,95" fill="#131b2e" stroke="#38bdf8" strokeWidth="1" opacity="0.9" />
            <text x="600" y="85" fill="#60a5fa" fontSize="9" fontWeight="bold" transform="rotate(-22, 600, 85)">CONCEJOS MUNICIPALES · EXPEDICIONES</text>

            {/* Internal Glass Partitions (Isometric division lines) */}
            {/* Central Corridor Glass Partition */}
            <polygon points="350,370 550,260 550,320 350,430" fill="url(#glassWallGrad)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 3" />
            <polygon points="550,260 750,370 750,430 550,320" fill="url(#glassWallGrad)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 3" />

            {/* Front Glass Railing */}
            <polygon points="200,420 550,600 550,625 200,445" fill="url(#glassWallGrad)" stroke="#06b6d4" strokeWidth="1" opacity="0.7" />
            <polygon points="550,600 900,420 900,445 550,625" fill="url(#glassWallGrad)" stroke="#06b6d4" strokeWidth="1" opacity="0.7" />

            {/* ── 3. DEPARTMENT LABELS ON WALLS / FLOORS ── */}
            {/* Dirección Banner */}
            <g transform="translate(425, 75)">
              <rect x="-65" y="-12" width="130" height="22" rx="6" fill="#1a120b" stroke="#eab308" strokeWidth="1.2" opacity="0.9" />
              <text x="0" y="3" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="900" letterSpacing="1">DIRECCIÓN</text>
            </g>

            {/* Comercial Banner */}
            <g transform="translate(675, 75)">
              <rect x="-60" y="-12" width="120" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" opacity="0.9" />
              <text x="0" y="3" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="900" letterSpacing="1">COMERCIAL</text>
            </g>

            {/* Operaciones SIG Banner */}
            <g transform="translate(830, 210)">
              <rect x="-65" y="-12" width="130" height="22" rx="6" fill="#062117" stroke="#10b981" strokeWidth="1.2" opacity="0.9" />
              <text x="0" y="3" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="900" letterSpacing="1">OPERACIONES SIG</text>
            </g>

            {/* Hidráulica Banner */}
            <g transform="translate(810, 440)">
              <rect x="-60" y="-12" width="120" height="22" rx="6" fill="#0c1e28" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.9" />
              <text x="0" y="3" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900" letterSpacing="1">HIDRÁULICA</text>
            </g>

            {/* Legal Banner */}
            <g transform="translate(260, 430)">
              <rect x="-65" y="-12" width="130" height="22" rx="6" fill="#1f1515" stroke="#f43f5e" strokeWidth="1.2" opacity="0.9" />
              <text x="0" y="3" textAnchor="middle" fill="#fda4af" fontSize="10" fontWeight="900" letterSpacing="1">LEGAL & FICHAS</text>
            </g>

            {/* Academia Banner */}
            <g transform="translate(520, 395)">
              <rect x="-55" y="-12" width="110" height="22" rx="6" fill="#181329" stroke="#a855f7" strokeWidth="1.2" opacity="0.9" />
              <text x="0" y="3" textAnchor="middle" fill="#d8b4fe" fontSize="10" fontWeight="900" letterSpacing="1">ACADEMIA</text>
            </g>

            {/* ── 4. MODERN ISOMETRIC DESKS & FURNITURE ── */}
            {/* Desk 1: Dirección Executive Desk */}
            <g transform="translate(420, 225)">
              {/* Desk shadow */}
              <polygon points="-70,25 0,-15 70,25 0,65" fill="#000000" opacity="0.4" />
              {/* Desk Top */}
              <polygon points="-65,20 0,-15 65,20 0,55" fill="#2d1b0d" stroke="#78350f" strokeWidth="1.2" />
              {/* Dual Monitors */}
              <rect x="-35" y="-3" width="28" height="18" rx="2" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              <rect x="0" y="-3" width="28" height="18" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              {/* Chair */}
              <circle cx="0" cy="50" r="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            </g>

            {/* Lounge Sofa in Dirección */}
            <g transform="translate(490, 170)">
              <polygon points="-30,10 0,-8 30,10 0,28" fill="#713f12" stroke="#a16207" strokeWidth="1" />
              <rect x="-25" y="-2" width="50" height="10" rx="3" fill="#854d0e" />
            </g>

            {/* Workstations Operaciones SIG (Desks 1, 2, 3) */}
            <g transform="translate(740, 245)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#052e16" stroke="#22c55e" strokeWidth="1" />
              {/* Plant pot */}
              <circle cx="-32" cy="12" r="5" fill="#15803d" />
            </g>
            <g transform="translate(820, 285)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#052e16" stroke="#22c55e" strokeWidth="1" />
            </g>
            <g transform="translate(900, 325)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#052e16" stroke="#22c55e" strokeWidth="1" />
              {/* External consultant ready desk note */}
              <text x="0" y="32" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">DESK LIBRE</text>
            </g>

            {/* Workstations Hidráulica (Desks 1, 2, 3) */}
            <g transform="translate(730, 485)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
            </g>
            <g transform="translate(810, 525)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
            </g>
            <g transform="translate(890, 565)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
            </g>

            {/* Workstations Legal (Desks 1, 2, 3) */}
            <g transform="translate(180, 475)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#4c0519" stroke="#fb7185" strokeWidth="1" />
            </g>
            <g transform="translate(260, 515)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#4c0519" stroke="#fb7185" strokeWidth="1" />
            </g>
            <g transform="translate(340, 555)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#4c0519" stroke="#fb7185" strokeWidth="1" />
            </g>

            {/* Workstations Comercial (Desks 1, 2, 3) */}
            <g transform="translate(770, 105)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
            </g>
            <g transform="translate(850, 145)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
            </g>
            <g transform="translate(930, 185)">
              <polygon points="-40,15 0,-8 40,15 0,38" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-15" y="-6" width="30" height="16" rx="2" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
            </g>

            {/* Workstations Academia (Desks 1, 2, 3) */}
            <g transform="translate(450, 445)">
              <polygon points="-35,13 0,-7 35,13 0,33" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-12" y="-5" width="24" height="14" rx="2" fill="#2e1065" stroke="#c084fc" strokeWidth="1" />
            </g>
            <g transform="translate(520, 485)">
              <polygon points="-35,13 0,-7 35,13 0,33" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-12" y="-5" width="24" height="14" rx="2" fill="#2e1065" stroke="#c084fc" strokeWidth="1" />
            </g>
            <g transform="translate(590, 525)">
              <polygon points="-35,13 0,-7 35,13 0,33" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="-12" y="-5" width="24" height="14" rx="2" fill="#2e1065" stroke="#c084fc" strokeWidth="1" />
            </g>

            {/* Indoor Plants throughout the floor */}
            {[
              { x: 260, y: 350 }, { x: 450, y: 130 }, { x: 550, y: 190 },
              { x: 670, y: 220 }, { x: 690, y: 400 }, { x: 380, y: 420 },
              { x: 700, y: 600 }, { x: 970, y: 370 }
            ].map((p, idx) => (
              <g key={idx} transform={`translate(${p.x}, ${p.y})`}>
                <ellipse cx="0" cy="10" rx="8" ry="4" fill="#000000" opacity="0.3" />
                <rect x="-5" y="0" width="10" height="12" rx="2" fill="#451a03" />
                <circle cx="-4" cy="-4" r="6" fill="#16a34a" />
                <circle cx="4" cy="-4" r="6" fill="#22c55e" />
                <circle cx="0" cy="-8" r="7" fill="#15803d" />
              </g>
            ))}
          </svg>

          {/* ── 5. INTERACTIVE AVATAR NODES & FLOATING LABELS ── */}
          {/* Rendered as HTML elements above the SVG for crisp UI, clickability and animations */}
          {filteredAgents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <div
                key={agent.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAgent(agent);
                }}
                className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 active:scale-95 group"
                style={{
                  left: `${agent.x}px`,
                  top: `${agent.y}px`,
                }}
              >
                {/* Floating Clean Pill Tag (Inspired by reference) */}
                <div className={`no-drag mb-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight whitespace-nowrap shadow-xl flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 scale-105'
                    : agent.isUser
                      ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                      : agent.type === 'socio'
                        ? 'bg-white/90 text-slate-900 border border-white'
                        : 'bg-slate-900/90 text-slate-200 border border-white/20 hover:bg-slate-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    agent.status === 'online' || agent.status === 'active'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-slate-400'
                  }`} />
                  <span>{agent.name} {agent.isUser ? '(Vos)' : ''}</span>
                </div>

                {/* Avatar Visual Character */}
                <div className="relative mx-auto flex flex-col items-center">
                  {/* Subtle ground shadow */}
                  <div className="w-8 h-3 bg-black/40 rounded-full blur-[2px] absolute -bottom-1" />

                  {agent.type === 'socio' ? (
                    // Partner Avatar (Executive Suit/Jacket)
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${agent.avatarColor} p-0.5 shadow-lg relative ${
                      isSelected ? 'ring-4 ring-emerald-400/80 shadow-emerald-500/50' : ''
                    }`}>
                      <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xs text-white">
                        {agent.avatarChar}
                      </div>
                      {/* Live status badge */}
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      </span>
                    </div>
                  ) : (
                    // Specialized Bot Character
                    <div className={`w-9 h-9 rounded-xl bg-slate-900/90 border border-white/20 flex items-center justify-center text-base shadow-lg relative ${
                      isSelected ? 'ring-3 ring-emerald-400 border-emerald-400' : 'group-hover:border-white/50'
                    }`}>
                      <span>{agent.avatarChar}</span>
                      {agent.status === 'active' && (
                        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      )}
                    </div>
                  )}

                  {/* Pulsing indicator if currently working on municipal proposals or selected */}
                  {isSelected && (
                    <motion.div
                      layoutId="selectedHalo"
                      className="absolute -inset-2 rounded-2xl border-2 border-emerald-400/60 pointer-events-none"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── HUD FLOATING CONTROL BAR (BOTTOM RIGHT) ── */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md shadow-2xl text-xs text-white">
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Alejar vista"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="font-mono font-bold text-xs px-2 text-slate-300 min-w-[50px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={() => handleZoom(0.15)}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Acercar vista"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-white/15 mx-1" />

          <button
            onClick={handleResetView}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Centrar oficina"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Alternar pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Drag hint overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm text-[11px] text-slate-400 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Arrastra para explorar · Haz click en cualquier socio o bot</span>
        </div>
      </div>

      {/* ── AGENT / PARTNER DETAIL DRAWER / CARD (BOTTOM) ── */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white/[0.04] border-t border-white/[0.08] backdrop-blur-xl p-4 sm:p-5 z-20"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Agent Identity & Current Task */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  selectedAgent.type === 'socio'
                    ? `bg-gradient-to-tr ${selectedAgent.avatarColor} text-white font-black shadow-lg`
                    : 'bg-white/10 border border-white/15'
                }`}>
                  {selectedAgent.type === 'socio' ? selectedAgent.avatarChar : selectedAgent.avatarChar}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      {selectedAgent.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedAgent.type === 'socio'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {selectedAgent.type === 'socio' ? 'Socio Directivo' : 'Bot Especializado'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                      {DEPARTMENTS.find(d => d.id === selectedAgent.deptId)?.name}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-400 font-bold">Actividad actual:</span>
                    <span className="line-clamp-1">{selectedAgent.currentActivity}</span>
                  </p>
                </div>
              </div>

              {/* Meritocratic Stats or Bot Efficiency */}
              <div className="flex flex-wrap items-center gap-3 border-y sm:border-y-0 sm:border-x border-white/[0.08] py-2 sm:py-0 sm:px-4">
                {selectedAgent.type === 'socio' ? (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Horas Hoy (Meta 4.5h)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          {selectedAgent.hoursToday}h / 4.5h
                        </span>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${Math.min(100, (selectedAgent.hoursToday / 4.5) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Ganancia Ciclo Estimada
                      </span>
                      <span className="text-xs font-black text-amber-300 font-mono">
                        Bs. {(selectedAgent.totalCycleHours * selectedAgent.ratePerHour).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-0.5 hidden xl:block">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Dispositivo
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                        {selectedAgent.device?.includes('Móvil') ? <Smartphone className="w-3 h-3 text-emerald-400" /> : <Laptop className="w-3 h-3 text-blue-400" />}
                        {selectedAgent.device || 'Escritorio'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Eficiencia de Ejecución
                      </span>
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        {selectedAgent.efficiency}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tareas Procesadas
                      </span>
                      <span className="text-xs font-black text-white font-mono">
                        {selectedAgent.tasksDone} tareas
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {onNavigateModule && (
                  <button
                    onClick={() => onNavigateModule(selectedAgent.assignedModule || 'services')}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <span>Abrir Módulo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Cerrar detalle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: REGLAS DE HORARIO & ASINCRONÍA (4.5 HORAS/DÍA) ── */}
      <AnimatePresence>
        {showScheduleInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowScheduleInfo(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Esquema Operativo & Jornada SERAM</h3>
                  <p className="text-xs text-slate-400">Pautas acordadas entre los socios directivos</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-1.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Meta Diaria Recomendada: 4.5 Horas
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Nos planteamos <strong>4.5 horas de trabajo efectivo al día</strong>, de Lunes a Viernes. Este volumen asegura avance continuo en consultorías sin saturación cognitiva.
                  </p>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Ventana de Preferencia (09:00 AM)
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Ventana sincrónica recomendada a partir de las <strong>09:00 AM</strong> para coordinación y reuniones clave, pero <strong>no obligatoria</strong>.
                  </p>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-1.5">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" /> Reconexión Libre y Asíncrona 24/7
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Los socios pueden desconectar y <strong>reconectar a cualquier hora</strong> para continuar sus labores técnicas (modelaciones SIG, redacción legal, revisión de planos). Todo tiempo registrado en el Time Tracker se computa fielmente.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowScheduleInfo(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: SISTEMA MERITOCRÁTICO ("QUIEN TRABAJA MÁS GANA MÁS") ── */}
      <AnimatePresence>
        {showMeritocracyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b121e] border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowMeritocracyModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Modelo Meritocrático SERAM</h3>
                  <p className="text-xs text-slate-400">"Quien trabaja más gana más" · Regla Fundacional</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Tal como se estableció en los estatutos de SERAM, los honorarios y la distribución del fondo de utilidades de proyectos activos se calculan en proporción exacta a las <strong>horas computadas y verificadas</strong> en el Time Tracker.
              </p>

              {/* Partners breakdown table */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Distribución Proyectada (Ciclo Actual)
                </span>

                <div className="space-y-2">
                  {meritocracyStats.partners.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.04] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{p.name}</span>
                          <span className="text-[9px] bg-white/10 px-1.5 py-0.2 rounded font-mono text-slate-300">
                            {p.sharePercent}% pool
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{p.role}</span>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="font-black text-emerald-400 font-mono text-sm block">
                          Bs. {p.estimatedEarnings.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.hours.toFixed(1)} hrs registradas
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Fondo de proyectos estimado disponible: <strong>Bs. {meritocracyStats.projectPool.toLocaleString()}</strong>.
                </span>
              </div>

              <button
                onClick={() => setShowMeritocracyModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
              >
                Cerrar Panel Meritocrático
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

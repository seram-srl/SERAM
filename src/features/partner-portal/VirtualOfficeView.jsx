import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, Bot, Maximize2, Minimize2, ZoomIn, ZoomOut,
  RotateCcw, Sparkles, Shield, DollarSign, Clock, CheckCircle2,
  AlertCircle, ChevronRight, X, Search, Filter, Play, ExternalLink,
  Laptop, Smartphone, Award, TrendingUp, Layers, Compass, Target,
  Briefcase, BookOpenCheck, Globe, ShoppingBag, Info, MapPin,
  ChevronDown, ArrowUpRight, Gamepad2
} from 'lucide-react';
import officeRoomImage from '../../assets/virtual-office/seram_office_model.jpg';
import PhaserMiniverse from './PhaserMiniverse';

// ─────────────────────────────────────────────────────────────────────────────
// DATA: STATIONS IN THE EXACT OFFICE MODEL (MAPPED TO SERAM SEGMENTS)
// ─────────────────────────────────────────────────────────────────────────────

const OFFICE_STATIONS = [
  {
    id: 'all',
    name: 'Toda la Oficina',
    segmentTitle: 'Oficina Central SERAM',
    icon: <Building2 className="w-3.5 h-3.5" />,
    badge: 'Vista General',
    color: 'emerald',
    targetModule: 'overview',
    description: 'Espacio de trabajo unificado de la consultora ambiental SERAM.'
  },
  {
    id: 'services',
    name: 'SERAM SERVICES',
    segmentTitle: 'Oficina Técnica & Propuestas Municipales',
    icon: <Briefcase className="w-3.5 h-3.5" />,
    badge: 'Ingeniería & SIG',
    color: 'blue',
    targetModule: 'services',
    // Exact position of the large central executive desk
    xPercent: 50,
    yPercent: 53,
    zoomTarget: 1.35,
    panX: 0,
    panY: -25,
    assignedLead: 'Ing. Diego Barrientos',
    assignedRole: 'Socio Fundador · Dirección General',
    leadAvatar: 'DB',
    leadColor: 'from-amber-400 to-yellow-600',
    currentActivity: 'Liderando Propuestas Técnicas de Agua y Minería Aurífera ante Gobiernos Municipales',
    bots: ['Bot Sentinel-2 NDVI', 'Bot Dossier Concejales', 'Bot QGIS Cuencas'],
    hoursToday: 4.2,
    targetHours: 4.5,
    cycleEarnings: 13950,
    description: 'Estación de modelación satelital, análisis multiespectral de cuencas mineras y formulación de proyectos ambientales para municipios.'
  },
  {
    id: 'operations',
    name: 'HIDRÁULICA & RIEGO',
    segmentTitle: 'Estación de Modelación Hidráulica',
    icon: <Layers className="w-3.5 h-3.5" />,
    badge: 'Redes & Balances',
    color: 'sky',
    targetModule: 'services',
    // Middle-left technical desks with dual monitors
    xPercent: 28,
    yPercent: 61,
    zoomTarget: 1.4,
    panX: 160,
    panY: -70,
    assignedLead: 'Ing. Fernando Araujo',
    assignedRole: 'Socio Directivo · Hidráulica & Obras',
    leadAvatar: 'FA',
    leadColor: 'from-blue-500 to-indigo-600',
    currentActivity: 'Simulación de pérdidas de carga en redes de microriego y balance CROPWAT',
    bots: ['Bot EPANET Riego', 'Bot Calidad de Agua & Hg'],
    hoursToday: 3.5,
    targetHours: 4.5,
    cycleEarnings: 9600,
    description: 'Cálculo de redes hidráulicas presurizadas, aforos de caudales y dimensionamiento de obras de toma.'
  },
  {
    id: 'academy',
    name: 'SERAM ACADEMY',
    segmentTitle: 'Aula Virtual & Biblioteca Técnica',
    icon: <BookOpenCheck className="w-3.5 h-3.5" />,
    badge: 'Campus & Alumnos',
    color: 'purple',
    targetModule: 'academy',
    // North desk under window and large bookcase
    xPercent: 44,
    yPercent: 28,
    zoomTarget: 1.35,
    panX: 40,
    panY: 150,
    assignedLead: 'Bot Tutor Teledetección',
    assignedRole: 'Agente IA · Soporte a Estudiantes',
    leadAvatar: '🎓',
    leadColor: 'from-purple-500 to-indigo-600',
    currentActivity: 'Resolviendo consultas de alumnos sobre scripts en Google Earth Engine y clasificación supervisada',
    bots: ['Bot Certificados Digitales QR', 'Bot Campus Virtual'],
    metrics: '143 alumnos activos · 98.4% aprobación',
    description: 'Espacio de capacitación profesional, bibliografía técnica ambiental, info-productos y emisión de credenciales con código QR.'
  },
  {
    id: 'experience',
    name: 'SERAM EXPERIENCE',
    segmentTitle: 'Mesa de Cartografía & Expediciones',
    icon: <Globe className="w-3.5 h-3.5" />,
    badge: 'Expediciones & Campo',
    color: 'amber',
    targetModule: 'experience',
    // East desks with dual screens, organizers and field logistics
    xPercent: 82,
    yPercent: 43,
    zoomTarget: 1.35,
    panX: -220,
    panY: 30,
    assignedLead: 'Ing. Fabricio Orosco',
    assignedRole: 'Socio Directivo · Calidad & Expansión',
    leadAvatar: 'FO',
    leadColor: 'from-emerald-500 to-teal-700',
    currentActivity: 'Procesamiento de nubes de puntos LiDAR y logística de expedición Valle de las Agujas',
    bots: ['Bot Drones & Ortomosaicos', 'Bot Guía de Montaña'],
    hoursToday: 2.8,
    targetHours: 4.5,
    cycleEarnings: 7350,
    description: 'Planificación de salidas de campo, expediciones científicas de alta montaña, turismo científico y vuelos fotogramétricos.'
  },
  {
    id: 'store',
    name: 'SERAM STORE',
    segmentTitle: 'Mostrador de Sensores & Equipamiento',
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    badge: 'Showroom Técnico',
    color: 'rose',
    targetModule: 'store',
    // South counter with 3 wooden stools
    xPercent: 50,
    yPercent: 86,
    zoomTarget: 1.4,
    panX: 0,
    panY: -220,
    assignedLead: 'Bot Store & Envíos',
    assignedRole: 'Agente IA · Inventario & Despachos',
    leadAvatar: '📦',
    leadColor: 'from-rose-500 to-pink-600',
    currentActivity: 'Recepción de sondas multiparamétricas de calidad de agua y detectores de metales pesados',
    bots: ['Bot Facturación B2B', 'Bot Cotizador'],
    metrics: '24 productos técnicos en catálogo',
    description: 'Venta de instrumentos científicos de medición de campo, reactivos, drones de muestreo y licencias de software.'
  },
  {
    id: 'direccion',
    name: 'DIRECCIÓN & MERITOCRACIA',
    segmentTitle: 'Sala de Socios & Gobernanza',
    icon: <Shield className="w-3.5 h-3.5" />,
    badge: 'Finanzas & Reglas',
    color: 'yellow',
    targetModule: 'finances',
    // Lounge armchair (teal) and consultation corner
    xPercent: 30,
    yPercent: 41,
    zoomTarget: 1.4,
    panX: 140,
    panY: 50,
    assignedLead: 'Consejo de Socios Directivos',
    assignedRole: 'SERAM SRL · Gobernanza Meritocrática',
    leadAvatar: '⚖️',
    leadColor: 'from-amber-500 to-yellow-600',
    currentActivity: 'Cómputo en tiempo real del Time Tracker (4.5h/día) y distribución proporcional de honorarios',
    bots: ['Bot Auditoría de Horas', 'Bot Dividendos'],
    metrics: 'Fondo disponible: Bs. 35,000',
    description: 'Despacho de acuerdos estatutarios: "Quien trabaja más gana más". Monitoreo de horas efectivas y dividendos netos.'
  },
];

export default function VirtualOfficeView({
  activeServices = [],
  courses = [],
  timeLogs = [],
  partnerPresences = [],
  currentSocio,
  onNavigateModule
}) {
  // Navigation & Selected Station
  const [selectedStationId, setSelectedStationId] = useState('services'); // default to Services / Diego Barrientos
  const [officePerspective, setOfficePerspective] = useState('isometric'); // 'isometric' (Vista Isométrica 2.5D instantánea) or 'phaser' (Miniverso Pixel Art)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScheduleInfo, setShowScheduleInfo] = useState(false);
  const [showMeritocracyModal, setShowMeritocracyModal] = useState(false);
  const [miniverseRoomModal, setMiniverseRoomModal] = useState(null);

  const handleOpenMiniverseModal = useCallback((roomName) => {
    setMiniverseRoomModal(roomName);
  }, []);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 0.52;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 0.80;
    return 1.0;
  });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const floorStageRef = useRef(null);

  // Selected Station Object
  const currentStation = useMemo(() => {
    return OFFICE_STATIONS.find(s => s.id === selectedStationId) || OFFICE_STATIONS[1];
  }, [selectedStationId]);

  // Meritocratic calculations
  const meritocracyStats = useMemo(() => {
    const totalPartnerHours = timeLogs.reduce((acc, l) => acc + (Number(l.hours) || 0), 0) || 103;
    const partnerDiegoHours = timeLogs.filter(l => l.partner_name?.toLowerCase().includes('diego')).reduce((acc, l) => acc + (Number(l.hours) || 0), 0) || 46.5;
    const partnerFernandoHours = timeLogs.filter(l => l.partner_name?.toLowerCase().includes('fernando')).reduce((acc, l) => acc + (Number(l.hours) || 0), 0) || 32.0;
    const partnerFabricioHours = timeLogs.filter(l => l.partner_name?.toLowerCase().includes('fabricio')).reduce((acc, l) => acc + (Number(l.hours) || 0), 0) || 24.5;

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

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && window.innerWidth < 640) {
        setZoomLevel(0.50);
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Lock body scroll in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isFullscreen]);

  // Keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Mouse & Touch Drag Handlers
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

  const handleMouseUp = () => setIsDragging(false);

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

  const handleTouchEnd = () => setIsDragging(false);

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(0.4, prev + delta), 2.2));
  };

  const handleResetView = () => {
    setZoomLevel(typeof window !== 'undefined' && window.innerWidth < 640 ? 0.50 : 1.0);
    setPanOffset({ x: 0, y: 0 });
    setSelectedStationId('all');
  };

  // Focus a specific station by smooth pan and zoom
  const handleSelectStation = (stationId) => {
    setSelectedStationId(stationId);
    if (stationId === 'all') {
      handleResetView();
      return;
    }
    const st = OFFICE_STATIONS.find(s => s.id === stationId);
    if (st) {
      setPanOffset({ x: st.panX, y: st.panY });
      setZoomLevel(typeof window !== 'undefined' && window.innerWidth < 640 ? 0.75 : st.zoomTarget || 1.3);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: EXACT ILLUSTRATED OFFICE ROOM CANVAS WITH INTERACTIVE STATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const renderOfficeCanvas = (isFullMode) => (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full overflow-hidden bg-[#1c140d] cursor-grab active:cursor-grabbing select-none"
    >
      {/* Warm Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#140e09]/80 to-[#0a0705] pointer-events-none z-10" />

      {/* Zoom & Pan Stage */}
      <div
        ref={floorStageRef}
        className="absolute origin-center transition-transform duration-100 will-change-transform"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          left: '50%',
          top: '50%',
          marginLeft: '-368px', // half of 736
          marginTop: '-368px',  // half of 736
          width: '736px',
          height: '736px'
        }}
      >
        {/* ── 1. THE EXACT ILLUSTRATED PIXEL-ART OFFICE MODEL (FAITHFUL TO ATTACHED IMAGE) ── */}
        <img
          src={officeRoomImage}
          alt="Oficina Virtual SERAM"
          className="w-full h-full object-contain rounded-xl shadow-2xl pointer-events-none select-none"
          style={{
            imageRendering: 'auto',
            filter: 'contrast(1.04) brightness(1.02)'
          }}
          draggable={false}
        />

        {/* ── 2. INTERACTIVE HOTSPOT STATIONS POSITIONED ON THE EXACT WORKSTATIONS ── */}
        {OFFICE_STATIONS.filter(s => s.id !== 'all').map((st) => {
          const isSelected = selectedStationId === st.id;
          return (
            <div
              key={st.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectStation(st.id);
              }}
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${st.xPercent}%`,
                top: `${st.yPercent}%`,
              }}
            >
              {/* Interactive Station Pulsing Hotspot Ring */}
              <div className="relative flex items-center justify-center">
                <span className={`absolute inline-flex h-12 w-12 rounded-full transition-all duration-300 ${
                  isSelected ? 'bg-amber-400/40 animate-ping' : 'bg-emerald-400/20 group-hover:bg-amber-400/30'
                }`} />
                <span className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center border-2 shadow-xl ${
                  isSelected
                    ? 'bg-amber-400 border-white text-slate-950 scale-125'
                    : 'bg-slate-900/90 border-emerald-400 text-emerald-300 group-hover:border-amber-400'
                }`}>
                  <span className="text-[10px] font-black">{st.icon}</span>
                </span>
              </div>

              {/* Floating Pill Tag (Styled like reference) */}
              <div className={`no-drag mt-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight whitespace-nowrap shadow-2xl flex items-center gap-1.5 transition-all mx-auto ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-white scale-110'
                  : 'bg-slate-950/90 text-slate-100 border border-white/20 group-hover:border-amber-400 group-hover:bg-slate-900'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-400'}`} />
                <span>{st.name}</span>
                {st.assignedLead && (
                  <span className={`text-[9px] font-normal px-1 rounded ${isSelected ? 'bg-black/20 text-slate-900' : 'text-slate-400'}`}>
                    {st.assignedLead.split(' ')[0]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FLOATING HUD CONTROLS (BOTTOM RIGHT) ── */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-black/80 border border-white/15 rounded-2xl p-1.5 backdrop-blur-md shadow-2xl text-xs text-white">
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
          title="Centrar oficina completa"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-xl transition-colors ${
            isFullMode
              ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
              : 'hover:bg-white/10 text-amber-400 hover:text-amber-300'
          }`}
          title={isFullMode ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile drag hint */}
      <div className="absolute bottom-4 left-4 z-30 hidden sm:flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm text-[11px] text-slate-300 pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>Arrastra para explorar la oficina · Toca cualquier puesto de trabajo</span>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: STATION / DRAWER CARD (BOTTOM INSPECTOR)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStationDrawer = () => (
    <AnimatePresence>
      {currentStation && currentStation.id !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="bg-[#18110b]/95 border-t border-amber-500/20 backdrop-blur-xl p-4 sm:p-5 z-30 text-left"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Identity & Responsibilities */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 shrink-0 shadow-lg">
                {currentStation.leadAvatar || currentStation.icon}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {currentStation.segmentTitle}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30">
                    {currentStation.badge}
                  </span>
                  {currentStation.assignedLead && (
                    <span className="text-[10px] font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">
                      {currentStation.assignedLead}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="text-amber-400 font-bold">Labor en curso:</span>
                  <span className="line-clamp-1">{currentStation.currentActivity || currentStation.description}</span>
                </p>
              </div>
            </div>

            {/* Meritocracy or Team Metrics */}
            <div className="flex flex-wrap items-center gap-4 border-y sm:border-y-0 sm:border-x border-white/[0.08] py-2 sm:py-0 sm:px-4">
              {currentStation.hoursToday ? (
                <>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Jornada Hoy (Meta 4.5h)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        {currentStation.hoursToday}h / 4.5h
                      </span>
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, (currentStation.hoursToday / 4.5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ganancia Estimada
                    </span>
                    <span className="text-xs font-black text-amber-300 font-mono">
                      Bs. {currentStation.cycleEarnings.toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Estado del Módulo
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    {currentStation.metrics || 'En línea · Tiempo Real'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {onNavigateModule && (
                <button
                  onClick={() => onNavigateModule(currentStation.targetModule || 'services')}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <span>Abrir {currentStation.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setSelectedStationId('all')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Ver oficina completa"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: MODALS (HORARIOS & MERITOCRACIA)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderModals = () => (
    <>
      <AnimatePresence>
        {showScheduleInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c140d] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left"
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
                    <Target className="w-3.5 h-3.5" /> Meta Diaria: 4.5 Horas de Trabajo Efectivo
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Nos planteamos <strong>4.5 horas al día</strong>, de Lunes a Viernes, garantizando avance en consultorías sin saturación cognitiva.
                  </p>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Ventana de Preferencia (09:00 AM)
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Ventana sincrónica matutina sugerida para coordinación técnica y reuniones clave, no obligatoria.
                  </p>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-1.5">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" /> Reconexión Libre y Asíncrona 24/7
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Los socios pueden reconectar a cualquier hora y continuar sus labores (planos SIG, informes legales, cálculos de riego).
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

      <AnimatePresence>
        {showMeritocracyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c140d] border border-amber-500/30 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowMeritocracyModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Modelo Meritocrático SERAM</h3>
                  <p className="text-xs text-slate-400">"Quien trabaja más gana más" · Regla Fundacional</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Los dividendos y retribuciones de proyectos activos se calculan según las <strong>horas efectivas computadas y verificadas</strong> en el Time Tracker.
              </p>

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
                        <span className="font-black text-amber-400 font-mono text-sm block">
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

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Fondo de proyectos disponible estimado: <strong>Bs. {meritocracyStats.projectPool.toLocaleString()}</strong>.
                </span>
              </div>

              <button
                onClick={() => setShowMeritocracyModal(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20"
              >
                Cerrar Panel Meritocrático
              </button>
            </motion.div>
          </div>
        )}

        {miniverseRoomModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#141a23] border border-white/15 rounded-3xl p-6 shadow-2xl text-left text-white space-y-4 relative"
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-lg font-black text-white">{miniverseRoomModal}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Zona Operativa del Miniverso SERAM</p>
                </div>
                <button
                  onClick={() => setMiniverseRoomModal(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 font-semibold">Estado de Actividad:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Time Tracker Iniciado
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 font-semibold">Sincronización:</span>
                  <span className="text-cyan-400 font-mono text-[11px]">Webhook n8n emitido</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 font-semibold">Socio Activo:</span>
                  <span className="text-white font-medium">{currentSocio?.name || 'Socio_Activo'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setMiniverseRoomModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cerrar
                </button>
                {['Service', 'Academy', 'Experience', 'Comercial', 'Finanzas', 'Operaciones'].includes(miniverseRoomModal) && (
                  <button
                    onClick={() => {
                      const mapping = {
                        'Service': 'services',
                        'Academy': 'academy',
                        'Experience': 'experience',
                        'Comercial': 'store',
                        'Finanzas': 'finances',
                        'Operaciones': 'services'
                      };
                      const target = mapping[miniverseRoomModal];
                      setMiniverseRoomModal(null);
                      if (onNavigateModule && target) onNavigateModule(target);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <span>Ir a Módulo</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN RETURN: EMBEDDED DASHBOARD ROOM + FULLSCREEN PORTAL
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── VISTA PRINCIPAL INTEGRADA EN EL DASHBOARD (EL MODELO COMO CENTRO DE CONTROL) ── */}
      <div className="w-full rounded-2xl border border-amber-500/20 bg-[#120d09] shadow-2xl overflow-hidden text-left relative">
        {/* Top Header HUD */}
        <div className="bg-black/40 border-b border-white/[0.08] backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  Oficina Virtual SERAM
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Ecosistema Interactivo
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-medium line-clamp-1">
                Toca cualquier estación de trabajo o selecciona un segmento para interactuar con los socios y bots
              </p>
            </div>
          </div>

          {/* Quick Rules & Perspective Switcher */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* View Switcher: Miniverso Pixel Art (Phaser 3) vs Isométrica 2.5D */}
            <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => setOfficePerspective('phaser')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  officePerspective === 'phaser'
                    ? 'bg-[#00e03c] text-slate-950 shadow-md shadow-[#00e03c]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Miniverso Pixel Art interactivo con motor Phaser 3 (Gather.town / RollerCoin style)"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Miniverso Pixel Art (Phaser 3)</span>
              </button>
              <button
                onClick={() => setOfficePerspective('isometric')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  officePerspective === 'isometric'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Vista Isométrica 2.5D de alta resolución"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Vista Isométrica 2.5D</span>
              </button>
            </div>

            <button
              onClick={() => setShowScheduleInfo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-slate-300 font-bold transition-all"
              title="Ver pautas de horario y conexión flexible"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>4.5 hrs / día</span>
              <Info className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            <button
              onClick={() => setShowMeritocracyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all"
              title="Ver modelo meritocrático de ganancias"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Quien trabaja más gana más</span>
              <span className="sm:hidden">Meritocracia</span>
            </button>

            {/* Prominent Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/25 ml-auto lg:ml-0 active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Pantalla Completa</span>
            </button>
          </div>
        </div>

        {/* ── CONDITIONAL VIEW BASED ON PERSPECTIVE ── */}
        {officePerspective === 'phaser' ? (
          <div className="p-4 bg-[#0a0d12] overflow-x-auto flex justify-center">
            <PhaserMiniverse
              openModal={handleOpenMiniverseModal}
            />
          </div>
        ) : (
          <>
            {/* Station Navigation Chips */}
            <div className="bg-black/30 border-b border-white/[0.06] px-4 py-2.5 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
              {OFFICE_STATIONS.map(st => (
                <button
                  key={st.id}
                  onClick={() => handleSelectStation(st.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedStationId === st.id
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{st.icon}</span>
                  <span>{st.name}</span>
                </button>
              ))}
            </div>

            {/* Embedded Canvas */}
            <div className="relative w-full h-[500px] sm:h-[620px] lg:h-[700px] overflow-hidden">
              {renderOfficeCanvas(false)}
            </div>

            {/* Embedded Station Drawer */}
            {renderStationDrawer()}
          </>
        )}
      </div>

      {/* ── FULLSCREEN PORTAL (100% SCREEN VIEWPORT OVERLAY) ── */}
      {isFullscreen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999999] w-screen h-[100dvh] bg-[#120d09] flex flex-col overflow-hidden select-none text-left"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100dvh',
            zIndex: 99999999
          }}
        >
          {/* Mobile Fullscreen Top Bar */}
          <div className="bg-[#1c140e]/95 border-b border-white/15 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 z-30 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-white">Oficina Virtual SERAM</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono hidden sm:inline">
                {officePerspective === 'phaser' ? 'Phaser 3 Pixel Art' : 'Modelo Isométrico 2.5D'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Perspective Switcher in Fullscreen */}
              <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5 gap-1">
                <button
                  onClick={() => setOfficePerspective('phaser')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    officePerspective === 'phaser' ? 'bg-[#00e03c] text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  <Gamepad2 className="w-3 h-3" />
                  <span>Pixel Art</span>
                </button>
                <button
                  onClick={() => setOfficePerspective('isometric')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    officePerspective === 'isometric' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Isométrica</span>
                </button>
              </div>

              <button
                onClick={toggleFullscreen}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir Pantalla Completa</span>
              </button>
            </div>
          </div>

          {officePerspective === 'phaser' ? (
            <div className="relative flex-1 w-full h-full overflow-auto p-4 bg-[#0a0d12] flex justify-center items-start">
              <PhaserMiniverse
                openModal={handleOpenMiniverseModal}
              />
            </div>
          ) : (
            <>
              {/* Station Selector in Fullscreen */}
              <div className="bg-[#150f0b]/90 border-b border-white/10 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-30 shrink-0">
                {OFFICE_STATIONS.map(st => (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStation(st.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      selectedStationId === st.id
                        ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-white/[0.04] text-slate-400'
                    }`}
                  >
                    <span>{st.icon}</span>
                    <span>{st.name}</span>
                  </button>
                ))}
              </div>

              {/* Fullscreen Canvas filling 100% of remaining screen */}
              <div className="relative flex-1 w-full h-full overflow-hidden">
                {renderOfficeCanvas(true)}
              </div>

              {/* Fullscreen Drawer */}
              {renderStationDrawer()}
            </>
          )}
        </div>,
        document.body
      )}

      {/* Modals */}
      {renderModals()}
    </>
  );
}

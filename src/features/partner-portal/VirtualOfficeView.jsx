import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, Bot, Maximize2, Minimize2, ZoomIn, ZoomOut,
  RotateCcw, Sparkles, Shield, DollarSign, Clock, CheckCircle2,
  AlertCircle, ChevronRight, X, Search, Filter, Play, ExternalLink,
  Laptop, Smartphone, Award, TrendingUp, Layers, Compass, Target,
  Briefcase, BookOpenCheck, Globe, ShoppingBag, Info, MapPin,
  ChevronDown, ArrowUpRight
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA: ROOMS (ONE FOR EACH WEB SEGMENT)
// ─────────────────────────────────────────────────────────────────────────────

const ROOMS = [
  {
    id: 'all',
    name: 'Todo el Edificio',
    icon: <Building2 className="w-3.5 h-3.5" />,
    shortDesc: 'Vista global de las 5 habitaciones de SERAM',
    color: 'emerald',
    targetModule: 'overview'
  },
  {
    id: 'services',
    name: 'SERAM SERVICES',
    roomTitle: 'Oficina Técnica, SIG & Propuestas',
    icon: <Briefcase className="w-3.5 h-3.5" />,
    shortDesc: 'Ingeniería Ambiental, Teledetección Sentinel-2, EPANET y Propuestas Municipales',
    color: 'blue',
    targetModule: 'services',
    x: 630,
    y: 80,
    width: 530,
    height: 380,
    badge: 'Proyectos & Consultorías'
  },
  {
    id: 'academy',
    name: 'SERAM ACADEMY',
    roomTitle: 'Aula Virtual & Capacitación',
    icon: <BookOpenCheck className="w-3.5 h-3.5" />,
    shortDesc: 'Cursos de Teledetección, Google Earth Engine, Info-productos y Certificaciones',
    color: 'purple',
    targetModule: 'academy',
    x: 40,
    y: 470,
    width: 440,
    height: 380,
    badge: 'Campus & Alumnos'
  },
  {
    id: 'experience',
    name: 'SERAM EXPERIENCE',
    roomTitle: 'Sala de Expediciones & Campo',
    icon: <Globe className="w-3.5 h-3.5" />,
    shortDesc: 'Expediciones científicas, Valle de las Agujas, Turismo científico y Fotogrametría',
    color: 'amber',
    targetModule: 'experience',
    x: 740,
    y: 470,
    width: 420,
    height: 380,
    badge: 'Expediciones & Turismo'
  },
  {
    id: 'store',
    name: 'SERAM STORE',
    roomTitle: 'Showroom & Equipamiento',
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    shortDesc: 'Sensores de agua, reactivos de mercurio, drones multiespectrales y licencias',
    color: 'rose',
    targetModule: 'store',
    x: 490,
    y: 470,
    width: 240,
    height: 380,
    badge: 'Tienda & Tecnología'
  },
  {
    id: 'direccion',
    name: 'DIRECCIÓN & SOCIOS',
    roomTitle: 'Sala de Estrategia & Finanzas',
    icon: <Shield className="w-3.5 h-3.5" />,
    shortDesc: 'Despacho de Socios Fundadores, Time Tracker (4.5h/día) y Meritocracia',
    color: 'yellow',
    targetModule: 'finances',
    x: 40,
    y: 80,
    width: 580,
    height: 380,
    badge: 'Gobernanza & Finanzas'
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA: AGENTS & CHARACTERS PER ROOM
// ─────────────────────────────────────────────────────────────────────────────

const AGENTS_LIST = [
  // ── DIRECCIÓN & SOCIOS
  {
    id: 'socio-diego',
    roomId: 'direccion',
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
    targetModule: 'services',
    x: 270,
    y: 260
  },
  {
    id: 'socio-fernando',
    roomId: 'direccion',
    name: 'Ing. Fernando Araujo',
    role: 'Socio Directivo · Hidráulica & Proyectos',
    type: 'socio',
    isUser: false,
    status: 'online',
    currentActivity: 'Modelando balance hídrico y pérdidas en redes secundarias de riego',
    hoursToday: 3.5,
    targetHours: 4.5,
    totalCycleHours: 32.0,
    ratePerHour: 300,
    avatarColor: 'from-blue-500 to-indigo-600',
    avatarChar: 'FA',
    targetModule: 'services',
    x: 430,
    y: 260
  },
  {
    id: 'socio-fabricio',
    roomId: 'direccion',
    name: 'Ing. Fabricio Orosco',
    role: 'Socio Directivo · Calidad Ambiental & Alianzas',
    type: 'socio',
    isUser: false,
    status: 'online',
    currentActivity: 'Coordinación de muestreo hidroquímico y gestión de licencias RENCA',
    hoursToday: 2.8,
    targetHours: 4.5,
    totalCycleHours: 24.5,
    ratePerHour: 300,
    avatarColor: 'from-emerald-500 to-teal-700',
    avatarChar: 'FO',
    targetModule: 'experience',
    x: 350,
    y: 190
  },

  // ── SERAM SERVICES
  {
    id: 'bot-sentinel',
    roomId: 'services',
    name: 'Bot Sentinel-2 NDVI',
    role: 'Agente IA · Teledetección Satelital',
    type: 'bot',
    status: 'active',
    currentActivity: 'Procesamiento de reflectancia de fondo y nubes en Cuenca Madre de Dios',
    efficiency: '99.4%',
    tasksDone: 142,
    avatarChar: '🛰️',
    targetModule: 'services',
    x: 770,
    y: 240
  },
  {
    id: 'bot-qgis',
    roomId: 'services',
    name: 'Bot QGIS & Cuencas',
    role: 'Agente IA · Delimitación Hidrológica',
    type: 'bot',
    status: 'active',
    currentActivity: 'Generando curvas de nivel y red de drenaje con modelo ALOS PALSAR',
    efficiency: '98.8%',
    tasksDone: 89,
    avatarChar: '🗺️',
    targetModule: 'services',
    x: 930,
    y: 240
  },
  {
    id: 'bot-dossier',
    roomId: 'services',
    name: 'Bot Dossier Concejales',
    role: 'Agente IA · Propuestas Municipales',
    type: 'bot',
    status: 'active',
    currentActivity: 'Formulando propuesta técnica sobre mercurio para Concejos Municipales',
    efficiency: '99.5%',
    tasksDone: 84,
    avatarChar: '🏛️',
    targetModule: 'services',
    x: 1050,
    y: 330
  },

  // ── SERAM ACADEMY
  {
    id: 'bot-tutor',
    roomId: 'academy',
    name: 'Bot Tutor Teledetección',
    role: 'Agente IA · Tutor de Alumnos',
    type: 'bot',
    status: 'active',
    currentActivity: 'Resolviendo consultas de scripts GEE y cálculo de índices espectrales',
    efficiency: '99.0%',
    tasksDone: 340,
    avatarChar: '🎓',
    targetModule: 'academy',
    x: 230,
    y: 630
  },
  {
    id: 'bot-certificados',
    roomId: 'academy',
    name: 'Bot Certificados Digitales',
    role: 'Agente IA · Verificación QR',
    type: 'bot',
    status: 'active',
    currentActivity: 'Emisión de credenciales con código hash institucional verificado',
    efficiency: '100%',
    tasksDone: 512,
    avatarChar: '🏅',
    targetModule: 'academy',
    x: 350,
    y: 630
  },

  // ── SERAM EXPERIENCE
  {
    id: 'bot-drones',
    roomId: 'experience',
    name: 'Bot Drones & Expediciones',
    role: 'Agente IA · Fotogrametría de Campo',
    type: 'bot',
    status: 'active',
    currentActivity: 'Procesando nube de puntos LiDAR y fotos 3D del Valle de las Agujas',
    efficiency: '98.0%',
    tasksDone: 42,
    avatarChar: '🛸',
    targetModule: 'experience',
    x: 880,
    y: 630
  },
  {
    id: 'bot-rutas',
    roomId: 'experience',
    name: 'Bot Guía de Montaña',
    role: 'Agente IA · Rutas & HikeYoga',
    type: 'bot',
    status: 'idle',
    currentActivity: 'Verificación de coordenadas GPS y logística de expediciones',
    efficiency: '97.5%',
    tasksDone: 31,
    avatarChar: '🏔️',
    targetModule: 'experience',
    x: 1020,
    y: 630
  },

  // ── SERAM STORE
  {
    id: 'bot-store',
    roomId: 'store',
    name: 'Bot Store & Logística',
    role: 'Agente IA · Inventario Técnico',
    type: 'bot',
    status: 'active',
    currentActivity: 'Recepción de sensores de mercurio y calibradores de pH para laboratorio',
    efficiency: '98.5%',
    tasksDone: 110,
    avatarChar: '📦',
    targetModule: 'store',
    x: 610,
    y: 630
  },
];

export default function VirtualOfficeView({
  activeServices = [],
  timeLogs = [],
  partnerPresences = [],
  currentSocio,
  onNavigateModule
}) {
  // Navigation & Room Selection
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(AGENTS_LIST[0]); // default Diego
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScheduleInfo, setShowScheduleInfo] = useState(false);
  const [showMeritocracyModal, setShowMeritocracyModal] = useState(false);

  // Zoom and Pan
  const [zoomLevel, setZoomLevel] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 0.50;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 0.75;
    return 0.95;
  });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const officeFloorRef = useRef(null);

  // Meritocratic Calculations
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
        setZoomLevel(0.48);
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
    setZoomLevel(prev => Math.min(Math.max(0.4, prev + delta), 2.0));
  };

  const handleResetView = () => {
    setZoomLevel(typeof window !== 'undefined' && window.innerWidth < 640 ? 0.48 : 0.95);
    setPanOffset({ x: 0, y: 0 });
  };

  // Focus a specific room by panning and zooming
  const handleSelectRoom = (roomId) => {
    setSelectedRoom(roomId);
    if (roomId === 'all') {
      handleResetView();
      return;
    }
    const r = ROOMS.find(rm => rm.id === roomId);
    if (r) {
      // center room
      const roomCenterX = r.x + r.width / 2;
      const roomCenterY = r.y + r.height / 2;
      const canvasCenterX = 600;
      const canvasCenterY = 440;
      setPanOffset({
        x: (canvasCenterX - roomCenterX) * 0.9,
        y: (canvasCenterY - roomCenterY) * 0.9
      });
      setZoomLevel(typeof window !== 'undefined' && window.innerWidth < 640 ? 0.75 : 1.15);
    }
  };

  // Filter agents by selected room
  const visibleAgents = useMemo(() => {
    if (selectedRoom === 'all') return AGENTS_LIST;
    return AGENTS_LIST.filter(a => a.roomId === selectedRoom);
  }, [selectedRoom]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: ARCHITECTURAL FLOOR CANVAS (COZY WOOD & PIXEL-ILLUSTRATED STYLE)
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
      className="relative w-full h-full overflow-hidden bg-[#241a15] cursor-grab active:cursor-grabbing select-none"
    >
      {/* Warm Ambient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#18110d] to-[#0f0a07] pointer-events-none" />

      {/* Zoom & Pan Stage */}
      <div
        ref={officeFloorRef}
        className="absolute origin-center transition-transform duration-75 will-change-transform"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          left: '50%',
          top: '50%',
          marginLeft: '-600px',
          marginTop: '-440px',
          width: '1200px',
          height: '880px'
        }}
      >
        {/* ── SVG ARCHITECTURAL BUILDING (5 ROOMS MATCHING WEB SEGMENTS) ── */}
        <svg viewBox="0 0 1200 880" className="w-full h-full drop-shadow-2xl">
          <defs>
            {/* Parquet Wood Floor Tile Pattern */}
            <pattern id="parquetTile" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#ceb491" />
              <rect x="0" y="0" width="20" height="20" fill="#d7be9b" stroke="#baa07c" strokeWidth="0.8" />
              <rect x="20" y="0" width="20" height="20" fill="#c4aa87" stroke="#baa07c" strokeWidth="0.8" />
              <rect x="0" y="20" width="20" height="20" fill="#c4aa87" stroke="#baa07c" strokeWidth="0.8" />
              <rect x="20" y="20" width="20" height="20" fill="#d7be9b" stroke="#baa07c" strokeWidth="0.8" />
              {/* Subtle wood grain lines */}
              <line x1="2" y1="6" x2="18" y2="6" stroke="#b09672" strokeWidth="0.5" opacity="0.6" />
              <line x1="2" y1="14" x2="18" y2="14" stroke="#b09672" strokeWidth="0.5" opacity="0.6" />
              <line x1="22" y1="26" x2="38" y2="26" stroke="#b09672" strokeWidth="0.5" opacity="0.6" />
              <line x1="22" y1="34" x2="38" y2="34" stroke="#b09672" strokeWidth="0.5" opacity="0.6" />
            </pattern>

            {/* Dark wood for desks & furniture */}
            <linearGradient id="richWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a36331" />
              <stop offset="50%" stopColor="#874e22" />
              <stop offset="100%" stopColor="#633614" />
            </linearGradient>

            {/* Sky Window Gradient */}
            <linearGradient id="skyWindow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec4f8" />
              <stop offset="70%" stopColor="#bce2fd" />
              <stop offset="100%" stopColor="#e8f5fe" />
            </linearGradient>

            {/* Drop Shadow filter */}
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#1a0f08" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* ── EXTERIOR SHADOW & BUILDING PERIMETER WALLS ── */}
          <rect x="25" y="65" width="1150" height="800" rx="14" fill="#140d09" filter="url(#softShadow)" />
          {/* External Thick Wall (Cream/Stone) */}
          <rect x="30" y="70" width="1140" height="790" rx="12" fill="#e5dfd3" stroke="#5c4530" strokeWidth="6" />

          {/* Main Parquet Flooring */}
          <rect x="40" y="80" width="1120" height="770" fill="url(#parquetTile)" />

          {/* ── INTERNAL PARTITION WALLS (DIVIDING THE 5 ROOMS) ── */}
          {/* Horizontal dividing corridor wall (y = 460) */}
          <rect x="40" y="455" width="1120" height="15" fill="#e5dfd3" stroke="#5c4530" strokeWidth="2" />
          {/* Vertical dividing wall 1 (Direction vs Services, x = 620, y: 80 to 460) */}
          <rect x="615" y="80" width="15" height="380" fill="#e5dfd3" stroke="#5c4530" strokeWidth="2" />
          {/* Vertical dividing wall 2 (Academy vs Store, x = 480, y: 460 to 850) */}
          <rect x="475" y="460" width="15" height="390" fill="#e5dfd3" stroke="#5c4530" strokeWidth="2" />
          {/* Vertical dividing wall 3 (Store vs Experience, x = 730, y: 460 to 850) */}
          <rect x="725" y="460" width="15" height="390" fill="#e5dfd3" stroke="#5c4530" strokeWidth="2" />

          {/* Doors connecting rooms */}
          <rect x="300" y="455" width="50" height="15" fill="#ceb491" /> {/* Door Dir -> Academy */}
          <rect x="870" y="455" width="50" height="15" fill="#ceb491" /> {/* Door Services -> Exp */}
          <rect x="615" y="240" width="15" height="50" fill="#ceb491" /> {/* Door Dir -> Services */}

          {/* ── WINDOWS OVERLOOKING SKY & CLOUDS ── */}
          {/* North Window in Dirección */}
          <g transform="translate(180, 72)">
            <rect x="0" y="0" width="160" height="14" fill="url(#skyWindow)" stroke="#4d3521" strokeWidth="2" />
            <ellipse cx="60" cy="7" rx="14" ry="4" fill="#ffffff" opacity="0.85" />
            <ellipse cx="110" cy="8" rx="18" ry="5" fill="#ffffff" opacity="0.9" />
          </g>
          {/* North Window in Services */}
          <g transform="translate(780, 72)">
            <rect x="0" y="0" width="180" height="14" fill="url(#skyWindow)" stroke="#4d3521" strokeWidth="2" />
            <ellipse cx="70" cy="7" rx="16" ry="5" fill="#ffffff" opacity="0.9" />
            <ellipse cx="130" cy="8" rx="14" ry="4" fill="#ffffff" opacity="0.8" />
          </g>
          {/* East Window in Services */}
          <g transform="translate(1154, 180)">
            <rect x="0" y="0" width="14" height="120" fill="url(#skyWindow)" stroke="#4d3521" strokeWidth="2" />
          </g>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* HABITACIÓN 1: DIRECCIÓN GENERAL & SOCIOS (FINANZAS & ESTRATEGIA)   */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <g id="room-direccion">
            {/* Room Signboard */}
            <g transform="translate(80, 110)">
              <rect x="0" y="0" width="200" height="28" rx="6" fill="#422915" stroke="#eab308" strokeWidth="1.5" />
              <text x="100" y="18" textAnchor="middle" fill="#fef08a" fontSize="11" fontWeight="900" letterSpacing="1">
                DIRECCIÓN & SOCIOS
              </text>
            </g>

            {/* Executive Meeting Desk (Central) */}
            <g transform="translate(240, 210)" filter="url(#softShadow)">
              <rect x="0" y="0" width="240" height="90" rx="6" fill="url(#richWood)" stroke="#45240f" strokeWidth="2" />
              {/* Desk leather mat */}
              <rect x="40" y="15" width="160" height="60" rx="4" fill="#2d1c12" stroke="#523522" strokeWidth="1" />
              {/* Monitors on desk */}
              <rect x="65" y="25" width="30" height="18" rx="2" fill="#111827" stroke="#10b981" strokeWidth="1.2" />
              <rect x="145" y="25" width="30" height="18" rx="2" fill="#111827" stroke="#eab308" strokeWidth="1.2" />
              {/* Documents & coffee mug */}
              <rect x="110" y="32" width="18" height="22" rx="1" fill="#f8fafc" />
              <circle cx="103" cy="50" r="3.5" fill="#fef08a" />
            </g>

            {/* Leather Armchairs around meeting table */}
            <rect x="280" y="165" width="35" height="30" rx="6" fill="#1e3a35" stroke="#102521" strokeWidth="2" />
            <rect x="410" y="165" width="35" height="30" rx="6" fill="#1e3a35" stroke="#102521" strokeWidth="2" />
            <rect x="345" y="315" width="35" height="30" rx="6" fill="#1e3a35" stroke="#102521" strokeWidth="2" />

            {/* Big Bookshelf against wall */}
            <g transform="translate(60, 160)" filter="url(#softShadow)">
              <rect x="0" y="0" width="60" height="150" rx="3" fill="#6d3d1a" stroke="#3d200d" strokeWidth="2" />
              {/* Bookshelves rows */}
              {[15, 45, 75, 105, 135].map((y, idx) => (
                <g key={idx}>
                  <line x1="3" y1={y} x2="57" y2={y} stroke="#42230e" strokeWidth="2" />
                  <rect x="6" y={y-12} width="8" height="12" fill="#ef4444" />
                  <rect x="16" y={y-14} width="9" height="14" fill="#3b82f6" />
                  <rect x="27" y={y-11} width="7" height="11" fill="#10b981" />
                  <rect x="36" y={y-13} width="10" height="13" fill="#f59e0b" />
                  <rect x="48" y={y-12} width="7" height="12" fill="#8b5cf6" />
                </g>
              ))}
            </g>

            {/* Potted Ficus & Floor Plants */}
            <g transform="translate(560, 120)">
              <rect x="0" y="12" width="22" height="24" rx="3" fill="#9a3412" stroke="#5c1d06" strokeWidth="1.5" />
              <circle cx="11" cy="5" r="16" fill="#15803d" />
              <circle cx="5" cy="0" r="12" fill="#22c55e" />
              <circle cx="18" cy="2" r="11" fill="#16a34a" />
            </g>

            {/* Wall Clock & Strategy Whiteboard */}
            <g transform="translate(480, 85)">
              <circle cx="12" cy="12" r="12" fill="#ffffff" stroke="#45240f" strokeWidth="2" />
              <line x1="12" y1="12" x2="12" y2="5" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="12" y1="12" x2="17" y2="12" stroke="#ef4444" strokeWidth="1" />
            </g>
          </g>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* HABITACIÓN 2: SERAM SERVICES (INGENIERÍA, SIG & MUNICIPIOS)        */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <g id="room-services">
            {/* Room Signboard */}
            <g transform="translate(660, 110)">
              <rect x="0" y="0" width="240" height="28" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="120" y="18" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="900" letterSpacing="1">
                SERAM SERVICES & SIG
              </text>
            </g>

            {/* Workstation Desk 1: Sentinel-2 & NDVI Processing */}
            <g transform="translate(710, 190)" filter="url(#softShadow)">
              <rect x="0" y="0" width="130" height="70" rx="5" fill="url(#richWood)" stroke="#45240f" strokeWidth="2" />
              {/* Dual LCD monitors */}
              <rect x="20" y="12" width="40" height="24" rx="2" fill="#032b14" stroke="#22c55e" strokeWidth="1.5" />
              <text x="40" y="27" textAnchor="middle" fill="#86efac" fontSize="7" fontWeight="bold">NDVI</text>
              <rect x="68" y="12" width="40" height="24" rx="2" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="88" y="27" textAnchor="middle" fill="#7dd3fc" fontSize="7" fontWeight="bold">L2A</text>
              <rect x="42" y="44" width="45" height="12" rx="2" fill="#1e293b" />
            </g>
            {/* Swivel Chair */}
            <circle cx="775" cy="285" r="14" fill="#334155" stroke="#1e293b" strokeWidth="2" />

            {/* Workstation Desk 2: QGIS & Modelación Hidráulica */}
            <g transform="translate(870, 190)" filter="url(#softShadow)">
              <rect x="0" y="0" width="130" height="70" rx="5" fill="url(#richWood)" stroke="#45240f" strokeWidth="2" />
              <rect x="25" y="12" width="45" height="24" rx="2" fill="#172554" stroke="#60a5fa" strokeWidth="1.5" />
              <text x="47" y="27" textAnchor="middle" fill="#93c5fd" fontSize="7" fontWeight="bold">EPANET</text>
              <rect x="75" y="16" width="30" height="20" rx="2" fill="#052e16" stroke="#4ade80" strokeWidth="1.2" />
              <rect x="42" y="44" width="45" height="12" rx="2" fill="#1e293b" />
            </g>
            <circle cx="935" cy="285" r="14" fill="#334155" stroke="#1e293b" strokeWidth="2" />

            {/* Workstation Desk 3: Propuestas Municipales & Concejales */}
            <g transform="translate(990, 280)" filter="url(#softShadow)">
              <rect x="0" y="0" width="120" height="70" rx="5" fill="url(#richWood)" stroke="#45240f" strokeWidth="2" />
              <rect x="20" y="12" width="42" height="24" rx="2" fill="#3b0764" stroke="#c084fc" strokeWidth="1.5" />
              <text x="41" y="27" textAnchor="middle" fill="#f3e8ff" fontSize="7" fontWeight="bold">Dossier</text>
              <rect x="70" y="15" width="32" height="20" rx="1" fill="#f8fafc" stroke="#cbd5e1" />
            </g>
            <circle cx="1050" cy="375" r="14" fill="#334155" stroke="#1e293b" strokeWidth="2" />

            {/* Technical Filing Cabinet and Potted Plant */}
            <g transform="translate(1080, 110)">
              <rect x="0" y="0" width="55" height="50" rx="3" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
              <line x1="5" y1="25" x2="50" y2="25" stroke="#334155" strokeWidth="1.5" />
            </g>
            <g transform="translate(650, 400)">
              <rect x="0" y="10" width="20" height="20" rx="3" fill="#9a3412" />
              <circle cx="10" cy="5" r="14" fill="#16a34a" />
            </g>
          </g>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* HABITACIÓN 3: SERAM ACADEMY (AULA VIRTUAL & CAPACITACIÓN)          */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <g id="room-academy">
            {/* Room Signboard */}
            <g transform="translate(70, 490)">
              <rect x="0" y="0" width="220" height="28" rx="6" fill="#2e1065" stroke="#a855f7" strokeWidth="1.5" />
              <text x="110" y="18" textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="900" letterSpacing="1">
                SERAM ACADEMY
              </text>
            </g>

            {/* Big Interactive Projection Board on Wall */}
            <g transform="translate(80, 530)" filter="url(#softShadow)">
              <rect x="0" y="0" width="180" height="50" rx="4" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" />
              <text x="15" y="22" fill="#c084fc" fontSize="9" fontWeight="bold">CLASE: GEE & ÍNDICES ESPECTRALES</text>
              <line x1="15" y1="28" x2="165" y2="28" stroke="#475569" strokeWidth="1" />
              <text x="15" y="40" fill="#a7f3d0" fontSize="8" fontFamily="monospace">var ndvi = img.normalizedDifference();</text>
            </g>

            {/* Academy Student Desks */}
            <g transform="translate(170, 600)" filter="url(#softShadow)">
              <rect x="0" y="0" width="110" height="50" rx="4" fill="url(#richWood)" stroke="#45240f" strokeWidth="1.5" />
              <rect x="25" y="8" width="30" height="18" rx="2" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
              <circle cx="55" cy="70" r="12" fill="#475569" />
            </g>
            <g transform="translate(300, 600)" filter="url(#softShadow)">
              <rect x="0" y="0" width="110" height="50" rx="4" fill="url(#richWood)" stroke="#45240f" strokeWidth="1.5" />
              <rect x="25" y="8" width="30" height="18" rx="2" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
              <circle cx="55" cy="70" r="12" fill="#475569" />
            </g>

            {/* Diplomas & Certified Bookshelf */}
            <g transform="translate(60, 690)">
              <rect x="0" y="0" width="120" height="40" rx="3" fill="#6d3d1a" stroke="#3d200d" strokeWidth="1.5" />
              <rect x="15" y="8" width="22" height="16" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              <rect x="45" y="8" width="22" height="16" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              <rect x="75" y="8" width="22" height="16" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            </g>
          </g>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* HABITACIÓN 4: SERAM STORE (SHOWROOM & EQUIPOS TÉCNICOS)            */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <g id="room-store">
            {/* Room Signboard */}
            <g transform="translate(510, 490)">
              <rect x="0" y="0" width="180" height="28" rx="6" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.5" />
              <text x="90" y="18" textAnchor="middle" fill="#fecdd3" fontSize="11" fontWeight="900" letterSpacing="1">
                SERAM STORE
              </text>
            </g>

            {/* Display Glass Showcase Counter */}
            <g transform="translate(530, 560)" filter="url(#softShadow)">
              <rect x="0" y="0" width="140" height="60" rx="5" fill="#1e293b" stroke="#fda4af" strokeWidth="2" opacity="0.9" />
              <rect x="10" y="10" width="120" height="40" rx="3" fill="#0f172a" />
              {/* Sensors & Equipment items inside */}
              <circle cx="35" cy="30" r="8" fill="#38bdf8" /> {/* Multiparametric probe */}
              <rect x="65" y="22" width="22" height="16" rx="2" fill="#facc15" /> {/* Mercury detector */}
              <rect x="105" y="24" width="16" height="12" fill="#a855f7" /> {/* Software box */}
            </g>

            {/* Warehouse shelf */}
            <g transform="translate(520, 680)">
              <rect x="0" y="0" width="160" height="45" rx="3" fill="#52361e" stroke="#301f10" strokeWidth="2" />
              <rect x="15" y="8" width="25" height="20" rx="2" fill="#d97706" />
              <rect x="50" y="8" width="25" height="20" rx="2" fill="#d97706" />
              <rect x="85" y="8" width="25" height="20" rx="2" fill="#d97706" />
              <rect x="120" y="8" width="25" height="20" rx="2" fill="#d97706" />
            </g>
          </g>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* HABITACIÓN 5: SERAM EXPERIENCE (EXPEDICIONES & CAMPO)              */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <g id="room-experience">
            {/* Room Signboard */}
            <g transform="translate(770, 490)">
              <rect x="0" y="0" width="230" height="28" rx="6" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="115" y="18" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="900" letterSpacing="1">
                SERAM EXPERIENCE
              </text>
            </g>

            {/* Large Field Cartography Table with Map of Valle de las Agujas */}
            <g transform="translate(810, 560)" filter="url(#softShadow)">
              <rect x="0" y="0" width="200" height="100" rx="6" fill="url(#richWood)" stroke="#45240f" strokeWidth="2" />
              {/* Unfolded Map */}
              <rect x="25" y="15" width="150" height="70" rx="2" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1" />
              {/* Topographic elevation lines on map */}
              <ellipse cx="100" cy="50" rx="45" ry="20" fill="none" stroke="#854d0e" strokeWidth="1.2" strokeDasharray="4 2" />
              <ellipse cx="100" cy="50" rx="25" ry="10" fill="none" stroke="#854d0e" strokeWidth="1.2" />
              <text x="100" y="53" textAnchor="middle" fill="#713f12" fontSize="7" fontWeight="bold">VALLE DE LAS AGUJAS</text>
              {/* Compass on map */}
              <circle cx="150" cy="30" r="7" fill="#ffffff" stroke="#b45309" strokeWidth="1" />
            </g>

            {/* Drone Case and Expedition Backpack */}
            <g transform="translate(1040, 580)">
              <rect x="0" y="0" width="40" height="32" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <rect x="5" y="5" width="30" height="22" fill="#0284c7" />
              <circle cx="20" cy="16" r="5" fill="#f8fafc" />
            </g>
            <g transform="translate(760, 690)">
              <rect x="0" y="10" width="22" height="22" rx="4" fill="#9a3412" />
              <circle cx="11" cy="5" r="16" fill="#15803d" />
            </g>
          </g>

          {/* ── ROOM SELECTION / FOCUS OVERLAYS ── */}
          {ROOMS.filter(r => r.id !== 'all').map(room => {
            const isTarget = selectedRoom === room.id;
            return (
              <rect
                key={room.id}
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                rx="8"
                fill={isTarget ? '#10b981' : 'transparent'}
                fillOpacity={isTarget ? 0.08 : 0}
                stroke={isTarget ? '#10b981' : 'transparent'}
                strokeWidth={isTarget ? 3 : 0}
                className="cursor-pointer transition-all hover:stroke-emerald-400/50 hover:stroke-[2px]"
                onClick={() => handleSelectRoom(room.id)}
              />
            );
          })}
        </svg>

        {/* ── HTML AVATARS & BOT MARKERS OVER THE ROOMS ── */}
        {visibleAgents.map((agent) => {
          const isSelected = selectedAgent?.id === agent.id;
          return (
            <div
              key={agent.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgent(agent);
              }}
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 active:scale-95 group"
              style={{
                left: `${agent.x}px`,
                top: `${agent.y}px`,
              }}
            >
              {/* Floating Name Pill */}
              <div className={`no-drag mb-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight whitespace-nowrap shadow-xl flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 scale-105'
                  : agent.isUser
                    ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                    : agent.type === 'socio'
                      ? 'bg-white/95 text-slate-900 border border-amber-500/50'
                      : 'bg-slate-900/90 text-slate-200 border border-white/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  agent.status === 'online' || agent.status === 'active'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-slate-400'
                }`} />
                <span>{agent.name} {agent.isUser ? '(Vos)' : ''}</span>
              </div>

              {/* Character Avatar Icon */}
              <div className="relative mx-auto flex flex-col items-center">
                <div className="w-8 h-3 bg-black/40 rounded-full blur-[2px] absolute -bottom-1" />
                {agent.type === 'socio' ? (
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${agent.avatarColor} p-0.5 shadow-lg relative ${
                    isSelected ? 'ring-4 ring-emerald-400' : ''
                  }`}>
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xs text-white">
                      {agent.avatarChar}
                    </div>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </span>
                  </div>
                ) : (
                  <div className={`w-9 h-9 rounded-xl bg-slate-900/90 border border-white/20 flex items-center justify-center text-base shadow-lg ${
                    isSelected ? 'ring-3 ring-emerald-400 border-emerald-400' : 'group-hover:border-white/50'
                  }`}>
                    <span>{agent.avatarChar}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FLOATING CONTROLS HUD (BOTTOM RIGHT) ── */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-black/75 border border-white/15 rounded-2xl p-1.5 backdrop-blur-md shadow-2xl text-xs text-white">
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
          title="Centrar todo el edificio"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-xl transition-colors ${
            isFullMode
              ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
              : 'hover:bg-white/10 text-emerald-400 hover:text-emerald-300'
          }`}
          title={isFullMode ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drag hint overlay */}
      <div className="absolute bottom-4 left-4 z-30 hidden sm:flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm text-[11px] text-slate-300 pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>Arrastra para recorrer las habitaciones · Toca cualquier socio o bot</span>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: AGENT / ROOM INSPECTOR DRAWER
  // ─────────────────────────────────────────────────────────────────────────────
  const renderAgentDrawer = () => (
    <AnimatePresence>
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="bg-white/[0.04] border-t border-white/[0.08] backdrop-blur-xl p-4 sm:p-5 z-30 text-left"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Identity */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                selectedAgent.type === 'socio'
                  ? `bg-gradient-to-tr ${selectedAgent.avatarColor} text-white font-black shadow-lg`
                  : 'bg-white/10 border border-white/15'
              }`}>
                {selectedAgent.avatarChar}
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
                    {ROOMS.find(r => r.id === selectedAgent.roomId)?.name}
                  </span>
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-400 font-bold">Labor actual:</span>
                  <span className="line-clamp-1">{selectedAgent.currentActivity}</span>
                </p>
              </div>
            </div>

            {/* Meritocracy or Bot Stats */}
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
                  onClick={() => onNavigateModule(selectedAgent.targetModule || 'services')}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <span>Abrir Habitación / Módulo</span>
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
                    <Target className="w-3.5 h-3.5" /> Meta Diaria: 4.5 Horas de Trabajo Efectivo
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    4.5 horas al día de Lunes a Viernes, garantizando avance en consultorías sin saturación cognitiva.
                  </p>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Ventana de Preferencia (09:00 AM)
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Ventana sincrónica matutina para coordinación técnica y reuniones, no obligatoria.
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
                  Fondo de proyectos disponible estimado: <strong>Bs. {meritocracyStats.projectPool.toLocaleString()}</strong>.
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
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN RETURN: EMBEDDED DASHBOARD VIEW + PORTAL FULLSCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── VISTA PRINCIPAL INTEGRADA EN EL DASHBOARD ── */}
      <div className="w-full rounded-2xl border border-white/10 bg-[#120d09] shadow-2xl overflow-hidden text-left relative">
        {/* Top Header HUD */}
        <div className="bg-black/40 border-b border-white/[0.08] backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  Edificio SERAM · Ecosistema de Habitaciones
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Pixel-Art 3/4
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-medium line-clamp-1">
                Una habitación para cada segmento de la web: Services, Academy, Experience, Store y Dirección
              </p>
            </div>
          </div>

          {/* Quick Rules & Meritocracy Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold transition-all"
              title="Ver modelo meritocrático de ganancias"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quien trabaja más gana más</span>
            </button>

            {/* Prominent Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 ml-auto lg:ml-0 active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Ampliar Pantalla Completa</span>
            </button>
          </div>
        </div>

        {/* Room Navigation Chips */}
        <div className="bg-black/30 border-b border-white/[0.06] px-4 py-2.5 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => handleSelectRoom(room.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedRoom === room.id
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <span>{room.icon}</span>
              <span>{room.name}</span>
            </button>
          ))}
        </div>

        {/* Embedded Canvas */}
        <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[680px] overflow-hidden">
          {renderOfficeCanvas(false)}
        </div>

        {/* Embedded Agent Drawer */}
        {renderAgentDrawer()}
      </div>

      {/* ── FULLSCREEN PORTAL MODAL (100% ESCAPES ALL PARENT STACKING CONTEXTS) ── */}
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
              <span className="text-xs sm:text-sm font-black text-white">Edificio SERAM · 5 Habitaciones</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono hidden sm:inline">
                Services · Academy · Experience · Store · Dirección
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Salir Pantalla Completa</span>
              </button>
            </div>
          </div>

          {/* Room Selector in Fullscreen */}
          <div className="bg-[#150f0b]/90 border-b border-white/10 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-30 shrink-0">
            {ROOMS.map(room => (
              <button
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  selectedRoom === room.id
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-white/[0.04] text-slate-400'
                }`}
              >
                <span>{room.icon}</span>
                <span>{room.name}</span>
              </button>
            ))}
          </div>

          {/* Fullscreen Canvas filling 100% of remaining screen */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            {renderOfficeCanvas(true)}
          </div>

          {/* Fullscreen Drawer */}
          {renderAgentDrawer()}
        </div>,
        document.body
      )}

      {/* Modals */}
      {renderModals()}
    </>
  );
}

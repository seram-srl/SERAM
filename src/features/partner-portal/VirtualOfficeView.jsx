import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, Bot, Maximize2, Minimize2, ZoomIn, ZoomOut,
  RotateCcw, Sparkles, Shield, DollarSign, Clock, CheckCircle2,
  AlertCircle, ChevronRight, X, Search, Filter, Play, ExternalLink,
  Laptop, Smartphone, Award, TrendingUp, Layers, Compass, Target,
  Briefcase, BookOpenCheck, Globe, ShoppingBag, Info, MapPin,
  ChevronDown, ArrowUpRight, Coffee, Microscope, FolderArchive,
  Car, UserCheck, CheckSquare, FileText
} from 'lucide-react';
import officeRoomImage from '../../assets/virtual-office/seram_office_model.jpg';

// ─────────────────────────────────────────────────────────────────────────────
// DATA: ESTACIONES DE LA OFICINA ISOMÉTRICA 2.5D UNIFICADA (SERAM SRL)
// ─────────────────────────────────────────────────────────────────────────────

const OFFICE_STATIONS = [
  {
    id: 'all',
    name: 'Toda la Oficina',
    segmentTitle: 'Oficina Central SERAM SRL',
    icon: <Building2 className="w-3.5 h-3.5" />,
    badge: 'Vista Panorámica 2.5D',
    color: 'emerald',
    targetModule: 'overview',
    description: 'Espacio de trabajo unificado de la consultora ambiental e ingeniería SERAM.'
  },
  {
    id: 'services',
    name: 'SERAM SERVICES',
    segmentTitle: 'Dirección General & Propuestas Municipales',
    icon: <Briefcase className="w-3.5 h-3.5" />,
    badge: 'Ingeniería & SIG',
    color: 'blue',
    targetModule: 'services',
    xPercent: 50,
    yPercent: 54,
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
    segmentTitle: 'Estación de Modelación Hidráulica & Obras',
    icon: <Layers className="w-3.5 h-3.5" />,
    badge: 'Redes & Balances',
    color: 'sky',
    targetModule: 'services',
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
    id: 'experience',
    name: 'SERAM EXPERIENCE',
    segmentTitle: 'Mesa de Cartografía, Drones & Expediciones',
    icon: <Globe className="w-3.5 h-3.5" />,
    badge: 'Expediciones & Campo',
    color: 'amber',
    targetModule: 'experience',
    xPercent: 78,
    yPercent: 58,
    zoomTarget: 1.35,
    panX: -190,
    panY: -50,
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
    id: 'recreation',
    name: 'SALA DE RECREACIÓN & CAFÉ',
    segmentTitle: 'Lounge de Descanso & Diligencias de Comisión',
    icon: <Coffee className="w-3.5 h-3.5" />,
    badge: 'Descanso / Sin Cómputo',
    color: 'emerald',
    targetModule: 'timetracker',
    xPercent: 18,
    yPercent: 36,
    zoomTarget: 1.45,
    panX: 230,
    panY: 80,
    assignedLead: 'Zona de Pausa & Diligencias',
    assignedRole: 'Área Común · Socios en Comisión o Trámites',
    leadAvatar: '☕',
    leadColor: 'from-emerald-600 to-green-700',
    currentActivity: 'Espacio de descanso, café y diligencias externas. Los avatares descansan aquí cuando no ejecutan tareas activas.',
    isRecreationRoom: true,
    description: 'Área de sofás y cafetería. Cuando un socio está conectado pero no ejecuta una tarea técnica, su avatar descansa aquí. En esta sala no se contabilizan horas de trabajo.'
  },
  {
    id: 'meeting',
    name: 'SALA DE REUNIONES',
    segmentTitle: 'Mesa de Directorio & Acuerdos Técnicos',
    icon: <Users className="w-3.5 h-3.5" />,
    badge: 'Mesa de Directorio',
    color: 'amber',
    targetModule: 'overview',
    xPercent: 52,
    yPercent: 26,
    zoomTarget: 1.45,
    panX: -20,
    panY: 150,
    assignedLead: 'Consejo de Socios Directivos',
    assignedRole: 'Directorio Plenario SERAM SRL',
    leadAvatar: '🏛️',
    leadColor: 'from-amber-500 to-yellow-600',
    currentActivity: 'Mesa de toma de decisiones, asambleas de socios, revisión de TDRs y coordinación interdepartamental.',
    description: 'Sala de conferencias central. Cuando hay una reunión técnica o asamblea convocada, los avatares se ubican alrededor de la mesa.'
  },
  {
    id: 'commercial',
    name: 'ÁREA COMERCIAL',
    segmentTitle: 'Ventas Corporativas & Licitaciones B2B',
    icon: <Target className="w-3.5 h-3.5" />,
    badge: 'Ventas & Contratos',
    color: 'rose',
    targetModule: 'activities',
    xPercent: 84,
    yPercent: 26,
    zoomTarget: 1.45,
    panX: -240,
    panY: 150,
    assignedLead: 'Gerencia Comercial B2B',
    assignedRole: 'Captación & Licitaciones',
    leadAvatar: '💼',
    leadColor: 'from-rose-500 to-red-600',
    currentActivity: 'Monitoreo de contrataciones estatales en SICOES y prospección en la base de 150 empresas industriales.',
    bots: ['Bot Licitaciones SICOES', 'Bot WhatsApp B2B'],
    description: 'Oficina comercial compacta para el cierre de contratos ambientales, licitaciones públicas y propuestas para empresas privadas.'
  },
  {
    id: 'research',
    name: 'INVESTIGACIÓN & LAB (I+D)',
    segmentTitle: 'Laboratorio de Calidad Ambiental & Mercurio',
    icon: <Microscope className="w-3.5 h-3.5" />,
    badge: 'I+D / Análisis Pericial',
    color: 'cyan',
    targetModule: 'services',
    xPercent: 84,
    yPercent: 42,
    zoomTarget: 1.45,
    panX: -240,
    panY: 40,
    assignedLead: 'Laboratorio Pericial SERAM',
    assignedRole: 'Investigación Aplicada',
    leadAvatar: '🔬',
    leadColor: 'from-cyan-500 to-blue-600',
    currentActivity: 'Protocolos de espectrometría para mercurio (Hg total) y ensayos de lixiviación según Ley 1333.',
    bots: ['Bot Espectrometría Hg', 'Bot Parámetros EPA'],
    description: 'Área de investigación científica aplicada: pruebas periciales de fuentes de agua, sedimentos auríferos y calibración de sensores.'
  },
  {
    id: 'archive',
    name: 'ARCHIVO TÉCNICO',
    segmentTitle: 'Archivo Técnico & Documentación Oficial',
    icon: <FolderArchive className="w-3.5 h-3.5" />,
    badge: 'Custodia & Licencias',
    color: 'indigo',
    targetModule: 'activities',
    xPercent: 84,
    yPercent: 74,
    zoomTarget: 1.45,
    panX: -240,
    panY: -160,
    assignedLead: 'Archivo Técnico Central',
    assignedRole: 'Custodia Documental',
    leadAvatar: '📁',
    leadColor: 'from-indigo-500 to-purple-600',
    currentActivity: 'Custodia de TDRs, decretos supremos, licencias ambientales FNCA y expedientes municipales.',
    bots: ['Bot Archivo PDF', 'Bot Licencias Ambientales'],
    description: 'Repositorio documental físico y digital de proyectos concluidos, informes periciales, resoluciones administrativas y carpetas legales.'
  },
  {
    id: 'academy',
    name: 'SERAM ACADEMY',
    segmentTitle: 'Aula Virtual & Biblioteca Técnica',
    icon: <BookOpenCheck className="w-3.5 h-3.5" />,
    badge: 'Campus & Alumnos',
    color: 'purple',
    targetModule: 'academy',
    xPercent: 36,
    yPercent: 22,
    zoomTarget: 1.45,
    panX: 100,
    panY: 170,
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
    id: 'store',
    name: 'SERAM STORE',
    segmentTitle: 'Mostrador de Sensores & Equipamiento',
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    badge: 'Showroom Técnico',
    color: 'rose',
    targetModule: 'store',
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
    id: 'finances',
    name: 'BÓVEDA FINANCIERA',
    segmentTitle: 'Bóveda Financiera & Meritocracia',
    icon: <Shield className="w-3.5 h-3.5" />,
    badge: 'Finanzas & Reglas',
    color: 'yellow',
    targetModule: 'finances',
    xPercent: 28,
    yPercent: 44,
    zoomTarget: 1.45,
    panX: 160,
    panY: 30,
    assignedLead: 'Consejo de Socios Directivos',
    assignedRole: 'SERAM SRL · Gobernanza Meritocrática',
    leadAvatar: '⚖️',
    leadColor: 'from-amber-500 to-yellow-600',
    currentActivity: 'Cómputo en tiempo real del Time Tracker (4.5h/día) y distribución proporcional de honorarios',
    bots: ['Bot Auditoría de Horas', 'Bot Dividendos'],
    metrics: 'Fondo disponible: Bs. 35,000',
    description: 'Despacho de acuerdos estatutarios: "Quien trabaja más gana más". Monitoreo de horas efectivas y dividendos netos.'
  }
];

export default function VirtualOfficeView({
  activeServices = [],
  courses = [],
  timeLogs = [],
  partnerPresences = {},
  currentSocio,
  onNavigateModule
}) {
  const [selectedStationId, setSelectedStationId] = useState('services');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScheduleInfo, setShowScheduleInfo] = useState(false);
  const [showMeritocracyModal, setShowMeritocracyModal] = useState(false);

  // Estado operativo seleccionado por el socio activo ('working', 'recreation', 'commission', 'meeting')
  const [partnerActiveStatus, setPartnerActiveStatus] = useState(() => {
    try {
      return localStorage.getItem('seram_partner_visual_status') || 'recreation';
    } catch (_) {
      return 'recreation';
    }
  });

  const handleSetPartnerStatus = (status) => {
    setPartnerActiveStatus(status);
    try {
      localStorage.setItem('seram_partner_visual_status', status);
    } catch (_) {
      // Ignorar si el almacenamiento local está restringido
    }
  };

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

  // Estación activa seleccionada
  const currentStation = useMemo(() => {
    return OFFICE_STATIONS.find(s => s.id === selectedStationId) || OFFICE_STATIONS[1];
  }, [selectedStationId]);

  // Lista de socios con su ubicación dinámica según el requerimiento exacto
  const partnerAvatars = useMemo(() => {
    const list = [
      {
        id: 'diego',
        email: 'barrientoso2401@gmail.com',
        name: 'Ing. Diego Barrientos',
        shortName: 'Diego',
        initials: 'DB',
        avatarBg: 'from-amber-400 to-yellow-600',
        homeStation: 'services',
        defaultStationCoords: { x: 50, y: 58 }
      },
      {
        id: 'fernando',
        email: 'fernandoaraujo1912@gmail.com',
        name: 'Ing. Fernando Araujo',
        shortName: 'Fernando',
        initials: 'FA',
        avatarBg: 'from-blue-500 to-indigo-600',
        homeStation: 'operations',
        defaultStationCoords: { x: 28, y: 66 }
      },
      {
        id: 'fabricio',
        email: 'sebastiansbs51@gmail.com',
        name: 'Ing. Fabricio Orosco',
        shortName: 'Fabricio',
        initials: 'FO',
        avatarBg: 'from-emerald-500 to-teal-700',
        homeStation: 'experience',
        defaultStationCoords: { x: 78, y: 63 }
      }
    ];

    // Sala de Recreación: sofás & descanso (coords distribuidas)
    const recreationSpots = [
      { x: 16, y: 34, label: 'En Sofá Lounge' },
      { x: 20, y: 38, label: 'En Mesa Café' },
      { x: 15, y: 40, label: 'Tomando Café' }
    ];

    // Sala de Reuniones: mesa central de conferencias
    const meetingSpots = [
      { x: 49, y: 26, label: 'Mesa de Directorio' },
      { x: 53, y: 24, label: 'Mesa de Directorio' },
      { x: 55, y: 28, label: 'Mesa de Directorio' }
    ];

    return list.map((partner, idx) => {
      const presence = partnerPresences[partner.email] || {};
      const isOnline = presence.isOnline ?? true;
      const isCurrent = currentSocio?.email === partner.email;

      // Determinación del estado operativo del socio
      let status = 'recreation'; // Por defecto: en descanso/café sin computar horas
      let statusLabel = 'En Sala de Recreación (Sin actividad en curso)';
      let isWorking = false;

      if (isCurrent) {
        status = partnerActiveStatus;
      } else if (presence.lastWork && (Date.now() - new Date(presence.lastWork.loggedAt).getTime()) < 3600000) {
        status = 'working';
      }

      let coords = recreationSpots[idx % recreationSpots.length];

      if (status === 'meeting') {
        coords = meetingSpots[idx % meetingSpots.length];
        statusLabel = 'En Reunión Técnica de Directorio';
      } else if (status === 'working') {
        coords = partner.defaultStationCoords;
        statusLabel = 'En Estación Técnica (Horas Computándose)';
        isWorking = true;
      } else if (status === 'commission') {
        coords = recreationSpots[idx % recreationSpots.length];
        statusLabel = 'De Comisión / Trámites Externos';
      } else {
        coords = recreationSpots[idx % recreationSpots.length];
        statusLabel = 'En Pausa / Café (No se contabilizan horas)';
      }

      return {
        ...partner,
        isOnline,
        isCurrent,
        status,
        statusLabel,
        isWorking,
        x: coords.x,
        y: coords.y
      };
    });
  }, [partnerPresences, currentSocio, partnerActiveStatus]);

  // Cálculos meritocráticos basados en Time Tracker
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

  // Pantalla completa
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

  // Controles de ratón y táctiles
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

  const handleSelectStation = (stationId) => {
    setSelectedStationId(stationId);
    if (stationId === 'all') {
      handleResetView();
      return;
    }
    const st = OFFICE_STATIONS.find(s => s.id === stationId);
    if (st) {
      setPanOffset({ x: st.panX || 0, y: st.panY || 0 });
      setZoomLevel(typeof window !== 'undefined' && window.innerWidth < 640 ? 0.75 : st.zoomTarget || 1.3);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: LIENZO ISOMÉTRICO 2.5D CÁLIDO CON ESTACIONES Y AVATARES EN VIVO
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
      {/* Viñeta ambiental cálida */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#140e09]/80 to-[#0a0705] pointer-events-none z-10" />

      {/* Escenario con Zoom & Pan */}
      <div
        ref={floorStageRef}
        className="absolute origin-center transition-transform duration-100 will-change-transform"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          left: '50%',
          top: '50%',
          marginLeft: '-368px',
          marginTop: '-368px',
          width: '736px',
          height: '736px'
        }}
      >
        {/* Ilustración de Planta Isométrica 2.5D Oficial */}
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

        {/* ── 1. ESTACIONES TÉCNICAS INTERACTIVAS ── */}
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
              {/* Anillo Pulsante de Interacción */}
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

              {/* Etiqueta Flotante Estilizada */}
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

        {/* ── 2. AVATARES DE SOCIOS EN VIVO UBICADOS DINÁMICAMENTE ── */}
        {partnerAvatars.map((partner) => (
          <div
            key={partner.id}
            className="absolute z-25 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 ease-out"
            style={{
              left: `${partner.x}%`,
              top: `${partner.y}%`
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Halo de Presencia */}
              <span className={`absolute -inset-1 rounded-full blur-sm opacity-75 animate-pulse ${
                partner.isWorking ? 'bg-[#00e03c]' : 'bg-amber-400'
              }`} />

              {/* Avatar Bubble */}
              <div className={`relative w-8 h-8 rounded-full border-2 border-white shadow-2xl flex items-center justify-center font-black text-xs text-white bg-gradient-to-br ${partner.avatarBg}`}>
                {partner.initials}
              </div>

              {/* Name Tag con Estado Operativo */}
              <div className="mt-1 px-2 py-0.5 rounded-md bg-black/85 border border-white/20 text-[9px] font-bold text-white shadow-lg whitespace-nowrap flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${partner.isWorking ? 'bg-[#00e03c] animate-ping' : 'bg-amber-400'}`} />
                <span>{partner.shortName}</span>
                <span className="text-[8px] text-slate-400">
                  {partner.isWorking ? '· Trabajando' : partner.status === 'meeting' ? '· Reunión' : '· En Café'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTROLES FLOTANTES HUD (INFERIOR DERECHA) ── */}
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

      {/* Rótulo de guía táctil */}
      <div className="absolute bottom-4 left-4 z-30 hidden sm:flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm text-[11px] text-slate-300 pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span>Arrastra para recorrer la oficina isométrica · Toca cualquier sala para inspeccionar</span>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: DRAWER / INSPECTOR INFERIOR DE LA ESTACIÓN SELECCIONADA
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
            {/* Identidad de la Sala */}
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
                  <span className="text-amber-400 font-bold">Descripción:</span>
                  <span className="line-clamp-1">{currentStation.currentActivity || currentStation.description}</span>
                </p>
              </div>
            </div>

            {/* Aviso especial de Sala de Recreación (No computa horas) */}
            {currentStation.isRecreationRoom ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>Zona de Pausa & Diligencias:</strong> El cronómetro de horas permanece detenido mientras el socio descansa en este espacio.
                </span>
              </div>
            ) : (
              /* Métricas habituales de jornada o equipo */
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
                        Bs. {currentStation.cycleEarnings?.toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Operación Técnica
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      {currentStation.metrics || 'En línea · Conectado en Tiempo Real'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Botón de Salto Directo */}
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* ── CONTENEDOR PRINCIPAL DEL DASHBOARD ── */}
      <div className="w-full rounded-2xl border border-amber-500/20 bg-[#120d09] shadow-2xl overflow-hidden text-left relative">
        {/* Encabezado Superior HUD */}
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
                    Planta Isométrica 2.5D
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-medium line-clamp-1">
                Toca cualquier sala de trabajo o usa el selector para interactuar con los socios y bots en tiempo real
              </p>
            </div>
          </div>

          {/* Selector de Estado Operativo del Socio Activo + Controles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Control Rápido de Ubicación del Socio */}
            <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 gap-1">
              <span className="text-[10px] font-bold text-slate-400 px-2 hidden sm:inline">Mi Estado:</span>
              <button
                onClick={() => handleSetPartnerStatus('working')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  partnerActiveStatus === 'working' ? 'bg-[#00e03c] text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="Avatar en mi estación técnica trabajando (Horas contabilizándose)"
              >
                <Briefcase className="w-3 h-3" />
                <span>En Estación</span>
              </button>
              <button
                onClick={() => handleSetPartnerStatus('recreation')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  partnerActiveStatus === 'recreation' ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="Avatar en el Café / Descanso (Horas en pausa)"
              >
                <Coffee className="w-3 h-3" />
                <span>En Café</span>
              </button>
              <button
                onClick={() => handleSetPartnerStatus('commission')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  partnerActiveStatus === 'commission' ? 'bg-blue-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="De Comisión / Trámites fuera de la oficina"
              >
                <Car className="w-3 h-3" />
                <span>De Comisión</span>
              </button>
              <button
                onClick={() => handleSetPartnerStatus('meeting')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  partnerActiveStatus === 'meeting' ? 'bg-purple-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                title="En Reunión de Directorio"
              >
                <Users className="w-3 h-3" />
                <span>Reunión</span>
              </button>
            </div>

            <button
              onClick={() => setShowScheduleInfo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-slate-300 font-bold transition-all"
              title="Ver pautas de horario y conexión flexible"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>4.5 hrs / día</span>
            </button>

            <button
              onClick={() => setShowMeritocracyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all"
              title="Ver modelo meritocrático de ganancias"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Meritocracia</span>
            </button>

            {/* Botón Pantalla Completa */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/25 ml-auto lg:ml-0 active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pantalla Completa</span>
            </button>
          </div>
        </div>

        {/* Chips de Navegación Rápida entre Salas */}
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

        {/* Lienzo Embebido */}
        <div className="relative w-full h-[500px] sm:h-[620px] lg:h-[700px] overflow-hidden">
          {renderOfficeCanvas(false)}
        </div>

        {/* Inspector Inferior */}
        {renderStationDrawer()}
      </div>

      {/* ── OVERLAY PANTALLA COMPLETA (100% VIEWPORT VIA REACT PORTAL) ── */}
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
          {/* Top Bar en Pantalla Completa */}
          <div className="bg-[#1c140e]/95 border-b border-white/15 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 z-30 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-white">Oficina Virtual SERAM</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono hidden sm:inline">
                Planta Isométrica 2.5D
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Salir de Pantalla Completa</span>
              </button>
            </div>
          </div>

          {/* Selector de Salas en Pantalla Completa */}
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

          {/* Lienzo en Pantalla Completa */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            {renderOfficeCanvas(true)}
          </div>

          {/* Inspector Inferior */}
          {renderStationDrawer()}
        </div>,
        document.body
      )}

      {/* ── MODAL: PAUTAS DE HORARIO FLEXIBLE (4.5 HORAS/DÍA) ── */}
      <AnimatePresence>
        {showScheduleInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a120c] border border-amber-500/30 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Pauta de Jornada SERAM</h3>
                    <p className="text-xs text-amber-400 font-bold">4.5 Horas Técnicas Efectivas por Día</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleInfo(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Horario Flexible Basado en Entregables
                  </p>
                  <p className="text-slate-400">
                    Los socios fundadores coordinan sus 4.5 horas diarias según sus picos de productividad (mañana, tarde o noche), sincronizados mediante el Time Tracker.
                  </p>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-emerald-300 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-emerald-400" />
                    Sala de Recreación & Comisiones
                  </p>
                  <p className="text-slate-400">
                    Si un socio está en trámites, gestiones municipales o en pausa, su avatar se muestra en la <strong>Sala de Recreación & Café</strong>. En esta zona no se contabilizan horas de trabajo.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowScheduleInfo(false)}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: MODELO MERITOCRÁTICO ("QUIEN TRABAJA MÁS GANA MÁS") ── */}
      <AnimatePresence>
        {showMeritocracyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18110b] border border-amber-500/30 rounded-3xl p-6 sm:p-7 max-w-2xl w-full space-y-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Gobernanza Meritocrática SERAM</h3>
                    <p className="text-xs text-amber-400 font-bold">&ldquo;Quien trabaja más gana más&rdquo;</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMeritocracyModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {meritocracyStats.partners.map((p) => (
                    <div key={p.name} className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2">
                      <p className="font-extrabold text-white text-xs leading-tight line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{p.role}</p>
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Horas Acumuladas:</span>
                          <span className="font-black text-[#00e03c] font-mono">{p.hours}h</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Participación:</span>
                          <span className="font-black text-amber-400 font-mono">{p.sharePercent}%</span>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1 border-t border-white/5">
                          <span className="text-slate-400">Honorarios Netos:</span>
                          <span className="font-black text-white font-mono">Bs. {p.estimatedEarnings.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowMeritocracyModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-colors"
              >
                Cerrar Panel Meritocrático
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, Bot, Maximize2, Minimize2, ZoomIn, ZoomOut,
  RotateCcw, Sparkles, Shield, DollarSign, Clock, CheckCircle2,
  AlertCircle, ChevronRight, X, Search, Filter, Play, Pause, ExternalLink,
  Laptop, Smartphone, Award, TrendingUp, Layers, Compass, Target,
  Briefcase, BookOpenCheck, Globe, ShoppingBag, Info, MapPin,
  ChevronDown, ArrowUpRight, Coffee, Microscope, FolderArchive,
  Car, UserCheck, CheckSquare, FileText, Volume2, VolumeX, MessageSquare,
  Share2, Radio, Sliders, ChevronUp, RefreshCw
} from 'lucide-react';
import soundEngine from './OfficeSoundEngine';
import officeHdImage from '../../assets/virtual-office/seram_isometric_office_hd.jpg';

// ─────────────────────────────────────────────────────────────────────────────
// DATA: 13 DESPACHOS ISOMÉTRICOS 2.5D (CALIBRADOS EN COORDENADAS %)
// ─────────────────────────────────────────────────────────────────────────────

export const OFFICE_ROOMS = [
  {
    id: 'admin',
    number: '01',
    name: 'ADMINISTRACIÓN',
    subtitle: 'Gestión de Socios, Roles & Gobierno',
    wing: 'Ala Ejecutiva',
    targetModule: 'users',
    color: '#3b82f6',
    xPercent: 29,
    yPercent: 22,
    lead: 'Gerencia Administrativa',
    role: 'Gobierno Corporativo',
    bot: {
      name: 'Bot Gestor de Accesos',
      role: 'Auditoría de Roles & Socios',
      avatar: '🛡️',
      status: 'Activo · Supervisando credenciales'
    },
    description: 'Control de accesos a la intranet, estatutos de SERAM SRL, poderes notariales y gestión de usuarios.',
    metrics: '3 socios directivos · 12 permisos activos'
  },
  {
    id: 'direction',
    number: '02',
    name: 'DIRECCIÓN',
    subtitle: 'Despacho de Presidencia & Estrategia',
    wing: 'Ala Ejecutiva',
    targetModule: 'services',
    color: '#f59e0b',
    xPercent: 35,
    yPercent: 35,
    lead: 'Ing. Diego Barrientos',
    role: 'Socio Fundador · Dirección General',
    leadInitials: 'DB',
    bot: {
      name: 'Bot Dossier Concejales',
      role: 'Asistente de Presidencia',
      avatar: '👑',
      status: 'Procesando TDRs Municipales'
    },
    description: 'Despacho del Ing. Diego Barrientos: dirección estratégica, articulación con gobernaciones y aprobación de ofertas técnicas.',
    metrics: '4 propuestas clave en revisión'
  },
  {
    id: 'operations',
    number: '03',
    name: 'OPERACIONES Y PLANIFICACIÓN',
    subtitle: 'Ingeniería Hidráulica, Riego & Obras',
    wing: 'Ala Técnica',
    targetModule: 'services',
    color: '#0284c7',
    xPercent: 53,
    yPercent: 17,
    lead: 'Ing. Fernando Araujo',
    role: 'Socio Directivo · Hidráulica & Obras',
    leadInitials: 'FA',
    bot: {
      name: 'Bot EPANET & Balances',
      role: 'Cálculo de Redes & Caudales',
      avatar: '💧',
      status: 'Simulando pérdidas de carga'
    },
    description: 'Despacho del Ing. Fernando Araujo: dimensionamiento de obras de toma, balances hídricos CROPWAT y supervisión de obras civiles.',
    metrics: '3 proyectos de microriego en cómputo'
  },
  {
    id: 'commercial',
    number: '04',
    name: 'COMERCIAL',
    subtitle: 'Licitaciones Públicas B2B & Clientes',
    wing: 'Ala Comercial',
    targetModule: 'activities',
    color: '#e11d48',
    xPercent: 64,
    yPercent: 27,
    lead: 'Gerencia Comercial B2B',
    role: 'Captación & SICOES',
    bot: {
      name: 'Bot Licitaciones SICOES',
      role: 'Monitoreo de Contrataciones Estatales',
      avatar: '💼',
      status: 'Escaneando DBCs mineros y agua'
    },
    description: 'Oficina comercial y licitaciones: seguimiento al SICOES, preparación de sobres A/B y prospección en la base de 150 empresas industriales.',
    metrics: '8 licitaciones monitoreadas hoy'
  },
  {
    id: 'service',
    number: '07',
    name: 'SERVICE',
    subtitle: 'Catálogo de Consultoría Ambiental & SIG',
    wing: 'Núcleo Central',
    targetModule: 'services',
    color: '#059669',
    xPercent: 62,
    yPercent: 44,
    lead: 'Equipo Técnico Central',
    role: 'Servicios Ambientales',
    bot: {
      name: 'Bot Sentinel-2 NDVI',
      role: 'Teledetección & Multiespectral',
      avatar: '🛰️',
      status: 'Mapeando cuenca aurífera'
    },
    description: 'Área de formulación y ejecución de servicios ambientales: pasivos mineros, monitoreo satelital, planes de contingencia y EIA.',
    metrics: '5 servicios activos en ejecución'
  },
  {
    id: 'marketing',
    number: '06',
    name: 'MARKETING Y VENTAS',
    subtitle: 'Embudos Comerciales & Estrategia B2B',
    wing: 'Núcleo Central',
    targetModule: 'activities',
    color: '#f97316',
    xPercent: 21,
    yPercent: 46,
    lead: 'Equipo de Crecimiento',
    role: 'Growth & Alianzas',
    bot: {
      name: 'Bot Growth & Campañas',
      role: 'Optimización de Pauta B2B',
      avatar: '📈',
      status: 'Segmentando directores de medio ambiente'
    },
    description: 'Unidad unificada de marketing corporativo y ventas: gestión de cartera de clientes, embudos de conversión y campañas en LinkedIn.',
    metrics: '22 leads cualificados en pipeline'
  },
  {
    id: 'finances',
    number: '05',
    name: 'FINANZAS',
    subtitle: 'Bóveda Financiera & Meritocracia',
    wing: 'Núcleo Central',
    targetModule: 'finances',
    color: '#eab308',
    xPercent: 77,
    yPercent: 46,
    lead: 'Gobernanza Financiera',
    role: 'Bóveda & Distribución',
    bot: {
      name: 'Bot Auditor Contable',
      role: 'Cálculo de Retenciones & Dividendos',
      avatar: '⚖️',
      status: 'Regla: Quien trabaja más gana más'
    },
    description: 'Bóveda y control financiero de SERAM: liquidación del fondo de socios por horas efectivas (Time Tracker), retenciones de ley y flujo de caja.',
    metrics: 'Fondo de Socios: Bs. 35,000'
  },
  {
    id: 'meeting',
    number: '08',
    name: 'SALA DE REUNIONES',
    subtitle: 'Mesa de Directorio & Juntas Plenarias',
    wing: 'Ala Colaborativa',
    targetModule: 'overview',
    color: '#d97706',
    xPercent: 52,
    yPercent: 52,
    lead: 'Directorio Plenario',
    role: 'Asamblea de Socios',
    isMeetingRoom: true,
    bot: {
      name: 'Bot Minutas & Acuerdos',
      role: 'Secretaría de Directorio',
      avatar: '🏛️',
      status: 'Mesa de Directorio disponible'
    },
    description: 'Sala de juntas con mesa de directorio ovalada de nogal para asambleas de socios, presentación de balances y toma de acuerdos.',
    metrics: 'Capacidad para los 3 socios directivos'
  },
  {
    id: 'recreation',
    number: '09',
    name: 'SALA RECREATIVA (DE COMISIÓN)',
    subtitle: 'Lounge, Barra de Café & Diligencias',
    wing: 'Ala Colaborativa',
    targetModule: 'timetracker',
    color: '#10b981',
    xPercent: 49,
    yPercent: 82,
    lead: 'Zona de Pausa & Diligencias',
    role: 'Descanso / Horas Detenidas',
    isRecreationRoom: true,
    bot: {
      name: 'Barista Espresso Bar',
      role: 'Cafetería & Refrigerios',
      avatar: '☕',
      status: 'Cafetera expreso activa'
    },
    description: 'Espacio de descanso con sofás esmeralda y barra de café. Cuando un socio no tiene tarea activa o está "De Comisión", su avatar descansa aquí. En esta sala NO se contabilizan horas.',
    metrics: 'Horas en pausa · Sin cómputo laboral'
  },
  {
    id: 'academy',
    number: '10',
    name: 'ACADEMY',
    subtitle: 'Aula Virtual, Cursos & Infoproductos',
    wing: 'Ala Académica',
    targetModule: 'products',
    color: '#8b5cf6',
    xPercent: 25,
    yPercent: 73,
    lead: 'SERAM Campus Virtual',
    role: 'Educación & Certificados',
    bot: {
      name: 'Bot Tutor Teledetección',
      role: 'Soporte a Estudiantes & QR',
      avatar: '🎓',
      status: 'Resolviendo consultas de QGIS'
    },
    description: 'Gestión de infoproductos ambientales, guías periciales, clases grabadas y emisión de certificados digitales con código QR.',
    metrics: '143 alumnos inscritos en cursos'
  },
  {
    id: 'experience',
    number: '11',
    name: 'EXPERIENCE',
    subtitle: 'Drones, Cartografía & Expediciones',
    wing: 'Ala de Campo',
    targetModule: 'experience',
    color: '#06b6d4',
    xPercent: 12,
    yPercent: 55,
    lead: 'Ing. Fabricio Orosco',
    role: 'Socio Directivo · Calidad & Expansión',
    leadInitials: 'FO',
    bot: {
      name: 'Bot Drones & Ortomosaicos',
      role: 'Fotogrametría & Nubes de Puntos',
      avatar: '🚁',
      status: 'Procesando ortomosaico LiDAR'
    },
    description: 'Despacho del Ing. Fabricio Orosco: misiones de drones, expediciones científicas y turismo ambiental de alta montaña.',
    metrics: '2 misiones de campo programadas'
  },
  {
    id: 'social_media',
    number: '12',
    name: 'SOCIAL MEDIA',
    subtitle: 'Contenidos, Producción Audiovisual & Reels',
    wing: 'Ala Creativa',
    targetModule: 'activities',
    color: '#ec4899',
    xPercent: 71,
    yPercent: 70,
    lead: 'Estudio de Contenido',
    role: 'Difusión & Divulgación',
    bot: {
      name: 'Bot Multimedia & Reels',
      role: 'Generador de Guiones & Clips',
      avatar: '🎬',
      status: 'Editando cápsula de minería aurífera'
    },
    description: 'Estudio de producción audiovisual con cámaras e iluminación para divulgación técnica de SERAM en redes sociales.',
    metrics: '4 videos en renderización'
  },
  {
    id: 'research',
    number: '13',
    name: 'INVESTIGACIÓN',
    subtitle: 'Laboratorio de Mercurio (Hg) & Calidad Hídrica',
    wing: 'Ala Científica',
    targetModule: 'services',
    color: '#14b8a6',
    xPercent: 91,
    yPercent: 54,
    lead: 'Laboratorio Pericial',
    role: 'I+D Ambiental',
    bot: {
      name: 'Bot Espectrometría Mercurio',
      role: 'Análisis Pericial Ley 1333',
      avatar: '🔬',
      status: 'Curva de calibración Hg lista'
    },
    description: 'Laboratorio de investigación científica: análisis de mercurio en sedimentos y agua y calibración de sensores.',
    metrics: 'Muestreo pericial estandarizado EPA'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: AVATAR HUMANO 2.5D CON CHALECO INSTITUCIONAL SERAM (AZUL/DORADO)
// ─────────────────────────────────────────────────────────────────────────────

function HumanPartnerSprite({ partner, isWalking }) {
  return (
    <div className="relative flex flex-col items-center group cursor-pointer">
      {/* Halo de Presencia */}
      <span className={`absolute -inset-1 rounded-full blur-sm opacity-75 ${
        partner.isWorking ? 'bg-[#00e03c] animate-pulse' : 'bg-amber-400'
      }`} />

      {/* Miniatura Humana 2.5D Isométrica */}
      <svg
        width="34"
        height="48"
        viewBox="0 0 34 48"
        className={`filter drop-shadow-xl overflow-visible transition-transform duration-200 ${
          isWalking ? 'scale-110 -translate-y-1' : ''
        }`}
      >
        {/* Sombra proyectada sobre el parquet */}
        <ellipse cx="17" cy="45" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />

        {/* Piernas con pantalón de faena técnico oscuro */}
        <rect x="11" y="28" width="4.5" height="14" rx="2" fill="#1e293b" />
        <rect x="18.5" y="28" width="4.5" height="14" rx="2" fill="#1e293b" />

        {/* Calzados de seguridad oscuros */}
        <ellipse cx="13" cy="42" rx="3.5" ry="2" fill="#090d16" />
        <ellipse cx="21" cy="42" rx="3.5" ry="2" fill="#090d16" />

        {/* Torso: CHALECO INSTITUCIONAL SERAM (Azul Marino con ribetes dorados #c9a84c) */}
        <path d="M 8 16 L 26 16 L 24 29 L 10 29 Z" fill="#0f172a" stroke="#c9a84c" strokeWidth="1.2" />

        {/* Cuello de camisa ejecutiva interior */}
        <polygon points="14,16 17,21 20,16" fill="#f8fafc" />

        {/* Bordado Institucional SERAM en el Pecho (Dorado) */}
        <rect x="11" y="19" width="3.5" height="2" rx="0.5" fill="#c9a84c" />

        {/* Brazos */}
        <rect x="6" y="17" width="3.5" height="10" rx="1.5" fill="#0f172a" />
        <rect x="24.5" y="17" width="3.5" height="10" rx="1.5" fill="#0f172a" />

        {/* Manos */}
        <circle cx="7.7" cy="27.5" r="2" fill="#fbcfe8" />
        <circle cx="26.3" cy="27.5" r="2" fill="#fbcfe8" />

        {/* Cabeza */}
        <ellipse cx="17" cy="10" rx="6" ry="6.5" fill="#fcd34d" />

        {/* Cabello humano detallado */}
        <path
          d="M 11 8 C 11 3.5, 23 3.5, 23 8 C 22 4.5, 12 4.5, 11 8 Z"
          fill={partner.hairColor || '#291d14'}
        />

        {/* Insignia de iniciales en el pecho */}
        <text x="17" y="27" textAnchor="middle" fill="#c9a84c" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
          {partner.initials}
        </text>
      </svg>

      {/* Rótulo de Identificación Flotante con Cargo */}
      <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-amber-400/50 text-[9px] font-black text-white shadow-2xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
        <span className={`w-1.5 h-1.5 rounded-full ${partner.isWorking ? 'bg-[#00e03c] animate-ping' : 'bg-amber-400'}`} />
        <span>{partner.shortName}</span>
        <span className="text-[8px] text-amber-300 font-semibold">
          {partner.isWorking ? '· Estación' : partner.status === 'meeting' ? '· Reunión' : '· En Café'}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL DE LA OFICINA VIRTUAL
// ─────────────────────────────────────────────────────────────────────────────

export default function VirtualOfficeView({
  activeServices = [],
  courses = [],
  timeLogs = [],
  partnerPresences = {},
  currentSocio,
  onNavigateModule
}) {
  const [selectedRoomId, setSelectedRoomId] = useState('direction');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(() => soundEngine.isMuted());
  const [clickEffect, setClickEffect] = useState(null);

  // Time Tracker Flotante (PiP)
  const [timerSeconds, setTimerSeconds] = useState(13320); // 3.7 horas acumuladas por defecto
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPipMinimized, setIsPipMinimized] = useState(false);

  // Posición del avatar del usuario interactivo (Point & Click) en %
  const [userAvatarPos, setUserAvatarPos] = useState({ x: 35, y: 35 });
  const [isWalking, setIsWalking] = useState(false);

  // Estado operativo seleccionado por el socio activo
  const [partnerActiveStatus, setPartnerActiveStatus] = useState(() => {
    try {
      return localStorage.getItem('seram_partner_visual_status') || 'recreation';
    } catch (_) {
      return 'recreation';
    }
  });

  // Ticker de segundos para el cronómetro del Time Tracker
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    const nextRunning = !isTimerRunning;
    setIsTimerRunning(nextRunning);
    soundEngine.playDeskClick();

    if (nextRunning) {
      handleSetPartnerStatus('working');
    } else {
      handleSetPartnerStatus('recreation');
    }
  };

  const handleToggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsSoundMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playDeskClick();
    }
  };

  const handleSetPartnerStatus = (status) => {
    setPartnerActiveStatus(status);
    try {
      localStorage.setItem('seram_partner_visual_status', status);
    } catch (_) {
      // Ignorar si el almacenamiento local está restringido
    }

    if (status === 'recreation' || status === 'commission') {
      soundEngine.playCoffeeBrew();
      setUserAvatarPos({ x: 49, y: 82 });
      setSelectedRoomId('recreation');
      setIsTimerRunning(false);
    } else if (status === 'meeting') {
      soundEngine.playDeskClick();
      setUserAvatarPos({ x: 52, y: 52 });
      setSelectedRoomId('meeting');
    } else if (status === 'working') {
      soundEngine.playDeskClick();
      setUserAvatarPos({ x: 35, y: 35 });
      setSelectedRoomId('direction');
      setIsTimerRunning(true);
    }
  };

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 0.58;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 0.82;
    return 1.0;
  });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const floorStageRef = useRef(null);

  // Habitación activa seleccionada
  const activeRoom = useMemo(() => {
    return OFFICE_ROOMS.find(r => r.id === selectedRoomId) || OFFICE_ROOMS[1];
  }, [selectedRoomId]);

  // Lista de los 3 socios humanos con chalecos SERAM y ubicación dinámica
  const partnerAvatars = useMemo(() => {
    const list = [
      {
        id: 'diego',
        email: 'barrientoso2401@gmail.com',
        name: 'Ing. Diego Barrientos',
        shortName: 'Diego',
        initials: 'DB',
        hairColor: '#2b1d0c',
        homeCoords: { x: 35, y: 35 }
      },
      {
        id: 'fernando',
        email: 'fernandoaraujo1912@gmail.com',
        name: 'Ing. Fernando Araujo',
        shortName: 'Fernando',
        initials: 'FA',
        hairColor: '#1a1a1a',
        homeCoords: { x: 53, y: 17 }
      },
      {
        id: 'fabricio',
        email: 'sebastiansbs51@gmail.com',
        name: 'Ing. Fabricio Orosco',
        shortName: 'Fabricio',
        initials: 'FO',
        hairColor: '#3d2b1f',
        homeCoords: { x: 12, y: 55 }
      }
    ];

    const recreationSpots = [
      { x: 44, y: 81 },
      { x: 49, y: 84 },
      { x: 54, y: 81 }
    ];

    const meetingSpots = [
      { x: 49, y: 50 },
      { x: 52, y: 48 },
      { x: 55, y: 53 }
    ];

    return list.map((partner, idx) => {
      const presence = partnerPresences[partner.email] || {};
      const isOnline = presence.isOnline ?? true;
      const isCurrent = currentSocio?.email === partner.email;

      let status = 'recreation';
      let isWorking = false;

      if (isCurrent) {
        status = partnerActiveStatus;
      } else if (presence.lastWork && (Date.now() - new Date(presence.lastWork.loggedAt).getTime()) < 3600000) {
        status = 'working';
      }

      let coords = recreationSpots[idx % recreationSpots.length];

      if (status === 'meeting') {
        coords = meetingSpots[idx % meetingSpots.length];
      } else if (status === 'working') {
        coords = partner.homeCoords;
        isWorking = true;
      } else if (status === 'commission') {
        coords = recreationSpots[idx % recreationSpots.length];
      } else {
        coords = recreationSpots[idx % recreationSpots.length];
      }

      if (isCurrent && userAvatarPos) {
        coords = userAvatarPos;
      }

      return {
        ...partner,
        isOnline,
        isCurrent,
        status,
        isWorking,
        x: coords.x,
        y: coords.y
      };
    });
  }, [partnerPresences, currentSocio, partnerActiveStatus, userAvatarPos]);

  // Manejador de navegación Point & Click al hacer clic en el suelo de la oficina
  const handleFloorClick = (e) => {
    if (isDragging) return;
    const stageRect = floorStageRef.current?.getBoundingClientRect();
    if (!stageRect) return;

    const clickScreenX = e.clientX - stageRect.left;
    const clickScreenY = e.clientY - stageRect.top;

    const targetX = Math.round((clickScreenX / stageRect.width) * 100);
    const targetY = Math.round((clickScreenY / stageRect.height) * 100);

    soundEngine.playFootstep();
    setClickEffect({ x: targetX, y: targetY, key: Date.now() });

    setIsWalking(true);
    setUserAvatarPos({ x: targetX, y: targetY });

    setTimeout(() => {
      soundEngine.playFootstep(1);
    }, 150);

    setTimeout(() => {
      setIsWalking(false);
    }, 380);

    // Detección de proximidad a alguna de las salas
    const closestRoom = OFFICE_ROOMS.find(r => {
      const dx = r.xPercent - targetX;
      const dy = r.yPercent - targetY;
      return Math.sqrt(dx * dx + dy * dy) < 9;
    });

    if (closestRoom) {
      setSelectedRoomId(closestRoom.id);
      soundEngine.playDeskClick();
    }
  };

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    soundEngine.playDeskClick();

    const room = OFFICE_ROOMS.find(r => r.id === roomId);
    if (room) {
      setUserAvatarPos({ x: room.xPercent, y: room.yPercent });
    }
  };

  const handleOpenModule = (targetModule) => {
    soundEngine.playModuleOpen();
    if (onNavigateModule) {
      onNavigateModule(targetModule || 'services');
    }
  };

  // Controles de ratón y arrastre (Pan)
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    setIsDragging(false);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (e.buttons !== 1) return;
    setIsDragging(true);
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(0.45, prev + delta), 2.2));
  };

  const handleResetView = () => {
    setZoomLevel(typeof window !== 'undefined' && window.innerWidth < 640 ? 0.58 : 1.0);
    setPanOffset({ x: 0, y: 0 });
    soundEngine.playDeskClick();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    soundEngine.playDeskClick();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: MAQUETA ISOMÉTRICA 2.5D REAL CON PARQUET CÁLIDO E ILUMINACIÓN NATURAL
  // ─────────────────────────────────────────────────────────────────────────────
  const renderOfficeCanvas = (isFullMode) => (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full overflow-hidden bg-[#e5dfd8] cursor-crosshair select-none"
    >
      {/* Escenario Isométrico Escalable con Zoom & Pan */}
      <div
        ref={floorStageRef}
        onClick={handleFloorClick}
        className="absolute origin-center transition-transform duration-75 will-change-transform"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          left: '50%',
          top: '50%',
          marginLeft: '-600px',
          marginTop: '-338px',
          width: '1200px',
          height: '675px'
        }}
      >
        {/* ILUSTRACIÓN ARQUITECTÓNICA ISOMÉTRICA HD (PARQUET CÁLIDO Y MAMPARAS 3D) */}
        <img
          src={officeHdImage}
          alt="Oficina Virtual Isométrica SERAM"
          className="w-full h-full object-cover rounded-2xl shadow-2xl pointer-events-none select-none"
          draggable={false}
        />

        {/* ── 13 SALAS INTERACTIVAS CON PINS LUMINOSOS Y NOMBRES ── */}
        {OFFICE_ROOMS.map((room) => {
          const isSelected = selectedRoomId === room.id;
          return (
            <div
              key={room.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRoom(room.id);
              }}
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group no-drag"
              style={{
                left: `${room.xPercent}%`,
                top: `${room.yPercent}%`
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Pin de Interacción Isométrica */}
                <div className={`relative flex items-center justify-center transition-transform duration-300 ${
                  isSelected ? 'scale-125' : 'group-hover:scale-110'
                }`}>
                  <span className={`absolute inline-flex h-10 w-10 rounded-full transition-all duration-300 ${
                    isSelected ? 'bg-amber-400/50 animate-ping' : 'bg-emerald-500/20 group-hover:bg-amber-400/30'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center border-2 shadow-2xl ${
                    isSelected
                      ? 'bg-amber-400 border-white text-slate-950 font-black'
                      : 'bg-slate-900/90 border-amber-400 text-amber-300'
                  }`}>
                    <span className="text-[10px] font-black">{room.number}</span>
                  </span>
                </div>

                {/* Letrero Flotante Elegante */}
                <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-tight whitespace-nowrap shadow-xl flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-white scale-110'
                    : 'bg-slate-950/90 text-white border border-white/20 group-hover:border-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-400'}`} />
                  <span>{room.name}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── AVATARES HUMANOS DE LOS 3 SOCIOS CON CHALECO SERAM ── */}
        {partnerAvatars.map((partner) => (
          <div
            key={partner.id}
            className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: `${partner.x}%`,
              top: `${partner.y}%`
            }}
          >
            <HumanPartnerSprite partner={partner} isWalking={isWalking && partner.isCurrent} />
          </div>
        ))}

        {/* ── EFECTO DE ONDA EXPANSIVA AL HACER CLIC EN EL SUELO (RIPPLE) ── */}
        {clickEffect && (
          <div
            key={clickEffect.key}
            className="absolute z-25 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${clickEffect.x}%`,
              top: `${clickEffect.y}%`
            }}
          >
            <span className="inline-block w-8 h-8 rounded-full border-2 border-amber-400 animate-ping opacity-75" />
          </div>
        )}
      </div>

      {/* ── MINI-RELOJ FLOTANTE PICTURE-IN-PICTURE (TIME TRACKER) ── */}
      <div className="absolute top-4 left-4 z-40 bg-slate-950/90 border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 backdrop-blur-xl shadow-2xl text-left no-drag max-w-xs transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e03c] animate-pulse" />
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">Time Tracker Live</span>
          </div>

          <button
            onClick={() => setIsPipMinimized(p => !p)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            title={isPipMinimized ? 'Expandir reloj' : 'Minimizar'}
          >
            {isPipMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!isPipMinimized && (
          <div className="mt-2 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">
                {((timerSeconds / 3600) / 4.5 * 100).toFixed(0)}% de 4.5h
              </span>
            </div>

            {/* Barra de progreso hacia la meta diaria de 4.5h */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-[#00e03c] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((timerSeconds / 3600) / 4.5) * 100)}%` }}
              />
            </div>

            {/* Botón rápido Play / Pause */}
            <button
              onClick={handleToggleTimer}
              className={`w-full py-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isTimerRunning
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-[#00e03c] hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isTimerRunning ? 'Pausar Jornada (Ir a Café)' : 'Iniciar Sesión (Ir a Estación)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── CONTROLES FLOTANTES HUD (INFERIOR DERECHA) ── */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-black/80 border border-white/15 rounded-2xl p-1.5 backdrop-blur-md shadow-2xl text-xs text-white no-drag">
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-xl transition-colors ${
            isSoundMuted ? 'text-slate-500 hover:text-slate-300' : 'text-amber-400 hover:bg-amber-400/20'
          }`}
          title={isSoundMuted ? 'Activar efectos de sonido' : 'Silenciar sonido'}
        >
          {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-5 bg-white/15 mx-0.5" />

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

        <div className="w-[1px] h-5 bg-white/15 mx-0.5" />

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

      {/* Rótulo de guía interactiva Point & Click */}
      <div className="absolute bottom-4 left-4 z-30 hidden sm:flex items-center gap-2 bg-black/75 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm text-[11px] text-slate-300 pointer-events-none">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span>Haz clic en el suelo para caminar · Toca cualquier oficina para abrir su módulo</span>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: DRAWER INFERIOR TIPO 'FÁBRICA VIVA' (BOT & MÓDULO OPERATIVO)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderRoomDrawer = () => (
    <AnimatePresence>
      {activeRoom && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          className="bg-[#18110b]/98 border-t border-amber-500/25 backdrop-blur-2xl p-4 sm:p-5 z-30 text-left"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl shrink-0 shadow-xl"
                style={{
                  backgroundColor: `${activeRoom.color}15`,
                  borderColor: `${activeRoom.color}40`,
                  color: activeRoom.color
                }}
              >
                {activeRoom.bot?.avatar || <Building2 className="w-6 h-6" />}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-white/5 border-white/15 text-slate-300 font-mono">
                    SALA {activeRoom.number}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {activeRoom.name}
                  </h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${activeRoom.color}20`,
                      borderColor: `${activeRoom.color}50`,
                      color: activeRoom.color
                    }}
                  >
                    {activeRoom.wing}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium line-clamp-1">
                  <span className="text-amber-400 font-bold">Subagente / Bot:</span>{' '}
                  {activeRoom.bot ? `${activeRoom.bot.name} — ${activeRoom.bot.status}` : activeRoom.subtitle}
                </p>

                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {activeRoom.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {activeRoom.isRecreationRoom && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                  <Coffee className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Horas en pausa · Zona de café y descanso</span>
                </div>
              )}

              <button
                onClick={() => handleOpenModule(activeRoom.targetModule)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95"
              >
                <span>Abrir Módulo ({activeRoom.name})</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="w-full rounded-2xl border border-amber-500/25 bg-[#120d09] shadow-2xl overflow-hidden text-left relative">
      {/* ── HEADER SUPERIOR HUD ── */}
      <div className="bg-black/50 border-b border-white/[0.08] backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Oficina Virtual SERAM
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  2.5D Isométrica · Fábrica Viva
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">
              Piso de parquet, iluminación cálida y navegación Point & Click para los 3 socios y subagentes IA
            </p>
          </div>
        </div>

        {/* Selector Rápido de Estado del Socio Activo */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 gap-1">
            <span className="text-[10px] font-bold text-slate-400 px-2 hidden sm:inline">Mi Estado:</span>
            <button
              onClick={() => handleSetPartnerStatus('working')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                partnerActiveStatus === 'working' ? 'bg-[#00e03c] text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="Avatar en mi estación técnica trabajando"
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
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/25 ml-auto lg:ml-0 active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pantalla Completa</span>
          </button>
        </div>
      </div>

      {/* ── SELECTOR DE SALAS / PESTAÑAS (13 DESPACHOS DEL BOCETO) ── */}
      <div className="bg-black/40 border-b border-white/[0.06] px-4 py-2 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
        {OFFICE_ROOMS.map(room => (
          <button
            key={room.id}
            onClick={() => handleSelectRoom(room.id)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedRoomId === room.id
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-md'
                : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }`}
          >
            <span className="text-[10px] opacity-75 font-mono">{room.number}</span>
            <span>{room.name}</span>
          </button>
        ))}
      </div>

      {/* ── LIENZO ISOMÉTRICO EMBEBIDO ── */}
      <div className="relative w-full h-[520px] sm:h-[640px] lg:h-[720px] overflow-hidden">
        {renderOfficeCanvas(false)}
      </div>

      {/* ── INSPECTOR INFERIOR TIPO FÁBRICA VIVA ── */}
      {renderRoomDrawer()}

      {/* ── OVERLAY PANTALLA COMPLETA (REACT PORTAL) ── */}
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
          <div className="bg-[#18110b]/95 border-b border-white/15 px-4 py-2.5 flex items-center justify-between gap-2 z-30 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-white">Oficina Virtual SERAM SRL</span>
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

          {/* Lienzo en Pantalla Completa */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            {renderOfficeCanvas(true)}
          </div>

          {/* Drawer Inferior */}
          {renderRoomDrawer()}
        </div>,
        document.body
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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

// ─────────────────────────────────────────────────────────────────────────────
// DATA: 13 OFICINAS INDEPENDIENTES SEGÚN EL BOCETO A MANO ALZADA + TOTEM
// ─────────────────────────────────────────────────────────────────────────────

export const OFFICE_ROOMS = [
  // ── ALA DERECHA (Columna Derecha del Boceto) ──
  {
    id: 'admin',
    number: '01',
    name: 'ADMINISTRACIÓN',
    subtitle: 'Gestión de Socios, Roles & Gobierno',
    wing: 'Ala Ejecutiva',
    targetModule: 'users',
    color: '#3b82f6',
    x: 820,
    y: 80,
    w: 320,
    h: 180,
    doorX: 820,
    doorY: 170,
    lead: 'Gerencia Administrativa',
    role: 'Gobierno Corporativo',
    desk: { x: 980, y: 170 },
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
    x: 820,
    y: 280,
    w: 320,
    h: 190,
    doorX: 820,
    doorY: 375,
    lead: 'Ing. Diego Barrientos',
    role: 'Socio Fundador · Dirección General',
    leadInitials: 'DB',
    leadColor: 'from-amber-400 to-yellow-600',
    desk: { x: 980, y: 375 },
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
    x: 820,
    y: 490,
    w: 320,
    h: 190,
    doorX: 820,
    doorY: 585,
    lead: 'Ing. Fernando Araujo',
    role: 'Socio Directivo · Hidráulica & Obras',
    leadInitials: 'FA',
    leadColor: 'from-blue-500 to-indigo-600',
    desk: { x: 980, y: 585 },
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
    x: 820,
    y: 700,
    w: 320,
    h: 180,
    doorX: 820,
    doorY: 790,
    lead: 'Gerencia Comercial B2B',
    role: 'Captación & SICOES',
    desk: { x: 980, y: 790 },
    bot: {
      name: 'Bot Licitaciones SICOES',
      role: 'Monitoreo de Contrataciones Estatales',
      avatar: '💼',
      status: 'Escaneando DBCs mineros y agua'
    },
    description: 'Oficina comercial y licitaciones: seguimiento al SICOES, preparación de sobres A/B y prospección en la base de 150 empresas industriales.',
    metrics: '8 licitaciones monitoreadas hoy'
  },

  // ── COLUMNA CENTRAL (Centro del Boceto) ──
  {
    id: 'service',
    number: '07',
    name: 'SERVICE',
    subtitle: 'Catálogo de Consultoría Ambiental & SIG',
    wing: 'Núcleo Central',
    targetModule: 'services',
    color: '#059669',
    x: 480,
    y: 80,
    w: 310,
    h: 230,
    doorX: 635,
    doorY: 310,
    lead: 'Equipo Técnico Central',
    role: 'Servicios Ambientales',
    desk: { x: 635, y: 195 },
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
    x: 480,
    y: 330,
    w: 310,
    h: 240,
    doorX: 635,
    doorY: 570,
    lead: 'Equipo de Crecimiento',
    role: 'Growth & Alianzas',
    desk: { x: 635, y: 450 },
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
    x: 480,
    y: 590,
    w: 310,
    h: 290,
    doorX: 635,
    doorY: 590,
    lead: 'Gobernanza Financiera',
    role: 'Bóveda & Distribución',
    desk: { x: 635, y: 735 },
    bot: {
      name: 'Bot Auditor Contable',
      role: 'Cálculo de Retenciones & Dividendos',
      avatar: '⚖️',
      status: 'Regla: Quien trabaja más gana más'
    },
    description: 'Bóveda y control financiero de SERAM: liquidación del fondo de socios por horas efectivas (Time Tracker), retenciones de ley y flujo de caja.',
    metrics: 'Fondo de Socios: Bs. 35,000'
  },

  // ── ALA IZQUIERDA (Columna Izquierda del Boceto) ──
  {
    id: 'meeting',
    number: '08',
    name: 'SALA DE REUNIONES',
    subtitle: 'Mesa de Directorio & Juntas Plenarias',
    wing: 'Ala Colaborativa',
    targetModule: 'overview',
    color: '#d97706',
    x: 60,
    y: 80,
    w: 390,
    h: 210,
    doorX: 450,
    doorY: 185,
    lead: 'Directorio Plenario',
    role: 'Asamblea de Socios',
    isMeetingRoom: true,
    desk: { x: 255, y: 185 },
    bot: {
      name: 'Bot Minutas & Acuerdos',
      role: 'Secretaría de Directorio',
      avatar: '🏛️',
      status: 'Sala disponible para deliberación'
    },
    description: 'Sala de juntas equipada con mesa de directorio y proyector interactivo para asambleas de socios, presentación de balances y toma de acuerdos.',
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
    x: 60,
    y: 310,
    w: 390,
    h: 200,
    doorX: 450,
    doorY: 410,
    lead: 'Zona de Pausa & Diligencias',
    role: 'Descanso / Horas Detenidas',
    isRecreationRoom: true,
    desk: { x: 255, y: 410 },
    bot: {
      name: 'Barista Espresso Bar',
      role: 'Cafetería & Refrigerios',
      avatar: '☕',
      status: 'Cafetera expreso activa'
    },
    description: 'Espacio de descanso y sofás. Cuando un socio no tiene una tarea activa en el Time Tracker o está en trámites/comisión externa, su avatar descansa aquí. En esta sala NO se contabilizan horas.',
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
    x: 60,
    y: 530,
    w: 200,
    h: 170,
    doorX: 260,
    doorY: 615,
    lead: 'SERAM Campus Virtual',
    role: 'Educación & Certificados',
    desk: { x: 160, y: 615 },
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
    x: 280,
    y: 530,
    w: 170,
    h: 170,
    doorX: 280,
    doorY: 615,
    lead: 'Ing. Fabricio Orosco',
    role: 'Socio Directivo · Calidad & Expansión',
    leadInitials: 'FO',
    leadColor: 'from-emerald-500 to-teal-700',
    desk: { x: 365, y: 615 },
    bot: {
      name: 'Bot Drones & Ortomosaicos',
      role: 'Fotogrametría & Nubes de Puntos',
      avatar: '🚁',
      status: 'Procesando ortomosaico LiDAR'
    },
    description: 'Despacho doble del Ing. Fabricio Orosco: planificación de expediciones científicas, vuelos fotogramétricos con drones y turismo de alta montaña.',
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
    x: 60,
    y: 720,
    w: 200,
    h: 160,
    doorX: 260,
    doorY: 800,
    lead: 'Estudio de Contenido',
    role: 'Difusión & Divulgación',
    desk: { x: 160, y: 800 },
    bot: {
      name: 'Bot Multimedia & Reels',
      role: 'Generador de Guiones & Clips',
      avatar: '🎬',
      status: 'Editando cápsula de minería aurífera'
    },
    description: 'Producción audiovisual técnica, divulgación en redes sociales, podcasts periciales y posicionamiento de marca de SERAM.',
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
    x: 280,
    y: 720,
    w: 170,
    h: 160,
    doorX: 280,
    doorY: 800,
    lead: 'Laboratorio Pericial',
    role: 'I+D Ambiental',
    desk: { x: 365, y: 800 },
    bot: {
      name: 'Bot Espectrometría Mercurio',
      role: 'Análisis Pericial Ley 1333',
      avatar: '🔬',
      status: 'Curva de calibración Hg lista'
    },
    description: 'Laboratorio de investigación científica aplicada: pruebas analíticas de mercurio en sedimentos y agua, y desarrollo de nuevos sensores.',
    metrics: 'Muestreo pericial estandarizado EPA'
  }
];

// Totem Central de Pasillo
export const TOTEM_STATION = {
  id: 'totem',
  name: 'TOTEM TIME TRACKER',
  subtitle: 'Reloj Holográfico Central & Cómputo de Horas',
  x: 635,
  y: 450,
  targetModule: 'timetracker',
  description: 'Terminal central de pasillo. Inicia y pausa el cronómetro de trabajo en un toque desde cualquier rincón de la oficina.'
};

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
  const [activePartnerFilter, setActivePartnerFilter] = useState('all');

  // Posición del avatar del usuario interactivo (Point & Click)
  const [userAvatarPos, setUserAvatarPos] = useState({ x: 980, y: 375 });
  const [isWalking, setIsWalking] = useState(false);

  // Estado operativo seleccionado por el socio activo ('working', 'recreation', 'commission', 'meeting')
  const [partnerActiveStatus, setPartnerActiveStatus] = useState(() => {
    try {
      return localStorage.getItem('seram_partner_visual_status') || 'recreation';
    } catch (_) {
      return 'recreation';
    }
  });

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
      setUserAvatarPos({ x: 255, y: 410 });
      setSelectedRoomId('recreation');
    } else if (status === 'meeting') {
      soundEngine.playDeskClick();
      setUserAvatarPos({ x: 255, y: 185 });
      setSelectedRoomId('meeting');
    } else if (status === 'working') {
      soundEngine.playDeskClick();
      setUserAvatarPos({ x: 980, y: 375 });
      setSelectedRoomId('direction');
    }
  };

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 0.55;
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 0.78;
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

  // Lista de los 3 socios humanos con su ubicación dinámica en las oficinas
  const partnerAvatars = useMemo(() => {
    const list = [
      {
        id: 'diego',
        email: 'barrientoso2401@gmail.com',
        name: 'Ing. Diego Barrientos',
        shortName: 'Diego',
        initials: 'DB',
        avatarBg: 'from-amber-400 to-yellow-600',
        homeRoomId: 'direction',
        homeCoords: { x: 980, y: 375 }
      },
      {
        id: 'fernando',
        email: 'fernandoaraujo1912@gmail.com',
        name: 'Ing. Fernando Araujo',
        shortName: 'Fernando',
        initials: 'FA',
        avatarBg: 'from-blue-500 to-indigo-600',
        homeRoomId: 'operations',
        homeCoords: { x: 980, y: 585 }
      },
      {
        id: 'fabricio',
        email: 'sebastiansbs51@gmail.com',
        name: 'Ing. Fabricio Orosco',
        shortName: 'Fabricio',
        initials: 'FO',
        avatarBg: 'from-emerald-500 to-teal-700',
        homeRoomId: 'experience',
        homeCoords: { x: 365, y: 615 }
      }
    ];

    const recreationSpots = [
      { x: 210, y: 380, label: 'En Sofá Lounge' },
      { x: 300, y: 440, label: 'En Mesa Café' },
      { x: 260, y: 370, label: 'Tomando Café' }
    ];

    const meetingSpots = [
      { x: 210, y: 185, label: 'Mesa Directorio' },
      { x: 260, y: 165, label: 'Mesa Directorio' },
      { x: 310, y: 185, label: 'Mesa Directorio' }
    ];

    return list.map((partner, idx) => {
      const presence = partnerPresences[partner.email] || {};
      const isOnline = presence.isOnline ?? true;
      const isCurrent = currentSocio?.email === partner.email;

      let status = 'recreation';
      let statusLabel = 'En Sala Recreativa (Sin cómputo de horas)';
      let isWorking = false;

      if (isCurrent) {
        status = partnerActiveStatus;
      } else if (presence.lastWork && (Date.now() - new Date(presence.lastWork.loggedAt).getTime()) < 3600000) {
        status = 'working';
      }

      let coords = recreationSpots[idx % recreationSpots.length];

      if (status === 'meeting') {
        coords = meetingSpots[idx % meetingSpots.length];
        statusLabel = 'En Reunión de Directorio';
      } else if (status === 'working') {
        coords = partner.homeCoords;
        statusLabel = 'En Estación Técnica (Horas Computándose)';
        isWorking = true;
      } else if (status === 'commission') {
        coords = recreationSpots[idx % recreationSpots.length];
        statusLabel = 'De Comisión / Trámites Externos';
      } else {
        coords = recreationSpots[idx % recreationSpots.length];
        statusLabel = 'En Sala Recreativa (En Pausa / Café)';
      }

      // Si es el usuario actual, usamos su posición Point & Click interactiva
      if (isCurrent && userAvatarPos) {
        coords = userAvatarPos;
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
  }, [partnerPresences, currentSocio, partnerActiveStatus, userAvatarPos]);

  // Manejador de navegación Point & Click al hacer clic en el suelo de la oficina
  const handleFloorClick = (e) => {
    if (isDragging) return;
    const stageRect = floorStageRef.current?.getBoundingClientRect();
    if (!stageRect) return;

    const clickScreenX = e.clientX - stageRect.left;
    const clickScreenY = e.clientY - stageRect.top;

    // Convertir de pixeles pantalla a coordenadas de plano (1200 x 920)
    const targetX = Math.round((clickScreenX / stageRect.width) * 1200);
    const targetY = Math.round((clickScreenY / stageRect.height) * 920);

    // Reproducir paso de audio y efecto visual
    soundEngine.playFootstep();
    setClickEffect({ x: targetX, y: targetY, key: Date.now() });

    setIsWalking(true);
    setUserAvatarPos({ x: targetX, y: targetY });

    setTimeout(() => {
      soundEngine.playFootstep(1);
    }, 150);

    setTimeout(() => {
      setIsWalking(false);
    }, 400);

    // Comprobar si el clic cayó dentro de alguna de las 13 habitaciones
    const hitRoom = OFFICE_ROOMS.find(r => (
      targetX >= r.x && targetX <= r.x + r.w &&
      targetY >= r.y && targetY <= r.y + r.h
    ));

    if (hitRoom) {
      setSelectedRoomId(hitRoom.id);
      soundEngine.playDeskClick();
    }
  };

  // Seleccionar habitación desde el menú o al hacer clic en su escritorio
  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    soundEngine.playDeskClick();

    const room = OFFICE_ROOMS.find(r => r.id === roomId);
    if (room && room.desk) {
      setUserAvatarPos({ x: room.desk.x, y: room.desk.y });
    }
  };

  // Abrir módulo respectivo con sonido armónico
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
    setZoomLevel(typeof window !== 'undefined' && window.innerWidth < 640 ? 0.55 : 0.95);
    setPanOffset({ x: 0, y: 0 });
    soundEngine.playDeskClick();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    soundEngine.playDeskClick();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: MAQUETA ARQUITECTÓNICA ISOMÉTRICA 2.5D VECTORIAL (13 DESPACHOS)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderOfficeCanvas = (isFullMode) => (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full overflow-hidden bg-[#0e0a07] cursor-crosshair select-none"
    >
      {/* Viñeta cálida ambiental */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/15 via-[#120d09]/80 to-[#070503] pointer-events-none z-10" />

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
          marginTop: '-460px',
          width: '1200px',
          height: '920px'
        }}
      >
        {/* ── PLANO ARQUITECTÓNICO SVG DE ALTA FIDELIDAD ── */}
        <svg
          viewBox="0 0 1200 920"
          className="w-full h-full shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
          style={{ background: '#120d09' }}
        >
          <defs>
            {/* Patrón de losas de piso porcelanato oscuro */}
            <pattern id="floorTiles" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#17110b" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>

            {/* Patrón de alfombra para salas ejecutivas */}
            <pattern id="carpetPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#1c140d" />
              <circle cx="10" cy="10" r="1.5" fill="rgba(201,168,76,0.08)" />
            </pattern>

            {/* Iluminación de techos y neón */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Piso base general de la oficina */}
          <rect width="1200" height="920" fill="url(#floorTiles)" />

          {/* Pasillos principales con alfombra de tránsito corporativa */}
          <rect x="445" y="60" width="40" height="820" fill="#1f160e" stroke="rgba(201,168,76,0.15)" strokeWidth="1" />
          <rect x="790" y="60" width="30" height="820" fill="#1f160e" stroke="rgba(201,168,76,0.15)" strokeWidth="1" />
          <rect x="60" y="510" width="1080" height="20" fill="#1f160e" stroke="rgba(201,168,76,0.1)" strokeWidth="1" />

          {/* ── 13 DESPACHOS CON PAREDES, MAMPARAS Y MOBILIARIO ── */}
          {OFFICE_ROOMS.map((room) => {
            const isSelected = selectedRoomId === room.id;
            return (
              <g
                key={room.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRoom(room.id);
                }}
                className="cursor-pointer group"
              >
                {/* Piso del despacho */}
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.w}
                  height={room.h}
                  rx="10"
                  fill="url(#carpetPattern)"
                  stroke={isSelected ? room.color : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isSelected ? '2.5' : '1'}
                  className="transition-all duration-300"
                />

                {/* Resplandor interior al estar seleccionada */}
                {isSelected && (
                  <rect
                    x={room.x + 3}
                    y={room.y + 3}
                    width={room.w - 6}
                    height={room.h - 6}
                    rx="8"
                    fill={room.color}
                    fillOpacity="0.08"
                    stroke={room.color}
                    strokeWidth="1"
                  />
                )}

                {/* Paredes de cristal ahumado / Mamparas */}
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.w}
                  height="12"
                  fill="#2a1e14"
                  stroke="rgba(255,255,255,0.12)"
                />
                <rect
                  x={room.x}
                  y={room.y}
                  width="10"
                  height={room.h}
                  fill="#2a1e14"
                  stroke="rgba(255,255,255,0.12)"
                />
                <rect
                  x={room.x + room.w - 10}
                  y={room.y}
                  width="10"
                  height={room.h}
                  fill="#2a1e14"
                  stroke="rgba(255,255,255,0.12)"
                />
                <rect
                  x={room.x}
                  y={room.y + room.h - 10}
                  width={room.w}
                  height="10"
                  fill="#2a1e14"
                  stroke="rgba(255,255,255,0.12)"
                />

                {/* Puerta / Abertura de acceso */}
                <circle
                  cx={room.doorX}
                  cy={room.doorY}
                  r="7"
                  fill={isSelected ? '#00e03c' : 'rgba(255,255,255,0.2)'}
                  stroke="#120d09"
                  strokeWidth="2"
                />

                {/* Mobiliario específico según el tipo de sala */}
                {room.isMeetingRoom ? (
                  /* Mesa de Directorio Ovalada */
                  <g>
                    <ellipse cx={room.desk.x} cy={room.desk.y} rx="90" ry="45" fill="#382516" stroke="rgba(201,168,76,0.3)" strokeWidth="2" />
                    <ellipse cx={room.desk.x} cy={room.desk.y} rx="70" ry="30" fill="#24170d" />
                    <text x={room.desk.x} y={room.desk.y + 4} textAnchor="middle" fill="#c9a84c" fontSize="10" fontWeight="900" letterSpacing="1">MESA DE DIRECTORIO</text>
                  </g>
                ) : room.isRecreationRoom ? (
                  /* Barra de Café y Sofás Lounge */
                  <g>
                    {/* Barra de Café */}
                    <rect x={room.x + 30} y={room.y + 30} width="120" height="28" rx="6" fill="#2e1f13" stroke="#c9a84c" strokeWidth="1" />
                    <text x={room.x + 90} y={room.y + 48} textAnchor="middle" fill="#c9a84c" fontSize="10" fontWeight="bold">BARRA DE CAFÉ ☕</text>
                    {/* Sofás Lounge */}
                    <rect x={room.desk.x - 70} y={room.desk.y - 20} width="140" height="42" rx="8" fill="#132a1e" stroke="#10b981" strokeWidth="1" />
                    <text x={room.desk.x} y={room.desk.y + 5} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">LOUNGE DE DESCANSO</text>
                  </g>
                ) : (
                  /* Escritorio Ejecutivo con Computadoras */
                  <g>
                    <rect x={room.desk.x - 45} y={room.desk.y - 18} width="90" height="36" rx="5" fill="#2c1e13" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                    {/* Monitor de computadora encendido */}
                    <rect x={room.desk.x - 20} y={room.desk.y - 14} width="40" height="12" rx="2" fill="#0f172a" stroke={room.color} strokeWidth="1" />
                    <rect x={room.desk.x - 16} y={room.desk.y - 12} width="32" height="8" fill={room.color} fillOpacity="0.4" />
                    {/* Silla ergonómica */}
                    <circle cx={room.desk.x} cy={room.desk.y + 24} r="10" fill="#1e140d" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  </g>
                )}

                {/* Letrero Luminoso Superior con Nombre de la Sala (Estilo Fábrica Viva) */}
                <g>
                  <rect
                    x={room.x + 16}
                    y={room.y + 14}
                    width={room.w - 32}
                    height="24"
                    rx="5"
                    fill="#150f0b"
                    stroke={isSelected ? room.color : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isSelected ? '2' : '1'}
                  />
                  <text
                    x={room.x + 26}
                    y={room.y + 30}
                    fill={isSelected ? '#ffffff' : '#e2e8f0'}
                    fontSize="11"
                    fontWeight="900"
                    letterSpacing="0.5"
                  >
                    {room.number}. {room.name}
                  </text>
                  {/* Badge de área / estado */}
                  <circle
                    cx={room.x + room.w - 30}
                    cy={room.y + 26}
                    r="4"
                    fill={isSelected ? '#00e03c' : room.color}
                  />
                </g>
              </g>
            );
          })}

          {/* ── TOTEM CENTRAL INTERACTIVO (TIME TRACKER) EN EL PASILLO ── */}
          <g
            onClick={(e) => {
              e.stopPropagation();
              handleSelectRoom('recreation');
              soundEngine.playDeskClick();
            }}
            className="cursor-pointer group"
          >
            <circle cx={TOTEM_STATION.x} cy={TOTEM_STATION.y} r="28" fill="#1a120c" stroke="#c9a84c" strokeWidth="2" filter="url(#neonGlow)" />
            <circle cx={TOTEM_STATION.x} cy={TOTEM_STATION.y} r="20" fill="#2a1d12" />
            <text x={TOTEM_STATION.x} y={TOTEM_STATION.y - 2} textAnchor="middle" fill="#00e03c" fontSize="10" fontWeight="900" fontFamily="monospace">4.5h</text>
            <text x={TOTEM_STATION.x} y={TOTEM_STATION.y + 9} textAnchor="middle" fill="#c9a84c" fontSize="7" fontWeight="bold">TRACKER</text>
          </g>

          {/* ── EFECTO VISUAL AL HACER CLIC EN EL SUELO (POINT & CLICK RIPPLE) ── */}
          {clickEffect && (
            <g key={clickEffect.key}>
              <circle
                cx={clickEffect.x}
                cy={clickEffect.y}
                r="16"
                fill="none"
                stroke="#c9a84c"
                strokeWidth="2"
                opacity="0.8"
                className="animate-ping"
              />
              <circle
                cx={clickEffect.x}
                cy={clickEffect.y}
                r="4"
                fill="#c9a84c"
              />
            </g>
          )}
        </svg>

        {/* ── SUBAGENTES IA EN LOS ESCRITORIOS CON INSIGNIAS FLOTANTES ── */}
        {OFFICE_ROOMS.map((room) => {
          if (!room.bot || room.isMeetingRoom || room.isRecreationRoom) return null;
          return (
            <div
              key={`bot-${room.id}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRoom(room.id);
              }}
              className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group no-drag"
              style={{
                left: `${(room.desk.x / 1200) * 100}%`,
                top: `${(room.desk.y / 920) * 100}%`
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Bot Avatar Bubble */}
                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400/80 shadow-xl flex items-center justify-center text-sm transform group-hover:scale-110 transition-transform">
                  <span>{room.bot.avatar}</span>
                </div>
                {/* Insignia Flotante con Nombre del Bot (Estilo Fábrica Viva) */}
                <div className="mt-1 px-2 py-0.5 rounded-full bg-black/90 border border-white/20 text-[9px] font-bold text-slate-200 shadow-md whitespace-nowrap flex items-center gap-1 group-hover:border-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{room.bot.name}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── AVATARES DE SOCIOS HUMANOS CON NAVEGACIÓN EN TIEMPO REAL ── */}
        {partnerAvatars.map((partner) => (
          <div
            key={partner.id}
            className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out ${
              isWalking && partner.isCurrent ? 'scale-110' : ''
            }`}
            style={{
              left: `${(partner.x / 1200) * 100}%`,
              top: `${(partner.y / 920) * 100}%`
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Halo de Presencia */}
              <span className={`absolute -inset-1.5 rounded-full blur-sm opacity-80 ${
                partner.isWorking ? 'bg-[#00e03c] animate-pulse' : 'bg-amber-400'
              }`} />

              {/* Avatar Bubble */}
              <div className={`relative w-9 h-9 rounded-full border-2 border-white shadow-2xl flex items-center justify-center font-black text-xs text-white bg-gradient-to-br ${partner.avatarBg}`}>
                {partner.initials}
              </div>

              {/* Name Tag con Estado Operativo */}
              <div className="mt-1 px-2.5 py-0.5 rounded-md bg-black/90 border border-white/25 text-[9px] font-bold text-white shadow-xl whitespace-nowrap flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${partner.isWorking ? 'bg-[#00e03c] animate-ping' : 'bg-amber-400'}`} />
                <span>{partner.shortName}</span>
                <span className="text-[8px] text-slate-400 font-normal">
                  {partner.isWorking ? '· Estación' : partner.status === 'meeting' ? '· Reunión' : '· En Café'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTROLES FLOTANTES HUD (INFERIOR DERECHA) ── */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-black/80 border border-white/15 rounded-2xl p-1.5 backdrop-blur-md shadow-2xl text-xs text-white no-drag">
        {/* Interruptor de Efectos de Sonido */}
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
      <div className="absolute bottom-4 left-4 z-30 hidden sm:flex items-center gap-2 bg-black/70 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-sm text-[11px] text-slate-300 pointer-events-none">
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
            {/* Tarjeta de Identidad de la Sala o Bot */}
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

            {/* Acciones y Botón de Salto Contextual */}
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
                  13 Despachos · Fábrica Viva
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">
              Haz clic en el suelo para mover tu avatar Point & Click o selecciona una oficina para desplegar su módulo
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

      {/* ── LIENZO EMBEBIDO ── */}
      <div className="relative w-full h-[520px] sm:h-[640px] lg:h-[720px] overflow-hidden">
        {renderOfficeCanvas(false)}
      </div>

      {/* ── INSPECTOR INFERIOR TIPO FÁBRICA VIVA ── */}
      {renderRoomDrawer()}

      {/* ── OVERLAY PANTALLA COMPLETA (REACT PORTAL) ── */}
      {isFullscreen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999999] w-screen h-[100dvh] bg-[#0e0a07] flex flex-col overflow-hidden select-none text-left"
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
                13 Despachos Isométricos
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

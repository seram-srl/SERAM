import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Check, Star, Zap, Target, Calendar, Clock,
  Shield, Award, Sparkles, ChevronRight, X, AlertCircle,
  FileCheck, Compass, CheckCircle2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

// ── 6 RAMAS PRINCIPALES DEL ÁRBOL DE TALENTOS RADIAL ───────────────────────
export const TALENT_BRANCHES = [
  {
    id: 'sig',
    angleDeg: -90, // 12 en punto (Top)
    name: 'SIG & Teledetección',
    shortName: 'SIG',
    color: '#00e03c', // Verde Esmeralda SERAM
    glowColor: 'rgba(0, 224, 60, 0.4)',
    icon: '🛰️',
    description: 'Cartografía satelital, teledetección de relaves y modelos geoespaciales.',
    nodes: [
      {
        id: 'sig_1',
        level: 1,
        title: 'Cartografía Base & QGIS',
        desc: 'Generación de mapas vectoriales, proyecciones WGS84 y bases cartográficas oficiales.',
        mission: 'Aprobación del primer entregable cartográfico o CV SIG cargado.',
        xpReward: 250,
        unlockedFor: ['barrientoso2401@gmail.com', 'fernandoaraujo1912@gmail.com'],
      },
      {
        id: 'sig_2',
        level: 2,
        title: 'Modelación Hidrológica & Relaves',
        desc: 'Análisis de cuencas en ArcGIS Pro, flujo de contaminantes y cuencas de drenaje ácido.',
        mission: 'Haber concluido 3 tareas periciales SIG y acumulado 1,500 XP.',
        xpReward: 500,
        unlockedFor: ['barrientoso2401@gmail.com'],
      },
      {
        id: 'sig_3a',
        level: 3,
        fork: 'A',
        title: 'Teledetección Satelital Sentinel-2',
        desc: 'Procesamiento de índices espectrales NDVI, NDWI y monitoreo multitemporal de desmontes.',
        mission: 'Liderar una propuesta municipal o informe pericial de monitoreo satelital.',
        xpReward: 800,
        unlockedFor: [],
      },
      {
        id: 'sig_3b',
        level: 3,
        fork: 'B',
        title: 'Geodatabases & Infraestructura IDE',
        desc: 'Publicación de capas geográficas en servidores de mapas interoperables y GeoTIFF.',
        mission: 'Alcanzar el Rango de Consultor Perito Senior (Nivel 3 RPG).',
        xpReward: 800,
        unlockedFor: [],
      },
    ],
  },
  {
    id: 'legal',
    angleDeg: -30, // 2 en punto
    name: 'Normativa & Legal Ambiental',
    shortName: 'Normativa',
    color: '#c9a84c', // Dorado Neuform
    glowColor: 'rgba(201, 168, 76, 0.4)',
    icon: '⚖️',
    description: 'Blindaje jurídico, Ley 1333, derecho minero y compliance corporativo.',
    nodes: [
      {
        id: 'legal_1',
        level: 1,
        title: 'Marco Regulatorio & Ley 1333',
        desc: 'Conocimiento del marco ambiental boliviano, estatutos de sociedad y contratos.',
        mission: 'Aprobación del Acuerdo Societario o revisión del marco regulatorio.',
        xpReward: 250,
        unlockedFor: ['fernandoaraujo1912@gmail.com', 'barrientoso2401@gmail.com', 'sebastiansbs51@gmail.com'],
      },
      {
        id: 'legal_2',
        level: 2,
        title: 'Expedientes IRAPs & Licencias',
        desc: 'Elaboración de Fichas Ambientales FNCA, RAI, EEIA y planes de adecuación.',
        mission: 'Tener registro RENCA verificado y 2 trámites periciales aprobados.',
        xpReward: 500,
        unlockedFor: ['fernandoaraujo1912@gmail.com'],
      },
      {
        id: 'legal_3a',
        level: 3,
        fork: 'A',
        title: 'Defensa ante Multas & Clausuras',
        desc: 'Estrategias contencioso-administrativas ante el Viceministerio y Gobiernos Autónomos.',
        mission: 'Gestionar una defensa o asesoría de descargo ambiental B2B.',
        xpReward: 800,
        unlockedFor: [],
      },
      {
        id: 'legal_3b',
        level: 3,
        fork: 'B',
        title: 'Auditoría de Cumplimiento SIN/SEPREC',
        desc: 'Revisión societaria, retenciones de ley (IUE/IT) y actas de directorio protocolizadas.',
        mission: 'Validar la liquidación meritocrática del semestre sin observaciones.',
        xpReward: 800,
        unlockedFor: [],
      },
    ],
  },
  {
    id: 'b2b',
    angleDeg: 30, // 4 en punto
    name: 'Liderazgo B2B & Negocios',
    shortName: 'B2B',
    color: '#a855f7', // Púrpura Imperial
    glowColor: 'rgba(168, 85, 247, 0.4)',
    icon: '💼',
    description: 'Estructuración de licitaciones, captación de clientes y alianzas mineras.',
    nodes: [
      {
        id: 'b2b_1',
        level: 1,
        title: 'Modelo Canvas & Pitch SERAM',
        desc: 'Dominio de los 4 pilares comerciales y propuesta de valor integral.',
        mission: 'Revisión y validación del Business Model Canvas de SERAM.',
        xpReward: 250,
        unlockedFor: ['barrientoso2401@gmail.com', 'fernandoaraujo1912@gmail.com', 'sebastiansbs51@gmail.com'],
      },
      {
        id: 'b2b_2',
        level: 2,
        title: 'Prospección Institucional',
        desc: 'Contacto formal con alcaldías mineras, cooperativas y constructoras.',
        mission: 'Registrar y contactar a 5 prospectos B2B en el sistema de Prospección.',
        xpReward: 500,
        unlockedFor: [],
      },
      {
        id: 'b2b_3a',
        level: 3,
        fork: 'A',
        title: 'Licitaciones Públicas SICOES',
        desc: 'Ensamblaje técnico-legal para contrataciones públicas nacionales.',
        mission: 'Presentar una propuesta formal en SICOES o adjudicación municipal.',
        xpReward: 900,
        unlockedFor: [],
      },
      {
        id: 'b2b_3b',
        level: 3,
        fork: 'B',
        title: 'Cierre de Contratos High-Ticket',
        desc: 'Negociación y firma de contratos de consultoría superiores a Bs. 30,000.',
        mission: 'Concluir el cierre de un contrato institucional y emitir orden de servicio.',
        xpReward: 1000,
        unlockedFor: [],
      },
    ],
  },
  {
    id: 'content',
    angleDeg: 90, // 6 en punto (Bottom)
    name: 'Creación de Contenido & Medios',
    shortName: 'Contenido',
    color: '#f59e0b', // Ámbar Cálido
    glowColor: 'rgba(245, 158, 11, 0.4)',
    icon: '🎬',
    description: 'Producción audiovisual, divulgación científica y posicionamiento en redes.',
    nodes: [
      {
        id: 'content_1',
        level: 1,
        title: '1er Video Publicado en Redes',
        desc: 'Creación y difusión del primer contenido audiovisual de valor para SERAM.',
        mission: 'Publicación del primer video técnico en TikTok/Instagram.',
        xpReward: 300,
        unlockedFor: ['barrientoso2401@gmail.com'], // Diego ya cumplió este entregable
      },
      {
        id: 'content_2',
        level: 2,
        title: 'Serie Técnica: 3 Videos Publicados',
        desc: 'Producción consistente de 3 cápsulas sobre contaminación de mercurio o SIG.',
        mission: 'Publicar 3 videos completos de educación ambiental y registrar sus métricas.',
        xpReward: 600,
        unlockedFor: [],
      },
      {
        id: 'content_3a',
        level: 3,
        fork: 'A',
        title: 'Masterclass / Webinar en Vivo',
        desc: 'Organización y dictado de una sesión virtual para SERAM Academy.',
        mission: 'Alcanzar al menos 30 participantes en un webinar de captación.',
        xpReward: 850,
        unlockedFor: [],
      },
      {
        id: 'content_3b',
        level: 3,
        fork: 'B',
        title: 'Dossier & Lead Magnet Técnico',
        desc: 'Redacción de una guía pericial descargable que capte correos de tomadores de decisión.',
        mission: 'Publicar un Dossier oficial descargable en la web de SERAM.',
        xpReward: 850,
        unlockedFor: [],
      },
    ],
  },
  {
    id: 'field',
    angleDeg: 150, // 8 en punto
    name: 'Campo, Muestreo & Logística',
    shortName: 'Campo',
    color: '#14b8a6', // Teal / Menta
    glowColor: 'rgba(20, 184, 166, 0.4)',
    icon: '🧭',
    description: 'Toma in-situ de parámetros fisicoquímicos, reactivos y expediciones.',
    nodes: [
      {
        id: 'field_1',
        level: 1,
        title: 'Protocolo de Muestreo & Seguridad',
        desc: 'Protocolos de cadena de custodia, calibración de multiparámetros y EPP.',
        mission: 'Validación del manual de bioseguridad y equipos de campo.',
        xpReward: 250,
        unlockedFor: ['sebastiansbs51@gmail.com', 'barrientoso2401@gmail.com'],
      },
      {
        id: 'field_2',
        level: 2,
        title: 'Operativo de Cuenca & Logística',
        desc: 'Coordinación completa de transporte, pernocte y toma de muestras en ríos.',
        mission: 'Completar 2 salidas de campo auditadas con reporte fotográfico.',
        xpReward: 550,
        unlockedFor: [],
      },
      {
        id: 'field_3a',
        level: 3,
        fork: 'A',
        title: 'Acreditación SySO del MTEPS',
        desc: 'Obtención del carnet de Seguridad y Salud Ocupacional para eliminar intermediarios.',
        mission: 'Presentar certificación oficial del Ministerio de Trabajo.',
        xpReward: 950,
        unlockedFor: [],
      },
      {
        id: 'field_3b',
        level: 3,
        fork: 'B',
        title: 'Laboratorio Portátil Espectrofotometría',
        desc: 'Análisis in-situ de metales pesados con kits portátiles de alta precisión.',
        mission: 'Validar mediciones comparativas con laboratorio certificado.',
        xpReward: 900,
        unlockedFor: [],
      },
    ],
  },
  {
    id: 'digital',
    angleDeg: 210, // 10 en punto
    name: 'Soluciones Digitales & Código',
    shortName: 'Digital',
    color: '#3b82f6', // Azul Eléctrico
    glowColor: 'rgba(59, 130, 246, 0.4)',
    icon: '💻',
    description: 'Desarrollo de la plataforma web, WebGL, flujos en n8n e intranet de socios.',
    nodes: [
      {
        id: 'digital_1',
        level: 1,
        title: 'Plataforma Web Oficial SERAM',
        desc: 'Diseño e implementación de la web institucional con sistema Neuform.',
        mission: 'Meses continuos de desarrollo de la plataforma web completados.',
        xpReward: 400,
        unlockedFor: ['barrientoso2401@gmail.com'], // Diego ya cumplió este entregable
      },
      {
        id: 'digital_2',
        level: 2,
        title: 'Intranet & Conexión Supabase/n8n',
        desc: 'Infraestructura de base de datos en tiempo real, Docker y flujos n8n.',
        mission: 'Despliegue operativo del motor de base de datos y n8n en el servidor.',
        xpReward: 600,
        unlockedFor: ['barrientoso2401@gmail.com'],
      },
      {
        id: 'digital_3a',
        level: 3,
        fork: 'A',
        title: 'Metaverso 2.5D & Oficina Virtual',
        desc: 'Espacio interactivo con sincronización multi-socio en vivo.',
        mission: 'Conectar la simulación de oficina virtual con presencia real de los 3 socios.',
        xpReward: 850,
        unlockedFor: [],
      },
      {
        id: 'digital_3b',
        level: 3,
        fork: 'B',
        title: 'Arquitectura SaaS & Pagos Digitales',
        desc: 'Integración de pasarela QR boliviana y venta automatizada de dossiers.',
        mission: 'Habilitar cobro directo por QR y generación automática de recibos.',
        xpReward: 900,
        unlockedFor: [],
      },
    ],
  },
];

export default function TalentTreeRadial({ currentSocio }) {
  const { triggerToast, handleAddActivity } = useApp();

  // Compromisos del socio guardados en localStorage
  const [commitments, setCommitments] = useState(() => {
    try {
      const saved = localStorage.getItem('seram_talent_commitments');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [commitDate, setCommitDate] = useState('');
  const [commitNote, setCommitNote] = useState('');

  const activeEmail = currentSocio?.email || 'barrientoso2401@gmail.com';

  // Verificar si un nodo está desbloqueado para este socio
  const isNodeUnlocked = (node) => {
    if (node.unlockedFor && node.unlockedFor.includes(activeEmail)) {
      return true;
    }
    // Si ya completó una tarea vinculada en commitments
    const myComm = commitments[activeEmail]?.[node.id];
    return myComm?.status === 'completed';
  };

  const getNodeCommitment = (nodeId) => {
    return commitments[activeEmail]?.[nodeId] || null;
  };

  const handleOpenNode = (branch, node) => {
    setSelectedBranch(branch);
    setSelectedNode(node);
    const existing = getNodeCommitment(node.id);
    setCommitDate(existing?.date || '');
    setCommitNote(existing?.note || '');
  };

  const handleSaveCommitment = (e) => {
    e.preventDefault();
    if (!commitDate) {
      triggerToast('Selecciona una fecha límite de compromiso', 'error');
      return;
    }

    const newCommitment = {
      nodeId: selectedNode.id,
      branchId: selectedBranch.id,
      title: selectedNode.title,
      date: commitDate,
      note: commitNote,
      committedAt: new Date().toISOString(),
      status: 'committed',
    };

    const updated = {
      ...commitments,
      [activeEmail]: {
        ...(commitments[activeEmail] || {}),
        [selectedNode.id]: newCommitment,
      },
    };

    setCommitments(updated);
    try {
      localStorage.setItem('seram_talent_commitments', JSON.stringify(updated));
    } catch (_) {}

    // Registrar como entregable en Actividades Clave si es necesario
    if (handleAddActivity) {
      handleAddActivity({
        title: `Misión Árbol: ${selectedNode.title}`,
        description: selectedNode.mission,
        category: selectedBranch.name,
        priority: 'Alta',
        dueDate: commitDate,
        assignedPartner: currentSocio?.name || 'Ing. Diego Barrientos',
        estimatedHours: 4,
        actualHours: 0,
        status: 'En curso',
      });
    }

    triggerToast(`¡Objetivo "${selectedNode.title}" fijado! Se agregó a tu lista de tareas.`, 'success');
  };

  // ── CÁLCULO DE COORDENADAS RADIALES SVG ────────────────────────────────────
  const svgCenter = 400;
  const centerRadius = 110;

  // Generar datos geométricos de ramas y nodos
  const branchesData = useMemo(() => {
    return TALENT_BRANCHES.map((b) => {
      const rad = (b.angleDeg * Math.PI) / 180;
      // Conexión en borde del círculo central
      const x0 = svgCenter + centerRadius * Math.cos(rad);
      const y0 = svgCenter + centerRadius * Math.sin(rad);

      // Nivel 1 (Base): R = 180
      const r1 = 180;
      const x1 = svgCenter + r1 * Math.cos(rad);
      const y1 = svgCenter + r1 * Math.sin(rad);

      // Nivel 2: R = 250
      const r2 = 255;
      const x2 = svgCenter + r2 * Math.cos(rad);
      const y2 = svgCenter + r2 * Math.sin(rad);

      // Nivel 3 (Bifurcación en 2 nodos hijos: Offset angular +/- 13°)
      const forkOffsetRad = (13 * Math.PI) / 180;
      const r3 = 330;

      const rad3A = rad - forkOffsetRad;
      const x3A = svgCenter + r3 * Math.cos(rad3A);
      const y3A = svgCenter + r3 * Math.sin(rad3A);

      const rad3B = rad + forkOffsetRad;
      const x3B = svgCenter + r3 * Math.cos(rad3B);
      const y3B = svgCenter + r3 * Math.sin(rad3B);

      const node1 = b.nodes.find((n) => n.level === 1);
      const node2 = b.nodes.find((n) => n.level === 2);
      const node3A = b.nodes.find((n) => n.level === 3 && n.fork === 'A') || b.nodes[2];
      const node3B = b.nodes.find((n) => n.level === 3 && n.fork === 'B') || b.nodes[3];

      return {
        ...b,
        x0, y0,
        x1, y1, node1,
        x2, y2, node2,
        x3A, y3A, node3A,
        x3B, y3B, node3B,
      };
    });
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#070d17] via-[#091120] to-[#060a12] border border-white/[0.1] rounded-3xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00e03c]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header del Árbol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#00e03c] border border-emerald-500/30 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-[#00e03c]" /> Árbol de Talentos Radial 360°
            </span>
            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
              · 6 Especialidades Técnicas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Desarrollo de Habilidades & Ruta de Maestría
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Estructura orbital gamificada inspirada en árboles de talentos de rol. Haz clic en cualquier nodo para consultar los requisitos de desbloqueo, comprometerte con fechas y sumar XP al personaje de <strong className="text-white">{currentSocio?.name || 'Socio'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-[#00e03c] shadow-sm shadow-[#00e03c]" />
            <span className="text-slate-300 font-bold text-[11px]">Desbloqueado</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-slate-700 border border-white/20" />
            <span className="text-slate-400 font-bold text-[11px]">Bloqueado</span>
          </div>
        </div>
      </div>

      {/* ── CONTENEDOR PRINCIPAL DEL SVG RADIAL ──────────────────────────────── */}
      <div className="relative w-full max-w-3xl mx-auto my-6 aspect-square flex items-center justify-center select-none">
        <svg
          viewBox="0 0 800 800"
          className="w-full h-full filter drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Filtros de Resplandor Neon */}
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Anillos de Fondo Concetricos */}
          <circle cx={svgCenter} cy={svgCenter} r={330} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx={svgCenter} cy={svgCenter} r={255} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx={svgCenter} cy={svgCenter} r={180} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* ── CONEXIONES VECTORIALES Y RAMAS ──────────────────────────────── */}
          {branchesData.map((b) => {
            const u1 = isNodeUnlocked(b.node1);
            const u2 = isNodeUnlocked(b.node2);
            const u3A = isNodeUnlocked(b.node3A);
            const u3B = isNodeUnlocked(b.node3B);

            return (
              <g key={`branch-lines-${b.id}`}>
                {/* Línea Tronco: Centro -> Nodo 1 */}
                <line
                  x1={b.x0} y1={b.y0}
                  x2={b.x1} y2={b.y1}
                  stroke={u1 ? b.color : 'rgba(255,255,255,0.12)'}
                  strokeWidth={u1 ? 3 : 1.5}
                  strokeDasharray={u1 ? 'none' : '4 4'}
                  filter={u1 ? 'url(#soft-glow)' : 'none'}
                />

                {/* Línea Nodo 1 -> Nodo 2 */}
                <line
                  x1={b.x1} y1={b.y1}
                  x2={b.x2} y2={b.y2}
                  stroke={u2 ? b.color : 'rgba(255,255,255,0.1)'}
                  strokeWidth={u2 ? 2.5 : 1.5}
                  strokeDasharray={u2 ? 'none' : '4 4'}
                  filter={u2 ? 'url(#soft-glow)' : 'none'}
                />

                {/* Bifurcación: Nodo 2 -> Nodo 3A */}
                <line
                  x1={b.x2} y1={b.y2}
                  x2={b.x3A} y2={b.y3A}
                  stroke={u3A ? b.color : 'rgba(255,255,255,0.08)'}
                  strokeWidth={u3A ? 2.5 : 1}
                  strokeDasharray={u3A ? 'none' : '3 4'}
                  filter={u3A ? 'url(#soft-glow)' : 'none'}
                />

                {/* Bifurcación: Nodo 2 -> Nodo 3B */}
                <line
                  x1={b.x2} y1={b.y2}
                  x2={b.x3B} y2={b.y3B}
                  stroke={u3B ? b.color : 'rgba(255,255,255,0.08)'}
                  strokeWidth={u3B ? 2.5 : 1}
                  strokeDasharray={u3B ? 'none' : '3 4'}
                  filter={u3B ? 'url(#soft-glow)' : 'none'}
                />
              </g>
            );
          })}

          {/* ── NÚCLEO CENTRAL CIRCULAR CON SEGMENTOS DE COLOR ──────────────── */}
          <g>
            {/* Fondo del anillo central */}
            <circle cx={svgCenter} cy={svgCenter} r={centerRadius} fill="#0b1322" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
            <circle cx={svgCenter} cy={svgCenter} r={centerRadius - 15} fill="#070c17" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* Segmentos de color del anillo central correspondientes a cada rama */}
            {branchesData.map((b, idx) => {
              const startAngle = b.angleDeg - 28;
              const endAngle = b.angleDeg + 28;
              const sRad = (startAngle * Math.PI) / 180;
              const eRad = (endAngle * Math.PI) / 180;
              const sx = svgCenter + centerRadius * Math.cos(sRad);
              const sy = svgCenter + centerRadius * Math.sin(sRad);
              const ex = svgCenter + centerRadius * Math.cos(eRad);
              const ey = svgCenter + centerRadius * Math.sin(eRad);

              return (
                <path
                  key={`arc-${b.id}`}
                  d={`M ${sx} ${sy} A ${centerRadius} ${centerRadius} 0 0 1 ${ex} ${ey}`}
                  fill="none"
                  stroke={b.color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#soft-glow)"
                />
              );
            })}

            {/* Texto y Logo Central */}
            <text
              x={svgCenter}
              y={svgCenter - 14}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
              fontWeight="900"
              letterSpacing="3"
            >
              SERAM
            </text>
            <text
              x={svgCenter}
              y={svgCenter + 8}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="18"
              fontWeight="900"
              letterSpacing="2"
            >
              TALENTS
            </text>
            <text
              x={svgCenter}
              y={svgCenter + 26}
              textAnchor="middle"
              fill="#00e03c"
              fontSize="10"
              fontWeight="800"
              letterSpacing="1"
            >
              {currentSocio?.name?.replace('Ing. ', '') || 'Ruta RPG'}
            </text>
          </g>

          {/* ── NODOS INTERACTIVOS (NIVEL 1, 2 Y 3) ─────────────────────────── */}
          {branchesData.map((b) => {
            const renderNode = (node, x, y, size = 18) => {
              const unlocked = isNodeUnlocked(node);
              const committed = getNodeCommitment(node.id);
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  onClick={() => handleOpenNode(b, node)}
                  className="cursor-pointer transition-transform hover:scale-125"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                >
                  {/* Aura exterior al seleccionar o desbloquear */}
                  {unlocked && (
                    <circle
                      cx={x} cy={y}
                      r={size + 5}
                      fill={b.color}
                      opacity={0.2}
                      filter="url(#neon-glow)"
                    />
                  )}
                  {isSelected && (
                    <circle
                      cx={x} cy={y}
                      r={size + 8}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Cuerpo del Nodo */}
                  <circle
                    cx={x} cy={y}
                    r={size}
                    fill={unlocked ? b.color : '#0c1322'}
                    stroke={unlocked ? '#ffffff' : (committed ? b.color : 'rgba(255,255,255,0.25)')}
                    strokeWidth={unlocked ? 2.5 : 1.5}
                    filter={unlocked ? 'url(#soft-glow)' : 'none'}
                  />

                  {/* Icono interior: Check si está desbloqueado, Calendario si está comprometido, o Candado */}
                  {unlocked ? (
                    <text
                      x={x} y={y + 4}
                      textAnchor="middle"
                      fill="#070c17"
                      fontSize="12"
                      fontWeight="900"
                    >
                      ✓
                    </text>
                  ) : committed ? (
                    <text
                      x={x} y={y + 4}
                      textAnchor="middle"
                      fill={b.color}
                      fontSize="10"
                      fontWeight="900"
                    >
                      ★
                    </text>
                  ) : (
                    <text
                      x={x} y={y + 3.5}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      🔒
                    </text>
                  )}

                  {/* Etiqueta compacta en hover o fija */}
                  <title>{`${node.title} (Nivel ${node.level}) - ${unlocked ? 'Desbloqueado' : 'Bloqueado'}`}</title>
                </g>
              );
            };

            return (
              <g key={`nodes-group-${b.id}`}>
                {/* Nodo Nivel 1 */}
                {renderNode(b.node1, b.x1, b.y1, 20)}
                {/* Nodo Nivel 2 */}
                {renderNode(b.node2, b.x2, b.y2, 18)}
                {/* Nodo Nivel 3A */}
                {renderNode(b.node3A, b.x3A, b.y3A, 16)}
                {/* Nodo Nivel 3B */}
                {renderNode(b.node3B, b.x3B, b.y3B, 16)}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── PANEL LATERAL DE DETALLES DEL NODO SELECCIONADO ─────────────────── */}
      <AnimatePresence>
        {selectedNode && selectedBranch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/[0.12] backdrop-blur-md shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Información de la Habilidad */}
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border"
                    style={{
                      color: selectedBranch.color,
                      borderColor: selectedBranch.color,
                      backgroundColor: `${selectedBranch.color}15`,
                    }}
                  >
                    {selectedBranch.icon} {selectedBranch.name} · Nivel {selectedNode.level}
                  </span>

                  {isNodeUnlocked(selectedNode) ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Habilidad Desbloqueada
                    </span>
                  ) : getNodeCommitment(selectedNode.id) ? (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Compromiso Activo
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Bloqueado
                    </span>
                  )}
                  <span className="text-[10px] font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-mono">
                    +{selectedNode.xpReward} XP
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">{selectedNode.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.desc}</p>

                {/* Misión Requerida */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Misión de Desbloqueo:
                  </span>
                  <p className="text-xs text-slate-200">{selectedNode.mission}</p>
                </div>
              </div>

              {/* Formulario de Compromiso con Fechas */}
              <div className="lg:w-80 shrink-0 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00e03c]" /> Compromiso Personal
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Plazo Fijo</span>
                </div>

                {isNodeUnlocked(selectedNode) ? (
                  <div className="p-3 rounded-lg bg-[#00e03c]/10 border border-[#00e03c]/20 text-xs text-[#00e03c] font-bold text-center">
                    ¡Ya dominas este talento! Los puntos de XP están acreditados en tu personaje.
                  </div>
                ) : (
                  <form onSubmit={handleSaveCommitment} className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                        Fecha Límite para Alcanzarlo:
                      </label>
                      <input
                        type="date"
                        value={commitDate}
                        onChange={(e) => setCommitDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono focus:outline-none focus:border-[#00e03c]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                        Meta o Entregable Concreto:
                      </label>
                      <input
                        type="text"
                        value={commitNote}
                        onChange={(e) => setCommitNote(e.target.value)}
                        placeholder="Ej. Grabar video sobre mercurio..."
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#00e03c]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#00e03c] hover:bg-[#00e03c]/90 text-slate-950 font-black text-xs transition-all shadow-lg shadow-[#00e03c]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Fijar Compromiso en mi Panel
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

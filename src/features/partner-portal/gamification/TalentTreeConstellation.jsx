import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  Crown,
  Building2,
  Sparkles,
  ShieldCheck,
  Award,
  CloudRain,
  TrendingUp,
  Satellite,
  Flame,
  Trees,
  Compass,
  HeartHandshake,
  TreePine,
  Recycle,
  Bug,
  Boxes,
  Factory,
  Lock,
  Unlock,
  CheckCircle2,
  Check,
  ExternalLink,
  X,
  ChevronRight,
  Info,
  Filter,
  ArrowUpRight,
  Zap,
  Target,
  BookOpen,
  Calendar,
  AlertCircle,
  FileCheck,
  Shield,
  Eye,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  CONSTELLATIONS,
  TALENT_NODES,
  TALENT_CONNECTIONS,
  getSavedTalentState,
  saveTalentStatus
} from './talentTreeData';

const ICON_MAP = {
  Leaf,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  Crown,
  Building2,
  Sparkles,
  ShieldCheck,
  Award,
  CloudRain,
  TrendingUp,
  Satellite,
  Flame,
  Trees,
  Compass,
  HeartHandshake,
  TreePine,
  Recycle,
  Bug,
  Boxes,
  Factory
};

function RenderTalentIcon({ iconName, className = 'w-4 h-4' }) {
  const IconComp = ICON_MAP[iconName] || Sparkles;
  return <IconComp className={className} />;
}

// Valores de puntos por Tier
const TIER_POINTS = {
  0: 0,   // Tronco raíz (desbloqueado por defecto con el título de Ing.)
  1: 10,  // Tier 1 Operativo / Base
  2: 25,  // Tier 2 Aplicado / Especialista
  3: 50,  // Tier 3 Estratégico / Avanzado
  4: 100  // Tier 4 Apex / Magistral
};

const TIER_LABELS = {
  0: { label: 'Fundamento Común', badge: 'Tronco Base', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  1: { label: 'Tier I · Operativo', badge: 'Fundamento Técnico', border: 'border-sky-500/40', text: 'text-sky-400' },
  2: { label: 'Tier II · Especialista', badge: 'Aplicado en Proyectos', border: 'border-amber-500/40', text: 'text-amber-400' },
  3: { label: 'Tier III · Estratégico', badge: 'Dirección Técnica', border: 'border-purple-500/40', text: 'text-purple-400' },
  4: { label: 'Tier IV · Apex Magistral', badge: 'Autoridad Nacional / Global', border: 'border-yellow-400', text: 'text-yellow-400' }
};

export default function TalentTreeConstellation({
  activePartnerEmail = 'barrientoso2401@gmail.com',
  activePartnerName = 'Ing. Diego Barrientos'
}) {
  // Constelación filtrada: 'all' | 'eia' | 'esg_edge' | 'climate_carbon' | 'biodiversity_nbs' | 'circular_bio'
  const [selectedConstellationId, setSelectedConstellationId] = useState('all');

  // Nodo seleccionado para abrir el Drawer de detalles
  const [selectedNode, setSelectedNode] = useState(null);

  // Nodo en hover para tooltip en SVG
  const [hoveredNode, setHoveredNode] = useState(null);

  // Estado local de talentos desbloqueados y certificados
  const [talentState, setTalentState] = useState(() => getSavedTalentState());

  // Formulario en el Drawer para adjuntar certificado
  const [certForm, setCertForm] = useState({
    institution: '',
    codeOrUrl: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [toastMsg, setToastMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sincronizar lectura de localStorage si cambia el socio
  useEffect(() => {
    setTalentState(getSavedTalentState());
  }, [activePartnerEmail]);

  // Mapa de desbloqueados para el socio activo
  const partnerData = useMemo(() => {
    return talentState[activePartnerEmail] || { unlocked: {}, certs: {} };
  }, [talentState, activePartnerEmail]);

  // Un nodo está desbloqueado si:
  // 1. Es el nodo raíz (root_core está siempre desbloqueado por ser ingeniero de SERAM)
  // 2. Está registrado en partnerData.unlocked[nodeId] === true
  // 3. O en defaults iniciales del socio si no hay override
  const isNodeUnlocked = useMemo(() => {
    return (nodeId) => {
      if (nodeId === 'root_core') return true;
      if (partnerData.unlocked && typeof partnerData.unlocked[nodeId] !== 'undefined') {
        return Boolean(partnerData.unlocked[nodeId]);
      }
      // Defaults iniciales según especialidad del socio
      if (activePartnerEmail === 'barrientoso2401@gmail.com') {
        if (['eia_base', 'eia_sig_1', 'clim_sig_1'].includes(nodeId)) return true;
      } else if (activePartnerEmail === 'fernandoaraujo1912@gmail.com') {
        if (['eia_base', 'eia_audit_1', 'esg_iso_1'].includes(nodeId)) return true;
      } else if (activePartnerEmail === 'sebastiansbs51@gmail.com') {
        if (['eia_base', 'bio_eco_1', 'rec_girsu_1'].includes(nodeId)) return true;
      }
      return false;
    };
  }, [partnerData, activePartnerEmail]);

  // Cálculo de Puntos de Talento (TP) totales y por constelación
  const stats = useMemo(() => {
    let totalTP = 0;
    let unlockedCount = 0;
    const constellationTP = {};
    const constellationUnlocked = {};

    CONSTELLATIONS.forEach((c) => {
      constellationTP[c.id] = 0;
      constellationUnlocked[c.id] = 0;
    });

    TALENT_NODES.forEach((node) => {
      const unlocked = isNodeUnlocked(node.id);
      if (unlocked) {
        unlockedCount++;
        const pts = TIER_POINTS[node.tier] || 0;
        totalTP += pts;
        if (node.constellationId && constellationTP[node.constellationId] !== undefined) {
          constellationTP[node.constellationId] += pts;
          constellationUnlocked[node.constellationId] += 1;
        }
      }
    });

    // Determinar arquetipo predominante
    let topConstellation = null;
    let maxPts = -1;
    CONSTELLATIONS.forEach((c) => {
      if (constellationTP[c.id] > maxPts) {
        maxPts = constellationTP[c.id];
        topConstellation = c;
      }
    });

    let archetype = 'Ingeniero Ambiental Junior';
    if (totalTP >= 200) {
      archetype = topConstellation ? `Maestro en ${topConstellation.shortName}` : 'Consultor Senior Apex';
    } else if (totalTP >= 80) {
      archetype = topConstellation ? `Especialista en ${topConstellation.shortName}` : 'Consultor Multidisciplinario';
    } else if (totalTP >= 30) {
      archetype = topConstellation ? `Técnico en ${topConstellation.shortName}` : 'Analista Operativo';
    }

    return {
      totalTP,
      unlockedCount,
      totalNodes: TALENT_NODES.length,
      constellationTP,
      constellationUnlocked,
      topConstellation,
      archetype
    };
  }, [isNodeUnlocked]);

  // Manejar cambio de estado de desbloqueo (Admin / Socio)
  const handleToggleUnlock = (nodeId, forceStatus = null) => {
    const current = isNodeUnlocked(nodeId);
    const nextStatus = forceStatus !== null ? forceStatus : !current;

    saveTalentStatus(activePartnerEmail, nodeId, nextStatus, nextStatus ? certForm : null);
    setTalentState(getSavedTalentState());

    setToastMsg(
      nextStatus
        ? `Talento [${nodeId}] desbloqueado con éxito.`
        : `Talento [${nodeId}] bloqueado.`
    );
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Manejar guardado de certificado formal
  const handleSaveCertificate = (e) => {
    e.preventDefault();
    if (!selectedNode) return;

    if (!certForm.institution.trim()) {
      alert('Ingresa la institución emisora del certificado.');
      return;
    }

    saveTalentStatus(activePartnerEmail, selectedNode.id, true, certForm);
    setTalentState(getSavedTalentState());
    setToastMsg(`Certificado vinculado a ${selectedNode.title}. ¡Talento acreditado!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Cargar formulario si el nodo ya tiene certificado guardado
  useEffect(() => {
    if (selectedNode && partnerData.certs && partnerData.certs[selectedNode.id]) {
      setCertForm(partnerData.certs[selectedNode.id]);
    } else {
      setCertForm({
        institution: '',
        codeOrUrl: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [selectedNode, partnerData]);

  // Mapa rápido de nodos por ID para cálculo de líneas SVG
  const nodeMap = useMemo(() => {
    const m = {};
    TALENT_NODES.forEach((n) => {
      m[n.id] = n;
    });
    return m;
  }, []);

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 p-4 sm:p-6 bg-[#030712]/98 backdrop-blur-2xl overflow-y-auto space-y-5 flex flex-col'
          : 'space-y-6'
      }
    >
      {/* ── ALERTA TOAST FLOTANTE ── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900/95 border border-[#00e03c] text-white shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <Sparkles className="w-5 h-5 text-[#00e03c] animate-pulse" />
            <span className="text-xs font-bold">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PANEL DE CABECERA: HUD GAMIFICADO DEL SOCIO ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00e03c]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Info Socio & Arquetipo */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30">
                Constelación de Talentos SERAM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                Modelo No Restrictivo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {activePartnerName}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Arquetipo:</span>
              <strong className="text-amber-400 font-extrabold">{stats.archetype}</strong>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                {stats.unlockedCount} de {stats.totalNodes} habilidades activas
              </span>
            </p>
          </div>

          {/* Marcadores de Puntos y HUD Global (estilo referencia RPG) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Total TP Card */}
            <div className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">
                Puntos de Talento
              </span>
              <span className="text-2xl font-black text-amber-400 leading-none">
                {stats.totalTP} <span className="text-xs text-slate-400 font-normal">TP</span>
              </span>
            </div>

            {/* Progreso de Desbloqueo */}
            <div className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">
                Maestría Activa
              </span>
              <span className="text-2xl font-black text-[#00e03c] leading-none">
                {Math.round((stats.unlockedCount / stats.totalNodes) * 100)}%
              </span>
            </div>

            {/* Botón de Pantalla Completa / Expandir */}
            <button
              type="button"
              data-talent-fullscreen="true"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-md"
              title={isFullscreen ? 'Minimizar a vista normal' : 'Expandir pantalla completa'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Minimizar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-[#00e03c]" />
                  <span className="hidden sm:inline">Pantalla Completa</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── BARRA DE INVERSIÓN POR CONSTELACIÓN (Inspirada en los números de la imagen RPG) ── */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {CONSTELLATIONS.map((c) => {
            const tp = stats.constellationTP[c.id] || 0;
            const count = stats.constellationUnlocked[c.id] || 0;
            const isFilterActive = selectedConstellationId === c.id;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setSelectedConstellationId(selectedConstellationId === c.id ? 'all' : c.id)
                }
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden ${
                  isFilterActive
                    ? 'border-white/40 bg-white/10 shadow-lg'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 truncate text-white">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">{c.shortName}</span>
                  </span>
                  <span
                    className="font-mono font-black text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${c.color}20`, color: c.color }}
                  >
                    {tp} TP
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{c.code}</span>
                  <span>{count} / 5 nodos</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SELECTOR DE FILTRO DE VISTA ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900/40 p-2 rounded-xl border border-white/5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 px-2">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Filtrar Rama:
          </span>
          <button
            type="button"
            onClick={() => setSelectedConstellationId('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedConstellationId === 'all'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Ver Todas las Constelaciones
          </button>
          {CONSTELLATIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedConstellationId(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedConstellationId === c.id
                  ? 'bg-white text-slate-950 font-black shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.shortName}
            </button>
          ))}
        </div>

        {/* Leyenda interactiva */}
        <div className="flex items-center gap-3 text-[10px] text-slate-400 px-2 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e03c] inline-block shadow-sm shadow-[#00e03c]" />
            Desbloqueado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 inline-block" />
            Por Desbloquear
          </span>
          <span className="flex items-center gap-1">
            <Satellite className="w-3 h-3 text-cyan-400" />
            SIG Instrumental
          </span>
          <span className="flex items-center gap-1">
            <Crown className="w-3 h-3 text-yellow-400" />
            Tier IV Apex
          </span>
        </div>
      </div>

      {/* ── LIENZO INTERACTIVO SVG: MAPA ESTELAR DEL ÁRBOL DE TALENTOS ── */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#040812] via-[#071022] to-[#03060c] border border-white/10 overflow-hidden shadow-2xl p-2 sm:p-4">
        {/* Fondo con estrellas y cuadrícula cósmica */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 80%, rgba(0, 224, 60, 0.15) 0%, transparent 60%), radial-gradient(circle at 20% 30%, rgba(0, 192, 255, 0.12) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(168, 85, 247, 0.12) 0%, transparent 40%)'
          }}
        />

        {/* Tooltip flotante en hover */}
        {hoveredNode && (
          <div
            className="absolute z-30 pointer-events-none px-3 py-2 rounded-xl bg-slate-950/95 border border-white/20 text-xs shadow-2xl backdrop-blur-md max-w-xs transition-all"
            style={{
              left: `${(hoveredNode.x / 1000) * 100}%`,
              top: `${(hoveredNode.y / 850) * 100}%`,
              transform: 'translate(-50%, -125%)'
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                {hoveredNode.shortCode}
              </span>
              <span
                className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                  isNodeUnlocked(hoveredNode.id)
                    ? 'bg-[#00e03c]/20 text-[#00e03c]'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                +{TIER_POINTS[hoveredNode.tier]} TP
              </span>
            </div>
            <p className="font-extrabold text-white text-xs">{hoveredNode.title}</p>
            <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
              {hoveredNode.description}
            </p>
            <div className="mt-1 pt-1 border-t border-white/10 text-[9px] text-amber-400 font-bold flex items-center justify-between">
              <span>{isNodeUnlocked(hoveredNode.id) ? '✓ Desbloqueado' : '🔒 Bloqueado'}</span>
              <span>Haz clic para detalles</span>
            </div>
          </div>
        )}

        {/* SVG Interactivo */}
        <div className="w-full relative">
          <svg
            viewBox="0 0 1000 850"
            className="w-full h-auto select-none"
            style={{ minHeight: isFullscreen ? '85vh' : '780px', maxHeight: isFullscreen ? 'none' : '960px' }}
          >
            <defs>
              {/* Filtros de Resplandor Neon */}
              <filter id="glow-root" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-apex" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="14" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-node" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Degradados de fondo para líneas */}
              <linearGradient id="grad-bridge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00c0ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* ── 0. TITULARES DE CONSTELACIÓN EN EL CÉNIT ── */}
            <g className="constellation-zenith-headers pointer-events-none select-none">
              {CONSTELLATIONS.map((c) => {
                const positions = {
                  eia: { x: 190, y: 155 },
                  esg_edge: { x: 335, y: 110 },
                  climate_carbon: { x: 500, y: 65 },
                  biodiversity_nbs: { x: 670, y: 110 },
                  circular_bio: { x: 820, y: 155 }
                };
                const pos = positions[c.id] || { x: 500, y: 100 };
                const isFiltered = selectedConstellationId !== 'all' && selectedConstellationId !== c.id;

                return (
                  <g key={`zenith-${c.id}`} transform={`translate(${pos.x}, ${pos.y})`} opacity={isFiltered ? 0.2 : 0.85}>
                    <text
                      textAnchor="middle"
                      fill={c.color}
                      fontSize="9.5"
                      fontWeight="900"
                      letterSpacing="0.06em"
                      className="uppercase"
                    >
                      {c.code}
                    </text>
                    <text
                      y="13"
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="8"
                      fontWeight="700"
                    >
                      {c.shortName}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* ── 1. LÍNEAS DE CONEXIÓN ENTRE NODOS (CONDUCTOS DE ENERGÍA) ── */}
            <g className="connections-layer">
              {TALENT_CONNECTIONS.map((conn, idx) => {
                const source = nodeMap[conn.from];
                const target = nodeMap[conn.to];
                if (!source || !target) return null;

                const sourceUnlocked = isNodeUnlocked(conn.from);
                const targetUnlocked = isNodeUnlocked(conn.to);
                const isFullyActive = sourceUnlocked && targetUnlocked;
                const isPartiallyActive = sourceUnlocked || targetUnlocked;

                // Color según constelación
                const constObj = CONSTELLATIONS.find((c) => c.id === conn.constellationId);
                const lineColor = constObj ? constObj.color : '#cbd5e1';

                // Opacidad por filtro
                const isFilteredOut =
                  selectedConstellationId !== 'all' &&
                  conn.constellationId !== selectedConstellationId &&
                  conn.constellationId !== 'core' &&
                  !conn.isCrossBridge;

                const strokeOpacity = isFilteredOut
                  ? 0.08
                  : isFullyActive
                  ? 0.95
                  : isPartiallyActive
                  ? 0.4
                  : 0.15;

                const strokeWidth = isFullyActive ? 3.5 : isPartiallyActive ? 2 : 1.5;

                // Curvatura suave tipo constelación
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;
                // Pequeña curvatura orgánica
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const curveFactor = conn.isCrossBridge ? 40 : 15;
                const cx = midX - (dy / Math.hypot(dx, dy || 1)) * curveFactor;
                const cy = midY + (dx / Math.hypot(dx, dy || 1)) * curveFactor;

                const pathData = `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`;

                return (
                  <g key={`conn-${idx}`}>
                    {/* Línea de resplandor difuso si está totalmente activa */}
                    {isFullyActive && !isFilteredOut && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke={conn.isCrossBridge ? 'url(#grad-bridge)' : lineColor}
                        strokeWidth={7}
                        strokeOpacity={0.35}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Línea principal */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={conn.isCrossBridge ? 'url(#grad-bridge)' : lineColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      strokeDasharray={
                        conn.isCrossBridge ? '6,6' : isFullyActive ? 'none' : '4,4'
                      }
                      strokeLinecap="round"
                    />

                    {/* Partícula en movimiento si ambos están activos */}
                    {isFullyActive && !isFilteredOut && (
                      <circle r={3} fill="#ffffff" opacity={0.9}>
                        <animateMotion
                          path={pathData}
                          dur={`${2.5 + (idx % 3) * 0.8}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </g>

            {/* ── 2. NODOS DEL ÁRBOL (ORBES Y CORONAS APEX) ── */}
            <g className="nodes-layer">
              {TALENT_NODES.map((node) => {
                const unlocked = isNodeUnlocked(node.id);
                const isRoot = node.id === 'root_core';
                const isApex = node.tier === 4;
                const isInstrumental = node.isInstrumental;

                const constObj = CONSTELLATIONS.find((c) => c.id === node.constellationId);
                const mainColor = isRoot ? '#00e03c' : constObj ? constObj.color : '#00e03c';

                // Filtrado visual
                const isFilteredOut =
                  selectedConstellationId !== 'all' &&
                  node.constellationId !== selectedConstellationId &&
                  !isRoot;

                const nodeOpacity = isFilteredOut ? 0.25 : 1;
                const isSelected = selectedNode?.id === node.id;

                // Radio y dimensiones según tipo (Escala expandida de alta visibilidad)
                const radius = isRoot ? 36 : isApex ? 30 : isInstrumental ? 24 : 21;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    opacity={nodeOpacity}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Anillo de Selección */}
                    {isSelected && (
                      <circle
                        r={radius + 12}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                      />
                    )}

                    {/* Aura exterior brillante si está desbloqueado */}
                    {unlocked && (
                      <circle
                        r={radius + 8}
                        fill="none"
                        stroke={mainColor}
                        strokeWidth={2}
                        strokeOpacity={0.4}
                        filter={isApex ? 'url(#glow-apex)' : 'url(#glow-node)'}
                      />
                    )}

                    {/* Aura de radar si es Instrumental SIG */}
                    {isInstrumental && (
                      <circle
                        r={radius + 6}
                        fill="none"
                        stroke="#00c0ff"
                        strokeWidth={1.5}
                        strokeDasharray="3,3"
                        strokeOpacity={unlocked ? 0.8 : 0.4}
                      />
                    )}

                    {/* Cuerpo base del nodo (Círculo o Rombo Apex) */}
                    {isApex ? (
                      // Nodo Apex: Rombo / Hexágono magistral
                      <polygon
                        points={`0,-${radius + 4} ${radius + 4},0 0,${radius + 4} -${radius + 4},0`}
                        fill={unlocked ? '#0f172a' : '#030712'}
                        stroke={unlocked ? mainColor : '#475569'}
                        strokeWidth={unlocked ? 3.5 : 2}
                        filter={unlocked ? 'url(#glow-apex)' : undefined}
                      />
                    ) : (
                      // Nodo Estándar o Raíz: Círculo
                      <circle
                        r={radius}
                        fill={
                          isRoot
                            ? '#064e3b'
                            : unlocked
                            ? '#0b1329'
                            : '#030712'
                        }
                        stroke={unlocked ? mainColor : '#334155'}
                        strokeWidth={unlocked ? (isRoot ? 3.5 : 2.5) : 1.5}
                        filter={isRoot && unlocked ? 'url(#glow-root)' : undefined}
                      />
                    )}

                    {/* Icono central SVG */}
                    <foreignObject
                      x={-radius + 4}
                      y={-radius + 4}
                      width={(radius - 4) * 2}
                      height={(radius - 4) * 2}
                      className="pointer-events-none"
                    >
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <RenderTalentIcon
                          iconName={node.icon}
                          className={`${
                            isRoot
                              ? 'w-7 h-7 text-[#00e03c]'
                              : isApex
                              ? 'w-6 h-6 text-yellow-300'
                              : isInstrumental
                              ? 'w-4 h-4 text-cyan-300'
                              : unlocked
                              ? 'w-4 h-4'
                              : 'w-3.5 h-3.5 text-slate-500'
                          }`}
                        />
                      </div>
                    </foreignObject>

                    {/* Candado badge si está bloqueado */}
                    {!unlocked && !isRoot && (
                      <g transform={`translate(${radius - 6}, ${radius - 6})`}>
                        <circle r={6} fill="#090d16" stroke="#475569" strokeWidth={1} />
                        <foreignObject x={-4} y={-4} width={8} height={8}>
                          <Lock className="w-2 h-2 text-slate-400" />
                        </foreignObject>
                      </g>
                    )}

                    {/* Checkmark badge si está desbloqueado */}
                    {unlocked && !isRoot && (
                      <g transform={`translate(${radius - 6}, ${radius - 6})`}>
                        <circle r={6} fill="#00e03c" />
                        <foreignObject x={-4} y={-4} width={8} height={8}>
                          <Check className="w-2 h-2 text-slate-950 font-black" />
                        </foreignObject>
                      </g>
                    )}

                    {/* Etiqueta flotante con Badge nítido (Código + Especialidad) */}
                    <g transform={`translate(0, ${radius + 14})`} className="pointer-events-none select-none">
                      <rect
                        x="-46"
                        y="-2"
                        width="92"
                        height="25"
                        rx="5"
                        fill="rgba(6, 12, 24, 0.9)"
                        stroke={unlocked ? `${mainColor}60` : 'rgba(255, 255, 255, 0.12)'}
                        strokeWidth="0.8"
                      />
                      <text
                        y="9"
                        textAnchor="middle"
                        fill={unlocked ? '#f8fafc' : '#94a3b8'}
                        fontSize="9.5"
                        fontWeight={800}
                        className="tracking-tight"
                      >
                        {node.shortCode}
                      </text>
                      <text
                        y="19"
                        textAnchor="middle"
                        fill={unlocked ? mainColor : '#64748b'}
                        fontSize="7.5"
                        fontWeight={700}
                        className="tracking-wider uppercase"
                      >
                        {node.track.length > 13 ? node.track.slice(0, 12) + '…' : node.track}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* ── MODAL DRAWER LATERAL: DETALLES DEL NODO & GESTIÓN DE EVIDENCIA ── */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#090f1e] border border-white/20 shadow-2xl p-6 text-slate-200 space-y-5"
            >
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera del Nodo */}
              <div className="space-y-2 pr-10">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Constelación Badge */}
                  {selectedNode.constellationId !== 'core' && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950"
                      style={{
                        backgroundColor:
                          CONSTELLATIONS.find((c) => c.id === selectedNode.constellationId)
                            ?.color || '#00e03c'
                      }}
                    >
                      {CONSTELLATIONS.find((c) => c.id === selectedNode.constellationId)?.title}
                    </span>
                  )}
                  {/* Tier Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      TIER_LABELS[selectedNode.tier]?.border
                    } ${TIER_LABELS[selectedNode.tier]?.text} bg-white/5`}
                  >
                    {TIER_LABELS[selectedNode.tier]?.label}
                  </span>
                  {/* Puntos Badge */}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    +{TIER_POINTS[selectedNode.tier]} Puntos de Talento (TP)
                  </span>
                  {/* SIG Instrumental */}
                  {selectedNode.isInstrumental && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Satellite className="w-3 h-3" />
                      Instrumental SIG
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20"
                    style={{
                      backgroundColor: `${
                        CONSTELLATIONS.find((c) => c.id === selectedNode.constellationId)?.color ||
                        '#00e03c'
                      }25`
                    }}
                  >
                    <RenderTalentIcon iconName={selectedNode.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-slate-400 font-bold block">
                      {selectedNode.shortCode} · Track: {selectedNode.track}
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {selectedNode.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Estado de Desbloqueo Actual Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isNodeUnlocked(selectedNode.id)
                    ? 'bg-[#00e03c]/10 border-[#00e03c]/30 text-white'
                    : 'bg-white/[0.03] border-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isNodeUnlocked(selectedNode.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00e03c] flex-shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">
                      {isNodeUnlocked(selectedNode.id)
                        ? 'Talento Activo en el Perfil del Socio'
                        : 'Talento Bloqueado / Pendiente de Acreditación'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isNodeUnlocked(selectedNode.id)
                        ? 'Aporta a la cotización y liderazgo técnico de proyectos en SERAM.'
                        : 'Puedes acreditarlo completando el curso o adjuntando comprobante.'}
                    </span>
                  </div>
                </div>

                {/* Switch rápido de desbloqueo (Admin / Testing) */}
                {selectedNode.id !== 'root_core' && (
                  <button
                    type="button"
                    onClick={() => handleToggleUnlock(selectedNode.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isNodeUnlocked(selectedNode.id)
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                        : 'bg-[#00e03c] text-slate-950 font-black hover:bg-[#00e03c]/90'
                    }`}
                  >
                    {isNodeUnlocked(selectedNode.id) ? 'Desactivar' : 'Desbloquear'}
                  </button>
                )}
              </div>

              {/* Descripción Técnica y Aplicación en SERAM */}
              <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider block mb-1">
                    Descripción del Alcance Técnico
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedNode.description}</p>
                </div>

                <div>
                  <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Aplicación Práctica y Facturación en SERAM
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedNode.seramUse}</p>
                </div>

                {/* Si es Instrumental SIG */}
                {selectedNode.isInstrumental && (
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-[11px] flex items-center gap-2">
                    <Satellite className="w-4 h-4 flex-shrink-0 text-cyan-400" />
                    <span>
                      <strong>Especialidad Instrumental:</strong> Esta competencia aporta valor transversal a todas las ramas y no condiciona la titulación de otros socios.
                    </span>
                  </div>
                )}
              </div>

              {/* Certificación Avalada & Academia SERAM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Acreditación Externa Sugerida
                  </span>
                  <p className="font-bold text-white text-xs">{selectedNode.certification}</p>
                  <p className="text-[10px] text-slate-500">
                    Válido mediante diploma, credencial profesional o registro oficial.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    Módulo SERAM Academy
                  </span>
                  <p className="font-bold text-white text-xs">{selectedNode.academyCourse}</p>
                  <p className="text-[10px] text-slate-500">
                    Formación interna continua para acelerar tu progresión.
                  </p>
                </div>
              </div>

              {/* ── FORMULARIO: REGISTRAR EVIDENCIA DE CERTIFICADO ── */}
              {selectedNode.id !== 'root_core' && (
                <form
                  onSubmit={handleSaveCertificate}
                  className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-[#00e03c]" />
                      Vincular Certificado / Registro Oficial
                    </span>
                    <span className="text-[10px] text-slate-400">Guarda evidencia en tu perfil</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Institución Emisora *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. IFC / GBCI, Verra, SIB, MMAyA"
                        value={certForm.institution}
                        onChange={(e) =>
                          setCertForm({ ...certForm, institution: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00e03c] text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Fecha de Emisión
                      </label>
                      <input
                        type="date"
                        value={certForm.date}
                        onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00e03c] text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        N° Folio, Matrícula o Enlace de Verificación
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. REG-2026-EDGE-8491 ó https://credential.net/..."
                        value={certForm.codeOrUrl}
                        onChange={(e) =>
                          setCertForm({ ...certForm, codeOrUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00e03c] text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-[#00e03c]/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#00e03c]/20"
                    >
                      <Check className="w-4 h-4 font-black" />
                      Guardar Evidencia & Acreditar Talento
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

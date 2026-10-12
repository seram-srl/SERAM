import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Upload,
  FileText,
  Trash2
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
    date: new Date().toISOString().split('T')[0],
    pdfName: '',
    pdfData: '',
    pdfSize: ''
  });

  const [toastMsg, setToastMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── ESTRELLAS CÓSMICAS GENERADAS PARA EL FONDO DE LA GALAXIA ──
  const COSMIC_STARS = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 85; i++) {
      const x = ((i * 137.5 + 47) % 1460) + 20;
      const y = ((i * 219.3 + 83) % 910) + 20;
      const r = i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.6 : 1.0;
      const dur = 2.5 + (i % 6) * 0.9;
      const delay = (i % 8) * 0.6;
      const color =
        i % 4 === 0
          ? '#a5f3fc'
          : i % 5 === 0
          ? '#fde68a'
          : i % 6 === 0
          ? '#86efac'
          : i % 7 === 0
          ? '#d8b4fe'
          : '#ffffff';
      stars.push({ id: i, x, y, r, dur, delay, color });
    }
    return stars;
  }, []);

  // ── ESTADOS DE NAVEGACIÓN PAN & ZOOM ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0, dist: 0 });

  // Controles de zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.4, +(prev + 0.2).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, +(prev - 0.2).toFixed(2)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFocusRoot = () => {
    setZoom(1.2);
    setPan({ x: 0, y: -340 });
  };

  // Auto-enfoque suave hacia una constelación específica
  const handleFocusConstellation = (constellationId) => {
    setSelectedConstellationId(constellationId);
    if (constellationId === 'all') {
      handleResetView();
      return;
    }
    const offsets = {
      eia: { x: 480, y: 110 },
      esg_edge: { x: 240, y: 110 },
      climate_carbon: { x: 0, y: 140 },
      biodiversity_nbs: { x: -240, y: 110 },
      circular_bio: { x: -480, y: 110 }
    };
    const target = offsets[constellationId] || { x: 0, y: 0 };
    setZoom(1.3);
    setPan(target);
  };

  // Carga de archivo PDF
  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Por favor selecciona un archivo con formato .PDF');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('El archivo PDF supera el límite recomendado de 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      const sizeKb = (file.size / 1024).toFixed(1);
      setCertForm((prev) => ({
        ...prev,
        pdfName: file.name,
        pdfData: dataUrl,
        pdfSize: `${sizeKb} KB`
      }));
      setToastMsg(`PDF "${file.name}" cargado exitosamente.`);
      setTimeout(() => setToastMsg(''), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setCertForm((prev) => ({
      ...prev,
      pdfName: '',
      pdfData: '',
      pdfSize: ''
    }));
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.hypot(dx - pan.x, dy - pan.y) > 5) {
      hasMovedRef.current = true;
    }
    setPan({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom((prev) => Math.max(0.5, Math.min(2.4, +(prev + zoomDelta).toFixed(2))));
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasMovedRef.current = false;
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      hasMovedRef.current = true;
      setPan({ x: dx, y: dy });
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartRef.current.dist;
      touchStartRef.current.dist = dist;
      setZoom((prev) => Math.max(0.5, Math.min(2.4, +(prev * factor).toFixed(2))));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current.dist = 0;
  };

  const handleNodeClick = (node) => {
    if (hasMovedRef.current) return;
    setSelectedNode(node);
  };

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

    if (!certForm.institution.trim() && !certForm.pdfName) {
      alert('Por favor ingresa la institución emisora o sube el certificado en formato PDF.');
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
      setCertForm({
        institution: '',
        codeOrUrl: '',
        date: new Date().toISOString().split('T')[0],
        pdfName: '',
        pdfData: '',
        pdfSize: '',
        ...partnerData.certs[selectedNode.id]
      });
    } else {
      setCertForm({
        institution: '',
        codeOrUrl: '',
        date: new Date().toISOString().split('T')[0],
        pdfName: '',
        pdfData: '',
        pdfSize: ''
      });
    }
  }, [selectedNode, partnerData]);

  // Atajo de teclado: Escape cierra modal o sale de pantalla completa
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedNode) {
          setSelectedNode(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, isFullscreen]);

  // Bloquear scroll de la página de fondo en modo pantalla completa
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Mapa rápido de nodos por ID para cálculo de líneas SVG
  const nodeMap = useMemo(() => {
    const m = {};
    TALENT_NODES.forEach((n) => {
      m[n.id] = n;
    });
    return m;
  }, []);

  const treeContent = (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-[150] bg-[#030712] overflow-hidden flex flex-col select-none'
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

      {/* ── TOP BAR FLOTANTE EN PANTALLA COMPLETA (HUD MINIMALISTA) ── */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between gap-3 pointer-events-none">
          {/* Badge del Socio y Arquetipo */}
          <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950/80 border border-white/15 backdrop-blur-md shadow-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00e03c] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">{activePartnerName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                  {stats.totalTP} TP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {stats.archetype} · {stats.unlockedCount}/{stats.totalNodes} activos
              </p>
            </div>
          </div>

          {/* Selector de Constelaciones Rápido */}
          <div className="pointer-events-auto hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/15 backdrop-blur-md shadow-2xl">
            <button
              type="button"
              onClick={() => handleFocusConstellation('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedConstellationId === 'all'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Todo
            </button>
            {CONSTELLATIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleFocusConstellation(c.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedConstellationId === c.id
                    ? 'bg-white text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.shortName}</span>
              </button>
            ))}
          </div>

          {/* Botón Salir de Pantalla Completa */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/15 hover:border-amber-400 text-slate-200 hover:text-white flex items-center gap-1.5 text-xs font-bold backdrop-blur-md shadow-2xl transition-all cursor-pointer group"
              title="Presiona Esc para salir"
            >
              <Minimize2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Salir de Pantalla Completa</span>
              <kbd className="hidden sm:inline-block ml-1 text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10">Esc</kbd>
            </button>
          </div>
        </div>
      )}

      {/* ── PANEL DE CABECERA: HUD GAMIFICADO DEL SOCIO (Oculto en pantalla completa limpia) ── */}
      {!isFullscreen && (
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
      )}

      {/* ── SELECTOR DE FILTRO DE VISTA (Oculto en pantalla completa) ── */}
      {!isFullscreen && (
        <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900/40 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 px-2">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              Filtrar Rama:
            </span>
            <button
              type="button"
              onClick={() => handleFocusConstellation('all')}
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
                onClick={() => handleFocusConstellation(c.id)}
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
      )}

      {/* ── LIENZO INTERACTIVO SVG: MAPA ESTELAR DEL ÁRBOL DE TALENTOS ── */}
      <div
        className={
          isFullscreen
            ? 'relative w-full h-full flex-1 overflow-hidden select-none bg-gradient-to-b from-[#040812] via-[#071022] to-[#03060c]'
            : 'relative rounded-2xl bg-gradient-to-b from-[#040812] via-[#071022] to-[#03060c] border border-white/10 overflow-hidden shadow-2xl p-2 sm:p-4 select-none h-[780px] sm:h-[840px] flex flex-col'
        }
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Fondo con estrellas y cuadrícula cósmica */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 80%, rgba(0, 224, 60, 0.15) 0%, transparent 60%), radial-gradient(circle at 20% 30%, rgba(0, 192, 255, 0.12) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(168, 85, 247, 0.12) 0%, transparent 40%)'
          }}
        />

        {/* Hint de navegación flotante (Inferior Izquierdo) */}
        <div className="absolute bottom-5 left-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-sm text-[10px] text-slate-400 pointer-events-none select-none">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00e03c]" />
          <span>Arrastra para moverte · Rueda para zoom · Clic en nodo para ver ficha</span>
        </div>

        {/* Dock flotante de controles Pan & Zoom (Inferior Derecho) */}
        <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-2xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Acercar zoom (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="px-1.5 font-mono text-[11px] font-bold text-slate-300 select-none min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Alejar zoom (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 my-auto mx-0.5" />

          <button
            type="button"
            onClick={handleResetView}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Centrar vista completa"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Centrar</span>
          </button>

          <button
            type="button"
            onClick={handleFocusRoot}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Enfocar nodo Raíz / TRONCO-00"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#00e03c]" />
            <span className="hidden sm:inline">Raíz</span>
          </button>

          {!isFullscreen && (
            <>
              <div className="w-px h-5 bg-white/10 my-auto mx-0.5" />
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="p-2 rounded-xl bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/30 text-[#00e03c] transition-all cursor-pointer"
                title="Expandir a Pantalla Completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* SVG Interactivo */}
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 1500 950"
            className="w-full h-full select-none"
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'auto'
            }}
          >
            <defs>
              <style>{`
                @keyframes starTwinkle {
                  0%, 100% { opacity: 0.15; transform: scale(0.85); }
                  50% { opacity: 0.95; transform: scale(1.3); }
                }
                @keyframes galaxySpinSlow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes nebulaBreathe {
                  0%, 100% { opacity: 0.10; transform: scale(0.96); }
                  50% { opacity: 0.22; transform: scale(1.05); }
                }
              `}</style>

              {/* Filtros de Resplandor Neon */}
              <filter id="glow-root" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-apex" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-node" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="7" result="blur" />
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

              {/* Degradados para Galaxias y Nebulosas */}
              <radialGradient id="grad-galaxy-1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00c0ff" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#040812" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="grad-galaxy-2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.38" />
                <stop offset="45%" stopColor="#c084fc" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#040812" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="grad-nebula-emerald" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00e03c" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#059669" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#040812" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="grad-nebula-gold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#d97706" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#040812" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="grad-nebula-cyan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00c0ff" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#040812" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* GRUPO PRINCIPAL TRANSFORMADO CON PAN Y ZOOM */}
            <g
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
              style={{
                transformOrigin: '750px 475px',
                transition: isDragging ? 'none' : 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              {/* ── FONDO CÓSMICO DE GALAXIAS Y ESTRELLAS VIVAS ── */}
              <g className="galaxy-background pointer-events-none select-none">
                {/* Nebulosas pulsantes difusas */}
                <circle
                  cx="750"
                  cy="840"
                  r="380"
                  fill="url(#grad-nebula-emerald)"
                  style={{ transformOrigin: '750px 840px', animation: 'nebulaBreathe 12s ease-in-out infinite' }}
                />
                <circle
                  cx="470"
                  cy="380"
                  r="340"
                  fill="url(#grad-nebula-gold)"
                  style={{ transformOrigin: '470px 380px', animation: 'nebulaBreathe 16s ease-in-out infinite 2s' }}
                />
                <circle
                  cx="1030"
                  cy="380"
                  r="340"
                  fill="url(#grad-nebula-cyan)"
                  style={{ transformOrigin: '1030px 380px', animation: 'nebulaBreathe 15s ease-in-out infinite 5s' }}
                />

                {/* Galaxia Espiral Lejana 1 (Noroeste) */}
                <g
                  transform="translate(240, 240) rotate(-22)"
                  style={{ transformOrigin: '240px 240px', animation: 'galaxySpinSlow 180s linear infinite' }}
                >
                  <ellipse cx="240" cy="240" rx="190" ry="70" fill="url(#grad-galaxy-1)" />
                  <ellipse cx="240" cy="240" rx="95" ry="30" fill="#38bdf8" opacity="0.16" filter="url(#glow-node)" />
                  <circle cx="240" cy="240" r="14" fill="#ffffff" opacity="0.32" filter="url(#glow-node)" />
                </g>

                {/* Galaxia Espiral Lejana 2 (Noreste) */}
                <g
                  transform="translate(1260, 280) rotate(32)"
                  style={{ transformOrigin: '1260px 280px', animation: 'galaxySpinSlow 220s linear infinite reverse' }}
                >
                  <ellipse cx="1260" cy="280" rx="200" ry="75" fill="url(#grad-galaxy-2)" />
                  <ellipse cx="1260" cy="280" rx="100" ry="32" fill="#c084fc" opacity="0.16" filter="url(#glow-node)" />
                  <circle cx="1260" cy="280" r="15" fill="#ffffff" opacity="0.28" filter="url(#glow-node)" />
                </g>

                {/* Enjambre de 85 estrellas titilantes */}
                {COSMIC_STARS.map((star) => (
                  <circle
                    key={`star-${star.id}`}
                    cx={star.x}
                    cy={star.y}
                    r={star.r}
                    fill={star.color}
                    style={{
                      transformOrigin: `${star.x}px ${star.y}px`,
                      animation: `starTwinkle ${star.dur}s ease-in-out infinite ${star.delay}s`
                    }}
                  />
                ))}
              </g>

              {/* ── 0. TITULARES DE CONSTELACIÓN EN EL CÉNIT ── */}
              <g className="constellation-zenith-headers pointer-events-none select-none">
                {CONSTELLATIONS.map((c) => {
                  const positions = {
                    eia: { x: 220, y: 110 },
                    esg_edge: { x: 470, y: 110 },
                    climate_carbon: { x: 750, y: 70 },
                    biodiversity_nbs: { x: 1030, y: 110 },
                    circular_bio: { x: 1280, y: 110 }
                  };
                  const pos = positions[c.id] || { x: 750, y: 100 };
                  const isFiltered = selectedConstellationId !== 'all' && selectedConstellationId !== c.id;

                  return (
                    <g key={`zenith-${c.id}`} transform={`translate(${pos.x}, ${pos.y})`} opacity={isFiltered ? 0.2 : 0.9}>
                      <text
                        textAnchor="middle"
                        fill={c.color}
                        fontSize="12"
                        fontWeight="900"
                        letterSpacing="0.08em"
                        className="uppercase"
                      >
                        {c.code}
                      </text>
                      <text
                        y="16"
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="9.5"
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
                    onClick={() => handleNodeClick(node)}
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

            {/* ── 3. TOOLTIP FLOTANTE (DENTRO DEL GRUPO TRANSFORMADO PARA CALCE EXACTO) ── */}
            {hoveredNode && !isDragging && (
              <foreignObject
                x={hoveredNode.x - 120}
                y={hoveredNode.y - (hoveredNode.y < 180 ? -35 : 130)}
                width={240}
                height={120}
                className="pointer-events-none select-none z-50 overflow-visible"
              >
                <div className="px-3 py-2 rounded-xl bg-slate-950/95 border border-white/20 text-xs shadow-2xl backdrop-blur-md">
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
                  <p className="font-extrabold text-white text-[11px] leading-tight truncate">
                    {hoveredNode.title}
                  </p>
                  <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {hoveredNode.description}
                  </p>
                  <div className="mt-1 pt-1 border-t border-white/10 text-[8.5px] text-amber-400 font-bold flex items-center justify-between">
                    <span>{isNodeUnlocked(hoveredNode.id) ? '✓ Desbloqueado' : '🔒 Bloqueado'}</span>
                    <span className="text-slate-400">Clic para abrir ficha</span>
                  </div>
                </div>
              </foreignObject>
            )}
          </g>
          </svg>
        </div>
      </div>

      {/* ── MODAL DRAWER LATERAL: DETALLES DEL NODO & GESTIÓN DE EVIDENCIA ── */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090f1e]/98 border border-white/20 shadow-2xl p-6 sm:p-8 text-slate-200 space-y-6"
            >
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cabecera del Nodo */}
              <div className="space-y-3 pr-10">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Constelación Badge */}
                  {selectedNode.constellationId !== 'core' && (
                    <span
                      className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950"
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
                    className={`px-3.5 py-1 rounded-full text-xs sm:text-sm font-black border ${
                      TIER_LABELS[selectedNode.tier]?.border
                    } ${TIER_LABELS[selectedNode.tier]?.text} bg-white/5`}
                  >
                    {TIER_LABELS[selectedNode.tier]?.label}
                  </span>
                  {/* Puntos Badge */}
                  <span className="px-3 py-1 rounded-lg text-xs sm:text-sm font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    +{TIER_POINTS[selectedNode.tier]} Puntos de Talento (TP)
                  </span>
                  {/* SIG Instrumental */}
                  {selectedNode.isInstrumental && (
                    <span className="px-3 py-1 rounded-lg text-xs sm:text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                      <Satellite className="w-4 h-4" />
                      Instrumental SIG
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3.5 pt-1">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg"
                    style={{
                      backgroundColor: `${
                        CONSTELLATIONS.find((c) => c.id === selectedNode.constellationId)?.color ||
                        '#00e03c'
                      }30`
                    }}
                  >
                    <RenderTalentIcon iconName={selectedNode.icon} className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="font-mono text-sm sm:text-base text-slate-300 font-bold block mb-0.5">
                      {selectedNode.shortCode} · Track: {selectedNode.track}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {selectedNode.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Estado de Desbloqueo Actual Banner */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isNodeUnlocked(selectedNode.id)
                    ? 'bg-[#00e03c]/10 border-[#00e03c]/35 text-white shadow-lg shadow-[#00e03c]/5'
                    : 'bg-white/[0.03] border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isNodeUnlocked(selectedNode.id) ? (
                    <CheckCircle2 className="w-6 h-6 text-[#00e03c] flex-shrink-0" />
                  ) : (
                    <Lock className="w-6 h-6 text-slate-500 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-sm sm:text-base font-extrabold block">
                      {isNodeUnlocked(selectedNode.id)
                        ? 'Talento Activo en el Perfil del Socio'
                        : 'Talento Bloqueado / Pendiente de Acreditación'}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-300 block mt-0.5">
                      {isNodeUnlocked(selectedNode.id)
                        ? 'Aporta a la cotización y liderazgo técnico de proyectos en SERAM.'
                        : 'Puedes acreditarlo completando la formación o subiendo tu certificado oficial en PDF.'}
                    </span>
                  </div>
                </div>

                {/* Switch rápido de desbloqueo (Admin / Testing) */}
                {selectedNode.id !== 'root_core' && (
                  <button
                    type="button"
                    onClick={() => handleToggleUnlock(selectedNode.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex-shrink-0 ${
                      isNodeUnlocked(selectedNode.id)
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-[#00e03c] text-slate-950 font-black hover:bg-[#00e03c]/90 shadow-md shadow-[#00e03c]/20'
                    }`}
                  >
                    {isNodeUnlocked(selectedNode.id) ? 'Desactivar' : 'Desbloquear'}
                  </button>
                )}
              </div>

              {/* Descripción Técnica y Aplicación en SERAM */}
              <div className="space-y-4 bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                <div>
                  <span className="font-extrabold text-slate-300 uppercase text-xs sm:text-sm tracking-wider block mb-1.5">
                    Descripción del Alcance Técnico
                  </span>
                  <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                    {selectedNode.description}
                  </p>
                </div>

                <div>
                  <span className="font-extrabold text-amber-400 uppercase text-xs sm:text-sm tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Aplicación Práctica y Facturación en SERAM
                  </span>
                  <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                    {selectedNode.seramUse}
                  </p>
                </div>

                {/* Si es Instrumental SIG */}
                {selectedNode.isInstrumental && (
                  <div className="p-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-100 text-xs sm:text-sm flex items-start gap-2.5">
                    <Satellite className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
                    <span className="leading-relaxed">
                      <strong className="text-white">Especialidad Instrumental:</strong> Esta competencia aporta valor transversal a todas las ramas y no condiciona la titulación de otros socios.
                    </span>
                  </div>
                )}
              </div>

              {/* Certificación Avalada & Academia SERAM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <span className="text-xs sm:text-sm uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Acreditación Externa Sugerida
                  </span>
                  <p className="font-black text-white text-sm sm:text-base">{selectedNode.certification}</p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Válido mediante diploma, credencial profesional o registro oficial.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <span className="text-xs sm:text-sm uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Módulo SERAM Academy
                  </span>
                  <p className="font-black text-white text-sm sm:text-base">{selectedNode.academyCourse}</p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Formación interna continua para acelerar tu progresión.
                  </p>
                </div>
              </div>

              {/* ── FORMULARIO: REGISTRAR EVIDENCIA DE CERTIFICADO & SUBIR PDF ── */}
              {selectedNode.id !== 'root_core' && (
                <form
                  onSubmit={handleSaveCertificate}
                  className="p-5 sm:p-6 rounded-2xl bg-black/50 border border-white/15 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-[#00e03c]" />
                      Vincular Certificado / Registro Oficial
                    </span>
                    <span className="text-xs text-slate-400">Guarda evidencia en tu perfil</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-slate-300 uppercase block mb-1.5">
                        Institución Emisora *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. IFC / GBCI, Verra, SIB, MMAyA"
                        value={certForm.institution}
                        onChange={(e) =>
                          setCertForm({ ...certForm, institution: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-[#00e03c] text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-bold text-slate-300 uppercase block mb-1.5">
                        Fecha de Emisión
                      </label>
                      <input
                        type="date"
                        value={certForm.date}
                        onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-[#00e03c] text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs sm:text-sm font-bold text-slate-300 uppercase block mb-1.5">
                        N° Folio, Matrícula o Enlace de Verificación
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. REG-2026-EDGE-8491 ó https://credential.net/..."
                        value={certForm.codeOrUrl}
                        onChange={(e) =>
                          setCertForm({ ...certForm, codeOrUrl: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-[#00e03c] text-sm"
                      />
                    </div>

                    {/* ── ZONA DE CARGA DE ARCHIVO PDF ── */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-300 uppercase block">
                        Certificado o Diploma en PDF
                      </label>

                      {certForm.pdfData ? (
                        <div className="p-4 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/30 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#00e03c]/20 border border-[#00e03c]/40 flex items-center justify-center flex-shrink-0 text-[#00e03c]">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-bold text-white block truncate">
                                {certForm.pdfName || 'Certificado.pdf'}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {certForm.pdfSize || 'Documento PDF'} · Archivo adjunto
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={certForm.pdfData}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Ver PDF
                            </a>
                            <button
                              type="button"
                              onClick={handleRemovePdf}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              title="Quitar este archivo PDF"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Quitar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#00e03c] bg-white/[0.02] hover:bg-[#00e03c]/5 transition-all cursor-pointer group">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#00e03c] mb-1.5 transition-colors" />
                          <span className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-white text-center">
                            Subir Certificado / Diploma en PDF (máx. 8 MB)
                          </span>
                          <span className="text-[11px] text-slate-500 text-center mt-0.5">
                            Haz clic para examinar o arrastra el archivo aquí
                          </span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handlePdfUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-sm hover:bg-[#00e03c]/90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00e03c]/20"
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

  return isFullscreen ? createPortal(treeContent, document.body) : treeContent;
}

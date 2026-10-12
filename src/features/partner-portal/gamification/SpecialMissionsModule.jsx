import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Trophy, Users, Zap, Clock, Shield,
  Award, CheckCircle2, ChevronRight, Gift, Flame,
  Globe2, Lock, ArrowUpRight, Plus, RefreshCw, X
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

// ── DEFINICIÓN DE TIERS DE COFRES & RESPLANDOR ─────────────────────────────
export const CHEST_TIERS = {
  green: {
    id: 'green',
    name: 'Cofre Esmeralda',
    glowColor: 'rgba(0, 224, 60, 0.45)',
    border: 'border-[#00e03c]/40',
    bg: 'from-[#00e03c]/10 to-transparent',
    textColor: 'text-[#00e03c]',
    icon: '🟢',
    badge: 'Misiones Flash & Sencillas',
    xpMin: 5,
    xpMax: 25,
    perks: ['+5% a +25% XP Aumentado', '+150 Puntos de Impacto Planetario (PIP)']
  },
  purple: {
    id: 'purple',
    name: 'Cofre Amatista',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    border: 'border-purple-500/40',
    bg: 'from-purple-500/10 to-transparent',
    textColor: 'text-purple-400',
    icon: '🟣',
    badge: 'Misiones Secundarias Especiales',
    xpMin: 20,
    xpMax: 35,
    perks: ['+25% a +35% XP Aumentado', 'Multiplicador de Tarifa 1.15x (12h)', '+350 PIP Colectivo']
  },
  blue: {
    id: 'blue',
    name: 'Cofre Zafiro',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    border: 'border-blue-500/40',
    bg: 'from-blue-500/10 to-transparent',
    textColor: 'text-blue-400',
    icon: '🔵',
    badge: 'Misiones Complejas & Periciales',
    xpMin: 35,
    xpMax: 45,
    perks: ['+35% a +45% XP Aumentado', 'Multiplicador de Tarifa 1.25x (24h)', 'Privilegio de Liderazgo Preferente', '+650 PIP Colectivo']
  },
  gold: {
    id: 'gold',
    name: 'Cofre Legendario Dorado',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    border: 'border-amber-400/50',
    bg: 'from-amber-500/15 to-transparent',
    textColor: 'text-amber-300',
    icon: '🟡',
    badge: 'Misión Grupal Trinitaria (3 Socios)',
    xpMin: 45,
    xpMax: 50,
    perks: ['+50% XP Aumentado Máximo', 'Multiplicador de Tarifa 1.50x (24h)', 'Voto Dirimente & Liderazgo de Consorcio', '+1,500 PIP Colectivo']
  }
};

// ── MISIONES SEMILLA INICIALES ──────────────────────────────────────────────
const INITIAL_SPECIAL_MISSIONS = [
  {
    id: 'sm_1',
    type: 'group', // 'group' | 'flash' | 'secondary' | 'complex'
    title: 'Raid Trinitario: Expediente Integral Cuenca Madre de Dios',
    desc: 'Los tres socios deben confluir sus ramas simultáneamente: Diego elabora el modelo de cuenca hidrológica satelital, Fabricio ejecuta el protocolo de muestreo de mercurio y Fernando blindará la viabilidad de la licencia ambiental.',
    assignedPartners: ['Ing. Diego Barrientos', 'Ing. Fernando Araujo', 'Ing. Fabricio Orosco'],
    chestTier: 'gold',
    deadline: '2026-10-31',
    status: 'in_progress', // 'in_progress' | 'ready_to_open' | 'claimed'
    progress: 65,
    streakBonus: '+50% XP + 1.5x Tarifa 24h',
  },
  {
    id: 'sm_2',
    type: 'flash',
    title: 'Alerta Flash 72h: Decreto de Pasivos Mineros Críticos',
    desc: 'Emitir minuta técnica institucional y dictamen preliminar pericial ante la nueva resolución ministerial sobre drenaje ácido de roca antes de vencer el plazo de 72 horas.',
    assignedPartners: ['Ing. Fernando Araujo', 'Ing. Diego Barrientos'],
    chestTier: 'green',
    deadline: '2026-10-14T18:00:00Z',
    hoursRemaining: 68,
    status: 'in_progress',
    progress: 30,
    streakBonus: '+25% XP Flash',
  },
  {
    id: 'sm_3',
    type: 'secondary',
    title: 'Misión Secundaria: Calibración de Geodatabase QGIS 2026',
    desc: 'Estandarizar capas shapefiles y ortomosaicos históricos de la empresa bajo proyección EPSG:32719 con simbología Neuform.',
    assignedPartners: ['Ing. Diego Barrientos'],
    chestTier: 'purple',
    deadline: null, // Plazo flexible
    status: 'in_progress',
    progress: 40,
    streakBonus: '+30% XP + 1.15x Tarifa 12h',
  },
  {
    id: 'sm_4',
    type: 'complex',
    title: 'Peritaje Complejo: Modelación de Metales Pesados en Sedimentos',
    desc: 'Elaboración del informe de auditoría forense ambiental para el consorcio minero en Potosí con análisis de especiación química y cadena de custodia notariada.',
    assignedPartners: ['Ing. Fabricio Orosco', 'Ing. Diego Barrientos'],
    chestTier: 'blue',
    deadline: '2026-10-25',
    status: 'ready_to_open', // Listo para abrir el cofre
    progress: 100,
    streakBonus: '+40% XP + 1.25x Tarifa 24h',
  }
];

export default function SpecialMissionsModule({ currentSocio }) {
  const { activities = [], triggerToast } = useApp();

  // Estado de misiones especiales
  const [missions, setMissions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seram_special_missions_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_SPECIAL_MISSIONS;
  });

  // Estado de filtros
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'group' | 'flash' | 'secondary' | 'complex'

  // Modal de apertura de cofre
  const [openingMission, setOpeningMission] = useState(null);
  const [isChestOpening, setIsChestOpening] = useState(false);
  const [claimedReward, setClaimedReward] = useState(null);

  // Guardar en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('seram_special_missions_v1', JSON.stringify(missions));
    }
  }, [missions]);

  // ── CÁLCULO DE PUNTOS DE IMPACTO PLANETARIO (PIP) - "DEJAR EL MUNDO MEJOR" ──
  const collectivePIP = useMemo(() => {
    // PIP base derivado del XP de actividades concluidas en la plataforma
    const baseCompletedActivitiesXP = activities
      .filter(a => a.status === 'Concluido')
      .reduce((acc, curr) => acc + (Number(curr.hours) || 1) * 120, 0);

    // PIP extra por misiones especiales reclamadas
    const claimedBonusPIP = missions
      .filter(m => m.status === 'claimed')
      .reduce((acc, curr) => {
        if (curr.chestTier === 'gold') return acc + 1500;
        if (curr.chestTier === 'blue') return acc + 650;
        if (curr.chestTier === 'purple') return acc + 350;
        return acc + 150;
      }, 0);

    return Math.max(1250, baseCompletedActivitiesXP + claimedBonusPIP);
  }, [activities, missions]);

  const PIP_GOAL = 10000;
  const pipPercentage = Math.min(100, Math.round((collectivePIP / PIP_GOAL) * 100));

  // Filtrado de misiones
  const filteredMissions = useMemo(() => {
    if (categoryFilter === 'all') return missions;
    return missions.filter(m => m.type === categoryFilter);
  }, [missions, categoryFilter]);

  // Manejar completar misión
  const handleMarkAsReady = (missionId) => {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId) {
        return { ...m, status: 'ready_to_open', progress: 100 };
      }
      return m;
    }));
    triggerToast?.('¡Misión completada! El Cofre de Resplandor está listo para abrirse.');
  };

  // Abrir cofre
  const handleOpenChest = (mission) => {
    setOpeningMission(mission);
    setIsChestOpening(true);
    setClaimedReward(null);

    // Simular animación y cálculo dinámico de recompensa (Octalysis CD7)
    setTimeout(() => {
      const tierConfig = CHEST_TIERS[mission.chestTier] || CHEST_TIERS.green;
      const randomXPBonus = Math.floor(Math.random() * (tierConfig.xpMax - tierConfig.xpMin + 1)) + tierConfig.xpMin;
      
      const reward = {
        tierName: tierConfig.name,
        xpBonus: `+${randomXPBonus}% XP Aumentado`,
        pipAwarded: mission.chestTier === 'gold' ? 1500 : mission.chestTier === 'blue' ? 650 : mission.chestTier === 'purple' ? 350 : 150,
        perk: tierConfig.perks[1] || 'Privilegio de Racha Activo',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setClaimedReward(reward);
      setIsChestOpening(false);

      // Actualizar estado de la misión a reclamada
      setMissions(prev => prev.map(m => {
        if (m.id === mission.id) {
          return { ...m, status: 'claimed' };
        }
        return m;
      }));

      triggerToast?.(`¡Has abierto el ${tierConfig.name}! Recompensa agregada a tu expediente.`);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* ── BANNER MACRO: MISIÓN "DEJAR EL MUNDO MEJOR" & PUNTOS PIP ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 p-5 sm:p-6 backdrop-blur-md shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/35 text-[10px] font-black uppercase tracking-widest text-emerald-300">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              Misión Macro Planetaria de SERAM
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              DEJAR EL MUNDO MEJOR
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Causa trascendente y motor vocacional del directorio. Cada hora pericial, reporte de cuenca y neutralización de pasivos mineros alimenta el indicador de impacto ecológico colectivo.
            </p>
          </div>

          {/* Marcador Unificado PIP */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-w-[280px] shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Puntos de Impacto Planetario
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Meta: {PIP_GOAL.toLocaleString()} PIP
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#00e03c] font-mono leading-none">
                {collectivePIP.toLocaleString()}
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                PIP Acumulados
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="mt-3 space-y-1">
              <div className="w-full bg-slate-950/80 rounded-full h-2.5 p-0.5 border border-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pipPercentage}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#00e03c] to-amber-400 shadow-sm shadow-[#00e03c]"
                />
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>Hito I: Blindaje de Cuenca Piloto</span>
                <span className="font-bold text-white">{pipPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BARRA DE CATEGORÍAS & FILTROS DE MISIONES ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl p-1 flex-wrap">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({missions.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('group')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'group'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🟡 Grupales (3 Socios)</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('flash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'flash'
                ? 'bg-emerald-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🟢 Misiones Flash (72-96h)</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('secondary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'secondary'
                ? 'bg-purple-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🟣 Secundarias</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('complex')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              categoryFilter === 'complex'
                ? 'bg-blue-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔵 Periciales Complejas</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Misiones Activas: <span className="font-bold text-white">{filteredMissions.length}</span>
        </div>
      </div>

      {/* ── CUADRÍCULA DE MISIONES Y COFRES DE RESPLANDOR ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMissions.map((mission) => {
          const tier = CHEST_TIERS[mission.chestTier] || CHEST_TIERS.green;
          const isReady = mission.status === 'ready_to_open';
          const isClaimed = mission.status === 'claimed';

          return (
            <motion.div
              key={mission.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl border p-5 relative overflow-hidden flex flex-col justify-between transition-all backdrop-blur-sm ${
                isReady
                  ? `${tier.border} bg-gradient-to-br ${tier.bg} shadow-xl`
                  : isClaimed
                  ? 'border-white/[0.06] bg-white/[0.01] opacity-75'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
              }`}
              style={{
                boxShadow: isReady ? `0 10px 30px -8px ${tier.glowColor}` : undefined
              }}
            >
              {/* Resplandor pulsante si está listo para abrir */}
              {isReady && (
                <div
                  className="absolute inset-0 pointer-events-none animate-pulse opacity-30"
                  style={{
                    background: `radial-gradient(circle at 85% 15%, ${tier.glowColor}, transparent 60%)`
                  }}
                />
              )}

              {/* Cabecera de la Misión */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1"
                      style={{
                        backgroundColor: `${tier.glowColor}`,
                        color: '#ffffff',
                        border: `1px solid ${tier.border}`
                      }}
                    >
                      {tier.icon} {mission.type === 'group' ? 'GRUPAL TRINITARIA' : mission.type === 'flash' ? 'FLASH (72-96h)' : mission.type === 'secondary' ? 'SECUNDARIA' : 'PERICIAL COMPLEJA'}
                    </span>
                    {mission.hoursRemaining && !isClaimed && (
                      <span className="text-[9px] font-black font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {mission.hoursRemaining}h restantes
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-mono font-bold ${tier.textColor}`}>
                    {tier.name}
                  </span>
                </div>

                <h3 className="text-base font-black text-white leading-snug">
                  {mission.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {mission.desc}
                </p>

                {/* Socios Asignados */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {mission.type === 'group' ? 'Los 3 Socios:' : 'Asignado a:'}
                  </span>
                  {mission.assignedPartners.map(p => (
                    <span
                      key={p}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-slate-300 flex items-center gap-1"
                    >
                      <Users className="w-3 h-3 text-[#00e03c]" />
                      {p.replace('Ing. ', '')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bloque Inferior: Cofre y Acción */}
              <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-4 relative z-10">
                {/* Visual del Cofre con Resplandor */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all relative ${
                      isReady ? 'animate-bounce' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.5))`,
                      border: `1.5px solid ${isReady ? tier.glowColor : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: isReady ? `0 0 20px ${tier.glowColor}` : 'none'
                    }}
                  >
                    <span>{tier.icon}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                      Recompensa Potencial
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {mission.streakBonus}
                    </span>
                  </div>
                </div>

                {/* Botón de Acción */}
                <div>
                  {isClaimed ? (
                    <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#00e03c]" />
                      Reclamado
                    </div>
                  ) : isReady ? (
                    <button
                      type="button"
                      onClick={() => handleOpenChest(mission)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-[#00e03c] text-slate-950 font-black text-xs transition-all shadow-lg shadow-[#00e03c]/20 hover:scale-105 cursor-pointer flex items-center gap-2"
                    >
                      <Gift className="w-4 h-4" />
                      ¡Abrir Cofre!
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkAsReady(mission.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Validar Entrega</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── MODAL DE APERTURA DE COFRE CON RESPLANDOR (OCTALYSIS CD7) ── */}
      <AnimatePresence>
        {openingMission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl"
              style={{
                boxShadow: `0 0 50px ${CHEST_TIERS[openingMission.chestTier]?.glowColor || 'rgba(0,224,60,0.3)'}`
              }}
            >
              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setOpeningMission(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>

              {isChestOpening ? (
                /* Animación de Apertura */
                <div className="py-8 space-y-4">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.15, 1.25, 1.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-6xl inline-block filter drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                  >
                    {CHEST_TIERS[openingMission.chestTier]?.icon}
                  </motion.div>
                  <h4 className="text-lg font-black text-white animate-pulse">
                    Abriendo {CHEST_TIERS[openingMission.chestTier]?.name}...
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sintonizando resonancia pericial y bonificación de racha...
                  </p>
                </div>
              ) : claimedReward ? (
                /* Revelación de Recompensa Ganada */
                <div className="py-4 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20">
                    🏆
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      ¡Recompensa Desbloqueada con Éxito!
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {claimedReward.tierName}
                    </h3>
                  </div>

                  {/* Tarjetas de Beneficios */}
                  <div className="space-y-2 bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl text-left">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/[0.06] pb-2">
                      <span className="text-slate-400">Bonificación de XP:</span>
                      <span className="text-[#00e03c] font-black">{claimedReward.xpBonus}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/[0.06] pb-2">
                      <span className="text-slate-400">Impacto Macro:</span>
                      <span className="text-emerald-400 font-mono">+{claimedReward.pipAwarded} PIP</span>
                    </div>
                    <div className="text-xs text-amber-300 font-medium pt-1">
                      ✨ {claimedReward.perk}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpeningMission(null)}
                    className="w-full py-3 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs transition-all shadow-lg shadow-[#00e03c]/20 hover:scale-[1.02] cursor-pointer"
                  >
                    Incorporar al Expediente y Continuar
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

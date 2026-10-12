import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Award, CheckCircle2, ChevronRight, Gift,
  Crown, BookOpen, Scale, Sparkles, ShieldCheck, Flame,
  Zap, Star, Lock, Clock, ArrowUpRight, Check, Trophy
} from 'lucide-react';

export default function PlayerJourneyModule({
  currentSocio,
  activeProfile,
  rpgStats,
  activities = [],
  timeLogs = [],
  triggerToast
}) {
  const [activeTab, setActiveTab] = useState('onboarding'); // 'onboarding' | 'endgame'
  const [claimedFirstWin, setClaimedFirstWin] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`seram_first_win_${activeProfile.email}`) === 'true';
    }
    return false;
  });

  // Sincronizar estado de reclamación al cambiar de socio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`seram_first_win_${activeProfile.email}`) === 'true';
      setClaimedFirstWin(saved);
    }
  }, [activeProfile.email]);

  // ── 1. HITOS DEL ONBOARDING (RUTA DE LA PRIMERA VICTORIA / FIRST WIN) ──
  const onboardingSteps = useMemo(() => {
    const hasCredentials = Boolean(activeProfile.hasCV || activeProfile.hasSIB || activeProfile.hasRENCA || activeProfile.matricula);
    const hasSkin = Boolean(activeProfile.skin);
    const hasLoggedHours = Number(rpgStats.totalHours || 0) > 0;
    const hasCompletedTask = Number(rpgStats.completedTasksCount || 0) > 0;

    return [
      {
        id: 'step_1',
        title: 'Expediente & Credenciales Oficiales',
        desc: 'Vincular CV en PDF o registrar matrícula técnica (SIB / RENCA).',
        completed: hasCredentials,
        xpReward: 100,
        icon: '📄',
        category: 'Acreditación',
      },
      {
        id: 'step_2',
        title: 'Atuendo Oficial en Oficina Virtual',
        desc: 'Equipar indumentaria corporativa (chaleco de campo, traje o bata de laboratorio).',
        completed: hasSkin,
        xpReward: 50,
        icon: '🦺',
        category: 'Identidad RPG',
      },
      {
        id: 'step_3',
        title: 'Primera Jornada en Time Tracker',
        desc: 'Registrar al menos 1 hora pericial verificada en la Oficina Virtual de SERAM.',
        completed: hasLoggedHours,
        xpReward: 100,
        icon: '⏱️',
        category: 'Productividad',
      },
      {
        id: 'step_4',
        title: 'Primer Entregable Técnico Validado (First Win)',
        desc: 'Concluir y recibir aprobación cruzada sin observaciones de un entregable en Actividades Clave.',
        completed: hasCompletedTask,
        xpReward: 250,
        icon: '🏆',
        category: 'Validación por Pares',
      },
    ];
  }, [activeProfile, rpgStats]);

  const completedStepsCount = onboardingSteps.filter(s => s.completed).length;
  const onboardingProgressPercent = Math.round((completedStepsCount / onboardingSteps.length) * 100);
  const isFirstWinReady = completedStepsCount === onboardingSteps.length;

  const handleClaimFirstWin = () => {
    setClaimedFirstWin(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`seram_first_win_${activeProfile.email}`, 'true');
    }
    triggerToast?.('🏆 ¡Primera Victoria Alcanzada! Cofre de Bienvenida incorporado a tu expediente.');
  };

  // ── 2. BUCLE DE ENDGAME (NIVELES 29 A 33 - MAESTRÍA & LEGADO SOCIETARIO) ──
  const isEndgameActive = rpgStats.level >= 29;
  const isApex33 = rpgStats.level === 33;

  const endgamePerks = [
    {
      id: 'perk_academy',
      title: 'Cátedra Magistral en SERAM Academy',
      desc: 'Capacidad exclusiva de publicar cursos de autor, dictar webinars certificados y recibir regalías internas de XP e ingresos por cada consultor formado.',
      minLevel: 25,
      isUnlocked: rpgStats.level >= 25,
      icon: BookOpen,
      accentColor: 'text-amber-400',
      tag: 'Formación de Talento',
      benefit: 'Regalías Pasivas + Reconocimiento Institucional',
    },
    {
      id: 'perk_validator',
      title: 'Validador Cumbre & Árbitro Deontológico',
      desc: 'Autoridad pericial dirimente para emitir el Sello de Aprobación Final en litigios agroambientales, peritajes de arbitraje (> $10,000 USD) y recursos de alzada.',
      minLevel: 29,
      isUnlocked: rpgStats.level >= 29,
      icon: Scale,
      accentColor: 'text-purple-400',
      tag: 'Poder Probatorio',
      benefit: 'Doble Firma Pericial + Inmunidad Corporativa',
    },
    {
      id: 'perk_legacy',
      title: 'Patrimonio Planetario & Legado Societario (Grado 33)',
      desc: 'El cénit absoluto de SERAM: Multiplicador permanente de 2.50x de tarifa, voto dirimente en la junta societaria y tutela vitalicia del indicador colectivo PIP.',
      minLevel: 33,
      isUnlocked: isApex33,
      icon: Crown,
      accentColor: 'text-amber-300',
      tag: 'Cénit Supremo',
      benefit: 'Tarifa 2.50x + Voto Dirimente en Directorio',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-white/[0.05] via-slate-900/60 to-black/80 border border-white/[0.1] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl space-y-6">
      <div className="absolute top-0 right-1/4 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER DEL PLAYER JOURNEY ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-indigo-400" /> Player Journey Octalysis
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Onboarding & Endgame
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Ciclo de Vida Profesional del Consultor
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Desde la inducción inicial y la primera victoria técnica (First Win), hasta el bucle de maestría,
            cátedra universitaria y proyectos de legado societario en el Grado 33.
          </p>
        </div>

        {/* Selector de Pestañas Onboarding vs Endgame */}
        <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-xl p-1 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('onboarding')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'onboarding'
                ? 'bg-[#00e03c] text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Onboarding (First Win)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('endgame')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'endgame'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Endgame (Nivel 33)</span>
          </button>
        </div>
      </div>

      {/* ── VISTA 1: ONBOARDING DE NUEVOS PERITOS (FIRST WIN FLOW) ── */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6 relative z-10">
          {/* Tarjeta de Resumen y Barra de Progreso del Onboarding */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-lg">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Ruta de Inducción al Semillero
              </span>
              <h4 className="text-base font-black text-white">
                {isFirstWinReady
                  ? '¡Todos los Hitos de Inducción Han Sido Concluidos!'
                  : `Progreso de Inducción: ${completedStepsCount} de 4 Hitos Completados`}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Completa los 4 pasos iniciales para consolidar tu perfil técnico, desbloquear tu primer cofre de recompensa y ascender a la autonomía pericial.
              </p>
            </div>

            {/* Barra y Botón de Reclamar */}
            <div className="flex flex-col items-start md:items-end gap-2.5 min-w-[240px]">
              <div className="w-full flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-bold">Avance Global</span>
                <span className="text-[#00e03c] font-black">{onboardingProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 p-0.5 border border-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${onboardingProgressPercent}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#00e03c]"
                />
              </div>

              {claimedFirstWin ? (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-[#00e03c]" />
                  Cofre de Bienvenida Reclamado
                </div>
              ) : isFirstWinReady ? (
                <button
                  type="button"
                  onClick={handleClaimFirstWin}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-[#00e03c] text-slate-950 font-black text-xs hover:scale-105 transition-all shadow-lg shadow-[#00e03c]/20 flex items-center gap-2 cursor-pointer mt-1 animate-bounce"
                >
                  <Gift className="w-4 h-4" />
                  ¡Reclamar Cofre de Bienvenida!
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  Faltan {4 - completedStepsCount} pasos para reclamar
                </span>
              )}
            </div>
          </div>

          {/* Lista de los 4 Pasos del Onboarding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {onboardingSteps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  step.completed
                    ? 'border-[#00e03c]/30 bg-[#00e03c]/5'
                    : 'border-white/[0.06] bg-white/[0.01]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xl shrink-0">
                  {step.icon}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      Paso #{idx + 1} · {step.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300">
                      +{step.xpReward} XP
                    </span>
                  </div>

                  <h5 className={`text-xs font-black truncate ${step.completed ? 'text-white' : 'text-slate-300'}`}>
                    {step.title}
                  </h5>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>

                  <div className="pt-1 flex items-center gap-1.5">
                    {step.completed ? (
                      <span className="text-[10px] font-bold text-[#00e03c] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00e03c]" /> Hito Superado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pendiente de Acreditación
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VISTA 2: BUCLE DE ENDGAME (NIVELES 29 A 33) ── */}
      {activeTab === 'endgame' && (
        <div className="space-y-6 relative z-10">
          {/* Banner de Estado de Endgame */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Cénit Societario & Maestría
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Nivel Actual: {rpgStats.level} / 33
                </span>
              </div>
              <h4 className="text-base font-black text-white">
                {isApex33
                  ? '¡Has Alcanzado el Grado 33: Socio Emérito & Arquitecto Planetario!'
                  : isEndgameActive
                  ? 'Fase de Consejo Supremo Activa (Nivel 29 - 32)'
                  : 'Proyección de Carrera hacia los Grados de Cénit (29 a 33)'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                El bucle de Endgame asegura que los socios de mayor experiencia permanezcan activos
                y motivados mediante cátedra, regalías académicas, arbitraje de alta cuantía y legado institucional.
              </p>
            </div>

            {/* Proximidad al Grado 33 */}
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center shrink-0 min-w-[200px] text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Multiplicador Actual
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono my-0.5">
                {rpgStats.feeMultiplier.toFixed(2)}x Tarifa
              </span>
              <span className="text-[10px] text-slate-400">
                {isApex33 ? 'Tope Máximo Alcanzado' : `Meta Grado 33: 2.50x Tarifa`}
              </span>
            </div>
          </div>

          {/* Tres Prerrogativas del Bucle de Endgame */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {endgamePerks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
                    perk.isUnlocked
                      ? 'border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-slate-900 to-black/80 shadow-lg shadow-amber-500/10'
                      : 'border-white/[0.06] bg-white/[0.02] opacity-80'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-lg">
                        <Icon className={`w-5 h-5 ${perk.accentColor}`} />
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        perk.isUnlocked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-white/[0.04] text-slate-500 border-white/10'
                      }`}>
                        {perk.isUnlocked ? '✓ Habilitado' : `Req. Nivel ${perk.minLevel}`}
                      </span>
                    </div>

                    <h5 className="text-sm font-black text-white leading-snug">
                      {perk.title}
                    </h5>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] space-y-1 text-[10px]">
                    <span className="text-slate-400 font-bold block uppercase tracking-wider">
                      Beneficio Permanente:
                    </span>
                    <span className="text-amber-300 font-bold font-mono">
                      {perk.benefit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

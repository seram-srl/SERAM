import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Map, ShieldAlert, Leaf, Info, ChevronDown,
  ChevronUp, CheckCircle2, Sparkles, Scale, Activity, X
} from 'lucide-react';
import { BIOPHYSICAL_FACTORS } from './BiophysicalImpactEngine';

export default function BiophysicalImpactPanel({ biophysicalData }) {
  const [showFormulasModal, setShowFormulasModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!biophysicalData) return null;

  const {
    waterM3,
    landHectares,
    pollutantsKg,
    carbonTons,
    pipWater,
    pipLand,
    pipPollutants,
    pipCarbon,
    pipMissionsBonus,
    totalPIP,
    analogies,
    completedActsCount,
    claimedMissionsCount
  } = biophysicalData;

  const cards = [
    {
      id: 'water',
      title: 'Agua Dulce & Cuencas Monitoreadas',
      value: `${waterM3.toLocaleString()} m³`,
      analogy: analogies.water,
      pipContribution: pipWater,
      icon: Droplets,
      color: '#38bdf8',
      accentBorder: 'border-sky-500/30',
      bgGradient: 'from-sky-500/10 via-sky-950/20 to-black/60',
      metricLabel: 'Caudal & Calidad Auditada',
    },
    {
      id: 'land',
      title: 'Territorio & Ecosistemas Cartografiados',
      value: `${landHectares.toLocaleString()} ha`,
      analogy: analogies.land,
      pipContribution: pipLand,
      icon: Map,
      color: '#10b981',
      accentBorder: 'border-emerald-500/30',
      bgGradient: 'from-emerald-500/10 via-emerald-950/20 to-black/60',
      metricLabel: 'Georreferenciación Satelital',
    },
    {
      id: 'pollutants',
      title: 'Pasivos Mineros & Metales Contenidos',
      value: `${pollutantsKg.toLocaleString()} kg`,
      analogy: analogies.pollutants,
      pipContribution: pipPollutants,
      icon: ShieldAlert,
      color: '#f59e0b',
      accentBorder: 'border-amber-500/30',
      bgGradient: 'from-amber-500/10 via-amber-950/20 to-black/60',
      metricLabel: 'Contención DAR & Relaves',
    },
    {
      id: 'carbon',
      title: 'Emisiones de Carbono Mitigadas / Auditadas',
      value: `${carbonTons.toLocaleString()} tCO₂e`,
      analogy: analogies.carbon,
      pipContribution: pipCarbon,
      icon: Leaf,
      color: '#a855f7',
      accentBorder: 'border-purple-500/30',
      bgGradient: 'from-purple-500/10 via-purple-950/20 to-black/60',
      metricLabel: 'Estándares EDGE & GHG Protocol',
    },
  ];

  return (
    <div className="space-y-3">
      {/* ── BARRA DE TÍTULO Y CONTROL DEL DESGLOSE BIOFÍSICO ── */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4 text-[#00e03c]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
              Auditoría Ecológica en Tiempo Real
            </span>
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              Desglose Biofísico de Impacto Planetario
              <span className="text-[9px] text-[#00e03c] font-mono font-bold bg-[#00e03c]/10 px-2 py-0.5 rounded border border-[#00e03c]/20">
                100% Auditable
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFormulasModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Metodología & Fórmulas</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
            title={isExpanded ? 'Plegar desglose biofísico' : 'Desplegar desglose biofísico'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── CUADRÍCULA DE LAS 4 MAGNITUDES BIOFÍSICAS ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-hidden"
          >
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-xl border ${card.accentBorder} bg-gradient-to-b ${card.bgGradient} relative overflow-hidden space-y-2 backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{
                        backgroundColor: `${card.color}15`,
                        borderColor: `${card.color}35`,
                        color: card.color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${card.color}15`,
                        color: card.color,
                        borderColor: `${card.color}30`,
                      }}
                    >
                      +{card.pipContribution} PIP
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {card.metricLabel}
                    </span>
                    <h5 className="text-lg font-black text-white font-mono leading-tight">
                      {card.value}
                    </h5>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-snug line-clamp-2 pt-1 border-t border-white/[0.06]">
                    ✨ {card.analogy}
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: METODOLOGÍA & AUDITORÍA BIOFÍSICA PARAMÉTRICA ── */}
      <AnimatePresence>
        {showFormulasModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-emerald-500/30 rounded-3xl p-6 max-w-2xl w-full text-left relative overflow-hidden shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00e03c] flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#00e03c]" />
                    Transparencia y Rigor Técnico
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Metodología de Conversión Biofísica a Puntos PIP
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cómo SERAM S.R.L. convierte horas de consultoría y dictámenes periciales en unidades biofísicas auditables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormulasModal(false)}
                  className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detalle de Factores Paramétricos */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <h5 className="font-black text-sky-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" /> 1. Agua Dulce Monitoreada: {BIOPHYSICAL_FACTORS.waterM3PerHour.toLocaleString()} m³/hora
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Basado en el caudal promedio de cuencas piloto en muestreos hidroquímicos y efluentes mineros. 1 PIP = 250 m³ custodiados bajo cadena de custodia notariada.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <h5 className="font-black text-emerald-400 flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" /> 2. Cobertura Satelital & SIG: {BIOPHYSICAL_FACTORS.landHectaresPerHour} ha/hora
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Rendimiento de procesamiento de ortomosaicos y teledetección multitemporal con Sentinel-2 y ArcGIS Pro. 1 PIP = 2 hectáreas zonificadas para conservación y líneas base.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <h5 className="font-black text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> 3. Pasivos Mineros: {BIOPHYSICAL_FACTORS.pollutantKgPerHour} kg/hora + {BIOPHYSICAL_FACTORS.pollutantKgPerTask} kg/entregable
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Evaluación y contención de relaves, mercurio y drenaje ácido de roca (DAR) en planes PASA y auditorías ambientales. 1 PIP = 5 kg de contaminantes críticos mitigados.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <h5 className="font-black text-purple-400 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5" /> 4. Mitigación Climática: {BIOPHYSICAL_FACTORS.carbonTonsPerHour} tCO₂e/hora (12 PIP/ton)
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Eficiencia en consultorías de bioprocesos, compostaje industrial, certificación EDGE (IFC) y formulación de proyectos de carbono bajo estándares Verra VCS / GHG Protocol.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-[11px]">
                  <span>Misiones Especiales Reclamadas: <strong className="text-white">{claimedMissionsCount}</strong></span>
                  <span className="font-mono text-amber-300 font-bold">+{pipMissionsBonus} PIP Adicionales</span>
                </div>
              </div>

              {/* Botón Cerrar */}
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowFormulasModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-[#00c534] transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

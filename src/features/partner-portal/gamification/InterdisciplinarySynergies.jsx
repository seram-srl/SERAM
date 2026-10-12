import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Shield, Globe, RefreshCw, Zap, CheckCircle2, ChevronRight, Award, Info } from 'lucide-react';

export const PARTNERS_ROSTER = [
  {
    id: 'diego',
    name: 'Ing. Diego Barrientos',
    role: 'Director Técnico & Geomática',
    email: 'barrientoso2401@gmail.com',
    primaryBranches: ['Rama I: EIA & Riesgo', 'Rama III: Clima & Carbono'],
    avatarSkin: '🦺',
    color: '#00e03c',
    specialty: 'Cartografía Satelital, Hidrogeoquímica y Plataformas Web',
  },
  {
    id: 'fernando',
    name: 'Lic. Fernando Araujo',
    role: 'Director Jurídico & Compliance',
    email: 'fernandoaraujo1912@gmail.com',
    primaryBranches: ['Rama II: Sostenibilidad & Compliance', 'Rama V: Economía Circular'],
    avatarSkin: '👔',
    color: '#f59e0b',
    specialty: 'Defensa Legal, Auditorías ISO/SYSO y Registro RENCA',
  },
  {
    id: 'tercer-socio',
    name: 'Consultor Perito Asociado',
    role: 'Especialista en Biodiversidad & Campo',
    email: 'socio3@seram.com',
    primaryBranches: ['Rama IV: Conservación & NbS', 'Rama I: EIA & Riesgo'],
    avatarSkin: '🎒',
    color: '#3b82f6',
    specialty: 'Monitoreo Biológico, Corredores Ecológicos y Trabajo Comunal',
  },
];

export const SYNERGY_COMBOS = [
  {
    id: 'combo-geo-legal',
    name: 'Blindaje Geo-Legal',
    branches: ['Rama I (EIA/Riesgo)', 'Rama II (Compliance/ISO)'],
    requiredPartnerIds: ['diego', 'fernando'],
    xpMultiplier: '+20% XP de Alianza',
    feeBonus: '+15% Tarifa Pericial Conjunta',
    pipBonus: '+100 PIP Planetarios',
    icon: Shield,
    color: '#00e03c',
    accentBorder: 'border-emerald-500/40',
    bgGradient: 'from-emerald-500/15 via-emerald-950/30 to-black/60',
    tacticalBenefit: 'Neutraliza recursos de alzada y multas administrativas mediante sustento cartográfico georreferenciado irrefutable ante la Autoridad Ambiental Competente.',
    deliverableType: 'Dictamen Pericial con Doble Firma (Técnica + Jurídica)',
  },
  {
    id: 'combo-clima-naturaleza',
    name: 'Clima & Capital Natural 360°',
    branches: ['Rama III (Mercados de Carbono)', 'Rama IV (Biodiversidad & NbS)'],
    requiredPartnerIds: ['diego', 'tercer-socio'],
    xpMultiplier: '+25% XP de Alianza',
    feeBonus: '+20% Tarifa Internacional',
    pipBonus: '+250 PIP Planetarios',
    icon: Globe,
    color: '#3b82f6',
    accentBorder: 'border-blue-500/40',
    bgGradient: 'from-blue-500/15 via-blue-950/30 to-black/60',
    tacticalBenefit: 'Permite formular proyectos de créditos de carbono con co-beneficios de biodiversidad auditables bajo estándares Verra VCS y Climate, Community & Biodiversity (CCB).',
    deliverableType: 'Dossier de Factibilidad para Finanzas Verdes y Bonos Climáticos',
  },
  {
    id: 'combo-bioeconomia',
    name: 'Bioeconomía & Cierre de Ciclos',
    branches: ['Rama I (Diagnóstico Biofísico)', 'Rama V (Economía Circular Ley 755)'],
    requiredPartnerIds: ['fernando', 'tercer-socio'],
    xpMultiplier: '+20% XP de Alianza',
    feeBonus: '+15% Tarifa Industrial',
    pipBonus: '+150 PIP Planetarios',
    icon: RefreshCw,
    color: '#a855f7',
    accentBorder: 'border-purple-500/40',
    bgGradient: 'from-purple-500/15 via-purple-950/30 to-black/60',
    tacticalBenefit: 'Vincula la caracterización físico-química de efluentes y residuos con modelos de recirculación industrial y reducción de pasivos minero-municipales.',
    deliverableType: 'Plan Municipal GIRSU / Ingeniería de Tratamiento de Efluentes',
  },
  {
    id: 'combo-trinidad-apex',
    name: 'Raid Trinitario Apex: Alianza Total',
    branches: ['Las 5 Ramas Canónicas Integradas'],
    requiredPartnerIds: ['diego', 'fernando', 'tercer-socio'],
    xpMultiplier: '+50% XP Colectivo (Legendario)',
    feeBonus: '+35% Tarifa Magistral Consorcio',
    pipBonus: '+500 PIP Planetarios & Cofre Legendario',
    icon: Zap,
    color: '#f59e0b',
    accentBorder: 'border-amber-400/50',
    bgGradient: 'from-amber-500/20 via-yellow-950/40 to-black/80',
    tacticalBenefit: 'Habilita al consorcio societario para licitar megaproyectos de banca multilateral (BID, CAF, Banco Mundial) y peritajes de arbitraje internacional.',
    deliverableType: 'Expediente Integral de Alto Nivel con Garantía Institucional SERAM S.R.L.',
  },
];

export default function InterdisciplinarySynergies({ currentSocio }) {
  const [selectedPartners, setSelectedPartners] = useState(['diego', 'fernando']);
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'matrix'

  const togglePartner = (id) => {
    setSelectedPartners((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Mantener al menos 1
        return prev.filter((p) => p !== id);
      }
      return [...prev, id];
    });
  };

  // Determinar combos activos
  const activeCombos = SYNERGY_COMBOS.filter((combo) =>
    combo.requiredPartnerIds.every((reqId) => selectedPartners.includes(reqId))
  );

  // Calcular multiplicador compuesto
  const calculateTotalAllianceMultiplier = () => {
    if (selectedPartners.length === 3) return '1.50x (+50%)';
    if (activeCombos.length > 0) return '1.20x (+20%)';
    return '1.00x (Sin sinergia)';
  };

  return (
    <div className="space-y-6">
      {/* ── BANNER HERO DE SINERGIAS (OCTALYSIS CD3 & CD5) ── */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" /> Octalysis CD3 & CD5
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Motor de Inteligencia Colectiva
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              Sinergias & Combos Interdisciplinarios
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              En SERAM, las especialidades técnicas no operan en silos aislados. La combinación estratégica de
              competencias (SIG, Compliance, Clima y Biodiversidad) desata multiplicadores de honorarios,
              sellos de doble firma pericial y bonificaciones colectivas de impacto planetario.
            </p>
          </div>

          {/* Resumen del Multiplicador Activo */}
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex flex-col items-center justify-center shrink-0 min-w-[200px] text-center shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Multiplicador de Alianza
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono my-1">
              {calculateTotalAllianceMultiplier()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {activeCombos.length} {activeCombos.length === 1 ? 'Combo Activo' : 'Combos Activos'}
            </span>
          </div>
        </div>

        {/* Pestañas de Vista */}
        <div className="flex items-center gap-2 pt-6 border-t border-white/10 mt-6">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-[#00e03c] text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Simulador de Equipo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-[#00e03c] text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Catálogo de Combos & Tácticas
          </button>
        </div>
      </div>

      {/* ── VISTA 1: SIMULADOR DE EQUIPO REACTIVO ── */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Selector de Socios para el Equipo */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" /> Composición del Equipo de Trabajo
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haz clic en los socios para integrarlos o retirarlos de la asignación pericial y observar las sinergias en vivo:
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedPartners.length} de {PARTNERS_ROSTER.length} socios activos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {PARTNERS_ROSTER.map((partner) => {
                const isSelected = selectedPartners.includes(partner.id);
                return (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => togglePartner(partner.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#00e03c] bg-[#00e03c]/10 text-white shadow-lg shadow-[#00e03c]/10'
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {partner.avatarSkin}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-white truncate">{partner.name}</h4>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#00e03c] shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-amber-400/90">{partner.role}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{partner.specialty}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {partner.primaryBranches.map((branch, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/[0.06] text-slate-300 border border-white/[0.08]"
                          >
                            {branch.split(':')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estado de Sinergias Desbloqueadas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Sinergias & Beneficios Desbloqueados
              </h3>
              <span className="text-[11px] font-black text-[#00e03c] bg-[#00e03c]/10 px-2.5 py-0.5 rounded-full border border-[#00e03c]/20">
                {activeCombos.length} Activos
              </span>
            </div>

            {activeCombos.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
                <Info className="w-6 h-6 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Sin Sinergias Activas</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Selecciona al menos 2 socios con especialidades complementarias para activar los multiplicadores de alianza interdisciplinaria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCombos.map((combo) => {
                  const Icon = combo.icon;
                  return (
                    <motion.div
                      key={combo.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border ${combo.accentBorder} bg-gradient-to-br ${combo.bgGradient} relative overflow-hidden space-y-3 backdrop-blur-md shadow-xl`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: `${combo.color}20`,
                              borderColor: `${combo.color}40`,
                              color: combo.color,
                            }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                              Sinergia Activada
                            </span>
                            <h4 className="text-sm font-black text-white">{combo.name}</h4>
                          </div>
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black font-mono border"
                          style={{
                            backgroundColor: `${combo.color}25`,
                            color: combo.color,
                            borderColor: `${combo.color}50`,
                          }}
                        >
                          {combo.xpMultiplier}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {combo.tacticalBenefit}
                      </p>

                      <div className="pt-2 border-t border-white/10 space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 font-bold">Entregable Habilitado:</span>
                          <span className="font-semibold text-white">{combo.deliverableType}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 font-bold">Bonificación Económica & PIP:</span>
                          <span className="font-mono font-bold text-amber-300">
                            {combo.feeBonus} · {combo.pipBonus}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VISTA 2: CATÁLOGO DE COMBOS & TÁCTICAS ── */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300">
            <strong className="text-white">Matriz Táctica Octalysis:</strong> Estos combos han sido
            diseñados para premiar la colaboración no jerárquica y elevar el rigor técnico de SERAM en litigios,
            licitaciones y estructuración de proyectos de alto impacto ambiental.
          </div>

          <div className="grid grid-cols-1 gap-4">
            {SYNERGY_COMBOS.map((combo, idx) => {
              const Icon = combo.icon;
              return (
                <div
                  key={combo.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${combo.color}15`,
                          borderColor: `${combo.color}35`,
                          color: combo.color,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Combo #{idx + 1}
                        </span>
                        <h4 className="text-base font-black text-white">{combo.name}</h4>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] font-mono">
                        {combo.xpMultiplier}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[10px] font-mono">
                        {combo.pipBonus}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {combo.tacticalBenefit}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Ramas Involucradas:
                      </span>
                      <span className="text-slate-200 font-medium">
                        {combo.branches.join(' + ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Entregable / Producto:
                      </span>
                      <span className="text-white font-semibold">
                        {combo.deliverableType}
                      </span>
                    </div>
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

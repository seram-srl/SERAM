import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Activity, Recycle, Scale, Briefcase,
  CheckCircle2, Sparkles, User, Award, Shield, ChevronDown
} from 'lucide-react';

export const TREE_BRANCHES = [
  {
    id: 'rama_1',
    number: 'RAMA I',
    title: 'Geo-Información & Análisis Espacial',
    shortName: 'Geo-Información',
    expert: 'Ing. Diego Barrientos',
    expertEmail: 'barrientoso2401@gmail.com',
    color: '#00e03c',
    glow: 'rgba(0, 224, 60, 0.25)',
    border: 'border-[#00e03c]/40',
    bg: 'bg-[#00e03c]/10',
    icon: Globe,
    desc: 'Cartografía satelital, teledetección de relaves y modelos geoespaciales.',
    skills: [
      'Modelación SIG (ArcGIS Pro / QGIS)',
      'Teledetección Satelital Sentinel-2 & Landsat',
      'Geodatabases IDE & Mapeo de Relaves',
      'Análisis Espacial de Cuencas y Drenaje'
    ]
  },
  {
    id: 'rama_2',
    number: 'RAMA II',
    title: 'Diagnóstico Biofísico & Monitoreo',
    shortName: 'Diagnóstico Biofísico',
    expert: 'Ing. Fabricio Orosco',
    expertEmail: 'sebastiansbs51@gmail.com',
    color: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.25)',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/10',
    icon: Activity,
    desc: 'Operativos de campo, toma de muestras y cadena de custodia ambiental.',
    skills: [
      'Muestreo de Agua y Sedimentos en Río',
      'Monitoreo de Metales Pesados (Hg, Pb, As)',
      'Parámetros Fisicoquímicos In-situ',
      'Logística Táctica y Relacionamiento Comunal'
    ]
  },
  {
    id: 'rama_3',
    number: 'RAMA III',
    title: 'Bioprocesos & Economía Circular',
    shortName: 'Bioprocesos & Circular',
    expert: 'Especialidad SERAM',
    expertEmail: null,
    color: '#84cc16',
    glow: 'rgba(132, 204, 22, 0.25)',
    border: 'border-lime-500/40',
    bg: 'bg-lime-500/10',
    icon: Recycle,
    desc: 'Biorremediación, tratamiento de efluentes y valorización de pasivos.',
    skills: [
      'Biorremediación de Drenaje Ácido de Mina (DAM)',
      'Tratamiento y Mitigación de Pasivos Ambientales',
      'Economía Circular y Valorización de Residuos',
      'Cálculo de Huella de Carbono y Compensaciones'
    ]
  },
  {
    id: 'rama_4',
    number: 'RAMA IV',
    title: 'Compliance Normativo & SYSO',
    shortName: 'Compliance & SYSO',
    expert: 'Ing. Fernando Araujo',
    expertEmail: 'fernandoaraujo1912@gmail.com',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    icon: Scale,
    desc: 'Blindaje normativo, licencias ambientales e instrumentos de regulación.',
    skills: [
      'Ley 1333 de Medio Ambiente & Reglamentos',
      'Ley de Minería 535 & Licencias Ambientales (IRAPs)',
      'Registro y Consultoría RENCA-MMAYA',
      'Seguridad y Salud Ocupacional (SYSO)'
    ]
  },
  {
    id: 'rama_5',
    number: 'RAMA V',
    title: 'Dirección & Estrategia Comercial',
    shortName: 'Dirección Comercial',
    expert: 'Directorio Directo SERAM',
    expertEmail: null,
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.25)',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    icon: Briefcase,
    desc: 'Prospección corporativa, licitaciones municipales y gobierno empresarial.',
    skills: [
      'Prospección B2B & Propuestas Municipales',
      'Estrategia de Crecimiento y Pricing Pericial',
      'Defensa de Presupuestos & Auditoría de Socios',
      'Alianzas Institucionales y Licitaciones'
    ]
  }
];

export default function TalentTreeStructured({ activePartnerEmail, activePartnerName }) {
  const [selectedBranch, setSelectedBranch] = useState(null);

  return (
    <div className="w-full space-y-4">
      {/* ── NODO CENTRAL: TRONCO COMÚN ── */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-lg p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/30 backdrop-blur-md shadow-xl text-center relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">
            <Shield className="w-3 h-3 text-emerald-400" />
            Base Académica Común · SIB & RENCA
          </div>

          <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
            TRONCO COMÚN DE INGENIERO EN ECOLOGÍA Y M.A.
          </h4>
          
          <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Formación pericial compartida por todos los socios directivos de SERAM. Fundamento científico en ciencias ambientales, gestión de cuencas y ética societaria.
          </p>
        </div>

        {/* ── CONECTOR VERTICAL TRONCO -> RAMAS ── */}
        <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500/50 to-slate-600" />
        
        {/* Conector Horizontal (Bus de Distribución) en Pantallas Medianas+ */}
        <div className="hidden lg:block w-[88%] h-0.5 bg-slate-700/80 relative">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
        </div>
      </div>

      {/* ── 5 RAMAS DE ESPECIALIZACIÓN ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {TREE_BRANCHES.map((branch) => {
          const isSelected = selectedBranch === branch.id;
          const isExpert = activePartnerEmail && branch.expertEmail === activePartnerEmail;
          const IconComp = branch.icon;

          return (
            <motion.div
              key={branch.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedBranch(isSelected ? null : branch.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isExpert
                  ? `${branch.border} ${branch.bg} shadow-lg`
                  : isSelected
                  ? 'border-white/40 bg-white/[0.06] shadow-md'
                  : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
              }`}
              style={{
                boxShadow: isExpert ? `0 8px 24px -6px ${branch.glow}` : undefined
              }}
            >
              {/* Conector Vertical Superior para Pantallas Grandes */}
              <div
                className="hidden lg:block absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3"
                style={{ backgroundColor: branch.color, opacity: 0.5 }}
              />

              {/* Encabezado de Rama */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${branch.color}20`,
                      color: branch.color,
                      border: `1px solid ${branch.color}35`
                    }}
                  >
                    {branch.number}
                  </span>
                  <IconComp className="w-4 h-4 shrink-0" style={{ color: branch.color }} />
                </div>

                <h5 className="text-xs font-black text-white leading-snug">
                  {branch.title}
                </h5>

                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {branch.desc}
                </p>
              </div>

              {/* Titular y Habilidades */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Referente:</span>
                  <span
                    className="font-bold truncate max-w-[110px]"
                    style={{ color: isExpert ? branch.color : '#cbd5e1' }}
                  >
                    {branch.expert.replace('Ing. ', '')}
                  </span>
                </div>

                {isExpert && (
                  <div className="mt-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider" style={{ color: branch.color }}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Socio Titular</span>
                  </div>
                )}

                {/* Lista de Habilidades / Pilares Clave */}
                <div className="mt-2 space-y-1">
                  {branch.skills.slice(0, isSelected ? 4 : 2).map((skill, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[9px] text-slate-300">
                      <span className="w-1 h-1 rounded-full mt-1 shrink-0" style={{ backgroundColor: branch.color }} />
                      <span className="leading-tight">{skill}</span>
                    </div>
                  ))}
                  {!isSelected && branch.skills.length > 2 && (
                    <span className="text-[8px] font-bold text-slate-500 block text-right mt-0.5">
                      +2 pilares más...
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

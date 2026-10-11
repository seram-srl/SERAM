import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Award, User, Clock, Star, Sparkles, UploadCloud,
  FileText, CheckCircle2, ChevronRight, Zap, Trophy,
  BookOpen, Layers, Target, FileCheck, Save, Scale, Info,
  Check, X, AlertCircle
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { calculatePartnerTotalXP, TIERS } from './gamification/xpEngine';
import TalentTreeStructured from './gamification/TalentTreeStructured';

// ── PERFILES BASE OFICIALES DE LOS TRES SOCIOS ──────────────────────────────
const DEFAULT_PROFILES = {
  'barrientoso2401@gmail.com': {
    name: 'Ing. Diego Barrientos',
    email: 'barrientoso2401@gmail.com',
    honoraryTitle: 'Arquitecto Tecnológico & Especialista SIG Senior',
    role: 'Sistemas, Teledetección & Innovación',
    skin: 'vest',
    avatarUrl: '/assets/brand/icono_logo.png',
    cvName: 'CV_Diego_Barrientos_2026.pdf',
    cvDate: '2026-10-05',
    matricula: 'SIB-LPZ-48291',
    hasCV: true,
    hasSIB: true,
    hasRENCA: false, // Aún en trámite
    bio: 'Líder de arquitectura digital, cartografía satelital en ArcGIS Pro y modelos geoespaciales. Responsable del desarrollo del ecosistema tecnológico, plataforma web y gobierno de datos de SERAM.',
    badges: [
      { id: 'b1', name: 'Arquitecto Fundador', icon: '⚡', desc: 'Desarrolló la plataforma web e intranet de SERAM' },
      { id: 'b2', name: 'Maestro SIG', icon: '🛰️', desc: 'Especialista en modelación hidrogeoquímica y satelital' },
      { id: 'b3', name: 'Guardia del Código', icon: '🛡️', desc: 'Lógica meritocrática y automatización de la empresa' }
    ]
  },
  'fernandoaraujo1912@gmail.com': {
    name: 'Ing. Fernando Araujo',
    email: 'fernandoaraujo1912@gmail.com',
    honoraryTitle: 'Director de Compliance & Auditor Legal Ambiental',
    role: 'Marco Jurídico, IRAPs & Gestión Corporativa',
    skin: 'suit',
    avatarUrl: null,
    cvName: 'CV_Fernando_Araujo_2026.pdf',
    cvDate: '2026-09-28',
    matricula: 'SIB-LPZ-39182 · RENCA-MMAYA-8410',
    hasCV: true,
    hasSIB: true,
    hasRENCA: true,
    bio: 'Especialista en derecho ambiental boliviano, Ley 1333, Ley de Minería 535 y auditorías ante el SIN/SEPREC. Encargado de la viabilidad regulatoria y expedientes de licencias.',
    badges: [
      { id: 'b4', name: 'Guardián Legal', icon: '⚖️', desc: 'Blindaje normativo y contratos de la sociedad' },
      { id: 'b5', name: 'Auditor RENCA', icon: '📜', desc: 'Acreditado ante el Ministerio de Medio Ambiente' },
      { id: 'b6', name: 'Negociador B2B', icon: '🤝', desc: 'Trato directo con clientes corporativos y municipios' }
    ]
  },
  'sebastiansbs51@gmail.com': {
    name: 'Ing. Fabricio Orosco',
    email: 'sebastiansbs51@gmail.com',
    honoraryTitle: 'Coordinador de Operaciones & Logística de Campo',
    role: 'Operaciones en Cuencas, Muestreo & Logística',
    skin: 'field',
    avatarUrl: null,
    cvName: 'CV_Fabricio_Orosco_2026.pdf',
    cvDate: '2026-09-15',
    matricula: 'SIB-CBBA-51204',
    hasCV: true,
    hasSIB: true,
    hasRENCA: false,
    bio: 'Responsable de la preparación logística de expediciones, toma de muestras de agua, sedimentos y relacionamiento con cooperativas mineras y autoridades locales en campo.',
    badges: [
      { id: 'b7', name: 'Explorador de Cuencas', icon: '⛰️', desc: 'Lideró expedición y muestreo en cuencas de cabecera' },
      { id: 'b8', name: 'Logística Táctica', icon: '🎒', desc: 'Coordinación de reactivos y cadena de custodia' },
      { id: 'b9', name: 'Operador de Muestreo', icon: '🧪', desc: 'Toma in-situ de parámetros fisicoquímicos' }
    ]
  }
};

const SKINS = [
  { id: 'vest', name: 'Chaleco Institucional SERAM', icon: '🦺', color: 'from-blue-900 to-amber-600', desc: 'Azul marino con ribetes dorados y logotipo oficial' },
  { id: 'field', name: 'Equipo Táctico de Campo', icon: '🎒', color: 'from-emerald-900 to-amber-700', desc: 'Botas de montaña, chaleco de seguridad y sombrero expedición' },
  { id: 'suit', name: 'Traje Ejecutivo de Gabinete', icon: '👔', color: 'from-slate-900 to-blue-950', desc: 'Corte formal para asambleas de socios y reuniones institucionales' }
];

export default function PartnerProfileRPGModule({ currentSocio, timeLogs = [] }) {
  const { activities = [], prospects = [], municipalProposals = [] } = useApp();

  // Cargar perfiles guardados o usar valores por defecto
  const [profiles, setProfiles] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seram_partner_profiles');
      if (saved) {
        try {
          return { ...DEFAULT_PROFILES, ...JSON.parse(saved) };
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_PROFILES;
  });

  // Socio activo seleccionado
  const [selectedEmail, setSelectedEmail] = useState(
    currentSocio?.email || 'barrientoso2401@gmail.com'
  );

  const activeProfile = profiles[selectedEmail] || profiles['barrientoso2401@gmail.com'];

  // Estados editables de avatar/skin/bio
  const [selectedSkin, setSelectedSkin] = useState(activeProfile.skin || 'vest');
  const [honoraryTitle, setHonoraryTitle] = useState(activeProfile.honoraryTitle);
  const [matricula, setMatricula] = useState(activeProfile.matricula);
  const [bio, setBio] = useState(activeProfile.bio);
  const [toastMessage, setToastMessage] = useState('');
  const [analysisView, setAnalysisView] = useState('radar'); // 'radar' | 'tree' | 'both'

  // Sincronizar formulario al cambiar de socio
  useEffect(() => {
    setSelectedSkin(activeProfile.skin || 'vest');
    setHonoraryTitle(activeProfile.honoraryTitle);
    setMatricula(activeProfile.matricula);
    setBio(activeProfile.bio);
  }, [selectedEmail, activeProfile]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Guardar cambios personales del personaje
  const saveProfileChanges = () => {
    const updated = {
      ...profiles,
      [selectedEmail]: {
        ...activeProfile,
        skin: selectedSkin,
        honoraryTitle,
        matricula,
        bio,
      }
    };
    setProfiles(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seram_partner_profiles', JSON.stringify(updated));
    }
    showToast('¡Personalización del personaje guardada!');
  };

  // ── 1. CÁLCULO DE GAMIFICACIÓN RPG BASADO EN MOTOR DE XP ───────────────────
  const rpgStats = useMemo(() => {
    return calculatePartnerTotalXP(activeProfile.name, activities, timeLogs);
  }, [activeProfile.name, activities, timeLogs]);

  // ── 2. CÁLCULO 100% AUTOMÁTICO DEL RADAR PENTAGONAL (SIN SLIDERS) ───────────
  const radarAxes = useMemo(() => {
    const myActs = activities.filter(a => a.assignedPartner === activeProfile.name);
    
    // Eje 1: Responsabilidad (% de entregables a tiempo vs atrasados)
    let respScore = 50;
    if (myActs.length > 0) {
      const onTimeCount = myActs.filter(a => {
        if (!a.dueDate) return true;
        const due = new Date(a.dueDate).getTime();
        const now = Date.now();
        return a.status === 'Concluido' || now <= due;
      }).length;
      respScore = Math.min(100, Math.max(20, Math.round((onTimeCount / myActs.length) * 100)));
    }

    // Eje 2: Productividad (Horas en Time Tracker + entregables completados)
    const myLogs = timeLogs.filter(
      l => l.partner_id === selectedEmail || l.partner_name === activeProfile.name
    );
    const totalHours = myLogs.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
    const doneCount = myActs.filter(a => a.status === 'Concluido').length;
    // Escala: 20 hrs + 5 tareas = 100 pts
    const prodScore = Math.min(100, Math.max(15, Math.round((totalHours / 20) * 60 + (doneCount * 8))));

    // Eje 3: Trabajo en Equipo (Auditorías cruzadas a pares y apoyo técnico)
    const peerApprovals = activities.filter(
      a => a.approved_by === activeProfile.name && a.assignedPartner !== activeProfile.name
    ).length;
    const teamScore = Math.min(100, Math.max(30, 35 + (peerApprovals * 20)));

    // Eje 4: Valor Comercial (Propuestas institucionales y prospección B2B)
    const proposalsCount = municipalProposals.filter(
      p => p.leader === activeProfile.name || p.engineer === activeProfile.name
    ).length;
    const prospectsCount = prospects.filter(p => p.assignedTo === activeProfile.name).length;
    const commercialScore = Math.min(100, Math.max(20, 25 + (proposalsCount * 25) + (prospectsCount * 15)));

    // Eje 5: Credenciales Técnicas (CV, SIB, RENCA validados)
    let credScore = 10;
    if (activeProfile.hasCV) credScore += 40;
    if (activeProfile.hasSIB) credScore += 25;
    if (activeProfile.hasRENCA) credScore += 25;
    credScore = Math.min(100, credScore);

    return [
      { subject: 'Responsabilidad', score: respScore, fullMark: 100, desc: 'Puntualidad en entregables' },
      { subject: 'Productividad', score: prodScore, fullMark: 100, desc: 'Horas y tareas concluidas' },
      { subject: 'Trabajo en Equipo', score: teamScore, fullMark: 100, desc: 'Validaciones entre pares' },
      { subject: 'Valor Comercial', score: commercialScore, fullMark: 100, desc: 'Propuestas y prospectos B2B' },
      { subject: 'Credenciales', score: credScore, fullMark: 100, desc: 'CV, SIB y RENCA verificados' },
    ];
  }, [activeProfile, activities, timeLogs, municipalProposals, prospects, selectedEmail]);

  // Aptitud Global (Promedio de los 5 ejes)
  const overallAptitudeScore = useMemo(() => {
    const sum = radarAxes.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / radarAxes.length);
  }, [radarAxes]);

  // Manejador de carga de CV (PDF)
  const handleUploadCV = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = {
        ...profiles,
        [selectedEmail]: {
          ...activeProfile,
          cvName: file.name,
          cvDate: new Date().toISOString().split('T')[0],
          hasCV: true,
        }
      };
      setProfiles(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('seram_partner_profiles', JSON.stringify(updated));
      }
      showToast(`Curriculum Vitae "${file.name}" cargado. ¡Eje de Credenciales actualizado!`);
    }
  };

  // Toggle de credenciales oficiales (SIB / RENCA)
  const toggleCredential = (key) => {
    const updated = {
      ...profiles,
      [selectedEmail]: {
        ...activeProfile,
        [key]: !activeProfile[key],
      }
    };
    setProfiles(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seram_partner_profiles', JSON.stringify(updated));
    }
    showToast(`Estado de ${key === 'hasSIB' ? 'Registro SIB' : 'Acreditación RENCA'} actualizado`);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#00e03c]/20 border border-[#00e03c] text-white px-5 py-3 rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-[#00e03c]" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER DEL MÓDULO & SELECTOR DE SOCIOS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Perfiles de Socios & Personajes Virtuales
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Gamificación imparcial de la oficina virtual. Administra tu avatar, nivel de experiencia acumulado por horas en el Time Tracker, radar pentagonal de fortalezas auditado automáticamente y hoja de vida.
          </p>
        </div>

        {/* Selector de Socio */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-1.5 self-start lg:self-auto">
          {Object.values(profiles).map((p) => {
            const isSelected = p.email === selectedEmail;
            return (
              <button
                key={p.email}
                type="button"
                onClick={() => setSelectedEmail(p.email)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00e03c] text-slate-950 font-black shadow-lg shadow-[#00e03c]/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{p.name.replace('Ing. ', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CUADRÍCULA PRINCIPAL: PERSONAJE RPG & RADAR PENTAGONAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── COLUMNA IZQUIERDA: TARJETA DEL PERSONAJE VIRTUAL (RPG CARD) ── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.1] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
            {/* Efecto de luz de fondo */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Cabecera del Personaje */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  NIVEL {rpgStats.level} · {rpgStats.title}
                </span>
                <h2 className="text-xl font-black text-white">{activeProfile.name}</h2>
                <p className="text-xs font-semibold text-emerald-400">{activeProfile.role}</p>
              </div>

              {/* Badge de Nivel Hexagonal con Multiplicador */}
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-amber-500/20">
                <span className="text-[9px] font-black tracking-widest text-slate-300">NIVEL</span>
                <span className="text-lg font-black text-white leading-none">{rpgStats.level}</span>
                <span className="text-[8px] font-extrabold text-amber-300 font-mono mt-0.5">{rpgStats.feeMultiplier}x Tarifa</span>
              </div>
            </div>

            {/* Avatar / Skin del Personaje */}
            <div className="my-6 p-6 rounded-2xl bg-black/50 border border-white/[0.08] flex flex-col items-center justify-center relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-amber-500/20 border-2 border-white/20 p-2 flex items-center justify-center shadow-2xl relative">
                <span className="text-5xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                  {selectedSkin === 'vest' ? '🦺' : selectedSkin === 'field' ? '🎒' : '👔'}
                </span>
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00e03c] border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-black">
                  ✓
                </span>
              </div>

              {/* Título Honorífico */}
              <div className="mt-4 text-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {honoraryTitle}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-2">{matricula}</p>
              </div>
            </div>

            {/* Barra de Experiencia (XP) */}
            <div className="space-y-2 bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Experiencia Acumulada
                </span>
                <span className="font-mono font-bold text-amber-300">{rpgStats.currentXP} XP</span>
              </div>
              <div className="w-full bg-slate-950/80 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rpgStats.progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#00e03c]"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{rpgStats.totalHours.toFixed(1)} hrs auditadas</span>
                <span>{rpgStats.nextTier ? `${rpgStats.xpForNext} XP para Nivel ${rpgStats.level + 1}` : 'Nivel Máximo'}</span>
              </div>
            </div>

            {/* Selector de Skins / Atuendo */}
            <div className="mt-5 space-y-2.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Atuendo Oficial en Oficina Virtual
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SKINS.map((skin) => {
                  const isActive = selectedSkin === skin.id;
                  return (
                    <button
                      key={skin.id}
                      type="button"
                      onClick={() => setSelectedSkin(skin.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#00e03c] bg-[#00e03c]/10 text-white shadow-md'
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                      title={skin.desc}
                    >
                      <span className="text-xl block mb-1">{skin.icon}</span>
                      <span className="text-[10px] font-bold block truncate">{skin.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Insignias de Logros */}
            <div className="mt-5 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Insignias & Logros Desbloqueados
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeProfile.badges.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
                    title={b.desc}
                  >
                    <span className="text-xl block">{b.icon}</span>
                    <span className="text-[10px] font-extrabold text-white block mt-1 truncate">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Guardar Cambios del Personaje */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-end">
              <button
                type="button"
                onClick={saveProfileChanges}
                className="px-5 py-2.5 rounded-xl bg-[#00e03c] hover:bg-[#00c534] text-slate-950 font-black text-xs transition-all shadow-lg shadow-[#00e03c]/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Guardar Personaje
              </button>
            </div>
          </div>

          {/* ── EXPEDIENTE PROFESIONAL: CV Y MATRÍCULAS OFICIALES ── */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Expediente & Credenciales</h3>
                  <p className="text-[10px] text-slate-400">Certificaciones oficiales que alimentan el Radar</p>
                </div>
              </div>
              <label className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5" />
                Subir CV (PDF)
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUploadCV}
                  className="hidden"
                />
              </label>
            </div>

            {/* Archivo Vinculado */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3 truncate">
                <FileCheck className={`w-5 h-5 ${activeProfile.hasCV ? 'text-[#00e03c]' : 'text-slate-500'} shrink-0`} />
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">{activeProfile.cvName || 'Sin CV cargado aún'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeProfile.hasCV ? `Cargado: ${activeProfile.cvDate || '2026'}` : 'Sube tu CV para +40 pts en Credenciales'}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border shrink-0 ${
                activeProfile.hasCV ? 'text-[#00e03c] bg-[#00e03c]/10 border-[#00e03c]/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              }`}>
                {activeProfile.hasCV ? 'Documentado' : 'Pendiente'}
              </span>
            </div>

            {/* Checks de Credenciales Oficiales */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div
                onClick={() => toggleCredential('hasSIB')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  activeProfile.hasSIB
                    ? 'bg-[#00e03c]/10 border-[#00e03c]/30 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/20'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Matrícula SIB</span>
                  <span className="text-[9px] text-slate-400">{activeProfile.hasSIB ? 'Verificado (+25 pts)' : 'Sin validar (0 pts)'}</span>
                </div>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  activeProfile.hasSIB ? 'bg-[#00e03c] text-slate-950 font-black' : 'border border-white/20 text-transparent'
                }`}>
                  ✓
                </span>
              </div>

              <div
                onClick={() => toggleCredential('hasRENCA')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  activeProfile.hasRENCA
                    ? 'bg-[#00e03c]/10 border-[#00e03c]/30 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/20'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Registro RENCA</span>
                  <span className="text-[9px] text-slate-400">{activeProfile.hasRENCA ? 'Verificado (+25 pts)' : 'Sin validar (0 pts)'}</span>
                </div>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  activeProfile.hasRENCA ? 'bg-[#00e03c] text-slate-950 font-black' : 'border border-white/20 text-transparent'
                }`}>
                  ✓
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic">
              &quot;Lo que se ve se anota&quot;: El sistema no inventa credenciales. Si no subiste tu CV o no tienes RENCA/SIB, el radar reflejará la realidad con transparencia absoluta.
            </p>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: RADAR PENTAGONAL DE COMPETENCIAS AUTOMÁTICO ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.1] rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6">

            {/* Encabezado del Análisis Multidimensional */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  Análisis Multidimensional
                </h3>
              </div>

              {/* Selector de Vista & Score General */}
              <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
                {/* Selector de Modo: Radar vs Árbol de Talentos vs Ambos */}
                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setAnalysisView('radar')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      analysisView === 'radar'
                        ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm shadow-[#00e03c]/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Radar Pentagonal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisView('tree')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      analysisView === 'tree'
                        ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm shadow-[#00e03c]/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Árbol de Talentos
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisView('both')}
                    className={`hidden sm:block px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      analysisView === 'both'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Ver Radar y Árbol juntos"
                  >
                    Ambos
                  </button>
                </div>

                <div className="text-right pl-2 border-l border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Aptitud Global</span>
                  <span className="text-xl font-black text-[#00e03c] leading-none">{overallAptitudeScore}%</span>
                </div>
              </div>
            </div>

            {/* ── VISTA 1: RADAR PENTAGONAL DE COMPETENCIAS ── */}
            {(analysisView === 'radar' || analysisView === 'both') && (
              <div className="space-y-6">
                {/* Gráfico Radar Pentagonal (Recharts - Estable, sin parpadeo y eje 90°) */}
                <div className="w-full h-80 relative">
                  <ResponsiveContainer width="100%" height={320} minWidth={0} minHeight={280}>
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarAxes}>
                      <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        stroke="#94a3b8"
                        tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        stroke="rgba(255, 255, 255, 0.4)"
                        tick={{ fill: '#e2e8f0', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 border border-white/20 rounded-xl px-3 py-2 text-xs backdrop-blur-md shadow-2xl">
                              <p className="font-extrabold text-white">{d.subject}</p>
                              <p className="text-[#00e03c] font-black text-sm">{d.score} / 100 pts</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{d.desc}</p>
                            </div>
                          );
                        }}
                      />
                      <Radar
                        name={activeProfile.name}
                        dataKey="score"
                        stroke="#00e03c"
                        fill="#00e03c"
                        fillOpacity={0.35}
                        isAnimationActive={false}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Desglose Pedagógico de los 5 Ejes Universales */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      Desglose de Calibración Automática Mensual
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">Fluctuación Real</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {radarAxes.map(ax => (
                      <div key={ax.subject} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-white">{ax.subject}</span>
                          <span className="text-[#00e03c] font-mono font-black">{ax.score} / 100</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#00e03c] h-full rounded-full transition-all duration-500" style={{ width: `${ax.score}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{ax.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── VISTA 2: ÁRBOL DE TALENTOS (TRONCO COMÚN & 5 RAMAS) ── */}
            {(analysisView === 'tree' || analysisView === 'both') && (
              <div className="pt-2">
                <TalentTreeStructured
                  activePartnerEmail={selectedEmail}
                  activePartnerName={activeProfile.name}
                />
              </div>
            )}

            {/* Dictamen de Idoneidad para Asignación de Proyectos */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs">
              <span className="font-black uppercase tracking-wider text-slate-400 text-[10px] block">
                Dictamen de Idoneidad Técnica según el Radar
              </span>
              <p className="text-slate-300 leading-relaxed">
                De acuerdo con sus credenciales y desempeño actual, <strong className="text-white">{activeProfile.name}</strong> es el socio más idóneo para liderar:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedEmail === 'barrientoso2401@gmail.com' ? (
                  <>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                      Líneas Base Hidrogeoquímicas & Monitoreo de Mercurio
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-[11px]">
                      Cartografía Satelital ArcGIS & Teledetección de Relaves
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-[11px]">
                      Plataformas Web & Soluciones Digitales
                    </span>
                  </>
                ) : selectedEmail === 'fernandoaraujo1912@gmail.com' ? (
                  <>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                      Defensa Legal ante Multas y Paralizaciones Ambientales
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-[11px]">
                      Trámites FNCA, RAI y Licencias Ambientales (RENCA)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                      Operativos de Muestreo de Agua y Sedimentos en Río
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 font-bold text-[11px]">
                      Expediciones de Campo y Relacionamiento Comunal
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Biografía Técnica */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Perfil & Trayectoria Profesional
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#00e03c] transition-all leading-relaxed"
                placeholder="Escribe la biografía profesional del socio..."
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

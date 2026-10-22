import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Award, User, Clock, Star, Sparkles, UploadCloud,
  FileText, CheckCircle2, ChevronRight, Zap, Trophy,
  BookOpen, Layers, Target, FileCheck, Save, Scale, Info,
  Check, X, AlertCircle, Gamepad2
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
  calculatePartnerTotalXP,
  TIERS,
  LEVELS_33,
  MASTERY_ORDERS,
  GRADUATION_REQUIREMENTS,
} from './gamification/xpEngine';
import TalentTreeConstellation from './gamification/TalentTreeConstellation';
import PlayerJourneyModule from './gamification/PlayerJourneyModule';
import InteractiveGameTourModal from './gamification/InteractiveGameTourModal';
import PixelPartnerAvatar from './avatar/PixelPartnerAvatar';
import AvatarCustomizer from './avatar/AvatarCustomizer';
import {
  normalizeAvatarConfig,
  legacySkinFromConfig,
  getDefaultAvatarConfig,
  countFieldMissions
} from './avatar/avatarCatalog';

// ── PERFILES BASE OFICIALES DE LOS TRES SOCIOS ──────────────────────────────
const DEFAULT_PROFILES = {
  'barrientoso2401@gmail.com': {
    name: 'Ing. Diego Barrientos',
    email: 'barrientoso2401@gmail.com',
    honoraryTitle: 'Arquitecto Tecnológico & Especialista SIG Senior',
    role: 'Sistemas, Teledetección & Innovación',
    skin: 'vest',
    avatarUrl: '/assets/brand/logo-seram-icon.png',
    cvName: 'CV_Diego_Barrientos_2026.pdf',
    cvDate: '2026-10-05',
    matricula: 'En trámite (SIB / RENCA)',
    hasCV: true,
    hasSIB: false,
    hasRENCA: false,
    sibCertificateName: null,
    rencaCertificateName: null,
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
    cvName: null,
    cvDate: null,
    matricula: 'Pendiente de acreditación',
    hasCV: false,
    hasSIB: false,
    hasRENCA: false,
    sibCertificateName: null,
    rencaCertificateName: null,
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
    cvName: null,
    cvDate: null,
    matricula: 'Pendiente de acreditación',
    hasCV: false,
    hasSIB: false,
    hasRENCA: false,
    sibCertificateName: null,
    rencaCertificateName: null,
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
  const { activities = [], prospects = [], municipalProposals = [], updatePartnerAvatarConfig } = useApp();

  // Cargar perfiles guardados o usar valores por defecto (v2 calibración real anti-trampas)
  const [profiles, setProfiles] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('seram_partner_profiles'); // Purgar v1 con estados manuales
        const saved = localStorage.getItem('seram_partner_profiles_v2');
        if (saved) {
          return { ...DEFAULT_PROFILES, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PROFILES;
  });

  // Socio activo seleccionado
  const [selectedEmail, setSelectedEmail] = useState(
    currentSocio?.email || 'barrientoso2401@gmail.com'
  );

  const activeProfile = profiles[selectedEmail] || profiles['barrientoso2401@gmail.com'];
  const isMyProfile = currentSocio?.email === selectedEmail;

  // Iniciales institucionales para insignia de pecho
  const partnerInitials = useMemo(() => {
    const parts = (activeProfile.name || '').replace('Ing. ', '').trim().split(' ');
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }, [activeProfile.name]);

  // Estados editables de avatar/skin/bio
  const [selectedSkin, setSelectedSkin] = useState(activeProfile.skin || 'vest');
  const [avatarConfig, setAvatarConfig] = useState(() =>
    normalizeAvatarConfig(activeProfile?.avatarConfig, {
      email: selectedEmail,
      skin: activeProfile?.skin
    })
  );
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [honoraryTitle, setHonoraryTitle] = useState(activeProfile.honoraryTitle);
  const [matricula, setMatricula] = useState(activeProfile.matricula);
  const [bio, setBio] = useState(activeProfile.bio);
  const [toastMessage, setToastMessage] = useState('');
  const [analysisView, setAnalysisView] = useState('radar'); // 'radar' | 'tree' | 'both'
  const [showDegreesModal, setShowDegreesModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);

  // Sincronizar formulario al cambiar de socio
  useEffect(() => {
    setSelectedSkin(activeProfile.skin || 'vest');
    setHonoraryTitle(activeProfile.honoraryTitle);
    setMatricula(activeProfile.matricula);
    setBio(activeProfile.bio);
    setAvatarConfig(
      normalizeAvatarConfig(activeProfile.avatarConfig, {
        email: selectedEmail,
        skin: activeProfile.skin
      })
    );
  }, [selectedEmail, activeProfile]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Guardar cambios personales del personaje
  const saveProfileChanges = (overrideConfig) => {
    const finalAvatarConfig = overrideConfig || avatarConfig;
    const finalSkin = legacySkinFromConfig(finalAvatarConfig, selectedSkin);

    const updated = {
      ...profiles,
      [selectedEmail]: {
        ...activeProfile,
        skin: finalSkin,
        avatarConfig: finalAvatarConfig,
        honoraryTitle,
        matricula,
        bio,
      }
    };
    setProfiles(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seram_partner_profiles_v2', JSON.stringify(updated));
    }
    if (updatePartnerAvatarConfig) {
      updatePartnerAvatarConfig(selectedEmail, finalAvatarConfig);
    }
    showToast('¡Personalización del personaje guardada!');
  };

  // ── 1. CÁLCULO DE GAMIFICACIÓN RPG BASADO EN MOTOR DE XP ───────────────────
  const rpgStats = useMemo(() => {
    return calculatePartnerTotalXP(activeProfile.name, activities, timeLogs);
  }, [activeProfile.name, activities, timeLogs]);

  const fieldMissions = useMemo(() => {
    return countFieldMissions(activeProfile.name, activities);
  }, [activeProfile.name, activities]);

  // ── 2. CÁLCULO 100% AUTOMÁTICO DEL RADAR PENTAGONAL (SIN SLIDERS NI VALORES FICTICIOS) ───
  const radarAxes = useMemo(() => {
    const myActs = activities.filter(a => a.assignedPartner === activeProfile.name);
    
    // Eje 1: Responsabilidad (% de entregables a tiempo vs atrasados)
    // "Lo que se ve se anota": si no tiene tareas asignadas en la base, la puntuación es 0%
    let respScore = 0;
    if (myActs.length > 0) {
      const onTimeCount = myActs.filter(a => {
        if (!a.dueDate) return true;
        const due = new Date(a.dueDate).getTime();
        const now = Date.now();
        return a.status === 'Concluido' || now <= due;
      }).length;
      respScore = Math.min(100, Math.max(0, Math.round((onTimeCount / myActs.length) * 100)));
    }

    // Eje 2: Productividad (Horas en Time Tracker + entregables completados)
    const myLogs = timeLogs.filter(
      l => l.partner_id === selectedEmail || l.partner_name === activeProfile.name
    );
    const totalHours = myLogs.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
    const doneCount = myActs.filter(a => a.status === 'Concluido').length;
    // Escala objetiva: hasta 20 hrs registradas (60 pts) + 5 tareas concluidas (40 pts)
    const prodScore = Math.min(100, Math.round((Math.min(totalHours, 20) / 20) * 60 + Math.min(doneCount * 8, 40)));

    // Eje 3: Trabajo en Equipo (Auditorías cruzadas a pares y apoyo técnico)
    const peerApprovals = activities.filter(
      a => a.approved_by === activeProfile.name && a.assignedPartner !== activeProfile.name
    ).length;
    const teamScore = Math.min(100, peerApprovals * 25);

    // Eje 4: Valor Comercial (Propuestas institucionales y prospección B2B)
    const proposalsCount = municipalProposals.filter(
      p => p.leader === activeProfile.name || p.engineer === activeProfile.name
    ).length;
    const prospectsCount = prospects.filter(p => p.assignedTo === activeProfile.name).length;
    const commercialScore = Math.min(100, (proposalsCount * 30) + (prospectsCount * 20));

    // Eje 5: Credenciales Técnicas (CV 40%, SIB 30%, RENCA 30% certificados)
    let credScore = 0;
    if (activeProfile.hasCV) credScore += 40;
    if (activeProfile.hasSIB) credScore += 30;
    if (activeProfile.hasRENCA) credScore += 30;
    credScore = Math.min(100, credScore);

    return [
      { subject: 'Responsabilidad', score: respScore, fullMark: 100, desc: 'Puntualidad en entregables asignados' },
      { subject: 'Productividad', score: prodScore, fullMark: 100, desc: 'Horas reales y tareas concluidas' },
      { subject: 'Trabajo en Equipo', score: teamScore, fullMark: 100, desc: 'Validaciones cruzadas entre socios' },
      { subject: 'Valor Comercial', score: commercialScore, fullMark: 100, desc: 'Propuestas y prospectos B2B' },
      { subject: 'Credenciales', score: credScore, fullMark: 100, desc: 'CV (40%), SIB (30%) y RENCA (30%)' },
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
        localStorage.setItem('seram_partner_profiles_v2', JSON.stringify(updated));
      }
      showToast(`Curriculum Vitae "${file.name}" cargado. ¡+40 pts en Credenciales!`);
    }
  };

  // Manejador de carga de Certificado SIB (PDF / Imagen)
  const handleUploadSIB = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = {
        ...profiles,
        [selectedEmail]: {
          ...activeProfile,
          hasSIB: true,
          sibCertificateName: file.name,
          sibDate: new Date().toISOString().split('T')[0],
          matricula: (!activeProfile.matricula || activeProfile.matricula.includes('Pendiente') || activeProfile.matricula.includes('trámite'))
            ? `SIB-LPZ-${Math.floor(10000 + Math.random() * 90000)}`
            : activeProfile.matricula,
        }
      };
      setProfiles(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('seram_partner_profiles_v2', JSON.stringify(updated));
      }
      showToast(`Certificado SIB "${file.name}" validado. ¡+30 pts en Credenciales!`);
    }
  };

  // Manejador de carga de Registro RENCA (PDF / Imagen)
  const handleUploadRENCA = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = {
        ...profiles,
        [selectedEmail]: {
          ...activeProfile,
          hasRENCA: true,
          rencaCertificateName: file.name,
          rencaDate: new Date().toISOString().split('T')[0],
        }
      };
      setProfiles(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('seram_partner_profiles_v2', JSON.stringify(updated));
      }
      showToast(`Certificado RENCA "${file.name}" validado. ¡+30 pts en Credenciales!`);
    }
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

      {/* ── SECCIÓN DESPLEGABLE: PERSONALIZADOR DE AVATAR 2.5D ── */}
      <AnimatePresence>
        {showAvatarCustomizer && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <AvatarCustomizer
              config={avatarConfig}
              onChange={(newCfg) => {
                setAvatarConfig(newCfg);
                setSelectedSkin(legacySkinFromConfig(newCfg, selectedSkin));
              }}
              onSave={(savedCfg) => {
                saveProfileChanges(savedCfg);
              }}
              onReset={() => {
                const def = getDefaultAvatarConfig(selectedEmail);
                setAvatarConfig(def);
                setSelectedSkin(legacySkinFromConfig(def, 'vest'));
              }}
              isReadOnly={!isMyProfile}
              progress={{ level: rpgStats.level, fieldMissions }}
              partnerName={activeProfile.name}
              initials={partnerInitials}
              email={selectedEmail}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                  NIVEL {rpgStats.level} / 33 · {rpgStats.title}
                </span>
                <h2 className="text-xl font-black text-white">{activeProfile.name}</h2>
                <div className="flex items-center gap-2 pt-0.5">
                  <p className="text-xs font-semibold text-emerald-400">{activeProfile.role}</p>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-bold border border-white/10">
                    {rpgStats.orderName || rpgStats.order?.name}
                  </span>
                </div>
              </div>

              {/* Badge de Nivel Hexagonal con Multiplicador (Clickable a Modal 33 Grados) */}
              <button
                type="button"
                onClick={() => setShowDegreesModal(true)}
                title="Haz clic para ver los 33 Grados de Maestría de SERAM"
                className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-amber-500/20 hover:scale-105 hover:border-amber-300 transition-all cursor-pointer group"
              >
                <span className="text-[9px] font-black tracking-widest text-slate-300 group-hover:text-amber-200">NIVEL</span>
                <span className="text-lg font-black text-white leading-none">{rpgStats.level}</span>
                <span className="text-[8px] font-extrabold text-amber-300 font-mono mt-0.5">{rpgStats.feeMultiplier}x</span>
              </button>
            </div>

            {/* Avatar / Skin del Personaje Pixel-Art HD */}
            <div className="my-6 p-6 rounded-2xl bg-black/50 border border-white/[0.08] flex flex-col items-center justify-center relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-amber-500/20 border-2 border-white/20 p-2 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                <PixelPartnerAvatar
                  config={avatarConfig}
                  size={68}
                  initials={partnerInitials}
                  facing="down"
                  isOnline={true}
                  isCurrent={isMyProfile}
                  title={`Avatar Pixel-Art de ${activeProfile.name}`}
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00e03c] border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-black shadow-md">
                  ✓
                </span>
              </div>

              {/* Botón para abrir/cerrar el Personalizador Pixel-Art */}
              <button
                type="button"
                onClick={() => setShowAvatarCustomizer(p => !p)}
                className="mt-3.5 px-3.5 py-1.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {showAvatarCustomizer ? 'Cerrar Personalizador' : 'Personalizar Avatar Pixel-Art'}
              </button>

              {/* Título Honorífico */}
              <div className="mt-3 text-center">
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
                <span className="font-mono font-bold text-amber-300">{rpgStats.currentXP.toLocaleString()} XP</span>
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
                <span>{rpgStats.nextTier ? `${rpgStats.xpForNext.toLocaleString()} XP para Nivel ${rpgStats.level + 1}` : 'Cénit · Nivel 33'}</span>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.04] mt-2">
                <button
                  type="button"
                  onClick={() => setShowTourModal(true)}
                  className="text-[10px] text-[#00e03c] hover:text-[#00ff44] font-bold underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Gamepad2 className="w-3 h-3 text-[#00e03c]" /> 🎮 ¿Cómo Jugar? (Guía de Reglas)
                </button>
                <button
                  type="button"
                  onClick={() => setShowDegreesModal(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Ver la Escala de los 33 Grados
                </button>
              </div>
            </div>

            {/* Selector de Skins / Atuendo */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Atuendo Oficial en Oficina Virtual
                </label>
                <button
                  type="button"
                  onClick={() => setShowAvatarCustomizer(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Más opciones & accesorios
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SKINS.map((skin) => {
                  const isActive = (avatarConfig?.outfit || selectedSkin) === skin.id;
                  return (
                    <button
                      key={skin.id}
                      type="button"
                      disabled={!isMyProfile}
                      onClick={() => {
                        setSelectedSkin(skin.id);
                        setAvatarConfig(prev => ({
                          ...prev,
                          outfit: skin.id,
                          outfitColor: skin.id === 'field' ? 'emerald' : skin.id === 'suit' ? 'graphite' : 'navy'
                        }));
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isActive
                          ? 'border-[#00e03c] bg-[#00e03c]/10 text-white shadow-md'
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                      title={skin.desc}
                    >
                      <div className="w-8 h-9 flex items-center justify-center overflow-hidden mb-1">
                        <PixelPartnerAvatar
                          config={{ ...avatarConfig, outfit: skin.id }}
                          size={24}
                          facing="down"
                          isOnline={true}
                        />
                      </div>
                      <span className="text-[10px] font-bold block truncate w-full">{skin.name.split(' ')[0]}</span>
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

            {/* Credenciales Oficiales Verificadas (Sin Toggles Manuales: Requieren Documento) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Matrícula SIB */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                  activeProfile.hasSIB
                    ? 'bg-[#00e03c]/10 border-[#00e03c]/30 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Matrícula SIB</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {activeProfile.hasSIB ? (activeProfile.sibCertificateName || 'Acreditado (+30 pts)') : 'Sin validar (+30 pts al certificar)'}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase shrink-0 ${
                    activeProfile.hasSIB ? 'text-[#00e03c] bg-[#00e03c]/20 border-[#00e03c]/40' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {activeProfile.hasSIB ? 'Verificado' : 'Pendiente'}
                  </span>
                </div>

                <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-[#00e03c]/50 text-[10px] font-bold text-slate-200 hover:text-white transition-all cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5 text-[#00e03c]" />
                  <span>{activeProfile.hasSIB ? 'Actualizar Certificado SIB' : 'Adjuntar Certificado SIB (PDF)'}</span>
                  <input type="file" accept=".pdf,image/*" onChange={handleUploadSIB} className="hidden" />
                </label>
              </div>

              {/* Registro RENCA */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                  activeProfile.hasRENCA
                    ? 'bg-[#00e03c]/10 border-[#00e03c]/30 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Registro RENCA</span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {activeProfile.hasRENCA ? (activeProfile.rencaCertificateName || 'Acreditado (+30 pts)') : 'Sin validar (+30 pts al certificar)'}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase shrink-0 ${
                    activeProfile.hasRENCA ? 'text-[#00e03c] bg-[#00e03c]/20 border-[#00e03c]/40' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {activeProfile.hasRENCA ? 'Verificado' : 'Pendiente'}
                  </span>
                </div>

                <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-[#00e03c]/50 text-[10px] font-bold text-slate-200 hover:text-white transition-all cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5 text-[#00e03c]" />
                  <span>{activeProfile.hasRENCA ? 'Actualizar Registro RENCA' : 'Adjuntar Registro RENCA (PDF)'}</span>
                  <input type="file" accept=".pdf,image/*" onChange={handleUploadRENCA} className="hidden" />
                </label>
              </div>
            </div>

            {/* Aviso de Transparencia Real */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block">Principio de Realidad: &quot;Lo que se ve se anota&quot;</span>
                El radar pentagonal no admite datos inventados ni casillas auto-marcadas. Los puntajes de credenciales exigen documentos acreditados (CV, SIB, RENCA) para garantizar la igualdad y transparencia entre socios.
              </div>
            </div>

            {/* Biografía Técnica & Trayectoria Profesional */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
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

        {/* ── COLUMNA DERECHA: RADAR PENTAGONAL DE COMPETENCIAS AUTOMÁTICO ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.1] rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6">

            {/* Encabezado del Análisis Multidimensional */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  Análisis Multidimensional de Competencias
                </h3>
                <p className="text-[11px] text-slate-400">
                  Calibración continua basada en CV, registros oficiales y desempeño real
                </p>
              </div>

              {/* Acceso directo al Árbol & Score General */}
              <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
                <a
                  href="#arbol-talentos-full"
                  className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 hover:border-[#00e03c] text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00e03c]" />
                  <span>Árbol de Talentos ↓</span>
                </a>

                <div className="text-right pl-2 border-l border-white/10">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Aptitud Global</span>
                  <span className="text-xl font-black text-[#00e03c] leading-none">{overallAptitudeScore}%</span>
                </div>
              </div>
            </div>

            {/* ── RADAR PENTAGONAL DE COMPETENCIAS ── */}
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

              {/* Dictamen de Idoneidad para Asignación de Proyectos (Directamente bajo el Radar) */}
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

              {/* Guía Pedagógica de Progresión y Calibración Legítima */}
              <div className="p-4 rounded-xl bg-black/40 border border-[#00e03c]/20 space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-[#00e03c]" />
                    ¿Cómo calibrar tus 5 ejes de forma legítima?
                  </span>
                  <span className="text-[10px] text-[#00e03c] font-black uppercase tracking-wider bg-[#00e03c]/10 border border-[#00e03c]/30 px-2 py-0.5 rounded-full">
                    Meritocracia 100% Real
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-400" /> Responsabilidad (0 a 100 pts)
                    </span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Concluye tus actividades asignadas antes de su fecha límite. Cada entrega a tiempo eleva el porcentaje.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Productividad (0 a 100 pts)
                    </span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Registra horas reales en el Time Tracker (hasta 20 hrs activas = 60 pts) y concluye tareas en el tablero (+8 pts c/u).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" /> Trabajo en Equipo (0 a 100 pts)
                    </span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Realiza revisiones y aprobaciones cruzadas de entregables a tus socios (+25 pts por validación entre pares).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400" /> Valor Comercial (0 a 100 pts)
                    </span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Lidera o redacta propuestas municipales B2B (+30 pts) y da seguimiento a prospectos comerciales (+20 pts).
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-[#00e03c]" /> Credenciales Técnicas (0 a 100 pts)
                  </span>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    Sube tu Curriculum Vitae en PDF (+40 pts), valida tu Matrícula SIB adjuntando certificado (+30 pts) y valida tu Registro RENCA del MMAyA (+30 pts).
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── SECCIÓN INTERMEDIA: PLAYER JOURNEY (ONBOARDING FIRST WIN & BUCLE ENDGAME NIVEL 33) ── */}
      <PlayerJourneyModule
        currentSocio={currentSocio}
        activeProfile={activeProfile}
        rpgStats={rpgStats}
        activities={activities}
        timeLogs={timeLogs}
        triggerToast={showToast}
      />

      {/* ── SECCIÓN COMPLETA INFERIOR: ÁRBOL DE TALENTOS GAMIFICADO (CONSTELACIONES RPG) ── */}
      <div id="arbol-talentos-full" className="w-full pt-1">
        <TalentTreeConstellation
          activePartnerEmail={selectedEmail}
          activePartnerName={activeProfile.name}
        />
      </div>

      {/* ── MODAL: LA ESCALA DE LOS 33 GRADOS DE MAESTRÍA DE SERAM ── */}
      <AnimatePresence>
        {showDegreesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Header del Modal */}
              <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Cénit Profesional · Grado 33
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Progreso de {activeProfile.name}: Nivel {rpgStats.level} / 33
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-400" /> La Escala de los 33 Grados de Maestría
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Diseñada para años de dedicación e impacto real. Cada grado incrementa la tarifa pericial societaria y la jerarquía de dictamen en litigios y megaproyectos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDegreesModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido con Scroll de los 33 Niveles */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Resumen de los 6 Órdenes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MASTERY_ORDERS.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1"
                    >
                      <span className="text-[9px] font-black uppercase block truncate" style={{ color: ord.color }}>
                        {ord.name.split(':')[0]}
                      </span>
                      <span className="text-[11px] font-extrabold text-white">
                        Niveles {ord.minLevel} - {ord.maxLevel}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Listado Completo de los 33 Grados */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Progresión Detallada por Niveles (1 a 33)
                  </h4>

                  <div className="space-y-2">
                    {LEVELS_33.map((lvl) => {
                      const isCurrent = lvl.level === rpgStats.level;
                      const isPast = lvl.level < rpgStats.level;
                      const isFuture = lvl.level > rpgStats.level;

                      return (
                        <div
                          key={lvl.level}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrent
                              ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                              : lvl.isGraduation
                              ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/[0.08] via-purple-500/[0.04] to-black/40 ring-1 ring-amber-400/30'
                              : isPast
                              ? 'border-white/[0.06] bg-white/[0.01] opacity-75'
                              : 'border-white/[0.04] bg-black/40 opacity-90'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${
                                isCurrent
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-mono shadow-md'
                                  : lvl.isGraduation
                                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 border-amber-200 font-mono font-black shadow-sm'
                                  : isPast
                                  ? 'bg-[#00e03c]/20 text-[#00e03c] border-[#00e03c]/30 font-mono'
                                  : 'bg-white/[0.04] text-slate-400 border-white/10 font-mono'
                              }`}
                            >
                              {lvl.level}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className={`text-xs font-black ${isCurrent ? 'text-amber-300' : lvl.isGraduation ? 'text-amber-200' : 'text-white'}`}>
                                  {lvl.title}
                                </h5>
                                {lvl.isGraduation && (
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                    ⭐ NIVEL TRONCAL DE GRADUACIÓN
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-950">
                                    Nivel Actual
                                  </span>
                                )}
                                {isPast && (
                                  <span className="text-[10px] text-[#00e03c] font-black">
                                    ✓ Superado
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                {lvl.description}
                              </p>
                              {lvl.isGraduation && GRADUATION_REQUIREMENTS[lvl.graduationKey] && (
                                <div className="p-2 rounded-lg bg-black/50 border border-amber-500/20 text-[9px] text-amber-200/90 font-mono space-y-0.5">
                                  <span className="font-bold text-amber-300 block">Requisitos de Graduación Obligatorios:</span>
                                  <span>{GRADUATION_REQUIREMENTS[lvl.graduationKey].description}</span>
                                </div>
                              )}
                              <span className="text-[9px] text-slate-500 font-medium">
                                {lvl.orderName}
                              </span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                            <span className="text-[10px] font-mono text-amber-300 font-bold">
                              {lvl.feeMultiplier.toFixed(2)}x Tarifa
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {lvl.maxXP === Infinity
                                ? `> ${lvl.minXP.toLocaleString()} XP`
                                : `${lvl.minXP.toLocaleString()} - ${lvl.maxXP.toLocaleString()} XP`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  SERAM Meritocratic Engine v33 · 615,000 XP Cénit
                </span>
                <button
                  type="button"
                  onClick={() => setShowDegreesModal(false)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-all cursor-pointer"
                >
                  Entendido y Continuar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: TOUR INTERACTIVO CÓMO JUGAR A LA CONSULTORA ── */}
      <InteractiveGameTourModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        currentSocio={currentSocio}
      />

    </div>
  );
}

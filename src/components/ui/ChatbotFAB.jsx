/**
 * @file ChatbotFAB.jsx  v2.0
 * @description SERAM Smart Assistant - Chat de Diagnostico Digital y Contacto 24/7.
 * Posicion: esquina superior derecha (top-[72px] right-4)
 * Flujo: Bienvenida -> Diagnostico (3 pasos) -> Resultado | Contacto
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, ArrowLeft, Zap, BookOpen, Briefcase,
  Send, CheckCircle2, Phone, Mail, ExternalLink,
  ChevronRight, Leaf, CornerDownLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = {
  q1: {
    id: 'q1',
    bot: '¡Para darte la recomendación exacta, cuéntame: cuál es el tipo de tu proyecto o necesidad?',
    allowComment: false,
    options: [
      { label: '🏗️ Obra civil o proyecto comercial',   next: 'q2_civil' },
      { label: '🏭 Industria manufacturera',           next: 'q2_industrial' },
      { label: '⛏️ Operación minera o concesión',      next: 'q2_mining' },
      { label: '🗺️ Proyecto ambiental / SIG',          next: 'q2_sig' },
      { label: '🎓 Capacitar a mi equipo',             next: 'q2_training' },
      { label: '💬 Solo tengo una consulta puntual',   next: 'q3', service: 'CONSULT' },
    ],
  },
  q2_civil: {
    id: 'q2_civil',
    bot: 'Entendido. ¿En qué etapa legal se encuentra tu proyecto?',
    allowComment: true,
    commentLabel: '¿Tienes algún documento observado o rechazado? Descríbelo (opcional)',
    options: [
      { label: 'Necesito la Categorización Ambiental (FNCA)', next: 'q3', service: 'FNCA' },
      { label: 'Ya tengo FNCA, necesito avanzar con la licencia', next: 'q3', service: 'FNCA_ADV' },
      { label: 'Me observaron o rechazaron un documento', next: 'q3', service: 'FNCA_OBS' },
    ],
  },
  q2_industrial: {
    id: 'q2_industrial',
    bot: 'Bien. ¿Cuál es la situación actual de tu industria?',
    allowComment: true,
    commentLabel: '¿Conoces la categoría de tu industria (1, 2, 3 o 4)? (opcional)',
    options: [
      { label: 'Nunca tramité el RAI (Registro Ambiental Industrial)', next: 'q3', service: 'RAI' },
      { label: 'Mi RAI está vencido u observado', next: 'q3', service: 'RAI_OBS' },
      { label: 'Necesito Manifiestos o monitoreos de laboratorio', next: 'q3', service: 'MA_MON' },
      { label: 'Necesito el PSST / LASP (Seguridad)', next: 'q3', service: 'PSST' },
    ],
  },
  q2_mining: {
    id: 'q2_mining',
    bot: 'Perfecto. ¿Qué necesitas para tu concesión o actividad minera?',
    allowComment: true,
    commentLabel: 'Describe brevemente tu área o tipo de concesión (opcional)',
    options: [
      { label: 'Formulario de Prospección Minera (PM)', next: 'q3', service: 'PROSP' },
      { label: 'Plan de Evaluación de Medio Ambiente (EMAP)', next: 'q3', service: 'EMAP' },
      { label: 'Cartografía SIG y mapas para trámite minero', next: 'q3', service: 'SIG_MINING' },
    ],
  },
  q2_sig: {
    id: 'q2_sig',
    bot: '¡Área de mucha demanda! ¿Qué tipo de análisis o servicio SIG necesitas?',
    allowComment: true,
    commentLabel: 'Cuéntanos brevemente el contexto de tu proyecto ambiental (opcional)',
    options: [
      { label: 'Mapas ambientales para licencia o trámite', next: 'q3', service: 'SIG_MAPS' },
      { label: 'Plan de Aplicación SIG completo para mi proyecto', next: 'q3', service: 'SIG_FULL' },
      { label: 'Análisis de deforestación o cobertura forestal', next: 'q3', service: 'SIG_DEF' },
      { label: 'Riesgo hidrológico o mapas de inundación', next: 'q3', service: 'SIG_HYD' },
      { label: 'Soporte cartográfico B2B para mi consultora', next: 'q3', service: 'SIG_B2B' },
    ],
  },
  q2_training: {
    id: 'q2_training',
    bot: 'Excelente elección. ¿Qué nivel de formación estás buscando?',
    allowComment: false,
    options: [
      { label: 'Curso SIG Básico (QGIS desde cero)', next: 'q3', service: 'COURSE_SIG' },
      { label: 'Membresía Academia Premium', next: 'q3', service: 'PREMIUM' },
      { label: 'Taller corporativo personalizado para mi equipo', next: 'q3', service: 'CORP' },
      { label: 'Quiero explorar toda la oferta primero', next: 'q3', service: 'BROWSE_COURSES' },
    ],
  },
  q3: {
    id: 'q3',
    bot: '¡Casi listo! ¿Con qué urgencia necesitas comenzar?',
    allowComment: true,
    commentLabel: '¿Algún detalle adicional o contexto para nuestro equipo? (opcional)',
    options: [
      { label: '⚡ Esta semana, es urgente', next: 'result', urgency: 'high' },
      { label: '📅 Este mes', next: 'result', urgency: 'medium' },
      { label: '🔎 Estoy evaluando opciones', next: 'result', urgency: 'low' },
    ],
  },
};

const SERVICES = {
  FNCA:          { tag: 'Trámites Ambientales',    title: 'Categorización Ambiental (FNCA)',                   desc: 'El punto de partida legal de tu proyecto. Lo gestionamos con precisión técnica para que tu obra comience sin frenos administrativos.',                   price: 'Desde USD 150', route: '/quote',   cta: 'Cotizar FNCA Ahora' },
  FNCA_ADV:      { tag: 'Avance Post-FNCA',         title: 'Instrumento de Licencia — DIA, EEIA o MA',          desc: 'Tu Categorización está lista. Necesitamos el instrumento correcto para completar tu Licencia Ambiental definitiva.',                                 price: 'Consultar',    route: '/quote',   cta: 'Avanzar Mi Licencia' },
  FNCA_OBS:      { tag: 'Corrección Urgente',       title: 'Corrección y Resubmisión de Documentos Observados', desc: 'Documentos rechazados. Los corregimos con blindaje técnico-legal hasta lograr la aprobación.',                                                    price: 'Eval. gratis', route: '/quote',   cta: 'Evaluar Mi Caso Gratis' },
  RAI:           { tag: 'Regularización Industrial', title: 'Registro Ambiental Industrial (RAI)',              desc: 'Evita precintos y multas. Tramitamos tu RAI para Categorías 3 y 4 con velocidad express y garantía legal.',                                          price: 'Desde USD 200', route: '/quote',  cta: 'Obtener Mi RAI Express' },
  RAI_OBS:       { tag: 'Renovación Urgente',       title: 'Renovación de RAI Vencido u Observado',             desc: 'Tu RAI tiene problemas. Lo actualizamos y blindamos tu fábrica antes de una inspección sorpresa.',                                                  price: 'Eval. gratis', route: '/quote',   cta: 'Renovar Mi RAI' },
  MA_MON:        { tag: 'Seguridad Industrial',     title: 'Manifiestos Ambientales y Monitoreos',              desc: 'Adecuación para Categorías 1 y 2. Laboratorios certificados para ruido, agua, aire e iluminación.',                                                price: 'Desde USD 120', route: '/quote',  cta: 'Cotizar Monitoreo' },
  PSST:          { tag: 'Seguridad Industrial',     title: 'PSST y LASP — Seguridad e Higiene Industrial',      desc: 'Programa de Seguridad visado por Ing. SySO externo ante el Ministerio de Trabajo boliviano.',                                                      price: 'Desde USD 180', route: '/quote',  cta: 'Cotizar PSST' },
  PROSP:         { tag: 'Minería',                title: 'Formulario de Prospección Minera (PM)',             desc: 'Carpeta de PM con cartografía exacta para aprobación ante AJAM o ABM.',                                                                             price: 'Desde USD 300', route: '/quote',  cta: 'Cotizar Prospección' },
  EMAP:          { tag: 'Minería',                title: 'Plan EMAP — Habilitación Minera',                 desc: 'EMAP diseñado con estudios técnicos y cartográficos para aprobación express de tu concesión.',                                                     price: 'Desde USD 400', route: '/quote',  cta: 'Cotizar Plan EMAP' },
  SIG_MINING:    { tag: 'SIG & Minería',           title: 'Cartografía SIG para Trámites Mineros',             desc: 'Planos, coordenadas UTM, layers vectoriales y mapas temáticos listos para trámite minero.',                                                        price: 'Desde USD 200', route: '/quote',  cta: 'Cotizar Cartografía' },
  SIG_MAPS:      { tag: 'SIG Ambiental',            title: 'Mapas Ambientales para Licencias',                  desc: 'Mapas temáticos e informes cartográficos que pasan la revisión técnica de autoridades ambientales. Sin observaciones.',                            price: 'Desde USD 150', route: '/quote',  cta: 'Cotizar Mis Mapas' },
  SIG_FULL:      { tag: 'SIG Ambiental',            title: 'Plan de Aplicación SIG Completo',                   desc: 'Captura, procesamiento, análisis espacial y entrega de productos cartográficos listos para trámite.',                                               price: 'Desde USD 350', route: '/quote',  cta: 'Cotizar Plan de SIG' },
  SIG_DEF:       { tag: 'SIG Ambiental',            title: 'Análisis de Deforestación y Quemas',                desc: 'Detección multitemporal de cambios de cobertura forestal. Informes para ABT y proyectos REDD+.',                                                   price: 'Desde USD 280', route: '/quote',  cta: 'Solicitar Análisis' },
  SIG_HYD:       { tag: 'SIG Ambiental',            title: 'Riesgo Hidrológico e Inundaciones',                 desc: 'Modelamiento hidráulico predictivo y mapas de inundación para constructoras e inmobiliarias.',                                                    price: 'Desde USD 320', route: '/quote',  cta: 'Solicitar Modelamiento' },
  SIG_B2B:       { tag: 'SIG B2B',                 title: 'Soporte Cartográfico B2B',                          desc: 'Tercerización de análisis espacial y procesamiento GIS para consultores que necesitan más capacidad técnica.',                               price: 'Por proyecto',  route: '/quote',  cta: 'Hablar sobre B2B' },
  COURSE_SIG:    { tag: 'SERAM Academy',            title: 'Curso SIG Aplicado (QGIS)',                         desc: '20h de formación práctica: mapeo de cuencas, zonificación y cartografía ambiental con el Ing. Diego Barrientos.',                                  price: 'USD 150',       route: '/academy', cta: 'Ver Curso SIG' },
  PREMIUM:       { tag: 'SERAM Academy',            title: 'Membresía Academia Premium',                        desc: 'Acceso ilimitado a todos los cursos: SIG, Huella de Carbono, Auditoría Ambiental, ebooks y recursos exclusivos.',                                 price: 'USD 35 / año',  route: '/academy', cta: 'Activar Membresía' },
  CORP:          { tag: 'Corporativo',              title: 'Taller Corporativo de Formación Ambiental',         desc: 'Programa formativo a medida: SIG aplicado, fiscalización ambiental y cumplimiento normativo boliviano.',                                           price: 'Personalizado', route: '/quote',  cta: 'Solicitar Propuesta' },
  BROWSE_COURSES:{ tag: 'SERAM Academy',            title: 'Explora SERAM Academy',                             desc: 'Cursos gratuitos y de pago, masterclasses y ebooks de gestión ambiental, SIG y legislación boliviana.',                                           price: 'Desde USD 0',   route: '/academy', cta: 'Ir a SERAM Academy' },
  CONSULT:       { tag: 'Consulta Gratuita',        title: 'Consulta con un Especialista SERAM',                desc: 'Nuestro equipo está disponible para resolver tus dudas sin compromiso. Primera consulta completamente gratuita.',                                  price: 'Gratis',        route: '/contact', cta: 'Hablar con un Especialista' },
};

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-xl bg-[#00e03c]/15 border border-[#00e03c]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Leaf className="w-3.5 h-3.5 text-[#00e03c]" />
    </div>
  );
}

function BotBubble({ text }) {
  return (
    <div className="flex gap-2.5">
      <BotAvatar />
      <div className="bg-white/[0.06] border border-white/[0.05] rounded-2xl rounded-tl-sm p-3.5 text-[12px] text-slate-200 leading-relaxed max-w-[85%]">
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-[#00e03c]/15 border border-[#00e03c]/25 rounded-2xl rounded-tr-sm px-4 py-2.5 text-[12px] text-white max-w-[82%] font-medium">
        {text}
      </div>
    </div>
  );
}

export default function ChatbotFAB() {
  const [isOpen, setIsOpen]             = useState(false);
  const [view, setView]                 = useState('welcome');
  const [stepId, setStepId]             = useState('q1');
  const [messages, setMessages]         = useState([]);
  const [comment, setComment]           = useState('');
  const [serviceId, setServiceId]       = useState(null);
  const [urgency, setUrgency]           = useState(null);
  const [contactName, setContactName]   = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg]     = useState('');
  const [contactSent, setContactSent]   = useState(false);
  const navigate       = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = useCallback((step) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now() + Math.random(), type: 'bot', text: step.bot, options: step.options, allowComment: step.allowComment, commentLabel: step.commentLabel },
    ]);
  }, []);

  const startDiagnosis = useCallback(() => {
    setView('diagnosis'); setMessages([]); setServiceId(null); setUrgency(null); setComment(''); setStepId('q1');
    setTimeout(() => addBotMessage(STEPS['q1']), 300);
  }, [addBotMessage]);

  const handleOption = useCallback((option) => {
    setMessages(prev => [...prev.map(m => ({ ...m, options: undefined })), { id: Date.now() + Math.random(), type: 'user', text: option.label }]);
    setComment('');
    if (option.service) setServiceId(option.service);
    if (option.urgency) setUrgency(option.urgency);
    if (option.next === 'result') {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), type: 'bot', text: 'Bas\u00e1ndome en tus respuestas, aqu\u00ed est\u00e1 la soluci\u00f3n ideal para tu caso:' }]);
        setTimeout(() => setView('result'), 700);
      }, 400);
    } else {
      const nextStep = STEPS[option.next];
      if (nextStep) { setStepId(option.next); setTimeout(() => addBotMessage(nextStep), 500); }
    }
  }, [addBotMessage]);

  const handleReset = () => { setView('welcome'); setMessages([]); setServiceId(null); setUrgency(null); setComment(''); };
  const handleContactSend = () => {
    if (!contactName.trim() && !contactMsg.trim()) return;
    setContactSent(true);
    setTimeout(() => { setIsOpen(false); navigate('/contact'); }, 1800);
  };
  const resolvedService = serviceId ? SERVICES[serviceId] : null;

  const quickActions = [
    { icon: <Zap className="w-4 h-4 text-[#00e03c]" />, bg: 'bg-gradient-to-r from-[#00e03c]/12 to-[#00e03c]/5', border: 'border-[#00e03c]/25 hover:border-[#00e03c]/55', iconBg: 'bg-[#00e03c]/20 shadow-[0_0_12px_rgba(0,224,60,0.2)]', title: 'Diagnóstico Digital', sub: 'Encuentra tu solución en 60 segundos', arrow: <ChevronRight className="w-4 h-4 text-[#00e03c]/60 group-hover:text-[#00e03c] transition-colors flex-shrink-0" />, action: startDiagnosis },
    { icon: <Phone className="w-4 h-4 text-slate-300" />, bg: 'bg-white/[0.04]', border: 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]', iconBg: 'bg-white/10', title: 'Hablar con Especialista', sub: 'WhatsApp, email o formulario', arrow: <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />, action: () => setView('contact') },
  ];

  return (
    <>
      <div className="fixed top-6 right-4 sm:right-6 z-[115] pointer-events-auto">
        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="group relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-[#00e03c]/30 hover:border-[#00e03c]/70 text-slate-300 hover:text-[#00e03c] transition-all duration-300 shadow-xl shadow-black/50 cursor-none"
          title="Asistente SERAM"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-300" />
              </motion.div>
            ) : (
              <motion.div
                key="chat-icon"
                initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#00e03c] rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 z-[112] sm:hidden" />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[80px] right-3 sm:right-6 z-[113] w-[calc(100vw-1.5rem)] sm:w-[390px] max-h-[calc(100vh-6.5rem)] flex flex-col rounded-3xl bg-slate-950/96 backdrop-blur-2xl border border-[#00e03c]/15 shadow-2xl shadow-black/70 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.05] bg-black/25 flex-shrink-0">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#00e03c]/25 to-[#00e03c]/10 border border-[#00e03c]/35 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4 text-[#00e03c]" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00e03c] rounded-full border-2 border-slate-950" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-white uppercase tracking-wider font-tech leading-none">Asistente SERAM</p>
                </div>
                <div className="flex items-center gap-1">
                  {view !== 'welcome' && (
                    <button onClick={handleReset} title="Volver" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200 cursor-none">
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200 cursor-none">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 scroll-smooth">

                {view === 'welcome' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-3">
                    <BotBubble text={<span>Bienvenido a <strong className="text-white">SERAM</strong> 🌿<br/>Soy tu asistente de consultoría ambiental. Puedo ayudarte a encontrar el <strong className="text-[#00e03c]">servicio exacto</strong> para tu proyecto o conectarte con nuestro equipo al instante.</span>} />
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest font-tech px-1 pt-1">¿Qué deseas hacer hoy?</p>
                    {quickActions.map((item, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={item.action}
                        className={`group w-full flex items-center gap-3 p-3.5 rounded-2xl ${item.bg} border ${item.border} transition-all duration-300 cursor-none text-left`}>
                        <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-white uppercase tracking-wide leading-none mb-0.5">{item.title}</p>
                          <p className="text-[10px] text-slate-400 leading-snug">{item.sub}</p>
                        </div>
                        {item.arrow}
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {view === 'diagnosis' && (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg, i) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                          {msg.type === 'bot' && (
                            <div className="flex gap-2.5">
                              <BotAvatar />
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="bg-white/[0.06] border border-white/[0.05] rounded-2xl rounded-tl-sm p-3.5 text-[12px] text-slate-200 leading-relaxed">{msg.text}</div>
                                {msg.options && i === messages.length - 1 && (
                                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="space-y-1.5">
                                    {msg.options.map((opt, oi) => (
                                      <motion.button key={oi} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: 0.1 + oi * 0.06 }}
                                        onClick={() => handleOption(opt)}
                                        className="w-full text-left text-[11px] px-3 py-2.5 rounded-xl bg-[#00e03c]/[0.07] border border-[#00e03c]/20 text-slate-200 hover:bg-[#00e03c]/[0.15] hover:border-[#00e03c]/45 hover:text-white transition-all duration-200 cursor-none leading-snug"
                                      >{opt.label}</motion.button>
                                    ))}
                                    {msg.allowComment && (
                                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="pt-1">
                                        <label className="text-[9px] text-slate-500 uppercase tracking-widest font-tech block mb-1.5">
                                          <CornerDownLeft className="w-3 h-3 inline-block mr-1 opacity-50" />
                                          {msg.commentLabel || 'Comentario adicional (opcional)'}
                                        </label>
                                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Escribe aquí (opcional)..."
                                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[11px] text-slate-300 placeholder-slate-700 resize-none outline-none focus:border-[#00e03c]/30 transition-colors duration-200 font-sans leading-relaxed" />
                                      </motion.div>
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          )}
                          {msg.type === 'user' && <UserBubble text={msg.text} />}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-1" />
                  </div>
                )}

                {view === 'result' && resolvedService && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-3">
                    <BotBubble text="¡Excelente! Basándome en tu diagnóstico, aquí está la solución ideal para tu caso:" />
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
                      className="rounded-2xl overflow-hidden border border-[#00e03c]/30 bg-gradient-to-br from-[#00e03c]/10 via-[#00e03c]/5 to-transparent">
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#00e03c]/80 font-tech">{resolvedService.tag}</span>
                          {urgency === 'high' && <span className="text-[8px] bg-amber-500/20 border border-amber-500/40 text-amber-400 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider flex-shrink-0">⚡ Urgente</span>}
                        </div>
                        <h4 className="text-[13px] font-black text-white leading-snug">{resolvedService.title}</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{resolvedService.desc}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00e03c] flex-shrink-0" />
                          <span className="text-[11px] font-bold text-[#00e03c]">{resolvedService.price}</span>
                        </div>
                      </div>
                      <button onClick={() => { setIsOpen(false); navigate(resolvedService.route); }}
                        className="w-full py-3 bg-[#00e03c] text-black font-black text-[11px] uppercase tracking-widest hover:bg-white transition-colors duration-300 cursor-none">{resolvedService.cta}</button>
                    </motion.div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleReset} className="flex-1 text-[10px] font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl py-2.5 transition-all duration-200 cursor-none">Nuevo diagnóstico</button>
                      <button onClick={() => setView('contact')} className="flex-1 text-[10px] font-bold text-[#00e03c] hover:text-white border border-[#00e03c]/25 hover:border-[#00e03c]/50 rounded-xl py-2.5 transition-all duration-200 cursor-none">Hablar con especialista</button>
                    </div>
                  </motion.div>
                )}

                {view === 'contact' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="space-y-3">
                    <BotBubble text="Nuestro equipo de especialistas está listo para atenderte. Elige la vía que prefieras:" />
                    <a href="https://wa.me/59179999999?text=Hola%20SERAM%2C%20me%20interesa%20conocer%20sus%20servicios." target="_blank" rel="noopener noreferrer"
                      className="group w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/25 hover:border-[#25D366]/55 hover:bg-[#25D366]/15 transition-all duration-300 cursor-none">
                      <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-[#25D366]" /></div>
                      <div className="flex-1 min-w-0"><p className="text-[11px] font-black text-white uppercase tracking-wide leading-none mb-0.5">WhatsApp</p><p className="text-[10px] text-slate-400">+591 79 999 999 · Respuesta inmediata</p></div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#25D366]/60 group-hover:text-[#25D366] transition-colors flex-shrink-0" />
                    </a>
                    <a href="mailto:contacto@seram.bo?subject=Consulta%20servicios%20ambientales"
                      className="group w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 cursor-none">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 text-slate-300" /></div>
                      <div className="flex-1 min-w-0"><p className="text-[11px] font-black text-white uppercase tracking-wide leading-none mb-0.5">Email</p><p className="text-[10px] text-slate-400">contacto@seram.bo</p></div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
                    </a>
                    {!contactSent ? (
                      <div className="border border-white/[0.08] rounded-2xl p-4 space-y-2.5 bg-white/[0.02]">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">Mensaje Rápido</p>
                        <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Tu nombre" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[11px] text-slate-300 placeholder-slate-700 outline-none focus:border-[#00e03c]/30 transition-colors duration-200 font-sans" />
                        <input type="text" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="Email o WhatsApp" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[11px] text-slate-300 placeholder-slate-700 outline-none focus:border-[#00e03c]/30 transition-colors duration-200 font-sans" />
                        <textarea rows={3} value={contactMsg} onChange={e => setContactMsg(e.target.value)} placeholder="En qué podemos ayudarte? Cuéntanos brevemente tu proyecto..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[11px] text-slate-300 placeholder-slate-700 resize-none outline-none focus:border-[#00e03c]/30 transition-colors duration-200 font-sans leading-relaxed" />
                        <button onClick={handleContactSend} className="w-full py-2.5 bg-[#00e03c] text-black font-black text-[11px] uppercase tracking-widest hover:bg-white transition-colors duration-300 rounded-xl cursor-none flex items-center justify-center gap-2">
                          <Send className="w-3.5 h-3.5" /> Enviar Mensaje
                        </button>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border border-[#00e03c]/30 rounded-2xl p-4 bg-[#00e03c]/10 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#00e03c] mx-auto" />
                        <p className="text-[12px] font-black text-white">¡Mensaje recibido!</p>
                        <p className="text-[10px] text-slate-400">Redirigiendo a Contacto...</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

              </div>

              <div className="border-t border-white/[0.05] px-4 py-2 flex items-center justify-center flex-shrink-0 bg-black/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#00e03c] rounded-full animate-pulse" />
                  <span className="text-[8px] text-[#00e03c]/70 font-tech uppercase tracking-wider font-bold">En línea 24/7</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

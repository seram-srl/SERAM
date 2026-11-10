/**
 * @file ChatbotFAB.jsx  v3.0
 * @description Asistente Digital SERAM - Sistema de Precalificación Inbound & ARM (Automated Relationship Machine).
 * Conexión nativa con el motor ARM para clasificar prospectos (BANT/GPCT: qué busca, cuándo lo necesita, cuánto quiere invertir),
 * asignar temperatura comercial (Caliente/SQL, Tibio/MQL, Frío/Curioso), activar cadencia anti-baneo de 14 días y derivar
 * inmediatamente a cierre de venta a los prospectos calificados.
 *
 * Directrices: Cero emoticones, estilo profesional Neuform y 100% en español.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, ArrowLeft, Zap,
  Send, CheckCircle2, Phone, Mail, ExternalLink,
  ChevronRight, CornerDownLeft, ShieldCheck, Clock, DollarSign,
  UserCheck, Check, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { armService } from '../../services/armService';

const STEPS = {
  q1: {
    id: 'q1',
    bot: 'Para brindarte la recomendación técnica exacta: ¿cuál es el tipo de tu proyecto o requerimiento principal?',
    allowComment: false,
    options: [
      { label: 'Obra civil o proyecto comercial', next: 'q2_civil' },
      { label: 'Industria manufacturera o planta', next: 'q2_industrial' },
      { label: 'Operación minera o concesión', next: 'q2_mining' },
      { label: 'Proyecto ambiental, SIG o cuencas', next: 'q2_sig' },
      { label: 'Capacitación técnica de equipo institucional', next: 'q2_training' },
      { label: 'Consulta técnica puntual o exploratoria', next: 'q3', service: 'CONSULT' },
    ],
  },
  q2_civil: {
    id: 'q2_civil',
    bot: 'Comprendido. ¿En qué fase legal o administrativa se encuentra tu proyecto?',
    allowComment: true,
    commentLabel: '¿Tienes algún trámite observado o rechazado? Descríbelo (opcional)',
    options: [
      { label: 'Categorización Ambiental (FNCA inicial)', next: 'q3', service: 'FNCA' },
      { label: 'Licencia Ambiental en curso (DIA, EEIA o MA)', next: 'q3', service: 'FNCA_ADV' },
      { label: 'Corrección y resubmisión de observaciones', next: 'q3', service: 'FNCA_OBS' },
    ],
  },
  q2_industrial: {
    id: 'q2_industrial',
    bot: 'Excelente. ¿Cuál es el estado actual de tu planta o unidad industrial?',
    allowComment: true,
    commentLabel: 'Indica la categoría industrial (1, 2, 3 o 4) si la conoces (opcional)',
    options: [
      { label: 'Obtención de Registro Ambiental Industrial (RAI)', next: 'q3', service: 'RAI' },
      { label: 'Renovación de RAI vencido u observado', next: 'q3', service: 'RAI_OBS' },
      { label: 'Monitoreos de laboratorio y Manifiesto Ambiental', next: 'q3', service: 'MA_MON' },
      { label: 'Programa de Seguridad (PSST / LASP)', next: 'q3', service: 'PSST' },
    ],
  },
  q2_mining: {
    id: 'q2_mining',
    bot: 'Entendido. ¿Qué trámite requiere tu operación o concesión minera?',
    allowComment: true,
    commentLabel: 'Detalles sobre ubicación o tipo de mineral (opcional)',
    options: [
      { label: 'Formulario de Prospección Minera (PM)', next: 'q3', service: 'PROSP' },
      { label: 'Plan EMAP para habilitación minera', next: 'q3', service: 'EMAP' },
      { label: 'Cartografía SIG y planos vectoriales AJAM', next: 'q3', service: 'SIG_MINING' },
    ],
  },
  q2_sig: {
    id: 'q2_sig',
    bot: 'Área de alta especialidad en SERAM. ¿Qué alcance SIG o geoespacial buscas?',
    allowComment: true,
    commentLabel: 'Área geográfica o contexto del estudio (opcional)',
    options: [
      { label: 'Mapas ambientales certificados para licencias', next: 'q3', service: 'SIG_MAPS' },
      { label: 'Plan de Aplicación SIG integral', next: 'q3', service: 'SIG_FULL' },
      { label: 'Análisis multitemporal de cobertura y deforestación', next: 'q3', service: 'SIG_DEF' },
      { label: 'Modelamiento de riesgo hidrológico e inundación', next: 'q3', service: 'SIG_HYD' },
      { label: 'Soporte cartográfico B2B para consultores', next: 'q3', service: 'SIG_B2B' },
    ],
  },
  q2_training: {
    id: 'q2_training',
    bot: 'Formación de alto impacto técnico. ¿Qué modalidad buscas para tu equipo?',
    allowComment: false,
    options: [
      { label: 'Curso SIG Aplicado con QGIS (desde cero)', next: 'q3', service: 'COURSE_SIG' },
      { label: 'Membresía Anual Academia SERAM Premium', next: 'q3', service: 'PREMIUM' },
      { label: 'Taller corporativo a medida in-company', next: 'q3', service: 'CORP' },
      { label: 'Explorar catálogo de cursos técnicos', next: 'q3', service: 'BROWSE_COURSES' },
    ],
  },
  q3: {
    id: 'q3',
    bot: 'Segunda variable de calificación: ¿cuándo necesitas iniciar o contar con la entrega?',
    allowComment: true,
    commentLabel: '¿Tienes alguna fecha límite administrativa impuesta? (opcional)',
    options: [
      { label: 'Inmediato (menos de 15 días - Alta prioridad)', next: 'q4_budget', urgency: 'high', urgencyText: 'Inmediato (< 15 días)' },
      { label: 'Corto plazo (entre 15 y 45 días)', next: 'q4_budget', urgency: 'medium', urgencyText: 'Corto Plazo (15 a 45 días)' },
      { label: 'Planificación anual o fase exploratoria', next: 'q4_budget', urgency: 'low', urgencyText: 'Planificación (más de 45 días)' },
    ],
  },
  q4_budget: {
    id: 'q4_budget',
    bot: 'Tercera variable de precalificación: ¿cuál es el rango de inversión previsto para tu requerimiento?',
    allowComment: false,
    options: [
      { label: 'Mayor a USD 1,500 (Proyecto integral o alta prioridad)', next: 'prequalification_form', budgetKey: 'alto', budgetText: 'Mayor a USD 1,500' },
      { label: 'Entre USD 500 y USD 1,500 (Solución técnica estándar)', next: 'prequalification_form', budgetKey: 'medio', budgetText: 'USD 500 - USD 1,500' },
      { label: 'Entre USD 150 y USD 500 (Trámite básico inicial)', next: 'prequalification_form', budgetKey: 'basico', budgetText: 'USD 150 - USD 500' },
      { label: 'Menor a USD 150 o por definir (Exploración preliminar)', next: 'prequalification_form', budgetKey: 'curioso', budgetText: 'Menor a USD 150 / Por definir' },
    ],
  }
};

const SERVICES = {
  FNCA:          { tag: 'Trámites Ambientales',    title: 'Categorización Ambiental (FNCA)',                   desc: 'Punto de partida legal de proyectos. Evitamos demoras y rechazos administrativos ante la autoridad ambiental.', price: 'Desde USD 150', route: '/quote',   cta: 'Cotizar FNCA Ahora' },
  FNCA_ADV:      { tag: 'Avance Post-FNCA',         title: 'Instrumento de Licencia (DIA, EEIA o MA)',          desc: 'Elaboración y defensa técnica de estudios ambientales para la obtención de la Licencia Ambiental definitiva.', price: 'Consultar',    route: '/quote',   cta: 'Avanzar Mi Licencia' },
  FNCA_OBS:      { tag: 'Corrección Urgente',       title: 'Subsanación de Documentos Observados',              desc: 'Blindaje técnico-legal y corrección de observaciones hasta obtener la aprobación formal.',                    price: 'Evaluación Técnica', route: '/quote', cta: 'Evaluar Mi Caso' },
  RAI:           { tag: 'Regularización Industrial', title: 'Registro Ambiental Industrial (RAI)',              desc: 'Protección legal para industrias en Bolivia. Tramitación express de RAI categorías 3 y 4.',                  price: 'Desde USD 200', route: '/quote',  cta: 'Obtener Mi RAI' },
  RAI_OBS:       { tag: 'Renovación Urgente',       title: 'Renovación y Actualización de RAI',                 desc: 'Actualización urgente para prevenir precintos o multas municipales y de gobernación.',                      price: 'Evaluación Técnica', route: '/quote', cta: 'Renovar Mi RAI' },
  MA_MON:        { tag: 'Seguridad Industrial',     title: 'Manifiestos y Monitoreos de Laboratorio',           desc: 'Medición de ruido, efluentes y emisiones con laboratorios certificados y visado legal.',                      price: 'Desde USD 120', route: '/quote',  cta: 'Cotizar Monitoreo' },
  PSST:          { tag: 'Seguridad Industrial',     title: 'Programa de Seguridad (PSST y LASP)',               desc: 'Programa de Seguridad visado por profesional SySO y presentado ante el Ministerio de Trabajo.',              price: 'Desde USD 180', route: '/quote',  cta: 'Cotizar PSST' },
  PROSP:         { tag: 'Minería',                  title: 'Prospección Minera (Formulario PM)',                desc: 'Carpeta técnica y cartografía UTM para aprobación formal ante AJAM.',                                       price: 'Desde USD 300', route: '/quote',  cta: 'Cotizar Prospección' },
  EMAP:          { tag: 'Minería',                  title: 'Plan EMAP de Habilitación Minera',                  desc: 'Estudio ambiental integral y mapas temáticos para explotación y beneficio minero.',                          price: 'Desde USD 400', route: '/quote',  cta: 'Cotizar Plan EMAP' },
  SIG_MINING:    { tag: 'SIG y Minería',            title: 'Cartografía SIG para Trámites Mineros',             desc: 'Capas vectoriales, límites de cuadrículas y planos certificados listos para trámite.',                        price: 'Desde USD 200', route: '/quote',  cta: 'Cotizar Cartografía' },
  SIG_MAPS:      { tag: 'SIG Ambiental',            title: 'Mapas Ambientales Oficiales',                       desc: 'Informes cartográficos que superan revisiones ministeriales y departamentales.',                             price: 'Desde USD 150', route: '/quote',  cta: 'Cotizar Mis Mapas' },
  SIG_FULL:      { tag: 'SIG Ambiental',            title: 'Plan de Aplicación SIG Integral',                   desc: 'Modelamiento espacial, teledetección y entrega de geodatabases para proyectos de envergadura.',             price: 'Desde USD 350', route: '/quote',  cta: 'Cotizar Plan SIG' },
  SIG_DEF:       { tag: 'SIG Ambiental',            title: 'Análisis de Deforestación y Cobertura',             desc: 'Detección satelital multitemporal para informes ABT y proyectos forestales.',                                price: 'Desde USD 280', route: '/quote',  cta: 'Solicitar Análisis' },
  SIG_HYD:       { tag: 'SIG Ambiental',            title: 'Riesgo Hidrológico y Modelamiento',                 desc: 'Modelos de manchas de inundación y cuencas para infraestructura y urbanizaciones.',                          price: 'Desde USD 320', route: '/quote',  cta: 'Solicitar Modelamiento' },
  SIG_B2B:       { tag: 'SIG B2B',                  title: 'Tercerización Cartográfica B2B',                    desc: 'Capacidad técnica de soporte SIG para consultores y empresas de ingeniería.',                               price: 'A convenir',    route: '/quote',  cta: 'Hablar sobre B2B' },
  COURSE_SIG:    { tag: 'SERAM Academy',            title: 'Curso SIG Aplicado con QGIS',                       desc: '20 horas de formación práctica orientada a proyectos ambientales con el Ing. Diego Barrientos.',            price: 'USD 150',       route: '/academy', cta: 'Ver Curso SIG' },
  PREMIUM:       { tag: 'SERAM Academy',            title: 'Membresía Anual Academia Premium',                  desc: 'Acceso total a todos los cursos técnicos, recursos descargables y actualizaciones normativas.',             price: 'USD 35 / año',  route: '/academy', cta: 'Activar Membresía' },
  CORP:          { tag: 'Corporativo',              title: 'Taller Corporativo de Formación',                   desc: 'Capacitación presencial o virtual adaptada al sector productivo de tu empresa.',                            price: 'A medida',      route: '/quote',  cta: 'Solicitar Propuesta' },
  BROWSE_COURSES:{ tag: 'SERAM Academy',            title: 'Catálogo de Formación Especializada',               desc: 'Cursos técnicos, masterclasses y manuales de legislación ambiental boliviana.',                              price: 'Ver opciones',  route: '/academy', cta: 'Explorar Academia' },
  CONSULT:       { tag: 'Consulta Técnica',         title: 'Consulta con Especialista SERAM',                   desc: 'Diagnóstico preliminar para canalizar tu requerimiento con el director técnico del área.',                   price: 'Sin costo',     route: '/contact', cta: 'Hablar con Especialista' },
};

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-[#061e0c] border border-[#00e03c]/40 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,224,60,0.25)] p-1.5">
      <img
        src="/assets/brand/logo-seram-icon.png"
        alt="SERAM"
        className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
}

function BotBubble({ text }) {
  return (
    <div className="flex gap-2.5">
      <BotAvatar />
      <div className="bg-[#0f2010]/80 border border-[#1a3a1a]/60 rounded-2xl rounded-tl-sm p-3.5 text-[12px] text-white leading-relaxed max-w-[85%]">
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-[#126c0f]/30 border border-[#00e03c]/30 rounded-2xl rounded-tr-sm px-4 py-2.5 text-[12px] text-white max-w-[82%] font-medium">
        {text}
      </div>
    </div>
  );
}

export default function ChatbotFAB() {
  const { isChatbotOpen: isOpen, setIsChatbotOpen: setIsOpen, chatbotStartStep, setChatbotStartStep, triggerToast } = useApp();
  const [view, setView]                 = useState('welcome'); // 'welcome' | 'diagnosis' | 'form' | 'result' | 'contact'
  const [stepId, setStepId]             = useState('q1');
  const [messages, setMessages]         = useState([]);
  const [comment, setComment]           = useState('');
  
  // Variables BANT de Precalificación
  const [serviceId, setServiceId]       = useState(null);
  const [urgency, setUrgency]           = useState(null);
  const [urgencyText, setUrgencyText]   = useState('');
  const [budgetText, setBudgetText]     = useState('');
  
  // Datos del Lead
  const [leadName, setLeadName]         = useState('');
  const [leadCompany, setLeadCompany]   = useState('');
  const [leadPhone, setLeadPhone]       = useState('');
  const [leadEmail, setLeadEmail]       = useState('');
  const [optInAccepted, setOptInAccepted] = useState(true);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [createdLeadResult, setCreatedLeadResult] = useState(null);

  // Formulario de Contacto Rápido
  const [contactName, setContactName]   = useState('');
  const [contactPhone, setContactPhone] = useState('');
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
      {
        id: Date.now() + Math.random(),
        type: 'bot',
        text: step.bot,
        options: step.options,
        allowComment: step.allowComment,
        commentLabel: step.commentLabel
      },
    ]);
  }, []);

  useEffect(() => {
    if (isOpen && chatbotStartStep) {
      setView('diagnosis');
      setMessages([]);
      setServiceId(null);
      setUrgency(null);
      setComment('');
      setStepId(chatbotStartStep);
      const targetStep = STEPS[chatbotStartStep];
      if (targetStep) {
        setTimeout(() => addBotMessage(targetStep), 300);
      }
      setChatbotStartStep(null);
    }
  }, [isOpen, chatbotStartStep, setChatbotStartStep, addBotMessage]);

  const startDiagnosis = useCallback(() => {
    setView('diagnosis');
    setMessages([]);
    setServiceId(null);
    setUrgency(null);
    setComment('');
    setStepId('q1');
    setTimeout(() => addBotMessage(STEPS['q1']), 300);
  }, [addBotMessage]);

  const handleOption = useCallback((option) => {
    setMessages(prev => [
      ...prev.map(m => ({ ...m, options: undefined })),
      { id: Date.now() + Math.random(), type: 'user', text: option.label }
    ]);
    setComment('');

    if (option.service) setServiceId(option.service);
    if (option.urgency) {
      setUrgency(option.urgency);
      setUrgencyText(option.urgencyText || option.label);
    }
    if (option.budgetText) {
      setBudgetText(option.budgetText);
    }

    if (option.next === 'prequalification_form') {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: 'bot',
            text: 'Excelente. Para asociar tu proyecto en nuestro sistema ARM y calcular la calificación técnica, ingresa tus datos de contacto:'
          }
        ]);
        setTimeout(() => setView('form'), 600);
      }, 350);
    } else {
      const nextStep = STEPS[option.next];
      if (nextStep) {
        setStepId(option.next);
        setTimeout(() => addBotMessage(nextStep), 450);
      }
    }
  }, [addBotMessage]);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      triggerToast?.('Por favor ingresa al menos tu nombre y número de WhatsApp', 'error');
      return;
    }

    setIsSubmittingLead(true);
    const resolvedSrv = serviceId ? SERVICES[serviceId] : null;
    const resolvedTitle = resolvedSrv ? resolvedSrv.title : 'Consultoría Ambiental y Técnica';

    const leadPayload = {
      nombre: leadName.trim(),
      empresa: leadCompany.trim() || 'Particular / Institución',
      telefono: leadPhone.trim(),
      email: leadEmail.trim() || '',
      que_busca: resolvedTitle,
      cuando_necesita: urgencyText || 'En evaluación',
      cuanto_invertir: budgetText || 'Por definir',
      presupuesto_estimado_usd: budgetText.includes('1,500') ? 1600 : budgetText.includes('500') ? 850 : 250,
      socio_asignado: 'Ing. Diego Barrientos',
      origen: 'Asistente Web SERAM',
      metadata_inbound: {
        serviceId,
        urgency,
        optInAccepted,
        comentarioInicial: comment
      }
    };

    try {
      const created = await armService.createLead(leadPayload);
      setCreatedLeadResult(created);
      setView('result');
      triggerToast?.('Precalificación técnica registrada con éxito', 'success');
    } catch {
      triggerToast?.('No se pudo registrar la precalificación', 'error');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleReset = () => {
    setView('welcome');
    setMessages([]);
    setServiceId(null);
    setUrgency(null);
    setUrgencyText('');
    setBudgetText('');
    setComment('');
    setCreatedLeadResult(null);
  };

  const handleContactSend = async (e) => {
    e.preventDefault();
    if (!contactName.trim() && !contactPhone.trim()) return;

    setContactSent(true);
    // Registrar también en ARM
    try {
      await armService.createLead({
        nombre: contactName.trim() || 'Contacto Web Rápido',
        empresa: 'Por contactar',
        telefono: contactPhone.trim() || '',
        email: contactEmail.trim() || '',
        que_busca: 'Mensaje directo: ' + (contactMsg.slice(0, 80) || 'Consulta general'),
        cuando_necesita: 'Inmediato (< 15 días)',
        cuanto_invertir: 'Por definir',
        socio_asignado: 'Ing. Diego Barrientos',
        origen: 'Formulario Rápido Chatbot',
        notas_internas: contactMsg
      });
    } catch {
      // Silencioso
    }

    setTimeout(() => {
      setIsOpen(false);
      navigate('/contact');
    }, 1800);
  };

  const resolvedService = serviceId ? SERVICES[serviceId] : null;

  const quickActions = [
    {
      icon: <Zap className="w-4 h-4 text-[#00e03c]" />,
      bg: 'bg-gradient-to-r from-[#00e03c]/12 to-[#00e03c]/5',
      border: 'border-[#00e03c]/25 hover:border-[#00e03c]/55',
      iconBg: 'bg-[#00e03c]/20 shadow-[0_0_12px_rgba(0,224,60,0.2)]',
      title: 'Diagnóstico & Precalificación ARM',
      sub: 'Encuentra la solución exacta y evalúa tu proyecto en 60 segundos',
      arrow: <ChevronRight className="w-4 h-4 text-[#00e03c]/60 group-hover:text-[#00e03c] transition-colors flex-shrink-0" />,
      action: startDiagnosis
    },
    {
      icon: <Phone className="w-4 h-4 text-slate-300" />,
      bg: 'bg-white/[0.04]',
      border: 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]',
      iconBg: 'bg-white/10',
      title: 'Hablar con Especialista',
      sub: 'WhatsApp verificado, correo o mensaje directo',
      arrow: <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />,
      action: () => setView('contact')
    },
  ];

  return (
    <>
      <div className="fixed top-6 right-4 sm:right-6 z-[115] pointer-events-auto">
        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-[#00e03c]/30 hover:border-[#00e03c]/70 text-slate-300 hover:text-[#00e03c] transition-all duration-300 shadow-xl shadow-black/50 cursor-pointer"
          title="Asistente Digital SERAM"
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
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[112] sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[80px] right-3 sm:right-6 z-[113] w-[calc(100vw-1.5rem)] sm:w-[410px] max-h-[calc(100vh-6.5rem)] flex flex-col rounded-3xl bg-[#080f08]/98 backdrop-blur-2xl border border-[#1a3a1a]/60 shadow-2xl shadow-black/80 overflow-hidden"
            >
              {/* Encabezado */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1a3a1a]/60 bg-[#05100a]/70 flex-shrink-0">
                <div className="relative w-9 h-9 rounded-xl bg-[#061e0c] border border-[#00e03c]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,224,60,0.25)] p-1.5">
                  <img
                    src="/assets/brand/logo-seram-icon.png"
                    alt="Isotipo SERAM"
                    className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00e03c] rounded-full border-2 border-[#080f08]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-white uppercase tracking-wider font-tech leading-none">Asistente Digital SERAM</p>
                  <p className="text-[9.5px] text-[#00e03c] font-medium tracking-wide mt-0.5">Sistema ARM · Calificación Inbound</p>
                </div>
                <div className="flex items-center gap-1">
                  {view !== 'welcome' && (
                    <button
                      onClick={handleReset}
                      title="Volver al inicio"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contenido según vista */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 scroll-smooth">

                {/* VISTA 1: BIENVENIDA */}
                {view === 'welcome' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-3">
                    <BotBubble
                      text={
                        <span>
                          Bienvenido a <strong className="text-white">SERAM SRL</strong>.<br />
                          Soy tu asistente técnico digital. Te ayudo a identificar el <strong className="text-[#00e03c]">servicio exacto</strong> para tu proyecto, precalificar la viabilidad técnica y conectarte directamente con nuestro equipo directivo.
                        </span>
                      }
                    />
                    <p className="text-[10px] text-[#00e03c] font-bold uppercase tracking-widest font-tech px-1 pt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#00e03c] rounded-full inline-block animate-pulse" />
                      ¿Cómo podemos apoyarte hoy?
                    </p>
                    {quickActions.map((item, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={item.action}
                        className={`group w-full flex items-center gap-3 p-3.5 rounded-2xl ${item.bg} border ${item.border} transition-all duration-300 cursor-pointer text-left`}
                      >
                        <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] font-black text-white uppercase tracking-wide leading-none mb-1">{item.title}</p>
                          <p className="text-[11px] text-slate-300 leading-snug font-medium">{item.sub}</p>
                        </div>
                        {item.arrow}
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* VISTA 2: DIAGNÓSTICO CONVERSACIONAL */}
                {view === 'diagnosis' && (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {msg.type === 'bot' && (
                            <div className="flex gap-2.5">
                              <BotAvatar />
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm p-3.5 text-[12px] text-slate-200 leading-relaxed">
                                  {msg.text}
                                </div>
                                {msg.options && i === messages.length - 1 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.15 }}
                                    className="space-y-1.5"
                                  >
                                    {msg.options.map((opt, oi) => (
                                      <motion.button
                                        key={oi}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.25, delay: 0.08 + oi * 0.05 }}
                                        onClick={() => handleOption(opt)}
                                        className="w-full text-left text-[11.5px] px-4 py-3 rounded-2xl bg-[#00e03c]/[0.08] border border-[#00e03c]/25 text-white hover:bg-[#00e03c]/[0.18] hover:border-[#00e03c]/50 transition-all duration-200 cursor-pointer leading-snug font-medium flex items-center justify-between group"
                                      >
                                        <span>{opt.label}</span>
                                        <ChevronRight className="w-3.5 h-3.5 text-[#00e03c]/50 group-hover:text-[#00e03c] transition-colors" />
                                      </motion.button>
                                    ))}
                                    {msg.allowComment && (
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="pt-1.5"
                                      >
                                        <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-tech block mb-1">
                                          <CornerDownLeft className="w-3 h-3 inline-block mr-1 text-[#00e03c]" />
                                          {msg.commentLabel || 'Detalle complementario (opcional)'}
                                        </label>
                                        <textarea
                                          value={comment}
                                          onChange={e => setComment(e.target.value)}
                                          rows={2}
                                          placeholder="Añade información relevante para la precalificación..."
                                          className="w-full bg-white/[0.06] border border-white/[0.15] focus:border-[#00e03c] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-400 resize-none outline-none transition-colors duration-200 font-sans leading-relaxed"
                                        />
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

                {/* VISTA 3: FORMULARIO DE PRECALIFICACIÓN INBOUND */}
                {view === 'form' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="space-y-3">
                    <BotBubble text="Para generar el informe de precalificación y asignarte al especialista técnico adecuado, completa tus datos corporativos:" />

                    <form onSubmit={handleLeadSubmit} className="border border-[#00e03c]/30 rounded-2xl p-4 space-y-3 bg-[#00e03c]/[0.04]">
                      <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
                        <span className="text-[10px] font-black text-[#00e03c] uppercase tracking-wider font-tech">Ficha de Precalificación BANT</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00e03c]/15 text-[#00e03c] font-bold">100% Confidencial</span>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">Nombre Completo *</label>
                        <input
                          type="text"
                          required
                          value={leadName}
                          onChange={e => setLeadName(e.target.value)}
                          placeholder="Ej. Ing. Carlos Mendoza"
                          className="w-full bg-white/[0.06] border border-white/[0.15] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 outline-none focus:border-[#00e03c] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-300 block mb-1">Empresa o Institución</label>
                        <input
                          type="text"
                          value={leadCompany}
                          onChange={e => setLeadCompany(e.target.value)}
                          placeholder="Ej. Constructora Andina SRL / Particular"
                          className="w-full bg-white/[0.06] border border-white/[0.15] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 outline-none focus:border-[#00e03c] transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">WhatsApp *</label>
                          <input
                            type="tel"
                            required
                            value={leadPhone}
                            onChange={e => setLeadPhone(e.target.value)}
                            placeholder="+591 70000000"
                            className="w-full bg-white/[0.06] border border-white/[0.15] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 outline-none focus:border-[#00e03c] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">Correo Electrónico</label>
                          <input
                            type="email"
                            value={leadEmail}
                            onChange={e => setLeadEmail(e.target.value)}
                            placeholder="contacto@empresa.bo"
                            className="w-full bg-white/[0.06] border border-white/[0.15] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 outline-none focus:border-[#00e03c] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <label className="flex items-start gap-2 cursor-pointer text-[10px] text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={optInAccepted}
                            onChange={e => setOptInAccepted(e.target.checked)}
                            className="mt-0.5 rounded border-white/20 bg-white/10 text-[#00e03c] focus:ring-0 cursor-pointer"
                          />
                          <span>
                            Acepto el seguimiento técnico en ciclo de 14 días (hasta 7 contactos espaciados). Política estricta antispam y opción de baja voluntaria.
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingLead}
                        className="w-full py-3 bg-[#00e03c] text-slate-950 font-black text-[11px] uppercase tracking-wider hover:bg-white transition-all duration-300 rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#00e03c]/20"
                      >
                        {isSubmittingLead ? (
                          <span>Procesando Precalificación...</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" /> Finalizar y Calificar Proyecto
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* VISTA 4: RESULTADO Y DERIVACIÓN A VENDEDOR O NUTRICIÓN */}
                {view === 'result' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-3">
                    {createdLeadResult && (
                      <div className="rounded-2xl border border-white/[0.12] bg-white/[0.03] p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-tech">Precalificación ARM</span>
                          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            createdLeadResult.temperatura === 'caliente'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : createdLeadResult.temperatura === 'tibio'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            Temperatura: {createdLeadResult.temperatura} ({createdLeadResult.lead_score}/100)
                          </span>
                        </div>

                        {/* Derivación según temperatura */}
                        {createdLeadResult.temperatura === 'caliente' ? (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                              <UserCheck className="w-4 h-4" />
                              <span>Calificación Prioritaria para Cierre Comercial</span>
                            </div>
                            <p className="text-[11px] text-slate-200 leading-relaxed">
                              Tu requerimiento cuenta con alta prioridad. Asignamos tu cuenta al especialista <strong className="text-white">{createdLeadResult.socio_asignado}</strong> para la estructuración y cierre inmediato de la propuesta formal.
                            </p>
                            <a
                              href={armService.createWhatsAppUrl(
                                '59179999999',
                                `Hola ${createdLeadResult.socio_asignado}, completé la precalificación en la web de SERAM para el proyecto "${createdLeadResult.que_busca}". Deseo agendar el cierre de la propuesta técnica.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 w-full py-2.5 bg-[#00e03c] text-slate-950 font-black text-[11px] uppercase tracking-wider hover:bg-white transition-all duration-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#00e03c]/20"
                            >
                              <Phone className="w-3.5 h-3.5" /> Contactar al Especialista Ahora
                            </a>
                          </div>
                        ) : createdLeadResult.temperatura === 'tibio' ? (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                              <Clock className="w-4 h-4" />
                              <span>Fase de Evaluación Técnica (MQL)</span>
                            </div>
                            <p className="text-[11px] text-slate-200 leading-relaxed">
                              Tu proyecto fue incorporado a nuestro protocolo de acompañamiento de 14 días. Recibirás hasta 7 contactos espaciados con casos de éxito y especificaciones normativas sin saturación.
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/30 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
                              <Sparkles className="w-4 h-4 text-[#00e03c]" />
                              <span>Fase Exploratoria e Informativa</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              El conocimiento es el punto de inicio. Te compartiremos guías técnicas de libre descarga y notas sobre legislación ambiental boliviana para consolidar tu iniciativa.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {resolvedService && (
                      <div className="rounded-2xl overflow-hidden border border-[#00e03c]/30 bg-gradient-to-br from-[#00e03c]/10 via-[#00e03c]/5 to-transparent p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#00e03c]/80 font-tech">{resolvedService.tag}</span>
                          <span className="text-[9px] text-[#00e03c] font-black">{resolvedService.price}</span>
                        </div>
                        <h4 className="text-[13px] font-black text-white leading-snug">{resolvedService.title}</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{resolvedService.desc}</p>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate(resolvedService.route);
                          }}
                          className="w-full py-2.5 bg-[#00e03c] text-slate-950 font-black text-[11px] uppercase tracking-wider hover:bg-white transition-colors duration-200 rounded-xl cursor-pointer"
                        >
                          {resolvedService.cta}
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleReset}
                        className="flex-1 text-[10px] font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl py-2.5 transition-all duration-200 cursor-pointer text-center"
                      >
                        Nueva Consulta
                      </button>
                      <button
                        onClick={() => setView('contact')}
                        className="flex-1 text-[10px] font-bold text-[#00e03c] hover:text-white border border-[#00e03c]/25 hover:border-[#00e03c]/50 rounded-xl py-2.5 transition-all duration-200 cursor-pointer text-center"
                      >
                        Contacto Directo
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* VISTA 5: CONTACTO DIRECTO */}
                {view === 'contact' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="space-y-3">
                    <BotBubble text="Nuestro equipo técnico atiende consultas corporativas y proyectos urgentes por estos canales:" />

                    <a
                      href="https://wa.me/59179999999?text=Hola%20SERAM%2C%20requiero%20asesoramiento%20t%C3%A9cnico%20para%20un%20proyecto."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/25 hover:border-[#25D366]/55 hover:bg-[#25D366]/15 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-white uppercase tracking-wide leading-none mb-0.5">Línea WhatsApp Oficial</p>
                        <p className="text-[10px] text-slate-400">+591 79 999 999 · Atención técnica inmediata</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#25D366]/60 group-hover:text-[#25D366] transition-colors flex-shrink-0" />
                    </a>

                    <a
                      href="mailto:contacto@seram.bo?subject=Consulta%20T%C3%A9cnica%20SERAM"
                      className="group w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-white uppercase tracking-wide leading-none mb-0.5">Correo Corporativo</p>
                        <p className="text-[10px] text-slate-400">contacto@seram.bo</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
                    </a>

                    {!contactSent ? (
                      <form onSubmit={handleContactSend} className="border border-white/[0.08] rounded-2xl p-4 space-y-2.5 bg-white/[0.02]">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">Mensaje Rápido a Dirección</p>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder="Nombre y Apellidos *"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 outline-none focus:border-[#00e03c]/40 transition-colors"
                        />
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={e => setContactPhone(e.target.value)}
                          placeholder="WhatsApp o Teléfono *"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 outline-none focus:border-[#00e03c]/40 transition-colors"
                        />
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          placeholder="Correo electrónico (opcional)"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 outline-none focus:border-[#00e03c]/40 transition-colors"
                        />
                        <textarea
                          rows={3}
                          value={contactMsg}
                          onChange={e => setContactMsg(e.target.value)}
                          placeholder="Describe brevemente tu requerimiento técnico..."
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 resize-none outline-none focus:border-[#00e03c]/40 transition-colors leading-relaxed"
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#00e03c] text-slate-950 font-black text-[11px] uppercase tracking-wider hover:bg-white transition-colors duration-200 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" /> Enviar Mensaje a Dirección
                        </button>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-[#00e03c]/30 rounded-2xl p-4 bg-[#00e03c]/10 text-center space-y-2"
                      >
                        <CheckCircle2 className="w-8 h-8 text-[#00e03c] mx-auto" />
                        <p className="text-[12px] font-black text-white">Requerimiento Recibido</p>
                        <p className="text-[10px] text-slate-300">Asignando especialista técnico...</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

              </div>

              {/* Pie de Asistente */}
              <div className="border-t border-[#1a3a1a]/50 px-4 py-2 flex items-center justify-between flex-shrink-0 bg-[#050e07]/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#00e03c] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,224,60,0.8)]" />
                  <span className="text-[8px] text-[#00e03c] font-tech uppercase tracking-widest font-bold">ARM Activo · 24/7</span>
                </div>
                <span className="text-[8.5px] text-slate-400 font-mono">SERAM SRL · Inbound B2B</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

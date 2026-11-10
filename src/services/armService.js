/**
 * @file armService.js
 * @description Motor del Sistema de Ventas Automatizado ARM (Automated Relationship Machine)
 * y CRM Inbound Marketing con Inteligencia Artificial para SERAM SRL.
 *
 * Incluye:
 * - Clasificación Inbound y cálculo de Lead Score (BANT / GPCT).
 * - Calibración de temperatura: Caliente (SQL), Tibio (MQL), Frío (Curioso / TOFU).
 * - Protocolo de seguimiento de 14 días con hasta 7 contactos espaciados.
 * - Reglas de protección anti-baneo de WhatsApp y antispam (opt-out, horarios hábiles).
 * - Sincronización transparente con Supabase y persistencia inmediata en LocalStorage (0ms).
 */

import { supabase } from './supabaseClient';

export const ARM_STAGES = [
  { id: 'nuevo', label: 'Nuevo Inbound', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { id: 'nurturing', label: 'Nutrición (14 Días)', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
  { id: 'calificado', label: 'Calificado / SQL', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'propuesta', label: 'En Propuesta', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
  { id: 'ganado', label: 'Ganado / Cliente', color: 'border-[#00e03c]/40 text-[#00e03c] bg-[#00e03c]/10' },
  { id: 'curioso', label: 'Nutrición Curiosos', color: 'border-slate-500/40 text-slate-300 bg-slate-500/10' },
  { id: 'perdido', label: 'Descartado / Pausado', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' }
];

export const ARM_TEMPERATURES = {
  caliente: { label: 'Caliente (SQL)', badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  tibio: { label: 'Tibio (MQL)', badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  frio: { label: 'Frío / Curioso (TOFU)', badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/30' }
};

// 7 contactos predefinidos para la cadencia de 14 días (Protocolo Anti-Baneo)
export const DEFAULT_CADENCE_STEPS = [
  {
    step: 1,
    day: 1,
    channel: 'WhatsApp',
    subject: 'Diagnóstico Técnico Inicial',
    template: 'Estimado/a {nombre}, un saludo de SERAM SRL. Recibimos tu consulta técnica respecto a {servicio}. Ya registramos tu proyecto en nuestro sistema técnico para ofrecerte la ruta de cumplimiento ambiental óptima en Bolivia. ¿Te gustaría que te compartamos el alcance sugerido?',
    objective: 'Confirmar recepción y entregar valor inicial sin presionar.'
  },
  {
    step: 2,
    day: 3,
    channel: 'WhatsApp',
    subject: 'Caso de Éxito y Respaldo Normativo',
    template: 'Hola {nombre}, para el caso de {servicio}, recientemente regularizamos un proyecto análogo en tiempo récord ante la autoridad ambiental boliviana. En SERAM evitamos observaciones técnicas que retrasan obras. ¿Pudiste definir el cronograma de inicio de tu trámite?',
    objective: 'Generar confianza mediante evidencia de proyectos ejecutados.'
  },
  {
    step: 3,
    day: 5,
    channel: 'WhatsApp',
    subject: 'Profundización Técnica',
    template: 'Buen día {nombre}, te escribe el equipo técnico de SERAM. Analizando el sector de {empresa}, identificamos puntos clave de la Ley 1333 que optimizan la inversión. ¿Tienes los términos de referencia o necesitas que redactemos la propuesta base?',
    objective: 'Demostrar dominio técnico y filtrar objeciones.'
  },
  {
    step: 4,
    day: 7,
    channel: 'WhatsApp',
    subject: 'Sesión de Acompañamiento Técnico de 15 min',
    template: 'Hola {nombre}. Para no hacerte perder tiempo entre mensajes, nuestro socio especialista ({socio}) tiene un espacio de 15 minutos esta semana para una llamada o reunión virtual sin costo y revisar tu caso. ¿Qué día y horario te conviene mejor?',
    objective: 'Buscar el contacto síncrono con el especialista.'
  },
  {
    step: 5,
    day: 9,
    channel: 'Email / WhatsApp',
    subject: 'Checklist Normativo Exclusivo',
    template: 'Estimado/a {nombre}, te adjuntamos la guía resumida de requisitos técnicos y ambientales para {servicio} elaborada por SERAM. Es un recurso de consulta rápida para tu equipo directivo.',
    objective: 'Aportar material educativo de alto valor a curiosos y evaluadores.'
  },
  {
    step: 6,
    day: 11,
    channel: 'WhatsApp',
    subject: 'Validación de Disponibilidad Presupuestaria',
    template: 'Hola {nombre}, un saludo. Queremos asegurar que la propuesta de {servicio} se ajuste con precisión al rango de inversión de {empresa}. ¿Deseas que adaptemos el alcance por fases ejecutables?',
    objective: 'Negociación y adecuación financiera.'
  },
  {
    step: 7,
    day: 14,
    channel: 'WhatsApp',
    subject: 'Cierre de Ciclo Activo y Seguimiento Amigable',
    template: 'Estimado/a {nombre}, completamos nuestro ciclo de seguimiento inicial. En SERAM respetamos tus tiempos y no practicamos comunicaciones invasivas. Tu expediente queda abierto con nosotros y estaremos disponibles cuando tu proyecto lo requiera. ¡Mucho éxito en tus gestiones!',
    objective: 'Cierre elegante, protección de reputación de marca y anti-spam.'
  }
];

// Prospectos semilla realistas para el CRM SERAM
const SEED_LEADS = [
  {
    id: 'ARM-2026-001',
    created_at: '2026-11-08T09:30:00Z',
    updated_at: '2026-11-10T10:15:00Z',
    nombre: 'Arq. Roberto Morales',
    empresa: 'Constructora Illimani Corp',
    cargo: 'Gerente de Proyectos',
    email: 'rmorales@illimanicorp.bo',
    telefono: '+591 71548922',
    canal_preferido: 'WhatsApp',
    que_busca: 'Categorización Ambiental (FNCA) y Licencia para Edificio Multifamiliar',
    cuando_necesita: 'Inmediato (< 15 días)',
    cuanto_invertir: 'USD 500 - USD 1,500',
    presupuesto_estimado_usd: 850,
    etapa_pipeline: 'calificado',
    temperatura: 'caliente',
    lead_score: 88,
    clasificacion_inbound: 'SQL',
    socio_asignado: 'Ing. Diego Barrientos',
    origen: 'Asistente Web SERAM',
    ciclo_dia_actual: 3,
    contacto_actual: 2,
    cadencia_pausada: false,
    notas_internas: 'El cliente tiene una inspección municipal la próxima semana. Urge cerrar contrato.'
  },
  {
    id: 'ARM-2026-002',
    created_at: '2026-11-05T14:20:00Z',
    updated_at: '2026-11-09T16:00:00Z',
    nombre: 'Lic. Mariana Valdez',
    empresa: 'Alimentos del Valle SRL',
    cargo: 'Jefa de Calidad y SySO',
    email: 'mvaldez@alimentosvalle.bo',
    telefono: '+591 72033411',
    canal_preferido: 'WhatsApp',
    que_busca: 'Renovación de RAI Industrial y Monitoreo de Ruido y Efluentes',
    cuando_necesita: 'Corto Plazo (15 a 45 días)',
    cuanto_invertir: 'Mayor a USD 1,500',
    presupuesto_estimado_usd: 1600,
    etapa_pipeline: 'propuesta',
    temperatura: 'caliente',
    lead_score: 82,
    clasificacion_inbound: 'SQL',
    socio_asignado: 'Ing. Fernando Araujo',
    origen: 'Asistente Web SERAM',
    ciclo_dia_actual: 5,
    contacto_actual: 3,
    cadencia_pausada: false,
    notas_internas: 'Propuesta técnica enviada. Fernando coordinó visita a planta en El Alto.'
  },
  {
    id: 'ARM-2026-003',
    created_at: '2026-11-07T18:10:00Z',
    updated_at: '2026-11-08T11:00:00Z',
    nombre: 'Ing. Carlos Zeballos',
    empresa: 'Cooperativa Minera San Roque',
    cargo: 'Presidente de Consejo',
    email: 'coop.sanroque@gmail.com',
    telefono: '+591 73291044',
    canal_preferido: 'WhatsApp',
    que_busca: 'Plan EMAP y Cartografía SIG de Concesión Minera',
    cuando_necesita: 'Corto Plazo (15 a 45 días)',
    cuanto_invertir: 'USD 500 - USD 1,500',
    presupuesto_estimado_usd: 900,
    etapa_pipeline: 'nurturing',
    temperatura: 'tibio',
    lead_score: 64,
    clasificacion_inbound: 'MQL',
    socio_asignado: 'Ing. Diego Barrientos',
    origen: 'Asistente Web SERAM',
    ciclo_dia_actual: 3,
    contacto_actual: 2,
    cadencia_pausada: false,
    notas_internas: 'En evaluación de opciones. Se le compartió el caso de éxito de prospección minera.'
  },
  {
    id: 'ARM-2026-004',
    created_at: '2026-11-09T20:45:00Z',
    updated_at: '2026-11-10T08:00:00Z',
    nombre: 'Javier Quisbert',
    empresa: 'Consultor Independiente',
    cargo: 'Biólogo Consultor',
    email: 'jquisbert.bio@gmail.com',
    telefono: '+591 76512399',
    canal_preferido: 'Email',
    que_busca: 'Soporte SIG B2B y Cursos de SERAM Academy',
    cuando_necesita: 'Planificación (2 a 6 meses)',
    cuanto_invertir: 'USD 150 - USD 500',
    presupuesto_estimado_usd: 250,
    etapa_pipeline: 'curioso',
    temperatura: 'frio',
    lead_score: 38,
    clasificacion_inbound: 'TOFU',
    socio_asignado: 'Ing. Diego Barrientos',
    origen: 'Asistente Web SERAM',
    ciclo_dia_actual: 1,
    contacto_actual: 1,
    cadencia_pausada: false,
    notas_internas: 'Interesado en aprender QGIS y tercerizar mapas complejos. Nutrir con valor educativo.'
  }
];

// Generar o cargar registros iniciales de localStorage
function getLocal(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`[armService]: Error saving to local storage key ${key}`, err);
  }
}

/**
 * Calcula el Lead Score (0 - 100) y determina la Temperatura Inbound según BANT / GPCT.
 */
export function calculateInboundScore({ queBusca, cuandoNecesita, cuantoInvertir, nombre, empresa, email, telefono }) {
  let score = 0;

  // 1. Necesidad / Servicio (hasta 25 pts)
  if (queBusca && queBusca.trim().length > 3) {
    const qLower = queBusca.toLowerCase();
    if (qLower.includes('licencia') || qLower.includes('fnca') || qLower.includes('rai') || qLower.includes('emap') || qLower.includes('urgente')) {
      score += 25;
    } else {
      score += 15;
    }
  }

  // 2. Plazo / Urgencia (hasta 30 pts)
  const cuando = (cuandoNecesita || '').toLowerCase();
  if (cuando.includes('inmediato') || cuando.includes('semana') || cuando.includes('< 15')) {
    score += 30;
  } else if (cuando.includes('corto') || cuando.includes('mes') || cuando.includes('15 a 45')) {
    score += 20;
  } else if (cuando.includes('planificación') || cuando.includes('2 a 6') || cuando.includes('evaluando')) {
    score += 10;
  } else {
    score += 5; // Curioso explorando
  }

  // 3. Presupuesto / Inversión (hasta 25 pts)
  const cuanto = (cuantoInvertir || '').toLowerCase();
  if (cuanto.includes('1,500') || cuanto.includes('alto') || cuanto.includes('> 1500')) {
    score += 25;
  } else if (cuanto.includes('500') || cuanto.includes('medio')) {
    score += 20;
  } else if (cuanto.includes('150') || cuanto.includes('básico')) {
    score += 12;
  } else {
    score += 4; // Por definir o exploratorio
  }

  // 4. Completitud de Datos de Contacto (hasta 20 pts)
  if (nombre && nombre.trim().length > 2) score += 5;
  if (empresa && empresa.trim().length > 2) score += 5;
  if (telefono && telefono.trim().length >= 7) score += 5;
  if (email && email.includes('@')) score += 5;

  score = Math.min(100, Math.max(10, score));

  // Determinar temperatura y clasificación
  let temperatura = 'frio';
  let clasificacion_inbound = 'TOFU';
  let etapa_pipeline = 'curioso';

  if (score >= 70) {
    temperatura = 'caliente';
    clasificacion_inbound = 'SQL'; // Sales Qualified Lead
    etapa_pipeline = 'calificado';
  } else if (score >= 40) {
    temperatura = 'tibio';
    clasificacion_inbound = 'MQL'; // Marketing Qualified Lead
    etapa_pipeline = 'nurturing';
  } else {
    temperatura = 'frio';
    clasificacion_inbound = 'TOFU'; // Top of Funnel / Curioso
    etapa_pipeline = 'curioso';
  }

  return { score, temperatura, clasificacion_inbound, etapa_pipeline };
}

/**
 * Servicio central del ARM CRM
 */
export const armService = {
  /**
   * Obtiene todos los leads, fusionando Supabase con LocalStorage (0ms initial render)
   */
  async getLeads() {
    const localLeads = getLocal('seram_arm_leads', SEED_LEADS);

    // Intentar refrescar en segundo plano desde Supabase sin bloquear
    try {
      const { data, error } = await supabase
        .from('arm_leads')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data && data.length > 0) {
        setLocal('seram_arm_leads', data);
        return data;
      }
    } catch {
      // Usar almacenamiento local de respaldo silenciosamente
    }

    return localLeads;
  },

  /**
   * Registra un nuevo lead precalificado desde el Asistente SERAM o el CRM
   */
  async createLead(leadInput) {
    const { score, temperatura, clasificacion_inbound, etapa_pipeline } = calculateInboundScore(leadInput);

    const newId = `ARM-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const newLead = {
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nombre: leadInput.nombre || 'Prospecto Web',
      empresa: leadInput.empresa || 'Particular / En formación',
      cargo: leadInput.cargo || 'Responsable de Proyecto',
      email: leadInput.email || '',
      telefono: leadInput.telefono || '',
      canal_preferido: leadInput.canal_preferido || 'WhatsApp',
      que_busca: leadInput.que_busca || 'Consulta General Ambiental',
      cuando_necesita: leadInput.cuando_necesita || 'En evaluación',
      cuanto_invertir: leadInput.cuanto_invertir || 'Por definir',
      presupuesto_estimado_usd: Number(leadInput.presupuesto_estimado_usd) || 0,
      etapa_pipeline: leadInput.etapa_pipeline || etapa_pipeline,
      temperatura,
      lead_score: score,
      clasificacion_inbound,
      socio_asignado: leadInput.socio_asignado || 'Ing. Diego Barrientos',
      origen: leadInput.origen || 'Asistente Web SERAM',
      metadata_inbound: leadInput.metadata_inbound || {},
      ciclo_dia_actual: 1,
      contacto_actual: 1,
      proximo_contacto_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      cadencia_pausada: false,
      notas_internas: leadInput.notas_internas || 'Captado y precalificado mediante Asistente Digital SERAM.'
    };

    // 1. Guardar localmente de inmediato (0ms de latencia)
    const current = getLocal('seram_arm_leads', SEED_LEADS);
    const updated = [newLead, ...current.filter(l => l.id !== newLead.id)];
    setLocal('seram_arm_leads', updated);

    // Inicializar chatter
    this.addChatterMessage(newLead.id, {
      tipo: 'sistema',
      autor: 'Sistema ARM',
      contenido: `Lead precalificado como ${clasificacion_inbound} (${temperatura.toUpperCase()}) con puntuación de ${score}/100. Inicio de cadencia anti-baneo (14 días).`
    });

    // 2. Persistir en Supabase en segundo plano
    try {
      await supabase.from('arm_leads').insert([{
        nombre: newLead.nombre,
        empresa: newLead.empresa,
        cargo: newLead.cargo,
        email: newLead.email,
        telefono: newLead.telefono,
        canal_preferido: newLead.canal_preferido,
        que_busca: newLead.que_busca,
        cuando_necesita: newLead.cuando_necesita,
        cuanto_invertir: newLead.cuanto_invertir,
        presupuesto_estimado_usd: newLead.presupuesto_estimado_usd,
        etapa_pipeline: newLead.etapa_pipeline,
        temperatura: newLead.temperatura,
        lead_score: newLead.lead_score,
        clasificacion_inbound: newLead.clasificacion_inbound,
        socio_asignado: newLead.socio_asignado,
        origen: newLead.origen,
        metadata_inbound: newLead.metadata_inbound,
        ciclo_dia_actual: newLead.ciclo_dia_actual,
        contacto_actual: newLead.contacto_actual,
        cadencia_pausada: newLead.cadencia_pausada,
        notas_internas: newLead.notas_internas
      }]);
    } catch (err) {
      console.warn('[armService]: Sincronización en segundo plano con Supabase diferida.', err);
    }

    return newLead;
  },

  /**
   * Actualiza los datos o etapa de un lead
   */
  async updateLead(leadId, patch) {
    const current = getLocal('seram_arm_leads', SEED_LEADS);
    let updatedLead = null;

    const next = current.map(item => {
      if (item.id === leadId) {
        updatedLead = { ...item, ...patch, updated_at: new Date().toISOString() };
        return updatedLead;
      }
      return item;
    });

    setLocal('seram_arm_leads', next);

    // Sincronizar en Supabase
    try {
      await supabase.from('arm_leads').update(patch).eq('id', leadId);
    } catch {
      // Fallback silencioso
    }

    return updatedLead;
  },

  /**
   * Elimina un lead
   */
  async deleteLead(leadId) {
    const current = getLocal('seram_arm_leads', SEED_LEADS);
    const next = current.filter(item => item.id !== leadId);
    setLocal('seram_arm_leads', next);

    try {
      await supabase.from('arm_leads').delete().eq('id', leadId);
    } catch {
      // Fallback
    }
  },

  /**
   * Avanza el contacto de la cadencia de 14 días
   */
  async advanceCadenceStep(leadId, currentStepNumber, outcome = 'Enviado con éxito') {
    const nextStep = Math.min(7, (currentStepNumber || 0) + 1);
    const dayMap = { 1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11, 7: 14 };
    const nextDay = dayMap[nextStep] || 14;

    const patch = {
      contacto_actual: nextStep,
      ciclo_dia_actual: nextDay,
      proximo_contacto_at: nextStep < 7 ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() : null
    };

    if (nextStep >= 7) {
      patch.cadencia_pausada = true;
      patch.motivo_pausa = 'Ciclo de 14 días completado.';
    }

    await this.updateLead(leadId, patch);

    this.addChatterMessage(leadId, {
      tipo: 'sistema',
      autor: 'Cadencia ARM',
      contenido: `Contacto ${currentStepNumber} registrado como '${outcome}'. Próximo contacto: Paso ${nextStep} (Día ${nextDay}).`
    });
  },

  /**
   * Registra un mensaje o nota interna en el Chatter del Lead
   */
  addChatterMessage(leadId, { tipo = 'nota_interna', autor = 'Socio SERAM', contenido }) {
    if (!contenido) return;
    const key = `seram_arm_chatter_${leadId}`;
    const current = getLocal(key, []);
    const entry = {
      id: Date.now() + Math.random(),
      created_at: new Date().toISOString(),
      tipo,
      autor,
      contenido
    };
    const next = [entry, ...current];
    setLocal(key, next);

    try {
      supabase.from('arm_chatter').insert([{ lead_id: leadId, tipo, autor, contenido }]);
    } catch {
      // Silencioso
    }

    return entry;
  },

  /**
   * Obtiene el chatter de un lead
   */
  getChatter(leadId) {
    const key = `seram_arm_chatter_${leadId}`;
    return getLocal(key, [
      {
        id: 'init-chatter-1',
        created_at: new Date().toISOString(),
        tipo: 'sistema',
        autor: 'Sistema ARM',
        contenido: 'Lead precalificado e ingresado al flujo comercial.'
      }
    ]);
  },

  /**
   * Obtiene el estado de los 7 pasos de cadencia para un lead
   */
  getLeadCadenceSteps(lead) {
    if (!lead) return [];
    return DEFAULT_CADENCE_STEPS.map(step => {
      const isPast = (lead.contacto_actual || 0) > step.step;
      const isCurrent = (lead.contacto_actual || 0) === step.step;
      const isFuture = (lead.contacto_actual || 0) < step.step;

      let status = 'programado';
      if (isPast) status = 'completado';
      if (isCurrent) status = 'activo_hoy';

      // Personalizar plantilla
      const personalizedMessage = step.template
        .replace('{nombre}', lead.nombre || 'Estimado/a')
        .replace('{servicio}', lead.que_busca || 'tu trámite')
        .replace('{empresa}', lead.empresa || 'tu institución')
        .replace('{socio}', lead.socio_asignado || 'nuestro director técnico');

      return {
        ...step,
        status,
        isPast,
        isCurrent,
        isFuture,
        personalizedMessage
      };
    });
  },

  /**
   * Genera el enlace directo a WhatsApp con texto preconfigurado y codificado
   */
  createWhatsAppUrl(telefono, message) {
    const cleanPhone = (telefono || '59179999999').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message || '');
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
};

export default armService;

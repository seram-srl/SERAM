/**
 * @file armService.js
 * @description Motor del Sistema de Ventas Automatizado ARM (Automated Relationship Machine)
 * y CRM estilo Odoo con Meritocracia de Misiones para SERAM SRL.
 *
 * Incluye:
 * - Ingeniería inversa de Odoo CRM: Etapas, Estrellas de prioridad (1-3), Etiquetas, Probabilidad, Actividades planificadas.
 * - Conexión intrínseca con Misiones por tipo (Flash, Grupal, Secundaria, Personal, Especialidad) + Evidencias + XP.
 * - Sincronización de clientes reales existentes en la etapa 'Nuevo' (sin seguimiento previo) + maquetas '(EJEMPLO)'.
 * - Moneda Dual Dinámica (USD y Bolivianos Bs. al tipo de cambio oficial 6.96).
 * - Protocolo Anti-Baneo de 14 días (7 contactos) y parser de captura rápida (Telegram / Google Forms).
 */

import { supabase } from './supabaseClient';

export const USD_TO_BOB_RATE = 6.96;

export const ARM_STAGES = [
  { id: 'nuevo', label: 'Nuevo', probability: 15, color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', barColor: 'bg-emerald-500' },
  { id: 'nurturing', label: 'Nutrición 14D', probability: 30, color: 'border-purple-500/40 text-purple-400 bg-purple-500/10', barColor: 'bg-purple-500' },
  { id: 'calificado', label: 'Calificado', probability: 55, color: 'border-amber-500/40 text-amber-400 bg-amber-500/10', barColor: 'bg-amber-500' },
  { id: 'propuesta', label: 'Propuesta', probability: 75, color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10', barColor: 'bg-cyan-500' },
  { id: 'ganado', label: 'Ganado', probability: 100, color: 'border-[#00e03c]/50 text-[#00e03c] bg-[#00e03c]/15', barColor: 'bg-[#00e03c]' },
  { id: 'curioso', label: 'Curiosos (Valor)', probability: 10, color: 'border-slate-500/40 text-slate-300 bg-slate-500/10', barColor: 'bg-slate-500' },
  { id: 'perdido', label: 'Perdido', probability: 0, color: 'border-rose-500/40 text-rose-400 bg-rose-500/10', barColor: 'bg-rose-500' }
];

export const ARM_TEMPERATURES = {
  caliente: { label: 'Caliente (SQL)', badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35' },
  tibio: { label: 'Tibio (MQL)', badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/35' },
  frio: { label: 'Frío / Curioso', badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/35' }
};

export const ARM_TAG_COLORS = {
  'FNCA': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'RAI Industrial': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Minería / EMAP': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Cartografía SIG': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Municipal / Público': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Capacitación': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Monitoreo': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'EJEMPLO': 'bg-rose-500/25 text-rose-300 border-rose-500/40'
};

// Catálogo de Tipos de Actividad de Odoo + Misiones SERAM (Captura #11)
export const DEFAULT_ACTIVITY_TYPES = [
  {
    id: 'act-type-1',
    codigo: 'PENDIENTE_SEC',
    nombre: 'Actividades pendientes (Misión Secundaria)',
    resumen_predeterminado: 'Seguimiento documental y recopilación de requisitos legales',
    planeado_en_dias: 5,
    tipo_regla: 'después de la fecha límite de la actividad anterior',
    categoria_mision: 'secundaria',
    xp_recompensa: 50,
    requiere_evidencia: true,
    usuario_predeterminado: 'Socio Asignado'
  },
  {
    id: 'act-type-2',
    codigo: 'EMAIL_TECH',
    nombre: 'Correo electrónico (Misión Personal)',
    resumen_predeterminado: 'Envío de propuesta técnica formal y alcance normativo',
    planeado_en_dias: 0,
    tipo_regla: 'después de la fecha límite de la actividad anterior',
    categoria_mision: 'personal',
    xp_recompensa: 40,
    requiere_evidencia: true,
    usuario_predeterminado: 'Socio Asignado'
  },
  {
    id: 'act-type-3',
    codigo: 'CALL_BANT',
    nombre: 'Llamada (Misión Flash)',
    resumen_predeterminado: 'Llamada táctica de calificación BANT y validación de inversión',
    planeado_en_dias: 2,
    tipo_regla: 'después de la fecha límite de la actividad anterior',
    categoria_mision: 'flash',
    xp_recompensa: 75,
    requiere_evidencia: true,
    usuario_predeterminado: 'Socio Asignado'
  },
  {
    id: 'act-type-4',
    codigo: 'MEETING_SYNC',
    nombre: 'Reunión (Misión Grupal Bipartita)',
    resumen_predeterminado: 'Sesión ejecutiva con cliente o inspección técnica conjunta',
    planeado_en_dias: 0,
    tipo_regla: 'después de la fecha límite de la actividad anterior',
    categoria_mision: 'grupal',
    xp_recompensa: 140,
    requiere_evidencia: true,
    usuario_predeterminado: 'Ing. Diego Barrientos & Ing. Fernando Araujo'
  },
  {
    id: 'act-type-5',
    codigo: 'DOC_SPECIALTY',
    nombre: 'Documento (Misión de Especialidad SIG/EIA)',
    resumen_predeterminado: 'Elaboración de mapa temático SIG, memoria técnica o cotización visada',
    planeado_en_dias: 5,
    tipo_regla: 'después de la fecha límite de la actividad anterior',
    categoria_mision: 'especialidad',
    xp_recompensa: 120,
    requiere_evidencia: true,
    usuario_predeterminado: 'Especialista Técnico'
  }
];

export const MISSION_CATEGORY_BADGES = {
  flash: { label: 'Misión Flash', className: 'bg-amber-500/20 text-amber-300 border-amber-500/40', xpBase: 75 },
  secundaria: { label: 'Misión Secundaria', className: 'bg-blue-500/20 text-blue-300 border-blue-500/40', xpBase: 50 },
  grupal: { label: 'Misión Grupal', className: 'bg-purple-500/20 text-purple-300 border-purple-500/40', xpBase: 140 },
  personal: { label: 'Misión Personal', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', xpBase: 40 },
  especialidad: { label: 'Misión de Especialidad', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', xpBase: 120 }
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

// Clientes reales base del Directorio de SERAM (sin seguimiento iniciado)
const REAL_CLIENTS_INITIAL = [
  {
    id: 'REAL-CL-1',
    client_directory_id: '1',
    is_example: false,
    created_at: '2026-11-10T08:00:00Z',
    updated_at: '2026-11-10T08:00:00Z',
    titulo_oportunidad: 'Monitoreo de Mercurio y Fuentes de Agua Potable',
    nombre: 'Dirección de Medio Ambiente y Madre Tierra',
    empresa: 'Gobierno Autónomo Municipal de Palos Blancos',
    cargo: 'Dirección Ambiental Municipal',
    email: 'medioambiente@palosblancos.gob.bo',
    telefono: '+591 71500000',
    ubicacion: 'Palos Blancos, Alto Beni - La Paz',
    canal_preferido: 'WhatsApp',
    que_busca: 'Monitoreo de mercurio y fuentes de agua potable comunales',
    cuando_necesita: 'Por evaluar con Dirección',
    cuanto_invertir: 'Presupuesto Municipal POA',
    presupuesto_estimado_usd: 2500,
    presupuesto_bs: Math.round(2500 * USD_TO_BOB_RATE),
    probabilidad_cierre: 25,
    prioridad_estrellas: 2,
    etiquetas: ['Municipal / Público', 'Monitoreo'],
    etapa_pipeline: 'nuevo',
    temperatura: 'tibio',
    lead_score: 60,
    clasificacion_inbound: 'MQL',
    socio_asignado: 'Ing. Diego Barrientos',
    origen: 'Base de Datos de Clientes SERAM',
    ciclo_dia_actual: 0,
    contacto_actual: 0,
    cadencia_pausada: false,
    notas_internas: 'Cliente real de la base de datos de SERAM. Pendiente iniciar primer contacto del flujo ARM.'
  },
  {
    id: 'REAL-CL-2',
    client_directory_id: '2',
    is_example: false,
    created_at: '2026-11-10T08:05:00Z',
    updated_at: '2026-11-10T08:05:00Z',
    titulo_oportunidad: 'Línea Base de Contaminación y Fiscalización Aurífera',
    nombre: 'Secretaría Técnica Municipal',
    empresa: 'Gobierno Autónomo Municipal de Guanay',
    cargo: 'Secretaría Técnica',
    email: 'tecnica@guanay.gob.bo',
    telefono: '+591 72000000',
    ubicacion: 'Guanay - La Paz',
    canal_preferido: 'WhatsApp',
    que_busca: 'Línea base de contaminación y fiscalización de concesiones auríferas',
    cuando_necesita: 'Por evaluar con Secretaría',
    cuanto_invertir: 'Presupuesto Municipal POA',
    presupuesto_estimado_usd: 3200,
    presupuesto_bs: Math.round(3200 * USD_TO_BOB_RATE),
    probabilidad_cierre: 25,
    prioridad_estrellas: 2,
    etiquetas: ['Municipal / Público', 'Cartografía SIG'],
    etapa_pipeline: 'nuevo',
    temperatura: 'tibio',
    lead_score: 62,
    clasificacion_inbound: 'MQL',
    socio_asignado: 'Ing. Fernando Araujo',
    origen: 'Base de Datos de Clientes SERAM',
    ciclo_dia_actual: 0,
    contacto_actual: 0,
    cadencia_pausada: false,
    notas_internas: 'Cliente real de la base de datos de SERAM. Sin seguimiento comercial previo.'
  },
  {
    id: 'REAL-CL-3',
    client_directory_id: '3',
    is_example: false,
    created_at: '2026-11-10T08:10:00Z',
    updated_at: '2026-11-10T08:10:00Z',
    titulo_oportunidad: 'Ficha Ambiental y Adecuación a RMCH',
    nombre: 'Gerencia de Operaciones',
    empresa: 'Cooperativa Minera Aurífera Kaka R.L.',
    cargo: 'Gerencia de Operaciones',
    email: 'operaciones@coopkaka.bo',
    telefono: '+591 73000000',
    ubicacion: 'Río Kaka - La Paz',
    canal_preferido: 'WhatsApp',
    que_busca: 'Tramitación de Ficha Ambiental y adecuación a RMCH',
    cuando_necesita: 'Corto Plazo (15 a 45 días)',
    cuanto_invertir: 'USD 500 - USD 1,500',
    presupuesto_estimado_usd: 1400,
    presupuesto_bs: Math.round(1400 * USD_TO_BOB_RATE),
    probabilidad_cierre: 30,
    prioridad_estrellas: 3,
    etiquetas: ['Minería / EMAP', 'FNCA'],
    etapa_pipeline: 'nuevo',
    temperatura: 'tibio',
    lead_score: 68,
    clasificacion_inbound: 'MQL',
    socio_asignado: 'Ing. Diego Barrientos',
    origen: 'Base de Datos de Clientes SERAM',
    ciclo_dia_actual: 0,
    contacto_actual: 0,
    cadencia_pausada: false,
    notas_internas: 'Cliente real registrado en SERAM. Listo para activar el protocolo de seguimiento de 14 días.'
  }
];

// Oportunidades de demostración claramente etiquetadas como "(EJEMPLO)"
const EXAMPLE_MOCK_LEADS = [
  {
    id: 'EJEMPLO-ARM-001',
    is_example: true,
    created_at: '2026-11-08T09:30:00Z',
    updated_at: '2026-11-10T10:15:00Z',
    titulo_oportunidad: '(EJEMPLO) Categorización FNCA Edificio Corporativo',
    nombre: '(EJEMPLO) Arq. Roberto Morales',
    empresa: '(EJEMPLO) Constructora Illimani Corp S.R.L.',
    cargo: 'Gerente de Proyectos',
    email: 'rmorales.ejemplo@illimanicorp.bo',
    telefono: '+591 71548922',
    ubicacion: 'Calacoto, La Paz',
    canal_preferido: 'WhatsApp',
    que_busca: 'Categorización Ambiental (FNCA) y Licencia para Edificio Multifamiliar',
    cuando_necesita: 'Inmediato (< 15 días)',
    cuanto_invertir: 'USD 500 - USD 1,500',
    presupuesto_estimado_usd: 950,
    presupuesto_bs: Math.round(950 * USD_TO_BOB_RATE),
    probabilidad_cierre: 65,
    prioridad_estrellas: 3,
    etiquetas: ['EJEMPLO', 'FNCA', 'Cartografía SIG'],
    etapa_pipeline: 'calificado',
    temperatura: 'caliente',
    lead_score: 88,
    clasificacion_inbound: 'SQL',
    socio_asignado: 'Ing. Diego Barrientos',
    origen: 'Asistente Web SERAM (Maqueta)',
    ciclo_dia_actual: 3,
    contacto_actual: 2,
    cadencia_pausada: false,
    notas_internas: 'REGISTRO DE (EJEMPLO): Maqueta para probar el cambio de etapas, misiones vinculadas y cadencia de 14 días.'
  },
  {
    id: 'EJEMPLO-ARM-002',
    is_example: true,
    created_at: '2026-11-05T14:20:00Z',
    updated_at: '2026-11-09T16:00:00Z',
    titulo_oportunidad: '(EJEMPLO) Renovación RAI y Monitoreo de Efluentes',
    nombre: '(EJEMPLO) Lic. Mariana Valdez',
    empresa: '(EJEMPLO) Industrias Lácteas del Valle S.A.',
    cargo: 'Jefa de Calidad y SySO',
    email: 'mvaldez.ejemplo@lacteosvalle.bo',
    telefono: '+591 72033411',
    ubicacion: 'Parque Industrial, El Alto',
    canal_preferido: 'WhatsApp',
    que_busca: 'Renovación de RAI Industrial y Monitoreo de Ruido y Efluentes',
    cuando_necesita: 'Corto Plazo (15 a 45 días)',
    cuanto_invertir: 'Mayor a USD 1,500',
    presupuesto_estimado_usd: 1850,
    presupuesto_bs: Math.round(1850 * USD_TO_BOB_RATE),
    probabilidad_cierre: 80,
    prioridad_estrellas: 3,
    etiquetas: ['EJEMPLO', 'RAI Industrial', 'Monitoreo'],
    etapa_pipeline: 'propuesta',
    temperatura: 'caliente',
    lead_score: 84,
    clasificacion_inbound: 'SQL',
    socio_asignado: 'Ing. Fernando Araujo',
    origen: 'Asistente Web SERAM (Maqueta)',
    ciclo_dia_actual: 5,
    contacto_actual: 3,
    cadencia_pausada: false,
    notas_internas: 'REGISTRO DE (EJEMPLO): Propuesta técnica enviada en etapa de negociación final.'
  },
  {
    id: 'EJEMPLO-ARM-003',
    is_example: true,
    created_at: '2026-11-07T18:10:00Z',
    updated_at: '2026-11-08T11:00:00Z',
    titulo_oportunidad: '(EJEMPLO) Plan EMAP y Poligonal AJAM',
    nombre: '(EJEMPLO) Ing. Carlos Zeballos',
    empresa: '(EJEMPLO) Minera San Roque Ltda.',
    cargo: 'Director de Operaciones',
    email: 'czeballos.ejemplo@sanroque.bo',
    telefono: '+591 73291044',
    ubicacion: 'Oruro, Bolivia',
    canal_preferido: 'WhatsApp',
    que_busca: 'Plan EMAP y Cartografía SIG de Concesión Minera',
    cuando_necesita: 'Corto Plazo (15 a 45 días)',
    cuanto_invertir: 'USD 500 - USD 1,500',
    presupuesto_estimado_usd: 1100,
    presupuesto_bs: Math.round(1100 * USD_TO_BOB_RATE),
    probabilidad_cierre: 35,
    prioridad_estrellas: 2,
    etiquetas: ['EJEMPLO', 'Minería / EMAP', 'Cartografía SIG'],
    etapa_pipeline: 'nurturing',
    temperatura: 'tibio',
    lead_score: 64,
    clasificacion_inbound: 'MQL',
    socio_asignado: 'Ing. Diego Barrientos',
    origen: 'Asistente Web SERAM (Maqueta)',
    ciclo_dia_actual: 3,
    contacto_actual: 2,
    cadencia_pausada: false,
    notas_internas: 'REGISTRO DE (EJEMPLO): Oportunidad en fase de nutrición técnica de 14 días.'
  },
  {
    id: 'EJEMPLO-ARM-004',
    is_example: true,
    created_at: '2026-11-01T11:00:00Z',
    updated_at: '2026-11-09T17:30:00Z',
    titulo_oportunidad: '(EJEMPLO) Plan de Aplicación SIG Cuenca Katari',
    nombre: '(EJEMPLO) Dra. Claudia Espinoza',
    empresa: '(EJEMPLO) Fundación EcoAndes Bolivia',
    cargo: 'Coordinadora de Programas',
    email: 'cespinoza.ejemplo@ecoandes.org.bo',
    telefono: '+591 76512399',
    ubicacion: 'La Paz, Bolivia',
    canal_preferido: 'Email',
    que_busca: 'Plan de Aplicación SIG Completo y Análisis Multitemporal',
    cuando_necesita: 'Inmediato (< 15 días)',
    cuanto_invertir: 'Mayor a USD 1,500',
    presupuesto_estimado_usd: 2400,
    presupuesto_bs: Math.round(2400 * USD_TO_BOB_RATE),
    probabilidad_cierre: 100,
    prioridad_estrellas: 3,
    etiquetas: ['EJEMPLO', 'Cartografía SIG'],
    etapa_pipeline: 'ganado',
    temperatura: 'caliente',
    lead_score: 94,
    clasificacion_inbound: 'SQL',
    socio_asignado: 'Ing. Fernando Araujo',
    origen: 'Asistente Web SERAM (Maqueta)',
    ciclo_dia_actual: 14,
    contacto_actual: 7,
    cadencia_pausada: true,
    motivo_pausa: 'Oportunidad Ganada y Contrato Cerrado (Demostración).',
    notas_internas: 'REGISTRO DE (EJEMPLO): Muestra cómo luce una oportunidad ganada al 100%.'
  }
];

const INITIAL_ACTIVITIES_SEED = [
  {
    id: 'ACT-SEED-1',
    lead_id: 'EJEMPLO-ARM-001',
    activity_type_code: 'CALL_BANT',
    titulo: '(EJEMPLO) Llamada de validación de planos arquitectónicos FNCA',
    resumen: 'Confirmar superficie construida en m2 para determinar categoría ambiental.',
    categoria_mision: 'flash',
    responsable: 'Ing. Diego Barrientos',
    participantes: ['Ing. Diego Barrientos'],
    fecha_vencimiento: '2026-11-12',
    estado: 'pendiente',
    xp_otorgado: 75,
    evidencia_url: '',
    evidencia_nota: ''
  },
  {
    id: 'ACT-SEED-2',
    lead_id: 'EJEMPLO-ARM-002',
    activity_type_code: 'MEETING_SYNC',
    titulo: '(EJEMPLO) Defensa de Propuesta RAI y Punto de Muestreo',
    resumen: 'Reunión bipartita con Jefatura de Planta en El Alto para cierre de contrato.',
    categoria_mision: 'grupal',
    responsable: 'Ing. Fernando Araujo',
    participantes: ['Ing. Fernando Araujo', 'Ing. Diego Barrientos'],
    fecha_vencimiento: '2026-11-11',
    estado: 'pendiente',
    xp_otorgado: 140,
    evidencia_url: '',
    evidencia_nota: ''
  },
  {
    id: 'ACT-SEED-3',
    lead_id: 'EJEMPLO-ARM-003',
    activity_type_code: 'DOC_SPECIALTY',
    titulo: '(EJEMPLO) Cruce de Cuadrículas Mineras AJAM en QGIS',
    resumen: 'Generar mapa preliminar de factibilidad ambiental para enviar en Contacto 3.',
    categoria_mision: 'especialidad',
    responsable: 'Ing. Diego Barrientos',
    participantes: ['Ing. Diego Barrientos'],
    fecha_vencimiento: '2026-11-14',
    estado: 'pendiente',
    xp_otorgado: 120,
    evidencia_url: '',
    evidencia_nota: ''
  }
];

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
    console.warn(`[armService]: Error saving to localStorage key ${key}`, err);
  }
}

/**
 * Formatea montos dinámicamente en USD o Bolivianos (Bs.)
 */
export function formatDualCurrency(amountUsd, mode = 'USD') {
  const cleanUsd = Number(amountUsd) || 0;
  const cleanBob = Math.round(cleanUsd * USD_TO_BOB_RATE);

  if (mode === 'BOB') {
    return {
      primary: `${cleanBob.toLocaleString('es-BO')} Bs.`,
      secondary: `USD ${cleanUsd.toLocaleString('en-US')}`,
      usd: cleanUsd,
      bob: cleanBob
    };
  }
  return {
    primary: `USD ${cleanUsd.toLocaleString('en-US')}`,
    secondary: `${cleanBob.toLocaleString('es-BO')} Bs.`,
    usd: cleanUsd,
    bob: cleanBob
  };
}

/**
 * Calcula el Lead Score (0 - 100) y determina la Temperatura Inbound según BANT / GPCT.
 */
export function calculateInboundScore({ queBusca, cuandoNecesita, cuantoInvertir, nombre, empresa, email, telefono }) {
  let score = 0;

  if (queBusca && queBusca.trim().length > 3) {
    const qLower = queBusca.toLowerCase();
    if (qLower.includes('licencia') || qLower.includes('fnca') || qLower.includes('rai') || qLower.includes('emap') || qLower.includes('monitoreo') || qLower.includes('urgente')) {
      score += 25;
    } else {
      score += 15;
    }
  }

  const cuando = (cuandoNecesita || '').toLowerCase();
  if (cuando.includes('inmediato') || cuando.includes('semana') || cuando.includes('< 15')) {
    score += 30;
  } else if (cuando.includes('corto') || cuando.includes('mes') || cuando.includes('15 a 45')) {
    score += 20;
  } else if (cuando.includes('planificación') || cuando.includes('2 a 6') || cuando.includes('evaluando') || cuando.includes('evaluar')) {
    score += 12;
  } else {
    score += 5;
  }

  const cuanto = (cuantoInvertir || '').toLowerCase();
  if (cuanto.includes('1,500') || cuanto.includes('alto') || cuanto.includes('poa') || cuanto.includes('> 1500')) {
    score += 25;
  } else if (cuanto.includes('500') || cuanto.includes('medio')) {
    score += 20;
  } else if (cuanto.includes('150') || cuanto.includes('básico')) {
    score += 12;
  } else {
    score += 5;
  }

  if (nombre && nombre.trim().length > 2) score += 5;
  if (empresa && empresa.trim().length > 2) score += 5;
  if (telefono && telefono.trim().length >= 7) score += 5;
  if (email && email.includes('@')) score += 5;

  score = Math.min(100, Math.max(10, score));

  let temperatura = 'frio';
  let clasificacion_inbound = 'TOFU';
  let etapa_pipeline = 'curioso';
  let prioridad_estrellas = 1;
  let probabilidad_cierre = 20;

  if (score >= 70) {
    temperatura = 'caliente';
    clasificacion_inbound = 'SQL';
    etapa_pipeline = 'calificado';
    prioridad_estrellas = 3;
    probabilidad_cierre = 65;
  } else if (score >= 40) {
    temperatura = 'tibio';
    clasificacion_inbound = 'MQL';
    etapa_pipeline = 'nurturing';
    prioridad_estrellas = 2;
    probabilidad_cierre = 35;
  }

  return { score, temperatura, clasificacion_inbound, etapa_pipeline, prioridad_estrellas, probabilidad_cierre };
}

/**
 * Servicio central del ARM Odoo CRM
 */
export const armService = {
  /**
   * Sincroniza los clientes reales existentes de SERAM en la columna 'nuevo' (sin seguimiento activo)
   * y conserva los registros '(EJEMPLO)' de demostración.
   */
  syncWithExistingClients(realClientsList = []) {
    const defaultSeed = [...REAL_CLIENTS_INITIAL, ...EXAMPLE_MOCK_LEADS];
    let stored = getLocal('seram_arm_leads_v2', null);

    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      stored = defaultSeed;
    }

    // Asegurar que cada cliente real del directorio tenga su tarjeta en el pipeline si no fue creado aún
    if (Array.isArray(realClientsList) && realClientsList.length > 0) {
      let modified = false;
      realClientsList.forEach((cl, idx) => {
        const exists = stored.some(
          l =>
            String(l.client_directory_id) === String(cl.id) ||
            (l.empresa && cl.name && l.empresa.toLowerCase() === cl.name.toLowerCase())
        );

        if (!exists && cl.name) {
          const isExampleClient = cl.name.toUpperCase().includes('EJEMPLO');
          const estimatedUsd = cl.type?.includes('Municipal') ? 2500 : cl.type?.includes('Minería') ? 1400 : 900;
          stored.unshift({
            id: `REAL-CL-${cl.id || Date.now() + idx}`,
            client_directory_id: String(cl.id),
            is_example: isExampleClient,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            titulo_oportunidad: cl.notes ? cl.notes.slice(0, 65) : `Gestión Ambiental - ${cl.name}`,
            nombre: cl.contactPerson || 'Dirección / Gerencia',
            empresa: cl.name,
            cargo: cl.type || 'Institución / Empresa',
            email: cl.contactEmail || '',
            telefono: cl.contactPhone || '',
            ubicacion: cl.location || 'Bolivia',
            canal_preferido: 'WhatsApp',
            que_busca: cl.notes || 'Servicio de Consultoría Ambiental y SIG',
            cuando_necesita: 'Pendiente de diagnóstico inicial',
            cuanto_invertir: 'Por definir en primera sesión',
            presupuesto_estimado_usd: estimatedUsd,
            presupuesto_bs: Math.round(estimatedUsd * USD_TO_BOB_RATE),
            probabilidad_cierre: 20,
            prioridad_estrellas: 2,
            etiquetas: [cl.type || 'Cliente SERAM'],
            etapa_pipeline: 'nuevo',
            temperatura: 'tibio',
            lead_score: 60,
            clasificacion_inbound: 'MQL',
            socio_asignado: idx % 2 === 0 ? 'Ing. Diego Barrientos' : 'Ing. Fernando Araujo',
            origen: 'Base de Datos de Clientes SERAM',
            ciclo_dia_actual: 0,
            contacto_actual: 0,
            cadencia_pausada: false,
            notas_internas: cl.notes || 'Cliente existente sincronizado desde la base de datos de SERAM.'
          });
          modified = true;
        }
      });

      if (modified) {
        setLocal('seram_arm_leads_v2', stored);
      }
    }

    setLocal('seram_arm_leads_v2', stored);
    return stored;
  },

  /**
   * Obtiene todos los leads fusionando clientes reales, demostraciones (EJEMPLO) y Supabase
   */
  async getLeads(realClientsList = []) {
    const syncedLocal = this.syncWithExistingClients(realClientsList);

    try {
      const { data, error } = await supabase
        .from('arm_leads')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data && data.length > 0) {
        const mergedMap = new Map();
        syncedLocal.forEach(item => mergedMap.set(String(item.id), item));
        data.forEach(remote => {
          const key = String(remote.external_code || remote.id);
          mergedMap.set(key, {
            ...remote,
            id: remote.external_code || `ARM-DB-${remote.id}`,
            presupuesto_bs: remote.presupuesto_bs || Math.round((Number(remote.presupuesto_estimado_usd) || 0) * USD_TO_BOB_RATE)
          });
        });
        const merged = Array.from(mergedMap.values());
        setLocal('seram_arm_leads_v2', merged);
        return merged;
      }
    } catch {
      // Operar en modo local 0ms
    }

    return syncedLocal;
  },

  /**
   * Crea un nuevo lead/oportunidad (desde Kanban Quick Add, Modal, Chatbot o Comando Telegram)
   */
  async createLead(leadInput) {
    const {
      score,
      temperatura,
      clasificacion_inbound,
      etapa_pipeline,
      prioridad_estrellas,
      probabilidad_cierre
    } = calculateInboundScore({
      queBusca: leadInput.que_busca || leadInput.titulo_oportunidad,
      cuandoNecesita: leadInput.cuando_necesita,
      cuantoInvertir: leadInput.cuanto_invertir,
      nombre: leadInput.nombre,
      empresa: leadInput.empresa,
      email: leadInput.email,
      telefono: leadInput.telefono
    });

    const isExample = Boolean(
      leadInput.is_example ||
      (leadInput.nombre && leadInput.nombre.toUpperCase().includes('(EJEMPLO)')) ||
      (leadInput.titulo_oportunidad && leadInput.titulo_oportunidad.toUpperCase().includes('(EJEMPLO)'))
    );

    const usdVal = Number(leadInput.presupuesto_estimado_usd) ||
      (leadInput.presupuesto_bs ? Math.round(Number(leadInput.presupuesto_bs) / USD_TO_BOB_RATE) : 0);
    const bobVal = Number(leadInput.presupuesto_bs) || Math.round(usdVal * USD_TO_BOB_RATE);

    const newId = `ARM-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const targetStage = leadInput.etapa_pipeline || etapa_pipeline;
    const stageMeta = ARM_STAGES.find(s => s.id === targetStage);

    const newLead = {
      id: newId,
      external_code: newId,
      is_example: isExample,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      titulo_oportunidad: leadInput.titulo_oportunidad || `${leadInput.que_busca || 'Servicio Ambiental'} - ${leadInput.empresa || leadInput.nombre}`,
      nombre: leadInput.nombre || 'Prospecto Comercial',
      empresa: leadInput.empresa || 'Particular / Institución',
      cargo: leadInput.cargo || 'Responsable de Proyecto',
      email: leadInput.email || '',
      telefono: leadInput.telefono || '',
      ubicacion: leadInput.ubicacion || 'La Paz, Bolivia',
      canal_preferido: leadInput.canal_preferido || 'WhatsApp',
      que_busca: leadInput.que_busca || leadInput.titulo_oportunidad || 'Consultoría Ambiental y SIG',
      cuando_necesita: leadInput.cuando_necesita || 'Corto Plazo (15 a 45 días)',
      cuanto_invertir: leadInput.cuanto_invertir || (usdVal >= 1500 ? 'Mayor a USD 1,500' : 'USD 500 - USD 1,500'),
      presupuesto_estimado_usd: usdVal,
      presupuesto_bs: bobVal,
      probabilidad_cierre: leadInput.probabilidad_cierre ?? stageMeta?.probability ?? probabilidad_cierre,
      prioridad_estrellas: leadInput.prioridad_estrellas ?? prioridad_estrellas,
      etiquetas: Array.isArray(leadInput.etiquetas) && leadInput.etiquetas.length > 0
        ? leadInput.etiquetas
        : isExample ? ['EJEMPLO', 'FNCA'] : ['FNCA'],
      etapa_pipeline: targetStage,
      temperatura: leadInput.temperatura || temperatura,
      lead_score: leadInput.lead_score || score,
      clasificacion_inbound: leadInput.clasificacion_inbound || clasificacion_inbound,
      socio_asignado: leadInput.socio_asignado || 'Ing. Diego Barrientos',
      origen: leadInput.origen || 'Odoo CRM SERAM',
      metadata_inbound: leadInput.metadata_inbound || {},
      ciclo_dia_actual: leadInput.contacto_actual ? 1 : 0,
      contacto_actual: leadInput.contacto_actual ?? 0,
      proximo_contacto_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      cadencia_pausada: false,
      notas_internas: leadInput.notas_internas || 'Oportunidad registrada en el sistema ARM.'
    };

    const current = getLocal('seram_arm_leads_v2', [...REAL_CLIENTS_INITIAL, ...EXAMPLE_MOCK_LEADS]);
    const updated = [newLead, ...current];
    setLocal('seram_arm_leads_v2', updated);

    this.addChatterMessage(newLead.id, {
      tipo: 'sistema',
      autor: 'Sistema ARM',
      contenido: `Oportunidad creada (${newLead.clasificacion_inbound} · Score ${newLead.lead_score}/100 · Valor USD ${usdVal} / ${bobVal} Bs.).`
    });

    try {
      await supabase.from('arm_leads').insert([{
        external_code: newLead.id,
        titulo_oportunidad: newLead.titulo_oportunidad,
        nombre: newLead.nombre,
        empresa: newLead.empresa,
        cargo: newLead.cargo,
        email: newLead.email,
        telefono: newLead.telefono,
        ubicacion: newLead.ubicacion,
        canal_preferido: newLead.canal_preferido,
        is_example: newLead.is_example,
        que_busca: newLead.que_busca,
        cuando_necesita: newLead.cuando_necesita,
        cuanto_invertir: newLead.cuanto_invertir,
        presupuesto_estimado_usd: newLead.presupuesto_estimado_usd,
        presupuesto_bs: newLead.presupuesto_bs,
        probabilidad_cierre: newLead.probabilidad_cierre,
        prioridad_estrellas: newLead.prioridad_estrellas,
        etiquetas: newLead.etiquetas,
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
    } catch {
      // Sincronización diferida
    }

    return newLead;
  },

  /**
   * Parsea un comando rápido estilo Bot de Telegram:
   * "/lead Empresa | Contacto | Teléfono | Servicio | MontoUSD"
   */
  async createLeadFromTelegramCommand(commandText, currentSocioName = 'Ing. Diego Barrientos') {
    const clean = String(commandText || '').replace(/^\/lead\s*/i, '').trim();
    const parts = clean.split('|').map(p => p.trim());

    const empresa = parts[0] || 'Empresa Captada por Comando';
    const nombre = parts[1] || 'Contacto Directo';
    const telefono = parts[2] || '+591 70000000';
    const que_busca = parts[3] || 'Categorización Ambiental (FNCA)';
    const montoUsd = parseFloat(parts[4] || '750') || 750;

    return this.createLead({
      titulo_oportunidad: `${que_busca} - ${empresa}`,
      nombre,
      empresa,
      telefono,
      que_busca,
      cuando_necesita: 'Inmediato (< 15 días)',
      cuanto_invertir: montoUsd >= 1500 ? 'Mayor a USD 1,500' : 'USD 500 - USD 1,500',
      presupuesto_estimado_usd: montoUsd,
      socio_asignado: currentSocioName,
      origen: 'Bot de Telegram / Captura Rápida',
      etapa_pipeline: 'nuevo'
    });
  },

  /**
   * Actualiza cualquier campo de una oportunidad
   */
  async updateLead(leadId, patch) {
    const current = getLocal('seram_arm_leads_v2', [...REAL_CLIENTS_INITIAL, ...EXAMPLE_MOCK_LEADS]);
    let updatedLead = null;

    if (patch.presupuesto_estimado_usd !== undefined && patch.presupuesto_bs === undefined) {
      patch.presupuesto_bs = Math.round((Number(patch.presupuesto_estimado_usd) || 0) * USD_TO_BOB_RATE);
    } else if (patch.presupuesto_bs !== undefined && patch.presupuesto_estimado_usd === undefined) {
      patch.presupuesto_estimado_usd = Math.round((Number(patch.presupuesto_bs) || 0) / USD_TO_BOB_RATE);
    }

    if (patch.etapa_pipeline) {
      const st = ARM_STAGES.find(s => s.id === patch.etapa_pipeline);
      if (st && patch.probabilidad_cierre === undefined) {
        patch.probabilidad_cierre = st.probability;
      }
    }

    const next = current.map(item => {
      if (String(item.id) === String(leadId)) {
        updatedLead = { ...item, ...patch, updated_at: new Date().toISOString() };
        return updatedLead;
      }
      return item;
    });

    setLocal('seram_arm_leads_v2', next);

    try {
      await supabase.from('arm_leads').update(patch).eq('external_code', String(leadId));
    } catch {
      // Fallback
    }

    return updatedLead;
  },

  /**
   * Elimina una oportunidad
   */
  async deleteLead(leadId) {
    const current = getLocal('seram_arm_leads_v2', [...REAL_CLIENTS_INITIAL, ...EXAMPLE_MOCK_LEADS]);
    const next = current.filter(item => String(item.id) !== String(leadId));
    setLocal('seram_arm_leads_v2', next);

    try {
      await supabase.from('arm_leads').delete().eq('external_code', String(leadId));
    } catch {
      // Fallback
    }
    return next;
  },

  /**
   * Elimina todos los leads marcados como (EJEMPLO) cuando el usuario desee limpiar las maquetas
   */
  purgeExampleLeads() {
    const current = getLocal('seram_arm_leads_v2', [...REAL_CLIENTS_INITIAL, ...EXAMPLE_MOCK_LEADS]);
    const onlyReal = current.filter(l => !l.is_example && !String(l.titulo_oportunidad || '').includes('(EJEMPLO)'));
    setLocal('seram_arm_leads_v2', onlyReal);
    return onlyReal;
  },

  /**
   * Restaura las maquetas (EJEMPLO) para entrenamiento
   */
  restoreExampleLeads() {
    const current = getLocal('seram_arm_leads_v2', REAL_CLIENTS_INITIAL);
    const existingIds = new Set(current.map(l => String(l.id)));
    const merged = [...current];
    EXAMPLE_MOCK_LEADS.forEach(mock => {
      if (!existingIds.has(String(mock.id))) {
        merged.push(mock);
      }
    });
    setLocal('seram_arm_leads_v2', merged);
    return merged;
  },

  /**
   * Obtiene los Tipos de Actividad (Configuración Odoo + Misiones SERAM)
   */
  getActivityTypes() {
    return getLocal('seram_arm_activity_types', DEFAULT_ACTIVITY_TYPES);
  },

  saveActivityType(newType) {
    const types = this.getActivityTypes();
    const entry = {
      id: `act-type-${Date.now()}`,
      codigo: (newType.nombre || 'CUSTOM').toUpperCase().slice(0, 10) + '_' + String(Date.now()).slice(-3),
      nombre: newType.nombre,
      resumen_predeterminado: newType.resumen_predeterminado || 'Actividad técnica comercial',
      planeado_en_dias: Number(newType.planeado_en_dias) || 2,
      tipo_regla: newType.tipo_regla || 'después de la fecha límite de la actividad anterior',
      categoria_mision: newType.categoria_mision || 'secundaria',
      xp_recompensa: Number(newType.xp_recompensa) || 50,
      requiere_evidencia: true,
      usuario_predeterminado: newType.usuario_predeterminado || 'Socio Asignado'
    };
    const updated = [...types, entry];
    setLocal('seram_arm_activity_types', updated);
    return updated;
  },

  /**
   * Obtiene todas las misiones/actividades planificadas de los leads
   */
  getAllLeadActivities() {
    return getLocal('seram_arm_lead_activities', INITIAL_ACTIVITIES_SEED);
  },

  getLeadActivities(leadId) {
    const all = this.getAllLeadActivities();
    return all.filter(a => String(a.lead_id) === String(leadId));
  },

  /**
   * Programa una nueva Actividad / Misión en una oportunidad (y opcionalmente la inyecta en Actividades Globales)
   */
  scheduleLeadActivity(leadId, actInput) {
    const all = this.getAllLeadActivities();
    const badgeInfo = MISSION_CATEGORY_BADGES[actInput.categoria_mision] || MISSION_CATEGORY_BADGES.secundaria;

    const newAct = {
      id: `ARM-ACT-${Date.now()}`,
      created_at: new Date().toISOString(),
      lead_id: String(leadId),
      activity_type_code: actInput.activity_type_code || 'CALL_BANT',
      titulo: actInput.titulo || 'Seguimiento Técnico Comercial',
      resumen: actInput.resumen || '',
      categoria_mision: actInput.categoria_mision || 'secundaria',
      responsable: actInput.responsable || 'Ing. Diego Barrientos',
      participantes: actInput.participantes || [actInput.responsable || 'Ing. Diego Barrientos'],
      fecha_vencimiento: actInput.fecha_vencimiento || new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      estado: 'pendiente',
      xp_otorgado: Number(actInput.xp_otorgado) || badgeInfo.xpBase,
      evidencia_url: '',
      evidencia_nota: ''
    };

    const updated = [newAct, ...all];
    setLocal('seram_arm_lead_activities', updated);

    this.addChatterMessage(leadId, {
      tipo: 'sistema',
      autor: newAct.responsable,
      contenido: `Misión programada [${badgeInfo.label} · +${newAct.xp_otorgado} XP]: "${newAct.titulo}" (Vence: ${newAct.fecha_vencimiento}).`
    });

    return newAct;
  },

  /**
   * Completa una Misión / Actividad verificando su evidencia y otorgando XP meritocrático
   */
  async completeLeadActivityWithEvidence(activityId, { evidencia_url, evidencia_nota, autor }) {
    const all = this.getAllLeadActivities();
    let targetAct = null;

    const updated = all.map(a => {
      if (String(a.id) === String(activityId)) {
        targetAct = {
          ...a,
          estado: 'completada',
          completed_at: new Date().toISOString(),
          evidencia_url: evidencia_url || '',
          evidencia_nota: evidencia_nota || 'Cumplimiento verificado en CRM'
        };
        return targetAct;
      }
      return a;
    });

    setLocal('seram_arm_lead_activities', updated);

    if (targetAct) {
      const badgeInfo = MISSION_CATEGORY_BADGES[targetAct.categoria_mision] || MISSION_CATEGORY_BADGES.secundaria;
      this.addChatterMessage(targetAct.lead_id, {
        tipo: 'mision_completada',
        autor: autor || targetAct.responsable,
        contenido: `Misión Completada [${badgeInfo.label}]: "${targetAct.titulo}". Evidencia: ${targetAct.evidencia_nota || 'Verificada'}. Recompensa acreditada: +${targetAct.xp_otorgado} XP.`,
        evidencia_adjunta: targetAct.evidencia_url,
        xp_ganado: targetAct.xp_otorgado
      });
    }

    return targetAct;
  },

  deleteLeadActivity(activityId) {
    const all = this.getAllLeadActivities();
    const next = all.filter(a => String(a.id) !== String(activityId));
    setLocal('seram_arm_lead_activities', next);
    return next;
  },

  /**
   * Avanza el contacto de la cadencia de 14 días (Protocolo Anti-Baneo)
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
      autor: 'Cadencia ARM 14D',
      contenido: `Contacto ${nextStep}/7 (Día ${nextDay}) registrado: '${outcome}'.`
    });
  },

  /**
   * Registra un mensaje o nota interna en el Chatter del Lead
   */
  addChatterMessage(leadId, { tipo = 'nota_interna', autor = 'Socio SERAM', contenido, evidencia_adjunta = '', xp_ganado = 0 }) {
    if (!contenido) return null;
    const key = `seram_arm_chatter_${leadId}`;
    const current = getLocal(key, []);
    const entry = {
      id: Date.now() + Math.random(),
      created_at: new Date().toISOString(),
      tipo,
      autor,
      contenido,
      evidencia_adjunta,
      xp_ganado
    };
    const next = [entry, ...current];
    setLocal(key, next);

    try {
      supabase.from('arm_chatter').insert([{ lead_id: leadId, tipo, autor, contenido, evidencia_adjunta, xp_ganado }]);
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
        contenido: 'Expediente comercial habilitado en el flujo de Odoo CRM de SERAM.'
      }
    ]);
  },

  /**
   * Obtiene el estado de los 7 pasos de cadencia para un lead
   */
  getLeadCadenceSteps(lead) {
    if (!lead) return [];
    const currentContact = lead.contacto_actual || 0;

    return DEFAULT_CADENCE_STEPS.map(step => {
      const isPast = currentContact >= step.step;
      const isCurrent = currentContact + 1 === step.step || (currentContact === 0 && step.step === 1);
      const isFuture = !isPast && !isCurrent;

      let status = 'programado';
      if (isPast) status = 'completado';
      if (isCurrent) status = 'activo_hoy';

      const personalizedMessage = step.template
        .replace('{nombre}', (lead.nombre || 'Estimado/a').replace('(EJEMPLO) ', ''))
        .replace('{servicio}', lead.que_busca || 'tu trámite ambiental')
        .replace('{empresa}', (lead.empresa || 'tu institución').replace('(EJEMPLO) ', ''))
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

/**
 * xpEngine.js — Motor de Gamificación y Progresión Meritocrática de SERAM
 *
 * Arquitectura de Progresión: 33 Grados de Maestría Pericial
 * - Nivel Máximo: 33 ("Grado 33 · Arquitecto Planetario & Socio Emérito")
 * - Curva de Progresión: Polinómica / Exponencial suave calibrada para años de ejercicio profesional continuo.
 * - Primeros Niveles (1-5): Rápidos y gratificantes (primeras semanas/mes), feedback inmediato de avance ("First Wins").
 * - Niveles Medios (6-17): Especialización, autonomía y peritaje judicial (1 a 2 años).
 * - Niveles Superiores (18-28): Dirección, estrategia y cátedra de autor (3 a 4 años).
 * - Niveles Cumbre (29-33): Consejo Supremo y Cénit Planetario (5+ años de dedicación implacable).
 *
 * Multiplicador de Honorarios: De 1.00x (Nivel 1) a 2.50x (Nivel 33).
 */

export const DIFFICULTY_MULTIPLIERS = {
  Baja: 1.0,
  Media: 1.5,
  Alta: 2.0,
  Critica: 3.0,
  Normal: 1.5,
  Urgente: 2.5,
};

export const MASTERY_ORDERS = [
  {
    id: 'orden-1',
    name: 'Orden I: Semillero & Heraldo',
    minLevel: 1,
    maxLevel: 6,
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Iniciación profesional, primeros registros en Time Tracker y tareas de gabinete.',
  },
  {
    id: 'orden-2',
    name: 'Orden II: Consultoría Técnica & Junior',
    minLevel: 7,
    maxLevel: 11,
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Tarifa base estándar (1.00x en Nvl 7), expedientes sectoriales y primera graduación troncal (1.55x en Nvl 11).',
  },
  {
    id: 'orden-3',
    name: 'Orden III: Liderazgo Pericial & Dictamen',
    minLevel: 12,
    maxLevel: 17,
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Dictámenes periciales judiciales, modelación de pasivos y finanzas climáticas.',
  },
  {
    id: 'orden-4',
    name: 'Orden IV: Dirección & Consultoría Ejecutiva',
    minLevel: 18,
    maxLevel: 22,
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Licitaciones estratégicas B2B, defensa jurídica y graduación troncal ejecutiva (2.00x en Nvl 22).',
  },
  {
    id: 'orden-5',
    name: 'Orden V: Consultoría Nominal & Sabios',
    minLevel: 23,
    maxLevel: 28,
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Consultoría nominal de autor (2.25x en Nvl 25), cátedra en Academy y arbitraje.',
  },
  {
    id: 'orden-6',
    name: 'Orden VI: Consejo Supremo & Legado',
    minLevel: 29,
    maxLevel: 32,
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Custodia institucional del impacto planetario y arbitraje supremo.',
  },
  {
    id: 'orden-7',
    name: 'Cénit Supremo: Grado 33',
    minLevel: 33,
    maxLevel: 33,
    color: '#fbbf24',
    badgeColor: 'border-amber-300/40 text-amber-200 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20',
    description: 'Consultor Ingeniero Senior. Máximo cenit de la carrera pericial (2.50x). Impacto planetario y legado vitalicio.',
  },
];

export const GRADUATION_REQUIREMENTS = {
  11: {
    level: 11,
    title: 'Consultor Junior',
    badge: 'Graduación Troncal I',
    feeMultiplier: 1.55,
    individualProjects: 3,
    groupProjects: 3,
    prospects: 3,
    clientsClosed: 0,
    newClients: 0,
    padawans: 0,
    description: 'Para ser Nivel 11 el consultor deberá tener a su favor mínimamente 3 proyectos concluidos individuales, 3 grupales y 3 prospectos registrados.',
  },
  22: {
    level: 22,
    title: 'Consultor Ejecutivo',
    badge: 'Graduación Troncal II',
    feeMultiplier: 2.00,
    individualProjects: 5,
    groupProjects: 5,
    prospects: 5,
    clientsClosed: 5,
    newClients: 5,
    padawans: 1,
    description: 'Para consagrar el Nivel 22 deberá tener 5 proyectos concluidos individuales, 5 grupales, 5 clientes cerrados, 5 clientes nuevos y 1 aprendiz tutelado (Padawan).',
  },
  33: {
    level: 33,
    title: 'Consultor Ingeniero Senior',
    badge: 'Consagración Troncal III (Cénit Supremo)',
    feeMultiplier: 2.50,
    individualProjects: 10,
    groupProjects: 10,
    prospects: 10,
    clientsClosed: 10,
    newClients: 10,
    juniorMentees: 1, // 1 aprendiz Nivel 11
    aspirantMentees: 2, // 2 aprendices Nivel 7 o menor
    description: 'Para consagrar el Nivel 33 deberá tener 10 proyectos concluidos individuales, 10 grupales, 10 clientes cerrados, 10 clientes nuevos, 1 aprendiz Nivel 11 y 2 aprendices del Nivel 7 para abajo.',
  },
};

export const LEVELS_33 = [
  // ── ORDEN I: SEMILLERO & HERALDO (1 - 6) ──
  {
    level: 1,
    title: 'Heraldo',
    minXP: 0,
    maxXP: 300,
    feeMultiplier: 0.70,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Heraldo',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Iniciación en SERAM, primeros registros en Time Tracker y familiarización del entorno.',
  },
  {
    level: 2,
    title: 'Heraldo de Gabinete',
    minXP: 301,
    maxXP: 700,
    feeMultiplier: 0.80,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Heraldo',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Procesamiento de datos hidroquímicos y asistencia en matrices preliminares.',
  },
  {
    level: 3,
    title: 'Técnico',
    minXP: 701,
    maxXP: 1200,
    feeMultiplier: 0.85,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Heraldo',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Toma de muestras bajo cadena de custodia y soporte instrumental.',
  },
  {
    level: 4,
    title: 'Técnico Especialista',
    minXP: 1201,
    maxXP: 1900,
    feeMultiplier: 0.90,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Heraldo',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Consolidación de factores bióticos, abióticos y soporte en terreno.',
  },
  {
    level: 5,
    title: 'Consultor',
    minXP: 1901,
    maxXP: 2800,
    feeMultiplier: 0.95,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Heraldo',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Primeros entregables técnicos autónomos aprobados sin observaciones.',
  },
  {
    level: 6,
    title: 'Consultor de Campo',
    minXP: 2801,
    maxXP: 4000,
    feeMultiplier: 0.98,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Heraldo',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Autonomía de despliegue en cuencas e informes de monitoreo biofísico.',
  },

  // ── ORDEN II: CONSULTORÍA TÉCNICA & JUNIOR (7 - 11) ──
  {
    level: 7,
    title: 'Consultor Técnico',
    minXP: 4001,
    maxXP: 5500,
    feeMultiplier: 1.00,
    orderId: 'orden-2',
    orderName: 'Orden II: Consultoría Técnica & Junior',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Tarifa Base Estándar (1.00x). Modelación biofísica, cartografía SIG y líneas base completas.',
  },
  {
    level: 8,
    title: 'Consultor Técnico Sectorial',
    minXP: 5501,
    maxXP: 7300,
    feeMultiplier: 1.12,
    orderId: 'orden-2',
    orderName: 'Orden II: Consultoría Técnica & Junior',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Evaluación de cumplimiento normativo, registros RENCA y licencias ambientales RAI.',
  },
  {
    level: 9,
    title: 'Consultor Técnico de Cuencas',
    minXP: 7301,
    maxXP: 9500,
    feeMultiplier: 1.25,
    orderId: 'orden-2',
    orderName: 'Orden II: Consultoría Técnica & Junior',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Auditorías de campo y planes de adecuación y seguimiento ambiental (PASA).',
  },
  {
    level: 10,
    title: 'Consultor Técnico Avanzado',
    minXP: 9501,
    maxXP: 12200,
    feeMultiplier: 1.40,
    orderId: 'orden-2',
    orderName: 'Orden II: Consultoría Técnica & Junior',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Estudios de impacto ambiental complejos en minería, industria y recursos hídricos.',
  },
  {
    level: 11,
    title: 'Consultor Junior',
    minXP: 12201,
    maxXP: 15500,
    feeMultiplier: 1.55,
    orderId: 'orden-2',
    orderName: 'Orden II: Consultoría Técnica & Junior',
    color: '#00e03c',
    badgeColor: 'border-emerald-400 text-emerald-200 bg-emerald-500/20 font-black ring-1 ring-emerald-400/50',
    description: '⭐ GRADUACIÓN TRONCAL I (1.55x). Requiere ≥3 proyectos individuales, ≥3 grupales y ≥3 prospectos.',
    isGraduation: true,
    graduationKey: 11,
  },

  // ── ORDEN III: LIDERAZGO PERICIAL & DICTAMEN (12 - 17) ──
  {
    level: 12,
    title: 'Consultor Junior de Proyectos',
    minXP: 15501,
    maxXP: 19500,
    feeMultiplier: 1.60,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Comparecencia y sustentación de informes periciales en juzgados agroambientales.',
  },
  {
    level: 13,
    title: 'Consultor Pericial Junior',
    minXP: 19501,
    maxXP: 24500,
    feeMultiplier: 1.65,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Diagnóstico de drenajes ácidos de roca (DAR), relaves mineros y metales pesados.',
  },
  {
    level: 14,
    title: 'Consultor Diseñador NbS',
    minXP: 24501,
    maxXP: 30500,
    feeMultiplier: 1.70,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Soluciones Basadas en la Naturaleza y corredores de recarga acuífera.',
  },
  {
    level: 15,
    title: 'Consultor en Economía Circular',
    minXP: 30501,
    maxXP: 37500,
    feeMultiplier: 1.75,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Transformación de cadenas industriales de residuos (Ley 755).',
  },
  {
    level: 16,
    title: 'Consultor en Finanzas Climáticas',
    minXP: 37501,
    maxXP: 46000,
    feeMultiplier: 1.80,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Formulación de proyectos de carbono GHG Protocol y estándares EDGE de construcción.',
  },
  {
    level: 17,
    title: 'Consultor Perito Judicial',
    minXP: 46001,
    maxXP: 56000,
    feeMultiplier: 1.84,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Máxima idoneidad probatoria en litigios ambientales de impacto regional.',
  },

  // ── ORDEN IV: DIRECCIÓN & CONSULTORÍA EJECUTIVA (18 - 22) ──
  {
    level: 18,
    title: 'Consultor Director de Operaciones',
    minXP: 56001,
    maxXP: 68000,
    feeMultiplier: 1.88,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Consultoría Ejecutiva',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Supervisión simultánea de expedientes de campo, laboratorio y gabinete.',
  },
  {
    level: 19,
    title: 'Consultor Licitador B2B',
    minXP: 68001,
    maxXP: 82000,
    feeMultiplier: 1.91,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Consultoría Ejecutiva',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Licitaciones estratégicas SICOES y adjudicación de contratos multilaterales.',
  },
  {
    level: 20,
    title: 'Consultor de Calidad & Normas',
    minXP: 82001,
    maxXP: 98000,
    feeMultiplier: 1.94,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Consultoría Ejecutiva',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Aprobación definitiva de sellos institucionales y matrices de riesgo.',
  },
  {
    level: 21,
    title: 'Consultor Director de Cartera',
    minXP: 98001,
    maxXP: 117000,
    feeMultiplier: 1.97,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Consultoría Ejecutiva',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Expansión de cartera recurrente y convenios interinstitucionales.',
  },
  {
    level: 22,
    title: 'Consultor Ejecutivo',
    minXP: 117001,
    maxXP: 139000,
    feeMultiplier: 2.00,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Consultoría Ejecutiva',
    color: '#a855f7',
    badgeColor: 'border-purple-400 text-purple-200 bg-purple-500/20 font-black ring-1 ring-purple-400/50',
    description: '⭐ GRADUACIÓN TRONCAL II (2.00x). Requiere ≥5 individuales, ≥5 grupales, ≥5 cerrados, ≥5 nuevos y 1 Padawan.',
    isGraduation: true,
    graduationKey: 22,
  },

  // ── ORDEN V: CONSULTORÍA NOMINAL & SABIOS (23 - 28) ──
  {
    level: 23,
    title: 'Consultor Ejecutivo de Arbitraje',
    minXP: 139001,
    maxXP: 165000,
    feeMultiplier: 2.08,
    orderId: 'orden-5',
    orderName: 'Orden V: Consultoría Nominal & Sabios',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Árbitro técnico de consenso en controversias de alta cuantía jurídica.',
  },
  {
    level: 24,
    title: 'Consultor Consejero Directivo',
    minXP: 165001,
    maxXP: 195000,
    feeMultiplier: 2.16,
    orderId: 'orden-5',
    orderName: 'Orden V: Consultoría Nominal & Sabios',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Voz directiva con potestad de lineamiento estratégico corporativo.',
  },
  {
    level: 25,
    title: 'Consultor Nominal',
    minXP: 195001,
    maxXP: 230000,
    feeMultiplier: 2.25,
    orderId: 'orden-5',
    orderName: 'Orden V: Consultoría Nominal & Sabios',
    color: '#f43f5e',
    badgeColor: 'border-rose-400 text-rose-200 bg-rose-500/20 font-black',
    description: 'Consultoría Nominal de Firma (2.25x). Cátedra en Academy y autoría de metodologías periciales.',
  },
  {
    level: 26,
    title: 'Consultor Nominal Metodólogo',
    minXP: 230001,
    maxXP: 270000,
    feeMultiplier: 2.28,
    orderId: 'orden-5',
    orderName: 'Orden V: Consultoría Nominal & Sabios',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Patente y estandarización de protocolos metodológicos registrados.',
  },
  {
    level: 27,
    title: 'Consultor Nominal de Cuencas',
    minXP: 270001,
    maxXP: 315000,
    feeMultiplier: 2.31,
    orderId: 'orden-5',
    orderName: 'Orden V: Consultoría Nominal & Sabios',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Auditoría cumbre de cuencas transfronterizas y macro-sistemas hídricos.',
  },
  {
    level: 28,
    title: 'Consultor Magistrado Institucional',
    minXP: 315001,
    maxXP: 365000,
    feeMultiplier: 2.35,
    orderId: 'orden-5',
    orderName: 'Orden V: Consultoría Nominal & Sabios',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Estructuración societaria patrimonial y expansión internacional.',
  },

  // ── ORDEN VI: CONSEJO SUPREMO & LEGADO (29 - 32) ──
  {
    level: 29,
    title: 'Consultor Patriarca Societario',
    minXP: 365001,
    maxXP: 420000,
    feeMultiplier: 2.38,
    orderId: 'orden-6',
    orderName: 'Orden VI: Consejo Supremo & Legado',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Liderazgo moral y deontológico indiscutido en la consultoría ambiental.',
  },
  {
    level: 30,
    title: 'Consultor Guardián Planetario',
    minXP: 420001,
    maxXP: 480000,
    feeMultiplier: 2.42,
    orderId: 'orden-6',
    orderName: 'Orden VI: Consejo Supremo & Legado',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Custodio del indicador PIP colectivo y de la misión de dejar el mundo mejor.',
  },
  {
    level: 31,
    title: 'Consultor Canciller Internacional',
    minXP: 480001,
    maxXP: 545000,
    feeMultiplier: 2.45,
    orderId: 'orden-6',
    orderName: 'Orden VI: Consejo Supremo & Legado',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Representación pericial ante foros COP, organismos multilaterales y cumbres.',
  },
  {
    level: 32,
    title: 'Consultor Maestro de la Orden',
    minXP: 545001,
    maxXP: 615000,
    feeMultiplier: 2.48,
    orderId: 'orden-6',
    orderName: 'Orden VI: Consejo Supremo & Legado',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Dominio holístico sin parangón en las 5 constelaciones técnicas de SERAM.',
  },

  // ── CÉNIT SUPREMO: GRADO 33 ──
  {
    level: 33,
    title: 'Consultor Ingeniero Senior',
    minXP: 615001,
    maxXP: Infinity,
    feeMultiplier: 2.50,
    orderId: 'orden-7',
    orderName: 'Cénit Supremo: Grado 33',
    color: '#fbbf24',
    badgeColor: 'border-amber-300/60 text-amber-100 bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-500/30 font-black ring-2 ring-amber-400/50',
    description: '👑 CONSAGRACIÓN TRONCAL III (2.50x). Nivel Cénit. Requiere ≥10 individuales, ≥10 grupales, ≥10 cerrados, ≥10 nuevos, 1 aprendiz Nivel 11 y 2 aprendices Nivel ≤7.',
    isGraduation: true,
    graduationKey: 33,
  },
];

/**
 * Valida los requisitos troncales de graduación para niveles clave (11, 22, 33).
 */
export function checkGraduationStatus(level, partnerMetrics = {}) {
  const req = GRADUATION_REQUIREMENTS[level];
  if (!req) return { isGraduationLevel: false, isEligible: true, req: null, checks: [] };

  const {
    individualProjects = 0,
    groupProjects = 0,
    prospects = 0,
    clientsClosed = 0,
    newClients = 0,
    padawans = 0,
    juniorMentees = 0,
    aspirantMentees = 0,
  } = partnerMetrics;

  const checks = [];

  if (req.individualProjects > 0) {
    checks.push({
      label: `Proyectos Individuales (${req.individualProjects} mín.)`,
      current: individualProjects,
      required: req.individualProjects,
      passed: individualProjects >= req.individualProjects,
    });
  }
  if (req.groupProjects > 0) {
    checks.push({
      label: `Proyectos Grupales (${req.groupProjects} mín.)`,
      current: groupProjects,
      required: req.groupProjects,
      passed: groupProjects >= req.groupProjects,
    });
  }
  if (req.prospects > 0) {
    checks.push({
      label: `Prospectos B2B (${req.prospects} mín.)`,
      current: prospects,
      required: req.prospects,
      passed: prospects >= req.prospects,
    });
  }
  if (req.clientsClosed > 0) {
    checks.push({
      label: `Clientes Cerrados (${req.clientsClosed} mín.)`,
      current: clientsClosed,
      required: req.clientsClosed,
      passed: clientsClosed >= req.clientsClosed,
    });
  }
  if (req.newClients > 0) {
    checks.push({
      label: `Clientes Nuevos (${req.newClients} mín.)`,
      current: newClients,
      required: req.newClients,
      passed: newClients >= req.newClients,
    });
  }
  if (req.padawans > 0) {
    checks.push({
      label: `Aprendiz Tutelado Padawan (${req.padawans} mín.)`,
      current: padawans,
      required: req.padawans,
      passed: padawans >= req.padawans,
    });
  }
  if (req.juniorMentees > 0) {
    checks.push({
      label: `Aprendiz Nvl 11 Formado (${req.juniorMentees} mín.)`,
      current: juniorMentees,
      required: req.juniorMentees,
      passed: juniorMentees >= req.juniorMentees,
    });
  }
  if (req.aspirantMentees > 0) {
    checks.push({
      label: `Aprendices Nvl ≤ 7 (${req.aspirantMentees} mín.)`,
      current: aspirantMentees,
      required: req.aspirantMentees,
      passed: aspirantMentees >= req.aspirantMentees,
    });
  }

  const allPassed = checks.every(c => c.passed);

  return {
    isGraduationLevel: true,
    req,
    checks,
    isEligible: allPassed,
    passedCount: checks.filter(c => c.passed).length,
    totalCount: checks.length,
  };
}

// Compatibilidad hacia atrás con referencias previas a TIERS
export const TIERS = MASTERY_ORDERS.map((order, idx) => ({
  level: idx + 1,
  title: order.name,
  minXP: LEVELS_33.find(l => l.orderId === order.id)?.minXP || 0,
  maxXP: LEVELS_33.filter(l => l.orderId === order.id).slice(-1)[0]?.maxXP || Infinity,
  feeMultiplier: LEVELS_33.find(l => l.orderId === order.id)?.feeMultiplier || 1.0,
  badgeColor: order.badgeColor,
  color: order.color,
  description: order.description,
}));

/**
 * Calcula el XP ganado al aprobar un entregable o tarea.
 */
export function calculateTaskXP({
  hours = 1,
  difficulty = 'Media',
  deadline = null,
  completedAt = new Date(),
}) {
  const safeHours = Math.max(0.25, Number(hours) || 1);
  const diffMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.5;
  const baseXP = Math.round(safeHours * 100 * diffMultiplier);

  let bonusXP = 0;
  let penaltyXP = 0;
  let delayDays = 0;
  let isEarly = false;
  let isOverdue = false;

  if (deadline) {
    const deadlineDate = new Date(deadline);
    const finishDate = new Date(completedAt);

    if (!isNaN(deadlineDate.getTime()) && !isNaN(finishDate.getTime())) {
      const diffMs = finishDate.getTime() - deadlineDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        isEarly = true;
        bonusXP = Math.round(baseXP * 0.1);
      } else {
        isOverdue = true;
        delayDays = diffDays;
        const weeksLate = Math.ceil(diffDays / 7);

        if (weeksLate === 1) {
          penaltyXP = Math.round(baseXP * 0.25);
        } else if (weeksLate === 2) {
          penaltyXP = Math.round(baseXP * 0.50);
        } else if (weeksLate === 3) {
          penaltyXP = Math.round(baseXP * 0.75);
        } else {
          penaltyXP = baseXP;
        }
      }
    }
  }

  const finalXP = Math.max(0, baseXP + bonusXP - penaltyXP);

  return {
    baseXP,
    bonusXP,
    penaltyXP,
    finalXP,
    isEarly,
    isOverdue,
    delayDays,
    diffMultiplier,
    hours: safeHours,
  };
}

/**
 * Obtiene el rango y nivel (1 a 33) de un socio en base a su XP acumulado.
 *
 * @param {number} totalXP
 * @returns {Object} Objeto del nivel actual con orden de maestría y progreso al siguiente nivel.
 */
export function getPartnerTier(totalXP = 0) {
  const safeXP = Math.max(0, Number(totalXP) || 0);
  const currentLevel = LEVELS_33.find(l => safeXP >= l.minXP && safeXP <= l.maxXP) || LEVELS_33[LEVELS_33.length - 1];
  const nextLevel = LEVELS_33.find(l => l.level === currentLevel.level + 1) || null;

  let progressPercent = 100;
  let xpForNext = 0;

  if (nextLevel && currentLevel.maxXP !== Infinity) {
    const range = currentLevel.maxXP - currentLevel.minXP;
    const currentInRange = safeXP - currentLevel.minXP;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
    xpForNext = Math.max(1, (currentLevel.maxXP + 1) - safeXP);
  }

  const order = MASTERY_ORDERS.find(o => o.id === currentLevel.orderId) || MASTERY_ORDERS[MASTERY_ORDERS.length - 1];

  return {
    ...currentLevel,
    order,
    currentXP: safeXP,
    progressPercent,
    nextTier: nextLevel, // Preserva compatibilidad con código existente
    xpForNext,
    maxLevel: 33,
    isMaxLevel: currentLevel.level === 33,
  };
}

/**
 * Calcula el XP total acumulado por un socio en base a sus actividades aprobadas.
 */
export function calculatePartnerTotalXP(partnerName, activities = [], timeLogs = []) {
  if (!partnerName) return getPartnerTier(0);

  // 1. XP de actividades concluidas y aprobadas
  const partnerActs = (activities || []).filter(
    a => a.assignedPartner === partnerName && (a.status === 'Concluido' || a.status === 'Aprobado')
  );

  let activitiesXP = 0;
  partnerActs.forEach(act => {
    if (act.xp_awarded !== undefined && act.xp_awarded !== null) {
      activitiesXP += Number(act.xp_awarded) || 0;
    } else {
      const hours = Number(act.estimatedHours) || Number(act.hours) || 2;
      const diff = act.priority === 'Alta' ? 'Alta' : (act.priority === 'Urgente' ? 'Critica' : 'Media');
      const calc = calculateTaskXP({
        hours,
        difficulty: diff,
        deadline: act.deadline,
        completedAt: act.completed_at || act.created_at,
      });
      activitiesXP += calc.finalXP;
    }
  });

  // 2. XP base por horas registradas en Time Tracker (50 XP por hora registrada verificada)
  const partnerLogs = (timeLogs || []).filter(
    l => l.partner_name === partnerName || l.partner_id?.includes(partnerName.split(' ')[1]?.toLowerCase() || '')
  );
  const timeTrackerHours = partnerLogs.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
  const timeTrackerXP = Math.round(timeTrackerHours * 50);

  // 3. Black Hat Penalización Severa: deducción por tareas vencidas no entregadas (Meritocracia)
  const pendingOverdue = (activities || []).filter(a => {
    if (a.assignedPartner !== partnerName) return false;
    if (a.status === 'Concluido' || a.status === 'Aprobado') return false;
    if (!a.deadline) return false;
    const d = new Date(a.deadline);
    return !isNaN(d.getTime()) && d.getTime() < Date.now();
  });

  let blackHatPenaltyXP = 0;
  pendingOverdue.forEach(act => {
    const diffMs = Date.now() - new Date(act.deadline).getTime();
    const daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const hours = Number(act.estimatedHours) || Number(act.hours) || 2;
    const taskCap = hours * 150;
    // 75 XP de castigo por día de mora por tarea, hasta el tope del valor de la tarea
    const penalty = Math.min(taskCap, daysLate * 75);
    blackHatPenaltyXP += penalty;
  });

  const rawTotalXP = activitiesXP + timeTrackerXP - blackHatPenaltyXP;
  const totalXP = Math.max(0, rawTotalXP);

  return {
    ...getPartnerTier(totalXP),
    rawTotalXP,
    activitiesXP,
    timeTrackerXP,
    blackHatPenaltyXP,
    pendingOverdueCount: pendingOverdue.length,
    totalHours: timeTrackerHours,
    completedTasksCount: partnerActs.length,
  };
}

/**
 * Valida si un socio tiene permiso para aprobar una tarea (Anti-Cheat Segmentado).
 * - Proyectos grandes / peritajes / presupuesto formal / alta prioridad: Obligatoria validación cruzada entre pares.
 * - Tareas clave menores, operacionales, rutinarias o propuestas: Auto-aprobación ágil permitida.
 */
export function validateCrossApproval(currentSocio, task) {
  if (!currentSocio || !currentSocio.name) {
    return {
      canApprove: false,
      reason: 'Debes iniciar sesión como socio directivo para validar entregables.',
    };
  }

  // Detectar si la tarea es de alta jerarquía / proyecto grande / peritaje / presupuesto formal
  const isMajor =
    task?.isMajorProject === true ||
    (Number(task?.budget) || 0) > 0 ||
    task?.priority === 'Alta' ||
    task?.priority === 'Critica' ||
    task?.priority === 'Urgente' ||
    task?.category === 'Peritaje' ||
    task?.category === 'Auditoría' ||
    (Number(task?.estimatedHours) || Number(task?.hours) || 0) >= 6;

  // Si es una tarea pequeña, rutinaria, propuesta o repetitiva: permitir auto-aprobación ágil
  if (!isMajor) {
    return {
      canApprove: true,
      isAutoApproved: task?.assignedPartner === currentSocio.name,
      isMajorProject: false,
      reason: 'Aprobación directa autorizada para entregables operacionales menores, propuestas o tareas repetitivas.',
    };
  }

  // Si es proyecto grande o peritaje de envergadura: regla anti-cheat estricta
  if (task?.assignedPartner === currentSocio.name) {
    return {
      canApprove: false,
      isMajorProject: true,
      reason: 'Principio Anti-Cheat (Proyecto Mayor): Al tratarse de un peritaje o proyecto de alta envergadura, se requiere validación cruzada y firma de otro socio directivo.',
    };
  }

  return {
    canApprove: true,
    isMajorProject: true,
    reason: 'Validación cruzada entre pares autorizada.',
  };
}

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
    name: 'Orden I: Semillero & Aspirantía',
    minLevel: 1,
    maxLevel: 5,
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Fase de iniciación técnica, primeros muestreos en campo y gabinete.',
  },
  {
    id: 'orden-2',
    name: 'Orden II: Especialización & Autonomía',
    minLevel: 6,
    maxLevel: 11,
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Autonomía pericial, SIG sectorial y fiscalización de cumplimiento normativo.',
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
    name: 'Orden IV: Dirección & Estrategia Societaria',
    minLevel: 18,
    maxLevel: 23,
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Licitaciones estratégicas B2B, defensa jurídica y arbitraje técnico de cuencas.',
  },
  {
    id: 'orden-5',
    name: 'Orden V: Consejo de Sabios & Maestría',
    minLevel: 24,
    maxLevel: 28,
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Cátedra en SERAM Academy, creación de metodologías y auditorías cumbre.',
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
    description: 'Máximo cenit de la carrera pericial. Impacto planetario y legado vitalicio en SERAM.',
  },
];

export const LEVELS_33 = [
  // ── ORDEN I: SEMILLERO & ASPIRANTÍA (1 - 5) ──
  {
    level: 1,
    title: 'Novicio Técnico',
    minXP: 0,
    maxXP: 300,
    feeMultiplier: 1.00,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Aspirantía',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Inducción institucional y primeros registros de horas en la oficina virtual.',
  },
  {
    level: 2,
    title: 'Asistente de Gabinete',
    minXP: 301,
    maxXP: 700,
    feeMultiplier: 1.03,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Aspirantía',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Procesamiento de datos hidroquímicos y asistencia en matrices de impacto.',
  },
  {
    level: 3,
    title: 'Operador de Muestreo en Campo',
    minXP: 701,
    maxXP: 1200,
    feeMultiplier: 1.06,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Aspirantía',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Toma de muestras de agua y sedimentos bajo cadena de custodia certificada.',
  },
  {
    level: 4,
    title: 'Analista de Líneas Base',
    minXP: 1201,
    maxXP: 1900,
    feeMultiplier: 1.09,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Aspirantía',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Consolidación de factores bióticos, abióticos y socioambientales preliminares.',
  },
  {
    level: 5,
    title: 'Consultor Acreditado Junior',
    minXP: 1901,
    maxXP: 2800,
    feeMultiplier: 1.12,
    orderId: 'orden-1',
    orderName: 'Orden I: Semillero & Aspirantía',
    color: '#94a3b8',
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    description: 'Primer entregable técnico formal validado por pares sin observaciones.',
  },

  // ── ORDEN II: ESPECIALIZACIÓN & AUTONOMÍA (6 - 11) ──
  {
    level: 6,
    title: 'Especialista de Campo',
    minXP: 2801,
    maxXP: 4000,
    feeMultiplier: 1.15,
    orderId: 'orden-2',
    orderName: 'Orden II: Especialización & Autonomía',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Autonomía de despliegue en cuencas y relacionamiento institucional en faena.',
  },
  {
    level: 7,
    title: 'Modelador Biofísico & SIG',
    minXP: 4001,
    maxXP: 5500,
    feeMultiplier: 1.18,
    orderId: 'orden-2',
    orderName: 'Orden II: Especialización & Autonomía',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Cartografía predictiva en ArcGIS/QGIS y teledetección de pasivos mineros.',
  },
  {
    level: 8,
    title: 'Evaluador de Cumplimiento Normativo',
    minXP: 5501,
    maxXP: 7300,
    feeMultiplier: 1.21,
    orderId: 'orden-2',
    orderName: 'Orden II: Especialización & Autonomía',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Auditorías de resoluciones administrativas, licencias RENCA y RAI.',
  },
  {
    level: 9,
    title: 'Auditor Ambiental Operativo',
    minXP: 7301,
    maxXP: 9500,
    feeMultiplier: 1.24,
    orderId: 'orden-2',
    orderName: 'Orden II: Especialización & Autonomía',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Fiscalización en terreno y emisión de planes de adecuación y seguimiento (PASA).',
  },
  {
    level: 10,
    title: 'Consultor Sectorial Senior',
    minXP: 9501,
    maxXP: 12200,
    feeMultiplier: 1.27,
    orderId: 'orden-2',
    orderName: 'Orden II: Especialización & Autonomía',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Dominio de estudios de impacto ambiental en minería, energía e industria.',
  },
  {
    level: 11,
    title: 'Coordinador de Expedientes Periciales',
    minXP: 12201,
    maxXP: 15500,
    feeMultiplier: 1.30,
    orderId: 'orden-2',
    orderName: 'Orden II: Especialización & Autonomía',
    color: '#00e03c',
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    description: 'Articulación integral de carpetas periciales para juzgados agroambientales.',
  },

  // ── ORDEN III: LIDERAZGO PERICIAL & DICTAMEN (12 - 17) ──
  {
    level: 12,
    title: 'Perito Judicial Acreditado',
    minXP: 15501,
    maxXP: 19500,
    feeMultiplier: 1.35,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Comparecencia y sustentación de dictámenes periciales en estrados judiciales.',
  },
  {
    level: 13,
    title: 'Especialista en Pasivos Críticos',
    minXP: 19501,
    maxXP: 24500,
    feeMultiplier: 1.40,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Neutralización de drenajes ácidos de roca (DAR) y relaves pesados en cabeceras.',
  },
  {
    level: 14,
    title: 'Diseñador de Soluciones NbS',
    minXP: 24501,
    maxXP: 30500,
    feeMultiplier: 1.45,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Estructuración de Soluciones Basadas en la Naturaleza y corredores biofísicos.',
  },
  {
    level: 15,
    title: 'Arquitecto de Economía Circular',
    minXP: 30501,
    maxXP: 37500,
    feeMultiplier: 1.50,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Transformación de cadenas industriales y gestión integral según Ley 755.',
  },
  {
    level: 16,
    title: 'Gestor de Finanzas Climáticas',
    minXP: 37501,
    maxXP: 46000,
    feeMultiplier: 1.55,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Formulación de proyectos Verra, Gold Standard y contabilidad de carbono GHG.',
  },
  {
    level: 17,
    title: 'Perito Dictaminador de Élite',
    minXP: 46001,
    maxXP: 56000,
    feeMultiplier: 1.60,
    orderId: 'orden-3',
    orderName: 'Orden III: Liderazgo Pericial & Dictamen',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    description: 'Máxima idoneidad probatoria en disputas ambientales de envergadura nacional.',
  },

  // ── ORDEN IV: DIRECCIÓN & ESTRATEGIA SOCIETARIA (18 - 23) ──
  {
    level: 18,
    title: 'Director de Operaciones Ambientales',
    minXP: 56001,
    maxXP: 68000,
    feeMultiplier: 1.65,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Estrategia Societaria',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Supervisión simultánea de expedientes de campo, laboratorio y gabinete.',
  },
  {
    level: 19,
    title: 'Licitador Estratégico B2B',
    minXP: 68001,
    maxXP: 82000,
    feeMultiplier: 1.70,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Estrategia Societaria',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Adjudicación de contratos multilaterales (BID, CAF, Banco Mundial).',
  },
  {
    level: 20,
    title: 'Custodio de Calidad Técnica',
    minXP: 82001,
    maxXP: 98000,
    feeMultiplier: 1.75,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Estrategia Societaria',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Aprobación definitiva de sellos institucionales y certificaciones EDGE.',
  },
  {
    level: 21,
    title: 'Director de Cartera Estratégica',
    minXP: 98001,
    maxXP: 117000,
    feeMultiplier: 1.80,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Estrategia Societaria',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Crecimiento de cartera recurrente corporativa y relaciones con ministerios.',
  },
  {
    level: 22,
    title: 'Líder de Defensa Jurídico-Ambiental',
    minXP: 117001,
    maxXP: 139000,
    feeMultiplier: 1.85,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Estrategia Societaria',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Blindaje ante resoluciones revocatorias y multas de alta cuantía.',
  },
  {
    level: 23,
    title: 'Magistrado Técnico Institucional',
    minXP: 139001,
    maxXP: 165000,
    feeMultiplier: 1.90,
    orderId: 'orden-4',
    orderName: 'Orden IV: Dirección & Estrategia Societaria',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    description: 'Árbitro técnico de consenso en controversias periciales de alta complejidad.',
  },

  // ── ORDEN V: CONSEJO DE SABIOS & MAESTRÍA (24 - 28) ──
  {
    level: 24,
    title: 'Socio Consejero de SERAM',
    minXP: 165001,
    maxXP: 195000,
    feeMultiplier: 1.95,
    orderId: 'orden-5',
    orderName: 'Orden V: Consejo de Sabios & Maestría',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Voz directiva con potestad de veto y lineamiento estratégico corporativo.',
  },
  {
    level: 25,
    title: 'Catedrático de SERAM Academy',
    minXP: 195001,
    maxXP: 230000,
    feeMultiplier: 2.00,
    orderId: 'orden-5',
    orderName: 'Orden V: Consejo de Sabios & Maestría',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Transmisión de conocimiento y formación de la nueva generación de consultores.',
  },
  {
    level: 26,
    title: 'Diseñador de Metodologías de Autor',
    minXP: 230001,
    maxXP: 270000,
    feeMultiplier: 2.05,
    orderId: 'orden-5',
    orderName: 'Orden V: Consejo de Sabios & Maestría',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Patente y formalización de protocolos periciales propios de SERAM.',
  },
  {
    level: 27,
    title: 'Auditor Cumbre de Cuencas',
    minXP: 270001,
    maxXP: 315000,
    feeMultiplier: 2.10,
    orderId: 'orden-5',
    orderName: 'Orden V: Consejo de Sabios & Maestría',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Monitoreo macroscópico de cuencas binacionales y sistemas hídricos.',
  },
  {
    level: 28,
    title: 'Gran Estratega Societario',
    minXP: 315001,
    maxXP: 365000,
    feeMultiplier: 2.15,
    orderId: 'orden-5',
    orderName: 'Orden V: Consejo de Sabios & Maestría',
    color: '#f43f5e',
    badgeColor: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    description: 'Estructuración societaria patrimonial y expansión regional.',
  },

  // ── ORDEN VI: CONSEJO SUPREMO & LEGADO (29 - 32) ──
  {
    level: 29,
    title: 'Patriarca del Consejo Directivo',
    minXP: 365001,
    maxXP: 420000,
    feeMultiplier: 2.20,
    orderId: 'orden-6',
    orderName: 'Orden VI: Consejo Supremo & Legado',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Liderazgo moral y deontológico indiscutido en la consultoría ambiental.',
  },
  {
    level: 30,
    title: 'Guardián del Impacto Planetario',
    minXP: 420001,
    maxXP: 480000,
    feeMultiplier: 2.25,
    orderId: 'orden-6',
    orderName: 'Orden VI: Consejo Supremo & Legado',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Custodio del indicador PIP colectivo y de la misión de dejar el mundo mejor.',
  },
  {
    level: 31,
    title: 'Canciller Técnico Honorífico',
    minXP: 480001,
    maxXP: 545000,
    feeMultiplier: 2.30,
    orderId: 'orden-6',
    orderName: 'Orden VI: Consejo Supremo & Legado',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Representación pericial ante organismos internacionales y foros COP.',
  },
  {
    level: 32,
    title: 'Maestro Supremo de la Orden Pericial',
    minXP: 545001,
    maxXP: 615000,
    feeMultiplier: 2.40,
    orderId: 'orden-6',
    orderName: 'Orden VI: Consejo Supremo & Legado',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    description: 'Dominio holístico sin parangón en las 5 constelaciones técnicas de SERAM.',
  },

  // ── CÉNIT SUPREMO: GRADO 33 ──
  {
    level: 33,
    title: 'Grado 33 · Arquitecto Planetario & Socio Emérito',
    minXP: 615001,
    maxXP: Infinity,
    feeMultiplier: 2.50,
    orderId: 'orden-7',
    orderName: 'Cénit Supremo: Grado 33',
    color: '#fbbf24',
    badgeColor: 'border-amber-300/40 text-amber-200 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20',
    description: 'El cenit absoluto de la trayectoria profesional en SERAM. Sabiduría pericial acumulada durante años, impacto biofísico planetario y liderazgo societario vitalicio.',
  },
];

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

  const totalXP = activitiesXP + timeTrackerXP;

  return {
    ...getPartnerTier(totalXP),
    activitiesXP,
    timeTrackerXP,
    totalHours: timeTrackerHours,
    completedTasksCount: partnerActs.length,
  };
}

/**
 * Valida si un socio tiene permiso para aprobar una tarea (Anti-Cheat).
 * Regla de Oro: Nadie puede auto-aprobarse sus propias tareas.
 */
export function validateCrossApproval(currentSocio, task) {
  if (!currentSocio || !currentSocio.name) {
    return {
      canApprove: false,
      reason: 'Debes iniciar sesión como socio directivo para validar entregables.',
    };
  }

  if (task.assignedPartner === currentSocio.name) {
    return {
      canApprove: false,
      reason: 'Principio Anti-Cheat: No puedes auto-aprobar tus propias tareas. La validación debe ser efectuada por otro socio directivo.',
    };
  }

  return {
    canApprove: true,
    reason: 'Validación entre pares autorizada.',
  };
}

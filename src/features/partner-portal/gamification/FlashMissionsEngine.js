/**
 * FlashMissionsEngine.js — Motor de Misiones Flash & Contingencias Ambientales en Tiempo Real
 * Octalysis Core Drive 6 (Scarcity & Impatience) & Core Drive 7 (Unpredictability & Curiosity)
 */

export const FLASH_CONTINGENCY_TEMPLATES = [
  {
    title: 'Alerta Flash 72h: Decreto de Pasivos Mineros Críticos',
    desc: 'Emitir minuta técnica institucional y dictamen preliminar pericial ante la nueva resolución ministerial sobre drenaje ácido de roca antes de vencer el plazo legal.',
    durationHours: 72,
    chestTier: 'green',
    streakBonus: '+25% XP Flash · Multiplicador 1.15x 24h',
    basePIP: 150,
    requiredRole: 'EIA / Legal Ambiental',
    context: 'Normativa & Decretos Supremos',
    defaultAssigned: ['Ing. Fernando Araujo', 'Ing. Diego Barrientos'],
  },
  {
    title: 'Licitación Express SICOES 72h: Auditoría de Cuenca Pilcomayo',
    desc: 'Publicación de emergencia en el SICOES para peritaje de aguas transfronterizas. Estructurar propuesta técnica, cronograma y acreditación de instrumental en 72 horas.',
    durationHours: 72,
    chestTier: 'green',
    streakBonus: '+30% XP Flash · Prioridad en Licitación',
    basePIP: 200,
    context: 'Licitaciones Públicas del Estado',
    requiredRole: 'Hidrología & SIG',
    defaultAssigned: ['Ing. Diego Barrientos'],
  },
  {
    title: 'Cisne Negro Hidrológico 96h: Turbidez & Alerta de Relaves',
    desc: 'Imágenes Sentinel-2 detectan anomalía espectral de relaves aguas abajo de faena minera. Realizar modelación de dispersión de sedimentos antes de la crecida estacional.',
    durationHours: 96,
    chestTier: 'green',
    streakBonus: '+35% XP Flash · +250 PIP Colectivo',
    basePIP: 250,
    context: 'Monitoreo Satelital de Emergencia',
    requiredRole: 'Teledetección & Geomática',
    defaultAssigned: ['Ing. Diego Barrientos', 'Consultor Perito Asociado'],
  },
  {
    title: 'Fiscalización Sorpresa AAC 48h: Adecuación de Plan PASA',
    desc: 'Notificación de inspección ambiental in situ por la Autoridad Ambiental Competente. Elaborar descargo pericial y subsanación de observaciones técnicas en 48 horas.',
    durationHours: 48,
    chestTier: 'green',
    streakBonus: '+20% XP Flash · Inmunidad Administrativa',
    basePIP: 180,
    context: 'Defensa Jurídico-Ambiental',
    requiredRole: 'Compliance & Legal',
    defaultAssigned: ['Lic. Fernando Araujo'],
  },
  {
    title: 'Oportunidad Bilateral 72h: Créditos de Biodiversidad en Amazonía',
    desc: 'Fondo multilateral abre ventanilla corta de financiamiento no reembolsable para Soluciones Basadas en la Naturaleza. Redactar Nota Conceptual de 5 páginas con SIG.',
    durationHours: 72,
    chestTier: 'green',
    streakBonus: '+30% XP Flash · Acceso a Fondos Verdes',
    basePIP: 220,
    context: 'Finanzas de la Conservación & NbS',
    requiredRole: 'Biodiversidad & Carbono',
    defaultAssigned: ['Ing. Diego Barrientos', 'Lic. Fernando Araujo'],
  },
];

/**
 * Calcula el tiempo restante y estado de urgencia a partir del timestamp de expiración.
 *
 * @param {string|number|Date} expiresAt - Timestamp o fecha ISO límite
 * @param {number} [totalDurationHours=72] - Duración original de la misión para calcular barra de avance
 * @returns {Object} Desglose completo del temporizador regresivo
 */
export function calculateTimeRemaining(expiresAt, totalDurationHours = 72) {
  if (!expiresAt) {
    return {
      diffMs: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedTime: '00:00:00',
      isExpired: false,
      isCritical: false,
      isUrgent: false,
      progressPercent: 100,
      urgencyLevel: 'normal',
    };
  }

  const target = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      diffMs: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedTime: '00:00:00',
      isExpired: true,
      isCritical: true,
      isUrgent: true,
      progressPercent: 0,
      urgencyLevel: 'expired',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Cálculo del porcentaje de tiempo restante respecto a la duración original
  const totalDurationMs = totalDurationHours * 3600 * 1000;
  const progressPercent = Math.min(100, Math.max(0, Math.round((diffMs / totalDurationMs) * 100)));

  // Niveles de urgencia (Octalysis CD6 Scarcity)
  // - Critical: menos de 24 horas (rojo parpadeante)
  // - Urgent: entre 24 y 48 horas (ámbar)
  // - Normal: más de 48 horas (verde)
  const isCritical = hours < 24;
  const isUrgent = hours < 48;
  const urgencyLevel = isCritical ? 'critical' : isUrgent ? 'urgent' : 'normal';

  return {
    diffMs,
    hours,
    minutes,
    seconds,
    formattedTime,
    isExpired: false,
    isCritical,
    isUrgent,
    progressPercent,
    urgencyLevel,
  };
}

/**
 * Genera una nueva misión flash dinámica con temporizador reactivo.
 *
 * @param {number|null} [templateIndex=null] - Índice específico o aleatorio
 * @param {string} [assignedPartnerName=null] - Socio al que se asigna o consorcio
 * @returns {Object} Misión flash completa para el estado de React
 */
export function generateFlashMission(templateIndex = null, assignedPartnerName = null) {
  const index = templateIndex !== null && templateIndex >= 0 && templateIndex < FLASH_CONTINGENCY_TEMPLATES.length
    ? templateIndex
    : Math.floor(Math.random() * FLASH_CONTINGENCY_TEMPLATES.length);

  const tpl = FLASH_CONTINGENCY_TEMPLATES[index];
  const now = Date.now();
  const expiresAt = new Date(now + tpl.durationHours * 3600 * 1000).toISOString();

  return {
    id: `flash_${now}_${Math.random().toString(36).substring(2, 7)}`,
    type: 'flash',
    title: tpl.title,
    desc: tpl.desc,
    context: tpl.context,
    assignedPartners: assignedPartnerName ? [assignedPartnerName] : tpl.defaultAssigned,
    chestTier: tpl.chestTier,
    createdAt: new Date(now).toISOString(),
    expiresAt,
    totalDurationHours: tpl.durationHours,
    status: 'in_progress', // 'in_progress' | 'ready_to_open' | 'claimed' | 'expired'
    progress: 0,
    streakBonus: tpl.streakBonus,
    basePIP: tpl.basePIP,
    requiredRole: tpl.requiredRole,
  };
}

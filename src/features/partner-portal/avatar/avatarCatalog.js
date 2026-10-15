// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE AVATARES 2.5D DE SOCIOS SERAM (Neuform)
// Opciones cerradas, paletas de marca, reglas de desbloqueo y normalización
// retrocompatible con el `skin` legacy (vest | field | suit).
// ─────────────────────────────────────────────────────────────────────────────

export const AVATAR_SCHEMA_VERSION = 1;

/** Atuendos que existían antes del personalizador (campo `skin` legacy). */
export const LEGACY_SKINS = ['vest', 'field', 'suit'];

export const PARTNER_EMAILS = [
  'barrientoso2401@gmail.com',
  'fernandoaraujo1912@gmail.com',
  'sebastiansbs51@gmail.com'
];

// ── PALETAS CERRADAS ─────────────────────────────────────────────────────────

/** Tonos de piel. `classic` replica el sprite original de la oficina (cabeza ámbar, manos rosadas). */
export const SKIN_TONES = [
  { id: 'classic', name: 'Clásico SERAM', head: '#fcd34d', hands: '#fbcfe8' },
  { id: 'tone1', name: 'Porcelana', head: '#f9dcc4', hands: '#f9dcc4' },
  { id: 'tone2', name: 'Claro', head: '#f1c27d', hands: '#f1c27d' },
  { id: 'tone3', name: 'Trigueño', head: '#e0ac69', hands: '#e0ac69' },
  { id: 'tone4', name: 'Canela', head: '#c68642', hands: '#c68642' },
  { id: 'tone5', name: 'Ébano', head: '#8d5524', hands: '#8d5524' }
];

export const HAIR_COLORS = [
  { id: '#2b1d0c', name: 'Castaño oscuro' },
  { id: '#1a1a1a', name: 'Negro' },
  { id: '#3d2b1f', name: 'Chocolate' },
  { id: '#5a3825', name: 'Castaño' },
  { id: '#8b5a2b', name: 'Avellana' },
  { id: '#c9a46c', name: 'Rubio arena' },
  { id: '#9ca3af', name: 'Canoso' },
  { id: '#7c2d12', name: 'Cobrizo' }
];

/** Colores de prenda dentro de la paleta Neuform (oscuros, sobrios). */
export const OUTFIT_COLORS = [
  { id: 'navy', name: 'Azul marino', hex: '#0f172a', shade: '#020617' },
  { id: 'slate', name: 'Pizarra', hex: '#334155', shade: '#1e293b' },
  { id: 'emerald', name: 'Verde SERAM', hex: '#126c0f', shade: '#0b4a09' },
  { id: 'graphite', name: 'Grafito', hex: '#1f2937', shade: '#111827' }
];

/** Ribetes. Algunos se desbloquean por nivel (ver UNLOCK_RULES). */
export const TRIM_COLORS = [
  { id: 'gold', name: 'Dorado institucional', hex: '#c9a84c' },
  { id: 'green', name: 'Verde vívido', hex: '#029907' },
  { id: 'silver', name: 'Plateado', hex: '#cbd5e1' },
  { id: 'goldBright', name: 'Dorado brillante', hex: '#fcd775', glow: true }
];

// ── OPCIONES DE FORMA ────────────────────────────────────────────────────────

export const HAIR_STYLES = [
  { id: 'short', name: 'Corto' },
  { id: 'side', name: 'Raya al lado' },
  { id: 'curly', name: 'Rizado' },
  { id: 'long', name: 'Largo' },
  { id: 'ponytail', name: 'Coleta' },
  { id: 'bald', name: 'Rapado' }
];

export const FACIAL_HAIR = [
  { id: 'none', name: 'Sin vello' },
  { id: 'mustache', name: 'Bigote' },
  { id: 'beard', name: 'Barba' }
];

export const OUTFITS = [
  { id: 'vest', name: 'Chaleco SERAM', desc: 'Azul marino con ribetes dorados y logotipo oficial' },
  { id: 'field', name: 'Táctico de campo', desc: 'Chaleco reflectivo, bolsillos y botas de montaña' },
  { id: 'suit', name: 'Traje ejecutivo', desc: 'Corte formal para asambleas y reuniones institucionales' },
  { id: 'polo', name: 'Polo corporativo', desc: 'Casual de gabinete con cuello en color de ribete' },
  { id: 'lab', name: 'Bata de laboratorio', desc: 'Bata técnica para el Laboratorio de Mercurio' }
];

export const HEADWEAR = [
  { id: 'none', name: 'Sin casco' },
  { id: 'cap', name: 'Gorra SERAM' },
  { id: 'hardhat', name: 'Casco de campo' },
  { id: 'expedition', name: 'Sombrero expedición' }
];

export const ACCESSORIES = [
  { id: 'none', name: 'Ninguno' },
  { id: 'glasses', name: 'Lentes' },
  { id: 'clipboard', name: 'Portapapeles' },
  { id: 'tablet', name: 'Tablet SIG' },
  { id: 'gps', name: 'GPS de campo' }
];

export const EQUIPMENTS = [
  { id: 'none', name: 'Ninguno' },
  { id: 'lanyard', name: 'Credencial SERAM' },
  { id: 'tablet', name: 'Tablet de campo' },
  { id: 'clipboard', name: 'Portapapeles' },
  { id: 'gps', name: 'GPS geodésico' },
  { id: 'radio', name: 'Radio VHF' },
  { id: 'briefcase', name: 'Portafolio ejecutivo' }
];

export const AURAS = [
  { id: 'none', name: 'Sin aura' },
  { id: 'gold', name: 'Aura Dorada SERAM', color: '#c9a84c' },
  { id: 'emerald', name: 'Resonancia Esmeralda', color: '#029907' },
  { id: 'cyan', name: 'Claridad Tecnológica', color: '#06b6d4' },
  { id: 'goldBright', name: 'Maestría Dorada', color: '#fcd775' }
];

/** Mapa campo → lista de opciones válidas (para validar y para el editor). */
export const AVATAR_FIELDS = {
  skinTone: SKIN_TONES,
  hairStyle: HAIR_STYLES,
  hairColor: HAIR_COLORS,
  facialHair: FACIAL_HAIR,
  outfit: OUTFITS,
  outfitColor: OUTFIT_COLORS,
  trim: TRIM_COLORS,
  headwear: HEADWEAR,
  accessory: ACCESSORIES,
  equipment: EQUIPMENTS,
  aura: AURAS
};

// ── REGLAS DE DESBLOQUEO (Octalysis CD2 Maestría + CD4 Propiedad) ────────────
// Formato: { [campo]: { [opción]: { level?: number, fieldMissions?: number } } }
// Si se definen ambos, basta con cumplir UNO de los dos requisitos.
export const UNLOCK_RULES = {
  trim: {
    silver: { level: 10 },
    goldBright: { level: 20 }
  },
  outfit: {
    polo: { level: 3 },
    lab: { level: 5 }
  },
  headwear: {
    cap: { level: 2 },
    hardhat: { level: 4, fieldMissions: 1 },
    expedition: { level: 8, fieldMissions: 2 }
  },
  accessory: {
    clipboard: { level: 3 },
    gps: { level: 6, fieldMissions: 1 },
    tablet: { level: 8 }
  }
};

// ── VALORES POR DEFECTO ──────────────────────────────────────────────────────

export const BASE_AVATAR_CONFIG = {
  v: AVATAR_SCHEMA_VERSION,
  skinTone: 'classic',
  hairStyle: 'short',
  hairColor: '#2b1d0c',
  facialHair: 'none',
  outfit: 'vest',
  outfitColor: 'navy',
  trim: 'gold',
  headwear: 'none',
  accessory: 'none',
  equipment: 'none',
  aura: 'none'
};

/** Defaults por socio: salen del `hairColor` de la oficina y del `skin` del perfil. */
export const DEFAULT_AVATAR_CONFIGS = {
  'barrientoso2401@gmail.com': {
    ...BASE_AVATAR_CONFIG,
    hairColor: '#2b1d0c',
    outfit: 'vest',
    outfitColor: 'navy'
  },
  'fernandoaraujo1912@gmail.com': {
    ...BASE_AVATAR_CONFIG,
    hairStyle: 'side',
    hairColor: '#1a1a1a',
    outfit: 'suit',
    outfitColor: 'graphite'
  },
  'sebastiansbs51@gmail.com': {
    ...BASE_AVATAR_CONFIG,
    hairColor: '#3d2b1f',
    outfit: 'field',
    outfitColor: 'emerald'
  }
};

/** Color de prenda sugerido al elegir un atuendo legacy sin color explícito. */
const LEGACY_OUTFIT_COLOR = { vest: 'navy', suit: 'graphite', field: 'emerald' };

export function getDefaultAvatarConfig(email) {
  const key = (email || '').toLowerCase();
  return { ...(DEFAULT_AVATAR_CONFIGS[key] || BASE_AVATAR_CONFIG) };
}

const isValidOption = (field, value) =>
  Array.isArray(AVATAR_FIELDS[field]) && AVATAR_FIELDS[field].some(o => o.id === value);

/**
 * Devuelve SIEMPRE una configuración completa y válida.
 * @param {object|null} raw  avatarConfig guardado (puede ser parcial o inválido)
 * @param {object} opts      { email, skin (legacy), hairColor (legacy) }
 */
export function normalizeAvatarConfig(raw, opts = {}) {
  const { email, skin, hairColor } = opts || {};
  const base = getDefaultAvatarConfig(email);

  // 1. Retrocompatibilidad: `skin` legacy → outfit
  if (skin && LEGACY_SKINS.includes(skin)) {
    if (skin !== base.outfit) base.outfitColor = LEGACY_OUTFIT_COLOR[skin] || base.outfitColor;
    base.outfit = skin;
  }
  // 2. hairColor legacy (definido en la oficina)
  if (hairColor && isValidOption('hairColor', hairColor)) base.hairColor = hairColor;

  // 3. Mapeo de alias semánticos de estilo / atuendo
  const source = raw && typeof raw === 'object' ? { ...raw } : {};
  if (source.outfit === 'casual') source.outfit = 'polo';
  if (source.hairStyle === 'classic') source.hairStyle = 'short';
  if (source.hairStyle === 'fade' || source.hairStyle === 'slick') source.hairStyle = 'side';
  if (source.hairStyle === 'wavy') source.hairStyle = 'curly';
  if (source.hairStyle === 'field_cap') {
    source.hairStyle = 'short';
    if (!source.headwear || source.headwear === 'none') source.headwear = 'cap';
  }

  // 4. Campos explícitos válidos del avatarConfig guardado
  Object.keys(AVATAR_FIELDS).forEach(field => {
    if (source[field] !== undefined && isValidOption(field, source[field])) {
      base[field] = source[field];
    }
  });

  base.v = AVATAR_SCHEMA_VERSION;
  return base;
}

/** Versión compacta para el payload de presencia (solo campos del esquema). */
export function compactAvatarConfig(config) {
  if (!config || typeof config !== 'object') return null;
  const out = { v: AVATAR_SCHEMA_VERSION };
  Object.keys(AVATAR_FIELDS).forEach(field => {
    if (config[field] !== undefined) out[field] = config[field];
  });
  return out;
}

/** `skin` legacy equivalente (para no romper consumidores antiguos). */
export function legacySkinFromConfig(config, fallback = 'vest') {
  return config && LEGACY_SKINS.includes(config.outfit) ? config.outfit : fallback;
}

export function areAvatarConfigsEqual(a, b) {
  if (!a || !b) return a === b;
  return Object.keys(AVATAR_FIELDS).every(field => a[field] === b[field]);
}

// ── RESOLUCIÓN DE PALETAS ────────────────────────────────────────────────────

const findById = (list, id, fallbackIdx = 0) => list.find(o => o.id === id) || list[fallbackIdx];

export function resolveAvatarPalette(config) {
  const c = normalizeAvatarConfig(config);
  const skin = findById(SKIN_TONES, c.skinTone);
  const outfitColor = findById(OUTFIT_COLORS, c.outfitColor);
  const trim = findById(TRIM_COLORS, c.trim);
  return {
    config: c,
    skinHead: skin.head,
    skinHands: skin.hands,
    hair: c.hairColor,
    outfit: outfitColor.hex,
    outfitShade: outfitColor.shade,
    trim: trim.hex,
    trimGlow: Boolean(trim.glow)
  };
}

// ── PROGRESO Y DESBLOQUEOS ───────────────────────────────────────────────────

const FIELD_ACTIVITY_PATTERN = /campo|muestreo|expedici|monitoreo in-situ/i;

/** Nº de actividades de campo concluidas/aprobadas del socio (misiones de campo). */
export function countFieldMissions(partnerName, activities = []) {
  if (!partnerName) return 0;
  return (activities || []).filter(a =>
    a &&
    a.assignedPartner === partnerName &&
    (a.status === 'Concluido' || a.status === 'Aprobado') &&
    FIELD_ACTIVITY_PATTERN.test(`${a.category || ''} ${a.title || ''}`)
  ).length;
}

export function getUnlockRule(field, optionId) {
  return (UNLOCK_RULES[field] && UNLOCK_RULES[field][optionId]) || null;
}

/** progress = { level, fieldMissions } */
export function isOptionUnlocked(field, optionId, progress = {}) {
  const rule = getUnlockRule(field, optionId);
  if (!rule) return true;
  const level = Number(progress.level) || 0;
  const missions = Number(progress.fieldMissions) || 0;
  const byLevel = rule.level !== undefined && level >= rule.level;
  const byMissions = rule.fieldMissions !== undefined && missions >= rule.fieldMissions;
  return byLevel || byMissions;
}

/** Texto legible de la condición de desbloqueo (p.ej. "Nivel 5 o 1 misión de campo"). */
export function getUnlockLabel(field, optionId) {
  const rule = getUnlockRule(field, optionId);
  if (!rule) return '';
  const parts = [];
  if (rule.level !== undefined) parts.push(`Nivel ${rule.level}`);
  if (rule.fieldMissions !== undefined) {
    parts.push(`${rule.fieldMissions} misión${rule.fieldMissions === 1 ? '' : 'es'} de campo`);
  }
  return parts.join(' o ');
}

// ── LECTURA DE PERFILES LEGACY (localStorage) ────────────────────────────────

/** Lee `seram_partner_profiles` y devuelve { email: avatarConfig normalizado }. */
export function loadStoredProfileAvatarConfigs() {
  const result = {};
  let stored = {};
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seram_partner_profiles');
      if (saved) stored = JSON.parse(saved) || {};
    }
  } catch (_) {
    stored = {};
  }
  PARTNER_EMAILS.forEach(email => {
    const profile = stored[email] || {};
    result[email] = normalizeAvatarConfig(profile.avatarConfig, { email, skin: profile.skin });
  });
  return result;
}

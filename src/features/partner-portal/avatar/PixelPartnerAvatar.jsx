import React, { useId, useMemo } from 'react';
import {
  normalizeAvatarConfig,
  resolveAvatarPalette,
  SKIN_TONES
} from './avatarCatalog';

// ─────────────────────────────────────────────────────────────────────────────
// RENDERIZADOR PIXEL-ART HD MULTICAPA DE SOCIOS SERAM (`PixelPartnerAvatar`)
// Estética pixel-art 32×44 con soporte 4-way (`down`, `up`, `left`, `right`),
// ciclo real de caminata, postura de sentado para sillas y micro-tecleo activo.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_W = 32;
const VIEW_H = 44;

/** Ajusta el brillo de un color hexadecimal en porcentaje (-100 a +100). */
function adjustHex(hex, percent) {
  if (!hex || typeof hex !== 'string' || hex[0] !== '#') return hex;
  const raw = hex.slice(1);
  const full = raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return hex;

  const delta = Math.round(255 * (percent / 100));
  const r = Math.min(255, Math.max(0, (num >> 16) + delta));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + delta));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + delta));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/** Obtiene sombras y brillos armónicos para cualquier tono de piel. */
function getSkinTones(skinToneId, baseColor) {
  const map = {
    classic: { base: '#fcd34d', shadow: '#d97706', highlight: '#fef08a' },
    tone1: { base: '#f9dcc4', shadow: '#e2b294', highlight: '#ffffff' },
    tone2: { base: '#f1c27d', shadow: '#cf984a', highlight: '#fcead2' },
    tone3: { base: '#e0ac69', shadow: '#b8803a', highlight: '#f5d5aa' },
    tone4: { base: '#c68642', shadow: '#9a5a1b', highlight: '#dfaa6f' },
    tone5: { base: '#8d5524', shadow: '#5e320d', highlight: '#b07542' }
  };
  if (map[skinToneId]) return map[skinToneId];
  return {
    base: baseColor,
    shadow: adjustHex(baseColor, -24),
    highlight: adjustHex(baseColor, 18)
  };
}

// ── SUBCOMPONENTES MODULARES PIXEL-ART ────────────────────────────────────────

function PixelShadow({ isSitting, isOnline }) {
  const fill = isOnline ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.18)';
  return (
    <g className="pixel-shadow" fill={fill}>
      {isSitting ? (
        // Sombra de postura sentado: más compacta bajo la silla
        <>
          <rect x="9" y="40" width="14" height="1" rx="0.5" />
          <rect x="10" y="41" width="12" height="1" rx="0.5" />
          <rect x="12" y="42" width="8" height="1" rx="0.5" />
        </>
      ) : (
        // Sombra elíptica de postura de pie / marcha
        <>
          <rect x="8" y="39" width="16" height="1" rx="0.5" />
          <rect x="7" y="40" width="18" height="1" rx="0.5" />
          <rect x="9" y="41" width="14" height="1" rx="0.5" />
          <rect x="12" y="42" width="8" height="1" rx="0.5" />
        </>
      )}
    </g>
  );
}

function PixelAura({ auraColor }) {
  if (!auraColor) return null;
  return (
    <g className="pixel-aura-pulse" opacity="0.45">
      <ellipse cx="16" cy="40" rx="14" ry="4" fill="none" stroke={auraColor} strokeWidth="1.2" strokeDasharray="3 2" />
      <circle cx="6" cy="22" r="1" fill={auraColor} opacity="0.8" />
      <circle cx="26" cy="18" r="1" fill={auraColor} opacity="0.8" />
      <circle cx="8" cy="34" r="0.8" fill={auraColor} opacity="0.7" />
      <circle cx="24" cy="30" r="0.8" fill={auraColor} opacity="0.7" />
    </g>
  );
}

/** Renderizado de piernas y calzado adaptativo (sentado, caminando 4-way, o reposo). */
function PixelLegs({ facing, isSitting, isWalking, outfit, outfitShade }) {
  // Paleta de pantalones y calzado según atuendo
  const pants = outfit === 'field' ? '#44403c' : outfit === 'suit' ? '#111827' : '#1e293b';
  const pantsShadow = adjustHex(pants, -22);
  const shoes = outfit === 'field' ? '#3d2210' : '#0a0d14';
  const shoesToe = outfit === 'field' ? '#1c1917' : adjustHex(shoes, 25);
  const sole = '#020617';

  // 1. POSTURA DE SENTADO (PIERNAS FLEXIONADAS EN SILLA)
  if (isSitting) {
    if (facing === 'down') {
      return (
        <g className="pixel-legs-sitting-down">
          {/* Muslos horizontales sobre el cojín de la silla */}
          <rect x="10" y="29" width="12" height="4" fill={pants} />
          <rect x="10" y="32" width="12" height="1" fill={pantsShadow} />
          {/* Espacio entre rodillas */}
          <rect x="15" y="29" width="2" height="4" fill={pantsShadow} />
          {/* Piernas / Pantorrillas verticales que bajan al piso */}
          <rect x="11" y="33" width="4" height="5" fill={pants} />
          <rect x="17" y="33" width="4" height="5" fill={pants} />
          <rect x="11" y="34" width="1" height="4" fill={pantsShadow} />
          {/* Zapatos descansando en el piso */}
          <rect x="10" y="38" width="5" height="2" fill={shoes} />
          <rect x="17" y="38" width="5" height="2" fill={shoes} />
          <rect x="10" y="39" width="1" height="1" fill={shoesToe} />
          <rect x="21" y="39" width="1" height="1" fill={shoesToe} />
          <rect x="10" y="40" width="5" height="1" fill={sole} />
          <rect x="17" y="40" width="5" height="1" fill={sole} />
        </g>
      );
    }
    if (facing === 'up') {
      return (
        <g className="pixel-legs-sitting-up">
          {/* Parte trasera de la pelvis y piernas hacia el escritorio */}
          <rect x="10" y="28" width="12" height="5" fill={pants} />
          <rect x="11" y="33" width="4" height="5" fill={pantsShadow} />
          <rect x="17" y="33" width="4" height="5" fill={pantsShadow} />
          <rect x="11" y="38" width="4" height="2" fill={shoes} />
          <rect x="17" y="38" width="4" height="2" fill={shoes} />
        </g>
      );
    }
    // Perfil sentado (left / right)
    return (
      <g className="pixel-legs-sitting-profile">
        {/* Muslo horizontal que proyecta hacia la mesa */}
        <rect x="8" y="29" width="10" height="4" fill={pants} />
        <rect x="8" y="32" width="10" height="1" fill={pantsShadow} />
        {/* Pantorrilla vertical */}
        <rect x="8" y="33" width="4" height="5" fill={pants} />
        <rect x="11" y="33" width="1" height="5" fill={pantsShadow} />
        {/* Zapato de perfil */}
        <rect x="6" y="38" width="6" height="2" fill={shoes} />
        <rect x="6" y="38" width="2" height="2" fill={shoesToe} />
        <rect x="6" y="40" width="6" height="1" fill={sole} />
      </g>
    );
  }

  // 2. CICLO DE CAMINATA / ZANCADA O REPOSO EN PIE
  if (facing === 'left' || facing === 'right') {
    // Vista de perfil
    return (
      <g className={isWalking ? 'pixel-walk-cycle-profile' : ''}>
        <g className={isWalking ? 'pixel-stride-front' : ''}>
          <rect x="10" y="29" width="4" height="9" fill={pants} />
          <rect x="8" y="38" width="6" height="2" fill={shoes} />
          <rect x="8" y="38" width="2" height="2" fill={shoesToe} />
          <rect x="8" y="40" width="6" height="1" fill={sole} />
        </g>
        <g className={isWalking ? 'pixel-stride-back' : ''}>
          <rect x="15" y="29" width="4" height="8" fill={pantsShadow} />
          <rect x="15" y="37" width="5" height="2" fill={shoes} opacity="0.9" />
          <rect x="15" y="39" width="5" height="1" fill={sole} />
        </g>
      </g>
    );
  }

  // Vista frontal ('down') o trasera ('up')
  return (
    <g className="pixel-legs-standing">
      {/* Pierna Izquierda */}
      <g className={isWalking ? 'pixel-walk-step-left' : ''}>
        <rect x="11" y="29" width="4" height="9" fill={pants} />
        <rect x="11" y="29" width="1" height="9" fill={pantsShadow} />
        <rect x="10" y="38" width="5" height="2" fill={shoes} />
        <rect x="10" y="38" width="2" height="1" fill={shoesToe} />
        <rect x="10" y="40" width="5" height="1" fill={sole} />
      </g>

      {/* Pierna Derecha */}
      <g className={isWalking ? 'pixel-walk-step-right' : ''}>
        <rect x="17" y="29" width="4" height="9" fill={pants} />
        <rect x="20" y="29" width="1" height="9" fill={pantsShadow} />
        <rect x="17" y="38" width="5" height="2" fill={shoes} />
        <rect x="20" y="38" width="2" height="1" fill={shoesToe} />
        <rect x="17" y="40" width="5" height="1" fill={sole} />
      </g>
    </g>
  );
}

/** Torso y prendas institucionales altamente detalladas según atuendo y dirección. */
function PixelTorso({ facing, outfit, palette, isSitting }) {
  const { outfit: mainColor, outfitShade, trim: trimColor } = palette;
  const white = '#f8fafc';
  const whiteShadow = '#e2e8f0';

  // 1. ESPALDA ('up')
  if (facing === 'up') {
    return (
      <g className="pixel-torso-up">
        {/* Espalda base */}
        <rect x="9" y="18" width="14" height="10" fill={mainColor} />
        <rect x="9" y="18" width="1" height="10" fill={outfitShade} />
        <rect x="22" y="18" width="1" height="10" fill={outfitShade} />

        {/* Cuello trasero de camisa ejecutiva */}
        <rect x="13" y="16" width="6" height="2" fill={white} />

        {/* Costuras de corte sastre y cinta */}
        <rect x="13" y="19" width="1" height="8" fill={outfitShade} />
        <rect x="18" y="19" width="1" height="8" fill={outfitShade} />

        {outfit === 'vest' && (
          // Cinta posterior de ajuste del chaleco SERAM con hebilla dorada
          <>
            <rect x="12" y="25" width="8" height="1" fill={outfitShade} />
            <rect x="15" y="25" width="2" height="1" fill={trimColor} />
          </>
        )}

        {outfit === 'field' && (
          // Franja horizontal reflectante de seguridad en espalda
          <>
            <rect x="9" y="21" width="14" height="2" fill="#ffffff" />
            <rect x="9" y="22" width="14" height="1" fill="#cbd5e1" />
          </>
        )}
      </g>
    );
  }

  // 2. PERFIL ('left' / 'right')
  if (facing === 'left' || facing === 'right') {
    return (
      <g className="pixel-torso-profile">
        <rect x="11" y="18" width="10" height="10" fill={mainColor} />
        <rect x="11" y="18" width="1" height="10" fill={outfitShade} />
        {/* Cuello de camisa */}
        <rect x="13" y="16" width="4" height="2" fill={white} />

        {outfit === 'vest' && (
          <>
            {/* Ribete dorado en borde de chaleco */}
            <rect x="11" y="19" width="1" height="8" fill={trimColor} />
            <rect x="13" y="21" width="2" height="2" fill={trimColor} />
          </>
        )}

        {outfit === 'field' && (
          <>
            <rect x="11" y="21" width="10" height="2" fill="#ffffff" />
            <rect x="11" y="22" width="10" height="1" fill="#cbd5e1" />
            <rect x="11" y="27" width="10" height="1" fill="#292524" />
          </>
        )}
      </g>
    );
  }

  // 3. FRENTE ('down')
  return (
    <g className="pixel-torso-down">
      {/* ── ATUENDO: CHALECO INSTITUCIONAL SERAM (vest) ── */}
      {outfit === 'vest' && (
        <g>
          {/* Base del chaleco en azul marino profundo */}
          <rect x="9" y="18" width="14" height="10" fill={mainColor} />
          <rect x="9" y="18" width="1" height="10" fill={outfitShade} />
          <rect x="22" y="18" width="1" height="10" fill={outfitShade} />

          {/* Camisa ejecutiva blanca debajo */}
          <rect x="14" y="16" width="4" height="4" fill={white} />
          <rect x="13" y="17" width="1" height="2" fill={whiteShadow} />
          <rect x="18" y="17" width="1" height="2" fill={whiteShadow} />

          {/* V-Neck del chaleco ribeteado en oro institucional */}
          <rect x="13" y="18" width="1" height="3" fill={trimColor} />
          <rect x="18" y="18" width="1" height="3" fill={trimColor} />
          <rect x="14" y="21" width="1" height="1" fill={trimColor} />
          <rect x="17" y="21" width="1" height="1" fill={trimColor} />

          {/* Corbata o abotonadura central */}
          <rect x="15" y="18" width="2" height="3" fill={trimColor} />
          <rect x="15.5" y="22" width="1" height="1" fill={trimColor} />
          <rect x="15.5" y="24" width="1" height="1" fill={trimColor} />
          <rect x="15.5" y="26" width="1" height="1" fill={trimColor} />

          {/* Insignia dorada bordada SERAM en pecho izquierdo */}
          <rect x="11" y="20" width="2" height="2" fill="#ffd700" />
          <rect x="11" y="22" width="2" height="1" fill={trimColor} />

          {/* Bolsillos ribeteados del chaleco */}
          <rect x="11" y="25" width="3" height="1" fill={trimColor} />
          <rect x="18" y="25" width="3" height="1" fill={trimColor} />

          {/* Pico inferior del chaleco sastre */}
          <rect x="14" y="28" width="4" height="1" fill={mainColor} />
          <rect x="15" y="28" width="2" height="1" fill={trimColor} />
        </g>
      )}

      {/* ── ATUENDO: TÁCTICO DE CAMPO / EXPEDICIÓN (field) ── */}
      {outfit === 'field' && (
        <g>
          {/* Base en naranja de alta visibilidad o esmeralda */}
          <rect x="9" y="18" width="14" height="10" fill={mainColor} />
          <rect x="9" y="18" width="1" height="10" fill={outfitShade} />
          <rect x="22" y="18" width="1" height="10" fill={outfitShade} />

          {/* Camiseta térmica interior oscura */}
          <rect x="14" y="16" width="4" height="3" fill="#1e293b" />

          {/* Bandas plateadas reflectantes 3M */}
          <rect x="9" y="21" width="14" height="2" fill="#f8fafc" />
          <rect x="9" y="22" width="14" height="1" fill="#cbd5e1" />
          <rect x="9" y="25" width="14" height="2" fill="#f8fafc" />
          <rect x="9" y="26" width="14" height="1" fill="#cbd5e1" />

          {/* Tirantes verticales reflectantes en hombros */}
          <rect x="12" y="18" width="1" height="3" fill="#f8fafc" />
          <rect x="19" y="18" width="1" height="3" fill="#f8fafc" />

          {/* Clip de radio VHF en hombro izquierdo */}
          <rect x="10" y="18" width="2" height="2" fill="#0f172a" />
          <rect x="10" y="17" width="1" height="1" fill="#38bdf8" />

          {/* Cinturón táctico con hebilla metálica */}
          <rect x="9" y="28" width="14" height="1" fill="#292524" />
          <rect x="15" y="28" width="2" height="1" fill="#e2e8f0" />
        </g>
      )}

      {/* ── ATUENDO: TRAJE EJECUTIVO DE GALA (suit) ── */}
      {outfit === 'suit' && (
        <g>
          {/* Saco negro carbón */}
          <rect x="9" y="18" width="14" height="10" fill={mainColor} />
          <rect x="9" y="18" width="1" height="10" fill={outfitShade} />
          <rect x="22" y="18" width="1" height="10" fill={outfitShade} />

          {/* Camisa formal blanca con cuello alzado */}
          <rect x="14" y="16" width="4" height="5" fill={white} />
          <rect x="13" y="17" width="1" height="2" fill={whiteShadow} />
          <rect x="18" y="17" width="1" height="2" fill={whiteShadow} />

          {/* Corbata de seda institucional */}
          <rect x="15" y="18" width="2" height="6" fill={trimColor} />
          <rect x="15.5" y="24" width="1" height="1" fill={trimColor} />

          {/* Solapas cruzadas del saco */}
          <polygon points="12,18 15,24 14,24 11,18" fill={outfitShade} />
          <polygon points="20,18 17,24 18,24 21,18" fill={outfitShade} />

          {/* Pañuelo blanco de bolsillo de seda */}
          <rect x="11" y="20" width="2" height="1" fill={white} />
          <rect x="15.5" y="25" width="1" height="1" fill="#0f172a" />
        </g>
      )}

      {/* ── ATUENDO: POLO CORPORATIVO / CASUAL REFINADO (polo) ── */}
      {outfit === 'polo' && (
        <g>
          <rect x="9" y="18" width="14" height="10" fill={mainColor} />
          <rect x="9" y="18" width="1" height="10" fill={outfitShade} />
          <rect x="22" y="18" width="1" height="10" fill={outfitShade} />

          {/* Cuello camisero de polo ribeteado */}
          <rect x="13" y="16" width="6" height="2" fill={trimColor} />
          <rect x="15" y="18" width="2" height="4" fill={outfitShade} />
          <rect x="15.5" y="19" width="1" height="1" fill={white} />
          <rect x="15.5" y="21" width="1" height="1" fill={white} />

          {/* Logotipo discreto en pecho */}
          <rect x="11" y="21" width="2" height="1" fill={trimColor} />
        </g>
      )}

      {/* ── ATUENDO: BATA DE LABORATORIO TÉCNICA (lab) ── */}
      {outfit === 'lab' && (
        <g>
          <rect x="9" y="18" width="14" height="11" fill="#f8fafc" />
          <rect x="9" y="18" width="1" height="11" fill="#cbd5e1" />
          <rect x="22" y="18" width="1" height="11" fill="#cbd5e1" />

          {/* Camisa interior oscura */}
          <rect x="14" y="16" width="4" height="4" fill="#0f172a" />
          <rect x="15" y="17" width="2" height="2" fill={trimColor} />

          {/* Bolsillo con bolígrafo y medidor */}
          <rect x="11" y="21" width="3" height="3" fill="#e2e8f0" />
          <rect x="12" y="20" width="1" height="2" fill="#0284c7" />
          <rect x="13" y="20" width="1" height="2" fill={trimColor} />

          {/* Botones de bata técnica */}
          <rect x="15.5" y="22" width="1" height="1" fill="#94a3b8" />
          <rect x="15.5" y="25" width="1" height="1" fill="#94a3b8" />
        </g>
      )}
    </g>
  );
}

/** Brazos y manos articulados con animación de tecleo activo o balanceo de zancada. */
function PixelArms({ facing, outfit, palette, skinTones, isSitting, isWorking, isWalking }) {
  const sleeve = outfit === 'lab' ? '#f8fafc' : palette.outfit;
  const sleeveShadow = palette.outfitShade;
  const hand = skinTones.base;
  const handShadow = skinTones.shadow;

  // 1. BRAZOS EN POSTURA DE TECLEO ACTIVO (FRENTE AL TECLADO/ESCRITORIO)
  if (isSitting && isWorking) {
    if (facing === 'up') {
      return (
        <g className="pixel-arms-typing-up">
          <g className="pixel-typing-hand-left">
            <rect x="7" y="18" width="3" height="6" fill={sleeve} />
            <rect x="8" y="22" width="4" height="2" fill={sleeve} />
            <rect x="11" y="21" width="3" height="2" fill={hand} />
          </g>
          <g className="pixel-typing-hand-right">
            <rect x="22" y="18" width="3" height="6" fill={sleeve} />
            <rect x="20" y="22" width="4" height="2" fill={sleeve} />
            <rect x="18" y="21" width="3" height="2" fill={hand} />
          </g>
          {/* Micro-teclado frontal con retroiluminación LED */}
          <rect x="11" y="20" width="10" height="2" rx="0.4" fill="#0f172a" />
          <rect x="12" y="20.5" width="2" height="1" fill="#00e03c" opacity="0.9" />
          <rect x="17" y="20.5" width="2" height="1" fill="#38bdf8" opacity="0.8" />
        </g>
      );
    }
    if (facing === 'left' || facing === 'right') {
      return (
        <g className="pixel-arms-typing-profile">
          <g className="pixel-typing-hand-left">
            <rect x="13" y="18" width="3" height="5" fill={sleeve} />
            <rect x="10" y="22" width="5" height="2" fill={sleeve} />
            <rect x="7" y="23" width="4" height="2" fill={hand} />
            <rect x="7" y="24" width="2" height="1" fill={handShadow} />
          </g>
          {/* Micro-teclado de perfil ergonómico */}
          <rect x="5" y="25" width="7" height="2" rx="0.4" fill="#0f172a" />
          <rect x="6" y="25.5" width="2" height="1" fill="#38bdf8" opacity="0.85" />
          <rect x="9" y="25.5" width="2" height="1" fill="#00e03c" opacity="0.95" />
        </g>
      );
    }

    return (
      <g className="pixel-arms-typing">
        {/* Brazo Izquierdo tecleando */}
        <g className="pixel-typing-hand-left">
          <rect x="7" y="18" width="3" height="5" fill={sleeve} />
          <rect x="9" y="22" width="4" height="2" fill={sleeve} />
          <rect x="12" y="23" width="3" height="2" fill={hand} />
          <rect x="13" y="24" width="2" height="1" fill={handShadow} />
        </g>

        {/* Brazo Derecho tecleando */}
        <g className="pixel-typing-hand-right">
          <rect x="22" y="18" width="3" height="5" fill={sleeve} />
          <rect x="19" y="22" width="4" height="2" fill={sleeve} />
          <rect x="17" y="23" width="3" height="2" fill={hand} />
          <rect x="17" y="24" width="2" height="1" fill={handShadow} />
        </g>

        {/* Micro-teclado táctil en el escritorio con luces de teclas */}
        <rect x="11" y="25" width="10" height="2.2" rx="0.4" fill="#0f172a" stroke="#334155" strokeWidth="0.3" />
        <rect x="12" y="25.5" width="1.5" height="1" fill="#38bdf8" opacity="0.85" />
        <rect x="15" y="25.5" width="2" height="1" fill="#00e03c" opacity="0.95" />
        <rect x="18.5" y="25.5" width="1.5" height="1" fill="#c9a84c" opacity="0.85" />
      </g>
    );
  }

  // 2. BRAZOS EN POSTURA DE SENTADO EN REPOSO (SOBRE LOS REPOSABRAZOS O RODILLAS)
  if (isSitting) {
    if (facing === 'left' || facing === 'right') {
      return (
        <g className="pixel-arms-sitting-profile">
          <rect x="13" y="18" width="3" height="6" fill={sleeve} />
          <rect x="11" y="23" width="4" height="2" fill={sleeve} />
          <rect x="9" y="24" width="3" height="2" fill={hand} />
        </g>
      );
    }
    return (
      <g className="pixel-arms-sitting-rest">
        {/* Brazo Izquierdo reposando */}
        <rect x="6" y="18" width="3" height="7" fill={sleeve} />
        <rect x="6" y="24" width="4" height="2" fill={sleeve} />
        <rect x="9" y="25" width="3" height="2" fill={hand} />

        {/* Brazo Derecho reposando */}
        <rect x="23" y="18" width="3" height="7" fill={sleeve} />
        <rect x="22" y="24" width="4" height="2" fill={sleeve} />
        <rect x="20" y="25" width="3" height="2" fill={hand} />
      </g>
    );
  }

  // 3. BRAZOS EN VISTA DE PERFIL (CAMINANDO O DE PIE)
  if (facing === 'left' || facing === 'right') {
    return (
      <g className={isWalking ? 'pixel-arm-profile-walk' : ''}>
        <rect x="13" y="18" width="4" height="7" fill={sleeve} />
        <rect x="13" y="18" width="1" height="7" fill={sleeveShadow} />
        <rect x="13" y="25" width="3" height="3" fill={hand} />
      </g>
    );
  }

  // 4. BRAZOS DE FRENTE O ESPALDA (STAND / WALK CYCLE)
  return (
    <g className="pixel-arms-standing">
      {/* Brazo Izquierdo */}
      <g className={isWalking ? 'pixel-arm-swing-left' : ''}>
        <rect x="6" y="18" width="3" height="7" fill={sleeve} />
        <rect x="6" y="18" width="1" height="7" fill={sleeveShadow} />
        <rect x="6" y="25" width="3" height="3" fill={hand} />
        <rect x="6" y="27" width="3" height="1" fill={handShadow} />
      </g>

      {/* Brazo Derecho */}
      <g className={isWalking ? 'pixel-arm-swing-right' : ''}>
        <rect x="23" y="18" width="3" height="7" fill={sleeve} />
        <rect x="25" y="18" width="1" height="7" fill={sleeveShadow} />
        <rect x="23" y="25" width="3" height="3" fill={hand} />
        <rect x="23" y="27" width="3" height="1" fill={handShadow} />
      </g>
    </g>
  );
}

/** Cabeza, cuello, orejas y rostro expresivo según orientación. */
function PixelHeadAndFace({ facing, skinTones, hairColor, facialHair }) {
  const { base: skin, shadow: skinShadow, highlight: skinHighlight } = skinTones;
  const hairShadow = adjustHex(hairColor, -24);
  const hairHighlight = adjustHex(hairColor, 26);
  const fHair = facialHair === 'beard' ? 'beard_full' : facialHair;

  // Cuello
  const neck = (
    <g className="pixel-neck">
      <rect x="14" y="15" width="4" height="3" fill={skin} />
      <rect x="14" y="16" width="4" height="1" fill={skinShadow} />
    </g>
  );

  // 1. ESPALDA ('up')
  if (facing === 'up') {
    return (
      <g className="pixel-head-up">
        {neck}
        {/* Silueta posterior de la cabeza (cubierta por el cabello) */}
        <rect x="10" y="5" width="12" height="11" fill={skinShadow} />
        <rect x="8" y="10" width="2" height="3" fill={skin} />
        <rect x="22" y="10" width="2" height="3" fill={skin} />
      </g>
    );
  }

  // 2. PERFIL ('left' / 'right')
  if (facing === 'left' || facing === 'right') {
    return (
      <g className="pixel-head-profile">
        {neck}
        {/* Base cráneo de perfil */}
        <rect x="10" y="5" width="12" height="10" fill={skin} />
        <rect x="10" y="5" width="12" height="1" fill={skinHighlight} />
        {/* Nariz proyectada de perfil */}
        <rect x="8" y="11" width="2" height="2" fill={skin} />
        <rect x="8" y="12" width="2" height="1" fill={skinShadow} />
        {/* Oreja */}
        <rect x="17" y="10" width="2" height="3" fill={skin} />
        <rect x="17" y="11" width="1" height="1" fill={skinShadow} />
        {/* Ojo expresivo de perfil */}
        <rect x="10" y="10" width="3" height="2" fill="#0f172a" />
        <rect x="10" y="10" width="1" height="1" fill="#ffffff" />
        {/* Ceja */}
        <rect x="9" y="9" width="3" height="1" fill={hairColor} />

        {/* Vello Facial en Perfil */}
        {fHair === 'mustache' && (
          <g className="pixel-mustache-profile" fill={hairColor}>
            <rect x="8" y="13" width="4" height="1.5" />
            <rect x="7" y="13.5" width="1" height="1" />
          </g>
        )}

        {fHair === 'beard_full' && (
          <g className="pixel-beard-full-profile">
            <rect x="8" y="13" width="3" height="1.5" fill={hairColor} />
            <rect x="8" y="14" width="5" height="2.5" fill={hairColor} />
            <rect x="12" y="14" width="4" height="2" fill={hairColor} />
            <rect x="15" y="12" width="2" height="3" fill={hairColor} />
            <rect x="8" y="16.5" width="5" height="1" fill={hairShadow} />
          </g>
        )}

        {fHair === 'beard_stubble' && (
          <g className="pixel-beard-stubble-profile" fill={hairColor} opacity="0.55">
            <rect x="8" y="13" width="1" height="1" />
            <rect x="10" y="13" width="1" height="1" />
            <rect x="8" y="14" width="1" height="1" />
            <rect x="10" y="14" width="1" height="1" />
            <rect x="12" y="14" width="1" height="1" />
            <rect x="14" y="14" width="1" height="1" />
            <rect x="16" y="12.5" width="1" height="1" />
            <rect x="9" y="15.5" width="1" height="1" />
            <rect x="11" y="15.5" width="1" height="1" />
            <rect x="13" y="15.5" width="1" height="1" />
          </g>
        )}
      </g>
    );
  }

  // 3. FRENTE ('down')
  return (
    <g className="pixel-head-down">
      {neck}

      {/* Orejas con sombra interior */}
      <rect x="8" y="10" width="2" height="3" fill={skin} />
      <rect x="9" y="11" width="1" height="1" fill={skinShadow} />
      <rect x="22" y="10" width="2" height="3" fill={skin} />
      <rect x="22" y="11" width="1" height="1" fill={skinShadow} />

      {/* Estructura craneal (14×11 px redondeada en esquinas) */}
      <rect x="10" y="5" width="12" height="1" fill={skin} />
      <rect x="9" y="6" width="14" height="9" fill={skin} />
      <rect x="10" y="15" width="12" height="1" fill={skin} />

      {/* Luces y sombras de volumen en mandíbula */}
      <rect x="10" y="15" width="12" height="1" fill={skinShadow} />

      {/* Cejas proporcionadas */}
      <rect x="11" y="9" width="3" height="1" fill={hairColor} />
      <rect x="18" y="9" width="3" height="1" fill={hairColor} />

      {/* Ojos expresivos RPG (pupila oscura profunda + reflejo blanco de vida) */}
      {/* Ojo Izquierdo */}
      <rect x="12" y="10" width="3" height="1" fill="#0f172a" />
      <rect x="12" y="11" width="2" height="2" fill="#1e293b" />
      <rect x="12" y="11" width="1" height="1" fill="#ffffff" />
      <rect x="14" y="11" width="1" height="2" fill="#f8fafc" />

      {/* Ojo Derecho */}
      <rect x="17" y="10" width="3" height="1" fill="#0f172a" />
      <rect x="18" y="11" width="2" height="2" fill="#1e293b" />
      <rect x="18" y="11" width="1" height="1" fill="#ffffff" />
      <rect x="17" y="11" width="1" height="2" fill="#f8fafc" />

      {/* Puente y punta de la nariz */}
      <rect x="15" y="11" width="2" height="2" fill={skinHighlight} />
      <rect x="15" y="13" width="2" height="1" fill={skinShadow} />

      {/* Labios / Expresión ejecutiva segura */}
      <rect x="15" y="14" width="2" height="1" fill={skinShadow} />

      {/* Vello Facial: Bigote, Barba completa o Barba de 3 días */}
      {fHair === 'mustache' && (
        <g className="pixel-mustache" fill={hairColor}>
          {/* Bigote clásico definido de ingeniero sobre labio superior */}
          <rect x="12" y="13" width="8" height="1.5" />
          <rect x="11" y="13.5" width="1" height="1" />
          <rect x="20" y="13.5" width="1" height="1" />
          <rect x="13" y="14" width="6" height="0.6" fill={hairShadow} />
        </g>
      )}

      {fHair === 'beard_full' && (
        <g className="pixel-beard-full">
          {/* Bigote y bozo */}
          <rect x="12" y="13" width="8" height="1.5" fill={hairColor} />
          {/* Conexión lateral bajo nariz */}
          <rect x="15" y="14" width="2" height="1" fill={hairShadow} />
          {/* Barba densa bordeando mandíbula completa */}
          <rect x="9" y="12" width="2" height="4" fill={hairColor} />
          <rect x="21" y="12" width="2" height="4" fill={hairColor} />
          <rect x="10" y="14" width="12" height="2" fill={hairColor} />
          {/* Mentón y sombra inferior de volumen directivo */}
          <rect x="11" y="16" width="10" height="1.5" fill={hairShadow} />
          <rect x="12" y="17" width="8" height="0.5" fill={hairShadow} />
          {/* Brillos sutiles superiores */}
          <rect x="10" y="14" width="1" height="1" fill={hairHighlight} opacity="0.6" />
          <rect x="21" y="14" width="1" height="1" fill={hairHighlight} opacity="0.6" />
        </g>
      )}

      {fHair === 'beard_stubble' && (
        <g className="pixel-beard-stubble" fill={hairColor} opacity="0.55">
          {/* Punteado sutil en bozo */}
          <rect x="13" y="13" width="1" height="1" />
          <rect x="15" y="13" width="1" height="1" />
          <rect x="17" y="13" width="1" height="1" />
          <rect x="14" y="13.5" width="1" height="0.8" />
          <rect x="16" y="13.5" width="1" height="0.8" />
          <rect x="18" y="13.5" width="1" height="0.8" />
          {/* Punteado sutil en mandíbula y mentón */}
          <rect x="9" y="12" width="1" height="1" />
          <rect x="9" y="14" width="1" height="1" />
          <rect x="22" y="12" width="1" height="1" />
          <rect x="22" y="14" width="1" height="1" />
          <rect x="10" y="14.5" width="1" height="1" />
          <rect x="12" y="14.5" width="1" height="1" />
          <rect x="14" y="14.5" width="1" height="1" />
          <rect x="16" y="14.5" width="1" height="1" />
          <rect x="18" y="14.5" width="1" height="1" />
          <rect x="20" y="14.5" width="1" height="1" />
          <rect x="11" y="15.5" width="1" height="1" />
          <rect x="13" y="15.5" width="1" height="1" />
          <rect x="15" y="15.5" width="1" height="1" />
          <rect x="17" y="15.5" width="1" height="1" />
          <rect x="19" y="15.5" width="1" height="1" />
          <rect x="12" y="16.5" width="1" height="0.8" />
          <rect x="14" y="16.5" width="1" height="0.8" />
          <rect x="16" y="16.5" width="1" height="0.8" />
          <rect x="18" y="16.5" width="1" height="0.8" />
        </g>
      )}
    </g>
  );
}

/** Cabello volumétrico con reflejos y sombras, mapeado en las 4 direcciones. */
function PixelHair({ facing, style, hairColor }) {
  if (style === 'bald') return null;

  const base = hairColor;
  const highlight = adjustHex(hairColor, 26);
  const shadow = adjustHex(hairColor, -24);

  // 1. ESPALDA ('up') — Cabello completo que cubre el cráneo
  if (facing === 'up') {
    return (
      <g className="pixel-hair-up">
        <rect x="9" y="4" width="14" height="10" fill={base} />
        <rect x="10" y="3" width="12" height="2" fill={highlight} />
        <rect x="9" y="11" width="14" height="3" fill={shadow} />
        {style === 'long' && (
          // Cabello largo cayendo por los omóplatos
          <rect x="9" y="14" width="14" height="8" fill={base} />
        )}
        {style === 'ponytail' && (
          // Coleta recogida centrada
          <rect x="14" y="11" width="4" height="7" fill={base} />
        )}
        {style === 'pompadour' && (
          // Tupé visto de atrás: nuca limpia con gran volumen superior elevado
          <>
            <rect x="10" y="1" width="12" height="3" fill={highlight} />
            <rect x="12" y="0" width="8" height="2" fill={highlight} />
            <rect x="11" y="12" width="10" height="2" fill={shadow} />
          </>
        )}
        {style === 'military' && (
          // Corte militar visto de atrás: nuca alta rapada con fade
          <>
            <rect x="10" y="4" width="12" height="4" fill={base} />
            <rect x="11" y="3" width="10" height="2" fill={highlight} />
            <rect x="10" y="8" width="12" height="3" fill={shadow} />
            <rect x="12" y="11" width="8" height="2" fill={shadow} opacity="0.6" />
          </>
        )}
        {style === 'manbun' && (
          // Man-bun visto de atrás: moño centrado prominente con goma elástica
          <>
            <rect x="12" y="0.5" width="8" height="5" rx="1.5" fill={base} />
            <rect x="13" y="1" width="6" height="2.5" fill={highlight} />
            <rect x="13" y="5" width="6" height="1" fill="#c9a84c" />
            <rect x="11" y="12" width="10" height="2" fill={shadow} />
          </>
        )}
        {style === 'wavy_exec' && (
          // Ondulado ejecutivo de espaldas: capas onduladas con caída natural
          <>
            <rect x="9" y="3" width="14" height="10" fill={base} />
            <rect x="10" y="2" width="12" height="2" fill={highlight} />
            <rect x="9" y="10" width="14" height="3" fill={shadow} />
            <rect x="9" y="13" width="4" height="1" fill={shadow} />
            <rect x="14" y="13" width="4" height="1" fill={shadow} />
            <rect x="19" y="13" width="4" height="1" fill={shadow} />
          </>
        )}
      </g>
    );
  }

  // 2. PERFIL ('left' / 'right')
  if (facing === 'left' || facing === 'right') {
    return (
      <g className="pixel-hair-profile">
        <rect x="11" y="4" width="11" height="5" fill={base} />
        <rect x="12" y="3" width="9" height="2" fill={highlight} />
        <rect x="18" y="7" width="4" height="6" fill={shadow} />
        <rect x="15" y="7" width="2" height="3" fill={base} />
        {style === 'long' && (
          <rect x="17" y="11" width="4" height="10" fill={base} />
        )}
        {style === 'ponytail' && (
          <rect x="21" y="8" width="4" height="6" fill={base} />
        )}
        {style === 'pompadour' && (
          // Tupé de perfil: cresta alzada hacia arriba y adelante
          <>
            <rect x="9" y="1" width="8" height="4" fill={highlight} />
            <rect x="10" y="0" width="6" height="2" fill={highlight} />
            <rect x="15" y="7" width="4" height="5" fill={shadow} />
          </>
        )}
        {style === 'military' && (
          // Corte militar perfil: rasurado limpio pegado
          <>
            <rect x="11" y="4" width="10" height="2" fill={highlight} />
            <rect x="10" y="5" width="11" height="2" fill={base} />
            <rect x="15" y="7" width="5" height="4" fill={shadow} opacity="0.7" />
          </>
        )}
        {style === 'manbun' && (
          // Moño de perfil: pequeño bun recogido en coronilla posterior
          <>
            <rect x="19" y="2" width="5" height="4" rx="1" fill={base} />
            <rect x="20" y="2.5" width="3" height="2" fill={highlight} />
            <rect x="18.5" y="3.5" width="1.5" height="2" fill="#c9a84c" />
            <rect x="15" y="7" width="4" height="5" fill={shadow} />
          </>
        )}
        {style === 'wavy_exec' && (
          // Ondas de perfil con volumen frontal y ondas detrás
          <>
            <rect x="10" y="2" width="11" height="4" fill={highlight} />
            <rect x="9" y="4" width="4" height="4" fill={base} />
            <rect x="16" y="7" width="5" height="5" fill={shadow} />
            <rect x="17" y="11" width="3" height="2" fill={shadow} />
          </>
        )}
      </g>
    );
  }

  // 3. FRENTE ('down')
  return (
    <g className="pixel-hair-down">
      {/* Corona y volumen superior */}
      <rect x="10" y="3" width="12" height="2" fill={highlight} />
      <rect x="9" y="4" width="14" height="3" fill={base} />

      {/* Flequillos y cortes según estilo */}
      {style === 'short' && (
        // Corte clásico institucional con raya sutil
        <>
          <rect x="9" y="6" width="3" height="4" fill={base} />
          <rect x="20" y="6" width="3" height="4" fill={base} />
          <rect x="12" y="5" width="4" height="2" fill={highlight} />
          <rect x="10" y="9" width="1" height="2" fill={shadow} />
          <rect x="21" y="9" width="1" height="2" fill={shadow} />
        </>
      )}

      {style === 'side' && (
        // Degradado lateral / Raya ejecutiva
        <>
          <rect x="9" y="5" width="5" height="3" fill={highlight} />
          <rect x="9" y="7" width="2" height="4" fill={shadow} />
          <rect x="19" y="5" width="4" height="5" fill={base} />
          <rect x="21" y="8" width="2" height="3" fill={shadow} />
        </>
      )}

      {style === 'curly' && (
        // Rizos densos volumétricos
        <>
          <rect x="8" y="4" width="3" height="3" fill={highlight} />
          <rect x="13" y="2" width="4" height="3" fill={highlight} />
          <rect x="19" y="3" width="4" height="3" fill={highlight} />
          <rect x="8" y="7" width="3" height="4" fill={base} />
          <rect x="21" y="6" width="3" height="5" fill={base} />
        </>
      )}

      {style === 'long' && (
        // Cabello largo por delante de los hombros
        <>
          <rect x="8" y="6" width="3" height="15" fill={base} />
          <rect x="8" y="18" width="3" height="3" fill={shadow} />
          <rect x="21" y="6" width="3" height="15" fill={base} />
          <rect x="21" y="18" width="3" height="3" fill={shadow} />
        </>
      )}

      {style === 'ponytail' && (
        // Coleta lateral elegante
        <>
          <rect x="9" y="5" width="14" height="3" fill={base} />
          <rect x="22" y="7" width="3" height="8" rx="0.5" fill={base} />
          <rect x="22" y="6" width="2" height="1" fill="#c9a84c" />
        </>
      )}

      {style === 'pompadour' && (
        // Tupé Pompadour moderno con volumen superior elevado
        <>
          {/* Volumen elevado que sobrepasa el cráneo */}
          <rect x="10" y="1" width="12" height="3" fill={highlight} />
          <rect x="12" y="0" width="8" height="2" fill={highlight} />
          <rect x="11" y="3" width="10" height="1" fill={base} />
          {/* Degradado lateral fade */}
          <rect x="9" y="6" width="2" height="4" fill={shadow} />
          <rect x="21" y="6" width="2" height="4" fill={shadow} />
          {/* Peinado hacia arriba y sombra central */}
          <rect x="11" y="4" width="1" height="2" fill={shadow} />
          <rect x="15" y="3" width="2" height="2" fill={base} />
          <rect x="19" y="4" width="1" height="2" fill={shadow} />
        </>
      )}

      {style === 'military' && (
        // Corte Militar Fade: silueta baja y limpia pegada al cráneo
        <>
          <rect x="11" y="4" width="10" height="1.5" fill={highlight} />
          <rect x="10" y="5" width="12" height="1.5" fill={base} />
          <rect x="9" y="6" width="2" height="3" fill={shadow} opacity="0.75" />
          <rect x="21" y="6" width="2" height="3" fill={shadow} opacity="0.75" />
          <rect x="11" y="6" width="10" height="0.8" fill={base} />
        </>
      )}

      {style === 'manbun' && (
        // Moño Man-Bun: laterales con fade y moño superior posterior asomando
        <>
          {/* Moño asomando detrás de la coronilla */}
          <rect x="14" y="0" width="4" height="3" rx="0.5" fill={base} />
          <rect x="15" y="0.5" width="2" height="1.5" fill={highlight} />
          <rect x="14" y="2.5" width="4" height="0.8" fill="#c9a84c" />
          {/* Cabello peinado tenso hacia atrás */}
          <rect x="10" y="3" width="12" height="2" fill={highlight} />
          <rect x="10" y="5" width="12" height="2" fill={base} />
          {/* Fade undercut lateral */}
          <rect x="9" y="6" width="2" height="4" fill={shadow} />
          <rect x="21" y="6" width="2" height="4" fill={shadow} />
        </>
      )}

      {style === 'wavy_exec' && (
        // Ondulado Ejecutivo: ondas con caída asimétrica elegante
        <>
          {/* Copa superior ondulada */}
          <rect x="9" y="2" width="14" height="3" rx="0.5" fill={highlight} />
          {/* Raya al lado y ondas texturizadas */}
          <rect x="11" y="3" width="2" height="1" fill={shadow} />
          <rect x="15" y="3" width="2" height="1" fill={shadow} />
          <rect x="18" y="3" width="2" height="1" fill={shadow} />
          {/* Mechón ondulado asimétrico sobre ceja izquierda */}
          <rect x="8" y="5" width="4" height="4" fill={base} />
          <rect x="9" y="7" width="3" height="3" fill={shadow} />
          <rect x="12" y="5" width="5" height="2" fill={highlight} />
          {/* Lateral derecho recortado / peinado */}
          <rect x="20" y="5" width="3" height="4" fill={base} />
          <rect x="21" y="7" width="2" height="3" fill={shadow} />
        </>
      )}
    </g>
  );
}

/** Cascos, gorras y sombreros institucionales. */
function PixelHeadwear({ type, palette, facing }) {
  if (!type || type === 'none') return null;

  if (type === 'hardhat') {
    // Casco de seguridad blanco SERAM con franja dorada y lámpara frontal
    return (
      <g className="pixel-hardhat">
        <rect x="8" y="2" width="16" height="5" rx="1" fill="#f8fafc" />
        <rect x="7" y="6" width="18" height="2" fill="#e2e8f0" />
        <rect x="9" y="5" width="14" height="1" fill={palette.trim} />
        {facing === 'down' && (
          // Lámpara frontal del casco
          <>
            <rect x="15" y="4" width="2" height="2" fill="#38bdf8" />
            <rect x="15.5" y="4.5" width="1" height="1" fill="#ffffff" />
          </>
        )}
      </g>
    );
  }

  if (type === 'cap') {
    // Gorra deportiva SERAM
    return (
      <g className="pixel-cap">
        <rect x="9" y="3" width="14" height="4" fill={palette.outfit} />
        <rect x="7" y="6" width="18" height="2" fill={palette.outfitShade} />
        <rect x="15" y="4" width="2" height="1" fill={palette.trim} />
      </g>
    );
  }

  if (type === 'expedition') {
    // Sombrero de ala ancha tipo safari / expedición
    return (
      <g className="pixel-expedition-hat">
        <rect x="10" y="2" width="12" height="4" fill="#a8824a" />
        <rect x="10" y="5" width="12" height="1" fill="#3f2715" />
        <rect x="6" y="6" width="20" height="2" rx="0.5" fill="#c29a5c" />
      </g>
    );
  }

  return null;
}

/** Accesorios (gafas, credencial de socio, tablet, GPS, portapapeles). */
function PixelAccessories({ type, palette, facing, isWorking }) {
  return (
    <g className="pixel-accessories">
      {/* Gafas ejecutivas (visibles de frente o perfil) */}
      {type === 'glasses' && (facing === 'down' || facing === 'left' || facing === 'right') && (
        <g className="pixel-glasses">
          {facing === 'down' ? (
            <>
              <rect x="11" y="10" width="4" height="3" fill="none" stroke="#0f172a" strokeWidth="0.8" />
              <rect x="17" y="10" width="4" height="3" fill="none" stroke="#0f172a" strokeWidth="0.8" />
              <rect x="15" y="11" width="2" height="0.8" fill="#0f172a" />
              <rect x="12" y="11" width="1" height="1" fill="#38bdf8" opacity="0.8" />
              <rect x="18" y="11" width="1" height="1" fill="#38bdf8" opacity="0.8" />
            </>
          ) : (
            <>
              <rect x="9" y="10" width="4" height="3" fill="none" stroke="#0f172a" strokeWidth="0.8" />
              <rect x="13" y="11" width="4" height="0.8" fill="#0f172a" />
            </>
          )}
        </g>
      )}

      {/* Lanyard / Credencial dorada de socio SERAM al cuello */}
      {facing === 'down' && (
        <g className="pixel-lanyard">
          {/* Cinta dorada al cuello */}
          <line x1="14" y1="18" x2="16" y2="23" stroke={palette.trim} strokeWidth="0.8" />
          <line x1="18" y1="18" x2="16" y2="23" stroke={palette.trim} strokeWidth="0.8" />
          {/* Tarjeta de identificación */}
          <rect x="15" y="23" width="2.5" height="3.5" rx="0.3" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.4" />
          <rect x="15.5" y="23.5" width="1.5" height="1" fill="#0284c7" />
        </g>
      )}

      {/* Tablet de campo GIS en mano si no está tecleando */}
      {type === 'tablet' && !isWorking && facing === 'down' && (
        <g className="pixel-tablet">
          <rect x="23" y="22" width="6" height="8" rx="0.5" fill="#0f172a" stroke={palette.trim} strokeWidth="0.4" />
          <rect x="24" y="23" width="4" height="6" fill="#0ea5e9" opacity="0.8" />
          <rect x="24.5" y="24" width="1" height="1" fill="#00e03c" />
        </g>
      )}

      {/* Portapapeles técnico */}
      {type === 'clipboard' && !isWorking && facing === 'down' && (
        <g className="pixel-clipboard">
          <rect x="23" y="21" width="6" height="9" rx="0.5" fill="#854d0e" />
          <rect x="24" y="22" width="4" height="7" fill="#ffffff" />
          <rect x="25" y="20.5" width="2" height="1.5" rx="0.3" fill={palette.trim} />
          <line x1="24.5" y1="24" x2="27.5" y2="24" stroke="#94a3b8" strokeWidth="0.4" />
          <line x1="24.5" y1="26" x2="27.5" y2="26" stroke="#94a3b8" strokeWidth="0.4" />
        </g>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Avatar Pixel-Art HD Multicapa de Socios SERAM (`PixelPartnerAvatar`).
 * @param {object} props.config       Configuración normalizada de catálogo
 * @param {'down'|'up'|'left'|'right'} [props.facing='down'] Orientación 4-way
 * @param {boolean} [props.isWalking=false] Ciclo de zancada en marcha
 * @param {boolean} [props.isSitting=false] Postura de sentado en silla de oficina
 * @param {boolean} [props.isWorking=false] Micro-tecleo en escritorio
 * @param {boolean} [props.isOnline=true]   Saturación y presencia activa
 * @param {boolean} [props.isCurrent=false] Resaltado de socio local con corona
 * @param {number}  [props.size]            Ancho en píxeles (ej: 36 o 44)
 * @param {number}  [props.scale=1]         Escala proporcional
 * @param {string}  [props.className='']    Clases CSS adicionales
 * @param {string}  [props.initials='']     Iniciales de socio para accesibilidad
 * @param {string}  [props.title]           Título / tooltip accesible
 */
export function PixelPartnerAvatar({
  config,
  facing = 'down',
  isWalking = false,
  isSitting = false,
  isWorking = false,
  isOnline = true,
  isCurrent = false,
  size,
  scale = 1,
  className = '',
  initials = '',
  title
}) {
  const filterId = `pixel-glow-${useId().replace(/:/g, '')}`;

  // Normalización del catálogo de socios
  const palette = useMemo(() => resolveAvatarPalette(config), [config]);
  const cfg = palette.config;
  const skinTones = useMemo(
    () => getSkinTones(cfg.skinTone, palette.skinHead),
    [cfg.skinTone, palette.skinHead]
  );

  // Dimensionamiento pixel-perfect
  const width = size || Math.round(VIEW_W * scale);
  const height = Math.round(width * (VIEW_H / VIEW_W));

  // Espejado horizontal automático para 'right' (reutiliza el arte de perfil 'left')
  const isRightFacing = facing === 'right';
  const effectiveFacing = isRightFacing ? 'left' : facing;
  const mirrorTransform = isRightFacing ? `translate(${VIEW_W}, 0) scale(-1, 1)` : undefined;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={`overflow-visible select-none [image-rendering:pixelated] ${className}`}
      style={{
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
        filter: !isOnline ? 'grayscale(0.6) opacity(0.65)' : undefined
      }}
      role="img"
      aria-label={title || `Avatar ${initials || cfg.outfit}`.trim()}
      data-facing={facing}
      data-walking={isWalking ? 'true' : undefined}
      data-sitting={isSitting ? 'true' : undefined}
      data-working={isWorking ? 'true' : undefined}
    >
      <defs>
        {/* Filtro de resplandor para socios con mérito dorado o socio actual */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor={palette.trim} floodOpacity="0.85" />
        </filter>
      </defs>

      <style>{`
        /* Ciclo de balanceo vertical al caminar (Bobbing 1.2px) */
        @keyframes pixelWalkBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.4px); }
        }
        /* Alternancia de zancadas de piernas en ciclo de caminata */
        @keyframes pixelStepL {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-2px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(1.2px); }
        }
        @keyframes pixelStepR {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(1.2px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-2px); }
        }
        /* Balanceo rítmico de brazos opuesto a las piernas */
        @keyframes pixelArmL {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(1.5px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-1.5px); }
        }
        @keyframes pixelArmR {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-1.5px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(1.5px); }
        }
        /* Micro-tecleo veloz en teclado de oficina (180ms) */
        @keyframes pixelTypeL {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        @keyframes pixelTypeR {
          0%, 100% { transform: translateY(-1px); }
          50% { transform: translateY(0); }
        }
        /* Respiración sutil en reposo */
        @keyframes pixelBreathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.4px); }
        }

        .pixel-walk-anim { animation: pixelWalkBob 0.34s steps(4) infinite; }
        .pixel-walk-step-left { animation: pixelStepL 0.34s steps(4) infinite; }
        .pixel-walk-step-right { animation: pixelStepR 0.34s steps(4) infinite; }
        .pixel-arm-swing-left { animation: pixelArmL 0.34s steps(4) infinite; }
        .pixel-arm-swing-right { animation: pixelArmR 0.34s steps(4) infinite; }
        .pixel-typing-hand-left { animation: pixelTypeL 0.18s ease-in-out infinite; }
        .pixel-typing-hand-right { animation: pixelTypeR 0.18s ease-in-out infinite; }
        .pixel-idle-breathe { animation: pixelBreathe 2.4s ease-in-out infinite; }
      `}</style>

      {/* ── 1. SOMBRA EN EL SUELO ── */}
      <PixelShadow isSitting={isSitting} isOnline={isOnline} />

      {/* ── 2. AURA DE PROGRESO / RESONANCIA ── */}
      <PixelAura auraColor={palette.aura || (isCurrent ? '#c9a84c' : null)} />

      {/* ── 3. CUERPO MODULAR PIXEL-ART ── */}
      <g
        transform={mirrorTransform}
        className={isWalking ? 'pixel-walk-anim' : isSitting ? '' : 'pixel-idle-breathe'}
        filter={isCurrent || palette.trimGlow ? `url(#${filterId})` : undefined}
      >
        {/* Capa de piernas y calzado */}
        <PixelLegs
          facing={effectiveFacing}
          isSitting={isSitting}
          isWalking={isWalking}
          outfit={cfg.outfit}
          outfitShade={palette.outfitShade}
        />

        {/* Capa de torso y ropa */}
        <PixelTorso
          facing={effectiveFacing}
          outfit={cfg.outfit}
          palette={palette}
          isSitting={isSitting}
        />

        {/* Capa de brazos y manos */}
        <PixelArms
          facing={effectiveFacing}
          outfit={cfg.outfit}
          palette={palette}
          skinTones={skinTones}
          isSitting={isSitting}
          isWorking={isWorking}
          isWalking={isWalking}
        />

        {/* Capa de cabeza, cuello y rostro */}
        <PixelHeadAndFace
          facing={effectiveFacing}
          skinTones={skinTones}
          hairColor={palette.hair}
          facialHair={cfg.facialHair || (['beard_full', 'beard_stubble', 'mustache', 'beard'].includes(cfg.accessory) ? cfg.accessory : 'none')}
        />

        {/* Capa de cabello volumétrico */}
        <PixelHair
          facing={effectiveFacing}
          style={cfg.hairStyle}
          hairColor={palette.hair}
        />

        {/* Casco o sombrero */}
        <PixelHeadwear
          type={cfg.headwear}
          palette={palette}
          facing={effectiveFacing}
        />

        {/* Accesorios y herramientas de campo */}
        <PixelAccessories
          type={cfg.accessory}
          palette={palette}
          facing={effectiveFacing}
          isWorking={isWorking}
        />
      </g>
    </svg>
  );
}

export default PixelPartnerAvatar;

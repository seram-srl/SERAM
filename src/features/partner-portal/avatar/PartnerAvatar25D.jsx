import React, { useId } from 'react';
import { resolveAvatarPalette } from './avatarCatalog';

// ─────────────────────────────────────────────────────────────────────────────
// RENDERIZADOR SVG POR CAPAS DEL AVATAR 2.5D DE SOCIOS SERAM
// Mismo viewBox 34×48 y estética del sprite original de la Oficina Virtual.
// Orden de capas: sombra → cabello trasero → piernas → calzado → torso →
// detalle del atuendo → brazos → manos → cabeza → rostro → vello facial →
// cabello delantero → casco/sombrero → accesorio → iniciales
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_W = 34;
const VIEW_H = 48;
const TORSO_PATH = 'M 8 16 L 26 16 L 24 29 L 10 29 Z';

function HairBack({ style, color }) {
  if (style === 'long') {
    return <path d="M 10.6 9 C 10 2.6, 24 2.6, 23.4 9 L 24.2 17.5 L 21.2 16.5 L 21 10 L 13 10 L 12.8 16.5 L 9.8 17.5 Z" fill={color} />;
  }
  if (style === 'ponytail') {
    return <ellipse cx="11.2" cy="11.5" rx="2" ry="4.4" transform="rotate(14 11.2 11.5)" fill={color} />;
  }
  return null;
}

function HairFront({ style, color }) {
  switch (style) {
    case 'bald':
      return <path d="M 13 5.6 C 15 4.6, 19 4.6, 21 5.6" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" fill="none" strokeLinecap="round" />;
    case 'side':
      return <path d="M 10.8 9.2 C 10.4 2.8, 23.6 2.8, 23.2 8.6 C 21.4 5.6, 17 5.2, 13.6 7.4 C 12.4 8.1, 11.6 8.7, 10.8 9.2 Z" fill={color} />;
    case 'curly':
      return (
        <g fill={color}>
          <circle cx="12.1" cy="6.4" r="2.2" />
          <circle cx="14.5" cy="4.8" r="2.3" />
          <circle cx="17.4" cy="4.3" r="2.4" />
          <circle cx="20.3" cy="4.9" r="2.3" />
          <circle cx="22.2" cy="6.6" r="2.1" />
          <circle cx="11.1" cy="8.6" r="1.5" />
          <circle cx="23" cy="8.6" r="1.5" />
        </g>
      );
    case 'long':
      return <path d="M 11 8.6 C 10.8 3.2, 23.2 3.2, 23 8.6 C 21.8 5.8, 18.5 5.4, 17 6.6 C 15.5 5.4, 12.2 5.8, 11 8.6 Z" fill={color} />;
    case 'ponytail':
      return <path d="M 11 8.2 C 11 3.4, 23 3.4, 23 8.2 C 22 4.8, 12 4.8, 11 8.2 Z" fill={color} />;
    case 'short':
    default:
      // Trazo exacto del sprite original
      return <path d="M 11 8 C 11 3.5, 23 3.5, 23 8 C 22 4.5, 12 4.5, 11 8 Z" fill={color} />;
  }
}

function FacialHair({ type, color }) {
  if (type === 'beard') {
    return <path d="M 11.4 10.6 C 11.8 17.6, 22.2 17.6, 22.6 10.6 C 21.4 14.4, 18.8 14.2, 17 13.6 C 15.2 14.2, 12.6 14.4, 11.4 10.6 Z" fill={color} />;
  }
  if (type === 'mustache') {
    return <path d="M 14.6 13 C 15.5 12, 16.5 12.3, 17 12.8 C 17.5 12.3, 18.5 12, 19.4 13 C 18.4 13.6, 15.6 13.6, 14.6 13 Z" fill={color} />;
  }
  return null;
}

function Headwear({ type, palette }) {
  switch (type) {
    case 'hardhat':
      return (
        <g>
          <path d="M 10.4 8 C 10.4 1.4, 23.6 1.4, 23.6 8 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.4" />
          <rect x="16.3" y="2.4" width="1.4" height="5.6" rx="0.6" fill="#e2e8f0" />
          <rect x="9" y="7.4" width="16" height="1.6" rx="0.8" fill="#e2e8f0" />
          <rect x="10.6" y="6.3" width="12.8" height="0.9" fill={palette.trim} />
        </g>
      );
    case 'expedition':
      return (
        <g>
          <ellipse cx="17" cy="7.4" rx="9.6" ry="1.9" fill="#a8875a" />
          <path d="M 12.2 7.4 C 12.2 2.4, 21.8 2.4, 21.8 7.4 Z" fill="#c2a16e" />
          <rect x="12.2" y="5.6" width="9.6" height="1.2" fill="#3f2a1a" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M 11 7.8 C 11 2.8, 23 2.8, 23 7.8 Z" fill={palette.outfit} />
          <path d="M 21 7 Q 27 7, 27 8.4 L 20.5 8.4 Z" fill={palette.outfitShade} />
          <circle cx="17" cy="5.4" r="1" fill={palette.trim} />
        </g>
      );
    default:
      return null;
  }
}

function Accessory({ type, palette }) {
  switch (type) {
    case 'glasses':
      return (
        <g stroke="#0f172a" strokeWidth="0.6">
          <circle cx="15.2" cy="10.4" r="1.5" fill="rgba(148,163,184,0.28)" />
          <circle cx="19.6" cy="10.4" r="1.5" fill="rgba(148,163,184,0.28)" />
          <line x1="16.7" y1="10.3" x2="18.1" y2="10.3" />
        </g>
      );
    case 'tablet':
      return (
        <g>
          <rect x="24.2" y="21.6" width="6" height="7.6" rx="0.9" fill="#1e293b" stroke={palette.trim} strokeWidth="0.5" />
          <rect x="25" y="22.5" width="4.4" height="5.6" rx="0.4" fill="#0ea5e9" opacity="0.75" />
          <path d="M 25.4 26.8 L 26.6 25 L 27.6 26 L 29 23.6" stroke="#f8fafc" strokeWidth="0.4" fill="none" />
        </g>
      );
    case 'gps':
      return (
        <g>
          <line x1="28.6" y1="22.4" x2="28.6" y2="20" stroke="#0f172a" strokeWidth="0.7" strokeLinecap="round" />
          <rect x="25.4" y="22.2" width="4" height="6.4" rx="0.9" fill="#0f172a" stroke={palette.trim} strokeWidth="0.4" />
          <rect x="26" y="22.9" width="2.8" height="2.6" rx="0.3" fill="#029907" />
          <circle cx="27.4" cy="27" r="0.6" fill="#94a3b8" />
        </g>
      );
    case 'clipboard':
      return (
        <g>
          <rect x="24" y="21" width="6.2" height="8.4" rx="0.7" fill="#8b5a2b" />
          <rect x="24.7" y="22.2" width="4.8" height="6.6" fill="#f8fafc" />
          <rect x="25.9" y="20.5" width="2.4" height="1.4" rx="0.4" fill={palette.trim} />
          <line x1="25.3" y1="24" x2="28.9" y2="24" stroke="#94a3b8" strokeWidth="0.35" />
          <line x1="25.3" y1="25.4" x2="28.9" y2="25.4" stroke="#94a3b8" strokeWidth="0.35" />
          <line x1="25.3" y1="26.8" x2="27.9" y2="26.8" stroke="#94a3b8" strokeWidth="0.35" />
        </g>
      );
    default:
      return null;
  }
}

/** Piernas + calzado según atuendo. */
function Legs({ outfit }) {
  const pants = outfit === 'field' ? '#57534e' : outfit === 'suit' ? '#111827' : '#1e293b';
  const shoes = outfit === 'field' ? '#3f2a1a' : '#090d16';
  return (
    <g>
      <rect x="11" y="28" width="4.5" height="14" rx="2" fill={pants} />
      <rect x="18.5" y="28" width="4.5" height="14" rx="2" fill={pants} />
      <ellipse cx="13" cy="42" rx={outfit === 'field' ? 3.8 : 3.5} ry={outfit === 'field' ? 2.3 : 2} fill={shoes} />
      <ellipse cx="21" cy="42" rx={outfit === 'field' ? 3.8 : 3.5} ry={outfit === 'field' ? 2.3 : 2} fill={shoes} />
    </g>
  );
}

/** Torso + detalle del atuendo. */
function Torso({ outfit, palette, torsoStroke, torsoStrokeWidth, glowFilter }) {
  switch (outfit) {
    case 'suit':
      return (
        <g>
          <path d={TORSO_PATH} fill={palette.outfit} stroke={torsoStroke} strokeWidth={torsoStrokeWidth} filter={glowFilter} />
          <polygon points="13.2,16 17,24 20.8,16" fill="#f8fafc" />
          <polygon points="16.2,17.6 17.8,17.6 17.5,23.4 17,24.4 16.5,23.4" fill={palette.trim} />
          <path d="M 13.2 16 L 17 24 L 12.4 19.2 Z" fill={palette.outfitShade} />
          <path d="M 20.8 16 L 17 24 L 21.6 19.2 Z" fill={palette.outfitShade} />
        </g>
      );
    case 'field':
      return (
        <g>
          <path d={TORSO_PATH} fill={palette.outfit} stroke={torsoStroke} strokeWidth={torsoStrokeWidth} filter={glowFilter} />
          <polygon points="14,16 17,20.5 20,16" fill="#e7e5e4" />
          <rect x="9.9" y="27.4" width="14.2" height="1.2" fill={palette.trim} opacity="0.95" />
          <rect x="11" y="17.8" width="3.4" height="3" rx="0.4" fill={palette.outfitShade} />
          <rect x="19.6" y="17.8" width="3.4" height="3" rx="0.4" fill={palette.outfitShade} />
        </g>
      );
    case 'polo':
      return (
        <g>
          <path d={TORSO_PATH} fill={palette.outfit} stroke={torsoStroke} strokeWidth={torsoStrokeWidth} filter={glowFilter} />
          <polygon points="13.4,16 17,19.2 15.6,16" fill={palette.trim} />
          <polygon points="20.6,16 17,19.2 18.4,16" fill={palette.trim} />
          <line x1="17" y1="19.2" x2="17" y2="22" stroke={palette.outfitShade} strokeWidth="0.6" />
          <rect x="11" y="19" width="3.5" height="2" rx="0.5" fill={palette.trim} />
        </g>
      );
    case 'lab':
      return (
        <g>
          <path d="M 8 16 L 26 16 L 24.6 32 L 9.4 32 Z" fill="#f1f5f9" stroke={torsoStroke} strokeWidth={torsoStrokeWidth} filter={glowFilter} />
          <polygon points="13.6,16 17,23 20.4,16" fill={palette.outfit} />
          <line x1="17" y1="23" x2="17" y2="31.6" stroke="#cbd5e1" strokeWidth="0.5" />
          <rect x="19.4" y="19.4" width="3.6" height="2.8" rx="0.4" fill="#e2e8f0" />
          <rect x="21.6" y="18.4" width="0.7" height="2.4" rx="0.3" fill={palette.trim} />
        </g>
      );
    case 'vest':
    default:
      return (
        <g>
          {/* Chaleco institucional SERAM */}
          <path d={TORSO_PATH} fill={palette.outfit} stroke={torsoStroke} strokeWidth={torsoStrokeWidth} filter={glowFilter} />
          {/* Cuello de camisa ejecutiva interior */}
          <polygon points="14,16 17,21 20,16" fill="#f8fafc" />
          {/* Bordado institucional en el pecho */}
          <rect x="11" y="19" width="3.5" height="2" rx="0.5" fill={palette.trim} />
        </g>
      );
  }
}

function Arms({ outfit, palette }) {
  if (outfit === 'polo' || outfit === 'field') {
    // Manga corta / remangada: antebrazo en tono de piel
    const sleeve = palette.outfit;
    return (
      <g>
        <rect x="6" y="17" width="3.5" height="10" rx="1.5" fill={palette.skinHands} />
        <rect x="24.5" y="17" width="3.5" height="10" rx="1.5" fill={palette.skinHands} />
        <rect x="6" y="17" width="3.5" height="4.6" rx="1.5" fill={sleeve} />
        <rect x="24.5" y="17" width="3.5" height="4.6" rx="1.5" fill={sleeve} />
      </g>
    );
  }
  const sleeve = outfit === 'lab' ? '#f1f5f9' : palette.outfit;
  return (
    <g>
      <rect x="6" y="17" width="3.5" height="10" rx="1.5" fill={sleeve} />
      <rect x="24.5" y="17" width="3.5" height="10" rx="1.5" fill={sleeve} />
    </g>
  );
}

/**
 * Avatar 2.5D por capas.
 * @param {object}  props.config      avatarConfig (se normaliza internamente)
 * @param {number}  [props.scale=1]   multiplicador sobre 34×48
 * @param {number}  [props.size]      alto en px (prioridad sobre scale)
 * @param {string}  [props.initials]  iniciales a bordar en el pecho
 * @param {boolean} [props.isOnline=true]
 * @param {boolean} [props.isCurrent=false]
 * @param {boolean} [props.isWalking=false]
 * @param {boolean} [props.isWorking=false]
 * @param {'left'|'right'} [props.facing='right']
 */
export default function PartnerAvatar25D({
  config,
  scale = 1,
  size,
  initials = '',
  isOnline = true,
  isCurrent = false,
  isWalking = false,
  isWorking = false,
  facing = 'right',
  className = '',
  title
}) {
  const filterId = `avatar-glow-${useId().replace(/:/g, '')}`;
  const palette = resolveAvatarPalette(config);
  const cfg = palette.config;

  const height = size || VIEW_H * scale;
  const width = (height / VIEW_H) * VIEW_W;

  const torsoStroke = isCurrent ? '#fbbf24' : palette.trim;
  const torsoStrokeWidth = isCurrent ? '1.6' : '1.2';
  const glowFilter = palette.trimGlow ? `url(#${filterId})` : undefined;
  const flip = facing === 'left' ? `translate(${VIEW_W} 0) scale(-1 1)` : undefined;
  const initialsFill = cfg.outfit === 'lab' ? palette.outfit : palette.trim;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={`overflow-visible ${className}`}
      style={isOnline ? undefined : { filter: 'saturate(0.45)' }}
      role="img"
      aria-label={title || `Avatar ${initials}`.trim()}
      data-walking={isWalking ? 'true' : undefined}
      data-working={isWorking ? 'true' : undefined}
    >
      <defs>
        {palette.trimGlow && (
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="0.9" floodColor={palette.trim} floodOpacity="0.9" />
          </filter>
        )}
      </defs>

      <style>{`
        @keyframes avatarWalkBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.4px); }
        }
        @keyframes avatarWorkType {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.6px); }
        }
        .avatar-walk-anim { animation: avatarWalkBob 0.32s ease-in-out infinite; }
        .avatar-work-anim { animation: avatarWorkType 1.8s ease-in-out infinite; }
      `}</style>

      {/* Sombra proyectada sobre el parquet */}
      <ellipse cx="17" cy="45" rx="10" ry="3.5" fill={isOnline ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)'} />

      <g transform={flip} className={isWalking ? 'avatar-walk-anim' : isWorking ? 'avatar-work-anim' : ''}>
        <HairBack style={cfg.hairStyle} color={palette.hair} />
        <Legs outfit={cfg.outfit} />
        <Torso
          outfit={cfg.outfit}
          palette={palette}
          torsoStroke={torsoStroke}
          torsoStrokeWidth={torsoStrokeWidth}
          glowFilter={glowFilter}
        />
        <Arms outfit={cfg.outfit} palette={palette} />

        {/* Manos */}
        <g className={isWorking ? 'animate-pulse' : ''}>
          <circle cx="7.7" cy="27.5" r="2" fill={palette.skinHands} />
          <circle cx="26.3" cy="27.5" r="2" fill={palette.skinHands} />
        </g>

        {/* Cabeza */}
        <ellipse cx="17" cy="10" rx="6" ry="6.5" fill={palette.skinHead} />

        {/* Mirada sutil hacia donde se orienta */}
        <circle cx="15.6" cy="10.6" r="0.55" fill="#1e293b" opacity="0.8" />
        <circle cx="19.8" cy="10.6" r="0.55" fill="#1e293b" opacity="0.8" />

        <FacialHair type={cfg.facialHair} color={palette.hair} />
        <HairFront style={cfg.hairStyle} color={palette.hair} />
        <Headwear type={cfg.headwear} palette={palette} />
        <Accessory type={cfg.accessory} palette={palette} />
      </g>

      {/* Insignia de iniciales en el pecho (fuera del espejo para que siga legible) */}
      {initials && (
        <text x="17" y="27" textAnchor="middle" fill={initialsFill} fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
          {initials}
        </text>
      )}
    </svg>
  );
}

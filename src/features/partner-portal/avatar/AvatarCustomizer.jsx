import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RotateCcw, Save, Lock, Check, Shirt, User, Scissors,
  ShieldCheck, Eye, EyeOff, Footprints, Armchair, Flame
} from 'lucide-react';
import PixelPartnerAvatar from './PixelPartnerAvatar';
import {
  SKIN_TONES,
  HAIR_COLORS,
  HAIR_STYLES,
  FACIAL_HAIR,
  OUTFITS,
  OUTFIT_COLORS,
  TRIM_COLORS,
  HEADWEAR,
  ACCESSORIES,
  EQUIPMENTS,
  AURAS,
  isOptionUnlocked,
  getUnlockLabel,
  normalizeAvatarConfig,
  getDefaultAvatarConfig
} from './avatarCatalog';

const TABS = [
  { id: 'outfit', label: 'Atuendo', icon: Shirt },
  { id: 'hair', label: 'Cabello', icon: Scissors },
  { id: 'body', label: 'Rasgos', icon: User },
  { id: 'gear', label: 'Equipo', icon: ShieldCheck },
  { id: 'aura', label: 'Aura', icon: Flame }
];

export default function AvatarCustomizer({
  config,
  onChange,
  onSave,
  onReset,
  isReadOnly = false,
  progress = { level: 1, fieldMissions: 0 },
  partnerName = 'Socio',
  initials = '',
  email = ''
}) {
  const [activeTab, setActiveTab] = useState('outfit');
  const [previewFacing, setPreviewFacing] = useState('down');
  const [animState, setAnimState] = useState('idle'); // 'idle' | 'walk' | 'sit'
  const [previewZoom, setPreviewZoom] = useState(false);

  const safeConfig = normalizeAvatarConfig(config, { email });

  const handleSelectOption = (field, optionId) => {
    if (isReadOnly) return;
    if (!isOptionUnlocked(field, optionId, progress)) return;
    const updated = {
      ...safeConfig,
      [field]: optionId
    };
    if (onChange) onChange(updated);
  };

  const handleResetToDefault = () => {
    if (isReadOnly) return;
    const def = getDefaultAvatarConfig(email);
    if (onChange) onChange(def);
    if (onReset) onReset();
  };

  return (
    <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Cabecera del Personalizador */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
              Personalizador de Avatar Pixel-Art HD
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300">
              Oficina Virtual Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isReadOnly
              ? `Visualizando avatar oficial de ${partnerName}. (Modo solo lectura)`
              : 'Configura tu atuendo, fisonomía, equipo y aura. Los cambios se proyectan en tiempo real en la oficina virtual.'}
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Restablecer configuración institucional por defecto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restablecer
            </button>
            {onSave && (
              <button
                type="button"
                onClick={() => onSave(safeConfig)}
                className="neuform-btn-primary px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Guardar Atuendo
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── COLUMNA IZQUIERDA: ESCENARIO PIXEL-ART DE PREVIEW EN VIVO ── */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-3">
          <div className="relative w-full max-w-[320px] h-[300px] rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-950 to-black border border-white/10 p-4 flex flex-col items-center justify-center overflow-hidden group shadow-2xl">
            {/* Grid Isométrico de Fondo */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />

            {/* Foco de luz cálido superior */}
            <div className="absolute top-0 w-36 h-24 bg-amber-400/15 blur-2xl rounded-full pointer-events-none" />

            {/* Baldosa isométrica de parquet SERAM */}
            <div className="absolute bottom-10 w-52 h-24 rounded-[50%] bg-gradient-to-tr from-[#2d1b0d]/90 via-[#452712]/50 to-[#8c531b]/20 border border-amber-500/30 transform -rotate-x-60 shadow-[0_18px_40px_rgba(0,0,0,0.85)]" />

            {/* Avatar Pixel-Art HD con animación en vivo */}
            <motion.div
              animate={
                animState === 'idle'
                  ? { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' } }
                  : { y: 0 }
              }
              className="relative z-10 filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.8)]"
            >
              <PixelPartnerAvatar
                config={safeConfig}
                facing={previewFacing}
                isWalking={animState === 'walk'}
                isSitting={animState === 'sit'}
                isWorking={animState === 'sit'}
                isOnline={true}
                isCurrent={true}
                size={previewZoom ? 104 : 80}
                initials={initials}
                title={`Avatar Pixel-Art de ${partnerName}`}
              />
            </motion.div>

            {/* Badge de Atuendo & Zoom flotante */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-400">
              <span className="font-mono text-[10px] text-amber-300 font-bold">
                {safeConfig.outfit.toUpperCase()} · {safeConfig.trim.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setPreviewZoom(p => !p)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={previewZoom ? 'Alejar zoom (1x)' : 'Acercar zoom HD (1.3x)'}
              >
                {previewZoom ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Selector Interactivo de Postura / Animación */}
          <div className="w-full max-w-[320px] bg-slate-900/90 border border-white/10 rounded-xl p-1.5 flex items-center gap-1">
            {[
              { id: 'idle', label: 'De Pie', icon: User },
              { id: 'walk', label: 'Caminando', icon: Footprints },
              { id: 'sit', label: 'En Escritorio', icon: Armchair }
            ].map(posture => {
              const Icon = posture.icon;
              const isActive = animState === posture.id;
              return (
                <button
                  key={posture.id}
                  type="button"
                  onClick={() => setAnimState(posture.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Ver animación: ${posture.label}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{posture.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selector Interactivo de Dirección 4-Way */}
          <div className="w-full max-w-[320px] bg-slate-900/80 border border-white/10 rounded-xl p-1.5 flex items-center justify-between gap-1 text-[11px]">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 pl-1">
              Vista:
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: 'down', label: 'Frente', arrow: '↓' },
                { id: 'up', label: 'Espalda', arrow: '↑' },
                { id: 'left', label: 'Izquierda', arrow: '←' },
                { id: 'right', label: 'Derecha', arrow: '→' }
              ].map(dir => (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => setPreviewFacing(dir.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    previewFacing === dir.id
                      ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Orientación: ${dir.label}`}
                >
                  <span className="font-mono">{dir.arrow}</span> {dir.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-mono">
            {initials ? `Insignia SERAM: ${initials}` : ''}
          </p>
        </div>

        {/* ── COLUMNA DERECHA: PESTAÑAS Y CATÁLOGO CON SPRITES PIXEL-ART ── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navegación por Pestañas */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/[0.08]">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/[0.06] min-h-[300px]">
            <AnimatePresence mode="wait">
              {/* ── PESTAÑA: ATUENDO ── */}
              {activeTab === 'outfit' && (
                <motion.div
                  key="tab-outfit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Tipo de Atuendo Oficial
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {OUTFITS.map(item => {
                        const isSelected = safeConfig.outfit === item.id;
                        const unlocked = isOptionUnlocked('outfit', item.id, progress);
                        const unlockLabel = getUnlockLabel('outfit', item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={isReadOnly || !unlocked}
                            onClick={() => handleSelectOption('outfit', item.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400/15 border-amber-400 text-white shadow-md shadow-amber-400/10'
                                : unlocked
                                  ? 'bg-black/30 border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/5'
                                  : 'bg-black/20 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            {/* Miniatura Pixel-Art del Atuendo */}
                            <div className="w-10 h-11 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, outfit: item.id }}
                                size={28}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                                  {item.name}
                                  {!unlocked && <Lock className="w-3 h-3 text-amber-400/80 shrink-0" />}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                              {!unlocked && unlockLabel && (
                                <span className="text-[9px] text-amber-400/90 font-mono mt-1 block">
                                  Requisito: {unlockLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color de Tela Institucional */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Color de Tela Institucional
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {OUTFIT_COLORS.map(c => {
                        const isSelected = safeConfig.outfitColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleSelectOption('outfitColor', c.id)}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white'
                                : 'border-white/10 bg-black/30 text-slate-400 hover:border-white/25'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-xs truncate font-medium">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ribete & Rango */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Ribete & Detalles de Rango
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TRIM_COLORS.map(t => {
                        const isSelected = safeConfig.trim === t.id;
                        const unlocked = isOptionUnlocked('trim', t.id, progress);
                        const unlockLabel = getUnlockLabel('trim', t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={isReadOnly || !unlocked}
                            onClick={() => handleSelectOption('trim', t.id)}
                            className={`p-2 rounded-xl border flex flex-col items-start gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-400 hover:border-white/25'
                                  : 'border-white/5 bg-black/20 text-slate-600 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-2 w-full justify-between">
                              <span
                                className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                                style={{ backgroundColor: t.hex }}
                              />
                              {!unlocked && <Lock className="w-3 h-3 text-amber-400" />}
                            </div>
                            <span className="text-xs truncate font-medium">{t.name}</span>
                            {!unlocked && unlockLabel && (
                              <span className="text-[9px] text-amber-400 font-mono">
                                {unlockLabel}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── PESTAÑA: CABELLO & ROSTRO ── */}
              {activeTab === 'hair' && (
                <motion.div
                  key="tab-hair"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  {/* Corte y Peinado */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Corte y Peinado
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {HAIR_STYLES.map(s => {
                        const isSelected = safeConfig.hairStyle === s.id;
                        const unlocked = isOptionUnlocked('hairStyle', s.id, progress);
                        const unlockLabel = getUnlockLabel('hairStyle', s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={isReadOnly || !unlocked}
                            onClick={() => handleSelectOption('hairStyle', s.id)}
                            className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold shadow-md shadow-amber-400/10'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25 hover:bg-white/5'
                                  : 'border-white/5 bg-black/20 text-slate-600 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-10 h-11 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, hairStyle: s.id }}
                                size={28}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs truncate font-bold text-white">{s.name || s.label}</span>
                                {!unlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              </div>
                              {s.desc && <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{s.desc}</p>}
                              {!unlocked && unlockLabel && (
                                <span className="text-[9px] text-amber-400 font-mono block mt-0.5">
                                  {unlockLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color de Cabello y Canas */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Color de Cabello & Canas Distinguidas
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {HAIR_COLORS.map(c => {
                        const isSelected = safeConfig.hairColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleSelectOption('hairColor', c.id)}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white'
                                : 'border-white/10 bg-black/30 text-slate-400 hover:border-white/25'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                              style={{ backgroundColor: c.id }}
                            />
                            <span className="text-xs truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vello Facial */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Vello Facial & Barbas Ejecutivas
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FACIAL_HAIR.map(f => {
                        const isSelected = safeConfig.facialHair === f.id;
                        const unlocked = isOptionUnlocked('facialHair', f.id, progress);
                        const unlockLabel = getUnlockLabel('facialHair', f.id);
                        return (
                          <button
                            key={f.id}
                            type="button"
                            disabled={isReadOnly || !unlocked}
                            onClick={() => handleSelectOption('facialHair', f.id)}
                            className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold shadow-md shadow-amber-400/10'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25 hover:bg-white/5'
                                  : 'border-white/5 bg-black/20 text-slate-600 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-10 h-11 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, facialHair: f.id }}
                                size={28}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs truncate font-bold text-white">{f.name || f.label}</span>
                                {!unlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              </div>
                              {f.desc && <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{f.desc}</p>}
                              {!unlocked && unlockLabel && (
                                <span className="text-[9px] text-amber-400 font-mono block mt-0.5">
                                  {unlockLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── PESTAÑA: RASGOS / TONO DE PIEL & FISONOMÍA ── */}
              {activeTab === 'body' && (
                <motion.div
                  key="tab-body"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Tono de Piel & Fisonomía
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {SKIN_TONES.map(t => {
                        const isSelected = safeConfig.skinTone === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleSelectOption('skinTone', t.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                                : 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                            }`}
                          >
                            <div className="w-9 h-11 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, skinTone: t.id }}
                                size={28}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                                  style={{ backgroundColor: t.head }}
                                />
                                <span className="text-xs block font-bold truncate">{t.name}</span>
                              </div>
                              <span className="text-[9px] text-slate-400 block font-mono mt-0.5">
                                {t.id === 'classic' ? 'Sprite original' : 'Realista'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vello Facial y Barbas en Rasgos */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Vello Facial & Barbas Ejecutivas
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FACIAL_HAIR.map(f => {
                        const isSelected = safeConfig.facialHair === f.id;
                        const unlocked = isOptionUnlocked('facialHair', f.id, progress);
                        const unlockLabel = getUnlockLabel('facialHair', f.id);
                        return (
                          <button
                            key={f.id}
                            type="button"
                            disabled={isReadOnly || !unlocked}
                            onClick={() => handleSelectOption('facialHair', f.id)}
                            className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold shadow-md shadow-amber-400/10'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25 hover:bg-white/5'
                                  : 'border-white/5 bg-black/20 text-slate-600 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-10 h-11 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, facialHair: f.id }}
                                size={28}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs truncate font-bold text-white">{f.name || f.label}</span>
                                {!unlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              </div>
                              {f.desc && <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{f.desc}</p>}
                              {!unlocked && unlockLabel && (
                                <span className="text-[9px] text-amber-400 font-mono block mt-0.5">
                                  {unlockLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── PESTAÑA: EQUIPO & ACCESORIOS ── */}
              {activeTab === 'gear' && (
                <motion.div
                  key="tab-gear"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  {/* Casco / Sombrero */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Casco / Sombrero Técnico
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {HEADWEAR.map(h => {
                        const isSelected = safeConfig.headwear === h.id;
                        const unlocked = isOptionUnlocked('headwear', h.id, progress);
                        const unlockLabel = getUnlockLabel('headwear', h.id);
                        return (
                          <button
                            key={h.id}
                            type="button"
                            disabled={isReadOnly || !unlocked}
                            onClick={() => handleSelectOption('headwear', h.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                                  : 'border-white/5 bg-black/20 text-slate-500 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-9 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, headwear: h.id }}
                                size={26}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs truncate">{h.name}</span>
                                {!unlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                              </div>
                              {!unlocked && unlockLabel && (
                                <span className="text-[9px] text-amber-400 font-mono block mt-0.5">
                                  {unlockLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accesorios */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Herramienta & Accesorio de Trabajo
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ACCESSORIES.map(a => {
                        const isSelected = safeConfig.accessory === a.id;
                        const unlocked = isOptionUnlocked('accessory', a.id, progress);
                        const unlockLabel = getUnlockLabel('accessory', a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            disabled={isReadOnly || !unlocked}
                            onClick={() => handleSelectOption('accessory', a.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                                  : 'border-white/5 bg-black/20 text-slate-500 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-9 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, accessory: a.id }}
                                size={26}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs truncate">{a.name}</span>
                                {!unlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                              </div>
                              {!unlocked && unlockLabel && (
                                <span className="text-[9px] text-amber-400 font-mono block mt-0.5">
                                  {unlockLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Equipamiento Técnico */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Equipamiento Institucional
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EQUIPMENTS.map(eq => {
                        const isSelected = safeConfig.equipment === eq.id;
                        return (
                          <button
                            key={eq.id}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleSelectOption('equipment', eq.id)}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                                : 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                            }`}
                          >
                            <div className="w-8 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, equipment: eq.id }}
                                size={24}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <span className="text-xs truncate">{eq.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── PESTAÑA: AURA DE RESONANCIA & MAESTRÍA ── */}
              {activeTab === 'aura' && (
                <motion.div
                  key="tab-aura"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Aura de Resonancia & Maestría Octalysis
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {AURAS.map(au => {
                        const isSelected = safeConfig.aura === au.id;
                        const unlocked = isOptionUnlocked('aura', au.id, progress);
                        const unlockLabel = getUnlockLabel('aura', au.id);
                        return (
                          <button
                            key={au.id}
                            type="button"
                            disabled={isReadOnly || !unlocked}
                            onClick={() => handleSelectOption('aura', au.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold shadow-md shadow-amber-400/10'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                                  : 'border-white/5 bg-black/20 text-slate-500 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-10 h-11 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                              <PixelPartnerAvatar
                                config={{ ...safeConfig, aura: au.id }}
                                size={28}
                                facing="down"
                                isOnline={true}
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold truncate flex items-center gap-1.5">
                                  {au.color && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                      style={{ backgroundColor: au.color }}
                                    />
                                  )}
                                  {au.name}
                                </span>
                                {!unlocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              </div>
                              {!unlocked && unlockLabel && (
                                <span className="text-[9px] text-amber-400 font-mono block mt-1">
                                  Requisito: {unlockLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RotateCcw, Save, Lock, Check, Shirt, User, Scissors,
  ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import PartnerAvatar25D from './PartnerAvatar25D';
import {
  AVATAR_FIELDS,
  SKIN_TONES,
  HAIR_COLORS,
  HAIR_STYLES,
  FACIAL_HAIR,
  OUTFITS,
  OUTFIT_COLORS,
  TRIM_COLORS,
  HEADWEAR,
  ACCESSORIES,
  isOptionUnlocked,
  getUnlockLabel,
  normalizeAvatarConfig,
  getDefaultAvatarConfig
} from './avatarCatalog';

const TABS = [
  { id: 'outfit', label: 'Atuendo', icon: Shirt },
  { id: 'hair', label: 'Cabello', icon: Scissors },
  { id: 'body', label: 'Rasgos', icon: User },
  { id: 'gear', label: 'Equipo', icon: ShieldCheck }
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
  const [previewFacing, setPreviewFacing] = useState('right');
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
    <div className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Cabecera del Personalizador */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
              Personalizador de Avatar 2.5D
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300">
              Oficina Virtual Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isReadOnly
              ? `Visualizando avatar oficial de ${partnerName}. (Modo solo lectura)`
              : 'Configura tu atuendo, fisonomía y equipo. Los cambios se proyectan en tiempo real en la oficina virtual.'}
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
        {/* ── COLUMNA IZQUIERDA: ESCENARIO 2.5D DE PREVIEW EN VIVO ── */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[280px] h-[280px] rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border border-white/10 p-4 flex flex-col items-center justify-center overflow-hidden group shadow-2xl">
            {/* Grid Isométrico de Fondo */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Foco de luz superior */}
            <div className="absolute top-0 w-32 h-20 bg-amber-400/10 blur-2xl rounded-full pointer-events-none" />

            {/* Baldosa isométrica de parquet con reflejo */}
            <div className="absolute bottom-10 w-44 h-20 rounded-[50%] bg-gradient-to-tr from-amber-950/60 via-amber-900/30 to-amber-700/20 border border-amber-500/30 transform -rotate-x-60 shadow-[0_15px_35px_rgba(0,0,0,0.8)]" />

            {/* Avatar 2.5D con respiración suave */}
            <motion.div
              animate={{
                y: [0, -3, 0],
                transition: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
              }}
              className="relative z-10 filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.7)]"
            >
              <PartnerAvatar25D
                config={safeConfig}
                scale={previewZoom ? 4.2 : 3.4}
                initials={initials}
                facing={previewFacing}
                isOnline={true}
                isCurrent={true}
                title={`Avatar de ${partnerName}`}
              />
            </motion.div>

            {/* Controles de vista previa flotantes */}
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between px-2 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-400">
              <span className="font-mono text-[10px] text-amber-300">
                {safeConfig.outfit.toUpperCase()} · {safeConfig.trim.toUpperCase()}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewFacing(p => (p === 'right' ? 'left' : 'right'))}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title="Girar orientación (espejo)"
                >
                  ⇄ {previewFacing === 'right' ? 'Derecha' : 'Izquierda'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(p => !p)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title={previewZoom ? 'Alejar zoom' : 'Acercar zoom'}
                >
                  {previewZoom ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-2.5 font-mono">
            {initials ? `Insignia de pecho: ${initials}` : ''}
          </p>
        </div>

        {/* ── COLUMNA DERECHA: PESTAÑAS Y CATÁLOGO DE OPCIONES ── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navegación por Pestañas */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/[0.08]">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/[0.06] min-h-[260px]">
            <AnimatePresence mode="wait">
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
                            className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400/15 border-amber-400 text-white shadow-md shadow-amber-400/10'
                                : unlocked
                                  ? 'bg-black/30 border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/5'
                                  : 'bg-black/20 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                {item.name}
                                {!unlocked && <Lock className="w-3 h-3 text-amber-400/80" />}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
                            {!unlocked && unlockLabel && (
                              <span className="text-[9px] text-amber-400/90 font-mono mt-1 block">
                                Requisito: {unlockLabel}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color del Atuendo */}
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
                                ? 'border-amber-400 bg-amber-400/10 text-white'
                                : 'border-white/10 bg-black/30 text-slate-400 hover:border-white/25'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-xs truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color de Ribetes / Detalles */}
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
                                ? 'border-amber-400 bg-amber-400/10 text-white'
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

              {activeTab === 'hair' && (
                <motion.div
                  key="tab-hair"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  {/* Estilo de Cabello */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Corte y Peinado
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HAIR_STYLES.map(s => {
                        const isSelected = safeConfig.hairStyle === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleSelectOption('hairStyle', s.id)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                                : 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                            }`}
                          >
                            <span className="text-xs">{s.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color de Cabello */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Color de Cabello
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
                                ? 'border-amber-400 bg-amber-400/10 text-white'
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
                      Vello Facial
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {FACIAL_HAIR.map(f => {
                        const isSelected = safeConfig.facialHair === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleSelectOption('facialHair', f.id)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                                : 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                            }`}
                          >
                            <span className="text-xs">{f.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'body' && (
                <motion.div
                  key="tab-body"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                      Tono de Piel
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
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white'
                                : 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full border border-white/40 shrink-0"
                              style={{ backgroundColor: t.head }}
                            />
                            <div className="text-left">
                              <span className="text-xs block font-bold">{t.name}</span>
                              <span className="text-[9px] text-slate-400 block font-mono">
                                {t.id === 'classic' ? 'Sprite original' : 'Realista'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

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
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                                  : 'border-white/5 bg-black/20 text-slate-500 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs">{h.name}</span>
                              {!unlocked && <Lock className="w-3 h-3 text-amber-400" />}
                            </div>
                            {!unlocked && unlockLabel && (
                              <span className="text-[9px] text-amber-400 font-mono block mt-1">
                                {unlockLabel}
                              </span>
                            )}
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
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                                : unlocked
                                  ? 'border-white/10 bg-black/30 text-slate-300 hover:border-white/25'
                                  : 'border-white/5 bg-black/20 text-slate-500 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs">{a.name}</span>
                              {!unlocked && <Lock className="w-3 h-3 text-amber-400" />}
                            </div>
                            {!unlocked && unlockLabel && (
                              <span className="text-[9px] text-amber-400 font-mono block mt-1">
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
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

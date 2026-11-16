import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Play, CheckCircle2, MapPin, ShieldCheck, Activity, Mail, Send
} from 'lucide-react';
import RotatingVegetation from '../ui/RotatingVegetation';

// Re-export useSeramSeo from the standalone hook for full backwards compatibility
export { useSeramSeo } from '../../hooks/useSeramSeo';

/* ═══════════════════════════════════════════════════════════════════════════
   ARQUITECTURA EDITORIAL SERAM (CLARA, LUMINOSA Y EN BLOQUES)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * 1. EditorialHeroSection
 * Hero editorial luminoso (#f9f9f9) con imagen de fondo, degradado direccional,
 * kicker plano tracked, H1 en #1a1c1c, 2 CTAs rectangulares y detalle botánico sutil.
 */
export function EditorialHeroSection({
  kicker,
  title,
  titleAccent,
  description,
  backgroundImage,
  backgroundAlt,
  primaryCtaLabel,
  onPrimaryCta,
  secondaryCtaLabel,
  onSecondaryCta,
  secondaryTo
}) {
  return (
    <header className="relative min-h-[78vh] flex items-center bg-[#f9f9f9] overflow-hidden border-b border-[#bdcbb4]/60">
      {/* Imagen temática de fondo + degradado direccional limpio */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={backgroundImage}
          alt={backgroundAlt}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f9f9f9] via-[#f9f9f9]/90 to-[#f9f9f9]/20" />
      </div>

      {/* Detalle sutil botánico en esquina derecha/inferior */}
      <div className="absolute -bottom-16 -right-16 pointer-events-none hidden lg:block opacity-25">
        <RotatingVegetation size={300} duration={32} opacity={0.35} />
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl space-y-6 text-left"
        >
          {kicker && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#126c0f]">
              {kicker}
            </p>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#1a1c1c] font-display">
            {title}
            {titleAccent && (
              <span className="text-[#126c0f] block mt-1">{titleAccent}</span>
            )}
          </h1>

          <p className="text-base sm:text-lg text-[#3e4a39] leading-relaxed max-w-xl">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {primaryCtaLabel && (
              <button
                type="button"
                onClick={onPrimaryCta}
                className="px-7 py-3.5 bg-[#126c0f] hover:bg-[#029907] text-white font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {secondaryCtaLabel && (
              secondaryTo ? (
                <Link
                  to={secondaryTo}
                  className="px-7 py-3.5 border-2 border-[#126c0f] text-[#126c0f] hover:bg-[#126c0f]/5 font-bold text-sm transition-colors inline-flex items-center gap-2"
                >
                  <span>{secondaryCtaLabel}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onSecondaryCta}
                  className="px-7 py-3.5 border-2 border-[#126c0f] text-[#126c0f] hover:bg-[#126c0f]/5 font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{secondaryCtaLabel}</span>
                </button>
              )
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
}

/**
 * 2. EditorialPillarsSection
 * Encabezado centrado con barra divisoria #126c0f y grilla de 3 tarjetas limpias.
 */
export function EditorialPillarsSection({
  title,
  subtitle,
  cards = [],
  bgClass = 'bg-[#ffffff]'
}) {
  return (
    <section className={`py-16 md:py-24 ${bgClass} border-b border-[#bdcbb4]/50`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-[#1a1c1c] font-display">
            {title}
          </h2>
          <div className="w-24 h-1 bg-[#126c0f] mx-auto" />
          <p className="text-sm sm:text-base text-[#3e4a39] leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.slice(0, 3).map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <motion.article
                key={card.id || idx}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                className="bg-white p-8 md:p-10 border border-[#bdcbb4] hover:border-[#126c0f] transition-all flex flex-col justify-between space-y-6 text-left"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#126c0f] text-white flex items-center justify-center">
                    {CardIcon && <CardIcon className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1c1c] font-display leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#3e4a39] leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {card.actionLabel && (
                  card.actionTo ? (
                    <Link
                      to={card.actionTo}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#126c0f] hover:text-[#029907] transition-colors pt-2"
                    >
                      <span>{card.actionLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={card.onAction}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#126c0f] hover:text-[#029907] transition-colors pt-2 cursor-pointer"
                    >
                      <span>{card.actionLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * 3. EditorialBentoSection
 * Grilla asimétrica 7/5 sobre #f9f9f9 con bloque verde #126c0f, 2 indicadores #eeeeee
 * e imagen temática full-height con detalle sutil de RotatingVegetation.
 */
export function EditorialBentoSection({
  kicker,
  title,
  description,
  ctaLabel,
  onCtaClick,
  stats = [],
  image,
  imageAlt,
  imageCaptionTitle,
  imageCaptionText,
  showVegetation = true
}) {
  return (
    <section className="py-16 md:py-24 bg-[#f9f9f9] border-b border-[#bdcbb4]/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Columna Izquierda: Bloque Sólido Verde + 2 Indicadores */}
          <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="bg-[#126c0f] text-white p-10 md:p-12 space-y-4 text-left flex-1 flex flex-col justify-center">
              {kicker && (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  {kicker}
                </p>
              )}
              <h2 className="text-2xl sm:text-3xl font-black font-display leading-tight">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                {description}
              </p>
              {ctaLabel && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onCtaClick}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white border-b border-white/60 hover:border-white pb-1 transition-colors cursor-pointer"
                  >
                    <span>{ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.slice(0, 2).map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-[#eeeeee] p-8 text-center border border-[#bdcbb4]/50"
                >
                  <p className="text-3xl sm:text-4xl font-black text-[#126c0f] font-display">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-[#3e4a39] mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Imagen temática full-height + cuadro decorativo sutil */}
          <div className="md:col-span-5 relative min-h-[380px] overflow-hidden border border-[#bdcbb4]/60 bg-[#eeeeee]">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
            {showVegetation && (
              <div className="absolute -top-10 -right-10 pointer-events-none opacity-30">
                <RotatingVegetation size={180} duration={28} opacity={0.35} />
              </div>
            )}
            {(imageCaptionTitle || imageCaptionText) && (
              <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-xl border border-[#126c0f]/20 p-5 text-left">
                {imageCaptionTitle && (
                  <p className="text-xs font-bold uppercase tracking-wider text-[#126c0f]">
                    {imageCaptionTitle}
                  </p>
                )}
                {imageCaptionText && (
                  <p className="text-sm text-[#1a1c1c] font-medium mt-1 leading-snug">
                    {imageCaptionText}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 4. EditorialShowcaseSection
 * Fondo #f4f3f3, encabezado con enlace subrayado, imagen 16:10 con overlay oscuro
 * y 3 bloques verticales limpios con borde izquierdo.
 */
export function EditorialShowcaseSection({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionTo,
  featuredImage,
  featuredAlt,
  featuredKicker,
  featuredTitle,
  items = []
}) {
  return (
    <section className="py-16 md:py-24 bg-[#f4f3f3] border-b border-[#bdcbb4]/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1a1c1c] font-display">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-[#3e4a39] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {actionLabel && (
            actionTo ? (
              <Link
                to={actionTo}
                className="border-b-2 border-[#126c0f] text-[#126c0f] hover:text-[#029907] hover:border-[#029907] font-bold text-sm pb-1 inline-flex items-center gap-1.5 transition-colors self-start md:self-auto"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onAction}
                className="border-b-2 border-[#126c0f] text-[#126c0f] hover:text-[#029907] hover:border-[#029907] font-bold text-sm pb-1 inline-flex items-center gap-1.5 transition-colors self-start md:self-auto cursor-pointer"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Izquierda: Recurso destacado 16:10 */}
          <div className="relative aspect-[16/10] overflow-hidden bg-[#1a1c1c] border border-[#bdcbb4]/60">
            <img
              src={featuredImage}
              alt={featuredAlt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left">
              {featuredKicker && (
                <span className="text-xs font-bold uppercase tracking-wider text-[#00e03c]">
                  {featuredKicker}
                </span>
              )}
              <h4 className="text-xl sm:text-2xl font-black text-white mt-1 font-display">
                {featuredTitle}
              </h4>
            </div>
          </div>

          {/* Derecha: 3 bloques verticales limpios */}
          <div className="space-y-7 text-left">
            {items.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className={`border-l-4 pl-5 py-1 ${
                  idx === 0 ? 'border-[#126c0f]' : 'border-[#bdcbb4]'
                }`}
              >
                <h4 className="text-lg font-bold text-[#1a1c1c] font-display">
                  {item.title}
                </h4>
                <p className="text-sm text-[#3e4a39] mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 5. EditorialConnectSection
 * Panel dividido (1/3 #126c0f + 2/3 formulario limpio blanco) sin recarga de página.
 */
export function EditorialConnectSection({
  title = 'Conectemos',
  subtitle = 'Cuéntanos sobre tu proyecto u organización en Bolivia. Te orientamos con claridad técnica y normativa.',
  email = 'contacto@seram-srl.com',
  location = 'Santa Cruz de la Sierra · Bolivia',
  interestOptions = [],
  defaultInterest = '',
  submitLabel = 'Enviar Consulta',
  onConnectSubmit
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: defaultInterest || interestOptions[0] || 'Consultoría Ambiental',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (onConnectSubmit) {
      onConnectSubmit(formData);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#f9f9f9]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="bg-white shadow-xl border border-[#bdcbb4]/60 flex flex-col md:flex-row overflow-hidden text-left">
          {/* Izquierda: Bloque sólido Verde Oscuro SERAM */}
          <div className="md:w-1/3 bg-[#126c0f] text-white p-8 md:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black font-display">
                {title}
              </h2>
              <p className="text-sm text-white/90 leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/20 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/85 flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline break-all">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white/85 flex-shrink-0" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          {/* Derecha: Formulario rápido limpio */}
          <div className="md:w-2/3 bg-white p-8 md:p-10">
            {submitted ? (
              <div className="h-full flex flex-col justify-center items-start space-y-4 py-6">
                <div className="w-12 h-12 bg-[#126c0f]/10 text-[#126c0f] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1c] font-display">
                  Consulta recibida correctamente
                </h3>
                <p className="text-sm text-[#3e4a39] leading-relaxed">
                  Gracias, <span className="font-semibold text-[#1a1c1c]">{formData.name || 'estimado/a'}</span>. Hemos abierto nuestro asistente técnico para atender tu solicitud sobre <span className="font-semibold text-[#126c0f]">{formData.interest}</span> de forma inmediata.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold uppercase tracking-wider text-[#126c0f] hover:text-[#029907] border-b border-[#126c0f] pb-0.5 cursor-pointer"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3e4a39] mb-1.5">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tu nombre o empresa"
                      className="w-full px-4 py-2.5 bg-[#f9f9f9] border border-[#bdcbb4] text-sm text-[#1a1c1c] placeholder-[#3e4a39]/50 focus:outline-none focus:border-[#126c0f]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3e4a39] mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nombre@empresa.com"
                      className="w-full px-4 py-2.5 bg-[#f9f9f9] border border-[#bdcbb4] text-sm text-[#1a1c1c] placeholder-[#3e4a39]/50 focus:outline-none focus:border-[#126c0f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3e4a39] mb-1.5">
                    Servicio o programa de interés
                  </label>
                  <select
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f9f9f9] border border-[#bdcbb4] text-sm text-[#1a1c1c] focus:outline-none focus:border-[#126c0f]"
                  >
                    {(interestOptions.length > 0
                      ? interestOptions
                      : ['Licencias Ambientales FNCA', 'Registro Ambiental Industrial (RAI)', 'Plan EMAP Minería', 'SERAM Academy', 'SERAM Experience ESG']
                    ).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3e4a39] mb-1.5">
                    Mensaje
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Cuéntanos brevemente tu requerimiento, ubicación o plazo..."
                    className="w-full px-4 py-2.5 bg-[#f9f9f9] border border-[#bdcbb4] text-sm text-[#1a1c1c] placeholder-[#3e4a39]/50 focus:outline-none focus:border-[#126c0f]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-7 py-3.5 bg-[#126c0f] hover:bg-[#029907] text-white font-bold text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>{submitLabel}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * SECCIÓN 1 (Arquitectura ZENZE Reformada):
 * Hero arquitectónico sobrio sobre fondo sólido (#040905) combinado con imagen temática.
 * - Desacopla las tarjetas anidadas: la telemetría en vivo y la franja de KPIs se integran
 *   directamente en la grilla y el panel sin contenedores flotantes tipo tarjeta sobre tarjeta.
 * - Elimina la etiqueta/pill superior marcada como contaminación visual en referencia gráfica.
 * - Integra sutilmente vegetación rotativa y elementos de movimiento temáticos.
 */
export function ZenzeHeroSection({
  titleWhite,
  titleAccent,
  accentColorClass = 'text-[#00e03c]',
  buttonAccentClass = 'bg-[#00e03c] hover:bg-white text-slate-950 shadow-[0_0_25px_rgba(0,224,60,0.3)]',
  barColorClass = 'bg-[#00e03c]',
  backgroundImage,
  backgroundAlt,
  description,
  primaryCtaLabel,
  onPrimaryCta,
  secondaryCtaLabel,
  onSecondaryCta,
  livePanelTitle,
  livePanelCtaLabel = 'Diagnóstico →',
  onLivePanelCta,
  liveMetrics = [],
  kpis = [],
  scrollCueText = 'Desliza para explorar',
  showVegetation = false
}) {
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#040905]">
      {/* Fondo Visual Sólido + Overlays Cinematográficos */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={backgroundImage}
          alt={backgroundAlt}
          className="w-full h-full object-cover opacity-50 scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040905] via-[#040905]/85 to-[#040905]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040905] via-transparent to-[#040905]/70" />
      </div>

      {/* Vegetación Rotativa de Fondo (Ambiental) */}
      {showVegetation && (
        <div className="absolute -top-10 -right-10 pointer-events-none z-0 hidden lg:block opacity-40">
          <RotatingVegetation size={320} duration={30} opacity={0.3} />
        </div>
      )}

      {/* Contenido Principal del Hero Arquitectónico */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-14 pt-14 pb-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Copy Principal + Acciones (Sin píldora/etiqueta superior superflua) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] font-display">
              <span className="text-white block">{titleWhite}</span>
              <span className={`${accentColorClass} block mt-1`}>{titleAccent}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-light">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onPrimaryCta}
                className={`px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-200 cursor-pointer ${buttonAccentClass}`}
              >
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {secondaryCtaLabel && (
                <button
                  type="button"
                  onClick={onSecondaryCta}
                  className="px-5 py-3.5 rounded-full bg-black/45 hover:bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-2.5 transition-all duration-200 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span>{secondaryCtaLabel}</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Columna Derecha: Telemetría en Vivo Desacoplada (Sin tarjeta flotante anidada) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex lg:justify-end"
          >
            <div className="w-full max-w-sm lg:max-w-md p-5 sm:p-6 rounded-2xl bg-black/40 backdrop-blur-md border-l-2 border-[#00e03c]/60 space-y-4 text-left">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e03c] animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                    {livePanelTitle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLivePanelCta || onPrimaryCta}
                  className="text-[11px] font-bold text-slate-400 hover:text-[#00e03c] transition-colors cursor-pointer"
                >
                  {livePanelCtaLabel}
                </button>
              </div>

              <div className="space-y-4">
                {liveMetrics.map((m, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{m.label}</span>
                      <span className="text-white font-black font-mono">{m.value}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.barClass || barColorClass} transition-all duration-700`}
                        style={{ width: `${Math.min(100, Math.max(8, m.percent || 80))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Franja de 4 KPIs Desacoplada: Barra de telemetría limpia integrada directamente al panel */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-14 pb-6 space-y-4">
        <div className="w-full border-t border-white/[0.08] pt-4 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          {kpis.map((kpi, idx) => {
            const KpiIcon = kpi.icon || Activity;
            return (
              <div key={idx} className="p-3.5 sm:px-5 flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#00e03c]/10 border border-[#00e03c]/20 flex items-center justify-center flex-shrink-0">
                  <KpiIcon className={`w-5 h-5 ${accentColorClass}`} />
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-black text-white leading-none font-mono">{kpi.value}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{kpi.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-1 pt-1 text-slate-400">
          <div className="w-4 h-6 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-[#00e03c] animate-bounce" />
          </div>
          <span className="text-[10px] font-medium tracking-wider uppercase">{scrollCueText}</span>
        </div>
      </div>
    </section>
  );
}

/**
 * SECCIÓN 2: Pilares Arquitectónicos sobre fondo sólido (#060d07)
 */
export function ZenzePillarsSection({
  eyebrow = 'QUÉ HACEMOS',
  title,
  subtitle,
  accentColorClass = 'text-[#00e03c]',
  cards = []
}) {
  return (
    <section className="relative py-12 sm:py-16 px-6 sm:px-10 rounded-3xl bg-[#060d07] border border-white/[0.08] overflow-hidden">
      {/* Halo ambiental sutil */}
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#029907]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Encabezado asimétrico sobrio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end text-left">
          <div className="lg:col-span-7 space-y-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.25em] block font-tech ${accentColorClass}`}>
              {eyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight font-display">
              {title}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Grid de 4 Columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <motion.div
                key={card.id || idx}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                onClick={card.onAction}
                className="group rounded-2xl bg-[#0b150d] hover:bg-[#0f1d12] border border-white/[0.08] hover:border-[#00e03c]/45 p-6 flex flex-col justify-between space-y-6 transition-all duration-300 cursor-pointer text-left shadow-lg"
              >
                <div className="space-y-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${card.iconBgClass || 'bg-[#029907]/20 text-[#00e03c] border border-[#00e03c]/30'}`}>
                    <CardIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-[#00e03c] transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-300 transition-colors">
                    {card.actionLabel || 'Consultar'}
                  </span>
                  <span className="w-9 h-9 rounded-full border border-white/15 group-hover:border-[#00e03c] group-hover:bg-[#00e03c] text-slate-300 group-hover:text-slate-950 flex items-center justify-center transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * SECCIÓN 3: Panel Tecnológico sobre fondo sólido (#070f08)
 */
export function ZenzeTechOverviewSection({
  eyebrow = 'NUESTRA TECNOLOGÍA',
  title,
  description,
  checks = [],
  ctaLabel,
  onCtaClick,
  accentColorClass = 'text-[#00e03c]',
  buttonAccentClass = 'bg-[#00e03c] hover:bg-white text-slate-950 shadow-[0_0_25px_rgba(0,224,60,0.25)]',
  overviewTitle = 'SERAM Operations Overview',
  statsCol = { label1: 'Proyectos Activos', val1: '12', label2: 'Estudios Ambientales', val2: '6' },
  trendCard = { label: 'Eficiencia Regulatoria', value: '+34%', sub: 'vs trámite tradicional' },
  donutCard = { label: 'Cumplimiento Legal', percent: 98, statusText: 'Óptimo', leg1: 'Aprobado', leg2: 'En Revisión' },
  recentActivities = [],
  mapImage,
  mapPins = [],
  weatherWidget = { temp: '24°C', condition: 'Santa Cruz · Zona Operativa', metric1: 'Precisión: 2cm', metric2: 'Humedad: 68%', metric3: 'Cobertura: 100%' }
}) {
  const [selectedPinIdx, setSelectedPinIdx] = useState(0);
  const activePin = mapPins[selectedPinIdx] || mapPins[0];
  const strokeDasharray = 2 * Math.PI * 26;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * Math.min(100, donutCard.percent || 90)) / 100;

  return (
    <section className="relative py-12 sm:py-16 px-6 sm:px-10 rounded-3xl bg-[#070f08] border border-white/[0.08] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Columna Izquierda: Información + Checks */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="space-y-3">
            <span className={`text-[10px] font-black uppercase tracking-[0.25em] block font-tech ${accentColorClass}`}>
              {eyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight font-display">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              {description}
            </p>
          </div>

          <ul className="space-y-2.5">
            {checks.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${accentColorClass}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <button
              type="button"
              onClick={onCtaClick}
              className={`px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-200 cursor-pointer ${buttonAccentClass}`}
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Columna Derecha: Consola Dashboard SERAM */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[#050b06] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex text-left">
            {/* Rail lateral compacto */}
            <div className="w-11 sm:w-12 bg-[#030704] border-r border-white/[0.08] py-4 flex flex-col items-center justify-between flex-shrink-0">
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-[#00e03c]/15 border border-[#00e03c]/35 flex items-center justify-center p-1">
                  <img src="/assets/brand/logo-seram-icon.png" alt="SERAM" className="w-full h-full object-contain" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#00e03c]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="w-7 h-7 rounded-lg text-slate-500 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#00e03c] animate-pulse" />
            </div>

            {/* Cuerpo Dashboard */}
            <div className="flex-1 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-black text-white tracking-wide">{overviewTitle}</p>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30 font-bold">
                  Tiempo Real
                </span>
              </div>

              {/* Fila Superior: 4 Widgets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Contadores dobles */}
                <div className="rounded-xl bg-[#0b150d] border border-white/[0.08] p-3 flex flex-col justify-between space-y-2">
                  <div>
                    <p className="text-[10px] text-slate-400">{statsCol.label1}</p>
                    <p className="text-lg font-black text-white">{statsCol.val1}</p>
                  </div>
                  <div className="pt-1.5 border-t border-white/[0.06]">
                    <p className="text-[10px] text-slate-400">{statsCol.label2}</p>
                    <p className="text-sm font-black text-[#00e03c]">{statsCol.val2}</p>
                  </div>
                </div>

                {/* 2. Trend Sparkline */}
                <div className="rounded-xl bg-[#0b150d] border border-white/[0.08] p-3 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">{trendCard.label}</p>
                    <p className="text-lg font-black text-white mt-0.5">{trendCard.value}</p>
                    <p className="text-[9.5px] text-[#00e03c] font-semibold">{trendCard.sub}</p>
                  </div>
                  <svg viewBox="0 0 100 32" className="w-full h-7 mt-1">
                    <path
                      d="M 2 28 Q 25 22, 42 24 T 74 12 T 98 4"
                      fill="none"
                      stroke="#00e03c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* 3. Donut Health Score */}
                <div className="rounded-xl bg-[#0b150d] border border-white/[0.08] p-3 flex flex-col items-center justify-between text-center">
                  <p className="text-[10px] text-slate-400 self-start">{donutCard.label}</p>
                  <div className="relative w-16 h-16 flex items-center justify-center my-1">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke="#00e03c"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-black text-white">{donutCard.percent}%</span>
                      <span className="text-[8px] text-[#00e03c] font-bold">{donutCard.statusText}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[8.5px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00e03c]" />{donutCard.leg1}</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{donutCard.leg2}</span>
                  </div>
                </div>

                {/* 4. Actividad Reciente */}
                <div className="rounded-xl bg-[#0b150d] border border-white/[0.08] p-3 flex flex-col justify-between">
                  <p className="text-[10px] text-slate-400 mb-1.5">Actividad Reciente</p>
                  <div className="space-y-2">
                    {recentActivities.slice(0, 3).map((act, i) => (
                      <div key={i} className="text-[9.5px] leading-tight">
                        <div className="flex items-center gap-1.5 text-white font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00e03c] flex-shrink-0" />
                          <span className="truncate">{act.title}</span>
                        </div>
                        <p className="text-[8.5px] text-slate-500 pl-3">{act.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fila Inferior: Mapa Satelital + Indicador de Tasa Operativa */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7 relative h-44 rounded-xl overflow-hidden border border-white/10 bg-black">
                  <img
                    src={mapImage}
                    alt={overviewTitle}
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                  {/* Pines Interactivos */}
                  {mapPins.map((pin, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPinIdx(idx)}
                      style={{ top: pin.top, left: pin.left }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        selectedPinIdx === idx
                          ? 'bg-[#00e03c] text-slate-950 scale-115 shadow-[0_0_14px_#00e03c]'
                          : 'bg-black/75 text-[#00e03c] border border-[#00e03c]/60 hover:scale-110'
                      }`}
                      title={pin.label}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  ))}

                  {activePin && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-white font-bold truncate">{activePin.label}</span>
                      <span className="text-[#00e03c] font-mono flex-shrink-0 ml-2">{activePin.stat}</span>
                    </div>
                  )}
                </div>

                {/* Panel de Estado Operativo */}
                <div className="sm:col-span-5 rounded-xl bg-[#0b150d] border border-white/[0.08] p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400">Monitor SERAM</p>
                        <p className="text-2xl font-black text-white mt-0.5">{weatherWidget.temp}</p>
                        <p className="text-[10px] text-slate-400">{weatherWidget.condition}</p>
                      </div>
                      <span className="w-9 h-9 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 font-black text-xs font-mono">
                        OK
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/[0.06] text-[9px] text-slate-400">
                    <span>{weatherWidget.metric1}</span>
                    <span>{weatherWidget.metric2}</span>
                    <span>{weatherWidget.metric3}</span>
                  </div>

                  <button
                    type="button"
                    onClick={onCtaClick}
                    className="mt-2 text-left text-[10px] font-bold text-[#00e03c] hover:underline cursor-pointer"
                  >
                    Solicitar Diagnóstico →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * SECCIÓN 4: Banner Horizontal Final Arquitectónico
 */
export function ZenzeBottomCtaBanner({
  image,
  imageAlt,
  title,
  subtitle,
  trustLabel,
  ctaLabel,
  onCtaClick,
  buttonAccentClass = 'bg-[#00e03c] hover:bg-white text-slate-950 shadow-[0_0_25px_rgba(0,224,60,0.3)]'
}) {
  return (
    <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0a130b] via-[#0e1b10] to-[#0a130b] border border-white/[0.08] shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-center text-left">
      <div className="lg:col-span-4 relative h-44 lg:h-full min-h-[160px] overflow-hidden">
        <img src={image} alt={imageAlt} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a130b]/40 to-[#0e1b10]" />
      </div>

      <div className="lg:col-span-4 p-6 lg:py-8 space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-white leading-snug font-display">
          {title}
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="lg:col-span-4 p-6 lg:pr-8 flex flex-wrap items-center lg:justify-end gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {['DB', 'FA', 'SR'].map((initials, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-[#061e0c] border border-[#00e03c]/50 flex items-center justify-center text-[9px] font-black text-[#00e03c]"
              >
                {initials}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-300 font-medium max-w-[130px] leading-tight">
            {trustLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={onCtaClick}
          className={`px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-200 cursor-pointer ${buttonAccentClass}`}
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

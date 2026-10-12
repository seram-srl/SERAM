import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Clock, CheckCircle2, AlertTriangle, Gift,
  Sparkles, Compass, Shield, Award, ChevronRight, ChevronLeft,
  X, Flame, Users, Briefcase, Zap, Trophy, UserCheck, Scale
} from 'lucide-react';
import { CHEST_TIERS } from './SpecialMissionsModule';
import { GRADUATION_REQUIREMENTS } from './xpEngine';

export default function InteractiveGameTourModal({ isOpen, onClose, currentSocio }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'step-1',
      badge: 'Paso 1 de 6 · Esfuerzo Base',
      title: '¿Cómo se Juega? Time Tracker & Horas Reales',
      icon: Clock,
      iconColor: 'text-[#00e03c]',
      headerBg: 'from-emerald-500/10 via-emerald-950/20 to-transparent',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            SERAM opera bajo una <strong className="text-white">gamificación meritocrática profesional</strong> basada en la metodología Octalysis de Yu-kai Chou. Tu esfuerzo diario en campo y gabinete se cuantifica de forma imparcial:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#00e03c]" />
                50 XP por Hora Registrada
              </div>
              <p className="text-xs text-slate-400">
                Cada hora que registras en el <strong className="text-slate-200">Time Tracker</strong> vinculada a un cliente o sector de la oficina virtual suma <strong className="text-[#00e03c]">50 XP verificados</strong> directamente a tu perfil.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
              <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-sky-400" />
                Oficina Virtual 2.5D
              </div>
              <p className="text-xs text-slate-400">
                Al activar el cronómetro, tu avatar se despliega en tiempo real en su respectivo despacho (Dirección, Operaciones, Monitoreo o Finanzas) para visibilidad de todo el directorio.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Regla de oro:</strong> Si trabajas 4 horas en peritaje, ganas automáticamente 200 XP de base operativa.</span>
          </div>
        </div>
      ),
    },
    {
      id: 'step-2',
      badge: 'Paso 2 de 6 · Entregables',
      title: 'Actividades Clave & Anti-Cheat Inteligente',
      icon: CheckCircle2,
      iconColor: 'text-blue-400',
      headerBg: 'from-blue-500/10 via-blue-950/20 to-transparent',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            En la <strong className="text-white">Central de Actividades (Kanban tipo Notion)</strong> se gestionan los entregables periciales. Cada tarea concluida suma entre <strong className="text-white">100 a 300 XP por hora estimada</strong> según su dificultad:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00e03c] text-xs font-bold shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">Tareas Menores & Propuestas (Aprobación Ágil)</h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Las tareas rutinarias, gestiones operativas menores o propuestas de prospección se pueden auto-aprobar directamente sin bloquear tu flujo de trabajo.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-blue-500/30 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-bold shrink-0 mt-0.5">
                🛡️
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">Proyectos Mayores & Peritajes (Regla Anti-Cheat)</h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Si la tarea involucra un informe de cuenca, peritaje judicial o presupuesto formal, <strong className="text-amber-300">ningún socio puede auto-aprobarse</strong>. Requiere la validación cruzada y firma de otro socio directivo.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200">
            <strong>Bono de Puntualidad:</strong> Entregar antes o en la fecha límite otorga un <strong>+10% de XP adicional</strong> al entregable.
          </div>
        </div>
      ),
    },
    {
      id: 'step-3',
      badge: 'Paso 3 de 6 · Black Hat',
      title: 'Penalización por Mora & Meritocracia Financiera',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      headerBg: 'from-rose-500/10 via-rose-950/20 to-transparent',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            SERAM aplica <strong className="text-rose-400">Black Hat Gamification (Core Drive 8: Aversión a la Pérdida)</strong> para erradicar la procrastinación y proteger el prestigio de la consultora:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
              <h5 className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Degradación de XP por Mora
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Las tareas vencidas no entregadas descuentan <strong className="text-rose-400">75 XP de castigo por día de mora</strong>. Acumular retrasos reduce tu XP total y <strong>puede bajarte de nivel y reducir tu tarifa</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
              <h5 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Slicing Pie: 0 Horas = 0 Bs
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                El socio que no aporte horas en el período <strong className="text-amber-300">no percibe compensación operativa</strong>. Además, la inacción prolongada activa un aviso de <strong>congelamiento de utilidades sobre el 33% accionario</strong>.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300">
            ⚖️ <em>"Nadie cobra por el trabajo que otro hizo. En SERAM se gana por lo que se aporta y se valida documentalmente."</em>
          </div>
        </div>
      ),
    },
    {
      id: 'step-4',
      badge: 'Paso 4 de 6 · Cofres & Recompensas',
      title: 'Misiones Flash & Los 4 Cofres de Resplandor',
      icon: Gift,
      iconColor: 'text-amber-300',
      headerBg: 'from-amber-500/10 via-amber-950/20 to-transparent',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            En <strong className="text-white">Misiones Especiales</strong> surgen contingencias ambientales del mundo real (decretos de emergencia, licitaciones express SICOES de 72-96h y crisis de cuencas).
          </p>

          {/* Grid de 4 Cofres */}
          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(CHEST_TIERS).map((chest) => (
              <div
                key={chest.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-2.5"
              >
                <span className="text-xl shrink-0">{chest.icon}</span>
                <div className="min-w-0">
                  <h6 className="font-bold text-white text-[11px] truncate">{chest.name}</h6>
                  <span className={`text-[10px] font-black font-mono block ${chest.textColor}`}>
                    +{chest.xpMin}% a +{chest.xpMax}% XP Bonus
                  </span>
                  <p className="text-[9px] text-slate-400 line-clamp-1">{chest.badge}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
            <span><strong>Causa Trascendente:</strong> Cada cofre suma Puntos de Impacto Planetario (PIP).</span>
            <span className="font-mono text-white font-bold">+150 a +1.500 PIP</span>
          </div>
        </div>
      ),
    },
    {
      id: 'step-5',
      badge: 'Paso 5 de 6 · Especialización',
      title: 'Árbol de Talentos & Personalización del Avatar',
      icon: Compass,
      iconColor: 'text-cyan-400',
      headerBg: 'from-cyan-500/10 via-cyan-950/20 to-transparent',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            En tu <strong className="text-white">Perfil y Habilidades</strong> accedes a la constelación RPG interactiva de SERAM:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-sm font-bold shrink-0">
                🌌
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">5 Ramas Técnicas no Restrictivas</h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Geo-Información & SIG, Diagnóstico Biofísico, Bioprocesos & Economía Circular, Compliance Normativo & SYSO, y Dirección & Estrategia Comercial. Asigna Puntos de Talento (TP) al subir de nivel con navegación interactiva Pan & Zoom.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-sm font-bold shrink-0">
                👔
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">Equipamiento de Avatar</h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Elige tu atuendo activo: 🦺 <em>Chaleco de Campo</em> (muestreo y faena), 🎒 <em>Equipo & Gabinete</em> (modelación biofísica) o 👔 <em>Traje Ejecutivo</em> (licitaciones y directorio judicial).
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'step-6',
      badge: 'Paso 6 de 6 · Maestría Suprema',
      title: 'Los 33 Grados & Requisitos Troncales de Graduación',
      icon: Award,
      iconColor: 'text-amber-400',
      headerBg: 'from-amber-500/10 via-yellow-950/20 to-transparent',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            La carrera profesional en SERAM recorre <strong className="text-white">33 Grados de Maestría</strong>, desde Heraldo (0.70x) hasta Consultor Ingeniero Senior (2.50x). Para graduarse en los niveles clave no basta acumular XP:
          </p>

          <div className="space-y-2.5">
            {/* Troncal 11 */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-300 text-xs">Nivel 11: Consultor Junior (1.55x Tarifa)</span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200 font-bold">Troncal I</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {GRADUATION_REQUIREMENTS[11].description}
              </p>
            </div>

            {/* Troncal 22 */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-purple-300 text-xs">Nivel 22: Consultor Ejecutivo (2.00x Tarifa)</span>
                <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-200 font-bold">Troncal II</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {GRADUATION_REQUIREMENTS[22].description}
              </p>
            </div>

            {/* Troncal 33 */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-300 text-xs">Nivel 33: Consultor Ingeniero Senior (2.50x Tarifa)</span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200 font-bold">Cénit Supremo</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {GRADUATION_REQUIREMENTS[33].description}
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;
  const isLast = currentStep === steps.length - 1;

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('seram_game_tour_seen_v1', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-7 max-w-2xl w-full text-left relative overflow-hidden shadow-2xl space-y-5"
      >
        {/* Header con gradiente */}
        <div className={`p-4 -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 border-b border-white/10 bg-gradient-to-r ${current.headerBg} flex items-start justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
              <StepIcon className={`w-6 h-6 ${current.iconColor}`} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
                {current.badge}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                {current.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido dinámico del paso */}
        <div className="min-h-[260px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {current.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer con Indicador de Pasos y Botones */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Indicador de Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Ir al paso ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botones de Navegación */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-[#00e03c] hover:bg-[#00c534] text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-[#00e03c]/20 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>¡Entendido! Comenzar a Jugar</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

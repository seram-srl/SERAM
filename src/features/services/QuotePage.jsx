import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, FileText, Trash2, Map, Compass, Leaf, Shield, 
  ChevronRight, ChevronLeft, Send, Sparkles, Calendar, CheckCircle, ClipboardCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.3 }
  })
};

const QUESTIONS = [
  {
    id: 'service',
    title: '¿Qué tipo de requerimiento o servicio ambiental necesitas cotizar?',
    desc: 'Selecciona la opción principal de tu interés para adecuar las normativas y alcance técnico.',
    options: [
      { id: 'monitoreo', label: 'Monitoreo Ambiental', icon: <Activity className="w-5 h-5" />, desc: 'Calidad de aire, agua, suelos y ruido ocupacional.' },
      { id: 'estudios', label: 'Estudios de Impacto (EsIA)', icon: <FileText className="w-5 h-5" />, desc: 'Fichas ambientales, licencias y auditorías gubernamentales.' },
      { id: 'sig', label: 'Sistemas de Información Geográfica', icon: <Map className="w-5 h-5" />, desc: 'Cartografía, teledetección y ordenamiento espacial.' },
      { id: 'residuos', label: 'Manejo de Residuos', icon: <Trash2 className="w-5 h-5" />, desc: 'Gestión integral, compostaje y lombricultura industrial.' },
      { id: 'turismo', label: 'Ecoturismo y Rutas', icon: <Compass className="w-5 h-5" />, desc: 'Diseño técnico de circuitos y capacidad de carga.' }
    ]
  },
  {
    id: 'sector',
    title: '¿A qué sector productivo pertenece tu organización o proyecto?',
    desc: 'Esto nos permite aplicar el marco regulatorio sectorial boliviano pertinente.',
    options: [
      { id: 'energia', label: 'Minería, Hidrocarburos o Energía', icon: <Shield className="w-5 h-5" />, desc: 'Regulación de alto impacto y pasivos ambientales.' },
      { id: 'construccion', label: 'Construcción e Infraestructura', icon: <FileText className="w-5 h-5" />, desc: 'Licencias urbanas, carreteras y obras civiles.' },
      { id: 'industrial', label: 'Industria Manufacturera o Química', icon: <Activity className="w-5 h-5" />, desc: 'Registro industrial, vertidos y auditorías periódicas.' },
      { id: 'agro', label: 'Sector Agropecuario / Forestal', icon: <Leaf className="w-5 h-5" />, desc: 'Planes de desmonte, reforestación y bioeconomía.' },
      { id: 'gobierno', label: 'Gobierno, ONGs o Educación', icon: <Compass className="w-5 h-5" />, desc: 'Proyectos públicos, capacitación y agendas ODS.' }
    ]
  },
  {
    id: 'urgency',
    title: '¿En qué etapa legal o técnica se encuentra tu requerimiento?',
    desc: 'Nos ayuda a priorizar los recursos operativos según el nivel de apremio legal.',
    options: [
      { id: 'urgente', label: 'Apercibimiento / Requerimiento Legal Urgente', icon: <Shield className="w-5 h-5" />, desc: 'Notificación de la autoridad con plazo límite perentorio.' },
      { id: 'planificacion', label: 'Planificación / Viabilidad Inicial', icon: <FileText className="w-5 h-5" />, desc: 'Buscamos un presupuesto estimado para licitaciones futuras.' },
      { id: 'mantenimiento', label: 'Control Periódico de Licencia', icon: <Activity className="w-5 h-5" />, desc: 'Monitoreos programados recurrentes exigidos por ley.' }
    ]
  },
  {
    id: 'timeframe',
    title: '¿Cuál es el plazo estimado para iniciar la consultoría?',
    desc: 'Mapeamos tu urgencia con la disponibilidad de nuestros peritos técnicos y laboratorios.',
    options: [
      { id: 'inmediato', label: 'De inmediato (Menos de 30 días)', icon: <CheckCircle className="w-5 h-5" />, desc: 'Firma y movilización inmediata de cuadrillas.' },
      { id: 'corto', label: 'Corto plazo (1 a 3 meses)', icon: <Calendar className="w-5 h-5" />, desc: 'Planificación de campañas de muestreo estacionales.' },
      { id: 'presupuesto', label: 'Solo cotización presupuestaria', icon: <ClipboardCheck className="w-5 h-5" />, desc: 'Incorporar al POA de la gestión correspondiente.' }
    ]
  }
];

export default function QuotePage() {
  const navigate = useNavigate();
  const { triggerToast } = useApp();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Campos de contacto del paso final
  const [contactInfo, setContactInfo] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    details: ''
  });

  const handleSelectOption = (optionId) => {
    const key = QUESTIONS[step].id;
    setAnswers(prev => ({ ...prev, [key]: optionId }));
    
    // Auto-avanzar al siguiente paso después de una breve pausa
    setTimeout(() => {
      handleNext();
    }, 250);
  };

  const handleNext = () => {
    if (step < QUESTIONS.length) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      triggerToast('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simular un procesamiento de inteligencia y filtrado de Inbound Marketing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      triggerToast('¡Diagnóstico recibido! Propuesta en preparación.', 'success');
    }, 2800);
  };

  const totalSteps = QUESTIONS.length + 1; // +1 por el paso de datos de contacto
  const progressPercent = ((step) / QUESTIONS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-[85vh] flex flex-col justify-center"
    >
      <div className="glass-panel-dark rounded-3xl p-6 sm:p-10 border border-white/[0.08] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none">
          <Sparkles className="w-80 h-80 -mt-16 -mr-16 text-[#00e03c]" />
        </div>

        {/* Progress Bar */}
        {!isSuccess && (
          <div className="mb-8 space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <span>Diagnóstico Digital</span>
              <span>Paso {step + 1} de {totalSteps}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-right from-[#00e03c]/40 to-[#00e03c]" 
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {isSuccess ? (
            /* Pantalla de Éxito */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-10 space-y-6 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#00e03c]/10 border border-[#00e03c]/30 text-[#00e03c] flex items-center justify-center animate-pulse">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">¡Diagnóstico Completado con Éxito!</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Gracias por tu confianza, <strong className="text-white">{contactInfo.name}</strong>. Hemos registrado los datos para tu requerimiento en <strong className="text-[#00e03c]">{contactInfo.company || 'tu proyecto'}</strong>.
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-left max-w-md w-full space-y-3">
                <h4 className="text-[10px] font-bold text-[#00e03c] uppercase tracking-wider">Próximos pasos:</h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Un consultor principal (Ing. Diego Barrientos o Fernando Araujo) evaluará tu caso frente a la Ley 1333.</li>
                  <li>Te contactaremos a tu celular <strong className="text-white">{contactInfo.phone}</strong> en menos de 24 horas laborables.</li>
                  <li>Te enviaremos una propuesta técnica y pre-cotización formal a tu correo <strong className="text-white">{contactInfo.email}</strong>.</li>
                </ul>
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => navigate('/services')}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Ver Servicios
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-xl bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/40 text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Volver al Inicio
                </button>
              </div>
            </motion.div>
          ) : isSubmitting ? (
            /* Pantalla de Procesamiento */
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 space-y-6 flex flex-col items-center justify-center"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-[#00e03c] animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-white/5 border-b-[#00e03c] animate-spin-reverse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Procesando Diagnóstico</h3>
                <p className="text-xs text-slate-500 animate-pulse">
                  Evaluando normativas bolivianas aplicables y calculando viabilidad operativa...
                </p>
              </div>
            </motion.div>
          ) : step < QUESTIONS.length ? (
            /* Preguntas Multi-step */
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {QUESTIONS[step].title}
                </h2>
                <p className="text-xs text-slate-400">
                  {QUESTIONS[step].desc}
                </p>
              </div>

              <div className="space-y-3">
                {QUESTIONS[step].options.map((option) => {
                  const isSelected = answers[QUESTIONS[step].id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                        isSelected 
                          ? 'bg-[#00e03c]/10 border-[#00e03c] text-[#00e03c]'
                          : 'bg-white/[0.03] border-white/[0.06] hover:border-white/15 text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg border transition-colors ${
                          isSelected 
                            ? 'bg-[#00e03c]/20 border-[#00e03c]/40 text-[#00e03c]'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}>
                          {option.icon}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-white">{option.label}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{option.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-[#00e03c]' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Controles de Navegación del Cuestionario */}
              <div className="pt-4 flex justify-between border-t border-white/[0.06]">
                <button
                  onClick={handlePrev}
                  disabled={step === 0}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    step === 0 
                      ? 'text-slate-700 cursor-not-allowed'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={handleNext}
                  disabled={!answers[QUESTIONS[step].id]}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    !answers[QUESTIONS[step].id]
                      ? 'text-slate-600 bg-white/5 cursor-not-allowed'
                      : 'text-slate-950 bg-[#00e03c] hover:bg-[#00e03c]/90'
                  }`}
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Paso Final: Datos de Contacto */
            <motion.form
              key="contact"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  ¿Cómo podemos hacerte llegar el diagnóstico técnico?
                </h2>
                <p className="text-xs text-slate-400">
                  Ingresa tus datos corporativos. Generaremos un análisis técnico adaptado y agendaremos una llamada de cortesía.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={contactInfo.name}
                    onChange={handleInputChange}
                    placeholder="Ej. Diego Barrientos"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#00e03c]/60 rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empresa / Proyecto</label>
                  <input
                    type="text"
                    name="company"
                    value={contactInfo.company}
                    onChange={handleInputChange}
                    placeholder="Ej. SERAM Consultores"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#00e03c]/60 rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={contactInfo.email}
                    onChange={handleInputChange}
                    placeholder="Ej. barrientos@empresa.com"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#00e03c]/60 rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Número de Celular (WhatsApp) *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={contactInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Ej. 78945612"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#00e03c]/60 rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detalles adicionales del requerimiento</label>
                  <textarea
                    name="details"
                    value={contactInfo.details}
                    onChange={handleInputChange}
                    placeholder="Cuéntanos brevemente sobre las dimensiones, ubicación del predio o dudas puntuales sobre la Ley 1333..."
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#00e03c]/60 rounded-xl p-4 text-xs text-white outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Botones de control del formulario de contacto */}
              <div className="pt-4 flex justify-between border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Volver
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-[#00e03c] hover:bg-[#00e03c]/90 transition-all shadow-[0_4px_16px_rgba(0,224,60,0.3)]"
                >
                  Enviar Diagnóstico <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

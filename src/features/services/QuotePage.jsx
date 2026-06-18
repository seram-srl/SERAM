import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, FileText, Trash2, Map, Compass, Leaf, Shield, 
  ChevronRight, ChevronLeft, Send, Sparkles, Calendar, CheckCircle, ClipboardCheck,
  Printer
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
  const { handleAddProject, triggerToast } = useApp();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);

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

  const calculateQuote = () => {
    const serviceObj = QUESTIONS[0].options.find(o => o.id === answers.service);
    const sectorObj = QUESTIONS[1].options.find(o => o.id === answers.sector);
    const urgencyObj = QUESTIONS[2].options.find(o => o.id === answers.urgency);
    const timeframeObj = QUESTIONS[3].options.find(o => o.id === answers.timeframe);

    const serviceLabel = serviceObj ? serviceObj.label : '';
    const sectorLabel = sectorObj ? sectorObj.label : '';

    let baseLow = 1500;
    let baseHigh = 3000;
    let legalTexts = [];

    switch (answers.service) {
      case 'monitoreo':
        baseLow = 1500;
        baseHigh = 3000;
        legalTexts.push("Reglamento en Materia de Contaminación Atmosférica (RMCA) y Reglamento en Materia de Contaminación Hídrica (RMCH).");
        legalTexts.push("Monitoreo periódico de efluentes, emisiones o ruido exigido por la Autoridad Ambiental Competente.");
        break;
      case 'estudios':
        baseLow = 3500;
        baseHigh = 6500;
        legalTexts.push("Ley 1333 de Medio Ambiente y Reglamento de Prevención y Control Ambiental (RPCA).");
        legalTexts.push("Obtención de Licencia Ambiental (Declaratoria de Impacto Ambiental - DIA / Declaratoria de Adecuación Ambiental - DAA) mediante Ficha Ambiental o EEIA.");
        break;
      case 'sig':
        baseLow = 1000;
        baseHigh = 2500;
        legalTexts.push("Directrices nacionales de Ordenamiento Territorial y Planes de Uso de Suelo (PLUS).");
        legalTexts.push("Zonificación ecológica y análisis de vulnerabilidad de cuencas para proyectos de desarrollo.");
        break;
      case 'residuos':
        baseLow = 1800;
        baseHigh = 3500;
        legalTexts.push("Ley 755 de Gestión Integral de Residuos de Bolivia.");
        legalTexts.push("Plan de Gestión de Residuos Sólidos (PGRS) y viabilidad de compostaje industrial.");
        break;
      case 'turismo':
        baseLow = 1200;
        baseHigh = 2800;
        legalTexts.push("Reglamento General de Áreas Protegidas y Directrices de Ecoturismo.");
        legalTexts.push("Estudios de capacidad de carga y planes de manejo específicos para circuitos turísticos.");
        break;
      default:
        break;
    }

    let multiplier = 1.0;
    switch (answers.sector) {
      case 'energia':
        multiplier = 1.30;
        legalTexts.push("Reglamento Ambiental para Actividades Mineras (RAAM) o Reglamento Ambiental para el Sector de Hidrocarburos (RASH) según corresponda.");
        break;
      case 'construccion':
        multiplier = 1.15;
        legalTexts.push("Ficha Ambiental y Medidas de Mitigación específicas para Obras Civiles e Infraestructura vial/urbana.");
        break;
      case 'industrial':
        multiplier = 1.10;
        legalTexts.push("Reglamento Ambiental para el Sector Industrial Manufacturero (RASIM) de Bolivia.");
        break;
      case 'agro':
        multiplier = 1.05;
        legalTexts.push("Normativas de la ABT (Autoridad de Fiscalización y Control Social de Bosques y Tierra) y Planes de Desmonte (PDM).");
        break;
      case 'gobierno':
        multiplier = 0.90;
        legalTexts.push("Alineación con la Agenda de Objetivos de Desarrollo Sostenible (ODS) y Leyes del Sector Público.");
        break;
      default:
        break;
    }

    const finalLow = Math.round(baseLow * multiplier);
    const finalHigh = Math.round(baseHigh * multiplier);

    let duration = '4 a 6 semanas';
    let durationWeeks = 6;
    if (answers.urgency === 'urgente') {
      duration = '2 a 4 semanas (Fast-track Prioritario)';
      durationWeeks = 3;
    } else if (answers.timeframe === 'corto') {
      duration = '6 a 8 semanas';
      durationWeeks = 8;
    } else if (answers.timeframe === 'presupuesto') {
      duration = '12 a 16 semanas (Planificación)';
      durationWeeks = 14;
    }

    const usdLow = finalLow;
    const usdHigh = finalHigh;
    const bobLow = Math.round(finalLow * 6.96);
    const bobHigh = Math.round(finalHigh * 6.96);

    return {
      serviceLabel,
      sectorLabel,
      usdLow,
      usdHigh,
      bobLow,
      bobHigh,
      duration,
      durationWeeks,
      legalTexts,
      quoteRef: `SRM-${Math.floor(Math.random() * 90000) + 10000}`
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      triggerToast('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    setIsSubmitting(true);

    const result = calculateQuote();
    setQuoteResult(result);

    // Simular un procesamiento de inteligencia y filtrado de Inbound Marketing
    setTimeout(() => {
      // Guardar el proyecto en el dashboard
      const client = contactInfo.company || contactInfo.name;
      const type = `Cotización: ${result.serviceLabel} (${result.quoteRef})`;
      const lead = 'Ing. Diego Barrientos';
      
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + result.durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      handleAddProject(client, type, lead, today, endDate, []);

      setIsSubmitting(false);
      setIsSuccess(true);
      triggerToast('¡Cotización generada y guardada en tu dashboard!', 'success');
    }, 2800);
  };

  const totalSteps = QUESTIONS.length + 1; // +1 por el paso de datos de contacto
  const progressPercent = ((step) / QUESTIONS.length) * 100;

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppLink = () => {
    if (!quoteResult) return '#';
    const text = encodeURIComponent(
      `Hola SERAM, mi nombre es ${contactInfo.name} de ${contactInfo.company || 'mi proyecto'}. ` +
      `He generado mi cotización digital #${quoteResult.quoteRef} para el servicio de ${quoteResult.serviceLabel}. ` +
      `El presupuesto estimado es de Bs. ${quoteResult.bobLow.toLocaleString()} - Bs. ${quoteResult.bobHigh.toLocaleString()}. ` +
      `Me gustaría coordinar la llamada técnica de 15 minutos.`
    );
    return `https://wa.me/59178945612?text=${text}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inner-page max-w-4xl mx-auto min-h-[85vh] flex flex-col justify-center px-4 sm:px-6"
    >
      {/* Estilos inyectados específicamente para la impresión en PDF */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Ocultar barra de navegación, fondos interactivos, etc. */
          body * {
            visibility: hidden;
          }
          #printable-quote-report, #printable-quote-report * {
            visibility: visible;
          }
          #printable-quote-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 20px !important;
            font-family: 'Inter', sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          .print-badge {
            border: 1px solid #00c853 !important;
            color: #00c853 !important;
            background: transparent !important;
          }
          .print-card {
            border: 1px solid #ddd !important;
            background: #fafafa !important;
            box-shadow: none !important;
            color: black !important;
            border-radius: 8px !important;
          }
          .print-title {
            color: #0b5e28 !important;
          }
          .print-highlight {
            color: #00c853 !important;
            font-weight: 800 !important;
          }
          .print-label {
            color: #666 !important;
          }
          .print-border {
            border-bottom: 1px solid #ddd !important;
          }
        }
      ` }} />

      <div id="printable-quote-report" className="neuform-card p-6 sm:p-10 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
        
        {/* Decorative elements (Hidden in Print) */}
        <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none no-print">
          <Sparkles className="w-80 h-80 -mt-16 -mr-16 text-[#00e03c]" />
        </div>

        {/* Progress Bar (Hidden in Print) */}
        {!isSuccess && (
          <div className="mb-8 space-y-2 text-left no-print">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <span>Diagnóstico Digital</span>
              <span>Paso {step + 1} de {totalSteps}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#00e03c]/40 to-[#00e03c]" 
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {isSuccess && quoteResult ? (
            /* Pantalla de Éxito / Reporte Final */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left space-y-8"
            >
              {/* Encabezado del Reporte */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 print-border pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="print-badge neuform-badge neuform-badge-accent font-tech font-bold">
                      {quoteResult.quoteRef}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-tech font-bold">
                      COTIZACIÓN Y DIAGNÓSTICO DIGITAL
                    </span>
                  </div>
                  <h2 className="print-title text-2xl sm:text-3xl font-black text-white leading-tight uppercase font-display">
                    Propuesta Técnica Inicial
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Preparado para: <strong className="text-white">{contactInfo.name}</strong> · Empresa: <strong className="text-white">{contactInfo.company || 'Particular'}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500 font-tech">
                  <div>Fecha: {new Date().toLocaleDateString('es-BO')}</div>
                  <div>Vigencia: 30 días calendario</div>
                </div>
              </div>

              {/* Grid Principal */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Lado Izquierdo: Resumen y Normativas */}
                <div className="md:col-span-7 space-y-6">
                  {/* Resumen de Selecciones */}
                  <div className="print-card neuform-card p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#00e03c] uppercase tracking-wider flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4" /> Resumen de Requerimiento
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="print-label block text-[10px] text-slate-500 uppercase font-bold">Servicio Requerido</span>
                        <span className="print-text text-white font-semibold">{quoteResult.serviceLabel}</span>
                      </div>
                      <div>
                        <span className="print-label block text-[10px] text-slate-500 uppercase font-bold">Sector Productivo</span>
                        <span className="print-text text-white font-semibold">{quoteResult.sectorLabel}</span>
                      </div>
                      <div>
                        <span className="print-label block text-[10px] text-slate-500 uppercase font-bold">Estado Técnico/Legal</span>
                        <span className="print-text text-white font-semibold">
                          {QUESTIONS[2].options.find(o => o.id === answers.urgency)?.label || ''}
                        </span>
                      </div>
                      <div>
                        <span className="print-label block text-[10px] text-slate-500 uppercase font-bold">Email de Envío</span>
                        <span className="print-text text-white font-semibold">{contactInfo.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Marco Regulatorio Ley 1333 */}
                  <div className="print-card neuform-card p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#00e03c] uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Marco Legal Aplicable (Bolivia)
                    </h3>
                    <p className="print-text text-xs text-slate-300 leading-relaxed">
                      El proyecto se enmarca bajo las siguientes directrices de la <strong>Ley 1333 de Medio Ambiente</strong> y sus reglamentos conexos:
                    </p>
                    <ul className="text-xs text-slate-400 space-y-2.5">
                      {quoteResult.legalTexts.map((text, i) => (
                        <li key={i} className="flex gap-2 items-start print-text">
                          <span className="text-[#00e03c] mt-0.5">•</span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requisitos mínimos */}
                  <div className="print-card neuform-card p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#00e03c] uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Documentos mínimos requeridos para iniciar
                    </h3>
                    <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside print-text">
                      <li>Fotocopia simple del Documento de Identidad del representante legal.</li>
                      <li>Plano de ubicación del predio / Coordenadas UTM.</li>
                      <li>Testimonio de propiedad o Contrato de Alquiler del predio.</li>
                      <li>Copia de Licencia Ambiental anterior (en caso de actualización o auditoría).</li>
                      <li>Formulario de datos operacionales básicos (consumo de agua/energía).</li>
                    </ul>
                  </div>
                </div>

                {/* Lado Derecho: Presupuesto y Cronograma */}
                <div className="md:col-span-5 space-y-6">
                  {/* Presupuesto Estimado */}
                  <div className="print-card bg-gradient-to-br from-[#00e03c]/10 to-[#00e03c]/5 border border-[#00e03c]/20 p-6 rounded-2xl text-left space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none no-print">
                      <Sparkles className="w-16 h-16 text-[#00e03c]" />
                    </div>
                    <span className="print-label text-[10px] font-bold text-[#00e03c] uppercase tracking-wider block">Presupuesto Estimado</span>
                    <div className="space-y-1">
                      <h4 className="print-highlight text-3xl font-black text-white leading-tight">
                        Bs. {quoteResult.bobLow.toLocaleString()} - {quoteResult.bobHigh.toLocaleString()}
                      </h4>
                      <p className="print-text text-sm font-bold text-slate-400">
                        ${quoteResult.usdLow.toLocaleString()} - {quoteResult.usdHigh.toLocaleString()} USD
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed print-text">
                      * El monto final se ajustará formalmente tras una llamada de confirmación de dimensiones y factores operativos. No incluye tasas de visado de la AACD.
                    </p>
                  </div>

                  {/* Cronograma Estimado */}
                  <div className="print-card neuform-card p-5 space-y-3">
                    <span className="print-label text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cronograma de Ejecución</span>
                    <h4 className="print-text text-lg font-extrabold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#00e03c]" /> {quoteResult.duration}
                    </h4>
                    <p className="print-text text-xs text-slate-400 leading-relaxed">
                      El plazo incluye desde la recopilación de datos iniciales en predio, análisis de laboratorio (si corresponde) y el procesamiento cartográfico hasta la entrega del informe final.
                    </p>
                  </div>

                  {/* Estado del Registro */}
                  <div className="print-card neuform-card p-5 space-y-2 border-l-2 border-l-[#00e03c] print-text">
                    <span className="print-label text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Seguimiento Interno</span>
                    <div className="text-xs text-slate-300 font-medium">
                      Registrado en la mesa de control de SERAM Hub.
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Asignado a: <strong>Ing. Diego Barrientos</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Control (Hidden in Print) */}
              <div className="neuform-divider my-6 no-print" />
              <div className="flex flex-wrap gap-4 justify-between items-center no-print">
                <div className="flex gap-3">
                  <button
                    onClick={handlePrint}
                    className="neuform-btn-accent cursor-none !rounded-xl !py-2.5 !px-5 inline-flex items-center gap-2"
                    data-cursor-text="IMPRIMIR"
                  >
                    <Printer className="w-4 h-4" /> Guardar / Descargar PDF
                  </button>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neuform-btn-primary cursor-none !rounded-xl !py-2.5 !px-5 inline-flex items-center gap-2 !bg-[#00c853]/15 hover:!bg-[#00c853]/25 !border-[#00c853]/35 !text-[#00c853] hover:!text-[#00c853] font-bold"
                    data-cursor-text="WHATSAPP"
                  >
                    <Send className="w-4 h-4" /> Enviar a WhatsApp
                  </a>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/services')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-none"
                    data-cursor-text="SERVICIOS"
                  >
                    Ver Servicios
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="neuform-btn-primary cursor-none !rounded-xl !py-2.5 !px-5"
                    data-cursor-text="INICIO"
                  >
                    Volver al Inicio
                  </button>
                </div>
              </div>
            </motion.div>
          ) : isSubmitting ? (
            /* Pantalla de Procesamiento */
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 space-y-6 flex flex-col items-center justify-center no-print"
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
              className="space-y-6 text-left no-print"
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
                      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-300 cursor-none ${
                        isSelected 
                          ? 'bg-[#00e03c]/10 border-[#00e03c] text-[#00e03c] shadow-[0_0_15px_rgba(0,224,60,0.15)]'
                          : 'bg-white/[0.02] border-white/10 hover:border-[#00e03c]/30 text-slate-300 hover:bg-white/[0.04]'
                      }`}
                      data-cursor-text="SELECCIONAR"
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
              <div className="neuform-divider my-6" />
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={step === 0}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-none ${
                    step === 0 
                      ? 'text-slate-700 cursor-not-allowed'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  data-cursor-text="ATRÁS"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={handleNext}
                  disabled={!answers[QUESTIONS[step].id]}
                  className={`neuform-btn-primary cursor-none !rounded-xl !py-2 !px-4 ${
                    !answers[QUESTIONS[step].id] ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  data-cursor-text="SIGUIENTE"
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
              className="space-y-6 text-left no-print"
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
                    className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c]/50 focus:shadow-[0_0_12px_rgba(0,224,60,0.1)] rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
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
                    className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c]/50 focus:shadow-[0_0_12px_rgba(0,224,60,0.1)] rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
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
                    className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c]/50 focus:shadow-[0_0_12px_rgba(0,224,60,0.1)] rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
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
                    className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c]/50 focus:shadow-[0_0_12px_rgba(0,224,60,0.1)] rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
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
                    className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c]/50 focus:shadow-[0_0_12px_rgba(0,224,60,0.1)] rounded-xl p-4 text-xs text-white outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Botones de control del formulario de contacto */}
              <div className="neuform-divider my-6" />
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-none"
                  data-cursor-text="VOLVER"
                >
                  <ChevronLeft className="w-4 h-4" /> Volver
                </button>
                <button
                  type="submit"
                  className="neuform-btn-primary cursor-none !rounded-xl !py-3 !px-6 shadow-[0_4px_16px_rgba(0,224,60,0.25)]"
                  data-cursor-text="ENVIAR"
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

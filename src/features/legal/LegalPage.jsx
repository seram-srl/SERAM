import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Cookie, RefreshCw, Lock, ArrowLeft, Building2, MapPin, Mail } from 'lucide-react';

export default function LegalPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar pestaña activa en base a la ruta
  const getTabFromPath = (path) => {
    if (path.includes('/terminos')) return 'terminos';
    if (path.includes('/cookies')) return 'cookies';
    if (path.includes('/reembolsos')) return 'reembolsos';
    return 'privacidad';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  const TABS = [
    { id: 'privacidad', label: 'Privacidad y Confidencialidad', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'terminos', label: 'Términos de Servicio', icon: <FileText className="w-4 h-4" /> },
    { id: 'cookies', label: 'Política de Cookies', icon: <Cookie className="w-4 h-4" /> },
    { id: 'reembolsos', label: 'Política de Reembolsos', icon: <RefreshCw className="w-4 h-4" /> },
  ];

  return (
    <div className="inner-page min-h-screen bg-[#010409] text-slate-100 pt-28 pb-20 px-4 sm:px-8 md:px-16 selection:bg-[#00e03c]/30 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabecera de Navegación y Volver */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-[#00e03c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/30 px-3 py-1 rounded-full">
            Marco Normativo Bolivia · Vigente 2026
          </span>
        </div>

        {/* Título Principal */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase font-display">
            Centro de <span className="text-[#00e03c]">Legalidad & Privacidad</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
            Transparencia jurídica, seguridad informática y custodia de datos técnicos para el ejercicio de la consultoría ambiental y formación académica de SERAM.
          </p>
        </div>

        {/* Selector de Pestañas (Accesible con teclado) */}
        <nav
          role="tablist"
          aria-label="Pestañas de documentos legales"
          className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00e03c] ${
                  isActive
                    ? 'bg-[#126c0f] text-white shadow-lg shadow-[#126c0f]/40 border border-[#00e03c]/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Contenido del Documento */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="neuform-card !p-8 sm:!p-12 space-y-8 leading-relaxed text-sm text-slate-300 font-light border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-2xl rounded-3xl"
        >
          {/* TAB 1: POLÍTICA DE PRIVACIDAD Y CONFIDENCIALIDAD */}
          {activeTab === 'privacidad' && (
            <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e03c]">Documento Oficial</span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                  Política de Privacidad, Protección de Datos y Secreto Técnico
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1">Última actualización: Octubre de 2026</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">1.</span> Responsable del Tratamiento
                </h3>
                <p>
                  El responsable del tratamiento de los datos personales recabados a través de esta plataforma digital es la consultora de ingeniería ambiental <strong>SERAM</strong>, con domicilio operativo central en:
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-[#00e03c] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Oficina Central de Operaciones:</strong>
                    <p>Calle Presbítero Medina N° 2026, Sopocachi, La Paz, Estado Plurinacional de Bolivia.</p>
                    <p className="mt-1 text-slate-400">Canal exclusivo de contacto legal y técnico: <span className="text-[#00e03c]">consultoraseram@gmail.com</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">2.</span> Marco Normativo Aplicable (Bolivia)
                </h3>
                <p>
                  La presente política y el tratamiento de datos se fundamentan en el ordenamiento jurídico vigente del Estado Plurinacional de Bolivia:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-xs text-slate-300">
                  <li><strong>Constitución Política del Estado (CPE):</strong> Artículos 21 (derecho a la intimidad, privacidad y honra) y Artículo 130 (Acción de Protección de Privacidad o <em>Habeas Data</em>).</li>
                  <li><strong>Ley N° 164 (Ley General de Telecomunicaciones y TIC):</strong> Artículos 53 y siguientes sobre la inviolabilidad y secreto de las comunicaciones y deber de resguardo de datos personales.</li>
                  <li><strong>Código Penal Boliviano:</strong> Tipificación y sanciones frente a delitos informáticos y vulneración de secretos industriales.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">3.</span> Principio de Minimización de Datos
                </h3>
                <p>
                  SERAM aplica de forma rigurosa el principio de minimización. Solo solicitamos los datos estrictamente necesarios para:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-xs text-slate-300">
                  <li>Responder solicitudes de contacto técnico y agendamiento pericial.</li>
                  <li>Generar presupuestos y pre-diagnósticos de categorización ambiental (RAI, FNCA, EMAP, EsIA).</li>
                  <li>Gestionar la matrícula, progreso académico y emisión de certificados en SERAM Academy.</li>
                </ul>
                <p className="text-xs text-slate-400 italic">
                  No solicitamos datos sensibles de carácter personal ni cedemos información a terceros para prospección comercial publicitaria.
                </p>
              </div>

              {/* SECCIÓN ESPECIAL DE CONFIDENCIALIDAD AMBIENTAL */}
              <div className="p-6 rounded-2xl bg-[#00e03c]/5 border border-[#00e03c]/30 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Lock className="w-4 h-4 text-[#00e03c]" />
                  <h4>Cláusula de Confidencialidad Técnica, Secreto Industrial y Peritaje (NDA)</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conforme a la <strong>Ley N° 1333 de Medio Ambiente</strong>, el Código de Comercio boliviano y la <strong>Ley N° 1182 (Acuerdo de Escazú, Arts. 5 y 6)</strong>, toda información técnica provista por clientes industriales, mineros o municipios (incluyendo coordenadas georreferenciadas, parámetros de calidad hídrica, concentración de metales pesados, balances de materia y planos de planta) goza de <strong>estricto secreto profesional y custodia técnica</strong>.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  SERAM se compromete bajo responsabilidad contractual a no divulgar, reproducir ni compartir información técnica previa a la formalización del trámite ante la Autoridad Ambiental Competente.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">4.</span> Derechos del Usuario (ARCO)
                </h3>
                <p>
                  En conformidad con el Art. 130 de la CPE, todo usuario o titular de datos tiene derecho a solicitar en cualquier momento el <strong>Acceso, Rectificación, Cancelación u Oposición</strong> de sus datos personales mediante solicitud formal por correo electrónico a <span className="text-[#00e03c]">consultoraseram@gmail.com</span>, la cual será atendida en un plazo máximo de 5 días hábiles.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">5.</span> Requisito de Mayoría de Edad (+18)
                </h3>
                <p>
                  Nuestros servicios de consultoría técnica y la matriculación en programas de formación profesional de SERAM Academy están dirigidos exclusivamente a personas mayores de 18 años de edad con capacidad legal para contratar.
                </p>
              </div>
            </section>
          )}

          {/* TAB 2: TÉRMINOS Y CONDICIONES DE SERVICIO */}
          {activeTab === 'terminos' && (
            <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e03c]">Condiciones de Uso</span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                  Términos y Condiciones de Servicio
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1">Vigentes para la web y SERAM Academy</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">1.</span> Objeto y Aceptación
                </h3>
                <p>
                  El acceso y utilización de este sitio web atribuye la condición de usuario e implica la aceptación plena de las presentes disposiciones. SERAM ofrece servicios de consultoría especializada en ingeniería ambiental, teledetección satelital, modelación SIG y formación e-learning.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <h4 className="text-sm font-bold text-amber-300">Descargo de Responsabilidad de Herramientas Digitales y Pre-diagnósticos</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Las calculadoras, formularios de categorización interactiva y el asistente virtual (Chatbot) presentes en este sitio web proporcionan <strong>orientaciones preliminares de carácter estimativo</strong>. No constituyen una resolución administrativa ni un dictamen pericial definitivo. La categorización y licenciamiento ambiental oficial en Bolivia depende de la Autoridad Ambiental Competente (AAC) y de estudios de campo suscritos por ingenieros acreditados en el Registro Nacional de Consultoría Ambiental (RENCA).
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">2.</span> Propiedad Intelectual y Derechos Reservados
                </h3>
                <p>
                  Todo el contenido visual, interactivo y documental publicado en este sitio web —incluyendo de forma enunciativa pero no limitativa: logotipos, marca SERAM, shaders WebGL interactivos, ortomosaicos fotogramétricos propios, códigos de lección, carimbos normativos y guías técnicas descargables— es propiedad exclusiva de SERAM o se encuentra bajo licencias válidas de uso. Queda prohibida su reproducción, distribución o reventa no autorizada.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">3.</span> Obligaciones del Usuario
                </h3>
                <p>
                  El usuario se compromete a hacer un uso lícito del sitio web, absteniéndose de introducir virus, bots de extracción masiva de datos (web scraping abusivo) o intentar accesos no autorizados a los módulos internos de gestión directiva.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">4.</span> Transparencia Corporativa
                </h3>
                <p>
                  La documentación legal constitutiva de la sociedad, registros tributarios y licencias profesionales de nuestros ingenieros directores se encuentran debidamente custodiados y a disposición de los contratantes en nuestras oficinas físicas al momento de la suscripción formal de contratos de consultoría.
                </p>
              </div>
            </section>
          )}

          {/* TAB 3: POLÍTICA DE COOKIES Y ALMACENAMIENTO LOCAL */}
          {activeTab === 'cookies' && (
            <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e03c]">Almacenamiento Local</span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                  Política de Cookies y Tecnologías de Almacenamiento
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1">Transparencia sobre almacenamiento técnico</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">1.</span> ¿Qué son las Cookies y Almacenamiento Web?
                </h3>
                <p>
                  Las cookies y los mecanismos de almacenamiento local (<code className="text-[#00e03c] bg-white/5 px-1.5 py-0.5 rounded">sessionStorage</code> y <code className="text-[#00e03c] bg-white/5 px-1.5 py-0.5 rounded">localStorage</code>) son pequeños ficheros que se alojan en tu navegador para permitir una navegación fluida, recordar preferencias de interfaz y mantener la seguridad activa.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">2.</span> Tipos de Almacenamiento Utilizados por SERAM
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-[#00e03c] uppercase">Técnicas y Esenciales (Obligatorias)</span>
                    <p className="text-xs text-slate-300">
                      Permiten el funcionamiento correcto del carrito de compras, el reproductor de video de SERAM Academy y la memoria volátil de sesión (<code className="text-[#00e03c]">sessionStorage</code>). Se eliminan automáticamente al cerrar la ventana de tu navegador.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">Preferencias de Interfaz (Funcionales)</span>
                    <p className="text-xs text-slate-300">
                      Almacenan localmente si aceptaste el banner informativo de cookies o si silenciaste los efectos sonoros de la oficina virtual, evitando molestias repetitivas en cada visita.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#00e03c]/5 border border-[#00e03c]/30 space-y-2">
                <h4 className="text-sm font-bold text-white">Declaración de Ausencia de Rastreo Publicitario</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>SERAM no utiliza cookies de seguimiento publicitario ni píxeles de terceros para comercializar tus hábitos de navegación.</strong> No instalamos rastreadores de Meta Pixel, Google AdSense ni redes publicitarias invasivas. Tu navegación en nuestra plataforma se mantiene en estricta privacidad.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">3.</span> Cómo Desactivar o Limpiar el Almacenamiento
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Puedes configurar tu navegador en cualquier momento para bloquear o borrar el almacenamiento local y cookies mediante las opciones de privacidad de tu navegador (Chrome, Firefox, Safari o Edge). Ten en cuenta que si bloqueas las cookies técnicas esenciales, algunas funciones como el aula virtual o el carrito de compras podrían no responder con normalidad.
                </p>
              </div>
            </section>
          )}

          {/* TAB 4: POLÍTICA DE REEMBOLSOS Y DEVOLUCIONES */}
          {activeTab === 'reembolsos' && (
            <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e03c]">Garantía y Devoluciones</span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                  Política de Reembolsos y Devoluciones
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1">Conforme a la Ley N° 453 de Defensa del Consumidor en Bolivia</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">1.</span> Cursos en Video (SERAM Academy)
                </h3>
                <p>
                  Queremos que te capacites con total confianza. Si adquieres un curso en video de SERAM Academy y consideras que el contenido no cumple con tus expectativas técnicas, puedes solicitar el <strong>100% de tu reembolso</strong> bajo las siguientes condiciones razonables:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-xs text-slate-300">
                  <li>La solicitud debe realizarse dentro de los <strong>7 días naturales</strong> posteriores a la compra.</li>
                  <li>No debes haber visualizado más del <strong>20% del contenido</strong> total del curso.</li>
                  <li>No se debe haber aprobado el examen final ni emitido el certificado de acreditación correspondiente.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">2.</span> Productos Digitales Descargables (PDFs y Entregables)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  En virtud de su naturaleza inmaterial e inmediata, los productos descargables (E-books, guías metodológicas en PDF, proyectos de QGIS descargables y plantillas de carimbos normativos) <strong>no son susceptibles de reembolso</strong> una vez que el enlace de descarga ha sido ejecutado o transferido.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">3.</span> Servicios de Consultoría e Ingeniería Ambiental
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Los contratos de consultoría pericial (muestreo de campo, vuelos de dron, monitoreo de mercurio, elaboración de Fichas FNCA y RAI) se rigen por su respectivo contrato bilateral de prestación de servicios. Los anticipos destinados a viáticos, equipos de campo y ensayos de laboratorio ya ejecutados no son reembolsables.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00e03c]">4.</span> Procedimiento de Solicitud
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para solicitar una devolución, envía un correo a <span className="text-[#00e03c]">consultoraseram@gmail.com</span> adjuntando tu comprobante de pago y motivo de la solicitud. Las devoluciones aprobadas se procesan mediante transferencia bancaria boliviana en un plazo de 3 a 5 días hábiles.
                </p>
              </div>
            </section>
          )}

          {/* Pie del Documento con Contacto */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#00e03c]" /> SERAM Consultora Ambiental S.R.L.
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#00e03c]" /> consultoraseram@gmail.com
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

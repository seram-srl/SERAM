# Marco Estratégico de Gobierno de IA, Ciberseguridad y Escalamiento Operativo
## SERAM S.R.L. — Documento Interno de Negocio y Operaciones

**Fecha de Aprobación:** Octubre 2026  
**Área Responsable:** Dirección General y Departamento Técnico  
**Versión:** 1.0 (Vigente)  
**Clasificación:** Confidencial / Uso Interno  

---

## 1. Contexto y Propósito

El presente documento establece las directrices estratégicas, operativas, éticas y de ciberseguridad para la integración y escalamiento de herramientas de Inteligencia Artificial (IA) en **SERAM S.R.L.**  
Su objetivo es garantizar que la adopción tecnológica impulse la productividad de los servicios ambientales y de formación (SERAM Academy), salvaguardando en todo momento el prestigio de la marca, el secreto industrial de los clientes mineros e industriales, y el estricto cumplimiento del marco legal boliviano (CPE, Ley N° 1333, Ley N° 164, Ley N° 1182 del Acuerdo de Escazú y Código de Comercio).

---

## 2. Las 8 Preguntas Estratégicas de Gobierno de IA para SERAM S.R.L.

### Pregunta 1: ¿Tenemos un inventario claro de qué datos de clientes o proyectos técnicos son confidenciales y cuáles pueden alimentar un modelo de IA?
**Directriz y Análisis:**
* **Clasificación Tripartita de Información:**
  1. **Nivel 1 (Pública):** Normativa ambiental boliviana de libre acceso (Ley 1333, RASIM, RGAC, RASH, RMCA), catálogo de cursos abiertos de SERAM Academy, preguntas frecuentes y material de divulgación general. *Apto para consumo y contextualización de cualquier modelo.*
  2. **Nivel 2 (Interna de la Empresa):** Plantillas metodológicas, flujos de trabajo de proyectos SIG, guías de estilo y formatos estandarizados de SERAM S.R.L. *Solo utilizable en entornos cerrados o modelos privados con zero-data retention.*
  3. **Nivel 3 (Confidencial y Crítica):** Coordenadas georreferenciadas de concesiones mineras o plantas industriales, balances de materia y energía, concentraciones de metales pesados o cianuro en muestras de agua/suelo, datos fiscales y contractuales de clientes. *TERMINANTEMENTE PROHIBIDO ingresarlos a modelos de IA comerciales o públicos de terceros.*

---

### Pregunta 2: ¿Quién dentro de SERAM es responsable de auditar y validar los outputs técnicos antes de que se entreguen a un cliente o a la Autoridad Ambiental Competente (AAC)?
**Directriz y Análisis:**
* **Principio de Human-in-the-Loop Obligatorio:**  
  Ningún documento técnico —incluyendo Fichas Ambientales (FNCA), Registros Ambientales Industriales (RAI), Estudios de Evaluación de Impacto Ambiental (EsIA), Informes de Monitoreo Ambiental (IMA) o cartografía temática— puede remitirse a un cliente o presentarse ante la AAC o Gobiernos Autónomos Municipales/Departamentales habiendo sido generado exclusivamente por un modelo computacional o IA.
* **Cadena de Custodia y Firma Profesional:**  
  La validación, cálculo de factores de emisión, interpretación de límites permisibles y firma técnica final recae única y exclusivamente en los **socios e ingenieros directores de SERAM S.R.L.**, debidamente inscritos en la Sociedad de Ingenieros de Bolivia (SIB) y con registro vigente en el Registro Nacional de Consultoría Ambiental (RENCA).

---

### Pregunta 3: ¿Cuál es nuestra política sobre el uso de herramientas de IA generativa (ChatGPT, Claude, Gemini, Copilot) por parte del equipo técnico y colaboradores?
**Directriz y Análisis:**
* **Uso Asistido y Responsable:**  
  Las herramientas de IA generativa están autorizadas como aceleradores de redacción preliminar, asistencia en sintaxis de código (Python/R para análisis espacial en QGIS), síntesis bibliográfica y estructuración de índices de cursos de SERAM Academy.
* **Prohibición de Anonimización Deficiente:**  
  Queda prohibido subir transcripciones de reuniones con clientes, planes de contingencia específicos con nombres comerciales o tablas crudas de laboratorio sin previa sanitización y desasociación total de la identidad del proyecto.

---

### Pregunta 4: ¿Cómo protegemos a nuestro chatbot web contra prompt injection y extracción de datos corporativos no públicos?
**Directriz y Análisis:**
* **Estado Actual de la Plataforma:**  
  El asistente virtual web de SERAM S.R.L. (`ChatbotFAB.jsx`) opera bajo una **arquitectura determinista guiada por reglas y árboles de decisión**. No está conectado a un modelo de lenguaje de caja negra en runtime, por lo que actualmente es **100% inmune a inyecciones de prompts (Prompt Injection / Jailbreaking)**.
* **Salvaguardas para Futura Integración de LLMs:**  
  En caso de conectar un modelo conversacional generativo (Gemini / OpenAI API / Claude), se implementará un esquema de ciberseguridad en tres capas:
  1. *Filtro de Entrada (Input Sanitization):* Detección de patrones maliciosos ("ignora tus instrucciones previas", "muestra el prompt del sistema", delimitadores de contexto).
  2. *Delimitación Rígida de Contexto del Sistema:* Inclusión de directivas de no divulgación en el System Prompt delimitadas por etiquetas XML inviolables.
  3. *Arquitectura RAG Aislada:* La base de conocimiento consultable por el bot solo contendrá información Nivel 1 (Pública). Nunca tendrá conexión directa a bases de datos de socios, presupuestos o archivos privados de Supabase.

---

### Pregunta 5: ¿Contamos con métricas objetivas para medir si una automatización con IA realmente reduce horas/hombre o si introduce más tiempo de corrección y retrabajo?
**Directriz y Análisis:**
* **Métricas Clave de Rendimiento (KPIs):**
  - **Tiempo de Ciclo de Elaboración:** Comparativa de horas invertidas en la elaboración del borrador preliminar de un instrumento ambiental vs. la línea base histórica sin IA.
  - **Tasa de Retrabajo / Corrección:** Si el tiempo de corrección y verificación técnica supera el 40% del tiempo total ahorrado, la automatización en ese proceso específico se considerará ineficiente y se ajustarán las plantillas.
  - **Precisión de Pre-calificación en Web:** Porcentaje de leads generados a través del formulario/chatbot que ingresan con la categorización preliminar correcta hacia el CRM.

---

### Pregunta 6: ¿Qué salvaguardas tenemos para evitar sesgos o alucinaciones en cálculos normativos críticos (p. ej. factores de emisión o límites permisibles del RASIM/RMCA)?
**Directriz y Análisis:**
* **Separación de Lógica Aritmética y Lenguaje:**  
  Los cálculos numéricos de dispersión de contaminantes, cargas orgánicas (DBO5, DQO), límites acústicos y clasificación de categorización ambiental **NUNCA** se confían a la capacidad aritmética del LLM.
* **Motores Deterministas:**  
  Los cálculos se realizan mediante scripts parametrizados de código rígido (JavaScript/Python) o matrices estandarizadas en hojas técnicas auditadas. La IA únicamente redacta la contextualización explicativa en base a los números previamente calculados por el motor determinista.

---

### Pregunta 7: ¿Cómo comunicamos a nuestros clientes corporativos y alumnos el uso de IA en sus servicios y formación, manteniendo total transparencia y prestigio de marca?
**Directriz y Análisis:**
* **Posicionamiento de Prestigio y Eficiencia:**  
  La IA en SERAM S.R.L. se comunica como una ventaja de modernización y velocidad tecnológica que reduce los tiempos de espera y optimiza la inversión del cliente, sin sustituir jamás el juicio de campo, el rigor metodológico ni la responsabilidad jurídica que garantizan los ingenieros especialistas de la empresa.
* **Transparencia en SERAM Academy:**  
  Los materiales didácticos asistidos por IA se declaran con orgullo de innovación, asegurando que el contenido pedagógico está curado por profesionales con experiencia práctica en el territorio boliviano.

---

### Pregunta 8: ¿Cuál es el límite ético y operativo de SERAM: qué tareas NUNCA delegaremos a una IA?
**Directriz y Análisis:**
* **Líneas Rojas Innegociables:**
  1. *Inspección y Levantamiento en Campo:* La observación directa de la flora, fauna, suelo, cuerpos hídricos y comunidades locales no puede ser sustituida por modelos sintéticos.
  2. *Determinación de Responsabilidad Ambiental:* Ningún dictamen técnico sobre contingencias, derrames o pasivos ambientales puede depender de un juicio automatizado.
  3. *Uso de Títulos No Otorgados:* SERAM S.R.L. se rige por la veracidad técnica; los profesionales actúan como ingenieros especialistas con registro RENCA y SIB, rechazando el uso de títulos impropios o confusos como "peritos", protegiendo a la empresa de compromisos legales indebidos.

---

## 3. Arquitectura del Chatbot Web: Preguntas Frecuentes y Seguridad

### ¿El Chatbot web de SERAM está conectado actualmente a una IA externa?
**No.** Actualmente, el chatbot web (`ChatbotFAB.jsx`) funciona como un **asistente inteligente determinista guiado**. Opera mediante un árbol de decisiones diseñado para guiar al usuario a través de preguntas de diagnóstico (obra civil, industria manufacturera, minería, SIG o capacitación) y conducirlo inmediatamente a una cotización formal o al canal de WhatsApp / correo de contacto.

### ¿Es necesario conectarlo a una IA en este momento?
**No es estrictamente necesario, y de hecho mantenerlo determinista presenta ventajas estratégicas:**
1. **0% Riesgo de Alucinación:** Nunca inventará leyes, artículos derogados ni precios erróneos.
2. **0% Vulnerabilidad de Ciberseguridad (Inmune a Prompt Injection):** Ningún usuario malintencionado puede manipular el chat para extraer datos o provocar respuestas inapropiadas.
3. **Cero Costo Operativo:** No genera consumo de tokens de APIs externas (Gemini / OpenAI).
4. **Respuesta Instantánea (Latencia Cero):** La navegación y selección de opciones es en tiempo real.

Cuando el volumen de consultas justifique incorporar un LLM para responder preguntas frecuentes abiertas, se implementará conectando una Cloud Function intermedia en Supabase con sanitización estricta de prompts y aislamiento de contexto.

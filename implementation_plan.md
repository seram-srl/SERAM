# Plan de Implementación: TASK-106
## Sistema ARM (Automated Relationship Machine / Inbound Marketing con IA) & CRM Odoo para SERAM SRL

### 1. Resumen Ejecutivo
Construir e integrar el sistema **ARM (Automated Relationship Machine)** para SERAM SRL. El sistema conecta de forma nativa con el **Asistente SERAM** (`ChatbotFAB.jsx`), realizando un filtro y precalificación inteligente basada en metodología Inbound Marketing (BANT/GPCT: qué busca, cuándo lo necesita y cuánto quiere invertir). 

El sistema clasifica automáticamente a los prospectos en tres temperaturas:
- **Caliente (SQL / Listo para comprar):** Puntuación >= 70. Notificación y derivación inmediata al socio vendedor para cierre de venta vía WhatsApp y reunión ejecutiva.
- **Tibio (MQL / En evaluación):** Puntuación 40-69. Ingreso al flujo de nutrición técnica y cotizaciones personalizadas.
- **Frío / Curioso (TOFU / Explorador):** Puntuación < 40. Secuencia de nutrición educativa de alto valor ("el curioso de hoy es el cliente de mañana") con cadencia no invasiva.

Se implementa un **protocolo de seguimiento de 14 días con hasta 7 contactos espaciados** con blindaje estricto anti-baneo (WhatsApp/Email) y política antispam (opt-in explícito, horarios comerciales de Bolivia, pausas por respuesta y opción de desuscripción voluntaria).

En el Portal de Socios, se despliega una interfaz de **CRM con funcionalidad y flujos equivalentes a Odoo CRM**, revestida con los tokens estéticos y paleta Neuform de SERAM (verde esmeralda, slate oscuro, tipografía técnica, vistas Kanban por etapas, vista lista/tabla, y ficha 360° con Chatter y cronograma de contactos).

Todo el sistema cuenta con esquema estructurado para **Supabase (PostgreSQL con RLS y Realtime)** y almacenamiento offline-first en `localStorage` con latencia de 0ms.

---

### 2. Estructura de Archivos a Crear y Modificar
1. **`supabase/migrations/20261110_arm_inbound_crm.sql`** [NUEVO]:
   - DDL para tablas `arm_leads`, `arm_cadence_logs`, `arm_chatter`.
   - Índices de rendimiento, políticas RLS y suscripción a Realtime.
2. **`src/services/armService.js`** [NUEVO]:
   - Lógica de precalificación Inbound y cálculo de Lead Score (0 a 100).
   - Generador de la cadencia de 14 días (7 contactos programados).
   - Reglas de blindaje anti-baneo y control de ventanas de tiempo.
   - Sincronización asíncrona con Supabase y persistencia inmediata en LocalStorage.
3. **`src/components/ui/ChatbotFAB.jsx`** [MODIFICACIÓN]:
   - Adaptación del árbol conversacional para capturar las 3 preguntas clave (qué busca, cuándo, cuánto).
   - Registro automático en ARM al completar el diagnóstico o enviar mensaje.
   - Derivación inmediata de leads calientes (SQL) a cierre comercial.
   - Supresión total de emoticones en favor de iconos SVG de `lucide-react` y redacción profesional.
4. **`src/features/partner-portal/crm/ArmOdooCrm.jsx`** [NUEVO]:
   - Módulo CRM estilo Odoo:
     * Vista Kanban interactiva con etapas de embudo.
     * Vista Lista/Tabla con filtros y ordenamiento rápido.
     * Modal Ficha 360° del Lead: datos BANT, Chatter de notas/mensajes, y seguimiento de los 7 contactos de la cadencia de 14 días.
     * Métricas de ventas: Pipeline total, Tasa de conversión, Eficacia de Nurturing.
5. **`src/features/partner-portal/ClientsModule.jsx`** [MODIFICACIÓN]:
   - Integración de pestaña principal "ARM · CRM Inbound (Odoo)" junto al Directorio y SEPREC.
   - Posibilidad de convertir un lead calificado del CRM directamente a Cliente del Directorio.
6. **`progress/TASK-106.md`** [NUEVO]:
   - Bitácora de ejecución y verificación paso a paso.
7. **`tasks.json`** [MODIFICACIÓN]:
   - Registro de la tarea en cola y posterior cierre formal.

---

### 3. Fases de Ejecución
- **Fase 1:** Migración SQL Supabase (`20261110_arm_inbound_crm.sql`) y Servicio Motor ARM (`armService.js`).
- **Fase 2:** Refactorización e integración del Asistente SERAM (`ChatbotFAB.jsx`) con scoring Inbound y erradicación de emoticones.
- **Fase 3:** Construcción del CRM Estilo Odoo (`ArmOdooCrm.jsx`) con vistas Kanban, Lista y Ficha 360° con Chatter y Cadencia de 14 días.
- **Fase 4:** Integración en `ClientsModule.jsx` y verificación con ESLint, `npm run build` y validación de runtime.
- **Fase 5:** Registro de progreso en `progress/TASK-106.md` y actualización en `tasks.json`.

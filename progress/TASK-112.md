# TASK-112 — Calendario Odoo Multi-Escala (4.5h -> 8h Teletrabajo), Etiquetas Libres, Entrega Rápida con Impacto en Time Tracker/CRM y Sincronización en Segundo Plano con Google Calendar (Google Apps Script & n8n)

## Estado
- **ID:** TASK-112
- **Estado:** Completado (`done`)
- **Fecha:** 2026-11-11
- **Responsable:** Agente Implementador / Verificado por Agente Revisor

## Especificación Técnica (Aprobada vía /grill-me)
1. **Calendario Odoo Multi-Escala (Mes / Semana / Día / Agenda):**
   - Visualización de actividades globales (`activities`) y misiones comerciales del CRM (`arm_lead_activities`) con fecha de inicio (`startDate`), fecha final (`dueDate`) y franja horaria (`startTime` - `endTime`).
   - Medidor de capacidad diaria por socio: **4.5 hrs/día** (fase temprana de teletrabajo) con conmutador a **8.0 hrs/día** (fase intensiva de ventas telefónicas e inbound content marketing).
   - Alerta visual cuando la suma de horas estimadas de un día supera el tope activo (4.5h u 8.0h).
2. **Etiquetas Libres Creadas por cada Socio:**
   - Gestor de etiquetas libres con colores Neuform personalizables para clasificar bloques de trabajo (ej. `Plan de Ventas Telefónicas`, `Formato Vertical / Reels`, `Lead Magnet`, `Seguimiento BANT`, `Consultoría SIG`).
3. **Cierre y Entrega Rápida en el Día:**
   - Modal rápido desde el Calendario para concretar la tarea o cliente asignado:
     - Registra horas reales dedicadas -> alimenta `handleAddTimeLog` (Time Tracker y bolsa operativa).
     - Registra nota de resultado / acuerdo -> sincroniza automáticamente con el Chatter del CRM y acredita puntos **XP** de meritocracia.
4. **Reprogramación Fluida Drag & Drop:**
   - Arrastrar y soltar actividades entre días en el calendario recalculando al instante la barra de carga horaria (4.5h / 8.0h) y enviando notificación de reprogramación.
5. **Ubicación Dual Integrada:**
   - App dedicada `Calendario & Planificación` en `OdooAppLauncher.jsx`.
   - Pestaña/vista `Calendario Odoo` dentro de `ActivitiesAndClientsModule.jsx` y `ArmOdooCrm.jsx`.
6. **Motor de Notificaciones y Sincronización en Segundo Plano (Google Calendar + Google Apps Script + n8n):**
   - Dispatcher asíncrono en segundo plano (`queueMicrotask` / `fetch` non-blocking con cola de reintentos local) que envía cada tarea programada al endpoint de **Google Apps Script (`doPost`)** o **Webhook de n8n** para agendar automáticamente en los Google Calendars individuales de:
     - Socio A (`barrientoso2401@gmail.com` - Ing. Diego Barrientos)
     - Socio B (`fernandoaraujo1912@gmail.com` - Ing. Fernando Araujo)
   - Consola de Automatización integrada con el código completo de Google Apps Script (`Code.gs`) y plantilla de Workflow JSON de n8n listos para desplegar en 2 minutos, además de enlace directo Google Calendar e iCalendar (`.ics`).

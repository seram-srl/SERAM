# Plan de Implementación: Ecosistema Unificado Odoo ERP para SERAM + Calendario Odoo & Automatización Google Calendar / Apps Script / n8n

## Objetivo General
Consolidar el Ecosistema Odoo de SERAM integrando:
1. **Lanzador Central de Aplicaciones (TASK-110 - Completada):** Acceso transversal 3x3 a todas las aplicaciones de SERAM.
2. **Operaciones & Proyectos Ambientales Odoo (TASK-111 - Completada):** Kanban de fases técnicas, Smart Buttons y Chatter de proyecto.
3. **Calendario Odoo Multi-Escala, Capacidad de Teletrabajo (4.5h -> 8h) y Motor de Notificaciones en Segundo Plano vía Google Calendar / Google Apps Script / n8n (TASK-112 - Actual):**
   - Vista de **Calendario Odoo** con escalas **Mes**, **Semana**, **Día** y **Agenda Lineal**.
   - **Medidor de Capacidad Horaria Diaria por Socio:** Tope base de **4.5 hrs/día** en fase temprana de teletrabajo con conmutador instantáneo a **8.0 hrs/día** para fase intensiva (seguimiento telefónico masivo y content marketing vertical / lead magnets). Alerta visual perimetral si un día supera la capacidad pactada.
   - **Sistema de Etiquetas Libres por Socio:** Creación y asignación libre de etiquetas personalizadas (ej. `Llamadas Plan de Ventas`, `Reels / Formato Vertical`, `Lead Magnet Inbound`, `Seguimiento BANT`, `Gabinete SIG`) con selector de color Neuform.
   - **Cierre y Entrega Rápida en el Día:** Al concretar una actividad o cliente asignado en el calendario, modal rápido estilo Odoo que registra:
     1) Horas reales ejecutadas (inyectadas automáticamente al *Time Tracker* y bolsa de compensación operativa).
     2) Resultado / acuerdo alcanzado y evidencia verificable.
     3) Sincronización automática con el Chatter del cliente en el CRM y acreditación de mérito **XP**.
   - **Reprogramación Fluida Drag & Drop:** Arrastrar y soltar actividades entre días o franjas horarias (`startDate` / `dueDate` / `startTime` / `endTime`) recalculando en vivo la barra de 4.5h / 8.0h del día.
   - **Ubicación Dual Integrada:** Aplicación dedicada **`Calendario & Planificación`** en el *Odoo App Switcher*, vista integrada en **Actividades y Tareas**, y vista de calendario dentro de **CRM & Ventas (ARM)**.
   - **Arquitectura de Notificaciones en Segundo Plano (Google Calendar + Google Apps Script + n8n Webhook):**
     - Servicio de despacho asíncrono (`calendarSyncService`) que dispara en segundo plano (non-blocking) cada creación, reprogramación o asignación de tarea con fecha hacia un Webhook configurable de **n8n** y/o **Google Apps Script Web App**.
     - Generador de enlaces profundos a Google Calendar y exportación `.ics` (iCalendar RFC 5545) con alarma `VALARM` para ambos socios:
       - Socio A: `barrientoso2401@gmail.com` (Ing. Diego Barrientos)
       - Socio B: `fernandoaraujo1912@gmail.com` (Ing. Fernando Araujo)
     - Panel de configuración y código listo para copiar/pegar tanto del **Script de Google Apps Script (`doPost`)** (que usa la cuenta central de SERAM para insertar eventos directamente en los calendarios de ambos socios y enviar alertas por correo/push) como del **Workflow JSON de n8n** (Supabase/Webhook -> Google Calendar -> Telegram/Email).
4. **Calendario SERAM & Automatización Docker n8n (TASK-113 - En Progreso):**
   - Retiro integral de "Odoo" del nombre de Calendario en toda la plataforma.
   - Vistas Multi-Escala requeridas: Anual (12 meses con mapa de calor), Trimestral (Q1-Q4 con metas trimestrales de teletrabajo), Mensual, Semanal, Diaria y Agenda.
   - Blindaje y corrección visual garantizada de renderizado.
   - Sincronización nativa con el Docker de n8n de SERAM con payload optimizado hacia Google Calendar de ambos socios (Diego y Fernando).
5. **Finanzas & Compensación Odoo (TASK-114):** Sub-navbar Odoo preservando el 100% de los gráficos Recharts existentes.

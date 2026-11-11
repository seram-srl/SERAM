# TASK-113 — Calendario SERAM: Retiro de "Odoo" del Nombre, Vistas Multi-Escala (Anual, Trimestral Q1-Q4, Mensual, Semanal, Diaria, Agenda), Corrección Visual Definitiva y Automatización Nativa Docker n8n Paso a Paso para No Técnicos

## Estado
- **ID:** TASK-113
- **Estado:** Completado (`done`)
- **Fecha:** 2026-11-11
- **Responsable:** Agente Implementador / Verificado por Agente Revisor

## Requerimientos y Correcciones
1. **Retiro de "Odoo" del Nombre:**
   - En `PartnerDashboard.jsx`: sidebar y cabecera actualizados de "Calendario Odoo (4.5h)" a "Calendario (4.5h)".
   - En `OdooAppLauncher.jsx`: actualizado a "Calendario & Planificación".
   - En `ActivitiesAndClientsModule.jsx`: pestaña actualizada a "Calendario".
   - En `ArmOdooCrm.jsx`: vista y tooltip actualizados a "Vista Calendario (4.5h / 8.0h)".
   - En `OdooCalendarModule.jsx`: títulos, sub-navbar e interfaz actualizados a "Calendario SERAM".
2. **Corrección Visual y Robustecimiento en Runtime:**
   - Eliminación de posibles llamadas a `toLowerCase` o accesos a propiedades sobre objetos nulos/indefinidos en `activities`, `crmActivities` y `crmLeads`.
   - Adición de `ErrorBoundary` preventivo con estado fallback en `PartnerDashboard.jsx`.
   - Garantía de renderizado visual 100% visible con contraste Neuform.
3. **Ampliación de Vistas del Calendario (Petición Explícita del Usuario):**
   - **Vista Anual (`year`):** 12 meses en miniatura con mapa de calor de intensidad de actividades y navegación instantánea al hacer clic en cualquier mes o día.
   - **Vista Trimestral (`quarter`):** Selector Q1 (Ene-Mar), Q2 (Abr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dic), con desglose de los 3 meses, balance acumulado de horas vs meta de teletrabajo del trimestre (ej. ~270 hrs/socio a 4.5h/día) y filtro por socio.
   - **Vista Mensual (`month`):** Cuadrícula completa con Drag & Drop y barras de capacidad diaria.
   - **Vista Semanal (`week`):** 7 columnas detalladas con cálculo de carga diaria.
   - **Vista Diaria (`day`):** Agenda del día con franjas horarias y bloque de teletrabajo.
   - **Vista Agenda (`agenda`):** Lista cronológica continua de compromisos próximos.
4. **Vía n8n con Docker Propio de SERAM (Automatización Paso a Paso para No Técnicos):**
   - Pestaña dedicada "Automatización Docker n8n" en el Calendario.
   - Campo para URL de Webhook de n8n con valor por defecto preconfigurado (`http://localhost:5678/webhook/seram-calendar` o IP del host).
   - Botón "Probar Conexión con Docker n8n" que envía un evento de prueba en vivo.
   - Workflow JSON optimizado para n8n con nodos Webhook y Google Calendar para Socio A (`barrientoso2401@gmail.com`) y Socio B (`fernandoaraujo1912@gmail.com`).
   - Guía paso a paso en lenguaje claro, pedagógico y libre de tecnicismos complejos para activar el flujo en el Docker de SERAM en 3 minutos.

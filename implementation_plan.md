# Plan de Implementación: TASK-107
## Ingeniería Inversa de Odoo CRM, Reemplazo Integral de la Vista de Clientes, Misiones con Meritocracia y Captura Rápida Híbrida para SERAM SRL

### 1. Resumen Ejecutivo
Reemplazar íntegramente la vista actual de Clientes en el Dashboard de Socios de SERAM por una réplica funcional y arquitectónica de **Odoo CRM** (basada en las 11 capturas de referencia proporcionadas), adaptada al sistema de diseño **Neuform** de SERAM SRL (paleta esmeralda/pizarra oscura, cero emoticones, 100% en español).

El sistema unifica:
1. **Navegación Superior Estilo Odoo (`CRM`, `Ventas`, `Reportes`, `Configuración`):** Acceso directo a *Mi flujo (Kanban/Lista)*, *Mis actividades (Misiones)*, *Equipos*, *Clientes (Directorio Real)*, *Prospección SEPREC 150*, *Pronóstico*, *Tipos de actividad* y *Captura Rápida (Telegram / Google Forms)*.
2. **Conexión con la Base de Datos Existente y Etiquetado `(EJEMPLO)`:** Los clientes reales del directorio de SERAM se cargan automáticamente en la etapa inicial *Nuevo Inbound* sin seguimiento activo, mientras que se incluyen 4 tarjetas de demostración claramente identificadas como `(EJEMPLO)` en las etapas avanzadas (*Nutrición 14D*, *Calificado*, *Propuesta*, *Ganado*) para pruebas y detección de bugs.
3. **Creación Rápida Híbrida (Inline Kanban + Webhook Telegram/Google Forms):** Mini-formulario desplegable al pulsar `+` en cualquier columna Kanban (registro en 5 segundos con contacto, oportunidad, email, teléfono, monto en Bs./USD y estrellas de prioridad) más una Edge Function en Supabase (`arm-lead-webhook`) y consola de comando rápido tipo Telegram (`/lead ...`).
4. **Integración Intrínseca de Actividades Clave por Tipo y Meritocracia:** Vinculación de oportunidades con *Misiones Flash, Secundarias, Grupales, Personales y de Especialidad*. Completar una actividad desde el popover de la tarjeta o desde el Chatter exigiendo evidencia verificable otorga XP al socio, registra la tarea en el sistema global de actividades y avanza la oportunidad en el embudo.
5. **Moneda Dual Dinámica (USD y Bs.):** Conversión automática al tipo de cambio oficial boliviano (6.96 Bs./USD) en todas las tarjetas, columnas, formularios y reportes.

---

### 2. Archivos a Crear y Modificar
1. **`supabase/migrations/20261110_arm_inbound_crm.sql`** [MODIFICACIÓN]:
   - Ampliación de `arm_leads` con `prioridad_estrellas` (1-3), `probabilidad_cierre`, `presupuesto_bs`, `etiquetas` (TEXT[]), `is_example` (BOOLEAN).
   - Nuevas tablas `arm_activity_types` (configuración estilo Odoo) y `arm_lead_activities` (misiones vinculadas con tipo, evidencia, XP y estado).
2. **`supabase/functions/arm-lead-webhook/index.ts`** [NUEVO]:
   - Webhook seguro con validación de token, sanitización XSS/SQLi y soporte para payloads de Bot de Telegram (`/lead Empresa | Contacto | Teléfono | Servicio | Monto`) y Google Forms.
3. **`src/services/armService.js`** [MODIFICACIÓN]:
   - Sincronización automática de clientes reales de SERAM en la columna `nuevo` (sin cadencia iniciada) + 4 oportunidades `(EJEMPLO)` en etapas avanzadas.
   - Gestión de `ARM_ACTIVITY_TYPES` y misiones por oportunidad con cálculo de XP y evidencias.
   - Conversión monetaria dual (`USD` <-> `Bs.` a 6.96) y parser de comandos rápidos de Telegram/texto.
4. **`src/features/partner-portal/crm/ArmOdooCrm.jsx`** [MODIFICACIÓN]:
   - Reconstrucción integral siguiendo las 11 capturas de Odoo CRM: barra superior con menús desplegables, botón `Nuevo` + menú `Generar`, creación rápida inline por columna, drag-and-drop entre etapas, popover de actividades planificadas en tarjetas, vista Ficha 360° completa con Chatter lateral, vista de Clientes, vista de SEPREC, vista de Mis Actividades y tabla de Tipos de Actividad.
5. **`src/features/partner-portal/ClientsModule.jsx`** [MODIFICACIÓN]:
   - Reemplazo total de la vista antigua por el contenedor directo de `ArmOdooCrm`, conectando los estados globales de `AppContext` (`clients`, `prospects`, `activities`, `handleAddActivity`, `handleAddClient`).
6. **`progress/TASK-107.md`** y **`tasks.json`** [ACTUALIZACIÓN].

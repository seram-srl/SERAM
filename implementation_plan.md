# Plan de Implementación: Ecosistema Unificado Odoo ERP para SERAM

## Objetivo General
Transformar el Dashboard de Socios de SERAM en un ecosistema empresarial interconectado basado en los patrones de arquitectura de Odoo (App Switcher, sub-navbars contextuales, Smart Buttons transversales, Chatter universal y motor único de misiones con meritocracia XP), aplicando la paleta de identidad de marca SERAM (Neuform: Verde #00e03c, Oro #c9a84c y Grafito #070d17) y protegiendo el 100% de los gráficos y cálculos financieros existentes.

---

## Fases y Subtareas

### Fase 1 (TASK-110) — Lanzador Central de Aplicaciones (Odoo App Switcher) y Cabecera Global del Ecosistema
- Crear el componente `OdooAppLauncher` (icono reticular 3x3 estilo Odoo) en la cabecera fija de SERAM.
- Definir la matriz de aplicaciones principales del ecosistema:
  1. **CRM & Ventas (ARM):** Flujo de clientes, BANT, prospección SEPREC y capturas rápidas.
  2. **Proyectos & Operaciones Ambientales:** Estudios de impacto (EIA), registros (RAI), monitoreo hídrico/mercurio y SIG.
  3. **Finanzas & Compensación Equitativa:** Gráficos de flujo de caja, balance, reserva 20%, compensación operativa por horas y dividendos residuales.
  4. **Propuestas Municipales & Contrataciones:** Líneas base, fichas de licitación, SICOES y rentabilidad.
  5. **Meritocracia, Tiempo & Misiones:** Time Tracker en vivo, registro de misiones (Flash, Grupales, Especialidad) y XP.
  6. **Gobernanza & Cumplimiento Normativo:** Directorio bipartito, actas, SEPREC y blindaje legal.
- Transición fluida entre aplicaciones manteniendo el contexto del socio activo.

### Fase 2 (TASK-111) — Ecosistema Odoo en Proyectos & Operaciones Ambientales
- Implementar la barra superior contextual Odoo en Proyectos: `Proyectos`, `Entregables`, `Reportes`, `Configuración`.
- Vistas estándar: Kanban de etapas operativas, Lista y Actividades.
- Smart Buttons en la ficha de proyecto: `Cliente (1)`, `Horas Registradas (XX h)`, `Rentabilidad Estimada`, `Entregables Técnicos`.
- Chatter lateral de proyecto para acuerdos técnicos y seguimiento de hitos.

### Fase 3 (TASK-112) — Ecosistema Odoo en Finanzas & Compensación (Preservación de Gráficos Recharts)
- Envolver el módulo financiero con la barra superior Odoo: `Panel Financiero`, `Bolsa Operativa`, `Fondo de Reserva`, `Auditoría de Horas`.
- Mantener y realzar los gráficos existentes de Recharts (ingresos vs. costos, distribución de dividendos, curvas de flujo de caja).
- Smart Buttons financieros: `Ingresos Totales`, `Reserva 20% Acumulada`, `Bolsa Disponible`, `Horas Auditadas`.

### Fase 4 (TASK-113) — Interconexión Transversal Total (Smart Buttons y Motor de Misiones Global)
- Sincronización cruzada: desde un cliente en el CRM se puede saltar directamente a sus proyectos y facturación; desde un proyecto se puede saltar a su cliente y a sus misiones asignadas.
- Chatter unificado para todo el portal.

---

## Verificación y Estándares
- Reglas de `AGENTS.md`: máximo 3 archivos por commit, verificación de lint (`npx eslint`), build de Vite (`npm run build`) y commits atómicos.
- Sin emoticones, entorno sobrio y profesional, 100% en español.

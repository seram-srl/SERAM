# Registro de Progreso: TASK-040

## Tarea
**TASK-040:** Blindar persistencia real en Supabase para el Time Tracker (`time_logs` con restricciones NOT NULL resueltas), cursos de SERAM Academy y proyectos operativos con Supabase Realtime; simplificar el flujo de creación UX/UI para proyectos y cursos técnicos con carga directa de documentos PDF, y depurar proyectos duplicados ficticios en la base de datos de producción.

## Fecha
- Inicio: 2026-10-04
- Cierre: 2026-10-04
- Estado: **COMPLETADO / PUBLICADO EN PRODUCCIÓN**

## Diagnóstico y Causa Raíz
1. **Pérdida de Horas en Time Tracker:**
   - La tabla `time_logs` en Supabase posee una restricción `NOT NULL` en la columna `partner_name`.
   - La función `handleAddTimeLog` en el frontend omitía el envío de `partner_name` y `project_title`, provocando que cada inserción fallara con error PostgreSQL `23502` (violación de no-nulos).
   - Debido a esto, las horas existían solo en el estado volátil de React. Al recargar la página o al sincronizarse la lista de proyectos, las horas registradas se reseteaban a 0.
2. **Cursos y Proyectos borrándose o desincronizados:**
   - El timeout de carga inicial de Supabase estaba fijado en 3000ms, lo que causaba abortos prematuros en conexiones moderadas, retrocediendo a datos estáticos.
   - Las suscripciones en tiempo real (Supabase Realtime) no escuchaban cambios en las tablas `courses` y `time_logs`.
   - Al insertar registros en Supabase no se utilizaba `.select()`, lo que dejaba el ID en memoria sin sincronizar con el ID autoincremental de Postgres.

## Cambios Principales Realizados
1. **Blindaje de Persistencia en Supabase (`AppContext.jsx`):**
   - Inserciones a `time_logs` ahora envían obligatoriamente: `partner_name`, `partner_id`, `project_id`, `project_title`, `hours`, `description`, `logged_at`.
   - Integración offline-first resiliente con `localStorage` (`seram_time_logs`) como colchón de respaldo permanente ante interrupciones de red.
   - Ampliación del timeout resiliente a 7000ms para evitar falsos positivos de desconexión.
   - Canal Supabase Realtime actualizado para escuchar eventos en vivo de `time_logs`, `courses`, `projects`, `clients` y `activities`.
   - Mapeo bidireccional de `isProposal` y `tag` ('Propuesta' vs 'Proyecto B2B').
2. **Depuración de Datos en Supabase (Producción):**
   - Eliminación de proyectos duplicados y ficticios. Conservados únicamente los casos reales asignados a los tres socios:
     - *Palos Blancos* (Ing. Diego Barrientos)
     - *Guanay Línea Base Hidrogeoquímica* (Ing. Diego Barrientos)
     - *Minería Ecológica* (Ing. Fernando Araujo)
     - *Plan Minero y Cuencas Guanay* (Ing. Fernando Araujo)
     - *Mitigación Climática / Bonos de Carbono* (Ing. Fernando Araujo)
     - *GAM Cobija Pando* (Ing. Fernando Araujo)
     - *G.A.M.L.P. Lombricultura* (Ing. Fabricio Orosco)
   - Eliminación de cursos duplicados, consolidando el catálogo con cursos reales con PDFs técnicos adjuntos en Supabase Storage.
   - Registro de 3 logs base en `time_logs` de Supabase para validar la persistencia real por socio.
3. **Simplificación UX/UI del Formulario de Proyectos (`PartnerDashboard.jsx`):**
   - Selector directo de 1-clic: **💼 Proyecto B2B** vs **📄 Propuesta Comercial**.
   - Reducción de la fricción a solo 4 campos esenciales visibles: Cliente/Municipio, Título del Servicio, Socio Responsable y Presupuesto en Bs.
   - Uploader directo y destacado de documento PDF (Términos de Referencia o Propuesta Técnica) conectado a Supabase Storage (`project-documents`).
   - Sección colapsable opcional *"Configurar fechas, desglose financiero o ubicación"* para no abrumar al socio en el registro rápido.
4. **Simplificación UX/UI de SERAM Academy (`PartnerDashboard.jsx`):**
   - Eliminación de campos confusos como URL manual de imagen.
   - Carga directa de guías o módulos en formato PDF hacia Supabase Storage.
   - Selector claro de instructor socio y categoría técnica.

## Archivos Modificados
- `src/context/AppContext.jsx`
- `src/features/partner-portal/PartnerDashboard.jsx`
- `tasks.json`
- `progress/TASK-040.md`

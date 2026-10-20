# Registro de Progreso — TASK-091

## Tarea
**ID**: TASK-091  
**Título**: Auditoría y Corrección de Persistencia Realtime de Hitos y Checks: Serialización de Metadatos en Supabase, Saneamiento de LocalStorage y Sincronización Bidireccional  
**Estado**: IN_PROGRESS  
**Fecha de Inicio**: 2026-10-20  
**Líder**: Agente Líder SERAM  
**Implementador**: Delegado (Implementador)  

## Diagnóstico de la Auditoría
1. **Fallo en Actualizaciones de Supabase**: `handleEditActivity` intentaba enviar columnas inexistentes (`milestone_step`, `custom_subtasks`, `weekdays`, etc.) directamente en el objeto `update`, lo cual provocaba error `PGRST204` (400 Bad Request) en la API de Supabase, impidiendo guardar los cambios en la base de datos remota.
2. **Sobreescritura en Recarga / Cambio de Página**: Al recargar o cambiar de ruta, `loadDataFromSupabase()` obtenía las 14 actividades de Supabase sin las columnas de hitos y seteaba `milestoneStep: 0` y estados obsoletos.
3. **Condición Errónea en LocalStorage**: `AppContext.jsx` tenía la condición `parsed.length >= 18` para validar el caché de `localStorage`. Como Supabase contiene 14 actividades (`14 >= 18` es falso), en cada recarga el sistema descartaba el `localStorage` y volvía a cargar el arreglo estático mock.
4. **Desincronización en Slide-over Drawer**: `drawerActivity` mantenía una referencia estática y no se actualizaba cuando el estado de `activities` cambiaba por broadcast en tiempo real o clicks en la tabla.

## Solución Planificada
1. Implementar helper `parseActivityMeta` y `serializeActivityWithMeta` para almacenar y extraer metadatos estructurados en la columna `description` (`<!--SERAM_META:...-->`), compatible con el esquema actual de Supabase sin errores de columna.
2. Enviar a Supabase únicamente las columnas válidas de la tabla (`title`, `description` con metadatos embebidos, `category`, `status`, `priority`, `due_date`, `assigned_partner`, `assigned_partner_email`, `actual_hours`, `estimated_hours`, `deliverable_url`, `deliverable_name`).
3. En `loadDataFromSupabase`, parsear los metadatos de la descripción y fusionar con `localStorage` para garantizar persistencia indestructible.
4. Cambiar la condición de inicialización de `localStorage` de `>= 18` a `> 0`.
5. Asegurar reactividad del Drawer y validación en tiempo real.

## Log de Implementación (Agente Implementador)
- **`src/context/AppContext.jsx`**:
  - Creadas funciones auxiliares exportadas `parseActivityMeta(rawDescription)` y `serializeActivityWithMeta(cleanDesc, meta)`. Extraen y empaquetan la metadata JSON estructurada dentro del tag `<!--SERAM_META:...-->` en la columna `description`, manteniendo el texto limpio para la interfaz de usuario.
  - Saneamiento de la inicialización de `activities` en `useState`: se cambió la validación rígida `parsed.length >= 18` a `parsed.length > 0`, y se incorporó el parseo y limpieza de descripciones con metadatos embebidos para evitar descartes erróneos del caché local al contar con las 14 actividades reales de Supabase.
  - Modificado `loadDataFromSupabase()`: para cada actividad recibida de Supabase, se parsea su metadato de `description` extrayendo `cleanDesc`, `milestoneStep`, `milestoneType`, `customSubtasks`, `weekdays`, `currentValue`, `targetValue`, `validationCriteria`, `okrLevel`, `timeLimitHours`, `isProvisional`, `approved_by`, `approved_at`, `xp_awarded`. Se fusiona con el caché de `localStorage` y el estado en memoria para que no se pierdan datos en caso de filas legacy sin metadatos remotos, y se preservan actividades locales creadas recientemente.
  - Actualizados `handleEditActivity`, `handleAddActivity` y `handleUpdateActivityStatus`:
    - Se serializan de forma segura los metadatos en la columna `description`.
    - Se envían a Supabase únicamente las columnas válidas existentes en la base de datos remota (`title`, `description`, `category`, `status`, `priority`, `due_date`, `assigned_partner`, `assigned_partner_email`, `actual_hours`, `estimated_hours`, `deliverable_url`, `deliverable_name`), eliminando por completo el error `PGRST204` (400 Bad Request).
    - En memoria local y en la emisión vía `broadcastActivityChange`, se conserva la descripción limpia sin tags.
  - Expuestos `parseActivityMeta` y `serializeActivityWithMeta` en el valor del contexto para su reutilización.
- **`src/features/partner-portal/ActivitiesAndClientsModule.jsx`**:
  - Enriquecido el efecto de sincronización del Slide-over Drawer para que, si el drawer está abierto con una actividad, preserve la edición concurrente de campos de formulario pero sincronice inmediatamente cambios de hitos, estados y auditoría provenientes de `activities`.
  - Añadido `useEffect` reactivo que escucha cambios en el arreglo global `activities` (por realtime broadcast, clicks en la tabla o actualizaciones concurrentes) y sincroniza automáticamente `drawerActivity` con la versión viva correspondiente.
- **Validación y Pruebas**:
  - `npm run build` ejecutado exitosamente sin errores de compilación ni problemas de empaquetado (código de salida 0).
  - ESLint ejecutado sobre los componentes modificados con 0 errores y 0 advertencias.

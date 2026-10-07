# Control de Tarea: Consistencia y Persistencia en la Publicación de Cursos de Socios (Ing. Fernando Araujo)

## Diagnóstico Realizado
1. **Pérdida de datos en recarga de página**:
   - `supabaseClient.js` tenía un timeout de 3.5 segundos (`FETCH_TIMEOUT_MS = 3500`) que cancelaba las subidas de PDFs o mutaciones en red lenta/archivos grandes.
   - En `projectStorageService.js`, cuando fallaba la subida, se recurría a convertir el archivo a Base64 `data:application/pdf;base64,...` y guardarlo en `localStorage`. Al superar el límite de 5MB del navegador, lanzaba un `QuotaExceededError`, que al estar en un `try-catch` silenciaba la falla y dejaba el curso solo en la memoria RAM temporal.
   - En `AppContext.jsx`, al recargar la página, se cargaban los cursos de la tabla `courses` de Supabase, que solo tenía 2 cursos antiguos de Diego y Fabricio. Al sincronizar con Supabase, los cursos locales no existentes o campos no presentes en el esquema remoto (como `format`, `pages`, `version`, `sections`) eran pisados o sustituidos por valores por defecto.
   - En `PartnerDashboard.jsx`, el `AcademyModule` no recibía `currentSocio`, dejando por defecto a "Ing. Diego Barrientos" en lugar de sincronizarse con el perfil de la sesión actual de Fernando Araujo.

## Correcciones Implementadas
1. **Ajuste de tiempos de espera en `src/services/supabaseClient.js`**:
   - Se diferenció el timeout: consultas de solo lectura (`GET`) con 7 segundos y operaciones de mutación/archivos (`POST`, `PUT`, `DELETE`, `/storage/`) con 120 segundos para permitir subidas de documentos pesados sin abortos involuntarios.
2. **Almacenamiento seguro y soporte IndexedDB en `src/services/projectStorageService.js`**:
   - Se implementó almacenamiento de respaldo mediante IndexedDB (`seram_storage_db`), evitando desbordar la cuota de `localStorage` con cadenas Base64.
   - Se añadieron tipos MIME correctos (`application/pdf`) y se normalizó la obtención de URLs públicas seguras.
3. **Persistencia y saneamiento en `src/context/AppContext.jsx`**:
   - Implementada la función `saveCoursesToStorage(list)` para limpiar cualquier residuo de data URLs antes de almacenar en `localStorage`.
   - Modificado `loadDataFromSupabase` para:
     - Realizar un merge inteligente por ID o título.
     - Preservar atributos de la modalidad (`format: 'pdf'`, `pages`, `version`, `sections`) aun cuando la base de datos remota no los tenga como columnas directas.
     - Sincronizar todos los cambios locales y remotos usando `saveCoursesToStorage`.
4. **Sincronización de autor en `src/features/partner-portal/PartnerDashboard.jsx`**:
   - Pasada la prop `currentSocio={activeSocio}` a `AcademyModule`.
   - Se añadió un efecto reactivo en `AcademyModule` para que el selector de autor tome automáticamente al socio actualmente conectado (por ejemplo, el Ing. Fernando Araujo).
5. **Carga y persistencia en Base de Datos Supabase**:
   - Se insertaron los cursos faltantes en la tabla `courses` de Supabase directamente.
   - Se realizó la prueba en vivo de creación de un nuevo curso ("Guía Avanzada de Fiscalización Ambiental y Auditoría Pericial 2026") con el autor "Ing. Fernando Araujo".
   - Se verificó la persistencia en Supabase (asignado ID 10) y su persistencia tras recargar (`F5`).
   - Se confirmó su correcta visualización y funcionamiento en el portal público `/academy` y visor de lectura.

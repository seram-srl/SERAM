# Progreso: TASK-035

## Descripción de la Tarea
Optimizar el registro de proyectos y cursos en el Dashboard de socios (`PartnerDashboard.jsx`) para permitir la subida, almacenamiento en Supabase Storage (con fallback offline resiliente) y visualización de documentos técnicos reales en PDF (Términos de Referencia, Propuestas Técnicas y Syllabus de Cursos). Limpiar la base de datos y catálogos de prueba dejando únicamente un ejemplo real y oficial asignado a los socios de SERAM SRL.

## Cambios Implementados

1. **Servicio Resiliente de Almacenamiento (`src/services/projectStorageService.js`)**:
   - Función `uploadProjectDocument(file, entityId, folder)` con intento de subida directa a bucket de Supabase Storage (`project-documents`).
   - Redundancia automática a Base64 `DataURL` y persistencia local ante caídas de red o pausas de DNS de Supabase.
   - Retorno normalizado de `{ url, name, size, isLocalFallback }`.

2. **Depuración de Catálogo a Ejemplos Reales Oficiales (`src/context/AppContext.jsx`)**:
   - **Proyectos B2B**: Reducido a 1 proyecto real oficial:
     - **Código**: `SRM-2026-B2B-01`
     - **Cliente**: *Gobierno Autónomo Municipal de Palos Blancos*
     - **Estudio**: *Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg) y Fuentes de Agua por Minería Aurífera*
     - **Líder**: *Ing. Diego Barrientos*
     - **Equipo Involucrado**: *Ing. Fernando Araujo*, *Ing. Fabricio Orosco*
     - **Presupuesto**: 68,000 Bs. (Utilidad Neta calculada con deducibles de laboratorio y firma externa).
     - **Documento PDF**: `SERAM_TDR_Monitoreo_Palos_Blancos_2026.pdf`
   - **SERAM Academy**: Reducido a 1 curso real oficial:
     - **Título**: *Sistemas de Información Geográfica (SIG) Aplicado a la Gestión y Fiscalización Ambiental en Bolivia*
     - **Instructor**: *Ing. Diego Barrientos*
     - **Horas**: 40 horas prácticas (QGIS & ArcGIS Pro)
     - **Precio**: 350.00 Bs.
     - **Documento PDF**: `Syllabus_Curso_SIG_Ambiental_SERAM_2026.pdf`
   - **Persistencia**: Sincronización automática de `courses` y `activeServices` a `localStorage` para garantizar permanencia de datos añadidos en tiempo real por los socios.

3. **Documento PDF Oficial de Muestra (`src/public/assets/documents/ejemplo_propuesta_tecnica_seram.pdf`)**:
   - Generado en formato estándar PDF 1.4 con carimbo oficial, alcances técnicos, marco legal boliviano (Ley 1333, Convenio de Minamata, DS 4959) y firmas de los socios fundadores.

4. **Mejoras en el Dashboard de Socios (`PartnerDashboard.jsx`)**:
   - **Monitor de Proyectos**:
     - Nueva columna **Documento PDF** con enlace interactivo "TDR / PDF" que abre el documento adjunto en una nueva pestaña o permite descargar la propuesta técnica oficial.
     - Visualización del código de proyecto (`SRM-2026-B2B-01`), municipio/ubicación y etiqueta de estado.
     - Modal de edición actualizado para modificar código, ubicación, descripción y reemplazar/adjuntar nuevo PDF.
   - **Formulario de Registro de Proyectos B2B**:
     - Campos técnicos estructurados: Cliente, Tipo de Servicio, Código Interno SRM, Ubicación / Municipio, Socio Responsable, Fechas de Inicio y Entrega, Presupuesto, Costos de Laboratorio, Costo Firma Externa, Régimen Tributario y Descripción Técnica.
     - Módulo de subida de PDF con selector de archivo local o botón para autocompletar con el PDF Modelo Oficial SERAM.
   - **SERAM Academy (Gestión de Cursos)**:
     - Módulo de subida de Syllabus en PDF al añadir o editar cursos.
     - Botón "Syllabus PDF" en el listado activo de cursos para visualización inmediata por parte de los socios.

## Verificación y Calidad
- `npm run build` ejecutado exitosamente con 0 errores de compilación (`built in 1m 28s`).
- Servidor Vite en localhost activo y respondiendo HTTP 200 en `http://localhost:5173/index.html` y en el endpoint de documentos `http://localhost:5173/assets/documents/ejemplo_propuesta_tecnica_seram.pdf`.

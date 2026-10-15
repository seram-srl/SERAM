# Registro de Progreso: TASK-084

## Tarea
**TASK-084:** Reubicación de Tarjeta Registrar Propuesta Técnica al Principio de SERAM Service (B2B), Soporte de Enlaces de Google Drive/Docs Compartidos y Descarga Fácil de Documentos.

## Fecha
- Inicio: 2026-10-15
- Estado: **APROBADO Y COMPLETADO**
- Responsable: Agente Implementador
- Veredicto Revisor: **APROBADO** (2026-10-15)

## Requerimientos Específicos del Usuario
1. **Reubicación de la Tarjeta al Principio del Segmento SERAM Service (B2B):**
   - Mover la tarjeta "Registrar Nueva Propuesta Técnica / Licitación" (`Add Project Form`) para que esté situada arriba al principio del segmento `subModule === 'projects'` en `PartnerDashboard.jsx`, inmediatamente tras los filtros de Proyectos vs Propuestas y antes del Monitor Financiero y Avance de Proyectos (`Time Progress Table`).
2. **Soporte Dual: Archivos PDF + Enlaces de Google Drive / Docs Compartidos:**
   - Incorporar campo de entrada interactivo para enlaces de Google Drive / Google Docs / URL web compartida en el formulario de registro y en el formulario de edición de proyectos (`editingId`).
   - Botón directo para "Abrir link ➔" en el formulario de registro y "Probar link ➔" en el modal de edición para verificar la URL antes de guardar.
   - Guardado inteligente con prioridad: archivo PDF local subido a Supabase Storage > enlace de Google Drive / Docs colaborativo > PDF Modelo SERAM.
3. **Descarga y Copiado Fácil en la Tabla del Monitor:**
   - Renombrada la columna en la cabecera de la tabla a `'Documento / Drive'`.
   - Botón de **Descarga Directa inteligente** (`Download`): exporta documentos de Google Docs a PDF (`/export?format=pdf`), Google Sheets a PDF, enlaces directos de Google Drive (`uc?export=download&id=...`) o descarga archivos locales/DataURIs.
   - Botón de **Copiar Enlace** al portapapeles (`Copy` / `Check` con feedback interactivo) para compartir rápidamente la URL del documento.
   - Enlace directo (`ExternalLink`) con indicador diferenciado de tipo de recurso (ícono `Link2` para Drive/Docs y `FileText` para PDFs locales).
   - Botón `+ Adjuntar Drive/PDF` cuando el proyecto no tiene documento adjunto, abriendo de inmediato el modo edición.

## Archivos Modificados
- `src/features/partner-portal/PartnerDashboard.jsx`: Reubicación del formulario al inicio de proyectos, adición de estados `newProjDriveUrl`, `copiedProjId`, helpers `handleDownloadProjectDocument` y `handleCopyProjLink`, inputs y botones en monitor de proyectos.
- `progress/TASK-084.md`: Bitácora y seguimiento detallado de la tarea.

## Verificación de Calidad
- ESLint: `npx eslint src/features/partner-portal/PartnerDashboard.jsx` ejecutado con **0 errores y 0 warnings**.
- Build: `npm run build` ejecutado exitosamente sin errores de compilación.

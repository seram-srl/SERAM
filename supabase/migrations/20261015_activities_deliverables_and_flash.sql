-- ==============================================================================
-- SERAM: Migración de Entregables, Descargas, Redundancia de Adjuntos y Misiones Flash
-- TASK-082: Ecosistema Integrado de Actividades Clave
-- ==============================================================================

ALTER TABLE IF EXISTS public.activities
  ADD COLUMN IF NOT EXISTS deliverable_url TEXT,
  ADD COLUMN IF NOT EXISTS deliverable_name TEXT,
  ADD COLUMN IF NOT EXISTS deliverable_type TEXT,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_flash BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS flash_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'principal',
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS co_partner TEXT,
  ADD COLUMN IF NOT EXISTS strategic_objectives JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS milestone_step INTEGER DEFAULT 0;

COMMENT ON COLUMN public.activities.deliverable_url IS 'URL externa o data:uri en base64 del entregable técnico.';
COMMENT ON COLUMN public.activities.deliverable_name IS 'Nombre del archivo entregable subido (.pdf, .jpg, .md, etc.).';
COMMENT ON COLUMN public.activities.deliverable_type IS 'MIME type o extensión del entregable subido.';
COMMENT ON COLUMN public.activities.attachments IS 'Array JSONB de archivos adjuntos técnicos con metadata y redundancia Base64.';
COMMENT ON COLUMN public.activities.is_flash IS 'Bandera booleana que indica si la actividad es una Misión Flash con temporizador regresivo.';
COMMENT ON COLUMN public.activities.flash_expires_at IS 'Timestamp de expiración de la misión flash de contingencia (48h, 72h, 96h).';
COMMENT ON COLUMN public.activities.activity_type IS 'Clasificación de la actividad: principal, secundaria o flash.';
COMMENT ON COLUMN public.activities.start_date IS 'Fecha de inicio programada para la actividad.';
COMMENT ON COLUMN public.activities.co_partner IS 'Socio co-ejecutor en combo interdisciplinario.';
COMMENT ON COLUMN public.activities.strategic_objectives IS 'Objetivos estratégicos alineados a la actividad.';
COMMENT ON COLUMN public.activities.milestone_step IS 'Hito actual de ejecución (0 al 5) según flujo estándar.';

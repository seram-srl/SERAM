-- ==============================================================================
-- SERAM: Migración de Gamificación y Validación Cruzada de Entregables (Anti-Cheat)
-- ==============================================================================

-- 1. Agregar columnas de validación pericial y gamificación en activities
ALTER TABLE IF EXISTS public.activities
  ADD COLUMN IF NOT EXISTS xp_awarded INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS milestone_step INTEGER DEFAULT 0;

-- 2. Asegurar columnas de nivel RPG, credenciales y CV en profiles
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rpg_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS cv_url TEXT,
  ADD COLUMN IF NOT EXISTS renca_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sib_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS syso_verified BOOLEAN DEFAULT false;

-- 3. Comentarios explicativos de auditoría
COMMENT ON COLUMN public.activities.xp_awarded IS 'Puntos de experiencia acreditados al socio tras la aprobación de otro socio.';
COMMENT ON COLUMN public.activities.approved_by IS 'Nombre del socio directivo par que validó el entregable técnico (Anti-Cheat).';
COMMENT ON COLUMN public.activities.approved_at IS 'Fecha y hora en que se auditó y aprobó el entregable.';

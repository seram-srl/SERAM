-- ==============================================================================
-- SERAM - Migración: Personalización de Avatares 2.5D (Oficina Virtual ↔ Perfil)
-- Tabla partner_profiles para sincronización de avatar_config (jsonb) con RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.partner_profiles (
  email text PRIMARY KEY,
  avatar_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  skin text DEFAULT 'vest',
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS de seguridad
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Política de lectura: cualquier usuario o socio puede ver los avatares
DROP POLICY IF EXISTS "Permitir lectura de perfiles de socios" ON public.partner_profiles;
CREATE POLICY "Permitir lectura de perfiles de socios"
  ON public.partner_profiles
  FOR SELECT
  USING (true);

-- 2. Política de escritura / actualización:
DROP POLICY IF EXISTS "Permitir upsert de perfil de socio" ON public.partner_profiles;
CREATE POLICY "Permitir upsert de perfil de socio"
  ON public.partner_profiles
  FOR ALL
  USING (
    (auth.jwt() ->> 'email' = email)
    OR (auth.role() = 'authenticated')
    OR (auth.role() = 'anon')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email' = email)
    OR (auth.role() = 'authenticated')
    OR (auth.role() = 'anon')
  );

-- Comentario explicativo
COMMENT ON TABLE public.partner_profiles IS 'Perfiles y configuraciones de avatar 2.5D de socios de SERAM SRL';

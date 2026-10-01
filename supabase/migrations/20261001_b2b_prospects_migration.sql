-- =============================================================================
-- TABLA B2B_PROSPECTS: BASE DE DATOS GLOBAL DE EMPRESAS PARA GESTIÓN COMERCIAL
-- ORIGEN: GLOBAL BASE DE DATOS SERAM HASTA 18.05.2026 (1).xlsx
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.b2b_prospects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    matricula TEXT,
    razon_social TEXT NOT NULL,
    tipo_societario TEXT,
    departamento TEXT DEFAULT 'LA PAZ',
    municipio TEXT DEFAULT 'LA PAZ',
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    actividad TEXT,
    estado_matricula TEXT DEFAULT 'ACTIVA',
    estado_gestion TEXT DEFAULT 'Prospecto Nuevo' NOT NULL, -- 'Prospecto Nuevo', 'Contactado', 'Cotización Enviada', 'Cliente Cerrado', 'No Interesado'
    socio_asignado TEXT, -- 'Ing. Diego Barrientos', 'Ing. Fernando Araujo', 'Ing. Fabricio Orosco'
    servicio_interes TEXT DEFAULT 'Registro Ambiental Industrial (RAI)',
    notas TEXT
);

COMMENT ON TABLE public.b2b_prospects IS 'Base global de empresas prospecto de Bolivia para captación B2B y trámites ambientales.';

-- RLS
ALTER TABLE public.b2b_prospects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo en b2b_prospects" ON public.b2b_prospects;
CREATE POLICY "Permitir todo en b2b_prospects" ON public.b2b_prospects FOR ALL USING (true) WITH CHECK (true);

-- Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.b2b_prospects;
EXCEPTION WHEN others THEN NULL;
END $$;

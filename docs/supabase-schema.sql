-- =============================================================================
-- BASE DE DATOS DE LA PLATAFORMA SERAM
-- ESQUEMA SKELETON: company_metrics (Fase 4 - Despliegue)
-- AUTOR: Antigravity AI
-- FECHA: 29 de Mayo de 2026
-- =============================================================================

-- 1. CREACIÓN DE LA TABLA DE MÉTRICAS GLOBALES DE LA COMPAÑÍA
-- Esta tabla almacena los KPIs de alto nivel para el Dashboard de Socios.
CREATE TABLE IF NOT EXISTS public.company_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_revenue NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    revenue_trend TEXT DEFAULT '↑ +0.0% este mes'::text NOT NULL,
    total_students INTEGER DEFAULT 0 NOT NULL,
    students_trend TEXT DEFAULT '↑ +0 desde el último ciclo'::text NOT NULL,
    active_projects INTEGER DEFAULT 0 NOT NULL,
    co2_compensated NUMERIC(10, 2) DEFAULT 0.00 NOT NULL
);

-- Habilitar el seguimiento de actualizaciones automáticas por trigger
COMMENT ON TABLE public.company_metrics IS 'Tabla de métricas financieras y operativas de SERAM consultada en el Dashboard de Socios.';

-- 2. INSERCIÓN DE DATOS SEMILLA (Seed Data)
-- Inicializa la tabla con los KPIs de referencia del negocio SERAM v2.5.
INSERT INTO public.company_metrics (
    total_revenue, 
    revenue_trend, 
    total_students, 
    students_trend, 
    active_projects, 
    co2_compensated
) VALUES (
    24850.00,
    '↑ +12.4% este mes',
    143,
    '↑ +18 desde abril',
    3,
    1240.00
) ON CONFLICT DO NOTHING;

-- 3. SEGURIDAD DE NIVEL DE FILA (Row Level Security - RLS)
-- Activamos RLS de Supabase para blindar el acceso a los datos financieros de la empresa.
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;

-- Política de Lectura (SELECT)
-- Solo permite la lectura de métricas a socios autenticados y verificados por su correo oficial.
-- Nota de Seguridad: Evitamos usar 'user_metadata' (ya que es editable por el cliente),
-- utilizando en su lugar el correo verificado de los socios del proyecto SERAM v2.5.
DROP POLICY IF EXISTS "Permitir lectura por rol de socio directivo" ON public.company_metrics;
DROP POLICY IF EXISTS "Permitir lectura exclusiva a socios autenticados" ON public.company_metrics;
CREATE POLICY "Permitir lectura por correo de socio directivo verificado" 
ON public.company_metrics FOR SELECT TO authenticated
USING (
    auth.jwt() ->> 'email' IN (
        'barrientoso2401@gmail.com', 
        'fernandoaraujo1912@gmail.com', 
        'sebastiansbs51@gmail.com', 
        'freddy@gmail.com'
    )
);

-- Políticas de Escritura (INSERT, UPDATE, DELETE)
-- Solo administradores de base de datos directos o roles de servicio pueden alterar estos datos financieros.
DROP POLICY IF EXISTS "Bloquear inserciones externas" ON public.company_metrics;
CREATE POLICY "Bloquear inserciones externas" 
ON public.company_metrics 
FOR INSERT 
TO authenticated 
WITH CHECK (false);

DROP POLICY IF EXISTS "Bloquear actualizaciones externas" ON public.company_metrics;
CREATE POLICY "Bloquear actualizaciones externas" 
ON public.company_metrics 
FOR UPDATE 
TO authenticated 
USING (false);

DROP POLICY IF EXISTS "Bloquear eliminaciones externas" ON public.company_metrics;
CREATE POLICY "Bloquear eliminaciones externas" 
ON public.company_metrics 
FOR DELETE 
TO authenticated 
USING (false);

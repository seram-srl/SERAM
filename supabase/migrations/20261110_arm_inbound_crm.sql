-- =============================================================================
-- TABLAS DEL SISTEMA ARM (AUTOMATED RELATIONSHIP MACHINE) & CRM INBOUND
-- SERAM SRL - SISTEMA DE VENTAS AUTOMATIZADO CON INTELIGENCIA ARTIFICIAL
-- =============================================================================

-- 1. TABLA PRINCIPAL DE LEADS / OPORTUNIDADES COMERCIALES
CREATE TABLE IF NOT EXISTS public.arm_leads (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    empresa TEXT,
    cargo TEXT,
    email TEXT,
    telefono TEXT,
    canal_preferido TEXT DEFAULT 'WhatsApp' NOT NULL,
    
    -- Calificación Inbound (BANT / GPCT)
    que_busca TEXT NOT NULL,
    cuando_necesita TEXT NOT NULL,
    cuanto_invertir TEXT NOT NULL,
    presupuesto_estimado_usd NUMERIC DEFAULT 0,
    
    -- Clasificación y Temperatura
    etapa_pipeline TEXT DEFAULT 'nuevo' NOT NULL, -- 'nuevo', 'nurturing', 'calificado', 'propuesta', 'ganado', 'curioso', 'perdido'
    temperatura TEXT DEFAULT 'tibio' NOT NULL,    -- 'caliente', 'tibio', 'frio'
    lead_score INTEGER DEFAULT 50 NOT NULL,       -- Escala 0 a 100
    clasificacion_inbound TEXT DEFAULT 'MQL' NOT NULL, -- 'SQL', 'MQL', 'TOFU'
    
    -- Gestión Comercial y Asignación
    socio_asignado TEXT DEFAULT 'Ing. Diego Barrientos', -- 'Ing. Diego Barrientos', 'Ing. Fernando Araujo'
    origen TEXT DEFAULT 'Asistente Web SERAM',
    metadata_inbound JSONB DEFAULT '{}'::jsonb,
    
    -- Protocolo de Seguimiento Anti-Baneo (14 Días / 7 Contactos)
    ciclo_dia_actual INTEGER DEFAULT 1 NOT NULL,
    contacto_actual INTEGER DEFAULT 0 NOT NULL,
    proximo_contacto_at TIMESTAMP WITH TIME ZONE,
    cadencia_pausada BOOLEAN DEFAULT false NOT NULL,
    motivo_pausa TEXT,
    notas_internas TEXT
);

COMMENT ON TABLE public.arm_leads IS 'Registro de prospectos calificados con IA, temperatura inbound y seguimiento comercial del sistema ARM de SERAM.';

-- 2. TABLA DE REGISTROS DE LA CADENCIA DE SEGUIMIENTO (14 DÍAS / 7 CONTACTOS)
CREATE TABLE IF NOT EXISTS public.arm_cadence_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id BIGINT REFERENCES public.arm_leads(id) ON DELETE CASCADE NOT NULL,
    numero_contacto INTEGER NOT NULL, -- 1 a 7
    dia_programado INTEGER NOT NULL,  -- 1, 3, 5, 7, 9, 11, 14
    canal TEXT DEFAULT 'WhatsApp' NOT NULL, -- 'WhatsApp', 'Email', 'Llamada'
    estado TEXT DEFAULT 'programado' NOT NULL, -- 'programado', 'enviado', 'respondido', 'omitido'
    asunto TEXT,
    cuerpo_mensaje TEXT NOT NULL,
    fecha_programada TIMESTAMP WITH TIME ZONE,
    fecha_envio TIMESTAMP WITH TIME ZONE,
    resultado TEXT
);

COMMENT ON TABLE public.arm_cadence_logs IS 'Secuencia de 7 impactos estratégicos en ciclo de 14 días bajo protocolo anti-baneo.';

-- 3. TABLA DE CHATTER E INTERACCIONES (ESTILO ODOO CRM)
CREATE TABLE IF NOT EXISTS public.arm_chatter (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id BIGINT REFERENCES public.arm_leads(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT DEFAULT 'nota_interna' NOT NULL, -- 'nota_interna', 'cambio_etapa', 'mensaje_cliente', 'llamada', 'sistema'
    autor TEXT DEFAULT 'Sistema ARM' NOT NULL,
    contenido TEXT NOT NULL
);

COMMENT ON TABLE public.arm_chatter IS 'Chatter cronológico de notas, llamadas, eventos del sistema y cambios de etapa estilo Odoo CRM.';

-- ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_arm_leads_etapa ON public.arm_leads(etapa_pipeline);
CREATE INDEX IF NOT EXISTS idx_arm_leads_temperatura ON public.arm_leads(temperatura);
CREATE INDEX IF NOT EXISTS idx_arm_leads_socio ON public.arm_leads(socio_asignado);
CREATE INDEX IF NOT EXISTS idx_arm_cadence_lead_id ON public.arm_cadence_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_arm_chatter_lead_id ON public.arm_chatter(lead_id);

-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
ALTER TABLE public.arm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_cadence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_chatter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo en arm_leads" ON public.arm_leads;
CREATE POLICY "Permitir todo en arm_leads" ON public.arm_leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en arm_cadence_logs" ON public.arm_cadence_logs;
CREATE POLICY "Permitir todo en arm_cadence_logs" ON public.arm_cadence_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en arm_chatter" ON public.arm_chatter;
CREATE POLICY "Permitir todo en arm_chatter" ON public.arm_chatter FOR ALL USING (true) WITH CHECK (true);

-- SUSCRIPCIÓN EN TIEMPO REAL
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.arm_leads;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.arm_cadence_logs;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.arm_chatter;
EXCEPTION WHEN others THEN NULL;
END $$;

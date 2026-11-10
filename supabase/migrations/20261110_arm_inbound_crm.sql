-- =============================================================================
-- TABLAS DEL SISTEMA ARM (AUTOMATED RELATIONSHIP MACHINE) & ODOO CRM INBOUND
-- SERAM SRL - SISTEMA DE VENTAS AUTOMATIZADO, MISIONES Y MERITOCRACIA
-- =============================================================================

-- 1. TABLA PRINCIPAL DE LEADS / OPORTUNIDADES COMERCIALES (ESTILO ODOO CRM)
CREATE TABLE IF NOT EXISTS public.arm_leads (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    external_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Identificación de Oportunidad y Contacto
    titulo_oportunidad TEXT NOT NULL,
    nombre TEXT NOT NULL,
    empresa TEXT,
    cargo TEXT,
    email TEXT,
    telefono TEXT,
    ubicacion TEXT DEFAULT 'La Paz, Bolivia',
    canal_preferido TEXT DEFAULT 'WhatsApp' NOT NULL,
    client_directory_id TEXT, -- Referencia opcional al directorio de clientes reales
    is_example BOOLEAN DEFAULT false NOT NULL, -- Identificador explícito para maquetas '(EJEMPLO)'
    
    -- Calificación Inbound (BANT / GPCT)
    que_busca TEXT NOT NULL,
    cuando_necesita TEXT NOT NULL,
    cuanto_invertir TEXT NOT NULL,
    
    -- Moneda Dual Dinámica (USD y Bolivianos Bs. - T.C. 6.96)
    presupuesto_estimado_usd NUMERIC DEFAULT 0 NOT NULL,
    presupuesto_bs NUMERIC DEFAULT 0 NOT NULL,
    moneda_preferida TEXT DEFAULT 'USD' NOT NULL, -- 'USD' | 'BOB'
    probabilidad_cierre INTEGER DEFAULT 20 NOT NULL, -- 0 a 100 %
    prioridad_estrellas INTEGER DEFAULT 1 NOT NULL,  -- 0 a 3 estrellas estilo Odoo
    etiquetas TEXT[] DEFAULT '{}'::text[],           -- Píldoras de categoría (FNCA, RAI, Minería, SIG, etc.)
    fecha_cierre_prevista DATE,
    
    -- Clasificación y Temperatura Inbound
    etapa_pipeline TEXT DEFAULT 'nuevo' NOT NULL, -- 'nuevo', 'nurturing', 'calificado', 'propuesta', 'ganado', 'curioso', 'perdido'
    temperatura TEXT DEFAULT 'tibio' NOT NULL,    -- 'caliente', 'tibio', 'frio'
    lead_score INTEGER DEFAULT 50 NOT NULL,       -- Escala 0 a 100
    clasificacion_inbound TEXT DEFAULT 'MQL' NOT NULL, -- 'SQL', 'MQL', 'TOFU'
    
    -- Gestión Comercial y Asignación
    socio_asignado TEXT DEFAULT 'Ing. Diego Barrientos', -- 'Ing. Diego Barrientos', 'Ing. Fernando Araujo'
    equipo_ventas TEXT DEFAULT 'Consultoría Ambiental & SIG',
    origen TEXT DEFAULT 'Asistente Web SERAM',
    metadata_inbound JSONB DEFAULT '{}'::jsonb,
    
    -- Protocolo de Seguimiento Anti-Baneo (14 Días / 7 Contactos)
    ciclo_dia_actual INTEGER DEFAULT 0 NOT NULL,
    contacto_actual INTEGER DEFAULT 0 NOT NULL,
    proximo_contacto_at TIMESTAMP WITH TIME ZONE,
    cadencia_pausada BOOLEAN DEFAULT false NOT NULL,
    motivo_pausa TEXT,
    notas_internas TEXT
);

COMMENT ON TABLE public.arm_leads IS 'Oportunidades comerciales del CRM Odoo de SERAM con soporte BANT, moneda dual USD/Bs, cadencia de 14 días y etiquetado (EJEMPLO).';

-- 2. TABLA DE TIPOS DE ACTIVIDAD Y MISIONES (ESTILO ODOO CONFIGURACIÓN + MERITOCRACIA SERAM)
CREATE TABLE IF NOT EXISTS public.arm_activity_types (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    resumen_predeterminado TEXT NOT NULL,
    planeado_en_dias INTEGER DEFAULT 1 NOT NULL,
    tipo_regla TEXT DEFAULT 'después de la fecha límite de la actividad anterior' NOT NULL,
    categoria_mision TEXT DEFAULT 'secundaria' NOT NULL, -- 'flash', 'secundaria', 'grupal', 'personal', 'especialidad'
    xp_recompensa INTEGER DEFAULT 50 NOT NULL,
    requiere_evidencia BOOLEAN DEFAULT true NOT NULL,
    usuario_predeterminado TEXT DEFAULT 'Socio Asignado'
);

COMMENT ON TABLE public.arm_activity_types IS 'Catálogo de tipos de actividad de Odoo CRM fusionado con el sistema de Misiones y Meritocracia XP de SERAM.';

-- 3. TABLA DE ACTIVIDADES Y MISIONES PLANIFICADAS POR OPORTUNIDAD
CREATE TABLE IF NOT EXISTS public.arm_lead_activities (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    lead_id BIGINT REFERENCES public.arm_leads(id) ON DELETE CASCADE NOT NULL,
    activity_type_code TEXT NOT NULL,
    titulo TEXT NOT NULL,
    resumen TEXT,
    categoria_mision TEXT DEFAULT 'secundaria' NOT NULL, -- 'flash', 'secundaria', 'grupal', 'personal', 'especialidad'
    responsable TEXT NOT NULL,
    participantes TEXT[] DEFAULT '{}'::text[],
    fecha_vencimiento DATE NOT NULL,
    estado TEXT DEFAULT 'pendiente' NOT NULL, -- 'pendiente', 'completada', 'vencida', 'cancelada'
    xp_otorgado INTEGER DEFAULT 50 NOT NULL,
    evidencia_url TEXT,
    evidencia_nota TEXT,
    global_activity_id TEXT -- Vínculo con la tabla global public.activities de SERAM
);

COMMENT ON TABLE public.arm_lead_activities IS 'Misiones y actividades clave vinculadas a cada oportunidad comercial con validación por evidencia y otorgamiento de XP.';

-- 4. TABLA DE REGISTROS DE LA CADENCIA DE SEGUIMIENTO (14 DÍAS / 7 CONTACTOS)
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

-- 5. TABLA DE CHATTER E INTERACCIONES (ESTILO ODOO CRM)
CREATE TABLE IF NOT EXISTS public.arm_chatter (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    lead_id BIGINT REFERENCES public.arm_leads(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT DEFAULT 'nota_interna' NOT NULL, -- 'nota_interna', 'cambio_etapa', 'mensaje_cliente', 'llamada', 'mision_completada', 'sistema'
    autor TEXT DEFAULT 'Sistema ARM' NOT NULL,
    contenido TEXT NOT NULL,
    evidencia_adjunta TEXT,
    xp_ganado INTEGER DEFAULT 0
);

COMMENT ON TABLE public.arm_chatter IS 'Chatter cronológico de notas, llamadas, misiones verificadas, eventos del sistema y cambios de etapa estilo Odoo CRM.';

-- ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_arm_leads_etapa ON public.arm_leads(etapa_pipeline);
CREATE INDEX IF NOT EXISTS idx_arm_leads_temperatura ON public.arm_leads(temperatura);
CREATE INDEX IF NOT EXISTS idx_arm_leads_socio ON public.arm_leads(socio_asignado);
CREATE INDEX IF NOT EXISTS idx_arm_leads_example ON public.arm_leads(is_example);
CREATE INDEX IF NOT EXISTS idx_arm_lead_act_lead ON public.arm_lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_arm_cadence_lead_id ON public.arm_cadence_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_arm_chatter_lead_id ON public.arm_chatter(lead_id);

-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
ALTER TABLE public.arm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_cadence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arm_chatter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acceso autenticado y lectura en arm_leads" ON public.arm_leads;
CREATE POLICY "Permitir acceso autenticado y lectura en arm_leads" ON public.arm_leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en arm_activity_types" ON public.arm_activity_types;
CREATE POLICY "Permitir todo en arm_activity_types" ON public.arm_activity_types FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en arm_lead_activities" ON public.arm_lead_activities;
CREATE POLICY "Permitir todo en arm_lead_activities" ON public.arm_lead_activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en arm_cadence_logs" ON public.arm_cadence_logs;
CREATE POLICY "Permitir todo en arm_cadence_logs" ON public.arm_cadence_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en arm_chatter" ON public.arm_chatter;
CREATE POLICY "Permitir todo en arm_chatter" ON public.arm_chatter FOR ALL USING (true) WITH CHECK (true);

-- SUSCRIPCIÓN EN TIEMPO REAL
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.arm_leads;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.arm_activity_types;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.arm_lead_activities;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.arm_cadence_logs;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.arm_chatter;
EXCEPTION WHEN others THEN NULL;
END $$;

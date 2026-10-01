-- =============================================================================
-- BASE DE DATOS SERAM SRL - MIGRACIÓN CENTRAL DE NOTION A SUPABASE
-- FECHA: Octubre 2026
-- OBJETIVO: Reemplazo integral de Notion para la Central de Actividades Claves,
--           Inscripción de Proyectos y Directorio de Clientes para los Socios.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLA: CLIENTS (Directorio de Clientes e Instituciones de SERAM)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Municipal / Público' NOT NULL, -- Municipal / Público, Minería / Cooperativa, Industrial / Fabril, Privado / Particular
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    location TEXT,
    notes TEXT
);

COMMENT ON TABLE public.clients IS 'Directorio central de clientes, municipalidades e industrias de SERAM SRL.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLA: PROJECTS (Proyectos y Consultorías Ambientales Oficiales)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    code TEXT,
    client TEXT NOT NULL,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0 AND progress <= 100),
    progress_percent INTEGER DEFAULT 0 NOT NULL,
    lead TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    involved TEXT[] DEFAULT '{}'::TEXT[],
    budget NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    lab_costs NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    subcontractor_costs NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    tax_regime TEXT DEFAULT 'Régimen General' NOT NULL,
    location TEXT,
    description TEXT,
    pdf_url TEXT,
    pdf_name TEXT,
    tag TEXT DEFAULT 'Proyecto B2B',
    is_proposal BOOLEAN DEFAULT false,
    proposal_id TEXT
);

COMMENT ON TABLE public.projects IS 'Catálogo y monitor de avance físico y financiero de proyectos ambientales.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLA: ACTIVITIES (Central de Actividades Claves / Tareas de Socios)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    project_id BIGINT REFERENCES public.projects(id) ON DELETE SET NULL,
    project_title TEXT,
    assigned_partner TEXT NOT NULL, -- Ing. Diego Barrientos, Ing. Fernando Araujo, Ing. Fabricio Orosco
    assigned_partner_email TEXT,
    category TEXT DEFAULT 'Consultoría Técnica' NOT NULL, -- SIG / Cartografía, Trámite Ambiental FNCA/RAI, Trabajo de Campo / Muestreo, Elaboración Informe / TDR, Gestión Comercial / Reunión, Administración
    status TEXT DEFAULT 'En curso' NOT NULL, -- Pendiente, En curso, En revisión, Concluido
    priority TEXT DEFAULT 'Media' NOT NULL, -- Baja, Media, Alta, Urgente
    due_date DATE,
    estimated_hours NUMERIC(5, 2) DEFAULT 0.00,
    actual_hours NUMERIC(5, 2) DEFAULT 0.00,
    deliverable_url TEXT,
    deliverable_name TEXT
);

COMMENT ON TABLE public.activities IS 'Central de actividades claves, bitácora y entregables asignados por socio en SERAM.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLA: TIME_LOGS (Registro de Horas y Control Meritocrático)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.time_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    partner_id TEXT NOT NULL,
    partner_name TEXT NOT NULL,
    project_id BIGINT NOT NULL,
    project_title TEXT NOT NULL,
    hours NUMERIC(5, 2) NOT NULL CHECK (hours > 0),
    description TEXT
);

COMMENT ON TABLE public.time_logs IS 'Bitácora de horas trabajadas por socios para distribución meritocrática.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TABLA: COMPANY_METRICS (KPIs Globales del Dashboard)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.company_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_revenue NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    revenue_trend TEXT DEFAULT '↑ +12.4% este mes' NOT NULL,
    total_students INTEGER DEFAULT 0 NOT NULL,
    students_trend TEXT DEFAULT '↑ +18 desde último ciclo' NOT NULL,
    active_projects INTEGER DEFAULT 0 NOT NULL,
    co2_compensated NUMERIC(10, 2) DEFAULT 0.00 NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TABLAS AUXILIARES: COURSES & PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    instructor TEXT NOT NULL,
    students INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'Activo' NOT NULL,
    is_premium BOOLEAN DEFAULT false NOT NULL,
    type TEXT DEFAULT 'mid_ticket' NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    image TEXT,
    duration TEXT,
    "desc" TEXT,
    pdf_url TEXT,
    pdf_name TEXT
);

CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    "desc" TEXT,
    stock INTEGER DEFAULT 0 NOT NULL,
    is_premium BOOLEAN DEFAULT false NOT NULL,
    course_id BIGINT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SEGURIDAD Y PERMISOS (ROW LEVEL SECURITY - RLS)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso Completo para Socios y Portal SERAM
-- (Permiten SELECT, INSERT, UPDATE, DELETE desde la web autorizada)
DROP POLICY IF EXISTS "Permitir todo a usuarios y socios en clients" ON public.clients;
CREATE POLICY "Permitir todo a usuarios y socios en clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a usuarios y socios en projects" ON public.projects;
CREATE POLICY "Permitir todo a usuarios y socios en projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a usuarios y socios en activities" ON public.activities;
CREATE POLICY "Permitir todo a usuarios y socios en activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a usuarios y socios en time_logs" ON public.time_logs;
CREATE POLICY "Permitir todo a usuarios y socios en time_logs" ON public.time_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura en company_metrics" ON public.company_metrics;
CREATE POLICY "Permitir lectura en company_metrics" ON public.company_metrics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en courses" ON public.courses;
CREATE POLICY "Permitir todo en courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo en products" ON public.products;
CREATE POLICY "Permitir todo en products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. STORAGE BUCKET PARA DOCUMENTOS Y ENTREGABLES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Acceso publico lectura bucket project-documents" ON storage.objects;
CREATE POLICY "Acceso publico lectura bucket project-documents"
ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');

DROP POLICY IF EXISTS "Permitir subida a bucket project-documents" ON storage.objects;
CREATE POLICY "Permitir subida a bucket project-documents"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-documents');

DROP POLICY IF EXISTS "Permitir actualizacion bucket project-documents" ON storage.objects;
CREATE POLICY "Permitir actualizacion bucket project-documents"
ON storage.objects FOR UPDATE USING (bucket_id = 'project-documents');

DROP POLICY IF EXISTS "Permitir eliminacion bucket project-documents" ON storage.objects;
CREATE POLICY "Permitir eliminacion bucket project-documents"
ON storage.objects FOR DELETE USING (bucket_id = 'project-documents');

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. HABILITAR REALTIME PARA ACTIVIDADES Y PROYECTOS
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.time_logs;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. DATOS SEMILLA INICIALES (SEED DATA REAL)
-- ─────────────────────────────────────────────────────────────────────────────

-- Clientes Iniciales
INSERT INTO public.clients (name, type, contact_person, contact_phone, location, notes) VALUES
('Gobierno Autónomo Municipal de Palos Blancos', 'Municipal / Público', 'Dirección de Medio Ambiente y Madre Tierra', '+591 71500000', 'Palos Blancos, Alto Beni - La Paz', 'Prioridad: Monitoreo de mercurio y fuentes de agua potable comunales'),
('Gobierno Autónomo Municipal de Guanay', 'Municipal / Público', 'Secretaría Técnica Municipal', '+591 72000000', 'Guanay - La Paz', 'Prioridad: Línea base de contaminación y fiscalización de concesiones auríferas'),
('Cooperativa Minera Aurífera Kaka R.L.', 'Minería / Cooperativa', 'Gerencia de Operaciones', '+591 73000000', 'Río Kaka - La Paz', 'Tramitación de Ficha Ambiental y adecuación a RMCH');

-- Proyectos Iniciales
INSERT INTO public.projects (code, client, type, progress, progress_percent, lead, start_date, end_date, involved, budget, lab_costs, subcontractor_costs, tax_regime, location, description, pdf_name, pdf_url, tag, is_proposal) VALUES
('SRM-2026-B2B-01', 'Gobierno Autónomo Municipal de Palos Blancos', 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg) y Fuentes de Agua por Minería Aurífera', 35, 35, 'Ing. Diego Barrientos', '2026-06-01', '2026-10-31', ARRAY['Ing. Fernando Araujo', 'Ing. Fabricio Orosco'], 68000.00, 12000.00, 8000.00, 'Régimen General', 'Palos Blancos, Alto Beni - La Paz', 'Monitoreo hidrogeoquímico pericial de mercurio total en tomas de agua potable comunales y afluentes mineros del Río Kaka. Incluye mapas de vulnerabilidad geoespacial en ArcGIS Pro, informe pericial y TDRs oficiales.', 'SERAM_TDR_Monitoreo_Palos_Blancos_2026.pdf', '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf', 'Proyecto B2B Oficial', false),
('SRM-2026-B2B-02', 'Gobierno Autónomo Municipal de Guanay', 'Línea Base Hidroambiental y Georreferenciación de Pasivos Mineros', 15, 15, 'Ing. Diego Barrientos', '2026-08-15', '2026-12-15', ARRAY['Ing. Fernando Araujo'], 45000.00, 8500.00, 5000.00, 'Régimen General', 'Guanay - La Paz', 'Delimitación satelital multitemporal de zonas de impacto minero y plan de contingencia hídrica.', 'SERAM_Propuesta_Guanay_2026.pdf', '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf', 'Proyecto B2B Oficial', false);

-- Actividades Claves Iniciales (Migración desde Notion)
INSERT INTO public.activities (title, description, project_id, project_title, assigned_partner, assigned_partner_email, category, status, priority, due_date, estimated_hours, actual_hours) VALUES
('Procesamiento cartográfico y mapa de isolíneas de mercurio en ArcGIS Pro', 'Generación de la capa raster de concentración de mercurio en puntos de toma comunal en Palos Blancos.', 1, 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg)', 'Ing. Diego Barrientos', 'barrientoso2401@gmail.com', 'SIG / Cartografía', 'En curso', 'Alta', '2026-10-15', 18.00, 12.50),
('Revisión legal de TDRs y adecuación a Ley 1333 y Ley de Minería 535', 'Armado de la carpeta legal para presentación ante la comisión del Concejo Municipal.', 1, 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg)', 'Ing. Fernando Araujo', 'fernandoaraujo1912@gmail.com', 'Elaboración Informe / TDR', 'En curso', 'Alta', '2026-10-18', 14.00, 8.00),
('Logística y coordinación de reactivos para segunda campaña de muestreo de agua', 'Cotización de espectrometría con generador de hidruros y frascos de preservación.', 1, 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg)', 'Ing. Fabricio Orosco', 'sebastiansbs51@gmail.com', 'Trabajo de Campo / Muestreo', 'Pendiente', 'Media', '2026-10-22', 10.00, 3.00),
('Reunión técnica de coordinación con Dirección de Medio Ambiente de Guanay', 'Presentación del cronograma de vuelos de dron y puntos de control geodésico.', 2, 'Línea Base Hidroambiental y Georreferenciación de Pasivos Mineros', 'Ing. Diego Barrientos', 'barrientoso2401@gmail.com', 'Gestión Comercial / Reunión', 'Pendiente', 'Media', '2026-10-25', 6.00, 0.00);

-- KPIs Globales
INSERT INTO public.company_metrics (total_revenue, revenue_trend, total_students, students_trend, active_projects, co2_compensated)
VALUES (113000.00, '↑ +15.8% este ciclo', 143, '↑ +18 desde abril', 2, 1240.00);

-- Cursos Oficiales de SERAM Academy
INSERT INTO public.courses (title, instructor, students, status, is_premium, type, price, image, duration, "desc", pdf_name, pdf_url)
VALUES (
    'Sistemas de Información Geográfica (SIG) Aplicado a la Gestión y Fiscalización Ambiental en Bolivia',
    'Ing. Diego Barrientos',
    28,
    'Activo',
    true,
    'mid_ticket',
    350.00,
    '/assets/3d-backend/gis_satellite_mapping.webp',
    '40 horas prácticas (QGIS & ArcGIS Pro)',
    'Capacitación profesional intensiva con datos satelitales bolivianos: delimitación de microcuencas, mapas temáticos para categorización FNCA y licencias ambientales, análisis multitemporal de deforestación y fiscalización pericial.',
    'Syllabus_Curso_SIG_Ambiental_SERAM_2026.pdf',
    '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf'
);

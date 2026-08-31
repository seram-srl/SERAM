-- =============================================================================
-- BASE DE DATOS DE LA PLATAFORMA SERAM
-- MIGRACIÓN UNIFICADA: Fase 3 y 4
-- AUTOR: Antigravity AI (Líder)
-- FECHA: 7 de Agosto de 2026
-- =============================================================================

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. TABLA: PROFILES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- Referencia directa a auth.users.id
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('partner', 'client', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario de la plataforma SERAM vinculados a la autenticación global.';

-- ── 2. TRIGGER AUTOMÁTICO PARA CREAR PERFIL ──────────────────────────────────
-- Este trigger copia automáticamente los datos de auth.users al registrarse un nuevo usuario.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuario Registrado'),
    CASE
      WHEN new.email IN (
        'barrientoso2401@gmail.com',
        'fernandoaraujo1912@gmail.com',
        'sebastiansbs51@gmail.com',
      ) THEN 'partner'
      ELSE 'student'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si ya existe para evitar errores de duplicación
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 3. TABLA: COURSES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    instructor TEXT NOT NULL,
    students INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'Activo' NOT NULL,
    is_premium BOOLEAN DEFAULT false NOT NULL,
    type TEXT DEFAULT 'gratis' NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    image TEXT,
    duration TEXT,
    "desc" TEXT
);

COMMENT ON TABLE public.courses IS 'Catálogo de cursos y e-books de SERAM ACADEMY.';

-- ── 4. TABLA: PROJECTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client TEXT NOT NULL,
    type TEXT NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0 AND progress <= 100),
    lead TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    involved TEXT[] DEFAULT '{}'::TEXT[],
    budget NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    lab_costs NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    subcontractor_costs NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    tax_regime TEXT DEFAULT 'Régimen General' NOT NULL
);

COMMENT ON TABLE public.projects IS 'Proyectos de consultoría ambiental para monitoreo físico y financiero de socios.';

-- ── 5. TABLA: PRODUCTS ───────────────────────────────────────────────────────
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
    course_id BIGINT -- Opcional, vincula compra a desbloqueo de curso
);

COMMENT ON TABLE public.products IS 'Inventario de SERAM Store.';

-- ── 6. TABLA: TIME_LOGS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.time_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    partner_id TEXT NOT NULL, -- Correo del socio directivo
    partner_name TEXT NOT NULL,
    project_id BIGINT NOT NULL,
    project_title TEXT NOT NULL,
    hours NUMERIC(5, 2) NOT NULL CHECK (hours > 0),
    description TEXT
);

COMMENT ON TABLE public.time_logs IS 'Bitácora de control interno de horas dedicadas a proyectos de socios.';

-- ── 7. TABLA: COMPANY_METRICS ────────────────────────────────────────────────
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

COMMENT ON TABLE public.company_metrics IS 'KPIs globales de negocio de SERAM.';

-- ── 8. TABLAS DE PROGRESO ACADÉMICO ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    completed BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.course_exams (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL,
    approved BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.course_assignments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL,
    file_name TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- =============================================================================
-- SEGURIDAD DE NIVEL DE FILA (RLS)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para profiles
CREATE POLICY "Permitir lectura de perfiles a usuarios autenticados"
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir actualización de perfil propio"
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Políticas para courses
CREATE POLICY "Permitir lectura pública de cursos"
    ON public.courses FOR SELECT TO public USING (true);

CREATE POLICY "Permitir gestión de cursos solo a socios"
    ON public.courses FOR ALL TO authenticated USING (
        auth.jwt() ->> 'email' IN (
            'barrientoso2401@gmail.com',
            'fernandoaraujo1912@gmail.com',
            'sebastiansbs51@gmail.com',
            'freddyfarrachol@gmail.com',
            'freddy@gmail.com'
        )
    );

-- 3. Políticas para projects
CREATE POLICY "Permitir acceso total a proyectos solo a socios directivos"
    ON public.projects FOR ALL TO authenticated USING (
        auth.jwt() ->> 'email' IN (
            'barrientoso2401@gmail.com',
            'fernandoaraujo1912@gmail.com',
            'sebastiansbs51@gmail.com',
            'freddyfarrachol@gmail.com',
            'freddy@gmail.com'
        )
    );

-- 4. Políticas para products
CREATE POLICY "Permitir lectura pública de catálogo de productos"
    ON public.products FOR SELECT TO public USING (true);

CREATE POLICY "Permitir gestión de catálogo solo a socios"
    ON public.products FOR ALL TO authenticated USING (
        auth.jwt() ->> 'email' IN (
            'barrientoso2401@gmail.com',
            'fernandoaraujo1912@gmail.com',
            'sebastiansbs51@gmail.com',
            'freddyfarrachol@gmail.com',
            'freddy@gmail.com'
        )
    );

-- 5. Políticas para time_logs
CREATE POLICY "Permitir gestión de logs de tiempo a socios"
    ON public.time_logs FOR ALL TO authenticated USING (
        auth.jwt() ->> 'email' IN (
            'barrientoso2401@gmail.com',
            'fernandoaraujo1912@gmail.com',
            'sebastiansbs51@gmail.com',
            'freddyfarrachol@gmail.com',
            'freddy@gmail.com'
        )
    );

-- 6. Políticas para company_metrics
CREATE POLICY "Permitir lectura de métricas a socios directivos"
    ON public.company_metrics FOR SELECT TO authenticated USING (
        auth.jwt() ->> 'email' IN (
            'barrientoso2401@gmail.com',
            'fernandoaraujo1912@gmail.com',
            'sebastiansbs51@gmail.com',
            'freddyfarrachol@gmail.com',
            'freddy@gmail.com'
        )
    );

CREATE POLICY "Bloquear inserciones externas en company_metrics"
    ON public.company_metrics FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "Bloquear actualizaciones externas en company_metrics"
    ON public.company_metrics FOR UPDATE TO authenticated USING (false);

-- 7. Políticas para lesson_progress
CREATE POLICY "Permitir gestión de progreso a usuario dueño"
    ON public.lesson_progress FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 8. Políticas para course_exams
CREATE POLICY "Permitir gestión de exámenes a usuario dueño"
    ON public.course_exams FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 9. Políticas para course_assignments
CREATE POLICY "Permitir gestión de tareas a usuario dueño"
    ON public.course_assignments FOR ALL TO authenticated USING (auth.uid() = user_id);

-- =============================================================================
-- DATOS SEMILLA (Seed Data)
-- =============================================================================

-- Semilla para company_metrics
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
);

-- Semilla para courses
INSERT INTO public.courses (title, instructor, students, status, is_premium, type, price, image, duration, "desc")
VALUES 
('Ebook: Guía Práctica de la Ley 1333 de *Medio Ambiente*', 'SERAM Legal', 210, 'Activo', false, 'gratis', 0.00, '/assets/covers/cover_ebook_ley1333.png', '80 páginas', 'Compendio interpretado de legislación boliviana, carimbos institucionales, mapas sectoriales y tablas normativas de mitigación.'),
('Herramientas Técnicas de QGIS *Básico*', 'Ing. Diego Barrientos', 85, 'Activo', true, 'low_ticket', 45.00, '/assets/covers/cover_qgis_basico.png', '12 horas', 'Dominio práctico de QGIS aplicado a delimitación de cuencas e informes técnicos bolivianos.'),
('Taller: Metodología de *Fichas Ambientales* e Impacto', 'Ing. Fernando Araujo', 42, 'Activo', true, 'mid_ticket', 120.00, '/assets/covers/cover_taller_fichas.png', '25 horas', 'Metodologías de categorización de obras civiles (FNCA) y adecuación bajo reglamentación boliviana.'),
('Mentoría VIP: Consultoría y *Gestión de Proyectos Ambientales*', 'Ing. Fabricio Orosco', 12, 'Activo', true, 'high_ticket', 450.00, '/assets/covers/cover_mentoria_consultoria.png', '1 mes (1-on-1)', 'Mentoría de élite 1-a-1 para el diseño técnico y defense legal de licencias ambientales mineras e industriales.');

-- Semilla para projects
INSERT INTO public.projects (client, type, progress, lead, start_date, end_date, involved, budget, lab_costs, subcontractor_costs, tax_regime)
VALUES
('Minera Los Andes', 'Estudio de Impacto Ambiental (EsIA)', 85, 'Ing. Diego Barrientos', '2026-01-15', '2026-08-30', ARRAY['Ing. Fabricio Orosco'], 25000.00, 3000.00, 4000.00, 'Régimen General'),
('EcoIndustrial S.A.', 'Auditoría de Gestión de Residuos', 40, 'Ing. Fabricio Orosco', '2026-03-01', '2026-12-15', ARRAY['Ing. Fernando Araujo'], 15000.00, 1000.00, 2000.00, 'Régimen General'),
('Municipio Metropolitano', 'Plan de Ordenamiento Territorial', 100, 'Ing. Fernando Araujo', '2025-10-01', '2026-05-30', ARRAY['Ing. Diego Barrientos'], 35000.00, 5000.00, 6000.00, 'Régimen General');

-- Semilla para products
INSERT INTO public.products (name, price, category, image, "desc", stock, is_premium, course_id)
VALUES
('Compostera Doméstica *Lombri-Kit*', 85.00, 'Bio-Insumos', 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400', 'Kit de compostaje con núcleo de *lombrices rojas californianas* y manual de *bio-huerto*.', 35, false, NULL),
('Kit Analítico de *Calidad de Agua*', 120.00, 'Monitoreo', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=400', 'Medidores digitales portátiles de pH, TDS y reactivos químicos para *análisis rápido de agua*.', 15, true, NULL),
('Ebook: Guía Práctica de la Ley 1333', 15.00, 'E-Books', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=400', 'Versión digital en PDF del compendio interpretado de legislación boliviana. Desbloquea lectura en Academy.', 9999, false, 5),
('QGIS Geo-Database Bolivia (Zonificación)', 95.00, 'SIG & Mapas', 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=400', 'Capas vectoriales listas (SHP/GPKG) de *áreas protegidas*, hidrografía y suelos de Bolivia.', 50, true, NULL),
('Bolsa Ecológica Reutilizable SERAM', 8.00, 'Merchandise', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=400', '*Yute natural* de alta densidad para compras conscientes.', 200, false, NULL),
('Ebook: Técnicas de *Restauración Ecológica*', 18.00, 'E-Books', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=400', 'Guía práctica ilustrada de *restauración ecológica* y remediación forestal aplicada. Desbloquea contenido.', 9999, false, NULL);

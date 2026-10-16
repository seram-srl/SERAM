import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Download, Compass, Award, User, Clock, ArrowRight, 
    ShieldAlert, AlertTriangle, CheckCircle2, FileText, PhoneCall, 
    ExternalLink, Scale, Building2, Flame, HelpCircle
} from 'lucide-react';
import '../../styles/academy-cinematic.css';

// Catálogo base de respaldo para garantizar recursos de alto valor y cero categorías vacías
const FALLBACK_COURSES = [
    {
        id: 1,
        title: 'Ebook: Guía Práctica de la Ley 1333 de *Medio Ambiente*',
        instructor: 'SERAM Legal',
        students: 210,
        status: 'Activo',
        isPremium: false,
        type: 'gratis',
        format: 'pdf',
        hasVideo: false,
        price: 0,
        image: '/assets/covers/cover_ebook_ley1333.png',
        duration: '80 páginas',
        pages: 80,
        desc: 'Compendio interpretado de legislación boliviana, carimbos institucionales, mapas sectoriales y tablas normativas de mitigación.',
        category: 'formatos',
        tags: ['formatos', 'tramites']
    },
    {
        id: 2,
        title: 'Herramientas Técnicas de QGIS *Básico & Cartografía*',
        instructor: 'Ing. Diego Barrientos',
        students: 85,
        status: 'Activo',
        isPremium: true,
        type: 'low_ticket',
        format: 'video',
        hasVideo: true,
        price: 45,
        image: '/assets/covers/cover_qgis_basico.png',
        duration: '12 horas',
        desc: 'Dominio práctico de QGIS aplicado a delimitación de cuencas, superposición de áreas protegidas e informes técnicos bolivianos.',
        category: 'gis_mapas',
        tags: ['gis_mapas']
    },
    {
        id: 3,
        title: 'Taller Práctico: Metodología de *Fichas Ambientales* e Impacto',
        instructor: 'Ing. Fernando Araujo',
        students: 42,
        status: 'Activo',
        isPremium: true,
        type: 'mid_ticket',
        format: 'video',
        hasVideo: true,
        price: 120,
        image: '/assets/covers/cover_taller_fichas.png',
        duration: '25 horas',
        desc: 'Metodologías de categorización de obras civiles e industriales (FNCA), matrices PPM-PASA y adecuación bajo D.S. 3549.',
        category: 'tramites',
        tags: ['tramites', 'regularizacion']
    },
    {
        id: 4,
        title: 'Auditoría y Regularización de Emergencia ante la *AACD/AACN*',
        instructor: 'Ing. Fabricio Orosco',
        students: 18,
        status: 'Activo',
        isPremium: true,
        type: 'high_ticket',
        format: 'video',
        hasVideo: true,
        price: 350,
        image: '/assets/covers/cover_mentoria_consultoria.png',
        duration: '15 horas + Asesoría',
        desc: 'Protocolo técnico y legal paso a paso para levantar clausuras preventivas, responder conminatorias y subsanar pasivos ambientales.',
        category: 'regularizacion',
        tags: ['regularizacion', 'tramites']
    },
    {
        id: 5,
        title: 'Pack de Carimbos Técnicos Oficiales WGS-84 y Matrices *PPM-PASA*',
        instructor: 'SERAM Ingeniería',
        students: 340,
        status: 'Activo',
        isPremium: false,
        type: 'gratis',
        format: 'pdf',
        hasVideo: false,
        price: 0,
        image: '/assets/3d-backend/gis_satellite_mapping.webp',
        duration: 'Dossier Descargable',
        pages: 45,
        desc: 'Plantillas en formato DWG/DXF y PDF listas para impresión A3/A4 con rotulación técnica exigida por el Viceministerio de Medio Ambiente.',
        category: 'formatos',
        tags: ['formatos', 'gis_mapas']
    },
    {
        id: 6,
        title: 'Gestión Integral de Trámites: Licencias Ambientales *Cat. 1 a 4*',
        instructor: 'Ing. Fernando Araujo',
        students: 65,
        status: 'Activo',
        isPremium: true,
        type: 'mid_ticket',
        format: 'video',
        hasVideo: true,
        price: 80,
        image: '/assets/covers/cover_taller_fichas.png',
        duration: '18 horas',
        desc: 'Guía exhaustiva para la categorización FNCA, DAA, EEIA y Certificados de Dispensación bajo los decretos reglamentarios vigentes.',
        category: 'tramites',
        tags: ['tramites', 'regularizacion']
    }
];

export default function AcademyPage() {
    const navigate = useNavigate();
    const { courses } = useApp();

    // Modo activo de panel superior: 'consultoria' | 'academia'
    const [activePanel, setActivePanel] = useState('consultoria');

    // Categorías del catálogo de formación
    const [activeCategory, setActiveCategory] = useState('todos');

    // Estado del autodiagnóstico empresarial interactivo en Modo Consultoría
    const [auditAnswers, setAuditAnswers] = useState({
        licencia: null,   // 'sin_licencia' | 'en_tramite' | 'vigente'
        monitoreo: null,  // 'nunca' | 'atrasado' | 'al_dia'
        cartografia: null // 'sin_plano' | 'desactualizado' | 'georreferenciado'
    });

    const TABS = [
        { 
            id: 'todos', 
            label: 'Todos los Recursos', 
            desc: 'Catálogo integral: cursos en video, e-books y entregables técnicos.',
            badge: 'Catálogo Integral'
        },
        { 
            id: 'regularizacion', 
            label: 'Regularización de Emergencia', 
            desc: 'Evita multas, suspensiones y clausuras de actividad por incumplimiento legal.',
            badge: 'Defensa & Sanciones'
        },
        { 
            id: 'tramites', 
            label: 'Requisitos y Trámites Ambientales', 
            desc: 'Procedimientos paso a paso para Licencias Ambientales, D.S. 3549 y Ley 1333.',
            badge: 'Marco Legal'
        },
        { 
            id: 'gis_mapas', 
            label: 'Herramientas Técnicas y Mapas', 
            desc: 'Capacitación en software GIS, cartografía oficial y análisis de superposición.',
            badge: 'SIG & Cartografía'
        },
        { 
            id: 'formatos', 
            label: 'Formatos Oficiales Descargables', 
            desc: 'Carimbos técnicos, matrices PPM-PASA, checklists y documentos en formato PDF.',
            badge: 'Descargables'
        }
    ];

    // Fusión de cursos locales/remotos con catálogo de respaldo
    const allAvailableCourses = useMemo(() => {
        if (!courses || courses.length === 0) return FALLBACK_COURSES;
        
        const mergedMap = new Map();
        FALLBACK_COURSES.forEach(fc => mergedMap.set(fc.id, fc));
        courses.forEach(c => {
            const existing = mergedMap.get(c.id);
            mergedMap.set(c.id, { ...(existing || {}), ...c });
        });
        return Array.from(mergedMap.values());
    }, [courses]);

    // Filtrado inteligente por dolor y categoría
    const filteredCourses = useMemo(() => {
        return allAvailableCourses.filter(course => {
            if (activeCategory === 'todos') return true;

            // Coincidencia directa por categoría o tags
            if (course.category === activeCategory) return true;
            if (Array.isArray(course.tags) && course.tags.includes(activeCategory)) return true;

            const searchCorpus = `${course.title} ${course.desc || ''} ${course.type || ''}`.toLowerCase();

            if (activeCategory === 'regularizacion') {
                return searchCorpus.includes('regulariz') || 
                       searchCorpus.includes('emergencia') || 
                       searchCorpus.includes('multa') || 
                       searchCorpus.includes('auditor') || 
                       searchCorpus.includes('clausura') ||
                       searchCorpus.includes('consultor') || 
                       course.type === 'high_ticket';
            }

            if (activeCategory === 'tramites') {
                return searchCorpus.includes('trámite') || 
                       searchCorpus.includes('tramite') || 
                       searchCorpus.includes('ley 1333') || 
                       searchCorpus.includes('normat') || 
                       searchCorpus.includes('licencia') || 
                       searchCorpus.includes('ficha') || 
                       searchCorpus.includes('fnca') || 
                       searchCorpus.includes('impacto') || 
                       course.type === 'mid_ticket';
            }

            if (activeCategory === 'gis_mapas') {
                return searchCorpus.includes('qgis') || 
                       searchCorpus.includes('gis') || 
                       searchCorpus.includes('mapa') || 
                       searchCorpus.includes('cuenca') || 
                       searchCorpus.includes('cartograf') || 
                       searchCorpus.includes('satelit') || 
                       course.type === 'low_ticket';
            }

            if (activeCategory === 'formatos') {
                return course.format === 'pdf' || 
                       course.type === 'gratis' || 
                       searchCorpus.includes('ebook') || 
                       searchCorpus.includes('carimbo') || 
                       searchCorpus.includes('formato') || 
                       searchCorpus.includes('plantilla') || 
                       searchCorpus.includes('ppm-pasa') || 
                       searchCorpus.includes('descargable');
            }

            return true;
        });
    }, [allAvailableCourses, activeCategory]);

    const getIconForCategory = (type, format) => {
        if (format === 'pdf' || type === 'gratis') return <Download className="w-4 h-4 text-amber-400" />;
        switch (type) {
            case 'low_ticket': return <BookOpen className="w-4 h-4 text-[#00e03c]" />;
            case 'mid_ticket': return <Compass className="w-4 h-4 text-[#00e03c]" />;
            case 'high_ticket': return <Award className="w-4 h-4 text-[#00e03c]" />;
            default: return <BookOpen className="w-4 h-4 text-[#00e03c]" />;
        }
    };

    const renderFormattedText = (text) => {
        if (!text) return '';
        const parts = text.split(/(\*.*?\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return <span key={index} className="italic text-[#00e03c] font-semibold">{part.slice(1, -1)}</span>;
            }
            return part;
        });
    };

    // Cálculo dinámico del semáforo de riesgo ambiental corporativo
    const riskAnalysis = useMemo(() => {
        const { licencia, monitoreo, cartografia } = auditAnswers;
        const totalAnswered = [licencia, monitoreo, cartografia].filter(Boolean).length;

        const hasCritical = licencia === 'sin_licencia' || monitoreo === 'nunca' || cartografia === 'sin_plano';
        const hasWarning = licencia === 'en_tramite' || monitoreo === 'atrasado' || cartografia === 'desactualizado';

        if (hasCritical) {
            return {
                level: 'CRÍTICO',
                color: 'text-rose-400',
                border: 'border-rose-500/60',
                bg: 'bg-rose-950/30',
                glow: 'shadow-[0_0_25px_rgba(244,63,94,0.3)]',
                title: 'Riesgo Crítico de Multa Patrimonial o Clausura (AACN / AACD)',
                message: 'Tu actividad u obra se encuentra en infracción directa ante la Ley 1333 y el D.S. 3549. Ante una fiscalización sorpresa, te expones a multas de hasta el 3 por mil de activos y suspensión inmediata de operaciones.',
                recommendation: 'Requiere regularización prioritaria con auditoría de pasivos ambientales e ingreso formal de IRAP.',
                answered: totalAnswered
            };
        }

        if (hasWarning) {
            return {
                level: 'MODERADO',
                color: 'text-amber-400',
                border: 'border-amber-500/60',
                bg: 'bg-amber-950/30',
                glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
                title: 'Contingencia Administrativa Pendiente de Subsanación',
                message: 'Existen trámites demorados o informes pendientes de recepción que pueden derivar en conminatorias y sumarios administrativos por la Autoridad Ambiental Competente.',
                recommendation: 'Recomendamos actualizar compromisos PPM-PASA y regularizar cartografía oficial con consultor RENCA.',
                answered: totalAnswered
            };
        }

        if (totalAnswered === 3) {
            return {
                level: 'CONTROLADO',
                color: 'text-emerald-400',
                border: 'border-emerald-500/60',
                bg: 'bg-emerald-950/30',
                glow: 'shadow-[0_0_25px_rgba(16,185,129,0.2)]',
                title: 'Cumplimiento Normativo Favorable',
                message: 'Tu empresa cuenta con documentación de base. Sugerimos auditorías preventivas anuales para garantizar la trazabilidad de los compromisos ante inspecciones rutinarias.',
                recommendation: 'Mantén capacitado a tu personal técnico con nuestros cursos y formatos oficiales.',
                answered: totalAnswered
            };
        }

        return {
            level: 'PENDIENTE',
            color: 'text-gray-400',
            border: 'border-white/10',
            bg: 'bg-white/[0.02]',
            glow: '',
            title: 'Responde las 3 preguntas para obtener tu diagnóstico de riesgo',
            message: 'Selecciona una opción en cada punto para calcular tu exposición legal ante inspecciones de la Autoridad Ambiental Competente en Bolivia.',
            recommendation: 'Evaluación rápida y confidencial.',
            answered: totalAnswered
        };
    }, [auditAnswers]);

    return (
        <div className="inner-page min-h-screen relative w-full overflow-hidden bg-[#020202]">
            
            {/* 1. Fondo Dinámico de Video Ambiental con Velo Cinematográfico Neuform */}
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <video
                    src="/assets/videos/cambio_climatico_bolivia.mp4"
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                    onError={(e) => {
                        // Fallback suave a bg_home.mp4 si el video primario no responde
                        if (!e.currentTarget.dataset.fallbackApplied) {
                            e.currentTarget.dataset.fallbackApplied = 'true';
                            e.currentTarget.src = '/assets/3d-backend/bg_home.mp4';
                        }
                    }}
                />
                {/* Velo oscuro translúcido con gradiente Neuform para garantizar contraste WCAG AAA */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020202]/95 via-[#020202]/85 to-[#020202]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/25 via-transparent to-black/90" />
                <div className="absolute inset-0 neuform-grid-bg opacity-15" />
            </div>

            {/* Contenido Principal */}
            <main className="academy-viewport min-h-screen flex flex-col items-center justify-start pt-16 pb-24 px-4 md:px-8 relative z-10 w-full max-w-7xl mx-auto">
                
                {/* 2. Encabezado Semántico: H1 SEO de Dolor Validado */}
                <header className="text-center max-w-4xl flex flex-col items-center gap-4 mb-12 pointer-events-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase font-display">
                        ¿Tu Empresa Cumple con la <span className="text-gradient-premium">Normativa Ambiental</span> en Bolivia?
                    </h1>
                    
                    <p className="text-amber-400 font-bold text-base md:text-xl tracking-wide uppercase">
                        Identifica Riesgos y Evita Multas o Clausuras
                    </p>
                    
                    <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-3xl">
                        Diagnostica pasivos ambientales, licencias pendientes (DAA, CD, EEIA) y contingencias técnicas ante la Autoridad Ambiental Competente (AACN / AACD) antes de una inspección, o accede a herramientas y formación técnica especializada.
                    </p>
                </header>

                {/* 3. Dos Paneles Superiores (Línea Roja en modo de Selección Activa) */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 pointer-events-auto">
                    
                    {/* PANEL A: MODO CONSULTORÍA (Problema Empresarial / Riesgo) */}
                    <button
                        type="button"
                        onClick={() => setActivePanel('consultoria')}
                        className={`relative text-left p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group ${
                            activePanel === 'consultoria'
                                ? 'bg-rose-950/25 border-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.25)] ring-2 ring-rose-500/60 scale-[1.01]'
                                : 'bg-black/40 border-white/10 hover:border-rose-500/40 hover:bg-rose-950/10'
                        }`}
                    >
                        {/* Línea Roja Superior de Estado Activo */}
                        <div
                            className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 ${
                                activePanel === 'consultoria'
                                    ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 opacity-100 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                                    : 'bg-transparent opacity-0'
                            }`}
                        />

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                    Modo Consultoría Empresarial
                                </span>
                                {activePanel === 'consultoria' && (
                                    <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                                        Selección Activa
                                    </span>
                                )}
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-3 group-hover:text-rose-300 transition-colors">
                                Tengo un Problema Ambiental en mi Empresa
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed mb-4">
                                Identifica contingencias, licencias pendientes (DAA, CD, EEIA), multas acumulativas o inspecciones inminentes de la AACN / AACD.
                            </p>

                            <ul className="space-y-2 text-xs text-gray-400 mb-6">
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                    <span>Riesgo de clausura, paralización de obras o multas patrimoniales.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                    <span>Auditoría de pasivos y regularización inmediata con consultores RENCA.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                Abrir Diagnóstico de Riesgos & Sanciones
                            </span>
                            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${activePanel === 'consultoria' ? 'translate-x-1 text-rose-400' : 'text-gray-500'}`} />
                        </div>
                    </button>

                    {/* PANEL B: MODO ACADEMIA (Capacitación / Herramientas) */}
                    <button
                        type="button"
                        onClick={() => setActivePanel('academia')}
                        className={`relative text-left p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group ${
                            activePanel === 'academia'
                                ? 'bg-[#00e03c]/10 border-[#00e03c] shadow-[0_0_35px_rgba(0,224,60,0.2)] ring-2 ring-[#00e03c]/50 scale-[1.01]'
                                : 'bg-black/40 border-white/10 hover:border-[#00e03c]/40 hover:bg-[#00e03c]/5'
                        }`}
                    >
                        {/* Línea Verde Superior de Estado Activo */}
                        <div
                            className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 ${
                                activePanel === 'academia'
                                    ? 'bg-gradient-to-r from-[#00e03c] via-emerald-400 to-[#00e03c] opacity-100 shadow-[0_0_12px_rgba(0,224,60,0.8)]'
                                    : 'bg-transparent opacity-0'
                            }`}
                        />

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30">
                                    <BookOpen className="w-3.5 h-3.5 text-[#00e03c]" />
                                    Modo Academia y Recursos
                                </span>
                                {activePanel === 'academia' && (
                                    <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#00e03c] bg-[#00e03c]/10 px-2.5 py-0.5 rounded border border-[#00e03c]/30 animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-[#00e03c] inline-block" />
                                        Selección Activa
                                    </span>
                                )}
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-3 group-hover:text-[#00e03c] transition-colors">
                                Quiero Capacitarme o Descargar Herramientas
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed mb-4">
                                Accede a cursos especializados, plantillas oficiales en PDF, carimbos normativos y guías de software GIS para ingenieros y consultores.
                            </p>

                            <ul className="space-y-2 text-xs text-gray-400 mb-6">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e03c] shrink-0 mt-0.5" />
                                    <span>Cursos en video HD y talleres prácticos paso a paso.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Download className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                    <span>Formatos descargables de carimbos y matrices PPM-PASA.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00e03c] flex items-center gap-1.5">
                                Explorar Catálogo por Puntos de Dolor
                            </span>
                            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${activePanel === 'academia' ? 'translate-x-1 text-[#00e03c]' : 'text-gray-500'}`} />
                        </div>
                    </button>
                </div>

                {/* VISTA DINÁMICA: CONMUTACIÓN ENTRE MODO CONSULTORÍA Y MODO ACADEMIA */}
                <AnimatePresence mode="wait">
                    {activePanel === 'consultoria' ? (
                        /* ========================================================================= */
                        /* VISTA A: PANEL DE CONSULTORÍA, DIAGNÓSTICO DE RIESGOS Y DEFENSA LEGAL     */
                        /* ========================================================================= */
                        <motion.section
                            key="view-consultoria"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35 }}
                            className="w-full max-w-5xl flex flex-col gap-10 pointer-events-auto"
                        >
                            {/* Autodiagnóstico Rápido de Cumplimiento Empresarial */}
                            <div className="neuform-card p-6 sm:p-10 border border-white/10 bg-black/60 relative overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                            Autoevaluación Inmediata (3 Preguntas)
                                        </span>
                                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
                                            Calculadora de Riesgo ante Fiscalización Ambiental
                                        </h3>
                                    </div>
                                    <span className="text-xs font-mono text-gray-400">
                                        Respondidas: <strong className="text-white">{riskAnalysis.answered} / 3</strong>
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                                    
                                    {/* Pregunta 1: Licencia Ambiental */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-rose-400" />
                                            1. Licencia Ambiental
                                        </label>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'sin_licencia', label: 'Sin Licencia (Operando)', desc: 'Riesgo Crítico de Clausura' },
                                                { id: 'en_tramite', label: 'En Trámite / Observada', desc: 'Riesgo de Conminatoria' },
                                                { id: 'vigente', label: 'Vigente con DAA / CD', desc: 'Cumplimiento Legal' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setAuditAnswers(prev => ({ ...prev, licencia: opt.id }))}
                                                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                                        auditAnswers.licencia === opt.id
                                                            ? 'border-rose-500 bg-rose-500/20 text-white font-bold ring-1 ring-rose-500/50'
                                                            : 'border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white'
                                                    }`}
                                                >
                                                    <div className="font-semibold">{opt.label}</div>
                                                    <div className="text-[10px] opacity-70 font-light mt-0.5">{opt.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pregunta 2: Monitoreo Anual */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                                            <Scale className="w-3.5 h-3.5 text-amber-400" />
                                            2. Informes de Monitoreo (IMA)
                                        </label>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'nunca', label: 'Nunca Hemos Presentado', desc: 'Multas Acumulativas' },
                                                { id: 'atrasado', label: 'Atrasado (>1 Año)', desc: 'Sumario Administrativo' },
                                                { id: 'al_dia', label: 'Al Día con Sello Oficial', desc: 'Monitoreo Periódico' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setAuditAnswers(prev => ({ ...prev, monitoreo: opt.id }))}
                                                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                                        auditAnswers.monitoreo === opt.id
                                                            ? 'border-amber-500 bg-amber-500/20 text-white font-bold ring-1 ring-amber-500/50'
                                                            : 'border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white'
                                                    }`}
                                                >
                                                    <div className="font-semibold">{opt.label}</div>
                                                    <div className="text-[10px] opacity-70 font-light mt-0.5">{opt.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pregunta 3: Cartografía / Planos */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                                            <Compass className="w-3.5 h-3.5 text-emerald-400" />
                                            3. Georreferenciación WGS-84
                                        </label>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'sin_plano', label: 'Sin Plano o Croquis Básico', desc: 'Incertidumbre Catastral' },
                                                { id: 'desactualizado', label: 'Plano Local sin WGS-84', desc: 'Riesgo de Superposición' },
                                                { id: 'georreferenciado', label: 'Plano Digital Oficial', desc: 'Carimbo Técnico Válido' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setAuditAnswers(prev => ({ ...prev, cartografia: opt.id }))}
                                                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                                                        auditAnswers.cartografia === opt.id
                                                            ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold ring-1 ring-emerald-500/50'
                                                            : 'border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white'
                                                    }`}
                                                >
                                                    <div className="font-semibold">{opt.label}</div>
                                                    <div className="text-[10px] opacity-70 font-light mt-0.5">{opt.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cuadro de Resultado de Diagnóstico Dinámico */}
                                <div className={`p-6 rounded-2xl border transition-all ${riskAnalysis.border} ${riskAnalysis.bg} ${riskAnalysis.glow}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className={`w-5 h-5 ${riskAnalysis.color}`} />
                                            <span className={`text-xs font-extrabold uppercase tracking-widest ${riskAnalysis.color}`}>
                                                ESTADO: {riskAnalysis.level}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 font-mono">
                                            Diagnóstico Preliminar SERAM Legal & Técnico
                                        </span>
                                    </div>

                                    <h4 className="text-base sm:text-lg font-black text-white tracking-tight mb-2">
                                        {riskAnalysis.title}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed mb-4">
                                        {riskAnalysis.message}
                                    </p>
                                    <p className="text-xs text-amber-300 font-medium mb-6">
                                        💡 {riskAnalysis.recommendation}
                                    </p>

                                    {/* Acciones de Contacto Inmediato */}
                                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/cotizar')}
                                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-2 cursor-pointer"
                                        >
                                            Solicitar Cotización de Regularización Urgente
                                            <ArrowRight className="w-4 h-4" />
                                        </button>

                                        <a
                                            href="https://wa.me/59176200109?text=Hola%20SERAM,%20necesito%20asesoria%20urgente%20sobre%20cumplimiento%20y%20regularizacion%20ambiental%20para%20mi%20empresa"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-5 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                            <PhoneCall className="w-4 h-4 text-emerald-400" />
                                            Consultar Caso RENCA por WhatsApp
                                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => setActivePanel('academia')}
                                            className="px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 text-gray-400 hover:text-white font-medium text-xs tracking-wider transition-all ml-auto cursor-pointer"
                                        >
                                            Ver cursos y herramientas para mi equipo →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Matriz de Riesgos Legales y Concientización (Ley 1333 & D.S. 3549) */}
                            <div className="space-y-6">
                                <div className="text-center max-w-2xl mx-auto space-y-2">
                                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display">
                                        Principales Contingencias Ambientales en Bolivia
                                    </h3>
                                    <p className="text-gray-400 text-xs sm:text-sm font-light">
                                        Aspectos sancionatorios que auditan el Viceministerio de Medio Ambiente (AACN) y las Gobernaciones Departamentales (AACD).
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Riesgo 1 */}
                                    <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-950/10 space-y-3">
                                        <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
                                            <Flame className="w-4 h-4 text-rose-500" />
                                            Operar sin Licencia Ambiental (Ley 1333)
                                        </div>
                                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                                            Las actividades en funcionamiento sin Declaratoria de Adecuación Ambiental (DAA) o Certificado de Dispensación (CD) son pasibles a <strong>clausura preventiva inmediata</strong> y multas de hasta el 3 por mil de su patrimonio financiero.
                                        </p>
                                        <div className="text-[11px] text-rose-300 font-medium pt-2 border-t border-rose-500/20">
                                            Solución SERAM: Regularización express con formulario FNCA o DAA y presentación formal.
                                        </div>
                                    </div>

                                    {/* Riesgo 2 */}
                                    <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-3">
                                        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            Omisión de Informes de Monitoreo (IMA)
                                        </div>
                                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                                            El no presentar el Informe de Monitoreo Ambiental Anual incumple los compromisos del Plan de Manejo (PPM-PASA), activando <strong>sumarios administrativos sancionatorios</strong> con cargos contra los representantes legales.
                                        </p>
                                        <div className="text-[11px] text-amber-300 font-medium pt-2 border-t border-amber-500/20">
                                            Solución SERAM: Ejecución de campañas de campo, análisis de laboratorio e informe con firma RENCA.
                                        </div>
                                    </div>

                                    {/* Riesgo 3 */}
                                    <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-950/10 space-y-3">
                                        <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                                            <Compass className="w-4 h-4 text-blue-500" />
                                            Superposición Territorial y Áreas Protegidas
                                        </div>
                                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                                            La falta de coordenadas georreferenciadas oficiales (WGS-84) expone a las obras a <strong>paralización por el SERNAP o la ABT</strong> si se detecta invasión involuntaria a reservas fiscales o manchas urbanas municipales.
                                        </p>
                                        <div className="text-[11px] text-blue-300 font-medium pt-2 border-t border-blue-500/20">
                                            Solución SERAM: Cartografía satelital satelital certificada y carimbos técnicos con código catastral.
                                        </div>
                                    </div>

                                    {/* Riesgo 4 */}
                                    <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                                            <Building2 className="w-4 h-4 text-emerald-500" />
                                            Gestión de Residuos Sólidos y Peligrosos (Ley 755)
                                        </div>
                                        <p className="text-xs text-gray-300 font-light leading-relaxed">
                                            La descarga de efluentes no tratados o almacenamiento inadecuado de sustancias peligrosas genera <strong>responsabilidad civil y penal ambiental</strong> por daño acumulativo a cuerpos hídricos.
                                        </p>
                                        <div className="text-[11px] text-emerald-300 font-medium pt-2 border-t border-emerald-500/20">
                                            Solución SERAM: Plan de Manejo Integral de Residuos, Manifiestos y diseño de trampas de grasa/PTAR.
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </motion.section>
                    ) : (
                        /* ========================================================================= */
                        /* VISTA B: CATÁLOGO DE ACADEMIA Y RECURSOS TÉCNICOS POR PUNTOS DE DOLOR     */
                        /* ========================================================================= */
                        <motion.section
                            key="view-academia"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35 }}
                            className="w-full flex flex-col items-center pointer-events-auto"
                        >
                            {/* Pestañas de Categoría por Necesidad y Puntos de Dolor */}
                            <nav className="flex flex-wrap items-center justify-center gap-2.5 mb-10 max-w-5xl w-full">
                                {TABS.map((tab) => {
                                    const isActive = activeCategory === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveCategory(tab.id)}
                                            className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl border transition-all duration-300 flex-1 min-w-[150px] text-center cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#00e03c]/15 border-[#00e03c] text-white shadow-[0_0_15px_rgba(0,224,60,0.15)] ring-1 ring-[#00e03c]/30'
                                                    : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'
                                            }`}
                                        >
                                            <span className="text-xs font-extrabold uppercase tracking-wider">{tab.label}</span>
                                            <span className="text-[9px] font-light opacity-80 mt-1 line-clamp-1">{tab.desc}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Resumen del Filtro Activo */}
                            <div className="text-center max-w-2xl mb-8">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-[#00e03c] bg-[#00e03c]/10 border border-[#00e03c]/20 px-3 py-1 rounded-full">
                                    {TABS.find(t => t.id === activeCategory)?.badge || 'Catálogo Oficial'}
                                </span>
                                <p className="text-gray-400 text-xs sm:text-sm font-light mt-2">
                                    {TABS.find(t => t.id === activeCategory)?.desc}
                                </p>
                            </div>

                            {/* Grid de Cursos e Info-productos con Crossfade Simultáneo */}
                            <div className="w-full max-w-7xl px-4 grid grid-cols-1 items-start relative min-h-[350px]">
                                <AnimatePresence initial={false} mode="sync">
                                    <motion.div
                                        key={activeCategory}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1.0] }}
                                        className="col-start-1 row-start-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                    >
                                        {filteredCourses.length === 0 ? (
                                            <div className="col-span-full academy-glass-card p-12 text-center text-gray-500 text-sm border border-white/5">
                                                No hay recursos registrados en esta categoría actualmente.
                                            </div>
                                        ) : (
                                            filteredCourses.map((course) => {
                                                const isPdf = course.format === 'pdf' || course.hasVideo === false;
                                                return (
                                                    <article
                                                        key={course.id}
                                                        className={`academy-glass-card overflow-hidden flex flex-col justify-between h-full transition-all ${
                                                            isPdf ? 'hover:border-amber-400/40' : 'hover:border-[#00e03c]/40'
                                                        }`}
                                                    >
                                                        {/* Portada */}
                                                        <div className="relative aspect-video bg-[#050505] overflow-hidden border-b border-white/5">
                                                            <img
                                                                src={course.image}
                                                                alt={course.title}
                                                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                                            />
                                                            
                                                            {/* Etiquetas de Modalidad y Precio */}
                                                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                                                {isPdf ? (
                                                                    <span className="text-[9px] tracking-wider font-extrabold uppercase bg-amber-400/90 text-slate-950 px-2.5 py-0.5 rounded shadow">
                                                                        📄 PDF Entregable
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] tracking-wider font-extrabold uppercase bg-[#00e03c]/90 text-slate-950 px-2.5 py-0.5 rounded shadow">
                                                                        🎥 Video HD
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] tracking-wider font-extrabold uppercase bg-black/85 border border-white/10 px-2.5 py-0.5 rounded text-white">
                                                                    {course.price === 0 ? 'Gratuito' : `Bs. ${course.price}`}
                                                                </span>
                                                            </div>

                                                            {/* Ícono de Tipo */}
                                                            <div className="absolute bottom-3 left-3 p-2 bg-black/85 border border-white/10 rounded-lg">
                                                                {getIconForCategory(course.type, course.format)}
                                                            </div>
                                                        </div>

                                                        {/* Detalles del Recurso */}
                                                        <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                                                    <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                                                                        <User className="w-3.5 h-3.5 text-[#00e03c]/70 shrink-0" /> {course.instructor}
                                                                    </span>
                                                                    <span className="flex items-center gap-1 shrink-0">
                                                                        <Clock className="w-3.5 h-3.5 text-[#00e03c]/70" /> {course.duration}
                                                                    </span>
                                                                </div>

                                                                <h3 className="text-lg font-bold text-white tracking-tight leading-snug line-clamp-2">
                                                                    {renderFormattedText(course.title)}
                                                                </h3>
                                                                
                                                                <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-3">
                                                                    {renderFormattedText(course.desc)}
                                                                </p>
                                                            </div>

                                                            {/* Acción de Entrada / Descarga */}
                                                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                                                <span className="text-[10px] tracking-wider font-mono text-gray-500 uppercase">
                                                                    {isPdf ? `${course.pages || 95} págs. · Entregable` : 'Online HD · Asincrónico'}
                                                                </span>
                                                                
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => navigate(`/academy/course/${course.id}`)}
                                                                    className={`flex items-center gap-1.5 px-4 py-2 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-md ${
                                                                        isPdf
                                                                            ? 'bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300'
                                                                            : 'bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/40 text-[#00e03c]'
                                                                    }`}
                                                                >
                                                                    {isPdf ? (
                                                                        <>Ver Entregable <Download className="w-3 h-3 text-amber-300" /></>
                                                                    ) : (
                                                                        <>Entrar al Aula <ArrowRight className="w-3 h-3 text-[#00e03c]" /></>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}

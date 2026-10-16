import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { 
    BookOpen, Download, Compass, Award, User, Clock, ArrowRight, 
    ShieldAlert, AlertTriangle, CheckCircle2, FileText, PhoneCall, 
    ExternalLink, Scale, Building2, Flame, Search, Filter,
    GraduationCap, Briefcase, ShieldCheck, Sparkles, ChevronRight,
    X, Layers, RotateCcw
} from 'lucide-react';
import '../../styles/academy-cinematic.css';

// Catálogo base de respaldo clasificado con 5 ejes temáticos y 3 niveles técnicos
const FALLBACK_COURSES = [
    {
        id: 1,
        title: 'Ebook: Guía Práctica de la Ley 1333 de *Medio Ambiente*',
        instructor: 'SERAM Legal & Normativa',
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
        tags: ['formatos', 'tramites', 'normativa'],
        level: 'Básico / Fundamentos',
        track: 'Derecho & Normativa'
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
        tags: ['gis_mapas', 'geomatica'],
        level: 'Básico / Fundamentos',
        track: 'Geomática & SIG'
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
        tags: ['tramites', 'regularizacion'],
        level: 'Intermedio / Aplicado',
        track: 'Trámites & Licencias'
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
        tags: ['regularizacion', 'tramites', 'normativa'],
        level: 'Avanzado / Especialista',
        track: 'Derecho & Normativa'
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
        tags: ['formatos', 'gis_mapas'],
        level: 'Intermedio / Aplicado',
        track: 'Formatos & Carimbos'
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
        tags: ['tramites', 'regularizacion'],
        level: 'Intermedio / Aplicado',
        track: 'Trámites & Licencias'
    },
    {
        id: 7,
        title: 'Gestión Integral de *Residuos Sólidos y Peligrosos (Ley 755)*',
        instructor: 'Ing. Fernando Araujo',
        students: 92,
        status: 'Activo',
        isPremium: true,
        type: 'mid_ticket',
        format: 'video',
        hasVideo: true,
        price: 95,
        image: '/assets/3d-backend/panel2-service-background.webp',
        duration: '14 horas',
        desc: 'Procedimientos técnicos y normativos para clasificación, manifiestos de transporte, acopio y tratamiento de RESPEL bajo la Ley 755.',
        category: 'tramites',
        tags: ['tramites', 'residuos'],
        level: 'Intermedio / Aplicado',
        track: 'Gestión de Residuos'
    },
    {
        id: 8,
        title: 'Modelación Hidrológica de Cuencas y *Análisis Multitemporal SIG*',
        instructor: 'Ing. Diego Barrientos',
        students: 48,
        status: 'Activo',
        isPremium: true,
        type: 'high_ticket',
        format: 'video',
        hasVideo: true,
        price: 180,
        image: '/assets/3d-backend/gis_satellite_mapping.webp',
        duration: '26 horas',
        desc: 'Modelado avanzado de escorrentía, balance hídrico, índices NDVI e integración de cartografía oficial WGS-84 para estudios EEIA.',
        category: 'gis_mapas',
        tags: ['gis_mapas'],
        level: 'Avanzado / Especialista',
        track: 'Geomática & SIG'
    }
];

// Opciones de Clasificación
const TRACKS = [
    { id: 'todos', label: 'Todos los Ejes' },
    { id: 'Derecho & Normativa', label: 'Derecho & Normativa' },
    { id: 'Geomática & SIG', label: 'Geomática & SIG' },
    { id: 'Trámites & Licencias', label: 'Trámites & Licencias' },
    { id: 'Gestión de Residuos', label: 'Gestión de Residuos' },
    { id: 'Formatos & Carimbos', label: 'Formatos & Carimbos' }
];

const LEVELS = [
    { id: 'todos', label: 'Todos los Niveles' },
    { id: 'Básico / Fundamentos', label: 'Básico / Fundamentos' },
    { id: 'Intermedio / Aplicado', label: 'Intermedio / Aplicado' },
    { id: 'Avanzado / Especialista', label: 'Avanzado / Especialista' }
];

const FORMATS = [
    { id: 'todos', label: 'Todos los Formatos' },
    { id: 'video', label: 'Video HD' },
    { id: 'pdf', label: 'Dossier / PDF' }
];

// Funciones auxiliares declaradas antes de los hooks y componentes (Anti-TDZ)
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

const getIconForCategory = (type, format) => {
    if (format === 'pdf' || type === 'gratis') return <Download className="w-4 h-4 text-amber-400" />;
    switch (type) {
        case 'low_ticket': return <BookOpen className="w-4 h-4 text-[#00e03c]" />;
        case 'mid_ticket': return <Compass className="w-4 h-4 text-[#00e03c]" />;
        case 'high_ticket': return <Award className="w-4 h-4 text-[#00e03c]" />;
        default: return <BookOpen className="w-4 h-4 text-[#00e03c]" />;
    }
};

const getLevelBadge = (level) => {
    switch (level) {
        case 'Básico / Fundamentos':
            return {
                label: 'Básico / Fundamentos',
                classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            };
        case 'Intermedio / Aplicado':
            return {
                label: 'Intermedio / Aplicado',
                classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
            };
        case 'Avanzado / Especialista':
            return {
                label: 'Avanzado / Especialista',
                classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
            };
        default:
            return {
                label: level || 'General',
                classes: 'bg-gray-500/15 text-gray-300 border-gray-500/30'
            };
    }
};

const getTrackBadge = (track) => {
    switch (track) {
        case 'Derecho & Normativa':
            return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
        case 'Geomática & SIG':
            return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
        case 'Trámites & Licencias':
            return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
        case 'Gestión de Residuos':
            return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
        case 'Formatos & Carimbos':
            return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
        default:
            return 'bg-white/10 text-gray-300 border-white/20';
    }
};

const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

export default function AcademyPage() {
    const navigate = useNavigate();
    const { courses } = useApp();

    // Filtros de clasificación del catálogo
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrack, setSelectedTrack] = useState('todos');
    const [selectedLevel, setSelectedLevel] = useState('todos');
    const [selectedFormat, setSelectedFormat] = useState('todos');

    // Estado del autodiagnóstico empresarial de 3 preguntas
    const [auditAnswers, setAuditAnswers] = useState({
        licencia: null,   // 'sin_licencia' | 'en_tramite' | 'vigente'
        monitoreo: null,  // 'nunca' | 'atrasado' | 'al_dia'
        cartografia: null // 'sin_plano' | 'desactualizado' | 'georreferenciado'
    });

    // Fusión de catálogo dinámico con catálogo base clasificado
    const allAvailableCourses = useMemo(() => {
        const mergedMap = new Map();
        FALLBACK_COURSES.forEach(fc => mergedMap.set(fc.id, fc));
        
        if (Array.isArray(courses) && courses.length > 0) {
            courses.forEach(c => {
                const existing = mergedMap.get(c.id);
                // Deducir atributos de clasificación en caso de que falten en el catálogo remoto
                const level = c.level || (c.type === 'high_ticket' ? 'Avanzado / Especialista' : c.type === 'low_ticket' || c.type === 'gratis' ? 'Básico / Fundamentos' : 'Intermedio / Aplicado');
                const track = c.track || (c.category === 'gis_mapas' ? 'Geomática & SIG' : c.category === 'formatos' ? 'Formatos & Carimbos' : 'Trámites & Licencias');
                const format = c.format || (c.hasVideo === false ? 'pdf' : 'video');
                mergedMap.set(c.id, { ...(existing || {}), ...c, level, track, format });
            });
        }
        return Array.from(mergedMap.values());
    }, [courses]);

    // Filtrado en tiempo real por búsqueda, eje temático, nivel técnico y formato
    const filteredCourses = useMemo(() => {
        return allAvailableCourses.filter(course => {
            // Filtro por Eje Temático
            if (selectedTrack !== 'todos') {
                const courseTrack = course.track || '';
                if (courseTrack !== selectedTrack) {
                    const matchesCategory = course.category === selectedTrack;
                    const matchesTags = Array.isArray(course.tags) && course.tags.includes(selectedTrack);
                    if (!matchesCategory && !matchesTags) return false;
                }
            }

            // Filtro por Nivel Técnico
            if (selectedLevel !== 'todos') {
                const courseLevel = course.level || 'Intermedio / Aplicado';
                if (courseLevel !== selectedLevel) return false;
            }

            // Filtro por Formato (video / pdf)
            if (selectedFormat !== 'todos') {
                const courseFormat = course.format || (course.hasVideo ? 'video' : 'pdf');
                if (courseFormat !== selectedFormat) return false;
            }

            // Filtro por buscador de texto en tiempo real
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase().trim();
                const corpus = `${course.title || ''} ${course.desc || ''} ${course.instructor || ''} ${course.track || ''} ${course.level || ''}`.toLowerCase();
                if (!corpus.includes(q)) return false;
            }

            return true;
        });
    }, [allAvailableCourses, selectedTrack, selectedLevel, selectedFormat, searchQuery]);

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
                recommendation: 'Requiere regularización prioritaria con auditoría de pasivos ambientales e ingreso formal de formulario FNCA/DAA.',
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
                message: 'Tu empresa cuenta con documentación de base. Sugerimos auditorías preventivas periódicas para garantizar la trazabilidad de los compromisos ante inspecciones rutinarias.',
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
            recommendation: 'Evaluación confidencial y validada por consultores RENCA.',
            answered: totalAnswered
        };
    }, [auditAnswers]);

    const hasActiveFilters = searchQuery.trim() !== '' || selectedTrack !== 'todos' || selectedLevel !== 'todos' || selectedFormat !== 'todos';

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedTrack('todos');
        setSelectedLevel('todos');
        setSelectedFormat('todos');
    };

    return (
        <div className="inner-page min-h-screen relative w-full overflow-hidden bg-[#020202]">
            
            {/* 1. Fondo de Escena de Capacitación Ambiental con Velo Cinematográfico Neuform */}
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <img
                    src="/assets/3d-backend/bg_academy.webp"
                    alt="Capacitación y Educación Ambiental SERAM"
                    className="w-full h-full object-cover opacity-25"
                    onError={(e) => {
                        // Resiliencia por si el formato webp no se visualiza
                        if (!e.currentTarget.dataset.fallbackApplied) {
                            e.currentTarget.dataset.fallbackApplied = 'true';
                            e.currentTarget.src = '/assets/3d-backend/bg_home.webp';
                        }
                    }}
                />
                {/* Velo oscuro translúcido con gradiente Neuform para garantizar contraste WCAG AAA */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020202]/95 via-[#020202]/85 to-[#020202]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/25 via-transparent to-black/90" />
                <div className="absolute inset-0 neuform-grid-bg opacity-15" />
            </div>

            {/* Contenido Principal Organizado en 5 Segmentos Visuales Diferenciados */}
            <main className="academy-viewport min-h-screen flex flex-col items-center justify-start pt-12 pb-28 px-4 md:px-8 relative z-10 w-full max-w-7xl mx-auto space-y-24">
                
                {/* ========================================================================= */}
                {/* SEGMENTO 1: PANEL HERO & MISIÓN DE CONCIENTIZACIÓN AMBIENTAL              */}
                {/* ========================================================================= */}
                <motion.section 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full flex flex-col items-center text-center max-w-5xl pointer-events-auto"
                >

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase font-display max-w-4xl">
                        ¿Tu Empresa Cumple con la <span className="text-gradient-premium">Normativa Ambiental</span> en Bolivia?
                    </h1>
                    
                    <p className="text-amber-400 font-extrabold text-base md:text-xl tracking-wide uppercase mt-4">
                        Identifica Riesgos, Previene Sanciones y Capacita a tu Equipo Técnico
                    </p>
                    
                    <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed max-w-3xl mt-4">
                        Diagnostica pasivos ambientales, licencias pendientes (DAA, CD, EEIA) y contingencias ante la Autoridad Ambiental Competente (AACN / AACD) antes de una inspección sorpresa, o accede a herramientas y formación técnica especializada impartida por consultores con registro ministerial.
                    </p>

                    {/* 4 Tarjetas de Métricas de la Academia */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-10">
                        <div className="neuform-card p-5 border border-white/10 bg-black/50 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl md:text-3xl font-black text-[#00e03c] font-display">+1,200</span>
                                <Clock className="w-5 h-5 text-[#00e03c]/70" />
                            </div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Horas Técnicas</h2>
                            <p className="text-[11px] text-gray-400 font-light mt-1">Formación en SIG, trámites y adecuación ambiental.</p>
                        </div>

                        <div className="neuform-card p-5 border border-white/10 bg-black/50 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl md:text-3xl font-black text-amber-400 font-display">100%</span>
                                <Scale className="w-5 h-5 text-amber-400/70" />
                            </div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Ley 1333 & D.S. 3549</h2>
                            <p className="text-[11px] text-gray-400 font-light mt-1">Alineación rigurosa a normativas bolivianas vigentes.</p>
                        </div>

                        <div className="neuform-card p-5 border border-white/10 bg-black/50 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl md:text-3xl font-black text-cyan-400 font-display">RENCA</span>
                                <Award className="w-5 h-5 text-cyan-400/70" />
                            </div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Docentes Colegiados</h2>
                            <p className="text-[11px] text-gray-400 font-light mt-1">Consultores con registro activo ante el MMAyA.</p>
                        </div>

                        <div className="neuform-card p-5 border border-white/10 bg-black/50 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl md:text-3xl font-black text-purple-400 font-display">+450</span>
                                <ShieldCheck className="w-5 h-5 text-purple-400/70" />
                            </div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Certificados Oficiales</h2>
                            <p className="text-[11px] text-gray-400 font-light mt-1">Profesionales y empresas formadas a nivel nacional.</p>
                        </div>
                    </div>

                    {/* Barra de Accesos Directos a los 4 Paneles Siguientes */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 w-full max-w-4xl">
                        <button
                            type="button"
                            onClick={() => scrollToSection('soluciones-corporativas')}
                            className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            1. Diagnóstico B2B & Sanciones
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('campus-academico')}
                            className="px-4 py-2 rounded-xl bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/30 text-[#00e03c] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                            <BookOpen className="w-3.5 h-3.5 text-[#00e03c]" />
                            2. Campus & Catálogo de Cursos
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('certificaciones-seram')}
                            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            3. Sellos & Aval Técnico
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('in-company')}
                            className="px-4 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                            4. Formación In-Company
                        </button>
                    </div>
                </motion.section>

                {/* ========================================================================= */}
                {/* SEGMENTO 2: PANEL DE SOLUCIONES CORPORATIVAS & PREVENCIÓN DE SANCIONES (B2B) */}
                {/* ========================================================================= */}
                <section 
                    id="soluciones-corporativas" 
                    className="w-full max-w-5xl flex flex-col gap-10 pointer-events-auto scroll-mt-24"
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <span className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            Panel B2B · Soluciones Corporativas & Prevención de Sanciones
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-display">
                            Diagnóstico Express y Regularización ante la AACN / AACD
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
                            Calcula tu nivel de exposición legal y actúa antes de que una fiscalización derive en multas pecuniarias o paralización de operaciones.
                        </p>
                    </div>

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
                                    onClick={() => scrollToSection('campus-academico')}
                                    className="px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 text-gray-400 hover:text-white font-medium text-xs tracking-wider transition-all ml-auto cursor-pointer"
                                >
                                    Ver cursos y herramientas para mi equipo ↓
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Matriz de las 4 Contingencias Ambientales Críticas en Bolivia */}
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
                            <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-950/15 space-y-3">
                                <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
                                    <Flame className="w-4 h-4 text-rose-500" />
                                    1. Operar sin Licencia Ambiental (Ley 1333)
                                </div>
                                <p className="text-xs text-gray-300 font-light leading-relaxed">
                                    Las actividades en funcionamiento sin Declaratoria de Adecuación Ambiental (DAA) o Certificado de Dispensación (CD) son pasibles a <strong>clausura preventiva inmediata</strong> y multas de hasta el 3 por mil de su patrimonio financiero.
                                </p>
                                <div className="text-[11px] text-rose-300 font-medium pt-2 border-t border-rose-500/20">
                                    Solución SERAM: Regularización express con formulario FNCA o DAA y presentación formal.
                                </div>
                            </div>

                            {/* Riesgo 2 */}
                            <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-950/15 space-y-3">
                                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    2. Omisión de Informes de Monitoreo (IMA)
                                </div>
                                <p className="text-xs text-gray-300 font-light leading-relaxed">
                                    El no presentar el Informe de Monitoreo Ambiental Anual incumple los compromisos del Plan de Manejo (PPM-PASA), activando <strong>sumarios administrativos sancionatorios</strong> con cargos contra los representantes legales.
                                </p>
                                <div className="text-[11px] text-amber-300 font-medium pt-2 border-t border-amber-500/20">
                                    Solución SERAM: Ejecución de campañas de campo, análisis de laboratorio e informe con firma RENCA.
                                </div>
                            </div>

                            {/* Riesgo 3 */}
                            <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-950/15 space-y-3">
                                <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
                                    <Compass className="w-4 h-4 text-blue-500" />
                                    3. Superposición Territorial y Áreas Protegidas
                                </div>
                                <p className="text-xs text-gray-300 font-light leading-relaxed">
                                    La falta de coordenadas georreferenciadas oficiales (WGS-84) expone a las obras a <strong>paralización por el SERNAP o la ABT</strong> si se detecta invasión involuntaria a reservas fiscales o manchas urbanas municipales.
                                </p>
                                <div className="text-[11px] text-blue-300 font-medium pt-2 border-t border-blue-500/20">
                                    Solución SERAM: Cartografía satelital certificada y carimbos técnicos con código catastral.
                                </div>
                            </div>

                            {/* Riesgo 4 */}
                            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/15 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                                    <Building2 className="w-4 h-4 text-emerald-500" />
                                    4. Gestión de Residuos Sólidos y Peligrosos (Ley 755)
                                </div>
                                <p className="text-xs text-gray-300 font-light leading-relaxed">
                                    La descarga de efluentes no tratados o almacenamiento inadecuado de sustancias peligrosas genera <strong>responsabilidad civil y penal ambiental</strong> por daño acumulativo a cuerpos hídricos o suelos.
                                </p>
                                <div className="text-[11px] text-emerald-300 font-medium pt-2 border-t border-emerald-500/20">
                                    Solución SERAM: Plan de Manejo Integral de Residuos, Manifiestos y diseño de trampas de grasa/PTAR.
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* SEGMENTO 3: PANEL DEL CAMPUS ACADÉMICO & CATÁLOGO CLASIFICADO             */}
                {/* ========================================================================= */}
                <section 
                    id="campus-academico" 
                    className="w-full flex flex-col items-center pointer-events-auto scroll-mt-24"
                >
                    <div className="flex flex-col items-center text-center space-y-3 mb-10">
                        <span className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30">
                            <BookOpen className="w-4 h-4 text-[#00e03c]" />
                            Panel 3 · Campus Académico & Catálogo Clasificado
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-display">
                            Catálogo de Cursos Técnicos, Dossiers y Entregables
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
                            Formación técnica aplicada y herramientas normativas para profesionales, consultores e ingenieros de planta.
                        </p>
                    </div>

                    {/* Barra de Clasificación y Búsqueda Interactiva */}
                    <div className="w-full max-w-5xl neuform-card p-6 border border-white/10 bg-black/50 mb-10 space-y-5">
                        
                        {/* Fila 1: Buscador de Cursos en Tiempo Real */}
                        <div className="relative w-full">
                            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar curso, guía o entregable por título, tema o docente..."
                                className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-[#00e03c] text-white text-xs sm:text-sm placeholder-gray-500 outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Fila 2: Filtros por Eje Temático */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-[#00e03c]" />
                                Filtrar por Eje Temático:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {TRACKS.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setSelectedTrack(t.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            selectedTrack === t.id
                                                ? 'bg-[#00e03c] text-slate-950 font-black shadow-[0_0_12px_rgba(0,224,60,0.3)]'
                                                : 'bg-white/[0.03] border border-white/5 text-gray-300 hover:border-white/20 hover:text-white'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fila 3: Filtros por Nivel Técnico y Formato */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            
                            {/* Selector de Nivel Técnico */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                                    Nivel Técnico:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {LEVELS.map(lvl => (
                                        <button
                                            key={lvl.id}
                                            type="button"
                                            onClick={() => setSelectedLevel(lvl.id)}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                                selectedLevel === lvl.id
                                                    ? 'bg-cyan-500 text-slate-950 font-bold'
                                                    : 'bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {lvl.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selector de Formato */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <Filter className="w-3.5 h-3.5 text-amber-400" />
                                    Formato de Entrega:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {FORMATS.map(f => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setSelectedFormat(f.id)}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                                selectedFormat === f.id
                                                    ? 'bg-amber-400 text-slate-950 font-bold'
                                                    : 'bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Barra de Estado y Limpieza de Filtros */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400">
                            <span>
                                Mostrando <strong className="text-white font-mono">{filteredCourses.length}</strong> de <strong className="text-white font-mono">{allAvailableCourses.length}</strong> recursos formativos
                            </span>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Restablecer Filtros
                                </button>
                            )}
                        </div>

                    </div>

                    {/* Grid del Catálogo Clasificado de Cursos */}
                    <div className="w-full max-w-7xl px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.length === 0 ? (
                            <div className="col-span-full academy-glass-card p-12 text-center text-gray-400 border border-white/5 space-y-3">
                                <p className="text-base font-semibold text-white">No se encontraron cursos con los filtros seleccionados.</p>
                                <p className="text-xs text-gray-400 font-light">Prueba ajustando los términos de búsqueda o restableciendo los selectores de eje temático y nivel.</p>
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="mt-3 px-4 py-2 rounded-xl bg-[#00e03c]/20 border border-[#00e03c]/40 text-[#00e03c] text-xs font-bold uppercase tracking-wider hover:bg-[#00e03c]/30 transition-all cursor-pointer"
                                >
                                    Ver todos los cursos
                                </button>
                            </div>
                        ) : (
                            filteredCourses.map((course) => {
                                const isPdf = course.format === 'pdf' || course.hasVideo === false;
                                const levelBadge = getLevelBadge(course.level);
                                const trackBadgeStyle = getTrackBadge(course.track);

                                return (
                                    <article
                                        key={course.id}
                                        className={`academy-glass-card overflow-hidden flex flex-col justify-between h-full transition-all group ${
                                            isPdf ? 'hover:border-amber-400/40' : 'hover:border-[#00e03c]/40'
                                        }`}
                                    >
                                        {/* Portada del Recurso */}
                                        <div className="relative aspect-video bg-[#050505] overflow-hidden border-b border-white/5">
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                onError={(e) => {
                                                    if (!e.currentTarget.dataset.fallbackApplied) {
                                                        e.currentTarget.dataset.fallbackApplied = 'true';
                                                        e.currentTarget.src = '/assets/3d-backend/panel2-service-background.webp';
                                                    }
                                                }}
                                            />
                                            
                                            {/* Etiquetas Superiores de Formato y Precio */}
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
                                                <span className="text-[10px] tracking-wider font-extrabold uppercase bg-black/85 border border-white/10 px-2.5 py-0.5 rounded text-white font-mono">
                                                    {course.price === 0 ? 'Gratuito' : `Bs. ${course.price}`}
                                                </span>
                                            </div>

                                            {/* Ícono de Tipo */}
                                            <div className="absolute bottom-3 left-3 p-2 bg-black/85 border border-white/10 rounded-lg">
                                                {getIconForCategory(course.type, course.format)}
                                            </div>
                                        </div>

                                        {/* Detalles y Clasificación del Recurso */}
                                        <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                                            <div className="space-y-3">
                                                
                                                {/* Badges de Clasificación: Eje Temático & Nivel Técnico */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {course.track && (
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${trackBadgeStyle}`}>
                                                            {course.track}
                                                        </span>
                                                    )}
                                                    {course.level && (
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${levelBadge.classes}`}>
                                                            {levelBadge.label}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                                                    <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                                                        <User className="w-3.5 h-3.5 text-[#00e03c]/70 shrink-0" /> {course.instructor}
                                                    </span>
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <Clock className="w-3.5 h-3.5 text-[#00e03c]/70" /> {course.duration}
                                                    </span>
                                                </div>

                                                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug line-clamp-2">
                                                    {renderFormattedText(course.title)}
                                                </h3>
                                                
                                                <p className="text-xs text-gray-300 font-light leading-relaxed line-clamp-3">
                                                    {renderFormattedText(course.desc)}
                                                </p>
                                            </div>

                                            {/* Acción de Entrada / Descarga */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                                <span className="text-[10px] tracking-wider font-mono text-gray-400 uppercase">
                                                    {isPdf ? `${course.pages || 45} págs. · Entregable` : 'Online HD · Asincrónico'}
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
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* SEGMENTO 4: PANEL DE SELLOS DE CERTIFICACIÓN Y VALIDEZ TÉCNICA SERAM      */}
                {/* ========================================================================= */}
                <section 
                    id="certificaciones-seram" 
                    className="w-full max-w-5xl flex flex-col gap-10 pointer-events-auto scroll-mt-24"
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <span className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            Panel 4 · Sellos de Certificación & Respaldo Regulatorio
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-display">
                            Validez Legal y Acreditación Técnica SERAM
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
                            Cada recurso, expediente y programa emitido por SERAM SRL cuenta con rigurosidad técnica auditable ante autoridades gubernamentales.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="neuform-card p-6 border border-white/10 bg-black/50 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    <Award className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Aval Regulatorio ante AACN & AACD</h3>
                                    <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">Homologación Nacional</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-300 font-light leading-relaxed">
                                Formatos y matrices estructuradas estrictamente bajo los requerimientos metodológicos del Viceministerio de Medio Ambiente, Biodiversidad, Cambios Climáticos y de Gestión y Desarrollo Forestal (AACN) y las Secretarías Departamentales (AACD).
                            </p>
                        </div>

                        <div className="neuform-card p-6 border border-white/10 bg-black/50 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Docentes con Registro RENCA Activo</h3>
                                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Ministerio de Medio Ambiente y Agua</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-300 font-light leading-relaxed">
                                Todos los talleres y cursos son dictados por consultores colegiados inscritos formalmente en el Registro Nacional de Consultoría Ambiental del MMAyA, con amplia trayectoria en expedientes de licenciamiento y peritajes de campo.
                            </p>
                        </div>

                        <div className="neuform-card p-6 border border-white/10 bg-black/50 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    <Compass className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Cartografía y Carimbos en WGS-84</h3>
                                    <span className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">Estándares Geodésicos Oficiales</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-300 font-light leading-relaxed">
                                Planimetrías y plantillas cartográficas diseñadas con proyección UTM y el elipsoide WGS-84 exigido por el Viceministerio, garantizando cero objeciones catastrales o superposiciones ante el SERNAP y el INRA.
                            </p>
                        </div>

                        <div className="neuform-card p-6 border border-white/10 bg-black/50 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Certificados con Código Único de Validación</h3>
                                    <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider">Acreditación Curricular & Licitaciones</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-300 font-light leading-relaxed">
                                Al culminar con éxito cada programa formativo, el profesional recibe un certificado digital con serial único y código QR de autenticidad para respaldo en procesos de licitación pública, contrataciones estatales y peritajes.
                            </p>
                        </div>

                    </div>
                </section>

                {/* ========================================================================= */}
                {/* SEGMENTO 5: PANEL DE CAPACITACIÓN IN-COMPANY PARA EMPRESAS                */}
                {/* ========================================================================= */}
                <section 
                    id="in-company" 
                    className="w-full max-w-5xl flex flex-col gap-10 pointer-events-auto scroll-mt-24"
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <span className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            Panel 5 · Capacitación In-Company para Empresas
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-display">
                            Formación a Medida para Equipos de Ingeniería y Plantas Industriales
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
                            Diseñamos programas cerrados enfocados en los procesos productivos, pasivos reales y requisitos regulatorios de tu sector industrial.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <div className="neuform-card p-6 border border-white/10 bg-black/50 space-y-3 flex flex-col justify-between">
                            <div>
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm mb-3">
                                    01
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Diagnóstico de Brechas en Planta</h3>
                                <p className="text-xs text-gray-300 font-light leading-relaxed">
                                    Evaluamos los procedimientos actuales de tu planta (manejo de efluentes, emisiones, RESPEL, licencias) para crear un temario 100% aplicable.
                                </p>
                            </div>
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider pt-3 border-t border-white/5">
                                Relevamiento técnico previo
                            </span>
                        </div>

                        <div className="neuform-card p-6 border border-white/10 bg-black/50 space-y-3 flex flex-col justify-between">
                            <div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                                    02
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Modalidad Flexible (Planta u Online)</h3>
                                <p className="text-xs text-gray-300 font-light leading-relaxed">
                                    Talleres presenciales in-situ en tus instalaciones industriales o sesiones virtuales en vivo con análisis de casos y simulaciones de inspección.
                                </p>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider pt-3 border-t border-white/5">
                                Horarios adaptados al turno
                            </span>
                        </div>

                        <div className="neuform-card p-6 border border-white/10 bg-black/50 space-y-3 flex flex-col justify-between">
                            <div>
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-3">
                                    03
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Dossier de Cumplimiento Institucional</h3>
                                <p className="text-xs text-gray-300 font-light leading-relaxed">
                                    Entregamos actas de capacitación, evaluaciones de competencia y certificados colectivos requeridos en auditorías laborales y ambientales.
                                </p>
                            </div>
                            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider pt-3 border-t border-white/5">
                                Respaldo para auditorías
                            </span>
                        </div>

                    </div>

                    {/* Tarjeta de Solicitud de Propuesta In-Company */}
                    <div className="neuform-card p-8 border border-blue-500/30 bg-blue-950/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-lg sm:text-xl font-bold text-white">
                                ¿Necesitas capacitar a tu equipo técnico o brigada ambiental?
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-300 font-light">
                                Solicita una propuesta personalizada para tu empresa con temarios específicos para minería, hidrocarburos, agroindustria o construcción.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => navigate('/cotizar')}
                                className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                                Solicitar Cotización In-Company
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <a
                                href="https://wa.me/59176200109?text=Hola%20SERAM,%20deseo%20cotizar%20un%20programa%20de%20capacitacion%20In-Company%20para%20el%20equipo%20tecnico%20de%20mi%20empresa"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <PhoneCall className="w-4 h-4 text-emerald-400" />
                                Coordinar con Asesor RENCA
                            </a>
                        </div>
                    </div>

                </section>

            </main>
        </div>
    );
}

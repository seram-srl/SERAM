import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { 
    BookOpen, Download, Compass, Award, User, Clock, ArrowRight, 
    Search, Filter, GraduationCap, ShieldCheck, Sparkles,
    X, Layers, RotateCcw, Building2, PhoneCall
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
        price: 240,
        image: '/assets/3d-backend/gis_satellite_mapping.webp',
        duration: '26 horas',
        desc: 'Modelado avanzado de escorrentía, balance hídrico, índices NDVI e integración de cartografía oficial WGS-84 para estudios EEIA.',
        category: 'gis_mapas',
        tags: ['gis_mapas'],
        level: 'Avanzado / Especialista',
        track: 'Geomática & SIG'
    }
];

// Opciones de Pestañas de Ticket / Inversión
const TICKET_TABS = [
    {
        id: 'todos',
        label: 'Todos los Recursos',
        badge: 'Catálogo',
        priceRange: 'Todos los niveles',
        desc: 'Catálogo integral: cursos en video, e-books y entregables técnicos',
        icon: Layers,
        activeClass: 'border-[#00e03c] bg-[#00e03c]/15 text-white shadow-[0_0_20px_rgba(0,224,60,0.25)]',
        badgeClass: 'bg-[#00e03c]/20 text-[#00e03c] border-[#00e03c]/40'
    },
    {
        id: 'gratis',
        label: 'Gratis (Lead Magnets)',
        badge: 'Bs. 0',
        priceRange: '100% Gratuito',
        desc: 'E-books, carimbos, planos y guías descargables en PDF - Bs. 0',
        icon: Download,
        activeClass: 'border-emerald-500 bg-emerald-500/15 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
        id: 'low_ticket',
        label: 'Ticket Bajo (Base)',
        badge: 'Hasta Bs. 50',
        priceRange: 'Hasta Bs. 50',
        desc: 'Cursos fundamentales y herramientas técnicas de software GIS',
        icon: BookOpen,
        activeClass: 'border-blue-500 bg-blue-500/15 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]',
        badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    },
    {
        id: 'mid_ticket',
        label: 'Ticket Medio (Talleres)',
        badge: 'Bs. 51 a 200',
        priceRange: 'Bs. 51 a Bs. 200',
        desc: 'Talleres prácticos y metodologías de evaluación de impacto',
        icon: Compass,
        activeClass: 'border-amber-500 bg-amber-500/15 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)]',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
        id: 'high_ticket',
        label: 'Ticket Alto (Mentoría)',
        badge: '> Bs. 200',
        priceRange: 'Más de Bs. 200',
        desc: 'Mentorías directas 1-on-1 y consultoría de proyectos de élite',
        icon: Award,
        activeClass: 'border-purple-500 bg-purple-500/15 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]',
        badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    }
];

// Opciones de Clasificación Complementaria
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

const getTicketBadge = (type, price) => {
    if (type === 'gratis' || price === 0) {
        return {
            label: 'Gratis · Lead Magnet',
            classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
    }
    if (type === 'low_ticket' || (price > 0 && price <= 50)) {
        return {
            label: 'Ticket Bajo · Base',
            classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        };
    }
    if (type === 'mid_ticket' || (price > 50 && price <= 200)) {
        return {
            label: 'Ticket Medio · Taller',
            classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
    }
    if (type === 'high_ticket' || price > 200) {
        return {
            label: 'Ticket Alto · Mentoría',
            classes: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
        };
    }
    return {
        label: 'Recurso Técnico',
        classes: 'bg-gray-500/15 text-gray-300 border-gray-500/30'
    };
};

export default function AcademyPage() {
    const navigate = useNavigate();
    const { courses } = useApp();

    // Pestaña principal de categorización por inversión / ticket
    const [selectedTicket, setSelectedTicket] = useState('todos');

    // Filtros de búsqueda y clasificación complementaria
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrack, setSelectedTrack] = useState('todos');
    const [selectedLevel, setSelectedLevel] = useState('todos');
    const [selectedFormat, setSelectedFormat] = useState('todos');

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

    // Conteo dinámico de cursos por cada nivel de ticket
    const ticketCounts = useMemo(() => {
        const counts = {
            todos: allAvailableCourses.length,
            gratis: 0,
            low_ticket: 0,
            mid_ticket: 0,
            high_ticket: 0
        };
        allAvailableCourses.forEach(c => {
            if (c.type === 'gratis' || c.price === 0) counts.gratis++;
            if (c.type === 'low_ticket' || (c.price > 0 && c.price <= 50)) counts.low_ticket++;
            if (c.type === 'mid_ticket' || (c.price > 50 && c.price <= 200)) counts.mid_ticket++;
            if (c.type === 'high_ticket' || c.price > 200) counts.high_ticket++;
        });
        return counts;
    }, [allAvailableCourses]);

    // Filtrado en tiempo real por nivel de ticket, búsqueda, eje temático, nivel técnico y formato
    const filteredCourses = useMemo(() => {
        return allAvailableCourses.filter(course => {
            // 1. Filtro por Nivel de Ticket / Inversión
            if (selectedTicket !== 'todos') {
                if (selectedTicket === 'gratis') {
                    if (course.type !== 'gratis' && course.price !== 0) return false;
                } else if (selectedTicket === 'low_ticket') {
                    const isLow = course.type === 'low_ticket' || (course.price > 0 && course.price <= 50);
                    if (!isLow) return false;
                } else if (selectedTicket === 'mid_ticket') {
                    const isMid = course.type === 'mid_ticket' || (course.price > 50 && course.price <= 200);
                    if (!isMid) return false;
                } else if (selectedTicket === 'high_ticket') {
                    const isHigh = course.type === 'high_ticket' || course.price > 200;
                    if (!isHigh) return false;
                }
            }

            // 2. Filtro por Eje Temático
            if (selectedTrack !== 'todos') {
                const courseTrack = course.track || '';
                if (courseTrack !== selectedTrack) {
                    const matchesCategory = course.category === selectedTrack;
                    const matchesTags = Array.isArray(course.tags) && course.tags.includes(selectedTrack);
                    if (!matchesCategory && !matchesTags) return false;
                }
            }

            // 3. Filtro por Nivel Técnico
            if (selectedLevel !== 'todos') {
                const courseLevel = course.level || 'Intermedio / Aplicado';
                if (courseLevel !== selectedLevel) return false;
            }

            // 4. Filtro por Formato (video / pdf)
            if (selectedFormat !== 'todos') {
                const courseFormat = course.format || (course.hasVideo ? 'video' : 'pdf');
                if (courseFormat !== selectedFormat) return false;
            }

            // 5. Filtro por buscador de texto en tiempo real
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase().trim();
                const corpus = `${course.title || ''} ${course.desc || ''} ${course.instructor || ''} ${course.track || ''} ${course.level || ''}`.toLowerCase();
                if (!corpus.includes(q)) return false;
            }

            return true;
        });
    }, [allAvailableCourses, selectedTicket, selectedTrack, selectedLevel, selectedFormat, searchQuery]);

    const hasActiveFilters = selectedTicket !== 'todos' || searchQuery.trim() !== '' || selectedTrack !== 'todos' || selectedLevel !== 'todos' || selectedFormat !== 'todos';

    const handleResetFilters = () => {
        setSelectedTicket('todos');
        setSearchQuery('');
        setSelectedTrack('todos');
        setSelectedLevel('todos');
        setSelectedFormat('todos');
    };

    return (
        <div className="inner-page min-h-screen relative w-full overflow-hidden bg-[#020202]">
            
            {/* Fondo de Escena de Capacitación Ambiental con Velo Cinematográfico Neuform */}
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <img
                    src="/assets/3d-backend/bg_academy.webp"
                    alt="Capacitación y Educación Ambiental SERAM"
                    className="w-full h-full object-cover opacity-25"
                    onError={(e) => {
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

            {/* Contenido Principal Formativo */}
            <main className="academy-viewport min-h-screen flex flex-col items-center justify-start pt-12 pb-28 px-4 md:px-8 relative z-10 w-full max-w-7xl mx-auto space-y-24">
                
                {/* ========================================================================= */}
                {/* SECCIÓN 1: ENCABEZADO FORMATIVO & CATÁLOGO CLASIFICADO POR TICKET         */}
                {/* ========================================================================= */}
                <section 
                    id="campus-academico" 
                    className="w-full flex flex-col items-center pointer-events-auto"
                >
                    {/* Cabecera Educativa Principal */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center text-center space-y-3 mb-10 max-w-4xl"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase font-display">
                            CATÁLOGO DE FORMACIÓN & <span className="text-gradient-premium">RECURSOS TÉCNICOS</span>
                        </h1>
                        <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light max-w-2xl leading-relaxed">
                            Capacitación de alto nivel y recursos técnicos para ingenieros, consultores y profesionales en el marco de la normativa ambiental de Bolivia.
                        </p>
                    </motion.div>

                    {/* 5 Pestañas Principales de Categorización por Nivel de Ticket */}
                    <div className="w-full max-w-5xl mb-8">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                Nivel de Inversión / Ticket:
                            </span>
                            <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
                                Filtra entre recursos gratuitos, base, talleres o mentoría
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {TICKET_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isSelected = selectedTicket === tab.id;
                                const count = ticketCounts[tab.id] || 0;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setSelectedTicket(tab.id)}
                                        className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
                                            isSelected
                                                ? `${tab.activeClass} ring-1`
                                                : 'border-white/10 bg-black/40 hover:border-white/25 hover:bg-white/[0.04] text-gray-300'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-1 mb-2">
                                                <span className={`p-1.5 rounded-lg border ${
                                                    isSelected ? tab.badgeClass : 'bg-white/5 border-white/10 text-gray-400'
                                                }`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </span>
                                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                                    isSelected ? tab.badgeClass : 'bg-white/5 border-white/10 text-gray-400'
                                                }`}>
                                                    {tab.badge}
                                                </span>
                                            </div>
                                            <h3 className={`text-xs font-bold leading-snug tracking-tight ${
                                                isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                                            }`}>
                                                {tab.label}
                                            </h3>
                                        </div>

                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px]">
                                            <span className="text-gray-400 font-light truncate max-w-[90px]">
                                                {tab.priceRange}
                                            </span>
                                            <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                                                isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'
                                            }`}>
                                                {count}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 cursor-pointer"
                                    aria-label="Limpiar búsqueda"
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
                                <p className="text-xs text-gray-400 font-light">Prueba cambiando la categoría de ticket, ajustando los términos de búsqueda o restableciendo los filtros.</p>
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
                                const ticketBadge = getTicketBadge(course.type, course.price);

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
                                                
                                                {/* Badges de Clasificación: Ticket, Eje Temático & Nivel Técnico */}
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${ticketBadge.classes}`}>
                                                        {ticketBadge.label}
                                                    </span>
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
                {/* SECCIÓN 2: SELLOS DE CERTIFICACIÓN Y VALIDEZ TÉCNICA SERAM               */}
                {/* ========================================================================= */}
                <section 
                    id="certificaciones-seram" 
                    className="w-full max-w-5xl flex flex-col gap-10 pointer-events-auto"
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <span className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            Sellos de Certificación & Respaldo Regulatorio
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
                {/* SECCIÓN 3: CAPACITACIÓN IN-COMPANY PARA EMPRESAS                          */}
                {/* ========================================================================= */}
                <section 
                    id="in-company" 
                    className="w-full max-w-5xl flex flex-col gap-10 pointer-events-auto"
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <span className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            Capacitación In-Company para Empresas
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
                                onClick={() => navigate('/quote')}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Download, Compass, Award, Star, User, Clock, ArrowRight } from 'lucide-react';
import '../../styles/academy-cinematic.css';

export default function AcademyPage() {
    const navigate = useNavigate();
    const { courses } = useApp();
    const [activeTab, setActiveTab] = useState('gratis');

    const TABS = [
        { id: 'gratis', label: 'Gratis (Lead Magnets)', desc: 'E-books, carimbos, planos y guías de mitigación normativa.' },
        { id: 'low_ticket', label: 'Low Ticket (Base)', desc: 'Cursos fundamentales y herramientas técnicas de software GIS.' },
        { id: 'mid_ticket', label: 'Mid Ticket (Talleres)', desc: 'Talleres prácticos y metodologías de evaluación de impacto.' },
        { id: 'high_ticket', label: 'High Ticket (Mentoría)', desc: 'Mentorías directas 1-on-1 y consultoría de proyectos de élite.' }
    ];

    // Filter courses dynamically based on tab selection
    const filteredCourses = courses.filter(course => {
        if (activeTab === 'gratis') return course.price === 0 || course.type === 'gratis';
        if (activeTab === 'low_ticket') return course.price > 0 && course.price <= 50;
        if (activeTab === 'mid_ticket') return course.price > 50 && course.price <= 200;
        if (activeTab === 'high_ticket') return course.price > 200;
        return false;
    });

    const getIconForCategory = (type) => {
        switch (type) {
            case 'gratis': return <Download className="w-4 h-4 text-[#00e03c]" />;
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

    return (
        <main className="academy-viewport min-h-screen flex flex-col items-center justify-start py-24 px-4 md:px-8 bg-[#020202]">
            
            {/* Encabezado Semántico y Centrado */}
            <header className="text-center max-w-3xl flex flex-col items-center gap-4 mb-16 pointer-events-auto">
                <span className="text-xs font-bold tracking-widest text-[#00e03c] uppercase bg-[#2e5925]/20 px-4 py-1.5 rounded-full border border-[#00e03c]/20">
                    SERAM ACADEMY & INFO-PRODUCTOS
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none uppercase font-display">
                    Ecosistema <span className="text-gradient-premium">Educativo</span>
                </h1>
                <p className="text-gray-400 font-light text-sm md:text-base leading-relaxed mt-2 max-w-2xl">
                    Capacitación de alto nivel y recursos técnicos para ingenieros, consultores y empresas en el marco de la normativa ambiental de Bolivia.
                </p>
            </header>

            {/* Pestañas de Categoría (Figma Auto Layout - Flexbox) */}
            <nav className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-4xl w-full pointer-events-auto">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center px-5 py-3.5 rounded-xl border transition-all duration-300 flex-1 min-w-[150px] text-center ${
                                isActive
                                    ? 'bg-[#00e03c]/10 border-[#00e03c] text-white shadow-[0_0_15px_rgba(0,224,60,0.15)]'
                                    : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'
                            }`}
                        >
                            <span className="text-xs font-extrabold uppercase tracking-wider">{tab.label}</span>
                            <span className="text-[9px] font-light opacity-80 mt-1 line-clamp-1">{tab.desc}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Grid de Cursos e Info-productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4 pointer-events-none">
                <AnimatePresence mode="wait">
                    {filteredCourses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="col-span-full academy-glass-card p-12 text-center text-gray-500 text-sm pointer-events-auto border border-white/5"
                        >
                            No hay recursos registrados en esta categoría actualmente.
                        </motion.div>
                    ) : (
                        filteredCourses.map((course) => (
                            <motion.article
                                key={course.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                                className="academy-glass-card overflow-hidden flex flex-col justify-between pointer-events-auto h-full hover:border-[#00e03c]/30"
                            >
                                {/* Cover Image */}
                                <div className="relative aspect-video bg-[#050505] overflow-hidden border-b border-white/5">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                    
                                    {/* Cost/Access Tag */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <span className="text-[10px] tracking-wider font-extrabold uppercase bg-black/85 border border-white/10 px-3 py-1 rounded-md text-white">
                                            {course.price === 0 ? 'Gratuito' : `Bs. ${course.price}`}
                                        </span>
                                    </div>

                                    {/* Type icon indicator */}
                                    <div className="absolute bottom-4 left-4 p-2 bg-black/85 border border-white/10 rounded-lg">
                                        {getIconForCategory(course.type)}
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#00e03c]/70" /> {course.instructor}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-[#00e03c]/70" /> {course.duration}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                                            {renderFormattedText(course.title)}
                                        </h3>
                                        
                                        <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-3">
                                            {renderFormattedText(course.desc)}
                                        </p>
                                    </div>

                                    {/* Footer Action */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                        <span className="text-[10px] tracking-wider font-mono text-gray-500 uppercase">
                                            {course.students} estudiantes
                                        </span>
                                        
                                        <div className="flex items-center gap-2">
                                            {course.id === 2 && (
                                                <button 
                                                    onClick={() => navigate('/academy/workspace')}
                                                    className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                                                    title="Abrir Laboratorio Shader"
                                                >
                                                    Lab
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => navigate(`/academy/course/${course.id}`)}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-[#00e03c]/15 hover:bg-[#00e03c]/25 border border-[#00e03c]/40 hover:border-[#00e03c]/80 text-[#00e03c] hover:text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-[0_0_12px_rgba(0,224,60,0.1)]"
                                            >
                                                Ver Detalles <ArrowRight className="w-3 h-3 text-[#00e03c]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

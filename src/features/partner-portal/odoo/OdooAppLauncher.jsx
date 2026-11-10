/**
 * @file OdooAppLauncher.jsx
 * @description Lanzador Central de Aplicaciones (App Switcher) estilo Odoo ERP para SERAM.
 * Permite la navegación transversal e instantánea entre todos los módulos del ecosistema
 * (CRM, Operaciones Ambientales, Finanzas, Propuestas, Tiempo y Gobernanza)
 * bajo la identidad de marca Neuform de SERAM (Verde #00e03c, Oro #c9a84c y Grafito #070d17).
 *
 * Directrices: Cero emoticones, 100% en español, soporte accesible con tecla Escape y búsqueda instantánea.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, ChevronDown, Search, X, CheckSquare, Building2,
  Clock, Briefcase, BookOpenCheck, ShoppingBag, Globe, Scale,
  Shield, DollarSign, BarChart3, Users, Sparkles
} from 'lucide-react';

/**
 * Matriz de Aplicaciones Principales del Ecosistema Odoo SERAM
 */
export const ODOO_APPS = [
  {
    id: 'clients',
    name: 'CRM & Ventas (ARM)',
    shortName: 'CRM',
    description: 'Flujo BANT, cadencia 14D, prospectos SEPREC y embudo comercial',
    category: 'Comercial & Clientes',
    icon: Building2,
    accentColor: 'border-[#00e03c]/40 text-[#00e03c] bg-[#00e03c]/10',
    badge: 'ARM IA',
    badgeColor: 'bg-[#00e03c]/20 text-[#00e03c] border-[#00e03c]/35'
  },
  {
    id: 'services',
    name: 'Operaciones & Servicios Ambientales',
    shortName: 'Operaciones',
    description: 'Estudios EIA, RAI industrial, monitoreo de agua/mercurio y SIG',
    category: 'Ingeniería & Proyectos',
    icon: Briefcase,
    accentColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    badge: 'Técnico',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/35'
  },
  {
    id: 'overview',
    name: 'Finanzas & Compensación Equitativa',
    shortName: 'Finanzas',
    description: 'Bolsa operativa por horas, fondo de reserva 20%, balance y dividendos',
    category: 'Dirección Financiera',
    icon: DollarSign,
    accentColor: 'border-amber-400/40 text-amber-400 bg-amber-400/10',
    badge: 'Recharts',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/35'
  },
  {
    id: 'timetracker',
    name: 'Control de Horas (Time Tracker)',
    shortName: 'Time Tracker',
    description: 'Cronómetro en vivo, auditoría de esfuerzo real y registro por socio',
    category: 'Operaciones & Esfuerzo',
    icon: Clock,
    accentColor: 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10',
    badge: 'En Vivo',
    badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/35'
  },
  {
    id: 'activities',
    name: 'Actividades & Misiones Clave',
    shortName: 'Misiones',
    description: 'Misiones Flash, Grupales, Secundarias y de Especialidad con mérito XP',
    category: 'Meritocracia & Gestión',
    icon: CheckSquare,
    accentColor: 'border-purple-400/40 text-purple-400 bg-purple-400/10',
    badge: 'XP Mérito',
    badgeColor: 'bg-purple-400/20 text-purple-300 border-purple-400/35'
  },
  {
    id: 'proposals',
    name: 'Propuestas Municipales & SICOES',
    shortName: 'Propuestas',
    description: 'Licitaciones estatales, líneas base municipales y rentabilidad',
    category: 'Contrataciones Públicas',
    icon: BarChart3,
    accentColor: 'border-blue-400/40 text-blue-400 bg-blue-500/10',
    badge: 'SICOES',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/35'
  },
  {
    id: 'equity',
    name: 'Gobernanza & Cumplimiento Legal',
    shortName: 'Gobernanza',
    description: 'Auditoría jurídica societaria, SEPREC, actas y equilibrio de socios',
    category: 'Legal & Corporativo',
    icon: Scale,
    accentColor: 'border-rose-400/40 text-rose-400 bg-rose-500/10',
    badge: 'Compliance',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/35'
  },
  {
    id: 'academy',
    name: 'Academia SERAM & Dossiers',
    shortName: 'Academia',
    description: 'Cursos técnicos, manuales y formación continua especializada',
    category: 'Capacitación & Difusión',
    icon: BookOpenCheck,
    accentColor: 'border-teal-400/40 text-teal-400 bg-teal-500/10',
    badge: 'Cursos',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/35'
  },
  {
    id: 'office',
    name: 'Miniverso & Oficina Virtual',
    shortName: 'Miniverso',
    description: 'Entorno virtual inmersivo para interacción y trabajo colaborativo',
    category: 'Espacio de Trabajo',
    icon: Users,
    accentColor: 'border-indigo-400/40 text-indigo-400 bg-indigo-500/10',
    badge: 'Virtual',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35'
  }
];

export default function OdooAppLauncher({ activeModule, onSelectModule }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const currentApp = useMemo(() => {
    return ODOO_APPS.find(app => app.id === activeModule) || ODOO_APPS[0];
  }, [activeModule]);

  // Filtrado reactivo de aplicaciones
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return ODOO_APPS;
    const q = searchQuery.toLowerCase();
    return ODOO_APPS.filter(app =>
      app.name.toLowerCase().includes(q) ||
      app.shortName.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Enfocar input de búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Cierre accesible con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (appId) => {
    onSelectModule(appId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón Waffle estilo Odoo en la cabecera fija */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none active:scale-95 shadow-md ${
            isOpen
              ? 'bg-[#00e03c] text-slate-950 border-[#00e03c] shadow-[#00e03c]/20'
              : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/10 hover:border-[#00e03c]/40'
          }`}
          title="Abrir lanzador de aplicaciones Odoo (SERAM Apps)"
        >
          <LayoutGrid className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90 text-slate-950' : 'text-[#00e03c]'}`} />
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className={`text-[9px] font-mono uppercase tracking-widest ${isOpen ? 'text-slate-900 font-black' : 'text-slate-400'}`}>
              Ecosistema
            </span>
            <span className="text-xs font-black tracking-tight flex items-center gap-1">
              {currentApp.shortName}
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </span>
          </div>
        </button>
      </div>

      {/* Overlay Modal del Lanzador Odoo (Montado directamente en document.body para evitar solapamientos) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed inset-0 z-[9999] flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 bg-black/85 backdrop-blur-md overflow-y-auto"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-4xl bg-[#09120c] border border-white/[0.15] rounded-3xl shadow-2xl p-5 sm:p-7 space-y-6 text-slate-200"
              >
                {/* Cabecera del App Launcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#00e03c]/15 border border-[#00e03c]/35 flex items-center justify-center text-[#00e03c]">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        Aplicaciones de SERAM
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                          Formato Odoo
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Selecciona un módulo para acceder a su espacio de trabajo y datos interconectados
                      </p>
                    </div>
                  </div>

                  {/* Botón de Cierre */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="self-end sm:self-auto p-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
                    title="Cerrar lanzador (Esc)"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Barra de Búsqueda Instantánea tipo Odoo */}
                <div className="flex items-center gap-2.5 bg-black/60 border border-white/15 focus-within:border-[#00e03c] rounded-2xl px-4 py-2.5 transition-colors">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Escribe para buscar aplicación (ej. CRM, Finanzas, Proyectos, Horas)..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Cuadrícula de Aplicaciones (Matriz 3x3 estilo Odoo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
                  {filteredApps.map(app => {
                    const IconComponent = app.icon;
                    const isActive = app.id === activeModule;

                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleSelect(app.id)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-3.5 group relative ${
                          isActive
                            ? 'bg-[#00e03c]/[0.08] border-[#00e03c] shadow-lg shadow-[#00e03c]/5'
                            : 'bg-white/[0.025] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        {/* Icono de la App */}
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${app.accentColor}`}>
                          <IconComponent className="w-5 h-5 stroke-[2.2]" />
                        </div>

                        {/* Textos y Categoría */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
                              {app.category}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${app.badgeColor}`}>
                              {app.badge}
                            </span>
                          </div>

                          <h3 className={`text-sm font-black leading-tight truncate ${isActive ? 'text-[#00e03c]' : 'text-white group-hover:text-[#00e03c]'} transition-colors`}>
                            {app.name}
                          </h3>

                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {app.description}
                          </p>
                        </div>

                        {/* Indicador de Activo */}
                        {isActive && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00e03c] shadow-[0_0_8px_#00e03c]" title="Aplicación actualmente visible" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Pie Informativo */}
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-black/50 border border-white/15 text-[10px] font-mono text-slate-300">Esc</kbd> para salir</span>
                  <span className="text-slate-500 font-mono">SERAM ERP Ecosistema v2.0</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

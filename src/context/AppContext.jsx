import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import initialProspects from '../data/b2b_prospects.json';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // --- AUTH & ROLES ---
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [activeRole, setActiveRole] = useState(() => {
    try {
      // Limpieza proactiva de localStorage para no retener credenciales de socio permanentemente
      localStorage.removeItem('seram_partner_role');
      return sessionStorage.getItem('seram_partner_role') || 'AccessLimit';
    } catch (_) {
      return 'AccessLimit';
    }
  });
  const [currentSocio, setCurrentSocio] = useState(() => {
    try {
      localStorage.removeItem('seram_current_socio');
      const saved = sessionStorage.getItem('seram_current_socio');
      const parsed = saved ? JSON.parse(saved) : null;
      const validEmails = ['barrientoso2401@gmail.com', 'fernandoaraujo1912@gmail.com', 'sebastiansbs51@gmail.com'];
      if (parsed && (!parsed.email || !validEmails.includes(parsed.email.toLowerCase()))) {
        sessionStorage.removeItem('seram_current_socio');
        return null;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'barrientoso2401@gmail.com', role: 'AdminMod', name: 'Ing. Diego Barrientos', isPremiumApproved: true },
    { email: 'fernandoaraujo1912@gmail.com', role: 'AdminMod', name: 'Ing. Fernando Araujo', isPremiumApproved: true },
    { email: 'sebastiansbs51@gmail.com', role: 'AdminMod', name: 'Ing. Fabricio Orosco', isPremiumApproved: true },
  ]);

  // Persistir sesión de socio únicamente en sessionStorage (volátil, expira al cerrar la pestaña/navegador)
  useEffect(() => {
    try {
      if (activeRole === 'AdminMod' && currentSocio) {
        sessionStorage.setItem('seram_partner_role', 'AdminMod');
        sessionStorage.setItem('seram_current_socio', JSON.stringify(currentSocio));
      } else if (activeRole !== 'AdminMod') {
        sessionStorage.removeItem('seram_partner_role');
        sessionStorage.removeItem('seram_current_socio');
      }
      // Garantizar que nunca quede guardado en localStorage persistente
      localStorage.removeItem('seram_partner_role');
      localStorage.removeItem('seram_current_socio');
    } catch (_) {
      // Ignorar error de almacenamiento
    }
  }, [activeRole, currentSocio]);

  // --- SECRET PARTNER PORTAL ---
  const [logoClicks, setLogoClicks] = useState(0);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showSecretPortal, setShowSecretPortal] = useState(false);
  const [secretPassword, setSecretPassword] = useState('');
  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState(0);

  // --- CART ---
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // --- ACADEMY PROGRESS & SUBMISSIONS ---
  const [completedLessons, setCompletedLessons] = useState({});
  const [courseExamsApproved, setCourseExamsApproved] = useState({});
  const [courseAssignments, setCourseAssignments] = useState({});




  // --- DEFAULT MULTI-CATEGORY COURSES & DELIVERABLES CATALOG (SERAM ACADEMY) ---
  const DEFAULT_COURSES_CATALOG = [
    {
      id: 101,
      title: 'E-Book & Compendio Normativo: Ley 1333, D.S. 3549 y Guía de Mitigación Ambiental en Bolivia',
      instructor: 'Ing. Fernando Araujo',
      students: 142,
      status: 'Activo',
      isPremium: false,
      type: 'gratis',
      format: 'pdf',
      hasVideo: false,
      price: 0,
      image: '/assets/covers/cover_ebook_ley1333.png',
      duration: 'Dossier Técnico Descargable (180 págs.)',
      desc: 'Compendio interpretado de la legislación ambiental boliviana (Ley 1333, D.S. 3549, RMCH y RASIM). Incluye carimbos editables, matrices de dispersión y diagrama de flujo de licencias ambientales descargable en PDF de alta resolución.',
      pdfName: 'Compendio_Normativo_Gestion_Ambiental_SERAM_2026.pdf',
      pdfUrl: '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf',
      pages: 180,
      version: 'Edición 2026 Revisada',
      sections: [
        { title: 'Capítulo I: Marco Regulatorio General y Jerarquía Normativa (Ley 1333)' },
        { title: 'Capítulo II: D.S. 3549 y Procedimientos Administrativos de Licenciamiento' },
        { title: 'Capítulo III: Reglamento en Materia de Contaminación Hídrica (RMCH)' },
        { title: 'Capítulo IV: Carimbos, Matrices de Mitigación y Anexos Oficiales' }
      ]
    },
    {
      id: 102,
      title: 'Guía Metodológica & Plantillas SIG: Delimitación de Microcuencas y Mapas Temáticos en QGIS',
      instructor: 'Ing. Diego Barrientos',
      students: 87,
      status: 'Activo',
      isPremium: true,
      type: 'low_ticket',
      format: 'pdf',
      hasVideo: false,
      price: 45.00,
      image: '/assets/covers/cover_qgis_basico.png',
      duration: 'Dossier Práctico + Modelos QGIS (95 págs.)',
      desc: 'Manual técnico paso a paso para la delimitación automatizada de cuencas hidrográficas con modelos digitales de elevación (DEM SRTM 30m). Incluye archivos de proyecto QGIS (.qgz), paletas de colores normativas y carimbos vectoriales oficiales listos para impresión.',
      pdfName: 'Guia_Metodologica_SIG_Cuencas_SERAM.pdf',
      pdfUrl: '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf',
      pages: 95,
      version: 'Versión 3.28 LTR',
      sections: [
        { title: 'Sección 1: Preparación y Corrección Hidrológica del DEM (Fill Sinks)' },
        { title: 'Sección 2: Determinación de Direcciones de Flujo y Acumulación' },
        { title: 'Sección 3: Vectorización de Cuenca y Orden de Drenaje (Strahler)' },
        { title: 'Sección 4: Simbología y Maquetación Cartográfica para Presentación Municipal' }
      ]
    },
    {
      id: 1,
      title: 'Sistemas de Información Geográfica (SIG) Aplicado a la Gestión y Fiscalización Ambiental en Bolivia',
      instructor: 'Ing. Diego Barrientos',
      students: 54,
      status: 'Activo',
      isPremium: true,
      type: 'mid_ticket',
      format: 'video',
      hasVideo: true,
      price: 180.00,
      image: '/assets/3d-backend/gis_satellite_mapping.webp',
      duration: '40 horas prácticas (QGIS & ArcGIS Pro)',
      desc: 'Capacitación profesional intensiva con datos satelitales bolivianos: delimitación de microcuencas, mapas temáticos para categorización FNCA y licencias ambientales, análisis multitemporal de deforestación y fiscalización pericial.',
      pdfName: 'Syllabus_Curso_SIG_Ambiental_SERAM_2026.pdf',
      pdfUrl: '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf'
    },
    {
      id: 103,
      title: 'Taller Especializado: Formulación de Fichas Ambientales y Categorización FNCA para Proyectos Mineros y Civiles',
      instructor: 'Ing. Fabricio Orosco',
      students: 41,
      status: 'Activo',
      isPremium: true,
      type: 'mid_ticket',
      format: 'video',
      hasVideo: true,
      price: 150.00,
      image: '/assets/covers/cover_taller_fichas.png',
      duration: '25 horas prácticas',
      desc: 'Taller intensivo en video y talleres sincrónicos de llenado pericial de formularios FNCA (Categorías 1, 2, 3 y 4) ante la Autoridad Ambiental Competente. Estudio de casos mineros auríferos y plantas de tratamiento.',
      pdfName: 'Plantillas_FNCA_IRAP_Oficial_2026.pdf',
      pdfUrl: '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf'
    },
    {
      id: 104,
      title: 'Programa Directivo & Mentoría 1-on-1: Consultoría Ambiental Estratégica, Defensa Legal y Proyectos Municipales',
      instructor: 'Ing. Diego Barrientos & Ing. Fernando Araujo',
      students: 12,
      status: 'Activo',
      isPremium: true,
      type: 'high_ticket',
      format: 'video',
      hasVideo: true,
      price: 480.00,
      image: '/assets/covers/cover_mentoria_consultoria.png',
      duration: '60 horas + 4 sesiones 1-on-1',
      desc: 'Programa de mentoría avanzada para directores ambientales, consultores senior y líderes técnicos. Acompañamiento personalizado en la estructuración de propuestas B2B, licitaciones municipales y defensa pericial ante contingencias ambientales.',
      pdfName: 'Dossier_Mentoria_Consultoria_SERAM_2026.pdf',
      pdfUrl: '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf'
    },
    {
      id: 105,
      title: 'Dossier Pericial & Protocolo de Monitoreo Hidrogeoquímico de Mercurio (Hg) en Fuentes de Agua',
      instructor: 'Ing. Diego Barrientos',
      students: 19,
      status: 'Activo',
      isPremium: true,
      type: 'high_ticket',
      format: 'pdf',
      hasVideo: false,
      price: 250.00,
      image: '/assets/3d-backend/gis_satellite_mapping.webp',
      duration: 'Protocolo Pericial Descargable (140 págs. + Planillas)',
      desc: 'Dossier técnico estandarizado de monitoreo pericial para cuencas afectadas por minería aluvial. Incluye protocolos de cadena de custodia, planillas de cálculo de incertidumbre analítica y plantillas de informes legales para municipios.',
      pdfName: 'Protocolo_Pericial_Monitoreo_Mercurio_SERAM.pdf',
      pdfUrl: '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf',
      pages: 140,
      version: 'Norma NB 512 & EPA Met. 1631',
      sections: [
        { title: 'Fase I: Diseño de Red de Monitoreo y Selección de Estaciones Geoespaciales' },
        { title: 'Fase II: Protocolo de Muestreo Ultra-Limpio y Preservación de Muestras' },
        { title: 'Fase III: Análisis por Espectrometría de Fluorescencia Atómica (AFS)' },
        { title: 'Fase IV: Modelo de Informe Pericial con Validez Forense y Municipal' }
      ]
    }
  ];

  // Helper resiliente para guardar catálogo en localStorage sin fallos por exceso de cuota
  const saveCoursesToStorage = (list) => {
    try {
      if (typeof window === 'undefined' || !Array.isArray(list)) return;
      const sanitized = list.map(c => {
        if (c.pdfUrl && typeof c.pdfUrl === 'string' && c.pdfUrl.startsWith('data:') && c.pdfUrl.length > 50000) {
          return { ...c, pdfUrl: '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf' };
        }
        return c;
      });
      localStorage.setItem('seram_courses', JSON.stringify(sanitized));
    } catch (err) {
      console.warn('[Courses localStorage Quota Notice]:', err);
    }
  };

  // --- COURSES STATE (Catálogo Oficial Persistente de SERAM ACADEMY) ---
  const [courses, setCourses] = useState(() => {
    let initialList = DEFAULT_COURSES_CATALOG;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('seram_courses');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map();
            DEFAULT_COURSES_CATALOG.forEach(c => map.set(c.id, c));
            parsed.forEach(c => {
              const existing = map.get(c.id) || {};
              map.set(c.id, { ...existing, ...c });
            });
            initialList = Array.from(map.values());
          }
        }
      } catch (e) {}
    }
    return initialList;
  });

  // --- PROJECTS (Proyectos B2B y Consultorías Ambientales Oficiales de SERAM SRL) ---
  const [activeServices, setActiveServices] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('seram_active_services') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 101,
        code: 'SRM-2026-B2B-01',
        client: 'Gobierno Autónomo Municipal de Palos Blancos',
        type: 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg) y Fuentes de Agua por Minería Aurífera',
        lead: 'Ing. Diego Barrientos',
        involved: ['Ing. Fernando Araujo', 'Ing. Fabricio Orosco'],
        location: 'Palos Blancos, Alto Beni - La Paz',
        startDate: '2026-06-01',
        endDate: '2026-10-31',
        progress: 35,
        budget: 68000,
        labCosts: 12000,
        subcontractorCosts: 8000,
        taxRegime: 'Régimen General',
        description: 'Monitoreo hidrogeoquímico pericial de mercurio total en tomas de agua potable comunales y afluentes mineros del Río Kaka. Incluye mapas de vulnerabilidad geoespacial en ArcGIS Pro, informe pericial y TDRs oficiales.',
        pdfName: 'SERAM_TDR_Monitoreo_Palos_Blancos_2026.pdf',
        pdfUrl: '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf',
        tag: 'Proyecto B2B Oficial',
        isProposal: true,
        proposalId: 'prop-mun-01'
      }
    ];
  });

  // --- CLIENTS (Directorio de Clientes e Instituciones de SERAM) ---
  const [clients, setClients] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('seram_clients') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 1,
        name: 'Gobierno Autónomo Municipal de Palos Blancos',
        type: 'Municipal / Público',
        contactPerson: 'Dirección de Medio Ambiente y Madre Tierra',
        contactPhone: '+591 71500000',
        contactEmail: 'medioambiente@palosblancos.gob.bo',
        location: 'Palos Blancos, Alto Beni - La Paz',
        notes: 'Prioridad: Monitoreo de mercurio y fuentes de agua potable comunales'
      },
      {
        id: 2,
        name: 'Gobierno Autónomo Municipal de Guanay',
        type: 'Municipal / Público',
        contactPerson: 'Secretaría Técnica Municipal',
        contactPhone: '+591 72000000',
        contactEmail: 'tecnica@guanay.gob.bo',
        location: 'Guanay - La Paz',
        notes: 'Prioridad: Línea base de contaminación y fiscalización de concesiones auríferas'
      },
      {
        id: 3,
        name: 'Cooperativa Minera Aurífera Kaka R.L.',
        type: 'Minería / Cooperativa',
        contactPerson: 'Gerencia de Operaciones',
        contactPhone: '+591 73000000',
        contactEmail: 'operaciones@coopkaka.bo',
        location: 'Río Kaka - La Paz',
        notes: 'Tramitación de Ficha Ambiental y adecuación a RMCH'
      }
    ];
  });

  // --- ACTIVITIES (Central de Actividades Claves de Socios - Migrada de Notion) ---
  const [activities, setActivities] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('seram_activities') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 1,
        title: 'Procesamiento cartográfico y mapa de isolíneas de mercurio en ArcGIS Pro',
        description: 'Generación de la capa raster de concentración de mercurio en puntos de toma comunal en Palos Blancos.',
        projectId: 101,
        projectTitle: 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg) y Fuentes de Agua por Minería Aurífera',
        assignedPartner: 'Ing. Diego Barrientos',
        assignedPartnerEmail: 'barrientoso2401@gmail.com',
        category: 'SIG / Cartografía',
        status: 'En curso',
        priority: 'Alta',
        dueDate: '2026-10-15',
        estimatedHours: 18.00,
        actualHours: 12.50,
        deliverableUrl: null,
        deliverableName: null
      },
      {
        id: 2,
        title: 'Revisión legal de TDRs y adecuación a Ley 1333 y Ley de Minería 535',
        description: 'Armado de la carpeta legal para presentación ante la comisión del Concejo Municipal.',
        projectId: 101,
        projectTitle: 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg) y Fuentes de Agua por Minería Aurífera',
        assignedPartner: 'Ing. Fernando Araujo',
        assignedPartnerEmail: 'fernandoaraujo1912@gmail.com',
        category: 'Elaboración Informe / TDR',
        status: 'En curso',
        priority: 'Alta',
        dueDate: '2026-10-18',
        estimatedHours: 14.00,
        actualHours: 8.00,
        deliverableUrl: null,
        deliverableName: null
      },
      {
        id: 3,
        title: 'Logística y coordinación de reactivos para segunda campaña de muestreo de agua',
        description: 'Cotización de espectrometría con generador de hidruros y frascos de preservación.',
        projectId: 101,
        projectTitle: 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg) y Fuentes de Agua por Minería Aurífera',
        assignedPartner: 'Ing. Fabricio Orosco',
        assignedPartnerEmail: 'sebastiansbs51@gmail.com',
        category: 'Trabajo de Campo / Muestreo',
        status: 'Pendiente',
        priority: 'Media',
        dueDate: '2026-10-22',
        estimatedHours: 10.00,
        actualHours: 3.00,
        deliverableUrl: null,
        deliverableName: null
      }
    ];
  });

  // --- B2B PROSPECTS (Base Global de Empresas de Bolivia para Captación Comercial) ---
  const [prospects, setProspects] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('seram_prospects') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialProspects || [];
  });

  // --- MUNICIPAL PROPOSALS (Líneas Base & Proyectos para Concejales Municipales) ---
  const [municipalProposals, setMunicipalProposals] = useState([
    {
      id: 'prop-mun-01',
      title: 'Línea Base y Monitoreo Hidrogeoquímico de Contaminación por Mercurio (Hg) en Fuentes de Agua y Cuencas Auríferas',
      shortTitle: 'Monitoreo de Mercurio & Minería Aurífera',
      axis: 'mercurio',
      axisLabel: 'Mercurio & Minería Aurífera',
      targetMunicipalities: ['Palos Blancos', 'Alto Beni', 'Guanay', 'Mapiri'],
      lead: 'Ing. Diego Barrientos',
      leadRole: 'Especialista SIG & Monitoreo Ambiental - SERAM',
      problem: 'Dispersión crítica de mercurio metálico y metilmercurio derivado de la explotación de oro aluvial en los ríos Kaka, Mapiri y afluentes del Río Beni. Afectación directa a tomas de agua potable comunales, pueblos indígenas ribereños (Tsimane, Mosetén, Leco) y bioacumulación en especies ictiológicas de consumo diario.',
      legalFramework: [
        'Ley 1333 de Medio Ambiente (Reglamento en Materia de Contaminación Hídrica - RMCH)',
        'Convenio de Minamata sobre el Mercurio (Ratificado mediante Ley 759)',
        'Ley 535 de Minería y Metalurgia (Atribuciones de Fiscalización y Resguardo Ambiental Municipal)',
        'Decreto Supremo 4959 (Control y Registro Único de Importación y Uso de Mercurio en Bolivia)'
      ],
      methodology: 'Establecimiento de red georreferenciada de estaciones de muestreo en puntos críticos (cabeceras, frentes de dragado y tomas comunales de agua). Medición multiparamétrica in-situ (pH, conductividad eléctrica, turbidez, oxígeno disuelto). Ensayos de laboratorio acreditado para cuantificación de mercurio total en agua superficial y sedimentos de lecho mediante Espectrometría de Absorción Atómica (AAS con Generador de Hidruros / Vapor Frío). Modelación geoespacial de plumas de dispersión y vulnerabilidad de tomas en ArcGIS Pro.',
      deliverables: [
        'Informe Técnico de Línea Base Hidrogeoquímica con validez pericial ante el Concejo Municipal',
        'Geodatabase y Mapa de Isolíneas de Concentración de Hg y Zonas de Alto Riesgo a escala 1:25.000',
        'Protocolo Municipal de Alerta Temprana y Guía de Fiscalización para Inspecciones In-Situ',
        'Anteproyecto de Ordenanza / Ley Municipal de Protección de Fuentes de Agua y Servidumbres Ecológicas'
      ],
      budget: 68000,
      currency: 'Bs.',
      duration: '90 días calendario',
      status: 'Propuesta Activa Oficial',
      priority: 'Alta Prioridad',
      phases: [
        { name: 'Fase 1: Diagnóstico Cartográfico y Red de Muestreo', duration: '20 días' },
        { name: 'Fase 2: Campaña de Campo y Toma de Muestras (AAS)', duration: '25 días' },
        { name: 'Fase 3: Análisis de Laboratorio y Modelación SIG', duration: '25 días' },
        { name: 'Fase 4: Formulación Normativa y Presentación a Concejo', duration: '20 días' }
      ]
    }
  ]);

  // --- DINAMIC SERVICES IN PUBLIC SITE ---
  const [publicServices, setPublicServices] = useState([
    {
      id: 'srv-notion-1',
      title: 'Formulario de Nivel de Categorización Ambiental (FNCA)',
      line: 'Trámites Ambientales Express',
      desc: 'Instrumento de Regulación de Alcance Particular (IRAP) obligatorio por normativa boliviana para definir el rumbo legal de tu *Licencia Ambiental*. Gestionamos y aceleramos su aprobación.',
      tag: 'FNCA',
      icon: 'FileText'
    },
    {
      id: 'srv-notion-2',
      title: 'Registro Ambiental Industrial (RAI)',
      line: 'Trámites Ambientales Express',
      desc: 'Protege tu fábrica de precintos y multas. Gestionamos tu *Registro Ambiental Industrial* (RAI) y la categorización industrial obligatoria con velocidad express y blindaje legal.',
      tag: 'RAI',
      icon: 'Activity'
    },
    {
      id: 'srv-notion-3',
      title: 'Teledetección con Drones',
      line: 'Servicios GIS Ambientales',
      desc: 'Monitoreo de alta precisión y mapeo aéreo mediante vehículos aéreos no tripulados. Generamos modelos digitales de elevación y ortomosaicos georreferenciados para *análisis espacial*.',
      tag: 'SIG / Drones',
      icon: 'Compass'
    },
    {
      id: 'srv-notion-4',
      title: 'Ruta de Ecoturismo Sostenible (RES)',
      line: 'Servicios GIS Ambientales',
      desc: 'Diseño y desarrollo cartográfico de rutas ecoturisticas, integrando el *análisis espacial* y la conservación de la biodiversidad local con fines educativos y de sostenibilidad.',
      tag: 'Ecoturismo',
      icon: 'Globe'
    },
    {
      id: 'srv-notion-5',
      title: 'Dibujo de Planos y Mapas Ambientales',
      line: 'Servicios GIS Ambientales',
      desc: 'Servicios profesionales de *cartografía* y dibujo de planos temáticos, perfiles topográficos y georreferenciación oficial para consultores y empresas senior.',
      tag: 'Cartografía',
      icon: 'Map'
    },
    {
      id: 'srv-notion-6',
      title: 'Asesoramiento Técnico-Legal Especializado',
      line: 'Trámites Ambientales Express',
      desc: 'Consultoría de alto nivel y defensa técnica-legal en procesos de fiscalización, inspecciones y cumplimiento normativo de la *Ley 1333* ante autoridades competentes.',
      tag: 'Legal',
      icon: 'Shield'
    },
    {
      id: 'srv-notion-7',
      title: 'Programa de Educación Ambiental',
      line: 'Servicios GIS Ambientales',
      desc: 'Apoyo técnico para industrias, empresas y comunidades. Capacitación al personal, talleres presenciales de *Economía Circular* y asesoría en emprendimientos verdes.',
      tag: 'Capacitación',
      icon: 'BookOpen'
    },
    {
      id: 'srv-notion-8',
      title: 'Diseño de Puntos Ecológicos (DPE)',
      line: 'Ingeniería y Seguridad Industrial',
      desc: 'Diseño técnico de estaciones de reciclaje, señalización oficial, distribución de contenedores y elaboración de manuales de uso y planes de ejecución.',
      tag: 'Gestión',
      icon: 'Leaf'
    },
    {
      id: 'srv-notion-9',
      title: 'Cursos Online de Capacitación',
      line: 'Servicios GIS Ambientales',
      desc: 'Cursos técnicos prácticos en modalidad virtual sobre *legislación ambiental boliviana*, manejo de herramientas GIS y consultoría ambiental aplicada.',
      tag: 'Educación',
      icon: 'BookOpen'
    },
    {
      id: 'srv-notion-10',
      title: 'Bonos de Carbono y Compensación',
      line: 'Servicios GIS Ambientales',
      desc: 'Asesoramiento técnico en proyectos de captura de carbono, cuantificación y certificación de créditos para el mercado de compensación voluntaria.',
      tag: 'Carbono',
      icon: 'Leaf'
    },
    {
      id: 'srv-notion-11',
      title: 'Formulario Minero EMAP',
      line: 'Trámites Ambientales Express',
      desc: 'Elaboración del Formulario *EMAP* para la regularización de actividades mineras con impactos ambientales conocidos no significativos, cumpliendo plazos y normas oficiales.',
      tag: 'EMAP',
      icon: 'Compass'
    },
    {
      id: 'srv-notion-12',
      title: 'Informe Técnico Hidrocarburos (IT)',
      line: 'Trámites Ambientales Express',
      desc: 'Gestión de informes técnicos requeridos para autorizaciones de movimientos menores y adecuaciones en instalaciones del sector de hidrocarburos.',
      tag: 'IT / Hidrocarburos',
      icon: 'Activity'
    },
    {
      id: 'srv-notion-13',
      title: 'Formulario de Solicitud FSPAE',
      line: 'Trámites Ambientales Express',
      desc: 'Elaboración y tramitación del Formulario *FSPAE* ante la Autoridad Ambiental Competente para actividades específicas autorizadas en Bolivia.',
      tag: 'FSPAE',
      icon: 'FileText'
    },
    {
      id: 'srv-notion-14',
      title: 'Formulario de Prospección Minera (PM)',
      line: 'Trámites Ambientales Express',
      desc: 'Diseñamos soluciones cartográficas exactas y elaboramos carpetas rápidas para la aprobación ágil de trámites de *prospección minera* en tus concesiones mineras.',
      tag: 'PM / Minería',
      icon: 'Compass'
    },
    {
      id: 'srv-notion-15',
      title: 'Formulario de Categorización Común (FNCAC)',
      line: 'Trámites Ambientales Express',
      desc: 'Elaboración de formularios de categorización común para proyectos de desarrollo rural y municipal de beneficio comunitario en Bolivia.',
      tag: 'FNCAC',
      icon: 'FileText'
    },
    {
      id: 'srv-notion-16',
      title: 'Diseño de Planes de Gestión Ambiental',
      line: 'Ingeniería y Seguridad Industrial',
      desc: 'Diseño técnico e implementación de planes de gestión de residuos, control de emisiones y auditorías de cumplimiento normativo industrial.',
      tag: 'Gestión',
      icon: 'Leaf'
    }
  ]);

  const handleAddPublicService = (service) => {
    setPublicServices(prev => [...prev, { id: 'srv-' + Date.now(), ...service }]);
    triggerToast('Servicio público agregado correctamente', 'success');
  };
  const handleEditPublicService = (id, fields) => {
    setPublicServices(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s));
    triggerToast('Servicio público actualizado', 'success');
  };
  const handleDeletePublicService = (id) => {
    setPublicServices(prev => prev.filter(s => s.id !== id));
    triggerToast('Servicio público eliminado', 'info');
  };

  // --- SPECIALISTS DB (BROKER NETWORK) ---
  const [specialists, setSpecialists] = useState([
    { id: 1, name: 'Ing. Mariana Camacho', contact: '+591 78945612', renca: 'B-10254', syso: 'MTE-2301-A', city: 'Santa Cruz', rate: 1500, hasFactura: false },
    { id: 2, name: 'Ing. Carlos Mendoza', contact: '+591 67812345', renca: 'C-22941', syso: 'MTE-1042-B', city: 'Cochabamba', rate: 2000, hasFactura: true },
    { id: 3, name: 'Dra. Gabriela Rojas', contact: '+591 71234567', renca: 'B-09412', syso: 'N/A', city: 'La Paz', rate: 1800, hasFactura: false },
  ]);

  const handleAddSpecialist = (spec) => {
    setSpecialists(prev => [...prev, { id: Date.now(), ...spec }]);
    triggerToast('Especialista agregado a la red', 'success');
  };
  const handleEditSpecialist = (id, fields) => {
    setSpecialists(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s));
    triggerToast('Especialista actualizado', 'success');
  };
  const handleDeleteSpecialist = (id) => {
    setSpecialists(prev => prev.filter(s => s.id !== id));
    triggerToast('Especialista eliminado de la red', 'info');
  };

  // --- EXPERIENCES ---
  const [experiences, setExperiences] = useState([
    { id: 201, name: 'Voluntariado de Restauración Ecológica', date: '2026-07-12', location: 'Valle de Zongo', capacity: 20, enrolled: 14, price: 0, type: 'Voluntariado', status: 'Activo' },
    { id: 202, name: 'Expedición Científica Salar de Uyuni', date: '2026-08-05', location: 'Potosí, Bolivia', capacity: 12, enrolled: 8, price: 350, type: 'Ecoturismo', status: 'Activo' },
    { id: 203, name: 'Taller de Lombricultura Urbana', date: '2026-07-20', location: 'La Paz, Bolivia', capacity: 25, enrolled: 25, price: 80, type: 'Taller', status: 'Lleno' },
  ]);

  // --- TIME LOGS (intranet tracker de trabajo realizado con persistencia Supabase y LocalStorage) ---
  const [timeLogs, setTimeLogs] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('seram_time_logs') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [
      { id: 1, partner_id: 'barrientoso2401@gmail.com', partner_name: 'Ing. Diego Barrientos', project_id: 1, project_title: 'Gobierno Autónomo Municipal de Palos Blancos', hours: 4.5, description: 'Línea base hidrogeoquímica de mercurio y protocolo de muestreo de agua potable.', logged_at: new Date().toISOString() },
      { id: 2, partner_id: 'fernandoaraujo1912@gmail.com', partner_name: 'Ing. Fernando Araujo', project_id: 6, project_title: 'Plan Minero Ecológico y Protección de Cuencas - Guanay', hours: 3.5, description: 'Modelación hidráulica de red y balance de cuenca para concejales.', logged_at: new Date().toISOString() },
      { id: 3, partner_id: 'sebastiansbs51@gmail.com', partner_name: 'Ing. Fabricio Orosco', project_id: 10, project_title: 'G.A.M.L.P. - Propuesta Técnica de Lombricultura', hours: 4.0, description: 'Estructuración de guía técnica de compostaje y gestión de residuos sólidos orgánicos.', logged_at: new Date().toISOString() },
    ];
  });

  // --- DEFAULT ISOMETRIC OFFICE ROOMS REFERENCE ---
  const DEFAULT_OFFICE_ROOMS = {
    admin: { name: '01. ADMINISTRACIÓN', coords: { x: 29, y: 22 } },
    direction: { name: '02. DIRECCIÓN', coords: { x: 35, y: 35 } },
    operations: { name: '03. OPERACIONES Y PLANIFICACIÓN', coords: { x: 53, y: 17 } },
    commercial: { name: '04. COMERCIAL', coords: { x: 64, y: 27 } },
    finances: { name: '05. FINANZAS', coords: { x: 77, y: 46 } },
    marketing: { name: '06. MARKETING Y VENTAS', coords: { x: 21, y: 46 } },
    service: { name: '07. SERVICE', coords: { x: 62, y: 44 } },
    academy: { name: '08. ACADEMY', coords: { x: 17, y: 31 } },
    store: { name: '09. STORE', coords: { x: 37, y: 64 } },
    legal: { name: '10. LEGAL', coords: { x: 80, y: 29 } },
    experience: { name: '11. EXPERIENCIA Y CAMPO', coords: { x: 12, y: 55 } },
    social_media: { name: '12. SOCIAL MEDIA', coords: { x: 71, y: 70 } },
    research: { name: '13. INVESTIGACIÓN', coords: { x: 91, y: 54 } },
    recreation: { name: 'Área de Café & Descanso', coords: { x: 49, y: 82 } },
    meeting: { name: 'Sala de Directorio', coords: { x: 52, y: 52 } }
  };

  // --- REAL-TIME PARTNERS PRESENCE & SESSION TRACKING ---
  const [partnerPresences, setPartnerPresences] = useState(() => {
    try {
      const saved = localStorage.getItem('seram_partners_presence');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_) {}
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
    return {
      'barrientoso2401@gmail.com': {
        name: 'Ing. Diego Barrientos',
        role: 'Socio Fundador · Especialista SIG & Hidráulica',
        isOnline: true,
        lastLogin: new Date().toISOString(),
        sessionStart: Date.now() - 34 * 60 * 1000,
        lastPing: Date.now(),
        currentRoomId: 'direction',
        currentSectorName: '02. DIRECCIÓN',
        roomCoords: { x: 35, y: 35 },
        isTimerRunning: false,
        timerSeconds: 13320,
        timerStartedAt: null,
        activeTaskId: 101,
        activeTaskTitle: 'Formulación y Presentación de Propuestas Socioambientales para Concejales Municipales',
        device: isMobile ? 'Dispositivo Móvil (Android)' : 'Escritorio (Web)',
        location: 'La Paz, Bolivia'
      },
      'fernandoaraujo1912@gmail.com': {
        name: 'Ing. Fernando Araujo',
        role: 'Socio Fundador · Especialista Ambiental & Legal',
        isOnline: false,
        lastLogin: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
        sessionStart: null,
        lastPing: Date.now() - 48 * 60 * 1000,
        currentRoomId: 'operations',
        currentSectorName: '03. OPERACIONES Y PLANIFICACIÓN',
        roomCoords: { x: 53, y: 17 },
        isTimerRunning: false,
        timerSeconds: 9720,
        timerStartedAt: null,
        activeTaskId: 101,
        activeTaskTitle: 'Plan de Ordenamiento Territorial y Trámites RMCH',
        device: 'Escritorio (Web)',
        location: 'Santa Cruz, Bolivia'
      },
      'sebastiansbs51@gmail.com': {
        name: 'Ing. Fabricio Orosco',
        role: 'Socio Fundador · Especialista Residuos & Auditoría',
        isOnline: false,
        lastLogin: new Date(Date.now() - 125 * 60 * 1000).toISOString(),
        sessionStart: null,
        lastPing: Date.now() - 125 * 60 * 1000,
        currentRoomId: 'experience',
        currentSectorName: '11. EXPERIENCIA Y CAMPO',
        roomCoords: { x: 12, y: 55 },
        isTimerRunning: false,
        timerSeconds: 7200,
        timerStartedAt: null,
        activeTaskId: 101,
        activeTaskTitle: 'Auditoría de Gestión de Residuos EcoIndustrial S.A.',
        device: 'Dispositivo Móvil',
        location: 'La Paz, Bolivia'
      }
    };
  });

  // --- TIME TRACKER EN TIEMPO REAL (ESTADO GLOBAL COMPARTIDO) ---
  const [activeTimer, setActiveTimer] = useState(() => {
    try {
      const saved = localStorage.getItem('seram_active_partner_timer');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_) {}
    return {
      isRunning: false,
      seconds: 13320, // 3.7 horas iniciales por defecto
      startedAt: null,
      projectId: 101,
      projectTitle: 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg)',
      sectorId: 'direction',
      sectorName: '02. DIRECCIÓN'
    };
  });

  // Guardar estado del timer en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('seram_active_partner_timer', JSON.stringify(activeTimer));
    } catch (_) {}
  }, [activeTimer]);

  // Ticker de 1 segundo para el activeTimer
  useEffect(() => {
    let interval = null;
    if (activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => ({
          ...prev,
          seconds: (prev.seconds || 0) + 1
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.isRunning]);

  // CANAL BROADCAST MULTI-PESTAÑA LOCAL ('seram_partner_realtime')
  const [broadcastChan, setBroadcastChan] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const chan = new BroadcastChannel('seram_partner_realtime');
        setBroadcastChan(chan);

        chan.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'PARTNER_PRESENCE_UPDATE' && payload && payload.email) {
            setPartnerPresences(prev => {
              const current = prev[payload.email] || {};
              const merged = {
                ...prev,
                [payload.email]: { ...current, ...payload.data, lastPing: Date.now() }
              };
              try {
                localStorage.setItem('seram_partners_presence', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            });
          } else if (type === 'PARTNER_TIMER_TICK' && payload && payload.email) {
            setPartnerPresences(prev => {
              const current = prev[payload.email];
              if (!current) return prev;
              return {
                ...prev,
                [payload.email]: {
                  ...current,
                  isTimerRunning: payload.isTimerRunning,
                  timerSeconds: payload.timerSeconds,
                  lastPing: Date.now()
                }
              };
            });
          }
        };

        return () => {
          chan.close();
        };
      } catch (err) {
        console.warn('[BroadcastChannel Error]:', err);
      }
    }
  }, []);

  // Escuchar evento 'storage' para sincronización cruzada en navegadores sin BroadcastChannel
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'seram_partners_presence' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            setPartnerPresences(parsed);
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // REF PERSISTENTE DEL CANAL SUPABASE REALTIME
  const supabaseChannelRef = useRef(null);

  // SUPABASE REALTIME CHANNEL (PRESENCE & BROADCAST EN TIEMPO REAL ENTRE DISPOSITIVOS)
  useEffect(() => {
    const currentEmail = currentSocio?.email || (activeRole === 'AdminMod' ? 'barrientoso2401@gmail.com' : null);
    const channelName = 'seram-partners-presence-v1';

    // Desconectar canal previo si existía
    if (supabaseChannelRef.current) {
      try {
        supabaseChannelRef.current.untrack();
        supabase.removeChannel(supabaseChannelRef.current);
      } catch (_) {}
      supabaseChannelRef.current = null;
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: currentEmail || 'anonymous' },
        broadcast: { self: false }
      }
    });

    supabaseChannelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        if (state) {
          setPartnerPresences(prev => {
            const next = { ...prev };
            const activePresenceKeys = Object.keys(state);

            // 1. Sincronizar socios activos en tiempo real desde Supabase
            Object.entries(state).forEach(([key, presences]) => {
              if (Array.isArray(presences) && presences.length > 0) {
                const latest = presences[presences.length - 1];
                if (latest && latest.email) {
                  next[latest.email] = {
                    ...(next[latest.email] || {}),
                    ...latest,
                    isOnline: true,
                    lastPing: Date.now()
                  };
                }
              }
            });

            // 2. Socios no conectados en la red Supabase (salvo el usuario local actual)
            const knownPartnerEmails = [
              'barrientoso2401@gmail.com',
              'fernandoaraujo1912@gmail.com',
              'sebastiansbs51@gmail.com'
            ];
            knownPartnerEmails.forEach(email => {
              if (email !== currentEmail && !activePresenceKeys.includes(email)) {
                if (next[email]) {
                  next[email] = {
                    ...next[email],
                    isOnline: false,
                    isTimerRunning: false
                  };
                }
              }
            });

            // 3. El socio local logueado siempre está online
            if (currentEmail && next[currentEmail]) {
              next[currentEmail] = {
                ...next[currentEmail],
                isOnline: true,
                lastPing: Date.now()
              };
            }

            try {
              localStorage.setItem('seram_partners_presence', JSON.stringify(next));
            } catch (_) {}
            return next;
          });
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (Array.isArray(newPresences) && newPresences.length > 0) {
          const latest = newPresences[0];
          if (latest && latest.email) {
            setPartnerPresences(prev => {
              const updated = {
                ...prev,
                [latest.email]: {
                  ...(prev[latest.email] || {}),
                  ...latest,
                  isOnline: true,
                  lastPing: Date.now()
                }
              };
              try {
                localStorage.setItem('seram_partners_presence', JSON.stringify(updated));
              } catch (_) {}
              return updated;
            });
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (Array.isArray(leftPresences) && leftPresences.length > 0) {
          const left = leftPresences[0];
          if (left && left.email && left.email !== currentEmail) {
            setPartnerPresences(prev => {
              const updated = {
                ...prev,
                [left.email]: {
                  ...(prev[left.email] || {}),
                  isOnline: false,
                  isTimerRunning: false,
                  lastPing: Date.now()
                }
              };
              try {
                localStorage.setItem('seram_partners_presence', JSON.stringify(updated));
              } catch (_) {}
              return updated;
            });
          }
        }
      })
      .on('broadcast', { event: 'partner_presence_update' }, ({ payload }) => {
        if (payload && payload.email) {
          setPartnerPresences(prev => {
            const updated = {
              ...prev,
              [payload.email]: {
                ...(prev[payload.email] || {}),
                ...payload.data,
                lastPing: Date.now()
              }
            };
            try {
              localStorage.setItem('seram_partners_presence', JSON.stringify(updated));
            } catch (_) {}
            return updated;
          });
        }
      })
      .on('broadcast', { event: 'partner_timer_tick' }, ({ payload }) => {
        if (payload && payload.email) {
          setPartnerPresences(prev => {
            const current = prev[payload.email];
            if (!current) return prev;
            return {
              ...prev,
              [payload.email]: {
                ...current,
                isTimerRunning: payload.isTimerRunning,
                timerSeconds: payload.timerSeconds,
                lastPing: Date.now()
              }
            };
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && activeRole === 'AdminMod' && currentEmail) {
          const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
          const initialData = {
            email: currentEmail,
            name: currentSocio?.name || 'Socio Directivo',
            role: currentSocio?.role || 'Socio Fundador',
            isOnline: true,
            sessionStart: Date.now(),
            lastPing: Date.now(),
            currentRoomId: activeTimer.sectorId || 'direction',
            currentSectorName: activeTimer.sectorName || '02. DIRECCIÓN',
            roomCoords: DEFAULT_OFFICE_ROOMS[activeTimer.sectorId]?.coords || { x: 35, y: 35 },
            isTimerRunning: activeTimer.isRunning,
            timerSeconds: activeTimer.seconds,
            timerStartedAt: activeTimer.startedAt,
            activeTaskId: activeTimer.projectId,
            activeTaskTitle: activeTimer.projectTitle,
            device: isMobile ? 'Dispositivo Móvil (Android)' : 'Escritorio (Web)',
            location: 'La Paz, Bolivia'
          };
          try {
            await channel.track(initialData);
          } catch (e) {
            console.warn('[Supabase Presence Track Warning]:', e.message);
          }
        }
      });

    return () => {
      if (channel) {
        try {
          channel.untrack();
          supabase.removeChannel(channel);
        } catch (_) {}
      }
      if (supabaseChannelRef.current === channel) {
        supabaseChannelRef.current = null;
      }
    };
  }, [activeRole, currentSocio?.email]);

  // Mantener actualizado el estado del socio activo y heartbeat de presencia y timer
  useEffect(() => {
    if (activeRole === 'AdminMod') {
      const email = currentSocio?.email || 'barrientoso2401@gmail.com';
      const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
      
      const payloadData = {
        name: currentSocio?.name || 'Socio Directivo',
        role: currentSocio?.role || 'Socio Fundador Directivo',
        isOnline: true,
        lastLogin: new Date().toISOString(),
        sessionStart: Date.now(),
        lastPing: Date.now(),
        currentRoomId: activeTimer.sectorId || 'direction',
        currentSectorName: activeTimer.sectorName || '02. DIRECCIÓN',
        roomCoords: DEFAULT_OFFICE_ROOMS[activeTimer.sectorId]?.coords || { x: 35, y: 35 },
        isTimerRunning: activeTimer.isRunning,
        timerSeconds: activeTimer.seconds,
        timerStartedAt: activeTimer.startedAt,
        activeTaskId: activeTimer.projectId,
        activeTaskTitle: activeTimer.projectTitle,
        device: isMobile ? 'Dispositivo Móvil (Android)' : 'Escritorio (Web)',
        location: 'Bolivia'
      };

      setPartnerPresences(prev => {
        const entry = prev[email] || {};
        const updated = {
          ...prev,
          [email]: {
            ...entry,
            ...payloadData
          }
        };
        try {
          localStorage.setItem('seram_partners_presence', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      // Emitir por BroadcastChannel local multi-pestaña
      if (broadcastChan) {
        try {
          broadcastChan.postMessage({
            type: 'PARTNER_PRESENCE_UPDATE',
            payload: { email, data: payloadData }
          });
        } catch (_) {}
      }

      // Emitir por Supabase Realtime a otros navegadores/dispositivos
      if (supabaseChannelRef.current) {
        try {
          supabaseChannelRef.current.send({
            type: 'broadcast',
            event: 'partner_presence_update',
            payload: { email, data: payloadData }
          });
          supabaseChannelRef.current.track({
            ...payloadData,
            email
          });
        } catch (_) {}
      }

      // Heartbeat periódico (cada 3s si el cronómetro está corriendo, cada 12s si no)
      const heartbeatInterval = setInterval(() => {
        if (broadcastChan) {
          try {
            broadcastChan.postMessage({
              type: 'PARTNER_TIMER_TICK',
              payload: {
                email,
                isTimerRunning: activeTimer.isRunning,
                timerSeconds: activeTimer.seconds
              }
            });
          } catch (_) {}
        }
        if (supabaseChannelRef.current) {
          try {
            supabaseChannelRef.current.send({
              type: 'broadcast',
              event: 'partner_timer_tick',
              payload: {
                email,
                isTimerRunning: activeTimer.isRunning,
                timerSeconds: activeTimer.seconds
              }
            });
          } catch (_) {}
        }
      }, activeTimer.isRunning ? 3000 : 12000);

      return () => clearInterval(heartbeatInterval);
    }
  }, [activeRole, currentSocio, activeTimer.isRunning, activeTimer.sectorId, activeTimer.sectorName, broadcastChan]);

  // --- PRODUCTS (mutable) ---
  const [productList, setProductList] = useState([
    { id: 11, name: 'Compostera Doméstica *Lombri-Kit*', price: 85, category: 'Bio-Insumos', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400', desc: 'Kit de compostaje con núcleo de *lombrices rojas californianas* y manual de *bio-huerto*.', stock: 35, isPremium: false },
    { id: 12, name: 'Kit Analítico de *Calidad de Agua*', price: 120, category: 'Monitoreo', image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=400', desc: 'Medidores digitales portátiles de pH, TDS y reactivos químicos para *análisis rápido de agua*.', stock: 15, isPremium: true },
    { id: 13, name: 'Ebook: Guía Práctica de la Ley 1333', price: 15, category: 'E-Books', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=400', desc: 'Versión digital en PDF del compendio interpretado de legislación boliviana. Desbloquea lectura en Academy.', stock: 9999, isPremium: false, courseId: 5 },
    { id: 14, name: 'QGIS Geo-Database Bolivia (Zonificación)', price: 95, category: 'SIG & Mapas', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=400', desc: 'Capas vectoriales listas (SHP/GPKG) de *áreas protegidas*, hidrografía y suelos de Bolivia.', stock: 50, isPremium: true },
    { id: 15, name: 'Bolsa Ecológica Reutilizable SERAM', price: 8, category: 'Merchandise', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=400', desc: '*Yute natural* de alta densidad para compras conscientes.', stock: 200, isPremium: false },
    { id: 16, name: 'Ebook: Técnicas de *Restauración Ecológica*', price: 18, category: 'E-Books', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=400', desc: 'Guía práctica ilustrada de *restauración ecológica* y remediación forestal aplicada. Desbloquea contenido.', stock: 9999, isPremium: false },
  ]);

  // --- MODALS ---
  const [showPremiumRegisterModal, setShowPremiumRegisterModal] = useState(false);
  const [showPremiumBlockedModal, setShowPremiumBlockedModal] = useState(false);
  const [blockedItemName, setBlockedItemName] = useState('');

  // --- TOAST ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // --- DERIVED STATE ---
  const currentUser = registeredUsers.find(u => u.email.toLowerCase() === currentUserEmail.toLowerCase());
  const isPremiumUser = currentUser?.isPremiumApproved || false;
  const hasPremiumAccess = activeRole === 'AdminMod' || (isRegistered && isPremiumUser);

  // --- LOGO CLICK TIMER ---
  useEffect(() => {
    if (logoClicks > 0) {
      const timer = setTimeout(() => setLogoClicks(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClicks]);

  // --- AUTH REAL SUPABASE LISTENERS ---
  useEffect(() => {
    const syncUser = (user) => {
      if (!user) return;
      setRegisteredUsers(prev => {
        const exists = prev.some(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (!exists) {
          return [...prev, {
            email: user.email,
            role: 'AccessLimit',
            name: user.user_metadata?.name || 'Usuario Registrado',
            isPremiumApproved: false
          }];
        }
        return prev;
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        setIsRegistered(true);
        setCurrentUserEmail(session.user.email);
        syncUser(session.user);
        fetchProgressData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        setIsRegistered(true);
        setCurrentUserEmail(session.user.email);
        syncUser(session.user);
        fetchProgressData(session.user.id);
      } else {
        setIsRegistered(false);
        setCurrentUserEmail('');
        setCompletedLessons({});
        setCourseExamsApproved({});
        setCourseAssignments({});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- LOAD DATA FROM SUPABASE CONCURRENTLY WITH INSTANT RESILIENT FALLBACK ---
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 7000));
        const fetchPromise = Promise.allSettled([
          supabase.from('courses').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('products').select('*'),
          supabase.from('time_logs').select('*').order('id', { ascending: false }),
          supabase.from('clients').select('*'),
          supabase.from('activities').select('*')
        ]);
        const results = await Promise.race([fetchPromise, timeoutPromise]);
        const [coursesRes, projectsRes, productsRes, logsRes, clientsRes, activitiesRes] = results;

        // 1. Courses (Fusión inteligente: nunca sobreescribir ni borrar cursos locales o subidos)
        if (coursesRes.status === 'fulfilled' && !coursesRes.value.error && coursesRes.value.data?.length > 0) {
          const mappedCourses = coursesRes.value.data.map(c => ({
            id: c.id,
            title: c.title,
            instructor: c.instructor,
            students: c.students || 0,
            status: c.status || 'Activo',
            isPremium: c.is_premium ?? false,
            type: c.type || 'mid_ticket',
            format: c.format || (c.duration && /pdf|dossier|pág|pag/i.test(c.duration) ? 'pdf' : (c.has_video === false ? 'pdf' : undefined)),
            hasVideo: c.has_video !== undefined ? c.has_video : (c.duration && /pdf|dossier|pág|pag/i.test(c.duration) ? false : undefined),
            price: parseFloat(c.price) || 0,
            image: c.image || '/assets/3d-backend/gis_satellite_mapping.webp',
            duration: c.duration || '10 horas',
            desc: c.desc || c.description || '',
            pdfUrl: c.pdf_url || c.pdfUrl || null,
            pdfName: c.pdf_name || c.pdfName || null,
            pages: c.pages || null,
            version: c.version || null
          }));
          setCourses(prev => {
            const map = new Map();
            DEFAULT_COURSES_CATALOG.forEach(dc => map.set(dc.id, dc));
            prev.forEach(p => map.set(p.id, { ...(map.get(p.id) || {}), ...p }));

            mappedCourses.forEach(rc => {
              // Buscar coincidencia por ID o por Título normalizado
              let targetKey = rc.id;
              for (const [key, val] of map.entries()) {
                if (val.id === rc.id || (val.title && rc.title && val.title.trim().toLowerCase() === rc.title.trim().toLowerCase())) {
                  targetKey = key;
                  break;
                }
              }
              const existing = map.get(targetKey) || {};
              const resolvedFormat = rc.format || existing.format || (rc.hasVideo === false || existing.hasVideo === false ? 'pdf' : (rc.type === 'gratis' ? 'pdf' : 'video'));
              const resolvedHasVideo = rc.hasVideo !== undefined ? rc.hasVideo : (existing.hasVideo !== undefined ? existing.hasVideo : resolvedFormat !== 'pdf');

              const mergedCourse = {
                ...existing,
                ...rc,
                id: targetKey,
                // Preservar metadatos ricos locales si columnas de BD vienen vacías
                format: resolvedFormat,
                hasVideo: resolvedHasVideo,
                pages: rc.pages || existing.pages || (resolvedFormat === 'pdf' ? 120 : null),
                version: rc.version || existing.version || 'Edición 2026',
                sections: existing.sections || rc.sections || [
                  { title: 'Capítulo I: Marco Regulatorio General y Principios' },
                  { title: 'Capítulo II: Instrumentos de Regulación de Alcance Particular' },
                  { title: 'Capítulo III: Formularios Técnicos y Guías de Campo' },
                  { title: 'Capítulo IV: Modelos de Declaración Jurada y Anexos' }
                ],
                pdfUrl: rc.pdfUrl || existing.pdfUrl || '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf',
                pdfName: rc.pdfName || existing.pdfName || 'Documento_Oficial_SERAM.pdf'
              };
              map.set(targetKey, mergedCourse);
            });

            const merged = Array.from(map.values());
            saveCoursesToStorage(merged);
            return merged;
          });
        }

        // 2. Projects
        if (projectsRes.status === 'fulfilled' && !projectsRes.value.error && projectsRes.value.data?.length > 0) {
          const mappedProjects = projectsRes.value.data.map(p => ({
            id: p.id,
            code: p.code || `SRM-2026-B2B-${p.id}`,
            client: p.client || p.title,
            clientId: p.client_id || null,
            type: p.type || p.title,
            progress: p.progress_percent !== undefined ? p.progress_percent : (p.progress || 0),
            lead: p.lead || 'Ing. Diego Barrientos',
            startDate: p.start_date || p.startDate,
            endDate: p.end_date || p.endDate,
            involved: p.involved || [],
            location: p.location || '',
            description: p.description || '',
            budget: parseFloat(p.budget) || 0,
            labCosts: parseFloat(p.lab_costs || p.labCosts) || 0,
            subcontractorCosts: parseFloat(p.subcontractor_costs || p.subcontractorCosts) || 0,
            taxRegime: p.tax_regime || p.taxRegime || 'Régimen General',
            pdfUrl: p.pdf_url || p.pdfUrl || null,
            pdfName: p.pdf_name || p.pdfName || null,
            isProposal: Boolean(p.is_proposal || p.isProposal || p.tag === 'Propuesta'),
            tag: p.tag || (p.is_proposal || p.isProposal ? 'Propuesta' : 'Proyecto B2B')
          }));
          setActiveServices(mappedProjects);
        }

        // 3. Products
        if (productsRes.status === 'fulfilled' && !productsRes.value.error && productsRes.value.data?.length > 0) {
          const mappedProducts = productsRes.value.data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            image: p.image,
            desc: p.desc || p.description || '',
            stock: p.stock || 0,
            isPremium: p.is_premium ?? p.isPremium ?? false,
            courseId: p.course_id || p.courseId || null
          }));
          setProductList(mappedProducts);
        }

        // 4. Time Logs
        if (logsRes.status === 'fulfilled' && !logsRes.value.error && logsRes.value.data?.length > 0) {
          const mappedLogs = logsRes.value.data.map(l => ({
            id: l.id,
            partner_id: l.partner_id,
            partner_name: l.partner_name || 'Socio directivo',
            project_id: l.project_id,
            project_title: l.project_title || 'Proyecto General',
            hours: parseFloat(l.hours) || 0,
            description: l.description || '',
            logged_at: l.logged_at
          }));
          setTimeLogs(mappedLogs);
          try {
            localStorage.setItem('seram_time_logs', JSON.stringify(mappedLogs));
          } catch (_) {}
        }

        // 5. Clients (Directorio de Clientes de SERAM)
        if (clientsRes.status === 'fulfilled' && !clientsRes.value.error && clientsRes.value.data?.length > 0) {
          const mappedClients = clientsRes.value.data.map(cl => ({
            id: cl.id,
            name: cl.name,
            type: cl.type || 'Municipal / Público',
            contactPerson: cl.contact_person,
            contactPhone: cl.contact_phone,
            contactEmail: cl.contact_email,
            location: cl.location || '',
            notes: cl.notes || ''
          }));
          setClients(mappedClients);
        }

        // 6. Activities (Central de Actividades Claves de Socios)
        if (activitiesRes.status === 'fulfilled' && !activitiesRes.value.error && activitiesRes.value.data?.length > 0) {
          const mappedActivities = activitiesRes.value.data.map(act => ({
            id: act.id,
            title: act.title,
            description: act.description || '',
            projectId: act.project_id,
            projectTitle: act.project_title || 'Proyecto General',
            assignedPartner: act.assigned_partner || 'Ing. Diego Barrientos',
            assignedPartnerEmail: act.assigned_partner_email || '',
            category: act.category || 'Consultoría Técnica',
            status: act.status || 'En curso',
            priority: act.priority || 'Media',
            dueDate: act.due_date,
            estimatedHours: parseFloat(act.estimated_hours) || 0,
            actualHours: parseFloat(act.actual_hours) || 0,
            deliverableUrl: act.deliverable_url || null,
            deliverableName: act.deliverable_name || null
          }));
          setActivities(mappedActivities);
        }
      } catch (err) {
        console.warn('[Supabase AppContext Pull Warning]: Red/DNS no disponible. Usando catálogo local mock.', err.message);
      }
    }
    loadDataFromSupabase();

    // Suscripción Realtime para actividades, proyectos, cursos y time_logs en tiempo real
    const channel = supabase.channel('seram-portal-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_logs' }, () => {
        loadDataFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- AUTOMATIC PERSISTENCE TO LOCALSTORAGE ---
  useEffect(() => {
    try {
      if (courses && courses.length > 0) {
        localStorage.setItem('seram_courses', JSON.stringify(courses));
      }
    } catch (e) {
      console.warn('Could not save courses to localStorage', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      if (activeServices && activeServices.length > 0) {
        localStorage.setItem('seram_active_services', JSON.stringify(activeServices));
      }
    } catch (e) {
      console.warn('Could not save activeServices to localStorage', e);
    }
  }, [activeServices]);

  useEffect(() => {
    try {
      if (clients && clients.length > 0) {
        localStorage.setItem('seram_clients', JSON.stringify(clients));
      }
    } catch (e) {
      console.warn('Could not save clients to localStorage', e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      if (activities && activities.length > 0) {
        localStorage.setItem('seram_activities', JSON.stringify(activities));
      }
    } catch (e) {
      console.warn('Could not save activities to localStorage', e);
    }
  }, [activities]);

  useEffect(() => {
    try {
      if (prospects && prospects.length > 0) {
        localStorage.setItem('seram_prospects', JSON.stringify(prospects));
      }
    } catch (e) {
      console.warn('Could not save prospects to localStorage', e);
    }
  }, [prospects]);

  useEffect(() => {
    try {
      if (timeLogs && timeLogs.length > 0) {
        localStorage.setItem('seram_time_logs', JSON.stringify(timeLogs));
      }
    } catch (e) {
      console.warn('Could not save timeLogs to localStorage', e);
    }
  }, [timeLogs]);

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);
    if (nextClicks < 5) {
      triggerToast(`Acceso Directivo: Click ${nextClicks}/5`, 'info');
    } else {
      setShowSecretModal(true);
      setLogoClicks(0);
      triggerToast('¡Acceso al portal secreto activado!', 'success');
    }
  };

  // --- HANDLERS ---
  const handlePartnerLogin = (e, customPassword = null, customIndex = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const pwd = (customPassword !== null ? customPassword : secretPassword || '').trim().toLowerCase();
    const idx = customIndex !== null ? customIndex : selectedPartnerIndex;
    
    if (pwd === 'seram2026' || pwd === 'socio2026') {
      const partnersList = registeredUsers.filter(u => u.role === 'AdminMod');
      const partner = partnersList[idx] || partnersList[0];
      if (partner) {
        setActiveRole('AdminMod');
        setCurrentSocio(partner);
        setShowSecretModal(false);
        setShowSecretPortal(false);
        setSecretPassword('');
        try {
          sessionStorage.setItem('seram_partner_role', 'AdminMod');
          sessionStorage.setItem('seram_current_socio', JSON.stringify(partner));
          localStorage.removeItem('seram_partner_role');
          localStorage.removeItem('seram_current_socio');
        } catch (_) {
          // Ignorar error de almacenamiento
        }
        triggerToast(`¡Bienvenido, ${partner.name}! Acceso al Dashboard Directivo.`, 'success');
        return { success: true, partner };
      }
    } else {
      triggerToast('Contraseña incorrecta. Acceso denegado.', 'error');
    }
    return { success: false };
  };

  const handleRegisterSupabase = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || 'Usuario Registrado'
          }
        }
      });
      if (error) throw error;
      triggerToast('Registro exitoso. Revisa tu correo para verificar tu cuenta.', 'success');
      return { success: true, data };
    } catch (err) {
      triggerToast(`Error al registrarse: ${err.message}`, 'error');
      return { success: false, error: err };
    }
  };

  const handleLoginSupabase = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      triggerToast('Sesión iniciada correctamente.', 'success');
      return { success: true, data };
    } catch (err) {
      triggerToast(`Error de acceso: ${err.message}`, 'error');
      return { success: false, error: err };
    }
  };

  const handleLogoutPublic = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      triggerToast('Sesión cerrada.', 'info');
    } catch (err) {
      triggerToast(`Error al cerrar sesión: ${err.message}`, 'error');
    }
  };

  // --- ACADEMY DATA MUTATORS ---
  const fetchProgressData = async (userId) => {
    try {
      // 1. Lecciones completadas
      const { data: lessonData, error: lessonError } = await supabase
        .from('lesson_progress')
        .select('course_id, lesson_id')
        .eq('user_id', userId)
        .eq('completed', true);
      
      if (lessonError) {
        if (lessonError.code === 'PGRST205') {
          const localProgress = localStorage.getItem(`completed_lessons_${userId}`);
          if (localProgress) setCompletedLessons(JSON.parse(localProgress));
        } else {
          throw lessonError;
        }
      } else if (lessonData) {
        const grouped = {};
        lessonData.forEach(item => {
          if (!grouped[item.course_id]) grouped[item.course_id] = [];
          grouped[item.course_id].push(item.lesson_id);
        });
        setCompletedLessons(grouped);
      }

      // 2. Exámenes aprobados
      const { data: examData, error: examError } = await supabase
        .from('course_exams')
        .select('course_id, approved')
        .eq('user_id', userId);
      
      if (examError) {
        if (examError.code === 'PGRST205') {
          const localExams = localStorage.getItem(`exams_approved_${userId}`);
          if (localExams) setCourseExamsApproved(JSON.parse(localExams));
        } else {
          throw examError;
        }
      } else if (examData) {
        const approvedMap = {};
        examData.forEach(item => {
          approvedMap[item.course_id] = item.approved;
        });
        setCourseExamsApproved(approvedMap);
      }

      // 3. Tareas entregadas
      const { data: assData, error: assError } = await supabase
        .from('course_assignments')
        .select('course_id, file_name, submitted_at')
        .eq('user_id', userId);
      
      if (assError) {
        if (assError.code === 'PGRST205') {
          const localAss = localStorage.getItem(`assignments_${userId}`);
          if (localAss) setCourseAssignments(JSON.parse(localAss));
        } else {
          throw assError;
        }
      } else if (assData) {
        const assMap = {};
        assData.forEach(item => {
          assMap[item.course_id] = { fileName: item.file_name, submittedAt: item.submitted_at };
        });
        setCourseAssignments(assMap);
      }
    } catch (err) {
      console.warn('Error fetching progress data:', err.message);
    }
  };

  const toggleLessonCompleted = async (courseId, lessonId) => {
    const userId = supabaseUser?.id || 'guest';

    setCompletedLessons(prev => {
      const current = prev[courseId] || [];
      let updated;
      if (current.includes(lessonId)) {
        updated = current.filter(id => id !== lessonId);
      } else {
        updated = [...current, lessonId];
      }
      const newProgress = { ...prev, [courseId]: updated };
      localStorage.setItem(`completed_lessons_${userId}`, JSON.stringify(newProgress));
      return newProgress;
    });

    if (supabaseUser) {
      try {
        const alreadyCompleted = completedLessons[courseId]?.includes(lessonId) || false;
        if (alreadyCompleted) {
          const { error } = await supabase
            .from('lesson_progress')
            .delete()
            .eq('user_id', supabaseUser.id)
            .eq('course_id', courseId)
            .eq('lesson_id', lessonId);
          if (error && error.code !== 'PGRST205') throw error;
        } else {
          const { error } = await supabase
            .from('lesson_progress')
            .upsert({
              user_id: supabaseUser.id,
              course_id: courseId,
              lesson_id: lessonId,
              completed: true
            });
          if (error && error.code !== 'PGRST205') throw error;
        }
      } catch (err) {
        console.warn('[Supabase Sync Warning - LessonProgress]:', err.message);
      }
    }
  };

  const approveCourseExam = async (courseId) => {
    const userId = supabaseUser?.id || 'guest';
    setCourseExamsApproved(prev => {
      const newMap = { ...prev, [courseId]: true };
      localStorage.setItem(`exams_approved_${userId}`, JSON.stringify(newMap));
      return newMap;
    });

    if (supabaseUser) {
      try {
        const { error } = await supabase
          .from('course_exams')
          .upsert({
            user_id: supabaseUser.id,
            course_id: courseId,
            approved: true
          });
        if (error && error.code !== 'PGRST205') throw error;
      } catch (err) {
        console.warn('[Supabase Sync Warning - CourseExam]:', err.message);
      }
    }
  };

  const submitAssignment = async (courseId, fileName) => {
    const userId = supabaseUser?.id || 'guest';
    const submittedAt = new Date().toISOString();
    
    setCourseAssignments(prev => {
      const newMap = { ...prev, [courseId]: { fileName, submittedAt } };
      localStorage.setItem(`assignments_${userId}`, JSON.stringify(newMap));
      return newMap;
    });

    if (supabaseUser) {
      try {
        const { error } = await supabase
          .from('course_assignments')
          .upsert({
            user_id: supabaseUser.id,
            course_id: courseId,
            file_name: fileName,
            submitted_at: submittedAt
          });
        if (error && error.code !== 'PGRST205') throw error;
      } catch (err) {
        console.warn('[Supabase Sync Warning - CourseAssignment]:', err.message);
      }
    }
  };

  const handleRegister = (e, nameValue) => {
    e.preventDefault();
    if (!registerEmail) return;
    const name = nameValue || 'Nuevo Usuario';
    const isNew = !registeredUsers.some(u => u.email.toLowerCase() === registerEmail.toLowerCase());
    if (isNew) {
      setRegisteredUsers(prev => [...prev, { email: registerEmail, role: 'AccessLimit', name, isPremiumApproved: false }]);
    }
    setIsRegistered(true);
    setCurrentUserEmail(registerEmail);
    triggerToast('¡Registro exitoso! Ya puedes explorar la plataforma.', 'success');
  };

  const handleAccessItem = (item, type, onSuccess) => {
    if (activeRole === 'AdminMod') { onSuccess && onSuccess(); return; }
    if (!isRegistered) { setShowPremiumRegisterModal(true); return; }
    if (item.isPremium && !isPremiumUser) {
      setBlockedItemName(type === 'course' ? item.title : item.name);
      setShowPremiumBlockedModal(true);
      return;
    }
    onSuccess && onSuccess();
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    triggerToast(`${product.name} añadido al carrito`, 'success');
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    triggerToast('Producto eliminado del carrito', 'info');
  };

  const handleCheckout = () => {
    setCart([]);
    setShowCart(false);
    triggerToast('¡Compra procesada! Se enviará la factura a tu correo.', 'success');
  };

  const handleAddCourse = async (courseData) => {
    if (!courseData.title || !courseData.instructor) return;
    const isPdfFormat = courseData.format === 'pdf' || courseData.hasVideo === false || (courseData.type === 'gratis' && !courseData.videoUrl);
    const newCourse = { 
      id: courseData.id || Date.now(), 
      title: courseData.title, 
      instructor: courseData.instructor, 
      students: courseData.students || 0, 
      status: 'Activo', 
      isPremium: courseData.isPremium !== undefined ? courseData.isPremium : (courseData.type !== 'gratis'),
      type: courseData.type || 'mid_ticket',
      format: isPdfFormat ? 'pdf' : 'video',
      hasVideo: !isPdfFormat,
      price: parseFloat(courseData.price) || 0,
      image: courseData.image || (isPdfFormat ? '/assets/covers/cover_ebook_ley1333.png' : '/assets/3d-backend/gis_satellite_mapping.webp'),
      duration: courseData.duration || (isPdfFormat ? 'Dossier Descargable (PDF)' : '10 horas prácticas'),
      desc: courseData.desc || '',
      pdfUrl: courseData.pdfUrl || '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf',
      pdfName: courseData.pdfName || 'Documento_Oficial_SERAM_2026.pdf',
      pages: courseData.pages || (isPdfFormat ? 120 : null),
      version: courseData.version || 'Norma 2026 Vigente',
      sections: courseData.sections || [
        { title: 'Módulo 1: Marco Conceptual y Normativa Vigente' },
        { title: 'Módulo 2: Procedimiento Técnico y Metodología Aplicada' },
        { title: 'Módulo 3: Formulación de Resultados y Casos Prácticos' },
        { title: 'Módulo 4: Anexos y Guías de Implementación' }
      ]
    };

    setCourses(prev => {
      const updated = [newCourse, ...prev.filter(c => c.id !== newCourse.id)];
      saveCoursesToStorage(updated);
      return updated;
    });
    triggerToast(`Recurso registrado (${isPdfFormat ? 'Modalidad Entregable PDF' : 'Modalidad Video HD'})`, 'success');

    try {
      const dbPdfUrl = (typeof newCourse.pdfUrl === 'string' && newCourse.pdfUrl.startsWith('data:')) 
        ? '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf' 
        : newCourse.pdfUrl;

      const { data, error } = await supabase.from('courses').insert([{
        title: newCourse.title,
        instructor: newCourse.instructor,
        students: 0,
        status: 'Activo',
        is_premium: newCourse.isPremium,
        type: newCourse.type,
        price: newCourse.price,
        image: newCourse.image,
        duration: newCourse.duration,
        desc: newCourse.desc,
        pdf_url: dbPdfUrl,
        pdf_name: newCourse.pdfName
      }]).select();

      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Insert Course Warning]:', error.message);
      } else if (data && data[0]?.id) {
        setCourses(prev => {
          const updated = prev.map(c => c.id === newCourse.id ? { ...c, id: data[0].id } : c);
          saveCoursesToStorage(updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - AddCourse]:', err.message);
    }
  };

  const handleUpdateCourse = async (id, fields) => {
    setCourses(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...fields } : c);
      saveCoursesToStorage(updated);
      return updated;
    });
    triggerToast('Recurso académico actualizado', 'success');

    try {
      const dbFields = {};
      if (fields.title !== undefined) dbFields.title = fields.title;
      if (fields.instructor !== undefined) dbFields.instructor = fields.instructor;
      if (fields.isPremium !== undefined) dbFields.is_premium = fields.isPremium;
      if (fields.type !== undefined) dbFields.type = fields.type;
      if (fields.price !== undefined) dbFields.price = fields.price;
      if (fields.image !== undefined) dbFields.image = fields.image;
      if (fields.duration !== undefined) dbFields.duration = fields.duration;
      if (fields.desc !== undefined) dbFields.desc = fields.desc;
      if (fields.pdfUrl !== undefined) {
        dbFields.pdf_url = (typeof fields.pdfUrl === 'string' && fields.pdfUrl.startsWith('data:'))
          ? '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf'
          : fields.pdfUrl;
      }
      if (fields.pdfName !== undefined) dbFields.pdf_name = fields.pdfName;

      const { error } = await supabase.from('courses').update(dbFields).eq('id', id);
      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Update Course Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - UpdateCourse]:', err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    setCourses(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveCoursesToStorage(updated);
      return updated;
    });
    triggerToast('Curso eliminado correctamente', 'info');

    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - DeleteCourse]:', err.message);
    }
  };

  const handleToggleCoursePremium = async (id) => {
    let updatedCourse = null;
    setCourses(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          updatedCourse = { ...c, isPremium: !c.isPremium };
          return updatedCourse;
        }
        return c;
      });
      saveCoursesToStorage(updated);
      return updated;
    });
    triggerToast(`Membresía ${updatedCourse?.isPremium ? 'habilitada' : 'deshabilitada'}`, 'info');

    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_premium: updatedCourse?.isPremium })
        .eq('id', id);
      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Toggle Course Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - ToggleCoursePremium]:', err.message);
    }
  };

  const handleAddProject = async (
    clientOrObj,
    type,
    lead,
    startDate,
    endDate,
    involved = [],
    budget = 0,
    labCosts = 0,
    subcontractorCosts = 0,
    taxRegime = 'Régimen General',
    location = '',
    description = '',
    pdfUrl = null,
    pdfName = null,
    code = null
  ) => {
    let projData;
    if (typeof clientOrObj === 'object' && clientOrObj !== null) {
      projData = clientOrObj;
    } else {
      projData = {
        client: clientOrObj,
        type,
        lead,
        startDate,
        endDate,
        involved,
        budget,
        labCosts,
        subcontractorCosts,
        taxRegime,
        location,
        description,
        pdfUrl,
        pdfName,
        code
      };
    }

    const generatedCode = projData.code || `SRM-2026-B2B-${String(activeServices.length + 1).padStart(2, '0')}`;
    const newProj = {
      id: Date.now(),
      code: generatedCode,
      client: projData.client,
      type: projData.type,
      progress: projData.progress !== undefined ? projData.progress : 10,
      lead: projData.lead || currentSocio?.name || 'Ing. Diego Barrientos',
      location: projData.location || '',
      description: projData.description || '',
      startDate: projData.startDate || new Date().toISOString().split('T')[0],
      endDate: projData.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      involved: Array.isArray(projData.involved) ? projData.involved : [projData.lead || 'Ing. Diego Barrientos'],
      budget: parseFloat(projData.budget) || 0,
      labCosts: parseFloat(projData.labCosts) || 0,
      subcontractorCosts: parseFloat(projData.subcontractorCosts) || 0,
      taxRegime: projData.taxRegime || 'Régimen General',
      pdfUrl: projData.pdfUrl || null,
      pdfName: projData.pdfName || null,
      isProposal: Boolean(projData.isProposal || projData.tag === 'Propuesta'),
      tag: projData.tag || (projData.isProposal ? 'Propuesta' : 'Proyecto B2B')
    };

    setActiveServices(prev => [...prev, newProj]);
    triggerToast('Proyecto registrado correctamente', 'success');

    try {
      const { data, error } = await supabase.from('projects').insert([{
        client: newProj.client,
        type: newProj.type,
        progress_percent: newProj.progress,
        lead: newProj.lead,
        start_date: newProj.startDate,
        end_date: newProj.endDate,
        involved: newProj.involved,
        budget: newProj.budget,
        lab_costs: newProj.labCosts,
        subcontractor_costs: newProj.subcontractorCosts,
        tax_regime: newProj.taxRegime,
        location: newProj.location,
        description: newProj.description,
        pdf_url: newProj.pdfUrl,
        pdf_name: newProj.pdfName,
        code: newProj.code
      }]).select();

      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Insert Project Warning]:', error.message);
      } else if (data && data[0]?.id) {
        setActiveServices(prev => prev.map(p => p.id === newProj.id ? { ...p, id: data[0].id } : p));
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - AddProject]:', err.message);
    }
  };

  const handleUpdateProjectProgress = async (id) => {
    let updatedProj = null;
    setActiveServices(prev => prev.map(p => {
      if (p.id === id) {
        updatedProj = { ...p, progress: Math.min(p.progress + 10, 100) };
        return updatedProj;
      }
      return p;
    }));

    try {
      if (updatedProj) {
        const { error } = await supabase
          .from('projects')
          .update({ progress_percent: updatedProj.progress })
          .eq('id', id);
        if (error && error.code !== 'PGRST205') {
          throw error;
        }
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - UpdateProjectProgress]:', err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    setActiveServices(prev => prev.filter(p => p.id !== id));
    triggerToast('Proyecto eliminado del monitor', 'info');

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - DeleteProject]:', err.message);
    }
  };

  const handleEditProject = async (id, updatedFields) => {
    let updatedProj = null;
    setActiveServices(prev => prev.map(p => {
      if (p.id === id) {
        updatedProj = { ...p, ...updatedFields };
        return updatedProj;
      }
      return p;
    }));
    triggerToast('Proyecto actualizado correctamente', 'success');

    try {
      if (updatedProj) {
        const dbFields = {};
        if (updatedFields.client !== undefined) dbFields.client = updatedFields.client;
        if (updatedFields.type !== undefined) dbFields.type = updatedFields.type;
        if (updatedFields.lead !== undefined) dbFields.lead = updatedFields.lead;
        if (updatedFields.startDate !== undefined) dbFields.start_date = updatedFields.startDate;
        if (updatedFields.endDate !== undefined) dbFields.end_date = updatedFields.endDate;
        if (updatedFields.progress !== undefined) dbFields.progress_percent = updatedFields.progress;
        if (updatedFields.involved !== undefined) dbFields.involved = updatedFields.involved;
        if (updatedFields.budget !== undefined) dbFields.budget = parseFloat(updatedFields.budget);
        if (updatedFields.labCosts !== undefined) dbFields.lab_costs = parseFloat(updatedFields.labCosts);
        if (updatedFields.subcontractorCosts !== undefined) dbFields.subcontractor_costs = parseFloat(updatedFields.subcontractorCosts);
        if (updatedFields.taxRegime !== undefined) dbFields.tax_regime = updatedFields.taxRegime;
        if (updatedFields.location !== undefined) dbFields.location = updatedFields.location;
        if (updatedFields.description !== undefined) dbFields.description = updatedFields.description;
        if (updatedFields.pdfUrl !== undefined) dbFields.pdf_url = updatedFields.pdfUrl;
        if (updatedFields.pdfName !== undefined) dbFields.pdf_name = updatedFields.pdfName;
        if (updatedFields.code !== undefined) dbFields.code = updatedFields.code;

        const { error } = await supabase
          .from('projects')
          .update(dbFields)
          .eq('id', id);
        if (error && error.code !== 'PGRST205') {
          console.warn('[Supabase Update Project Warning]:', error.message);
        }
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - EditProject]:', err.message);
    }
  };

  const handleConcludeProject = async (id) => {
    setActiveServices(prev => prev.map(p => p.id === id ? { ...p, progress: 100 } : p));
    triggerToast('Proyecto marcado como Concluido', 'success');

    try {
      const { error } = await supabase
        .from('projects')
        .update({ progress_percent: 100 })
        .eq('id', id);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - ConcludeProject]:', err.message);
    }
  };

  // ─── ACTIVITIES HANDLERS (CENTRAL DE ACTIVIDADES CLAVES) ───
  const handleAddActivity = async (actData) => {
    const newAct = {
      id: Date.now(),
      title: actData.title,
      description: actData.description || '',
      projectId: actData.projectId || null,
      projectTitle: actData.projectTitle || 'General',
      assignedPartner: actData.assignedPartner || currentSocio?.name || 'Ing. Diego Barrientos',
      assignedPartnerEmail: actData.assignedPartnerEmail || currentSocio?.email || '',
      category: actData.category || 'Consultoría Técnica',
      status: actData.status || 'En curso',
      priority: actData.priority || 'Media',
      dueDate: actData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: parseFloat(actData.estimatedHours) || 0,
      actualHours: parseFloat(actData.actualHours) || 0,
      deliverableUrl: actData.deliverableUrl || null,
      deliverableName: actData.deliverableName || null
    };

    setActivities(prev => [newAct, ...prev]);
    triggerToast('Actividad clave registrada correctamente', 'success');

    try {
      const { error } = await supabase.from('activities').insert([{
        title: newAct.title,
        description: newAct.description,
        project_id: newAct.projectId ? (typeof newAct.projectId === 'number' && newAct.projectId < 2147483647 ? newAct.projectId : null) : null,
        project_title: newAct.projectTitle,
        assigned_partner: newAct.assignedPartner,
        assigned_partner_email: newAct.assignedPartnerEmail,
        category: newAct.category,
        status: newAct.status,
        priority: newAct.priority,
        due_date: newAct.dueDate,
        estimated_hours: newAct.estimatedHours,
        actual_hours: newAct.actualHours,
        deliverable_url: newAct.deliverableUrl,
        deliverable_name: newAct.deliverableName
      }]);
      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Insert Activity Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - AddActivity]:', err.message);
    }
  };

  const handleUpdateActivityStatus = async (id, newStatus) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    triggerToast(`Estado actualizado: ${newStatus}`, 'info');

    try {
      const { error } = await supabase
        .from('activities')
        .update({ status: newStatus })
        .eq('id', id);
      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Update Activity Status Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - UpdateActivityStatus]:', err.message);
    }
  };

  const handleEditActivity = async (id, updatedFields) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    triggerToast('Actividad actualizada', 'success');

    try {
      const dbFields = {};
      if (updatedFields.title !== undefined) dbFields.title = updatedFields.title;
      if (updatedFields.description !== undefined) dbFields.description = updatedFields.description;
      if (updatedFields.category !== undefined) dbFields.category = updatedFields.category;
      if (updatedFields.status !== undefined) dbFields.status = updatedFields.status;
      if (updatedFields.priority !== undefined) dbFields.priority = updatedFields.priority;
      if (updatedFields.dueDate !== undefined) dbFields.due_date = updatedFields.dueDate;
      if (updatedFields.assignedPartner !== undefined) dbFields.assigned_partner = updatedFields.assignedPartner;
      if (updatedFields.actualHours !== undefined) dbFields.actual_hours = parseFloat(updatedFields.actualHours);
      if (updatedFields.estimatedHours !== undefined) dbFields.estimated_hours = parseFloat(updatedFields.estimatedHours);

      const { error } = await supabase
        .from('activities')
        .update(dbFields)
        .eq('id', id);
      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Update Activity Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - EditActivity]:', err.message);
    }
  };

  const handleDeleteActivity = async (id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    triggerToast('Actividad eliminada', 'info');

    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - DeleteActivity]:', err.message);
    }
  };

  // ─── CLIENTS HANDLERS (DIRECTORIO DE CLIENTES) ───
  const handleAddClient = async (clientData) => {
    const newClient = {
      id: Date.now(),
      name: clientData.name,
      type: clientData.type || 'Municipal / Público',
      contactPerson: clientData.contactPerson || '',
      contactPhone: clientData.contactPhone || '',
      contactEmail: clientData.contactEmail || '',
      location: clientData.location || '',
      notes: clientData.notes || ''
    };

    setClients(prev => [...prev, newClient]);
    triggerToast('Cliente registrado exitosamente', 'success');

    try {
      const { error } = await supabase.from('clients').insert([{
        name: newClient.name,
        type: newClient.type,
        contact_person: newClient.contactPerson,
        contact_phone: newClient.contactPhone,
        contact_email: newClient.contactEmail,
        location: newClient.location,
        notes: newClient.notes
      }]);
      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Insert Client Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - AddClient]:', err.message);
    }
  };

  const handleEditClient = async (id, updatedFields) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    triggerToast('Datos del cliente actualizados', 'success');

    try {
      const dbFields = {};
      if (updatedFields.name !== undefined) dbFields.name = updatedFields.name;
      if (updatedFields.type !== undefined) dbFields.type = updatedFields.type;
      if (updatedFields.contactPerson !== undefined) dbFields.contact_person = updatedFields.contactPerson;
      if (updatedFields.contactPhone !== undefined) dbFields.contact_phone = updatedFields.contactPhone;
      if (updatedFields.contactEmail !== undefined) dbFields.contact_email = updatedFields.contactEmail;
      if (updatedFields.location !== undefined) dbFields.location = updatedFields.location;
      if (updatedFields.notes !== undefined) dbFields.notes = updatedFields.notes;

      const { error } = await supabase
        .from('clients')
        .update(dbFields)
        .eq('id', id);
      if (error && error.code !== 'PGRST205') {
        console.warn('[Supabase Update Client Warning]:', error.message);
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - EditClient]:', err.message);
    }
  };

  const handleDeleteClient = async (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
    triggerToast('Cliente eliminado del directorio', 'info');

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - DeleteClient]:', err.message);
    }
  };

  // ─── B2B PROSPECTS HANDLERS (BASE GLOBAL SEPREC / NOTION ➔ CLIENTES) ───
  const handleUpdateProspect = (id, updatedFields) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    triggerToast('Estado de gestión comercial actualizado', 'info');
  };

  const handleConvertProspectToClient = async (prospectId) => {
    const prospect = prospects.find(p => p.id === prospectId);
    if (!prospect) return;

    // Crear cliente oficial a partir del prospecto
    const newClientData = {
      name: prospect.razonSocial,
      type: prospect.tipoSocietario?.includes('SOCIEDAD') ? 'Industrial / Fabril' : 'Privado / Particular',
      contactPerson: prospect.socioAsignado !== 'Sin Asignar' ? `Atendido por ${prospect.socioAsignado}` : 'Gerencia / Representante',
      contactPhone: prospect.telefono || '',
      contactEmail: prospect.email || '',
      location: `${prospect.departamento} - ${prospect.municipio}`,
      notes: `Matrícula SEPREC: ${prospect.matricula}. Actividad: ${prospect.actividad}. Interés inicial: ${prospect.servicioInteres}.`
    };

    // Agregar a clientes oficiales
    await handleAddClient(newClientData);

    // Marcar prospecto como "Cliente Cerrado"
    setProspects(prev => prev.map(p => p.id === prospectId ? {
      ...p,
      estadoGestion: 'Cliente Cerrado',
      notas: `${p.notas || ''} [Convertido a Cliente Oficial el ${new Date().toLocaleDateString()}]`
    } : p));

    triggerToast(`¡${prospect.razonSocial} convertido a Cliente Oficial!`, 'success');
  };

  const handleToggleUserPremium = (email) => {
    setRegisteredUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, isPremiumApproved: !u.isPremiumApproved } : u));
  };

  const handleRevokeUserAccess = (email) => {
    setRegisteredUsers(prev => prev.filter(u => u.email !== email));
    triggerToast('Acceso revocado correctamente', 'info');
  };

  const handleLogoutPartner = () => {
    const currentEmail = currentSocio?.email || 'barrientoso2401@gmail.com';

    // Notificar desconexión a través de Supabase Realtime y BroadcastChannel
    if (broadcastChan) {
      try {
        broadcastChan.postMessage({
          type: 'PARTNER_PRESENCE_UPDATE',
          payload: { email: currentEmail, data: { isOnline: false, isTimerRunning: false } }
        });
      } catch (_) {}
    }
    if (supabaseChannelRef.current) {
      try {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: 'partner_presence_update',
          payload: { email: currentEmail, data: { isOnline: false, isTimerRunning: false } }
        });
        supabaseChannelRef.current.untrack();
      } catch (_) {}
    }

    setPartnerPresences(prev => {
      const updated = {
        ...prev,
        [currentEmail]: {
          ...(prev[currentEmail] || {}),
          isOnline: false,
          isTimerRunning: false
        }
      };
      try {
        localStorage.setItem('seram_partners_presence', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    setActiveRole('AccessLimit');
    setCurrentSocio(null);
    try {
      sessionStorage.removeItem('seram_partner_role');
      sessionStorage.removeItem('seram_current_socio');
      localStorage.removeItem('seram_partner_role');
      localStorage.removeItem('seram_current_socio');
    } catch (_) {
      // Ignorar error de almacenamiento
    }
    triggerToast('Sesión de Socio cerrada', 'info');
  };

  const handleSwitchPartner = (targetEmail) => {
    const partner = registeredUsers.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (partner) {
      setActiveRole('AdminMod');
      setCurrentSocio(partner);
      try {
        sessionStorage.setItem('seram_partner_role', 'AdminMod');
        sessionStorage.setItem('seram_current_socio', JSON.stringify(partner));
        localStorage.removeItem('seram_partner_role');
        localStorage.removeItem('seram_current_socio');
      } catch (_) {
        // Ignorar error de almacenamiento
      }
      triggerToast(`Sesión activa cambiada a ${partner.name}`, 'success');
    }
  };

  // --- EXPERIENCE HANDLERS ---
  const handleAddExperience = (exp) => {
    setExperiences(prev => [...prev, { id: Date.now(), ...exp, enrolled: 0, status: 'Activo' }]);
    triggerToast('Experiencia registrada correctamente', 'success');
  };

  const handleEditExperience = (id, fields) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
    triggerToast('Experiencia actualizada', 'success');
  };

  const handleDeleteExperience = (id) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
    triggerToast('Experiencia eliminada', 'info');
  };

  const handleEnrollExperience = (id) => {
    setExperiences(prev => prev.map(e => {
      if (e.id === id) {
        const newEnrolled = Math.min(e.enrolled + 1, e.capacity);
        return { ...e, enrolled: newEnrolled, status: newEnrolled >= e.capacity ? 'Lleno' : 'Activo' };
      }
      return e;
    }));
  };

  // --- PRODUCT HANDLERS (dashboard) ---
  const handleAddProduct = async (prod) => {
    const newId = Date.now();
    const newProduct = { id: newId, ...prod, isPremium: false };
    setProductList(prev => [...prev, newProduct]);
    triggerToast('Producto añadido al catálogo', 'success');

    try {
      const insertData = {
        id: newId,
        name: prod.name,
        price: prod.price,
        category: prod.category,
        image: prod.image,
        description: prod.desc || prod.description || '',
        stock: prod.stock || 0,
        is_premium: false,
        course_id: prod.courseId || null
      };

      let { error } = await supabase.from('products').insert([insertData]);
      if (error && error.code === '42703') {
        // Retry with 'desc' instead of 'description'
        delete insertData.description;
        insertData.desc = prod.desc || prod.description || '';
        const retry = await supabase.from('products').insert([insertData]);
        error = retry.error;
      }
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - AddProduct]:', err.message);
    }
  };

  const handleEditProduct = async (id, fields) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
    triggerToast('Producto actualizado', 'success');

    try {
      const updateData = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.price !== undefined) updateData.price = fields.price;
      if (fields.category !== undefined) updateData.category = fields.category;
      if (fields.image !== undefined) updateData.image = fields.image;
      if (fields.stock !== undefined) updateData.stock = fields.stock;
      if (fields.isPremium !== undefined) updateData.is_premium = fields.isPremium;
      if (fields.courseId !== undefined) updateData.course_id = fields.courseId;
      if (fields.desc !== undefined || fields.description !== undefined) {
        updateData.description = fields.desc || fields.description;
      }

      if (Object.keys(updateData).length > 0) {
        let { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id);
        
        if (error && error.code === '42703' && updateData.description !== undefined) {
          // Retry with 'desc'
          updateData.desc = updateData.description;
          delete updateData.description;
          const retry = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id);
          error = retry.error;
        }
        if (error && error.code !== 'PGRST205') {
          throw error;
        }
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - EditProduct]:', err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    setProductList(prev => prev.filter(p => p.id !== id));
    triggerToast('Producto eliminado del catálogo', 'info');

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - DeleteProduct]:', err.message);
    }
  };

  const handleToggleProductPremium = async (id) => {
    let updatedProduct = null;
    setProductList(prev => prev.map(p => {
      if (p.id === id) {
        updatedProduct = { ...p, isPremium: !p.isPremium };
        return updatedProduct;
      }
      return p;
    }));

    try {
      if (updatedProduct) {
        const { error } = await supabase
          .from('products')
          .update({ is_premium: updatedProduct.isPremium })
          .eq('id', id);
        if (error && error.code !== 'PGRST205') {
          throw error;
        }
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - ToggleProductPremium]:', err.message);
    }
  };

  // --- TIME TRACKER HANDLERS ---
  const handleAddTimeLog = async (projectId, hours, description) => {
    const partnerId = currentSocio?.email || supabaseUser?.email || 'socio@seram.com';
    const partnerName = currentSocio?.name || supabaseUser?.user_metadata?.name || 'Socio directivo';
    const proj = activeServices.find(p => p.id === projectId || p.id === parseInt(projectId)) || {};

    const newLog = {
      id: Date.now(),
      partner_id: partnerId,
      partner_name: partnerName,
      project_id: projectId,
      project_title: proj.client || proj.title || 'Proyecto',
      hours: parseFloat(hours),
      description,
      logged_at: new Date().toISOString()
    };

    setTimeLogs(prev => [newLog, ...prev]);
    // Actualizar actividad reciente en la presencia del socio
    setPartnerPresences(prev => {
      const entry = prev[partnerId] || {};
      const updated = {
        ...prev,
        [partnerId]: {
          ...entry,
          lastWork: {
            project: proj.client || proj.title || 'Proyecto',
            hours: parseFloat(hours),
            description,
            loggedAt: newLog.logged_at
          }
        }
      };
      try {
        localStorage.setItem('seram_partners_presence', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    try {
      const { data, error } = await supabase.from('time_logs').insert([{
        partner_id: partnerId,
        partner_name: partnerName,
        project_id: projectId ? parseInt(projectId) : null,
        project_title: proj.client || proj.type || proj.title || 'Proyecto General',
        hours: parseFloat(hours),
        description,
        logged_at: newLog.logged_at
      }]).select();

      if (error) {
        console.warn('[Supabase Insert TimeLog Error]:', error.message);
      } else if (data && data[0]?.id) {
        setTimeLogs(prev => prev.map(l => l.id === newLog.id ? { ...l, id: data[0].id } : l));
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - AddTimeLog]:', err.message);
    }
  };

  const handleDeleteTimeLog = async (id) => {
    setTimeLogs(prev => prev.filter(l => l.id !== id));
    triggerToast('Registro de tiempo eliminado', 'info');

    try {
      const { error } = await supabase.from('time_logs').delete().eq('id', id);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - DeleteTimeLog]:', err.message);
    }
  };

  // --- REAL-TIME TIME TRACKER & PARTNER PRESENCE METHODS ---
  const updatePartnerPresence = (fields) => {
    const currentEmail = currentSocio?.email || 'barrientoso2401@gmail.com';
    let mergedEntry = null;

    setPartnerPresences(prev => {
      const entry = prev[currentEmail] || {};
      mergedEntry = {
        ...entry,
        ...fields,
        isOnline: true,
        lastPing: Date.now()
      };
      const updated = {
        ...prev,
        [currentEmail]: mergedEntry
      };
      try {
        localStorage.setItem('seram_partners_presence', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    // 1. Emitir por BroadcastChannel local multi-pestaña
    if (broadcastChan) {
      try {
        broadcastChan.postMessage({
          type: 'PARTNER_PRESENCE_UPDATE',
          payload: { email: currentEmail, data: fields }
        });
      } catch (_) {}
    }

    // 2. Emitir por Supabase Realtime a otros clientes / dispositivos
    if (supabaseChannelRef.current) {
      try {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: 'partner_presence_update',
          payload: { email: currentEmail, data: fields }
        });
        if (activeRole === 'AdminMod' && mergedEntry) {
          supabaseChannelRef.current.track({
            ...mergedEntry,
            email: currentEmail
          });
        }
      } catch (err) {
        console.warn('[Supabase Realtime Broadcast Warning]:', err.message);
      }
    }
  };

  const startPartnerTimer = (projectId = null, projectTitle = '') => {
    const pId = projectId || activeTimer.projectId || (activeServices[0]?.id ?? 101);
    const pTitle = projectTitle || activeTimer.projectTitle || activeServices.find(p => p.id === pId)?.client || 'Proyecto General';

    const now = Date.now();
    setActiveTimer(prev => ({
      ...prev,
      isRunning: true,
      startedAt: prev.startedAt || now,
      projectId: pId,
      projectTitle: pTitle
    }));

    updatePartnerPresence({
      isTimerRunning: true,
      timerStartedAt: activeTimer.startedAt || now,
      activeTaskId: pId,
      activeTaskTitle: pTitle
    });

    triggerToast(`Sesión en vivo iniciada: ${pTitle}`, 'success');
  };

  const pausePartnerTimer = () => {
    setActiveTimer(prev => ({
      ...prev,
      isRunning: false
    }));

    updatePartnerPresence({
      isTimerRunning: false
    });

    triggerToast('Sesión de trabajo en pausa', 'info');
  };

  const resetPartnerTimer = () => {
    setActiveTimer(prev => ({
      ...prev,
      isRunning: false,
      seconds: 0,
      startedAt: null
    }));

    updatePartnerPresence({
      isTimerRunning: false,
      timerSeconds: 0,
      timerStartedAt: null
    });
  };

  const savePartnerTimerLog = async (description, customHours = null) => {
    const calculatedHours = customHours !== null 
      ? parseFloat(customHours) 
      : Math.max(0.1, parseFloat(((activeTimer.seconds || 0) / 3600).toFixed(2)));

    if (!description || description.trim() === '') {
      triggerToast('Ingresa una breve descripción de la actividad para registrar horas', 'error');
      return false;
    }

    await handleAddTimeLog(activeTimer.projectId || 101, calculatedHours, description);
    resetPartnerTimer();
    triggerToast(`¡Tiempo de ${calculatedHours} hrs registrado exitosamente a proyecto!`, 'success');
    return true;
  };

  const setPartnerSector = (sectorId, coords = null, sectorName = null) => {
    const roomRef = DEFAULT_OFFICE_ROOMS[sectorId];
    const finalCoords = coords || roomRef?.coords || { x: 35, y: 35 };
    const finalName = sectorName || roomRef?.name || sectorId.toUpperCase();

    setActiveTimer(prev => ({
      ...prev,
      sectorId,
      sectorName: finalName
    }));

    updatePartnerPresence({
      currentRoomId: sectorId,
      currentSectorName: finalName,
      roomCoords: finalCoords
    });
  };

  // --- MUNICIPAL PROPOSALS HANDLERS ---
  const handleAddMunicipalProposal = (newProposal) => {
    const newId = `prop-mun-${Date.now()}`;
    const proposal = {
      id: newId,
      lead: newProposal.lead || 'Ing. Diego Barrientos',
      leadRole: newProposal.leadRole || 'Especialista SIG & Consultoría Ambiental - SERAM',
      currency: 'Bs.',
      status: newProposal.status || 'Propuesta en Formulación',
      priority: newProposal.priority || 'Alta Prioridad',
      phases: newProposal.phases || [],
      ...newProposal
    };
    setMunicipalProposals(prev => [proposal, ...prev]);

    // Vincular directamente como proyecto en el Monitor de Proyectos con etiqueta Propuesta
    setActiveServices(prev => [
      ...prev,
      {
        id: Date.now(),
        client: (proposal.targetMunicipalities || []).join(' / ') || 'Gobierno Autónomo Municipal',
        type: proposal.title || proposal.shortTitle || 'Propuesta Técnica Municipal',
        progress: 15,
        lead: proposal.lead || 'Ing. Diego Barrientos',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        involved: [proposal.lead || 'Ing. Diego Barrientos'],
        budget: parseFloat(proposal.budget) || 50000,
        labCosts: Math.round((parseFloat(proposal.budget) || 50000) * 0.15),
        subcontractorCosts: Math.round((parseFloat(proposal.budget) || 50000) * 0.15),
        taxRegime: 'Régimen General',
        isProposal: true,
        tag: 'Propuesta',
        proposalId: newId
      }
    ]);

    triggerToast('Propuesta municipal registrada y agregada a Proyectos', 'success');
  };

  const handleEditMunicipalProposal = (id, updatedFields) => {
    setMunicipalProposals(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    setActiveServices(prev => prev.map(p => p.proposalId === id ? {
      ...p,
      client: updatedFields.targetMunicipalities ? updatedFields.targetMunicipalities.join(' / ') : p.client,
      type: updatedFields.title || updatedFields.shortTitle || p.type,
      budget: updatedFields.budget ? parseFloat(updatedFields.budget) : p.budget
    } : p));
    triggerToast('Propuesta municipal actualizada', 'success');
  };

  const handleDeleteMunicipalProposal = (id) => {
    setMunicipalProposals(prev => prev.filter(p => p.id !== id));
    setActiveServices(prev => prev.filter(p => p.proposalId !== id));
    triggerToast('Propuesta municipal eliminada', 'info');
  };

  // --- GLOBAL CHATBOT TRIGGER ---
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotStartStep, setChatbotStartStep] = useState(null);

  const openChatbot = (stepId = null) => {
    setChatbotStartStep(stepId);
    setIsChatbotOpen(true);
  };

  return (
    <AppContext.Provider value={{
      isChatbotOpen, setIsChatbotOpen, chatbotStartStep, setChatbotStartStep, openChatbot,
      // Auth
      supabaseUser, setSupabaseUser,
      activeRole, setActiveRole, currentSocio, setCurrentSocio,
      isRegistered, setIsRegistered, currentUserEmail, setCurrentUserEmail,
      registerEmail, setRegisterEmail, registeredUsers, setRegisteredUsers,
      // Premium state
      isPremiumUser, hasPremiumAccess,
      // Secret portal
      logoClicks, showSecretModal, setShowSecretModal,
      showSecretPortal, setShowSecretPortal,
      secretPassword, setSecretPassword,
      selectedPartnerIndex, setSelectedPartnerIndex,
      // Cart
      cart, showCart, setShowCart,
      // Data
      products: productList, productList, courses, setCourses, activeServices, setActiveServices,
      clients, setClients, activities, setActivities,
      prospects, setProspects,
      municipalProposals, setMunicipalProposals,
      experiences, setExperiences,
      timeLogs, setTimeLogs,
      partnerPresences, setPartnerPresences,
      publicServices, setPublicServices, specialists, setSpecialists,
      // Academy progress
      completedLessons, courseExamsApproved, courseAssignments,
      // Modals
      showPremiumRegisterModal, setShowPremiumRegisterModal,
      showPremiumBlockedModal, setShowPremiumBlockedModal,
      blockedItemName,
      // Toast
      toast, triggerToast,
      // Handlers
      handleLogoClick, handlePartnerLogin, handleRegister,
      handleRegisterSupabase, handleLoginSupabase, handleLogoutPublic,
      toggleLessonCompleted, approveCourseExam, submitAssignment,
      handleAccessItem, handleAddToCart, handleRemoveFromCart, handleCheckout,
      handleAddCourse, handleUpdateCourse, handleDeleteCourse, handleToggleCoursePremium,
      handleAddProject, handleUpdateProjectProgress, handleDeleteProject,
      handleEditProject, handleConcludeProject,
      handleAddActivity, handleUpdateActivityStatus, handleEditActivity, handleDeleteActivity,
      handleAddClient, handleEditClient, handleDeleteClient,
      handleUpdateProspect, handleConvertProspectToClient,
      handleAddMunicipalProposal, handleEditMunicipalProposal, handleDeleteMunicipalProposal,
      handleToggleUserPremium, handleRevokeUserAccess, handleLogoutPartner, handleSwitchPartner,
      // Experience handlers
      handleAddExperience, handleEditExperience, handleDeleteExperience, handleEnrollExperience,
      // Product handlers
      handleAddProduct, handleEditProduct, handleDeleteProduct, handleToggleProductPremium,
      // Time Tracker handlers & Real-Time Live Session
      handleAddTimeLog, handleDeleteTimeLog,
      activeTimer, setActiveTimer,
      startPartnerTimer, pausePartnerTimer, resetPartnerTimer, savePartnerTimerLog,
      setPartnerSector, updatePartnerPresence,
      // Public services dynamic handlers
      handleAddPublicService, handleEditPublicService, handleDeletePublicService,
      // Specialist handlers
      handleAddSpecialist, handleEditSpecialist, handleDeleteSpecialist,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // --- AUTH & ROLES ---
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [activeRole, setActiveRole] = useState(() => {
    try {
      return localStorage.getItem('seram_partner_role') || 'AccessLimit';
    } catch (_) {
      return 'AccessLimit';
    }
  });
  const [currentSocio, setCurrentSocio] = useState(() => {
    try {
      const saved = localStorage.getItem('seram_current_socio');
      const parsed = saved ? JSON.parse(saved) : null;
      const validEmails = ['barrientoso2401@gmail.com', 'fernandoaraujo1912@gmail.com', 'sebastiansbs51@gmail.com'];
      if (parsed && (!parsed.email || !validEmails.includes(parsed.email.toLowerCase()))) {
        localStorage.removeItem('seram_current_socio');
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

  // Persistir sesión de socio en localStorage
  useEffect(() => {
    try {
      if (activeRole === 'AdminMod' && currentSocio) {
        localStorage.setItem('seram_partner_role', 'AdminMod');
        localStorage.setItem('seram_current_socio', JSON.stringify(currentSocio));
      } else if (activeRole !== 'AdminMod') {
        localStorage.removeItem('seram_partner_role');
        localStorage.removeItem('seram_current_socio');
      }
    } catch (_) {}
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




  // --- COURSES ---
  const [courses, setCourses] = useState([
    { id: 1, title: 'Ebook: Guía Práctica de la Ley 1333 de *Medio Ambiente*', instructor: 'SERAM Legal', students: 210, status: 'Activo', isPremium: false, type: 'gratis', price: 0, image: '/assets/covers/cover_ebook_ley1333.png', duration: '80 páginas', desc: 'Compendio interpretado de legislación boliviana, carimbos institucionales, mapas sectoriales y tablas normativas de mitigación.' },
    { id: 2, title: 'Herramientas Técnicas de QGIS *Básico*', instructor: 'Ing. Diego Barrientos', students: 85, status: 'Activo', isPremium: true, type: 'low_ticket', price: 45, image: '/assets/covers/cover_qgis_basico.png', duration: '12 horas', desc: 'Dominio práctico de QGIS aplicado a delimitación de cuencas e informes técnicos bolivianos.' },
    { id: 3, title: 'Taller: Metodología de *Fichas Ambientales* e Impacto', instructor: 'Ing. Fernando Araujo', students: 42, status: 'Activo', isPremium: true, type: 'mid_ticket', price: 120, image: '/assets/covers/cover_taller_fichas.png', duration: '25 horas', desc: 'Metodologías de categorización de obras civiles (FNCA) y adecuación bajo reglamentación boliviana.' },
    { id: 4, title: 'Mentoría VIP: Consultoría y *Gestión de Proyectos Ambientales*', instructor: 'Ing. Fabricio Orosco', students: 12, status: 'Activo', isPremium: true, type: 'high_ticket', price: 450, image: '/assets/covers/cover_mentoria_consultoria.png', duration: '1 mes (1-on-1)', desc: 'Mentoría de élite 1-a-1 para el diseño técnico y defensa legal de licencias ambientales mineras e industriales.' }
  ]);

  // --- PROJECTS (Incluye Proyectos B2B y Propuestas Técnicas Municipales) ---
  const [activeServices, setActiveServices] = useState([
    { id: 101, client: 'Minera Los Andes', type: 'Estudio de Impacto Ambiental (EsIA)', progress: 85, lead: 'Ing. Diego Barrientos', startDate: '2026-01-15', endDate: '2026-08-30', involved: ['Ing. Fabricio Orosco'], budget: 25000, labCosts: 3000, subcontractorCosts: 4000, taxRegime: 'Régimen General', tag: 'B2B Privado', isProposal: false },
    { id: 102, client: 'EcoIndustrial S.A.', type: 'Auditoría de Gestión de Residuos', progress: 40, lead: 'Ing. Fabricio Orosco', startDate: '2026-03-01', endDate: '2026-12-15', involved: ['Ing. Fernando Araujo'], budget: 15000, labCosts: 1000, subcontractorCosts: 2000, taxRegime: 'Régimen General', tag: 'B2B Privado', isProposal: false },
    { id: 103, client: 'Municipio Metropolitano', type: 'Plan de Ordenamiento Territorial', progress: 100, lead: 'Ing. Fernando Araujo', startDate: '2025-10-01', endDate: '2026-05-30', involved: ['Ing. Diego Barrientos'], budget: 35000, labCosts: 5000, subcontractorCosts: 6000, taxRegime: 'Régimen General', tag: 'Público', isProposal: false },
    {
      id: 104,
      client: 'G.A.M. Guanay / Mapiri / Palos Blancos',
      type: 'Línea Base: Monitoreo Hidrogeoquímico de Mercurio (Hg) y Fuentes de Agua por Minería Aurífera',
      progress: 25,
      lead: 'Ing. Diego Barrientos',
      startDate: '2026-06-01',
      endDate: '2026-09-30',
      involved: ['Ing. Diego Barrientos', 'Ing. Fabricio Orosco'],
      budget: 85000,
      labCosts: 18000,
      subcontractorCosts: 12000,
      taxRegime: 'Régimen General',
      isProposal: true,
      tag: 'Propuesta',
      proposalId: 'prop-mun-01'
    },
    {
      id: 105,
      client: 'G.A.M. Caranavi / Alto Beni / Palos Blancos',
      type: 'EDTP: Diseño y Optimización de Redes de Riego Tecnificado Comunitario',
      progress: 20,
      lead: 'Ing. Diego Barrientos',
      startDate: '2026-06-15',
      endDate: '2026-09-15',
      involved: ['Ing. Diego Barrientos', 'Ing. Fernando Araujo'],
      budget: 68000,
      labCosts: 8000,
      subcontractorCosts: 10000,
      taxRegime: 'Régimen SIETE (5%)',
      isProposal: true,
      tag: 'Propuesta',
      proposalId: 'prop-mun-02'
    },
    {
      id: 106,
      client: 'G.A.M. Alto Beni / San Buenaventura',
      type: 'Plan de Manejo Integrado de Microcuencas (PMIC) y Zonas de Recarga Hídrica',
      progress: 15,
      lead: 'Ing. Diego Barrientos',
      startDate: '2026-07-01',
      endDate: '2026-10-31',
      involved: ['Ing. Diego Barrientos', 'Ing. Fabricio Orosco'],
      budget: 95000,
      labCosts: 12000,
      subcontractorCosts: 15000,
      taxRegime: 'Régimen General',
      isProposal: true,
      tag: 'Propuesta',
      proposalId: 'prop-mun-03'
    },
    {
      id: 107,
      client: 'G.A.M. Palos Blancos / Ixiamas',
      type: 'Monitoreo Agroambiental Satelital y Teledetección Multiespectral de Parcelas',
      progress: 30,
      lead: 'Ing. Diego Barrientos',
      startDate: '2026-06-20',
      endDate: '2026-09-10',
      involved: ['Ing. Diego Barrientos'],
      budget: 52000,
      labCosts: 4000,
      subcontractorCosts: 6000,
      taxRegime: 'Régimen SIETE (5%)',
      isProposal: true,
      tag: 'Propuesta',
      proposalId: 'prop-mun-04'
    }
  ]);

  // --- MUNICIPAL PROPOSALS (Líneas Base & Proyectos para Concejales Municipales) ---
  const [municipalProposals, setMunicipalProposals] = useState([
    {
      id: 'prop-mun-01',
      title: 'Línea Base y Monitoreo Hidrogeoquímico de Contaminación por Mercurio (Hg) en Fuentes de Agua y Cuencas Auríferas',
      shortTitle: 'Monitoreo de Mercurio & Minería Aurífera',
      axis: 'mercurio',
      axisLabel: 'Mercurio & Minería Aurífera',
      targetMunicipalities: ['Guanay', 'Mapiri', 'Palos Blancos', 'Teoponte'],
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
      status: 'Propuesta en Formulación',
      priority: 'Alta Prioridad',
      phases: [
        { name: 'Fase 1: Diagnóstico Cartográfico y Red de Muestreo', duration: '20 días' },
        { name: 'Fase 2: Campaña de Campo y Toma de Muestras (AAS)', duration: '25 días' },
        { name: 'Fase 3: Análisis de Laboratorio y Modelación SIG', duration: '25 días' },
        { name: 'Fase 4: Formulación Normativa y Presentación a Concejo', duration: '20 días' }
      ]
    },
    {
      id: 'prop-mun-02',
      title: 'Estudio de Diseño Técnico de Preinversión (EDTP) para Sistemas de Riego Tecnificado y Resiliencia Comunitaria',
      shortTitle: 'Sistemas de Riego Tecnificado',
      axis: 'riego',
      axisLabel: 'Riego Tecnificado & Seguridad Hídrica',
      targetMunicipalities: ['Palos Blancos', 'Caranavi', 'Alto Beni'],
      lead: 'Ing. Diego Barrientos',
      leadRole: 'Especialista en Hidráulica & Recursos Hídricos - SERAM',
      problem: 'Pérdidas recurrentes de hasta el 55% en cosechas de cítricos, cacao y café por sequías estacionales prolongadas. Ineficiencia crítica de los sistemas tradicionales por gravedad o inundación (<30% de eficiencia), sumado a crecientes conflictos comunales por distribución de caudales de vertientes durante el estiaje.',
      legalFramework: [
        'Ley 2878 de Promoción y Apoyo al Sector Riego para la Producción Agropecuaria y Forestal',
        'Guía de Elaboración de Proyectos de Riego Tecnificado del MMAyA (PRONAR / SENARI)',
        'Ley 071 de Derechos de la Madre Tierra (Protección del Ciclo del Agua)',
        'Ley 482 de Gobiernos Autónomos Municipales (Competencias Exclusivas en Micro Riego)'
      ],
      methodology: 'Aforos hidrométricos continuos en época de estiaje y balance oferta-demanda hídrica según requerimiento hídrico de cultivos (FAO CROPWAT). Relevamiento topográfico con estación total y drones fotogramétricos (Modelos Digitales de Terreno con curvas a 1 m). Modelación y dimensionamiento hidráulico en EPANET de obras de toma tirolesa, desarenadores, desripiadores, tanques de almacenamiento y red de distribución presurizada para aspersión y microgoteo. Talleres de fortalecimiento institucional para la Asociación de Regantes Comunal.',
      deliverables: [
        'Carpeta técnica completa a nivel EDTP lista para licitación y postulación a fondos VIPFE / FNDR / FPS',
        'Planos constructivos de ingeniería de detalle georreferenciados (AutoCAD / Civil 3D)',
        'Memoria de cálculo hidráulico, presupuesto general, cómputos métricos y análisis de precios unitarios (APUs)',
        'Reglamento Interno y Estatuto Comunitario de Operación, Mantenimiento y Turnos de Distribución'
      ],
      budget: 85000,
      currency: 'Bs.',
      duration: '120 días calendario',
      status: 'Propuesta en Formulación',
      priority: 'Alta Prioridad',
      phases: [
        { name: 'Fase 1: Topografía Dron, Aforos y Censo de Usuarios', duration: '30 días' },
        { name: 'Fase 2: Diseño Hidráulico y Agronómico en EPANET', duration: '35 días' },
        { name: 'Fase 3: Cómputos Métricos, Presupuestos y Pliegos', duration: '30 días' },
        { name: 'Fase 4: Validación Comunal y Aprobación en Concejo', duration: '25 días' }
      ]
    },
    {
      id: 'prop-mun-03',
      title: 'Plan de Manejo Integrado de Cuencas (PMIC) y Ordenamiento Territorial para Protección de Cabeceras Hídricas',
      shortTitle: 'Manejo Integrado de Cuencas (PMIC)',
      axis: 'cuencas',
      axisLabel: 'Manejo de Cuencas & Ordenamiento',
      targetMunicipalities: ['Mancomunidad de Municipios del Norte de La Paz', 'Caranavi', 'Guanay', 'Palos Blancos'],
      lead: 'Ing. Diego Barrientos',
      leadRole: 'Especialista SIG & Planificación de Cuencas - SERAM',
      problem: 'Acelerada deforestación de laderas y cabeceras de cuenca por chaqueos y apertura desordenada de caminos, ocasionando severa erosión laminar, deslizamientos masa en temporada de lluvias, turbidez extrema en captaciones e inundaciones que destruyen plataformas viales y puentes municipales.',
      legalFramework: [
        'Ley 1333 de Medio Ambiente (Título IV de los Recursos Hídricos y Protección de Suelos)',
        'Plan Nacional de Cuencas (PNC - Viceministerio de Recursos Hídricos y Riego)',
        'Ley 300 Marco de la Madre Tierra y Desarrollo Integral para Vivir Bien',
        'Decreto Supremo 24782 (Reglamento General de Áreas Protegidas y Servidumbres Ecológicas)'
      ],
      methodology: 'Delimitación hidrográfica automática con Modelos Digitales de Elevación ALOS PALSAR (12.5 m) y Copernicus DEM (30 m). Caracterización geomorfológica, hidroclimatológica y de capacidad de uso mayor de la tierra en ArcGIS Pro / QGIS. Modelación de pérdida de suelo mediante la Ecuación Universal de Pérdida de Suelo Revisada (RUSLE). Talleres de diagnóstico socioambiental participativo con centrales agrarias y comunidades de cuenca alta, media y baja. Delimitación de fajas de protección y servidumbres ecológicas ribereñas.',
      deliverables: [
        'Documento Oficial del PMIC estructurado para su promulgación mediante Ley Municipal Autonómica',
        'Geodatabase ArcGIS con Zonificación Ambiental, Aptitud de Suelos y Mapa de Riesgos Hidrológicos',
        'Cartera priorizada de proyectos de inversión (zanjas de infiltración, bioingeniería y reforestación de riberas)',
        'Acta de conformación y reglamento de funcionamiento del Comité de Gestión de Cuenca Intercomunal'
      ],
      budget: 95000,
      currency: 'Bs.',
      duration: '150 días calendario',
      status: 'Propuesta en Formulación',
      priority: 'Media-Alta',
      phases: [
        { name: 'Fase 1: Diagnóstico Físico-Biológico y Morfometría SIG', duration: '35 días' },
        { name: 'Fase 2: Diagnóstico Socioeconómico y Talleres Comunales', duration: '40 días' },
        { name: 'Fase 3: Zonificación Hidroambiental y Cartera de Proyectos', duration: '45 días' },
        { name: 'Fase 4: Redacción de Ley Municipal y Defensa en Concejo', duration: '30 días' }
      ]
    },
    {
      id: 'prop-mun-04',
      title: 'Auditoría Territorial y Teledetección Multitemporal de Lotes Agrícolas, Estrés Hídrico y Frontera Forestal',
      shortTitle: 'Teledetección & Catastro Agrícola',
      axis: 'teledeteccion',
      axisLabel: 'Teledetección & Monitoreo Agrícola',
      targetMunicipalities: ['Palos Blancos', 'Alto Beni', 'Caranavi'],
      lead: 'Ing. Diego Barrientos',
      leadRole: 'Especialista en Teledetección y Sensores Remotos - SERAM',
      problem: 'Inexistencia de un catastro rural georreferenciado y actualizado a nivel municipal. Dificultad para fiscalizar desmontes no autorizados, descontrol en el avance sobre reservas forestales y ausencia de monitoreo preventivo de estrés hídrico, sanidad vegetal y pérdidas de rendimiento en parcelas agrícolas comunales.',
      legalFramework: [
        'Ley 1700 Forestal (Disposiciones sobre Desmontes, Quemas y Tierras de Protección)',
        'Ley 1333 de Medio Ambiente (Control y Fiscalización Ambiental)',
        'Ley 482 de Gobiernos Autónomos Municipales (Uso de Suelo Rural y Ordenamiento Catastral)',
        'Normativas y Directrices Técnicas de la Autoridad de Fiscalización y Control Social de Bosques y Tierra (ABT)'
      ],
      methodology: 'Descarga y preprocesamiento radiométrico/atmosférico de constelaciones satelitales ópticas (Sentinel-2 MSI y Landsat 8/9). Análisis de series de tiempo para estimación de índices biofísicos: NDVI (vigor fotosintético), NDWI (contenido de agua en hoja), SAVI (ajuste por suelo descubierto) y NDMI (estrés hídrico). Aplicación de clasificadores de aprendizaje automático (Random Forest) para mapeo multitemporal de cambio de uso y cobertura (LULC 2020-2026). Relevamiento aéreo con drones en sectores piloto para georreferenciación de linderos a resolución centimétrica.',
      deliverables: [
        'Visor SIG Web Municipal interactivo con capas de parcelas, estado de cultivos y alertas de chaqueo',
        'Atlas temático municipal de aptitud de uso del suelo, estrés hídrico y vigor agrícola (PDF y Geodatabase)',
        'Informe multitemporal de detección de quemas, deforestación y avance de frontera agrícola 2020-2026',
        'Base de datos georreferenciada de predios agrícolas para fortalecimiento del catastro y recaudación municipal'
      ],
      budget: 52000,
      currency: 'Bs.',
      duration: '60 días calendario',
      status: 'Propuesta en Formulación',
      priority: 'Alta Prioridad',
      phases: [
        { name: 'Fase 1: Adquisición Satelital y Calibración Radiométrica', duration: '15 días' },
        { name: 'Fase 2: Procesamiento de Índices (NDVI, NDWI) y LULC', duration: '20 días' },
        { name: 'Fase 3: Validación de Campo y Vuelos de Dron', duration: '15 días' },
        { name: 'Fase 4: Montaje del Visor SIG y Entrega a Concejales', duration: '10 días' }
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

  // --- TIME LOGS (intranet tracker de trabajo realizado) ---
  const [timeLogs, setTimeLogs] = useState([
    { id: 1, partner_id: 'barrientoso2401@gmail.com', partner_name: 'Ing. Diego Barrientos', project_id: 104, project_title: 'G.A.M. Guanay / Mapiri (Mercurio)', hours: 5.5, description: 'Estructuración de línea base hidrogeoquímica para Concejo Municipal, protocolo de muestreo de mercurio y marco Ley 1333 / Minamata.', logged_at: '2026-09-28T16:20:00Z' },
    { id: 2, partner_id: 'barrientoso2401@gmail.com', partner_name: 'Ing. Diego Barrientos', project_id: 105, project_title: 'G.A.M. Caranavi / Alto Beni (Riego)', hours: 4.0, description: 'Dimensionamiento preliminar de red de riego tecnificado y balance hídrico con CROPWAT para concejales.', logged_at: '2026-09-28T14:10:00Z' },
    { id: 3, partner_id: 'barrientoso2401@gmail.com', partner_name: 'Ing. Diego Barrientos', project_id: 101, project_title: 'Minera Los Andes', hours: 4.5, description: 'Revisión y corrección del EsIA - Minera Los Andes', logged_at: '2026-09-27T14:30:00Z' },
    { id: 4, partner_id: 'fernandoaraujo1912@gmail.com', partner_name: 'Ing. Fernando Araujo', project_id: 103, project_title: 'Municipio Metropolitano', hours: 6.0, description: 'Revisión técnica de cartografía y ordenamiento territorial municipal', logged_at: '2026-09-28T11:15:00Z' },
    { id: 5, partner_id: 'sebastiansbs51@gmail.com', partner_name: 'Ing. Fabricio Orosco', project_id: 102, project_title: 'EcoIndustrial S.A.', hours: 5.0, description: 'Auditoría in-situ, muestreo de suelos y verificación de almacenamiento de residuos', logged_at: '2026-09-28T09:40:00Z' },
  ]);

  // --- REAL-TIME PARTNERS PRESENCE & SESSION TRACKING ---
  const [partnerPresences, setPartnerPresences] = useState(() => {
    try {
      const saved = localStorage.getItem('seram_partners_presence');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
    return {
      'barrientoso2401@gmail.com': {
        name: 'Ing. Diego Barrientos',
        role: 'Socio Fundador · Especialista SIG & Hidráulica',
        isOnline: true,
        lastLogin: new Date().toISOString(),
        sessionStart: Date.now() - 34 * 60 * 1000,
        device: isMobile ? 'Dispositivo Móvil (Android)' : 'Escritorio (Web)',
        location: 'La Paz, Bolivia',
        activeTask: 'Formulación y Presentación de Propuestas Socioambientales para Concejales Municipales'
      },
      'fernandoaraujo1912@gmail.com': {
        name: 'Ing. Fernando Araujo',
        role: 'Socio Fundador · Especialista Ambiental & Legal',
        isOnline: false,
        lastLogin: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
        sessionStart: null,
        device: 'Escritorio (Web)',
        location: 'Santa Cruz, Bolivia',
        activeTask: 'Plan de Ordenamiento Territorial y Trámites RMCH'
      },
      'sebastiansbs51@gmail.com': {
        name: 'Ing. Fabricio Orosco',
        role: 'Socio Fundador · Especialista Residuos & Auditoría',
        isOnline: false,
        lastLogin: new Date(Date.now() - 125 * 60 * 1000).toISOString(),
        sessionStart: null,
        device: 'Dispositivo Móvil',
        location: 'La Paz, Bolivia',
        activeTask: 'Auditoría de Gestión de Residuos EcoIndustrial S.A.'
      }
    };
  });

  // Mantener actualizado el estado del socio en sesión activa
  useEffect(() => {
    if (activeRole === 'AdminMod') {
      const email = currentSocio?.email || 'barrientoso2401@gmail.com';
      const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
      setPartnerPresences(prev => {
        const entry = prev[email] || {};
        const updated = {
          ...prev,
          [email]: {
            ...entry,
            name: currentSocio?.name || entry.name || 'Socio Directivo',
            role: entry.role || 'Socio Fundador Directivo',
            isOnline: true,
            lastLogin: entry.lastLogin || new Date().toISOString(),
            sessionStart: entry.sessionStart || Date.now(),
            device: isMobile ? 'Dispositivo Móvil (Android)' : 'Escritorio (Web)',
            location: entry.location || 'Bolivia'
          }
        };
        try {
          localStorage.setItem('seram_partners_presence', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    }
  }, [activeRole, currentSocio]);

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
        const [coursesRes, projectsRes, productsRes, logsRes] = await Promise.allSettled([
          supabase.from('courses').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('products').select('*'),
          supabase.from('time_logs').select('*')
        ]);

        // 1. Courses
        if (coursesRes.status === 'fulfilled' && !coursesRes.value.error && coursesRes.value.data?.length > 0) {
          const mappedCourses = coursesRes.value.data.map(c => ({
            id: c.id,
            title: c.title,
            instructor: c.instructor,
            students: c.students || 0,
            status: c.status || 'Activo',
            isPremium: c.is_premium
          }));
          setCourses(mappedCourses);
        }

        // 2. Projects
        if (projectsRes.status === 'fulfilled' && !projectsRes.value.error && projectsRes.value.data?.length > 0) {
          const mappedProjects = projectsRes.value.data.map(p => ({
            id: p.id,
            client: p.client || p.title,
            type: p.type || p.title,
            progress: p.progress_percent || p.progress || 0,
            lead: p.lead || 'Ing. Diego Barrientos',
            startDate: p.start_date || p.startDate,
            endDate: p.end_date || p.endDate,
            involved: p.involved || []
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
            partner_name: l.partner_name || 'Socio',
            project_id: l.project_id,
            project_title: l.project_title || 'Proyecto',
            hours: parseFloat(l.hours),
            description: l.description,
            logged_at: l.logged_at
          }));
          setTimeLogs(mappedLogs);
        }
      } catch (err) {
        console.warn('[Supabase AppContext Pull Warning]: Red/DNS no disponible. Usando catálogo local mock.', err.message);
      }
    }
    loadDataFromSupabase();
  }, []);

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
          localStorage.setItem('seram_partner_role', 'AdminMod');
          localStorage.setItem('seram_current_socio', JSON.stringify(partner));
        } catch (_) {}
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
    const newCourse = { 
      id: Date.now(), 
      title: courseData.title, 
      instructor: courseData.instructor, 
      students: 0, 
      status: 'Activo', 
      isPremium: courseData.isPremium || false,
      type: courseData.type || 'curso_gratis',
      price: parseFloat(courseData.price) || 0,
      image: courseData.image || 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=600',
      duration: courseData.duration || '10 horas',
      desc: courseData.desc || ''
    };

    setCourses(prev => [...prev, newCourse]);
    triggerToast('Nuevo recurso registrado en SERAM ACADEMY', 'success');

    try {
      const { error } = await supabase.from('courses').insert([{
        title: newCourse.title,
        instructor: newCourse.instructor,
        students: 0,
        status: 'Activo',
        is_premium: newCourse.isPremium,
        type: newCourse.type,
        price: newCourse.price,
        image: newCourse.image,
        duration: newCourse.duration,
        desc: newCourse.desc
      }]);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - AddCourse]:', err.message);
    }
  };

  const handleUpdateCourse = async (id, fields) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c));
    triggerToast('Recurso académico actualizado', 'success');

    try {
      const { error } = await supabase.from('courses').update({
        title: fields.title,
        instructor: fields.instructor,
        is_premium: fields.isPremium,
        type: fields.type,
        price: fields.price,
        image: fields.image,
        duration: fields.duration,
        desc: fields.desc
      }).eq('id', id);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - UpdateCourse]:', err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
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
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        updatedCourse = { ...c, isPremium: !c.isPremium };
        return updatedCourse;
      }
      return c;
    }));

    try {
      if (updatedCourse) {
        const { error } = await supabase
          .from('courses')
          .update({ is_premium: updatedCourse.isPremium })
          .eq('id', id);
        if (error && error.code !== 'PGRST205') {
          throw error;
        }
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - ToggleCoursePremium]:', err.message);
    }
  };

  const handleAddProject = async (client, type, lead, startDate, endDate, involved = [], budget = 0, labCosts = 0, subcontractorCosts = 0, taxRegime = 'Régimen General') => {
    const newProj = {
      id: Date.now(),
      client,
      type,
      progress: 10,
      lead: lead || currentSocio?.name || 'Ing. Diego Barrientos',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      involved: involved,
      budget: parseFloat(budget),
      labCosts: parseFloat(labCosts),
      subcontractorCosts: parseFloat(subcontractorCosts),
      taxRegime: taxRegime
    };

    setActiveServices(prev => [...prev, newProj]);
    triggerToast('Proyecto registrado correctamente', 'success');

    try {
      const { error } = await supabase.from('projects').insert([{
        client,
        type,
        progress_percent: 10,
        lead: newProj.lead,
        start_date: newProj.startDate,
        end_date: newProj.endDate,
        involved,
        budget: parseFloat(budget),
        lab_costs: parseFloat(labCosts),
        subcontractor_costs: parseFloat(subcontractorCosts),
        tax_regime: taxRegime
      }]);
      if (error && error.code !== 'PGRST205') {
        throw error;
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

        const { error } = await supabase
          .from('projects')
          .update(dbFields)
          .eq('id', id);
        if (error && error.code !== 'PGRST205') {
          throw error;
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

  const handleToggleUserPremium = (email) => {
    setRegisteredUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, isPremiumApproved: !u.isPremiumApproved } : u));
  };

  const handleRevokeUserAccess = (email) => {
    setRegisteredUsers(prev => prev.filter(u => u.email !== email));
    triggerToast('Acceso revocado correctamente', 'info');
  };

  const handleLogoutPartner = () => {
    setActiveRole('AccessLimit');
    setCurrentSocio(null);
    try {
      localStorage.removeItem('seram_partner_role');
      localStorage.removeItem('seram_current_socio');
    } catch (_) {}
    triggerToast('Sesión de Socio cerrada', 'info');
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
    triggerToast('Horas registradas exitosamente', 'success');

    try {
      const { error } = await supabase.from('time_logs').insert([{
        partner_id: supabaseUser?.id || partnerId,
        project_id: projectId,
        hours: parseFloat(hours),
        description,
        logged_at: newLog.logged_at
      }]);
      if (error && error.code !== 'PGRST205') {
        throw error;
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
      handleAddMunicipalProposal, handleEditMunicipalProposal, handleDeleteMunicipalProposal,
      handleToggleUserPremium, handleRevokeUserAccess, handleLogoutPartner,
      // Experience handlers
      handleAddExperience, handleEditExperience, handleDeleteExperience, handleEnrollExperience,
      // Product handlers
      handleAddProduct, handleEditProduct, handleDeleteProduct, handleToggleProductPremium,
      // Time Tracker handlers
      handleAddTimeLog, handleDeleteTimeLog,
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

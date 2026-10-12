/**
 * @file talentTreeData.js
 * @description Modelo de datos maestro del Árbol de Talentos Gamificado de SERAM S.R.L.
 * Estructurado en 5 Constelaciones Canónicas de la Ingeniería en Ecología y Medio Ambiente,
 * con vías paralelas no restrictivas, nodos instrumentales SIG aplicados y 4 Tiers de maestría.
 */

export const CONSTELLATIONS = [
  {
    id: 'eia',
    code: 'RAMA I',
    title: 'Evaluación de Impacto Ambiental & Riesgo',
    shortName: 'EIA & Riesgo',
    subtitle: 'Línea base, monitoreo instrumental, regulación y peritaje',
    color: '#00e03c', // Verde Esmeralda
    glowColor: 'rgba(0, 224, 60, 0.45)',
    bgCard: 'rgba(0, 224, 60, 0.08)',
    borderCard: 'rgba(0, 224, 60, 0.3)',
    icon: 'ShieldCheck',
    angleHint: 'Oeste-Noroeste',
    accentClass: 'text-[#00e03c]',
    tag: 'Técnico-Regulatorio'
  },
  {
    id: 'esg_edge',
    code: 'RAMA II',
    title: 'Gestión Ambiental, Sostenibilidad & EDGE',
    shortName: 'ESG & EDGE',
    subtitle: 'Edificación sostenible, normas ISO, SYSO y finanzas verdes',
    color: '#f59e0b', // Ámbar / Dorado
    glowColor: 'rgba(245, 158, 11, 0.45)',
    bgCard: 'rgba(245, 158, 11, 0.08)',
    borderCard: 'rgba(245, 158, 11, 0.3)',
    icon: 'Building2',
    angleHint: 'Noroeste',
    accentClass: 'text-amber-400',
    tag: 'Corporativo & Infraestructura'
  },
  {
    id: 'climate_carbon',
    code: 'RAMA III',
    title: 'Cambio Climático & Mercados de Carbono',
    shortName: 'Clima & Carbono',
    subtitle: 'Contabilidad GEI, Artículo 6 de París, créditos Verra y resiliencia',
    color: '#00c0ff', // Azul Eléctrico / Zafiro
    glowColor: 'rgba(0, 192, 255, 0.45)',
    bgCard: 'rgba(0, 192, 255, 0.08)',
    borderCard: 'rgba(0, 192, 255, 0.3)',
    icon: 'CloudRain',
    angleHint: 'Cénit / Centro Superior',
    accentClass: 'text-cyan-400',
    tag: 'Finanzas Climáticas'
  },
  {
    id: 'biodiversity_nbs',
    code: 'RAMA IV',
    title: 'Conservación de Biodiversidad & NbS',
    shortName: 'Biodiversidad & NbS',
    subtitle: 'Ecosistemas, biocréditos 30x30, restauración y macroinvertebrados',
    color: '#10b981', // Verde Esmeralda Vivo
    glowColor: 'rgba(16, 185, 129, 0.45)',
    bgCard: 'rgba(16, 185, 129, 0.08)',
    borderCard: 'rgba(16, 185, 129, 0.3)',
    icon: 'Trees',
    angleHint: 'Noreste',
    accentClass: 'text-emerald-400',
    tag: 'Capital Natural'
  },
  {
    id: 'circular_bio',
    code: 'RAMA V',
    title: 'Economía Circular, Bioprocesos & Residuos',
    shortName: 'Circular & Bioprocesos',
    subtitle: 'GIRSU municipal, lombricultura industrial, PTAR y ciclo de vida (ACV)',
    color: '#a855f7', // Púrpura / Amatista
    glowColor: 'rgba(168, 85, 247, 0.45)',
    bgCard: 'rgba(168, 85, 247, 0.08)',
    borderCard: 'rgba(168, 85, 247, 0.3)',
    icon: 'Recycle',
    angleHint: 'Este-Noreste',
    accentClass: 'text-purple-400',
    tag: 'Transformación Productiva'
  }
];

export const TALENT_NODES = [
  // =========================================================================
  // NODO RAÍZ / TRONCO COMÚN
  // =========================================================================
  {
    id: 'root_core',
    constellationId: 'core',
    title: 'Ingeniería en Ecología & Medio Ambiente',
    shortCode: 'TRONCO-00',
    tier: 0,
    track: 'Fundamento',
    isInstrumental: false,
    x: 500,
    y: 720,
    icon: 'Leaf',
    points: 10,
    desc: 'Fundamento científico colegiado (SIB) en ciencias de la tierra, química ambiental, ecología general y legislación marco boliviana (CPE Art. 342-347, Ley 1333).',
    seramApplication: 'Habilita la participación activa en cualquier proyecto de la consultora.',
    recommendedCert: 'Título en Provisión Nacional + Colegiatura SIB',
    defaultUnlockedFor: ['barrientoso2401@gmail.com', 'fernandoaraujo1912@gmail.com', 'sebastiansbs51@gmail.com']
  },

  // =========================================================================
  // RAMA I: EVALUACIÓN DE IMPACTO AMBIENTAL & RIESGO (EIA)
  // =========================================================================
  {
    id: 'eia_lb_1',
    constellationId: 'eia',
    title: 'Protocolos de Muestreo In Situ & Calibración',
    shortCode: 'EIA-01',
    tier: 1,
    track: 'Línea Base',
    isInstrumental: false,
    x: 160,
    y: 580,
    icon: 'TestTube',
    points: 15,
    desc: 'Calibración de sondas multiparamétricas (pH, CE, OD, turbidez), protocolos de muestreo de agua según Standard Methods y cadena de custodia.',
    seramApplication: 'Campañas de campo y levantamiento de línea base en ríos y cuencas mineras.',
    recommendedCert: 'Curso Práctico de Muestreo de Aguas (SERAM Academy)',
    defaultUnlockedFor: ['barrientoso2401@gmail.com', 'sebastiansbs51@gmail.com']
  },
  {
    id: 'eia_reg_1',
    constellationId: 'eia',
    title: 'Formularios FNCA & Categorización Ley 1333',
    shortCode: 'EIA-02',
    tier: 1,
    track: 'Regulación',
    isInstrumental: false,
    x: 230,
    y: 520,
    icon: 'FileText',
    points: 15,
    desc: 'Estructuración de Formularios de Nivel de Categorización Ambiental (FNCA) y revisión de la lista de inclusión del MMAyA.',
    seramApplication: 'Gestión y clasificación ambiental inicial para clientes industriales y cooperativas.',
    recommendedCert: 'Guía de Trámites Ambientales MMAyA',
    defaultUnlockedFor: ['fernandoaraujo1912@gmail.com']
  },
  {
    id: 'eia_sig_1',
    constellationId: 'eia',
    title: 'Cartografía Vectorial & SIG Minero en QGIS',
    shortCode: 'EIA-SIG',
    tier: 2,
    track: 'Instrumental Espacial',
    isInstrumental: true,
    x: 130,
    y: 450,
    icon: 'Compass',
    points: 20,
    desc: 'Geoprocesamiento vectorial en QGIS/ArcGIS Pro: delimitación de áreas de influencia directa/indirecta (AID/AII) y superposición de cuadrículas mineras.',
    seramApplication: 'Planos oficiales de ubicación y mapas de zonificación para expedientes de licencias.',
    recommendedCert: 'Especialización SIG Aplicado a la Minería',
    defaultUnlockedFor: ['barrientoso2401@gmail.com']
  },
  {
    id: 'eia_lb_2',
    constellationId: 'eia',
    title: 'Monitoreo de Metales Pesados (Hg, As, Pb, CN)',
    shortCode: 'EIA-03',
    tier: 2,
    track: 'Línea Base',
    isInstrumental: false,
    x: 190,
    y: 380,
    icon: 'FlaskConical',
    points: 25,
    desc: 'Muestreo de metales pesados en sedimentos y agua para análisis por Absorción Atómica (AAS) y espectrofotometría.',
    seramApplication: 'Informes periciales hidrogeoquímicos en cooperativas de Guanay, Tipuani y Palos Blancos.',
    recommendedCert: 'Diplomado en Hidrogeoquímica & Contaminantes',
    defaultUnlockedFor: ['barrientoso2401@gmail.com']
  },
  {
    id: 'eia_reg_2',
    constellationId: 'eia',
    title: 'Estudios EEIA & Planes PASA/PPM',
    shortCode: 'EIA-04',
    tier: 3,
    track: 'Regulación',
    isInstrumental: false,
    x: 260,
    y: 340,
    icon: 'Award',
    points: 30,
    desc: 'Elaboración y defensa de Estudios de Evaluación de Impacto Ambiental Analíticos Integrales y Programas de Prevención y Mitigación (PPM-PASA).',
    seramApplication: 'Tramitación de Licencias Ambientales Categoría 1 y 2 ante la Autoridad Ambiental Competente.',
    recommendedCert: 'Registro RENCA Categoría B/A (MMAyA)',
    defaultUnlockedFor: ['fernandoaraujo1912@gmail.com']
  },
  {
    id: 'eia_apex',
    constellationId: 'eia',
    title: 'Dirección de Peritajes & Auditoría de Cierre',
    shortCode: 'EIA-APEX',
    tier: 4,
    track: 'Maestría',
    isInstrumental: false,
    x: 200,
    y: 220,
    icon: 'Crown',
    points: 40,
    desc: 'Auditorías ambientales extraordinarias, planes de remediación de drenaje ácido de mina (DAM) y peritajes técnicos de descargo con validez jurídica.',
    seramApplication: 'Defensa técnica de expedientes de alta complejidad ante juzgados agroambientales y ministerios.',
    recommendedCert: 'Auditor Ambiental Senior RENCA A',
    defaultUnlockedFor: []
  },

  // =========================================================================
  // RAMA II: GESTIÓN AMBIENTAL, SOSTENIBILIDAD & EDGE
  // =========================================================================
  {
    id: 'esg_edge_1',
    constellationId: 'esg_edge',
    title: 'Eficiencia Energética & Modelación Bioclimática',
    shortCode: 'EDGE-01',
    tier: 1,
    track: 'Construcción Verde',
    isInstrumental: false,
    x: 320,
    y: 530,
    icon: 'Sun',
    points: 15,
    desc: 'Cálculo de transmitancia térmica (valores U), relación ventana-pared (WWR), ventilación natural y balance térmico de envolventes edilicias.',
    seramApplication: 'Diseño conceptual preliminar de edificios bioclimáticos para constructoras en La Paz y Santa Cruz.',
    recommendedCert: 'Curso Introductorio de Eficiencia en Edificaciones (IFC)',
    defaultUnlockedFor: []
  },
  {
    id: 'esg_syso_1',
    constellationId: 'esg_edge',
    title: 'Seguridad Ocupacional & Matrices IPERC (NTS-009)',
    shortCode: 'SYSO-01',
    tier: 1,
    track: 'SYSO',
    isInstrumental: false,
    x: 390,
    y: 470,
    icon: 'HardHat',
    points: 15,
    desc: 'Identificación de Peligros, Evaluación de Riesgos y Medidas de Control (IPERC), elaboración de Planes PSST conforme a la NTS-009/23 del MTEPS.',
    seramApplication: 'Planes de seguridad laboral para empresas industriales y contratistas mineras.',
    recommendedCert: 'Especialista en Seguridad y Salud Ocupacional (MTEPS)',
    defaultUnlockedFor: ['fernandoaraujo1912@gmail.com']
  },
  {
    id: 'esg_edge_2',
    constellationId: 'esg_edge',
    title: 'Consultor Acreditado EDGE Expert (IFC/World Bank)',
    shortCode: 'EDGE-EXPERT',
    tier: 2,
    track: 'Construcción Verde',
    isInstrumental: false,
    x: 310,
    y: 370,
    icon: 'Sparkles',
    points: 30,
    desc: 'Manejo del software EDGE App para lograr al menos 20% de ahorro en Energía, Agua y Energía Incorporada en Materiales. Acreditación internacional IFC.',
    seramApplication: 'Asesoría a desarrolladores inmobiliarios para acceso a créditos verdes bancarios (Bancos BNB, BCP, BancoSol).',
    recommendedCert: 'Certificación Oficial EDGE Expert (GBCI / IFC)',
    defaultUnlockedFor: []
  },
  {
    id: 'esg_iso_1',
    constellationId: 'esg_edge',
    title: 'Sistemas Integrados de Gestión (ISO 14001 / 45001)',
    shortCode: 'ISO-01',
    tier: 2,
    track: 'Sistemas de Gestión',
    isInstrumental: false,
    x: 410,
    y: 330,
    icon: 'Layers',
    points: 25,
    desc: 'Diseño e implementación de políticas ambientales, matrices de aspectos e impactos y requisitos legales de seguridad bajo normas ISO.',
    seramApplication: 'Consultoría para empresas corporativas que buscan certificación trinorma.',
    recommendedCert: 'Auditor Interno ISO 14001:2015',
    defaultUnlockedFor: ['fernandoaraujo1912@gmail.com']
  },
  {
    id: 'esg_sig_1',
    constellationId: 'esg_edge',
    title: 'Microclima Urbano & Análisis Espacial de Sitio',
    shortCode: 'EDGE-SIG',
    tier: 2,
    track: 'Instrumental Espacial',
    isInstrumental: true,
    x: 360,
    y: 420,
    icon: 'MapPin',
    points: 20,
    desc: 'Análisis de sombras circundantes, islas de calor urbanas y orientación eólica para optimizar la ubicación de proyectos inmobiliarios.',
    seramApplication: 'Estudios de sitio previos para la postulación a certificaciones sostenibles.',
    recommendedCert: 'Taller de Climatología Urbana en SIG',
    defaultUnlockedFor: []
  },
  {
    id: 'esg_apex',
    constellationId: 'esg_edge',
    title: 'Dirección de Infraestructura Verde & Bonos ESG',
    shortCode: 'ESG-APEX',
    tier: 4,
    track: 'Maestría',
    isInstrumental: false,
    x: 350,
    y: 190,
    icon: 'Shield',
    points: 40,
    desc: 'Auditor Oficial EDGE (EDGE Auditor), debida diligencia de carteras de inversión verde y estructuración de memorias ESG bajo estándares GRI/SASB.',
    seramApplication: 'Dirección de proyectos corporativos de construcción sostenible y fondos multilaterales.',
    recommendedCert: 'Auditor EDGE + Certificación ESG Global',
    defaultUnlockedFor: []
  },

  // =========================================================================
  // RAMA III: CAMBIO CLIMÁTICO & MERCADOS DE CARBONO
  // =========================================================================
  {
    id: 'clim_gei_1',
    constellationId: 'climate_carbon',
    title: 'Inventario de Emisiones Alcance 1 y 2 (GHG Protocol)',
    shortCode: 'CARB-01',
    tier: 1,
    track: 'Huella Carbono',
    isInstrumental: false,
    x: 470,
    y: 500,
    icon: 'Flame',
    points: 15,
    desc: 'Cálculo de emisiones directas por combustión y emisiones indirectas por electricidad consumida según el GHG Protocol y factores del IPCC.',
    seramApplication: 'Medición de huella de carbono para PYMES y empresas industriales bolivianas.',
    recommendedCert: 'Curso de Contabilidad de GEI (GHG Management Institute)',
    defaultUnlockedFor: []
  },
  {
    id: 'clim_carb_1',
    constellationId: 'climate_carbon',
    title: 'Mercados Voluntarios & Art. 6 Acuerdo de París',
    shortCode: 'CARB-02',
    tier: 1,
    track: 'Mercados de Carbono',
    isInstrumental: false,
    x: 530,
    y: 470,
    icon: 'Coins',
    points: 20,
    desc: 'Comprensión de los mecanismos de mercado voluntario (VCM), estándares Verra VCS / Gold Standard, adicionalidad, permanencia y no-fuga.',
    seramApplication: 'Diseño de perfiles de elegibilidad para predios y comunidades interesadas en monetizar carbono.',
    recommendedCert: 'Diplomado en Finanzas de Carbono & Mercados Ambientales',
    defaultUnlockedFor: []
  },
  {
    id: 'clim_sig_1',
    constellationId: 'climate_carbon',
    title: 'Teledetección MRV & Detección de Deforestación',
    shortCode: 'CARB-SIG',
    tier: 2,
    track: 'Instrumental Espacial',
    isInstrumental: true,
    x: 500,
    y: 380,
    icon: 'Satellite',
    points: 25,
    desc: 'Monitoreo, Reporte y Verificación (MRV) con imágenes satelitales ópticas y radar (Sentinel-1/2, Planet): mapeo multitemporal de biomasa y quemas.',
    seramApplication: 'Línea base satelital de deforestación evitada para proyectos forestales y REDD+.',
    recommendedCert: 'Especialista en Teledetección Forestal y Biomasa',
    defaultUnlockedFor: ['barrientoso2401@gmail.com']
  },
  {
    id: 'clim_carb_2',
    constellationId: 'climate_carbon',
    title: 'Diseño de Proyectos de Mitigación (PDD Verra/GS)',
    shortCode: 'CARB-03',
    tier: 3,
    track: 'Mercados de Carbono',
    isInstrumental: false,
    x: 480,
    y: 280,
    icon: 'TrendingUp',
    points: 30,
    desc: 'Redacción del Project Design Document (PDD) para proyectos de carbono forestal (ARR/REDD+), biochar o eficiencia energética bajo estándar Verra.',
    seramApplication: 'Estructuración técnica de proyectos de créditos de carbono transables internacionalmente.',
    recommendedCert: 'Diseñador de Proyectos Verra VCS / Gold Standard',
    defaultUnlockedFor: []
  },
  {
    id: 'clim_apex',
    constellationId: 'climate_carbon',
    title: 'Master en Transacciones de Carbono & Net-Zero',
    shortCode: 'CARB-APEX',
    tier: 4,
    track: 'Maestría',
    isInstrumental: false,
    x: 500,
    y: 130,
    icon: 'Zap',
    points: 40,
    desc: 'Acompañamiento en validación/verificación por entidades auditoras (VVB), colocación de créditos en registries y contratos de compraventa (ERPA).',
    seramApplication: 'Negociación de portafolios climáticos con fondos de inversión verde internacionales.',
    recommendedCert: 'Lead Carbon Project Developer & Article 6 Specialist',
    defaultUnlockedFor: []
  },

  // =========================================================================
  // RAMA IV: CONSERVACIÓN DE BIODIVERSIDAD & SOLUCIONES BASADAS EN LA NATURALEZA (NbS)
  // =========================================================================
  {
    id: 'bio_eco_1',
    constellationId: 'biodiversity_nbs',
    title: 'Inventarios Florísticos & Índices de Diversidad',
    shortCode: 'BIO-01',
    tier: 1,
    track: 'Ecología de Campo',
    isInstrumental: false,
    x: 630,
    y: 520,
    icon: 'Flower2',
    points: 15,
    desc: 'Levantamiento de parcelas botánicas de Gentry, identificación taxonómica y cálculo de índices ecológicos (Shannon-Wiener, Simpson, Margalef).',
    seramApplication: 'Capítulo biológico en estudios de impacto ambiental y diagnósticos de áreas protegidas.',
    recommendedCert: 'Metodologías de Inventario Botánico de Campo',
    defaultUnlockedFor: ['sebastiansbs51@gmail.com']
  },
  {
    id: 'bio_rest_1',
    constellationId: 'biodiversity_nbs',
    title: 'Revegetación Nativa & Control Biológico de Erosión',
    shortCode: 'BIO-02',
    tier: 1,
    track: 'Restauración',
    isInstrumental: false,
    x: 690,
    y: 460,
    icon: 'Sprout',
    points: 15,
    desc: 'Selección de especies nativas pioneras, inoculación de micorrizas y bioingeniería con fajinas y biomantas para taludes degradados.',
    seramApplication: 'Planes de cierre minero y restauración de márgenes ribereñas en los Yungas y Valles.',
    recommendedCert: 'Taller de Bioingeniería de Suelos',
    defaultUnlockedFor: ['sebastiansbs51@gmail.com']
  },
  {
    id: 'bio_sig_1',
    constellationId: 'biodiversity_nbs',
    title: 'Zonificación de Corredores & Conectividad del Paisaje',
    shortCode: 'BIO-SIG',
    tier: 2,
    track: 'Instrumental Espacial',
    isInstrumental: true,
    x: 640,
    y: 410,
    icon: 'Network',
    points: 20,
    desc: 'Modelación de costos de fricción y corredores ecológicos con Circuitscape/QGIS para fauna silvestre y áreas de amortiguamiento.',
    seramApplication: 'Planes de manejo de áreas protegidas municipales y compensación de biodiversidad.',
    recommendedCert: 'Modelación Espacial de Nichos y Conectividad',
    defaultUnlockedFor: ['barrientoso2401@gmail.com']
  },
  {
    id: 'bio_cred_1',
    constellationId: 'biodiversity_nbs',
    title: 'Créditos de Biodiversidad & Marco Kunming-Montreal',
    shortCode: 'BIO-CREDIT',
    tier: 2,
    track: 'Biocréditos',
    isInstrumental: false,
    x: 720,
    y: 350,
    icon: 'Gem',
    points: 25,
    desc: 'Métricas de ganancia neta de naturaleza (Nature Positive), métricas de créditos de biodiversidad emergentes y reporte bajo marco TNFD.',
    seramApplication: 'Asesoramiento a reservas privadas y proyectos comunales para monetizar conservación de hábitat.',
    recommendedCert: 'Especialización en Mercados de Biodiversidad & TNFD',
    defaultUnlockedFor: []
  },
  {
    id: 'bio_nbs_2',
    constellationId: 'biodiversity_nbs',
    title: 'Soluciones Basadas en la Naturaleza (Estándar UICN)',
    shortCode: 'BIO-NBS',
    tier: 3,
    track: 'Restauración',
    isInstrumental: false,
    x: 620,
    y: 290,
    icon: 'HeartHandshake',
    points: 30,
    desc: 'Diseño de intervenciones bajo los 8 criterios del Estándar Global de la UICN: biofiltros de retención, humedales de amortiguamiento y agroforestería.',
    seramApplication: 'Propuestas de resiliencia ecológica para gobiernos municipales y cooperación internacional.',
    recommendedCert: 'Acreditación en Estándar Global UICN para SbN',
    defaultUnlockedFor: []
  },
  {
    id: 'bio_apex',
    constellationId: 'biodiversity_nbs',
    title: 'Dirección de Fondos de Capital Natural & 30x30',
    shortCode: 'BIO-APEX',
    tier: 4,
    track: 'Maestría',
    isInstrumental: false,
    x: 650,
    y: 190,
    icon: 'TreePine',
    points: 40,
    desc: 'Estructuración de fondos fiduciarios de conservación, contratos de servidumbres ecológicas y proyectos de gran escala con fondos verdes globales (GEF/KfW).',
    seramApplication: 'Liderazgo de consorcios y convenios con ONG conservacionistas en Amazonía y Chaco.',
    recommendedCert: 'Director de Programas de Conservación Internacional',
    defaultUnlockedFor: []
  },

  // =========================================================================
  // RAMA V: ECONOMÍA CIRCULAR, BIOPROCESOS & RESIDUOS
  // =========================================================================
  {
    id: 'rec_girsu_1',
    constellationId: 'circular_bio',
    title: 'Caracterización de Residuos & Diagnóstico GIRSU',
    shortCode: 'REC-01',
    tier: 1,
    track: 'GIRSU',
    isInstrumental: false,
    x: 780,
    y: 570,
    icon: 'Trash2',
    points: 15,
    desc: 'Muestreo por cuarteo, determinación de densidad y generación per cápita (PPC) de residuos sólidos conforme a la Norma Boliviana NB 742-760.',
    seramApplication: 'Estudios de diagnóstico y planes municipales de gestión integral de residuos sólidos.',
    recommendedCert: 'Taller de Caracterización y Gestión de Residuos (NB)',
    defaultUnlockedFor: ['sebastiansbs51@gmail.com']
  },
  {
    id: 'rec_bio_1',
    constellationId: 'circular_bio',
    title: 'Lombricultura & Bio-conversión Orgánica Controlada',
    shortCode: 'REC-02',
    tier: 1,
    track: 'Bioprocesos',
    isInstrumental: false,
    x: 840,
    y: 490,
    icon: 'Bug',
    points: 15,
    desc: 'Manejo de lechos de Eisenia foetida, control de balance C/N, humedad y temperatura, cosecha y purificación de humus líquido y sólido.',
    seramApplication: 'Producción de insumos biológicos de la tienda SERAM Store y proyectos agroecológicos.',
    recommendedCert: 'Especialista en Biotecnología de Lombricultura',
    defaultUnlockedFor: ['sebastiansbs51@gmail.com']
  },
  {
    id: 'rec_sig_1',
    constellationId: 'circular_bio',
    title: 'Optimización de Rutas & Emplazamiento de Plantas',
    shortCode: 'REC-SIG',
    tier: 2,
    track: 'Instrumental Espacial',
    isInstrumental: true,
    x: 860,
    y: 420,
    icon: 'Truck',
    points: 20,
    desc: 'Análisis multicriterio de selección de sitio para rellenos sanitarios y optimización de microrrutas de recolección de residuos con SIG.',
    seramApplication: 'Estudios de ingeniería de detalle para alcaldías en licitaciones del SICOES.',
    recommendedCert: 'SIG Aplicado a Servicios Municipales & Logística',
    defaultUnlockedFor: ['barrientoso2401@gmail.com']
  },
  {
    id: 'rec_bio_2',
    constellationId: 'circular_bio',
    title: 'Diseño de Plantas de Compostaje & Bioinsumos',
    shortCode: 'REC-03',
    tier: 2,
    track: 'Bioprocesos',
    isInstrumental: false,
    x: 770,
    y: 380,
    icon: 'Factory',
    points: 25,
    desc: 'Dimensionamiento de canchas de compostaje termofílico, sistemas de volteo mecánico, aireación forzada y biofiltros de control de olores.',
    seramApplication: 'Proyectos llave en mano de plantas de abono orgánico municipal adjudicables por SICOES.',
    recommendedCert: 'Ingeniería de Plantas de Biocompostaje',
    defaultUnlockedFor: ['sebastiansbs51@gmail.com']
  },
  {
    id: 'rec_acv_1',
    constellationId: 'circular_bio',
    title: 'Análisis de Ciclo de Vida (ACV / ISO 14040)',
    shortCode: 'REC-ACV',
    tier: 3,
    track: 'Ciclo de Vida',
    isInstrumental: false,
    x: 820,
    y: 300,
    icon: 'RotateCcw',
    points: 30,
    desc: 'Modelación de impactos desde la cuna a la tumba (cradle-to-grave) con OpenLCA/SimaPro, inventarios de ciclo de vida y ecoetiquetado ambiental.',
    seramApplication: 'Consultoría para productos de exportación y certificaciones de huella ambiental de producto.',
    recommendedCert: 'Certificación Profesional en ACV ISO 14040/44',
    defaultUnlockedFor: []
  },
  {
    id: 'rec_apex',
    constellationId: 'circular_bio',
    title: 'Master en Biorrefinerías & Parques Eco-Industriales',
    shortCode: 'REC-APEX',
    tier: 4,
    track: 'Maestría',
    isInstrumental: false,
    x: 800,
    y: 200,
    icon: 'Building',
    points: 40,
    desc: 'Dirección de proyectos de simbiosis industrial, plantas de valorización energética de residuos (Waste-to-Energy) y programas Zero Waste a escala nacional.',
    seramApplication: 'Consultoría estratégica de economía circular para federaciones industriales y ministerios.',
    recommendedCert: 'Director de Economía Circular & Simbiosis Industrial',
    defaultUnlockedFor: []
  }
];

// =========================================================================
// CONEXIONES VISUALES (LÍNEAS DE ENERGÍA DE LA CONSTELACIÓN)
// =========================================================================
export const TALENT_CONNECTIONS = [
  // Conexiones desde el Tronco Raíz hacia el inicio de cada Constelación
  { from: 'root_core', to: 'eia_lb_1', constellationId: 'eia' },
  { from: 'root_core', to: 'eia_reg_1', constellationId: 'eia' },
  { from: 'root_core', to: 'esg_edge_1', constellationId: 'esg_edge' },
  { from: 'root_core', to: 'esg_syso_1', constellationId: 'esg_edge' },
  { from: 'root_core', to: 'clim_gei_1', constellationId: 'climate_carbon' },
  { from: 'root_core', to: 'clim_carb_1', constellationId: 'climate_carbon' },
  { from: 'root_core', to: 'bio_eco_1', constellationId: 'biodiversity_nbs' },
  { from: 'root_core', to: 'bio_rest_1', constellationId: 'biodiversity_nbs' },
  { from: 'root_core', to: 'rec_girsu_1', constellationId: 'circular_bio' },
  { from: 'root_core', to: 'rec_bio_1', constellationId: 'circular_bio' },

  // Rama I: EIA & Riesgo
  { from: 'eia_lb_1', to: 'eia_lb_2', constellationId: 'eia' },
  { from: 'eia_lb_1', to: 'eia_sig_1', constellationId: 'eia' },
  { from: 'eia_reg_1', to: 'eia_reg_2', constellationId: 'eia' },
  { from: 'eia_sig_1', to: 'eia_lb_2', constellationId: 'eia' },
  { from: 'eia_lb_2', to: 'eia_apex', constellationId: 'eia' },
  { from: 'eia_reg_2', to: 'eia_apex', constellationId: 'eia' },

  // Rama II: ESG & EDGE
  { from: 'esg_edge_1', to: 'esg_edge_2', constellationId: 'esg_edge' },
  { from: 'esg_edge_1', to: 'esg_sig_1', constellationId: 'esg_edge' },
  { from: 'esg_syso_1', to: 'esg_iso_1', constellationId: 'esg_edge' },
  { from: 'esg_edge_2', to: 'esg_apex', constellationId: 'esg_edge' },
  { from: 'esg_iso_1', to: 'esg_apex', constellationId: 'esg_edge' },

  // Rama III: Clima & Carbono
  { from: 'clim_gei_1', to: 'clim_sig_1', constellationId: 'climate_carbon' },
  { from: 'clim_carb_1', to: 'clim_carb_2', constellationId: 'climate_carbon' },
  { from: 'clim_sig_1', to: 'clim_carb_2', constellationId: 'climate_carbon' },
  { from: 'clim_carb_2', to: 'clim_apex', constellationId: 'climate_carbon' },

  // Rama IV: Biodiversidad & NbS
  { from: 'bio_eco_1', to: 'bio_sig_1', constellationId: 'biodiversity_nbs' },
  { from: 'bio_eco_1', to: 'bio_cred_1', constellationId: 'biodiversity_nbs' },
  { from: 'bio_rest_1', to: 'bio_nbs_2', constellationId: 'biodiversity_nbs' },
  { from: 'bio_cred_1', to: 'bio_apex', constellationId: 'biodiversity_nbs' },
  { from: 'bio_nbs_2', to: 'bio_apex', constellationId: 'biodiversity_nbs' },

  // Rama V: Circular & Bioprocesos
  { from: 'rec_girsu_1', to: 'rec_sig_1', constellationId: 'circular_bio' },
  { from: 'rec_bio_1', to: 'rec_bio_2', constellationId: 'circular_bio' },
  { from: 'rec_girsu_1', to: 'rec_acv_1', constellationId: 'circular_bio' },
  { from: 'rec_bio_2', to: 'rec_apex', constellationId: 'circular_bio' },
  { from: 'rec_acv_1', to: 'rec_apex', constellationId: 'circular_bio' },

  // PUENTES TRANSVERSALES DE ALTO VALOR (Sin bloqueos forzados)
  // Puente 1: De Mercados de Carbono a Biocréditos (ambas finanzas ambientales)
  { from: 'clim_carb_1', to: 'bio_cred_1', constellationId: 'bridge', isCrossBridge: true },
  // Puente 2: De EDGE Expert a Inventarios GEI
  { from: 'esg_edge_2', to: 'clim_gei_1', constellationId: 'bridge', isCrossBridge: true },
  // Puente 3: De Bioprocesos a NbS
  { from: 'rec_bio_2', to: 'bio_nbs_2', constellationId: 'bridge', isCrossBridge: true }
];

/**
 * Obtener estado de talentos desbloqueados guardados en localStorage
 */
export function getSavedTalentState() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('seram_talent_tree_state');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error al leer seram_talent_tree_state', e);
    return {};
  }
}

/**
 * Guardar estado de un talento para un socio
 */
export function saveTalentStatus(partnerEmail, nodeId, isUnlocked, certData = null) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedTalentState();
    if (!current[partnerEmail]) {
      current[partnerEmail] = { unlocked: {}, certs: {} };
    }
    current[partnerEmail].unlocked[nodeId] = isUnlocked;
    if (certData) {
      current[partnerEmail].certs[nodeId] = certData;
    } else if (!isUnlocked) {
      delete current[partnerEmail].certs[nodeId];
    }
    localStorage.setItem('seram_talent_tree_state', JSON.stringify(current));
  } catch (e) {
    console.error('Error al guardar estado de talento', e);
  }
}

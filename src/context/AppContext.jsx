import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // --- AUTH & ROLES ---
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [activeRole, setActiveRole] = useState('AccessLimit');
  const [currentSocio, setCurrentSocio] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'barrientoso2401@gmail.com', role: 'AdminMod', name: 'Ing. Diego Barrientos', isPremiumApproved: true },
    { email: 'fernandoaraujo1912@gmail.com', role: 'AdminMod', name: 'Ing. Fernando Araujo', isPremiumApproved: true },
    { email: 'sebastiansbs51@gmail.com', role: 'AdminMod', name: 'Ing. Fabricio Orosco', isPremiumApproved: true },
  ]);

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
    { id: 1, title: 'Introducción a la Fiscalización Ambiental', instructor: 'Ing. Fernando Araujo', students: 124, status: 'Activo', isPremium: false, type: 'curso_gratis', image: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=600', duration: '6 horas', desc: 'Aprende las nociones fundamentales de fiscalización bajo la normativa de medio ambiente boliviana.' },
    { id: 2, title: 'SIG Aplicado al Ordenamiento Territorial (QGIS)', instructor: 'Ing. Diego Barrientos', students: 85, status: 'Activo', isPremium: true, type: 'curso_pago', price: 150, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600', duration: '20 horas', desc: 'Dominio de sistemas de información geográfica aplicados al mapeo de cuencas y zonificación.', prerequisiteId: 1 },
    { id: 3, title: 'Taller Práctico: Lombricultura e Hidro-Compostaje', instructor: 'Ing. Fabricio Orosco', students: 42, status: 'Activo', isPremium: false, type: 'taller', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600', duration: '4 horas', desc: 'Instalación paso a paso de composteras orgánicas domésticas e industriales.' },
    { id: 4, title: 'Masterclass: Cálculo de Huella de Carbono Corporativa', instructor: 'Ing. Fabricio Orosco', students: 60, status: 'Activo', isPremium: true, type: 'masterclass', price: 90, image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=600', duration: '3 horas', desc: 'Metodologías de cuantificación bajo directrices de protocolo de gases de efecto invernadero.', prerequisiteId: 1 },
    { id: 5, title: 'Ebook: Guía Práctica de la Ley 1333 de Medio Ambiente', instructor: 'SERAM Legal', students: 210, status: 'Activo', isPremium: true, type: 'libro', price: 15, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600', duration: '80 páginas', desc: 'Compendio interpretado de legislación boliviana y reglamentos de prevención y control.' },
    { id: 6, title: 'Audiolibro: Liderazgo y Sostenibilidad Ecosistémica', instructor: 'Ing. Diego Barrientos', students: 95, status: 'Activo', isPremium: false, type: 'audiolibro', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600', duration: '2.5 horas', desc: 'Perspectivas audibles sobre la integración del desarrollo económico y la conservación ambiental.' },
    { id: 7, title: 'Suscripción Academia Premium (Anual)', instructor: 'SERAM Team', students: 150, status: 'Activo', isPremium: true, type: 'suscripcion', price: 35, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600', duration: 'Membresía anual', desc: 'Acceso ilimitado a todos los cursos de pago, masterclasses y ebooks de SERAM.' }
  ]);

  // --- PROJECTS ---
  const [activeServices, setActiveServices] = useState([
    { id: 101, client: 'Minera Los Andes', type: 'Estudio de Impacto Ambiental (EsIA)', progress: 85, lead: 'Ing. Diego Barrientos', startDate: '2026-01-15', endDate: '2026-08-30', involved: ['Ing. Fabricio Orosco'], budget: 25000, labCosts: 3000, subcontractorCosts: 4000, taxRegime: 'Régimen General' },
    { id: 102, client: 'EcoIndustrial S.A.', type: 'Auditoría de Gestión de Residuos', progress: 40, lead: 'Ing. Fabricio Orosco', startDate: '2026-03-01', endDate: '2026-12-15', involved: ['Ing. Fernando Araujo'], budget: 15000, labCosts: 1000, subcontractorCosts: 2000, taxRegime: 'Régimen General' },
    { id: 103, client: 'Municipio Metropolitano', type: 'Plan de Ordenamiento Territorial', progress: 100, lead: 'Ing. Fernando Araujo', startDate: '2025-10-01', endDate: '2026-05-30', involved: ['Ing. Diego Barrientos'], budget: 35000, labCosts: 5000, subcontractorCosts: 6000, taxRegime: 'Régimen General' },
  ]);

  // --- DINAMIC SERVICES IN PUBLIC SITE ---
  const [publicServices, setPublicServices] = useState([
    // Línea 1
    { id: 'srv-1', title: 'FNCA', line: 'Trámites Ambientales Express', desc: 'El Formulario de Nivel de Categorización Ambiental (FNCA) es el Instrumento de Regulación de Alcance Particular (IRAP) obligatorio por normativa boliviana para definir el rumbo legal de tu Licencia Ambiental. Nosotros lo gestionamos con precisión técnica para que tu obra civil o comercial empiece a generar ingresos sin mirar atrás.', tag: 'RENCA A', icon: 'FileText' },
    { id: 'srv-2', title: 'Registro Ambiental Industrial (RAI)', line: 'Trámites Ambientales Express', desc: 'Protege tu fábrica de precintos y multas. Gestionamos tu Registro Ambiental Industrial (RAI) y la categorización industrial obligatoria para industrias manufactureras urbanas de categorías 3 y 4 con velocidad express y blindaje legal garantizado.', tag: 'RENCA A', icon: 'Activity' },
    { id: 'srv-3', title: 'Formulario de Prospección Minera (PM) y EMAP', line: 'Trámites Ambientales Express', desc: 'Evita retrasos críticos en el inicio de tus operaciones. Diseñamos soluciones cartográficas exactas y elaboramos carpetas rápidas para minería para la aprobación ágil del plan EMAP y trámites de prospección minera en tus concesiones mineras.', tag: 'RENCA A', icon: 'Compass' },
    // Línea 2
    { id: 'srv-4', title: 'PSST (Higiene y Seguridad)', line: 'Ingeniería y Seguridad Industrial', desc: 'Programa de Seguridad y Salud en el Trabajo visado por Ingeniero SySO externo habilitado ante el Min. de Trabajo.', tag: 'Brokerage', icon: 'Briefcase' },
    { id: 'srv-5', title: 'LASP (Sustancias Peligrosas)', line: 'Ingeniería y Seguridad Industrial', desc: 'Trámite de Licencia de Actividades con Sustancias Peligrosas para manejo y almacenamiento de químicos.', tag: 'Brokerage', icon: 'Trash2' },
    { id: 'srv-6', title: 'Manifiestos Ambientales (MA)', line: 'Ingeniería y Seguridad Industrial', desc: 'Adecuación ambiental para proyectos en marcha Categorías 1 y 2, firmados por peritos RENCA B/C externos.', tag: 'Brokerage', icon: 'Leaf' },
    { id: 'srv-7', title: 'Monitoreos Físicos de Laboratorio', line: 'Ingeniería y Seguridad Industrial', desc: 'Monitoreo de ruido laboral, iluminación, calidad de agua y aire subcontratando laboratorios certificados.', tag: 'Brokerage', icon: 'Globe' },
    // Línea 3
    { id: 'srv-8', title: 'Análisis de Deforestación y Quemas', line: 'Servicios GIS Ambientales', desc: 'Análisis multitemporal de cobertura forestal y quemas mediante imágenes satelitales.', tag: 'SIG', icon: 'Map' },
    { id: 'srv-9', title: 'Mapeo y Zonificación para POP', line: 'Servicios GIS Ambientales', desc: 'Diseño de mapas temáticos para Planes de Ordenamiento Predial bajo normas de la ABT.', tag: 'SIG', icon: 'Compass' },
    { id: 'srv-10', title: 'Soporte Cartográfico B2B', line: 'Servicios GIS Ambientales', desc: 'Tercerización de análisis espacial y dibujo de planos para consultores y empresas senior.', tag: 'SIG', icon: 'FileText' },
    { id: 'srv-11', title: 'Riesgo Hidrológico e Inundaciones', line: 'Servicios GIS Ambientales', desc: 'Modelamiento hidráulico predictivo y mapas de inundación para constructoras e inmobiliarias.', tag: 'SIG', icon: 'Activity' },
    { id: 'srv-12', title: 'Cálculo de Huella de Carbono', line: 'Servicios GIS Ambientales', desc: 'Cuantificación corporativa de gases de efecto invernadero (Alcances 1, 2 y 3) bajo GHG Protocol.', tag: 'Sostenibilidad', icon: 'Leaf' },
    { id: 'srv-13', title: 'Sostenibilidad de Exportación', line: 'Servicios GIS Ambientales', desc: 'Análisis de ciclo de vida (ACV) y descarbonización para cumplir barreras verdes internacionales.', tag: 'Sostenibilidad', icon: 'Globe' },
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

  // --- TIME LOGS (intranet tracker) ---
  const [timeLogs, setTimeLogs] = useState([
    { id: 1, partner_id: 'barrientoso2401@gmail.com', partner_name: 'Ing. Diego Barrientos', project_id: 101, project_title: 'Minera Los Andes', hours: 4.5, description: 'Revisión y corrección del EsIA - Minera Los Andes', logged_at: '2026-06-23T14:30:00Z' },
    { id: 2, partner_id: 'fernandoaraujo1912@gmail.com', partner_name: 'Ing. Fernando Araujo', project_id: 102, project_title: 'EcoIndustrial S.A.', hours: 6.0, description: 'Auditoría in-situ y muestreo de suelos', logged_at: '2026-06-24T09:00:00Z' },
  ]);

  // --- PRODUCTS (mutable) ---
  const [productList, setProductList] = useState([
    { id: 11, name: 'Compostera Doméstica Lombri-Kit', price: 85, category: 'Bio-Insumos', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400', desc: 'Kit de compostaje con núcleo de lombrices rojas californianas y manual de bio-huerto.', stock: 35, isPremium: false },
    { id: 12, name: 'Kit Analítico de Calidad de Agua', price: 120, category: 'Monitoreo', image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=400', desc: 'Medidores digitales portátiles de pH, TDS y reactivos químicos para análisis rápido de agua.', stock: 15, isPremium: true },
    { id: 13, name: 'Ebook: Guía Práctica de la Ley 1333', price: 15, category: 'E-Books', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400', desc: 'Versión digital en PDF del compendio interpretado de legislación boliviana. Desbloquea lectura en Academy.', stock: 9999, isPremium: false, courseId: 5 },
    { id: 14, name: 'QGIS Geo-Database Bolivia (Zonificación)', price: 95, category: 'SIG & Mapas', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400', desc: 'Capas vectoriales listas (SHP/GPKG) de áreas protegidas, hidrografía y suelos de Bolivia.', stock: 50, isPremium: true },
    { id: 15, name: 'Bolsa Ecológica Reutilizable SERAM', price: 8, category: 'Merchandise', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400', desc: 'Yute natural de alta densidad para compras conscientes.', stock: 200, isPremium: false },
    { id: 16, name: 'Ebook: Técnicas de Restauración Ecológica', price: 18, category: 'E-Books', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400', desc: 'Guía práctica ilustrada de restauración y remediación forestal aplicada. Desbloquea contenido.', stock: 9999, isPremium: false },
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

  // --- LOAD DATA FROM SUPABASE WITH RESILIENT FALLBACK ---
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');
        if (coursesError) {
          if (coursesError.code === 'PGRST205') {
            console.warn('[Supabase AppContext Load]: La tabla "courses" no existe. Usando datos mock locales.');
          } else {
            throw coursesError;
          }
        } else if (coursesData && coursesData.length > 0) {
          const mappedCourses = coursesData.map(c => ({
            id: c.id,
            title: c.title,
            instructor: c.instructor,
            students: c.students || 0,
            status: c.status || 'Activo',
            isPremium: c.is_premium
          }));
          setCourses(mappedCourses);
        }

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*');
        if (projectsError) {
          if (projectsError.code === 'PGRST205') {
            console.warn('[Supabase AppContext Load]: La tabla "projects" no existe. Usando datos mock locales.');
          } else {
            throw projectsError;
          }
        } else if (projectsData && projectsData.length > 0) {
          const mappedProjects = projectsData.map(p => ({
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

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
        if (productsError) {
          if (productsError.code === 'PGRST205') {
            console.warn('[Supabase AppContext Load]: La tabla "products" no existe. Usando datos mock locales.');
          } else {
            throw productsError;
          }
        } else if (productsData && productsData.length > 0) {
          const mappedProducts = productsData.map(p => ({
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

        // Fetch time logs
        const { data: logsData, error: logsError } = await supabase
          .from('time_logs')
          .select('*');
        if (logsError) {
          if (logsError.code === 'PGRST205') {
            console.warn('[Supabase AppContext Load]: La tabla "time_logs" no existe. Usando datos mock locales.');
          } else {
            throw logsError;
          }
        } else if (logsData && logsData.length > 0) {
          const mappedLogs = logsData.map(l => {
            return {
              id: l.id,
              partner_id: l.partner_id,
              partner_name: l.partner_name || 'Socio',
              project_id: l.project_id,
              project_title: l.project_title || 'Proyecto',
              hours: parseFloat(l.hours),
              description: l.description,
              logged_at: l.logged_at
            };
          });
          setTimeLogs(mappedLogs);
        }
      } catch (err) {
        console.warn('[Supabase AppContext Load Error]: Fallo al cargar datos. Usando fallbacks locales.', err.message);
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
  const handlePartnerLogin = (e) => {
    e.preventDefault();
    if (secretPassword === 'seram2026') {
      const partnersList = registeredUsers.filter(u => u.role === 'AdminMod');
      const partner = partnersList[selectedPartnerIndex];
      if (partner) {
        setActiveRole('AdminMod');
        setCurrentSocio(partner);
        setShowSecretModal(false);
        setSecretPassword('');
        triggerToast(`¡Bienvenido, ${partner.name}! Redirigiendo al Dashboard.`, 'success');
        return { success: true };
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

  const handleAddCourse = async (title, instructor) => {
    if (!title || !instructor) return;
    const newCourse = { 
      id: Date.now(), 
      title, 
      instructor, 
      students: 0, 
      status: 'Nuevo', 
      isPremium: false 
    };

    setCourses(prev => [...prev, newCourse]);
    triggerToast('Nuevo curso registrado en SERAM ACADEMY', 'success');

    try {
      const { error } = await supabase.from('courses').insert([{
        title,
        instructor,
        students: 0,
        status: 'Nuevo',
        is_premium: false
      }]);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
    } catch (err) {
      console.warn('[Supabase Sync Warning - AddCourse]:', err.message);
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

  return (
    <AppContext.Provider value={{
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
      experiences, setExperiences,
      timeLogs, setTimeLogs,
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
      handleAddCourse, handleDeleteCourse, handleToggleCoursePremium,
      handleAddProject, handleUpdateProjectProgress, handleDeleteProject,
      handleEditProject, handleConcludeProject,
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

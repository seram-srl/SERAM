import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // --- AUTH & ROLES ---
  const [activeRole, setActiveRole] = useState('AccessLimit');
  const [currentSocio, setCurrentSocio] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'barrientoso2401@gmail.com', role: 'AdminMod', name: 'Ing. Diego Barrientos', isPremiumApproved: true },
    { email: 'fernandoaraujo1912@gmail.com', role: 'AdminMod', name: 'Ing. Fernando Araujo', isPremiumApproved: true },
    { email: 'sebastiansbs51@gmail.com', role: 'AdminMod', name: 'Ing. Fabricio Orosco', isPremiumApproved: true },
    { email: 'freddy@gmail.com', role: 'AdminMod', name: 'Ing. Freddy Farrachol', isPremiumApproved: true },
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




  // --- COURSES ---
  const [courses, setCourses] = useState([
    { id: 1, title: 'Introducción a la Fiscalización Ambiental', instructor: 'Ing. Fernando Araujo', students: 124, status: 'Activo', isPremium: false, type: 'curso_gratis', image: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=600', duration: '6 horas', desc: 'Aprende las nociones fundamentales de fiscalización bajo la normativa de medio ambiente boliviana.' },
    { id: 2, title: 'SIG Aplicado al Ordenamiento Territorial (QGIS)', instructor: 'Ing. Diego Barrientos', students: 85, status: 'Activo', isPremium: true, type: 'curso_pago', price: 150, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600', duration: '20 horas', desc: 'Dominio de sistemas de información geográfica aplicados al mapeo de cuencas y zonificación.' },
    { id: 3, title: 'Taller Práctico: Lombricultura e Hidro-Compostaje', instructor: 'Ing. Fabricio Orosco', students: 42, status: 'Activo', isPremium: false, type: 'taller', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600', duration: '4 horas', desc: 'Instalación paso a paso de composteras orgánicas domésticas e industriales.' },
    { id: 4, title: 'Masterclass: Cálculo de Huella de Carbono Corporativa', instructor: 'Ing. Fabricio Orosco', students: 60, status: 'Activo', isPremium: true, type: 'masterclass', price: 90, image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=600', duration: '3 horas', desc: 'Metodologías de cuantificación bajo directrices de protocolo de gases de efecto invernadero.' },
    { id: 5, title: 'Ebook: Guía Práctica de la Ley 1333 de Medio Ambiente', instructor: 'SERAM Legal', students: 210, status: 'Activo', isPremium: true, type: 'libro', price: 15, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600', duration: '80 páginas', desc: 'Compendio interpretado de legislación boliviana y reglamentos de prevención y control.' },
    { id: 6, title: 'Audiolibro: Liderazgo y Sostenibilidad Ecosistémica', instructor: 'Ing. Diego Barrientos', students: 95, status: 'Activo', isPremium: false, type: 'audiolibro', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600', duration: '2.5 horas', desc: 'Perspectivas audibles sobre la integración del desarrollo económico y la conservación ambiental.' },
    { id: 7, title: 'Suscripción Academia Premium (Anual)', instructor: 'SERAM Team', students: 150, status: 'Activo', isPremium: true, type: 'suscripcion', price: 35, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600', duration: 'Membresía anual', desc: 'Acceso ilimitado a todos los cursos de pago, masterclasses y ebooks de SERAM.' }
  ]);

  // --- PROJECTS ---
  const [activeServices, setActiveServices] = useState([
    { id: 101, client: 'Minera Los Andes', type: 'Estudio de Impacto Ambiental (EsIA)', progress: 85, lead: 'Ing. Diego Barrientos', startDate: '2026-01-15', endDate: '2026-08-30', involved: ['Ing. Fabricio Orosco', 'Ing. Freddy Farrachol'] },
    { id: 102, client: 'EcoIndustrial S.A.', type: 'Auditoría de Gestión de Residuos', progress: 40, lead: 'Ing. Fabricio Orosco', startDate: '2026-03-01', endDate: '2026-12-15', involved: ['Ing. Fernando Araujo'] },
    { id: 103, client: 'Municipio Metropolitano', type: 'Plan de Ordenamiento Territorial', progress: 100, lead: 'Ing. Fernando Araujo', startDate: '2025-10-01', endDate: '2026-05-30', involved: ['Ing. Diego Barrientos', 'Ing. Freddy Farrachol'] },
  ]);

  // --- EXPERIENCES ---
  const [experiences, setExperiences] = useState([
    { id: 201, name: 'Voluntariado de Restauración Ecológica', date: '2026-07-12', location: 'Valle de Zongo', capacity: 20, enrolled: 14, price: 0, type: 'Voluntariado', status: 'Activo' },
    { id: 202, name: 'Expedición Científica Salar de Uyuni', date: '2026-08-05', location: 'Potosí, Bolivia', capacity: 12, enrolled: 8, price: 350, type: 'Ecoturismo', status: 'Activo' },
    { id: 203, name: 'Taller de Lombricultura Urbana', date: '2026-07-20', location: 'La Paz, Bolivia', capacity: 25, enrolled: 25, price: 80, type: 'Taller', status: 'Lleno' },
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

  const handleAddProject = async (client, type, lead, startDate, endDate, involved = []) => {
    const newProj = {
      id: Date.now(),
      client,
      type,
      progress: 10,
      lead: lead || currentSocio?.name || 'Ing. Diego Barrientos',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      involved: involved
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
        involved
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
  const handleAddProduct = (prod) => {
    setProductList(prev => [...prev, { id: Date.now(), ...prod, isPremium: false }]);
    triggerToast('Producto añadido al catálogo', 'success');
  };

  const handleEditProduct = (id, fields) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
    triggerToast('Producto actualizado', 'success');
  };

  const handleDeleteProduct = (id) => {
    setProductList(prev => prev.filter(p => p.id !== id));
    triggerToast('Producto eliminado del catálogo', 'info');
  };

  const handleToggleProductPremium = (id) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, isPremium: !p.isPremium } : p));
  };

  return (
    <AppContext.Provider value={{
      // Auth
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
      // Modals
      showPremiumRegisterModal, setShowPremiumRegisterModal,
      showPremiumBlockedModal, setShowPremiumBlockedModal,
      blockedItemName,
      // Toast
      toast, triggerToast,
      // Handlers
      handleLogoClick, handlePartnerLogin, handleRegister,
      handleAccessItem, handleAddToCart, handleRemoveFromCart, handleCheckout,
      handleAddCourse, handleDeleteCourse, handleToggleCoursePremium,
      handleAddProject, handleUpdateProjectProgress, handleDeleteProject,
      handleEditProject, handleConcludeProject,
      handleToggleUserPremium, handleRevokeUserAccess, handleLogoutPartner,
      // Experience handlers
      handleAddExperience, handleEditExperience, handleDeleteExperience, handleEnrollExperience,
      // Product handlers
      handleAddProduct, handleEditProduct, handleDeleteProduct, handleToggleProductPremium,
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

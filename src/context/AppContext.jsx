import React, { createContext, useContext, useState, useEffect } from 'react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // --- AUTH & ROLES ---
  const [activeRole, setActiveRole] = useState('AccessLimit');
  const [currentSocio, setCurrentSocio] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'socio1@seram.com', role: 'AdminMod', name: 'Ing. Carlos Mendoza', isPremiumApproved: true },
    { email: 'socio2@seram.com', role: 'AdminMod', name: 'Ing. Elena Rostova', isPremiumApproved: true },
    { email: 'socio3@seram.com', role: 'AdminMod', name: 'Ing. Javier Altamirano', isPremiumApproved: true },
    { email: 'socio4@seram.com', role: 'AdminMod', name: 'Ing. Sofía Valenzuela', isPremiumApproved: true },
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

  // --- PRODUCTS ---
  const [products] = useState([
    { id: 1, name: 'Gorra SERAM Eco-Comfort', price: 15, category: 'Merchandise', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400', desc: 'Gorra fabricada con 100% algodón orgánico reciclado.', stock: 45, isPremium: false },
    { id: 2, name: 'Polera Deportiva SERAM Dry-Green', price: 25, category: 'Merchandise', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400', desc: 'Polera de poliéster marino reciclado con tecnología dry-fit.', stock: 32, isPremium: false },
    { id: 3, name: 'Cuaderno para Colorear: Biodiversidad', price: 10, category: 'Educativo', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400', desc: 'Ilustraciones de flora y fauna local para educación ambiental.', stock: 120, isPremium: false },
    { id: 4, name: 'Curso: Evaluación de Impacto Ambiental', price: 150, category: 'Cursos', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400', desc: 'Curso teórico-práctico con certificación oficial SERAM.', stock: 999, isPremium: true },
    { id: 5, name: 'Bolsa Ecológica Reutilizable SERAM', price: 8, category: 'Ecológico', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400', desc: 'Yute natural de alta densidad para compras conscientes.', stock: 200, isPremium: false },
    { id: 6, name: 'Curso: Restauración de Ecosistemas Degradados', price: 180, category: 'Cursos', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400', desc: 'Estrategias aplicadas a la bioremediación ecológica.', stock: 999, isPremium: true },
  ]);

  // --- COURSES ---
  const [courses, setCourses] = useState([
    { id: 1, title: 'Legislación y Normativa Ambiental', instructor: 'Ing. Elena Rostova', students: 48, status: 'Activo', isPremium: false },
    { id: 2, title: 'Sistemas de Información Geográfica (SIG) Aplicado', instructor: 'Ing. Javier Altamirano', students: 65, status: 'Activo', isPremium: true },
    { id: 3, title: 'Huella de Carbono Corporativa', instructor: 'Dr. Luis Ortega', students: 30, status: 'En Edición', isPremium: true },
  ]);

  // --- PROJECTS ---
  const [activeServices, setActiveServices] = useState([
    { id: 101, client: 'Minera Los Andes', type: 'Estudio de Impacto Ambiental (EsIA)', progress: 85, lead: 'Carlos Mendoza' },
    { id: 102, client: 'EcoIndustrial S.A.', type: 'Auditoría de Gestión de Residuos', progress: 40, lead: 'Javier Altamirano' },
    { id: 103, client: 'Municipio Metropolitano', type: 'Plan de Ordenamiento Territorial', progress: 100, lead: 'Elena Rostova' },
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

  const handleAddCourse = (title, instructor) => {
    if (!title || !instructor) return;
    setCourses(prev => [...prev, { id: Date.now(), title, instructor, students: 0, status: 'Nuevo', isPremium: false }]);
    triggerToast('Nuevo curso registrado en SERAM ACADEMY', 'success');
  };

  const handleDeleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    triggerToast('Curso eliminado correctamente', 'info');
  };

  const handleToggleCoursePremium = (id) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isPremium: !c.isPremium } : c));
  };

  const handleAddProject = (client, type) => {
    setActiveServices(prev => [...prev, { id: Date.now(), client, type, progress: 10, lead: currentSocio?.name || 'Carlos Mendoza' }]);
    triggerToast('Proyecto registrado correctamente', 'success');
  };

  const handleUpdateProjectProgress = (id) => {
    setActiveServices(prev => prev.map(p => p.id === id ? { ...p, progress: Math.min(p.progress + 10, 100) } : p));
  };

  const handleDeleteProject = (id) => {
    setActiveServices(prev => prev.filter(p => p.id !== id));
    triggerToast('Proyecto eliminado del monitor', 'info');
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
      products, courses, setCourses, activeServices, setActiveServices,
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
      handleToggleUserPremium, handleRevokeUserAccess, handleLogoutPartner,
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

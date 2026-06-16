import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ── Componentes de la capa UI cinematográfica (flotan sobre el canvas WebGL)
// z-index y pointer-events definidos en src/components/ui/cinematic-ui.css
import FullscreenMenu  from './components/ui/FullscreenMenu';
import CustomCursor    from './components/ui/CustomCursor';
import EnvironmentalCanvas from './components/ui/EnvironmentalCanvas';
import SecretAuthModal from './components/ui/SecretAuthModal';

// ── Componentes globales de soporte
import Navbar          from './components/shared/Navbar';
import Toast           from './components/shared/Toast';
import PartnerModal    from './components/shared/PartnerModal';

// ── Feature pages (cada una es un módulo SRP independiente)
import HomePage        from './features/home/HomePage';
import AcademyPage     from './features/academy/AcademyPage';
import CoursePlayerPage from './features/academy/CoursePlayerPage';
import ServicesPage    from './features/services/ServicesPage';
import QuotePage       from './features/services/QuotePage';
import ExperiencePage  from './features/experience/ExperiencePage';
import ShopPage        from './features/shop/ShopPage';
import PartnerDashboard from './features/partner-portal/PartnerDashboard';

export default function App() {
  const location = useLocation();

  // Estado del menú fullscreen — compartido entre FullscreenMenu y MovieCredits
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  return (
    /*
     * CAPA DE COMPOSICIÓN DE LA UI (DOM)
     * ─────────────────────────────────────────────────────────────────────
     * z-index: 0   → Canvas WebGL (fondo, position: fixed, pointer-events: none)
     * z-index: 10  → Contenido HTML de páginas (textos, secciones)
     * z-index: 50  → MovieCredits (decorativo, pointer-events: none)
     * z-index: 50  → Navbar (navegación compacta visible fuera del menú)
     * z-index: 100 → FullscreenMenu + trigger hamburger
     * z-index: 101 → PartnerModal (sobre el menú)
     * z-index: 200 → CustomCursor (siempre encima de todo)
     */
    <div
      className="min-h-screen cinematic-bg text-slate-100 font-sans"
      style={{ position: 'relative' }}
    >
      {/* ── CAPA z-0: Fondo WebGL tridimensional ─────────────────────────── */}
      {location.pathname !== '/' && <EnvironmentalCanvas />}

      {/* ── CAPA z-2: Vignette degradé lateral para el home y páginas ───── */}
      <div className="vignette-overlay-sides" />

      {/* ── CAPA z-200: Cursor personalizado ─────────────────────────────── */}
      <CustomCursor />

      {/* ── CAPA z-101: Modal de portal secreto de socios ────────────────── */}
      <PartnerModal />

      {/* ── CAPA z-120: Modal de autenticación ultra-secreta de socios ──── */}
      <SecretAuthModal />

      {/* ── CAPA z-100: Menú fullscreen + botón hamburger ────────────────── */}
      {/*
        El FullscreenMenu gestiona internamente su pointer-events:
        none cuando cerrado, auto cuando abierto.
        Ver: src/components/ui/cinematic-ui.css → .fullscreen-menu
      */}
      <FullscreenMenu isOpen={isMenuOpen} onToggle={toggleMenu} />



      <Navbar isOpen={isMenuOpen} onToggle={toggleMenu} />

      {/* ── CAPA z-200: Sistema de notificaciones globales ────────────────── */}
      <Toast />

      {/* ── CAPA z-10: Contenido principal con transiciones de ruta ─────── */}
      {/*
        Cada página se monta con AnimatePresence y Framer Motion.
        El contenido HTML siempre tiene z-index relativo sobre el canvas.
      */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"           element={<HomePage />}         />
            <Route path="/quote"      element={<QuotePage />}        />
            <Route path="/academy"    element={<AcademyPage />}      />
            <Route path="/academy/course/:id" element={<CoursePlayerPage />} />
            <Route path="/services"   element={<ServicesPage />}     />
            <Route path="/experience" element={<ExperiencePage />}   />
            <Route path="/shop"       element={<ShopPage />}         />
            <Route path="/dashboard"  element={<PartnerDashboard />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

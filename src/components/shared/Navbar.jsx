import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CartDrawer from './CartDrawer';
import Magnetic from '../ui/Magnetic';


/**
 * @component Navbar
 * @description Cabecera minimalista y ultra-cinemática.
 * Posiciona el botón Hamburger y el logotipo oficial lado a lado en la esquina superior izquierda
 * para mantener la experiencia inmersiva libre de barras sólidas tradicionales.
 *
 * @param {boolean} isOpen - Estado de apertura del menú fullscreen.
 * @param {function} onToggle - Función para alternar el menú fullscreen.
 */
export default function Navbar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cart,
    showCart,
    setShowCart,
    setShowSecretPortal,
    triggerToast,
  } = useApp();

  const clickTrackerRef = useRef({ count: 0, lastTime: 0 });
  const [scrollZone, setScrollZone] = useState('dark'); // 'dark' | 'bright'
  const [scrollY, setScrollY] = useState(0);

  // Detectar zona de scroll y posición vertical para adaptar contraste y logos interactivos
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      // Zona 30%-70% = fondos potencialmente brillantes
      setScrollZone(progress > 0.28 && progress < 0.72 ? 'bright' : 'dark');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoSecretClick = () => {
    const now = Date.now();
    const tracker = clickTrackerRef.current;
    const diff = now - tracker.lastTime;

    if (diff < 500) {
      tracker.count += 1;
      if (tracker.count >= 5) {
        setShowSecretPortal(true);
        tracker.count = 0;
      }
    } else {
      tracker.count = 1;
    }
    tracker.lastTime = now;
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.qty, 0);

  // Estilos adaptativos del contenedor del logo
  const logoContainerStyle = scrollZone === 'bright'
    ? {
        background: 'rgba(1,4,9,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '6px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
      }
    : {
        filter: 'drop-shadow(0 0 12px rgba(0,224,60,0.45))',
      };

  const logoTextShadow = scrollZone === 'bright'
    ? { textShadow: '0 2px 8px rgba(0,0,0,0.9)' }
    : { textShadow: '0 0 16px rgba(0,224,60,0.3)' };

  return (
    <>
      {/* ── LOGOTIPO Y BOTÓN HAMBURGER FIJOS AL COSTADO IZQUIERDO ──────────────── */}
      <div 
        className="fixed top-6 left-6 z-[110] flex items-center gap-6 pointer-events-auto select-none"
      >
        {/* BOTÓN HAMBURGER DE ACCIÓN (Animado por CSS y activador GSAP) */}
        <Magnetic>
          <button
            id="menu-trigger"
            className={`menu-trigger ${isOpen ? 'is-open' : ''}`}
            onClick={onToggle}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
            aria-controls="fullscreen-menu-panel"
          >
            <span className="menu-trigger__bar" aria-hidden="true" />
            <span className="menu-trigger__bar" aria-hidden="true" />
            <span className="menu-trigger__bar" aria-hidden="true" />
          </button>
        </Magnetic>

        {/* LOGO DE MARCA CON SENSOR SECRETO DE SOCIOS (Oculto en portada de Home) */}
        <Magnetic>
          <div
            className={`flex items-center gap-1.5 cursor-none select-none transition-all duration-700 ease-out ${
              location.pathname === '/'
                ? 'opacity-0 pointer-events-none -translate-x-6'
                : 'opacity-100 pointer-events-auto translate-x-0'
            }`}
            style={logoContainerStyle}
            onClick={() => {
              navigate('/');
              handleLogoSecretClick();
            }}
          >
            <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
              <img
                src="/assets/brand/ícono_logo.png"
                alt="Logo SERAM"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline">
                <span className="text-xl font-black text-white tracking-tight" style={logoTextShadow}>SER</span>
                <span className="text-xl font-black text-[#00e03c] tracking-tight" style={logoTextShadow}>A</span>
                <span className="text-xl font-black text-white tracking-tight" style={logoTextShadow}>M</span>
              </div>
            </div>
          </div>
        </Magnetic>

        {/* CARRITO CONDICIONAL AL LADO DEL LOGO */}
        {cartTotal > 0 && (
          <Magnetic>
            <button
              onClick={() => setShowCart(!showCart)}
              className="p-3 rounded-full bg-slate-950/80 border border-white/10 hover:border-[#00e03c] text-slate-400 hover:text-[#00e03c] transition-all cursor-none pointer-events-auto relative animate-fadeIn"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-[#00e03c] text-slate-950 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                {cartTotal}
              </span>
            </button>
          </Magnetic>
        )}
      </div>

      {/* LOGO DE MARCA CENTRADO EN EL HEADER (Aparece en Home al hacer scroll y desaparecer el del Hero) */}
      {location.pathname === '/' && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[109] pointer-events-auto select-none transition-all duration-700 ease-out flex items-center gap-1.5 cursor-pointer ${
            scrollY >= window.innerHeight * 0.65
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-4 scale-90 pointer-events-none'
          }`}
          style={logoContainerStyle}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            handleLogoSecretClick();
          }}
        >
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
            <img
              src="/assets/brand/ícono_logo.png"
              alt="Logo SERAM"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline">
              <span className="text-lg font-black text-white tracking-tight" style={logoTextShadow}>SER</span>
              <span className="text-lg font-black text-[#00e03c] tracking-tight" style={logoTextShadow}>A</span>
              <span className="text-lg font-black text-white tracking-tight" style={logoTextShadow}>M</span>
            </div>
          </div>
        </div>
      )}

      {/* CARRITO DRAWER GLOBAL */}
      {showCart && <CartDrawer />}
    </>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CartDrawer from './CartDrawer';

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
  const {
    cart,
    showCart,
    setShowCart,
    setShowSecretPortal,
    triggerToast,
  } = useApp();

  const clickTrackerRef = React.useRef({ count: 0, lastTime: 0 });

  const handleLogoSecretClick = () => {
    const now = Date.now();
    const tracker = clickTrackerRef.current;
    const diff = now - tracker.lastTime;

    if (diff < 500) {
      tracker.count += 1;
      if (tracker.count >= 5) {
        setShowSecretPortal(true);
        tracker.count = 0;
        triggerToast('¡Acceso al portal secreto activado!', 'success');
      } else {
        triggerToast(`Acceso Socio: ${tracker.count}/5`, 'info');
      }
    } else {
      tracker.count = 1;
      triggerToast('Acceso Socio: 1/5', 'info');
    }
    tracker.lastTime = now;
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <>
      {/* ── LOGOTIPO Y BOTÓN HAMBURGER FIJOS AL COSTADO IZQUIERDO ──────────────── */}
      <div 
        className="fixed top-6 left-6 z-[110] flex items-center gap-6 pointer-events-auto select-none"
      >
        {/* BOTÓN HAMBURGER DE ACCIÓN (Animado por CSS y activador GSAP) */}
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

        {/* LOGO DE MARCA CON SENSOR SECRETO DE SOCIOS */}
        <div
          className="flex items-center gap-3 cursor-none select-none"
          onClick={() => {
            navigate('/');
            handleLogoSecretClick();
          }}
          data-cursor-text="INICIO"
        >
          <div className="relative w-10 h-10 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="leafGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E03C" />
                  <stop offset="100%" stopColor="#007F1A" />
                </linearGradient>
              </defs>
              <circle cx="28" cy="22" r="7" fill="#007F1A" />
              <circle cx="56" cy="25" r="5" fill="#007F1A" />
              <circle cx="44" cy="33" r="3.5" fill="#007F1A" />
              <circle cx="23.5" cy="40.5" r="3.5" fill="#007F1A" />
              <path d="M72 32 C70 55, 62 82, 42 82 C22 82, 18 64, 28 48 C38 32, 60 25, 72 32 Z" fill="url(#leafGradNav)" />
              <path d="M28 82 C34 72, 43 55, 59 47" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline">
              <span className="text-xl font-black text-white tracking-tight">SER</span>
              <span className="text-xl font-black text-[#00e03c] tracking-tight">A</span>
              <span className="text-xl font-black text-white tracking-tight">M</span>
            </div>
            <span className="text-[7.5px] uppercase tracking-[0.22em] font-bold text-slate-500 mt-1">
              Servicios Ambientales
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTÓN DEL CARRITO DE COMPRAS EN LA ESQUINA SUPERIOR DERECHA ──────── */}
      <button
        onClick={() => setShowCart(!showCart)}
        className="fixed top-6 right-6 z-[110] p-3 rounded-full bg-slate-950/80 border border-white/10 hover:border-[#00e03c] text-slate-400 hover:text-[#00e03c] transition-all cursor-none pointer-events-auto"
        data-cursor-text="CARRITO"
      >
        <ShoppingCart className="w-4 h-4" />
        {cartTotal > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#00e03c] text-slate-950 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
            {cartTotal}
          </span>
        )}
      </button>

      {/* CARRITO DRAWER GLOBAL */}
      {showCart && <CartDrawer />}
    </>
  );
}

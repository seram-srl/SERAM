/**
 * @file FullscreenMenu.jsx
 * @description Menú fullscreen cinematográfico animado con GSAP (efecto stagger).
 * 
 * ARQUITECTURA: SRP y desacoplada de la capa estética.
 * CONTRATOS WebGL:
 * ─ z-index: 100 (--z-menu) — siempre sobre el canvas
 * ─ pointer-events: none cuando cerrado (no bloquea clics al 3D)
 * ─ pointer-events: auto cuando abierto
 */

import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { gsap } from 'gsap';
import './cinematic-ui.css';

const NAV_ITEMS = [
  { to: '/',           label: 'Inicio',          index: '01' },
  { to: '/academy',    label: 'SERAM ACADEMY',   index: '02' },
  { to: '/services',   label: 'SERAM SERVICES',  index: '03' },
  { to: '/experience', label: 'SERAM EXPERIENCE',index: '04' },
  { to: '/shop',       label: 'SERAM STORE',     index: '05' },
  { to: '/contact',    label: 'CONTACTO',        index: '06' },
];


export default function FullscreenMenu({ isOpen, onToggle }) {
  const location = useLocation();
  const { activeRole, currentSocio, handleLogoutPartner, supabaseUser, handleLogoutPublic } = useApp();

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onToggle(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onToggle]);

  // Cerrar al cambiar de ruta
  const lastPathname = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== lastPathname.current) {
      lastPathname.current = location.pathname;
      if (isOpen) onToggle();
    }
  }, [location.pathname, isOpen, onToggle]);

  // Animaciones GSAP para efecto Stagger
  useEffect(() => {
    if (isOpen) {
      // 1. Entrada de los enlaces con retardo stagger
      gsap.fromTo('.fullscreen-menu__link',
        { y: '110%' },
        {
          y: '0%',
          duration: 0.8,
          ease: 'power4.out',
          stagger: 0.08,
          overwrite: 'auto'
        }
      );

      // 2. Escala de la línea divisora
      gsap.fromTo('.fullscreen-menu__divider',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.15,
          overwrite: 'auto'
        }
      );

      // 3. Aparición suave de la metadata y legalidad inferior
      gsap.fromTo(['.fullscreen-menu__meta', '.fullscreen-menu__legal'],
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.35,
          overwrite: 'auto'
        }
      );
    } else {
      // Animaciones de salida rápidas y limpias
      gsap.to('.fullscreen-menu__link', {
        y: '110%',
        duration: 0.4,
        ease: 'power3.in',
        overwrite: 'auto'
      });
      gsap.to('.fullscreen-menu__divider', {
        scaleX: 0,
        duration: 0.4,
        ease: 'power3.in',
        overwrite: 'auto'
      });
      gsap.to(['.fullscreen-menu__meta', '.fullscreen-menu__legal'], {
        y: 15,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.in',
        overwrite: 'auto'
      });
    }
  }, [isOpen]);

  return (
    <>
      {/* ── PANEL FULLSCREEN ──────────────────────────────────────────────── */}
      <nav
        id="fullscreen-menu-panel"
        className={`fullscreen-menu ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navegación principal SERAM"
      >
        {/* Capa traslúcida suave para contraste en textos permitiendo ver el fondo 3D / página con claridad */}
        <div
          className="fullscreen-menu__backdrop-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(1, 4, 9, 0.58) 0%, rgba(1, 4, 9, 0.35) 50%, rgba(1, 4, 9, 0.12) 100%)',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity var(--dur-menu-open) var(--transition-menu)',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />

        <div className="fullscreen-menu__panel">
          {/* Línea divisora */}
          <div className="fullscreen-menu__divider" aria-hidden="true" />

          {/* Enlaces de navegación */}
          <ul
            style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}
            role="list"
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.to} className="fullscreen-menu__item" role="listitem">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `fullscreen-menu__link ${isActive ? 'is-active' : ''}`
                  }
                  data-index={item.index}
                  style={({ isActive }) => ({
                    color: isActive ? 'rgba(0, 224, 60, 0.85)' : undefined,
                  })}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}

            {/* Dashboard directivo (solo visible para AdminMod) */}
            {activeRole === 'AdminMod' && (
              <li className="fullscreen-menu__item" role="listitem">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `fullscreen-menu__link ${isActive ? 'is-active' : ''}`
                  }
                  data-index="07"
                  style={({ isActive }) => ({
                    color: isActive ? '#00e03c' : 'rgba(0, 224, 60, 0.4)',
                  })}
                >
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* Enlaces de legalidad al costado inferior izquierdo con interlinking */}
          <div className="fullscreen-menu__legal">
            <p className="fullscreen-menu__meta-label">Legalidad</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <NavLink
                to="/privacidad"
                onClick={onToggle}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textDecoration: 'none' }}
                className="hover:text-[#00e03c] transition-colors font-medium cursor-pointer"
              >
                Privacidad
              </NavLink>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>•</span>
              <NavLink
                to="/terminos"
                onClick={onToggle}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textDecoration: 'none' }}
                className="hover:text-[#00e03c] transition-colors font-medium cursor-pointer"
              >
                Términos
              </NavLink>
            </div>
          </div>

          {/* Metadata de usuario al costado inferior derecho (posicionado abajo) */}
          <div className="fullscreen-menu__meta">
            {activeRole === 'AdminMod' && currentSocio ? (
              <div>
                <p className="fullscreen-menu__meta-label">Socio Activo</p>
                <p className="fullscreen-menu__meta-value" style={{ color: '#00e03c', fontWeight: 700 }}>
                  {currentSocio.name}
                </p>
                <button
                  type="button"
                  onClick={handleLogoutPartner}
                  className="fullscreen-menu__meta-value cursor-pointer hover:text-red-400 transition-colors"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(239, 68, 68, 0.85)',
                    padding: 0,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    marginTop: '0.35rem',
                    display: 'block',
                    marginLeft: 'auto',
                    textAlign: 'right',
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : supabaseUser ? (
              <div>
                <p className="fullscreen-menu__meta-label">Usuario Conectado</p>
                <p
                  className="fullscreen-menu__meta-value text-ellipsis overflow-hidden"
                  style={{ color: '#00e03c', fontSize: '0.75rem', fontWeight: 700, maxWidth: '240px' }}
                  title={supabaseUser.email}
                >
                  {supabaseUser.email}
                </p>
                <button
                  type="button"
                  onClick={handleLogoutPublic}
                  className="fullscreen-menu__meta-value cursor-pointer hover:text-red-400 transition-colors"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(239, 68, 68, 0.85)',
                    padding: 0,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    marginTop: '0.35rem',
                    display: 'block',
                    marginLeft: 'auto',
                    textAlign: 'right',
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div>
                <p className="fullscreen-menu__meta-label">Mi Cuenta</p>
                <NavLink
                  to="/login"
                  onClick={onToggle}
                  className="fullscreen-menu__meta-value hover:text-[#00ff44] transition-colors cursor-pointer"
                  style={{
                    color: '#00e03c',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'block',
                    textAlign: 'right',
                  }}
                >
                  Iniciar sesión
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

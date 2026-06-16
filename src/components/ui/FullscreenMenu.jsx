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

import React, { useEffect } from 'react';
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
];


export default function FullscreenMenu({ isOpen, onToggle }) {
  const location = useLocation();
  const { activeRole, currentSocio, handleLogoutPartner } = useApp();

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
  useEffect(() => {
    if (isOpen) onToggle();
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

      // 3. Aparición suave de la metadata a la derecha
      gsap.fromTo('.fullscreen-menu__meta',
        { y: 30, opacity: 0 },
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
      gsap.to('.fullscreen-menu__meta', {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
        overwrite: 'auto'
      });
    }
  }, [isOpen]);

  const getActiveLabel = () => {
    const match = NAV_ITEMS.find(n => n.to === location.pathname);
    return match?.label ?? 'Inicio';
  };

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
        {/* 1. Capa de imagen de fondo sutil con difuminado */}
        <div
          className="fullscreen-menu__backdrop-image"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/assets/3d-backend/menu-background.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isOpen ? 0.35 : 0,
            transition: 'opacity var(--dur-menu-open) var(--transition-menu)',
            zIndex: -1,
            pointerEvents: 'none',
            filter: 'blur(4px)',
          }}
        />

        {/* 2. Capa de gradiente oscuro para asegurar contraste y énfasis en el contenido */}
        <div
          className="fullscreen-menu__backdrop-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(1, 4, 9, 0.82) 0%, rgba(1, 4, 9, 0.94) 100%)',
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
                  data-index="06"
                  style={({ isActive }) => ({
                    color: isActive ? '#00e03c' : 'rgba(0, 224, 60, 0.4)',
                  })}
                >
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* Metadata de apoyo lateral */}
          <div className="fullscreen-menu__meta" aria-hidden="true">
            {activeRole === 'AdminMod' && currentSocio && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="fullscreen-menu__meta-label">Socio Activo</p>
                <p className="fullscreen-menu__meta-value" style={{ color: '#00e03c' }}>
                  {currentSocio.name}
                </p>
                <button
                  onClick={handleLogoutPartner}
                  className="fullscreen-menu__meta-value"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(239, 68, 68, 0.7)',
                    cursor: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    marginTop: '0.25rem',
                    display: 'block',
                    textAlign: 'right',
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}

            <p className="fullscreen-menu__meta-label">Sección Activa</p>
            <p className="fullscreen-menu__meta-value">{getActiveLabel()}</p>

            <p className="fullscreen-menu__meta-label" style={{ marginTop: '1.25rem' }}>
              Dirección & Socios
            </p>
            <p className="fullscreen-menu__meta-value">
              Ing. Diego Barrientos<br />
              Ing. Fernando Araujo<br />
              Ing. Fabricio Orosco
            </p>

            <p className="fullscreen-menu__meta-label" style={{ marginTop: '1.25rem' }}>
              Legales
            </p>
            <p className="fullscreen-menu__meta-value text-right" style={{ fontSize: '0.68rem', opacity: 0.8, lineHeight: 1.6 }}>
              <a href="#" className="hover:text-[#00e03c] transition-colors" style={{ cursor: 'none' }}>Términos y condiciones</a><br />
              <a href="#" className="hover:text-[#00e03c] transition-colors" style={{ cursor: 'none' }}>Políticas y cookies</a><br />
              <span className="text-slate-500 text-[9px] uppercase tracking-wider block mt-1">© 2026 SERAM. v2.5</span>
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}

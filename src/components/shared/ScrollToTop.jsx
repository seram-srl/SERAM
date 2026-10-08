import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const LEGAL_PATHS = ['/privacidad', '/terminos', '/cookies', '/reembolsos'];

/**
 * ScrollToTop
 * Restablece la posición de scroll a la cabecera (top: 0, left: 0) cada vez que el usuario
 * navega a una página independiente (Servicios, Academy, Legalidad, etc.).
 * Si el usuario únicamente conmuta de pestaña dentro del Centro de Legalidad,
 * se preserva la posición relativa para favorecer el efecto crossfade sincronizado.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Desactivar la restauración nativa de scroll del navegador en SPAs
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const wasLegal = LEGAL_PATHS.includes(prevPathRef.current);
    const isLegal = LEGAL_PATHS.includes(pathname);

    // Navegación a cualquier página nueva o entrada a Legal desde el exterior
    if (!wasLegal || !isLegal) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Respaldo ante micro-demoras de montaje de Framer Motion
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    }

    prevPathRef.current = pathname;
  }, [pathname]);

  return null;
}

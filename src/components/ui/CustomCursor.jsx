import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './cinematic-ui.css';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClickable, setIsClickable] = useState(false);

  // Motion values para la posición del mouse
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Configuración física elástica
  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Escuchar eventos táctiles vs mouse
  useEffect(() => {
    // Solo mostrar el cursor si es un dispositivo apuntador fino (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) {
      return;
    }

    setIsVisible(true);

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor-text], a, button, [role="button"], .cursor-hover-premium');
      if (target) {
        const text = target.getAttribute('data-cursor-text');
        if (text) {
          setCursorText(text);
          setIsHovered(true);
        } else {
          setIsClickable(true);
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('[data-cursor-text], a, button, [role="button"], .cursor-hover-premium');
      if (target) {
        setCursorText('');
        setIsHovered(false);
        setIsClickable(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <div className="custom-cursor-container">
      {/* Anillo exterior animado elástico */}
      <motion.div
        className="custom-cursor-ring"
        style={{
          left: cursorX,
          top: cursorY,
        }}
        animate={{
          width: isHovered ? 80 : isClickable ? 48 : 32,
          height: isHovered ? 80 : isClickable ? 48 : 32,
          backgroundColor: isHovered ? '#00e03c' : 'rgba(0, 224, 60, 0.0)',
          borderColor: isHovered ? '#00e03c' : '#00e03c',
          opacity: isHovered || isClickable ? 1 : 0,
          scale: isHovered || isClickable ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 250,
          mass: 0.5,
        }}
      >
        {isHovered && cursorText && (
          <span className="custom-cursor-text">
            {cursorText}
          </span>
        )}
      </motion.div>

      {/* Punto central (sigue al mouse directamente con un spring más rápido para que se sienta reactivo) */}
      <motion.div
        className="custom-cursor-dot"
        style={{
          left: mouseX,
          top: mouseY,
        }}
        animate={{
          scale: isHovered ? 0 : isClickable ? 1.5 : 1,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{
          duration: 0.15,
        }}
      />
    </div>
  );
}

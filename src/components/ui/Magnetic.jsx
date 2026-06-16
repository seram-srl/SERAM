import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * @component Magnetic
 * @description Contenedor elástico que atrae físicamente a sus elementos hijos
 * hacia la posición del mouse, emulando la interactividad premium de agencias de diseño.
 */
export default function Magnetic({ children }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Calcular el centro del elemento
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Fuerza de atracción magnética (factor 0.35)
    const x = (clientX - centerX) * 0.35;
    const y = (clientY - centerY) * 0.35;
    
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 0.2 }}
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.div>
  );
}

import React, { useEffect, useRef } from 'react';

/**
 * @component BrandParticleText
 * @description Renders "SERAM" brand logo using interactive, cursor-reactive canvas particles.
 * "SER" in white, "A" in emerald green, "M" in white.
 */
export default function BrandParticleText() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 85 });
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración de dimensiones responsivas con soporte para High-DPI Retina
    const handleResize = () => {
      const rect = canvas.parentNode.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const isMobile = window.innerWidth < 640;
      const canvasHeight = isMobile ? 220 : 180;
      
      // Ajustar tamaño lógico y físico
      canvas.width = rect.width * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${canvasHeight}px`;
      
      ctx.scale(dpr, dpr);
      initParticles(rect.width, canvasHeight);
    };

    // Inicialización de partículas extrayendo píxeles de un canvas oculto
    const initParticles = (width, height) => {
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      
      offscreen.width = width;
      offscreen.height = height;
      
      // Ajustar dinámicamente el tamaño de la tipografía
      const isMobile = window.innerWidth < 640;
      const fontSize = isMobile 
        ? Math.min(width / 4.8, 90)
        : Math.min(width / 6.2, 135);
      offCtx.font = `900 ${fontSize}px 'Outfit', 'Inter', sans-serif`;
      offCtx.textAlign = 'left';
      offCtx.textBaseline = 'middle';
      
      // Limpiar lienzo temporal
      offCtx.clearRect(0, 0, width, height);

      // Dibujar texto coloreado por letras para intercepción automática de color
      const text = 'SERAM';
      const textWidth = offCtx.measureText(text).width;
      const startX = (width - textWidth) / 2;
      const centerY = height / 2;

      let currentX = startX;

      // Dibujar letra por letra para capturar colores de pixel perfectos
      // "SER" (blanco)
      offCtx.fillStyle = '#ffffff';
      offCtx.fillText('SER', startX, centerY);
      currentX += offCtx.measureText('SER').width;

      // "A" (verde esmeralda)
      offCtx.fillStyle = '#00e03c';
      offCtx.fillText('A', currentX, centerY);
      currentX += offCtx.measureText('A').width;

      // "M" (blanco)
      offCtx.fillStyle = '#ffffff';
      offCtx.fillText('M', currentX, centerY);

      // Extraer datos de píxeles
      const imgData = offCtx.getImageData(0, 0, width, height).data;
      const particles = [];
      const step = width < 600 ? 3 : 2; // Densidad adaptativa para móviles/escritorio

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (x + y * width) * 4;
          const alpha = imgData[index + 3];

          if (alpha > 120) {
            const r = imgData[index];
            const g = imgData[index + 1];
            const b = imgData[index + 2];
            const color = `rgb(${r}, ${g}, ${b})`;

            particles.push({
              x: x,
              y: y,
              baseX: x,
              baseY: y,
              vx: 0,
              vy: 0,
              color: color,
              size: Math.random() * 1.2 + 1.1, // Tamaño sutil y premium
              density: Math.random() * 30 + 12, // Resistencia física
              noiseSeedX: Math.random() * 100,
              noiseSeedY: Math.random() * 100
            });
          }
        }
      }
      particlesRef.current = particles;
    };

    // Escuchas del mouse locales al canvas para precisión posicional
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    // Escuchas táctiles para dispositivos móviles
    const handleTouchStart = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches[0]) {
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
      }
    };

    const handleTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches[0]) {
        mouseRef.current.x = e.touches[0].clientX - rect.left;
        mouseRef.current.y = e.touches[0].clientY - rect.top;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    // Vincular redimensionamiento y eventos de interacción
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Ejecución inicial de escala y renderizado
    handleResize();

    // Variables de simulación
    const springK = 0.08; // Fuerza del resorte de retorno
    const damping = 0.82;  // Fricción
    const repulseStrength = 180; // Fuerza de empuje del mouse
    let time = 0;

    // Bucle de animación por frame (Canvas 2D de 60fps)
    const animate = () => {
      time += 0.02;
      const rect = canvas.getBoundingClientRect();
      const logicalWidth = rect.width;
      const logicalHeight = window.innerWidth < 640 ? 220 : 180;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Distorsión/Repulsión elástica por el Cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius; // Rango de 0 a 1
          const angle = Math.atan2(dy, dx);
          
          // Fuerza inversamente proporcional a la densidad física asignada
          const repulseX = Math.cos(angle) * force * repulseStrength / p.density;
          const repulseY = Math.sin(angle) * force * repulseStrength / p.density;
          
          p.vx += repulseX;
          p.vy += repulseY;
        }

        // 2. Ley de Hooke (Fuerza del resorte hacia su base original)
        const ax = (p.baseX - p.x) * springK;
        const ay = (p.baseY - p.y) * springK;

        // 3. Simulación e integración física LERP con fricción
        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;

        p.x += p.vx;
        p.y += p.vy;

        // 4. Micro-vuelo orgánico (Simular partículas de polen/esporas en el aire)
        const noiseX = Math.sin(time + p.noiseSeedX) * 0.12;
        const noiseY = Math.cos(time + p.noiseSeedY) * 0.12;

        // 5. Dibujar partícula
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x + noiseX, p.y + noiseY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
      }
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-center h-[220px] sm:h-[180px] overflow-hidden select-none pointer-events-auto">
      <canvas
        ref={canvasRef}
        className="block cursor-none"
      />
    </div>
  );
}

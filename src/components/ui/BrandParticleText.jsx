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
  const lastWidthRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentNode;
    if (!parent) return;

    // Configuración de dimensiones responsivas con soporte para High-DPI Retina
    const handleResize = (entries) => {
      let width = 0;
      if (entries && entries[0]) {
        width = entries[0].contentRect.width;
      } else {
        width = parent.getBoundingClientRect().width;
      }
      
      // Evitar inicialización si el ancho es 0 (elemento colapsado u oculto temporalmente)
      if (width === 0) return;
      
      // Evitar reinicialización si el ancho no ha cambiado (previene bugs en móviles al ocultarse/mostrarse la barra de navegación que altera solo el alto)
      if (width === lastWidthRef.current) return;
      lastWidthRef.current = width;

      const dpr = window.devicePixelRatio || 1;
      const isMobile = window.innerWidth < 640;
      const canvasHeight = isMobile ? 220 : 180;
      const w = Math.floor(width);
      
      // Adaptar el radio de dispersión del mouse según resolución móvil/desktop
      mouseRef.current.radius = isMobile ? 45 : 85;
      
      // Ajustar tamaño lógico y físico
      canvas.width = w * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${canvasHeight}px`;
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const runInit = () => initParticles(w, canvasHeight);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(runInit);
      } else {
        runInit();
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      handleResize(entries);
    });
    resizeObserver.observe(parent);

    // Inicialización de partículas extrayendo píxeles de un canvas oculto con paso entero exacto
    const initParticles = (w, h) => {
      if (w <= 0 || h <= 0) return;

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      
      offscreen.width = w;
      offscreen.height = h;
      
      const isMobile = window.innerWidth < 640;
      const fontSize = isMobile 
        ? Math.min(w / 4.2, 95)
        : Math.min(w / 6.2, 135);
      offCtx.font = `900 ${fontSize}px 'Outfit', 'Inter', sans-serif`;
      offCtx.textAlign = 'left';
      offCtx.textBaseline = 'middle';
      
      offCtx.clearRect(0, 0, w, h);

      const serWidth = offCtx.measureText('SER').width;
      const aWidth = offCtx.measureText('A').width;
      const mWidth = offCtx.measureText('M').width;
      const totalWidth = serWidth + aWidth + mWidth;
      const startX = (w - totalWidth) / 2;
      const centerY = h / 2;

      // Dibujar texto monocromático sólido para extracción precisa de máscara
      offCtx.fillStyle = '#ffffff';
      offCtx.fillText('SER', startX, centerY);
      offCtx.fillText('A', startX + serWidth, centerY);
      offCtx.fillText('M', startX + serWidth + aWidth, centerY);

      const imgData = offCtx.getImageData(0, 0, w, h).data;
      const particles = [];
      const step = isMobile ? 1.5 : 2.0;

      const serEndX = startX + serWidth;
      const aEndX = serEndX + aWidth;

      for (let y = 0; y < h; y += step) {
        const yInt = Math.floor(y);
        for (let x = 0; x < w; x += step) {
          const xInt = Math.floor(x);
          const index = (xInt + yInt * w) * 4;
          const alpha = imgData[index + 3];

          if (alpha > 120) {
            // Color puro y exacto según la letra, garantizando cero aberración o franjas
            const isA = xInt >= serEndX && xInt < aEndX;
            const color = isA ? '#00e03c' : '#ffffff';

            particles.push({
              x: xInt,
              y: yInt,
              baseX: xInt,
              baseY: yInt,
              vx: 0,
              vy: 0,
              color: color,
              size: isMobile ? 1.6 : 1.35,
              density: Math.random() * 25 + 15,
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
    const isMobileDevice = window.innerWidth < 640;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Desactivar interacción touch en móvil para que el scroll del usuario no disperse y deforme el logotipo
    if (!isMobileDevice) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }

    // Ejecución inicial de escala y renderizado
    handleResize();

    // Variables de simulación adaptativas para móviles/escritorio
    const springK = isMobileDevice ? 0.13 : 0.08; // Fuerza de retorno más alta en móviles para evitar letras rotas duraderas
    const damping = isMobileDevice ? 0.80 : 0.82;  // Fricción adaptada
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
      resizeObserver.disconnect();
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        if (!isMobileDevice) {
          canvas.removeEventListener('touchstart', handleTouchStart);
          canvas.removeEventListener('touchmove', handleTouchMove);
          canvas.removeEventListener('touchend', handleTouchEnd);
          canvas.removeEventListener('touchcancel', handleTouchEnd);
        }
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

import React, { useEffect, useRef } from 'react';

/**
 * @component BrandParticleText
 * @description Renders the official "SERAM" brand wordmark using interactive, cursor-reactive canvas particles.
 * Typography and letterforms are sampled directly from the official logo mask:
 * - "SER" in pure white
 * - "A" in botanical/emerald green (#00e03c) with official negative-space droplet cutout
 * - "M" in pure white
 * Interactive physics: Hooke's law spring return + mouse repulsion + organic spore micro-drift.
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

    let currentW = 0;
    let currentH = 0;

    // Cargar imagen de las letras oficiales de SERAM
    const img = new Image();
    img.src = '/assets/brand/logo-seram-letters.png';

    // Inicialización de partículas extrayendo píxeles de la máscara tipográfica oficial
    const initParticles = (w, h) => {
      if (w <= 0 || h <= 0) return;
      currentW = w;
      currentH = h;

      if (!img.complete || img.naturalWidth === 0) {
        img.onload = () => {
          if (currentW > 0 && currentH > 0) {
            initParticles(currentW, currentH);
          }
        };
        return;
      }

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      offscreen.width = w;
      offscreen.height = h;

      const isMobile = window.innerWidth < 640;
      // Proporción original de las letras: 1365 x 293 (ratio: ~4.6587)
      const letterRatio = 1365 / 293;
      let drawW = isMobile ? Math.min(w * 0.94, 380) : Math.min(w * 0.88, 620);
      let drawH = drawW / letterRatio;

      // Asegurar que quepa en el alto del contenedor con margen
      if (drawH > h * 0.85) {
        drawH = h * 0.85;
        drawW = drawH * letterRatio;
      }

      const startX = Math.floor((w - drawW) / 2);
      const startY = Math.floor((h - drawH) / 2);

      offCtx.clearRect(0, 0, w, h);
      offCtx.drawImage(img, startX, startY, drawW, drawH);

      const imgData = offCtx.getImageData(0, 0, w, h).data;
      const particles = [];
      const step = isMobile ? 2 : 3;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const index = (x + y * w) * 4;
          const alpha = imgData[index + 3];

          if (alpha > 110) {
            const r = imgData[index];
            const g = imgData[index + 1];
            const b = imgData[index + 2];

            // La letra 'A' oficial es verde botánico (G > R + 20 y G > B + 20)
            const isGreenA = g > r + 20 && g > b + 20;
            const color = isGreenA ? '#00e03c' : '#ffffff';

            particles.push({
              x,
              y,
              baseX: x,
              baseY: y,
              vx: 0,
              vy: 0,
              color,
              size: isMobile ? 1.3 : 1.45,
              density: Math.random() * 25 + 15,
              noiseSeedX: Math.random() * 100,
              noiseSeedY: Math.random() * 100
            });
          }
        }
      }
      particlesRef.current = particles;
    };

    // Configuración de dimensiones responsivas con soporte para High-DPI Retina
    const handleResize = (entries) => {
      let width = 0;
      if (entries && entries[0]) {
        width = entries[0].contentRect.width;
      } else {
        width = parent.getBoundingClientRect().width;
      }

      if (width === 0) return;
      if (width === lastWidthRef.current) return;
      lastWidthRef.current = width;

      const dpr = window.devicePixelRatio || 1;
      const isMobile = window.innerWidth < 640;
      const canvasHeight = isMobile ? 160 : 180;
      const w = Math.floor(width);

      mouseRef.current.radius = isMobile ? 45 : 85;

      canvas.width = w * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${canvasHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initParticles(w, canvasHeight);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      handleResize(entries);
    });
    resizeObserver.observe(parent);

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

    const isMobileDevice = window.innerWidth < 640;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    if (!isMobileDevice) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }

    handleResize();

    const springK = isMobileDevice ? 0.13 : 0.08;
    const damping = isMobileDevice ? 0.80 : 0.82;
    const repulseStrength = 180;
    let time = 0;

    // Bucle de animación por frame (Canvas 2D de 60fps)
    const animate = () => {
      time += 0.02;
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

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
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);

          const repulseX = (Math.cos(angle) * force * repulseStrength) / p.density;
          const repulseY = (Math.sin(angle) * force * repulseStrength) / p.density;

          p.vx += repulseX;
          p.vy += repulseY;
        }

        // 2. Ley de Hooke (Fuerza del resorte hacia su base original)
        const ax = (p.baseX - p.x) * springK;
        const ay = (p.baseY - p.y) * springK;

        // 3. Simulación e integración física con amortiguamiento
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
    <div className="w-full max-w-4xl mx-auto flex items-center justify-center h-[160px] sm:h-[180px] overflow-hidden select-none pointer-events-auto">
      <canvas
        ref={canvasRef}
        className="block cursor-none"
      />
    </div>
  );
}

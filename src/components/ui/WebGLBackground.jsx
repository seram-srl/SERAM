import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * @component WebGLBackground
 * @description Lienzo WebGL tridimensional con una constelación de partículas interconectadas en 3D.
 * Implementa el efecto Parallax tridimensional (Scroll Z-depth) y movimiento de inercia flotante con el mouse.
 */
export default function WebGLBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. ESTADO DEL MOTOR (Inercia LERP)
    const state = {
      mouseX: 0,
      mouseY: 0,
      targetX: 0,
      targetY: 0,
      lerpFactor: 0.05,
      cameraZTarget: 5,  // Conectado a ScrollTrigger
    };

    // 2. CONFIGURACIÓN DEL CONTEXTO GRÁFICO (Scene, Camera, Renderer)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010409); // Oscuro premium SERAM
    scene.fog = new THREE.FogExp2(0x010409, 0.04); // Niebla sutil para profundidad cinemática

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = state.cameraZTarget;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Límite para pantallas 4K/Retina
    container.appendChild(renderer.domElement);

    // 3. CONSTRUCCIÓN DE LA CONSTELACIÓN DE PARTÍCULAS 3D (650 estrellas ecológicas)
    const particleCount = 650;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const greenColor = new THREE.Color(0x00e03c); // Verde brillante
    const silverColor = new THREE.Color(0xe2e8f0); // Plata/blanco suave

    for (let i = 0; i < particleCount; i++) {
      // Distribución aleatoria en una caja tridimensional (X: -16 a 16, Y: -12 a 12, Z: -35 a 10)
      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 24;
      const z = Math.random() * -45 + 10; 

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color mixto: 70% verdes brillantes, 30% plateadas
      const isGreen = Math.random() > 0.3;
      const mixedColor = isGreen ? greenColor : silverColor;

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material de partículas suave y brillante
    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 4. CAPTURA DE EVENTOS (Mouse y Resize)
    const handleMouseMove = (e) => {
      state.mouseX = e.clientX - window.innerWidth / 2;
      state.mouseY = e.clientY - window.innerHeight / 2;
    };

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 5. CONTROLADOR CINEMÁTICO DE SCROLL (GSAP ScrollTrigger para Parallax Z-Depth)
    const scrollTween = gsap.to(state, {
      cameraZTarget: -12, // Vuela a través de las partículas
      ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-proxy',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    // 6. BUCLE DE EJECUCIÓN (render animado a 60fps)
    let animationFrameId;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotación automática muy suave para mantener viva la constelación
      particles.rotation.y += 0.0004;
      particles.rotation.x += 0.0002;

      // LERP físico para el movimiento del mouse (Parallax flotante)
      state.targetX += (state.mouseX * 0.0018 - state.targetX) * state.lerpFactor;
      state.targetY += (state.mouseY * 0.0018 - state.targetY) * state.lerpFactor;

      camera.position.x = state.targetX;
      camera.position.y = -state.targetY; // Eje Y invertido

      // LERP para la profundidad del Scroll (Z-Depth)
      camera.position.z += (state.cameraZTarget - camera.position.z) * 0.08;

      camera.lookAt(new THREE.Vector3(0, 0, -10)); // Mantener foco al fondo

      renderer.render(scene, camera);
    };

    animate();

    // 7. LIMPIEZA PROFUNDA DE RECURSOS GPU (Prevenir memory leaks)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (scrollTween.scrollTrigger) {
        scrollTween.scrollTrigger.kill();
      }
      scrollTween.kill();

      scene.remove(particles);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      id="webgl-container"
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    />
  );
}

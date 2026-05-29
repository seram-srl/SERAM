import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * @component WebGLBackground
 * @description Lienzo WebGL tridimensional de fondo para el efecto Parallax interactivo.
 * Soporta texturas dinámicas (Fase 3) con fallback robusto a rejilla wireframe.
 *
 * @param {string} bgTextureUrl - URL opcional para textura de fondo (CDN / Supabase Storage).
 * @param {string} midTextureUrl - URL opcional para textura del plano medio.
 * @param {string} fgTextureUrl - URL opcional para textura del primer plano.
 */
export default function WebGLBackground({ bgTextureUrl, midTextureUrl, fgTextureUrl }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. ESTADO INTERNO DEL MOTOR (Cinemática LERP e inercia)
    const state = {
      mouseX: 0,
      mouseY: 0,
      targetX: 0,
      targetY: 0,
      lerpFactor: 0.05,  // Calibrado a 0.05 para la inercia del mouse
      cameraZTarget: 5,  // Modulado por ScrollTrigger
    };

    // 2. CONFIGURACIÓN DEL CONTEXTO GRÁFICO (GPU)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); // Fondo oscuro alineado a guías
    scene.fog = new THREE.FogExp2(0x050505, 0.03); // Niebla técnica para difuminar bordes

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = state.cameraZTarget;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitador de rendimiento
    container.appendChild(renderer.domElement);

    // 3. CONSTRUCCIÓN DE LAS CAPAS TRIDIMENSIONALES (Texturas con Fallback Wireframe)
    const textureLoader = new THREE.TextureLoader();

    // Capa Lejana (Background) - Z: -15
    const bgGeometry = new THREE.PlaneGeometry(35, 20, 16, 16);
    let bgMaterial;
    if (bgTextureUrl) {
      bgMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load(bgTextureUrl, undefined, undefined, (err) => {
          console.warn('[WebGL BG]: Error al cargar la textura del CDN. Activando fallback wireframe.', err);
        }),
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });
    } else {
      bgMaterial = new THREE.MeshBasicMaterial({
        color: 0x2e5925, // Verde orgánico de SERAM
        wireframe: true,
        transparent: true,
        opacity: 0.25,
        depthWrite: false
      });
    }
    const layerBG = new THREE.Mesh(bgGeometry, bgMaterial);
    layerBG.position.z = -15;
    scene.add(layerBG);

    // Capa Media (Midground) - Z: -5
    const midGeometry = new THREE.PlaneGeometry(16, 9, 12, 12);
    let midMaterial;
    if (midTextureUrl) {
      midMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load(midTextureUrl, undefined, undefined, (err) => {
          console.warn('[WebGL Mid]: Error al cargar textura. Usando fallback wireframe.', err);
        }),
        transparent: true,
        opacity: 0.95
      });
    } else {
      midMaterial = new THREE.MeshBasicMaterial({
        color: 0x00e03c, // Acento Verde Neón
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
    }
    const layerMid = new THREE.Mesh(midGeometry, midMaterial);
    layerMid.position.z = -5;
    scene.add(layerMid);

    // Capa Cercana (Foreground) - Z: 1 (Desfase asimétrico)
    const fgGeometry = new THREE.PlaneGeometry(12, 12, 8, 8);
    let fgMaterial;
    if (fgTextureUrl) {
      fgMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load(fgTextureUrl, undefined, undefined, (err) => {
          console.warn('[WebGL FG]: Error al cargar textura. Usando fallback wireframe.', err);
        }),
        transparent: true,
        opacity: 0.7
      });
    } else {
      fgMaterial = new THREE.MeshBasicMaterial({
        color: 0x2e5925, // Verde orgánico de SERAM
        wireframe: true,
        transparent: true,
        opacity: 0.45
      });
    }
    const layerFG = new THREE.Mesh(fgGeometry, fgMaterial);
    layerFG.position.set(2, -1, 1);
    scene.add(layerFG);

    // 4. CAPTURA DE EVENTOS (Mouse y redimensionamiento)
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

    // 5. CONTROLADOR CINEMÁTICO DE SCROLL (GSAP ScrollTrigger)
    const scrollTween = gsap.to(state, {
      cameraZTarget: -8, // Cruzará los planos medio y cercano
      ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-proxy',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    // 6. BUCLE DE EJECUCIÓN (requestAnimationFrame)
    let animationFrameId;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Suavizado del movimiento horizontal y vertical con LERP (0.05)
      state.targetX += (state.mouseX * 0.0015 - state.targetX) * state.lerpFactor;
      state.targetY += (state.mouseY * 0.0015 - state.targetY) * state.lerpFactor;

      camera.position.x = state.targetX;
      camera.position.y = -state.targetY; // Invertir el eje Y

      // Transición del scroll en el eje Z con suavizado adicional (0.1)
      camera.position.z += (state.cameraZTarget - camera.position.z) * 0.1;

      // Mantener la mirada en el centro de la escena
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // 7. LIMPIEZA PROFUNDA DE RECURSOS (Prevenir fugas en GPU)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Destruir el trigger y la animación GSAP
      if (scrollTween.scrollTrigger) {
        scrollTween.scrollTrigger.kill();
      }
      scrollTween.kill();

      // Desvincular mallas de la escena
      scene.remove(layerBG);
      scene.remove(layerMid);
      scene.remove(layerFG);

      // Liberar recursos geométricos de la GPU
      bgGeometry.dispose();
      midGeometry.dispose();
      fgGeometry.dispose();

      // Liberar texturas si fueron cargadas
      if (bgMaterial.map) bgMaterial.map.dispose();
      if (midMaterial.map) midMaterial.map.dispose();
      if (fgMaterial.map) fgMaterial.map.dispose();

      // Liberar materiales
      bgMaterial.dispose();
      midMaterial.dispose();
      fgMaterial.dispose();

      renderer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [bgTextureUrl, midTextureUrl, fgTextureUrl]);

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

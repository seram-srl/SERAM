import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * @component EnvironmentalCanvas
 * @description Lienzo WebGL tridimensional de fondo para SERAM v2.5.
 * Desarrollado bajo arquitectura 100% desacoplada (Raw Three.js) para evitar la pérdida de contextos
 * de React Router y AppContext. Cuenta con Raycasting para deformación elástica por resortes (Spring Physics)
 * y un algoritmo de Bypass de LERP para transiciones de scroll infinito completamente fluidas y sin saltos.
 */
export default function EnvironmentalCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. ESTADO DE INTERPOLACIÓN (Inercia y velocidad del mouse)
    const state = {
      mouseX: 0,
      mouseY: 0,
      targetX: 0,
      targetY: 0,
      lerpFactor: 0.05,
      cameraZTarget: 4.2, // Inicial
    };

    // 2. CONFIGURACIÓN DEL CONTEXTO GRÁFICO (GPU)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010409); // Oscuro SERAM
    scene.fog = new THREE.FogExp2(0x010409, 0.04); // Niebla técnica de profundidad

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = state.cameraZTarget;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. CONSTRUCCIÓN DE LA MALLA ELÁSTICA INTERACTIVA (32x32)
    const widthSegments = 32;
    const heightSegments = 32;
    const geometry = new THREE.PlaneGeometry(5.8, 5.8, widthSegments, heightSegments);
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x00e03c, // Verde neón
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4. INICIALIZACIÓN DE FÍSICA DE RESORTES (SPRING PHYSICS)
    const posAttr = geometry.attributes.position;
    const vertexCount = posAttr.count; // 1089 vértices
    
    const velocities = new Float32Array(vertexCount);
    const radius = 1.3;       // Radio de afectación del mouse
    const intensity = -0.6;   // Fuerza del empuje (inward Z)
    const springK = 0.085;    // Elasticidad del resorte
    const damping = 0.86;     // Coeficiente de fricción

    // 5. CONFIGURACIÓN DE RAYCASTING (Cursor 2D a 3D)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999); // Fuera de pantalla por defecto

    const handleMouseMove = (e) => {
      // Normalizar coordenadas a [-1, 1] para el Raycaster de Three.js
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Variables para inercia suave de la cámara
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

    // 6. BUCLE DE EJECUCIÓN CONTINUO (RequestAnimationFrame - 60 FPS)
    let animationFrameId;
    let lastScrollY = window.scrollY;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // A. RAYCASTING E INTERSECCIÓN
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(mesh);

      let localPoint = null;
      if (intersects.length > 0) {
        localPoint = mesh.worldToLocal(intersects[0].point.clone());
      }

      // B. SIMULACIÓN DE RESORTES (Hooke's Law + Damping)
      for (let i = 0; i < vertexCount; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        let vz = posAttr.getZ(i);

        if (localPoint) {
          const dx = vx - localPoint.x;
          const dy = vy - localPoint.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius) {
            const factor = 1 - dist / radius;
            const force = factor * intensity;
            velocities[i] += force * 0.12; 
          }
        }

        const restorationForce = -vz * springK;
        velocities[i] = (velocities[i] + restorationForce) * damping;
        vz += velocities[i];
        
        posAttr.setZ(i, vz);
      }

      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      // C. LECTURA Y ROTACIÓN POR SCROLL NATIVO
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const normalizedScroll = scrollHeight > 0 ? scrollY / scrollHeight : 0;

      // Rotación suave por scroll
      const targetRotationY = normalizedScroll * Math.PI * 0.22;
      mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.05;

      // D. SISTEMA DE BYPASS DE LERP DE PROFUNDIDAD (Scroll Infinito Seamless)
      const targetZ = 4.2 + (normalizedScroll * -3.8); // Rango de Z: 4.2 a 0.4
      
      // Detectamos si ocurrió una redirección invisible instantánea (Y: 0)
      // Si la diferencia entre el objetivo y la posición actual es muy grande (ej. el salto del loop Y: 0)
      if (Math.abs(targetZ - camera.position.z) > 1.8) {
        // BYPASS: Saltamos instantáneamente al objetivo sin animar la reversa
        camera.position.z = targetZ;
      } else {
        // LERP: Desplazamiento amortiguado normal durante el scroll del usuario
        camera.position.z += (targetZ - camera.position.z) * 0.08;
      }

      // E. PARALLAX FLOTANTE CON EL MOUSE
      state.targetX += (state.mouseX * 0.0018 - state.targetX) * state.lerpFactor;
      state.targetY += (state.mouseY * 0.0018 - state.targetY) * state.lerpFactor;

      camera.position.x = state.targetX;
      camera.position.y = -state.targetY;

      camera.lookAt(new THREE.Vector3(0, 0, -5));

      renderer.render(scene, camera);
      lastScrollY = scrollY;
    };

    animate();

    // 7. LIMPIEZA PROFUNDA DE RECURSOS GPU (Prevención de leaks)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      scene.remove(mesh);
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
        overflow: 'hidden',
        backgroundColor: '#010409',
      }}
    />
  );
}

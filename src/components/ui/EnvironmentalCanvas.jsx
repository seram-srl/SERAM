import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

/**
 * Subcomponente interno que gestiona el renderizado 3D de la escena.
 * Lee el scroll nativo de forma asíncrona para no bloquear el flujo del DOM.
 */
function EnvironmentalScene() {
  const meshRef = useRef();
  
  // Referencias mutables para almacenar la posición de scroll y evitar re-renders constantes
  const scrollYRef = useRef(0);
  
  // Captura el evento de scroll nativo de la ventana del navegador
  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    
    // Escucha el evento scroll del DOM nativo
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // useFrame se ejecuta en cada fotograma del ciclo de renderizado de Three.js (RequestAnimationFrame)
  useFrame((state) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    // Normalizar la posición del scroll entre 0.0 y 1.0
    const normalizedScroll = scrollHeight > 0 ? scrollYRef.current / scrollHeight : 0;

    if (meshRef.current) {
      // ── AMORTIGUACIÓN LERP CINEMÁTICA ──────────────────────────────────────
      // dx = (objetivo - actual) * factor_lerp (0.05 para inercia fluida)
      
      // 1. Rotación interactiva basada en el avance del scroll
      const targetRotationY = normalizedScroll * Math.PI * 0.25; // Rotación máxima de 45 grados
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05;
      
      // 2. Parallax Z-depth: La malla se aleja sutilmente al hacer scroll
      const targetZ = normalizedScroll * -4; // Se desplaza hacia el fondo hasta Z: -4
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.05;
    }
  });

  return (
    // Malla de prueba (Dummy) con plano verde ecológico traslúcido
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* 1. Geometría plana de 32x32 divisiones preparada para vertex shaders en el futuro */}
      <planeGeometry args={[5, 5, 32, 32]} />
      
      {/* 2. Material básico en modo wireframe para validar el pipeline 3D */}
      <meshBasicMaterial 
        color="#009E28" 
        wireframe={true} 
        transparent={true} 
        opacity={0.3} 
      />
    </mesh>
  );
}

/**
 * @component EnvironmentalCanvas
 * @description Contenedor global inmutable para el lienzo WebGL de fondo de SERAM.
 * Diseñado bajo arquitectura desacoplada para flotar como fondo absoluto del DOM nativo.
 */
export default function EnvironmentalCanvas() {
  return (
    // Contenedor HTML fijo absoluto que actúa como fondo e ignora clics (pointer-events: none)
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Ubicado detrás de todo el contenido HTML del DOM
        pointerEvents: 'none', // Permite que los clics sigan atravesando hacia los enlaces HTML
        backgroundColor: '#010409', // Fondo oscuro alineado a la guía de estilo
      }}
    >
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 0, 4], // Cámara posicionada en Z: 4 para encuadrar la escena
        }}
        // Optimización: Desactiva el renderizador cuando el canvas no es visible
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]} // Limita el pixel ratio a 1.5 en pantallas de ultra alta resolución (Retina/4K) para maximizar fps
      >
        <ambientLight intensity={0.5} />
        
        {/* Renderizado de la escena 3D ambiental */}
        <EnvironmentalScene />
      </Canvas>
    </div>
  );
}

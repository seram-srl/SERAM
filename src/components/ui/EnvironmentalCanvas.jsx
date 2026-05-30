import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Subcomponente interno de la escena 3D.
 * Implementa física de deformación elástica por Raycasting sobre una planeGeometry de 32x32.
 * Los vértices se deforman elásticamente en base a la cercanía del cursor y regresan a su forma
 * original mediante una simulación física de resortes (Spring Physics).
 */
function EnvironmentalScene() {
  const meshRef = useRef();
  
  // Referencia mutable para el scroll de la ventana
  const scrollYRef = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── CONFIGURACIÓN DE PARÁMETROS FÍSICOS ────────────────────────────────────
  const radius = 1.2;       // Radio de afectación del mouse sobre la malla
  const intensity = -0.55;  // Fuerza de la deformación (negativo empuja hacia el fondo)
  const springK = 0.08;     // Constante de elasticidad del resorte (retorno)
  const damping = 0.88;     // Amortiguación/Fricción (evita oscilación infinita)
  
  // Número total de vértices en una planeGeometry de 32x32 (33 * 33 = 1089)
  const vertexCount = 1089;

  // Almacén mutable de velocidades físicas para cada vértice
  const velocities = useMemo(() => new Float32Array(vertexCount), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const geometry = mesh.geometry;
    const posAttr = geometry.attributes.position;

    // ── 1. DETERMINAR PUNTO DE INTERSECCIÓN CON RAYCASTER ────────────────────
    // state.pointer es la posición normalizada del ratón (-1 a 1) provista por R3F
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersects = state.raycaster.intersectObject(mesh);

    let localPoint = null;
    if (intersects.length > 0) {
      // Convertir el punto de intersección del espacio del mundo al espacio local de la malla
      localPoint = mesh.worldToLocal(intersects[0].point.clone());
    }

    // ── 2. BUCLE DE SIMULACIÓN DE FÍSICA DE RESORTES (SPRING PHYSICS) ──────────
    for (let i = 0; i < vertexCount; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      let vz = posAttr.getZ(i);

      // Si hay colisión con el puntero, aplicar la fuerza de empuje elástico
      if (localPoint) {
        // Distancia euclidiana 2D en el plano XY entre el vértice y el punto de impacto
        const dx = vx - localPoint.x;
        const dy = vy - localPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          // Relación de fuerza inversamente proporcional a la distancia
          const factor = 1 - dist / radius;
          const force = factor * intensity;
          // Inyectar aceleración/velocidad física al vértice
          velocities[i] += force * 0.12; 
        }
      }

      // Ley de Hooke: Fuerza de restauración hacia el plano neutral Z: 0
      const restorationForce = -vz * springK;
      
      // Actualizar velocidad con amortiguación (fricción)
      velocities[i] = (velocities[i] + restorationForce) * damping;
      
      // Aplicar velocidad a la coordenada Z
      vz += velocities[i];
      
      // Guardar la coordenada deforma de vuelta en el buffer de posiciones
      posAttr.setZ(i, vz);
    }

    // Indicar a Three.js que las posiciones del buffer de geometría han cambiado en la GPU
    posAttr.needsUpdate = true;
    
    // Recalcular normales para que la luz y el sombreado reaccionen dinámicamente al relieve
    geometry.computeVertexNormals();

    // ── 3. APLICAR ROTACIÓN Y PARALLAX DE SCROLL ADICIONAL ────────────────────
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const normalizedScroll = scrollHeight > 0 ? scrollYRef.current / scrollHeight : 0;

    // Rotación suave del lienzo completo por scroll
    const targetRotationY = normalizedScroll * Math.PI * 0.2;
    mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.05;

    // Desplazamiento en profundidad (Parallax Z)
    const targetZ = normalizedScroll * -3.5;
    mesh.position.z += (targetZ - mesh.position.z) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* Geometría plana de 32x32 preparada para la distorsión interactiva */}
      <planeGeometry args={[5.5, 5.5, 32, 32]} />
      <meshBasicMaterial 
        color="#00e03c" 
        wireframe={true} 
        transparent={true} 
        opacity={0.35} 
      />
    </mesh>
  );
}

/**
 * @component EnvironmentalCanvas
 * @description Contenedor inmutable para el lienzo WebGL de fondo.
 * Expone la escena tridimensional interactiva detrás del HTML nativo.
 */
export default function EnvironmentalCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        backgroundColor: '#010409',
      }}
    >
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 0, 4.2], // Cámara ubicada para encuadrar la malla perfectamente
        }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <EnvironmentalScene />
      </Canvas>
    </div>
  );
}

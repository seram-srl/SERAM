import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';

// ── PARÁMETROS FÍSICOS COMPARTIDOS ──────────────────────────────────────────
const radius = 1.3;       // Radio de afectación del raycasting
const intensity = -0.58;  // Fuerza de la perturbación elástica
const springK = 0.085;    // Elasticidad del resorte de restauración
const damping = 0.86;     // Coeficiente de amortiguación/fricción
const vertexCount = 1089; // Vértices en una rejilla de 32x32 (33 * 33)

/**
 * @component InteractiveScene
 * @description Escena 3D optimizada para la narración lineal (Storytelling).
 * Conecta el progreso de scroll virtualizado provisto por <ScrollControls> (useScroll)
 * para trasladar la posición de la cámara y la rotación de forma completamente continua y sin saltos (loop).
 */
function InteractiveScene() {
  const meshRef = useRef();
  
  // useScroll lee el controlador virtual de scroll del proveedor principal
  const scroll = useScroll(); 
  
  const velocities = useMemo(() => new Float32Array(vertexCount), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const geometry = mesh.geometry;
    const posAttr = geometry.attributes.position;

    // 1. RAYCASTING PARA FÍSICA DE RESORTES
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersects = state.raycaster.intersectObject(mesh);

    let localPoint = null;
    if (intersects.length > 0) {
      localPoint = mesh.worldToLocal(intersects[0].point.clone());
    }

    // Bucle de resorte amortiguado para deformación táctil
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

    // ── 2. SINCRONIZACIÓN DE SCROLL VIRTUAL SIN SALTOS (Bucle Infinito) ───────
    // scroll.offset entrega un valor amortiguado (damped) entre 0.0 y 1.0
    // Cuando el scroll es infinito, el valor vuelve a 0 de forma perfectamente continua
    const normalizedScroll = scroll ? scroll.offset : 0;

    // Rotación suave continua de la malla
    mesh.rotation.y = normalizedScroll * Math.PI * 0.22;

    // Traslación en profundidad Z
    mesh.position.z = normalizedScroll * -3.8;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[5.8, 5.8, 32, 32]} />
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
 * @component BackgroundScene
 * @description Escena 3D estática para páginas tradicionales (Academy, Services, etc.).
 * Mantiene la física del cursor pero elimina la lógica de ScrollControls para no interferir en páginas estáticas.
 */
function BackgroundScene() {
  const meshRef = useRef();
  const velocities = useMemo(() => new Float32Array(vertexCount), []);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const geometry = mesh.geometry;
    const posAttr = geometry.attributes.position;

    // Raycasting elástico
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersects = state.raycaster.intersectObject(mesh);

    let localPoint = null;
    if (intersects.length > 0) {
      localPoint = mesh.worldToLocal(intersects[0].point.clone());
    }

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

    // Rotación pasiva lenta más scroll normal amortiguado
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const normalizedScroll = scrollHeight > 0 ? scrollYRef.current / scrollHeight : 0;
    
    mesh.rotation.y += (normalizedScroll * Math.PI * 0.18 - mesh.rotation.y) * 0.05;
    mesh.position.z += (normalizedScroll * -2.8 - mesh.position.z) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[5.8, 5.8, 32, 32]} />
      <meshBasicMaterial 
        color="#00e03c" 
        wireframe={true} 
        transparent={true} 
        opacity={0.25} 
      />
    </mesh>
  );
}

/**
 * @component EnvironmentalCanvas
 * @description Contenedor inmutable para el lienzo WebGL.
 * Soporta dos variantes de arquitectura: narración infinita (Storytelling) o fondo pasivo tradicional.
 */
export default function EnvironmentalCanvas({ isStorytelling = false, children }) {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: isStorytelling ? 10 : -1, // En storytelling, R3F maneja el scroll y requiere z-index
    pointerEvents: isStorytelling ? 'auto' : 'none', // Storytelling intercepta eventos de scroll
    backgroundColor: '#010409',
  };

  if (isStorytelling) {
    return (
      <div style={containerStyle} id="storytelling-canvas-root">
        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [0, 0, 4.2],
          }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.5} />
          
          {/* ScrollControls con bucle infinito nativo e inercia física de Drei */}
          <ScrollControls pages={5} infinite damping={0.3} horizontal={false}>
            <InteractiveScene />
            {children}
          </ScrollControls>
        </Canvas>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 0, 4.2],
        }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <BackgroundScene />
      </Canvas>
    </div>
  );
}

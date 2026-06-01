import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import fondo1erPanel from '../../assets/fondo_1er_panel.webp';

// ── PARÁMETROS FÍSICOS COMPARTIDOS ──────────────────────────────────────────
const radius = 1.3;       // Radio de afectación del raycasting
const intensity = -0.58;  // Fuerza de la perturbación elástica
const springK = 0.085;    // Elasticidad del resorte de restauración
const damping = 0.86;     // Coeficiente de amortiguación/fricción
const vertexCount = 1089; // Vértices en una rejilla de 32x32 (33 * 33)

/**
 * @component InteractiveScene
 * @description Escena 3D optimizada para la narración lineal (Storytelling) con ScrollControls.
 * Cuenta con física elástica de resortes de fondo calculada en 3D para el loop,
 * pero la representación visual es completamente transparente e invisible.
 */
// Generador dinámico de textura de ruido para la neblina ecológica (Simplex Noise sutil)
const createNoiseTexture = () => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  
  // Generamos un ruido de nubes suave usando superposición de ondas senoidales
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const nx = x / size;
      const ny = y / size;
      
      let val = 0;
      val += Math.sin(nx * Math.PI * 4) * Math.cos(ny * Math.PI * 4) * 0.5;
      val += Math.sin(nx * Math.PI * 8 + ny * Math.PI * 4) * 0.25;
      val += Math.sin(nx * Math.PI * 16 - ny * Math.PI * 8) * 0.125;
      val += Math.cos(nx * Math.PI * 2 + ny * Math.PI * 12) * 0.125;
      
      // Normalizar a 0-1
      val = (val + 1) / 2;
      
      // Suavizado radial para que no tenga bordes duros y parezca neblina flotante
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const edgeFade = Math.max(0, 1 - dist * 2.2);
      
      const alpha = Math.floor(val * 255 * 0.22 * edgeFade);
      
      const idx = (x + y * size) * 4;
      data[idx] = 255;       // R (neblina clara/blanca)
      data[idx + 1] = 255;   // G
      data[idx + 2] = 255;   // B
      data[idx + 3] = alpha; // A
    }
  }
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.0, 1.0);
  return texture;
};

function InteractiveScene() {
  const meshRef = useRef();
  const mistMeshRef = useRef();
  const scroll = useScroll(); // useScroll lee la posición virtualizada de scroll
  const velocities = useMemo(() => new Float32Array(vertexCount), []);
  const texture = useTexture(fondo1erPanel);
  const mistTexture = useMemo(() => createNoiseTexture(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const geometry = mesh.geometry;
    const posAttr = geometry.attributes.position;

    // 1. FÍSICA DE RESORTES (SPRING PHYSICS) POR RAYCASTING EN SEGUNDO PLANO
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

    // 2. SINCRONIZACIÓN DE SCROLL VIRTUAL SIN SALTOS (Bucle Infinito)
    const normalizedScroll = scroll ? scroll.offset : 0;
    mesh.rotation.y = normalizedScroll * Math.PI * 0.22;
    mesh.position.z = normalizedScroll * -3.8;

    // Desplazar la neblina ecológica lentamente en el eje X para simular viento orgánico
    if (mistTexture) {
      mistTexture.offset.x += 0.00015;
      mistTexture.offset.y += 0.00003;
    }

    // Actualización dinámica de opacidad de fondo (se desvanece suavemente a medida que bajamos)
    if (mesh.material) {
      mesh.material.opacity = Math.max(0, 1 - normalizedScroll * 5);
    }

    // Desvanecer la neblina coordinadamente con el fondo al hacer scroll
    if (mistMeshRef.current && mistMeshRef.current.material) {
      mistMeshRef.current.material.opacity = Math.max(0, (1 - normalizedScroll * 5) * 0.75);
    }
  });

  return (
    <group>
      {/* Fondo principal del Canvas con textura del paisaje ecológico */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[5.8, 5.8, 32, 32]} />
        <meshBasicMaterial 
          map={texture}
          transparent={true} 
          opacity={1.0} 
          depthWrite={false}
          wireframe={false}
        />
      </mesh>

      {/* Segundo plano tridimensional para simular la neblina ecológica */}
      <mesh ref={mistMeshRef} position={[0, 0, 0.05]}>
        <planeGeometry args={[5.8, 5.8, 8, 8]} />
        <meshBasicMaterial 
          map={mistTexture}
          transparent={true}
          opacity={0.75}
          depthWrite={false}
          blending={THREE.NormalBlending}
          wireframe={false}
        />
      </mesh>
    </group>
  );
}

/**
 * @component BackgroundScene
 * @description Escena 3D estática para páginas tradicionales (Academy, Services, etc.).
 * Mantiene los cálculos en segundo plano de forma 100% transparente.
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

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const normalizedScroll = scrollHeight > 0 ? scrollYRef.current / scrollHeight : 0;
    
    mesh.rotation.y += (normalizedScroll * Math.PI * 0.18 - mesh.rotation.y) * 0.05;
    mesh.position.z += (normalizedScroll * -2.8 - mesh.position.z) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[5.8, 5.8, 32, 32]} />
      {/* Material invisible para fondos estáticos */}
      <meshBasicMaterial 
        color="#010409" 
        wireframe={false} 
        transparent={true} 
        opacity={0.0} 
      />
    </mesh>
  );
}

/**
 * @component EnvironmentalCanvas
 * @description Contenedor global para el lienzo WebGL.
 * Soporta dos variantes de arquitectura: narración infinita (Storytelling con R3F) o fondo pasivo.
 */
export default function EnvironmentalCanvas({ isStorytelling = false, children }) {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: isStorytelling ? 10 : -1, // Se coloca detrás de la UI base pero con zIndex correspondiente
    pointerEvents: 'none', // Fijo en none para no bloquear clics ni interacciones del DOM
    backgroundColor: '#010409',
  };

  if (isStorytelling) {
    return (
      <div style={containerStyle} id="storytelling-canvas-root">
        <Canvas
          eventSource={typeof window !== 'undefined' ? window : undefined}
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
          
          <React.Suspense fallback={null}>
            {/* ScrollControls con bucle infinito de Drei y amortiguación de 0.3 */}
            <ScrollControls pages={5} infinite damping={0.3} horizontal={false}>
              <InteractiveScene />
              {children}
            </ScrollControls>
          </React.Suspense>
        </Canvas>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Canvas
        eventSource={typeof window !== 'undefined' ? window : undefined}
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

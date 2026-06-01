import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import fondo1erPanel from '../../assets/fondo_1er_panel.webp';
import mountainsCutout from '../../assets/mountains_cutout.png';

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
  const groupRef = useRef();
  const bgMeshRef = useRef();
  const mistMeshRef = useRef();
  const fgMeshRef = useRef();

  const scroll = useScroll(); // useScroll lee la posición virtualizada de scroll
  const velocities = useMemo(() => new Float32Array(vertexCount), []);

  // Texturas de profundidad 3D diferenciadas
  const bgTexture = useTexture(fondo1erPanel);
  const fgTexture = useTexture(mountainsCutout);
  const mistTexture = useMemo(() => createNoiseTexture(), []);

  // Referencias para el LERP del mouse
  const currentMouseX = useRef(0);
  const currentMouseY = useRef(0);

  useFrame((state) => {
    const fgMesh = fgMeshRef.current;
    const bgMesh = bgMeshRef.current;
    const mistMesh = mistMeshRef.current;
    const group = groupRef.current;

    if (!fgMesh || !bgMesh || !mistMesh || !group) return;

    // 1. FÍSICA ELÁSTICA (SPRING PHYSICS) POR RAYCASTING EN LA CAPA DE PRIMER PLANO (FOLIAGE/MONTAÑAS)
    const geometry = fgMesh.geometry;
    const posAttr = geometry.attributes.position;

    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersects = state.raycaster.intersectObject(fgMesh);

    let localPoint = null;
    if (intersects.length > 0) {
      localPoint = fgMesh.worldToLocal(intersects[0].point.clone());
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

    // 2. SINCRONIZACIÓN DE SCROLL VIRTUAL Y TRANSICIÓN MECÁNICA FLUIDA
    const normalizedScroll = scroll ? scroll.offset : 0;
    
    // Inclinación y profundidad basadas en el scroll (efecto túnel cinemático)
    group.rotation.y = normalizedScroll * Math.PI * 0.12;
    group.position.z = normalizedScroll * -2.8;

    // 3. EFECTO PARALLAX 3D POR MOVIMIENTO DEL MOUSE CON INERCIA LERP SUAVE
    const targetMouseX = state.pointer.x * 0.25;
    const targetMouseY = state.pointer.y * 0.25;
    
    currentMouseX.current += (targetMouseX - currentMouseX.current) * 0.08;
    currentMouseY.current += (targetMouseY - currentMouseY.current) * 0.08;
    
    // Aplicar movimientos de parallax diferenciados para profundidad 3D cinemática
    // Capa de fondo (Fondo de paisaje completo) - movimiento sutil
    bgMesh.position.x = currentMouseX.current * 0.35;
    bgMesh.position.y = currentMouseY.current * 0.35;
    
    // Capa media (Neblina ecológica) - movimiento intermedio
    mistMesh.position.x = currentMouseX.current * 0.7;
    mistMesh.position.y = currentMouseY.current * 0.7;
    
    // Capa de primer plano (Montañas/Hojas recortadas PNG) - movimiento acentuado
    fgMesh.position.x = currentMouseX.current * 1.2;
    fgMesh.position.y = currentMouseY.current * 1.2;

    // Desplazar la neblina de ruido en el eje X continuamente (viento/fluido de brisa)
    if (mistTexture) {
      mistTexture.offset.x += 0.00015;
      mistTexture.offset.y += 0.00003;
    }

    // Actualización dinámica de opacidad de fondo y capas según scroll (desvanecimiento)
    const opacityFactor = Math.max(0, 1 - normalizedScroll * 5);
    if (bgMesh.material) bgMesh.material.opacity = opacityFactor;
    if (fgMesh.material) fgMesh.material.opacity = opacityFactor;
    if (mistMesh.material) mistMesh.material.opacity = opacityFactor * 0.75;
  });

  return (
    <group ref={groupRef}>
      {/* CAPA 1: Fondo principal (Paisaje y cielo original, escala levemente mayor para cubrir parallax seguro) */}
      <mesh ref={bgMeshRef} position={[0, 0, -0.4]}>
        <planeGeometry args={[6.0, 6.0, 8, 8]} />
        <meshBasicMaterial 
          map={bgTexture}
          transparent={true} 
          opacity={1.0} 
          depthWrite={false}
          wireframe={false}
        />
      </mesh>

      {/* CAPA 2: Neblina tridimensional intermedia (Simplex Noise flotante que pasa detrás de las montañas y delante del cielo) */}
      <mesh ref={mistMeshRef} position={[0, 0, -0.05]}>
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

      {/* CAPA 3: Primer plano con montañas y vegetación recortada (Interactiva con deformación elástica de resortes al tacto) */}
      <mesh ref={fgMeshRef} position={[0, 0, 0.2]}>
        <planeGeometry args={[5.8, 5.8, 32, 32]} />
        <meshBasicMaterial 
          map={fgTexture}
          transparent={true}
          opacity={1.0}
          depthWrite={false}
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

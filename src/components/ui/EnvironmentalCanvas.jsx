import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import fondo1erPanel from '../../assets/fondo_1er_panel.webp';
import mountainsCutout from '../../assets/mountains_cutout.png';
import fondo2doPanel from '../../assets/fondo2_2do_panel.webp';

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
  const bg2MeshRef = useRef();

  const scroll = useScroll(); // useScroll lee la posición virtualizada de scroll
  const velocities1 = useMemo(() => new Float32Array(vertexCount), []);
  const velocities2 = useMemo(() => new Float32Array(vertexCount), []);

  // Texturas de profundidad 3D diferenciadas
  const bgTexture = useTexture(fondo1erPanel);
  const fgTexture = useTexture(mountainsCutout);
  const bg2Texture = useTexture(fondo2doPanel);
  const mistTexture = useMemo(() => createNoiseTexture(), []);

  // Referencias para el LERP del mouse
  const currentMouseX = useRef(0);
  const currentMouseY = useRef(0);

  useFrame((state) => {
    const fgMesh = fgMeshRef.current;
    const bgMesh = bgMeshRef.current;
    const mistMesh = mistMeshRef.current;
    const bg2Mesh = bg2MeshRef.current;
    const group = groupRef.current;

    if (!fgMesh || !bgMesh || !mistMesh || !bg2Mesh || !group) return;

    // 1. FÍSICA ELÁSTICA (SPRING PHYSICS) POR RAYCASTING
    // Raycasting para la Capa de Primer Plano (Panel 1)
    const geometry1 = fgMesh.geometry;
    const posAttr1 = geometry1.attributes.position;
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersects1 = state.raycaster.intersectObject(fgMesh);

    let localPoint1 = null;
    if (intersects1.length > 0) {
      localPoint1 = fgMesh.worldToLocal(intersects1[0].point.clone());
    }

    for (let i = 0; i < vertexCount; i++) {
      const vx = posAttr1.getX(i);
      const vy = posAttr1.getY(i);
      let vz = posAttr1.getZ(i);

      if (localPoint1) {
        const dx = vx - localPoint1.x;
        const dy = vy - localPoint1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const factor = 1 - dist / radius;
          const force = factor * intensity;
          velocities1[i] += force * 0.12; 
        }
      }

      const restorationForce = -vz * springK;
      velocities1[i] = (velocities1[i] + restorationForce) * damping;
      vz += velocities1[i];
      posAttr1.setZ(i, vz);
    }
    posAttr1.needsUpdate = true;
    geometry1.computeVertexNormals();

    // Raycasting para la Capa de Fondo (Panel 2)
    const geometry2 = bg2Mesh.geometry;
    const posAttr2 = geometry2.attributes.position;
    const intersects2 = state.raycaster.intersectObject(bg2Mesh);

    let localPoint2 = null;
    if (intersects2.length > 0) {
      localPoint2 = bg2Mesh.worldToLocal(intersects2[0].point.clone());
    }

    for (let i = 0; i < vertexCount; i++) {
      const vx = posAttr2.getX(i);
      const vy = posAttr2.getY(i);
      let vz = posAttr2.getZ(i);

      if (localPoint2) {
        const dx = vx - localPoint2.x;
        const dy = vy - localPoint2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const factor = 1 - dist / radius;
          const force = factor * intensity;
          velocities2[i] += force * 0.12; 
        }
      }

      const restorationForce = -vz * springK;
      velocities2[i] = (velocities2[i] + restorationForce) * damping;
      vz += velocities2[i];
      posAttr2.setZ(i, vz);
    }
    posAttr2.needsUpdate = true;
    geometry2.computeVertexNormals();


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
    // Capas de Panel 1
    bgMesh.position.x = currentMouseX.current * 0.35;
    bgMesh.position.y = currentMouseY.current * 0.35;
    
    mistMesh.position.x = currentMouseX.current * 0.7;
    mistMesh.position.y = currentMouseY.current * 0.7;
    
    fgMesh.position.x = currentMouseX.current * 1.2;
    fgMesh.position.y = currentMouseY.current * 1.2;

    // Capa de Panel 2
    bg2Mesh.position.x = currentMouseX.current * 0.45;
    bg2Mesh.position.y = currentMouseY.current * 0.45;

    // Desplazar la neblina de ruido en el eje X continuamente (viento/fluido de brisa)
    if (mistTexture) {
      mistTexture.offset.x += 0.00015;
      mistTexture.offset.y += 0.00003;
    }

    // 4. TRANSICIÓN MECÁNICA FLUIDA DE OPACIDADES ENTRE PANELES
    // Opacidad de Panel 1 (Funde a 0 rápido al bajar)
    const opacityFactor1 = Math.max(0, 1 - normalizedScroll * 5);
    if (bgMesh.material) bgMesh.material.opacity = opacityFactor1;
    if (fgMesh.material) fgMesh.material.opacity = opacityFactor1;
    if (mistMesh.material) mistMesh.material.opacity = opacityFactor1 * 0.75;

    // Opacidad de Panel 2 (Funde a 1 en el segundo panel, luego a 0 al bajar a los siguientes)
    let opacityFactor2 = 0;
    if (normalizedScroll < 0.2) {
      // Sube a medida que bajamos del Panel 1
      opacityFactor2 = Math.min(1, normalizedScroll * 5);
    } else if (normalizedScroll < 0.3) {
      // Pico en el Panel 2
      opacityFactor2 = 1.0;
    } else {
      // Funde a 0 al bajar al Panel 3 (Academy)
      opacityFactor2 = Math.max(0, 1 - (normalizedScroll - 0.3) * 5);
    }
    if (bg2Mesh.material) bg2Mesh.material.opacity = opacityFactor2;
  });

  return (
    <group ref={groupRef}>
      {/* ── PANEL 1 ────────────────────────────────────────────────────────── */}
      {/* CAPA 1.1: Fondo principal Panel 1 (Paisaje y cielo original) */}
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

      {/* CAPA 1.2: Neblina tridimensional intermedia */}
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

      {/* CAPA 1.3: Primer plano con montañas y vegetación recortada (Interactiva) */}
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

      {/* ── PANEL 2 ────────────────────────────────────────────────────────── */}
      {/* CAPA 2.1: Fondo principal Panel 2 (Interactiva con deformación elástica de resortes) */}
      <mesh ref={bg2MeshRef} position={[0, 0, -0.38]}>
        <planeGeometry args={[6.0, 6.0, 32, 32]} />
        <meshBasicMaterial 
          map={bg2Texture}
          transparent={true}
          opacity={0.0} 
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

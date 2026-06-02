import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ── ASSETS DESDE LA NUEVA ESTRUCTURA DE PUBLIC ──────────────────────────────
import landscapeBg from '../../public/assets/3d-backend/landscape-background.webp';
import logoSeram from '../../public/assets/brand/logo-seram.svg';
import foregroundPlants from '../../public/assets/3d-backend/foreground-plants.webp';
import fondo2doPanel from '../../public/assets/fondo2_2do_panel.webp';

// ── PARÁMETROS FÍSICOS COMPARTIDOS ──────────────────────────────────────────
const radius = 1.3;       // Radio de afectación del raycasting
const intensity = -0.58;  // Fuerza de la perturbación elástica
const springK = 0.085;    // Elasticidad del resorte de restauración
const damping = 0.86;     // Coeficiente de amortiguación/fricción
const vertexCount = 1089; // Vértices en una rejilla de 32x32 (33 * 33)

/**
 * @description Generador dinámico de textura de ruido para la neblina ecológica.
 */
const createNoiseTexture = () => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const nx = x / size;
      const ny = y / size;
      
      let val = 0;
      val += Math.sin(nx * Math.PI * 4) * Math.cos(ny * Math.PI * 4) * 0.5;
      val += Math.sin(nx * Math.PI * 8 + ny * Math.PI * 4) * 0.25;
      val += Math.sin(nx * Math.PI * 16 - ny * Math.PI * 8) * 0.125;
      val += Math.cos(nx * Math.PI * 2 + ny * Math.PI * 12) * 0.125;
      
      val = (val + 1) / 2;
      
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const edgeFade = Math.max(0, 1 - dist * 2.2);
      
      const alpha = Math.floor(val * 255 * 0.25 * edgeFade);
      
      const idx = (x + y * size) * 4;
      data[idx] = 255;       // R
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

/**
 * @component InteractiveScene
 * @description Escena 3D optimizada. Maneja el sándwich de capas 3D (Fondo, Logo Reactivo y Plantas),
 * el scroll nativo por spline con zoom-out/paralaje, y la neblina ecológica.
 */
function InteractiveScene() {
  const groupRef = useRef();
  const bgMeshRef = useRef();
  const logoMeshRef = useRef();
  const fgMeshRef = useRef();
  const instancedMistRef = useRef();
  const bg2MeshRef = useRef();

  // Velocidades físicas para los vértices (deformación elástica)
  const velocitiesLogo = useMemo(() => new Float32Array(vertexCount), []);
  const velocitiesFG = useMemo(() => new Float32Array(vertexCount), []);
  const velocities2 = useMemo(() => new Float32Array(vertexCount), []);

  // Texturas de alta calidad
  const bgTexture = useTexture(landscapeBg);
  const logoTexture = useTexture(logoSeram);
  const fgTexture = useTexture(foregroundPlants);
  const bg2Texture = useTexture(fondo2doPanel);
  const mistTexture = useMemo(() => createNoiseTexture(), []);

  // Limpieza de textura generada dinámicamente
  useEffect(() => {
    return () => {
      if (mistTexture) mistTexture.dispose();
    };
  }, [mistTexture]);

  // Parallax e inercias del mouse
  const currentMouseX = useRef(0);
  const currentMouseY = useRef(0);
  
  // Tracking del scroll nativo
  const scrollProgressRef = useRef(0);
  const currentScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      scrollProgressRef.current = progress;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Inicializar

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Trayectoria Spline tridimensional para la cámara (Bucle cerrado)
  const cameraSpline = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 0, 4.2),        // Hero
      new THREE.Vector3(1.2, 0.4, 3.8),     // Services
      new THREE.Vector3(0, 0.8, 3.2),      // Academy
      new THREE.Vector3(-1.2, 0.4, 3.8),    // Experience
      new THREE.Vector3(-0.5, -0.3, 4.0),   // Shop
    ];
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  // Partículas de neblina
  const mistCount = 90;
  const mistParticles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < mistCount; i++) {
      const x = (Math.random() - 0.5) * 16.0;
      const y = (Math.random() - 0.5) * 9.0;
      const z = -0.25 + (Math.random() - 0.5) * 0.5;
      const scale = 1.4 + Math.random() * 2.0;
      const speedX = 0.03 + Math.random() * 0.06;
      const speedY = (Math.random() - 0.5) * 0.015;
      
      temp.push({
        x, y, z,
        baseX: x,
        baseY: y,
        baseZ: z,
        scale,
        speedX,
        speedY,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: 0.06 + Math.random() * 0.08
      });
    }
    return temp;
  }, [mistCount]);

  useFrame((state) => {
    const bgMesh = bgMeshRef.current;
    const logoMesh = logoMeshRef.current;
    const fgMesh = fgMeshRef.current;
    const instancedMist = instancedMistRef.current;
    const bg2Mesh = bg2MeshRef.current;
    const group = groupRef.current;

    if (!bgMesh || !logoMesh || !fgMesh || !instancedMist || !bg2Mesh || !group) return;

    // 1. FÍSICA ELÁSTICA DE VÉRTICES (Raycasting)
    state.raycaster.setFromCamera(state.pointer, state.camera);

    // A. Capa Frente (Plantas)
    const geometryFG = fgMesh.geometry;
    const posAttrFG = geometryFG.attributes.position;
    const intersectsFG = state.raycaster.intersectObject(fgMesh);

    let localPointFG = null;
    if (intersectsFG.length > 0) {
      localPointFG = fgMesh.worldToLocal(intersectsFG[0].point.clone());
    }

    for (let i = 0; i < vertexCount; i++) {
      const vx = posAttrFG.getX(i);
      const vy = posAttrFG.getY(i);
      let vz = posAttrFG.getZ(i);

      if (localPointFG) {
        const dx = vx - localPointFG.x;
        const dy = vy - localPointFG.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const factor = 1 - dist / radius;
          const force = factor * intensity;
          velocitiesFG[i] += force * 0.12; 
        }
      }

      const restorationForce = -vz * springK;
      velocitiesFG[i] = (velocitiesFG[i] + restorationForce) * damping;
      vz += velocitiesFG[i];
      posAttrFG.setZ(i, vz);
    }
    posAttrFG.needsUpdate = true;
    geometryFG.computeVertexNormals();

    // B. Capa Centro (Logo Vectorial Reactivo)
    // El logo, aunque esté físicamente detrás de las plantas, sigue respondiendo al cursor
    // debido al raycast directo sobre su malla.
    const geometryLogo = logoMesh.geometry;
    const posAttrLogo = geometryLogo.attributes.position;
    const intersectsLogo = state.raycaster.intersectObject(logoMesh);

    let localPointLogo = null;
    if (intersectsLogo.length > 0) {
      localPointLogo = logoMesh.worldToLocal(intersectsLogo[0].point.clone());
    }

    for (let i = 0; i < vertexCount; i++) {
      const vx = posAttrLogo.getX(i);
      const vy = posAttrLogo.getY(i);
      let vz = posAttrLogo.getZ(i);

      if (localPointLogo) {
        const dx = vx - localPointLogo.x;
        const dy = vy - localPointLogo.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const factor = 1 - dist / radius;
          const force = factor * intensity;
          velocitiesLogo[i] += force * 0.12; 
        }
      }

      const restorationForce = -vz * springK;
      velocitiesLogo[i] = (velocitiesLogo[i] + restorationForce) * damping;
      vz += velocitiesLogo[i];
      posAttrLogo.setZ(i, vz);
    }
    posAttrLogo.needsUpdate = true;
    geometryLogo.computeVertexNormals();

    // C. Capa Fondo Panel 2 (Deformación de fondo al avanzar)
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

    // 2. SINCRONIZACIÓN DE SCROLL NATIVO (Sin saltos)
    const targetScroll = scrollProgressRef.current;
    let scrollDiff = targetScroll - currentScroll.current;
    currentScroll.current += scrollDiff * 0.08; // LERP elástico
    
    let renderedScroll = currentScroll.current % 1.0;
    if (renderedScroll < 0) renderedScroll += 1.0;

    // Obtener la posición de la cámara en el riel Spline
    const cameraPosition = cameraSpline.getPointAt(renderedScroll);

    // Relación de aspecto para legibilidad en móviles
    const aspect = state.width / state.height;
    if (aspect < 1.0) {
      cameraPosition.x += 1.15;
      cameraPosition.z -= 0.45;
    }

    // 3. ZOOM OUT SUAVE EN EL PRIMER PANEL
    let heroProgress = 0;
    if (renderedScroll < 0.2) {
      heroProgress = 1.0 - (renderedScroll / 0.2); // 1.0 en scroll 0, baja a 0 en scroll 0.2
    } else if (renderedScroll > 0.8) {
      heroProgress = (renderedScroll - 0.8) / 0.2; // 0 en scroll 0.8, sube a 1.0 en scroll 1.0
    }

    // Zoom out alejando la cámara en el eje Z
    const zoomOutOffset = (1.0 - heroProgress) * 4.0;
    cameraPosition.z += zoomOutOffset;

    state.camera.position.copy(cameraPosition);

    // 4. PARALLAX Y MIRADA DE CÁMARA CON INERCIA DEL MOUSE
    const targetMouseX = state.pointer.x * 0.25;
    const targetMouseY = state.pointer.y * 0.25;
    
    currentMouseX.current += (targetMouseX - currentMouseX.current) * 0.08;
    currentMouseY.current += (targetMouseY - currentMouseY.current) * 0.08;

    // Paralaje Exagerado:
    // Paisaje de fondo: casi estático.
    bgMesh.position.x = currentMouseX.current * 0.3;
    bgMesh.position.y = currentMouseY.current * 0.3;
    bgMesh.position.z = -6.0 - (1.0 - heroProgress) * 0.3;

    // Logo: velocidad intermedia.
    logoMesh.position.x = (-2.5 - (1.0 - heroProgress) * 0.8) + currentMouseX.current * 0.6;
    logoMesh.position.y = currentMouseY.current * 0.6;
    logoMesh.position.z = -2.0 - (1.0 - heroProgress) * 2.0;

    // Plantas del frente: se alejan y salen de la pantalla muy rápido.
    fgMesh.position.x = (-2.0 - (1.0 - heroProgress) * 6.0) + currentMouseX.current * 1.0;
    fgMesh.position.y = (-1.8 - (1.0 - heroProgress) * 3.0) + currentMouseY.current * 1.0;
    fgMesh.position.z = 1.0 - (1.0 - heroProgress) * 5.0;

    // Panel 2
    bg2Mesh.position.x = currentMouseX.current * 0.4;
    bg2Mesh.position.y = currentMouseY.current * 0.4;

    // Mirada de la cámara con inercia del ratón
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    cameraTarget.x += currentMouseX.current * 0.7;
    cameraTarget.y += currentMouseY.current * 0.7;
    state.camera.lookAt(cameraTarget);

    // 5. NEBLINA INTERACTIVA (InstancedMesh)
    const scrollVelocity = Math.min(1.0, Math.abs(scrollDiff) * 25.0);
    const targetOpacity = 0.02 + scrollVelocity * 0.26;
    if (instancedMist.material) {
      instancedMist.material.opacity = targetOpacity;
    }

    let interactPoint = null;
    const dummyPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.1);
    const rayIntersection = new THREE.Vector3();
    if (state.raycaster.ray.intersectPlane(dummyPlane, rayIntersection)) {
      interactPoint = rayIntersection;
    }

    const tempObject = new THREE.Object3D();
    mistParticles.forEach((particle, idx) => {
      particle.baseX += particle.speedX * 0.04;
      if (particle.baseX > 9) particle.baseX = -9;

      particle.angle += particle.angleSpeed * 0.04;
      const wave = Math.sin(particle.angle) * 0.12;

      let targetX = particle.baseX;
      let targetY = particle.baseY + wave;

      if (interactPoint) {
        const dx = targetX - interactPoint.x;
        const dy = targetY - interactPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radiusRepulsion = 2.4;

        if (dist < radiusRepulsion) {
          const pushForce = (1.0 - dist / radiusRepulsion) * 1.4;
          const anglePush = Math.atan2(dy, dx);
          targetX += Math.cos(anglePush) * pushForce;
          targetY += Math.sin(anglePush) * pushForce;
        }
      }

      particle.x += (targetX - particle.x) * 0.1;
      particle.y += (targetY - particle.y) * 0.1;

      tempObject.position.set(particle.x, particle.y, particle.z);
      tempObject.scale.set(particle.scale, particle.scale, 1);
      tempObject.rotation.z = particle.angle * 0.05;
      tempObject.updateMatrix();
      
      instancedMist.setMatrixAt(idx, tempObject.matrix);
    });
    instancedMist.instanceMatrix.needsUpdate = true;

    if (mistTexture) {
      mistTexture.offset.x += 0.00012;
      mistTexture.offset.y += 0.00004;
    }

    // 6. CONTROL DE OPACIDADES POR SECCIÓN
    const opacityFactor1 = Math.max(0, 1 - renderedScroll * 4.5);
    if (bgMesh.material) bgMesh.material.opacity = opacityFactor1;
    if (logoMesh.material) logoMesh.material.opacity = opacityFactor1;
    if (fgMesh.material) fgMesh.material.opacity = opacityFactor1;

    let opacityFactor2 = 0;
    if (renderedScroll < 0.2) {
      opacityFactor2 = Math.min(1, renderedScroll * 5);
    } else if (renderedScroll < 0.32) {
      opacityFactor2 = 1.0;
    } else {
      opacityFactor2 = Math.max(0, 1 - (renderedScroll - 0.32) * 5);
    }
    if (bg2Mesh.material) bg2Mesh.material.opacity = opacityFactor2;
  });

  return (
    <group ref={groupRef}>
      {/* ── PANEL 1 (HERO SECTION SÁNDWICH DE PROFUNDIDAD) ──────────────────── */}
      
      {/* CAPA ATRÁS: Paisaje ecológico de fondo */}
      <mesh ref={bgMeshRef} position={[0, 0, -6]}>
        <planeGeometry args={[19.0, 11.0, 8, 8]} />
        <meshBasicMaterial 
          map={bgTexture}
          transparent={true} 
          opacity={1.0} 
          depthWrite={false}
        />
      </mesh>

      {/* CAPA CENTRO: Logo vectorial reactivo (SERAM) */}
      <mesh ref={logoMeshRef} position={[-2.5, 0, -2]}>
        <planeGeometry args={[5.0, 5.0, 32, 32]} />
        <meshBasicMaterial 
          map={logoTexture}
          transparent={true} 
          opacity={1.0} 
          depthWrite={false}
        />
      </mesh>

      {/* Neblina tridimensional intermedia */}
      <instancedMesh ref={instancedMistRef} args={[null, null, mistCount]} position={[0, 0, -0.05]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial 
          map={mistTexture}
          transparent={true}
          opacity={0.0}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </instancedMesh>

      {/* CAPA FRENTE: Plantas recortadas desenfocadas de la esquina inferior */}
      <mesh ref={fgMeshRef} position={[-2.0, -1.8, 1]}>
        <planeGeometry args={[10.0, 6.0, 32, 32]} />
        <meshBasicMaterial 
          map={fgTexture}
          transparent={true}
          opacity={1.0}
          depthWrite={false}
        />
      </mesh>

      {/* ── PANEL 2 ────────────────────────────────────────────────────────── */}
      <mesh ref={bg2MeshRef} position={[0, 0, -0.38]}>
        <planeGeometry args={[16.0, 9.0, 32, 32]} />
        <meshBasicMaterial 
          map={bg2Texture}
          transparent={true}
          opacity={0.0} 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * @component BackgroundScene
 * @description Escena 3D estática para páginas tradicionales.
 */
function BackgroundScene() {
  const meshRef = useRef();
  const velocities = useMemo(() => new Float32Array(vertexCount), []);

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

    const elapsed = state.clock.getElapsedTime();
    mesh.rotation.y = Math.sin(elapsed * 0.1) * 0.08;
    mesh.position.z = -1.0 + Math.cos(elapsed * 0.08) * 0.15;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[5.8, 5.8, 32, 32]} />
      <meshBasicMaterial 
        color="#010409" 
        transparent={true} 
        opacity={0.0} 
      />
    </mesh>
  );
}

/**
 * @component EnvironmentalCanvas
 * @description Contenedor global para el lienzo WebGL. Funciona como un fondo fijo puro.
 */
export default function EnvironmentalCanvas({ isStorytelling = false }) {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    backgroundColor: '#010409',
  };

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
          {isStorytelling ? <InteractiveScene /> : <BackgroundScene />}
        </React.Suspense>
      </Canvas>
    </div>
  );
}

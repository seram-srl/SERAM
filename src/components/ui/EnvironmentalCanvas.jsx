import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';

// ── ASSETS DESDE LA NUEVA ESTRUCTURA DE PUBLIC ──────────────────────────────
import landscapeBg from '../../public/assets/3d-backend/landspace-background2.webp';
import fondo2doPanel from '../../public/assets/fondo2_2do_panel.webp';
import panel2ServiceBg from '../../public/assets/3d-backend/panel2-service-background.webp';
import academyBg from '../../public/assets/3d-backend/fondo SERAM-ACADEMY2.webp';
import expBg from '../../public/assets/3d-backend/Seram-Exp-background.webp';
import shopBg from '../../public/assets/3d-backend/landspace-backgroundstore.webp';

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
 * @description Escena 3D optimizada para el Home Page. Maneja las transiciones de opacidad
 * entre los 4 fondos correspondientes a los pilares según el avance del scroll.
 */
function InteractiveScene() {
  const groupRef = useRef();
  const bgMeshRef = useRef();
  const bg2MeshRef = useRef();
  const bgAcademyMeshRef = useRef();
  const bgExpMeshRef = useRef();
  const instancedMistRef = useRef();

  // Velocidades físicas para los vértices de la deformación elástica de bg2Mesh
  const velocities2 = useMemo(() => new Float32Array(vertexCount), []);

  // Texturas de alta calidad
  const bgTexture = useTexture(landscapeBg);
  const bg2Texture = useTexture(fondo2doPanel);
  const academyTexture = useTexture(academyBg);
  const expTexture = useTexture(expBg);
  const mistTexture = useMemo(() => createNoiseTexture(), []);

  // Limpieza de textura de neblina
  useEffect(() => {
    return () => {
      if (mistTexture) mistTexture.dispose();
    };
  }, [mistTexture]);

  // Parallax e inercias del mouse y scroll
  const currentMouseX = useRef(0);
  const currentMouseY = useRef(0);
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
    handleScroll();

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
    const bg2Mesh = bg2MeshRef.current;
    const bgAcademyMesh = bgAcademyMeshRef.current;
    const bgExpMesh = bgExpMeshRef.current;
    const instancedMist = instancedMistRef.current;
    const group = groupRef.current;

    if (!bgMesh || !bg2Mesh || !bgAcademyMesh || !bgExpMesh || !instancedMist || !group) return;

    // 2. SINCRONIZACIÓN DE SCROLL NATIVO (LERP Coeficiente 0.1)
    const targetScroll = scrollProgressRef.current;
    let scrollDiff = targetScroll - currentScroll.current;
    currentScroll.current += scrollDiff * 0.1;
    
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

    // Zoom out en el eje Z al scrollar
    let heroProgress = 0;
    if (renderedScroll < 0.2) {
      heroProgress = 1.0 - (renderedScroll / 0.2);
    } else if (renderedScroll > 0.8) {
      heroProgress = (renderedScroll - 0.8) / 0.2;
    }
    const zoomOutOffset = (1.0 - heroProgress) * 4.0;
    cameraPosition.z += zoomOutOffset;

    state.camera.position.copy(cameraPosition);

    // 4. PARALLAX Y MIRADA DE CÁMARA CON INERCIA DEL MOUSE
    const targetMouseX = state.pointer.x * 0.25;
    const targetMouseY = state.pointer.y * 0.25;
    
    currentMouseX.current += (targetMouseX - currentMouseX.current) * 0.08;
    currentMouseY.current += (targetMouseY - currentMouseY.current) * 0.08;

    // Paralaje del ratón en las mallas de fondo
    bgMesh.position.x = currentMouseX.current * 0.3;
    bgMesh.position.y = currentMouseY.current * 0.3;
    bgMesh.position.z = -6.0 - (1.0 - heroProgress) * 0.3;

    bg2Mesh.position.x = currentMouseX.current * 0.3;
    bg2Mesh.position.y = currentMouseY.current * 0.3;

    bgAcademyMesh.position.x = currentMouseX.current * 0.3;
    bgAcademyMesh.position.y = currentMouseY.current * 0.3;

    bgExpMesh.position.x = currentMouseX.current * 0.3;
    bgExpMesh.position.y = currentMouseY.current * 0.3;

    // Mirada de la cámara
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    cameraTarget.x += currentMouseX.current * 0.7;
    cameraTarget.y += currentMouseY.current * 0.7;
    state.camera.lookAt(cameraTarget);

    // 1. FÍSICA ELÁSTICA DE VÉRTICES (Raycasting en bg2Mesh)
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersects2 = state.raycaster.intersectObject(bg2Mesh);
    let localPoint2 = null;
    if (intersects2.length > 0) {
      localPoint2 = bg2Mesh.worldToLocal(intersects2[0].point.clone());
    }

    const geometry2 = bg2Mesh.geometry;
    const posAttr2 = geometry2.attributes.position;
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

    // 5. NEBLINA INTERACTIVA
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

    // 6. CONTROL DE OPACIDADES SECUENCIALES DE LOS FONDOS EN EL SCROLL
    // Panel 1 (Hero)
    const opacityFactor1 = Math.max(0, 1 - renderedScroll * 4.5);
    let finalOpacity1 = opacityFactor1;
    if (renderedScroll > 0.8) {
      finalOpacity1 = (renderedScroll - 0.8) / 0.2;
    }
    if (bgMesh.material) bgMesh.material.opacity = finalOpacity1;

    // Panel 2 (Services)
    let opacityFactor2 = 0;
    if (renderedScroll < 0.2) {
      opacityFactor2 = renderedScroll / 0.2;
    } else if (renderedScroll < 0.4) {
      opacityFactor2 = 1.0 - ((renderedScroll - 0.2) / 0.2);
    }
    if (bg2Mesh.material) bg2Mesh.material.opacity = opacityFactor2;

    // Panel 3 (Academy)
    let opacityAcademy = 0;
    if (renderedScroll >= 0.2 && renderedScroll < 0.4) {
      opacityAcademy = (renderedScroll - 0.2) / 0.2;
    } else if (renderedScroll >= 0.4 && renderedScroll < 0.6) {
      opacityAcademy = 1.0 - ((renderedScroll - 0.4) / 0.2);
    }
    if (bgAcademyMesh.material) bgAcademyMesh.material.opacity = opacityAcademy;

    // Panel 4 (Experience)
    let opacityExp = 0;
    if (renderedScroll >= 0.4 && renderedScroll < 0.6) {
      opacityExp = (renderedScroll - 0.4) / 0.2;
    } else if (renderedScroll >= 0.6 && renderedScroll < 0.8) {
      opacityExp = 1.0 - ((renderedScroll - 0.6) / 0.2);
    }
    if (bgExpMesh.material) bgExpMesh.material.opacity = opacityExp;
  });

  return (
    <group ref={groupRef}>
      {/* CAPA 1: Paisaje Hero */}
      <mesh ref={bgMeshRef} position={[0, 0, -6]}>
        <planeGeometry args={[45.0, 27.0, 8, 8]} />
        <meshBasicMaterial 
          map={bgTexture}
          transparent={true} 
          opacity={1.0} 
          depthWrite={false}
        />
      </mesh>

      {/* CAPA 2: Servicios (deformación elástica 32x32) */}
      <mesh ref={bg2MeshRef} position={[0, 0, -6]}>
        <planeGeometry args={[45.0, 27.0, 32, 32]} />
        <meshBasicMaterial 
          map={bg2Texture}
          transparent={true}
          opacity={0.0} 
          depthWrite={false}
        />
      </mesh>

      {/* CAPA 3: Academy */}
      <mesh ref={bgAcademyMeshRef} position={[0, 0, -6]}>
        <planeGeometry args={[45.0, 27.0, 8, 8]} />
        <meshBasicMaterial 
          map={academyTexture}
          transparent={true}
          opacity={0.0} 
          depthWrite={false}
        />
      </mesh>

      {/* CAPA 4: Experience */}
      <mesh ref={bgExpMeshRef} position={[0, 0, -6]}>
        <planeGeometry args={[45.0, 27.0, 8, 8]} />
        <meshBasicMaterial 
          map={expTexture}
          transparent={true}
          opacity={0.0} 
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
    </group>
  );
}

/**
 * @component BackgroundScene
 * @description Escena 3D estática para páginas tradicionales.
 * Carga de forma selectiva y con continuidad las imágenes de pilar, y
 * en el caso de Servicios, maneja una transición al deslizar el scroll.
 */
function BackgroundScene({ pathname }) {
  const bgMesh1Ref = useRef();
  const bgMesh2Ref = useRef();
  const scrollProgressRef = useRef(0);
  const currentScroll = useRef(0);

  // Texturas
  const academyBgTexture = useTexture(academyBg);
  const expBgTexture = useTexture(expBg);
  const servicesBg1Texture = useTexture(fondo2doPanel);
  const servicesBg2Texture = useTexture(panel2ServiceBg);
  const shopBgTexture = useTexture(shopBg);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      scrollProgressRef.current = progress;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useFrame((state) => {
    const bgMesh1 = bgMesh1Ref.current;
    const bgMesh2 = bgMesh2Ref.current;

    // Smooth scroll
    const targetScroll = scrollProgressRef.current;
    currentScroll.current += (targetScroll - currentScroll.current) * 0.1;

    // Parallax de mouse leve
    const targetMouseX = state.pointer.x * 0.1;
    const targetMouseY = state.pointer.y * 0.1;

    if (bgMesh1) {
      bgMesh1.position.x = targetMouseX;
      bgMesh1.position.y = targetMouseY;
    }
    if (bgMesh2) {
      bgMesh2.position.x = targetMouseX;
      bgMesh2.position.y = targetMouseY;
    }

    // Transición de opacidades en la página de Servicios
    if (pathname === '/services') {
      const transitionProgress = Math.min(1.0, currentScroll.current / 0.4);
      if (bgMesh1 && bgMesh1.material) bgMesh1.material.opacity = 1.0 - transitionProgress;
      if (bgMesh2 && bgMesh2.material) bgMesh2.material.opacity = transitionProgress;
    } else {
      if (bgMesh1 && bgMesh1.material) bgMesh1.material.opacity = 1.0;
    }
  });

  // Determinar texturas según pathname
  let texture1 = null;
  let texture2 = null;

  if (pathname === '/academy') {
    texture1 = academyBgTexture;
  } else if (pathname === '/experience') {
    texture1 = expBgTexture;
  } else if (pathname === '/services') {
    texture1 = servicesBg1Texture;
    texture2 = servicesBg2Texture;
  } else if (pathname === '/shop') {
    texture1 = shopBgTexture;
  }

  // Fallback si no es una ruta mapeada
  if (!texture1) {
    return (
      <mesh position={[0, 0, -6]}>
        <planeGeometry args={[45.0, 27.0]} />
        <meshBasicMaterial color="#010409" />
      </mesh>
    );
  }

  return (
    <group>
      {/* Fondo Inicial */}
      <mesh ref={bgMesh1Ref} position={[0, 0, -6]}>
        <planeGeometry args={[45.0, 27.0]} />
        <meshBasicMaterial 
          map={texture1} 
          transparent={true} 
          opacity={1.0} 
          depthWrite={false}
        />
      </mesh>

      {/* Segundo Fondo (exclusivo para Servicios) */}
      {pathname === '/services' && texture2 && (
        <mesh ref={bgMesh2Ref} position={[0, 0, -5.9]}>
          <planeGeometry args={[45.0, 27.0]} />
          <meshBasicMaterial 
            map={texture2} 
            transparent={true} 
            opacity={0.0} 
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * @component EnvironmentalCanvas
 * @description Contenedor global para el lienzo WebGL. Funciona como un fondo fijo puro.
 */
export default function EnvironmentalCanvas({ isStorytelling = false }) {
  const location = useLocation();

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    backgroundColor: '#010409',
    margin: 0,
    padding: 0
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
          {isStorytelling ? (
            <InteractiveScene />
          ) : (
            <BackgroundScene pathname={location.pathname} />
          )}
        </React.Suspense>
      </Canvas>
    </div>
  );
}

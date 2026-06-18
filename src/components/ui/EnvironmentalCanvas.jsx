import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import EcosystemNucleus from './EcosystemNucleus';


// ── ASSETS — ECOSISTEMAS BOLIVIANOS (IA-generados) ───────────────────────────
const landscapeBg    = '/assets/3d-backend/landspace-background2.webp';     // Amazonía boliviana (Fondo Premium)
const fondo2doPanel  = '/assets/3d-backend/bg_services_river.webp';    // Río / GIS
const panel2ServiceBg= '/assets/3d-backend/bg_services_river.webp';    // Servicios alt
const academyBg      = '/assets/3d-backend/bg_academy_cloudforest.webp'; // Bosque nublado
const expBg          = '/assets/3d-backend/bg_experience_salar.webp';  // Salar de Uyuni
const shopBg         = '/assets/3d-backend/bg_store_ecomarket.webp';   // Jardín botánico


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
      
      const alpha = Math.floor(val * 255 * 0.55 * edgeFade);
      
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
 * @description Escena 3D optimizada para el Home Page.
 * Acepta hProgressRef (ref mutable del carrusel horizontal) para sincronizar
 * la cámara WebGL con el progreso del carrusel, siguiendo CONTEXT_GUIDE:
 * PROHIBIDO setState — todas las mutaciones en useFrame con refs.
 *
 * @param {Object} hProgressRef - React ref con valor 0→1 del carrusel horizontal.
 *   Si es null/undefined, se usa el scroll vertical estándar.
 */
function InteractiveScene({ hProgressRef }) {
  const groupRef = useRef();
  const ambientLightRef = useRef();
  const pointLightRef = useRef();
  const scrollProgressRef = useRef(0);
  const currentScroll = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);

  // 1. Carga de las texturas de paisajes para la narración
  const heroBgTexture = useTexture(landscapeBg);
  const servicesBgTexture = useTexture(fondo2doPanel);
  const academyBgTexture = useTexture(academyBg);
  const expBgTexture = useTexture(expBg);
  const shopBgTexture = useTexture(shopBg);
  const fgPlantsTexture = useTexture('/assets/3d-backend/foreground-plants.webp');

  // Refs para el billboard y los planos individuales
  const bgGroupRef = useRef();
  const heroBgRef = useRef();
  const servicesBgRef = useRef();
  const academyBgRef = useRef();
  const expBgRef = useRef();
  const shopBgRef = useRef();
  const fgPlantsRef = useRef();

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
    // ── PROGRESO COMBINADO ────────────────────────────────────────────────────
    // Si el carrusel horizontal está activo (hProgressRef disponible y > 0),
    // usamos ese progreso para las transiciones de pilares.
    // En caso contrario, caemos al scroll vertical.
    const hP = hProgressRef?.current ?? 0;
    const vP = scrollProgressRef.current;

    // Blend: cuando el carrusel horizontal supera 0.01, priorizamos el progreso horizontal
    // para las transiciones de fondos y partículas.
    const p = hP > 0.01 ? hP : vP;

    // 1. Suavizado LERP del scroll
    currentScroll.current += (p - currentScroll.current) * 0.1;
    const smoothP = currentScroll.current;

    // 2. Trayectoria Orbital B-Roll
    const baseRadius = 5.2;
    const radiusAmplitude = 0.4;
    const radius = baseRadius - Math.sin(smoothP * Math.PI) * radiusAmplitude;
    const angle = smoothP * Math.PI * 1.5; // Giro orbital de 270 grados
    const height = (1.0 - smoothP) * 2.5 - 0.2; // Descenso de la grúa de cámara

    let posX = Math.cos(angle) * radius;
    let posZ = Math.sin(angle) * radius;
    let posY = height;

    // Ajuste responsivo de la cámara en dispositivos móviles (verticales)
    const aspect = state.width / state.height;
    if (aspect < 1.0) {
      posX += 1.2;
      posZ += 0.8;
      posY += 0.3;
    }

    // 3. Parallax del Cursor
    const mouseSensitivity = 0.35;
    targetX.current += (state.pointer.x * mouseSensitivity - targetX.current) * 0.06;
    targetY.current += (state.pointer.y * mouseSensitivity - targetY.current) * 0.06;

    // Aplicar la posición LERPed final a la cámara
    state.camera.position.x += (posX + targetX.current - state.camera.position.x) * 0.08;
    state.camera.position.y += (posY + targetY.current - state.camera.position.y) * 0.08;
    state.camera.position.z += (posZ - state.camera.position.z) * 0.08;

    // Mirada al origen (Núcleo) con micro-ajustes por mouse
    const focusTarget = new THREE.Vector3(targetX.current * 0.4, targetY.current * 0.4, 0);
    state.camera.lookAt(focusTarget);

    // 4. Posicionar y rotar el grupo exactamente en la cámara
    if (bgGroupRef.current) {
      bgGroupRef.current.position.copy(state.camera.position);
      bgGroupRef.current.rotation.copy(state.camera.rotation);
    }

    // 5. Cálculo dinámico del desplazamiento de vuelo y opacidades de portal
    const spacing = 12.0;
    const baseDepth = 8.0;
    const totalShift = spacing * 4.0; // 48.0
    const flightOffset = smoothP * totalShift;

    const planesList = [
      { ref: heroBgRef, index: 0 },
      { ref: servicesBgRef, index: 1 },
      { ref: academyBgRef, index: 2 },
      { ref: expBgRef, index: 3 },
      { ref: shopBgRef, index: 4 }
    ];

    planesList.forEach(({ ref, index }) => {
      if (!ref.current) return;

      const zCurr = -baseDepth - index * spacing + flightOffset;

      // Calcular opacidad según profundidad local
      let opacity = 0;
      if (zCurr >= -20.0 && zCurr < -8.0) {
        // Fade in al aproximarse
        opacity = (zCurr - (-20.0)) / 12.0;
      } else if (zCurr >= -8.0 && zCurr < -3.0) {
        // Opaque en zona de enfoque
        opacity = 1.0;
      } else if (zCurr >= -3.0 && zCurr < 0.0) {
        // Fade out al atravesar la cámara
        opacity = zCurr / -3.0;
      }

      if (ref.current.material) {
        ref.current.material.opacity = Math.min(1.0, Math.max(0.0, opacity));
      }

      // Aplicar posición Z local
      ref.current.position.z = zCurr;

      // Verdadero Parallax 3D:
      // Un worldFixedRatio de 0.85 significa que se desplaza en sentido contrario
      // al movimiento de la cámara, creando el efecto de profundidad 3D en lugar de skybox estático.
      // El índice más alejado (Store) se desplaza menos (worldFixedRatio menor) simulando mayor distancia.
      const worldFixedRatio = 0.85 - index * 0.12;
      ref.current.position.x = -state.camera.position.x * worldFixedRatio - targetX.current * 0.3 * (index + 1);
      ref.current.position.y = -state.camera.position.y * worldFixedRatio - targetY.current * 0.3 * (index + 1);
    });

    // Control del Primer Plano (Foreground) - Plantas silvestres
    if (fgPlantsRef.current) {
      const fgZ = -3.8 + smoothP * 18.0;
      fgPlantsRef.current.position.z = fgZ;

      let fgOpacity = 0;
      if (fgZ >= -10.0 && fgZ < -1.8) {
        fgOpacity = 0.95;
      } else if (fgZ >= -1.8 && fgZ < 0.0) {
        fgOpacity = 0.95 * (fgZ / -1.8);
      }
      if (fgPlantsRef.current.material) {
        fgPlantsRef.current.material.opacity = Math.max(0.0, fgOpacity);
      }

      // Las plantas del primer plano están muy cerca de la lente y se mueven con un parallax suave
      fgPlantsRef.current.position.x = -state.camera.position.x * 0.4 - targetX.current * 0.4;
      fgPlantsRef.current.position.y = -1.5 - state.camera.position.y * 0.4 - targetY.current * 0.4;
    }

    // 6. Intensidad de Luces Reactiva al Scroll (Brillo máximo en Servicios/Academia)
    let intensityFactor = 0.0;
    if (smoothP < 0.25) {
      intensityFactor = smoothP / 0.25; // 0 a 1
    } else if (smoothP < 0.50) {
      intensityFactor = 1.0;
    } else if (smoothP < 0.75) {
      intensityFactor = 1.0 - ((smoothP - 0.50) / 0.25) * 0.5; // Caída a 0.5
    } else {
      intensityFactor = 0.5 - ((smoothP - 0.75) / 0.25) * 0.3; // Caída a 0.2
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.35 + intensityFactor * 0.50; // Rango: [0.35, 0.85]
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity = 0.8 + intensityFactor * 1.40;   // Rango: [0.80, 2.20]
    }

    // 7. Ciclorama de Estudio: Transición de verde/negro a verde boscoso ultra-iluminado
    if (state.scene) {
      let bgColor = new THREE.Color(0x020704); // Base Hero (verde/negro brumoso)
      if (smoothP < 0.25) {
        // Hero a Services: Hacia verde boscoso
        bgColor.lerp(new THREE.Color(0x011f0a), smoothP / 0.25);
      } else if (smoothP < 0.50) {
        // Services a Academy: Hacia verde boscoso ultra-iluminado
        const t = (smoothP - 0.25) / 0.25;
        bgColor = new THREE.Color(0x011f0a).lerp(new THREE.Color(0x012b0e), t);
      } else if (smoothP < 0.75) {
        // Academy a Experience: Hacia azulado-verdoso profundo húmedo
        const t = (smoothP - 0.50) / 0.25;
        bgColor = new THREE.Color(0x012b0e).lerp(new THREE.Color(0x001710), t);
      } else {
        // Experience a Store: Retorno a verde-esmeralda limpio
        const t = (smoothP - 0.75) / 0.25;
        bgColor = new THREE.Color(0x001710).lerp(new THREE.Color(0x010905), t);
      }
      state.scene.background = bgColor;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight ref={ambientLightRef} intensity={0.35} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <pointLight ref={pointLightRef} position={[0, 0, 2]} intensity={0.8} color="#00e03c" />

      {/* Cartelera 3D de Fondos Paisajísticos (Billboard) */}
      <group ref={bgGroupRef}>
        {/* Fondo 1: Hero */}
        <mesh ref={heroBgRef} position={[0, 0, -0.04]}>
          <planeGeometry args={[44, 22]} />
          <meshBasicMaterial map={heroBgTexture} transparent depthWrite={false} opacity={1} />
        </mesh>
        
        {/* Fondo 2: Servicios */}
        <mesh ref={servicesBgRef} position={[0, 0, -0.03]}>
          <planeGeometry args={[44, 22]} />
          <meshBasicMaterial map={servicesBgTexture} transparent depthWrite={false} opacity={0} />
        </mesh>

        {/* Fondo 3: Academia */}
        <mesh ref={academyBgRef} position={[0, 0, -0.02]}>
          <planeGeometry args={[44, 22]} />
          <meshBasicMaterial map={academyBgTexture} transparent depthWrite={false} opacity={0} />
        </mesh>

        {/* Fondo 4: Experiencias */}
        <mesh ref={expBgRef} position={[0, 0, -0.01]}>
          <planeGeometry args={[44, 22]} />
          <meshBasicMaterial map={expBgTexture} transparent depthWrite={false} opacity={0} />
        </mesh>

        {/* Fondo 5: Tienda */}
        <mesh ref={shopBgRef} position={[0, 0, 0]}>
          <planeGeometry args={[44, 22]} />
          <meshBasicMaterial map={shopBgTexture} transparent depthWrite={false} opacity={0} />
        </mesh>

        {/* Capa de Primer Plano (Foreground) - Plantas silvestres */}
        <mesh ref={fgPlantsRef} position={[0, -1.5, -2.5]}>
          <planeGeometry args={[24, 12]} />
          <meshBasicMaterial map={fgPlantsTexture} transparent depthWrite={false} opacity={0.95} />
        </mesh>
      </group>

      {/* Renderizar el Núcleo Ecosistémico de Partículas */}
      <EcosystemNucleus scrollRef={scrollProgressRef} />
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
/**
 * @component EnvironmentalCanvas
 * @description Contenedor global para el lienzo WebGL. Funciona como un fondo fijo puro.
 * @param {boolean} isStorytelling - Activa la escena narrativa del Home Page.
 * @param {Object} hProgressRef - Ref mutable del carrusel horizontal (0→1). Opcional.
 */
export default function EnvironmentalCanvas({ isStorytelling = false, hProgressRef = null }) {
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
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        
        <React.Suspense fallback={null}>
          {isStorytelling ? (
            <InteractiveScene hProgressRef={hProgressRef} />
          ) : (
            <BackgroundScene pathname={location.pathname} />
          )}
        </React.Suspense>
      </Canvas>
    </div>
  );
}

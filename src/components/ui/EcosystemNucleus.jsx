import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── GLSL SHADERS PARA RENDIMIENTO OPTIMIZADO EN GPU ──────────────────────────

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;

  attribute vec3 aPosServices;
  attribute vec3 aPosAcademy;
  attribute vec3 aPosExperience;
  attribute vec3 aPosStore;

  varying float vDepth;
  varying float vMorphProgress;

  void main() {
    vec3 pos = position; // Estado 1 (Hero/Leaf) por defecto

    // 1. Interpolación secuencial basada en el progreso de scroll (uniform uProgress)
    if (uProgress < 0.25) {
      float t = uProgress / 0.25;
      pos = mix(position, aPosServices, t);
    } else if (uProgress < 0.50) {
      float t = (uProgress - 0.25) / 0.25;
      pos = mix(aPosServices, aPosAcademy, t);
    } else if (uProgress < 0.75) {
      float t = (uProgress - 0.50) / 0.25;
      pos = mix(aPosAcademy, aPosExperience, t);
    } else {
      float t = (uProgress - 0.75) / 0.25;
      pos = mix(aPosExperience, aPosStore, t);
    }

    // 2. Ondulaciones de vapor orgánico semitropical (humedad y calor)
    // El movimiento es más inestable/gaseoso al inicio (Evapotranspiración)
    float vaporStrength = 0.07 + (1.0 - uProgress) * 0.11;
    pos.x += sin(uTime * 1.6 + pos.y * 2.2) * vaporStrength;
    pos.y += cos(uTime * 1.3 + pos.x * 2.2) * vaporStrength;
    pos.z += sin(uTime * 0.9 + pos.x * pos.y) * (vaporStrength * 0.6);

    // 3. Parallax del Cursor: Empuje suave y elástico
    float distToMouse = distance(pos.xy, uMouse * 2.5);
    if (distToMouse < 2.0) {
      float force = (1.0 - distToMouse / 2.0) * 0.22;
      pos.xy += normalize(pos.xy - uMouse * 2.5) * force;
    }

    // Transformar a coordenadas de pantalla
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // 4. Atenuación de tamaño por distancia de la cámara
    gl_PointSize = (13.0 / -mvPosition.z);

    // Pasar datos al fragment shader
    vDepth = -mvPosition.z;
    vMorphProgress = uProgress;
  }
`;

const fragmentShader = `
  varying float vDepth;
  varying float vMorphProgress;

  void main() {
    // Dar forma circular al punto (PointCoord de 0 a 1)
    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
    float dist = dot(circCoord, circCoord);
    if (dist > 1.0) {
      discard;
    }

    // Desvanecimiento suave en los bordes para el efecto glow
    float alpha = 1.0 - dist;

    // Acento Verde Esmeralda oficial (#00e03c)
    vec3 emerald = vec3(0.0, 0.88, 0.235);
    
    // Tono para Academy (Azul claro de precipitación / agua pura)
    vec3 waterColor = vec3(0.05, 0.62, 0.95);
    
    vec3 color = emerald;
    if (vMorphProgress > 0.25 && vMorphProgress < 0.75) {
      float blendFactor = smoothstep(0.25, 0.50, vMorphProgress) * (1.0 - smoothstep(0.50, 0.75, vMorphProgress));
      color = mix(emerald, waterColor, blendFactor);
    }

    // Mezclar con color blanco en el centro para dar intensidad al brillo (brillo de rocío)
    color = mix(vec3(1.0), color, dist * 0.85);

    // Ajustar opacidad total en base a distancia
    float finalAlpha = alpha * 0.8 * clamp(1.2 - (vDepth / 12.0), 0.1, 1.0);

    gl_FragColor = vec4(color, finalAlpha);
  }
`;

export default function EcosystemNucleus({ scrollRef }) {
  const materialRef = useRef();
  const initialPositionRef = useRef();
  const currentScroll = useRef(0);
  const count = 3000;

  // ── GENERACIÓN MATEMÁTICA DE ATRIBUTOS PARA CADA ESTADO ─────────────────────
  
  const { positions, posServices, posAcademy, posExperience, posStore } = useMemo(() => {
    // Estado 1: Inicial - Se cargará la silueta de la hoja asíncronamente. 
    // Inicialmente se crea una nube dispersa de backup.
    const positions = new Float32Array(count * 3);
    const posServices = new Float32Array(count * 3);
    const posAcademy = new Float32Array(count * 3);
    const posExperience = new Float32Array(count * 3);
    const posStore = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 1. Estado 1: Backup (Esfera)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rSphere = 1.6 + Math.random() * 0.3;
      positions[i * 3] = rSphere * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = rSphere * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = rSphere * Math.cos(phi);

      // 2. Estado 2: Condensación (Nubes sobre el dosel forestal - Malla ondulada)
      const xPlane = (Math.random() - 0.5) * 8.5;
      const zPlane = (Math.random() - 0.5) * 5.5;
      const yPlane = Math.sin(xPlane * 0.6 + zPlane * 0.6) * 0.4 + Math.cos(xPlane * 0.4) * 0.3 + (Math.random() - 0.5) * 0.12;
      posServices[i * 3] = xPlane;
      posServices[i * 3 + 1] = yPlane - 0.6;
      posServices[i * 3 + 2] = zPlane;

      // 3. Estado 3: Precipitación (Lluvia vertical y ondas de gotas)
      if (Math.random() < 0.35) {
        // Gotas de lluvia cayendo
        posAcademy[i * 3] = (Math.random() - 0.5) * 4.5;
        posAcademy[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
        posAcademy[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      } else {
        // Ondas concéntricas de impacto de lluvia
        const ringIndex = Math.floor(Math.random() * 4);
        const rRing = 0.3 + ringIndex * 0.6;
        const aRing = Math.random() * Math.PI * 2;
        posAcademy[i * 3] = Math.cos(aRing) * rRing + (Math.random() - 0.5) * 0.05;
        posAcademy[i * 3 + 1] = -1.0 + (Math.random() - 0.5) * 0.05;
        posAcademy[i * 3 + 2] = Math.sin(aRing) * rRing + (Math.random() - 0.5) * 0.05;
      }

      // 4. Estado 4: Infiltración e Hidro-Absorción (Doble Hélice / Raíces)
      const branch = Math.random() > 0.5 ? 0 : Math.PI;
      const hHelix = (Math.random() - 0.5) * 5.0;
      const aHelix = hHelix * 2.5 + branch;
      // Estrechar en la base para emular raíces profundas
      const rHelix = 0.85 * (1.0 - (hHelix + 2.5) / 10.0);
      posExperience[i * 3] = Math.sin(aHelix) * rHelix;
      posExperience[i * 3 + 1] = hHelix;
      posExperience[i * 3 + 2] = Math.cos(aHelix) * rHelix;

      // 5. Estado 5: Rocío Concentrado (Transpiración acumulada)
      const uStore = Math.random();
      const vStore = Math.random();
      const thetaStore = uStore * 2.0 * Math.PI;
      const phiStore = Math.acos(2.0 * vStore - 1.0);
      const rStore = Math.pow(Math.random(), 2.5) * 0.55; // Mayor concentración al centro
      posStore[i * 3] = rStore * Math.sin(phiStore) * Math.cos(thetaStore);
      posStore[i * 3 + 1] = rStore * Math.sin(phiStore) * Math.sin(thetaStore);
      posStore[i * 3 + 2] = rStore * Math.cos(phiStore);
    }

    return { positions, posServices, posAcademy, posExperience, posStore };
  }, []);

  // ── CARGA DEL LOGO Y EXTRACCIÓN DE COORDENADAS DE PÍXELES ───────────────────
  
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/brand/ícono_logo.png';
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 128, 128);
      const imgData = ctx.getImageData(0, 0, 128, 128).data;
      
      const points = [];
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const idx = (x + y * 128) * 4;
          const alpha = imgData[idx + 3];
          // Si el píxel es lo suficientemente opaco
          if (alpha > 120) {
            // Escalar de [0, 128] a rango espacial [-1.8, 1.8]
            const px = ((x / 128) - 0.5) * 3.6;
            // Invertir Y para coordenadas 3D de WebGL
            const py = -((y / 128) - 0.5) * 3.6;
            points.push({ x: px, y: py });
          }
        }
      }
      
      if (points.length > 0 && initialPositionRef.current) {
        const arr = initialPositionRef.current.array;
        for (let i = 0; i < count; i++) {
          const pt = points[Math.floor(Math.random() * points.length)];
          // Dispersión sutil tridimensional alrededor de la silueta del logo
          // Mapeamos el ancho del logo (pt.x) al eje Z y el grosor al eje X,
          // ya que en el Hero la cámara observa la escena desde el eje X (X = 5.2, Z = 0).
          arr[i * 3] = (Math.random() - 0.5) * 0.25; // X: Profundidad (línea de visión de la cámara)
          arr[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.05; // Y: Altura (eje vertical de la cámara)
          arr[i * 3 + 2] = -pt.x + (Math.random() - 0.5) * 0.05; // Z: Ancho (eje horizontal de la cámara, invertido para evitar efecto espejo)
        }
        initialPositionRef.current.needsUpdate = true;
      }
    };
  }, []);

  // ── UNIFORMS PARA ENVIAR DATOS CONSTANTES AL SHADER ─────────────────────────
  
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) }
  }), []);

  // ── BUCLE DE RENDERIZACIÓN POR FRAME ────────────────────────────────────────
  
  useFrame((state) => {
    if (!materialRef.current) return;
    
    // Inyectar tiempo
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    
    // Inyectar progreso de scroll LERPed
    const targetScroll = scrollRef.current || 0;
    currentScroll.current += (targetScroll - currentScroll.current) * 0.1;
    materialRef.current.uniforms.uProgress.value = currentScroll.current;
    
    // Inyectar posición del mouse
    materialRef.current.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={initialPositionRef}
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPosServices"
          count={posServices.length / 3}
          array={posServices}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPosAcademy"
          count={posAcademy.length / 3}
          array={posAcademy}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPosExperience"
          count={posExperience.length / 3}
          array={posExperience}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPosStore"
          count={posStore.length / 3}
          array={posStore}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

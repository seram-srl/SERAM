import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── GLSL SHADERS PARA RENDIMIENTO OPTIMIZADO EN GPU ──────────────────────────

const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;

  varying float vDepth;
  varying float vMorphProgress;

  void main() {
    vec3 pos = position;

    // Sin movimiento ascendente continuo para mantener la hoja estática detrás del logo.
    // Solo micro-oscilaciones orgánicas de evapotranspiración para dar sensación de vida.
    float vaporStrength = 0.05;
    pos.x += sin(uTime * 1.2 + position.y * 2.5) * vaporStrength;
    pos.y += cos(uTime * 1.1 + position.x * 2.5) * vaporStrength;
    pos.z += sin(uTime * 0.9 + position.x * position.y) * (vaporStrength * 0.5);

    // Parallax del Cursor: Empuje elástico suave
    float distToMouse = distance(pos.xy, uMouse * 2.5);
    if (distToMouse < 2.0) {
      float force = (1.0 - distToMouse / 2.0) * 0.22;
      pos.xy += normalize(pos.xy - uMouse * 2.5) * force;
    }

    // Transformar a coordenadas de pantalla
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Tamaño variable simulando luciérnagas parpadeantes
    float blink = sin(uTime * 3.5 + position.x * 100.0) * 2.5;
    gl_PointSize = (8.0 + blink) / -mvPosition.z;

    // Pasar datos al fragment shader
    vDepth = -mvPosition.z;
    vMorphProgress = uProgress;
  }
`;

const fragmentShader = `
  varying float vDepth;
  varying float vMorphProgress;

  void main() {
    // Dar forma circular al punto
    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
    float dist = dot(circCoord, circCoord);
    if (dist > 1.0) {
      discard;
    }

    // Desvanecimiento suave en los bordes para el efecto glow
    float alpha = 1.0 - dist;

    // Acento Verde Esmeralda oficial (#00e03c)
    vec3 emerald = vec3(0.0, 0.88, 0.235);
    // Tono de luciérnaga (amarillo-verde polen)
    vec3 firefly = vec3(0.85, 0.95, 0.1);
    
    // Mezclar según el scroll progress y profundidad para dar variedad cromática orgánica
    vec3 color = mix(emerald, firefly, sin(vDepth * 0.4 + vMorphProgress * 2.0) * 0.5 + 0.5);

    // Mezclar con color blanco en el centro para dar intensidad al brillo
    color = mix(vec3(1.0), color, dist * 0.8);

    // Ajustar opacidad total en base a distancia
    float finalAlpha = alpha * 0.85 * clamp(1.2 - (vDepth / 12.0), 0.1, 1.0);

    gl_FragColor = vec4(color, finalAlpha);
  }
`;

export default function EcosystemNucleus({ scrollRef }) {
  const materialRef = useRef();
  const initialPositionRef = useRef();
  const currentScroll = useRef(0);
  const count = 3000;

  // Generación matemática de la esfera difusa de backup (escalada al nuevo tamaño)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rSphere = 3.6 + Math.random() * 0.6;
      arr[i * 3] = rSphere * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = rSphere * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = rSphere * Math.cos(phi);
    }
    return arr;
  }, []);

  // Carga del logo y extracción de coordenadas de píxeles
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
          if (alpha > 120) {
            // Escalar de [0, 128] a un rango espacial más grande [ -4.1, 4.1 ] (x2.28 mayor)
            const px = ((x / 128) - 0.5) * 8.2;
            const py = -((y / 128) - 0.5) * 8.2;
            points.push({ x: px, y: py });
          }
        }
      }
      
      if (points.length > 0 && initialPositionRef.current) {
        const arr = initialPositionRef.current.array;
        for (let i = 0; i < count; i++) {
          const pt = points[Math.floor(Math.random() * points.length)];
          arr[i * 3] = (Math.random() - 0.5) * 0.25;
          arr[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.05;
          arr[i * 3 + 2] = -pt.x + (Math.random() - 0.5) * 0.05;
        }
        initialPositionRef.current.needsUpdate = true;
      }
    };
  }, []);

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) }
  }), []);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    
    const targetScroll = scrollRef.current || 0;
    currentScroll.current += (targetScroll - currentScroll.current) * 0.1;
    materialRef.current.uniforms.uProgress.value = currentScroll.current;
    
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

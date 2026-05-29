/**
 * @skill-reference  cinematic-decoupled-architecture
 * @file             webgl-parallax-engine.js
 * @description      Motor de Parallax 3D para experiencias cinematográficas.
 *                   Reference file para el Agente IA — usar al generar código
 *                   de fondos inmersivos, parallax de cursor, o scroll-driven
 *                   camera animations en proyectos de alto impacto visual.
 *
 * CONTRATOS DE DISEÑO (reglas que el agente DEBE respetar):
 * ──────────────────────────────────────────────────────────
 * 1. El canvas WebGL es SIEMPRE position: fixed, z-index: 0 (fondo puro).
 * 2. El contenido HTML (texto, CTAs, forms) flota con z-index: 10+.
 * 3. El "scroll" mueve la cámara en Z, NO los elementos HTML hacia arriba.
 * 4. Toda interpolación usa LERP con factor ≤ 0.1 (fluidez cinematográfica).
 * 5. El renderer siempre hace cap de pixelRatio a 2 (rendimiento móvil/4K).
 */

// ─── JERARQUÍA DE CAPAS (Eje Z — Contrato Inamovible) ──────────────────────
//
//  Cámara inicial     Z = +5    ← Punto de vista del usuario al cargar
//  Primer Plano (FG)  Z = +1/2  ← Elementos que "pasan" rápido (partículas)
//  Plano Medio (Mid)  Z = -5    ← Producto / Hero Content principal
//  Fondo (BG)         Z = -15   ← Textura de escala espacial / ambiente
//  Destino de cámara  Z = -8    ← Al llegar al fin del scroll narrativo
//
// ─── FÓRMULA LERP (aplicar en cada frame RAF) ───────────────────────────────
//
//  target += (goal - target) * lerpFactor
//  Donde: lerpFactor = 0.05  (cursor parallax suave)
//                     0.1   (scroll z-depth)
//

const ParallaxEngine = {
  state: {
    mouseX: 0, mouseY: 0,
    targetX: 0, targetY: 0,
    lerpFactor: 0.05,
    cameraZTarget: 5,
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.createScene();
    this.createLayers();
    this.setupEvents();
    this.setupScrollTrigger();
    this.animate();
  },

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050505);
    this.scene.fog = new THREE.FogExp2(0x050505, 0.03);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = this.state.cameraZTarget;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
  },

  createLayers() {
    this.textureLoader = new THREE.TextureLoader();

    // BACKGROUND (Z: -15) — Escala espacial
    this.layerBG = new THREE.Mesh(
      new THREE.PlaneGeometry(35, 20),
      new THREE.MeshBasicMaterial({ color: 0x1a1a2e, depthWrite: false })
      // En producción: map: this.textureLoader.load('assets/textures/bg.webp')
    );
    this.layerBG.position.z = -15;
    this.scene.add(this.layerBG);

    // MIDGROUND (Z: -5) — Contenido principal / producto
    this.layerMid = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 9),
      new THREE.MeshBasicMaterial({ color: 0x2e5925, transparent: true, opacity: 0.9 })
    );
    this.layerMid.position.z = -5;
    this.scene.add(this.layerMid);

    // FOREGROUND (Z: +1) — Partículas / UI decorativa
    this.layerFG = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({ color: 0x4a7c59, transparent: true, opacity: 0.6, wireframe: true })
    );
    this.layerFG.position.set(2, 0, 1);
    this.scene.add(this.layerFG);
  },

  setupEvents() {
    const [hx, hy] = [window.innerWidth / 2, window.innerHeight / 2];
    document.addEventListener('mousemove', (e) => {
      this.state.mouseX = e.clientX - hx;
      this.state.mouseY = e.clientY - hy;
    });
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  },

  setupScrollTrigger() {
    // Enlaza el scroll del usuario a la profundidad Z de la cámara
    gsap.to(this.state, {
      cameraZTarget: -8,
      ease: 'none',
      scrollTrigger: { trigger: '.scroll-proxy', start: 'top top', end: 'bottom bottom', scrub: 1.2 },
    });
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    // LERP cursor XY (parallax sutil)
    this.state.targetX += (this.state.mouseX * 0.0015 - this.state.targetX) * this.state.lerpFactor;
    this.state.targetY += (this.state.mouseY * 0.0015 - this.state.targetY) * this.state.lerpFactor;
    this.camera.position.x = this.state.targetX;
    this.camera.position.y = -this.state.targetY;
    // LERP scroll Z (profundidad)
    this.camera.position.z += (this.state.cameraZTarget - this.camera.position.z) * 0.1;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  },
};

// ─── PATRÓN DE INTEGRACIÓN EN REACT (Template para el Agente IA) ────────────
/*
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function WebGLBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const engine = Object.create(ParallaxEngine);
    engine.init('webgl-bg');              // ← ID del div contenedor

    return () => {
      // Cleanup obligatorio para evitar memory leaks en React StrictMode
      engine.renderer?.dispose();
      engine.scene?.clear();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      {/* Canvas WebGL — SIEMPRE fondo fijo */}
      <div id="webgl-bg" style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Proxy de scroll — define la altura narrativa total */}
      <div className="scroll-proxy" style={{
        position: 'absolute', height: '300vh',
        top: 0, left: 0, width: '1px', pointerEvents: 'none'
      }} />

      {/* Contenido HTML superpuesto */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Aquí van los componentes React normales */}
      </div>
    </>
  );
}
*/

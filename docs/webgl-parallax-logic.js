/**
 * @file webgl-parallax-logic.js
 * @description Skill de Contexto y Lógica Operacional para Antigravity.
 * Define las matemáticas y el pipeline gráfico para el efecto Parallax tridimensional.
 * ARQUITECTURA: WebGL (Three.js) + Animación por Rueda/Cursor (GSAP ScrollTrigger).
 * CONTRATO DE DISEÑO: No-Code/Low-Code friendly, desacoplado de la UI tradicional.
 *
 * @project    SERAM - Servicios Ambientales
 * @version    1.0.0
 * @date       2026-05-29
 * @skill-ref  cinematic-decoupled-architecture
 */

// ============================================================================
// 1. CONCEPTUALIZACIÓN TEÓRICA PARA EL AGENTE DE IA
// ============================================================================
/*
  INSTRUCCIÓN PARA LA IA:
  Para replicar la fluidez cinemática de la web de referencia, debes entender que:

  1. El "Scroll" NO desplaza elementos hacia arriba. El scroll traslada la CÁMARA 3D
     en el eje Z (profundidad). Esto genera una sensación de "vuelo tunelizado" o
     "Zoom continuo" a través de paneles espaciados.

  2. El "Parallax del Cursor" altera las coordenadas X e Y de la cámara o los planos.
     Para evitar movimientos bruscos, se aplica una Interpolación Lineal (LERP):
     Fórmula: Valor_Actual = Valor_Actual + (Valor_Objetivo - Valor_Actual) * Factor_Inercia
     Donde 'Factor_Inercia' (habitualmente entre 0.05 y 0.1) suaviza la reacción al mouse.

  3. Jerarquía de Capas en Espacio 3D (Eje Z):
     - Cámara Inicial:         Posición Z =  5   (punto de partida del usuario)
     - Primer Plano (FG):      Posición Z =  2   (atraviesa la pantalla rápido)
     - Plano Medio (Mid):      Posición Z = -5   (contiene el foco de negocio / Producto)
     - Fondo (BG):             Posición Z = -15  (mueve muy poco, da escala espacial)

  4. Principio de Separación de Responsabilidades:
     - Three.js/WebGL   → Renderizado y geometría 3D pura
     - GSAP ScrollTrig  → Controlador de cámara Z (narrativa de scroll)
     - Mouse Events     → Parallax XY suave (cámara sigue cursor con inercia)
     - React/DOM        → UI superpuesta en HTML (textos, CTAs, formularios)
     El canvas WebGL es SIEMPRE un fondo (z-index: 0) y el HTML flota encima.
*/

// ============================================================================
// 2. CODIFICACIÓN SKELETON REVISADA Y OPTIMIZADA
// ============================================================================

const ParallaxEngine = {
  // Estado interno del motor de renderizado
  state: {
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    lerpFactor: 0.05,  // Controla la suavidad cinemática (Inercia del cursor)
    cameraZTarget: 5,  // Controlado dinámicamente por ScrollTrigger
  },

  /**
   * Inicializador del entorno gráfico desacoplado.
   * @param {string} containerId - ID del elemento DOM que recibe el canvas WebGL.
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`[Engine Error]: Contenedor #${containerId} no encontrado.`);
      return;
    }
    this.createScene();
    this.createLayers();
    this.setupEvents();
    this.setupScrollTrigger();
    this.animate();
  },

  /**
   * Crea la escena Three.js, la cámara perspectiva y el renderer WebGL.
   * Configuraciones de rendimiento: pixel ratio cap a 2x, antialias activado.
   */
  createScene() {
    this.scene = new THREE.Scene();

    // Fondo oscuro premium alineado a guías UI/UX de SERAM (#010409 ≈ 0x050505)
    this.scene.background = new THREE.Color(0x050505);

    // Niebla exponencial para desvanecer bordes de planos lejanos
    this.scene.fog = new THREE.FogExp2(0x050505, 0.03);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = this.state.cameraZTarget;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Cap de optimización para pantallas de alta densidad (Retina/4K)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
  },

  /**
   * Crea los tres planos de geometría (BG, Mid, FG) en el espacio 3D.
   * Dimensiones en Potencias de 2 (PoT) para renderizado óptimo en GPU.
   * En producción: reemplazar los colores placeholder por texturas WebP transparentes.
   */
  createLayers() {
    this.textureLoader = new THREE.TextureLoader();

    // ── CAPA 1: FONDO (Background) ─────────────────────────────────────────
    const bgGeometry = new THREE.PlaneGeometry(35, 20);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
      // map: this.textureLoader.load('assets/textures/bg_space.webp'), // producción
      depthWrite: false,
    });
    this.layerBG = new THREE.Mesh(bgGeometry, bgMaterial);
    this.layerBG.position.z = -15;
    this.scene.add(this.layerBG);

    // ── CAPA 2: CONTENIDO PRINCIPAL (Midground) ───────────────────────────
    const midGeometry = new THREE.PlaneGeometry(16, 9);
    const midMaterial = new THREE.MeshBasicMaterial({
      color: 0x2e5925,  // Verde orgánico representativo de SERAM
      // map: this.textureLoader.load('assets/textures/product_layer.webp'),
      transparent: true,
      opacity: 0.9,
    });
    this.layerMid = new THREE.Mesh(midGeometry, midMaterial);
    this.layerMid.position.z = -5;
    this.scene.add(this.layerMid);

    // ── CAPA 3: PRIMER PLANO (Foreground) ─────────────────────────────────
    const fgGeometry = new THREE.PlaneGeometry(12, 12);
    const fgMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a7c59,
      // map: this.textureLoader.load('assets/textures/particles_fg.png'),
      transparent: true,
      opacity: 0.6,
      wireframe: true,  // Modo evaluación en Fase 1 de desarrollo
    });
    this.layerFG = new THREE.Mesh(fgGeometry, fgMaterial);
    this.layerFG.position.z = 1;
    this.layerFG.position.x = 2;  // Desfase asimétrico para composición visual
    this.scene.add(this.layerFG);
  },

  /**
   * Configura los event listeners del mouse y el resize de ventana.
   * Las coordenadas del mouse se normalizan respecto al centro de la pantalla.
   */
  setupEvents() {
    const halfX = window.innerWidth / 2;
    const halfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
      this.state.mouseX = e.clientX - halfX;
      this.state.mouseY = e.clientY - halfY;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  },

  /**
   * Conecta GSAP ScrollTrigger a la posición Z de la cámara.
   * El elemento .scroll-proxy actúa como proxy de altura para el scroll.
   * scrub: 1.2 → inercia media-alta para movimiento fluido y no rígido.
   */
  setupScrollTrigger() {
    gsap.to(this.state, {
      cameraZTarget: -8,  // Profundidad destino al completar el scroll
      ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-proxy',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    });
  },

  /**
   * Bucle de animación principal (RAF).
   * Orden de operaciones por frame:
   *   1. LERP del mouse → posición XY de la cámara
   *   2. LERP del scroll → posición Z de la cámara (profundidad)
   *   3. lookAt al centro de la escena
   *   4. Renderizado del fotograma
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    // 1. LERP para movimiento horizontal/vertical del cursor (parallax XY)
    //    Multiplicador 0.0015 → efecto sutil y elegante, no mareante
    this.state.targetX += (this.state.mouseX * 0.0015 - this.state.targetX) * this.state.lerpFactor;
    this.state.targetY += (this.state.mouseY * 0.0015 - this.state.targetY) * this.state.lerpFactor;

    // 2. Asignación de posición física a la cámara
    this.camera.position.x = this.state.targetX;
    this.camera.position.y = -this.state.targetY;  // Eje Y invertido (convención Three.js)

    // 3. LERP suave para transición de profundidad por scroll (factor 0.1)
    this.camera.position.z += (this.state.cameraZTarget - this.camera.position.z) * 0.1;

    // 4. La cámara siempre apunta al origen de la escena
    this.camera.lookAt(this.scene.position);

    // 5. Renderizado del fotograma
    this.renderer.render(this.scene, this.camera);
  },
};

// ============================================================================
// 3. NOTAS DE INTEGRACIÓN PARA EL AGENTE IA
// ============================================================================
/*
  PATRÓN DE INTEGRACIÓN EN REACT (Vite):

  1. Instalar dependencias:
     npm install three gsap

  2. Crear componente WebGLBackground.jsx:
     - El canvas se monta en un <div id="webgl-container"> con position: fixed
     - El componente se inicializa en useEffect con ParallaxEngine.init('webgl-container')
     - Se destruye en el cleanup del useEffect (dispose de geometrías y renderer)

  3. El div proxy de scroll (<div className="scroll-proxy">) debe tener:
     height: 300vh (o el alto equivalente a los paneles de la narrativa)
     position: absolute, pointer-events: none

  4. El contenido HTML (texto, botones, formularios) flota sobre el canvas con:
     position: relative, z-index: 10

  5. Para React + Three.js se recomienda usar @react-three/fiber en proyectos
     de mayor complejidad, ya que gestiona el ciclo de vida del renderer
     automáticamente y es compatible con Suspense y concurrent mode.

  STACK DE PRODUCCIÓN RECOMENDADO:
  - @react-three/fiber     → Wrapper React declarativo de Three.js
  - @react-three/drei      → Helpers (OrbitControls, Environment, Text3D, etc.)
  - gsap + @gsap/react     → ScrollTrigger integrado con ciclo React
  - leva                   → Panel de control de parámetros en desarrollo (opcional)
*/

# AGENT SKILL: MASTER-WEBGL-CINEMATIC-ORCHESTRATOR

## 1. Filosofía de Desarrollo y Protección de Arquitectura
- El desarrollo se ejecuta estrictamente por bloques modulares e independientes en React.
- Queda prohibido mezclar lógica comercial o de bases de datos operativas dentro del bucle de renderizado 3D (Render Loop).
- Mantener compatibilidad estricta con Vite y el árbol de dependencias actual de React 18.2.

## 2. Reglas de Control del Entorno (Inspirado en Active Theory & Resn)
1. El contenedor global de la Landing Page debe congelar el viewport del navegador mediante CSS estricto: `width: 100vw; height: 100vh; overflow: hidden; touch-action: none;`.
2. Queda prohibido el uso de listeners nativos de window que ejecuten 'window.scrollTo(0,0)' o manipulen el scroll físico del DOM, ya que rompen la sincronía asíncrona de la GPU.
3. El control de navegación entre los pilares ecológicos (Inicio, Servicios, Academy, Experiencias, Tienda) debe orquestarse virtualmente mediante el componente <ScrollControls> de '@react-three/drei' con el flag `infinite` activo, o mediante una variable acumuladora matemática de tipo flotador modulada por residuo (`progress % max`).

## 3. Comportamiento Estético y Desacoplamiento Gráfico
1. Toda capa interactiva WebGL de fondo (Membranas elásticas, mallas topográficas o partículas) debe inicializarse de forma pasiva e invisible (`transparent: true; opacity: 0;` o wireframe inactivo) durante las fases de maquetación estructural.
2. Los elementos de interfaz HTML (tipografías, botones, componentes React) se inyectarán de forma flotante por encima del lienzo gráfico a través del subcomponente `<Scroll html>` de Drei, garantizando que hereden los estilos CSS globales, padding-safe áreas y la interactividad nativa de clics (`pointer-events: auto`).

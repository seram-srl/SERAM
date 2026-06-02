# MASTER_CONTEXT.md - REGLAS DE INGENIERÍA PARA SERAM

1. Objetivos de Diseño (Estética y Legibilidad)
El diseño se fundamenta en entornos minimalistas, empleando la proyección de un plano infinito en el cielo. Se deben utilizar modelos 3D hiperoptimizados mediante compresión DRACO, duplicados y transformados en el espacio (posición, rotación y escala) en lugar de cargar múltiples archivos.
La legibilidad premium se garantiza ajustando dinámicamente la posición y rotación de la cámara según la relación de aspecto. En móviles, la cámara se apartará de su trayectoria central para aproximarse a los bloques de texto tridimensionales, asegurando legibilidad sin obstrucciones.

2. Mecánicas Core: Neblina, Interactividad y Carrusel
- Neblina y atmósfera: Emplea variables de ruido Perlin 2D animado combinado con paletas de colores para generar gradientes dinámicos. Para la neblina o partículas de viento, se utilizan instancias masivas mediante la clase InstancedMesh, con opacidad inicial en 0.0 que se actualiza de forma reactiva a la aceleración del scroll del usuario (useFrame), sin consumir excesivas llamadas de dibujo en la CPU.
- Interactividad elástica: Basada en la interpolación lineal (LERP) de referencias mutables en conjunto con motores como GSAP (ScrollSmoother/InertiaPlugin) o amortiguación nativa con coeficientes entre 0.05 y 0.15 para una desaceleración física y elástica orgánica.
- Cimiento del carrusel virtual: El recorrido se estructura algorítmicamente mediante curvas spline de Catmull-Rom. Esta fórmula genera una trayectoria de interpolación tridimensional suave entre puntos de control discretos, vinculando el progreso del scroll a la progresión de la cámara en el riel, evitando saltos bruscos de dirección al hacer el bucle (loop).

3. Restricciones de Desarrollo en React y Next.js
- Arquitectura de bloques independientes: Separar de forma estricta el contenedor principal Canvas de React Three Fiber de los componentes individuales de modelos, luces e interfaz. El contenido HTML fluirá sobre el canvas tridimensional mediante el contenedor <Scroll html> de @react-three/drei.
- Restricciones de estado y mutación: Para mantener 60 FPS estables, TODAS las mutaciones de objetos 3D y cálculos de scroll deben ocurrir exclusivamente dentro de useFrame usando referencias mutables. Queda PROHIBIDO usar setState de React dentro del bucle de animación para evitar recálculos destructivos.
- Prevención de colapsos de memoria: Es obligatorio invocar explícitamente el método .dispose() sobre todas las geometrías, materiales, texturas y render targets dentro de las funciones de limpieza de useEffect al desmontar componentes, evitando saturar la VRAM de la GPU.

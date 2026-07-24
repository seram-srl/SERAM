# TASK-013 — Optimización del Hero de la Home page y Auditoría de Pilares

## Metadata
- **ID:** TASK-013
- **Título:** Optimización del Hero de la Home page: reproducción fluida del video de fondo mediante velocidad de scroll, transición sin parpadeos y auditoría de pilares ecológicos
- **Agente:** Implementador (supervisado por Líder)
- **Fecha inicio:** 2026-07-15 02:30
- **Status:** done

---

## Contexto Inicial
El usuario observó tirones al hacer scrubbing directo por scroll en navegadores (un comportamiento habitual por la latencia en la decodificación de `currentTime` en HTML5) y que al cargar la página se mostraba una imagen oscura que luego parpadeaba al desaparecer.
Para solucionarlo de forma altamente eficiente, se implementó:
1. **Eliminar el oscurecimiento inicial:** Se configuró el color del material del Hero a `#ffffff` para que la imagen estática inicial y el video tengan su brillo original al 100%.
2. **Prevenir el parpadeo de carga:** Se implementó una precarga en `handleCanPlay` que establece `video.currentTime = 0` y espera a que el evento `seeked` se dispare (garantizando que el navegador ya decodificó el primer frame) antes de asignar la textura de video, haciendo la transición de la imagen estática al video invisible.
3. **Reproducción fluida por velocidad de scroll:** En `useFrame`, cuando el usuario hace scroll hacia abajo en la zona del Hero (0 a 0.25), se reproduce el video de forma continua y fluida a 30/60 FPS nativos de la GPU (`video.play()`) y se ajusta dinámicamente `video.playbackRate` proporcionalmente a la velocidad del scroll del usuario. Si el scroll se detiene, el video se pausa inmediatamente. Si hace scroll hacia arriba, se retrocede el video manualmente de forma amortiguada. Esto proporciona una respuesta interactiva buttery-smooth y sin un solo tirón.
4. **Auditoría de Pilares:** Se verificó que los 4 pilares ecológicos de SERAM estén perfectamente implementados y ordenados.

## Archivos Afectados
- `src/components/ui/EnvironmentalCanvas.jsx` (Lógica de reproducción, seeked, playbackRate y brillo en WebGL)
- `src/features/home/HomePage.jsx` (Auditoría de los pilares)

## Plan de Implementación
1. [x] Auditar que todos los pilares ecológicos (01 Services, 02 Academy, 03 Experience, 04 Store) estén representados y ordenados en la Home Page. (Completado: los 4 pilares están presentes en el orden correcto en `HomePage.jsx` y en `PILLARS`).
2. [x] Cambiar el color del material de Hero en `EnvironmentalCanvas.jsx` a `#ffffff` para restaurar el brillo del 100% de la imagen estática inicial y del video.
3. [x] Prevenir el parpadeo negro al iniciar retrasando la activación de la textura de video hasta recibir el evento `seeked` del fotograma 0.
4. [x] Reemplazar el scrubbing discreto en `useFrame` por un control híbrido de velocidad de reproducción (`playbackRate` adaptativo y `play()` al bajar, `pause()` al detenerse, y scrubbing suave al subir) eliminando por completo los tirones en el decodificador de video.
5. [x] Compilar el proyecto con `npm run build` para asegurar la calidad de producción.
6. [x] Comprobar en el navegador la transición impecable y el comportamiento reactivo fluido.

# TASK-012 — Controlar la reproducción del video de fondo del Hero mediante la posición de scroll y optimización All-Intra en WebGL

## Metadata
- **ID:** TASK-012
- **Título:** Controlar la reproducción del video de fondo del Hero mediante la posición de scroll y optimización All-Intra en WebGL
- **Agente:** Implementador (supervisado por Líder)
- **Fecha inicio:** 2026-07-14 16:50
- **Fecha finalización:** 2026-07-14 16:57
- **Status:** done

---

## Contexto Inicial
El usuario requiere que el video de fondo del Hero (`Lush_green_plantation_hills_zoom_202607141620.mp4`) responda dinámicamente al scroll para realizar el efecto de zoom-in/out. Se busca un comportamiento fluido y liviano, especialmente en dispositivos móviles.

## Archivos Afectados
- `src/components/ui/EnvironmentalCanvas.jsx` (Lógica de barrido y carga de video WebGL)

## Plan de Implementación
1. [x] Codificar y comprimir el video del usuario en formatos optimizados para desktop y mobile con `-g 1` (All-Intra) y sin audio. (Completado en fase de planificación).
2. [x] Modificar la inicialización del video en `EnvironmentalCanvas.jsx` para que no se auto-reproduzca (`autoplay = false`, `loop = false`).
3. [x] Integrar el cálculo de progreso de la sección Hero (`smoothP / 0.25`) en `useFrame` y asignar `video.currentTime` proporcionalmente.
4. [x] Verificar compilación de producción con `npm run build`.
5. [x] Comprobar funcionamiento visual en el navegador.

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 16:45     | Procesar video desktop y mobile con ffmpeg con keyframes en cada frame (`-g 1`) | OK |
| 16:51     | Modificar `EnvironmentalCanvas.jsx` desactivando autoplay/loop y aplicando barrido manual | OK |
| 16:53     | Verificar funcionamiento visual y capturar screenshots en local | OK (buttery smooth) |
| 16:56     | Ejecutar compilación de producción `npm run build` | OK (Build exitosa) |
| 18:15     | Cambiar el fondo de la tarjeta RAI por nueva imagen industrial fotorrealista | OK |

## Conclusión
Se integró con éxito el video personalizado del usuario controlando su reproducción directamente mediante la posición del scroll, con ajustes refinados de alejamiento de cámara (`zCurr = -12.0`) e iluminación atenuada para evitar pixelado y sobreexposición. Asimismo, a solicitud del usuario, se reemplazó el fondo de la tarjeta de Registro Ambiental Industrial (RAI) en `HomePage.jsx` por una nueva imagen fotorrealista de una planta industrial moderna y ecológica, garantizando contraste nítido y coherencia estética. El build de producción se genera correctamente y sin errores.

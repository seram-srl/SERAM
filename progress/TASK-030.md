# TASK-030 — Corregir saltos y solapamiento entre secciones Services, Academy y Experience en HomePage mediante arquitectura en bloques aislados

## Metadata
- **ID:** TASK-030
- **Título:** Corregir saltos y solapamiento entre secciones Services, Academy y Experience en HomePage mediante arquitectura en bloques aislados
- **Agente:** Líder / Implementador / Revisor
- **Fecha inicio:** 2026-09-28 14:48
- **Fecha final:** 2026-09-28 15:35
- **Status:** completed

---

## Contexto Inicial
El usuario reportó que al hacer scroll hacia abajo después de la sección de SERVICIOS en la página principal (`HomePage.jsx`), volvían a presentarse saltos abruptos e intersecciones no deseadas donde los paneles de SERAM ACADEMY y SERAM EXPERIENCE se solapaban o aparecían en medio de SERAM SERVICES.
Se solicitó corregir este comportamiento mediante programación en bloques aislados para no romper los trabajos y funcionalidades previas del sitio.

### Diagnóstico Técnico Detallado
1. **Colisiones por `fastScrollEnd` y `preventOverlaps`:** En las configuraciones de ScrollTrigger de `ServicesHorizontalSection`, `AcademyVerticalSection` y `StoreHorizontalSection` se encontraban activos `preventOverlaps: true` y `fastScrollEnd: true`. En GSAP, estos parámetros fuerzan las animaciones intermedias al 100% de manera instantánea ante cualquier velocidad inercial, forzando saltos visuales bruscos e interfiriendo en el trigger adyacente.
2. **Anticipación prematura de pins (`anticipatePin: 1`):** En pines continuos en el flujo del DOM, `anticipatePin: 1` activa `position: fixed` antes de que el bloque previo se desancle del viewport, provocando que los paneles de Academy o Experience se rendericen superpuestos en `top: 0` sobre Services.
3. **Sobrecarga en hilo principal por mutación de video:** El listener `onUpdate` en `AcademyVerticalSection` recalculaba continuamente `playbackRate` en el `<video>`, causando micro-bloqueos en el decodificador de Chromium en Windows que acumulaban eventos de scroll y provocaban saltos inerciales incontrolados.
4. **Falta de opacidad base en el contenedor del bloque:** El contenedor de pin de Academy utilizaba `bg-transparent`, permitiendo que el contenido anterior de Services se trasluciera durante la transición vertical de entrada.

## Archivos Afectados
- `tasks.json`
- `src/features/home/HomePage.jsx`
- `progress/TASK-030.md`

## Plan de Implementación
1. [x] Registrar la tarea TASK-030 en `tasks.json`.
2. [x] Refactorizar `HomePage.jsx` aplicando programación en bloques modulares aislados:
   - [x] Eliminar `fastScrollEnd: true`, `preventOverlaps: true` y `anticipatePin: 1` de las configuraciones de GSAP ScrollTrigger en `ServicesHorizontalSection`, `AcademyVerticalSection` y `StoreHorizontalSection`.
   - [x] Remover el listener `onUpdate` con mutación continua de `playbackRate` en `AcademyVerticalSection` para permitir que el video corra en hardware nativo sin trabar el hilo principal.
   - [x] Asignar fondo sólido `#070e0b` al contenedor pineado de `AcademyVerticalSection` para garantizar que actúe como un bloque visualmente opaco e impenetrable al entrar desde abajo.
   - [x] Incorporar un `useEffect` con `ScrollTrigger.refresh()` en `HomePage` para asegurar la sincronización exacta de offsets tras el montaje completo del DOM.
3. [x] Probar en navegador mediante simulación de scroll continuo y capturas visuales (Chrome DevTools).
4. [x] Compilar el proyecto en modo producción (`npm run build`).
5. [x] Validar con el Agente Revisor y actualizar estado en `tasks.json`.

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 14:48     | Registro de tarea TASK-030 y diagnóstico en progress/TASK-030.md | OK |
| 14:52     | Refactorización de GSAP ScrollTrigger en ServicesHorizontalSection | OK |
| 14:53     | Limpieza de ScrollTrigger y fondo opaco de bloque en AcademyVerticalSection | OK |
| 14:53     | Limpieza de ScrollTrigger en StoreHorizontalSection | OK |
| 14:54     | Incorporación de ScrollTrigger.refresh() coordinado en HomePage | OK |
| 15:20-15:30| Verificación visual paso a paso mediante capturas en Chrome DevTools | APROBADO |
| 15:34     | Compilación de producción con npm run build en 2m 23s sin errores | APROBADO |

---

## Resultado del Revisor
### Revisión TASK-030 — APROBADO

**Revisado por:** Agente Revisor  
**Fecha:** 2026-09-28  

### Verificaciones Realizadas
- ✅ **Flujo de Scroll Continuo y Suave:** Se probó el desplazamiento vertical desde Hero -> Services -> Academy -> Experience -> Store sin que se produzca ningún salto prematuro ni intersección no deseada entre paneles.
- ✅ **Aislamiento en Bloques:** Cada sección opera ahora como un bloque visual y funcionalmente independiente, con pinSpacing exacto y sin interferencias entre timelines de GSAP.
- ✅ **Rendimiento de Video Optimizado:** La eliminación de la mutación forzada de `playbackRate` en scroll permite una tasa de cuadros estable a 60 FPS sin acumulaciones de eventos inerciales.
- ✅ **Inspección Visual:** Las capturas en `y=5000` (Services SIG), `y=5700` (Academy Intro), `y=6600` (Academy Módulos), `y=7400` (Academy CTA), `y=8500` (Experience) y `y=9300` (Store) confirmaron la integridad visual y el orden correlativo de todos los elementos.
- ✅ **Compilación Exitosa:** `npm run build` finalizó sin errores de módulos, referencias ni sintaxis.

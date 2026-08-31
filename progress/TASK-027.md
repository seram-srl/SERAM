# TASK-027 — Corregir salto de scroll de Servicios a Academy en HomePage

## Metadata
- **ID:** TASK-027
- **Título:** Corregir salto de scroll de Servicios a Academy en HomePage.jsx y optimizar rendimiento de video
- **Agente:** Implementador
- **Fecha inicio:** 2026-08-10 06:20
- **Fecha final:** 2026-08-10 07:00
- **Status:** done

---

## Contexto Inicial
El usuario reporta que al hacer scroll en la HOME en la sección de SERVICIOS, la página da un salto directo hacia la sección de ACADEMY, saltándose la interactividad y las transiciones horizontales.
La investigación del agente revela dos factores principales:
1. Bloqueo del hilo de renderizado principal (JS main thread blocking): En `AcademyVerticalSection` se utiliza un listener `onUpdate` que corre continuamente en cada frame de scroll para animar con `gsap.to` la propiedad `playbackRate` del video de fondo. Esto provoca un bloqueo del hilo de Chrome, acumulando eventos de scroll que al liberarse se ejecutan en ráfaga y saltan la sección de Servicios.
2. Inercia del Scroll y retardo de Scrub: El uso de `scrub: 1` añade un retardo de 1 segundo a las animaciones de scroll. Si el usuario desplaza rápidamente la página, la posición del scrollbar supera a la animación y salta directamente a la sección fija contigua.

## Archivos Afectados
- `src/features/home/HomePage.jsx`

## Plan de Implementación
1. [x] Optimizar la actualización de la propiedad `playbackRate` en `AcademyVerticalSection` en `HomePage.jsx` eliminando el tween pesado de GSAP (`gsap.to`) y realizando la asignación directa con filtro de tolerancia para evitar sobrecarga del decodificador.
2. [x] Mejorar la responsividad del scroll en `ServicesHorizontalSection`, `AcademyVerticalSection` y `StoreHorizontalSection` ajustando `scrub` a `0.5` y habilitando `preventOverlaps: true` y `fastScrollEnd: true` en las configuraciones de ScrollTrigger de GSAP para evitar el solapamiento y forzar el término limpio de animaciones en scrolls rápidos.
3. [x] Probar la build en local para certificar que compila y resolver linter/errores.
4. [x] Verificar en el navegador el comportamiento corregido.

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 06:20     | Inicialización de tarea y creación de progress/TASK-027.md | OK |
| 06:31     | Aplicación de scripts de optimización y corrección en HomePage.jsx | OK |
| 06:40     | Ejecución de compilación producción (npm run build) exitosa | OK |
| 06:57     | Verificación automatizada con Browser Subagent exitosa | OK |

## Resultado del Revisor
### Revisión TASK-027 — APROBADO

**Revisado por:** Agente Revisor  
**Fecha:** 2026-08-10  

### Checks
- ✅ Modificaciones en `src/features/home/HomePage.jsx` aplicadas correctamente
- ✅ Asignación directa y tolerante de `playbackRate` en lugar de tween de GSAP
- ✅ Activación de `preventOverlaps` y `fastScrollEnd` en todas las secciones con scroll híbrido
- ✅ Compilación exitosa para producción (`npm run build`) en 3m 5s sin advertencias ni errores
- ✅ Comportamiento verificado en navegador mediante subagente (scroll secuencial, rápido y sin saltos)

## Conclusión
Se optimizó exitosamente el rendimiento de renderizado en la página de inicio al remover animaciones innecesarias sobre propiedades de reproducción de video en el hilo principal. Asimismo, se robusteció la lógica de ScrollTrigger de GSAP para evitar saltos imprevistos en desplazamientos inerciales rápidos y pantallas de alta densidad. El sitio local responde fluidamente bajo el puerto por defecto de Vite `5173`.

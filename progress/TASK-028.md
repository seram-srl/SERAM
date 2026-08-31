# TASK-028 — Cambiar Desplazamiento de ACADEMY a Sentido Vertical

## Metadata
- **ID:** TASK-028
- **Título:** Cambiar el desplazamiento del apartado ACADEMY de sentido horizontal a sentido vertical al hacer scroll
- **Agente:** Líder
- **Fecha inicio:** 2026-08-11
- **Fecha final:** 2026-08-11
- **Status:** done

---

## Contexto Inicial
El desplazamiento del apartado "ACADEMY" en la página principal (`HomePage.jsx`) va actualmente en sentido horizontal. El usuario requiere que este desplazamiento cambie a un sentido vertical al hacer scroll.
*Actualización*: Tras la primera implementación, se detectó que el contenido inicial de la sección Academy ("Escena 1") se entremetía y solapaba visualmente con la última tarjeta de la sección Servicios ("SIG") debido a la transición del flujo de scroll vertical.

## Archivos Afectados
- `tasks.json`
- `src/features/home/HomePage.jsx`

## Plan de Implementación
1. [x] Registrar la tarea TASK-028 en `tasks.json`.
2. [x] Modificar `src/features/home/HomePage.jsx`:
   - [x] Cambiar `#academy-track` de layout horizontal a vertical (`flex-col`, `h-[300vh]`, `w-full`).
   - [x] Cambiar escenas a `w-full h-screen`.
   - [x] Modificar línea de tiempo de GSAP ScrollTrigger para usar `y: '-200vh'` en lugar de `x: '-200vw'`.
3. [x] Probar la build del proyecto (`npm run build`) para verificar consistencia.
4. [x] Realizar ajuste quirúrgico para corregir el solapamiento visual:
   - [x] Configurar la tarjeta de la Escena 1 (`#academy-card-1-content`) para que inicie oculta (`opacity-0` en JSX).
   - [x] Añadir una animación de entrada (`fromTo` de opacity 0 a 1) al inicio de la línea de tiempo de GSAP para que aparezca limpiamente solo tras activarse el pin de la sección, evitando que se visualice antes.
   - [x] Remover marcadores de depuración (`markers: true`).
5. [x] Realizar la revisión de calidad (Agente Revisor) y veredicto.
6. [x] Marcar la tarea como completada en `tasks.json`.

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 15:24     | Inicialización de tarea y creación de progress/TASK-028.md | OK |
| 15:25     | Modificación de HomePage.jsx (cambio a flex-col y scroll en Y) | OK |
| 15:26     | Ejecución exitosa de npm run build sin errores | OK |
| 16:52     | Aplicación de ajuste quirúrgico de opacidad para solucionar solapamiento | OK |
| 16:53     | Re-compilación exitosa con npm run build | OK |

---

## Resultado del Revisor
### Revisión TASK-028 — APROBADO

**Revisado por:** Agente Revisor  
**Fecha:** 2026-08-11  

### Checks
- ✅ Build de producción (`npm run build`) completada con éxito.
- ✅ Lógica de GSAP ScrollTrigger migrada correctamente de `x: '-200vw'` a `y: '-200vh'`.
- ✅ Contenedor `#academy-track` adaptado a flex-col con la altura `h-[300vh]`.
- ✅ Ajuste quirúrgico de opacidad aplicado: la tarjeta de la Escena 1 (`#academy-card-1-content`) ahora inicia en `opacity-0` y se desvanece suavemente al entrar (`fromTo` de GSAP en tiempo 0), previniendo cualquier tipo de solapamiento prematuro en el flujo de scroll.
- ✅ Remoción exitosa de los marcadores visuales de ScrollTrigger.

## Conclusión
La sección de Academy en la HomePage ahora se desplaza verticalmente y tiene una transición limpia y profesional que no interfiere ni invade la visualización de la sección previa de Servicios. El proyecto se compila y ejecuta de manera totalmente fluida.

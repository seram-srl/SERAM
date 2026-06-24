# Progreso: TASK-007 — Ajustes de UI y Paralaje en la Portada

- **ID de Tarea**: TASK-007
- **Fecha**: 2026-06-24
- **Estado**: Completada
- **Desarrollador**: Antigravity

## Cambios Realizados
1. Modificación de `src/features/home/HomePage.jsx` para cambiar `SERVICIOS AMBIENTALES.` a `h2` con hover de color verde en `AMBIENTALES`.
2. Cambio del texto de descripción a `h3` y subrayado verde de las palabras clave: *cumplimiento normativo*, *monitoreo ecosistémico* y *desarrollo sostenible*.
3. Envoltura del scroll indicator en un contenedor absoluto centrado para solventar las colisiones de transform con la animación de Framer Motion.
4. Adición de animaciones de paralaje multicapa reactivas a la posición del cursor de ratón en el logo (BrandParticleText), H2 y H3.
5. Escalado secuencial (stagger) en la entrada de las animaciones iniciales para que aparezcan uno tras otro con retardo fluido.

## Verificaciones
- Se ejecutó `npm run build` localmente de forma exitosa.
- Se comprobó el correcto funcionamiento en el puerto de desarrollo local `http://localhost:5173/`.

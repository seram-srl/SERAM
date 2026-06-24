# Progreso: TASK-009 — Restauración de Escala de Logo y Aclaración de Fondo

- **ID de Tarea**: TASK-009
- **Fecha**: 2026-06-24
- **Estado**: Completada
- **Desarrollador**: Antigravity

## Cambios Realizados
1. Modificación de `src/features/home/HomePage.jsx` para devolver la escala original al logo de partículas `BrandParticleText` agregando la clase `w-full flex justify-center` a su contenedor animado.
2. Modificación de `src/components/ui/cinematic-ui.css` para aclarar el fondo atenuando las opacidades de la viñeta `.vignette-overlay-sides` (el gradiente lateral pasó a `rgba(1, 4, 9, 0.7)` y el vertical a `rgba(1, 4, 9, 0.4)`).

## Verificaciones
- Se ejecutó `npm run build` localmente y compiló de forma exitosa en 1m 29s.
- Se constató en local (`http://localhost:5173/`) que el logo vuelve a tener su presencia gigante y el fondo es un 10% más claro y visible.

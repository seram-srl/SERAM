# Progreso: TASK-008 — Ajustes de Tipografía y Logo Interactivo

- **ID de Tarea**: TASK-008
- **Fecha**: 2026-06-24
- **Estado**: Completada
- **Desarrollador**: Antigravity

## Cambios Realizados
1. Modificación de `src/features/home/HomePage.jsx` para aumentar los tamaños tipográficos en `HeroSection`:
   - El H2 pasó a clases `text-sm sm:text-base md:text-lg lg:text-xl mt-4`.
   - El H3 pasó a clases `text-xs sm:text-sm md:text-base max-w-2xl mt-4`.
2. Modificación de `src/components/shared/Navbar.jsx` para:
   - Importar `useLocation` para verificar la ruta `/`.
   - Registrar la variable de estado `scrollY` al desplazarse.
   - Ocultar el logo de la izquierda en la Home cuando la vista esté en la portada (`scrollY < 65% height`).
   - Crear un nuevo elemento del logotipo centrado en el Header que aparece con animación de escala, traducción vertical y fade-in cuando `scrollY` sobrepasa el umbral de transición (desaparición de la portada).

## Verificaciones
- Se ejecutó `npm run build` localmente y finalizó de manera exitosa.
- Se verificó el comportamiento de la barra de navegación en `http://localhost:5173/`.

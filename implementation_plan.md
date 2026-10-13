# Plan de Implementación — TASK-063

## Objetivo
Sustituir el fondo negro sólido (`bg-[#050508]`) en las vistas de autenticación (`LoginPage.jsx` y `RegisterPage.jsx`) por la imagen oficial del Hero de la Home de SERAM (`/assets/3d-backend/bg_home.webp`), aplicando un leve desenfoque cinematográfico, oscurecimiento sutil para garantizar contraste y legibilidad Neuform (WCAG AAA), y un efecto de paralaje reactivo de alta fidelidad al movimiento del cursor del mouse mediante Framer Motion springs.

---

## Archivos Involucrados
1. `src/components/ui/AuthHeroBackground.jsx` (Nuevo componente modular y reutilizable para el fondo Hero con paralaje y desenfoque)
2. `src/features/auth/LoginPage.jsx` (Sustituir fondo negro sólido por `AuthHeroBackground`)
3. `src/features/auth/RegisterPage.jsx` (Sustituir fondo negro sólido por `AuthHeroBackground` para coherencia en todo el flujo de autenticación)
4. `src/App.jsx` (Excluir `/login` y `/register` de `EnvironmentalCanvas` para evitar renderizar un lienzo WebGL Three.js innecesario detrás del fondo DOM, cumpliendo la regla de contexto único)
5. `tasks.json` (Registro de tarea `TASK-063`)
6. `progress/TASK-063.md` (Registro detallado del progreso de la tarea)

---

## Especificaciones Técnicas y Visuales
- **Imagen:** `/assets/3d-backend/bg_home.webp` (paisaje de serranías andinas/amazónicas de SERAM).
- **Desenfoque:** `blur-[6px]` (o `filter: blur(6px)`) con escalado `scale-110` para prevenir bordes desvanecidos en el viewport.
- **Interacción Mouse:**
  - `useMotionValue` para capturar coordenadas `(clientX - centerX)` y `(clientY - centerY)`.
  - `useSpring` con amortiguación suave (`stiffness: 100`, `damping: 30`, `mass: 0.5`) para movimiento fluido y orgánico sin tirones.
  - Rango de desplazamiento controlado (máximo `[-20px, 20px]`) con `will-change: transform`.
- **Contraste y Estética Neuform:**
  - Capa de gradiente oscuro semitransparente (`bg-gradient-to-b from-[#050508]/75 via-[#050508]/55 to-[#050508]/85`) para resaltar la tarjeta glassmórfica `neuform-card` con su `backdrop-blur-xl`.
  - Preservación de la retícula técnica `neuform-grid-bg` superpuesta con baja opacidad.
- **Rendimiento y Resiliencia:**
  - Detección de dispositivos táctiles vs mouse: en móviles se mantiene centrado estático o con sutil respiración sin listeners pesados.
  - Verificación estricta con ESLint y `npm run build`.

---

## Flujo de Delegación
1. **Líder:** Inicializa `tasks.json` con `TASK-063` en `in_progress` y crea `progress/TASK-063.md`.
2. **Implementador:** Escribe `AuthHeroBackground.jsx`, actualiza `LoginPage.jsx`, `RegisterPage.jsx` y `App.jsx`, valida con ESLint y `npm run build`.
3. **Revisor:** Audita la calidad de código, responsive, ausencia de errores y consistencia de diseño Neuform.
4. **Líder:** Marca `TASK-063` como completada en `tasks.json`.

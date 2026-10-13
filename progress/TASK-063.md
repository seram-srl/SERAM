# Registro de Progreso: TASK-063

## Tarea
**TASK-063:** Sustitución de fondo negro sólido por paisaje Hero de SERAM (`bg_home.webp`) con leve desenfoque, gradiente de contraste y paralaje suave reactivo al cursor del mouse en páginas de autenticación (`LoginPage.jsx` y `RegisterPage.jsx`).

## Fecha
- Inicio: 2026-10-13
- Finalización: 2026-10-13
- Estado: **COMPLETADA**
- Asignado a: Implementador

## Contexto y Necesidad
1. La pantalla de autenticación actual (`/login` y `/register`) presentaba un fondo negro plano (`bg-[#050508]`), el cual desaprovechaba la riqueza visual y ambiental de la identidad de SERAM.
2. El usuario solicitó reemplazar dicho fondo negro sólido por la imagen del Hero de la Home de SERAM (`/assets/3d-backend/bg_home.webp`), con un leve desenfoque (blur estético) y reactividad al movimiento del cursor del ratón (paralaje elástico sutil).
3. Es crítico mantener un óptimo contraste para garantizar que las tarjetas y campos de formulario sigan siendo 100% legibles bajo el sistema de diseño Neuform y normativas WCAG.

## Implementaciones Realizadas

### 1. Creación del componente `src/components/ui/AuthHeroBackground.jsx`
- **Renderizado del Hero Landscape:** Se montó la imagen oficial `/assets/3d-backend/bg_home.webp` con posicionamiento en capas de alto rendimiento (`fixed inset-0`, `overflow-hidden`, `pointer-events-none`, `z-0`).
- **Desenfoque y Escala:** Se aplicó un desenfoque cinemático estético (`filter blur-[7px] brightness-[0.85] contrast-[1.05]`) y una escala predeterminada `scale: 1.1` en `motion.div` para eliminar márgenes desvanecidos en los bordes del viewport.
- **Paralaje reactivo con Framer Motion:**
  - Uso de `useMotionValue` (`targetX`, `targetY`) y resortes elásticos `useSpring` con configuración orgánica (`stiffness: 100`, `damping: 30`, `mass: 0.5`).
  - Cálculo normalizado respecto al centro del viewport `(clientX - centerX) / centerX` y `(clientY - centerY) / centerY`.
  - Mapeo de desplazamiento opuesto sutil (-20px a 20px en X, -14px a 14px en Y) con aceleración por GPU (`will-change-transform`).
  - Detección de puntero fino: activa el listener de `mousemove` únicamente si `window.matchMedia('(pointer: fine)').matches` es verdadero. En dispositivos táctiles/móviles permanece centrado sin sobrecargar el procesador.
  - Evento `mouseleave` para retorno elástico al centro si el cursor sale de la ventana.
- **Contraste y tokens Neuform:**
  - Capa de oscurecimiento mediante gradiente multicapa `bg-gradient-to-b from-black/75 via-black/55 to-black/80`.
  - Retícula técnica `neuform-grid-bg` con `opacity-25` para garantizar la identidad visual tecnológica de SERAM y legibilidad WCAG AAA en los formularios.

### 2. Actualización de `src/features/auth/LoginPage.jsx`
- Eliminación del fondo plano `bg-[#050508]` y la retícula manual suelta.
- Integración de `<AuthHeroBackground />`.
- Ajuste del contenedor principal a `relative min-h-screen overflow-hidden` para albergar el fondo ambiental detrás de la tarjeta glassmórfica `neuform-card` con `backdrop-blur-xl`.
- Limpieza de importación no utilizada (`User`).

### 3. Actualización de `src/features/auth/RegisterPage.jsx`
- Integración coherente de `<AuthHeroBackground />`.
- Eliminación del fondo negro sólido y adaptación del contenedor principal a `relative min-h-screen overflow-hidden` para mantener la experiencia visual unificada en todo el flujo de autenticación.

### 4. Actualización de `src/App.jsx`
- Exclusión de `/login` y `/register` del montaje de `EnvironmentalCanvas`:
  ```jsx
  {location.pathname !== '/' && location.pathname !== '/dashboard' && location.pathname !== '/login' && location.pathname !== '/register' && <EnvironmentalCanvas />}
  ```
  Esto evita levantar instancias Three.js innecesarias detrás del fondo DOM, cumpliendo con la regla de contexto único y optimizando la memoria GPU.

## Verificación y Calidad
1. **ESLint:**
   - Ejecutado `npx eslint src/components/ui/AuthHeroBackground.jsx src/features/auth/LoginPage.jsx src/features/auth/RegisterPage.jsx src/App.jsx`.
   - Resultado: 0 errores, 0 advertencias, 0 identificadores no definidos.
2. **Build de Producción:**
   - Ejecutado `npm run build` con Vite.
   - Resultado: Salida exitosa (código 0) con generación de bundles limpios en `dist/`.

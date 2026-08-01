# Progreso de Tarea: TASK-017
**Ajustes visuales y de accesibilidad: Video móvil y contraste en Servicios**

- **ID de la Tarea:** TASK-017
- **Fecha de Inicio:** 2026-07-27
- **Fecha de Finalización:** 2026-07-27
- **Estado:** Completada con éxito
- **Asignado a:** Implementador / Líder

---

## 🛠️ Cambios Realizados

### 1. Fondo de Video Responsivo en WebGL (Three.js)
- **Archivo modificado:** [EnvironmentalCanvas.jsx](file:///d:/SERAM/src/components/ui/EnvironmentalCanvas.jsx)
- **Cambio de Geometría:** Se incorporó detección dinámica de resolución móvil (`isMobile`). En dispositivos móviles, el plano de proyección del video del Hero (`heroBgRef`) se redimensiona a `[29.25, 52]` (proporción vertical 9:16 exacta). En desktop se mantiene `[52, 26]` (proporción horizontal 2:1). Esto soluciona por completo el estiramiento y distorsión de la textura.
- **Optimización de Decodificación:** En móviles se configuró el video para reproducirse en bucle continuo nativo (`loop=true`, `autoplay=true`) pausándose únicamente al superar el panel inicial (`smoothP > 0.25`). Esto evita la modificación de velocidad (`playbackRate`) y retroceso manual (`currentTime`) a 60fps en `useFrame`, lo cual provocaba lags graves de hardware y bloqueos en móviles de gama media/baja.

### 2. Legibilidad del Hero en la Página de Servicios
- **Archivo modificado:** [ServicesPage.jsx](file:///d:/SERAM/src/features/services/ServicesPage.jsx)
- **Ajuste de contraste:** Para solventar el problema visual señalado en la captura del usuario (texto gris `text-slate-300` perdiéndose sobre el fondo claro de montañas/valles), se envolvió la descripción en un contenedor glassmorphic oscuro sutil (`bg-black/45 backdrop-blur-md border border-white/10`) y se configuró el color a `text-slate-100` con peso de fuente `font-light`. Esto aísla el texto y ofrece legibilidad impecable en todas las pantallas.

### 3. Contraste de Tarjetas del Catálogo de Servicios
- **Archivo modificado:** [ServicesPage.jsx](file:///d:/SERAM/src/features/services/ServicesPage.jsx)
- **Rediseño Neuform Claro:** Las tarjetas del catálogo estaban configuradas con fondos oscuros (`bg-black/55`) sobre una sección con fondo blanco sólido (`bg-white`), rompiendo el contraste AAA. Se adaptaron al diseño claro de Neuform:
  - Contenedor con fondo claro `bg-slate-50`, bordes verde oscuro de baja opacidad (`border-[#126c0f]/15`) y hover destacado.
  - Títulos y textos principales en verde oscuro y gris oscuro (`text-slate-900`, `text-slate-600`) garantizando legibilidad perfecta.
  - Badges con estilo claro (`text-[#126c0f] border-[#126c0f]/20 bg-[#126c0f]/5`).
  - Botón CTA reestilizado a fondo verde oscuro sólido con texto blanco (`bg-[#126c0f] text-white hover:bg-[#029907]`) de acuerdo a la directriz de botones del sistema de diseño.

---

## 🔬 Verificación
- **Pruebas en Localhost:** Navegación en desktop y emulación mobile (375px) a través de browser subagent. Las capturas confirman proporciones perfectas en el video del Hero de la Home, contraste impecable en la descripción y tarjetas de servicios con legibilidad AAA sin errores en consola.
- **Build de Producción:** Ejecución del empaquetado exitoso sin advertencias ni lints.

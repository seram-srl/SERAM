# Progreso: TASK-021 - Optimización del Hero y Visibilidad de Logo en Móviles

## Información General
* **ID de Tarea:** TASK-021
* **Fecha de Inicio:** 2026-07-31
* **Fecha de Finalización:** 2026-07-31
* **Asignado a:** Implementador
* **Estado:** Completado

---

## Cambios Realizados
- **Optimización de Rendimiento en Móviles (Fondo Estático):** Modificación en [EnvironmentalCanvas.jsx](file:///d:/SERAM/src/components/ui/EnvironmentalCanvas.jsx) para desactivar por completo la inicialización y decodificación de texturas de video cuando `isMobile` es verdadero. El canvas WebGL ahora recurre de forma predeterminada al uso de la textura estática original de la portada de la Home (`/assets/3d-backend/bg_home.webp`), logrando una tasa de FPS estable y eliminando el lag/lentitud de renderizado en dispositivos móviles.
- **Solución del Bug de Visibilidad del Logo (Resize/Scroll):** Modificación en [BrandParticleText.jsx](file:///d:/SERAM/src/components/ui/BrandParticleText.jsx) reemplazando el manejador manual del evento `resize` de la ventana por una instancia de `ResizeObserver` en el nodo contenedor del canvas.
  - Almacena el último ancho de contenedor procesado (`lastWidthRef`).
  - Previene la regeneración e inicialización del arreglo de partículas si el ancho reportado es de `0` o si no ha cambiado con respecto al valor anterior (como ocurre durante el desplazamiento en navegadores móviles al retraerse o expandirse la barra de direcciones de la app).
  - Soluciona de manera definitiva la desaparición y la inicialización vacía del logotipo de partículas "SERAM".

---

## Verificación Visual y Técnica
- Se ejecutó una compilación de producción limpia mediante `npm run build` sin advertencias de código.
- Se simuló el comportamiento móvil en el puerto local (`http://localhost:5173/`) a través de un agente automatizado.
- Se verificó mediante capturas de pantalla tomadas antes y después del desplazamiento que:
  - El fondo se renderiza usando la imagen estática `/assets/3d-backend/bg_home.webp`.
  - El logo interactivo de partículas de texto "SERAM" se inicializa correctamente y permanece 100% visible tras realizar scroll hacia abajo y volver a la parte superior.

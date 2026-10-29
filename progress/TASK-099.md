# Log de Progreso — TASK-099

**Tarea:** Optimización de H1 Institucional y Pantalla de Carga Cinematográfica del Hero con Detección de Video de Fondo y Frases Alternantes  
**Asignado a:** Agente Implementador  
**Supervisado por:** Agente Líder  
**Fecha de Inicio:** 2026-10-29  
**Fecha de Finalización:** 2026-10-29  
**Estado:** Completed  

---

## Objetivos de la Tarea
- [x] Corregir y convertir a `<h1>` semántico el texto del Hero en `HomePage.jsx` a: `"Empresa Consultora de Servicios en Ingeniería y Gestión Ambiental Integral"`.
- [x] Crear e integrar el componente `HeroPreloader.jsx` con el imagotipo oficial en plano principal (`/assets/brand/logo-seram-white.webp`).
- [x] Integrar un círculo de carga animado independiente (spinner SVG verde esmeralda `#00e03c`) ubicado directamente debajo del logotipo.
- [x] Implementar la alternancia sutil de frases con Framer Motion:
  - Fase 1 (0s a 1.5s): *"Cargando sitio web..."*
  - Fase 2 (1.5s+): *"Preparando una Experiencia Ambiental"*
- [x] Sincronizar la salida del preloader con la carga real del video `bg_home.mp4` / escena WebGL en `EnvironmentalCanvas.jsx` mediante el evento `seram-hero-video-ready`.
- [x] Incorporar tiempo mínimo garantizado de 2.2s para evitar parpadeos molestos en dispositivos con caché y timeout de seguridad de 5s para conexiones lentas.
- [x] Verificar compilación sin errores en `npm run build`.

---

## Registro de Cambios

### 1. `src/features/home/HomePage.jsx`
- **Elevación Semántica a H1 (SEO & Copywriting):**
  - Se sustituyó la etiqueta `<motion.h3>` por `<motion.h1 id="hero-desc">` con máxima jerarquía para indexación en motores de búsqueda, optimizando el posicionamiento de SERAM en Bolivia para consultas de consultoría ambiental.
  - Copia exacta actualizada:
    ```jsx
    Empresa Consultora de Servicios en <span className="underline decoration-[#00e03c] decoration-2 underline-offset-4 font-semibold text-white">Ingeniería y Gestión Ambiental Integral</span>
    ```
- **Montaje del Preloader del Hero:**
  - Importación y renderizado prioritario de `<HeroPreloader />` en la raíz de `HomePage`, asegurando cobertura `fixed` a pantalla completa en la primera visita o recarga.

### 2. `src/components/ui/HeroPreloader.jsx` (Nuevo Componente)
- Pantalla oscura `fixed inset-0 z-[9999] bg-[#050b08]` con glow ambiental esmeralda (`#00e03c`).
- Imagotipo horizontal oficial de SERAM con iluminación suave.
- Spinner independiente giratorio con trazo esmeralda brillante.
- Frases alternantes con animación de entrada y salida suave (`AnimatePresence mode="wait"`).
- Temporizador mínimo de lectura (2.2s) + escucha activa de video listo + fallback de 5s.
- Animación de salida cinematográfica con desvanecimiento (`exit={{ opacity: 0 }}` en 0.7s) revelando la escena del Hero en pleno funcionamiento.

### 3. `src/components/ui/EnvironmentalCanvas.jsx`
- Se configuró la emisión del evento personalizado de ventana `seram-hero-video-ready` y el flag `window.__seram_hero_video_ready = true` tan pronto como el video activa `canplaythrough` o `loadeddata`.
- En dispositivos móviles (`isMobile`), donde se utiliza la textura estática optimizada en lugar de video para ahorrar ancho de banda y batería, se emite inmediatamente el evento para no demorar la carga.

---

## Verificación de Calidad
- `npm run build`: Compilación exitosa de 2950 módulos sin errores.
- Layout responsivo probado para desktop y móvil.

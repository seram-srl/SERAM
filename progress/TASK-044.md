# Progreso: TASK-044 — Depuración Terminológica, Gobierno de IA y Rediseño Visual de Legalidad

**Fecha:** 2026-10-07  
**Estado:** Completed  
**Responsable:** Implementador (supervisado por Agente Líder)  

---

## 1. Objetivos de la Tarea
1. Registrar el Marco Estratégico de Gobierno de IA, Métricas y Ciberseguridad en la documentación interna (`03_DOCUMENTOS/01-negocio/GOBIERNO_IA_SERAM.md` y `docs/01-negocio/GOBIERNO_IA_SERAM.md`).
2. Explicar el estado técnico del Chatbot Web (`ChatbotFAB.jsx`): arquitectura determinista vs LLM, inmunidad actual ante Prompt Injection y defensas recomendadas para el futuro.
3. Eliminar de forma exhaustiva el término "perito", "peritos", "peritaje" y "pericial" en toda la plataforma web (los socios cuentan con registro SIB y RENCA, no con categoría de peritos judiciales).
4. Corregir la denominación social de la empresa a **"SERAM S.R.L."** (removiendo "Consultora Ambiental SRL").
5. Rediseñar y optimizar la página legal (`LegalPage.jsx`):
   - Escala tipográfica aumentada para títulos, subtítulos, párrafos y listas para óptima legibilidad.
   - Integración de fondo visual atmosférico (`/assets/3d-backend/bg_home.webp`) con gradiente ambiental idéntico al Hero del Homepage, sustituyendo el fondo negro plano.
   - Vinculación del elemento de contacto del footer a un botón interactivo que dispara el `ChatbotFAB` (`setIsChatbotOpen(true)`).

---

## 2. Archivos Modificados
- `03_DOCUMENTOS/01-negocio/GOBIERNO_IA_SERAM.md` (Creado)
- `docs/01-negocio/GOBIERNO_IA_SERAM.md` (Creado)
- `src/features/legal/LegalPage.jsx` (Modificado)
- `src/components/ui/EnvironmentalCanvas.jsx` (Modificado)
- `src/features/home/HomePage.jsx` (Modificado)
- `src/features/academy/CoursePlayerPage.jsx` (Modificado)
- `src/features/services/QuotePage.jsx` (Modificado)
- `src/features/services/ServicesPage.jsx` (Modificado)
- `tasks.json` (Actualizado)

---

## 3. Verificación y Resultados
- Búsqueda recursiva de patrones `perit` en `src/`: 0 coincidencias.
- Búsqueda recursiva de `Consultora Ambiental S`: 0 coincidencias.
- Renderizado de fondo en `EnvironmentalCanvas`: rutas `/privacidad`, `/terminos`, `/cookies`, `/reembolsos` conectadas a `heroBgTexture`.
- `LegalPage.jsx` cuenta con capa visual ambiental de respaldo con `bg_home.webp` y overlays oscuros graduados.
- Construcción del proyecto (`vite build`): exitosa.

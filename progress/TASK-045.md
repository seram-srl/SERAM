# Progreso: TASK-045 — Transiciones de Crossfade Simultáneo en Pestañas y Vistas Horizontales

**Fecha:** 2026-10-08  
**Estado:** Completed  
**Responsable:** Implementador (supervisado por Agente Líder y Agente Revisor)  

---

## 1. Objetivos de la Tarea
1. Implementar efecto **crossfade simultáneo** (*incoming fades in* mientras *outgoing fades out* de forma sincronizada) al alternar pestañas y presentaciones horizontales de contenido o tarjetas en todas las páginas internas de la plataforma.
2. Mantener intacto y sin ninguna modificación `HomePage.jsx` para proteger completamente su arquitectura de scroll cinemático y GSAP ScrollTrigger.
3. Evitar saltos de layout ("layout jumps") y demoras secuenciales al cambiar de pestaña mediante una estructura CSS Grid superpuesta con Framer Motion `mode="sync"`.

---

## 2. Solución Arquitectónica
- **Mecanismo de Superposición Espacial:**  
  Al usar `mode="sync"` en Framer Motion, los elementos entrantes y salientes coexisten en el DOM durante la transición. Para evitar que el elemento nuevo se desplace verticalmente debajo del saliente antes de que termine la animación, el contenedor padre se define con CSS Grid:  
  `grid grid-cols-1 items-start relative`  
  y los componentes hijos se anclan en la celda común:  
  `col-start-1 row-start-1 w-full`.
- **Valores de Animación Sincronizada:**  
  - Entrada: `initial={{ opacity: 0, y: 8 }}`, `animate={{ opacity: 1, y: 0 }}`
  - Salida: `exit={{ opacity: 0, y: -8 }}`
  - Transición: `transition={{ duration: 0.32, ease: 'easeInOut' }}`
- **Estabilidad de Scroll:**  
  En `LegalPage.jsx`, se eliminó el hook `window.scrollTo({ top: 0, behavior: 'smooth' })` al cambiar de pestaña para que la transición visual ocurra en su punto focal sin forzar un salto de scroll al tope de la ventana.

---

## 3. Archivos Modificados
- `src/features/legal/LegalPage.jsx` (Crossfade simultáneo en pestañas de Privacidad, Términos, Cookies y Reembolsos)
- `src/features/academy/CoursePlayerPage.jsx` (Crossfade sincronizado en Visor, Índice, Consultas y Licencia)
- `src/features/academy/AcademyPage.jsx` (Transición simultánea en el filtrado por categorías de cursos)
- `src/features/shop/ShopPage.jsx` (Transición simultánea en el filtrado por categorías del catálogo de productos)
- `src/features/partner-portal/ActivitiesAndClientsModule.jsx` (Crossfade sincronizado en vistas de Kanban, Tabla, Clientes, Prospectos y Progreso)
- `tasks.json` (Registrado como completado)

---

## 4. Verificación y Resultados
- `HomePage.jsx` no fue alterado (`git status` confirma 0 modificaciones en dicho archivo).
- Build de producción verificado (`npm run build`): compilación exitosa sin errores (`✓ built in 57.89s`).
- Corrección de entidades HTML en `ActivitiesAndClientsModule.jsx` para cumplimiento estricto con reglas de ESLint.

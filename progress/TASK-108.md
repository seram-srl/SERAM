# TASK-108 — Botón de Salida Evidente (X) en Ficha de Clientes/Oportunidades ARM y Soporte de Navegación Atrás (popstate)

## Estado
- **ID:** TASK-108
- **Estado:** Completada (Verificada)
- **Fecha:** 2026-11-10
- **Responsable:** Agente Implementador

## Diagnóstico del Problema de UX
1. **Falta de visibilidad de la salida:** En pantallas con altura común o bajo el header fijo de 80px (`z-[100]`) de SERAM, la cabecera superior del modal quedaba parcialmente solapada o no visible a primera vista.
2. **Ausencia de botón de cierre prominente en la barra de acciones:** En la barra horizontal de acciones inmediatas (`Ganado`, `Perdido`, `+ Asignar Misión`, `WhatsApp`), existía espacio libre a la derecha sin un botón explícito de cierre.
3. **Pérdida de contexto al retroceder en el navegador:** Al hacer clic en "Atrás" del navegador o ratón dentro de la ficha, la SPA retrocedía a la ruta anterior (`/` o Home) porque la apertura del cliente no registraba un estado en el historial (`history.pushState`).

## Solución Implementada
1. **Doble Botón (X) de Salida Evidente y Accesible:**
   - **Barra Superior:** Botón destacado `Cerrar (X)` con fondo rosado sutil Neuform (`bg-rose-500/20`), borde visible, icono `X` grueso (`stroke-[3]`) y atajo de teclado visible (`Esc`).
   - **Barra de Acciones Inmediatas:** Botón `Cerrar (X)` junto a los botones `Ganado`, `Perdido`, `+ Asignar Misión` y `WhatsApp`. Siempre visible sin importar la altura de pantalla ni el scroll.
   - Enlace `← Flujo` con icono `ArrowLeft` para retorno explícito al tablero Kanban.
2. **Elevación de Capa y Posicionamiento Seguro:**
   - `z-index` elevado a `z-[200]` para posicionarse limpiamente sobre cualquier cabecera fija de la aplicación.
   - Alineación `items-start justify-center` con margen automático (`my-auto`) y scroll en el overlay para evitar que la cabecera del modal quede cortada por arriba.
   - Clic en el backdrop exterior (`overlay`) para cerrar la ficha.
3. **Control del Botón Atrás del Navegador (`popstate`):**
   - Se inyecta un estado `{ seramModal: 'arm-lead-detail' }` en `window.history.pushState` al abrir la oportunidad.
   - Se escucha el evento `popstate` de modo que si el usuario presiona "Atrás" en el navegador o mouse, se cierra el detalle del cliente sin recargar ni navegar a la Home.
   - La función `handleCloseLeadDetail` sincroniza la pila con `window.history.back()` si el modal fue activado por historial.
4. **Soporte Completo de Tecla Escape (`Esc`):**
   - Listener de teclado para cerrar el modal inmediatamente al presionar `Escape`.

## Verificación y Calidad
- ESLint: 0 errores, 0 advertencias (`npx eslint src/features/partner-portal/crm/ArmOdooCrm.jsx`).
- Build Vite de Producción: Éxito total (`✓ 2953 modules transformed`, `built in 1m 9s`).

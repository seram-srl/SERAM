# TASK-109 — Eliminación de "Desplegar Módulos" en Desktop y Elevación Absoluta de Ficha ARM vía React Portal

## Estado
- **ID:** TASK-109
- **Estado:** Completada (Verificada)
- **Fecha:** 2026-11-10
- **Responsable:** Agente Implementador

## Diagnóstico y Requerimientos del Usuario
1. **Eliminar botón "Desplegar Módulos" en Desktop:**
   - En la cabecera de `PartnerDashboard.jsx`, remover el botón de escritorio `Desplegar Módulos` (`hidden md:flex`).
   - Mantener intacto el botón mobile `Módulos` (`md:hidden`).
2. **Tarjeta de cliente por debajo del Header:**
   - La cabecera fija de SERAM (`z-[100]`) se posicionaba por encima de la ficha de oportunidad porque el modal se renderizaba dentro del árbol de componentes de `ClientsModule` (subordinado al stacking context relativo del dashboard).
   - Se solucionó implementando `createPortal` de `react-dom` hacia `document.body` con capa `z-[9999]`, garantizando que la ficha, su cabecera y el botón de cierre `(X)` queden en el plano superior absoluto del DOM.

## Modificaciones Realizadas
1. **[PartnerDashboard.jsx](file:///d:/SERAM/src/features/partner-portal/PartnerDashboard.jsx):**
   - Eliminado el botón `Desplegar Módulos` en la vista de escritorio (`!sidebarOpen && hidden md:flex`).
   - Conservado intacto el botón móvil `Módulos` (`md:hidden flex`).
   - Limpieza del import `Menu` de `lucide-react`.
2. **[ArmOdooCrm.jsx](file:///d:/SERAM/src/features/partner-portal/crm/ArmOdooCrm.jsx):**
   - Importado `createPortal` desde `react-dom`.
   - Los modales del CRM (Ficha 360° `selectedLead`, Modal Programar Misión `scheduleModalLead`, y Modal Directorio `showClientModal`) ahora se montan directamente en `document.body` mediante `createPortal(..., document.body)` con capa `z-[9999]`.
   - Se eliminó cualquier posibilidad de que la cabecera fija de SERAM (`z-[100]`) se superponga o corte los botones de acción o salida `(X)`.

## Verificación y Calidad
- ESLint: 0 errores, 0 advertencias (`npx eslint src/features/partner-portal/PartnerDashboard.jsx src/features/partner-portal/crm/ArmOdooCrm.jsx`).
- Build Vite: Exitoso (`✓ 2953 modules transformed`, `built in 1m 18s`).

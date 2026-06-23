# TASK-005 — Migración de Shop a datos reales desde Supabase

## Metadata
- **ID:** TASK-005
- **Título:** Migrar Shop a datos reales desde Supabase
- **Agente:** Implementador
- **Fecha inicio:** 2026-06-23 19:30
- **Status:** done

---

## Contexto Inicial
Reemplazar datos mock de ShopPage.jsx con llamadas reales a la tabla 'products' en Supabase. Si la tabla no existe en la base de datos (por ejemplo, error PGRST205), el sistema debe usar de manera resiliente el listado local hardcoded como fallback. También se sincronizarán las funciones de modificación de productos del panel de control (añadir, editar, eliminar y cambiar a premium) con Supabase de forma análoga a los cursos y proyectos.

## Archivos Afectados
- `src/context/AppContext.jsx`

## Plan de Implementación
1. [x] Cargar productos desde la tabla 'products' en Supabase al iniciar la aplicación (con fallback resiliente).
2. [x] Sincronizar adición de producto (`handleAddProduct`) con inserción en la tabla 'products' en Supabase.
3. [x] Sincronizar edición de producto (`handleEditProduct`) con actualización en la tabla 'products' en Supabase.
4. [x] Sincronizar eliminación de producto (`handleDeleteProduct`) con eliminación en la tabla 'products' en Supabase.
5. [x] Sincronizar cambio de estado premium (`handleToggleProductPremium`) con actualización en la tabla 'products' en Supabase.
6. [x] Validar que la compilación (`npm run build`) sea exitosa.

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 19:30     | Creación de progress/TASK-005.md | Creado |
| 19:32     | Modificar `AppContext.jsx` para cargar tabla `products` en `loadDataFromSupabase` | OK |
| 19:34     | Modificar product handlers (`handleAddProduct`, `handleEditProduct`, `handleDeleteProduct`, `handleToggleProductPremium`) con soporte Supabase resiliente | OK |
| 19:36     | Ejecutar `npm run build` para validar empaquetado del frontend | OK (Build exitoso en 1m 6s) |

## Resultado del Revisor
- [x] Build pasa
- [x] Sin errores de consola
- [x] UI consistente con Neuform
- [x] Funcionalidad verificada

## Conclusión
Se integró de manera exitosa la sincronización de datos de productos con la base de datos de Supabase en `src/context/AppContext.jsx`. El código es robusto y cuenta con fallbacks resilientes tanto para la carga inicial de datos como para las acciones de mutación, reintentando automáticamente con columnas alternativas (como `desc` y `description`) en caso de incompatibilidades en el esquema de la base de datos.

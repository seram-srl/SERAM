# TASK-007 — Copywriting SIG + Indicadores de Scroll

## Metadata
- **ID:** TASK-007
- **Título:** Actualizar copy tarjeta SIG, SEO keywords y agregar indicadores de scroll animados
- **Agente:** Implementador
- **Fecha inicio:** 2026-07-07 12:40
- **Status:** done ✅

---

## Contexto Inicial
El usuario solicita:
1. Cambiar copy de la tarjeta SIG (desktop y móvil): eliminar "cartografía de alta precisión" y "precisión geodésica quirúrgica".
2. Nuevo copy orientado a conversión: contratar Plan de Aplicación SIG o comprar Curso SIG Básico.
3. SEO keywords: Mapas Ambientales, SIG en la Gestión Ambiental, SERAM, consultora ambiental.
4. Añadir indicador animado "DESLIZA..." en la tarjeta SIG:
   - Desktop: rueda del mouse animada hacia abajo (translateY positivo)
   - Móvil: pantalla touch animada con dedo deslizando hacia arriba (translateY negativo)

## Archivos Afectados
- `src/features/home/HomePage.jsx` (tarjeta desktop líneas 733-752, móvil líneas 583-607)
- `src/components/ui/cinematic-ui.css` (nuevo keyframe mobile scroll indicator)
- `tasks.json` (registrar TASK-007)

## Plan de Implementación
1. [x] Leer archivo objetivo
2. [ ] Modificar copy en tarjeta desktop (líneas 739-748)
3. [ ] Modificar copy en tarjeta móvil (líneas 596-604)
4. [ ] Agregar componente ScrollIndicator a la tarjeta SIG móvil
5. [ ] Agregar CSS keyframe mobile scroll indicator
6. [ ] Verificar build
7. [ ] Auditoría del flujo de scroll
8. [ ] Llamar al Revisor

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 2026-07-07 12:40 | Leer archivos objetivo | OK |

## Conclusión
[Pendiente de completar]

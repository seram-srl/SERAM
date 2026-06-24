# TASK-014 — Aclarar fondo de la Home y máscara de transparencia

## Metadata
- **ID:** TASK-014
- **Título:** Aclarar fondo de la Home y máscara de transparencia
- **Agente:** Implementador
- **Fecha inicio:** 2026-06-24 12:15
- **Status:** done

---

## Contexto Inicial
El usuario indica que el fondo de la Home sigue estando muy oscuro y es necesario definirlo antes de pasar al siguiente apartado. Solicita específicamente que la máscara de viñeta tenga una transparencia mayor al 50% (es decir, opacidad menor a 0.5) y que se aclare el fondo general de la Home.

## Archivos Afectados
- `src/index.css`
- `src/components/ui/cinematic-ui.css`

## Plan de Implementación
1. [x] Leer `src/index.css` y `src/components/ui/cinematic-ui.css`
2. [x] Modificar `.cinematic-bg` en `src/index.css` subiendo la luminosidad de los gradientes
3. [x] Modificar `.vignette-overlay-sides` en `src/components/ui/cinematic-ui.css` reduciendo la opacidad a valores menores a 0.5 (transparencia > 50%)
4. [x] Verificar build
5. [x] Llamar al Revisor

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 12:15     | Inicializar archivo de progreso | OK |
| 12:18     | Modificar index.css y cinematic-ui.css | OK (Cambios aplicados) |
| 12:22     | Ejecutar `npm run build` | OK (Build exitoso, 0 errores) |

## Resultado del Revisor

## Revisión TASK-014 — APROBADO

**Revisado por:** Agente Revisor  
**Fecha:** 2026-06-24

### Checks
- ✅ Build pasa (Vite build completado en 40.88s sin advertencias ni fallos)
- ✅ Visual consistente (Se ajustó el fondo a una paleta verde/pizarra de marca más clara y la opacidad del degradado lateral de la máscara se estableció en 0.22, cumpliendo con la especificación de transparencia > 50%)
- ✅ Sin imports rotos ni variables no definidas

## Conclusión
Se incrementó con éxito el brillo y la legibilidad de la página de portada (Home) aclarando la base y los destellos HSL de `.cinematic-bg` en `src/index.css`. Adicionalmente, la máscara de viñeta en `.vignette-overlay-sides` (`src/components/ui/cinematic-ui.css`) fue configurada con opacidades laterales y verticales de 0.22 y 0.08 respectivamente, alcanzando una transparencia muy superior al 50% solicitado. El build compila perfectamente.

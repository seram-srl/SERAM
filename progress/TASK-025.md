# TASK-025 — Restructurar carpetas de trabajo de campo

## Metadata
- **ID:** TASK-025
- **Título:** Restructurar carpetas de trabajo de campo: mover Valle de las Agujas (crudo) y crear Otra_Expedicion_Crudo dentro de 01_TRABAJO_DE_CAMPO
- **Agente:** Implementador
- **Fecha inicio:** 2026-08-07 03:02
- **Status:** done

---

## Contexto Inicial
El usuario indica que la carpeta `01_TRABAJO_DE_CAMPO` no existía en la raíz del proyecto y debe crearse. Además, el contenido de la carpeta actual con los videos crudos del celular (localizada en `src/public/assets/Valle de las Agujas`) debe moverse a `01_TRABAJO_DE_CAMPO/Valle_de_las_Agujas_Crudo`. También debe crearse la carpeta `01_TRABAJO_DE_CAMPO/Otra_Expedicion_Crudo`.

## Archivos y Directorios Afectados
- `01_TRABAJO_DE_CAMPO/` (Nuevo directorio)
- `01_TRABAJO_DE_CAMPO/Valle_de_las_Agujas_Crudo/` (Nuevo directorio con videos reubicados)
- `01_TRABAJO_DE_CAMPO/Otra_Expedicion_Crudo/` (Nuevo directorio)
- `src/public/assets/Valle de las Agujas/` (Eliminado o movido)

## Plan de Implementación
1. [x] Crear el directorio `01_TRABAJO_DE_CAMPO` en la raíz.
2. [x] Crear la carpeta `01_TRABAJO_DE_CAMPO/Otra_Expedicion_Crudo`.
3. [x] Mover el contenido de `src/public/assets/Valle de las Agujas` a `01_TRABAJO_DE_CAMPO/Valle_de_las_Agujas_Crudo`.
4. [x] Ejecutar el autodiagnóstico (`init.ps1`) para garantizar que la reubicación de estos archivos estáticos no cause conflictos de compilación en Vite.
5. [x] Solicitar la revisión del Agente Revisor.

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 03:02     | Inicialización de tarea y creación de progress/TASK-025.md | OK |
| 03:03     | Creación de carpetas y movimiento de archivos a 01_TRABAJO_DE_CAMPO | OK |
| 03:04     | Ejecución del autodiagnóstico posterior a la reubicación de recursos | OK |

## Resultado del Revisor
### Revisión TASK-025 — APROBADO

**Revisado por:** Agente Revisor  
**Fecha:** 2026-08-07  

### Checks
- ✅ Directorio `01_TRABAJO_DE_CAMPO` creado correctamente
- ✅ `Valle_de_las_Agujas_Crudo` contiene los archivos crudos originales (videos y fotos)
- ✅ `Otra_Expedicion_Crudo` creada correctamente
- ✅ Build pasa (Autodiagnóstico exitoso en Vite)

## Conclusión
Se reestructuraron las carpetas de trabajo de campo de acuerdo con el esquema final provisto por el usuario. El contenido original de "Valle de las Agujas" se trasladó íntegramente a `01_TRABAJO_DE_CAMPO/Valle_de_las_Agujas_Crudo` y se creó `01_TRABAJO_DE_CAMPO/Otra_Expedicion_Crudo`. El autodiagnóstico continuó en PASS, garantizando la estabilidad del entorno.

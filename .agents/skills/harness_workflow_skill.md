# harness_workflow_skill.md
# SOP — Procedimiento Estándar de Operación del Arnés SERAM

## Descripción
Este documento es el **manual de flujo** para operar el sistema de arnés de IA en SERAM.  
Léelo cada vez que vayas a iniciar una sesión de trabajo con el agente.

---

## 🔁 Flujo Completo de una Tarea

```
┌─────────────────────────────────────────────────────┐
│                  INICIO DE SESIÓN                   │
└─────────────────────────────────────────────────────┘
         │
         ▼
  1. Leer agents.md          → Cargar contexto del proyecto
         │
         ▼
  2. Ejecutar init.sh        → bash init.sh
         │
         ├─── FAIL? → Detener. Resolver errores primero.
         │
         ▼
  3. Leer tasks.json         → Ver tareas pendientes
         │
         ▼
  4. Seleccionar TASK        → Por prioridad: high > medium > low
         │
         ▼
  5. Crear progress/TASK-XXX.md  → Copiar de TASK-000-TEMPLATE.md
         │
         ▼
  6. Delegar al Implementador → Pasar: TASK_ID + archivos + contexto
         │
         ▼
  7. Implementador trabaja   → Lee archivo → Edita → Build → Log
         │
         ▼
  8. Convocar al Revisor     → Revisor ejecuta checklist
         │
         ├─── RECHAZADO? → Volver al paso 6 con feedback
         │
         ▼
  9. Actualizar tasks.json   → status: "done"
         │
         ▼
  10. Commit                 → git commit -m "feat(TASK-XXX): descripción"
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                 TAREA COMPLETADA                    │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Cómo Iniciar Tu Primera Tarea

### Paso 1 — Abrir terminal en d:/SERAM y ejecutar diagnóstico
```bash
cd d:/SERAM
bash init.sh
```

### Paso 2 — Ver tareas disponibles
```bash
# Con jq instalado:
cat tasks.json | jq '.tasks[] | select(.status=="pending") | {id, title, priority}'

# Sin jq (manual):
cat tasks.json
```

### Paso 3 — Elegir una tarea y crear su log
```bash
cp progress/TASK-000-TEMPLATE.md progress/TASK-001.md
```

### Paso 4 — Dar instrucción al agente
Ejemplo de prompt para iniciar TASK-001:
```
Lee agents.md. Luego lee .agents/implementer.md.
Tu tarea es TASK-001: [título].
Descripción: [descripción de tasks.json].
Archivos afectados: [lista].
Registra tu progreso en progress/TASK-001.md.
Al terminar, pasa el resultado al Revisor (.agents/reviewer.md).
```

---

## 🗂️ Gestión de tasks.json

### Cambiar estado de una tarea
```json
{
  "id": "TASK-001",
  "status": "in_progress"   ← cambiar a: "done" | "failed" | "pending"
}
```

### Agregar nueva tarea
```json
{
  "id": "TASK-006",
  "title": "Nombre de la tarea",
  "description": "Qué hace exactamente",
  "status": "pending",
  "priority": "high | medium | low",
  "estimated_hours": 2,
  "tags": ["tag1", "tag2"],
  "created_at": "YYYY-MM-DD",
  "assignee": "implementer",
  "progress_file": "progress/TASK-006.md"
}
```

---

## 🚨 Situaciones de Error

| Error | Acción |
|-------|--------|
| `init.sh` falla | No continuar. Resolver el error reportado. |
| Build roto | El Implementador debe arreglar antes de entregar. |
| Revisor rechaza | Iterar. Máximo 3 intentos, luego escalar al Líder. |
| Tarea demasiado grande | Dividir en subtareas TASK-XXX-A, TASK-XXX-B, etc. |

---

## 📌 Convenciones de Commits
```
feat(TASK-001): implementar autenticación Supabase
fix(TASK-002): corregir re-renders en CoursePlayer
refactor(TASK-003): extraer FormField como componente
docs(TASK-004): documentar API de progreso de cursos
```

---

> SOP versión 1.0 | SERAM Harness Engineering

# Registro de Progreso — TASK-092

## Tarea
**ID**: TASK-092  
**Título**: Blindaje Anti-Inflación del Time Tracker: Suspensión Automática en Cafetería, Detección de Inactividad y Visibilidad (15 min / 3 min background), Saneamiento de Horas Infladas y Renombrado a Misiones Grupales  
**Estado**: IMPLEMENTED (Listo para Validación)  
**Fecha de Inicio**: 2026-10-20  
**Fecha de Finalización de Implementación**: 2026-10-20  
**Líder**: Agente Líder SERAM  
**Implementador**: Agente Implementador SERAM  

## Requerimientos y Diagnóstico
1. **Causa Raíz de Horas Infladas**:
   - `AppContext.jsx` utilizaba `Math.floor((Date.now() - prev.startedAt) / 1000)` en el ticker cada segundo. Al cerrar la pestaña o suspender el equipo, `startedAt` se mantenía fijo en el pasado y al reabrir la web generaba un salto violento acumulando horas irreales de inactividad.
   - Si la sesión se cerraba con el timer corriendo, al volver o iniciar sesión el timer arrancaba inmediatamente en estado activo en lugar de estar pausado en la Cafetería.
   - Pestaña minimizada o en segundo plano no se detectaba (`visibilitychange`).
   - Las horas infladas previas quedaban atascadas en `localStorage` (`seram_partners_presence`).
2. **Requerimiento de Renombrado**:
   - En el Tablero de Misiones (`ActivitiesAndClientsModule.jsx`), renombrar el filtro de misiones `Combos Interdisciplinarios` a `Misiones Grupales`.

## Log de Cambios Realizados
1. **`src/features/partner-portal/ActivitiesAndClientsModule.jsx`**:
   - Línea 2257: Actualizado botón de filtro de `{ id: 'combo', label: '👥 Combos Interdisciplinarios' }` a `{ id: 'combo', label: '👥 Misiones Grupales' }`.
2. **`src/context/AppContext.jsx`**:
   - **Saneamiento Automático de Presencias**: Detección y purga de valores inflados (> 14 horas = 50,400s) o inconsistentes en `seram_partners_presence`, restableciéndolos a 0 y ubicando al socio en la Cafetería (`recreation`, coords `{ x: 28, y: 80 }`).
   - **Arranque Seguro en Pausa**: En la carga inicial de `activeTimer`, si `isRunning` era true, se fuerza a `false` con `startedAt: null` y ubicación en Cafetería (`recreation`). Al volver a la web, el socio nunca arranca corriendo horas de fondo.
   - **Incremento Estricto de 1 Segundo**: En el ticker de 1 segundo, se eliminó el cálculo de salto temporal `Math.floor((Date.now() - prev.startedAt) / 1000)` y se sustituyó por `(prev.seconds || 0) + 1`, garantizando que el cronómetro solo avance por tiempo real en primer plano.
   - **Umbral de Inactividad Reducido a 15 Minutos**: Se ajustó `IDLE_TIMEOUT_MS` de 45 a 15 minutos (900,000 ms). Si el socio abandona su equipo por 15 minutos, se pausa el cronómetro, se deduce el tiempo de inactividad (`sanitizedSeconds = Math.max(0, currentTimer.seconds - idleSeconds)`) y el avatar es trasladado a la Cafetería.
   - **Detección de Pestaña Oculta / Minimizado (`visibilitychange`)**: Si la pestaña pasa a estado `hidden` por más de 3 minutos, se ejecuta pausa preventiva automática y traslado a Cafetería.
   - **Ciclo de Vida de Ventana (`beforeunload` & `pagehide`)**: Al cerrar o recargar, se almacena el estado pausado en Cafetería.
   - **Traslado a Cafetería en `pausePartnerTimer` y `resetPartnerTimer`**: Al pausar o resetear, el socio es reubicado en la sala de recreación y descanso (`recreation`). Al iniciar sesión de trabajo (`startPartnerTimer`), el socio sale de la cafetería hacia su estación de trabajo (`direction` / sector activo).

## Verificación
- En compilación con `npm run build`.
- Sin variables globales fuera de alcance ni violaciones de TDZ / ESLint.

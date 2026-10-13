# Registro de Progreso: TASK-061

## Tarea
**TASK-061:** Sincronización en Tiempo Real de Cronómetros Multi-Socio, Erradicación del Bug 03:42:00, Saneamiento de LocalStorage y Blindaje de Persistencia de Proyectos y Horas Históricas en Supabase.

## Fecha
- Inicio: 2026-10-12
- Cierre: 2026-10-12
- Estado: **COMPLETADO / PUBLICADO EN PRODUCCIÓN**

## Diagnóstico y Causa Raíz
1. **Cronómetro varado en 3:42 (13320 segundos):**
   - El estado inicial de `activeTimer` en `src/context/AppContext.jsx` tenía configurado `seconds: 13320`, lo que equivale a $13320 / 3600 = 3.7\text{ horas} = \mathbf{03:42:00}$.
   - Cada nuevo dispositivo o usuario sin sesión previa cargaba con 3h 42m en pausa en lugar de 00:00:00.
2. **Discrepancia entre el Cronómetro Central y el Monitor del Equipo:**
   - La tarjeta de socio en el monitor leía de `partnerPresences[partner.email].timerSeconds` (un estado de red con desfase e intervalo estático), en lugar de enlazar con `timerSec` (`activeTimer.seconds`) para el socio conectado actualmente.
   - El intervalo del *heartbeat* en `AppContext.jsx` capturaba un *stale closure* de `activeTimer.seconds`.
3. **Impresión de "Borrón de Horas y Proyectos":**
   - Proyectos de trabajo real como *Palos Blancos*, *Cobija* y *Lombricultura* estaban ausentes de la tabla `projects` de Supabase, lo que causaba que al sincronizar datos remotos se omitieran del dropdown del Time Tracker y no renderizaran tarjetas en el balance meritocrático.
   - La inserción de `time_logs` enviaba `project_id: null` para el proyecto interno web, violando la restricción `NOT NULL INTEGER` de PostgreSQL.

## Cambios Implementados
1. **Corrección de Cronómetro e Inicialización Limpia:**
   - `activeTimer` inicializa en `seconds: 0`.
   - `partnerPresences` inicializa con `timerSeconds: 0`.
   - Rutina de auto-limpieza al montar que purga valores antiguos residuales de 13320 / 9720 / 7200 segundos en `localStorage`.
   - Ref dinámico `activeTimerRef` para el latido de red (*heartbeat*), transmitiendo el tiempo transcurrido en vivo sin *stale closures*.
2. **Sincronización en Tiempo Real del Monitor de Socios (`PartnerDashboard.jsx`):**
   - El socio conectado actual renderiza `timerSec` y `isTimerRunning` directamente en su tarjeta del monitor de equipo, reflejando el tiempo segundo a segundo en concordancia con el display principal.
3. **Blindaje de Proyectos y Horas en Supabase:**
   - Registrados formalmente en `projects` de Supabase:
     - `ID 15`: *Gobierno Autónomo Municipal de Palos Blancos* (Línea Base Mercurio)
     - `ID 16`: *G.A.M.L.P. Lombricultura y Residuos Sólidos*
     - `ID 17`: *Plataforma Digital & Ecosistema SERAM* (Proyecto Interno Real)
   - Consolidadas y vinculadas en `time_logs` de Supabase las horas históricas:
     - Ing. Diego Barrientos: 180.0h (Web) + 4.5h (Palos Blancos) = 184.5h
     - Ing. Fernando Araujo: 33.0h (Web) + 4.0h (Bonos de Carbono / Cobija) = 37.0h
     - Ing. Fabricio Orosco: 27.0h (Web) + 4.0h (Lombricultura G.A.M.L.P.) = 31.0h
   - `handleAddTimeLog` asegura el envío de un ID entero válido (`17` por defecto si es proyecto interno) para evitar violaciones de clave foránea.

## Verificación
- Compilación de producción con `npm run build` ejecutada con código 0 (`vite build` exitoso).
- Consultas a Supabase confirmando la presencia de los proyectos y las 6 filas consolidadas en `time_logs`.

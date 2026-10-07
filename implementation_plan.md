# Plan de Implementación: Sesión On-line en Tiempo Real, Time-Tracker y Avatares por Sector (TASK-042)

## 1. Visión General y Objetivos
El usuario ha detectado que:
1. La sesión On-line en tiempo real de los socios no es visible para todos en el sistema.
2. El Time-Tracker debe reflejar la sesión activa de trabajo de cada socio en curso.
3. Los avatares deben reflejar en tiempo real el sector o despacho físico/2.5D en el que se encuentra cada socio en la Oficina Virtual.

### Causa Raíz
1. **Presencia Aislada en LocalStorage**: En `AppContext.jsx`, el estado `partnerPresences` únicamente se modificaba en el almacenamiento local del navegador del cliente actual (`localStorage.setItem('seram_partners_presence', ...)`). No existía un canal de Presence o Broadcast en Supabase Realtime ni un bus de eventos inter-cliente que propagara el estado a los demás socios o dispositivos.
2. **Time-Tracker Desconectado de la Sesión**: En `PartnerDashboard.jsx` (`TimeTrackerModule`), el módulo consistía exclusivamente en un formulario estático para registrar horas pasadas manualmente a un proyecto. No existía un widget de sesión activa (cronómetro en tiempo real) ni un monitor en vivo que mostrara a los otros socios en qué sesión, proyecto o sector se encuentran trabajando en ese momento. Adicionalmente, el cronómetro flotante en `VirtualOfficeView.jsx` era un estado local aislado.
3. **Avatares Estáticos para Otros Socios**: En `VirtualOfficeView.jsx`, cuando un socio hacía clic en el mapa (Point & Click) o seleccionaba una sala, sólo se actualizaba la variable local `userAvatarPos`. Para cualquier otro socio conectado, el avatar de ese colega se dibujaba en una posición predeterminada estática (`recreationSpots` o `homeCoords`), imposibilitando ver en tiempo real el desplazamiento o el sector en el que se encuentra cada socio.

---

## 2. Diagnóstico y Archivos Involucrados

| Archivo | Rol | Cambios Planificados |
| :--- | :--- | :--- |
| `src/context/AppContext.jsx` | Estado global, persistencia y Supabase | 1. Estructura unificada para cada socio en `partnerPresences` con `isOnline`, `sessionStart`, `lastPing`, `currentRoomId`, `currentSectorName`, `roomCoords`, `isTimerRunning`, `timerSeconds`, `timerStartedAt`, `activeTaskId`, `activeTaskTitle`, `device`, `location`.<br>2. Sincronización Realtime bidireccional vía **Supabase Realtime Channel** (`seram-partner-presence-v1`) con `track()` y `broadcast` + **BroadcastChannel API** nativo para sincronización inter-pestañas a latencia cero.<br>3. Estado global de `activeTimer` compartido entre `PartnerDashboard` y `VirtualOfficeView`.<br>4. Funciones: `updatePartnerPresence`, `startPartnerTimer`, `pausePartnerTimer`, `resetPartnerTimer`, `savePartnerTimerLog`, `setPartnerSector`. |
| `src/features/partner-portal/PartnerDashboard.jsx` | Layout del Portal de Socios y módulos | 1. En `TimeTrackerModule`: Incorporar panel superior de **Sesión en Vivo / Time Tracker en Tiempo Real**: cronómetro digital interactivo para el socio conectado con inicio/pausa/guardado directo a logs, y **Monitor de Socios en Tiempo Real** con tarjetas de los 3 socios (avatar con chaleco, indicador online, sector en el que están trabajando, cronómetro en vivo de su sesión y botón para localizar en la maqueta).<br>2. En `OverviewModule`: Mostrar el badge del sector actual y el cronómetro de sesión activa en la tarjeta de cada socio. |
| `src/features/partner-portal/VirtualOfficeView.jsx` | Maqueta fotorrealista 2.5D de 13 despachos | 1. Conectar con el estado global de `activeTimer` y `partnerPresences` de `AppContext`.<br>2. Posicionar dinámicamente los avatares de TODOS los socios basándose en las coordenadas y sector transmitidos en tiempo real (`presence.roomCoords` / `presence.currentRoomId`).<br>3. Al hacer Point & Click o seleccionar un despacho, actualizar el sector del socio y transmitirlo inmediatamente para que todos los demás socios vean su avatar caminar y ubicarse en dicho sector.<br>4. Sincronizar el control PiP flotante con el cronómetro global de sesión. |
| `tasks.json` | Cola de tareas del proyecto | Registro de `TASK-042` en status `in_progress` -> `done`. |
| `progress/TASK-042.md` | Log de progreso de la tarea | Registro de avances y validaciones. |

---

## 3. Plan de Acción Detallado

### Fase 1: Arquitectura de Presencia y Sincronización en `AppContext.jsx`
1. Modelar el estado de presencia con los 3 socios fundadores oficiales de SERAM:
   - Ing. Diego Barrientos (`barrientoso2401@gmail.com`) - Despacho por defecto: `direction` (02. DIRECCIÓN).
   - Ing. Fernando Araujo (`fernandoaraujo1912@gmail.com`) - Despacho por defecto: `operations` (03. OPERACIONES).
   - Ing. Fabricio Orosco (`sebastiansbs51@gmail.com`) - Despacho por defecto: `experience` (11. EXPERIENCIA Y CAMPO).
2. Crear un canal Supabase Realtime (`seram-partners-live`) con:
   - `channel.on('presence', { event: 'sync' }, ...)`
   - `channel.on('broadcast', { event: 'partner_presence_change' }, ...)`
   - `channel.track(...)` al autenticarse o cambiar de estado.
3. Crear un fallback local con `BroadcastChannel('seram_partners_channel')` y `storage` event para sincronización local inmediata.
4. Crear el motor de cronómetro activo con persistencia y latido (`heartbeat`) cada 15 segundos.

### Fase 2: Monitor de Sesiones y Cronómetro en `TimeTrackerModule`
1. Reemplazar la vista estática por un panel en dos columnas o secciones:
   - **Columna 1: Tu Sesión Activa de Trabajo (Time Tracker)**:
     - Reloj digital en vivo con fuente técnica (`font-mono text-3xl font-black text-[#00e03c]`).
     - Selector de proyecto asociado (lista de proyectos y propuestas de SERAM).
     - Selector de sector de trabajo (donde se sitúa el avatar en la oficina).
     - Botones de acción: "Iniciar Sesión", "Pausar Jornada", "Registrar Horas Efectivas" (guarda directo a `time_logs` y resetea el timer).
   - **Columna 2: Monitor del Equipo de Socios en Tiempo Real**:
     - 3 tarjetas dedicadas (Diego, Fernando, Fabricio).
     - Indicador online pulsante, sector físico actual (con icono y badge institucional), cronómetro en curso con segundos corriendo en vivo y proyecto asignado.
     - Botón "Ver en Oficina Virtual" que redirige al despacho correspondiente en la vista 2.5D.
2. Mantener la tabla histórica de logs y la calculadora meritocrática de honorarios por proyecto.

### Fase 3: Posicionamiento y Desplazamiento de Avatares en `VirtualOfficeView.jsx`
1. Adaptar `partnerAvatars` para consumir `partnerPresences[email].roomCoords` y `currentRoomId`.
2. Al ejecutar `handleFloorClick`, calcular las coordenadas de destino y emitir `setPartnerSector(closestRoom?.id || 'corridor', { x: targetX, y: targetY }, closestRoom?.name || 'Pasillo Central')`.
3. Sincronizar el PiP flotante con `activeTimer` de `AppContext`.
4. Mostrar en el tooltip/rótulo de cada avatar el nombre, el cronómetro en vivo de sesión y el sector en el que se encuentra.

### Fase 4: Validación y Calidad
1. Ejecutar ESLint y build de Vite (`npm run build`).
2. Verificar que no haya errores de importación ni referencias nulas.
3. Registrar progreso en `progress/TASK-042.md` y actualizar `tasks.json`.

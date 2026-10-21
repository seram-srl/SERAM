# TASK-095: Alineación Real de Perfiles RPG y Radar Pentagonal (Anti-Trampas / Verificación Estricta) y Ergonomía del Menú Lateral en Dashboard

## 1. Resumen Ejecutivo
Se implementó la calibración matemática y objetiva de los perfiles de socios en SERAM bajo el principio rector: **"Lo que se ve se anota y si no hay nada no se ve nada"**, eliminando cualquier dato ficticio, credenciales fantasmas o casillas de auto-marcado arbitrario en el perfil RPG y en el Radar Pentagonal. Asimismo, se resolvió la colisión entre el menú lateral colapsado y el botón de navegación móvil/escritorio en la cabecera fija del dashboard.

---

## 2. Modificaciones Realizadas

### A. Cabecera y Menú Lateral (`PartnerDashboard.jsx`)
1. **Espaciado Anti-Colisión:**
   - Se ajustó el padding izquierdo del contenedor de acciones de cabecera a `pl-20 sm:pl-24` para garantizar separación ergonómica respecto al menú de hamburguesa flotante fijo (`top-6 left-6 z-[110]`).
2. **Botón Desplegar Módulos en Desktop:**
   - Cuando la barra lateral está contraída (`!sidebarOpen`), se despliega un botón visible en la cabecera superior con icono `Menu` y texto "Desplegar Módulos", facilitando la reapertura sin forzar la búsqueda de la flecha pequeña.
3. **Optimización en Móvil:**
   - El botón flotante en la cabecera fija de 80px mantiene acceso instantáneo permanente al Drawer de módulos (`setMobileDrawerOpen(true)`).

### B. Calibración Verídica Anti-Trampas (`PartnerProfileRPGModule.jsx`)
1. **Saneamiento de Perfiles Iniciales (`DEFAULT_PROFILES`):**
   - **Ing. Diego Barrientos:** `matricula: 'En trámite (SIB / RENCA)'`, `hasCV: true`, `hasSIB: false`, `hasRENCA: false`.
   - **Ing. Fernando Araujo:** `matricula: 'Pendiente de acreditación'`, `hasCV: false`, `hasSIB: false`, `hasRENCA: false`, `cvName: null`.
   - **Ing. Fabricio Orosco:** `matricula: 'Pendiente de acreditación'`, `hasCV: false`, `hasSIB: false`, `hasRENCA: false`, `cvName: null`.
2. **Eliminación de Toggles Arbitrarios:**
   - Se eliminaron las casillas interactivas `toggleCredential('hasSIB')` y `toggleCredential('hasRENCA')` que permitían auto-adjudicarse +25 pts con un simple clic.
   - Se reemplazaron por interfaces formales de carga documental (`handleUploadSIB`, `handleUploadRENCA`) que exigen adjuntar certificados oficiales en PDF/imagen para obtener la validación.
3. **Calibración Estricta del Radar Pentagonal (`radarAxes`):**
   - **Responsabilidad (0 - 100 pts):** Si no hay tareas asignadas, la base es 0 pts (se eliminó la base ficticia de 50 pts). Calculado como ratio de entregables a tiempo.
   - **Productividad (0 - 100 pts):** Hasta 20 hrs auditadas en Time Tracker (60 pts) + 5 tareas concluidas (40 pts). Base 0 si no hay horas.
   - **Trabajo en Equipo (0 - 100 pts):** Validaciones cruzadas a socios pares (+25 pts por aprobación). Base 0 sin validaciones.
   - **Valor Comercial (0 - 100 pts):** Propuestas municipales lideradas (+30 pts) y prospectos comerciales gestionados (+20 pts). Base 0 sin actividad.
   - **Credenciales Técnicas (0 - 100 pts):** CV en PDF (+40 pts), Certificado SIB (+30 pts), Registro RENCA (+30 pts). Si no se tiene ninguno, la puntuación es 0 pts.
4. **Guía Pedagógica de Progresión Legítima:**
   - Incorporación de un panel didáctico bajo el radar explicando cómo subir legítimamente de nivel en cada uno de los 5 ejes.
5. **Migración de Almacenamiento:**
   - Se migró la llave de persistencia a `seram_partner_profiles_v2` purgando la versión anterior v1 para evitar que datos alterados manualmente sobrescribieran la calibración real.

---

## 3. Verificación
- Compilación `npm run build` ejecutada con éxito (cero errores de linting o sintaxis).
- Comportamiento reactivo verificado en desktop y mobile.

# Plan de Implementación Integral — TASK-101

## Título de la Tarea
**TASK-101: Implementación del Flujo Completo de Restablecimiento de Contraseña (UpdatePasswordModal, Captura de PASSWORD_RECOVERY en AppContext, supabase.auth.updateUser) y Acceso Directivo Seguro**

---

## 1. Contexto y Diagnóstico del Problema
1. **Falta de Interfaz de Cambio de Contraseña tras Recovery Link:**
   - Cuando Supabase envía un enlace de recuperación de contraseña, redirige al usuario a la web con un fragmento hash: `#access_token=...&type=recovery`.
   - El cliente de Supabase procesa el token y emite el evento `PASSWORD_RECOVERY` en `onAuthStateChange`.
   - Actualmente, la aplicación no captura dicho evento ni detecta `#type=recovery`. Como resultado, el usuario aterriza en `HomePage` sin que aparezca ninguna interfaz para ingresar su nueva contraseña.
   - La base de datos registra el inicio de sesión temporal, pero la contraseña nunca se actualiza porque falta invocar `supabase.auth.updateUser({ password: newPassword })`.

2. **Requisitos de Solución:**
   - Crear un componente modal global `UpdatePasswordModal.jsx` con diseño Neuform.
   - En `AppContext.jsx`:
     - Detectar `event === 'PASSWORD_RECOVERY'` en `onAuthStateChange`.
     - Detectar si la URL contiene `type=recovery` en hash o búsqueda.
     - Exponer estado `showUpdatePasswordModal` y handler `handleUpdateUserPassword(newPassword)`.
   - Al actualizar exitosamente la contraseña:
     - Si el correo pertenece a la lista de socios directivos (`registeredUsers` con rol `AdminMod`), autenticar de inmediato como socio, fijar `sessionStorage` y navegar a `/dashboard`.
     - Limpiar los parámetros de la URL para evitar re-aperturas accidentales.

---

## 2. Matriz de Archivos Afectados

| Archivo | Ubicación | Modificaciones Planificadas |
|---|---|---|
| `UpdatePasswordModal.jsx` | `src/components/ui/UpdatePasswordModal.jsx` | Nuevo componente: Modal reactivo Neuform con validación de contraseña, confirmación y botón de guardado. |
| `AppContext.jsx` | `src/context/AppContext.jsx` | - Escuchar `PASSWORD_RECOVERY` en `onAuthStateChange`.<br>- Detectar `type=recovery` en hash de URL.<br>- Implementar `handleUpdateUserPassword(newPassword)`.<br>- Exponer `showUpdatePasswordModal` y `setShowUpdatePasswordModal`. |
| `App.jsx` | `src/App.jsx` | Importar y montar `<UpdatePasswordModal />` en la capa de modales globales. |
| `tasks.json` | `tasks.json` | Registrar TASK-101 en `in_progress`. |

---

## 3. Plan de Pruebas y Validación
1. **Build:** Ejecutar `npm run build` para asegurar cero errores de empaquetado.
2. **ESLint:** Ejecutar `npx eslint` sobre `UpdatePasswordModal.jsx`, `AppContext.jsx` y `App.jsx`.
3. **Flujo de Seguridad:** Verificar ausencia total de bypasses o passwords en texto claro.

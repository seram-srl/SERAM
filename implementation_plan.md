# Plan de Implementación Integral — TASK-098

## Título de la Tarea
**TASK-098: Blindaje Integral de Ciberseguridad: Erradicación de Master Passwords en Frontend, Flujo de Reseteo y Reenvío de Confirmación Supabase, Robustecimiento de Sesiones y Saneamiento de Dependencias.**

---

## 1. Contexto y Diagnóstico
1. **Credenciales en Claro en Frontend:**
   - En `LoginPage.jsx`, `AppContext.jsx` y `SecretAuthModal.jsx`, se implementó en fase demo un bypass con contraseñas maestras (`socio2026` / `seram2026`).
   - Esto expone el acceso al Dashboard Directivo a cualquier persona que examine el código en el inspector de elementos o el bundle JS.
   - Debe ser erradicado por completo. La autenticación debe depender 100% de Supabase Auth criptográfico (`signInWithPassword`).

2. **Dilema de Confirmación de Correo y Cuentas No Confirmadas:**
   - Si un socio se registró pero el correo de confirmación de Supabase no le llegó (por rate limiting o spam), Supabase bloquea el login con contraseña (`Email not confirmed`).
   - Es necesario añadir un flujo de diagnóstico y asistencia: botón de **"Reenviar correo de confirmación"** (`supabase.auth.resend({ type: 'signup', email })`) y **"Recuperar / Cambiar Contraseña"** (`supabase.auth.resetPasswordForEmail(email)`) tanto en `LoginPage.jsx` como en `SecretAuthModal.jsx`.

3. **Protección de Rutas y Sesión:**
   - Fortalecer `ProtectedRoute.jsx` y `AppContext.jsx` para sincronizar con la sesión activa real de Supabase (`supabaseUser`) manteniendo la persistencia en `sessionStorage` para navegación reactiva sin fugas en `localStorage`.

4. **Saneamiento de Dependencias:**
   - Parchear las vulnerabilidades reportadas por `npm audit` que no generen rotura de API.

---

## 2. Matriz de Archivos Afectados

| Archivo | Ubicación | Modificaciones Planificadas |
|---|---|---|
| `LoginPage.jsx` | `src/features/auth/LoginPage.jsx` | - Eliminar banner visible de bypass de clave maestra.<br>- Añadir link y modal de "Reenviar confirmación / Olvidé mi contraseña" vía Supabase.<br>- Limpiar cualquier texto de claves en claro. |
| `SecretAuthModal.jsx` | `src/components/ui/SecretAuthModal.jsx` | - Eliminar validación de `socio2026`/`seram2026`.<br>- Validar 100% vía `supabase.auth.signInWithPassword`.<br>- Manejar explícitamente errores de cuenta no confirmada con opción de reenvío inmediato. |
| `AppContext.jsx` | `src/context/AppContext.jsx` | - Eliminar bypass `isMasterPass` en `handlePartnerLogin` y `handleLoginSupabase`.<br>- Mantener login estricto Supabase y fallback ordenado con mensajes claros.<br>- Agregar métodos exportables: `handleResendConfirmation(email)` y `handleResetPassword(email)`. |
| `ProtectedRoute.jsx` | `src/components/shared/ProtectedRoute.jsx` | - Blindar la verificación de sesión directiva validando coherencia de token y rol. |

---

## 3. Plan de Pruebas y Validación
1. **Build:** Ejecutar `npm run build` para asegurar cero errores de empaquetado.
2. **Linting:** Ejecutar `npx eslint` sobre los archivos modificados según `runtime-validation.md`.
3. **Flujo de Acceso:** Verificar que no existan strings de contraseñas maestras en el código fuente (`git grep -i "socio2026"` y `git grep -i "seram2026"` deben retornar 0 coincidencias en código activo de autenticación).

# Plan de Implementación — TASK-064

## Objetivo
Resolver el bloqueo de inicio de sesión de los socios directivos (específicamente `barrientoso2401@gmail.com` - Ing. Diego Barrientos) en `LoginPage.jsx`, permitiendo:
1. Autenticación exitosa tanto con la contraseña registrada en Supabase como con el pase de acceso institucional (`socio2026` / `seram2026`).
2. Detección automática del rol de Socio Directivo (`AdminMod`), asignación de `currentSocio` y persistencia en `sessionStorage`.
3. Redirección automática directa a `/dashboard` (en lugar de enviar al socio a `/academy`).
4. Detección visual en tiempo real del socio al ingresar su correo institucional en `LoginPage.jsx`, indicando que es un Socio Fundador reconocido y recordando la disponibilidad del pase de acceso institucional.
5. Acceso directo e interconexión con el portal de socios directivos desde `LoginPage.jsx`.

---

## Causa Raíz Diagnosticada
1. `LoginPage.jsx` únicamente invocaba `supabase.auth.signInWithPassword({ email, password })`.
2. Supabase Auth tiene habilitada la confirmación de correo electrónico (`confirmation_sent_at`), por lo que cualquier usuario recién registrado que no haya abierto el enlace de verificación en su correo es rechazado por Supabase con `Invalid login credentials`.
3. Cuando el socio intentaba ingresar con el pase de acceso institucional (`socio2026` o `seram2026`), `LoginPage.jsx` enviaba ese pase a Supabase en vez de procesarlo como pase maestro local, fallando también en Supabase.
4. Incluso si el login en Supabase hubiera tenido éxito, `handleLoginSupabase` no asignaba `activeRole: 'AdminMod'` ni `currentSocio`, y `LoginPage.jsx` redirigía ciegamente a `/academy` en vez de `/dashboard`.

---

## Archivos a Modificar
1. `src/context/AppContext.jsx`:
   - Enriquecer `handleLoginSupabase` para detectar correos de socios fundadores y validar contra pase maestro institucional (`socio2026` / `seram2026`) además de Supabase Auth.
   - Si se autentica un socio fundador (por pase maestro o por Supabase exitoso), conceder inmediatamente `activeRole: 'AdminMod'`, configurar `currentSocio` y retornar `{ success: true, isPartner: true, redirectTo: '/dashboard' }`.
2. `src/features/auth/LoginPage.jsx`:
   - Redireccionar dinámicamente según el rol: si `result.isPartner` o `result.redirectTo`, navegar a `/dashboard`; si es alumno/cliente, navegar a `/academy`.
   - Detección en vivo de correo de socio: desplegar badge `🏛️ Socio Fundador Reconocido` con soporte para pase de acceso.
   - Acceso alternativo rápido para abrir el modal secreto de socios directivos (`setShowSecretPortal(true)`).
3. `progress/TASK-064.md` y `tasks.json`: Registro y seguimiento estricto del protocolo.

---

## Verificación
- ESLint en archivos modificados.
- `npm run build` sin errores.
- Prueba funcional de login con `barrientoso2401@gmail.com` usando pase `socio2026` y redirección a `/dashboard`.

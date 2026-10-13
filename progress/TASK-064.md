# Registro de Progreso: TASK-064

## Tarea
**TASK-064:** Unificación de Autenticación de Socios en `LoginPage`: Reconocimiento Automático de Credenciales de Socios Fundadores, Bypass de Clave Maestra Institucional (`socio2026` / `seram2026`), Elevación a `AdminMod` y Redirección Directa al Dashboard.

## Fecha
- Inicio: 2026-10-13
- Cierre: 2026-10-13
- Estado: **COMPLETADO / APROBADO POR REVISOR**
- Asignado a: Implementador

## Diagnóstico y Contexto
1. El socio fundador Ing. Diego Barrientos (`barrientoso2401@gmail.com`) experimentaba bloqueo al intentar iniciar sesión desde `/login` para acceder al Dashboard de Socios.
2. Al ingresar sus datos, recibía error de credenciales (`Invalid login credentials`).
3. Diagnóstico técnico:
   - Supabase Auth tiene activa la verificación de correo electrónico (`confirmation_sent_at`). El usuario no puede iniciar sesión mediante contraseña personalizada de Supabase hasta hacer clic en el enlace de confirmación recibido en su bandeja de Gmail.
   - `LoginPage.jsx` únicamente ejecutaba `supabase.auth.signInWithPassword({ email, password })`. No contenía la lógica de bypass con pase de acceso maestro (`socio2026` / `seram2026`) que sí poseen `SecretAuthModal` e `InlinePartnerLogin`. Por lo tanto, si el socio usaba su pase de acceso institucional, Supabase lo rechazaba inmediatamente.
   - Incluso en caso de éxito en Supabase, `handleLoginSupabase` no asignaba `activeRole = 'AdminMod'` ni `currentSocio`, y `LoginPage.jsx` redirigía a `/academy` en vez de `/dashboard`.

## Cambios Implementados

### 1. `src/context/AppContext.jsx` (`handleLoginSupabase`)
- **Normalización de entradas**: `email` y `password` procesados con `.trim()`.
- **Detección de Socio Directivo**: Búsqueda en `registeredUsers` con `(u.role === 'AdminMod' || u.name?.startsWith('Ing.')) && u.email.toLowerCase() === cleanEmail.toLowerCase()`.
- **Verificación de Clave Maestra Institucional**: `socio2026` o `seram2026`.
- **Bypass Directivo Autenticado**:
  - Asigna `setActiveRole('AdminMod')` y `setCurrentSocio(partner)`.
  - Persiste en `sessionStorage` (`seram_partner_role`, `seram_current_socio`) y limpia `localStorage`.
  - Despliega toast de bienvenida personalizado: `¡Bienvenido, ${partner.name}! Acceso al Dashboard de Socios autorizado.`.
  - Retorna `{ success: true, isPartner: true, partner, redirectTo: '/dashboard' }`.
- **Fallback a Supabase Auth**:
  - Si no se utiliza pase maestro, ejecuta `supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPass })`.
  - En caso de error de Supabase para un socio detectado, muestra mensaje instructivo sobre la alternativa del pase de acceso institucional.
  - En caso de éxito de Supabase para un socio o usuario con metadata directiva, asigna rol `AdminMod`, datos en `sessionStorage` y retorna `{ success: true, isPartner: true, partner: partnerData, redirectTo: '/dashboard' }`.
  - Si es usuario general/alumno, retorna `{ success: true, isPartner: false, data, redirectTo: '/academy' }`.

### 2. `src/features/auth/LoginPage.jsx`
- **Extracción de Contexto**: Conecta `setShowSecretPortal` y `registeredUsers` desde `useApp()`.
- **Enrutamiento Dinámico**: En `handleSubmit`, si `result.redirectTo === '/dashboard'` o `result.isPartner`, redirige a `/dashboard`; caso contrario a `/academy`.
- **Detección Reactiva en Vivo**: Filtra en tiempo real si el correo escrito coincide con un socio directivo y renderiza badge elegante Neuform:
  `🏛️ Socio Fundador Detectado: {detectedPartner.name}. Puedes ingresar con tu contraseña o con tu clave maestra institucional (socio2026 / seram2026).`
- **Acceso Directo al Portal Secreto**: Añadido botón sutil al pie del formulario:
  `¿Eres Socio Directivo? Acceder mediante Portal Secreto` con `onClick={() => setShowSecretPortal(true)}`.

## Verificación y Calidad
1. **ESLint**:
   - `npx eslint src/features/auth/LoginPage.jsx` -> **0 errores, 0 warnings (Exit code 0)**.
   - `src/context/AppContext.jsx` verificado en las secciones tocadas.
2. **Build de Producción**:
   - `npm run build` ejecutado exitosamente (`built in 47.87s`, Exit code 0).

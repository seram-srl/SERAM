# Plan de Implementación Integral — TASK-102

## Título de la Tarea
**TASK-102: Estilizado Cinematográfico de Modales con Paisaje Hero (bg_home.webp) de Fondo y Sistema Hold-to-Reveal (Ojito de Seguridad Presionar-para-Ver) en Entradas de Contraseña**

---

## 1. Contexto y Diagnóstico
1. **Fondo de los Modales (SecretAuthModal & UpdatePasswordModal):**
   - El fondo actual es una capa opaca oscura plana (`bg-black/80`).
   - Se requiere sustituir el fondo negro sólido por la imagen oficial del Hero de la web (`/assets/3d-backend/bg_home.webp`) con desenfoque estético (`blur-[6px]`), oscurecimiento equilibrado para legibilidad WCAG AAA y retícula técnica Neuform.
   - La tarjeta de los modales debe mantener su estética glassmorphic traslúcida (`bg-[#080f08]/90 backdrop-blur-2xl border border-[#1a3a1a]/80`).

2. **Interacción del Ojito de Contraseña (Hold-to-Reveal / Peek):**
   - En `SecretAuthModal.jsx`, actualmente no existe el icono del ojo en la casilla de contraseña.
   - En `UpdatePasswordModal.jsx` y `LoginPage.jsx`, la visibilidad se alternaba con un clic estático.
   - Se debe implementar el comportamiento de seguridad estricto pedido por el usuario:
     - **Presionar y mantener** (`onMouseDown`, `onTouchStart`): la contraseña se vuelve visible (`type="text"` con icono `Eye`).
     - **Soltar el cursor o dedo** (`onMouseUp`, `onMouseLeave`, `onTouchEnd`, `onKeyUp`): la contraseña vuelve inmediatamente a estar oculta/enmascarada (`type="password"` con icono `EyeOff`).

---

## 2. Matriz de Archivos Afectados

| Archivo | Ubicación | Modificaciones Planificadas |
|---|---|---|
| `SecretAuthModal.jsx` | `src/components/ui/SecretAuthModal.jsx` | - Fondo cinematográfico con `bg_home.webp`.<br>- Ojito de contraseña hold-to-reveal con `Eye`/`EyeOff`. |
| `UpdatePasswordModal.jsx` | `src/components/ui/UpdatePasswordModal.jsx` | - Fondo cinematográfico con `bg_home.webp`.<br>- Ojito hold-to-reveal en Nueva Contraseña y Confirmar Contraseña. |
| `LoginPage.jsx` | `src/features/auth/LoginPage.jsx` | - Ojito hold-to-reveal en la casilla de contraseña para consistencia total. |
| `tasks.json` | `tasks.json` | Registro de TASK-102. |

---

## 3. Plan de Pruebas y Validación
1. **Build:** `npm run build` sin errores.
2. **ESLint:** 0 errores en los archivos modificados.
3. **Prueba Interactiva:** Verificar eventos de mouse y touch para la visibilidad dinámica de la contraseña.

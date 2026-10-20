# Plan de Implementación — TASK-089

## Objetivo
Unificar el Footer de SERAM de manera global en todas las páginas públicas de la plataforma web, aplicando los siguientes cambios de marca y localización requeridos por el usuario:
1. **Actualización de Dirección:** Modificar la dirección a `"Calle Los Álamos N° 140, Obrajes, La Paz, Bolivia."`.
2. **Reemplazo de Socios Fundadores por Logotipo Centrado:** En la columna izquierda, eliminar la etiqueta `"SOCIOS FUNDADORES"` y la lista de socios, y en su lugar colocar el logotipo oficial de SERAM bien centrado, con interactividad para que al hacer clic redirija a la Home (hero) y realice scroll suave a la cabecera.
3. **Disponibilidad Global:** Asegurar que el footer esté visible en todas las páginas públicas de la web (`/`, `/services`, `/academy`, `/quote`, `/experience`, `/shop`, `/contact`, `/privacidad`, `/terminos`, `/cookies`, `/reembolsos`, `/login`, `/register`), exceptuando únicamente vistas de pantalla completa dedicadas como `/dashboard` y `/academy/workspace`.

---

## Archivos a Modificar / Crear
1. **`src/components/shared/Footer.jsx` (Nuevo componente compartido):**
   - Extraer la lógica y maquetación de `FooterSection` de `HomePage.jsx`.
   - Columna 1 (Izquierda): Eliminar `SOCIOS FUNDADORES` y nombres. Colocar botón centrado con el logotipo oficial de SERAM (`ícono_logo.png` + `SERAM` estilizado), con `onClick` que navega a `/` y ejecuta `window.scrollTo({ top: 0, behavior: 'smooth' })`.
   - Columna 2 (Centro): Redes sociales (Instagram, Facebook, LinkedIn) y lema corporativo.
   - Columna 3 (Derecha): Título "Ubicación y Legalidad", texto "Oficina Central Bolivia: Calle Los Álamos N° 140, Obrajes, La Paz, Bolivia.", enlaces legales (`/contact`, `/terminos`, `/privacidad`, `/cookies`, `/reembolsos`) y copyright.
2. **`src/App.jsx`:**
   - Importar `Footer` desde `./components/shared/Footer`.
   - Renderizar `<Footer />` al final de `<main>`, condicionado a rutas públicas (oculto en `/dashboard` y `/academy/workspace`).
3. **`src/features/home/HomePage.jsx`:**
   - Reemplazar la definición local de `FooterSection` por la importación de `Footer` o retirar la invocación duplicada al final de la página para que el footer global de `App.jsx` tome el control.
4. **`src/features/legal/LegalPage.jsx`:**
   - Actualizar la dirección de domicilio operativo en la cláusula 1 a "Calle Los Álamos N° 140, Obrajes, La Paz, Bolivia." para mantener coherencia jurídica total.
5. **`tasks.json` y `progress/TASK-089.md`:**
   - Registro y control según el protocolo de gobernanza.

---

## Verificación de Calidad
- ESLint: 0 errores y 0 warnings en todos los archivos modificados.
- Build de producción: `npm run build` con código de salida 0.
- Validación en navegador con `chrome-devtools-mcp`: verificar la presencia y renderizado del Footer en Home (`/`), Academy (`/academy`), Services (`/services`), y verificar que al hacer clic en el logo regrese al hero de Home con scroll suave.

# Implementation Plan — Scroll to Top en Navegación, Isotipo Oficial en LegalPage, Alto Contraste en Botón de Contacto y Calibración Fina de Crossfade

## 1. Contexto y Objetivos
1. **Restablecimiento de Scroll a Cabecera (Scroll to Top):**
   Al navegar a cualquier página independiente (Servicios, Academy, Legalidad, etc.) desde enlaces situados en zonas inferiores o footers, el navegador preservaba la posición vertical previa, haciendo que el usuario apareciera al fondo de la nueva pantalla. Se debe garantizar que toda navegación entre páginas inicie siempre en la parte superior (`top: 0`).
2. **Sustitución de Ícono por Isotipo Oficial de la Hoja:**
   En el pie del documento legal (`LegalPage.jsx`), sustituir el ícono de edificio (`Building2`) junto a "SERAM S.R.L." por el isotipo oficial de SERAM (`/assets/brand/ícono_logo.png`) de manera sobria, estática y formal.
3. **Alto Contraste en Hover/Touch del Botón de Contacto:**
   En el botón `consultoraseram@gmail.com · Abrir Contacto`, aplicar un cambio drástico de contraste visual en `hover` (escritorio) y `active` (mobile), mutando a fondo sólido esmeralda vibrante `#00e03c` con texto e íconos oscuros `#010409`.
4. **Calibración Fina del Crossfade Simultáneo:**
   Ajustar unas milésimas la duración (`0.32s` -> `0.40s`) y curva de aceleración para lograr un desvanecimiento más sedoso y orgánico, sin ralentizar la respuesta táctil.
5. **Mantener Entorno Local Activo:**
   Confirmar ejecución de servidor de desarrollo en `http://localhost:5173/` y build limpio.

---

## 2. Archivos Afectados
1. `src/components/shared/ScrollToTop.jsx` (Nuevo componente de escucha de rutas y control de scroll).
2. `src/App.jsx` (Montaje de `ScrollToTop` y unificación de clave de ruta para pestañas legales).
3. `src/features/legal/LegalPage.jsx` (Isotipo de la hojita, alto contraste en botón de contacto y calibración de crossfade).
4. `src/features/academy/CoursePlayerPage.jsx` (Calibración fina de crossfade a 0.40s).
5. `src/features/academy/AcademyPage.jsx` (Calibración fina de crossfade a 0.40s).
6. `src/features/shop/ShopPage.jsx` (Calibración fina de crossfade a 0.40s).
7. `src/features/partner-portal/ActivitiesAndClientsModule.jsx` (Calibración fina de crossfade a 0.40s).

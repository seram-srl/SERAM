# Implementation Plan - Legal, Privacidad, Cookies, Confidencialidad y Accesibilidad SERAM

## 1. Contexto y Objetivos
Implementar la infraestructura legal, de privacidad, de cookies y accesibilidad para la plataforma web de SERAM conforme a las leyes de Bolivia (CPE Art. 21/130, Ley 164, Ley 1333, Ley 1182 Escazú, Ley 453 de Consumo):
1. **Páginas Legales:**
   - `/privacidad` (`PrivacyPolicyPage.jsx`): Política de Privacidad, Derechos ARCO y Cláusula de Confidencialidad Técnica / Secreto Industrial (Escazú y Ley 1333).
   - `/terminos` (`TermsOfServicePage.jsx`): Términos de Servicio, descargo de responsabilidad para diagnósticos online y propiedad intelectual.
   - `/cookies` (`CookiePolicyPage.jsx`): Transparencia de almacenamiento técnico esencial vs analíticas.
   - `/reembolsos` (`RefundPolicyPage.jsx`): Política de devoluciones conforme a la Ley 453 para productos digitales y servicios.
2. **Banner de Cookies Neuform (`CookieBanner.jsx`):**
   - Aviso informativo flotante con persistencia en localStorage para no molestar tras aceptar.
3. **Formularios con Consentimiento Obligatorio y Mayoría de Edad (+18):**
   - `ContactPage.jsx` y `QuotePage.jsx` incorporando checkbox obligatorio: *"Soy mayor de 18 años y acepto la Política de Privacidad, Términos y Condiciones y el Acuerdo de Confidencialidad Técnica de SERAM."*
   - Accesibilidad por teclado (eliminando `cursor-none` en inputs y añadiendo `focus:ring-2 focus:ring-[#00e03c]`, labels accesibles).
4. **Datos del Negocio:**
   - Mostrar únicamente la dirección física: *"Calle Presbítero Medina N° 2026, Sopocachi, La Paz, Bolivia"* sin publicar NIT o datos en tramitación.
   - Enlazar rutas legales en el Footer y Menú Fullscreen.
5. **Auditoría de Reseñas y Veracidad:**
   - Eliminar comentarios simulados en `CoursePlayerPage.jsx`.
   - Reemplazar métricas de alumnos estáticas en catálogo por datos de modalidad verificables.
   - Mejorar textos alternativos (`alt`) en imágenes clave de `HomePage.jsx`.

## 2. Archivos Afectados
1. `src/features/legal/LegalPage.jsx` (Componente unificado con pestañas y subrutas para Privacidad, Términos, Cookies y Reembolsos).
2. `src/components/ui/CookieBanner.jsx` (Banner flotante Neuform).
3. `src/App.jsx` (Rutas `/privacidad`, `/terminos`, `/cookies`, `/reembolsos` y montaje de `CookieBanner`).
4. `src/features/contact/ContactPage.jsx` (Consentimiento +18 y accesibilidad con teclado).
5. `src/features/services/QuotePage.jsx` (Consentimiento +18 y accesibilidad con teclado).
6. `src/features/home/HomePage.jsx` (Footer con enlaces legales, dirección física y alts de imágenes).
7. `src/features/academy/CoursePlayerPage.jsx` (Limpieza de comentario simulado).
8. `src/context/AppContext.jsx` (Ajuste veraz de métricas de cursos).

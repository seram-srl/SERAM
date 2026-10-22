# Plan de Implementación Integral — TASK-096 & TASK-097

## Contexto y Diagnóstico
1. **Oficina Virtual en Resumen Ejecutivo**:
   - Se removió el bloque `<VirtualOfficeView ... />` de `OverviewModule` en `PartnerDashboard.jsx`.
   - Sin embargo, debido a que no se realizó el commit ni el push al repositorio remoto de GitHub (`origin/main`), la versión desplegada en producción (Vercel) y las sesiones remotas continuaban mostrando la versión anterior con la oficina virtual embebida.
   - Adicionalmente, en la tarjeta de equipo directivo dentro de `OverviewModule`, se saneará cualquier residuo de etiquetas o enlaces ambiguos hacia la maqueta para que la pestaña sea 100% ejecutiva, limpia y de mínimo peso de cómputo.

2. **Estandarización del Logotipo Oficial en Todo el Proyecto**:
   - Siguiendo el manual oficial de marca (`BRANDING_AND_DESIGN_SYSTEM.md`, `.agents/skills/brand-guidelines/SKILL.md` y `03_DOCUMENTOS/02-diseno/Logo SERAM.md`), los assets canónicos definitivos son:
     - **Dark Mode (Fondo Oscuro):** `/assets/brand/logo-seram-white.webp` (y fallback `.png`).
     - **Light Mode (Fondo Claro/Documental):** `/assets/brand/logo-seram-dark.webp`.
     - **Isotipo / Icono Aislado:** `/assets/brand/logo-seram-icon.png` (512x512 px transparente).
   - Existen componentes que aún utilizan iconos genéricos (`<Shield>`), texto plano o rutas no estándar con tilde (`/assets/brand/ícono_logo.png`) que presentan riesgo de codificación en servidores web.

---

## Matriz de Medición y Auditoría de Archivos

| Componente / Archivo | Ubicación | Estado Anterior | Estado Deseado (Último Logo) |
|---|---|---|---|
| `Navbar.jsx` | Cabecera Global | Oculto en móvil en `/dashboard` (`hidden sm:flex`) | Visible y adaptativo en todos los viewports |
| `PartnerDashboard.jsx` | Sidebar Desktop | Icono genérico `<Shield>` | Isotipo oficial `/assets/brand/logo-seram-icon.png` |
| `PartnerDashboard.jsx` | Mobile Drawer | Icono genérico `<Shield>` | Isotipo oficial `/assets/brand/logo-seram-icon.png` |
| `LoginPage.jsx` | Formulario Auth | Sin logo gráfico (solo badge de texto) | Imagotipo `/assets/brand/logo-seram-white.webp` |
| `RegisterPage.jsx` | Formulario Registro | Sin logo gráfico (solo badge de texto) | Imagotipo `/assets/brand/logo-seram-white.webp` |
| `LoadingScreen.jsx` | Overlay Drei/Three.js | Texto tipográfico plano `SER A M` | Imagotipo `/assets/brand/logo-seram-white.webp` con glow |
| `PartnerModal.jsx` | Modal Secreto Socios | Icono genérico `<Shield>` | Isotipo oficial `/assets/brand/logo-seram-icon.png` con glow |
| `ChatbotFAB.jsx` | Bot Avatar & Header | Ruta con tilde `/assets/brand/ícono_logo.png` | Ruta estándar `/assets/brand/logo-seram-icon.png` |
| `EcosystemNucleus.jsx` | Partículas Fondo | Ruta con tilde `/assets/brand/ícono_logo.png` | Ruta estándar `/assets/brand/logo-seram-icon.png` |
| `PartnerProfileRPGModule.jsx` | Avatar Socio Default | Ruta con tilde `/assets/brand/ícono_logo.png` | Ruta estándar `/assets/brand/logo-seram-icon.png` |
| `ServicesPage.jsx` | Metadatos SEO Schema | `/assets/brand/logo.png` (ruta obsoleta) | `/assets/brand/logo-seram-white.png` |
| `index.html` | Meta Tags & Favicon | Favicon presente, faltan metas OG/Twitter | Metas `og:image` y `twitter:image` canónicos |

---

## Pasos de Ejecución
1. **Validar y Saneamiento de `PartnerDashboard.jsx`**:
   - Confirmar eliminación total de la oficina virtual en `OverviewModule`.
   - Reemplazar iconos `<Shield>` en Sidebar y Mobile Drawer por el Isotipo Oficial.
2. **Actualizar `Navbar.jsx`**:
   - Ajustar para que en `/dashboard` se muestre de forma compacta y responsive sin colisionar con los controles.
3. **Actualizar `LoginPage.jsx` y `RegisterPage.jsx`**:
   - Incorporar el imagotipo oficial en la cabecera de las tarjetas de autenticación.
4. **Actualizar `LoadingScreen.jsx` y `PartnerModal.jsx`**:
   - Incorporar el imagotipo/isotipo oficial con estética Neuform y drop-shadow esmeralda.
5. **Estandarizar Rutas de Isotipo en `ChatbotFAB.jsx`, `EcosystemNucleus.jsx` y `PartnerProfileRPGModule.jsx`**:
   - Reemplazar `ícono_logo.png` por `logo-seram-icon.png`.
6. **Verificar Metadatos en `index.html` y `ServicesPage.jsx`**.
7. **Auditoría con ESLint y Build de Producción (`npm run build`)**.
8. **Commit y Push Git Atómico** para que los cambios se desplieguen inmediatamente en producción (Vercel/GitHub).

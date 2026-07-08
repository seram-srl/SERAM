---
name: brand-guidelines
description: Directrices del Sistema de Diseño Neuform y Memoria de Marca de SERAM (Colores, Contrastes y Layouts)
---

# Memoria de Marca y Sistema de Diseño SERAM (Neuform)

Este documento define la identidad visual, contrastes, paleta de colores y patrones de diseño interactivos para la plataforma **SERAM**. Cualquier agente o desarrollador que modifique o cree componentes en esta plataforma debe cumplir estrictamente estas reglas.

---

## 🎨 Paleta de Colores Oficial

La composición de color sigue la regla técnica **60:30:10** para garantizar equilibrio y contraste:

1. **Verde Vívido (`#029907`) [10% - Acentos]**:
   - Utilizado exclusivamente para acentos de alta visibilidad, indicadores de estado activos (como el punto de "En línea"), micro-animaciones dinámicas y acentos secundarios que requieran guiar la atención del usuario.
2. **Verde Oscuro (`#126c0f`) [30% - Estructura y Contenido]**:
   - Utilizado para:
     * Botones principales (fondos sólidos con texto blanco).
     * Bordes de tarjetas glassmorphic claras (`#126c0f/20` o `#126c0f/45` en hover).
     * Texto principal y títulos dentro de tarjetas claras para garantizar un contraste perfecto y legibilidad AAA.
3. **Blanco y Negro [60% - Fondos y Contraste]**:
   - **Negro / Slate Oscuro (`#010409` / `#020617`)**: Utilizado para fondos cinemáticos generales en páginas de alto impacto (Hero, Monitor de Servicios, Tienda).
   - **Blanco / Off-White (`#ffffff` / `#f8fafc`)**: Utilizado como fondo por defecto en páginas densas de lectura (como artículos de Academia y detalles de trámites), y como base translúcida para las tarjetas glassmorphic.

---

## 📐 Estructura de Tarjetas y Componentes

### 1. Tarjetas Estilo "Neuform" (Glassmorphic Claras)
Las tarjetas del sitio (como `.neuform-card` o las tarjetas de la página de inicio) deben tener un aspecto blanco translúcido con desenfoque de fondo para contrastar fuertemente sobre el fondo cinemático oscuro:
* **Fondo**: Blanco con opacidad translúcida (`bg-white/10` o `bg-white/12`).
* **Borde**: Verde oscuro con opacidad controlada (`border-[#126c0f]/20` o `border-[#126c0f]/30`). Al hacer hover, se incrementa la opacidad (`hover:border-[#126c0f]/50`).
* **Desenfoque de Fondo**: `backdrop-blur-xl` o `backdrop-blur-2xl`.
* **Texto interior**: Todo el texto contenido dentro de estas tarjetas claras debe ser **Verde Oscuro (`text-[#126c0f]`)** o gris ultra oscuro para garantizar la legibilidad y el contraste AAA.

### 2. Botones de las Tarjetas Claras
* **Fondo**: Verde oscuro sólido (`bg-[#126c0f]`).
* **Texto**: Blanco puro (`text-white`) en negrita de alta intensidad.
* **Hover**: Efectos sutiles de aclarado o transiciones hacia el verde vívido o blanco.

---

## 🎯 Directrices de Accesibilidad y Contraste (AAA)

* **Nunca** uses texto blanco o verde vívido claro sobre fondo blanco translúcido o claro.
* **Siempre** verifica que el texto de lectura de Academia, formularios o descripciones tenga un ratio de contraste adecuado.
* El **Asistente SERAM (Chatbot)** sirve como referencia para la cabecera limpia, los iconos de 40px unificados y los layouts de navegación superior.

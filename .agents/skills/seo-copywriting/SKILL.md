---
name: seo-copywriting
description: "Guidelines and checklists for technical SEO optimization, dynamic meta-tags, and conversion-focused copywriting in React + Vite applications."
---

# SEO and Copywriting Mastery Skill

This skill provides the principles, checklists, and implementation specifications to ensure that SERAM is discoverable by search engines and conversion-optimized through persuasive copywriting.

---

## 📋 1. Technical SEO Checklist (Vite + React)

Vite SPAs (Single Page Applications) require explicit setup to be indexed properly by search engine crawlers (Googlebot, Bingbot).

### A. Meta Management (Dynamic & Static)
*   **Dynamic Document Head**: Use `react-helmet-async` to manage page-specific head elements dynamically.
*   **Title Tag**: Must be 50-60 characters, containing primary keywords and brand (e.g., `Servicios Ambientales en Bolivia | SERAM`).
*   **Meta Description**: Must be 120-160 characters. Clear, action-oriented summary of the page (e.g., `Evita multas y clausuras. Gestionamos tu Registro Ambiental Industrial (RAI) y Licencias Ambientales (FNCA) en Bolivia con blindaje legal garantizado.`).
*   **Open Graph (OG) & Twitter Cards**: Define `og:title`, `og:description`, `og:image`, `og:url`, and `og:type` to maximize social media click-through rates.

### B. Indexability & Navigation
*   **Semantic HTML**: Ensure each page has exactly one `<h1>`. Use `<section>`, `<article>`, `<aside>`, `<header>`, and `<footer>` appropriately.
*   **Crawlable Links**: Use standard `<a href="...">` or `react-router-dom` `<Link to="...">`. Avoid triggering page transitions exclusively via custom JS click handlers without a valid `href`.
*   **Image Optimization**: Always provide descriptive `alt` text for images. Use modern formats like `.webp` or `.svg`. Define width/height to avoid Layout Shifts (CLS).
*   **Robots.txt & Sitemap**:
    *   Maintain a static or dynamically generated `robots.txt` allowing crawl access to public routes.
    *   Maintain a `sitemap.xml` pointing to all indexable paths (`/`, `/services`, `/academy`, `/contact`, etc.).

### C. Structured Data (Schema.org JSON-LD)
Embed JSON-LD schemas to help search engines understand entities and generate rich snippets:
*   **Organization**: General brand information, logo, contact points, and social profiles.
*   **Service**: Specific schemas for RAI, FNCA, EMAP, and SIG services.
*   **Course / EducationalOrganization**: For SERAM Academy courses.

---

## ✍️ 2. Persuasive Copywriting Frameworks

SERAM's tone of voice must remain **authoritative, premium, scientific, yet direct and conversion-focused**.

### A. Core Frameworks
*   **PAS (Problem - Agitate - Solution)**:
    *   *Problem*: Identify the customer's regulatory pain point (e.g., threat of heavy fines/clausuras).
    *   *Agitate*: Emphasize the consequences (e.g., legal issues, stopped production, lost revenue).
    *   *Solution*: Introduce SERAM's service as the ultimate shield.
*   **AIDA (Attention - Interest - Desire - Action)**:
    *   *Attention*: Hook with a powerful, high-contrast headline.
    *   *Interest*: Highlight statistical data or regulatory realities.
    *   *Desire*: Offer benefits (peace of mind, speed of approval, legal protection).
    *   *Action*: Clear, low-friction, uppercase Call-to-Action (CTA).

### B. Tone and Spacing Rules
*   Use short paragraphs (2-3 sentences max) to improve readability.
*   Mix bold highlights (`**bold**`) strategically to guide the user's eye.
*   Avoid general placeholders; use concrete terms (e.g., "Bolivia", "Licencia FNCA", "Categoría 3 y 4").

---

## ⚙️ 3. Implementation Code Reference

### Meta Tag Component Setup
```jsx
// src/components/ui/SEO.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, ogImage, ogUrl }) {
  const defaultTitle = "SERAM | Servicios Ambientales, Consultoría y Capacitación de Élite";
  const defaultDesc = "Evita multas y paralizaciones. Consultoría ambiental, licencias FNCA, RAI, EMAP y Sistemas de Información Geográfica (SIG) de alta precisión.";
  
  return (
    <Helmet>
      <title>{title ? `${title} | SERAM` : defaultTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
```

### JSON-LD Service Schema Example
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Registro Ambiental Industrial (RAI)",
  "provider": {
    "@type": "LocalBusiness",
    "name": "SERAM",
    "image": "https://seram.bo/assets/brand/logo.png"
  },
  "areaServed": "BO",
  "description": "Evita clausuras y multas. Gestionamos tu Registro Ambiental Industrial (RAI) y la categorización industrial obligatoria."
}
</script>
```

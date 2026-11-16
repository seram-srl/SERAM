import { useEffect } from 'react';

/**
 * Custom hook for comprehensive Technical and Content SEO in SERAM.
 * Injects and manages title, canonical URL, robots, Open Graph, Twitter Cards,
 * and Schema.org JSON-LD structured data with brand-guarding and unmount cleanup.
 *
 * @param {Object} options
 * @param {string} [options.title] - Page title (recommended <= 60 chars)
 * @param {string} [options.description] - Meta description (recommended 120-160 chars)
 * @param {string} [options.keywords] - Comma-separated keywords
 * @param {string} [options.canonicalUrl] - Absolute canonical URL (e.g. 'https://seram.bo/services')
 * @param {string} [options.ogImage] - Open Graph / Twitter image URL
 * @param {string} [options.ogType='website'] - Open Graph type
 * @param {string} [options.twitterCard='summary_large_image'] - Twitter card type
 * @param {string} [options.robots='index, follow'] - Robots directive
 * @param {Object} [options.jsonLd] - Schema.org JSON-LD object
 */
export function useSeramSeo({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  robots = 'index, follow',
  jsonLd
} = {}) {
  useEffect(() => {
    // 1. Brand-guard title formulation
    let fullTitle = 'SERAM | Servicios Ambientales, Consultoría y Capacitación';
    if (title && title.trim()) {
      const trimmed = title.trim();
      if (/seram/i.test(trimmed)) {
        fullTitle = trimmed;
      } else {
        fullTitle = `${trimmed} | SERAM`;
      }
    }
    const previousTitle = document.title;
    document.title = fullTitle;

    // Helper: set or update <meta> tag
    const setMeta = (attrName, attrVal, content) => {
      if (content === undefined || content === null) return null;
      let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      let created = false;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrVal);
        document.head.appendChild(tag);
        created = true;
      }
      tag.setAttribute('content', content);
      return { tag, created, attrName, attrVal };
    };

    // Helper: set or update <link rel="...">
    const setLink = (rel, href) => {
      if (!href) return null;
      let link = document.querySelector(`link[rel="${rel}"]`);
      let created = false;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
        created = true;
      }
      link.setAttribute('href', href);
      return { link, created, rel };
    };

    // Set standard meta
    if (description) setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);
    if (robots) setMeta('name', 'robots', robots);

    // Set Canonical link
    if (canonicalUrl) {
      setLink('canonical', canonicalUrl);
    }

    // Set Open Graph tags
    setMeta('property', 'og:title', fullTitle);
    if (description) setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    if (canonicalUrl) setMeta('property', 'og:url', canonicalUrl);
    if (ogImage) {
      const fullOgImage = ogImage.startsWith('http') ? ogImage : `https://seram.bo${ogImage}`;
      setMeta('property', 'og:image', fullOgImage);
    }

    // Set Twitter Card tags
    setMeta('name', 'twitter:card', twitterCard);
    setMeta('name', 'twitter:title', fullTitle);
    if (description) setMeta('name', 'twitter:description', description);
    if (ogImage) {
      const fullTwitterImage = ogImage.startsWith('http') ? ogImage : `https://seram.bo${ogImage}`;
      setMeta('name', 'twitter:image', fullTwitterImage);
    }

    // Set Schema.org JSON-LD
    let scriptTag = document.getElementById('seram-dynamic-jsonld');
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seram-dynamic-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }

    // Unmount cleanup: Restore document title and cleanup route-specific tags
    return () => {
      document.title = previousTitle || 'SERAM | Servicios Ambientales, Consultoría y Capacitación';
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
      // If a dynamic canonical was added specifically for this page, remove it
      if (canonicalUrl) {
        const canTag = document.querySelector('link[rel="canonical"]');
        if (canTag && canTag.parentNode) {
          canTag.parentNode.removeChild(canTag);
        }
      }
    };
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType,
    twitterCard,
    robots,
    jsonLd
  ]);
}

export default useSeramSeo;

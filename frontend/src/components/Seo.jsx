import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  absoluteUrl,
  DEFAULT_KEYWORDS,
  defaultDescription,
  getSiteUrl,
  SITE_NAME,
} from '../lib/seo';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Per-page SEO: title, description, Open Graph, Twitter, canonical, JSON-LD.
 */
export default function Seo({
  title,
  description,
  path,
  image = '/logo.jpg',
  type = 'website',
  noindex = false,
  keywords,
  jsonLd,
}) {
  const location = useLocation();
  const pathname = path || location.pathname || '/';
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Catholic School in Butare`;
  const desc = description || defaultDescription();
  const canonical = absoluteUrl(pathname);
  const imageUrl = absoluteUrl(image);
  const siteUrl = getSiteUrl();

  useEffect(() => {
    document.title = fullTitle;
    document.documentElement.lang = 'en';

    upsertMeta('name', 'description', desc);
    upsertMeta('name', 'keywords', keywords || DEFAULT_KEYWORDS);
    upsertMeta('name', 'author', SITE_NAME);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    upsertMeta('name', 'googlebot', noindex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:locale', 'en_RW');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', imageUrl);

    upsertLink('canonical', canonical);

    const orgLd = {
      '@context': 'https://schema.org',
      '@type': 'CatholicSchool',
      name: SITE_NAME,
      alternateName: ['Centre Scolaire Elena Guerra', 'C.S ELENA GUERRA', 'Elena Guerra Butare'],
      url: siteUrl,
      logo: absoluteUrl('/logo.jpg'),
      image: imageUrl,
      description: desc,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Butare',
        addressRegion: 'Huye',
        addressCountry: 'RW',
        streetAddress: 'Taba village, Butare cell, Ngoma sector',
      },
      areaServed: 'Huye District, Rwanda',
      motto: 'Esprit, garde-nous dans ton amour',
    };

    upsertJsonLd('seo-org-ld', orgLd);
    upsertJsonLd('seo-page-ld', jsonLd || null);

    return undefined;
  }, [
    fullTitle,
    desc,
    canonical,
    imageUrl,
    type,
    noindex,
    keywords,
    siteUrl,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(jsonLd),
  ]);

  return null;
}

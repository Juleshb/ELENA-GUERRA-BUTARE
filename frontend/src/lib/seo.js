/** Site-wide SEO defaults for C.S Elena Guerra */

import { mediaUrl } from './apiConfig';

export const SITE_NAME = 'C.S Elena Guerra Butare';
export const SITE_TAGLINE = 'Faith, knowledge, and character in Huye, Rwanda';
export const SITE_MOTTO = 'Esprit, garde-nous dans ton amour';

export function getSiteUrl() {
  const fromEnv = (import.meta.env.VITE_SITE_URL || '').trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://www.cselenaguerrahuye.ac.rw';
}

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return getSiteUrl();
  if (path.startsWith('http')) return path;
  const resolved = mediaUrl(path);
  if (resolved.startsWith('http')) return resolved;
  const base = getSiteUrl();
  return `${base}${resolved.startsWith('/') ? resolved : `/${resolved}`}`;
}

export function defaultDescription(extra = '') {
  const base =
    'C.S Elena Guerra (Centre Scolaire Elena Guerra) is a Catholic private school in Butare, Huye District, Rwanda — Nursery, Primary, and Ordinary Level education rooted in the charism of Saint Elena Guerra.';
  return extra ? `${extra} ${base}` : base;
}

export const DEFAULT_KEYWORDS = [
  'C.S Elena Guerra',
  'Centre Scolaire Elena Guerra',
  'Elena Guerra Butare',
  'Catholic school Huye',
  'Catholic school Rwanda',
  'school Butare',
  'primary school Huye',
  'secondary school Huye',
  'Oblates of the Holy Spirit',
  'admissions Elena Guerra',
].join(', ');

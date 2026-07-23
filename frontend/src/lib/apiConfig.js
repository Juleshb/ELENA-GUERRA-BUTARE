/**
 * API base URL for production / local.
 * - Leave empty (default) to use same origin `/api` — when Nginx proxies
 *   /api, /uploads, and /socket.io to the Node backend.
 * - Set VITE_API_URL to the backend origin when frontend and API are on
 *   different hosts, e.g. https://cselenaguerra.site
 */
const raw = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

export const API_ORIGIN = raw;
export const API_BASE = raw ? `${raw}/api` : '/api';
export const UPLOADS_BASE = raw ? `${raw}/uploads` : '/uploads';

export function apiUrl(path = '') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('/api')) {
    return raw ? `${raw}${normalized}` : normalized;
  }
  return `${API_BASE}${normalized}`;
}

/**
 * Resolve media / document paths stored in the DB (usually `/uploads/...`)
 * to a URL the browser can load when the API is on another origin.
 *
 * Also rewrites absolute URLs that point at /uploads on the wrong host
 * (e.g. the Vercel frontend), which otherwise open as the SPA home page.
 */
export function mediaUrl(url) {
  if (url == null) return url;
  const value = String(url).trim();
  if (!value) return value;
  if (/^(data:|blob:)/i.test(value)) return value;

  let pathname = value;
  let search = '';

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      pathname = parsed.pathname;
      search = parsed.search || '';
      // Non-upload absolute URLs (external images, etc.) stay as-is
      if (!pathname.startsWith('/uploads')) return value;
    } catch {
      return value;
    }
  } else {
    pathname = value.startsWith('/') ? value : `/${value}`;
  }

  if (!pathname.startsWith('/uploads')) return pathname + search;

  return raw ? `${raw}${pathname}${search}` : `${pathname}${search}`;
}

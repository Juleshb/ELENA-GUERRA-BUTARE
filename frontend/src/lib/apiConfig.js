/**
 * API base URL for production / local.
 * - Leave empty (default) to use same origin `/api` — recommended when Nginx
 *   proxies /api, /uploads, and /socket.io to the Node backend.
 * - Or set VITE_API_URL to a full backend origin, e.g. https://cselenaguerra.site
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

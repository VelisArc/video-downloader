const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function normalizeApiBase(base: string) {
  if (!base) return '/api';

  try {
    const url = new URL(base);
    const path = url.pathname.replace(/\/+$/, '');
    url.pathname = path.endsWith('/api') ? path : `${path === '' ? '' : path}/api`;
    return url.toString().replace(/\/+$/, '');
  } catch {
    return base.endsWith('/api') ? base : `${base}/api`;
  }
}

export const API_BASE = normalizeApiBase(BASE);

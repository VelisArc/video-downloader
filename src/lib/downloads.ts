export type DownloadType = 'video' | 'audio';

export interface DownloadQuota {
  plan?: string;
  unlimited?: boolean;
  dailyLimit?: number;
  remaining?: number | null;
}

export interface CookieVaultItem {
  id: string;
  label: string;
  platform: string;
  domains: string[];
  expiresAtEpoch?: number | null;
  updatedAtEpoch?: number | null;
  createdAtEpoch?: number | null;
  lastUsedAtEpoch?: number | null;
  expired?: boolean;
}

export interface CookieVaultState {
  requiresLogin?: boolean;
  canUseCookies?: boolean;
  plan?: string;
  hasCookies: boolean;
  items: CookieVaultItem[];
  totalCount: number;
  activeCount: number;
  expiredCount: number;
  maxCount?: number | null;
  remainingSlots?: number | null;
}

export interface DownloadHistoryItem {
  id: string;
  thumbnail: string;
  title: string;
  downloadUrl: string;
  ext: string;
  date: string;
  type: DownloadType;
  uploader?: string;
  duration?: string;
  view_count?: string;
  quota?: DownloadQuota;
  platform?: string;
  cookieMatch?: CookieVaultItem | null;
}

export const STORAGE_KEYS = {
  clientId: 'clientId',
  downloadHistory: 'downloadHistory',
};

export function getOrCreateClientId() {
  const existing = localStorage.getItem(STORAGE_KEYS.clientId);
  if (existing) return existing;

  const next = `user_${Math.random().toString(36).slice(2, 14)}`;
  localStorage.setItem(STORAGE_KEYS.clientId, next);
  return next;
}

export function loadDownloadHistory(): DownloadHistoryItem[] {
  const raw = localStorage.getItem(STORAGE_KEYS.downloadHistory);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean).slice(0, 10);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.downloadHistory);
    return [];
  }
}

export function saveDownloadHistory(history: DownloadHistoryItem[]) {
  localStorage.setItem(
    STORAGE_KEYS.downloadHistory,
    JSON.stringify(history.slice(0, 10)),
  );
}

export function isSupportedUrl(value: string) {
  try {
    const parsed = new URL(normalizeUrl(value));
    return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string) {
  return value.trim();
}

export function sanitizeFilename(name: string) {
  return (
    name
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 100) || 'download'
  );
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

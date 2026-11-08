import { Hono } from 'hono';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import type { Env } from '../worker-configuration';

type Bindings = Env;
type AppContext = { Bindings: Bindings };
type AppCtx = Context<AppContext>;

const app = new Hono<AppContext>();

/* -------------------------------------------------------------------------- */
/*  Generic helpers                                                           */
/* -------------------------------------------------------------------------- */

const DAY_MS = 24 * 60 * 60 * 1000;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function intEnv(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getClientIp(c: AppCtx): string {
  // Cloudflare sets CF-Connecting-IP and clients cannot spoof it.
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    (c.req.header('x-forwarded-for') || '').split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlDecodeToString(input: string): string {
  return new TextDecoder().decode(base64UrlDecode(input));
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs = 20000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------------------------------------------------------- */
/*  CORS                                                                      */
/* -------------------------------------------------------------------------- */

app.use('*', async (c, next) => {
  const allowed = (c.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const origin = c.req.header('origin') || '';

  let allowOrigin = '*';
  if (allowed.length > 0) {
    allowOrigin = allowed.includes(origin) ? origin : allowed[0];
  }

  c.header('Access-Control-Allow-Origin', allowOrigin);
  c.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Razorpay-Signature');
  c.header('Access-Control-Max-Age', '86400');
  c.header('Vary', 'Origin');

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
});

app.onError((error, c) => {
  console.error('Unhandled worker error:', error);
  return c.json({ error: 'Internal server error' }, 500);
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

/* -------------------------------------------------------------------------- */
/*  Firebase service account + Google OAuth (Web Crypto, Worker-compatible)   */
/* -------------------------------------------------------------------------- */

type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function parseServiceAccount(env: Env): ServiceAccount | null {
  let raw = (env.FIREBASE_ADMIN_JSON || '').trim();
  if (!raw && env.FIREBASE_ADMIN_JSON_B64) {
    try {
      raw = atob(env.FIREBASE_ADMIN_JSON_B64.trim());
    } catch {
      return null;
    }
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const projectId = String(parsed.project_id || '');
    const clientEmail = String(parsed.client_email || '');
    const privateKey = String(parsed.private_key || '');
    if (!projectId || !clientEmail || !privateKey) return null;
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
  } catch {
    return null;
  }
}

let serviceAccountCache: { key: string; value: ServiceAccount | null } | null = null;

function getServiceAccount(env: Env): ServiceAccount | null {
  const cacheKey = `${env.FIREBASE_ADMIN_JSON ? 'json' : ''}:${env.FIREBASE_ADMIN_JSON_B64 ? 'b64' : ''}`;
  if (serviceAccountCache && serviceAccountCache.key === cacheKey) {
    return serviceAccountCache.value;
  }
  const value = parseServiceAccount(env);
  serviceAccountCache = { key: cacheKey, value };
  return value;
}

let tokenCache: { email: string; scope: string; token: string; expiresAt: number } | null = null;

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const bytes = Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    bytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function getGoogleAccessToken(env: Env, scope: string): Promise<string | null> {
  const account = getServiceAccount(env);
  if (!account) return null;

  const now = Date.now();
  if (
    tokenCache &&
    tokenCache.email === account.clientEmail &&
    tokenCache.scope === scope &&
    tokenCache.expiresAt > now + 60_000
  ) {
    return tokenCache.token;
  }

  const issuedAt = Math.floor(now / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: account.clientEmail,
      scope,
      aud: 'https://oauth2.googleapis.com/token',
      iat: issuedAt,
      exp: issuedAt + 3600,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const key = await importPrivateKey(account.privateKey);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );
  const assertion = `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;

  const response = await fetchWithTimeout(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }).toString(),
    },
    15000,
  );

  if (!response.ok) {
    console.error('Google OAuth token request failed:', response.status, await response.text());
    return null;
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;

  tokenCache = {
    email: account.clientEmail,
    scope,
    token: data.access_token,
    expiresAt: now + Math.max(60, (data.expires_in || 3600) - 60) * 1000,
  };
  return data.access_token;
}

/* -------------------------------------------------------------------------- */
/*  Firebase ID token verification                                            */
/* -------------------------------------------------------------------------- */

type FirebaseUser = { uid: string; email?: string };

type JwkSet = { keys: Array<JsonWebKey & { kid?: string }> };
let jwksCache: { fetchedAt: number; keys: Map<string, CryptoKey> } | null = null;

async function getFirebasePublicKeys(force = false): Promise<Map<string, CryptoKey>> {
  if (!force && jwksCache && Date.now() - jwksCache.fetchedAt < 55 * 60 * 1000) {
    return jwksCache.keys;
  }

  const response = await fetchWithTimeout(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    { method: 'GET' },
    15000,
  );
  if (!response.ok) throw new Error(`Failed to fetch Firebase public keys (${response.status})`);

  const data = (await response.json()) as JwkSet;
  const keys = new Map<string, CryptoKey>();
  for (const jwk of data.keys || []) {
    if (!jwk.kid || jwk.kty !== 'RSA') continue;
    try {
      const key = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify'],
      );
      keys.set(jwk.kid, key);
    } catch (error) {
      console.warn('Skipping unusable Firebase JWK:', jwk.kid, error);
    }
  }

  jwksCache = { fetchedAt: Date.now(), keys };
  return keys;
}

async function verifyFirebaseToken(env: Env, token: string): Promise<FirebaseUser | null> {
  const account = getServiceAccount(env);
  if (!account) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let header: { alg?: string; kid?: string };
  let payload: {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
  };

  try {
    header = JSON.parse(base64UrlDecodeToString(parts[0]));
    payload = JSON.parse(base64UrlDecodeToString(parts[1]));
  } catch {
    return null;
  }

  if (header.alg !== 'RS256' || !header.kid) return null;

  let keys = await getFirebasePublicKeys();
  let key = keys.get(header.kid);
  if (!key) {
    keys = await getFirebasePublicKeys(true);
    key = keys.get(header.kid);
  }
  if (!key) return null;

  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64UrlDecode(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) return null;

  const now = Math.floor(Date.now() / 1000);
  if (!payload.sub || !payload.exp || payload.exp < now - 60) return null;
  if (payload.iat && payload.iat > now + 300) return null;
  if (payload.aud !== account.projectId) return null;
  if (payload.iss !== `https://securetoken.google.com/${account.projectId}`) return null;

  return { uid: payload.sub, email: payload.email };
}

async function getBearerUser(env: Env, c: AppCtx): Promise<FirebaseUser | null> {
  const header = c.req.header('authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  try {
    return await verifyFirebaseToken(env, token);
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Firestore REST                                                            */
/* -------------------------------------------------------------------------- */

type FirestoreDoc = { id: string; data: Record<string, unknown> };

function firestoreEnabled(env: Env): boolean {
  return Boolean(getServiceAccount(env));
}

function firestoreBase(env: Env): string {
  const account = getServiceAccount(env)!;
  return `https://firestore.googleapis.com/v1/projects/${account.projectId}/databases/(default)/documents`;
}

function encodeFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  }
  if (typeof value === 'object') {
    return { mapValue: { fields: encodeFirestoreFields(value as Record<string, unknown>) } };
  }
  return { nullValue: null };
}

function encodeFirestoreFields(data: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    fields[key] = encodeFirestoreValue(value);
  }
  return fields;
}

function decodeFirestoreValue(value: Record<string, unknown> | undefined): unknown {
  if (!value) return null;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('mapValue' in value) {
    const map = value.mapValue as { fields?: Record<string, Record<string, unknown>> };
    return decodeFirestoreFields(map.fields || {});
  }
  if ('arrayValue' in value) {
    const array = value.arrayValue as { values?: Array<Record<string, unknown>> };
    return (array.values || []).map(decodeFirestoreValue);
  }
  return null;
}

function decodeFirestoreFields(fields: Record<string, Record<string, unknown>>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    data[key] = decodeFirestoreValue(value);
  }
  return data;
}

async function firestoreRequest(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getGoogleAccessToken(env, 'https://www.googleapis.com/auth/datastore');
  if (!token) throw new Error('Firestore authentication is not configured');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetchWithTimeout(`${firestoreBase(env)}/${path}`, { ...init, headers }, 20000);
}

async function firestoreGet(env: Env, path: string): Promise<FirestoreDoc | null> {
  const response = await firestoreRequest(env, path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore GET failed (${response.status})`);
  const data = (await response.json()) as {
    name?: string;
    fields?: Record<string, Record<string, unknown>>;
  };
  return {
    id: (data.name || path).split('/').pop() || '',
    data: decodeFirestoreFields(data.fields || {}),
  };
}

async function firestoreSet(
  env: Env,
  path: string,
  data: Record<string, unknown>,
  merge = true,
): Promise<void> {
  const mask = merge
    ? Object.keys(data)
        .filter((key) => data[key] !== undefined)
        .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
        .join('&')
    : '';
  const response = await firestoreRequest(env, `${path}${mask ? `?${mask}` : ''}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: encodeFirestoreFields(data) }),
  });
  if (!response.ok) {
    throw new Error(`Firestore write failed (${response.status})`);
  }
}

async function firestoreAdd(
  env: Env,
  collectionPath: string,
  data: Record<string, unknown>,
): Promise<string> {
  const response = await firestoreRequest(env, collectionPath, {
    method: 'POST',
    body: JSON.stringify({ fields: encodeFirestoreFields(data) }),
  });
  if (!response.ok) throw new Error(`Firestore add failed (${response.status})`);
  const result = (await response.json()) as { name?: string };
  return (result.name || '').split('/').pop() || '';
}

async function firestoreList(env: Env, collectionPath: string): Promise<FirestoreDoc[]> {
  const response = await firestoreRequest(env, `${collectionPath}?pageSize=100`);
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Firestore list failed (${response.status})`);
  const result = (await response.json()) as {
    documents?: Array<{ name?: string; fields?: Record<string, Record<string, unknown>> }>;
  };
  return (result.documents || []).map((document) => ({
    id: (document.name || '').split('/').pop() || '',
    data: decodeFirestoreFields(document.fields || {}),
  }));
}

async function firestoreDelete(env: Env, path: string): Promise<void> {
  const response = await firestoreRequest(env, path, { method: 'DELETE' });
  if (!response.ok && response.status !== 404) {
    throw new Error(`Firestore delete failed (${response.status})`);
  }
}

async function firestoreIncrement(
  env: Env,
  path: string,
  field: string,
  amount: number,
): Promise<number | null> {
  const account = getServiceAccount(env)!;
  const token = await getGoogleAccessToken(env, 'https://www.googleapis.com/auth/datastore');
  if (!token) throw new Error('Firestore authentication is not configured');

  const documentName = `projects/${account.projectId}/databases/(default)/documents/${path}`;
  const response = await fetchWithTimeout(
    `https://firestore.googleapis.com/v1/projects/${account.projectId}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        writes: [
          {
            transform: {
              document: documentName,
              fieldTransforms: [
                { fieldPath: field, increment: { integerValue: String(amount) } },
              ],
            },
          },
        ],
      }),
    },
    20000,
  );

  if (!response.ok) {
    throw new Error(`Firestore increment failed (${response.status})`);
  }

  const result = (await response.json()) as {
    writeResults?: Array<{ transformResults?: Array<Record<string, unknown>> }>;
  };
  const transformed = result.writeResults?.[0]?.transformResults?.[0];
  if (!transformed) return null;
  const value = decodeFirestoreValue(transformed);
  return typeof value === 'number' ? value : null;
}

/* -------------------------------------------------------------------------- */
/*  Entitlements, plans, quota                                                */
/* -------------------------------------------------------------------------- */

type Plan = 'guest' | 'user' | 'monthly' | 'lifetime';

type Entitlement = {
  plan: Plan;
  unlimited: boolean;
  uid: string | null;
  premiumPlan: 'monthly' | 'lifetime' | null;
  premiumStatus: string;
  purchasedAt: string | null;
  activatedAt: string | null;
  renewedAt: string | null;
  expiresAt: string | null;
  renewsAt: string | null;
  updatedAt: string | null;
  paymentId: string | null;
  orderId: string | null;
  subscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
  dailyLimit: number;
  remaining: number | null;
};

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = Number((value as { seconds?: number }).seconds || 0);
    return new Date(seconds * 1000).toISOString();
  }
  return null;
}

function dailyLimitFor(env: Env, plan: Plan): number {
  switch (plan) {
    case 'lifetime':
      return intEnv(env.LIFETIME_DAILY_LIMIT, 150);
    case 'monthly':
      return intEnv(env.MONTHLY_DAILY_LIMIT, 75);
    case 'user':
      return intEnv(env.USER_DAILY_LIMIT, 3);
    default:
      return intEnv(env.GUEST_DAILY_LIMIT, 1);
  }
}

function normalizeEntitlement(env: Env, data: Record<string, unknown> | null, uid: string | null): Entitlement {
  const raw = data || {};
  const requested = String(raw.plan || (uid ? 'user' : 'guest')).toLowerCase();
  let plan: Plan =
    requested === 'monthly' || requested === 'lifetime' || requested === 'user'
      ? (requested as Plan)
      : uid
        ? 'user'
        : 'guest';

  if (!uid) plan = 'guest';

  const expiresAt = toIsoString(raw.expiresAt);
  let premiumStatus = String(raw.premiumStatus || (plan === 'guest' ? 'guest' : 'inactive'));

  if (plan === 'monthly') {
    if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
      plan = uid ? 'user' : 'guest';
      premiumStatus = expiresAt ? 'expired' : premiumStatus;
    } else {
      premiumStatus = premiumStatus === 'inactive' ? 'active' : premiumStatus;
    }
  }

  if (plan === 'lifetime') {
    premiumStatus = premiumStatus === 'inactive' ? 'active' : premiumStatus;
  }

  const unlimited = plan === 'monthly' || plan === 'lifetime';
  const premiumPlan =
    (raw.premiumPlan as string) === 'monthly' || (raw.premiumPlan as string) === 'lifetime'
      ? (raw.premiumPlan as 'monthly' | 'lifetime')
      : plan === 'monthly' || plan === 'lifetime'
        ? (plan as 'monthly' | 'lifetime')
        : null;

  return {
    plan,
    unlimited,
    uid: uid,
    premiumPlan,
    premiumStatus,
    purchasedAt: toIsoString(raw.purchasedAt) || toIsoString(raw.activatedAt),
    activatedAt: toIsoString(raw.activatedAt),
    renewedAt: toIsoString(raw.renewedAt),
    expiresAt: plan === 'monthly' || plan === 'lifetime' ? expiresAt : expiresAt,
    renewsAt: plan === 'lifetime' ? null : toIsoString(raw.renewsAt) || expiresAt,
    updatedAt: toIsoString(raw.updatedAt),
    paymentId: (raw.paymentId as string) || null,
    orderId: (raw.orderId as string) || null,
    subscriptionId: (raw.subscriptionId as string) || null,
    cancelAtPeriodEnd: Boolean(raw.cancelAtPeriodEnd),
    dailyLimit: dailyLimitFor(env, plan),
    remaining: null,
  };
}

async function loadEntitlement(env: Env, uid: string | null): Promise<Entitlement> {
  if (!uid) return normalizeEntitlement(env, null, null);
  if (!firestoreEnabled(env)) return normalizeEntitlement(env, { plan: 'user' }, uid);

  try {
    const doc = await firestoreGet(env, `entitlements/${encodeURIComponent(uid)}`);
    return normalizeEntitlement(env, doc?.data || { plan: 'user' }, uid);
  } catch (error) {
    console.error('Failed to load entitlement:', error);
    return normalizeEntitlement(env, { plan: 'user' }, uid);
  }
}

const memoryUsage = new Map<string, { date: string; count: number }>();

function usageKey(uid: string | null, c: AppCtx): string {
  return uid ? `user:${uid}:${todayKey()}` : `guest:${getClientIp(c)}:${todayKey()}`;
}

async function readUsage(env: Env, key: string): Promise<number> {
  if (firestoreEnabled(env)) {
    try {
      const doc = await firestoreGet(env, `usage/${encodeURIComponent(key)}`);
      const count = Number(doc?.data.count || 0);
      return Number.isFinite(count) ? count : 0;
    } catch (error) {
      console.error('Failed to read Firestore usage:', error);
    }
  }

  const entry = memoryUsage.get(key);
  return entry && entry.date === todayKey() ? entry.count : 0;
}

async function reserveUsage(
  env: Env,
  key: string,
  limit: number,
): Promise<{ allowed: boolean; remaining: number | null }> {
  if (limit <= 0) return { allowed: true, remaining: null };

  if (firestoreEnabled(env)) {
    try {
      let next = await firestoreIncrement(env, `usage/${key}`, 'count', 1);
      if (next === null) next = await readUsage(env, key) + 1;
      if (next > limit) {
        await firestoreIncrement(env, `usage/${key}`, 'count', -1).catch(() => undefined);
        return { allowed: false, remaining: 0 };
      }
      return { allowed: true, remaining: Math.max(limit - next, 0) };
    } catch (error) {
      console.error('Failed to reserve Firestore usage:', error);
    }
  }

  const today = todayKey();
  const entry = memoryUsage.get(key);
  const current = entry && entry.date === today ? entry.count : 0;
  if (current >= limit) return { allowed: false, remaining: 0 };
  const next = current + 1;
  memoryUsage.set(key, { date: today, count: next });
  return { allowed: true, remaining: Math.max(limit - next, 0) };
}

/* -------------------------------------------------------------------------- */
/*  In-memory rate limit, inflight guard and cache                            */
/* -------------------------------------------------------------------------- */

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(env: Env, ip: string): boolean {
  const limit = intEnv(env.RATE_LIMIT_PER_MIN, 30);
  if (limit <= 0) return true;

  const now = Date.now();
  const windowMs = 60_000;
  const recent = (rateLimitMap.get(ip) || []).filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    rateLimitMap.set(ip, recent);
    return false;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  if (rateLimitMap.size > 5000) {
    for (const [key, timestamps] of rateLimitMap) {
      if (!timestamps.some((time) => now - time < windowMs)) rateLimitMap.delete(key);
    }
  }

  return true;
}

let inflight = 0;

function acquireInflight(env: Env): boolean {
  const max = intEnv(env.MAX_INFLIGHT, 3);
  if (max <= 0) {
    inflight += 1;
    return true;
  }
  if (inflight >= max) return false;
  inflight += 1;
  return true;
}

function releaseInflight(): void {
  if (inflight > 0) inflight -= 1;
}

const infoCache = new Map<string, { timestamp: number; data: Record<string, unknown> }>();

function getCached(env: Env, key: string): Record<string, unknown> | null {
  const item = infoCache.get(key);
  if (!item) return null;
  const ttl = Math.max(intEnv(env.INFO_CACHE_TTL_SEC, 15), 0) * 1000;
  if (ttl === 0 || Date.now() - item.timestamp > ttl) {
    infoCache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key: string, data: Record<string, unknown>): void {
  if (infoCache.size > 500) {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [cacheKey, item] of infoCache) {
      if (item.timestamp < cutoff) infoCache.delete(cacheKey);
    }
  }
  infoCache.set(key, { timestamp: Date.now(), data });
}

/* -------------------------------------------------------------------------- */
/*  URL / media helpers                                                       */
/* -------------------------------------------------------------------------- */

function isPublicHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
    if (!host) return false;
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
      return false;
    }
    // Block obvious private IPv4 ranges without pulling in a dependency.
    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
      const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
      if (
        a === 10 ||
        a === 127 ||
        a === 0 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168)
      ) {
        return false;
      }
    }
    if (host === '[::1]' || host === '::1') return false;
    return true;
  } catch {
    return false;
  }
}

function detectPlatform(host: string): string {
  const normalized = (host || '').toLowerCase();
  const map: Record<string, string[]> = {
    instagram: ['instagram.com', 'cdninstagram.com'],
    facebook: ['facebook.com', 'fb.watch', 'fbcdn.net', 'messenger.com'],
    youtube: ['youtube.com', 'youtu.be', 'googlevideo.com', 'ytimg.com'],
    tiktok: ['tiktok.com', 'tiktokcdn.com'],
    twitter: ['twitter.com', 'x.com', 'twimg.com'],
    reddit: ['reddit.com', 'redd.it', 'redditmedia.com'],
    vimeo: ['vimeo.com', 'vimeocdn.com'],
    dailymotion: ['dailymotion.com', 'dmcdn.net'],
    twitch: ['twitch.tv', 'ttvnw.net'],
    soundcloud: ['soundcloud.com', 'sndcdn.com'],
  };
  for (const [platform, hosts] of Object.entries(map)) {
    if (hosts.some((item) => normalized === item || normalized.endsWith(`.${item}`))) {
      return platform;
    }
  }
  return normalized.split(':')[0] || 'generic';
}

function normalizeMediaUrl(value: string): string {
  try {
    const parsed = new URL(value.trim());
    if (parsed.hostname.includes('instagram.com')) {
      const tracking = new Set([
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'fbclid',
        'igsh',
        'igshid',
      ]);
      for (const key of [...parsed.searchParams.keys()]) {
        if (tracking.has(key.toLowerCase())) parsed.searchParams.delete(key);
      }
    }
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return value.trim();
  }
}

const DIRECT_MEDIA_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v', 'mkv', 'mp3', 'm4a', 'aac', 'ogg', 'wav'];

function directMediaExtension(value: string): string | null {
  try {
    const path = new URL(value).pathname.toLowerCase();
    for (const extension of DIRECT_MEDIA_EXTENSIONS) {
      if (path.endsWith(`.${extension}`)) return extension;
    }
  } catch {
    return null;
  }
  return null;
}

function absoluteUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!isPublicHttpUrl(trimmed)) return null;
  return trimmed;
}

type ExtractionResult = {
  title: string;
  thumbnail: string;
  downloadUrl: string;
  ext: string;
  platform: string;
  uploader: string;
  duration: string;
  view_count: string;
};

async function extractMedia(env: Env, url: string, type: 'video' | 'audio'): Promise<ExtractionResult> {
  const directExt = directMediaExtension(url);
  if (directExt) {
    if (type === 'audio' && !['mp3', 'm4a', 'aac', 'ogg', 'wav'].includes(directExt)) {
      throw new Error('That URL points to a video file, not an audio file.');
    }
    let title = 'download';
    try {
      title = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || 'download');
      title = title.replace(/\.[^.]+$/, '') || 'download';
    } catch {
      // Keep the fallback title.
    }
    return {
      title,
      thumbnail: '',
      downloadUrl: url,
      ext: directExt,
      platform: 'direct',
      uploader: 'Direct link',
      duration: 'Unknown',
      view_count: 'N/A',
    };
  }

  const endpoint = (env.EXTRACTOR_API_URL || '').trim();
  if (!endpoint) {
    throw Object.assign(
      new Error(
        'Video extraction is not configured. Set EXTRACTOR_API_URL on the Worker (or provide a direct media URL).',
      ),
      { status: 501 },
    );
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (env.EXTRACTOR_API_KEY) headers.Authorization = `Bearer ${env.EXTRACTOR_API_KEY}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(
      endpoint,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ url, type }),
      },
      intEnv(env.EXTRACTOR_TIMEOUT_MS, 30000),
    );
  } catch (error) {
    throw Object.assign(new Error('The extraction service could not be reached.'), {
      status: 502,
      cause: error,
    });
  }

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      (typeof payload.error === 'string' && payload.error) ||
      (typeof payload.message === 'string' && payload.message) ||
      `The extraction service returned ${response.status}.`;
    throw Object.assign(new Error(message), { status: response.status >= 400 ? response.status : 502 });
  }

  const downloadUrl = absoluteUrl(payload.downloadUrl || payload.url);
  if (!downloadUrl) {
    throw Object.assign(new Error('The extraction service did not return a usable download URL.'), {
      status: 502,
    });
  }

  const platform = String(payload.platform || detectPlatform(new URL(url).hostname));
  const fallbackExt = type === 'audio' ? 'mp3' : 'mp4';
  const ext = String(payload.ext || directMediaExtension(downloadUrl) || fallbackExt).replace(/^\./, '');

  return {
    title: String(payload.title || 'Untitled').slice(0, 150),
    thumbnail: absoluteUrl(payload.thumbnail) || '',
    downloadUrl,
    ext,
    platform,
    uploader: String(payload.uploader || 'Unknown Author'),
    duration: String(payload.duration || 'Unknown'),
    view_count: String(payload.view_count || 'N/A'),
  };
}

/* -------------------------------------------------------------------------- */
/*  Razorpay REST API                                                         */
/* -------------------------------------------------------------------------- */

function razorpayEnabled(env: Env): boolean {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

async function razorpayRequest(
  env: Env,
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>,
): Promise<Record<string, any>> {
  if (!razorpayEnabled(env)) {
    throw Object.assign(new Error('Razorpay is not configured'), { status: 500 });
  }

  const response = await fetchWithTimeout(
    `https://api.razorpay.com/v1${path}`,
    {
      method,
      headers: {
        Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    },
    25000,
  );

  const payload = (await response.json().catch(() => ({}))) as Record<string, any>;
  if (!response.ok) {
    const message =
      payload?.error?.description || payload?.error?.reason || `Razorpay request failed (${response.status})`;
    throw Object.assign(new Error(message), { status: response.status });
  }
  return payload;
}

function monthlyAmount(env: Env): number {
  return intEnv(env.MONTHLY_AMOUNT, (env.PAYMENT_CURRENCY || 'INR') === 'INR' ? 19900 : 200);
}

function lifetimeAmount(env: Env): number {
  return intEnv(env.LIFETIME_AMOUNT, (env.PAYMENT_CURRENCY || 'INR') === 'INR' ? 99900 : 2000);
}

function paymentCurrency(env: Env): string {
  return (env.PAYMENT_CURRENCY || 'INR').toUpperCase();
}

async function getOrCreateRazorpayCustomer(
  env: Env,
  uid: string,
  email: string | undefined,
): Promise<string | null> {
  if (!email) return null;

  if (firestoreEnabled(env)) {
    try {
      const doc = await firestoreGet(env, `entitlements/${encodeURIComponent(uid)}`);
      const existing = String(doc?.data.razorpayCustomerId || '');
      if (existing) return existing;
    } catch (error) {
      console.warn('Could not read Razorpay customer id:', error);
    }
  }

  const created = await razorpayRequest(env, 'POST', '/customers', {
    name: email.split('@')[0],
    email,
    notes: { uid },
  });
  const customerId = String(created.id || '');
  if (!customerId) return null;

  if (firestoreEnabled(env)) {
    await firestoreSet(env, `entitlements/${encodeURIComponent(uid)}`, {
      razorpayCustomerId: customerId,
      email,
      updatedAt: new Date().toISOString(),
    }).catch((error) => console.warn('Could not save Razorpay customer id:', error));
  }

  return customerId;
}

async function getOrCreateMonthlyPlanId(env: Env): Promise<string> {
  const currency = paymentCurrency(env);
  const amount = monthlyAmount(env);
  const cacheField = `monthlyPlanId_${currency}_${amount}`;

  if (firestoreEnabled(env)) {
    try {
      const doc = await firestoreGet(env, 'config/razorpay');
      const cached = String(doc?.data[cacheField] || doc?.data.monthlyPlanId || '');
      if (cached) return cached;
    } catch (error) {
      console.warn('Could not read cached Razorpay plan:', error);
    }
  }

  const plans = await razorpayRequest(env, 'GET', '/plans?count=100');
  for (const plan of plans.items || []) {
    const item = plan.item || {};
    if (
      String(item.name || '') === 'ShareHub Monthly Unlimited' &&
      Number(item.amount) === amount &&
      String(item.currency || '').toUpperCase() === currency
    ) {
      const planId = String(plan.id || '');
      if (planId) {
        if (firestoreEnabled(env)) {
          await firestoreSet(env, 'config/razorpay', {
            [cacheField]: planId,
            monthlyPlanId: planId,
            updatedAt: new Date().toISOString(),
          }).catch(() => undefined);
        }
        return planId;
      }
    }
  }

  const created = await razorpayRequest(env, 'POST', '/plans', {
    period: 'monthly',
    interval: 1,
    item: {
      name: 'ShareHub Monthly Unlimited',
      description: 'Premium fair-use downloads for 1 month',
      amount,
      currency,
    },
  });
  const planId = String(created.id || '');
  if (!planId) throw new Error('Could not create Razorpay plan');

  if (firestoreEnabled(env)) {
    await firestoreSet(env, 'config/razorpay', {
      [cacheField]: planId,
      monthlyPlanId: planId,
      updatedAt: new Date().toISOString(),
    }).catch(() => undefined);
  }
  return planId;
}

async function saveEntitlement(env: Env, uid: string, data: Record<string, unknown>): Promise<void> {
  if (!firestoreEnabled(env)) return;
  await firestoreSet(env, `entitlements/${encodeURIComponent(uid)}`, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/* -------------------------------------------------------------------------- */
/*  Shared auth requirement helpers                                           */
/* -------------------------------------------------------------------------- */

function authNotConfigured(c: AppCtx) {
  return c.json(
    {
      error: 'Authentication is not configured on this server.',
      authConfigured: false,
    },
    503,
  );
}

function unauthorized(c: AppCtx) {
  return c.json({ error: 'Authentication required. Please sign in again.' }, 401);
}

/* -------------------------------------------------------------------------- */
/*  Routes                                                                    */
/* -------------------------------------------------------------------------- */

function serviceInfo() {
  return {
    service: 'ShareHub API',
    ok: true,
    version: '4.1.0',
    ts: Date.now(),
    message: 'Use POST /api to resolve media links.',
  };
}

app.get('/', (c) => c.json(serviceInfo()));
app.get('/api', (c) => c.json(serviceInfo()));

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    ts: Date.now(),
    version: '4.1.0',
    authConfigured: Boolean(getServiceAccount(c.env)),
    firestoreConfigured: firestoreEnabled(c.env),
    razorpayConfigured: razorpayEnabled(c.env),
    extractorConfigured: Boolean(c.env.EXTRACTOR_API_URL),
  }),
);

app.get('/api/config', (c) => {
  const env = c.env;
  const currency = paymentCurrency(env);
  const monthly = monthlyAmount(env);
  const lifetime = lifetimeAmount(env);
  const money = (subunits: number) =>
    currency === 'INR' ? `₹${Math.round(subunits / 100)}` : `$${(subunits / 100).toFixed(2)}`;

  return c.json({
    razorpayKeyId: env.RAZORPAY_KEY_ID || '',
    razorpayConfigured: razorpayEnabled(env),
    paymentKeyId: env.RAZORPAY_KEY_ID || '',
    paymentConfigured: razorpayEnabled(env),
    authConfigured: Boolean(getServiceAccount(env)),
    firestoreConfigured: firestoreEnabled(env),
    extractorConfigured: Boolean(env.EXTRACTOR_API_URL),
    currency,
    monthlyAmount: monthly,
    lifetimeAmount: lifetime,
    monthlyDisplay: money(monthly),
    lifetimeDisplay: money(lifetime),
    guestDailyLimit: intEnv(env.GUEST_DAILY_LIMIT, 1),
    userDailyLimit: intEnv(env.USER_DAILY_LIMIT, 3),
    monthlyDailyLimit: intEnv(env.MONTHLY_DAILY_LIMIT, 75),
    lifetimeDailyLimit: intEnv(env.LIFETIME_DAILY_LIMIT, 150),
    freeCookieLimit: intEnv(env.FREE_COOKIE_VAULT_LIMIT, 2),
    premiumCookieLimit: intEnv(env.PREMIUM_COOKIE_VAULT_LIMIT, 100),
    youtubeCookiesConfigured: Boolean(env.YTDLP_COOKIES_B64),
    youtubeProxyConfigured: Boolean(env.YTDLP_PROXY),
  });
});

const downloadSchema = z.object({
  url: z.string().trim().min(1).max(2048),
  type: z.enum(['video', 'audio']).optional(),
});

app.post('/api', async (c) => {
  const env = c.env;
  const ip = getClientIp(c);

  if (!checkRateLimit(env, ip)) {
    return c.json({ error: 'Too many requests. Please wait and try again.' }, 429);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = downloadSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'A valid URL is required.' }, 400);
  }

  const type = parsed.data.type || 'video';
  const originalUrl = parsed.data.url;

  if (!isPublicHttpUrl(originalUrl)) {
    return c.json(
      { error: 'Please enter a valid public media URL. Private, local, and internal URLs are not allowed.' },
      400,
    );
  }

  const url = normalizeMediaUrl(originalUrl);

  if (!acquireInflight(env)) {
    return c.json({ error: 'Server is busy. Please retry in a few seconds.' }, 429);
  }

  try {
    const user = await getBearerUser(env, c);
    const entitlement = await loadEntitlement(env, user?.uid || null);
    const key = usageKey(user?.uid || null, c);

    // Failed checks must not consume quota, so only inspect here.
    const used = await readUsage(env, key);
    if (entitlement.dailyLimit > 0 && used >= entitlement.dailyLimit && !entitlement.unlimited) {
      return c.json({ error: 'Daily download limit reached. Please login or upgrade to Premium.' }, 429);
    }

    const cacheKey = `${type}:${url}`;
    const cached = getCached(env, cacheKey);
    if (cached && typeof cached.downloadUrl === 'string') {
      const quota = await reserveUsage(env, key, entitlement.dailyLimit);
      if (!quota.allowed) {
        return c.json({ error: 'Daily download limit reached. Please login or upgrade to Premium.' }, 429);
      }
      return c.json({
        ...cached,
        quota: {
          plan: entitlement.plan,
          unlimited: entitlement.unlimited,
          dailyLimit: entitlement.dailyLimit,
          remaining: entitlement.unlimited ? -1 : quota.remaining,
        },
      });
    }

    let result: ExtractionResult;
    try {
      result = await extractMedia(env, url, type);
    } catch (error) {
      const status = Number((error as { status?: number }).status || 500);
      const message = error instanceof Error ? error.message : 'Could not process this link.';
      const safeStatus = (status >= 400 && status <= 599 ? status : 500) as ContentfulStatusCode;
      return c.json({ error: message }, safeStatus);
    }

    const quota = await reserveUsage(env, key, entitlement.dailyLimit);
    if (!quota.allowed) {
      return c.json({ error: 'Daily download limit reached. Please login or upgrade to Premium.' }, 429);
    }

    const responseData: Record<string, unknown> = {
      ...result,
      type,
      quota: {
        plan: entitlement.plan,
        unlimited: entitlement.unlimited,
        dailyLimit: entitlement.dailyLimit,
        remaining: entitlement.unlimited ? -1 : quota.remaining,
      },
    };

    setCache(cacheKey, responseData);
    return c.json(responseData);
  } finally {
    releaseInflight();
  }
});

app.get('/api/me', async (c) => {
  const env = c.env;
  const authHeader = c.req.header('authorization') || '';
  const authConfigured = Boolean(getServiceAccount(env));

  let user: FirebaseUser | null = null;
  let authError: string | null = null;

  if (authHeader.startsWith('Bearer ')) {
    user = await getBearerUser(env, c);
    if (!user) authError = authConfigured ? 'invalid_token' : 'auth_not_configured';
  } else if (authHeader) {
    authError = 'invalid_header';
  } else {
    authError = 'missing';
  }

  const entitlement = await loadEntitlement(env, user?.uid || null);
  let remaining: number | null = null;

  if (entitlement.dailyLimit > 0 && entitlement.plan !== 'guest') {
    const used = await readUsage(env, usageKey(user?.uid || null, c));
    remaining = Math.max(entitlement.dailyLimit - used, 0);
  } else if (entitlement.dailyLimit > 0) {
    const used = await readUsage(env, usageKey(null, c));
    remaining = Math.max(entitlement.dailyLimit - used, 0);
  }

  return c.json({
    uid: user?.uid || null,
    plan: entitlement.plan,
    unlimited: entitlement.unlimited,
    premiumPlan: entitlement.premiumPlan,
    premiumStatus: entitlement.premiumStatus,
    purchasedAt: entitlement.purchasedAt,
    activatedAt: entitlement.activatedAt,
    renewedAt: entitlement.renewedAt,
    expiresAt: entitlement.expiresAt,
    renewsAt: entitlement.renewsAt,
    updatedAt: entitlement.updatedAt,
    paymentId: entitlement.paymentId,
    orderId: entitlement.orderId,
    subscriptionId: entitlement.subscriptionId,
    cancelAtPeriodEnd: entitlement.cancelAtPeriodEnd,
    dailyLimit: entitlement.dailyLimit,
    remaining: entitlement.unlimited ? -1 : remaining,
    authConfigured,
    authError,
  });
});

/* -------------------------------------------------------------------------- */
/*  Billing                                                                   */
/* -------------------------------------------------------------------------- */

app.post('/api/create-order', async (c) => {
  const env = c.env;
  if (!razorpayEnabled(env)) return c.json({ error: 'Razorpay not configured' }, 500);
  if (!getServiceAccount(env)) return authNotConfigured(c);

  const user = await getBearerUser(env, c);
  if (!user) return unauthorized(c);

  const body = (await c.req.json().catch(() => null)) as { plan?: string } | null;
  const plan = String(body?.plan || 'lifetime').toLowerCase();
  if (plan !== 'lifetime') {
    return c.json({ error: 'Use /api/create-subscription for the monthly plan.' }, 400);
  }

  try {
    const currency = paymentCurrency(env);
    const amount = lifetimeAmount(env);
    const customerId = await getOrCreateRazorpayCustomer(env, user.uid, user.email);
    const order = await razorpayRequest(env, 'POST', '/orders', {
      amount,
      currency,
      receipt: `lt_${Date.now()}_${user.uid.slice(0, 20)}`,
      notes: { uid: user.uid, plan: 'lifetime', ...(customerId ? { customer_id: customerId } : {}) },
    });

    if (firestoreEnabled(env)) {
      await firestoreSet(env, `rzpOrders/${encodeURIComponent(String(order.id))}`, {
        uid: user.uid,
        plan: 'lifetime',
        email: user.email || null,
        amount,
        currency,
        receipt: order.receipt || null,
        status: order.status || null,
        createdAt: new Date().toISOString(),
      }).catch((error) => console.warn('Could not save Razorpay order:', error));
    }

    return c.json({ keyId: env.RAZORPAY_KEY_ID, orderId: order.id, amount, currency });
  } catch (error) {
    console.error('Create order failed:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Could not create order' }, 500);
  }
});

app.post('/api/create-subscription', async (c) => {
  const env = c.env;
  if (!razorpayEnabled(env)) return c.json({ error: 'Razorpay not configured' }, 500);
  if (!getServiceAccount(env)) return authNotConfigured(c);

  const user = await getBearerUser(env, c);
  if (!user) return unauthorized(c);

  const body = (await c.req.json().catch(() => null)) as { plan?: string } | null;
  const plan = String(body?.plan || 'monthly').toLowerCase();
  if (plan !== 'monthly') return c.json({ error: 'Invalid plan' }, 400);

  try {
    const planId = await getOrCreateMonthlyPlanId(env);
    const customerId = await getOrCreateRazorpayCustomer(env, user.uid, user.email);
    const subscription = await razorpayRequest(env, 'POST', '/subscriptions', {
      plan_id: planId,
      total_count: 120,
      quantity: 1,
      customer_notify: 1,
      notes: { uid: user.uid, plan: 'monthly' },
      ...(customerId ? { customer_id: customerId } : {}),
    });

    if (firestoreEnabled(env)) {
      await firestoreSet(env, `rzpSubscriptions/${encodeURIComponent(String(subscription.id))}`, {
        uid: user.uid,
        plan: 'monthly',
        email: user.email || null,
        amount: monthlyAmount(env),
        currency: paymentCurrency(env),
        status: subscription.status || null,
        createdAt: new Date().toISOString(),
      }).catch((error) => console.warn('Could not save Razorpay subscription:', error));
    }

    return c.json({
      keyId: env.RAZORPAY_KEY_ID,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Create subscription failed:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Could not create subscription' },
      500,
    );
  }
});

const verifyPaymentSchema = z
  .object({
    type: z.enum(['order', 'subscription']).optional(),
    payment_id: z.string().optional(),
    signature: z.string().optional(),
    order_id: z.string().optional(),
    subscription_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
    razorpay_order_id: z.string().optional(),
    razorpay_subscription_id: z.string().optional(),
  })
  .passthrough();

app.post('/api/verify-payment', async (c) => {
  const env = c.env;
  if (!razorpayEnabled(env)) return c.json({ error: 'Razorpay not configured' }, 500);
  if (!getServiceAccount(env)) return authNotConfigured(c);

  const user = await getBearerUser(env, c);
  if (!user) return unauthorized(c);

  const body = await c.req.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid payment payload' }, 400);

  const paymentId = parsed.data.payment_id || parsed.data.razorpay_payment_id || '';
  const signature = parsed.data.signature || parsed.data.razorpay_signature || '';
  const orderId = parsed.data.order_id || parsed.data.razorpay_order_id || '';
  const subscriptionId = parsed.data.subscription_id || parsed.data.razorpay_subscription_id || '';

  if (!paymentId || !signature) {
    return c.json({ error: 'Missing payment id or signature' }, 400);
  }

  try {
    let payment = await razorpayRequest(env, 'GET', `/payments/${encodeURIComponent(paymentId)}`);
    const type =
      parsed.data.type ||
      (payment.subscription_id || subscriptionId ? 'subscription' : orderId ? 'order' : 'order');

    if (type === 'order') {
      if (!orderId) return c.json({ error: 'Missing order id' }, 400);

      const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET!, `${orderId}|${paymentId}`);
      if (!timingSafeEqual(expected, signature)) {
        return c.json({ error: 'Invalid payment signature' }, 400);
      }
      if (String(payment.order_id || '') !== orderId) {
        return c.json({ error: 'Order mismatch' }, 400);
      }

      const amount = lifetimeAmount(env);
      if (Number(payment.amount || 0) !== amount) {
        return c.json({ error: 'Payment amount mismatch' }, 400);
      }
      if (String(payment.currency || '').toUpperCase() !== paymentCurrency(env)) {
        return c.json({ error: 'Payment currency mismatch' }, 400);
      }

      let status = String(payment.status || '').toLowerCase();
      if (status === 'authorized') {
        payment = await razorpayRequest(env, 'POST', `/payments/${encodeURIComponent(paymentId)}/capture`, {
          amount,
          currency: paymentCurrency(env),
        });
        status = String(payment.status || '').toLowerCase();
      }
      if (status !== 'captured') {
        return c.json({ error: `Payment not captured (${status || 'unknown'})` }, 400);
      }

      const purchasedAt = toIsoString(payment.created_at) || new Date().toISOString();
      await saveEntitlement(env, user.uid, {
        plan: 'lifetime',
        unlimited: true,
        premiumPlan: 'lifetime',
        premiumStatus: 'active',
        purchasedAt,
        activatedAt: new Date().toISOString(),
        expiresAt: null,
        renewsAt: null,
        orderId,
        paymentId,
        email: user.email || null,
        amount,
        currency: paymentCurrency(env),
      });

      return c.json({ ok: true, plan: 'lifetime', purchasedAt, expiresAt: null });
    }

    if (!subscriptionId) return c.json({ error: 'Missing subscription id' }, 400);

    const expectedA = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET!, `${subscriptionId}|${paymentId}`);
    const expectedB = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET!, `${paymentId}|${subscriptionId}`);
    if (!timingSafeEqual(expectedA, signature) && !timingSafeEqual(expectedB, signature)) {
      return c.json({ error: 'Invalid subscription signature' }, 400);
    }
    if (String(payment.subscription_id || '') !== subscriptionId) {
      return c.json({ error: 'Subscription mismatch' }, 400);
    }

    const amount = monthlyAmount(env);
    if (Number(payment.amount || 0) !== amount) {
      return c.json({ error: 'Payment amount mismatch' }, 400);
    }
    if (String(payment.currency || '').toUpperCase() !== paymentCurrency(env)) {
      return c.json({ error: 'Payment currency mismatch' }, 400);
    }
    if (String(payment.status || '').toLowerCase() !== 'captured') {
      return c.json({ error: `Payment not captured (${payment.status || 'unknown'})` }, 400);
    }

    const subscription = await razorpayRequest(
      env,
      'GET',
      `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    );
    const currentEnd = Number(subscription.current_end || 0);
    const expiresAt =
      currentEnd > 0
        ? new Date(currentEnd * 1000).toISOString()
        : new Date(Date.now() + 31 * DAY_MS).toISOString();
    const purchasedAt = toIsoString(payment.created_at) || new Date().toISOString();

    await saveEntitlement(env, user.uid, {
      plan: 'monthly',
      unlimited: true,
      premiumPlan: 'monthly',
      premiumStatus: 'active',
      purchasedAt,
      activatedAt: purchasedAt,
      renewedAt: new Date().toISOString(),
      expiresAt,
      renewsAt: expiresAt,
      cancelAtPeriodEnd: false,
      subscriptionId,
      paymentId,
      email: user.email || null,
      amount,
      currency: paymentCurrency(env),
    });

    return c.json({ ok: true, plan: 'monthly', purchasedAt, expiresAt, renewsAt: expiresAt });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Payment verification failed' },
      500,
    );
  }
});

app.post('/api/rzp-webhook', async (c) => {
  const env = c.env;
  const secret = env.RZP_WEBHOOK_SECRET;
  if (!secret) return c.json({ error: 'Webhook secret not configured' }, 500);

  const signature = c.req.header('x-razorpay-signature') || '';
  const rawBody = await c.req.text();
  const expected = await hmacSha256Hex(secret, rawBody);
  if (!signature || !timingSafeEqual(expected, signature)) {
    return c.json({ error: 'Invalid webhook signature' }, 400);
  }

  let event: Record<string, any>;
  try {
    event = JSON.parse(rawBody) as Record<string, any>;
  } catch {
    return c.json({ error: 'Invalid webhook payload' }, 400);
  }

  const eventName = String(event.event || '').toLowerCase();
  const entity = event?.payload?.subscription?.entity || event?.payload?.payment?.entity || {};
  const uid = String(entity?.notes?.uid || '');

  try {
    if (uid && (eventName === 'subscription.charged' || eventName === 'subscription.activated')) {
      const currentEnd = Number(entity.current_end || 0);
      const expiresAt =
        currentEnd > 0
          ? new Date(currentEnd * 1000).toISOString()
          : new Date(Date.now() + 31 * DAY_MS).toISOString();

      await saveEntitlement(env, uid, {
        plan: 'monthly',
        unlimited: true,
        premiumPlan: 'monthly',
        premiumStatus: 'active',
        subscriptionId: entity.id || null,
        renewedAt: new Date().toISOString(),
        expiresAt,
        renewsAt: expiresAt,
        cancelAtPeriodEnd: false,
      });
    } else if (uid && (eventName === 'subscription.cancelled' || eventName === 'subscription.completed')) {
      const currentEnd = Number(entity.current_end || 0);
      const expiresAt =
        currentEnd > 0 ? new Date(currentEnd * 1000).toISOString() : new Date().toISOString();

      await saveEntitlement(env, uid, {
        plan: 'monthly',
        unlimited: true,
        premiumPlan: 'monthly',
        premiumStatus: 'cancelled',
        subscriptionId: entity.id || null,
        expiresAt,
        renewsAt: null,
        cancelAtPeriodEnd: true,
      });
    } else if (uid && eventName === 'subscription.expired') {
      await saveEntitlement(env, uid, {
        plan: 'user',
        unlimited: false,
        premiumPlan: 'monthly',
        premiumStatus: 'expired',
        subscriptionId: entity.id || null,
        expiresAt: new Date().toISOString(),
        renewsAt: null,
        cancelAtPeriodEnd: false,
      });
    } else if (uid && eventName === 'payment.captured') {
      const orderId = String(entity.order_id || '');
      const paymentId = String(entity.id || '');
      if (String(entity.notes?.plan || '') === 'lifetime') {
        await saveEntitlement(env, uid, {
          plan: 'lifetime',
          unlimited: true,
          premiumPlan: 'lifetime',
          premiumStatus: 'active',
          purchasedAt: toIsoString(entity.created_at) || new Date().toISOString(),
          orderId: orderId || null,
          paymentId: paymentId || null,
          expiresAt: null,
          renewsAt: null,
        });
      }
    }
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }

  return c.json({ received: true });
});

/* -------------------------------------------------------------------------- */
/*  Cookie vault                                                              */
/* -------------------------------------------------------------------------- */

const cookieSchema = z.object({
  platform: z.string().trim().min(1).max(50),
  cookies: z.union([z.string().min(1).max(200_000), z.record(z.any())]),
});

app.get('/api/cookies', async (c) => {
  const env = c.env;
  if (!getServiceAccount(env)) return authNotConfigured(c);
  const user = await getBearerUser(env, c);
  if (!user) return unauthorized(c);
  if (!firestoreEnabled(env)) return c.json({ cookies: [] });

  try {
    const docs = await firestoreList(env, `users/${encodeURIComponent(user.uid)}/cookies`);
    return c.json({ cookies: docs.map((doc) => ({ id: doc.id, ...doc.data })) });
  } catch (error) {
    console.error('Failed to list cookies:', error);
    return c.json({ cookies: [] });
  }
});

app.post('/api/cookies', async (c) => {
  const env = c.env;
  if (!getServiceAccount(env)) return authNotConfigured(c);
  const user = await getBearerUser(env, c);
  if (!user) return unauthorized(c);
  if (!firestoreEnabled(env)) return c.json({ error: 'Database not configured' }, 500);

  const body = await c.req.json().catch(() => null);
  const parsed = cookieSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Platform and cookies are required.' }, 400);

  try {
    const entitlement = await loadEntitlement(env, user.uid);
    const limit = entitlement.unlimited
      ? intEnv(env.PREMIUM_COOKIE_VAULT_LIMIT, 100)
      : intEnv(env.FREE_COOKIE_VAULT_LIMIT, 2);

    const existing = await firestoreList(env, `users/${encodeURIComponent(user.uid)}/cookies`);
    if (existing.length >= limit) {
      return c.json(
        { error: `Cookie vault limit reached (${limit}). Upgrade for more space.` },
        400,
      );
    }

    const id = await firestoreAdd(env, `users/${encodeURIComponent(user.uid)}/cookies`, {
      platform: parsed.data.platform,
      cookies: parsed.data.cookies,
      createdAt: new Date().toISOString(),
    });

    return c.json({ id, platform: parsed.data.platform, cookies: parsed.data.cookies });
  } catch (error) {
    console.error('Failed to save cookie:', error);
    return c.json({ error: 'Failed to save cookie' }, 500);
  }
});

app.delete('/api/cookies', async (c) => {
  const env = c.env;
  if (!getServiceAccount(env)) return authNotConfigured(c);
  const user = await getBearerUser(env, c);
  if (!user) return unauthorized(c);
  if (!firestoreEnabled(env)) return c.json({ error: 'Database not configured' }, 500);

  const body = (await c.req.json().catch(() => null)) as { id?: string } | null;

  try {
    if (body?.id) {
      await firestoreDelete(
        env,
        `users/${encodeURIComponent(user.uid)}/cookies/${encodeURIComponent(body.id)}`,
      );
    } else {
      const existing = await firestoreList(env, `users/${encodeURIComponent(user.uid)}/cookies`);
      await Promise.all(
        existing.map((doc) =>
          firestoreDelete(
            env,
            `users/${encodeURIComponent(user.uid)}/cookies/${encodeURIComponent(doc.id)}`,
          ),
        ),
      );
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to delete cookie:', error);
    return c.json({ error: 'Failed to delete cookie' }, 500);
  }
});

export default app;

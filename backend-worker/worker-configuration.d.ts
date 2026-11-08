// Cloudflare Worker type definitions
/// <reference types="@cloudflare/workers-types" />

export interface Env {
  // Firebase Admin (service account JSON or base64 encoded JSON)
  FIREBASE_ADMIN_JSON?: string;
  FIREBASE_ADMIN_JSON_B64?: string;

  // Razorpay
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RZP_WEBHOOK_SECRET?: string;

  // CORS
  ALLOWED_ORIGINS?: string;

  // Rate limiting
  RATE_LIMIT_PER_MIN?: string;
  MAX_INFLIGHT?: string;
  GUEST_DAILY_LIMIT?: string;
  USER_DAILY_LIMIT?: string;
  MONTHLY_DAILY_LIMIT?: string;
  LIFETIME_DAILY_LIMIT?: string;

  // Cache
  INFO_CACHE_TTL_SEC?: string;

  // Media extraction provider (any service that accepts { url, type } and
  // returns { downloadUrl, title, thumbnail, ext, platform, ... })
  EXTRACTOR_API_URL?: string;
  EXTRACTOR_API_KEY?: string;
  EXTRACTOR_TIMEOUT_MS?: string;

  // YouTube (passed through to extraction providers that support it)
  YTDLP_COOKIES_B64?: string;
  YTDLP_PROXY?: string;

  // Payment
  PAYMENT_CURRENCY?: string;
  MONTHLY_AMOUNT?: string;
  LIFETIME_AMOUNT?: string;

  // Cookie vault
  FREE_COOKIE_VAULT_LIMIT?: string;
  PREMIUM_COOKIE_VAULT_LIMIT?: string;

  // Public API base URL
  PUBLIC_API_BASE_URL?: string;

  // Runtime label
  ENVIRONMENT?: string;
}

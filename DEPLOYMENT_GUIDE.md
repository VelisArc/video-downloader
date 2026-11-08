# ShareHub - Cloudflare Deployment Guide

## 📁 Project Structure

```
video-downloader/
├── frontend/                    # React + Vite frontend (Cloudflare Pages)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── wrangler.toml           # Cloudflare Pages config
├── backend-worker/              # TypeScript backend (Cloudflare Workers)
│   ├── src/
│   │   └── index.ts            # Hono API server
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml           # Cloudflare Worker config
│   └── worker-configuration.d.ts
├── .github/workflows/
│   └── deploy-cloudflare.yml   # CI/CD pipeline
├── .env.cloudflare.example     # Environment variables template
└── wrangler.toml               # Root config (optional)
```

## 🚀 Quick Deploy

### Prerequisites
- Cloudflare account
- Node.js 20+
- Firebase project (for auth)
- Razorpay account (for payments, optional)

### 1. Setup Cloudflare Account
1. Create Cloudflare account at https://cloudflare.com
2. Get your Account ID from the dashboard
3. Create API Token with "Cloudflare Pages:Edit" and "Cloudflare Workers:Edit" permissions

### 2. Configure GitHub Secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

**Required for Frontend (Pages project `sharehub-frontend`):**
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `VITE_API_BASE_URL` - Your backend worker URL (e.g., `https://sharehub-backend.your-subdomain.workers.dev`)
- `VITE_FIREBASE_API_KEY` - Firebase client API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (optional)

**Required for Backend (Worker `sharehub-backend`):**
- `FIREBASE_ADMIN_JSON` - Full Firebase service account JSON (or use `FIREBASE_ADMIN_JSON_B64` for base64)
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `RZP_WEBHOOK_SECRET` - Razorpay webhook secret (optional)
- `ALLOWED_ORIGINS` - Comma-separated allowed origins (e.g., `https://sharehub.online,https://www.sharehub.online,https://sharehub-frontend.pages.dev`)
- `PAYMENT_CURRENCY` - Currency code (default: INR)
- `MONTHLY_AMOUNT` - Monthly plan amount in subunits (default: 19900 for ₹199)
- `LIFETIME_AMOUNT` - Lifetime plan amount in subunits (default: 99900 for ₹999)

**Optional for Backend:**
- `EXTRACTOR_API_URL` - Media extraction provider endpoint (receives `POST { url, type }`)
- `EXTRACTOR_API_KEY` - Provider API key
- `EXTRACTOR_TIMEOUT_MS` - Provider request timeout (default: 20000)
- `FREE_COOKIE_VAULT_LIMIT` - Cookie slots for free users (default: 2)
- `PREMIUM_COOKIE_VAULT_LIMIT` - Cookie slots for premium users (default: 10)
- `YTDLP_COOKIES_B64` - Base64 encoded YouTube cookies (forwarded to the provider)
- `YTDLP_PROXY` - Outbound proxy URL (forwarded to the provider)
- `RATE_LIMIT_PER_MIN` - Rate limit per minute (default: 30)
- `MAX_INFLIGHT` - Max concurrent requests (default: 3)
- `GUEST_DAILY_LIMIT` - Guest daily downloads (default: 1)
- `USER_DAILY_LIMIT` - Logged-in user daily downloads (default: 3)
- `MONTHLY_DAILY_LIMIT` - Monthly plan daily limit (default: 75)
- `LIFETIME_DAILY_LIMIT` - Lifetime plan daily limit (default: 150)
- `INFO_CACHE_TTL_SEC` - Metadata cache TTL (default: 15)

### 3. Deploy via GitHub Actions
1. Push to main branch
2. GitHub Actions will automatically:
   - Build and deploy frontend to Cloudflare Pages
   - Build and deploy backend to Cloudflare Workers

### 4. Manual Deploy (Alternative)

#### Frontend (Cloudflare Pages)
```bash
cd frontend
npm install
VITE_API_BASE_URL=https://sharehub-backend.<subdomain>.workers.dev npm run build
# Deploy via Cloudflare dashboard or:
npx wrangler pages deploy dist --project-name=sharehub-frontend
```

#### Backend (Cloudflare Workers)
```bash
cd backend-worker
npm install
npm run build   # type-check
npm test        # vitest suite
npx wrangler deploy
```

The worker name comes from `backend-worker/wrangler.toml` (`sharehub-backend`). There is no
`--env production` section, so pass no `--env` flag.

#### Set backend secrets
```bash
cd backend-worker
npx wrangler secret put FIREBASE_ADMIN_JSON
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
npx wrangler secret put EXTRACTOR_API_URL
npx wrangler secret put EXTRACTOR_API_KEY
```
Plain (non-secret) tuning values can go under `[vars]` in `backend-worker/wrangler.toml`.

## 🔧 Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend-worker
npm install
npm run dev
```

### Environment Files
Copy `.env.cloudflare.example` to `.env.local` in both frontend and backend-worker directories and fill in your values.

## 🌐 Custom Domains

### Frontend (Cloudflare Pages)
1. Go to Cloudflare Pages → `sharehub-frontend` → Custom domains
2. Add `sharehub.online` and `www.sharehub.online`
3. Configure the DNS records Cloudflare shows (the zone must exist in the same account)

### Backend (Cloudflare Workers)
1. Go to Cloudflare Workers → `sharehub-backend` → Settings → Domains & Routes
2. Add `api.sharehub.online`
3. Update `VITE_API_BASE_URL` in the frontend build to `https://api.sharehub.online`
4. Add the frontend origins to `ALLOWED_ORIGINS`

> The custom domain only works after `sharehub.online` is added as a zone in your
> Cloudflare account. A Worker/Pages upload alone does not register the domain.

## 📝 Important Notes

### Video Extraction
The backend runs entirely on Cloudflare Workers and **cannot run yt-dlp** (Python). Instead:

1. **Direct media URLs are handled natively** — links ending in `mp4`, `webm`, `mp3`,
   `m4a`, etc. return download metadata immediately.
2. **Platform links use an extraction provider** — set `EXTRACTOR_API_URL` (and optionally
   `EXTRACTOR_API_KEY`). The Worker sends `POST { "url": "...", "type": "video" }` and
   expects JSON like `{ "downloadUrl", "title", "thumbnail", "ext", "platform" }`.
3. **Without a provider** the endpoint returns `501` with a configuration message instead
   of failing silently.

You can back the provider with a separate Python/yt-dlp service, a RapidAPI extractor, or
any HTTP service that implements the contract above.

### Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication → Google Sign-In
3. Enable Firestore Database
4. Generate service account key: Project Settings → Service Accounts → Generate new private key
5. Add authorized domains in Firebase Auth settings

### Razorpay Setup (Optional)
1. Create Razorpay account at https://razorpay.com
2. Get API keys from Dashboard → Settings → API Keys
3. Set up webhook URL: `https://sharehub-backend.<subdomain>.workers.dev/api/rzp-webhook`
   (or `https://api.sharehub.online/api/rzp-webhook` once the custom domain is active)
4. Enable subscription/webhook events in Razorpay dashboard

## 🔒 Security Checklist
- [ ] All secrets in GitHub Secrets (not in code)
- [ ] `ALLOWED_ORIGINS` configured correctly
- [ ] Firebase authorized domains updated
- [ ] Razorpay webhook signature verification enabled
- [ ] Rate limiting configured
- [ ] CORS headers properly set

## 🐛 Troubleshooting

### Frontend build fails
- Check Node.js version (20+)
- Verify all VITE_* environment variables are set
- Check Cloudflare Pages build logs

### Backend deploy fails
- Verify `FIREBASE_ADMIN_JSON` is valid JSON
- Check Cloudflare Worker logs in dashboard
- Ensure compatibility flags include `nodejs_compat`

### CORS errors
- Verify `ALLOWED_ORIGINS` includes your frontend domain
- Check that frontend `VITE_API_BASE_URL` matches backend worker URL

### Video downloads not working
- Direct media URLs work without configuration; platform links need `EXTRACTOR_API_URL`
- Check browser console for API errors
- Verify backend `/api/health` and `/api/config` respond

## 📊 Monitoring
- Cloudflare Pages: Analytics in Pages dashboard
- Cloudflare Workers: Logs in Workers dashboard
- Use `console.log` in worker for debugging (visible in real-time logs)

## 🔄 Updates
- Push to main branch for automatic deployment
- For manual updates, run deploy commands above
- Monitor GitHub Actions for deployment status

---

**Your ShareHub is now deployed on Cloudflare's global network! 🚀**
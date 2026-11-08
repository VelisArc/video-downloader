# ShareHub

**Multi-platform video & audio downloader** — [sharehub.online](https://sharehub.online)

![Version](https://img.shields.io/badge/version-4.1.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Cloudflare-orange)

---

## Features

- 🎬 **Video & Audio Downloads** — Direct media links work out of the box; plug in an extraction provider for platform support
- 🌙 **Dark Mode** — Automatic system detection + manual toggle
- 🍪 **Cookie Vault** — Save cookies for login-restricted links (2 free, unlimited premium)
- 💳 **Premium Plans** — Monthly (₹199) & Lifetime (₹999) via Razorpay
- 🔐 **Google SSO** — Firebase Authentication with Google Sign-In
- 📊 **User Dashboard** — View plan, usage stats, and manage cookies
- 📱 **PWA Ready** — Installable on mobile devices
- 🔍 **SEO Optimized** — Sitemap, robots.txt, Open Graph, structured data
- 🛡️ **Rate Limiting** — Per-IP and per-user daily quotas
- 📺 **AdSense Integration** — Ads for free users, ad-free for premium

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS + Custom CSS Variables |
| Backend | TypeScript + Hono (Cloudflare Workers) |
| Auth | Firebase Authentication (REST ID-token verification) |
| Database | Cloud Firestore (REST API) |
| Payments | Razorpay (REST API) |
| Hosting | Cloudflare Pages + Workers |
| CI/CD | GitHub Actions |

The backend runs entirely on Cloudflare Workers — no Node-only SDKs, no `firebase-admin`,
no `razorpay` package. Firebase token verification, Firestore access, Google OAuth JWT
signing, Razorpay calls and HMAC signing all use Web Crypto and `fetch`.

## Quick Start

### Prerequisites
- Node.js 20+
- Cloudflare account
- Firebase project (for auth)
- Razorpay account (for payments, optional)

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/video-downloader.git
cd video-downloader

# Frontend setup
cd frontend
npm install
cp ../.env.cloudflare.example .env.local
# Edit .env.local with your values
npm run dev

# Backend setup (in another terminal)
cd backend-worker
npm install
cp ../.env.cloudflare.example .env.local
# Edit .env.local with your values
npm run dev
```

### Environment Variables

See `.env.cloudflare.example` for the complete list with descriptions.

**Frontend (Cloudflare Pages):**
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ✅ | Backend worker URL |
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase client API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase web app ID |

**Backend (Cloudflare Worker secrets):**
| Variable | Required | Description |
|----------|----------|-------------|
| `FIREBASE_ADMIN_JSON` | 🔐 | Firebase service account JSON (or `FIREBASE_ADMIN_JSON_B64`) |
| `RAZORPAY_KEY_ID` | 💳 | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET` | 💳 | Razorpay API Secret |
| `RZP_WEBHOOK_SECRET` | 💳 | Razorpay webhook secret |
| `EXTRACTOR_API_URL` | 🎬 | Media extraction provider endpoint |
| `EXTRACTOR_API_KEY` | 🎬 | Provider API key |
| `ALLOWED_ORIGINS` | 🔒 | Comma-separated allowed CORS origins |
| `FREE_COOKIE_VAULT_LIMIT` | 🍪 | Free-tier cookie slots (default `2`) |

## Deploy to Cloudflare

### Automatic (GitHub Actions)
1. Fork this repository
2. Add GitHub secrets (see `DEPLOYMENT_GUIDE.md`)
3. Push to `main`
4. GitHub Actions deploys both frontend and backend

### Manual
```bash
# Backend (worker: sharehub-backend)
cd backend-worker
npm ci
npm run build
npx wrangler deploy

# Frontend (Pages project: sharehub-frontend)
cd ../frontend
VITE_API_BASE_URL=https://sharehub-backend.<subdomain>.workers.dev npm run build
npx wrangler pages deploy dist --project-name=sharehub-frontend
```

## Project Structure

```
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # React contexts (Auth, Entitlement)
│   │   ├── lib/                 # Utilities (firebase, downloads, site config)
│   │   └── pages/               # Route pages
│   ├── public/                  # Static files (_redirects, _headers, SEO)
│   ├── package.json
│   ├── vite.config.ts
│   └── wrangler.toml            # Cloudflare Pages config
├── backend-worker/              # TypeScript backend
│   ├── src/
│   │   ├── index.ts             # Hono API server
│   │   └── index.test.ts        # Vitest suite
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml            # Cloudflare Worker config
│   └── worker-configuration.d.ts
├── .github/workflows/
│   └── deploy-cloudflare.yml    # CI/CD pipeline
├── .env.cloudflare.example      # Environment template
└── DEPLOYMENT_GUIDE.md          # Detailed deployment guide
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api` | Extract download info from URL |
| GET | `/api/health` | Health check |
| GET | `/api/config` | Public configuration |
| GET | `/api/me` | Current user entitlement |
| GET | `/api/cookies` | List saved cookies |
| POST | `/api/cookies` | Save a cookie |
| DELETE | `/api/cookies` | Delete cookie(s) |
| POST | `/api/create-order` | Create Razorpay order |
| POST | `/api/create-subscription` | Create subscription |
| POST | `/api/verify-payment` | Verify payment |
| POST | `/api/rzp-webhook` | Razorpay webhook |

## Video Extraction

Cloudflare Workers cannot run `yt-dlp` (Python). The Worker therefore:

1. Detects **direct media URLs** (`mp4`, `webm`, `mp3`, `m4a`, …) and returns them immediately.
2. Forwards platform links to the provider configured by `EXTRACTOR_API_URL`.
   The provider receives `POST { "url": "...", "type": "video" | "audio" }` and must
   return JSON such as `{ "downloadUrl", "title", "thumbnail", "ext", "platform" }`.
3. Returns `501` with a clear message when no provider is configured.

Optional provider credentials (`YTDLP_COOKIES_B64`, `YTDLP_PROXY`) are forwarded to the
provider untouched.

## Custom Domain

The production domain is **sharehub.online**. To attach it:

1. Add `sharehub.online` as a zone in the Cloudflare dashboard.
2. Frontend: Pages → `sharehub-frontend` → Custom domains → add `sharehub.online` and `www.sharehub.online`.
3. Backend: Workers → `sharehub-backend` → Settings → Domains & Routes → add `api.sharehub.online`.
4. Set `ALLOWED_ORIGINS` on the worker to the frontend origins.

## License

MIT — see [LICENSE](./LICENSE)

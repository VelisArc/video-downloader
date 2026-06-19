# SwiftDL

**Multi-platform video & audio downloader** with dark mode, cookie vault, and premium billing.

![Version](https://img.shields.io/badge/version-4.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Vercel-black)

---

## Features

- 🎬 **Video & Audio Downloads** — Extract from many yt-dlp compatible platforms
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
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Custom CSS Variables |
| Backend | Python (Vercel Serverless Functions) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Payments | Razorpay |
| Hosting | Vercel |
| Downloader | yt-dlp |

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/video-downloader.git
cd video-downloader

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your keys

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase client API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_ADMIN_JSON` | ✅ | Firebase Admin SDK JSON |
| `RAZORPAY_KEY_ID` | 💳 | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET` | 💳 | Razorpay API Secret |
| `RZP_WEBHOOK_SECRET` | 💳 | Razorpay webhook secret |
| `ALLOWED_ORIGINS` | 🔒 | Comma-separated allowed CORS origins |

See `.env.example` for the complete list with descriptions.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Then add all `.env` variables to **Vercel → Project → Settings → Environment Variables**.

## Project Structure

```
├── api/
│   ├── index.py              # API endpoint (downloads, billing, cookies)
│   └── requirements.txt      # Python dependencies
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── DownloaderPanel   # URL input & download button
│   │   ├── ResultCard        # Download result display
│   │   ├── QuotaCard         # Plan & usage display
│   │   ├── ThemeToggle       # Dark/light mode toggle
│   │   └── ...
│   ├── context/              # React contexts (Auth, Entitlement)
│   ├── lib/                  # Utilities (firebase, downloads, site config)
│   └── pages/                # Route pages
├── public/                   # Static files (sitemap, robots, sw.js)
├── .env.example              # Environment template
├── vercel.json               # Vercel routing & headers
└── package.json
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

## License

MIT — see [LICENSE](./LICENSE)

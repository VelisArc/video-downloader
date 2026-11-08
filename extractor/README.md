# ShareHub Extractor — your own yt-dlp resolver service

ShareHub's Cloudflare Worker cannot run yt-dlp (it's Python). This tiny
service does the heavy lifting: it resolves a **public** video/audio URL to a
direct stream link and returns it in the exact JSON contract the Worker
expects.

## Contract

```
POST /            { "url": "<public video url>", "type": "video" | "audio" }
Header:           Authorization: Bearer <EXTRACTOR_API_KEY>
Response 200:     { downloadUrl, url, title, thumbnail, ext, platform,
                    uploader, duration, view_count }
```

Nothing is downloaded or stored — only resolved. The URL the user receives
expires after a few hours, like any signed stream URL.

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
set EXTRACTOR_API_KEY=change-me-long-random-string
uvicorn main:app --reload --port 8790
curl -X POST http://127.0.0.1:8790/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer change-me-long-random-string" \
  -d '{"url":"https://www.instagram.com/reel/xxxxx/","type":"video"}'
```

## Deploy (pick one)

**Render / Railway / Fly.io** — free tiers work:
1. Push this `extractor/` folder to a repo.
2. Create a **Web Service** from it (Render auto-detects the `Dockerfile`, or
   use "Python" with start command `uvicorn main:app --host 0.0.0.0 --port $PORT`).
3. Add env var `EXTRACTOR_API_KEY` = long random string.
4. Deploy → note the service URL (e.g. `https://sharehub-extractor.onrender.com`).

**Plain VPS** — install Python 3.12, then:
`pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8790`
behind nginx/Caddy with HTTPS.

## Wire it into ShareHub

```bash
wrangler secret put EXTRACTOR_API_URL   # paste https://your-extractor/
wrangler secret put EXTRACTOR_API_KEY   # same string you set above
# optional: EXTRACTOR_TIMEOUT_MS (default 30000)
```

Verify: `curl https://sharehub-backend.gamermanoj1432.workers.dev/api/config`
→ `extractorConfigured: true`.

## Limits to know

- **Public links only.** Private/DRM/age-gated content will fail with a clear
  error, by design.
- **Datacenter IPs are often blocked by YouTube** (and sometimes Instagram).
  If YouTube links fail from the host, self-host on a residential/VPS IP or
  pass cookies via `yt-dlp --cookies` (extend `ydl_opts` accordingly).
- **ToS**: extracting public media for personal use is a legal grey area.
  Ship nothing that bypasses DRM or private content; the ShareHub worker
  already refuses those.
- **yt-dlp updates**: sites change often. Redeploy with
  `pip install -U yt-dlp` (or bump `yt-dlp` in `requirements.txt`) weekly.

## Cost

$0 on Render/Railway free tier (with cold starts), or ~$4–6/month on a small
VPS/Fly machine. No FFmpeg needed — we return the source stream URL, not a
merged file.

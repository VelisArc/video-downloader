"""ShareHub Extractor - resolves direct media URLs for public video links.

Contract (matches the ShareHub backend Worker):
  POST /            { "url": "<public video url>", "type": "video" | "audio" }
  Headers:          Content-Type: application/json
                    Authorization: Bearer <EXTRACTOR_API_KEY>   (if configured)
  Response 200:     { downloadUrl, url, title, thumbnail, ext, platform,
                      uploader, duration, view_count }

Nothing is downloaded or stored here - we only ask yt-dlp to resolve the
source stream URL and hand it back to the Worker.
"""

import json
import logging
import os
import re
import time
from collections import defaultdict, deque
from typing import Optional

import yt_dlp
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

API_KEY = os.environ.get("EXTRACTOR_API_KEY", "").strip()
MAX_DURATION_SECONDS = int(os.environ.get("MAX_DURATION_SECONDS", "3600") or 3600)
RATE_LIMIT_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_MINUTE", "30") or 30)

log = logging.getLogger("sharehub-extractor")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = FastAPI(title="ShareHub Extractor", version="1.0.0", docs_url=None, redoc_url=None)

# --- very small per-minute rate limiter (per API key / per IP) ----------------
_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(request: Request) -> None:
    key = (request.headers.get("authorization") or request.client.host or "anon")[-64:]
    now = time.time()
    bucket = _hits[key]
    while bucket and bucket[0] < now - 60:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Slow down a little.")
    bucket.append(now)


class ExtractRequest(BaseModel):
    url: str = Field(min_length=8, max_length=2048)
    type: str = Field(default="video", pattern="^(video|audio)$")


def check_auth(authorization: Optional[str] = Header(default=None)) -> None:
    if not API_KEY:
        return
    if not authorization or authorization.strip() != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="Invalid API key")


_PLATFORM_NAMES = {
    "Youtube": "youtube",
    "Instagram": "instagram",
    "TikTok": "tiktok",
    "Twitter": "x",
    "Vimeo": "vimeo",
    "Soundcloud": "soundcloud",
    "Reddit": "reddit",
    "Dailymotion": "dailymotion",
    "Twitch": "twitch",
    "Facebook": "facebook",
}


def compact_count(value) -> str:
    try:
        n = int(value or 0)
    except (TypeError, ValueError):
        return "N/A"
    for unit, size in (("B", 1e9), ("M", 1e6), ("K", 1e3)):
        if n >= size:
            return f"{n / size:.1f}{unit}"
    return str(n)


def format_duration(seconds) -> str:
    try:
        total = int(seconds or 0)
    except (TypeError, ValueError):
        return "Unknown"
    if total <= 0:
        return "Unknown"
    minutes, sec = divmod(total, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{sec:02d}"
    return f"{minutes}:{sec:02d}"


def resolve(url: str, media_type: str):
    if media_type == "audio":
        # Prefer m4a/aac streams; fall back to any best audio.
        fmt = "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio*"
    else:
        # Prefer a single progressive MP4 (audio+video). Falls back to best.
        fmt = "best[ext=mp4][vcodec!=none][acodec!=none]/best[ext=mp4]/best"

    ydl_opts = {
        "format": fmt,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "skip_download": True,
        "socket_timeout": 20,
        "retries": 2,
        "extract_flat": False,
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
            ),
        },
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except yt_dlp.utils.DownloadError as exc:
        msg = str(exc)
        msg = re.sub(r"^ERROR:\s*", "", msg).strip()
        if len(msg) > 300:
            msg = msg[:300] + "…"
        # Common, user-meaningful cases stay readable.
        lowered = msg.lower()
        if any(s in lowered for s in ("private", "login", "sign in", "cookies", "age")):
            detail = "This link is private or restricted. A public link is required."
        elif any(s in lowered for s in ("not available", "unavailable", "removed", "deleted")):
            detail = "This video is not available anymore."
        elif "unsupported url" in lowered:
            detail = "This URL is not supported yet."
        elif "drm" in lowered:
            detail = "This content is DRM protected and cannot be downloaded."
        else:
            detail = msg or "Could not process this link."
        raise HTTPException(status_code=422, detail=detail) from exc
    except Exception as exc:  # noqa: BLE001 - never leak internals
        log.exception("unexpected extractor error")
        raise HTTPException(status_code=502, detail="Extraction failed unexpectedly.") from exc

    if not info:
        raise HTTPException(status_code=422, detail="No information found for this link.")

    duration = int(info.get("duration") or 0)
    if MAX_DURATION_SECONDS and duration and duration > MAX_DURATION_SECONDS:
        raise HTTPException(status_code=422, detail="This video is too long to process.")

    download_url = info.get("url") or (info.get("requested_formats") or [{}])[0].get("url")
    if not download_url:
        raise HTTPException(status_code=422, detail="No downloadable stream was found for this link.")

    thumbnail = info.get("thumbnail") or next(iter((info.get("thumbnails") or [{}])), {}).get("url") or ""
    extractor_key = str(info.get("extractor_key") or info.get("extractor") or "")
    platform = _PLATFORM_NAMES.get(extractor_key.replace("IE", ""), extractor_key.lower() or "generic")
    uploader = info.get("uploader") or info.get("channel") or info.get("uploader_id") or "Unknown"

    return {
        "downloadUrl": download_url,
        "url": download_url,
        "title": str(info.get("title") or "Untitled")[:150],
        "thumbnail": thumbnail,
        "ext": str(info.get("ext") or ("mp3" if media_type == "audio" else "mp4")),
        "platform": platform,
        "uploader": str(uploader),
        "duration": format_duration(duration),
        "view_count": compact_count(info.get("view_count")),
    }


@app.get("/health")
def health():
    return {"ok": True, "service": "sharehub-extractor", "yt_dlp": yt_dlp.version.__version__}


@app.post("/")
async def extract(payload: ExtractRequest, _: None = Depends(check_auth), __: None = Depends(rate_limit)):
    url = payload.url.strip()
    log.info("extract type=%s host=%s", payload.type, url.split("/")[2] if "://" in url else url[:40])
    return JSONResponse(resolve(url, payload.type))


# Some platforms call it /extract already - accept that too.
@app.post("/extract")
async def extract_alias(payload: ExtractRequest, _: None = Depends(check_auth), __: None = Depends(rate_limit)):
    return JSONResponse(resolve(payload.url.strip(), payload.type))


if __name__ == "__main__":  # local development
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", "8790")), reload=True)

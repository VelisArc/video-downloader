from http.server import BaseHTTPRequestHandler
import base64
import hashlib
import hmac
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
import yt_dlp
import shutil
import logging
import datetime
import random
import uuid
import tempfile
try:
    from cryptography.fernet import Fernet, InvalidToken
except Exception:
    Fernet = None
    InvalidToken = None

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth as firebase_auth
except Exception:
    firebase_admin = None
    credentials = None
    firestore = None
    firebase_auth = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Paths ---
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
TMP_DIR = (os.getenv('TMP_DIR', '') or '').strip() or tempfile.gettempdir()
# -------------

_firebase_inited = None
_firestore_client = None
_razorpay_keys_cache = None
# Replaces _usage_memory with file-based approach
_rate_memory = {}
_inflight = 0
_info_cache = {}
_cooldown_until = {}
_cookies_cache = {}

USAGE_DIR = os.path.join(TMP_DIR, 'user_data', 'usage')

def _int_env(name, default):
    raw = os.getenv(name, '').strip()
    if not raw:
        return default
    try:
        return int(raw)
    except Exception:
        return default

def _rate_limit_ok(ip):
    limit = _int_env('RATE_LIMIT_PER_MIN', 30)
    if limit <= 0:
        return True
    window_sec = 60
    now = time.time()
    bucket = _rate_memory.get(ip)
    if not bucket:
        bucket = []
        _rate_memory[ip] = bucket
    cutoff = now - window_sec
    while bucket and bucket[0] < cutoff:
        bucket.pop(0)
    if len(bucket) >= limit:
        return False
    bucket.append(now)
    return True

def _inflight_try_acquire():
    global _inflight
    max_inflight = _int_env('MAX_INFLIGHT', 3)
    if max_inflight <= 0:
        _inflight += 1
        return True
    if _inflight >= max_inflight:
        return False
    _inflight += 1
    return True

def _inflight_release():
    global _inflight
    if _inflight > 0:
        _inflight -= 1

def _cooldown_check(ip):
    if _int_env('COOLDOWN_SEC', 0) <= 0:
        return 0
    until = _cooldown_until.get(ip)
    if not until:
        return 0
    now = time.time()
    if now >= until:
        try:
            del _cooldown_until[ip]
        except Exception:
            pass
        return 0
    return int(until - now)

def _cooldown_set(ip, seconds):
    if int(seconds) <= 0:
        return
    try:
        _cooldown_until[ip] = time.time() + int(seconds)
    except Exception:
        return

def _random_user_agent():
    uas = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    ]
    return random.choice(uas)

def _is_temporary_block(error_msg):
    msg = (error_msg or '').lower()
    needles = [
        'please wait a few minutes',
        'try again later',
        'temporarily blocked',
        'feedback_required',
        'challenge_required',
        'rate limit',
        'rate-limit',
        'rate_limit',
        'too many requests',
        'requested content is not available, rate-limit reached',
        'rate-limit reached',
        'rate limit reached',
    ]
    return any(n in msg for n in needles)

def _normalize_media_url(raw_url):
    try:
        url = (raw_url or '').strip()
        if not url:
            return url
        parsed = urllib.parse.urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return url.split('#', 1)[0]
        netloc = parsed.netloc.lower()
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        path = (parsed.path or '').rstrip('/')
        query = parsed.query or ''

        if 'instagram.com' in netloc:
            is_share = '/share/' in (path + '/')
            if not is_share and query:
                tracking_keys = {
                    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                    'fbclid',
                    'igsh', 'igshid',
                }
                kept = []
                for k, v in urllib.parse.parse_qsl(query, keep_blank_values=True):
                    if (k or '').lower() in tracking_keys:
                        continue
                    kept.append((k, v))
                query = urllib.parse.urlencode(kept, doseq=True)
            return urllib.parse.urlunparse((parsed.scheme, netloc, path, '', query, ''))

        if 'facebook.com' in netloc or 'fb.watch' in netloc:
            return urllib.parse.urlunparse((parsed.scheme, netloc, path, '', query, ''))

        return urllib.parse.urlunparse((parsed.scheme, netloc, path, '', query, ''))
    except Exception:
        return (raw_url or '').strip()

def _cache_get(cache_key):
    ttl = _int_env('INFO_CACHE_TTL_SEC', 15)
    item = _info_cache.get(cache_key)
    if not item:
        return None
    ts, code, payload = item
    if time.time() - ts > ttl:
        try:
            del _info_cache[cache_key]
        except Exception:
            pass
        return None
    return code, payload

def _cache_set(cache_key, code, payload):
    try:
        if int(code) == 200:
            if not isinstance(payload, dict):
                return
            if not (payload.get('downloadUrl') or '').strip():
                return
        _info_cache[cache_key] = (time.time(), int(code), payload)
    except Exception:
        return

def _pick_thumbnail(info):
    if not isinstance(info, dict):
        return ''
    thumbs = info.get('thumbnails') or []
    best_url = ''
    best_score = -1
    for t in thumbs:
        if not isinstance(t, dict):
            continue
        url = (t.get('url') or '').strip()
        if not url:
            continue
        w = t.get('width') or 0
        h = t.get('height') or 0
        try:
            score = int(w) * int(h)
        except Exception:
            score = 0
        if score > best_score:
            best_score = score
            best_url = url
    
    # Fallback to 'thumbnail' key if no good candidate found from list
    if best_url:
        return best_url
    return (info.get('thumbnail') or '').strip()

def _safe_image_url(u):
    try:
        parsed = urllib.parse.urlparse(u or '')
        host = (parsed.netloc or '').lower()
        allowed = (
            'cdninstagram.com',
            'instagram.f',
            'scontent',
            'fbcdn.net',
            'facebook.com',
            'instagram.com',
        )
        return any(h in host for h in allowed)
    except Exception:
        return False

def _read_text_env(b64_name, txt_name):
    raw_b64 = (os.getenv(b64_name, '') or '').strip()
    raw_txt = (os.getenv(txt_name, '') or '').strip()
    if raw_b64:
        try:
            return base64.b64decode(raw_b64).decode('utf-8', errors='ignore')
        except Exception:
            return ''
    if raw_txt:
        return raw_txt
    return ''

def _write_cookiefile(cookie_text):
    if not cookie_text or not str(cookie_text).strip():
        return ''
    max_len = _int_env('MAX_COOKIE_TXT_LEN', 1048576)
    cookie_text = str(cookie_text)
    if max_len > 0 and len(cookie_text) > max_len:
        raise RuntimeError('Cookies file is too large')
    os.makedirs(TMP_DIR, exist_ok=True)
    path = os.path.join(TMP_DIR, f"cookies_{uuid.uuid4().hex}.txt")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(cookie_text)
    return path

def _load_cookies_for_url(url):
    u = (url or '').lower()
    if 'instagram.com' in u:
        return _read_text_env('INSTAGRAM_COOKIES_B64', 'INSTAGRAM_COOKIES_TXT')
    if 'facebook.com' in u or 'fb.watch' in u:
        return _read_text_env('FACEBOOK_COOKIES_B64', 'FACEBOOK_COOKIES_TXT')
    return ''

def _cookie_expiry_epoch(cookie_text):
    try:
        max_exp = 0
        lines = (cookie_text or '').splitlines()
        for ln in lines:
            ln = (ln or '').strip()
            if not ln or ln.startswith('#'):
                continue
            parts = ln.split('\t')
            if len(parts) < 7:
                continue
            raw_exp = parts[4].strip()
            try:
                exp = int(raw_exp)
            except Exception:
                exp = 0
            if exp > max_exp:
                max_exp = exp
        return max_exp or 0
    except Exception:
        return 0

def _validate_cookie_text(cookie_text):
    normalized = (cookie_text or '').strip()
    if not normalized:
        raise RuntimeError('Cookies are required')
    max_len = _int_env('MAX_COOKIE_TXT_LEN', 1048576)
    if max_len > 0 and len(normalized.encode('utf-8')) > max_len:
        raise RuntimeError('Cookies file is too large. Maximum size is 1 MB.')
    return normalized

def _fernet():
    if Fernet is None:
        raise RuntimeError('Encryption library not available')
    key = (os.getenv('COOKIES_FERNET_KEY', '') or os.getenv('COOKIES_ENCRYPTION_KEY', '')).strip()
    if not key:
        raise RuntimeError('Missing COOKIES_FERNET_KEY in Environment Variables')
    return Fernet(key.encode('utf-8'))

def _encrypt_text(plain_text):
    f = _fernet()
    token = f.encrypt(plain_text.encode('utf-8'))
    return token.decode('utf-8')

def _decrypt_text(token_text):
    f = _fernet()
    try:
        plain = f.decrypt(token_text.encode('utf-8'))
        return plain.decode('utf-8')
    except Exception:
        raise RuntimeError('Could not decrypt cookies. Please upload again.')

# --- Local Cookie Storage Helpers ---
COOKIES_DIR = os.path.join(TMP_DIR, 'user_data', 'cookies')
COOKIE_VAULT_VERSION = 2
PLATFORM_HOST_PATTERNS = {
    'instagram': ('instagram.com', 'cdninstagram.com'),
    'facebook': ('facebook.com', 'fb.watch', 'fbcdn.net', 'messenger.com'),
    'youtube': ('youtube.com', 'youtu.be', 'googlevideo.com', 'ytimg.com'),
    'tiktok': ('tiktok.com', 'tiktokcdn.com'),
    'twitter': ('twitter.com', 'x.com', 'twimg.com'),
    'reddit': ('reddit.com', 'redd.it', 'redditmedia.com'),
    'vimeo': ('vimeo.com', 'vimeocdn.com'),
    'dailymotion': ('dailymotion.com', 'dmcdn.net'),
    'twitch': ('twitch.tv', 'ttvnw.net'),
}

def _get_local_cookie_path(uid):
    if not uid:
        return None
    safe_uid = "".join(c for c in uid if c.isalnum() or c in ('-', '_'))
    return os.path.join(COOKIES_DIR, f"{safe_uid}.json")

def _normalize_cookie_domain(raw_domain):
    domain = (raw_domain or '').strip().lower()
    if not domain:
        return ''
    if domain.startswith('#http_only_'):
        domain = domain[len('#http_only_'):]
    return domain.lstrip('.')

def _cookie_domains(cookie_text):
    domains = set()
    try:
        for ln in (cookie_text or '').splitlines():
            ln = (ln or '').strip()
            if not ln:
                continue
            parts = ln.split('\t')
            if len(parts) < 7:
                continue
            domain = _normalize_cookie_domain(parts[0])
            if domain:
                domains.add(domain)
    except Exception:
        return []
    return sorted(domains)

def _detect_platform_from_host(host):
    normalized = _normalize_cookie_domain(host)
    if not normalized:
        return 'generic'
    for platform, patterns in PLATFORM_HOST_PATTERNS.items():
        if any(normalized == p or normalized.endswith('.' + p) for p in patterns):
            return platform
    return normalized.split(':', 1)[0]

def _detect_platform_from_domains(domains):
    for domain in domains or []:
        platform = _detect_platform_from_host(domain)
        if platform and platform != 'generic':
            return platform
    if domains:
        return _detect_platform_from_host(domains[0])
    return 'generic'

def _is_cookie_expired(item, now=None):
    now = int(now or time.time())
    exp = int((item or {}).get('expiresAtEpoch') or 0)
    return bool(exp and exp > 0 and now >= exp)

def _cookie_summary(item, now=None):
    summary = {
        'id': item.get('id'),
        'label': item.get('label') or 'Saved cookies',
        'platform': item.get('platform') or 'generic',
        'domains': item.get('domains') or [],
        'expiresAtEpoch': item.get('expiresAtEpoch'),
        'updatedAtEpoch': item.get('updatedAtEpoch'),
        'createdAtEpoch': item.get('createdAtEpoch'),
        'lastUsedAtEpoch': item.get('lastUsedAtEpoch'),
        'expired': _is_cookie_expired(item, now),
    }
    return summary

def _sort_cookie_items(items):
    return sorted(
        items or [],
        key=lambda item: (
            int((item or {}).get('lastUsedAtEpoch') or 0),
            int((item or {}).get('updatedAtEpoch') or 0),
            int((item or {}).get('createdAtEpoch') or 0),
        ),
        reverse=True,
    )

def _read_cookie_vault(uid):
    if not uid:
        return []
    cached = _cookies_cache.get(uid)
    if isinstance(cached, dict) and isinstance(cached.get('items'), list):
        return cached.get('items')

    path = _get_local_cookie_path(uid)
    if not path or not os.path.exists(path):
        return []

    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        items = []
        now = int(time.time())

        # Migrate legacy single-cookie payloads into the new vault structure.
        if isinstance(data, dict) and data.get('cookie_text'):
            cookie_text = data.get('cookie_text') or ''
            exp = int(data.get('expiresAtEpoch') or 0)
            updated = int(data.get('updatedAtEpoch') or now)
            domains = _cookie_domains(cookie_text)
            items.append({
                'id': uuid.uuid4().hex,
                'label': 'Imported cookie',
                'platform': _detect_platform_from_domains(domains),
                'domains': domains,
                'cookie_text': cookie_text,
                'expiresAtEpoch': exp if exp > 0 else None,
                'createdAtEpoch': updated,
                'updatedAtEpoch': updated,
                'lastUsedAtEpoch': None,
            })
        else:
            for raw_item in (data.get('items') or []):
                if not isinstance(raw_item, dict):
                    continue
                cookie_text = (raw_item.get('cookie_text') or '').strip()
                if not cookie_text:
                    continue
                domains = raw_item.get('domains')
                if not isinstance(domains, list) or not domains:
                    domains = _cookie_domains(cookie_text)
                created = int(raw_item.get('createdAtEpoch') or raw_item.get('updatedAtEpoch') or now)
                updated = int(raw_item.get('updatedAtEpoch') or created)
                items.append({
                    'id': raw_item.get('id') or uuid.uuid4().hex,
                    'label': (raw_item.get('label') or 'Saved cookies').strip()[:80],
                    'platform': raw_item.get('platform') or _detect_platform_from_domains(domains),
                    'domains': domains,
                    'cookie_text': cookie_text,
                    'expiresAtEpoch': int(raw_item.get('expiresAtEpoch') or 0) or None,
                    'createdAtEpoch': created,
                    'updatedAtEpoch': updated,
                    'lastUsedAtEpoch': int(raw_item.get('lastUsedAtEpoch') or 0) or None,
                })

        items = _sort_cookie_items(items)
        _cookies_cache[uid] = {'items': items}
        return items
    except Exception as e:
        logger.error(f"Failed to read local cookies for {uid}: {e}")
        return []

def _write_cookie_vault(uid, items):
    if not uid:
        raise RuntimeError('Login required')
    path = _get_local_cookie_path(uid)
    if not path:
        raise RuntimeError('Invalid User ID')

    try:
        os.makedirs(COOKIES_DIR, exist_ok=True)
        payload = {
            'version': COOKIE_VAULT_VERSION,
            'uid': uid,
            'updatedAtEpoch': int(time.time()),
            'items': _sort_cookie_items(items),
        }
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(payload, f, indent=2)
        _cookies_cache[uid] = {'items': payload['items']}
        return payload['items']
    except Exception as e:
        logger.error(f"Failed to save cookies locally: {e}")
        raise RuntimeError(f"Could not save cookies: {str(e)}")

def _get_user_cookies(uid):
    items = _read_cookie_vault(uid)
    now = int(time.time())
    for item in items:
        if not _is_cookie_expired(item, now):
            return item.get('cookie_text'), int(item.get('expiresAtEpoch') or 0), int(item.get('updatedAtEpoch') or 0)
    return None

def _save_user_cookie(uid, cookie_text, label=None, max_items=0):
    if not uid:
        raise RuntimeError('Login required')
    cookie_text = _validate_cookie_text(cookie_text)

    items = _read_cookie_vault(uid)
    if max_items and max_items > 0 and len(items) >= max_items:
        raise RuntimeError(f'Cookie vault limit reached. You can save up to {max_items} cookies on this plan. Delete one first or upgrade for more slots.')
    now = int(time.time())
    domains = _cookie_domains(cookie_text)
    label = (label or '').strip()[:80]
    if not label:
        platform_label = _detect_platform_from_domains(domains)
        label = f"{platform_label.title()} cookie {len(items) + 1}"

    entry = {
        'id': uuid.uuid4().hex,
        'label': label,
        'platform': _detect_platform_from_domains(domains),
        'domains': domains,
        'cookie_text': cookie_text,
        'expiresAtEpoch': _cookie_expiry_epoch(cookie_text) or None,
        'createdAtEpoch': now,
        'updatedAtEpoch': now,
        'lastUsedAtEpoch': None,
    }
    items.insert(0, entry)
    _write_cookie_vault(uid, items)
    return entry

def _delete_user_cookies(uid, entry_id=None, expired_only=False):
    if not uid:
        raise RuntimeError('Login required')
    items = _read_cookie_vault(uid)
    if not items:
        return 0

    now = int(time.time())
    if expired_only:
        next_items = [item for item in items if not _is_cookie_expired(item, now)]
    elif entry_id:
        next_items = [item for item in items if item.get('id') != entry_id]
    else:
        next_items = []

    removed = max(len(items) - len(next_items), 0)
    if next_items:
        _write_cookie_vault(uid, next_items)
    else:
        path = _get_local_cookie_path(uid)
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass
        _cookies_cache.pop(uid, None)
    return removed

def _mark_user_cookie_used(uid, entry_id):
    if not uid or not entry_id:
        return
    items = _read_cookie_vault(uid)
    changed = False
    now = int(time.time())
    for item in items:
        if item.get('id') == entry_id:
            item['lastUsedAtEpoch'] = now
            item['updatedAtEpoch'] = now
            changed = True
            break
    if changed:
        try:
            _write_cookie_vault(uid, items)
        except Exception:
            return

def _cookie_matches_host(item, host):
    normalized_host = _normalize_cookie_domain(host)
    if not normalized_host:
        return False
    for domain in item.get('domains') or []:
        normalized_domain = _normalize_cookie_domain(domain)
        if not normalized_domain:
            continue
        if normalized_host == normalized_domain or normalized_host.endswith('.' + normalized_domain):
            return True
    return False

def _get_matching_user_cookies(uid, url):
    parsed = urllib.parse.urlparse(url or '')
    host = _normalize_cookie_domain(parsed.netloc or '')
    platform = _detect_platform_from_host(host)
    now = int(time.time())
    items = [item for item in _read_cookie_vault(uid) if not _is_cookie_expired(item, now)]
    if not items:
        return []

    exact = [item for item in items if _cookie_matches_host(item, host)]
    platform_matches = [
        item for item in items
        if item not in exact and (item.get('platform') or '') == platform
    ]
    fallback = [item for item in items if item not in exact and item not in platform_matches]
    return _sort_cookie_items(exact) + _sort_cookie_items(platform_matches) + _sort_cookie_items(fallback)

def _payment_currency():
    cur = os.getenv('PAYMENT_CURRENCY', '').strip().upper()
    return cur if cur else 'INR'

def _monthly_amount_subunits():
    raw = os.getenv('MONTHLY_AMOUNT', '').strip()
    if raw:
        try:
            return int(raw)
        except Exception:
            pass
    return 19900 if _payment_currency() == 'INR' else 200

def _lifetime_amount_subunits():
    raw = os.getenv('LIFETIME_AMOUNT', '').strip()
    if raw:
        try:
            return int(raw)
        except Exception:
            pass
    return 99900 if _payment_currency() == 'INR' else 2000

def _format_money(amount_subunits, currency):
    symbol = '₹' if currency == 'INR' else ('$' if currency == 'USD' else currency + ' ')
    major = amount_subunits / 100.0
    if currency == 'INR':
        return f"{symbol}{int(round(major))}"
    return f"{symbol}{major:.2f}".rstrip('0').rstrip('.')

def _format_money_safe(amount_subunits, currency):
    symbol = 'Rs' if currency == 'INR' else ('$' if currency == 'USD' else currency + ' ')
    major = amount_subunits / 100.0
    if currency == 'INR':
        return f"{symbol}{int(round(major))}"
    return f"{symbol}{major:.2f}".rstrip('0').rstrip('.')

def _ensure_firebase_admin():
    global _firebase_inited
    if _firebase_inited is not None:
        return _firebase_inited
    if firebase_admin is None:
        _firebase_inited = False
        return _firebase_inited
    try:
        if not firebase_admin._apps:
            admin_json_b64 = os.getenv('FIREBASE_ADMIN_JSON_B64', '').strip()
            admin_json = os.getenv('FIREBASE_ADMIN_JSON', '').strip()
            if not admin_json and admin_json_b64:
                try:
                    admin_json = base64.b64decode(admin_json_b64).decode('utf-8').strip()
                except Exception as e:
                    logger.error(f"Firebase admin JSON base64 decode failed: {e}")
            
            # Fallback to local file if no env var
            if not admin_json:
                local_key_path = os.path.join(CURRENT_DIR, 'serviceAccountKey.local.json')
                if os.path.exists(local_key_path):
                    with open(local_key_path, 'r', encoding='utf-8') as f:
                        admin_json = f.read().strip()

            if not admin_json:
                _firebase_inited = False
                return _firebase_inited
            if admin_json:
                cred = credentials.Certificate(json.loads(admin_json))
                firebase_admin.initialize_app(cred)
        _firebase_inited = True
        return _firebase_inited
    except Exception as e:
        logger.error(f"Firebase init failed: {e}")
        _firebase_inited = False
        return _firebase_inited

def _get_firestore_client():
    global _firestore_client
    if _firestore_client is not None:
        return _firestore_client
    if firebase_admin is None or firestore is None:
        _firestore_client = False
        return _firestore_client
    if not _ensure_firebase_admin():
        _firestore_client = False
        return _firestore_client
    try:
        _firestore_client = firestore.client()
        return _firestore_client
    except Exception as e:
        logger.error(f"Firestore init failed: {e}")
        _firestore_client = False
        return _firestore_client

def _load_razorpay_keys():
    global _razorpay_keys_cache
    if _razorpay_keys_cache is not None:
        return _razorpay_keys_cache
    key_id = os.getenv('RAZORPAY_KEY_ID', '').strip()
    key_secret = os.getenv('RAZORPAY_KEY_SECRET', '').strip()
    if key_id and key_secret:
        _razorpay_keys_cache = (key_id, key_secret)
        return _razorpay_keys_cache
    csv_inline = os.getenv('RAZORPAY_KEYS_CSV', '').strip()
    if csv_inline and ',' in csv_inline:
        parts = [p.strip() for p in csv_inline.split(',', 1)]
        if len(parts) == 2 and parts[0] and parts[1]:
            _razorpay_keys_cache = (parts[0], parts[1])
            return _razorpay_keys_cache

    csv_path = os.path.join(ROOT_DIR, 'rzp-key.local.csv')
    try:
        if os.path.exists(csv_path):
            with open(csv_path, 'r', encoding='utf-8') as f:
                lines = [ln.strip() for ln in f.read().splitlines() if ln.strip()]
            if len(lines) >= 2:
                parts = [p.strip() for p in lines[1].split(',')]
                if len(parts) >= 2 and parts[0] and parts[1]:
                    _razorpay_keys_cache = (parts[0], parts[1])
                    return _razorpay_keys_cache
    except Exception:
        pass

    _razorpay_keys_cache = (None, None)
    return _razorpay_keys_cache

def _cookies_feature_enabled(entitlement):
    plan = (entitlement or {}).get('plan') or 'guest'
    return plan in ('user', 'monthly', 'lifetime')

def _cookie_vault_limit(entitlement):
    plan = (entitlement or {}).get('plan') or 'guest'
    if plan == 'user':
        return 2
    if plan in ('monthly', 'lifetime'):
        return _int_env('PREMIUM_COOKIE_VAULT_LIMIT', 0)
    return 0

def _is_auth_related_error(error_msg):
    msg = (error_msg or '').lower()
    needles = [
        'login required',
        'this video is private',
        'private video',
        'sign in',
        'cookies-from-browser',
        '--cookies',
        'pass cookies',
        'authentication',
        'requested content is not available',
        'members only',
    ]
    return any(needle in msg for needle in needles)

def _rzp_request(method, path, payload=None, query=None):
    key_id, key_secret = _load_razorpay_keys()
    if not key_id or not key_secret:
        raise RuntimeError("Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Environment Variables.")
    base_url = "https://api.razorpay.com/v1"
    url = base_url + path
    if query:
        url = url + "?" + urllib.parse.urlencode(query)
    auth_str = f"{key_id}:{key_secret}".encode("utf-8")
    auth_header = base64.b64encode(auth_str).decode("utf-8")
    data_bytes = None
    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/json",
    }
    if payload is not None:
        data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_bytes, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if hasattr(e, "read") else ""
        try:
            parsed = json.loads(body) if body else {}
        except Exception:
            parsed = {"error": {"description": body or str(e)}}
        raise RuntimeError(parsed.get("error", {}).get("description", str(e)))

def _hmac_sha256_hex(secret, message):
    return hmac.new(secret.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).hexdigest()

def _utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

def _utc_today_key():
    return _utc_now().strftime('%Y-%m-%d')

def _get_allowed_origin(request_origin=None):
    allowed = (os.getenv('ALLOWED_ORIGINS', '') or '').strip()
    if not allowed:
        return '*'
    origins = [o.strip() for o in allowed.split(',') if o.strip()]
    if not origins:
        return '*'
    if request_origin and request_origin in origins:
        return request_origin
    return origins[0]

class handler(BaseHTTPRequestHandler):
    
    def _copy_cookies(self):
        return

    def _is_valid_url(self, url):
        try:
            parsed = urllib.parse.urlparse((url or '').strip())
            return parsed.scheme in ('http', 'https') and bool(parsed.netloc)
        except Exception:
            return False

    def do_POST(self):
        try:
            route = (self.path or '').split('?', 1)[0]
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode('utf-8')
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self.send_error_json(400, 'Invalid JSON body')
                return

            if route.endswith('/rzp-webhook'):
                return self._handle_rzp_webhook(body)
            if route.endswith('/create-subscription'):
                return self._handle_create_subscription(data)
            if route.endswith('/create-order'):
                return self._handle_create_order(data)
            if route.endswith('/verify-payment'):
                return self._handle_verify_payment(data)
            if route.endswith('/cookies'):
                auth_ctx = self._require_user()
                if not auth_ctx:
                    return
                entitlement = self._get_entitlement(auth_ctx.get('uid'))
                if not _cookies_feature_enabled(entitlement):
                    self.send_error_json(403, 'Login is required to save cookies.')
                    return
                cookie_limit = _cookie_vault_limit(entitlement)
                cookies_b64 = (data.get('cookiesB64') or '').strip()
                cookies_txt = (data.get('cookiesTxt') or '').strip()
                label = (data.get('label') or '').strip()
                cookie_text = ''
                if cookies_b64:
                    try:
                        cookie_text = base64.b64decode(cookies_b64).decode('utf-8', errors='ignore')
                    except Exception:
                        self.send_error_json(400, 'Invalid cookiesB64')
                        return
                else:
                    cookie_text = cookies_txt
                try:
                    cookie_text = _validate_cookie_text(cookie_text)
                except Exception as e:
                    self.send_error_json(400, str(e))
                    return
                # Relaxed expiry check - let yt-dlp decide
                # exp = _cookie_expiry_epoch(cookie_text)
                # if exp and exp > 0 and int(time.time()) >= int(exp):
                #     self.send_error_json(400, 'Cookies are expired. Upload new cookies.txt')
                #     return

                try:
                    item = _save_user_cookie(auth_ctx['uid'], cookie_text, label=label, max_items=cookie_limit)
                except Exception as e:
                    self.send_error_json(400, str(e))
                    return
                items = _read_cookie_vault(auth_ctx['uid'])
                active_count = len([entry for entry in items if not _is_cookie_expired(entry)])
                remaining_slots = None if cookie_limit <= 0 else max(cookie_limit - len(items), 0)
                self.send_json({
                    'ok': True,
                    'item': _cookie_summary(item),
                    'count': len(items),
                    'activeCount': active_count,
                    'maxCount': None if cookie_limit <= 0 else cookie_limit,
                    'remainingSlots': remaining_slots,
                })
                return

            if route not in ('/api', '/api/'):
                self.send_error_json(404, 'Not Found')
                return

            ip = self._get_client_ip()
            wait_s = _cooldown_check(ip)
            if wait_s > 0:
                self.send_error_json(429, f'Service is temporarily rate-limited. Please wait {wait_s}s and try again.')
                return
            if not _rate_limit_ok(ip):
                self.send_error_json(429, 'Too many requests. Please wait and try again.')
                return

            url = data.get('url', '').strip()
            download_type = data.get('type', 'video').lower()
            use_cookies = bool(data.get('useCookies'))

            if not url:
                self.send_error_json(400, 'URL is required')
                return

            if not self._is_valid_url(url):
                self.send_error_json(400, 'Please enter a valid public video URL.')
                return

            normalized_url = _normalize_media_url(url)
            cache_key = f"{download_type}:{normalized_url}"
            cached = _cache_get(cache_key)
            if cached:
                code, payload = cached
                if int(code) == 200:
                    self.send_json(payload)
                else:
                    self.send_error_json(int(code), str(payload))
                return

            auth_ctx = self._get_auth_context()
            entitlement = self._get_entitlement(auth_ctx.get('uid') if auth_ctx else None)
            is_unlimited = bool(entitlement.get('unlimited'))
            cookies_enabled = _cookies_feature_enabled(entitlement)
            limit = self._daily_limit_for_entitlement(entitlement, auth_ctx.get('uid') if auth_ctx else None)
            allowed, remaining = self._reserve_quota(auth_ctx.get('uid') if auth_ctx else None, limit)
            if not allowed:
                self.send_error_json(429, 'Daily download limit reached. Please login or upgrade to Premium.')
                return
            if use_cookies and not cookies_enabled:
                self.send_error_json(403, 'Login is required before using saved cookies.')
                return
            url_for_extract = url.split('#', 1)[0].strip()
            cookie_candidates = []
            try:
                if use_cookies:
                    cookies_b64 = (data.get('cookiesB64') or '').strip()
                    cookies_txt = (data.get('cookiesTxt') or '').strip()
                    cookie_text = ''
                    if cookies_b64:
                        try:
                            cookie_text = base64.b64decode(cookies_b64).decode('utf-8', errors='ignore')
                        except Exception:
                            cookie_text = ''
                    elif cookies_txt:
                        cookie_text = cookies_txt
                    if cookie_text:
                        cookie_text = _validate_cookie_text(cookie_text)
                        cookie_candidates.append({
                            'id': None,
                            'label': 'Temporary session',
                            'platform': _detect_platform_from_host(urllib.parse.urlparse(url_for_extract).netloc or ''),
                            'domains': _cookie_domains(cookie_text),
                            'cookie_text': cookie_text,
                            'expiresAtEpoch': _cookie_expiry_epoch(cookie_text) or None,
                            'createdAtEpoch': int(time.time()),
                            'updatedAtEpoch': int(time.time()),
                            'lastUsedAtEpoch': None,
                        })
                    if auth_ctx and auth_ctx.get('uid'):
                        cookie_candidates.extend(_get_matching_user_cookies(auth_ctx.get('uid'), url_for_extract))
                    env_cookie_text = _load_cookies_for_url(url_for_extract)
                    if env_cookie_text:
                        cookie_candidates.append({
                            'id': None,
                            'label': 'Environment cookie',
                            'platform': _detect_platform_from_host(urllib.parse.urlparse(url_for_extract).netloc or ''),
                            'domains': _cookie_domains(env_cookie_text),
                            'cookie_text': env_cookie_text,
                            'expiresAtEpoch': _cookie_expiry_epoch(env_cookie_text) or None,
                            'createdAtEpoch': int(time.time()),
                            'updatedAtEpoch': int(time.time()),
                            'lastUsedAtEpoch': None,
                        })
                    if not cookie_candidates:
                        self.send_error_json(400, 'No saved or uploaded cookies matched this link. Add cookies for this platform first.')
                        return
            except Exception as e:
                self.send_error_json(400, str(e))
                return
            
            # Determine Format Strategy
            if download_type == 'audio':
                format_str = 'bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio/best[acodec!=none]'
            else:
                format_str = 'best[vcodec!=none][acodec!=none][ext=mp4]/best[vcodec!=none][acodec!=none][ext=webm]/best[vcodec!=none][acodec!=none]/best'

            opts = {
                'quiet': True,
                'no_warnings': True,
                'format': format_str,
                'socket_timeout': 30,
                'retries': 10,
                'fragment_retries': 10,
                'nocheckcertificate': True,
                'user_agent': _random_user_agent(),
                'cachedir': os.path.join(TMP_DIR, 'yt-dlp-cache'),
                'http_headers': {
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                'extractor_args': {
                    'instagram': {
                        'skip': ['dash'],
                    }
                },
                'geo_bypass': True,
                'geo_bypass_country': 'US',
                'sleep_interval': 1,
                'max_sleep_interval': 3,
                'ignore_no_formats_error': True,
            }
            if 'instagram.com' in (url_for_extract or ''):
                opts['http_headers']['Referer'] = 'https://www.instagram.com/'
            if 'facebook.com' in (url_for_extract or '') or 'fb.watch' in (url_for_extract or ''):
                opts['http_headers']['Referer'] = 'https://www.facebook.com/'
            if not _inflight_try_acquire():
                self.send_error_json(429, 'Server is busy. Please retry in a few seconds.')
                return
            info = None
            selected_cookie = None
            last_cookie_error = None
            try:
                attempts = [None] + cookie_candidates if use_cookies else [None]
                for attempt in attempts:
                    request_cookiefile = ''
                    run_opts = dict(opts)
                    run_opts['http_headers'] = dict(opts.get('http_headers') or {})
                    if attempt and attempt.get('cookie_text'):
                        request_cookiefile = _write_cookiefile(attempt.get('cookie_text'))
                        run_opts['cookiefile'] = request_cookiefile
                    try:
                        with yt_dlp.YoutubeDL(run_opts) as ydl:
                            info = ydl.extract_info(url_for_extract, download=False)
                        selected_cookie = attempt
                        if auth_ctx and auth_ctx.get('uid') and attempt and attempt.get('id'):
                            _mark_user_cookie_used(auth_ctx.get('uid'), attempt.get('id'))
                        break
                    except yt_dlp.utils.DownloadError as e:
                        last_cookie_error = e
                        if use_cookies and _is_auth_related_error(str(e)):
                            continue
                        raise
                    finally:
                        if request_cookiefile:
                            try:
                                os.remove(request_cookiefile)
                            except Exception:
                                pass
                if info is None and last_cookie_error:
                    raise last_cookie_error
            finally:
                _inflight_release()

            # --- Extraction & Fallback Strategy ---
            video_url = info.get('url')
            file_ext = info.get('ext', 'mp4') if download_type == 'video' else info.get('ext', 'm4a')
            protocol = str(info.get('protocol', ''))

            original_url = video_url
            original_ext = file_ext

            is_playlist = 'm3u8' in file_ext or 'm3u8' in protocol

            if not video_url or is_playlist:
                found_better = False
                formats = info.get('formats', [])

                for f in reversed(formats):
                    f_protocol = str(f.get('protocol', ''))
                    is_direct_link = 'http' in f_protocol
                    
                    if not is_direct_link:
                        continue

                    has_audio = f.get('acodec') != 'none'
                    has_video = f.get('vcodec') != 'none'

                    if download_type == 'audio':
                        if has_audio:
                            video_url = f['url']
                            file_ext = f.get('ext', 'm4a')
                            found_better = True
                            break
                    else:
                        if has_audio and has_video:
                            video_url = f['url']
                            file_ext = f.get('ext', 'mp4')
                            found_better = True
                            break

                if not found_better and original_url:
                    video_url = original_url
                    file_ext = original_ext

            if not video_url:
                msg = 'Direct link not found.'
                if download_type == 'audio':
                    msg += ' Could not find a suitable audio stream.'
                else:
                    msg += ' This format is not currently supported.'
                self.send_error_json(500, msg)
                return

            # Extract additional metadata
            duration_seconds = info.get('duration')
            duration_string = str(datetime.timedelta(seconds=duration_seconds)) if duration_seconds else 'Unknown'
            
            view_count = info.get('view_count', 0)
            if view_count:
                if view_count >= 1000000:
                    view_count_str = f"{view_count / 1000000:.1f}M"
                elif view_count >= 1000:
                    view_count_str = f"{view_count / 1000:.1f}K"
                else:
                    view_count_str = str(view_count)
            else:
                view_count_str = 'N/A'

            # Better Title Extraction
            title = (info.get('title') or '').strip()
            if not title or title.lower() in ('video', 'untitled'):
                title = (info.get('fulltitle') or '').strip()
            if not title:
                title = (info.get('description') or '').strip().split('\n')[0][:100]
            if not title:
                title = f"Video-{info.get('id', 'download')}"

            # Force correct extension for audio
            if download_type == 'audio':
                # Map common audio codecs/extensions to user-friendly ones if needed
                # But mostly just trust the extracted ext, ensuring it's audio-like
                if file_ext not in ('mp3', 'm4a', 'wav', 'aac'):
                    file_ext = 'mp3' # Fallback attempt, though actual content might differ

            thumbnail_url = _pick_thumbnail(info)
            response_data = {
                'title': title[:150],
                'thumbnail': (
                    ('/api/thumb?src=' + urllib.parse.quote(thumbnail_url, safe=''))
                    if thumbnail_url and _safe_image_url(thumbnail_url)
                    else thumbnail_url
                ),
                'downloadUrl': video_url,
                'ext': file_ext,
                'type': download_type,
                'platform': _detect_platform_from_host(urllib.parse.urlparse(url_for_extract).netloc or ''),
                'uploader': info.get('uploader', 'Unknown Author'),
                'duration': duration_string,
                'view_count': view_count_str,
                'cookieMatch': _cookie_summary(selected_cookie) if selected_cookie else None,
                'quota': {
                    'plan': entitlement.get('plan', 'free'),
                    'unlimited': is_unlimited,
                    'dailyLimit': limit,
                    'remaining': remaining
                }
            }
            _cache_set(cache_key, 200, response_data)
            self.send_json(response_data)

        except yt_dlp.utils.DownloadError as e:
            logger.error(f"Download failed: {e}")
            error_msg = str(e).lower()
            if _is_temporary_block(error_msg):
                cooldown = _int_env('COOLDOWN_SEC', 0)
                if cooldown > 0:
                    _cooldown_set(ip, cooldown)
                    self.send_error_json(429, f'The source platform is temporarily blocking requests. Please wait {cooldown}s and try again.')
                else:
                    self.send_error_json(429, 'The source platform is temporarily blocking requests. Please wait and try again.')
                return
            if 'rate-limit reached' in error_msg or 'rate limit reached' in error_msg:
                self.send_error_json(429, 'The source platform rate limit was reached. Please wait and try again.')
                return
            if 'cookies-from-browser' in error_msg or '--cookies' in error_msg or 'pass cookies' in error_msg:
                self.send_error_json(403, 'This link requires login. Enable Cookies Mode and add your cookies.txt file (Netscape format).')
                return
            if 'login required' in error_msg:
                self.send_error_json(403, 'This link appears to require login. If you are already allowed to view it, try Cookies Mode with a fresh cookies.txt export.')
            elif 'unavailable for certain audiences' in error_msg or 'may be inappropriate' in error_msg or 'inappropriate' in error_msg or 'age-restricted' in error_msg or 'age restricted' in error_msg:
                self.send_error_json(403, 'This video is unavailable due to age/audience restrictions. Only public, unrestricted links are supported.')
            elif 'not available in your country' in error_msg or 'not available in your region' in error_msg or 'geo' in error_msg and 'blocked' in error_msg:
                self.send_error_json(403, 'This video is not available in this region. Try a different public link.')
            elif 'requested format is not available' in error_msg:
                self.send_error_json(500, 'Format error. Try different format or video.')
            else:
                self.send_error_json(500, f'Download failed: {str(e)}')
        except Exception as e:
            logger.error(f"Server error: {e}")
            msg = str(e)
            error_msg = msg.lower()
            if _is_temporary_block(error_msg):
                cooldown = _int_env('COOLDOWN_SEC', 0)
                if cooldown > 0:
                    _cooldown_set(ip, cooldown)
                    self.send_error_json(429, f'The source platform is temporarily blocking requests. Please wait {cooldown}s and try again.')
                else:
                    self.send_error_json(429, 'The source platform is temporarily blocking requests. Please wait and try again.')
                return
            if 'rate-limit reached' in error_msg or 'rate limit reached' in error_msg:
                self.send_error_json(429, 'The source platform rate limit was reached. Please wait and try again.')
                return
            if 'cookies-from-browser' in error_msg or '--cookies' in error_msg or 'pass cookies' in error_msg:
                self.send_error_json(403, 'This link requires login. Enable Cookies Mode and add your cookies.txt file (Netscape format).')
                return
            if 'unavailable for certain audiences' in error_msg or 'may be inappropriate' in error_msg or 'inappropriate' in error_msg or 'age-restricted' in error_msg or 'age restricted' in error_msg:
                self.send_error_json(403, 'This video is unavailable due to age/audience restrictions. Only public, unrestricted links are supported.')
                return
            if 'login required' in error_msg:
                self.send_error_json(403, 'This link appears to require login. If you are already allowed to view it, try Cookies Mode with a fresh cookies.txt export.')
                return
            if 'not available in your country' in error_msg or 'not available in your region' in error_msg or ('geo' in error_msg and 'blocked' in error_msg):
                self.send_error_json(403, 'This video is not available in this region. Try a different public link.')
                return
            self.send_error_json(500, f'Server error: {msg}')

    def do_GET(self):
        try:
            route = (self.path or '').split('?', 1)[0]
            if route.endswith('/health'):
                self.send_json({'ok': True, 'ts': int(time.time())})
                return
            if route.endswith('/thumb'):
                qs = urllib.parse.urlparse(self.path).query
                q = dict(urllib.parse.parse_qsl(qs, keep_blank_values=True))
                src = (q.get('src') or '').strip()
                if not src or not _safe_image_url(src):
                    self.send_error_json(400, 'Invalid thumbnail URL')
                    return
                req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    body = resp.read()
                    ctype = resp.headers.get('Content-Type') or 'image/jpeg'
                self.send_response(200)
                self.send_header('Content-Type', ctype)
                self.send_header('Cache-Control', 'public, max-age=300')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(body)
                return
            if route.endswith('/cookies'):
                decoded, err = self._verify_bearer_token()
                if err or not decoded or not decoded.get('uid'):
                    self.send_json({
                        'requiresLogin': True,
                        'canUseCookies': False,
                        'plan': 'guest',
                        'hasCookies': False,
                        'items': [],
                        'totalCount': 0,
                        'activeCount': 0,
                        'expiredCount': 0,
                        'maxCount': 0,
                        'remainingSlots': 0,
                    })
                    return
                uid = decoded.get('uid')
                entitlement = self._get_entitlement(uid)
                can_use_cookies = _cookies_feature_enabled(entitlement)
                cookie_limit = _cookie_vault_limit(entitlement)
                if not can_use_cookies:
                    self.send_json({
                        'requiresLogin': False,
                        'canUseCookies': False,
                        'plan': entitlement.get('plan', 'user'),
                        'hasCookies': False,
                        'items': [],
                        'totalCount': 0,
                        'activeCount': 0,
                        'expiredCount': 0,
                        'maxCount': 0,
                        'remainingSlots': 0,
                    })
                    return

                items = _read_cookie_vault(uid)
                now = int(time.time())
                summaries = [_cookie_summary(item, now) for item in items]
                active_count = len([item for item in items if not _is_cookie_expired(item, now)])
                expired_count = len(summaries) - active_count
                self.send_json({
                    'requiresLogin': False,
                    'canUseCookies': True,
                    'plan': entitlement.get('plan', 'user'),
                    'hasCookies': bool(summaries),
                    'items': summaries,
                    'totalCount': len(summaries),
                    'activeCount': active_count,
                    'expiredCount': expired_count,
                    'maxCount': None if cookie_limit <= 0 else cookie_limit,
                    'remainingSlots': None if cookie_limit <= 0 else max(cookie_limit - len(summaries), 0),
                })
                return
            if route.endswith('/config'):
                key_id, _ = _load_razorpay_keys()
                auth_configured = bool(firebase_auth is not None and _ensure_firebase_admin())
                fs = _get_firestore_client()
                firestore_configured = bool(fs and fs is not False)
                currency = _payment_currency()
                monthly_amount = _monthly_amount_subunits()
                lifetime_amount = _lifetime_amount_subunits()
                self.send_json({
                    'razorpayKeyId': key_id,
                    'razorpayConfigured': bool(key_id),
                    'authConfigured': auth_configured,
                    'firestoreConfigured': firestore_configured,
                    'currency': currency,
                    'monthlyAmount': monthly_amount,
                    'lifetimeAmount': lifetime_amount,
                    'monthlyDisplay': _format_money_safe(monthly_amount, currency),
                    'lifetimeDisplay': _format_money_safe(lifetime_amount, currency),
                    'guestDailyLimit': _int_env('GUEST_DAILY_LIMIT', 1),
                    'userDailyLimit': _int_env('USER_DAILY_LIMIT', 3),
                    'monthlyDailyLimit': _int_env('MONTHLY_DAILY_LIMIT', 0),
                    'lifetimeDailyLimit': _int_env('LIFETIME_DAILY_LIMIT', 0),
                })
                return
            if route.endswith('/payment-config'):
                key_id, _ = _load_razorpay_keys()
                self.send_json({
                    'razorpayKeyId': key_id,
                    'razorpayConfigured': bool(key_id),
                })
                return
            if route.endswith('/me'):
                decoded, err = self._verify_bearer_token()
                auth_ctx = {'uid': decoded.get('uid'), 'email': decoded.get('email')} if decoded else None
                auth_configured = bool(firebase_auth is not None and _ensure_firebase_admin())
                ent = self._get_entitlement(auth_ctx.get('uid') if auth_ctx else None)
                daily_limit = self._daily_limit_for_entitlement(ent, auth_ctx.get('uid') if auth_ctx else None)
                self.send_json({
                    'uid': auth_ctx.get('uid') if auth_ctx else None,
                    'plan': ent.get('plan', 'guest'),
                    'unlimited': bool(ent.get('unlimited')),
                    'dailyLimit': daily_limit,
                    'authConfigured': auth_configured,
                    'authError': err if err not in (None, 'missing', 'invalid_header', 'empty_token') else None
                })
                return
            self.send_error_json(404, 'Not Found')
        except Exception as e:
            logger.error(f"Server error: {e}")
            self.send_error_json(500, f'Server error: {str(e)}')

    def do_OPTIONS(self):
        origin = self.headers.get('Origin', '')
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', _get_allowed_origin(origin))
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Razorpay-Signature')
        self.end_headers()

    def do_DELETE(self):
        try:
            route = (self.path or '').split('?', 1)[0]
            if not route.endswith('/cookies'):
                self.send_error_json(404, 'Not Found')
                return
            auth_ctx = self._require_user()
            if not auth_ctx:
                return
            parsed = urllib.parse.urlparse(self.path or '')
            query = dict(urllib.parse.parse_qsl(parsed.query, keep_blank_values=True))
            entry_id = (query.get('id') or '').strip()
            expired_only = (query.get('expiredOnly') or '').strip().lower() in ('1', 'true', 'yes')
            try:
                removed = _delete_user_cookies(auth_ctx['uid'], entry_id=entry_id or None, expired_only=expired_only)
            except Exception as e:
                self.send_error_json(500, str(e))
                return
            items = _read_cookie_vault(auth_ctx['uid'])
            now = int(time.time())
            active_count = len([item for item in items if not _is_cookie_expired(item, now)])
            entitlement = self._get_entitlement(auth_ctx['uid'])
            cookie_limit = _cookie_vault_limit(entitlement)
            self.send_json({
                'ok': True,
                'removed': removed,
                'items': [_cookie_summary(item, now) for item in items],
                'totalCount': len(items),
                'activeCount': active_count,
                'expiredCount': len(items) - active_count,
                'maxCount': None if cookie_limit <= 0 else cookie_limit,
                'remainingSlots': None if cookie_limit <= 0 else max(cookie_limit - len(items), 0),
            })
        except Exception as e:
            self.send_error_json(500, f'Server error: {str(e)}')

    def _cors_origin(self):
        origin = self.headers.get('Origin', '') if hasattr(self, 'headers') else ''
        return _get_allowed_origin(origin)

    def send_json(self, data, code=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', self._cors_origin())
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, code, msg):
        body = json.dumps({'error': msg}).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', self._cors_origin())
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def _get_client_ip(self):
        forwarded = self.headers.get('x-forwarded-for') or self.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0].strip()
        real_ip = self.headers.get('x-real-ip') or self.headers.get('X-Real-IP')
        if real_ip:
            return real_ip.strip()
        return (self.client_address[0] if self.client_address else '0.0.0.0')

    def _verify_bearer_token(self):
        header = self.headers.get('Authorization', '')
        if not header:
            return None, 'missing'
        parts = header.split(' ', 1)
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None, 'invalid_header'
        token = parts[1].strip()
        if not token:
            return None, 'empty_token'
        
        # LOCAL AUTH BYPASS
        if token.startswith('client:') or token == 'local_token':
            uid = token.split(':', 1)[1] if ':' in token else 'local_admin'
            return {'uid': uid, 'email': f"{uid}@local.test"}, None

        if firebase_auth is None:
            return None, 'auth_lib_missing'
        if not _ensure_firebase_admin():
            return None, 'auth_not_configured'
        try:
            decoded = firebase_auth.verify_id_token(token)
            return decoded, None
        except Exception as e:
            msg = str(e).lower()
            if 'token expired' in msg or 'expired' in msg:
                return None, 'token_expired'
            if 'incorrect "aud"' in msg or 'incorrect aud' in msg or 'audience' in msg:
                return None, 'project_mismatch'
            if 'issuer' in msg and 'incorrect' in msg:
                return None, 'project_mismatch'
            return None, 'invalid_token'

    def _get_auth_context(self):
        decoded, err = self._verify_bearer_token()
        if err or not decoded:
            return None
        return {
            'uid': decoded.get('uid'),
            'email': decoded.get('email')
        }

    def _get_entitlement(self, uid):
        if not uid:
            return {'plan': 'guest', 'unlimited': False}
        fs = _get_firestore_client()
        if not fs:
            return {'plan': 'user', 'unlimited': False}
        try:
            doc = fs.collection('entitlements').document(uid).get()
            if not doc.exists:
                return {'plan': 'user', 'unlimited': False}
            data = doc.to_dict() or {}
            plan = data.get('plan', 'user')
            if plan == 'lifetime':
                return {'plan': 'lifetime', 'unlimited': True}
            if plan == 'monthly':
                expires_at = data.get('expiresAt')
                if expires_at:
                    try:
                        exp_dt = expires_at
                        if hasattr(expires_at, 'to_datetime'):
                            exp_dt = expires_at.to_datetime()
                        if exp_dt > _utc_now().replace(tzinfo=None) if exp_dt.tzinfo is None else exp_dt > _utc_now():
                            return {'plan': 'monthly', 'unlimited': True}
                    except Exception:
                        pass
                return {'plan': 'user', 'unlimited': False}
            return {'plan': plan, 'unlimited': False}
        except Exception:
            return {'plan': 'user', 'unlimited': False}

    def _daily_limit_for_entitlement(self, entitlement, uid):
        plan = (entitlement or {}).get('plan') or ('user' if uid else 'guest')
        if plan == 'lifetime':
            return _int_env('LIFETIME_DAILY_LIMIT', 0)
        if plan == 'monthly':
            return _int_env('MONTHLY_DAILY_LIMIT', 0)
        if uid:
            return _int_env('USER_DAILY_LIMIT', 3)
        return _int_env('GUEST_DAILY_LIMIT', 1)

    def _reserve_quota(self, uid, limit):
        if int(limit) <= 0:
            return True, None
        
        fs = _get_firestore_client()
        ip = self._get_client_ip()
        today = _utc_today_key()
        is_user = bool(uid)
        
        # Firestore logic (unchanged essentially, just cleaner check)
        if fs:
            key = (f"user:{uid}:{today}" if is_user else f"guest:{ip}:{today}")
            doc_ref = fs.collection('usage').document(key)
            tx = fs.transaction()

            @firestore.transactional
            def txn(transaction):
                snap = doc_ref.get(transaction=transaction)
                current = 0
                if snap.exists:
                    current = int((snap.to_dict() or {}).get('count', 0))
                if current >= limit:
                    return False, 0
                transaction.set(doc_ref, {
                    'count': current + 1,
                    'limit': limit,
                    'date': today,
                    'uid': uid if is_user else None,
                    'ip': ip if not is_user else None,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                }, merge=True)
                return True, max(limit - (current + 1), 0)

            try:
                return txn(tx)
            except Exception:
                # If transaction fails, fallback to allow or deny? 
                # Let's fallback to local check if Firestore fails
                pass

        # --- Local File-Based Logic (Fallback / Primary) ---
        # Key for filename
        safe_key = ""
        if is_user:
            safe_key = f"user_{uid}_{today}"
        else:
            # Sanitize IP for filename
            safe_ip = ip.replace(':', '_').replace('.', '_')
            safe_key = f"guest_{safe_ip}_{today}"
        
        # Ensure alphanumeric only for safety
        safe_key = "".join(c for c in safe_key if c.isalnum() or c in ('_', '-'))
        
        try:
            os.makedirs(USAGE_DIR, exist_ok=True)
            path = os.path.join(USAGE_DIR, f"{safe_key}.json")
            
            current = 0
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if data.get('date') == today:
                            current = int(data.get('count', 0))
                        else:
                            # Old file, reset
                            current = 0
                except Exception:
                    current = 0
            
            if current >= limit:
                return False, 0
            
            # Increment and Save
            new_count = current + 1
            with open(path, 'w', encoding='utf-8') as f:
                json.dump({
                    'count': new_count,
                    'limit': limit,
                    'date': today,
                    'updatedAt': int(time.time())
                }, f)
            
            return True, max(limit - new_count, 0)
        except Exception as e:
            logger.error(f"Failed to update local usage: {e}")
            # Fail open or closed? detailed error suggests fail open usually, 
            # but for strict limits, we might want to fail closed? 
            # Let's fail open to avoid blocking users on disk errors, 
            # but log heavily.
            return True, 0

    def _require_user(self):
        decoded, err = self._verify_bearer_token()
        if err:
            # For local dev, if verifying fails but we are in local mode, maybe fallback?
            # But _verify_bearer_token handles the bypass now.
            if err in ('missing', 'invalid_header', 'empty_token'):
                self.send_error_json(401, 'Login required')
            else:
                 self.send_error_json(401, f'Auth error: {err}')
            return None
        
        return {'uid': decoded.get('uid'), 'email': decoded.get('email')}

    def _get_or_create_customer(self, uid, email):
        fs = _get_firestore_client()
        if not fs:
            raise RuntimeError('Billing not configured. Enable Firestore and set FIREBASE_ADMIN_JSON in Vercel Environment Variables.')
        try:
            ent_ref = fs.collection('entitlements').document(uid)
            ent_doc = ent_ref.get()
            ent_data = ent_doc.to_dict() if ent_doc.exists else {}
            customer_id = (ent_data or {}).get('razorpayCustomerId')
            if customer_id:
                return customer_id
        except Exception as e:
            raise RuntimeError(f'Firestore error (billing). Enable Firestore Database and verify FIREBASE_ADMIN_JSON. {str(e)}')
        created = _rzp_request('POST', '/customers', {
            'name': email.split('@', 1)[0],
            'email': email
        })
        customer_id = created.get('id')
        if not customer_id:
            raise RuntimeError('Could not create Razorpay customer')
        try:
            ent_ref.set({
                'razorpayCustomerId': customer_id,
                'email': email,
                'updatedAt': firestore.SERVER_TIMESTAMP
            }, merge=True)
        except Exception as e:
            raise RuntimeError(f'Firestore error (billing save). {str(e)}')
        return customer_id

    def _get_or_create_monthly_plan_id(self):
        fs = _get_firestore_client()
        if not fs:
            raise RuntimeError('Billing not configured. Enable Firestore and set FIREBASE_ADMIN_JSON in Vercel Environment Variables.')
        currency = _payment_currency()
        monthly_amount = _monthly_amount_subunits()
        plan_cache_key = f"monthlyPlanId_{currency}_{monthly_amount}"
        try:
            cfg_ref = fs.collection('config').document('razorpay')
            cfg = cfg_ref.get()
            cfg_data = cfg.to_dict() if cfg.exists else {}
            plan_id = (cfg_data or {}).get(plan_cache_key) or (cfg_data or {}).get('monthlyPlanId')
            if plan_id:
                return plan_id
        except Exception as e:
            raise RuntimeError(f'Firestore error (billing config). {str(e)}')
        plans = _rzp_request('GET', '/plans', query={'count': 100})
        for p in (plans.get('items') or []):
            item = p.get('item') or {}
            if item.get('name') == 'SwiftDL Monthly Unlimited' and int(item.get('amount') or 0) == monthly_amount and (item.get('currency') or '').upper() == currency:
                plan_id = p.get('id')
                if plan_id:
                    try:
                        cfg_ref.set({plan_cache_key: plan_id, 'monthlyPlanId': plan_id, 'updatedAt': firestore.SERVER_TIMESTAMP}, merge=True)
                    except Exception:
                        pass
                return plan_id
        created = _rzp_request('POST', '/plans', {
            'period': 'monthly',
            'interval': 1,
            'item': {
                'name': 'SwiftDL Monthly Unlimited',
                'description': 'Unlimited downloads for 1 month',
                'amount': monthly_amount,
                'currency': currency
            }
        })
        plan_id = created.get('id')
        if plan_id:
            try:
                cfg_ref.set({plan_cache_key: plan_id, 'monthlyPlanId': plan_id, 'updatedAt': firestore.SERVER_TIMESTAMP}, merge=True)
            except Exception:
                pass
        if not plan_id:
            raise RuntimeError('Could not create plan')
        return plan_id

    def _handle_create_subscription(self, data):
        auth_ctx = self._require_user()
        if not auth_ctx:
            return
        plan = (data.get('plan') or '').strip().lower()
        if plan != 'monthly':
            self.send_error_json(400, 'Invalid plan')
            return
        try:
            key_id, _ = _load_razorpay_keys()
            plan_id = self._get_or_create_monthly_plan_id()
            customer_id = self._get_or_create_customer(auth_ctx['uid'], auth_ctx['email'])
            created = _rzp_request('POST', '/subscriptions', {
                'plan_id': plan_id,
                'total_count': 120,
                'quantity': 1,
                'customer_notify': 1,
                'notes': {
                    'uid': auth_ctx['uid'],
                    'plan': 'monthly'
                },
                'customer_id': customer_id
            })
            sub_id = created.get('id')
            if not sub_id:
                raise RuntimeError('Could not create subscription')
            fs = _get_firestore_client()
            if fs:
                fs.collection('rzpSubscriptions').document(sub_id).set({
                    'uid': auth_ctx['uid'],
                    'plan': 'monthly',
                    'email': auth_ctx['email'],
                    'createdAt': firestore.SERVER_TIMESTAMP
                }, merge=True)
            self.send_json({'keyId': key_id, 'subscriptionId': sub_id})
        except Exception as e:
            logger.error(f"Create subscription failed: {e}", exc_info=True)
            self.send_error_json(500, str(e))

    def _handle_create_order(self, data):
        auth_ctx = self._require_user()
        if not auth_ctx:
            return
        plan = (data.get('plan') or '').strip().lower()
        if plan != 'lifetime':
            self.send_error_json(400, 'Invalid plan')
            return
        try:
            key_id, _ = _load_razorpay_keys()
            customer_id = self._get_or_create_customer(auth_ctx['uid'], auth_ctx['email'])
            receipt = f"lt_{int(time.time())}_{auth_ctx['uid'][:20]}"
            currency = _payment_currency()
            amount = _lifetime_amount_subunits()
            created = _rzp_request('POST', '/orders', {
                'amount': amount,
                'currency': currency,
                'receipt': receipt,
                'notes': {
                    'uid': auth_ctx['uid'],
                    'plan': 'lifetime',
                    'customer_id': customer_id
                }
            })
            order_id = created.get('id')
            if not order_id:
                raise RuntimeError('Could not create order')
            fs = _get_firestore_client()
            if fs:
                fs.collection('rzpOrders').document(order_id).set({
                    'uid': auth_ctx['uid'],
                    'plan': 'lifetime',
                    'email': auth_ctx['email'],
                    'createdAt': firestore.SERVER_TIMESTAMP
                }, merge=True)
            self.send_json({'keyId': key_id, 'orderId': order_id, 'amount': amount, 'currency': currency})
        except Exception as e:
            logger.error(f"Create order failed: {e}", exc_info=True)
            self.send_error_json(500, str(e))

    def _handle_verify_payment(self, data):
        auth_ctx = self._require_user()
        if not auth_ctx:
            return
        pay_type = (data.get('type') or '').strip().lower()
        payment_id = (data.get('payment_id') or '').strip()
        signature = (data.get('signature') or '').strip()
        if not pay_type or not payment_id or not signature:
            self.send_error_json(400, 'Missing fields')
            return
        _, key_secret = _load_razorpay_keys()
        try:
            payment = _rzp_request('GET', f"/payments/{payment_id}")
        except Exception as e:
            self.send_error_json(400, str(e))
            return
        status = (payment.get('status') or '').lower()
        try:
            if pay_type == 'order':
                order_id = (data.get('order_id') or '').strip()
                if not order_id:
                    self.send_error_json(400, 'Missing order_id')
                    return
                expected = _hmac_sha256_hex(key_secret, f"{order_id}|{payment_id}")
                if not hmac.compare_digest(expected, signature):
                    self.send_error_json(400, 'Invalid signature')
                    return
                if (payment.get('order_id') or '') != order_id:
                    self.send_error_json(400, 'Order mismatch')
                    return
                currency = _payment_currency()
                amount = _lifetime_amount_subunits()
                if int(payment.get('amount', 0)) != amount or (payment.get('currency') or '').upper() != currency:
                    self.send_error_json(400, 'Amount mismatch')
                    return
                if status == 'created':
                    for _ in range(3):
                        time.sleep(1)
                        payment = _rzp_request('GET', f"/payments/{payment_id}")
                        status = (payment.get('status') or '').lower()
                        if status in ('authorized', 'captured'):
                            break
                if status == 'authorized':
                    try:
                        _rzp_request('POST', f"/payments/{payment_id}/capture", {'amount': amount, 'currency': currency})
                        payment = _rzp_request('GET', f"/payments/{payment_id}")
                        status = (payment.get('status') or '').lower()
                    except Exception as e:
                        self.send_error_json(400, str(e))
                        return
                if status != 'captured':
                    self.send_error_json(400, f'Payment not captured ({status or "unknown"})')
                    return
                fs = _get_firestore_client()
                if fs:
                    fs.collection('entitlements').document(auth_ctx['uid']).set({
                        'plan': 'lifetime',
                        'orderId': order_id,
                        'paymentId': payment_id,
                        'email': auth_ctx['email'],
                        'updatedAt': firestore.SERVER_TIMESTAMP
                    }, merge=True)
                self.send_json({'ok': True, 'plan': 'lifetime'})
                return

            if pay_type == 'subscription':
                subscription_id = (data.get('subscription_id') or '').strip()
                if not subscription_id:
                    self.send_error_json(400, 'Missing subscription_id')
                    return
                if status != 'captured':
                    self.send_error_json(400, f'Payment not captured ({status or "unknown"})')
                    return
                expected_a = _hmac_sha256_hex(key_secret, f"{subscription_id}|{payment_id}")
                expected_b = _hmac_sha256_hex(key_secret, f"{payment_id}|{subscription_id}")
                if not (hmac.compare_digest(expected_a, signature) or hmac.compare_digest(expected_b, signature)):
                    self.send_error_json(400, 'Invalid signature')
                    return
                if (payment.get('subscription_id') or '') != subscription_id:
                    self.send_error_json(400, 'Subscription mismatch')
                    return
                currency = _payment_currency()
                monthly_amount = _monthly_amount_subunits()
                if int(payment.get('amount', 0)) != monthly_amount or (payment.get('currency') or '').upper() != currency:
                    self.send_error_json(400, 'Amount mismatch')
                    return
                fs = _get_firestore_client()
                expires_at = _utc_now() + datetime.timedelta(days=31)
                if fs:
                    fs.collection('entitlements').document(auth_ctx['uid']).set({
                        'plan': 'monthly',
                        'subscriptionId': subscription_id,
                        'paymentId': payment_id,
                        'email': auth_ctx['email'],
                        'expiresAt': expires_at,
                        'updatedAt': firestore.SERVER_TIMESTAMP
                    }, merge=True)
                self.send_json({'ok': True, 'plan': 'monthly', 'expiresAt': expires_at.isoformat() + 'Z'})
                return

            self.send_error_json(400, 'Invalid type')
        except Exception as e:
            self.send_error_json(500, str(e))

    def _handle_rzp_webhook(self, raw_body):
        webhook_secret = os.getenv('RZP_WEBHOOK_SECRET', '').strip()
        signature = self.headers.get('X-Razorpay-Signature', '').strip()
        if not webhook_secret or not signature:
            self.send_error_json(400, 'Webhook not configured')
            return
        expected = _hmac_sha256_hex(webhook_secret, raw_body)
        if not hmac.compare_digest(expected, signature):
            self.send_error_json(400, 'Invalid webhook signature')
            return
        try:
            payload = json.loads(raw_body)
        except Exception:
            self.send_error_json(400, 'Invalid webhook payload')
            return
        event = (payload.get('event') or '').lower()
        fs = _get_firestore_client()

        # Log all webhook events
        if fs:
            fs.collection('rzpWebhooks').document(f"{int(time.time())}_{uuid.uuid4().hex[:6]}").set({
                'event': event,
                'createdAt': firestore.SERVER_TIMESTAMP
            }, merge=True)

        # Handle subscription renewal (subscription.charged)
        if event in ('subscription.charged', 'subscription.activated') and fs:
            try:
                entity = ((payload.get('payload') or {}).get('subscription') or {}).get('entity') or {}
                sub_id = entity.get('id') or ''
                notes = entity.get('notes') or {}
                uid = notes.get('uid') or ''
                if uid and sub_id:
                    expires_at = _utc_now() + datetime.timedelta(days=31)
                    fs.collection('entitlements').document(uid).set({
                        'plan': 'monthly',
                        'subscriptionId': sub_id,
                        'expiresAt': expires_at,
                        'updatedAt': firestore.SERVER_TIMESTAMP
                    }, merge=True)
                    logger.info(f"Webhook: renewed monthly for uid={uid} sub={sub_id}")
            except Exception as e:
                logger.error(f"Webhook renewal processing failed: {e}")

        # Handle subscription cancellation
        if event in ('subscription.cancelled', 'subscription.completed') and fs:
            try:
                entity = ((payload.get('payload') or {}).get('subscription') or {}).get('entity') or {}
                notes = entity.get('notes') or {}
                uid = notes.get('uid') or ''
                if uid:
                    fs.collection('entitlements').document(uid).set({
                        'plan': 'user',
                        'updatedAt': firestore.SERVER_TIMESTAMP
                    }, merge=True)
                    logger.info(f"Webhook: cancelled/completed for uid={uid}")
            except Exception as e:
                logger.error(f"Webhook cancellation processing failed: {e}")

        self.send_json({'ok': True})

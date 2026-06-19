import base64
import io
import json
import logging
import mimetypes
import os
import socket
import sys
import time
import urllib.parse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure the project root is on sys.path so api.index can be imported
ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)

# Public directory where the built frontend lives
PUBLIC_DIR = os.path.join(ROOT, 'dist')

# Import the existing BaseHTTPRequestHandler
from api.index import handler as BaseHandler


def _guess_mime(path):
    t, _ = mimetypes.guess_type(path)
    return t or 'application/octet-stream'


def _serve_static(environ, start_response):
    if not os.path.isdir(PUBLIC_DIR):
        start_response('404 Not Found', [('Content-Type', 'text/plain')])
        return [b'Not Found']
    path = environ.get('PATH_INFO', '/')
    if path == '/':
        path = '/index.html'
    path = path.split('?', 1)[0]
    normalized = os.path.normpath(path).lstrip('\\/')
    filepath = os.path.join(PUBLIC_DIR, normalized)
    try:
        real_public = os.path.realpath(PUBLIC_DIR)
        real_file = os.path.realpath(filepath)
        if not real_file.startswith(real_public):
            start_response('404 Not Found', [('Content-Type', 'text/plain')])
            return [b'Not Found']
    except Exception:
        start_response('404 Not Found', [('Content-Type', 'text/plain')])
        return [b'Not Found']
    if not os.path.isfile(filepath):
        filepath = os.path.join(PUBLIC_DIR, 'index.html')
        if not os.path.isfile(filepath):
            start_response('404 Not Found', [('Content-Type', 'text/plain')])
            return [b'Not Found']
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
        headers = [
            ('Content-Type', _guess_mime(filepath)),
            ('Content-Length', str(len(content))),
            ('Cache-Control', 'public, max-age=3600'),
        ]
        start_response('200 OK', headers)
        return [content]
    except Exception as e:
        logger.error(f"Static file error: {e}")
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [b'Internal Server Error']


class _WSGIHandler(BaseHandler):
    """Subclass of the original handler that reads from WSGI environ
    and captures the response into a buffer instead of writing to a socket."""

    def __init__(self, environ, start_response):
        self.environ = environ
        self._start_response = start_response
        self._status = None
        self._response_headers = []
        self._response_body = io.BytesIO()

        # Set attributes the original handler expects
        self.command = environ.get('REQUEST_METHOD', 'GET')
        self.path = environ.get('PATH_INFO', '/')
        query = environ.get('QUERY_STRING', '')
        if query:
            self.path += '?' + query

        # Build headers object
        self.headers = self._build_headers(environ)

        # Build rfile
        content_length = int(environ.get('CONTENT_LENGTH', '0') or '0')
        body = environ.get('wsgi.input', io.BytesIO()).read(content_length) if content_length > 0 else b''
        self.rfile = io.BytesIO(body)
        self.wfile = self._response_body

        # client_address
        forwarded = (self.headers.get('x-forwarded-for') or
                     self.headers.get('X-Forwarded-For') or '')
        if forwarded:
            ip = forwarded.split(',')[0].strip()
        else:
            ip = environ.get('REMOTE_ADDR', '0.0.0.0')
        self.client_address = (ip, 0)

        self.close_connection = False
        self.server = _FakeServer()

    def _build_headers(self, environ):
        """Convert WSGI HTTP_ environ keys into a dict-like headers object."""
        class Headers:
            def __init__(self, env):
                self._store = {}
                for k, v in env.items():
                    if k.startswith('HTTP_'):
                        header_name = k[5:].replace('_', '-').title()
                        self._store[header_name] = v
                # Also handle CONTENT_TYPE and CONTENT_LENGTH specially
                ct = env.get('CONTENT_TYPE', '')
                if ct:
                    self._store['Content-Type'] = ct
                cl = env.get('CONTENT_LENGTH', '')
                if cl:
                    self._store['Content-Length'] = cl
                # Handle Origin for CORS
                origin = env.get('HTTP_ORIGIN', '')
                if origin:
                    self._store['Origin'] = origin
                # Authorization
                auth = env.get('HTTP_AUTHORIZATION', '')
                if auth:
                    self._store['Authorization'] = auth

            def get(self, key, default=None):
                return self._store.get(key.title(), default)

            def __getitem__(self, key):
                return self._store[key.title()]

            def __contains__(self, key):
                return key.title() in self._store

            def __repr__(self):
                return repr(self._store)

        return Headers(environ)

    def send_response(self, code, message=None):
        self._status = code

    def send_header(self, keyword, value):
        self._response_headers.append((keyword, value))

    def end_headers(self):
        pass

    def flush_headers(self):
        pass

    def finish(self):
        pass

    def _cors_origin(self):
        origin = self.headers.get('Origin', '') if hasattr(self, 'headers') else ''
        allowed = (os.getenv('ALLOWED_ORIGINS', '') or '').strip()
        if not allowed:
            return origin or '*'
        origins = [o.strip() for o in allowed.split(',') if o.strip()]
        if origin in origins:
            return origin
        return origins[0] if origins else '*'


class _FakeServer:
    """Minimal fake server object for BaseHTTPRequestHandler compatibility."""
    def __init__(self):
        self.server_name = 'render'
        self.server_port = 443


def application(environ, start_response):
    """WSGI application entry point."""
    path = environ.get('PATH_INFO', '').rstrip('/') or '/'
    method = environ.get('REQUEST_METHOD', 'GET')

    # CORS preflight
    if method == 'OPTIONS':
        origin = environ.get('HTTP_ORIGIN', '')
        allowed = (os.getenv('ALLOWED_ORIGINS', '') or '').strip()
        if not allowed:
            cors_origin = origin or '*'
        else:
            origins = [o.strip() for o in allowed.split(',') if o.strip()]
            cors_origin = origin if origin in origins else (origins[0] if origins else '*')
        headers = [
            ('Access-Control-Allow-Origin', cors_origin),
            ('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Razorpay-Signature'),
            ('Access-Control-Max-Age', '86400'),
        ]
        start_response('200 OK', headers)
        return [b'']

    # All routes go through handler
    handler = _WSGIHandler(environ, start_response)

    try:
        if method == 'GET':
            handler.do_GET()
        elif method == 'POST':
            handler.do_POST()
        elif method == 'DELETE':
            handler.do_DELETE()
        else:
            start_response('405 Method Not Allowed', [('Content-Type', 'text/plain')])
            return [b'Method Not Allowed']

    except Exception as e:
        logger.error(f"Handler error: {e}", exc_info=True)
        start_response('500 Internal Server Error', [
            ('Content-Type', 'application/json'),
            ('Access-Control-Allow-Origin', handler._cors_origin()),
        ])
        return [json.dumps({'error': 'Internal server error'}).encode('utf-8')]

    # Build response
    status_code = handler._status or 200
    reason = 'OK' if status_code == 200 else ('Error' if status_code >= 400 else 'Unknown')
    status_str = f"{status_code} {reason}"

    body = handler._response_body.getvalue()
    if not body:
        body = b''

    final_headers = []
    has_content_length = False
    has_cors = False
    for k, v in handler._response_headers:
        final_headers.append((k, v))
        if k.lower() == 'content-length':
            has_content_length = True
        if k.lower() == 'access-control-allow-origin':
            has_cors = True

    if not has_content_length:
        final_headers.append(('Content-Length', str(len(body))))
    if not has_cors:
        final_headers.append(('Access-Control-Allow-Origin', handler._cors_origin()))

    start_response(status_str, final_headers)
    return [body]

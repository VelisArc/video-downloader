import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'serviceAccountKey.json')
if os.path.exists(key_path):
    print(f"Loading Firebase credentials from {key_path}")
    with open(key_path, 'r', encoding='utf-8') as f:
        os.environ['FIREBASE_ADMIN_JSON'] = f.read()

if __name__ == '__main__':
    from wsgi import application
    from wsgiref.simple_server import make_server

    port = int(os.getenv('PORT', '8000'))
    print(f"Starting dev server on http://localhost:{port}")
    httpd = make_server('0.0.0.0', port, application)
    httpd.serve_forever()

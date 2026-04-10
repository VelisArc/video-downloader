from http.server import HTTPServer
import os
import sys

# Ensure the current directory is in the path so we can import api.index
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from api.index import handler
except ImportError as e:
    print(f"Error importing handler: {e}")
    sys.exit(1)

def run(server_class=HTTPServer, handler_class=handler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting backend server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    # Auto-load serviceAccountKey.json if present (Development convenience)
    key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'serviceAccountKey.json')
    if os.path.exists(key_path):
        print(f"Loading Firebase credentials from {key_path}")
        with open(key_path, 'r', encoding='utf-8') as f:
            os.environ['FIREBASE_ADMIN_JSON'] = f.read()
    
    run()

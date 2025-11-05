from http.server import BaseHTTPRequestHandler
import json
import secrets
import os

# Global token store (in production, consider using Redis or database)
token_store = set()

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_POST(self):
        try:
            parsed_path = self.path.split('?')[0]
            
            if parsed_path == '/api/login':
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8')) if body else {}
                
                email = (data.get('email') or '').strip()
                password = (data.get('password') or '').strip()
                
                admin_email = 'Superadm@starkeST.com'
                admin_password = os.getenv('STARKE_ADMIN_PASSWORD', 'Starke@2025')
                
                if email.lower() == admin_email.lower() and password == admin_password:
                    token = secrets.token_hex(16)
                    token_store.add(token)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({ 'token': token }).encode())
                else:
                    self.send_response(401)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({ 'error': 'Credenciais inválidas' }).encode())
            
            elif parsed_path == '/api/logout':
                auth_header = self.headers.get('Authorization', '')
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ', 1)[1].strip()
                    token_store.discard(token)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({ 'success': True }).encode())
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({ 'error': 'Not found' }).encode())
        except Exception as e:
            print(f"Erro no login: {e}")
            import traceback
            traceback.print_exc()
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({ 'error': 'Erro interno do servidor' }).encode())

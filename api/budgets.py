from http.server import BaseHTTPRequestHandler
import json
import sqlite3
import os
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs

# Database will be stored in /tmp for Vercel serverless functions
DB_PATH = os.path.join('/tmp', 'database.sqlite3')

def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    try:
        db.execute(
            '''CREATE TABLE IF NOT EXISTS budgets (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   name TEXT NOT NULL,
                   email TEXT NOT NULL,
                   phone TEXT NOT NULL,
                   service TEXT NOT NULL,
                   details TEXT NOT NULL,
                   company TEXT,
                   city TEXT NOT NULL,
                   created_at TEXT NOT NULL
               )'''
        )
        db.commit()
    except Exception as e:
        print(f"Erro ao criar tabela: {e}")
    finally:
        db.close()

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_POST(self):
        try:
            init_db()
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8')) if body else {}
            
            required = ['name', 'email', 'phone', 'service', 'details', 'city']
            missing = [f for f in required if not data.get(f)]
            if missing:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({ 'error': f'Campos ausentes: {", ".join(missing)}' }).encode())
                return

            db = get_db()
            db.execute(
                'INSERT INTO budgets (name, email, phone, service, details, company, city, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                (
                    data['name'].strip(),
                    data['email'].strip(),
                    data['phone'].strip(),
                    data['service'].strip(),
                    data['details'].strip(),
                    (data.get('company') or '').strip(),
                    data['city'].strip(),
                    datetime.now(timezone.utc).isoformat()
                )
            )
            db.commit()
            db.close()
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({ 'success': True }).encode())
        except Exception as e:
            print(f"Erro ao criar orçamento: {e}")
            import traceback
            traceback.print_exc()
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({ 'error': 'Erro interno do servidor' }).encode())
    
    def do_GET(self):
        try:
            init_db()
            parsed_path = urlparse(self.path)
            query_params = parse_qs(parsed_path.query)
            
            page = int(query_params.get('page', ['1'])[0])
            page_size = int(query_params.get('page_size', ['10'])[0])
            page = max(page, 1)
            page_size = max(min(page_size, 100), 1)

            offset = (page - 1) * page_size
            db = get_db()
            total = db.execute('SELECT COUNT(1) as c FROM budgets').fetchone()['c']
            rows = db.execute(
                'SELECT id, name, email, phone, service, details, company, city, created_at FROM budgets ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?',
                (page_size, offset)
            ).fetchall()
            items = [dict(r) for r in rows]
            db.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({ 'items': items, 'total': total, 'page': page, 'page_size': page_size }).encode())
        except Exception as e:
            print(f"Erro ao listar orçamentos: {e}")
            import traceback
            traceback.print_exc()
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({ 'error': 'Erro interno do servidor' }).encode())

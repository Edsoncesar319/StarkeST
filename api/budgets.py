from http.server import BaseHTTPRequestHandler
import json
import sqlite3
import os
from datetime import datetime, timezone
import traceback

# Database will be stored in /tmp for Vercel serverless functions
DB_PATH = os.path.join('/tmp', 'database.sqlite3')

def get_db():
    try:
        db = sqlite3.connect(DB_PATH, timeout=10.0)
        db.row_factory = sqlite3.Row
        return db
    except Exception as e:
        print(f"Erro ao conectar ao banco: {e}")
        traceback.print_exc()
        raise

def init_db():
    db = None
    try:
        db = get_db()
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
        traceback.print_exc()
        if db:
            try:
                db.rollback()
            except:
                pass
        raise
    finally:
        if db:
            try:
                db.close()
            except:
                pass

class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suprimir logs padrão do BaseHTTPRequestHandler para evitar erros no Vercel
        pass
    
    def do_OPTIONS(self):
        try:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.send_header('Access-Control-Max-Age', '3600')
            self.end_headers()
        except Exception as e:
            print(f"Erro em OPTIONS: {e}")
            traceback.print_exc()
    
    def do_POST(self):
        db = None
        try:
            # Inicializar banco de dados
            init_db()
            
            # Ler body da requisição
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                raise ValueError('Content-Length é zero')
            
            body = self.rfile.read(content_length)
            if not body:
                raise ValueError('Body da requisição está vazio')
            
            # Parse JSON
            try:
                data = json.loads(body.decode('utf-8'))
            except json.JSONDecodeError as e:
                raise ValueError(f'JSON inválido: {str(e)}')
            
            # Validar campos obrigatórios
            required = ['name', 'email', 'phone', 'service', 'details', 'city']
            missing = [f for f in required if not data.get(f)]
            if missing:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({ 'error': f'Campos ausentes: {", ".join(missing)}' }).encode())
                return

            # Inserir no banco de dados
            db = get_db()
            try:
                db.execute(
                    'INSERT INTO budgets (name, email, phone, service, details, company, city, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    (
                        str(data['name']).strip(),
                        str(data['email']).strip(),
                        str(data['phone']).strip(),
                        str(data['service']).strip(),
                        str(data['details']).strip(),
                        str(data.get('company') or '').strip(),
                        str(data['city']).strip(),
                        datetime.now(timezone.utc).isoformat()
                    )
                )
                db.commit()
            except sqlite3.Error as db_err:
                db.rollback()
                raise Exception(f'Erro no banco de dados: {str(db_err)}')
            finally:
                if db:
                    try:
                        db.close()
                    except:
                        pass
            
            # Resposta de sucesso
            self.send_response(201)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({ 'success': True }).encode())
            
        except ValueError as ve:
            # Erro de validação
            print(f"Erro de validação: {ve}")
            try:
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({ 'error': str(ve) }).encode())
            except:
                pass
        except Exception as e:
            # Erro genérico
            error_msg = str(e)
            print(f"Erro ao criar orçamento: {error_msg}")
            traceback.print_exc()
            
            try:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                error_response = { 'error': 'Erro interno do servidor', 'details': error_msg }
                self.wfile.write(json.dumps(error_response).encode())
            except Exception as send_err:
                print(f"Erro ao enviar resposta de erro: {send_err}")
                traceback.print_exc()
        finally:
            if db:
                try:
                    db.close()
                except:
                    pass
    
    def do_GET(self):
        db = None
        try:
            init_db()
            from urllib.parse import urlparse, parse_qs
            
            parsed_path = urlparse(self.path)
            query_params = parse_qs(parsed_path.query)
            
            try:
                page = int(query_params.get('page', ['1'])[0])
                page_size = int(query_params.get('page_size', ['10'])[0])
            except (ValueError, IndexError):
                page = 1
                page_size = 10
            
            page = max(page, 1)
            page_size = max(min(page_size, 100), 1)

            offset = (page - 1) * page_size
            db = get_db()
            try:
                total_row = db.execute('SELECT COUNT(1) as c FROM budgets').fetchone()
                total = total_row['c'] if total_row else 0
                
                rows = db.execute(
                    'SELECT id, name, email, phone, service, details, company, city, created_at FROM budgets ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?',
                    (page_size, offset)
                ).fetchall()
                items = [dict(r) for r in rows]
            except sqlite3.Error as db_err:
                raise Exception(f'Erro no banco de dados: {str(db_err)}')
            finally:
                if db:
                    try:
                        db.close()
                    except:
                        pass
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({ 'items': items, 'total': total, 'page': page, 'page_size': page_size }).encode())
        except Exception as e:
            error_msg = str(e)
            print(f"Erro ao listar orçamentos: {error_msg}")
            traceback.print_exc()
            try:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({ 'error': 'Erro interno do servidor', 'details': error_msg }).encode())
            except Exception as send_err:
                print(f"Erro ao enviar resposta de erro: {send_err}")
                traceback.print_exc()
        finally:
            if db:
                try:
                    db.close()
                except:
                    pass

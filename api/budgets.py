import json
import sqlite3
import os
from datetime import datetime, timezone

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

def handler(request):
    """Handler para Vercel serverless functions"""
    try:
        # Configurar CORS headers
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        
        # Obter método HTTP
        method = getattr(request, 'method', 'GET')
        if hasattr(request, 'httpMethod'):
            method = request.httpMethod
        
        # Tratar OPTIONS (preflight CORS)
        if method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }
        
        # Tratar POST
        if method == 'POST':
            init_db()
            
            # Obter body
            body = getattr(request, 'body', None)
            if hasattr(request, 'json'):
                data = request.json
            elif isinstance(body, str):
                data = json.loads(body) if body else {}
            elif isinstance(body, bytes):
                data = json.loads(body.decode('utf-8')) if body else {}
            elif body:
                data = body
            else:
                # Tentar ler do body de outra forma
                if hasattr(request, 'get_json'):
                    data = request.get_json(force=True, silent=True) or {}
                else:
                    data = {}
            
            required = ['name', 'email', 'phone', 'service', 'details', 'city']
            missing = [f for f in required if not data.get(f)]
            if missing:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({ 'error': f'Campos ausentes: {", ".join(missing)}' })
                }

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
            finally:
                db.close()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({ 'success': True })
            }
        
        # Tratar GET
        if method == 'GET':
            init_db()
            query_params = {}
            
            if hasattr(request, 'query'):
                query_params = request.query or {}
            elif hasattr(request, 'args'):
                query_params = request.args or {}
            
            page = 1
            page_size = 10
            
            if isinstance(query_params, dict):
                page = int(query_params.get('page', 1))
                page_size = int(query_params.get('page_size', 10))
            elif isinstance(query_params.get('page'), list):
                page = int(query_params.get('page', ['1'])[0])
                page_size = int(query_params.get('page_size', ['10'])[0])
            
            page = max(page, 1)
            page_size = max(min(page_size, 100), 1)

            offset = (page - 1) * page_size
            db = get_db()
            try:
                total = db.execute('SELECT COUNT(1) as c FROM budgets').fetchone()['c']
                rows = db.execute(
                    'SELECT id, name, email, phone, service, details, company, city, created_at FROM budgets ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?',
                    (page_size, offset)
                ).fetchall()
                items = [dict(r) for r in rows]
            finally:
                db.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({ 'items': items, 'total': total, 'page': page, 'page_size': page_size })
            }
        
        # Método não suportado
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({ 'error': 'Método não permitido' })
        }
        
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON: {e}")
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({ 'error': 'JSON inválido' })
        }
    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({ 'error': 'Erro interno do servidor', 'details': str(e) })
        }

import json
import secrets
import os

# Global token store (in production, consider using Redis or database)
token_store = set()

def handler(request):
    """Handler para Vercel serverless functions"""
    # Configurar CORS headers - sempre definir antes do try
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '3600'
    }
    
    # Obter método HTTP
    method = getattr(request, 'method', 'POST')
    if hasattr(request, 'httpMethod'):
        method = request.httpMethod
    
    # Tratar OPTIONS (preflight CORS)
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'text/plain'},
            'body': ''
        }
    
    try:
        path = request.path or ''
        
        if '/api/login' in path:
            body = request.body
            if isinstance(body, str):
                data = json.loads(body)
            elif isinstance(body, bytes):
                data = json.loads(body.decode('utf-8'))
            else:
                data = body if body else {}
            
            email = (data.get('email') or '').strip()
            password = (data.get('password') or '').strip()
            
            admin_email = 'Superadm@starkeST.com'
            admin_password = os.getenv('STARKE_ADMIN_PASSWORD', 'Starke@2025')
            
            if email.lower() == admin_email.lower() and password == admin_password:
                token = secrets.token_hex(16)
                token_store.add(token)
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({ 'token': token })
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({ 'error': 'Credenciais inválidas' })
                }
        
        elif '/api/logout' in path:
            auth_header = request.headers.get('Authorization', '') if hasattr(request, 'headers') else ''
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ', 1)[1].strip()
                token_store.discard(token)
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({ 'success': True })
            }
        else:
            return {
                'statusCode': 404,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({ 'error': 'Not found' })
            }
    except Exception as e:
        print(f"Erro no login: {e}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({ 'error': 'Erro interno do servidor', 'details': str(e) })
        }

import json

def handler(request):
    """Handler para Vercel serverless functions"""
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600'
    }
    
    method = getattr(request, 'method', 'GET')
    if hasattr(request, 'httpMethod'):
        method = request.httpMethod
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'text/plain'},
            'body': ''
        }
    
    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({ 'status': 'ok' })
    }

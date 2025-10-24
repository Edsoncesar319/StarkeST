from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_mail import Mail, Message
from flask_cors import CORS
import os
import logging
import secrets
import sqlite3
from datetime import datetime
from dotenv import load_dotenv

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carrega as variáveis de ambiente
load_dotenv()

app = Flask(__name__)

# Configuração do CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost", "http://127.0.0.1", "http://localhost:5000", "http://127.0.0.1:5000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

# Configuração do Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER', 'starkestsuportetecnico@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('EMAIL_USER', 'starkestsuportetecnico@gmail.com')

# Verifica se as credenciais do email estão configuradas
if not app.config['MAIL_PASSWORD']:
    logger.error("EMAIL_PASSWORD não configurado no arquivo .env")
    print("ERRO: EMAIL_PASSWORD não configurado no arquivo .env")
    print("Por favor, configure sua senha de app do Gmail no arquivo .env")

mail = Mail(app)

# Sistema de autenticação
token_store = set()

def verify_token(token):
    """Verifica se o token é válido"""
    return token in token_store

def require_auth(f):
    """Decorator para rotas que requerem autenticação"""
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token de autorização necessário'}), 401
        
        token = auth_header.split(' ', 1)[1].strip()
        if not verify_token(token):
            return jsonify({'error': 'Token inválido'}), 401
        
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Configuração do banco de dados
DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'database.sqlite3')

def get_db():
    """Conecta ao banco de dados SQLite"""
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    """Inicializa as tabelas do banco de dados"""
    db = get_db()
    db.execute(
        '''CREATE TABLE IF NOT EXISTS messages (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL,
               email TEXT NOT NULL,
               subject TEXT NOT NULL,
               message TEXT NOT NULL,
               created_at TEXT NOT NULL
           )'''
    )
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
    db.close()

@app.route('/')
def index():
    """Serve a página principal"""
    return send_file('index.html')

@app.route('/login.html')
def login_page():
    """Serve a página de login"""
    return send_file('login.html')

@app.route('/backend/admin.html')
def admin_page():
    """Serve a página administrativa"""
    return send_file('backend/admin.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve arquivos estáticos"""
    try:
        return send_from_directory('.', filename)
    except FileNotFoundError:
        return jsonify({'error': 'Arquivo não encontrado'}), 404

@app.route('/api/status')
def api_status():
    """Endpoint de status da API"""
    return jsonify({
        'status': 'success',
        'message': 'Servidor Python está funcionando!'
    })

@app.route('/forms/contact.php', methods=['POST', 'OPTIONS'])
def contact():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Recebe os dados do formulário
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()

        logger.info(f"Recebido formulário de contato de {name} ({email})")

        # Validação básica
        if not all([name, email, subject, message]):
            logger.warning("Formulário incompleto recebido")
            return jsonify({
                'status': 'error',
                'message': 'Por favor, preencha todos os campos.'
            })

        # Validação do email
        if '@' not in email or '.' not in email:
            logger.warning(f"Email inválido recebido: {email}")
            return jsonify({
                'status': 'error',
                'message': 'Por favor, insira um email válido.'
            })

        # Cria o email
        msg = Message(
            subject=f"Novo Orçamento: {subject}",
            recipients=['starkestsuportetecnico@gmail.com']
        )

        # Template HTML do email
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #2563EB; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Novo Orçamento Recebido</h2>
                </div>
                <div class='content'>
                    <p><strong>Nome:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Assunto:</strong> {subject}</p>
                    <p><strong>Mensagem:</strong></p>
                    <p>{message.replace('\n', '<br>')}</p>
                </div>
                <div class='footer'>
                    <p>Este email foi enviado através do formulário de contato do site Starke ST</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.html = html_content
        msg.body = f"""
        Novo Orçamento Recebido
        
        Nome: {name}
        Email: {email}
        Assunto: {subject}
        
        Mensagem:
        {message}
        """

        # Envia o email
        mail.send(msg)
        logger.info(f"Email enviado com sucesso para starkestsuportetecnico@gmail.com")

        return jsonify({
            'status': 'success',
            'message': 'Sua mensagem foi enviada com sucesso!'
        })

    except Exception as e:
        logger.error(f"Erro ao enviar email: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.'
        })

@app.route('/api/login', methods=['POST'])
def login():
    """Endpoint de login para administradores"""
    try:
        data = request.get_json(force=True, silent=True) or {}
        email = (data.get('email') or '').strip()
        password = (data.get('password') or '').strip()
        
        admin_email = 'Superadm@starkeST.com'
        admin_password = os.getenv('STARKE_ADMIN_PASSWORD', 'Starke@2025')
        
        logger.info(f"Tentativa de login: {email}")
        
        if email.lower() == admin_email.lower() and password == admin_password:
            token = secrets.token_hex(16)
            token_store.add(token)
            logger.info(f"Login bem-sucedido para {email}")
            return jsonify({'token': token})
        
        logger.warning(f"Tentativa de login falhada para {email}")
        return jsonify({'error': 'Credenciais inválidas'}), 401
        
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}", exc_info=True)
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Endpoint de logout"""
    try:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
            token_store.discard(token)
            logger.info("Logout realizado com sucesso")
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Erro no logout: {str(e)}", exc_info=True)
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/verify-token', methods=['GET'])
def verify_token_endpoint():
    """Endpoint para verificar se o token é válido"""
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'valid': False}), 401
        
        token = auth_header.split(' ', 1)[1].strip()
        is_valid = verify_token(token)
        
        return jsonify({'valid': is_valid})
        
    except Exception as e:
        logger.error(f"Erro na verificação do token: {str(e)}", exc_info=True)
        return jsonify({'valid': False}), 500

@app.route('/api/messages', methods=['POST'])
def create_message():
    """Endpoint para criar uma nova mensagem"""
    try:
        data = request.get_json(force=True, silent=True) or {}
        required = ['name', 'email', 'subject', 'message']
        missing = [f for f in required if not data.get(f)]
        
        if missing:
            return jsonify({'error': f'Campos ausentes: {", ".join(missing)}'}), 400

        init_db()
        db = get_db()
        db.execute(
            'INSERT INTO messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)',
            (
                data['name'].strip(),
                data['email'].strip(),
                data['subject'].strip(),
                data['message'].strip(),
                datetime.utcnow().isoformat()
            )
        )
        db.commit()
        db.close()
        
        logger.info(f"Nova mensagem criada de {data['name']} ({data['email']})")
        return jsonify({'success': True}), 201
        
    except Exception as e:
        logger.error(f"Erro ao criar mensagem: {str(e)}", exc_info=True)
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/messages', methods=['GET'])
@require_auth
def list_messages():
    """Endpoint para listar mensagens (requer autenticação)"""
    try:
        page = int(request.args.get('page', '1'))
        page_size = int(request.args.get('page_size', '10'))
        page = max(page, 1)
        page_size = max(min(page_size, 100), 1)
    except ValueError:
        return jsonify({'error': 'Parâmetros de paginação inválidos'}), 400

    try:
        init_db()
        offset = (page - 1) * page_size
        db = get_db()
        total = db.execute('SELECT COUNT(1) as c FROM messages').fetchone()['c']
        rows = db.execute(
            'SELECT id, name, email, subject, message, created_at FROM messages ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?',
            (page_size, offset)
        ).fetchall()
        items = [dict(r) for r in rows]
        db.close()
        
        return jsonify({'items': items, 'total': total, 'page': page, 'page_size': page_size})
        
    except Exception as e:
        logger.error(f"Erro ao listar mensagens: {str(e)}", exc_info=True)
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/budgets', methods=['POST'])
def create_budget():
    """Endpoint para criar um novo orçamento"""
    try:
        data = request.get_json(force=True, silent=True) or {}
        required = ['name', 'email', 'phone', 'service', 'details', 'city']
        missing = [f for f in required if not data.get(f)]
        
        if missing:
            return jsonify({'error': f'Campos ausentes: {", ".join(missing)}'}), 400

        init_db()
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
                datetime.utcnow().isoformat()
            )
        )
        db.commit()
        db.close()
        
        logger.info(f"Novo orçamento criado de {data['name']} ({data['email']})")
        return jsonify({'success': True}), 201
        
    except Exception as e:
        logger.error(f"Erro ao criar orçamento: {str(e)}", exc_info=True)
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/budgets', methods=['GET'])
@require_auth
def list_budgets():
    """Endpoint para listar orçamentos (requer autenticação)"""
    try:
        page = int(request.args.get('page', '1'))
        page_size = int(request.args.get('page_size', '10'))
        page = max(page, 1)
        page_size = max(min(page_size, 100), 1)
    except ValueError:
        return jsonify({'error': 'Parâmetros de paginação inválidos'}), 400

    try:
        init_db()
        offset = (page - 1) * page_size
        db = get_db()
        total = db.execute('SELECT COUNT(1) as c FROM budgets').fetchone()['c']
        rows = db.execute(
            'SELECT id, name, email, phone, service, details, company, city, created_at FROM budgets ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?',
            (page_size, offset)
        ).fetchall()
        items = [dict(r) for r in rows]
        db.close()
        
        return jsonify({'items': items, 'total': total, 'page': page, 'page_size': page_size})
        
    except Exception as e:
        logger.error(f"Erro ao listar orçamentos: {str(e)}", exc_info=True)
        return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    logger.info("Iniciando servidor Flask...")
    app.run(debug=True, port=5000, host='0.0.0.0') 
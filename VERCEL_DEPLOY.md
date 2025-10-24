# Starke ST - Deploy no Vercel

Este projeto está configurado para deploy no Vercel com backend Flask serverless.

## 🚀 Deploy no Vercel

### Pré-requisitos
- Conta no Vercel
- Vercel CLI instalado (`npm i -g vercel`)

### Passos para Deploy

1. **Instalar Vercel CLI** (se não tiver):
```bash
npm i -g vercel
```

2. **Fazer login no Vercel**:
```bash
vercel login
```

3. **Deploy do projeto**:
```bash
vercel --prod
```

4. **Configurar variáveis de ambiente**:
No dashboard do Vercel, vá em Settings > Environment Variables e adicione:
- `STARKE_ADMIN_PASSWORD`: Sua senha de admin personalizada

### 🔧 Configuração

O projeto está configurado com:

- **Frontend**: Arquivos estáticos servidos pelo Vercel
- **Backend**: API serverless em Python/Flask
- **Banco de dados**: SQLite em `/tmp` (temporário para serverless)
- **CORS**: Habilitado para comunicação frontend-backend

### 📁 Estrutura para Vercel

```
├── api/                    # API serverless functions
│   ├── health.py          # Endpoint /api/health
│   ├── login.py           # Endpoint /api/login
│   ├── messages.py        # Endpoint /api/messages
│   ├── budgets.py         # Endpoint /api/budgets
│   └── requirements.txt   # Dependências Python
├── vercel.json            # Configuração do Vercel
├── package.json           # Configuração Node.js
├── .vercelignore          # Arquivos ignorados no deploy
├── index.html             # Landing page principal
├── main.css               # Estilos
├── main.js                # JavaScript frontend
└── assets/                # Imagens e recursos
```

### 🌐 URLs após Deploy

Após o deploy, você terá:
- **Frontend**: `https://seu-projeto.vercel.app`
- **API Health**: `https://seu-projeto.vercel.app/api/health`
- **API Messages**: `https://seu-projeto.vercel.app/api/messages`
- **API Budgets**: `https://seu-projeto.vercel.app/api/budgets`
- **API Login**: `https://seu-projeto.vercel.app/api/login`

### 🔐 Credenciais Admin

- **Email**: `Superadm@starkeST.com`
- **Senha**: Configurada via variável de ambiente `STARKE_ADMIN_PASSWORD`

### 📝 Notas Importantes

1. **Banco de dados**: SQLite é temporário em serverless functions. Para produção, considere usar PostgreSQL ou outro banco persistente.

2. **Tokens**: Tokens de autenticação são armazenados em memória e serão perdidos quando a função serverless for reinicializada.

3. **Arquivos estáticos**: Todos os arquivos CSS, JS e imagens são servidos automaticamente pelo Vercel.

4. **CORS**: Configurado para permitir requisições do frontend para a API.

### 🛠️ Desenvolvimento Local

Para testar localmente com a configuração do Vercel:

```bash
vercel dev
```

Isso iniciará o servidor local com a mesma configuração do Vercel.

### 🔄 Atualizações

Para atualizar o deploy:

```bash
vercel --prod
```

Ou configure integração com Git para deploy automático a cada push.

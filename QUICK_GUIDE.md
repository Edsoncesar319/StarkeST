# 🚀 Guia Rápido - Starke ST

## 👋 Bem-vindo ao Sistema Starke ST!

Este guia rápido vai te ajudar a usar o sistema de forma eficiente.

## 🌐 Acessando o Sistema

### Site Principal
- **URL**: http://localhost:5000/
- **Descrição**: Página principal da empresa com informações sobre serviços

### Área de Login
- **URL**: http://localhost:5000/login.html
- **Credenciais**:
  - 📧 **Email**: `Superadm@starkeST.com`
  - 🔑 **Senha**: `Starke@2025`

### Área Administrativa
- **URL**: http://localhost:5000/backend/admin.html
- **Acesso**: Requer login prévio

## 🔐 Fazendo Login

### Passo a Passo
1. Acesse `http://localhost:5000/login.html`
2. As credenciais já estão preenchidas automaticamente
3. Clique em **"Entrar"**
4. Aguarde o redirecionamento para a área administrativa

### ⚠️ Problemas Comuns
- **"Credenciais inválidas"**: Verifique se digitou corretamente
- **"Erro de conexão"**: Verifique se o servidor está rodando
- **Página não carrega**: Verifique a URL e conexão

## 👨‍💼 Área Administrativa

### Dashboard Principal
Após o login, você verá:
- **Mensagens**: Lista de mensagens recebidas
- **Orçamentos**: Lista de orçamentos solicitados
- **Controles**: Botões para recarregar e paginar dados

### Gerenciando Mensagens
- **Visualizar**: Clique em "Recarregar" para ver novas mensagens
- **Paginacao**: Use os controles de página para navegar
- **Filtros**: Ajuste o número de itens por página

### Gerenciando Orçamentos
- **Visualizar**: Lista completa de orçamentos solicitados
- **Detalhes**: Veja informações completas de cada cliente
- **Organização**: Ordene por data de criação

## 📧 Sistema de Email

### Configuração
Para receber emails de contato:
1. Configure o Gmail com senha de app
2. Adicione as credenciais no arquivo `.env`
3. Teste o envio através do formulário de contato

### Recebendo Notificações
- **Formulário de Contato**: Emails automáticos para `starkestsuportetecnico@gmail.com`
- **Templates**: Emails formatados em HTML
- **Conteúdo**: Nome, email, assunto e mensagem do cliente

## 🛠️ Solução de Problemas

### Servidor Não Inicia
```bash
# Verificar Python
python --version

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python app.py
```

### Erro de Banco de Dados
- O banco é criado automaticamente na primeira execução
- Verifique permissões na pasta `backend/`
- Backup automático em `backend/database.sqlite3`

### Problemas de Email
- Verifique configurações do Gmail
- Use senha de app, não senha normal
- Teste conectividade SMTP

### Erro 404 (Não Encontrado)
- Verifique se o servidor está rodando
- Confirme a URL correta
- Verifique arquivos na pasta do projeto

## 📱 Usando em Mobile

### Responsividade
- ✅ Site otimizado para mobile
- ✅ Login funciona em smartphones
- ✅ Área admin adaptável

### Navegação Mobile
- Use gestos de toque para navegar
- Botões otimizados para dedos
- Texto legível em telas pequenas

## 🔒 Segurança

### Boas Práticas
- ✅ Sempre faça logout ao terminar
- ✅ Não compartilhe credenciais
- ✅ Use conexões seguras (HTTPS em produção)
- ✅ Mantenha o sistema atualizado

### Tokens de Sessão
- Tokens são gerados automaticamente
- Expirem quando você faz logout
- Armazenados localmente no navegador

## 📊 Monitoramento

### Logs do Sistema
- **Arquivo**: `app.log`
- **Conteúdo**: Todas as operações do sistema
- **Rotação**: Automática para evitar arquivos grandes

### Métricas Importantes
- **Login**: Tentativas de acesso
- **Mensagens**: Volume recebido
- **Orçamentos**: Conversões
- **Erros**: Problemas técnicos

## 🆘 Suporte Técnico

### Contatos
- **Email**: starkestsuportetecnico@gmail.com
- **WhatsApp**: +55 (88) 9 8233-6089
- **Endereço**: Rua O, nº 022, Aracati-CE

### Horário de Atendimento
- **Segunda a Sexta**: 8h às 18h
- **Sábado**: 8h às 12h
- **Emergências**: 24/7 via WhatsApp

## 📋 Checklist Diário

### ✅ Verificações Importantes
- [ ] Servidor rodando
- [ ] Login funcionando
- [ ] Emails sendo recebidos
- [ ] Banco de dados acessível
- [ ] Logs sem erros críticos

### ✅ Manutenção Semanal
- [ ] Backup do banco de dados
- [ ] Limpeza de logs antigos
- [ ] Verificação de atualizações
- [ ] Teste de funcionalidades

## 🎯 Dicas de Uso

### Eficiência
- Use atalhos de teclado quando possível
- Configure notificações de email
- Organize mensagens por prioridade
- Mantenha dados atualizados

### Produtividade
- Faça login uma vez por dia
- Verifique mensagens regularmente
- Responda orçamentos rapidamente
- Use filtros para encontrar informações

## 📈 Próximos Passos

### Melhorias Planejadas
- 🔄 Sistema de notificações push
- 📊 Dashboard com gráficos
- 📱 App mobile nativo
- 🤖 Chatbot automático
- 📧 Templates de email personalizados

### Feedback
Sua opinião é importante! Entre em contato para:
- Sugestões de melhorias
- Reportar problemas
- Solicitar novas funcionalidades
- Feedback sobre usabilidade

---

**Sistema Starke ST - Transformando processos em sistemas inteligentes** 🚀

*Para mais informações técnicas, consulte o README.md e TECHNICAL_DOCS.md*

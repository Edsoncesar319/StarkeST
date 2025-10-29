document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.php-email-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Elementos de feedback
            const loading = form.querySelector('.loading');
            const errorMessage = form.querySelector('.error-message');
            const sentMessage = form.querySelector('.sent-message');
            
            // Esconde mensagens anteriores
            loading.style.display = 'block';
            errorMessage.style.display = 'none';
            sentMessage.style.display = 'none';
            
            // Coleta os dados do formulário
            const formData = new FormData(form);
            
            // Determina a URL do servidor
            const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5000/forms/contact.php'
                : '/forms/contact.php';
            
            // Envia a requisição AJAX
            fetch(serverUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                loading.style.display = 'none';
                
                if (data.status === 'success') {
                    sentMessage.style.display = 'block';
                    form.reset(); // Limpa o formulário
                } else {
                    errorMessage.textContent = data.message || 'Ocorreu um erro ao enviar a mensagem.';
                    errorMessage.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                loading.style.display = 'none';
                errorMessage.textContent = 'Não foi possível conectar ao servidor. Verifique se o servidor Python está rodando.';
                errorMessage.style.display = 'block';
            });
        });
    }
}); 
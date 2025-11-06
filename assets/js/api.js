// Função compartilhada para obter a URL base da API
function getApiBaseUrl() {
    let baseUrl = null;
    
    // Prefer explicit runtime config set in HTML
    if (window.__API_BASE_URL__ && typeof window.__API_BASE_URL__ === 'string') {
        baseUrl = window.__API_BASE_URL__;
    } else {
        // Fallback to <meta name="api-base-url" content="..."> if present
        const metaTag = document.querySelector('meta[name="api-base-url"][content]');
        if (metaTag && metaTag.getAttribute('content')) {
            baseUrl = metaTag.getAttribute('content');
        } else {
            // Local development default
            const host = window.location.hostname;
            if (host === 'localhost' || host === '127.0.0.1') {
                baseUrl = 'http://localhost:5000';
            }
        }
    }
    
    if (!baseUrl) {
        throw new Error('API base URL não configurado. Defina window.__API_BASE_URL__ ou <meta name="api-base-url" content="https://sua-api">.');
    }
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/+$/, '');
    
    // Validate URL format
    try {
        new URL(baseUrl);
    } catch (e) {
        throw new Error(`URL da API inválida: ${baseUrl}`);
    }
    
    return baseUrl;
}

// Função para diagnosticar erros de fetch
function diagnoseFetchError(error, url) {
    const diagnosis = {
        url: url,
        errorType: 'unknown',
        possibleCauses: [],
        suggestion: ''
    };
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        diagnosis.errorType = 'network_error';
        diagnosis.possibleCauses = [
            'API não está acessível ou offline',
            'Problema de CORS (Cross-Origin Resource Sharing)',
            'URL da API incorreta ou não existe',
            'Problema de conectividade de rede',
            'Firewall ou proxy bloqueando a requisição'
        ];
        
        // Tentar identificar se é CORS
        try {
            const currentOrigin = window.location.origin;
            if (url && url !== 'URL desconhecida') {
                const apiOrigin = new URL(url).origin;
                if (currentOrigin !== apiOrigin) {
                    diagnosis.suggestion = `A requisição está sendo feita de ${currentOrigin} para ${apiOrigin}. Verifique se o servidor permite requisições CORS deste domínio.`;
                } else {
                    diagnosis.suggestion = 'Verifique se a API está rodando e acessível.';
                }
            } else {
                diagnosis.suggestion = 'Verifique se a API está rodando e acessível.';
            }
        } catch (e) {
            diagnosis.suggestion = 'Verifique se a API está rodando e acessível.';
        }
    } else if (error.name === 'AbortError') {
        diagnosis.errorType = 'timeout';
        diagnosis.possibleCauses = ['A requisição demorou mais de 30 segundos'];
        diagnosis.suggestion = 'A API pode estar lenta ou sobrecarregada. Tente novamente.';
    } else {
        diagnosis.errorType = error.name || 'unknown';
        diagnosis.possibleCauses = ['Erro desconhecido'];
        diagnosis.suggestion = 'Verifique o console para mais detalhes.';
    }
    
    return diagnosis;
}

// Função para testar conectividade da API
async function testApiConnection() {
    try {
        // Verificar se a configuração está disponível
        let apiUrl;
        try {
            apiUrl = getApiBaseUrl() + '/api/health';
        } catch (configError) {
            console.warn('⚠️ Configuração da API não disponível ainda:', configError.message);
            return false;
        }
        
        console.log('🔍 Testando conectividade da API:', apiUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos para teste
        
        const res = await fetch(apiUrl, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (res.ok) {
            const data = await res.json();
            console.log('✅ API está acessível:', data);
            return true;
        } else {
            console.warn('⚠️ API retornou status:', res.status);
            return false;
        }
    } catch (error) {
        // Não mostrar erro como crítico, apenas informar
        if (error.name === 'AbortError') {
            console.warn('⚠️ Teste de conectividade da API expirou (timeout)');
        } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.warn('⚠️ API não está acessível no momento. Isso pode ser normal se você estiver em desenvolvimento local.');
            console.warn('   URL tentada:', getApiBaseUrl() + '/api/health');
        } else {
            console.warn('⚠️ Erro ao testar API:', error.message);
        }
        return false;
    }
}

// Testar conectividade quando a página carregar (apenas em desenvolvimento)
// Usar DOMContentLoaded para garantir que o script de configuração já executou
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Aguardar um pouco mais para garantir que tudo está carregado
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            // Testar apenas se a configuração estiver disponível
            if (window.__API_BASE_URL__ || document.querySelector('meta[name="api-base-url"][content]')) {
                testApiConnection().catch(() => {
                    // Silenciosamente ignorar erros no teste
                });
            } else {
                console.warn('⚠️ Configuração da API não encontrada. Teste de conectividade pulado.');
            }
        }, 2000); // Aguardar 2 segundos para garantir que tudo está pronto
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const contactsSection = document.querySelector('#contacts');
    if (!contactsSection) return;
    const form = contactsSection.querySelector('form');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');

    function setSubmitting(isSubmitting) {
        if (submitButton) {
            submitButton.disabled = isSubmitting;
            submitButton.textContent = isSubmitting ? 'Enviando...' : 'Enviar mensagem';
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = {
            name: (formData.get('name') || '').toString().trim(),
            email: (formData.get('email') || '').toString().trim(),
            subject: (formData.get('subject') || '').toString().trim(),
            message: (formData.get('message') || '').toString().trim()
        };

        if (!payload.name || !payload.email || !payload.subject || !payload.message) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        setSubmitting(true);
        
        // Declarar apiUrl fora do try para estar acessível no catch
        let apiUrl = null;
        
        try {
            try {
                apiUrl = getApiBaseUrl() + '/api/messages';
            } catch (configError) {
                console.error('Erro de configuração da API:', configError);
                alert('Erro de configuração: ' + (configError.message || 'URL da API não configurada corretamente.'));
                setSubmitting(false);
                return;
            }
            
            console.log('Enviando mensagem para:', apiUrl);
            console.log('Payload:', payload);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
            
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!res.ok) {
                let errorMessage = `Erro ao enviar mensagem (HTTP ${res.status})`;
                try {
                    const errData = await res.json();
                    if (errData && typeof errData === 'object' && errData.error) {
                        errorMessage = errData.error;
                    } else if (typeof errData === 'string') {
                        errorMessage = errData;
                    }
                } catch (e) {
                    // Se não conseguir parsear JSON, usa a mensagem padrão
                }
                throw new Error(errorMessage);
            }

            alert('Mensagem enviada com sucesso!');
            form.reset();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            
            // Diagnóstico detalhado do erro
            const diagnosis = diagnoseFetchError(error, apiUrl || 'URL desconhecida');
            console.error('Diagnóstico do erro:', diagnosis);
            console.error('Detalhes completos:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                url: apiUrl || 'URL não disponível'
            });
            
            let msg = 'Não foi possível enviar sua mensagem.\n\n';
            
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                msg += 'Possíveis causas:\n';
                diagnosis.possibleCauses.slice(0, 3).forEach(cause => {
                    msg += `• ${cause}\n`;
                });
                msg += '\nSugestão: Verifique sua conexão ou entre em contato pelo WhatsApp/Email.';
                
                // Log adicional para desenvolvedores
                console.error('ERRO DE REDE DETECTADO');
                console.error('URL tentada:', apiUrl || 'URL não disponível');
                console.error('Origem da página:', window.location.origin);
                if (apiUrl) {
                    try {
                        const apiOrigin = new URL(apiUrl).origin;
                        console.error('Origem da API:', apiOrigin);
                        if (window.location.origin !== apiOrigin) {
                            console.error('⚠️ CORS: A requisição está sendo feita entre diferentes origens.');
                            console.error('   Verifique se o servidor permite requisições CORS deste domínio.');
                        }
                    } catch (e) {
                        console.error('Não foi possível determinar a origem da API');
                    }
                }
            } else if (error.name === 'AbortError') {
                msg += 'A requisição demorou muito. Tente novamente.';
            } else if (error instanceof Error) {
                msg += error.message || 'Tente novamente mais tarde.';
            } else if (typeof error === 'string') {
                msg += error;
            } else if (error && typeof error === 'object' && error.message) {
                msg += error.message;
            } else {
                msg += 'Tente novamente mais tarde.';
            }
            
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const openButtons = document.querySelectorAll('.open-budget-modal');
    const modal = document.getElementById('budgetModal');
    const closeEls = modal ? modal.querySelectorAll('[data-close="budget"]') : [];
    const budgetForm = document.getElementById('budgetForm');
    const submitBtn = budgetForm ? budgetForm.querySelector('button[type="submit"]') : null;


    function openModal() {
        if (!modal) return;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceInput = document.querySelector('#budgetForm input[name="service"]');
            const serviceFromCard = btn.closest('.servCard')?.querySelector('h2')?.textContent?.trim();
            if (serviceInput && serviceFromCard) {
                serviceInput.value = serviceFromCard;
            }
            openModal();
        });
    });

    closeEls.forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    if (budgetForm) {
        budgetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const fd = new FormData(budgetForm);
            const payload = {
                name: (fd.get('name') || '').toString().trim(),
                email: (fd.get('email') || '').toString().trim(),
                phone: (fd.get('phone') || '').toString().trim(),
                service: (fd.get('service') || '').toString().trim(),
                details: (fd.get('details') || '').toString().trim(),
                company: (fd.get('company') || '').toString().trim(),
                city: (fd.get('city') || '').toString().trim()
            };

            if (!payload.name || !payload.email || !payload.phone || !payload.service || !payload.details || !payload.city) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';
            }

            // Declarar apiUrl fora do try para estar acessível no catch
            let apiUrl = null;
            
            try {
                try {
                    apiUrl = getApiBaseUrl() + '/api/budgets';
                } catch (configError) {
                    console.error('Erro de configuração da API:', configError);
                    alert('Erro de configuração: ' + (configError.message || 'URL da API não configurada corretamente.'));
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Enviar pedido';
                    }
                    return;
                }
                
                console.log('🔍 Enviando orçamento para:', apiUrl);
                console.log('📦 Payload:', payload);
                
                // Teste rápido de conectividade usando o endpoint de health
                try {
                    const healthUrl = getApiBaseUrl() + '/api/health';
                    const testController = new AbortController();
                    const testTimeout = setTimeout(() => testController.abort(), 5000);
                    const testRes = await fetch(healthUrl, {
                        method: 'GET',
                        signal: testController.signal
                    });
                    clearTimeout(testTimeout);
                    if (testRes.ok) {
                        const healthData = await testRes.json();
                        console.log('✅ API está acessível (health check):', healthData);
                    } else {
                        console.warn('⚠️ Health check retornou status:', testRes.status);
                    }
                } catch (testErr) {
                    console.warn('⚠️ Teste de conectividade falhou:', testErr.message);
                    console.warn('   Isso pode indicar que a API está offline ou inacessível.');
                    // Continuar mesmo assim, pois pode ser um problema temporário
                }
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
                
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                    mode: 'cors' // Garantir que CORS está habilitado
                });
                
                clearTimeout(timeoutId);
                
                console.log('📡 Resposta da API:', {
                    status: res.status,
                    statusText: res.statusText,
                    headers: Object.fromEntries(res.headers.entries())
                });
                
                if (!res.ok) {
                    let errorMessage = `Erro ao enviar orçamento (HTTP ${res.status})`;
                    let errorDetails = null;
                    try {
                        const errData = await res.json();
                        console.error('❌ Erro da API:', errData);
                        if (errData && typeof errData === 'object') {
                            if (errData.error) {
                                errorMessage = errData.error;
                            }
                            if (errData.details) {
                                errorDetails = errData.details;
                            }
                        } else if (typeof errData === 'string') {
                            errorMessage = errData;
                        }
                    } catch (e) {
                        // Se não conseguir parsear JSON, tenta ler como texto
                        try {
                            const text = await res.text();
                            console.error('❌ Resposta da API (texto):', text);
                            if (text) {
                                errorDetails = text.substring(0, 200); // Limitar tamanho
                            }
                        } catch (textErr) {
                            console.error('Não foi possível ler a resposta da API');
                        }
                    }
                    
                    const fullError = errorDetails ? `${errorMessage}\n\nDetalhes: ${errorDetails}` : errorMessage;
                    throw new Error(fullError);
                }
                
                // Verificar se a resposta é JSON válido
                let responseData = null;
                try {
                    responseData = await res.json();
                    console.log('✅ Resposta da API:', responseData);
                } catch (jsonErr) {
                    console.warn('⚠️ Resposta não é JSON válido, mas status é OK');
                }
                
                alert('✅ Orçamento enviado com sucesso! Entraremos em contato em breve.');
                budgetForm.reset();
                closeModal();
            } catch (err) {
                console.error('Erro ao enviar orçamento:', err);
                
                // Diagnóstico detalhado do erro
                const diagnosis = diagnoseFetchError(err, apiUrl || 'URL desconhecida');
                console.error('Diagnóstico do erro:', diagnosis);
                console.error('Detalhes completos:', {
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                    url: apiUrl || 'URL não disponível'
                });
                
                let msg = '❌ Não foi possível enviar seu orçamento.\n\n';
                
                if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                    msg += '🔍 Possíveis causas:\n';
                    diagnosis.possibleCauses.slice(0, 3).forEach(cause => {
                        msg += `• ${cause}\n`;
                    });
                    msg += '\n💡 Sugestões:\n';
                    msg += '• Verifique sua conexão com a internet\n';
                    msg += '• Tente novamente em alguns instantes\n';
                    msg += '• Entre em contato direto:\n';
                    msg += '  📱 WhatsApp: (88) 9 8233-6089\n';
                    msg += '  📧 Email: starkestsuportetecnico@gmail.com';
                    
                    // Log adicional para desenvolvedores
                    console.error('🚨 ERRO DE REDE DETECTADO');
                    console.error('📍 URL tentada:', apiUrl || 'URL não disponível');
                    console.error('🌐 Origem da página:', window.location.origin);
                    if (apiUrl) {
                        try {
                            const apiOrigin = new URL(apiUrl).origin;
                            console.error('🔗 Origem da API:', apiOrigin);
                            if (window.location.origin !== apiOrigin) {
                                console.warn('ℹ️ CORS: Requisição entre origens diferentes é normal.');
                                console.warn('   Origem:', window.location.origin, '→ API:', apiOrigin);
                                console.warn('   A API já está configurada para permitir CORS.');
                            }
                            
                            // Tentar fazer um teste simples de conectividade
                            console.log('🔍 Testando conectividade básica...');
                            const testController2 = new AbortController();
                            const testTimeout2 = setTimeout(() => testController2.abort(), 5000);
                            fetch(apiUrl, { method: 'OPTIONS', signal: testController2.signal })
                                .then(testRes => {
                                    clearTimeout(testTimeout2);
                                    console.log('✅ Teste de conectividade:', testRes.status, testRes.statusText);
                                })
                                .catch(testErr => {
                                    clearTimeout(testTimeout2);
                                    console.error('❌ Teste de conectividade falhou:', testErr.message);
                                });
                        } catch (e) {
                            console.error('Não foi possível determinar a origem da API');
                        }
                    }
                } else if (err.name === 'AbortError') {
                    msg += '⏱️ A requisição demorou muito (timeout).\n\n';
                    msg += '💡 Tente novamente ou entre em contato:\n';
                    msg += '📱 WhatsApp: (88) 9 8233-6089\n';
                    msg += '📧 Email: starkestsuportetecnico@gmail.com';
                } else if (err instanceof Error) {
                    const errorMsg = err.message || 'Tente novamente mais tarde.';
                    msg += errorMsg;
                    if (!errorMsg.includes('WhatsApp') && !errorMsg.includes('Email')) {
                        msg += '\n\n💡 Se o problema persistir, entre em contato:\n';
                        msg += '📱 WhatsApp: (88) 9 8233-6089\n';
                        msg += '📧 Email: starkestsuportetecnico@gmail.com';
                    }
                } else if (typeof err === 'string') {
                    msg += err;
                } else if (err && typeof err === 'object' && err.message) {
                    msg += err.message;
                } else {
                    msg += 'Tente novamente mais tarde.\n\n';
                    msg += '💡 Se o problema persistir, entre em contato:\n';
                    msg += '📱 WhatsApp: (88) 9 8233-6089\n';
                    msg += '📧 Email: starkestsuportetecnico@gmail.com';
                }
                
                alert(msg);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enviar pedido';
                }
            }
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Modal de informação de serviços (seção Clientes -> cards de software)
    const serviceIcons = document.querySelectorAll('.software .cardsWrapper .card i.material-icons');
    const modal = document.getElementById('serviceInfoModal');
    const titleEl = document.getElementById('serviceInfoTitle');
    const contentEl = document.getElementById('serviceInfoContent');
    const closeEls = modal ? modal.querySelectorAll('[data-close="service"]') : [];
    const ctaBtn = document.getElementById('serviceInfoCTA');

    if (!serviceIcons.length || !modal || !titleEl || !contentEl) return;

    function openModal() {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    serviceIcons.forEach(icon => {
        icon.style.cursor = 'pointer';
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            const card = icon.closest('.card');
            const title = card?.querySelector('h2')?.textContent?.trim() || 'Serviço';
            const desc = card?.querySelector('p')?.textContent?.trim() || '';
            const detailsEl = card?.querySelector('.popup-details');
            const iconName = card?.querySelector('i.material-icons')?.textContent?.trim() || '';

            // Título com ícone para manter padrão visual
            if (iconName) {
                titleEl.innerHTML = `<i class="material-icons">${iconName}</i>${title}`;
            } else {
                titleEl.textContent = title;
            }
            if (detailsEl) {
                contentEl.innerHTML = detailsEl.innerHTML;
            } else {
                contentEl.innerHTML = '';
                const p = document.createElement('p');
                p.textContent = desc;
                contentEl.appendChild(p);
            }

            // Guardar nome do serviço para CTA
            if (ctaBtn) {
                ctaBtn.dataset.serviceName = title;
            }

            openModal();
        });
    });

    closeEls.forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // CTA: abre modal de orçamento já com o serviço preenchido
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            const serviceName = ctaBtn.dataset.serviceName || '';
            closeModal();

            const budgetModal = document.getElementById('budgetModal');
            const serviceInput = document.querySelector('#budgetForm input[name="service"]');
            if (serviceInput && serviceName) {
                serviceInput.value = serviceName;
            }
            if (budgetModal) {
                budgetModal.classList.add('show');
                budgetModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
        });
    }
});


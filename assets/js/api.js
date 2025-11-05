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
        try {
            let apiUrl;
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
                url: apiUrl
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
                console.error('URL tentada:', apiUrl);
                console.error('Origem da página:', window.location.origin);
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

            try {
                let apiUrl;
                try {
                    apiUrl = getApiBaseUrl() + '/api/budgets';
                } catch (configError) {
                    console.error('Erro de configuração da API:', configError);
                    alert('Erro de configuração: ' + (configError.message || 'URL da API não configurada corretamente.'));
                    return;
                }
                
                console.log('Enviando orçamento para:', apiUrl);
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
                    let errorMessage = `Erro ao enviar orçamento (HTTP ${res.status})`;
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
                
                alert('Orçamento enviado com sucesso!');
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
                    url: apiUrl
                });
                
                let msg = 'Não foi possível enviar seu orçamento.\n\n';
                
                if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                    msg += 'Possíveis causas:\n';
                    diagnosis.possibleCauses.slice(0, 3).forEach(cause => {
                        msg += `• ${cause}\n`;
                    });
                    msg += '\nSugestão: Verifique sua conexão ou entre em contato pelo WhatsApp/Email.';
                    
                    // Log adicional para desenvolvedores
                    console.error('ERRO DE REDE DETECTADO');
                    console.error('URL tentada:', apiUrl);
                    console.error('Origem da página:', window.location.origin);
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
                } else if (err.name === 'AbortError') {
                    msg += 'A requisição demorou muito. Tente novamente.';
                } else if (err instanceof Error) {
                    msg += err.message || 'Tente novamente mais tarde.';
                } else if (typeof err === 'string') {
                    msg += err;
                } else if (err && typeof err === 'object' && err.message) {
                    msg += err.message;
                } else {
                    msg += 'Tente novamente mais tarde.';
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


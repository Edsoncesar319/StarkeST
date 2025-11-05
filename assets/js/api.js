document.addEventListener('DOMContentLoaded', function() {
    const contactsSection = document.querySelector('#contacts');
    if (!contactsSection) return;
    const form = contactsSection.querySelector('form');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');

    function getApiBaseUrl() {
        // Prefer explicit runtime config set in HTML
        if (window.__API_BASE_URL__ && typeof window.__API_BASE_URL__ === 'string') {
            return window.__API_BASE_URL__;
        }
        // Fallback to <meta name="api-base-url" content="..."> if present
        const metaTag = document.querySelector('meta[name="api-base-url"][content]');
        if (metaTag && metaTag.getAttribute('content')) {
            return metaTag.getAttribute('content');
        }
        // Local development default
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        // In produção, exigir configuração explícita para evitar chamadas ao mesmo domínio incorretas
        throw new Error('API base URL não configurado. Defina window.__API_BASE_URL__ ou <meta name="api-base-url" content="https://sua-api">.');
    }

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
            const res = await fetch(getApiBaseUrl() + '/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                let errorMessage = `Erro ao enviar (HTTP ${res.status})`;
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
            let msg = 'Não foi possível enviar sua mensagem. Tente novamente mais tarde.';
            if (error instanceof Error) {
                msg = error.message || msg;
            } else if (typeof error === 'string') {
                msg = error;
            } else if (error && typeof error === 'object' && error.message) {
                msg = error.message;
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

    function getApiBaseUrl() {
        if (window.__API_BASE_URL__ && typeof window.__API_BASE_URL__ === 'string') {
            return window.__API_BASE_URL__;
        }
        const metaTag = document.querySelector('meta[name="api-base-url"][content]');
        if (metaTag && metaTag.getAttribute('content')) {
            return metaTag.getAttribute('content');
        }
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        throw new Error('API base URL não configurado. Defina window.__API_BASE_URL__ ou <meta name="api-base-url" content="https://sua-api">.');
    }

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
                const res = await fetch(getApiBaseUrl() + '/api/budgets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    let errorMessage = `Erro ao enviar (HTTP ${res.status})`;
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
                let msg = 'Não foi possível enviar seu orçamento. Tente novamente.';
                if (err instanceof Error) {
                    msg = err.message || msg;
                } else if (typeof err === 'string') {
                    msg = err;
                } else if (err && typeof err === 'object' && err.message) {
                    msg = err.message;
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


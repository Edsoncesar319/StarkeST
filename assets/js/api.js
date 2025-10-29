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
        // Production MUST be configured; throw explicit error to aid debugging
        throw new Error('API base URL não configurado. Defina window.__API_BASE_URL__ ou meta[name="api-base-url"].');
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
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `Erro ao enviar (HTTP ${res.status})`);
            }

            alert('Mensagem enviada com sucesso!');
            form.reset();
        } catch (error) {
            console.error(error);
            const msg = error && error.message ? error.message : 'Não foi possível enviar sua mensagem. Tente novamente mais tarde.';
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
        throw new Error('API base URL não configurado. Defina window.__API_BASE_URL__ ou meta[name="api-base-url"].');
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
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || `Erro ao enviar (HTTP ${res.status})`);
                }
                alert('Orçamento enviado com sucesso!');
                budgetForm.reset();
                closeModal();
            } catch (err) {
                console.error(err);
                const msg = err && err.message ? err.message : 'Não foi possível enviar seu orçamento. Tente novamente.';
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



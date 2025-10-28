// ========== Skeleton Loader ==========
window.addEventListener('load', () => {
    const skeletonLoader = document.getElementById('skeletonLoader');
    setTimeout(() => {
        skeletonLoader.classList.add('hidden');
        setTimeout(() => {
            skeletonLoader.style.display = 'none';
        }, 500);
    }, 1000);
});

// ========== Navbar Float Effect ==========
const navbar = document.getElementById('navbar');
const container = document.getElementById('container');

container.addEventListener('scroll', () => {
    if (container.scrollTop > 100) {
        navbar.classList.remove('navbar');
        navbar.classList.add('floatTopBar');
    } else {
        navbar.classList.remove('floatTopBar');
        navbar.classList.add('navbar');
    }
});

// ========== Active Navigation ==========
const links = document.querySelectorAll(".navItem");

links.forEach(link => {
    link.addEventListener("click", function () {
        links.forEach(l => l.classList.remove("active"));
        this.classList.add("active");
    });
});

// ========== Scroll Animations ==========
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Para stagger items (animação sequencial)
            if (entry.target.classList.contains('stagger-item')) {
                const parent = entry.target.parentElement;
                const items = Array.from(parent.children).filter(child =>
                    child.classList.contains('stagger-item')
                );
                const index = items.indexOf(entry.target);

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100); // 150ms de delay entre cada item
            } else {
                entry.target.classList.add('visible');
            }

            // Para não observar mais após a animação
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar todos os elementos com classes de animação
const animatedElements = document.querySelectorAll(
    '.fade-in, .fade-in-left, .fade-in-right, .stagger-item'
);

animatedElements.forEach(el => observer.observe(el));

// ========== Smooth Scroll para Links Internos ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const container = document.getElementById('container');
            const targetPosition = target.offsetTop;

            container.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========== Form Submission (Placeholder) ==========
const contactForm = document.querySelector('.message form');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Aqui você pode adicionar a lógica de envio do formulário
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        console.log('Form submitted:', data);

        // Feedback visual
        const button = this.querySelector('button');
        const originalText = button.textContent;
        button.textContent = 'Enviando...';
        button.disabled = true;

        // Simular envio
        setTimeout(() => {
            button.textContent = 'Mensagem Enviada!';
            button.style.backgroundColor = '#10b981';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
                this.reset();
            }, 2000);
        }, 1500);
    });
}

// ========== Atualização automática da navegação ao rolar ==========
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.navItem');

container.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (container.scrollTop >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
});
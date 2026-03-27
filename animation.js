// animations.js
export function initAnimations() {
    createParticles();
    initScrollAnimations();
    initHoverEffects();
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    // Create 3 layers of particles for depth
    const layers = [
        { count: 20, size: 4, speed: 20, opacity: 0.1 },
        { count: 30, size: 2, speed: 15, opacity: 0.2 },
        { count: 40, size: 1, speed: 10, opacity: 0.4 }
    ];

    layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const left = Math.random() * 100;
            const delay = Math.random() * 20;
            const duration = layer.speed + (Math.random() * 10);

            particle.style.cssText = `
                left: ${left}%;
                width: ${layer.size}px;
                height: ${layer.size}px;
                opacity: ${layer.opacity};
                animation: floatParticle ${duration}s linear infinite;
                animation-delay: -${delay}s;
                background: white;
                box-shadow: 0 0 10px white;
            `;
            
            particlesContainer.appendChild(particle);
        }
    });
}

export function init3DTilt(elementId) {
    // Disabled — no card movement per user preference
}


function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(element);
    });
}

function initHoverEffects() {
    // Disabled — no card movement per user preference
}

// Animation de chargement
export function showLoading(element) {
    element.classList.add('loading');
    element.style.pointerEvents = 'none';
}

export function hideLoading(element) {
    element.classList.remove('loading');
    element.style.pointerEvents = 'auto';
}

// Animation de notification premium
export function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} glass-card`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check' : type === 'warning' ? 'fa-exclamation' : 'fa-times'}"></i>
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(notification);

    // Style inline pour assurer le rendu immédiat avant le chargement du CSS complet
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        color: white;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
        animation: slideInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    `;

    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Animation de compteur pour les stats
export function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;

    let start = parseInt(el.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(easeProgress * (target - start) + start);
        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

// Animation d'entrée en cascade pour les listes
export function revealItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = container.children;
    Array.from(items).forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}


// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification-warning {
        border-left: 4px solid #f59e0b;
    }
`;
document.head.appendChild(style);
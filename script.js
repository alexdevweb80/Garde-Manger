import { initAuth, logoutUser } from './auth.js';
import { initInventory, addItem } from './inventory.js';
import { initShoppingList, clearShoppingList } from './shopping-list.js';
import { initAnimations, showNotification, init3DTilt, animateCounter, revealItems } from './animation.js';

// Initialiser l'app
initAnimations();
initAuth();


// --- Signup form submit ---
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm  = document.getElementById('signup-confirm-password').value;

        if (password !== confirm) {
            showNotification('Les mots de passe ne correspondent pas.', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Le mot de passe doit contenir au moins 6 caractères.', 'error');
            return;
        }

        const { signUpUser } = await import('./auth.js');
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Création...</span>';

        const { user, error } = await signUpUser(email, password);
        if (error) {
            showNotification(error, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>S\'inscrire</span><i class="fas fa-user-plus" style="margin-left:10px"></i>';
        } else {
            showNotification('Compte créé avec succès !', 'success');
        }
    });
}

// --- Login form submit ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const { loginUser } = await import('./auth.js');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Connexion...</span>';

        const { user, error } = await loginUser(email, password);
        if (error) {
            showNotification(error, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Se connecter</span><i class="fas fa-arrow-right" style="margin-left:10px"></i>';
        }
    });
}

// Exposer les fonctions globales pour le HTML
window.addItem = addItem;
window.clearShoppingList = clearShoppingList;

// Écouter la connexion utilisateur
window.addEventListener('userLoggedIn', (e) => {
    const user = e.detail;
    
    // UI Updates
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('welcome-msg').textContent = `Bienvenue, ${user.displayName || user.email.split('@')[0]}`;
    
    // Init Modules
    initInventory(user);
    initShoppingList(user);
    
    // Kickstart animations
    setTimeout(() => {
        init3DTilt('auth-card'); // Still works for login card if needed
        // Apply 3D tilt to all glass cards on dashboard
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach(card => {
            if (!card.id) card.id = 'card-' + Math.random().toString(36).substr(2, 9);
            init3DTilt(card.id);
        });
    }, 500);
});

// Gérer les stats dynamiques
window.addEventListener('inventoryUpdated', () => {
    // Calculer les stats localement à partir du DOM (rapide et visuel)
    const allItems = document.querySelectorAll('.item');
    const criticalItems = document.querySelectorAll('.item.critical');
    const shoppingItems = document.querySelectorAll('.shopping-item');
    
    animateCounter('total-count', allItems.length);
    animateCounter('critical-count', criticalItems.length);
    animateCounter('shopping-items-count', shoppingItems.length);
    
    // Reveal newly added items
    revealItems('frigo-list');
    revealItems('placard-list');
});

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await logoutUser();
        window.location.reload();
    };
}
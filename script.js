// script.js
import { initAuth, loginUser, signUpUser, logoutUser } from './auth.js';
import { initInventory } from './inventory.js';
import { initShoppingList } from './shopping-list.js';
import { initAnimations, showNotification } from './animation.js';

// Initialiser les animations
initAnimations();

// Initialiser l'authentification
initAuth();

// Gestion des formulaires
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');

const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');

// Toggle forms
if (showSignup) {
    showSignup.onclick = (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    };
}

if (showLogin) {
    showLogin.onclick = (e) => {
        e.preventDefault();
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    };
}

// Login
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const { user, error } = await loginUser(email, password);
        if (error) {
            showNotification(`Erreur: ${error}`, 'error');
        } else {
            showNotification('Connexion réussie !', 'success');
        }
    };
}

// Signup
if (signupForm) {
    signupForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        const { user, error } = await signUpUser(email, password);
        if (error) {
            showNotification(`Erreur: ${error}`, 'error');
        } else {
            showNotification('Compte créé avec succès !', 'success');
        }
    };
}

// Logout
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        const { error } = await logoutUser();
        if (error) {
            showNotification(`Erreur: ${error}`, 'error');
        } else {
            showNotification('Déconnexion réussie', 'success');
            window.location.reload(); // Recharger pour réinitialiser l'état
        }
    };
}

// Attendre que l'utilisateur soit connecté
window.addEventListener('userLoggedIn', (event) => {
    const user = event.detail;

    // Initialiser les modules
    initInventory(user);
    initShoppingList(user);

    showNotification(`Bienvenue ${user.displayName || user.email} !`, 'success');
    console.log('Application initialisée avec succès pour:', user.email);
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
    showNotification('Une erreur est survenue', 'error');
});

// Message de bienvenue dans la console
console.log('🍽️ Chef\'s Pantry - Application de gestion d\'inventaire chargée avec succès!');
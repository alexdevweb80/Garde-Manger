// script.js
import { initAuth } from './auth.js';
import { initInventory } from './inventory.js';
import { initShoppingList } from './shopping-list.js';
import { initAnimations, showNotification } from './animations.js';

// Initialiser les animations
initAnimations();

// Initialiser l'authentification
initAuth();

// Attendre que l'utilisateur soit connecté
window.addEventListener('userLoggedIn', (event) => {
    const user = event.detail;

    // Initialiser les modules
    initInventory(user);
    initShoppingList(user);

    showNotification(`Bienvenue ${user.displayName} !`, 'success');
    console.log('Application initialisée avec succès pour:', user.email);
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
    showNotification('Une erreur est survenue', 'error');
});

// Message de bienvenue dans la console
console.log('🍽️ Chef\'s Pantry - Application de gestion d\'inventaire chargée avec succès!');
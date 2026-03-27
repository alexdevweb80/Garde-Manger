// Ajouter en haut du fichier
import { showNotification } from './animations.js';

// Modifier la fonction addItem pour ajouter une notification
export async function addItem(category) {
    // ... code existant ...

    try {
        await addDoc(collection(db, 'inventory'), {
            // ... données ...
        });

        // Réinitialiser les champs
        nameInput.value = '';
        quantityInput.value = '1';

        // Recharger l'inventaire
        await loadCategoryItems(category);
        updateStats();

        // Ajouter la notification
        showNotification(`${name} ajouté au ${category === 'frigo' ? 'frigo' : 'placard'}`, 'success');

        window.dispatchEvent(new CustomEvent('inventoryUpdated'));
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        showNotification('Erreur lors de l\'ajout du produit', 'error');
    }
}

// Modifier updateQuantity
export async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 0) return;

    try {
        const itemRef = doc(db, 'inventory', itemId);
        await updateDoc(itemRef, { quantity: newQuantity });

        await loadCategoryItems('frigo');
        await loadCategoryItems('placard');
        updateStats();

        if (newQuantity <= 1) {
            showNotification(`⚠️ Stock critique !`, 'warning');
        }

        window.dispatchEvent(new CustomEvent('inventoryUpdated'));
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

// Modifier deleteItem
export async function deleteItem(itemId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        try {
            await deleteDoc(doc(db, 'inventory', itemId));

            await loadCategoryItems('frigo');
            await loadCategoryItems('placard');
            updateStats();

            showNotification('Article supprimé avec succès', 'success');
            window.dispatchEvent(new CustomEvent('inventoryUpdated'));
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}
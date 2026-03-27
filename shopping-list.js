// Ajouter en haut
import { showNotification } from './animations.js';

// Modifier removeFromShoppingList
export async function removeFromShoppingList(itemId) {
    try {
        await deleteDoc(doc(db, 'shoppingList', itemId));
        await loadShoppingList();

        const container = document.getElementById('shopping-list');
        const itemCount = container.children.length;
        document.getElementById('shopping-items').textContent = itemCount;

        const clearBtn = document.getElementById('clear-shopping-list');
        clearBtn.style.display = itemCount === 0 ? 'none' : 'block';

        showNotification('Article retiré de la liste de course', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// Modifier clearShoppingList
async function clearShoppingList() {
    if (confirm('Voulez-vous vraiment vider la liste de course ?')) {
        try {
            const q = query(
                collection(db, 'shoppingList'),
                where('userId', '==', currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const batch = writeBatch(db);

            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            await loadShoppingList();
            document.getElementById('shopping-items').textContent = 0;
            showNotification('Liste de course vidée', 'success');
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur lors du vidage', 'error');
        }
    }
}
import { showNotification } from './animation.js';
import { db, auth } from './config.js';
import { 
    collection, 
    addDoc,
    getDocs, 
    doc, 
    query, 
    where, 
    deleteDoc, 
    writeBatch,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function initShoppingList(user) {
    if (!user) return;
    const q = query(
        collection(db, 'shoppingList'),
        where('userId', '==', user.uid)
        // No orderBy → no composite index required
    );
    onSnapshot(q, snapshot => renderShoppingList(snapshot), err => console.error('Shopping list error:', err));
}

function renderShoppingList(snapshot) {
    const container = document.getElementById('shopping-list');
    if (!container) return;

    container.innerHTML = '';
    let count = 0;

    if (snapshot.empty) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <i class="fas fa-shopping-basket"></i>
                <p>La liste de courses est vide</p>
            </div>`;
    } else {
        snapshot.forEach(docSnap => {
            const item = docSnap.data();
            count++;
            const isOutOfStock = item.outOfStock === true;

            const div = document.createElement('div');
            div.className = `shopping-item glass-card ${isOutOfStock ? 'rupture' : ''}`;
            div.innerHTML = `
                <div class="shopping-item-header">
                    ${isOutOfStock ? '<span class="badge-rupture"><i class="fas fa-exclamation-triangle"></i> RUPTURE</span>' : ''}
                    <p class="shopping-item-name">${item.name}</p>
                </div>
                <div class="shopping-item-footer">
                    <span class="shopping-qty">Besoin : <strong>${item.quantity}</strong></span>
                    <button onclick="removeShoppingItem('${docSnap.id}')" class="btn-check" title="Marquer comme acheté">
                        <i class="fas fa-check"></i> Acheté
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Update counter
    const countEl = document.getElementById('shopping-items-count');
    if (countEl) countEl.textContent = count;

    const clearBtn = document.getElementById('clear-shopping-list');
    if (clearBtn) clearBtn.style.display = count === 0 ? 'none' : 'inline-flex';
}

export async function removeShoppingItem(id) {
    try {
        await deleteDoc(doc(db, 'shoppingList', id));
        showNotification('✅ Article récupéré !', 'success');
    } catch (e) {
        showNotification('Erreur', 'error');
    }
}

export async function clearShoppingList() {
    if (!confirm('Vider toute la liste de courses ?')) return;
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'shoppingList'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(d => batch.delete(d.ref));
    await batch.commit();
    showNotification('🧹 Liste vidée', 'success');
}

window.removeShoppingItem = removeShoppingItem;
window.clearShoppingList  = clearShoppingList;
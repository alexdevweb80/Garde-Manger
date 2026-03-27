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
    const q = query(collection(db, 'shoppingList'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        renderShoppingList(snapshot);
    });
}

function renderShoppingList(snapshot) {
    const container = document.getElementById('shopping-list');
    if (!container) return;
    
    container.innerHTML = '';
    let count = 0;

    snapshot.forEach((doc) => {
        const item = doc.data();
        count++;
        const div = document.createElement('div');
        div.className = 'shopping-item glass-card';
        div.innerHTML = `
            <div class="shopping-item-info">
                <p class="shopping-item-name">${item.name}</p>
                <p class="shopping-item-quantity">Besoin de: ${item.quantity}</p>
            </div>
            <button onclick="removeShoppingItem('${doc.id}')" class="btn-danger btn-sm"><i class="fas fa-check"></i></button>
        `;
        container.appendChild(div);
    });

    document.getElementById('shopping-items-count').textContent = count;
    const clearBtn = document.getElementById('clear-shopping-list');
    if (clearBtn) clearBtn.style.display = count === 0 ? 'none' : 'inline-flex';
}

export async function removeShoppingItem(id) {
    try {
        await deleteDoc(doc(db, 'shoppingList', id));
        showNotification("Article récupéré !", "success");
    } catch (e) {
        showNotification("Erreur", "error");
    }
}

export async function clearShoppingList() {
    if (!confirm('Vider toute la liste ?')) return;
    const user = auth.currentUser;
    const q = query(collection(db, 'shoppingList'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(d => batch.delete(d.ref));
    await batch.commit();
    showNotification("Liste vidée", "success");
}

window.removeShoppingItem = removeShoppingItem;
window.clearShoppingList = clearShoppingList;
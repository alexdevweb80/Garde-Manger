import { showNotification } from './animation.js';
import { db, auth } from './config.js';
import { 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Charger les items d'une catégorie
export function initInventory(user) {
    if (!user) return;
    
    // Écouter les changements en temps réel
    const qFrigo = query(collection(db, 'inventory'), where('userId', '==', user.uid), where('category', '==', 'frigo'), orderBy('createdAt', 'desc'));
    const qPlacard = query(collection(db, 'inventory'), where('userId', '==', user.uid), where('category', '==', 'placard'), orderBy('createdAt', 'desc'));

    onSnapshot(qFrigo, (snapshot) => renderList(snapshot, 'frigo-list'));
    onSnapshot(qPlacard, (snapshot) => renderList(snapshot, 'placard-list'));
}

async function renderList(snapshot, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    let total = 0;

    snapshot.forEach((doc) => {
        const item = doc.data();
        total++;
        const itemEl = createItemElement(doc.id, item);
        container.appendChild(itemEl);
    });

    updateStats();
}

function createItemElement(id, item) {
    const div = document.createElement('div');
    div.className = `item glass-card ${item.quantity <= 1 ? 'critical' : ''}`;
    div.innerHTML = `
        <div class="item-info">
            <p class="item-name">${item.name}</p>
            <p class="item-quantity">Quantité: ${item.quantity}</p>
        </div>
        <div class="item-actions">
            <button onclick="changeStock('${id}', ${item.quantity + 1})" class="btn-warning"><i class="fas fa-plus"></i></button>
            <button onclick="changeStock('${id}', ${item.quantity - 1})" class="btn-warning"><i class="fas fa-minus"></i></button>
            <button onclick="removeItem('${id}')" class="btn-danger"><i class="fas fa-trash"></i></button>
        </div>
    `;
    return div;
}

export async function addItem(category) {
    const user = auth.currentUser;
    if (!user) return;

    const nameInput = document.getElementById(`${category}-name`);
    const quantityInput = document.getElementById(`${category}-quantity`);
    
    const name = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 1;

    if (!name) return;

    try {
        await addDoc(collection(db, 'inventory'), {
            name,
            quantity,
            category,
            userId: user.uid,
            createdAt: new Date()
        });
        nameInput.value = '';
        quantityInput.value = '1';
        showNotification(`${name} ajouté !`, 'success');
    } catch (e) {
        showNotification("Erreur d'ajout", 'error');
    }
}

export async function changeStock(id, newQty) {
    if (newQty < 0) return;
    try {
        await updateDoc(doc(db, 'inventory', id), { quantity: newQty });
        if (newQty <= 1) showNotification("Stock critique !", "warning");
    } catch (e) {
        showNotification("Erreur de mise à jour", "error");
    }
}

export async function removeItem(id) {
    if (!confirm("Supprimer cet article ?")) return;
    try {
        await deleteDoc(doc(db, 'inventory', id));
        showNotification("Article supprimé", "success");
    } catch (e) {
        showNotification("Erreur de suppression", "error");
    }
}

// Global exposure for onclick handlers
window.changeStock = changeStock;
window.removeItem = removeItem;

function updateStats() {
    // Sera géré dans script.js ou animation.js
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
}
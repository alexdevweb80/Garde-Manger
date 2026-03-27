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
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ─── Emoji auto-detection ─────────────────────────────────────────────────────
const EMOJI_MAP = [
    { k: ['poulet','chicken'],                               e: '🍗' },
    { k: ['boeuf','steak','viande','bifteck'],               e: '🥩' },
    { k: ['porc','jambon','lardons','bacon'],                e: '🥓' },
    { k: ['poisson','saumon','thon','cabillaud','sardine'],  e: '🐟' },
    { k: ['crevettes','fruits de mer'],                      e: '🦐' },
    { k: ['oeuf','oeufs'],                                   e: '🥚' },
    { k: ['salade','laitue','roquette'],                     e: '🥗' },
    { k: ['tomate'],                                         e: '🍅' },
    { k: ['carotte'],                                        e: '🥕' },
    { k: ['brocoli','brocolis'],                             e: '🥦' },
    { k: ['poivron'],                                        e: '🌶️' },
    { k: ['courgette','concombre'],                          e: '🥒' },
    { k: ['aubergine'],                                      e: '🍆' },
    { k: ['oignon'],                                         e: '🧅' },
    { k: ['ail'],                                            e: '🧄' },
    { k: ['pomme de terre','patate'],                        e: '🥔' },
    { k: ['champignon'],                                     e: '🍄' },
    { k: ['avocat'],                                         e: '🥑' },
    { k: ['epinard','épinard'],                              e: '🌿' },
    { k: ['pomme'],                                          e: '🍎' },
    { k: ['banane'],                                         e: '🍌' },
    { k: ['orange'],                                         e: '🍊' },
    { k: ['citron'],                                         e: '🍋' },
    { k: ['fraise'],                                         e: '🍓' },
    { k: ['raisin'],                                         e: '🍇' },
    { k: ['melon'],                                          e: '🍈' },
    { k: ['pastèque'],                                       e: '🍉' },
    { k: ['ananas'],                                         e: '🍍' },
    { k: ['mangue'],                                         e: '🥭' },
    { k: ['kiwi'],                                           e: '🥝' },
    { k: ['lait'],                                           e: '🥛' },
    { k: ['beurre'],                                         e: '🧈' },
    { k: ['fromage','comté','camembert','brie','gouda'],     e: '🧀' },
    { k: ['yaourt','yogourt'],                               e: '🫙' },
    { k: ['crème','creme'],                                  e: '🥛' },
    { k: ['pain','baguette','brioche'],                      e: '🍞' },
    { k: ['croissant'],                                      e: '🥐' },
    { k: ['farine'],                                         e: '🌾' },
    { k: ['gâteau','gateau','cake'],                         e: '🎂' },
    { k: ['biscuit','cookie'],                               e: '🍪' },
    { k: ['pâtes','pasta','spaghetti','macaroni'],           e: '🍝' },
    { k: ['riz'],                                            e: '🍚' },
    { k: ['lentilles','haricots'],                           e: '🫘' },
    { k: ['huile','olive'],                                  e: '🫒' },
    { k: ['sel'],                                            e: '🧂' },
    { k: ['sucre'],                                          e: '🍬' },
    { k: ['café'],                                           e: '☕' },
    { k: ['thé','tisane'],                                   e: '🍵' },
    { k: ['chocolat','cacao','nutella'],                     e: '🍫' },
    { k: ['miel'],                                           e: '🍯' },
    { k: ['confiture'],                                      e: '🍓' },
    { k: ['soupe'],                                          e: '🍲' },
    { k: ['jus','nectar'],                                   e: '🧃' },
    { k: ['eau'],                                            e: '💧' },
    { k: ['bière'],                                          e: '🍺' },
    { k: ['vin'],                                            e: '🍷' },
    { k: ['lessive','nettoyant','désinfectant'],             e: '🧹' },
    { k: ['papier','essuie'],                                e: '🧻' },
    { k: ['savon','shampoing'],                              e: '🧼' },
];

function getEmoji(name, category) {
    const lower = name.toLowerCase();
    for (const { k, e } of EMOJI_MAP) {
        if (k.some(kw => lower.includes(kw))) return e;
    }
    return category === 'frigo' ? '❄️' : '📦';
}

// ─── Init ─────────────────────────────────────────────────────────────────────
// Query by userId only → no composite index needed. Filter category client-side.
export function initInventory(user) {
    if (!user) return;

    const q = query(
        collection(db, 'inventory'),
        where('userId', '==', user.uid)
    );

    onSnapshot(q,
        snap => {
            const frigoItems   = [];
            const placardItems = [];

            snap.forEach(d => {
                const item = { id: d.id, ...d.data() };
                if (item.category === 'frigo')   frigoItems.push(item);
                else if (item.category === 'placard') placardItems.push(item);
            });

            renderList(frigoItems,   'frigo-list');
            renderList(placardItems, 'placard-list');
        },
        err => {
            console.error('Inventory error:', err);
            showNotification('Erreur inventaire : ' + err.message, 'error');
        }
    );
}

// ─── Render list ──────────────────────────────────────────────────────────────
function renderList(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (!items.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>Aucun produit — ajoutez-en un !</p>
            </div>`;
        updateStats();
        return;
    }

    // Sort newest first client-side
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    items.forEach(item => container.appendChild(createItemElement(item.id, item)));
    updateStats();
}

// ─── Build item card ──────────────────────────────────────────────────────────
function createItemElement(id, item) {
    const qty     = item.quantity ?? 0;
    const isEmpty = qty === 0;
    const isCrit  = qty <= 1;           // critical at 1 unit
    const emoji   = getEmoji(item.name, item.category);

    const div = document.createElement('div');
    div.className = `item glass-card ${isEmpty ? 'out-of-stock' : isCrit ? 'critical' : ''}`;
    div.dataset.id = id;

    div.innerHTML = `
        <div class="item-info">
            <p class="item-name"><span class="item-emoji">${emoji}</span> ${item.name}</p>
            <p class="item-quantity-label">${
                isEmpty ? '⛔ Rupture de stock' : isCrit ? '⚠️ Dernier article — en liste de courses' : `Qté : ${qty}`
            }</p>
        </div>
        <div class="item-controls">
            <button class="ctrl-btn minus" onclick="changeStock('${id}', ${qty - 1})" title="Diminuer" ${qty === 0 ? 'disabled' : ''}>
                <i class="fas fa-minus"></i>
            </button>
            <span class="qty-badge ${isEmpty ? 'qty-zero' : isCrit ? 'qty-critical' : 'qty-ok'}">${qty}</span>
            <button class="ctrl-btn plus" onclick="changeStock('${id}', ${qty + 1})" title="Augmenter">
                <i class="fas fa-plus"></i>
            </button>
            <button class="ctrl-btn remove" onclick="removeItem('${id}')" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

// ─── Add item ─────────────────────────────────────────────────────────────────
export async function addItem(category) {
    const user = auth.currentUser;
    if (!user) { showNotification('Connectez-vous d\'abord', 'error'); return; }

    const nameInput     = document.getElementById(`${category}-name`);
    const quantityInput = document.getElementById(`${category}-quantity`);
    if (!nameInput || !quantityInput) return;

    const name     = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 1;

    if (!name) { showNotification('Entrez un nom de produit', 'warning'); return; }

    try {
        const docRef = await addDoc(collection(db, 'inventory'), {
            name, quantity, category,
            userId: user.uid,
            createdAt: Date.now()
        });

        nameInput.value     = '';
        quantityInput.value = '1';
        showNotification(`✅ ${name} ajouté !`, 'success');

        // Auto-add to shopping list if added with qty = 1
        if (quantity <= 1) {
            await addToShoppingListAuto(user, name);
        }

    } catch (e) {
        console.error(e);
        showNotification("Erreur d'ajout : " + e.message, 'error');
    }
}

// ─── Change stock ─────────────────────────────────────────────────────────────
export async function changeStock(id, newQty) {
    if (newQty < 0) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
        await updateDoc(doc(db, 'inventory', id), { quantity: newQty });

        if (newQty === 0) {
            const card = document.querySelector(`[data-id="${id}"] .item-name`);
            const name = card ? card.textContent.replace(/^\s*\S+\s*/, '').trim() : 'Produit';
            showNotification(`⛔ ${name} — rupture ! Ajouté à la liste de courses.`, 'error');
            await addToShoppingListAuto(user, name);
        } else if (newQty === 1) {
            const card = document.querySelector(`[data-id="${id}"] .item-name`);
            const name = card ? card.textContent.replace(/^\s*\S+\s*/, '').trim() : 'Produit';
            showNotification(`⚠️ ${name} — dernier article ! Ajouté à la liste de courses.`, 'warning');
            await addToShoppingListAuto(user, name);  // ← auto-add at 1 unit
        }
    } catch (e) {
        console.error(e);
        showNotification("Erreur : " + e.message, 'error');
    }
}

// ─── Remove item ──────────────────────────────────────────────────────────────
export async function removeItem(id) {
    if (!confirm('Supprimer cet article ?')) return;
    try {
        await deleteDoc(doc(db, 'inventory', id));
        showNotification('🗑️ Article supprimé', 'success');
    } catch (e) {
        showNotification("Erreur de suppression", 'error');
    }
}

// ─── Auto-add to shopping list (no duplicate) ─────────────────────────────────
async function addToShoppingListAuto(user, name) {
    try {
        // Check for existing entry
        const q = query(
            collection(db, 'shoppingList'),
            where('userId', '==', user.uid),
            where('name',   '==', name)
        );
        const { getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const existing = await getDocs(q);
        if (!existing.empty) return; // already listed

        await addDoc(collection(db, 'shoppingList'), {
            name,
            quantity: 1,
            userId: user.uid,
            outOfStock: true,
            createdAt: Date.now()
        });
    } catch (e) {
        console.error('Auto shopping list error:', e);
    }
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function updateStats() {
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
}

// ─── Global exposure ──────────────────────────────────────────────────────────
window.changeStock = changeStock;
window.removeItem  = removeItem;
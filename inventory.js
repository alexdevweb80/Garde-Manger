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
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ─── Emoji auto-detection ─────────────────────────────────────────────────────
const EMOJI_MAP = [
    // 🥩 Viandes & poissons
    { k: ['poulet','chicken'],          e: '🍗' },
    { k: ['boeuf','steak','viande','bifteck'], e: '🥩' },
    { k: ['porc','jambon','lardons','bacon'],  e: '🥓' },
    { k: ['poisson','saumon','thon','cabillaud','sardine'], e: '🐟' },
    { k: ['crevettes','fruits de mer'], e: '🦐' },
    { k: ['oeuf','oeufs'],              e: '🥚' },
    // 🥦 Légumes
    { k: ['salade','laitue','roquette'], e: '🥗' },
    { k: ['tomate'],                    e: '🍅' },
    { k: ['carotte'],                   e: '🥕' },
    { k: ['brocoli','brocolis'],        e: '🥦' },
    { k: ['poivron'],                   e: '🌶️' },
    { k: ['courgette'],                 e: '🥒' },
    { k: ['aubergine'],                 e: '🍆' },
    { k: ['oignon','oignons'],          e: '🧅' },
    { k: ['ail'],                       e: '🧄' },
    { k: ['pomme de terre','patate','pommes de terre'], e: '🥔' },
    { k: ['maïs'],                      e: '🌽' },
    { k: ['champignon','champignons'],  e: '🍄' },
    { k: ['avocat'],                    e: '🥑' },
    { k: ['concombre'],                 e: '🥒' },
    { k: ['epinard','épinard'],         e: '🌿' },
    { k: ['petits pois'],               e: '🫛' },
    // 🍎 Fruits
    { k: ['pomme','pommes'],            e: '🍎' },
    { k: ['banane','bananes'],          e: '🍌' },
    { k: ['orange','oranges'],          e: '🍊' },
    { k: ['citron'],                    e: '🍋' },
    { k: ['fraise','fraises'],          e: '🍓' },
    { k: ['raisin'],                    e: '🍇' },
    { k: ['melon'],                     e: '🍈' },
    { k: ['pastèque'],                  e: '🍉' },
    { k: ['pêche'],                     e: '🍑' },
    { k: ['poire'],                     e: '🍐' },
    { k: ['cerise','cerises'],          e: '🍒' },
    { k: ['ananas'],                    e: '🍍' },
    { k: ['mangue'],                    e: '🥭' },
    { k: ['kiwi'],                      e: '🥝' },
    // 🥛 Produits laitiers
    { k: ['lait'],                      e: '🥛' },
    { k: ['beurre'],                    e: '🧈' },
    { k: ['fromage','comté','camembert','brie','gouda','emmental'], e: '🧀' },
    { k: ['yaourt','yogourt'],          e: '🫙' },
    { k: ['crème','creme'],             e: '🥛' },
    // 🍞 Boulangerie
    { k: ['pain','baguette','brioche'], e: '🍞' },
    { k: ['farine'],                    e: '🌾' },
    { k: ['cake','gâteau','gateau'],    e: '🎂' },
    { k: ['biscuit','cookie','gâteaux'], e: '🍪' },
    { k: ['croissant'],                 e: '🥐' },
    // 🍝 Épicerie
    { k: ['pâtes','pasta','spaghetti','macaroni','tagliatelle'], e: '🍝' },
    { k: ['riz'],                       e: '🍚' },
    { k: ['quinoa'],                    e: '🌾' },
    { k: ['lentilles','haricots'],      e: '🫘' },
    { k: ['huile','olive'],             e: '🫒' },
    { k: ['vinaigre','sauce','ketchup','mayonnaise','moutarde'], e: '🧴' },
    { k: ['sel'],                       e: '🧂' },
    { k: ['sucre'],                     e: '🍬' },
    { k: ['café'],                      e: '☕' },
    { k: ['thé','tisane'],              e: '🍵' },
    { k: ['chocolat','cacao','nutella'], e: '🍫' },
    { k: ['miel'],                      e: '🍯' },
    { k: ['confiture'],                 e: '🍓' },
    { k: ['céréales'],                  e: '🌾' },
    { k: ['soupe'],                     e: '🍲' },
    // 🧃 Boissons
    { k: ['jus','nectar'],              e: '🧃' },
    { k: ['eau'],                       e: '💧' },
    { k: ['bière'],                     e: '🍺' },
    { k: ['vin'],                       e: '🍷' },
    // 🧹 Ménager
    { k: ['liquide','vaisselle','éponge','lessive','désinfectant','nettoyant'], e: '🧹' },
    { k: ['papier','essuie'],           e: '🧻' },
    { k: ['savon','shampoing'],         e: '🧼' },
];

function getEmoji(name, category) {
    const lower = name.toLowerCase();
    for (const { k, e } of EMOJI_MAP) {
        if (k.some(keyword => lower.includes(keyword))) return e;
    }
    // Category fallback
    return category === 'frigo' ? '❄️' : '📦';
}

// ─── Init ─────────────────────────────────────────────────────────────────────
export function initInventory(user) {
    if (!user) return;

    // No orderBy → no composite index required
    const qFrigo   = query(collection(db, 'inventory'), where('userId', '==', user.uid), where('category', '==', 'frigo'));
    const qPlacard = query(collection(db, 'inventory'), where('userId', '==', user.uid), where('category', '==', 'placard'));

    onSnapshot(qFrigo,   snap => renderList(snap, 'frigo-list'),   err => showNotification('Erreur chargement frigo: ' + err.message, 'error'));
    onSnapshot(qPlacard, snap => renderList(snap, 'placard-list'), err => showNotification('Erreur chargement placard: ' + err.message, 'error'));
}

// ─── Render list ──────────────────────────────────────────────────────────────
function renderList(snapshot, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (snapshot.empty) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>Aucun produit — ajoutez-en un !</p>
            </div>`;
        updateStats();
        return;
    }

    snapshot.forEach(docSnap => {
        const item = docSnap.data();
        container.appendChild(createItemElement(docSnap.id, item));
    });

    updateStats();
}

// ─── Build item card ──────────────────────────────────────────────────────────
function createItemElement(id, item) {
    const qty      = item.quantity ?? 0;
    const isEmpty  = qty === 0;
    const isCrit   = qty <= 1;
    const emoji    = getEmoji(item.name, item.category);

    const div = document.createElement('div');
    div.className = `item glass-card ${isEmpty ? 'out-of-stock' : isCrit ? 'critical' : ''}`;
    div.dataset.id = id;

    div.innerHTML = `
        <div class="item-info">
            <p class="item-name"><span class="item-emoji">${emoji}</span> ${item.name}</p>
            <p class="item-quantity-label">${isEmpty ? '⚠️ Rupture de stock' : isCrit ? '⚠️ Stock critique' : `Qté : ${qty}`}</p>
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

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export async function addItem(category) {
    const user = auth.currentUser;
    if (!user) { showNotification('Connectez-vous d\'abord', 'error'); return; }

    const nameInput     = document.getElementById(`${category}-name`);
    const quantityInput = document.getElementById(`${category}-quantity`);
    const name          = nameInput.value.trim();
    const quantity      = parseInt(quantityInput.value) || 1;

    if (!name) { showNotification('Entrez un nom de produit', 'warning'); return; }

    try {
        await addDoc(collection(db, 'inventory'), {
            name, quantity, category,
            userId: user.uid,
            createdAt: Date.now()
        });
        nameInput.value     = '';
        quantityInput.value = '1';
        showNotification(`✅ ${name} ajouté !`, 'success');
    } catch (e) {
        console.error(e);
        showNotification("Erreur d'ajout", 'error');
    }
}

export async function changeStock(id, newQty) {
    if (newQty < 0) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Get item name before updating for the notification
        const ref = doc(db, 'inventory', id);
        await updateDoc(ref, { quantity: newQty });

        if (newQty === 0) {
            // Find item name from DOM
            const card = document.querySelector(`[data-id="${id}"] .item-name`);
            const name = card ? card.textContent : 'Produit';
            showNotification(`🛒 ${name} — rupture ! Ajouté à la liste de courses.`, 'warning');
            await addToShoppingListAuto(user, name);
        } else if (newQty === 1) {
            showNotification('⚠️ Stock critique !', 'warning');
        }
    } catch (e) {
        console.error(e);
        showNotification("Erreur de mise à jour", 'error');
    }
}

export async function removeItem(id) {
    if (!confirm('Supprimer cet article ?')) return;
    try {
        await deleteDoc(doc(db, 'inventory', id));
        showNotification('🗑️ Article supprimé', 'success');
    } catch (e) {
        showNotification("Erreur de suppression", 'error');
    }
}

// ─── Auto-add to shopping list ────────────────────────────────────────────────
async function addToShoppingListAuto(user, name) {
    try {
        // Avoid duplicates: check if already in list
        const { collection: col, query: q, where: wh, getDocs } = await import(
            "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
        );
        const existing = await getDocs(
            q(col(db, 'shoppingList'), wh('userId', '==', user.uid), wh('name', '==', name))
        );
        if (!existing.empty) return; // already there

        await addDoc(collection(db, 'shoppingList'), {
            name,
            quantity: 1,
            userId: user.uid,
            outOfStock: true,
            createdAt: serverTimestamp()
        });
    } catch (e) {
        console.error('Auto shopping list error:', e);
    }
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function updateStats() {
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
}

// ─── Global exposure for onclick handlers ────────────────────────────────────
window.changeStock = changeStock;
window.removeItem  = removeItem;
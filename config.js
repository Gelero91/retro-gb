// ============================================
// CONFIG.JS - Configuration et données
// ============================================

// Configuration du canvas Game Boy
const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 144;
const TILE_SIZE = 16;
const SCALE = 4; // Facteur d'échelle pour une meilleure visibilité

// Dimensions de la vue (en tuiles)
const VIEW_WIDTH = 10;  // 160 / 16
const VIEW_HEIGHT = 9;  // 144 / 16

// Valeur spéciale pour la transparence
const TRANSPARENT = -1;

// Palette Game Boy (4 nuances de gris sur fond vert GB)
const COLORS = {
    0: '#9BBD0F', // Blanc (le plus clair sur GB)
    1: '#8BAC0F', // Gris clair
    2: '#306230', // Gris foncé
    3: '#0F380F'  // Noir (le plus foncé)
    // Note: TRANSPARENT (-1) n'a pas de couleur associée
};

// Configuration
const START_WITH_MENU = true; // true = menu principal, false = démarrage direct
const DEBUG_MODE = false; // Activer pour voir les indicateurs de mouvement des PNJ

// ============================================
// ITEMS - Données pures (sans logique)
// ============================================

const itemTypes = {
    potion: {
        name: "Potion",
        type: "consumable",
        description: "Restaure 10 PV",
        buyPrice: 20,
        sellPrice: 10,
        healAmount: 10
    },
    sword: {
        name: "Épée",
        type: "weapon",
        description: "Attaque +3",
        attack: 3,
        buyPrice: 100,
        sellPrice: 50
    },
    shield: {
        name: "Bouclier",
        type: "armor",
        description: "Défense +2",
        defense: 2,
        buyPrice: 80,
        sellPrice: 40
    },
    key: {
        name: "Clé",
        type: "key",
        description: "Ouvre les portes verrouillées",
        buyPrice: 50,
        sellPrice: 0 // Ne peut pas être vendu
    },
    ether: {
        name: "Éther",
        type: "consumable",
        description: "Restaure 5 PM",
        buyPrice: 30,
        sellPrice: 15,
        mpAmount: 5
    },
    herb: {
        name: "Herbe",
        type: "consumable", 
        description: "Restaure 5 PV",
        buyPrice: 10,
        sellPrice: 5,
        healAmount: 5
    }
};

// ============================================
// FONCTIONS D'UTILISATION DES ITEMS
// ============================================

/**
 * Utilise un objet de type consommable
 * @param {string} itemKey - Clé de l'item (potion, herb, ether)
 * @returns {boolean} - true si consommé, false sinon
 */
function useConsumable(itemKey) {
    const item = itemTypes[itemKey];
    
    if (item.healAmount) {
        const healed = Math.min(item.healAmount, player.maxHp - player.hp);
        player.hp += healed;
        startDialogue(`Vous utilisez ${item.name}. ${healed} PV restaurés !`);
        return true;
    }
    
    if (item.mpAmount) {
        const restored = Math.min(item.mpAmount, player.maxMp - player.mp);
        player.mp += restored;
        startDialogue(`Vous utilisez ${item.name}. ${restored} PM restaurés !`);
        return true;
    }
    
    return false;
}

/**
 * Équipe une arme
 * @param {object} weapon - Objet arme avec attack
 */
function equipWeapon(weapon) {
    // Retirer l'arme précédente
    if (player.equipped.weapon) {
        player.attack -= player.equipped.weapon.attack;
    }
    
    // Équiper la nouvelle arme
    player.equipped.weapon = weapon;
    player.attack += weapon.attack;
    startDialogue(`Vous équipez ${weapon.name}. Attaque +${weapon.attack} !`);
}

/**
 * Équipe une armure
 * @param {object} armor - Objet armure avec defense
 */
function equipArmor(armor) {
    // Retirer l'armure précédente
    if (player.equipped.armor) {
        player.defense -= player.equipped.armor.defense;
    }
    
    // Équiper la nouvelle armure
    player.equipped.armor = armor;
    player.defense += armor.defense;
    startDialogue(`Vous équipez ${armor.name}. Défense +${armor.defense} !`);
}

/**
 * Utilise un item (point d'entrée principal)
 * @param {object} item - L'objet item complet
 * @returns {boolean} - true si l'item est consommé
 */
function useItem(item) {
    if (item.type === 'consumable') {
        return useConsumable(item.key);
    }
    
    if (item.type === 'weapon') {
        equipWeapon(item);
        return false; // Pas consommé
    }
    
    if (item.type === 'armor') {
        equipArmor(item);
        return false; // Pas consommé
    }
    
    if (item.type === 'key') {
        return false; // Ne se consomme pas
    }
    
    return false;
}

// ============================================
// ENNEMIS
// ============================================

// Types d'ennemis (sans les sprites qui seront ajoutés dans combat.js)
const enemyTypes = {
    slime: {
        name: "Slime",
        hp: 8,
        maxHp: 8,
        attack: 3,
        defense: 1,
        exp: 3,
        gold: 5
    },
    goblin: {
        name: "Gobelin",
        hp: 15,
        maxHp: 15,
        attack: 6,
        defense: 2,
        exp: 8,
        gold: 15
    }
};
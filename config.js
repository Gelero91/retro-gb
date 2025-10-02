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

// Types d'objets
const itemTypes = {
    potion: {
        name: "Potion",
        type: "consumable",
        description: "Restaure 10 PV",
        buyPrice: 20,
        sellPrice: 10,
        use: function() {
            const healed = Math.min(10, player.maxHp - player.hp);
            player.hp += healed;
            startDialogue(`Vous utilisez une Potion. ${healed} PV restaurés !`);
            return true; // Consommé
        }
    },
    sword: {
        name: "Épée",
        type: "weapon",
        description: "Attaque +3",
        attack: 3,
        buyPrice: 100,
        sellPrice: 50,
        equip: function() {
            if (player.equipped.weapon) {
                player.attack -= player.equipped.weapon.attack;
            }
            player.equipped.weapon = this;
            player.attack += this.attack;
            startDialogue("Vous équipez l'Épée. Attaque +3 !");
        }
    },
    shield: {
        name: "Bouclier",
        type: "armor",
        description: "Défense +2",
        defense: 2,
        buyPrice: 80,
        sellPrice: 40,
        equip: function() {
            if (player.equipped.armor) {
                player.defense -= player.equipped.armor.defense;
            }
            player.equipped.armor = this;
            player.defense += this.defense;
            startDialogue("Vous équipez le Bouclier. Défense +2 !");
        }
    },
    key: {
        name: "Clé",
        type: "key",
        description: "Ouvre les portes verrouillées",
        buyPrice: 50,
        sellPrice: 0, // Ne peut pas être vendu
        use: function() {
            return false; // Ne se consomme pas
        }
    },
    ether: {
        name: "Éther",
        type: "consumable",
        description: "Restaure 5 PM",
        buyPrice: 30,
        sellPrice: 15,
        use: function() {
            const restored = Math.min(5, player.maxMp - player.mp);
            player.mp += restored;
            startDialogue(`Vous utilisez un Éther. ${restored} PM restaurés !`);
            return true; // Consommé
        }
    },
    herb: {
        name: "Herbe",
        type: "consumable", 
        description: "Restaure 5 PV",
        buyPrice: 10,
        sellPrice: 5,
        use: function() {
            const healed = Math.min(5, player.maxHp - player.hp);
            player.hp += healed;
            startDialogue(`Vous utilisez une Herbe. ${healed} PV restaurés !`);
            return true; // Consommé
        }
    }
};

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
// État du jeu
let gameState = START_WITH_MENU ? 'mainMenu' : 'playing'; // 'mainMenu', 'playing', 'gameOver'
let currentMapId = 0;

// État du joueur
const player = {
    x: 12,
    y: 10,
    // Position de rendu pour l'animation
    renderX: 12,
    renderY: 10,
    // État de mouvement
    moving: false,
    moveProgress: 0,     // 0 à 1 (progression du mouvement)
    moveSpeed: 0.125,    // 8 frames pour traverser une tuile (125ms à 60fps)
    targetX: 12,
    targetY: 10,
    facing: 'down', // Direction du joueur pour l'interaction
    // Animation de marche
    animFrame: 0,
    animTimer: 0,
    // Stats de combat
    level: 1,
    hp: 20,
    maxHp: 20,
    mp: 10,
    maxMp: 10,
    attack: 5,
    defense: 3,
    exp: 0,
    expToNext: 10,
    gold: 50, // Argent de départ
    // Équipement
    equipped: {
        weapon: null,
        armor: null
    },
    // Compétences
    skills: {
        fireball: { 
            name: "Boule de feu", 
            mpCost: 3, 
            damage: 8, 
            cooldown: 0, 
            maxCooldown: 3,
            description: "Lance une boule de feu"
        },
        shield: { 
            name: "Bouclier", 
            mpCost: 2, 
            defense: 5, 
            duration: 2, 
            cooldown: 0, 
            maxCooldown: 4,
            description: "Augmente la défense temporairement"
        },
        heal: { 
            name: "Soin", 
            mpCost: 4, 
            healing: 15, 
            cooldown: 0, 
            maxCooldown: 5,
            description: "Restaure des PV"
        }
    },
    buffs: {
        shield: 0 // Nombre de tours restants
    }
};

// Menu principal
const mainMenu = {
    selectedOption: 0,
    options: [
        { label: "NOUVELLE PARTIE", action: "new" },
        { label: "CHARGER PARTIE", action: "load" },
        { label: "OPTIONS", action: "options" },
        { label: "CRÉDITS", action: "credits" }
    ],
    showingCredits: false,
    animationFrame: 0
};

// Système d'inventaire
const inventory = {
    items: [],
    maxSize: 12,
    selectedIndex: 0
};

// Système de coffres
const chests = {}; // Stocke l'état des coffres par carte et position

// Système de puzzles
const puzzles = {
    blocks: {}, // Positions des blocs par carte
    switches: {}, // État des interrupteurs par carte
    sequences: {}, // Séquences d'interrupteurs requises
    doors: {} // Portes verrouillées par énigme
};

// Système de shop
const shop = {
    active: false,
    mode: 'buy', // 'buy' ou 'sell'
    selectedItem: 0,
    shopInventory: ['herb', 'potion', 'ether', 'key'], // Objets vendus par le marchand
    buyPrices: {}, // Prix d'achat
    playerItems: [] // Copie filtrée de l'inventaire pour la vente
};

// Écran de sélection de sauvegarde
const saveMenu = {
    active: false,
    mode: 'save', // 'save' ou 'load'
    selectedSlot: 0,
    slots: [1, 2, 3],
    confirmDelete: false,
    deleteSlot: null
};

// Camera pour le scrolling
const camera = {
    x: 0,
    y: 0
};

// Système de PNJ
let npcs = [];

// Système de dialogue
const dialogue = {
    active: false,
    text: "",
    pages: [],
    currentPage: 0,
    charIndex: 0,
    speed: 2, // Vitesse d'affichage des caractères
    frameCount: 0
};

// Système de menu
const menu = {
    active: false,
    selectedOption: 0,
    options: [
        { label: "INVENTAIRE", action: "inventory" },
        { label: "STATUT", action: "status" },
        { label: "SAUVEGARDER", action: "save" },
        { label: "QUITTER", action: "quit" }
    ]
};

// Système de combat
const battle = {
    active: false,
    enemy: null,
    enemyNPC: null, // Référence au PNJ ennemi
    playerTurn: true,
    animating: false,
    message: "",
    messageTimer: 0,
    selectedAction: 0,
    actions: ["ATTAQUER", "MAGIE", "DEFENDRE", "FUIR"],
    magicMenuActive: false,
    selectedMagic: 0,
    magicOptions: ["fireball", "shield", "heal"],
    shakeTimer: 0,
    flashTimer: 0,
    particleEffects: []
};

// Interface d'inventaire
const inventoryUI = {
    active: false,
    cursorX: 0,
    cursorY: 0,
    gridWidth: 4,
    gridHeight: 3
};

// Variables pour le canvas
let canvas;
let ctx;

// Variables pour les cartes
let maps = {};

// Gestion des inputs
const keys = {};
// Démarrer une nouvelle partie
function startNewGame() {
    // Réinitialiser toutes les données
    currentMapId = 0;
    player.x = 12;
    player.y = 10;
    player.renderX = 12;
    player.renderY = 10;
    player.targetX = 12;
    player.targetY = 10;
    player.moving = false;
    player.moveProgress = 0;
    player.animFrame = 0;
    player.animTimer = 0;
    player.facing = 'down';
    player.level = 1;
    player.hp = 20;
    player.maxHp = 20;
    player.mp = 10;
    player.maxMp = 10;
    player.attack = 5;
    player.defense = 3;
    player.exp = 0;
    player.expToNext = 10;
    player.gold = 50;
    player.equipped.weapon = null;
    player.equipped.armor = null;
    player.buffs.shield = 0;
    
    // Réinitialiser les cooldowns
    Object.values(player.skills).forEach(skill => {
        skill.cooldown = 0;
    });
    
    // Vider l'inventaire et ajouter les objets de départ
    inventory.items = [];
    addToInventory('potion');
    addToInventory('sword');
    
    // Réinitialiser les coffres et puzzles
    Object.keys(chests).forEach(key => delete chests[key]);
    Object.keys(puzzles.blocks).forEach(key => delete puzzles.blocks[key]);
    Object.keys(puzzles.switches).forEach(key => delete puzzles.switches[key]);
    Object.keys(puzzles.sequences).forEach(key => delete puzzles.sequences[key]);
    Object.keys(puzzles.doors).forEach(key => delete puzzles.doors[key]);
    
    // Réinitialiser les cartes (recharger les données par défaut)
    loadMapData();
    
    // Charger les PNJ
    loadNPCs();
    
    // Initialiser les puzzles
    if (maps[3] && maps[3].puzzle) {
        const puzzleKey = `${3}-switches`;
        puzzles.sequences[puzzleKey] = [];
    }
    
    // Démarrer le jeu avec message court
    gameState = 'playing';
    startDialogue("BIENVENU! FLECHES: BOUGER A: ACTION M: MENU L: CARTES"); // Message court sur les contrôles
}

// ============================================
// SAVE.JS - Système de sauvegarde
// ============================================

// Constantes
const SAVE_PREFIX = 'gameboy_save_';
const SAVE_VERSION = '1.0';

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Sauvegarde la partie dans un slot
 * @param {number} slot - Numéro du slot (0 = autosave, 1-3 = manuel)
 * @returns {boolean} - true si succès, false sinon
 */
function saveGame(slot = 1) {
    const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        player: {
            x: player.x,
            y: player.y,
            renderX: player.renderX,
            renderY: player.renderY,
            level: player.level,
            hp: player.hp,
            maxHp: player.maxHp,
            mp: player.mp,
            maxMp: player.maxMp,
            attack: player.attack,
            defense: player.defense,
            exp: player.exp,
            expToNext: player.expToNext,
            gold: player.gold,
            equipped: {
                weapon: player.equipped.weapon ? player.equipped.weapon.key : null,
                armor: player.equipped.armor ? player.equipped.armor.key : null
            },
            // Stats de base (sans équipement)
            baseAttack: player.equipped.weapon ? player.attack - player.equipped.weapon.attack : player.attack,
            baseDefense: player.equipped.armor ? player.defense - player.equipped.armor.defense : player.defense
        },
        inventory: inventory.items.map(item => item.key),
        currentMapId: currentMapId,
        chests: chests,
        puzzles: puzzles,
        customMaps: customMaps,
        defeatedEnemies: {}
    };
    
    // Sauvegarder les ennemis vaincus
    Object.keys(maps).forEach(mapId => {
        const map = maps[mapId];
        if (map.npcs) {
            saveData.defeatedEnemies[mapId] = [];
            map.npcs.forEach((npcData, index) => {
                if (npcData.enemy) {
                    const exists = mapId == currentMapId ? 
                        npcs.some(npc => npc.id === index) : 
                        true;
                    if (!exists) {
                        saveData.defeatedEnemies[mapId].push(index);
                    }
                }
            });
        }
    });
    
    try {
        localStorage.setItem(`${SAVE_PREFIX}${slot}`, JSON.stringify(saveData));
        return true;
    } catch (e) {
        console.error("Erreur de sauvegarde:", e);
        return false;
    }
}

/**
 * Charge la partie depuis un slot
 * @param {number} slot - Numéro du slot
 * @returns {boolean} - true si succès, false sinon
 */
function loadGame(slot = 1) {
    try {
        const saveDataStr = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
        if (!saveDataStr) return false;
        
        const saveData = JSON.parse(saveDataStr);
        
        // Restaurer le joueur
        player.x = saveData.player.x;
        player.y = saveData.player.y;
        player.renderX = saveData.player.renderX || player.x;
        player.renderY = saveData.player.renderY || player.y;
        player.targetX = player.x;
        player.targetY = player.y;
        player.moving = false;
        player.moveProgress = 0;
        player.animFrame = 0;
        player.animTimer = 0;
        
        player.level = saveData.player.level;
        player.hp = saveData.player.hp;
        player.maxHp = saveData.player.maxHp;
        player.mp = saveData.player.mp || 10;
        player.maxMp = saveData.player.maxMp || 10;
        player.exp = saveData.player.exp;
        player.expToNext = saveData.player.expToNext;
        player.gold = saveData.player.gold || 50;
        
        // Restaurer les stats de base
        player.attack = saveData.player.baseAttack !== undefined ? 
            saveData.player.baseAttack : saveData.player.attack;
        player.defense = saveData.player.baseDefense !== undefined ? 
            saveData.player.baseDefense : saveData.player.defense;
        
        // Restaurer l'inventaire
        inventory.items = [];
        saveData.inventory.forEach(itemKey => {
            if (itemTypes[itemKey]) {
                const item = { ...itemTypes[itemKey], key: itemKey };
                inventory.items.push(item);
            }
        });
        
        // Restaurer l'équipement
        player.equipped.weapon = null;
        player.equipped.armor = null;
        
        if (saveData.player.equipped.weapon) {
            const weaponItem = inventory.items.find(item => item.key === saveData.player.equipped.weapon);
            if (weaponItem) {
                player.equipped.weapon = weaponItem;
                player.attack += weaponItem.attack;
            }
        }
        
        if (saveData.player.equipped.armor) {
            const armorItem = inventory.items.find(item => item.key === saveData.player.equipped.armor);
            if (armorItem) {
                player.equipped.armor = armorItem;
                player.defense += armorItem.defense;
            }
        }
        
        // Restaurer l'état du monde
        currentMapId = saveData.currentMapId;
        chests = saveData.chests || [];
        puzzles = saveData.puzzles || { states: {}, sequences: {} };
        
        if (saveData.customMaps) {
            customMaps = saveData.customMaps;
        }
        
        // Restaurer les ennemis vaincus
        if (saveData.defeatedEnemies) {
            Object.keys(saveData.defeatedEnemies).forEach(mapId => {
                const map = maps[mapId];
                if (map && map.npcs) {
                    const defeatedIndices = saveData.defeatedEnemies[mapId];
                    defeatedIndices.forEach(index => {
                        if (map.npcs[index]) {
                            delete map.npcs[index];
                        }
                    });
                }
            });
        }
        
        // Recharger la carte et les NPCs
        loadMapById(currentMapId);
        loadNPCs();
        
        return true;
    } catch (e) {
        console.error("Erreur de chargement:", e);
        return false;
    }
}

/**
 * Vérifie si une sauvegarde existe
 * @param {number} slot - Numéro du slot
 * @returns {boolean} - true si existe, false sinon
 */
function saveExists(slot = 1) {
    return localStorage.getItem(`${SAVE_PREFIX}${slot}`) !== null;
}

/**
 * Récupère les informations d'une sauvegarde
 * @param {number} slot - Numéro du slot
 * @returns {object|null} - Objet avec {level, map, date} ou null
 */
function getSaveInfo(slot = 1) {
    try {
        const saveDataStr = localStorage.getItem(`${SAVE_PREFIX}${slot}`);
        if (!saveDataStr) return null;
        
        const saveData = JSON.parse(saveDataStr);
        const date = new Date(saveData.timestamp);
        
        return {
            level: saveData.player.level,
            map: maps[saveData.currentMapId].name,
            date: date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    } catch (e) {
        return null;
    }
}

/**
 * Supprime une sauvegarde
 * @param {number} slot - Numéro du slot
 */
function deleteSave(slot = 1) {
    localStorage.removeItem(`${SAVE_PREFIX}${slot}`);
}

/**
 * Sauvegarde automatique (utilise le slot 0)
 * @returns {boolean} - true si succès
 */
function autoSave() {
    return saveGame(0);
}

// Ajouter un objet à l'inventaire
function addToInventory(itemKey) {
    if (inventory.items.length < inventory.maxSize) {
        const item = { ...itemTypes[itemKey], key: itemKey };
        inventory.items.push(item);
        return true;
    }
    return false;
}
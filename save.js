// Système de sauvegarde
const saveGame = {
    // Sauvegarder la partie
    save: function(slot = 1) {
        const saveData = {
            version: "1.0",
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
                // AJOUT: Sauvegarder les stats de base (sans équipement)
                baseAttack: player.equipped.weapon ? player.attack - player.equipped.weapon.attack : player.attack,
                baseDefense: player.equipped.armor ? player.defense - player.equipped.armor.defense : player.defense
            },
            inventory: inventory.items.map(item => item.key),
            currentMapId: currentMapId,
            chests: chests,
            puzzles: puzzles, // Sauvegarder l'état des énigmes
            customMaps: customMaps, // Sauvegarder les cartes custom
            defeatedEnemies: {} // Pour stocker les ennemis vaincus par carte
        };
        
        // Sauvegarder les ennemis vaincus
        Object.keys(maps).forEach(mapId => {
            const map = maps[mapId];
            if (map.npcs) {
                saveData.defeatedEnemies[mapId] = [];
                map.npcs.forEach((npcData, index) => {
                    if (npcData.enemy) {
                        // Vérifier si cet ennemi existe encore
                        const exists = mapId == currentMapId ? 
                            npcs.some(npc => npc.id === index) : 
                            true; // On assume qu'il existe sur les autres cartes
                        if (!exists) {
                            saveData.defeatedEnemies[mapId].push(index);
                        }
                    }
                });
            }
        });
        
        try {
            localStorage.setItem(`gameboy_save_${slot}`, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error("Erreur de sauvegarde:", e);
            return false;
        }
    },
    
    // Charger la partie
    load: function(slot = 1) {
        try {
            const saveDataStr = localStorage.getItem(`gameboy_save_${slot}`);
            if (!saveDataStr) return false;
            
            const saveData = JSON.parse(saveDataStr);
            
            // Restaurer les données du joueur
            player.x = saveData.player.x;
            player.y = saveData.player.y;
            // Synchroniser les positions de rendu
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
            
            // CORRECTIF: D'abord restaurer les stats de base
            player.attack = saveData.player.baseAttack !== undefined ? 
                saveData.player.baseAttack : saveData.player.attack;
            player.defense = saveData.player.baseDefense !== undefined ? 
                saveData.player.baseDefense : saveData.player.defense;
            
            // Réinitialiser l'équipement
            player.equipped.weapon = null;
            player.equipped.armor = null;
            
            // CORRECTIF: Restaurer et appliquer l'équipement correctement
            if (saveData.player.equipped.weapon) {
                const weaponKey = saveData.player.equipped.weapon;
                const weapon = { ...itemTypes[weaponKey], key: weaponKey };
                player.equipped.weapon = weapon;
                // Appliquer le bonus d'attaque
                player.attack += weapon.attack;
            }
            
            if (saveData.player.equipped.armor) {
                const armorKey = saveData.player.equipped.armor;
                const armor = { ...itemTypes[armorKey], key: armorKey };
                player.equipped.armor = armor;
                // Appliquer le bonus de défense
                player.defense += armor.defense;
            }
            
            // Restaurer l'inventaire
            inventory.items = [];
            saveData.inventory.forEach(itemKey => {
                addToInventory(itemKey);
            });
            
            // Restaurer l'état des coffres
            Object.keys(saveData.chests).forEach(key => {
                chests[key] = saveData.chests[key];
            });
            
            // Mettre à jour les tuiles des coffres ouverts
            Object.keys(chests).forEach(chestKey => {
                if (chests[chestKey].opened) {
                    const [mapId, x, y] = chestKey.split('-').map(Number);
                    if (maps[mapId] && maps[mapId].tiles[y] && maps[mapId].tiles[y][x] === 5) {
                        maps[mapId].tiles[y][x] = 6;
                    }
                }
            });
            
            // Restaurer l'état des puzzles
            if (saveData.puzzles) {
                Object.assign(puzzles, saveData.puzzles);
            }
            
            // Restaurer les cartes custom si elles existent
            if (saveData.customMaps) {
                customMaps = saveData.customMaps;
                localStorage.setItem('customMaps', JSON.stringify(customMaps));
                // Refusionner les cartes
                maps = { ...defaultMaps, ...customMaps };
            }
            
            // Changer de carte et charger les PNJ
            currentMapId = saveData.currentMapId;
            loadNPCs();
            
            // Retirer les ennemis vaincus
            if (saveData.defeatedEnemies && saveData.defeatedEnemies[currentMapId]) {
                const defeatedIndices = saveData.defeatedEnemies[currentMapId];
                // Retirer en ordre inverse pour ne pas décaler les indices
                defeatedIndices.sort((a, b) => b - a).forEach(index => {
                    const npcIndex = npcs.findIndex(npc => npc.id === index);
                    if (npcIndex > -1) {
                        npcs.splice(npcIndex, 1);
                    }
                });
            }
            
            updateCamera();
            return true;
            
        } catch (e) {
            console.error("Erreur de chargement:", e);
            return false;
        }
    },
    
    // Vérifier si une sauvegarde existe
    exists: function(slot = 1) {
        return localStorage.getItem(`gameboy_save_${slot}`) !== null;
    },
    
    // Obtenir les infos d'une sauvegarde
    getInfo: function(slot = 1) {
        try {
            const saveDataStr = localStorage.getItem(`gameboy_save_${slot}`);
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
                }) // Format court: JJ/MM HH:MM
            };
        } catch (e) {
            return null;
        }
    },
    
    // Supprimer une sauvegarde
    delete: function(slot = 1) {
        localStorage.removeItem(`gameboy_save_${slot}`);
    }
};

// Ajouter un objet à l'inventaire
function addToInventory(itemKey) {
    if (inventory.items.length < inventory.maxSize) {
        const item = { ...itemTypes[itemKey], key: itemKey };
        inventory.items.push(item);
        return true;
    }
    return false;
}

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
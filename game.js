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

// Ajouter un objet à l'inventaire
function addToInventory(itemKey) {
    if (inventory.items.length < inventory.maxSize) {
        const item = { ...itemTypes[itemKey], key: itemKey };
        inventory.items.push(item);
        return true;
    }
    return false;
}

// Gestion des PNJ
function loadNPCs() {
    npcs = [];
    const currentMap = maps[currentMapId];
    if (currentMap.npcs) {
        currentMap.npcs.forEach((npcData, index) => {
            npcs.push({
                id: index,
                type: npcData.type,
                x: npcData.x,
                y: npcData.y,
                // Nouvelles propriétés pour l'animation fluide
                renderX: npcData.x,
                renderY: npcData.y,
                moving: false,
                moveProgress: 0,
                moveSpeed: 0.125, // Même vitesse que le joueur
                targetX: npcData.x,
                targetY: npcData.y,
                animFrame: 0,
                animTimer: 0,
                facing: 'down',
                // Propriétés existantes
                mobile: npcData.mobile,
                enemy: npcData.enemy || false,
                merchant: npcData.merchant || false,
                moveTimer: 0,
                sprite: NPC_SPRITES[npcData.type]
            });
        });
    }
}

// Vérifier si une case est occupée par un PNJ (incluant les réservations)
function isTileOccupiedByNPC(checkX, checkY, excludeNpcId = null) {
    return npcs.some(npc => {
        if (npc.id === excludeNpcId) return false;
        
        // Vérifier la position actuelle
        if (npc.x === checkX && npc.y === checkY) return true;
        
        // Vérifier la position cible si le PNJ est en mouvement
        if (npc.moving && npc.targetX === checkX && npc.targetY === checkY) return true;
        
        return false;
    });
}

// Mettre à jour le mouvement d'un PNJ individuel
function updateNPCMovement(npc) {
    if (npc.moving) {
        // Progression du mouvement
        npc.moveProgress += npc.moveSpeed;
        
        // Animation de marche
        npc.animTimer++;
        if (npc.animTimer >= 4) { // Changer de frame toutes les 4 frames
            npc.animTimer = 0;
            npc.animFrame = (npc.animFrame + 1) % 2;
        }
        
        if (npc.moveProgress >= 1) {
            // Mouvement terminé
            npc.x = npc.targetX;
            npc.y = npc.targetY;
            npc.renderX = npc.x;
            npc.renderY = npc.y;
            npc.moving = false;
            npc.moveProgress = 0;
            npc.animFrame = 0;
            
            // Si c'est un ennemi et qu'il a atteint le joueur, déclencher le combat
            if (npc.enemy && npc.x === player.x && npc.y === player.y) {
                startBattle(npc.type, npc);
            }
        } else {
            // Interpolation linéaire
            npc.renderX = npc.x + (npc.targetX - npc.x) * npc.moveProgress;
            npc.renderY = npc.y + (npc.targetY - npc.y) * npc.moveProgress;
        }
    }
}

function updateNPCs() {
    npcs.forEach(npc => {
        // D'abord, mettre à jour le mouvement en cours
        if (npc.moving) {
            updateNPCMovement(npc);
            return; // Ne pas initier de nouveau mouvement pendant qu'on bouge
        }
        
        // Ensuite, gérer la logique de décision de mouvement
        if (npc.mobile && !battle.active) {
            npc.moveTimer++;
            
            // Calculer la distance au joueur
            const dx = player.x - npc.x;
            const dy = player.y - npc.y;
            const distance = Math.abs(dx) + Math.abs(dy); // Distance Manhattan
            
            // Si c'est un ennemi et que le joueur est proche (3 tiles ou moins)
            if (npc.enemy && distance <= 3) {
                // Mouvement agressif vers le joueur (toutes les 30-40 frames)
                if (npc.moveTimer > 30) {
                    npc.moveTimer = 0;
                    
                    // Déterminer la direction vers le joueur
                    let moveX = 0;
                    let moveY = 0;
                    
                    if (dx > 0) moveX = 1;
                    else if (dx < 0) moveX = -1;
                    
                    if (dy > 0) moveY = 1;
                    else if (dy < 0) moveY = -1;
                    
                    // Essayer de bouger en priorité sur l'axe avec la plus grande distance
                    let newX = npc.x;
                    let newY = npc.y;
                    
                    if (Math.abs(dx) >= Math.abs(dy) && moveX !== 0) {
                        newX = npc.x + moveX;
                    } else if (moveY !== 0) {
                        newY = npc.y + moveY;
                    }
                    
                    // Vérifier les limites et collisions
                    const currentMap = maps[currentMapId];
                    if (newX >= 0 && newX < currentMap.tiles[0].length &&
                        newY >= 0 && newY < currentMap.tiles.length &&
                        isWalkable(currentMap.tiles[newY][newX]) &&
                        !isTileOccupiedByNPC(newX, newY, npc.id)) {
                        
                        // Vérifier si le joueur est sur la case cible
                        if (newX === player.x && newY === player.y) {
                            // Si le joueur n'est pas en mouvement, déclencher le combat
                            if (!player.moving) {
                                startBattle(npc.type, npc);
                            }
                        } else {
                            // Démarrer le mouvement vers la case
                            npc.targetX = newX;
                            npc.targetY = newY;
                            npc.moving = true;
                            npc.moveProgress = 0;
                            npc.animFrame = 0;
                            npc.animTimer = 0;
                            
                            // Mettre à jour la direction
                            if (moveX > 0) npc.facing = 'right';
                            else if (moveX < 0) npc.facing = 'left';
                            else if (moveY > 0) npc.facing = 'down';
                            else if (moveY < 0) npc.facing = 'up';
                        }
                    } else if (moveX !== 0 || moveY !== 0) {
                        // Si le mouvement principal est bloqué, essayer l'autre axe
                        newX = npc.x;
                        newY = npc.y;
                        
                        if (Math.abs(dx) < Math.abs(dy) && moveX !== 0) {
                            newX = npc.x + moveX;
                        } else if (moveY !== 0) {
                            newY = npc.y + moveY;
                        }
                        
                        if (newX >= 0 && newX < currentMap.tiles[0].length &&
                            newY >= 0 && newY < currentMap.tiles.length &&
                            isWalkable(currentMap.tiles[newY][newX]) &&
                            !isTileOccupiedByNPC(newX, newY, npc.id)) {
                            
                            if (newX === player.x && newY === player.y) {
                                if (!player.moving) {
                                    startBattle(npc.type, npc);
                                }
                            } else {
                                // Démarrer le mouvement
                                npc.targetX = newX;
                                npc.targetY = newY;
                                npc.moving = true;
                                npc.moveProgress = 0;
                                npc.animFrame = 0;
                                npc.animTimer = 0;
                                
                                // Mettre à jour la direction
                                if (newX > npc.x) npc.facing = 'right';
                                else if (newX < npc.x) npc.facing = 'left';
                                else if (newY > npc.y) npc.facing = 'down';
                                else if (newY < npc.y) npc.facing = 'up';
                            }
                        }
                    }
                }
            } else {
                // Mouvement aléatoire normal pour les PNJ non-ennemis ou ennemis loin du joueur
                if (npc.moveTimer > 60 + Math.random() * 60) {
                    npc.moveTimer = 0;
                    
                    const directions = [
                        { dx: 0, dy: -1, face: 'up' },
                        { dx: 0, dy: 1, face: 'down' },
                        { dx: -1, dy: 0, face: 'left' },
                        { dx: 1, dy: 0, face: 'right' }
                    ];
                    
                    const dir = directions[Math.floor(Math.random() * directions.length)];
                    const newX = npc.x + dir.dx;
                    const newY = npc.y + dir.dy;
                    
                    const currentMap = maps[currentMapId];
                    if (newX >= 0 && newX < currentMap.tiles[0].length &&
                        newY >= 0 && newY < currentMap.tiles.length &&
                        isWalkable(currentMap.tiles[newY][newX]) &&
                        !(newX === player.x && newY === player.y) &&
                        !isTileOccupiedByNPC(newX, newY, npc.id)) {
                        
                        // Démarrer le mouvement
                        npc.targetX = newX;
                        npc.targetY = newY;
                        npc.moving = true;
                        npc.moveProgress = 0;
                        npc.animFrame = 0;
                        npc.animTimer = 0;
                        npc.facing = dir.face;
                    }
                }
            }
        }
    });
}

// Interactions avec les coffres
function checkChestInteraction() {
    // Position face au joueur
    let checkX = player.x;
    let checkY = player.y;
    
    switch(player.facing) {
        case 'up': checkY--; break;
        case 'down': checkY++; break;
        case 'left': checkX--; break;
        case 'right': checkX++; break;
    }
    
    // Vérifier s'il y a un coffre
    const currentMap = maps[currentMapId];
    const tileType = currentMap.tiles[checkY]?.[checkX];
    
    if (tileType === 5) { // Coffre fermé
        const chestKey = `${currentMapId}-${checkX}-${checkY}`;
        
        if (!chests[chestKey]) {
            // Premier coffre ouvert
            chests[chestKey] = { opened: true, item: 'potion' };
            
            // Changer la tuile en coffre ouvert
            currentMap.tiles[checkY][checkX] = 6;
            
            // Donner l'objet
            if (addToInventory('potion')) {
                startDialogue("+POTION!"); // Message court
            } else {
                startDialogue("INV. PLEIN!"); // Message court
            }
        } else {
            startDialogue("DEJA VIDE."); // Message court
        }
        return true;
    }
    
    return false;
}

// Interactions avec les PNJ
function checkNPCInteraction() {
    // Déterminer la position face au joueur selon sa direction
    let checkX = player.x;
    let checkY = player.y;
    
    switch(player.facing) {
        case 'up':
            checkY--;
            break;
        case 'down':
            checkY++;
            break;
        case 'left':
            checkX--;
            break;
        case 'right':
            checkX++;
            break;
    }
    
    // Vérifier d'abord les coffres
    if (checkChestInteraction()) {
        return true;
    }
    
    // Vérifier les blocs poussables
    if (checkBlockInteraction(checkX, checkY)) {
        return true;
    }
    
    // Vérifier les interrupteurs
    if (checkSwitchInteraction(checkX, checkY)) {
        return true;
    }
    
    // Vérifier s'il y a un PNJ à cette position
    const npc = npcs.find(n => n.x === checkX && n.y === checkY);
    if (npc && !npc.enemy) {
        if (npc.merchant) {
            // Ouvrir le shop
            openShop();
        } else {
            // Dialogue court
            startDialogue("SALUT! JE VIS DANS UN MONDE 160X144!"); // Message plus court
        }
        return true;
    }
    
    return false;
}

// Système d'énigmes - Pousser des blocs
function checkBlockInteraction(x, y) {
    const currentMap = maps[currentMapId];
    const tileType = currentMap.tiles[y]?.[x];
    
    if (tileType === 7) { // Bloc poussable
        // Calculer la direction de poussée
        let pushX = x;
        let pushY = y;
        
        switch(player.facing) {
            case 'up': pushY--; break;
            case 'down': pushY++; break;
            case 'left': pushX--; break;
            case 'right': pushX++; break;
        }
        
        // Vérifier si la destination est libre (incluant les PNJ)
        if (pushX >= 0 && pushX < currentMap.tiles[0].length &&
            pushY >= 0 && pushY < currentMap.tiles.length &&
            currentMap.tiles[pushY][pushX] === 0 &&
            !isTileOccupiedByNPC(pushX, pushY)) { // Nouvelle vérification
            
            // Déplacer le bloc
            currentMap.tiles[y][x] = 0;
            currentMap.tiles[pushY][pushX] = 7;
            
            // Vérifier si on a poussé sur une plaque de pression
            checkPressurePlate(pushX, pushY);
            
            // Effet sonore/visuel (on pourrait ajouter)
            startDialogue("POUSSE!"); // Message court
            
            return true;
        } else if (currentMap.tiles[pushY]?.[pushX] === 10) {
            // Pousser sur une plaque de pression
            currentMap.tiles[y][x] = 0;
            currentMap.tiles[pushY][pushX] = 7; // Bloc sur la plaque
            
            checkPressurePlate(pushX, pushY);
            return true;
        } else {
            startDialogue("BLOQUE!"); // Message court
            return true;
        }
    }
    
    return false;
}

// Vérifier les plaques de pression
function checkPressurePlate(x, y) {
    const currentMap = maps[currentMapId];
    if (!currentMap.puzzle || currentMap.puzzle.type !== 'switches') return;
    
    const puzzle = currentMap.puzzle;
    let allPlatesActive = true;
    
    // Vérifier si toutes les plaques ont un bloc dessus
    puzzle.plates.forEach(plate => {
        if (currentMap.tiles[plate.y][plate.x] !== 7) {
            allPlatesActive = false;
        }
    });
    
    if (allPlatesActive) {
        // Résoudre une partie de l'énigme
        const puzzleKey = `${currentMapId}-plates`;
        puzzles.doors[puzzleKey] = true;
        startDialogue("CLIC! PLAQUES OK!"); // Message court
        checkPuzzleComplete();
    }
}

// Vérifier les interrupteurs
function checkSwitchInteraction(x, y) {
    const currentMap = maps[currentMapId];
    const tileType = currentMap.tiles[y]?.[x];
    
    if (tileType === 8 || tileType === 9) { // Interrupteur
        if (!currentMap.puzzle || currentMap.puzzle.type !== 'switches') return false;
        
        const puzzle = currentMap.puzzle;
        const switchData = puzzle.switches.find(s => s.x === x && s.y === y);
        
        if (switchData) {
            // Basculer l'interrupteur
            currentMap.tiles[y][x] = tileType === 8 ? 9 : 8;
            
            // Gérer la séquence
            const puzzleKey = `${currentMapId}-switches`;
            if (!puzzles.sequences[puzzleKey]) {
                puzzles.sequences[puzzleKey] = [];
            }
            
            if (tileType === 8) { // Activation
                puzzles.sequences[puzzleKey].push(switchData.id);
                
                // Vérifier si la séquence est correcte jusqu'à présent
                const currentSeq = puzzles.sequences[puzzleKey];
                const targetSeq = puzzle.sequence;
                
                let correct = true;
                for (let i = 0; i < currentSeq.length; i++) {
                    if (currentSeq[i] !== targetSeq[i]) {
                        correct = false;
                        break;
                    }
                }
                
                if (!correct) {
                    // Séquence incorrecte, réinitialiser
                    startDialogue("ERREUR! RESET."); // Message court
                    resetSwitches();
                } else if (currentSeq.length === targetSeq.length) {
                    // Séquence complète et correcte !
                    puzzles.switches[puzzleKey] = true;
                    startDialogue("CORRECT!"); // Message court
                    checkPuzzleComplete();
                } else {
                    startDialogue(`${switchData.id} OK (${currentSeq.length}/${targetSeq.length})`); // Message court
                }
            } else { // Désactivation
                // Retirer de la séquence
                const index = puzzles.sequences[puzzleKey].indexOf(switchData.id);
                if (index > -1) {
                    puzzles.sequences[puzzleKey].splice(index, 1);
                }
                startDialogue(`${switchData.id} OFF`); // Message court
            }
            
            return true;
        }
    }
    
    return false;
}

// Réinitialiser tous les interrupteurs
function resetSwitches() {
    const currentMap = maps[currentMapId];
    if (!currentMap.puzzle) return;
    
    const puzzle = currentMap.puzzle;
    const puzzleKey = `${currentMapId}-switches`;
    
    // Réinitialiser la séquence
    puzzles.sequences[puzzleKey] = [];
    
    // Désactiver tous les interrupteurs
    puzzle.switches.forEach(sw => {
        currentMap.tiles[sw.y][sw.x] = 8; // État désactivé
    });
}

// Vérifier si l'énigme complète est résolue
function checkPuzzleComplete() {
    const currentMap = maps[currentMapId];
    if (!currentMap.puzzle) return;
    
    const puzzleKey = `${currentMapId}-complete`;
    
    // Vérifier les deux conditions (plaques ET interrupteurs)
    const platesKey = `${currentMapId}-plates`;
    const switchesKey = `${currentMapId}-switches`;
    
    if (puzzles.doors[platesKey] && puzzles.switches[switchesKey] && !puzzles.doors[puzzleKey]) {
        puzzles.doors[puzzleKey] = true;
        
        // Donner la récompense
        const reward = currentMap.puzzle.reward;
        if (reward && currentMap.tiles[reward.y][reward.x] === 0) {
            currentMap.tiles[reward.y][reward.x] = 5; // Coffre apparaît
            startDialogue("BRAVO! COFFRE!"); // Message court
        }
    }
}

// Mise à jour de la caméra pour suivre le joueur
function updateCamera() {
    const currentMap = maps[currentMapId];
    const mapWidth = currentMap.tiles[0].length;
    const mapHeight = currentMap.tiles.length;
    
    // Centrer la caméra sur la position de rendu du joueur pour un suivi fluide
    camera.x = player.renderX - Math.floor(VIEW_WIDTH / 2);
    camera.y = player.renderY - Math.floor(VIEW_HEIGHT / 2);
    
    // Limiter la caméra aux bordures de la carte
    camera.x = Math.max(0, Math.min(camera.x, mapWidth - VIEW_WIDTH));
    camera.y = Math.max(0, Math.min(camera.y, mapHeight - VIEW_HEIGHT));
}
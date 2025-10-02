// Mise à jour du mouvement du joueur
function updatePlayerMovement() {
    if (player.moving) {
        // Progression du mouvement
        player.moveProgress += player.moveSpeed;
        
        // Animation de marche
        player.animTimer++;
        if (player.animTimer >= 4) { // Changer de frame toutes les 4 frames
            player.animTimer = 0;
            player.animFrame = (player.animFrame + 1) % 2;
        }
        
        if (player.moveProgress >= 1) {
            // Mouvement terminé
            player.x = player.targetX;
            player.y = player.targetY;
            player.renderX = player.x;
            player.renderY = player.y;
            player.moving = false;
            player.moveProgress = 0;
            player.animFrame = 0;
            
            // Vérifier les événements après mouvement
            checkDoor(player.x, player.y);
        } else {
            // Interpolation linéaire
            player.renderX = player.x + (player.targetX - player.x) * player.moveProgress;
            player.renderY = player.y + (player.targetY - player.y) * player.moveProgress;
        }
    }
}

// Rendu d'une tuile avec gestion de la transparence
function drawTile(tileData, x, y) {
    // Ne dessiner que si la tuile est visible
    if (x < camera.x - 1 || x > camera.x + VIEW_WIDTH ||
        y < camera.y - 1 || y > camera.y + VIEW_HEIGHT) {
        return;
    }
    
    const screenX = (x - camera.x) * TILE_SIZE;
    const screenY = (y - camera.y) * TILE_SIZE;
    
    for (let row = 0; row < TILE_SIZE; row++) {
        for (let col = 0; col < TILE_SIZE; col++) {
            const colorIndex = tileData[row][col];
            // IMPORTANT: Ignorer les pixels transparents
            if (colorIndex === -1 || colorIndex === undefined) {
                continue; // Ne pas dessiner ce pixel
            }
            ctx.fillStyle = COLORS[colorIndex];
            ctx.fillRect(
                (screenX + col) * SCALE,
                (screenY + row) * SCALE,
                SCALE,
                SCALE
            );
        }
    }
}

// Nouvelle fonction pour dessiner un sprite avec transparence à une position absolue
function drawSpriteWithTransparency(sprite, x, y) {
    // Convertir en position écran
    const screenX = (x - camera.x) * TILE_SIZE;
    const screenY = (y - camera.y) * TILE_SIZE;
    
    // Vérifier si visible
    if (x < camera.x - 1 || x > camera.x + VIEW_WIDTH ||
        y < camera.y - 1 || y > camera.y + VIEW_HEIGHT) {
        return;
    }
    
    for (let row = 0; row < TILE_SIZE; row++) {
        for (let col = 0; col < TILE_SIZE; col++) {
            const colorIndex = sprite[row][col];
            // Ignorer les pixels transparents
            if (colorIndex === -1 || colorIndex === TRANSPARENT) {
                continue;
            }
            ctx.fillStyle = COLORS[colorIndex];
            ctx.fillRect(
                (screenX + col) * SCALE,
                (screenY + row) * SCALE,
                SCALE,
                SCALE
            );
        }
    }
}

// Rendu du niveau
function drawLevel() {
    const currentMap = maps[currentMapId];
    const level = currentMap.tiles;
    
    // Ne dessiner que les tuiles visibles
    const startX = Math.floor(camera.x);
    const endX = Math.min(startX + VIEW_WIDTH + 1, level[0].length);
    const startY = Math.floor(camera.y);
    const endY = Math.min(startY + VIEW_HEIGHT + 1, level.length);
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const tileType = level[y][x];
            drawTile(TILES[tileType], x, y);
        }
    }
    
    // Afficher le nom de la carte avec les sprites de texte
    drawPixelText(ctx, currentMap.name.toUpperCase(), 10, 10, SCALE, 3);
}

// Rendu du joueur avec animation et sprites directionnels
function drawPlayer() {
    // Déterminer le sprite à utiliser
    let sprite;
    
    if (player.moving && player.animFrame !== undefined) {
        // Utiliser les sprites de marche si disponibles
        const walkSprites = PLAYER_WALK_SPRITES[player.facing];
        if (walkSprites) {
            sprite = walkSprites[player.animFrame % walkSprites.length];
        } else {
            // Fallback sur le sprite directionnel statique
            sprite = PLAYER_SPRITES[player.facing] || PLAYER_SPRITE;
        }
    } else {
        // Sprite statique selon la direction
        sprite = PLAYER_SPRITES[player.facing] || PLAYER_SPRITE;
    }
    
    // Dessiner avec gestion de la transparence
    drawSpriteWithTransparency(sprite, player.renderX, player.renderY);
}

// Rendu des PNJ avec mouvement fluide et transparence
function drawNPCs() {
    npcs.forEach(npc => {
        // Ne dessiner que si visible (utiliser renderX/Y pour la vérification)
        if (npc.renderX >= camera.x - 1 && npc.renderX <= camera.x + VIEW_WIDTH &&
            npc.renderY >= camera.y - 1 && npc.renderY <= camera.y + VIEW_HEIGHT) {
            
            // Utiliser la fonction de transparence pour les sprites
            if (npc.sprite) {
                drawSpriteWithTransparency(npc.sprite, npc.renderX, npc.renderY);
            } else {
                // Fallback sur l'ancienne méthode si pas de sprite défini
                drawTile(NPC_SPRITES[npc.type] || TILES[0], npc.renderX, npc.renderY);
            }
            
            // Indicateur d'ennemi
            if (npc.enemy) {
                // Calculer la distance au joueur (utiliser position grille, pas render)
                const distance = Math.abs(player.x - npc.x) + Math.abs(player.y - npc.y);
                
                // Point d'exclamation rouge si le joueur est proche
                if (distance <= 3) {
                    drawPixelText(ctx, "!", (npc.renderX - camera.x) * TILE_SIZE + 4, (npc.renderY - camera.y) * TILE_SIZE - 10, SCALE, 3);
                } else {
                    // Point d'interrogation gris si le joueur est loin
                    drawPixelText(ctx, "?", (npc.renderX - camera.x) * TILE_SIZE + 4, (npc.renderY - camera.y) * TILE_SIZE - 10, SCALE, 2);
                }
            } else if (npc.merchant) {
                // Indicateur de marchand ($)
                drawPixelText(ctx, "$", (npc.renderX - camera.x) * TILE_SIZE + 4, (npc.renderY - camera.y) * TILE_SIZE - 10, SCALE, 3);
            }
            
            // Indicateur de mouvement pour debug (optionnel)
            if (DEBUG_MODE && npc.moving) {
                ctx.fillStyle = COLORS[1];
                ctx.fillRect(
                    (npc.renderX - camera.x) * TILE_SIZE * SCALE + 6 * SCALE,
                    (npc.renderY - camera.y) * TILE_SIZE * SCALE + 14 * SCALE,
                    4 * SCALE,
                    2 * SCALE
                );
            }
        }
    });
}

// Boucle de rendu principale
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'mainMenu') {
        drawMainMenu();
        // AJOUT: Dessiner le menu de sauvegarde même depuis le menu principal
        if (saveMenu.active) {
            drawSaveMenu();
        }
    } else if (gameState === 'playing') {
        if (battle.active) {
            drawBattle();
        } else {
            // Mettre à jour le mouvement du joueur
            updatePlayerMovement();
            updateCamera();
            
            // Mettre à jour les PNJ seulement si pas de menu actif
            if (!dialogue.active && !menu.active && !inventoryUI.active && !shop.active && !saveMenu.active) {
                updateNPCs();
            }
            
            drawLevel();
            drawNPCs();
            drawPlayer();
            updateDialogue();
            drawDialogue();
            drawMenu();
            drawInventory();
            drawSaveMenu();
            drawShop();
        }
    }
}
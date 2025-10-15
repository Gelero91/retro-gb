// input.js - FICHIER COMPLET

// Gestion des inputs clavier
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Gestion du menu de sauvegarde (AVANT LA VÉRIFICATION DU GAMESTATE)
    if (saveMenu.active) {
        if (saveMenu.confirmDelete) {
            switch(e.key) {
                case 'a':
                case 'A':
                    deleteSave(saveMenu.slots[saveMenu.deleteSlot]);
                    saveMenu.confirmDelete = false;
                    break;
                case 'b':
                case 'B':
                case 'Escape':
                    saveMenu.confirmDelete = false;
                    break;
            }
        } else {
            switch(e.key) {
                case 'ArrowUp':
                    saveMenu.selectedSlot = Math.max(0, saveMenu.selectedSlot - 1);
                    break;
                case 'ArrowDown':
                    saveMenu.selectedSlot = Math.min(saveMenu.slots.length - 1, saveMenu.selectedSlot + 1);
                    break;
                case 'a':
                case 'A':
                    const slot = saveMenu.slots[saveMenu.selectedSlot];
                    if (saveMenu.mode === 'save') {
                        if (saveGame(slot)) {
                            startDialogue(`Partie sauvegardée dans le slot ${slot} !`);
                            saveMenu.active = false;
                        } else {
                            startDialogue("Erreur lors de la sauvegarde !");
                            saveMenu.active = false;
                        }
                    } else {
                        if (saveExists(slot)) {
                            if (loadGame(slot)) {
                                gameState = 'playing';
                                saveMenu.active = false;
                                saveMenu.fromMainMenu = false;
                                startDialogue(`Partie chargée depuis le slot ${slot} !`);
                            } else {
                                startDialogue("Erreur lors du chargement !");
                                saveMenu.active = false;
                            }
                        } else {
                            startDialogue("Aucune sauvegarde dans ce slot !");
                        }
                    }
                    break;
                case 'x':
                case 'X':
                    if (saveExists(saveMenu.slots[saveMenu.selectedSlot])) {
                        saveMenu.confirmDelete = true;
                        saveMenu.deleteSlot = saveMenu.selectedSlot;
                    }
                    break;
                case 'b':
                case 'B':
                case 'Escape':
                    saveMenu.active = false;
                    if (saveMenu.fromMainMenu) {
                        saveMenu.fromMainMenu = false;
                        gameState = 'mainMenu';
                    } else {
                        menu.active = true;
                    }
                    break;
            }
        }
        return;
    }
    
    // Gestion du menu principal
    if (gameState === 'mainMenu') {
        if (mainMenu.showingCredits) {
            if (e.key === 'b' || e.key === 'B' || e.key === 'Escape') {
                mainMenu.showingCredits = false;
            }
        } else {
            switch(e.key) {
                case 'ArrowUp':
                    mainMenu.selectedOption = Math.max(0, mainMenu.selectedOption - 1);
                    break;
                case 'ArrowDown':
                    mainMenu.selectedOption = Math.min(mainMenu.options.length - 1, mainMenu.selectedOption + 1);
                    break;
                case 'a':
                case 'A':
                case 'Enter':
                    handleMainMenuAction(mainMenu.options[mainMenu.selectedOption].action);
                    break;
            }
        }
        return;
    }
    
    // Le reste du code n'est actif que si on est en jeu
    if (gameState !== 'playing') return;
    
    // Ouvrir le chargeur de cartes avec L
    if (e.key === 'l' || e.key === 'L') {
        toggleMapLoader();
        return;
    }
    
    // Gestion du shop
    if (shop.active) {
        const items = shop.mode === 'buy' ? shop.shopInventory : shop.playerItems;
        
        switch(e.key) {
            case 'ArrowUp':
                if (items.length > 0) {
                    shop.selectedItem = Math.max(0, shop.selectedItem - 1);
                }
                break;
            case 'ArrowDown':
                if (items.length > 0) {
                    shop.selectedItem = Math.min(items.length - 1, shop.selectedItem + 1);
                }
                break;
            case 'ArrowLeft':
                shop.mode = 'buy';
                shop.selectedItem = 0;
                break;
            case 'ArrowRight':
                shop.mode = 'sell';
                shop.selectedItem = 0;
                shop.playerItems = inventory.items.filter(item => item.sellPrice > 0);
                break;
            case 'a':
            case 'A':
                if (items.length > 0) {
                    if (shop.mode === 'buy') {
                        buyItem(items[shop.selectedItem]);
                    } else {
                        sellItem(items[shop.selectedItem]);
                    }
                }
                break;
            case 'b':
            case 'B':
            case 'Escape':
                shop.active = false;
                break;
        }
        return;
    }
    
    // Gestion de l'inventaire - MODIFIÉ pour le déséquipement
    if (inventoryUI.active) {
        switch(e.key) {
            case 'ArrowUp':
                inventoryUI.cursorY = Math.max(0, inventoryUI.cursorY - 1);
                break;
            case 'ArrowDown':
                inventoryUI.cursorY = Math.min(inventoryUI.gridHeight - 1, inventoryUI.cursorY + 1);
                break;
            case 'ArrowLeft':
                inventoryUI.cursorX = Math.max(0, inventoryUI.cursorX - 1);
                break;
            case 'ArrowRight':
                inventoryUI.cursorX = Math.min(inventoryUI.gridWidth - 1, inventoryUI.cursorX + 1);
                break;
            case 'a':
            case 'A':
                // Utiliser/Équiper/Déséquiper l'objet sélectionné
                useInventoryItem();
                break;
            case 'b':
            case 'B':
            case 'Escape':
                inventoryUI.active = false;
                menu.active = true;
                break;
        }
        return;
    }
    
    // Gestion du combat
    if (battle.active) {
        if (battle.playerTurn && !battle.animating && battle.messageTimer <= 0 && 
            battle.enemy.hp > 0 && player.hp > 0) {
            
            if (battle.magicMenuActive) {
                switch(e.key) {
                    case 'ArrowUp':
                        do {
                            battle.selectedMagic = Math.max(0, battle.selectedMagic - 1);
                        } while (battle.selectedMagic > 0 && 
                                (player.mp < player.skills[battle.magicOptions[battle.selectedMagic]].mpCost ||
                                 player.skills[battle.magicOptions[battle.selectedMagic]].cooldown > 0));
                        break;
                    case 'ArrowDown':
                        const oldSelection = battle.selectedMagic;
                        do {
                            battle.selectedMagic = Math.min(battle.magicOptions.length - 1, battle.selectedMagic + 1);
                        } while (battle.selectedMagic < battle.magicOptions.length - 1 && 
                                (player.mp < player.skills[battle.magicOptions[battle.selectedMagic]].mpCost ||
                                 player.skills[battle.magicOptions[battle.selectedMagic]].cooldown > 0));
                        if (player.mp < player.skills[battle.magicOptions[battle.selectedMagic]].mpCost ||
                            player.skills[battle.magicOptions[battle.selectedMagic]].cooldown > 0) {
                            battle.selectedMagic = oldSelection;
                        }
                        break;
                    case 'a':
                    case 'A':
                        useMagic(battle.magicOptions[battle.selectedMagic]);
                        break;
                    case 'Escape':
                    case 'b':
                    case 'B':
                        battle.magicMenuActive = false;
                        break;
                }
            } else {
                switch(e.key) {
                    case 'ArrowUp':
                        battle.selectedAction = Math.max(0, battle.selectedAction - 1);
                        break;
                    case 'ArrowDown':
                        battle.selectedAction = Math.min(battle.actions.length - 1, battle.selectedAction + 1);
                        break;
                    case 'a':
                    case 'A':
                        switch(battle.selectedAction) {
                            case 0:
                                playerAttack();
                                break;
                            case 1:
                                battle.magicMenuActive = true;
                                battle.selectedMagic = 0;
                                for (let i = 0; i < battle.magicOptions.length; i++) {
                                    const skill = player.skills[battle.magicOptions[i]];
                                    if (player.mp >= skill.mpCost && skill.cooldown === 0) {
                                        battle.selectedMagic = i;
                                        break;
                                    }
                                }
                                break;
                            case 2:
                                battle.message = "Vous vous mettez en position défensive !";
                                battle.messageTimer = 60;
                                battle.playerTurn = false;
                                endTurnEffects();
                                setTimeout(() => {
                                    const damage = calculateDamage(battle.enemy, player, true);
                                    player.hp = Math.max(0, player.hp - damage);
                                    battle.message = `${battle.enemy.name} inflige ${damage} dégâts (réduits) !`;
                                    battle.shakeTimer = 10;
                                    battle.messageTimer = 60;
                                    
                                    if (player.hp <= 0) {
                                        battle.playerTurn = false;
                                        battle.animating = true;
                                        setTimeout(() => endBattle(false), 1500);
                                    } else {
                                        battle.playerTurn = true;
                                    }
                                }, 1500);
                                break;
                            case 3:
                                if (Math.random() < 0.5) {
                                    battle.message = "Vous prenez la fuite !";
                                    battle.messageTimer = 60;
                                    battle.animating = true;
                                    setTimeout(() => {
                                        battle.active = false;
                                        battle.enemy = null;
                                        battle.animating = false;
                                        battle.magicMenuActive = false;
                                        battle.particleEffects = [];
                                    }, 1000);
                                } else {
                                    battle.message = "Impossible de fuir !";
                                    battle.messageTimer = 60;
                                    battle.playerTurn = false;
                                    endTurnEffects();
                                    setTimeout(() => enemyTurn(), 1500);
                                }
                                break;
                        }
                        break;
                }
            }
        }
        return;
    }
    
    // Gestion du menu
    if (menu.active) {
        switch(e.key) {
            case 'ArrowUp':
                menu.selectedOption = Math.max(0, menu.selectedOption - 1);
                break;
            case 'ArrowDown':
                menu.selectedOption = Math.min(menu.options.length - 1, menu.selectedOption + 1);
                break;
            case 'a':
            case 'A':
                handleMenuAction(menu.options[menu.selectedOption].action);
                break;
            case 'm':
            case 'M':
            case 'Escape':
                menu.active = false;
                break;
        }
        return;
    }
    
    // Gestion du dialogue
    if (dialogue.active) {
        if (e.key === 'a' || e.key === 'A') {
            const currentPageText = dialogue.pages[dialogue.currentPage];
            if (dialogue.charIndex >= currentPageText.length) {
                if (dialogue.currentPage < dialogue.pages.length - 1) {
                    dialogue.currentPage++;
                    dialogue.charIndex = 0;
                } else {
                    dialogue.active = false;
                }
            } else {
                dialogue.charIndex = currentPageText.length;
            }
        }
        return;
    }
    
    // Ouvrir le menu avec M
    if (e.key === 'm' || e.key === 'M') {
        toggleMenu();
        return;
    }
    
    // Interaction avec la touche A
    if (e.key === 'a' || e.key === 'A') {
        checkNPCInteraction();
        return;
    }
    
    // Mouvements du joueur
    if (!player.moving) {
        let targetX = player.x;
        let targetY = player.y;
        let newFacing = player.facing;
        
        switch(e.key) {
            case 'ArrowUp':
                targetY = player.y - 1;
                newFacing = 'up';
                break;
            case 'ArrowDown':
                targetY = player.y + 1;
                newFacing = 'down';
                break;
            case 'ArrowLeft':
                targetX = player.x - 1;
                newFacing = 'left';
                break;
            case 'ArrowRight':
                targetX = player.x + 1;
                newFacing = 'right';
                break;
            default:
                return;
        }
        
        player.facing = newFacing;
        
        const currentMap = maps[currentMapId];
        if (targetX < 0 || targetX >= currentMap.tiles[0].length ||
            targetY < 0 || targetY >= currentMap.tiles.length) {
            return;
        }
        
        if (!isWalkable(currentMap.tiles[targetY][targetX])) {
            return;
        }
        
        const npcCollision = isTileOccupiedByNPC(targetX, targetY);
        if (npcCollision) {
            const enemyCollision = npcs.find(npc => npc.x === targetX && npc.y === targetY && npc.enemy);
            if (enemyCollision && !battle.active && !enemyCollision.moving) {
                startBattle(enemyCollision.type, enemyCollision);
            }
            return;
        }
        
        player.targetX = targetX;
        player.targetY = targetY;
        player.moving = true;
        player.moveProgress = 0;
        player.animFrame = 0;
        player.animTimer = 0;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});
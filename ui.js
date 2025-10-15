// ui.js - FICHIER COMPLET AVEC DÉSÉQUIPEMENT

// Fonctions utilitaires pour dessiner les sprites UI
function drawUIFrame(ctx, x, y, width, height, scale) {
    // Les dimensions doivent être en multiples de TILE_SIZE
    const tilesWidth = Math.floor(width / TILE_SIZE);
    const tilesHeight = Math.floor(height / TILE_SIZE);
    
    // Dessiner les coins
    drawUISprite(ctx, UI_FRAME_SPRITES.corner_top_left, x, y, scale);
    drawUISprite(ctx, UI_FRAME_SPRITES.corner_top_right, x + (tilesWidth - 1) * TILE_SIZE, y, scale);
    drawUISprite(ctx, UI_FRAME_SPRITES.corner_bottom_left, x, y + (tilesHeight - 1) * TILE_SIZE, scale);
    drawUISprite(ctx, UI_FRAME_SPRITES.corner_bottom_right, x + (tilesWidth - 1) * TILE_SIZE, y + (tilesHeight - 1) * TILE_SIZE, scale);
    
    // Dessiner les bordures horizontales
    for (let i = 1; i < tilesWidth - 1; i++) {
        drawUISprite(ctx, UI_FRAME_SPRITES.border_top, x + i * TILE_SIZE, y, scale);
        drawUISprite(ctx, UI_FRAME_SPRITES.border_bottom, x + i * TILE_SIZE, y + (tilesHeight - 1) * TILE_SIZE, scale);
    }
    
    // Dessiner les bordures verticales
    for (let j = 1; j < tilesHeight - 1; j++) {
        drawUISprite(ctx, UI_FRAME_SPRITES.border_left, x, y + j * TILE_SIZE, scale);
        drawUISprite(ctx, UI_FRAME_SPRITES.border_right, x + (tilesWidth - 1) * TILE_SIZE, y + j * TILE_SIZE, scale);
    }
    
    // Remplir le centre
    for (let i = 1; i < tilesWidth - 1; i++) {
        for (let j = 1; j < tilesHeight - 1; j++) {
            drawUISprite(ctx, UI_FRAME_SPRITES.fill, x + i * TILE_SIZE, y + j * TILE_SIZE, scale);
        }
    }
}

function drawUISprite(ctx, sprite, x, y, scale) {
    for (let row = 0; row < TILE_SIZE; row++) {
        for (let col = 0; col < TILE_SIZE; col++) {
            const colorIndex = sprite[row][col];
            // Ignorer les pixels transparents
            if (colorIndex === -1 || colorIndex === TRANSPARENT) {
                continue;
            }
            ctx.fillStyle = COLORS[colorIndex];
            ctx.fillRect(
                (x + col) * scale,
                (y + row) * scale,
                scale,
                scale
            );
        }
    }
}

// Système de dialogue
function startDialogue(text) {
    dialogue.active = true;
    dialogue.text = text;
    dialogue.pages = splitTextIntoPages(text);
    dialogue.currentPage = 0;
    dialogue.charIndex = 0;
    dialogue.frameCount = 0;
}

function splitTextIntoPages(text) {
    const words = text.split(' ');
    const pages = [];
    let currentPage = [];
    let currentLine = [];
    let currentLineLength = 0;
    
    const maxCharsPerLine = 15;
    const maxLinesPerPage = 4;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordLength = word.length;
        
        if (currentLineLength + (currentLine.length > 0 ? 1 : 0) + wordLength <= maxCharsPerLine) {
            currentLine.push(word);
            currentLineLength += (currentLine.length > 1 ? 1 : 0) + wordLength;
        } else {
            if (currentPage.length >= maxLinesPerPage) {
                pages.push(currentPage.join(' '));
                currentPage = [];
            }
            
            if (currentLine.length > 0) {
                currentPage.push(currentLine.join(' '));
            }
            
            currentLine = [word];
            currentLineLength = wordLength;
        }
    }
    
    if (currentLine.length > 0) {
        if (currentPage.length >= maxLinesPerPage) {
            pages.push(currentPage.join(' '));
            currentPage = [currentLine.join(' ')];
        } else {
            currentPage.push(currentLine.join(' '));
        }
    }
    
    if (currentPage.length > 0) {
        pages.push(currentPage.join(' '));
    }
    
    return pages;
}

function updateDialogue() {
    if (dialogue.active && dialogue.currentPage < dialogue.pages.length) {
        const currentPageText = dialogue.pages[dialogue.currentPage];
        if (dialogue.charIndex < currentPageText.length) {
            dialogue.frameCount++;
            if (dialogue.frameCount >= dialogue.speed) {
                dialogue.charIndex++;
                dialogue.frameCount = 0;
            }
        }
    }
}

function drawDialogue() {
    if (!dialogue.active || dialogue.currentPage >= dialogue.pages.length) return;
    
    const boxHeight = 64;
    const boxY = SCREEN_HEIGHT - boxHeight - 8;
    const boxX = 8;
    const boxWidth = SCREEN_WIDTH - 16;
    
    const tilesWidth = Math.ceil(boxWidth / TILE_SIZE);
    const tilesHeight = Math.ceil(boxHeight / TILE_SIZE);
    
    drawUIFrame(ctx, boxX, boxY, tilesWidth * TILE_SIZE, tilesHeight * TILE_SIZE, SCALE);
    
    const currentPageText = dialogue.pages[dialogue.currentPage];
    const displayText = currentPageText.substring(0, dialogue.charIndex);
    const lines = wrapPixelText(displayText, boxWidth - 16);
    
    lines.forEach((line, index) => {
        drawPixelText(ctx, line, boxX + 8, boxY + 8 + index * 10, SCALE, 3);
    });
    
    if (dialogue.pages.length > 1) {
        const pageIndicator = `${dialogue.currentPage + 1}/${dialogue.pages.length}`;
        const indicatorWidth = measurePixelText(pageIndicator);
        drawPixelText(ctx, pageIndicator, boxX + boxWidth - indicatorWidth - 8, boxY + boxHeight - 10, SCALE, 2);
    }
    
    if (dialogue.charIndex >= currentPageText.length && Math.floor(Date.now() / 500) % 2) {
        if (dialogue.currentPage < dialogue.pages.length - 1) {
            ctx.fillStyle = COLORS[3];
            ctx.beginPath();
            ctx.moveTo((boxX + boxWidth/2 - 2) * SCALE, (boxY + boxHeight - 12) * SCALE);
            ctx.lineTo((boxX + boxWidth/2 + 2) * SCALE, (boxY + boxHeight - 12) * SCALE);
            ctx.lineTo((boxX + boxWidth/2) * SCALE, (boxY + boxHeight - 8) * SCALE);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = COLORS[3];
            ctx.fillRect((boxX + boxWidth/2 - 2) * SCALE, (boxY + boxHeight - 12) * SCALE, 4 * SCALE, 4 * SCALE);
        }
    }
}

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    const charWidth = 5;
    
    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        if (testLine.length * charWidth > maxWidth) {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = word;
            }
        } else {
            currentLine = testLine;
        }
    });
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines.slice(0, 4);
}

// Système de menu
function toggleMenu() {
    menu.active = !menu.active;
    if (menu.active) {
        menu.selectedOption = 0;
    }
}

function drawMenu() {
    if (!menu.active) return;
    
    const menuWidth = 96;
    const menuHeight = 80;
    const menuX = Math.floor((SCREEN_WIDTH - menuWidth) / 2);
    const menuY = Math.floor((SCREEN_HEIGHT - menuHeight) / 2);
    
    drawUIFrame(ctx, menuX, menuY, menuWidth, menuHeight, SCALE);
    
    const menuTitleWidth = measurePixelText("MENU");
    drawPixelText(ctx, "MENU", menuX + (menuWidth - menuTitleWidth) / 2, menuY + 8, SCALE, 3);
    
    const menuLabels = ["INV.", "STATUT", "SAUVER", "QUITTER"];
    
    const optionsStartY = menuY + 34;
    
    menu.options.forEach((option, index) => {
        const optionY = optionsStartY + (index * 11);
        
        if (index === menu.selectedOption) {
            ctx.fillStyle = COLORS[2];
            ctx.fillRect((menuX + 8) * SCALE, (optionY - 5) * SCALE, (menuWidth - 16) * SCALE, 10 * SCALE);
        }
        
        const textColor = index === menu.selectedOption ? 0 : 3;
        drawPixelText(ctx, menuLabels[index], menuX + 24, optionY - 4, SCALE, textColor);
        
        if (index === menu.selectedOption) {
            drawPixelText(ctx, ">", menuX + 16, optionY - 4, SCALE, textColor);
        }
    });
}

function handleMenuAction(action) {
    switch(action) {
        case "inventory":
            menu.active = false;
            showInventory();
            break;
        case "status":
            const weapon = player.equipped.weapon;
            const armor = player.equipped.armor;
            
            let messages = [];
            messages.push(`NV.${player.level}`);
            messages.push(`PV:${player.hp}/${player.maxHp} PM:${player.mp}/${player.maxMp}`);
            messages.push(`ATQ:${player.attack}${weapon ? `(+${weapon.attack})` : ""}`);
            messages.push(`DEF:${player.defense}${armor ? `(+${armor.defense})` : ""}`);
            messages.push(`EXP:${player.exp}/${player.expToNext}`);
            messages.push(`OR:${player.gold}`);
            
            startDialogue(messages.join(" "));
            menu.active = false;
            break;
        case "save":
            showSaveMenu('save');
            break;
        case "quit":
            if (confirm("Menu principal ?")) {
                gameState = 'mainMenu';
                mainMenu.selectedOption = 0;
                mainMenu.showingCredits = false;
                menu.active = false;
            }
            break;
    }
}

// Interface d'inventaire
function showInventory() {
    inventoryUI.active = true;
    inventoryUI.cursorX = 0;
    inventoryUI.cursorY = 0;
}

// FONCTION MODIFIÉE - Utilisation d'objets avec déséquipement (sans dialogues)
function useInventoryItem() {
    const selectedIndex = inventoryUI.cursorY * inventoryUI.gridWidth + inventoryUI.cursorX;
    const item = inventory.items[selectedIndex];
    
    if (!item) return;
    
    // Consommable
    if (item.type === "consumable") {
        if (item.effect === "heal") {
            if (player.hp < player.maxHp) {
                player.hp = Math.min(player.maxHp, player.hp + item.power);
                removeFromInventory(item);
                inventoryUI.active = false;
            }
        } else if (item.effect === "mana") {
            if (player.mp < player.maxMp) {
                player.mp = Math.min(player.maxMp, player.mp + item.power);
                removeFromInventory(item);
                inventoryUI.active = false;
            }
        }
    }
    // Arme - DÉSÉQUIPEMENT AJOUTÉ (sans dialogue)
    else if (item.type === "weapon") {
        // Si déjà équipé, déséquiper
        if (player.equipped.weapon === item) {
            player.attack -= item.attack;
            player.equipped.weapon = null;
        }
        // Sinon, équiper (en remplaçant l'ancien si nécessaire)
        else {
            if (player.equipped.weapon) {
                player.attack -= player.equipped.weapon.attack;
            }
            player.equipped.weapon = item;
            player.attack += item.attack;
        }
    }
    // Armure - DÉSÉQUIPEMENT AJOUTÉ (sans dialogue)
    else if (item.type === "armor") {
        // Si déjà équipé, déséquiper
        if (player.equipped.armor === item) {
            player.defense -= item.defense;
            player.equipped.armor = null;
        }
        // Sinon, équiper (en remplaçant l'ancien si nécessaire)
        else {
            if (player.equipped.armor) {
                player.defense -= player.equipped.armor.defense;
            }
            player.equipped.armor = item;
            player.defense += item.defense;
        }
    }
    // Objet clé - pas d'action pour l'instant
}

// FONCTION MODIFIÉE - Affichage inventaire avec indicateurs équipement
function drawInventory() {
    if (!inventoryUI.active) return;
    
    const invWidth = 128;
    const invHeight = 112;
    const invX = Math.floor((SCREEN_WIDTH - invWidth) / 2);
    const invY = Math.floor((SCREEN_HEIGHT - invHeight) / 2);
    
    drawUIFrame(ctx, invX, invY, invWidth, invHeight, SCALE);
    
    const invTitleWidth = measurePixelText("INV.");
    drawPixelText(ctx, "INV.", invX + (invWidth - invTitleWidth) / 2, invY + 8, SCALE, 3);
    
    const slotSize = 20;
    const gridX = invX + 14;
    const gridY = invY + 20;
    
    for (let y = 0; y < inventoryUI.gridHeight; y++) {
        for (let x = 0; x < inventoryUI.gridWidth; x++) {
            const slotX = gridX + x * (slotSize + 2);
            const slotY = gridY + y * (slotSize + 2);
            const index = y * inventoryUI.gridWidth + x;
            
            ctx.strokeStyle = COLORS[2];
            ctx.lineWidth = SCALE;
            ctx.strokeRect(slotX * SCALE, slotY * SCALE, slotSize * SCALE, slotSize * SCALE);
            
            if (x === inventoryUI.cursorX && y === inventoryUI.cursorY) {
                drawUISprite(ctx, UI_FRAME_SPRITES.cursor, slotX + 2, slotY + 2, SCALE);
            }
            
            if (inventory.items[index]) {
                const item = inventory.items[index];
                
                let icon = "?";
                if (item.type === "consumable") icon = "♥";
                else if (item.type === "weapon") icon = "†";
                else if (item.type === "armor") icon = "◆";
                else if (item.type === "key") icon = "§";
                
                // AMÉLIORATION: Fond vert clair pour items équipés
                const isEquipped = (item === player.equipped.weapon || item === player.equipped.armor);
                if (isEquipped) {
                    ctx.fillStyle = COLORS[0];
                    ctx.fillRect((slotX + 1) * SCALE, (slotY + 1) * SCALE, (slotSize - 2) * SCALE, (slotSize - 2) * SCALE);
                }
                
                drawPixelText(ctx, icon, slotX + slotSize/2 - 4, slotY + slotSize/2 - 4, SCALE, 3);
                
                // Indicateur "E" pour équipé
                if (isEquipped) {
                    drawPixelText(ctx, "E", slotX + slotSize - 8, slotY + 2, SCALE, 3);
                }
            }
        }
    }
    
    const selectedIndex = inventoryUI.cursorY * inventoryUI.gridWidth + inventoryUI.cursorX;
    const selectedItem = inventory.items[selectedIndex];
    
    if (selectedItem) {
        const shortName = selectedItem.name.substring(0, 12);
        drawPixelText(ctx, shortName, invX + 8, invY + invHeight - 25, SCALE, 3);
        
        // AMÉLIORATION: Afficher [EQUIPE] ou instruction si l'item est équipé
        const isEquipped = (selectedItem === player.equipped.weapon || selectedItem === player.equipped.armor);
        let shortDesc = selectedItem.description.substring(0, 14);
        
        if (isEquipped) {
            shortDesc = "A:RETIRER";
        } else if (selectedItem.type === "weapon" || selectedItem.type === "armor") {
            shortDesc = "A:EQUIPER";
        }
        
        drawPixelText(ctx, shortDesc, invX + 8, invY + invHeight - 15, SCALE, 2);
    }}

// Menu de sauvegarde
function showSaveMenu(mode = 'save') {
    saveMenu.active = true;
    saveMenu.mode = mode;
    saveMenu.selectedSlot = 0;
    saveMenu.confirmDelete = false;
    menu.active = false;
}

function drawSaveMenu() {
    if (!saveMenu.active) return;
    
    ctx.fillStyle = 'rgba(15, 56, 15, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const boxWidth = 128;
    const boxHeight = 96;
    const boxX = Math.floor((SCREEN_WIDTH - boxWidth) / 2);
    const boxY = Math.floor((SCREEN_HEIGHT - boxHeight) / 2);
    
    drawUIFrame(ctx, boxX, boxY, boxWidth, boxHeight, SCALE);
    
    const saveTitle = saveMenu.mode === 'save' ? "SAUVER" : "CHARGER";
    const saveTitleWidth = measurePixelText(saveTitle);
    drawPixelText(ctx, saveTitle, boxX + (boxWidth - saveTitleWidth) / 2, boxY + 6, SCALE, 3);
    
    if (saveMenu.confirmDelete) {
        const confirmWidth = 96;
        const confirmHeight = 48;
        const confirmX = Math.floor((SCREEN_WIDTH - confirmWidth) / 2);
        const confirmY = Math.floor((SCREEN_HEIGHT - confirmHeight) / 2);
        
        drawUIFrame(ctx, confirmX, confirmY, confirmWidth, confirmHeight, SCALE);
        
        drawPixelText(ctx, "EFFACER ?", confirmX + (confirmWidth - measurePixelText("EFFACER ?")) / 2, confirmY + 16, SCALE, 3);
        drawPixelText(ctx, "A:OUI B:NON", confirmX + (confirmWidth - measurePixelText("A:OUI B:NON")) / 2, confirmY + 28, SCALE, 3);
        return;
    }
    
    saveMenu.slots.forEach((slot, index) => {
        const slotY = boxY + 20 + index * 20;
        const info = getSaveInfo(slot);
        
        if (index === saveMenu.selectedSlot) {
            ctx.fillStyle = COLORS[2];
            ctx.fillRect((boxX + 5) * SCALE, (slotY - 3) * SCALE, (boxWidth - 9) * SCALE, 19 * SCALE);
        }
        
        const textColor = index === saveMenu.selectedSlot ? 0 : 3;
        
        if (info) {
            drawPixelText(ctx, `SLOT ${slot}`, boxX + 8, slotY + 2, SCALE, textColor);
            drawPixelText(ctx, `NV${info.level}`, boxX + 50, slotY + 2, SCALE, textColor);
            const shortDate = info.date.substring(0, 11);
            drawPixelText(ctx, shortDate, boxX + 8, slotY + 11, SCALE, textColor);
        } else {
            drawPixelText(ctx, `SLOT ${slot}`, boxX + 8, slotY + 2, SCALE, textColor);
            drawPixelText(ctx, "[VIDE]", boxX + 8, slotY + 11, SCALE, 1);
        }
    });
    
    const instructions = saveMenu.mode === 'save' ? "A:SAUVER X:EFFACER" : "A:CHARGER";
    drawPixelText(ctx, instructions, boxX + 8, boxY + boxHeight - 8, SCALE, 2);
}

// Shop
function openShop(shopInventory) {
    shop.active = true;
    shop.mode = 'buy';
    shop.shopInventory = shopInventory;
    shop.selectedItem = 0;
    shop.playerItems = inventory.items.filter(item => item.sellPrice > 0);
}

function drawShop() {
    if (!shop.active) return;
    
    ctx.fillStyle = 'rgba(15, 56, 15, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const boxWidth = 128;
    const boxHeight = 96;
    const boxX = Math.floor((SCREEN_WIDTH - boxWidth) / 2);
    const boxY = Math.floor((SCREEN_HEIGHT - boxHeight) / 2);
    
    drawUIFrame(ctx, boxX, boxY, boxWidth, boxHeight, SCALE);
    
    const title = shop.mode === 'buy' ? "ACHETER" : "VENDRE";
    const titleWidth = measurePixelText(title);
    drawPixelText(ctx, title, boxX + (boxWidth - titleWidth) / 2, boxY + 6, SCALE, 3);
    
    drawPixelText(ctx, `OR: ${player.gold}`, boxX + boxWidth - 48, boxY + 6, SCALE, 3);
    
    const tabY = boxY + 18;
    
    const buyTabColor = shop.mode === 'buy' ? 3 : 1;
    const sellTabColor = shop.mode === 'sell' ? 3 : 1;
    drawPixelText(ctx, "ACHAT", boxX + 16, tabY, SCALE, buyTabColor);
    drawPixelText(ctx, "VENTE", boxX + boxWidth - 44, tabY, SCALE, sellTabColor);
    
    const listY = boxY + 28;
    const items = shop.mode === 'buy' ? shop.shopInventory : shop.playerItems;
    
    if (items.length === 0) {
        drawPixelText(ctx, "RIEN", boxX + (boxWidth - measurePixelText("RIEN")) / 2, listY + 20, SCALE, 2);
    } else {
        const maxVisible = 4;
        const scrollOffset = Math.max(0, shop.selectedItem - maxVisible + 1);
        
        for (let i = 0; i < Math.min(maxVisible, items.length); i++) {
            const index = i + scrollOffset;
            if (index >= items.length) break;
            
            const item = shop.mode === 'buy' ? itemTypes[items[index]] : items[index];
            const itemY = listY + i * 12;
            
            if (index === shop.selectedItem) {
                ctx.fillStyle = COLORS[2];
                ctx.fillRect((boxX + 8) * SCALE, (itemY - 4) * SCALE, (boxWidth - 16) * SCALE, 10 * SCALE);
            }
            
            const textColor = index === shop.selectedItem ? 0 : 3;
            const shortName = item.name.toUpperCase().substring(0, 8);
            drawPixelText(ctx, shortName, boxX + 12, itemY - 2, SCALE, textColor);
            
            const price = shop.mode === 'buy' ? item.buyPrice : item.sellPrice;
            const canAfford = shop.mode === 'buy' ? player.gold >= price : true;
            const priceColor = canAfford ? (index === shop.selectedItem ? 0 : 3) : 1;
            const priceText = `$${price}`;
            drawPixelText(ctx, priceText, boxX + boxWidth - 12 - measurePixelText(priceText), itemY - 2, SCALE, priceColor);
        }
        
        if (items.length > maxVisible) {
            const scrollPos = Math.floor((scrollOffset / (items.length - maxVisible)) * 3);
            for (let i = 0; i < 4; i++) {
                const color = i === scrollPos ? 3 : 1;
                ctx.fillStyle = COLORS[color];
                ctx.fillRect((boxX + boxWidth - 6) * SCALE, (listY + i * 10) * SCALE, 2 * SCALE, 8 * SCALE);
            }
        }
    }
    
    drawPixelText(ctx, "A:OK B:SORTIR", boxX + 8, boxY + boxHeight - 2, SCALE, 2);
}

function buyItem(itemKey) {
    const item = itemTypes[itemKey];
    if (player.gold >= item.buyPrice) {
        if (inventory.items.length < inventory.maxSize) {
            player.gold -= item.buyPrice;
            addToInventory(itemKey);
            startDialogue(`+${item.name}!`);
            shop.active = false;
        } else {
            startDialogue("INV. PLEIN!");
        }
    } else {
        startDialogue("PAS ASSEZ $!");
    }
}

function sellItem(item) {
    if (item.sellPrice > 0) {
        player.gold += item.sellPrice;
        const index = inventory.items.indexOf(item);
        inventory.items.splice(index, 1);
        startDialogue(`+$${item.sellPrice}!`);
        shop.playerItems = inventory.items.filter(item => item.sellPrice > 0);
        if (shop.playerItems.length === 0) {
            shop.mode = 'buy';
            shop.selectedItem = 0;
        } else if (shop.selectedItem >= shop.playerItems.length) {
            shop.selectedItem = shop.playerItems.length - 1;
        }
    }
}

// Menu principal
function drawMainMenu() {
    ctx.fillStyle = COLORS[3];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    mainMenu.animationFrame++;
    const titleY = 20 + Math.sin(mainMenu.animationFrame * 0.02) * 3;
    
    drawPixelText(ctx, "GAME BOY", (SCREEN_WIDTH - measurePixelText("GAME BOY")) / 2, titleY, SCALE, 0);
    drawPixelText(ctx, "ENGINE", (SCREEN_WIDTH - measurePixelText("ENGINE")) / 2, titleY + 18, SCALE, 0);
    
    drawPixelText(ctx, "~ PROTO RPG ~", (SCREEN_WIDTH - measurePixelText("~ PROTO RPG ~")) / 2, titleY + 30, SCALE, 1);
    
    if (mainMenu.showingCredits) {
        const creditsWidth = 112;
        const creditsHeight = 48;
        const creditsX = Math.floor((SCREEN_WIDTH - creditsWidth) / 2);
        const creditsY = 70;
        
        drawUIFrame(ctx, creditsX, creditsY, creditsWidth, creditsHeight, SCALE);
        
        drawPixelText(ctx, "BY GWEN", creditsX + (creditsWidth - measurePixelText("BY GWEN")) / 2, creditsY + 12, SCALE, 3);
        drawPixelText(ctx, "HTML5 GB", creditsX + (creditsWidth - measurePixelText("HTML5 GB")) / 2, creditsY + 22, SCALE, 3);
        drawPixelText(ctx, "B: RETOUR", creditsX + (creditsWidth - measurePixelText("B: RETOUR")) / 2, creditsY + 36, SCALE, 2);
    } else {
        const menuY = 65;
        const menuWidth = 112;
        const menuHeight = 72;
        const menuX = Math.floor((SCREEN_WIDTH - menuWidth) / 2);
        
        drawUIFrame(ctx, menuX, menuY, menuWidth, menuHeight, SCALE);
        
        const shortLabels = ["NOUVEAU", "CHARGER", "OPTIONS", "CREDITS"];
        
        const optionsAreaHeight = mainMenu.options.length * 10 + (mainMenu.options.length - 1) * 2;
        const optionsStartY = menuY + Math.floor((menuHeight - optionsAreaHeight) / 2);
        
        mainMenu.options.forEach((option, index) => {
            const optionY = optionsStartY + (index * 12);
            
            if (index === mainMenu.selectedOption) {
                ctx.fillStyle = COLORS[2];
                ctx.fillRect((menuX + 8) * SCALE, (optionY - 5) * SCALE, (menuWidth - 16) * SCALE, 10 * SCALE);
            }
            
            const textColor = index === mainMenu.selectedOption ? 0 : 3;
            const optionWidth = measurePixelText(shortLabels[index]);
            drawPixelText(ctx, shortLabels[index], menuX + (menuWidth - optionWidth) / 2, optionY - 4, SCALE, textColor);
            
            if (index === mainMenu.selectedOption) {
                drawPixelText(ctx, ">", menuX + 12, optionY - 4, SCALE, textColor);
                drawPixelText(ctx, "<", menuX + menuWidth - 18, optionY - 4, SCALE, textColor);
            }
        });
        
        drawPixelText(ctx, "A: OK", (SCREEN_WIDTH - measurePixelText("A: OK")) / 2, SCREEN_HEIGHT - 12, SCALE, 2);
    }
    
    drawPixelText(ctx, "V1.0", SCREEN_WIDTH - 24, SCREEN_HEIGHT - 10, SCALE, 1);
}

function handleMainMenuAction(action) {
    switch(action) {
        case 'new':
            startNewGame();
            break;
        case 'load':
            if (saveExists(1) || saveExists(2) || saveExists(3)) {
                mainMenu.selectedOption = 0;
                showSaveMenu('load');
                saveMenu.fromMainMenu = true;
            } else {
                startDialogue("PAS DE SAVE!");
            }
            break;
        case 'options':
            startDialogue("BIENTOT!");
            break;
        case 'credits':
            mainMenu.showingCredits = true;
            break;
    }
}
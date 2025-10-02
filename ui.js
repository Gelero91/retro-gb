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
    
    const maxCharsPerLine = 15; // CORRIGÉ: Réduit de 26 à 15 pour respecter les 144 pixels
    const maxLinesPerPage = 4; // AUGMENTÉ: De 3 à 4 pour compenser
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordLength = word.length;
        
        // Vérifier si le mot rentre sur la ligne courante
        if (currentLineLength + (currentLine.length > 0 ? 1 : 0) + wordLength <= maxCharsPerLine) {
            // Le mot rentre sur la ligne
            currentLine.push(word);
            currentLineLength += (currentLine.length > 1 ? 1 : 0) + wordLength;
        } else {
            // Le mot ne rentre pas, il faut passer à la ligne suivante
            if (currentPage.length >= maxLinesPerPage) {
                // La page est pleine, créer une nouvelle page
                pages.push(currentPage.join(' '));
                currentPage = [];
            }
            
            // Ajouter la ligne courante à la page
            if (currentLine.length > 0) {
                currentPage.push(currentLine.join(' '));
            }
            
            // Commencer une nouvelle ligne avec ce mot
            currentLine = [word];
            currentLineLength = wordLength;
        }
    }
    
    // Ajouter la dernière ligne si elle existe
    if (currentLine.length > 0) {
        if (currentPage.length >= maxLinesPerPage) {
            pages.push(currentPage.join(' '));
            currentPage = [currentLine.join(' ')];
        } else {
            currentPage.push(currentLine.join(' '));
        }
    }
    
    // Ajouter la dernière page si elle existe
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
    
    // Boîte de dialogue en bas de l'écran
    const boxHeight = 64; // AUGMENTÉ: De 48 à 64 pour 4 lignes
    const boxY = SCREEN_HEIGHT - boxHeight - 8;
    const boxX = 8;
    const boxWidth = SCREEN_WIDTH - 16;
    
    // Calculer les dimensions en tuiles
    const tilesWidth = Math.ceil(boxWidth / TILE_SIZE);
    const tilesHeight = Math.ceil(boxHeight / TILE_SIZE);
    
    // Dessiner le cadre avec les nouveaux sprites
    drawUIFrame(ctx, boxX, boxY, tilesWidth * TILE_SIZE, tilesHeight * TILE_SIZE, SCALE);
    
    // Affichage progressif du texte de la page courante
    const currentPageText = dialogue.pages[dialogue.currentPage];
    const displayText = currentPageText.substring(0, dialogue.charIndex);
    const lines = wrapPixelText(displayText, boxWidth - 16);
    
    lines.forEach((line, index) => {
        drawPixelText(ctx, line, boxX + 8, boxY + 8 + index * 10, SCALE, 3);
    });
    
    // Indicateur de pages
    if (dialogue.pages.length > 1) {
        const pageIndicator = `${dialogue.currentPage + 1}/${dialogue.pages.length}`;
        const indicatorWidth = measurePixelText(pageIndicator);
        drawPixelText(ctx, pageIndicator, boxX + boxWidth - indicatorWidth - 8, boxY + boxHeight - 10, SCALE, 2);
    }
    
    // Indicateur approprié
    if (dialogue.charIndex >= currentPageText.length && Math.floor(Date.now() / 500) % 2) {
        if (dialogue.currentPage < dialogue.pages.length - 1) {
            // Flèche vers le bas pour indiquer qu'il y a une suite
            ctx.fillStyle = COLORS[3];
            ctx.beginPath();
            ctx.moveTo((boxX + boxWidth/2 - 2) * SCALE, (boxY + boxHeight - 12) * SCALE);
            ctx.lineTo((boxX + boxWidth/2 + 2) * SCALE, (boxY + boxHeight - 12) * SCALE);
            ctx.lineTo((boxX + boxWidth/2) * SCALE, (boxY + boxHeight - 8) * SCALE);
            ctx.closePath();
            ctx.fill();
        } else {
            // Carré pour indiquer la fin du dialogue
            ctx.fillStyle = COLORS[3];
            ctx.fillRect((boxX + boxWidth/2 - 2) * SCALE, (boxY + boxHeight - 12) * SCALE, 4 * SCALE, 4 * SCALE);
        }
    }
}

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    const charWidth = 5; // Largeur approximative d'un caractère
    
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
    
    return lines.slice(0, 4); // Maximum 4 lignes maintenant
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
    
    // Dimensions du menu
    const menuWidth = 96; // 6 tuiles de largeur
    const menuHeight = 80; // AUGMENTÉ: De 64 à 80 pixels (5 tuiles au lieu de 4)
    const menuX = Math.floor((SCREEN_WIDTH - menuWidth) / 2);
    const menuY = Math.floor((SCREEN_HEIGHT - menuHeight) / 2);
    
    // Dessiner le cadre avec les nouveaux sprites
    drawUIFrame(ctx, menuX, menuY, menuWidth, menuHeight, SCALE);
    
    // Titre du menu
    const menuTitleWidth = measurePixelText("MENU");
    drawPixelText(ctx, "MENU", menuX + (menuWidth - menuTitleWidth) / 2, menuY + 8, SCALE, 3);
    
    // Options du menu avec abréviations
    const menuLabels = ["INV.", "STATUT", "SAUVER", "QUITTER"]; // ABRÉGÉ
    
    // Décalage des options vers le bas d'un tile (16 pixels)
    const optionsStartY = menuY + 34; // Augmenté de 18 à 34 (+16 pixels)
    
    menu.options.forEach((option, index) => {
        const optionY = optionsStartY + (index * 11); // Espacement légèrement augmenté
        
        // Surbrillance de l'option sélectionnée
        if (index === menu.selectedOption) {
            ctx.fillStyle = COLORS[2];
            ctx.fillRect((menuX + 8) * SCALE, (optionY - 5) * SCALE, (menuWidth - 16) * SCALE, 10 * SCALE);
        }
        
        // Texte de l'option et curseur
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
            // Afficher les stats en plusieurs dialogues courts
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
            // Retour au menu principal
            if (confirm("Menu principal ?")) { // Message court
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

function drawInventory() {
    if (!inventoryUI.active) return;
    
    // Fond de l'inventaire
    const invWidth = 128; // RÉDUIT: De 144 à 128 (8 tuiles)
    const invHeight = 112; // RÉDUIT: De 128 à 112 (7 tuiles)
    const invX = Math.floor((SCREEN_WIDTH - invWidth) / 2);
    const invY = Math.floor((SCREEN_HEIGHT - invHeight) / 2);
    
    // Dessiner le cadre avec les nouveaux sprites
    drawUIFrame(ctx, invX, invY, invWidth, invHeight, SCALE);
    
    // Titre
    const invTitleWidth = measurePixelText("INV."); // ABRÉGÉ
    drawPixelText(ctx, "INV.", invX + (invWidth - invTitleWidth) / 2, invY + 8, SCALE, 3);
    
    // Grille d'objets
    const slotSize = 20; // RÉDUIT de 24 à 20
    const gridX = invX + 14;
    const gridY = invY + 20;
    
    for (let y = 0; y < inventoryUI.gridHeight; y++) {
        for (let x = 0; x < inventoryUI.gridWidth; x++) {
            const slotX = gridX + x * (slotSize + 2); // Espacement réduit
            const slotY = gridY + y * (slotSize + 2);
            const index = y * inventoryUI.gridWidth + x;
            
            // Bordure de la case
            ctx.strokeStyle = COLORS[2];
            ctx.lineWidth = SCALE;
            ctx.strokeRect(slotX * SCALE, slotY * SCALE, slotSize * SCALE, slotSize * SCALE);
            
            // Curseur avec le nouveau sprite
            if (x === inventoryUI.cursorX && y === inventoryUI.cursorY) {
                // Dessiner le sprite curseur centré sur la case
                drawUISprite(ctx, UI_FRAME_SPRITES.cursor, slotX + 2, slotY + 2, SCALE);
            }
            
            // Objet
            if (inventory.items[index]) {
                const item = inventory.items[index];
                
                // Icône simple selon le type
                let icon = "?";
                if (item.type === "consumable") icon = "♥";
                else if (item.type === "weapon") icon = "†";
                else if (item.type === "armor") icon = "◆";
                else if (item.type === "key") icon = "§";
                
                drawPixelText(ctx, icon, slotX + slotSize/2 - 4, slotY + slotSize/2 - 4, SCALE, 3);
                
                // Indicateur d'équipement (E)
                if ((item === player.equipped.weapon || item === player.equipped.armor)) {
                    drawPixelText(ctx, "E", slotX + slotSize - 8, slotY + 2, SCALE, 2);
                }
            }
        }
    }
    
    // Description courte de l'objet sélectionné
    const selectedIndex = inventoryUI.cursorY * inventoryUI.gridWidth + inventoryUI.cursorX;
    const selectedItem = inventory.items[selectedIndex];
    
    if (selectedItem) {
        // Nom abrégé
        const shortName = selectedItem.name.substring(0, 12);
        drawPixelText(ctx, shortName, invX + 8, invY + invHeight - 25, SCALE, 3);
        // Description très courte
        const shortDesc = selectedItem.description.substring(0, 14);
        drawPixelText(ctx, shortDesc, invX + 8, invY + invHeight - 15, SCALE, 2);
    }
}

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
    
    // Fond sombre
    ctx.fillStyle = 'rgba(15, 56, 15, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Boîte principale
    const boxWidth = 128; // RÉDUIT: De 144 à 128
    const boxHeight = 96; // RÉDUIT: De 128 à 96
    const boxX = Math.floor((SCREEN_WIDTH - boxWidth) / 2);
    const boxY = Math.floor((SCREEN_HEIGHT - boxHeight) / 2);
    
    // Dessiner le cadre avec les nouveaux sprites
    drawUIFrame(ctx, boxX, boxY, boxWidth, boxHeight, SCALE);
    
    // Titre
    const saveTitle = saveMenu.mode === 'save' ? "SAUVER" : "CHARGER"; // ABRÉGÉ
    const saveTitleWidth = measurePixelText(saveTitle);
    drawPixelText(ctx, saveTitle, boxX + (boxWidth - saveTitleWidth) / 2, boxY + 6, SCALE, 3);
    
    // Confirmation de suppression
    if (saveMenu.confirmDelete) {
        // Cadre de confirmation
        const confirmWidth = 96;
        const confirmHeight = 48;
        const confirmX = Math.floor((SCREEN_WIDTH - confirmWidth) / 2);
        const confirmY = Math.floor((SCREEN_HEIGHT - confirmHeight) / 2);
        
        drawUIFrame(ctx, confirmX, confirmY, confirmWidth, confirmHeight, SCALE);
        
        drawPixelText(ctx, "EFFACER ?", confirmX + (confirmWidth - measurePixelText("EFFACER ?")) / 2, confirmY + 16, SCALE, 3);
        drawPixelText(ctx, "A:OUI B:NON", confirmX + (confirmWidth - measurePixelText("A:OUI B:NON")) / 2, confirmY + 28, SCALE, 3);
        return;
    }
    
    // Slots de sauvegarde
    saveMenu.slots.forEach((slot, index) => {
        const slotY = boxY + 20 + index * 20; // Espacement réduit de 25 à 20
        const info = saveGame.getInfo(slot);
        
        // Surbrillance
        if (index === saveMenu.selectedSlot) {
            ctx.fillStyle = COLORS[2];
            ctx.fillRect((boxX + 5) * SCALE, (slotY - 3) * SCALE, (boxWidth - 9) * SCALE, 19 * SCALE);
        }
        
        // Numéro du slot et infos
        const textColor = index === saveMenu.selectedSlot ? 0 : 3;
        drawPixelText(ctx, `${slot}:`, boxX + 8, slotY - 2, SCALE, textColor);
        
        if (info) {
            // Format court: NV.X + nom carte abrégé
            const mapName = info.map.substring(0, 8);
            drawPixelText(ctx, `NV.${info.level} ${mapName}`, boxX + 24, slotY - 2, SCALE, textColor);
            // Date format court: JJ/MM HH:MM
            const shortDate = info.date.substring(0, 11); // "25/12, 14:30" max
            drawPixelText(ctx, shortDate, boxX + 8, slotY + 8, SCALE, textColor);
        } else {
            // Slot vide
            drawPixelText(ctx, "- VIDE -", boxX + 24, slotY - 2, SCALE, 1);
        }
    });
    
    // Instructions courtes
    drawPixelText(ctx, "A:OK   B:RET", boxX + 8, boxY + boxHeight - 16, SCALE, 2);
}

// Système de shop
function openShop() {
    shop.active = true;
    shop.mode = 'buy';
    shop.selectedItem = 0;
    
    // Filtrer les objets vendables du joueur
    shop.playerItems = inventory.items.filter(item => item.sellPrice > 0);
}

function drawShop() {
    if (!shop.active) return;
    
    // Fond sombre
    ctx.fillStyle = 'rgba(15, 56, 15, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Boîte principale
    const boxWidth = 128; // RÉDUIT: De 144 à 128
    const boxHeight = 112; // RÉDUIT: De 128 à 112
    const boxX = Math.floor((SCREEN_WIDTH - boxWidth) / 2);
    const boxY = Math.floor((SCREEN_HEIGHT - boxHeight) / 2);
    
    // Dessiner le cadre avec les nouveaux sprites
    drawUIFrame(ctx, boxX, boxY, boxWidth, boxHeight, SCALE);
    
    // Titre et or du joueur
    const shopTitleWidth = measurePixelText("SHOP");
    drawPixelText(ctx, "SHOP", boxX + (boxWidth - shopTitleWidth) / 2, boxY + 6, SCALE, 3);
    
    const goldText = `$${player.gold}`; // Utiliser $ au lieu de OR
    drawPixelText(ctx, goldText, boxX + (boxWidth - measurePixelText(goldText)) / 2, boxY + 16, SCALE, 3);
    
    // Onglets Acheter/Vendre
    const tabY = boxY + 26;
    
    // Mode simple: juste du texte souligné pour l'onglet actif
    if (shop.mode === 'buy') {
        drawPixelText(ctx, "ACHAT", boxX + 20, tabY, SCALE, 3);
        // Ligne sous ACHAT
        ctx.fillStyle = COLORS[3];
        ctx.fillRect((boxX + 20) * SCALE, (tabY + 8) * SCALE, 45 * SCALE, SCALE);
        drawPixelText(ctx, "VENTE", boxX + 72, tabY, SCALE, 1);
    } else {
        drawPixelText(ctx, "ACHAT", boxX + 20, tabY, SCALE, 1);
        drawPixelText(ctx, "VENTE", boxX + 72, tabY, SCALE, 3);
        // Ligne sous VENTE
        ctx.fillStyle = COLORS[3];
        ctx.fillRect((boxX + 72) * SCALE, (tabY + 8) * SCALE, 45 * SCALE, SCALE);
    }
    
    // Liste des objets
    const listY = boxY + 40;
    const items = shop.mode === 'buy' ? shop.shopInventory : shop.playerItems;
    
    if (items.length === 0) {
        drawPixelText(ctx, "RIEN", boxX + (boxWidth - measurePixelText("RIEN")) / 2, listY + 20, SCALE, 2);
    } else {
        const maxVisible = 4; // Réduit de 5 à 4
        const scrollOffset = Math.max(0, shop.selectedItem - maxVisible + 1);
        
        for (let i = 0; i < Math.min(maxVisible, items.length); i++) {
            const index = i + scrollOffset;
            if (index >= items.length) break;
            
            const item = shop.mode === 'buy' ? itemTypes[items[index]] : items[index];
            const itemY = listY + i * 12;
            
            // Surbrillance
            if (index === shop.selectedItem) {
                ctx.fillStyle = COLORS[2];
                ctx.fillRect((boxX + 8) * SCALE, (itemY - 4) * SCALE, (boxWidth - 16) * SCALE, 10 * SCALE);
            }
            
            // Nom de l'objet (abrégé à 8 caractères)
            const textColor = index === shop.selectedItem ? 0 : 3;
            const shortName = item.name.toUpperCase().substring(0, 8);
            drawPixelText(ctx, shortName, boxX + 12, itemY - 2, SCALE, textColor);
            
            // Prix avec $
            const price = shop.mode === 'buy' ? item.buyPrice : item.sellPrice;
            const canAfford = shop.mode === 'buy' ? player.gold >= price : true;
            const priceColor = canAfford ? (index === shop.selectedItem ? 0 : 3) : 1;
            const priceText = `$${price}`;
            drawPixelText(ctx, priceText, boxX + boxWidth - 12 - measurePixelText(priceText), itemY - 2, SCALE, priceColor);
        }
        
        // Indicateur de scroll si nécessaire
        if (items.length > maxVisible) {
            const scrollPos = Math.floor((scrollOffset / (items.length - maxVisible)) * 3);
            for (let i = 0; i < 4; i++) {
                const color = i === scrollPos ? 3 : 1;
                ctx.fillStyle = COLORS[color];
                ctx.fillRect((boxX + boxWidth - 6) * SCALE, (listY + i * 10) * SCALE, 2 * SCALE, 8 * SCALE);
            }
        }
    }
    
    // Instructions simplifiées
    drawPixelText(ctx, "A:OK B:SORTIR", boxX + 8, boxY + boxHeight - 2, SCALE, 2);
}

function buyItem(itemKey) {
    const item = itemTypes[itemKey];
    if (player.gold >= item.buyPrice) {
        if (inventory.items.length < inventory.maxSize) {
            player.gold -= item.buyPrice;
            addToInventory(itemKey);
            startDialogue(`+${item.name}!`); // Message ultra court
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
        startDialogue(`+$${item.sellPrice}!`); // Message court
        shop.playerItems = inventory.items.filter(item => item.sellPrice > 0);
        if (shop.playerItems.length === 0) {
            shop.mode = 'buy';
            shop.selectedItem = 0;
        } else if (shop.selectedItem >= shop.playerItems.length) {
            shop.selectedItem = shop.playerItems.length - 1;
        }
    }
}

// Dessiner le menu principal - VERSION MODIFIÉE AVEC CADRE AGRANDI
function drawMainMenu() {
    // Fond noir
    ctx.fillStyle = COLORS[3];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Animation du titre
    mainMenu.animationFrame++;
    const titleY = 20 + Math.sin(mainMenu.animationFrame * 0.02) * 3;
    
    // Titre du jeu
    drawPixelText(ctx, "GAME BOY", (SCREEN_WIDTH - measurePixelText("GAME BOY")) / 2, titleY, SCALE, 0);
    drawPixelText(ctx, "ENGINE", (SCREEN_WIDTH - measurePixelText("ENGINE")) / 2, titleY + 18, SCALE, 0);
    
    // Sous-titre plus court
    drawPixelText(ctx, "~ PROTO RPG ~", (SCREEN_WIDTH - measurePixelText("~ PROTO RPG ~")) / 2, titleY + 30, SCALE, 1);
    
    if (mainMenu.showingCredits) {
        // Afficher les crédits dans un cadre
        const creditsWidth = 112;
        const creditsHeight = 48;
        const creditsX = Math.floor((SCREEN_WIDTH - creditsWidth) / 2);
        const creditsY = 70;
        
        drawUIFrame(ctx, creditsX, creditsY, creditsWidth, creditsHeight, SCALE);
        
        drawPixelText(ctx, "BY CLAUDE", creditsX + (creditsWidth - measurePixelText("BY CLAUDE")) / 2, creditsY + 12, SCALE, 3);
        drawPixelText(ctx, "HTML5 GB", creditsX + (creditsWidth - measurePixelText("HTML5 GB")) / 2, creditsY + 22, SCALE, 3);
        drawPixelText(ctx, "B: RETOUR", creditsX + (creditsWidth - measurePixelText("B: RETOUR")) / 2, creditsY + 36, SCALE, 2);
    } else {
        // Menu principal
        const menuY = 65; // Légèrement remonté pour compenser la hauteur supplémentaire
        const menuWidth = 112;
        const menuHeight = 72; // AUGMENTÉ de 56 à 72 pixels (+1 tile de 16 pixels)
        const menuX = Math.floor((SCREEN_WIDTH - menuWidth) / 2);
        
        // Boîte du menu avec cadre
        drawUIFrame(ctx, menuX, menuY, menuWidth, menuHeight, SCALE);
        
        // Options du menu (texte court)
        const shortLabels = ["NOUVEAU", "CHARGER", "OPTIONS", "CREDITS"];
        
        // Calcul du centrage vertical des options dans le cadre agrandi
        const optionsAreaHeight = mainMenu.options.length * 10 + (mainMenu.options.length - 1) * 2; // hauteur totale des options avec espacement
        const optionsStartY = menuY + Math.floor((menuHeight - optionsAreaHeight) / 2); // centrage vertical
        
        mainMenu.options.forEach((option, index) => {
            const optionY = optionsStartY + (index * 12); // Espacement légèrement augmenté (10 -> 12)
            
            // Surbrillance
            if (index === mainMenu.selectedOption) {
                ctx.fillStyle = COLORS[2];
                ctx.fillRect((menuX + 8) * SCALE, (optionY - 5) * SCALE, (menuWidth - 16) * SCALE, 10 * SCALE);
            }
            
            const textColor = index === mainMenu.selectedOption ? 0 : 3;
            const optionWidth = measurePixelText(shortLabels[index]);
            drawPixelText(ctx, shortLabels[index], menuX + (menuWidth - optionWidth) / 2, optionY - 4, SCALE, textColor);
            
            // Optionnel : Ajouter un petit indicateur ">" pour l'option sélectionnée
            if (index === mainMenu.selectedOption) {
                drawPixelText(ctx, ">", menuX + 12, optionY - 4, SCALE, textColor);
                drawPixelText(ctx, "<", menuX + menuWidth - 18, optionY - 4, SCALE, textColor);
            }
        });
        
        // Instructions courtes
        drawPixelText(ctx, "A: OK", (SCREEN_WIDTH - measurePixelText("A: OK")) / 2, SCREEN_HEIGHT - 12, SCALE, 2);
    }
    
    // Version
    drawPixelText(ctx, "V1.0", SCREEN_WIDTH - 24, SCREEN_HEIGHT - 10, SCALE, 1);
}

// Gérer les actions du menu principal
function handleMainMenuAction(action) {
    switch(action) {
        case 'new':
            // Nouvelle partie
            startNewGame();
            break;
        case 'load':
            // Ouvrir le menu de chargement
            if (saveGame.exists(1) || saveGame.exists(2) || saveGame.exists(3)) {
                mainMenu.selectedOption = 0;
                showSaveMenu('load');
                saveMenu.fromMainMenu = true;
            } else {
                startDialogue("PAS DE SAVE!"); // Message court
            }
            break;
        case 'options':
            startDialogue("BIENTOT!"); // Message court
            break;
        case 'credits':
            mainMenu.showingCredits = true;
            break;
    }
}
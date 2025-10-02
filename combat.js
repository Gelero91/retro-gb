// Système de combat
function startBattle(enemyType, npc) {
    battle.active = true;
    battle.enemy = { ...enemyTypes[enemyType] };
    // Ajouter le sprite ici car NPC_SPRITES est maintenant chargé
    battle.enemy.sprite = NPC_SPRITES[enemyType];
    battle.enemyNPC = npc; // Stocker la référence au PNJ
    battle.playerTurn = true;
    battle.selectedAction = 0;
    battle.message = `UN ${battle.enemy.name.toUpperCase()}\nAPPARAIT!`;
    battle.messageTimer = 60;
    battle.magicMenuActive = false;
    battle.particleEffects = [];
    
    // Réinitialiser les cooldowns au début du combat
    Object.values(player.skills).forEach(skill => {
        skill.cooldown = 0;
    });
    player.buffs.shield = 0;
}

function calculateDamage(attacker, defender, isDefending = false) {
    const baseDamage = Math.max(1, attacker.attack - defender.defense);
    const variance = Math.floor(Math.random() * 3) - 1; // -1 à +1
    let damage = baseDamage + variance;
    
    if (isDefending) {
        damage = Math.floor(damage / 2);
    }
    
    // Appliquer le buff de bouclier si actif
    if (defender === player && player.buffs.shield > 0) {
        damage = Math.max(1, damage - player.skills.shield.defense);
    }
    
    return Math.max(1, damage);
}

function playerAttack() {
    const damage = calculateDamage(player, battle.enemy);
    battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
    battle.message = `ATTAQUE!\n-${damage} DMG`;
    battle.flashTimer = 10;
    battle.messageTimer = 60;
    
    if (battle.enemy.hp <= 0) {
        // L'ennemi est vaincu, désactiver les actions
        battle.playerTurn = false;
        battle.animating = true;
        setTimeout(() => endBattle(true), 1500);
    } else {
        battle.playerTurn = false;
        endTurnEffects();
        setTimeout(() => enemyTurn(), 1500);
    }
}

function useMagic(skillKey) {
    const skill = player.skills[skillKey];
    
    if (player.mp < skill.mpCost) {
        battle.message = "PAS ASSEZ\nDE PM!";
        battle.messageTimer = 60;
        return;
    }
    
    if (skill.cooldown > 0) {
        battle.message = `${skill.name.toUpperCase()}\nRECHARGE: ${skill.cooldown}`;
        battle.messageTimer = 60;
        return;
    }
    
    player.mp -= skill.mpCost;
    skill.cooldown = skill.maxCooldown;
    
    switch(skillKey) {
        case 'fireball':
            // Animation de boule de feu
            createFireballEffect();
            const fireballDamage = skill.damage + Math.floor(Math.random() * 3);
            battle.enemy.hp = Math.max(0, battle.enemy.hp - fireballDamage);
            battle.message = `BOULE DE FEU!\n-${fireballDamage} DMG`;
            battle.flashTimer = 15;
            
            if (battle.enemy.hp <= 0) {
                battle.playerTurn = false;
                battle.animating = true;
                setTimeout(() => endBattle(true), 1500);
            } else {
                battle.playerTurn = false;
                endTurnEffects();
                setTimeout(() => enemyTurn(), 1500);
            }
            break;
            
        case 'shield':
            // Activer le bouclier
            player.buffs.shield = skill.duration;
            createShieldEffect();
            battle.message = `BOUCLIER ACTIF!\n+${skill.duration} TOURS`;
            battle.playerTurn = false;
            endTurnEffects();
            setTimeout(() => enemyTurn(), 1500);
            break;
            
        case 'heal':
            // Soin
            const healed = Math.min(skill.healing, player.maxHp - player.hp);
            player.hp += healed;
            createHealEffect();
            battle.message = `SOIN LANCE!\n+${healed} PV`;
            battle.playerTurn = false;
            endTurnEffects();
            setTimeout(() => enemyTurn(), 1500);
            break;
    }
    
    battle.messageTimer = 60;
    battle.magicMenuActive = false;
}

function endTurnEffects() {
    // Réduire les cooldowns
    Object.values(player.skills).forEach(skill => {
        if (skill.cooldown > 0) skill.cooldown--;
    });
    
    // Réduire la durée des buffs
    if (player.buffs.shield > 0) {
        player.buffs.shield--;
        // Message de fin de bouclier supprimé pour éviter la surcharge
    }
    
    // Régénération MP (1 MP par tour)
    if (player.mp < player.maxMp) {
        player.mp = Math.min(player.mp + 1, player.maxMp);
    }
}

// Effets visuels pour la magie
function createFireballEffect() {
    for (let i = 0; i < 8; i++) {
        battle.particleEffects.push({
            x: 80 + Math.random() * 20 - 10,
            y: 40 + Math.random() * 20 - 10,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 2 - 3,
            life: 20 + Math.random() * 10,
            color: Math.random() > 0.5 ? 2 : 3
        });
    }
}

function createShieldEffect() {
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        battle.particleEffects.push({
            x: 80 + Math.cos(angle) * 20,
            y: 100 + Math.sin(angle) * 20,
            vx: 0,
            vy: -0.5,
            life: 30,
            color: 1
        });
    }
}

function createHealEffect() {
    for (let i = 0; i < 6; i++) {
        battle.particleEffects.push({
            x: 80 + Math.random() * 16 - 8,
            y: 110,
            vx: 0,
            vy: -1 - Math.random(),
            life: 40,
            color: 0
        });
    }
}

function updateParticles() {
    battle.particleEffects = battle.particleEffects.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        return particle.life > 0;
    });
}

function enemyTurn() {
    if (!battle.active || battle.enemy.hp <= 0) return;
    
    const damage = calculateDamage(battle.enemy, player);
    player.hp = Math.max(0, player.hp - damage);
    battle.message = `${battle.enemy.name.toUpperCase()}\nATTAQUE! -${damage}`;
    battle.shakeTimer = 10;
    battle.messageTimer = 60;
    
    if (player.hp <= 0) {
        // Le joueur est vaincu, désactiver les actions
        battle.playerTurn = false;
        battle.animating = true;
        setTimeout(() => endBattle(false), 1500);
    } else {
        battle.playerTurn = true;
    }
}

function endBattle(victory) {
    battle.animating = true; // Bloquer toute action
    
    if (victory) {
        player.exp += battle.enemy.exp;
        player.gold += battle.enemy.gold;
        battle.message = `VICTOIRE!\n+${battle.enemy.exp}EXP +$${battle.enemy.gold}`;
        battle.messageTimer = 120;
        
        // Retirer l'ennemi vaincu de la carte
        if (battle.enemyNPC) {
            const index = npcs.indexOf(battle.enemyNPC);
            if (index > -1) {
                npcs.splice(index, 1);
            }
        }
        
        // Vérifier montée de niveau
        if (player.exp >= player.expToNext) {
            player.level++;
            player.exp -= player.expToNext;
            player.expToNext = player.level * 10;
            player.maxHp += 5;
            player.hp = player.maxHp;
            player.maxMp += 3;
            player.mp = player.maxMp;
            player.attack += 2;
            player.defense += 1;
            
            setTimeout(() => {
                battle.message = `NIVEAU UP!\nNIVEAU ${player.level}`;
                battle.messageTimer = 120;
            }, 2500);
            
            // Attendre plus longtemps avant de fermer
            setTimeout(() => {
                battle.active = false;
                battle.enemy = null;
                battle.enemyNPC = null;
                battle.animating = false;
            }, 5000);
        } else {
            // Fermer le combat après le message de victoire
            setTimeout(() => {
                battle.active = false;
                battle.enemy = null;
                battle.enemyNPC = null;
                battle.animating = false;
            }, 3000);
        }
    } else {
        battle.message = "DEFAITE...\nRESPAWN";
        battle.messageTimer = 120;
        
        // Respawn avec moitié des HP
        player.hp = Math.floor(player.maxHp / 2);
        
        setTimeout(() => {
            battle.active = false;
            battle.enemy = null;
            battle.enemyNPC = null;
            battle.animating = false;
        }, 3000);
    }
}

function checkEnemyCollision(x, y) {
    // Vérifier s'il y a un ennemi à cette position
    const enemy = npcs.find(n => n.x === x && n.y === y && n.enemy);
    if (enemy && !battle.active) {
        startBattle(enemy.type, enemy);
        return true;
    }
    return false;
}

// Fonction de rendu du combat
function drawBattle() {
    if (!battle.active) return;
    
    // Fond noir
    ctx.fillStyle = COLORS[3];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Zone de combat
    const battleWidth = SCREEN_WIDTH - 16;
    const battleHeight = SCREEN_HEIGHT - 16;
    const battleX = 8;
    const battleY = 8;
    
    // Dessiner le cadre de combat avec les nouveaux sprites
    drawUIFrame(ctx, battleX, battleY, battleWidth, battleHeight, SCALE);
    
    // Effet de shake
    const shakeX = battle.shakeTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
    const shakeY = battle.shakeTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
    if (battle.shakeTimer > 0) battle.shakeTimer--;
    
    // Mettre à jour et dessiner les particules
    updateParticles();
    battle.particleEffects.forEach(particle => {
        ctx.fillStyle = COLORS[particle.color];
        ctx.fillRect(
            particle.x * SCALE - 2 * SCALE,
            particle.y * SCALE - 2 * SCALE,
            4 * SCALE,
            4 * SCALE
        );
    });
    
    // Ennemi (en haut)
    if (battle.enemy) {
        const enemyX = battleX + battleWidth / 2 - 8;
        const enemyY = battleY + 32;
        
        // Nom de l'ennemi EN HAUT
        const enemyName = battle.enemy.name.substring(0, 8).toUpperCase();
        drawPixelText(ctx, enemyName, battleX + battleWidth / 2 - measurePixelText(enemyName) / 2, enemyY - 20, SCALE, 3);
        
        // Barre de vie ENTRE LE NOM ET LE SPRITE
        drawHealthBar(enemyX - 8, enemyY - 8, battle.enemy.hp, battle.enemy.maxHp, 32);
        
        // Flash effect
        if (battle.flashTimer > 0) {
            ctx.globalAlpha = battle.flashTimer % 2 === 0 ? 0.5 : 1;
            battle.flashTimer--;
        }
        
        // Sprite de l'ennemi EN BAS
        drawTileAtPosition(battle.enemy.sprite, enemyX, enemyY);
        ctx.globalAlpha = 1;
    }
    
    // Joueur (position parfaite)
    const playerX = battleX + battleWidth / 2 - 8 + shakeX;
    const playerY = battleY + battleHeight - 72 + shakeY;
    
    // Utiliser le sprite du joueur de dos pour le combat
    const playerSprite = PLAYER_SPRITES['up'] || PLAYER_SPRITE;
    drawTileAtPosition(playerSprite, playerX, playerY);
    
    // Indicateur de bouclier si actif
    if (player.buffs.shield > 0) {
        ctx.strokeStyle = COLORS[1];
        ctx.lineWidth = 2 * SCALE;
        ctx.strokeRect(
            (playerX - 2) * SCALE,
            (playerY - 2) * SCALE,
            20 * SCALE,
            20 * SCALE
        );
    }
    
    // POSITION COMMUNE POUR LES CADRES DU BAS
    const BOTTOM_Y = battleY + battleHeight - 64 - 8 + 16;
    
    // Stats du joueur dans un cadre
    const statsWidth = 80;
    const statsHeight = 64;
    const statsX = 0;
    const statsY = BOTTOM_Y;
    
    // Cadre pour les stats
    drawUIFrame(ctx, statsX, statsY, statsWidth, statsHeight, SCALE);
    
    // Contenu avec plus d'espace vertical
    drawPixelText(ctx, `N${player.level}`, statsX + (statsWidth - measurePixelText(`N${player.level}`)) / 2, statsY + 8, SCALE, 3);
    
    // Barres centrées avec plus d'espace
    const barWidth = 56;
    const barX = statsX + (statsWidth - barWidth) / 2;
    
    // Barre de vie
    drawHealthBar(barX, statsY + 20, player.hp, player.maxHp, barWidth);
    const hpText = `${player.hp}/${player.maxHp}`;
    drawPixelText(ctx, hpText, statsX + (statsWidth - measurePixelText(hpText)) / 2, statsY + 28, SCALE, 3);
    
    // Barre de magie
    drawMagicBar(barX, statsY + 40, player.mp, player.maxMp, barWidth);
    const mpText = `${player.mp}/${player.maxMp}`;
    drawPixelText(ctx, mpText, statsX + (statsWidth - measurePixelText(mpText)) / 2, statsY + 48, SCALE, 3);
    
    // Menu d'actions ou menu de magie
    if (battle.playerTurn && !battle.animating && battle.messageTimer <= 0 && 
        battle.enemy.hp > 0 && player.hp > 0) {
        
        if (battle.magicMenuActive) {
            // Menu de magie
            const magicWidth = 96;
            const magicHeight = 64;
            const magicX = SCREEN_WIDTH - magicWidth;
            const magicY = BOTTOM_Y;
            
            drawUIFrame(ctx, magicX, magicY, magicWidth, magicHeight, SCALE);
            
            // Plus d'espace pour les options
            const magicNames = ["FEU", "GARDE", "SOIN"];
            battle.magicOptions.forEach((magic, index) => {
                const skill = player.skills[magic];
                const magicOptionY = magicY + 12 + index * 14;
                const isDisabled = player.mp < skill.mpCost || skill.cooldown > 0;
                
                if (index === battle.selectedMagic && !isDisabled) {
                    ctx.fillStyle = COLORS[2];
                    ctx.fillRect((magicX + 4) * SCALE, (magicOptionY - 2) * SCALE, (magicWidth - 8) * SCALE, 10 * SCALE);
                }
                
                const textColor = isDisabled ? 1 : (index === battle.selectedMagic && !isDisabled ? 0 : 3);
                let text = `${magicNames[index]} ${skill.mpCost}`;
                if (skill.cooldown > 0) text += `(${skill.cooldown})`;
                
                // Centrer le texte
                const textWidth = measurePixelText(text);
                drawPixelText(ctx, text, magicX + (magicWidth - textWidth) / 2, magicOptionY, SCALE, textColor);
            });
            
        } else {
            // Menu d'actions principal
            const menuWidth = 80;
            const menuHeight = 64;
            const menuX = SCREEN_WIDTH - menuWidth;
            const menuY = BOTTOM_Y;
            
            drawUIFrame(ctx, menuX, menuY, menuWidth, menuHeight, SCALE);
            
            // Actions avec plus d'espace vertical
            const shortActions = ["ATQ", "MAGIE", "DEF", "FUITE"];
            shortActions.forEach((action, index) => {
                const actionY = menuY + 12 + index * 12;
                if (index === battle.selectedAction) {
                    ctx.fillStyle = COLORS[2];
                    ctx.fillRect((menuX + 5) * SCALE, (actionY - 2) * SCALE, (menuWidth - 9) * SCALE, 10 * SCALE);
                }
                const textColor = index === battle.selectedAction ? 0 : 3;
                
                // Centrer le texte
                const textWidth = measurePixelText(action);
                drawPixelText(ctx, action, menuX + (menuWidth - textWidth) / 2, actionY, SCALE, textColor);
            });
        }
    }
    
    // Message qui remplace EXACTEMENT les cadres stats + actions
    if (battle.message && battle.messageTimer > 0) {
        // Le message prend toute la largeur du bas (stats + actions)
        const msgWidth = SCREEN_WIDTH; // Toute la largeur
        const msgHeight = 64; // Même hauteur que les cadres
        const msgX = 0;
        const msgY = BOTTOM_Y;
        
        // Un seul grand cadre qui remplace les deux cadres
        drawUIFrame(ctx, msgX, msgY, msgWidth, msgHeight, SCALE);
        
        // Gérer le saut de ligne manuel avec \n
        const msgText = battle.message.toUpperCase();
        const lines = msgText.split('\n');
        
        if (lines.length === 2) {
            // Deux lignes explicites, bien centrées verticalement
            const line1Width = measurePixelText(lines[0]);
            const line2Width = measurePixelText(lines[1]);
            drawPixelText(ctx, lines[0], msgX + (msgWidth - line1Width) / 2, msgY + 18, SCALE, 3);
            drawPixelText(ctx, lines[1], msgX + (msgWidth - line2Width) / 2, msgY + 36, SCALE, 3);
        } else if (lines.length === 1) {
            // Une seule ligne ou besoin de diviser automatiquement
            const words = msgText.split(' ');
            let line1 = '';
            let line2 = '';
            
            // Répartir les mots sur deux lignes si nécessaire
            const maxLineWidth = msgWidth - 16;
            let currentLine = '';
            
            for (let word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                if (measurePixelText(testLine) <= maxLineWidth) {
                    currentLine = testLine;
                } else {
                    if (line1 === '') {
                        line1 = currentLine;
                        currentLine = word;
                    } else {
                        break; // Trop de texte, on arrête
                    }
                }
            }
            
            // Assigner la dernière ligne
            if (line1 === '') {
                line1 = currentLine;
            } else {
                line2 = currentLine;
            }
            
            // Afficher les lignes centrées avec plus d'espace
            if (line2) {
                const line1Width = measurePixelText(line1);
                const line2Width = measurePixelText(line2);
                drawPixelText(ctx, line1, msgX + (msgWidth - line1Width) / 2, msgY + 18, SCALE, 3);
                drawPixelText(ctx, line2, msgX + (msgWidth - line2Width) / 2, msgY + 36, SCALE, 3);
            } else {
                // Une seule ligne, centrée verticalement
                const lineWidth = measurePixelText(line1);
                drawPixelText(ctx, line1, msgX + (msgWidth - lineWidth) / 2, msgY + 27, SCALE, 3);
            }
        }
        
        battle.messageTimer--;
    }
}

function drawMagicBar(x, y, current, max, width) {
    const height = 4;
    const fillWidth = Math.floor((current / max) * width);
    
    // Fond
    ctx.fillStyle = COLORS[3];
    ctx.fillRect(x * SCALE, y * SCALE, width * SCALE, height * SCALE);
    
    // Remplissage (bleu en nuances de gris)
    ctx.fillStyle = COLORS[1];
    ctx.fillRect(x * SCALE, y * SCALE, fillWidth * SCALE, height * SCALE);
}

function drawHealthBar(x, y, current, max, width) {
    const height = 4;
    const fillWidth = Math.floor((current / max) * width);
    
    // Fond
    ctx.fillStyle = COLORS[3];
    ctx.fillRect(x * SCALE, y * SCALE, width * SCALE, height * SCALE);
    
    // Remplissage
    if (current > max * 0.5) {
        ctx.fillStyle = COLORS[1]; // Gris clair
    } else if (current > max * 0.25) {
        ctx.fillStyle = COLORS[2]; // Gris foncé
    } else {
        ctx.fillStyle = COLORS[3]; // Noir (critique)
    }
    
    ctx.fillRect(x * SCALE, y * SCALE, fillWidth * SCALE, height * SCALE);
}

// Fonction modifiée pour gérer la transparence
function drawTileAtPosition(tileData, x, y) {
    for (let row = 0; row < TILE_SIZE; row++) {
        for (let col = 0; col < TILE_SIZE; col++) {
            const colorIndex = tileData[row][col];
            // IMPORTANT: Ignorer les pixels transparents
            if (colorIndex === -1 || colorIndex === TRANSPARENT) {
                continue; // Ne pas dessiner ce pixel
            }
            ctx.fillStyle = COLORS[colorIndex];
            ctx.fillRect(
                (x + col) * SCALE,
                (y + row) * SCALE,
                SCALE,
                SCALE
            );
        }
    }
}
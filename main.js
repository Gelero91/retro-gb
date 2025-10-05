// Configuration du canvas
canvas = document.getElementById('gameCanvas');
ctx = canvas.getContext('2d');
canvas.width = SCREEN_WIDTH * SCALE;
canvas.height = SCREEN_HEIGHT * SCALE;
ctx.imageSmoothingEnabled = false;

// Boucle de jeu
function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}

// Initialisation
// Initialiser le système de cartes
initMaps();

if (!START_WITH_MENU) {
    // Démarrage direct en jeu
    loadNPCs();
    // Ajouter des objets de départ
    addToInventory('potion');
    addToInventory('sword');
    
    // Initialiser les puzzles de la carte 3
    if (maps[3] && maps[3].puzzle) {
        const puzzleKey = `${3}-switches`;
        puzzles.sequences[puzzleKey] = [];
    }
    
    // Vérifier si une sauvegarde automatique existe
    if (saveExists(0)) {
        const info = getSaveInfo(0);
        if (info && confirm(`Sauvegarde automatique trouvée (${info.date}). Voulez-vous la charger ?`)) {
            loadGame(0);
        }
    }
}
// Si START_WITH_MENU est true, le jeu démarre sur le menu principal

// Sauvegarde automatique toutes les 5 minutes
setInterval(() => {
    if (gameState === 'playing' && !battle.active && !dialogue.active && !menu.active && !inventoryUI.active && !saveMenu.active) {
        saveGame(0); // Slot 0 pour la sauvegarde auto
    }
}, 300000); // 5 minutes

// Démarrer la boucle de jeu
gameLoop();
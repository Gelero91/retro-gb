

        // Types de PNJ disponibles
        const NPC_TYPES = {
            oldMan: { name: "Vieil homme", mobile: false },
            merchant: { name: "Marchand", mobile: false, merchant: true },
            cat: { name: "Chat", mobile: true },
            bird: { name: "Oiseau", mobile: true },
            guard: { name: "Garde", mobile: false },
            slime: { name: "Slime", mobile: true, enemy: true },
            goblin: { name: "Gobelin", mobile: true, enemy: true }
        };
        
        // Ã‰tat de l'Ã©diteur
        const editor = {
            canvas: null,
            ctx: null,
            currentTool: 'brush',
            selectedTile: 0,
            mapWidth: DEFAULT_WIDTH,
            mapHeight: DEFAULT_HEIGHT,
            mapData: [],
            doors: {},
            npcs: [],
            showGrid: true,
            gridOpacity: 30,
            zoom: 1,
            isDrawing: false,
            rectStart: null,
            history: [],
            historyIndex: -1,
            maxHistory: 50,
            isDragging: false,
            dragStart: { x: 0, y: 0 },
            scrollOffset: { x: 0, y: 0 }
        };
        
        // Carte de test par dÃ©faut
        const DEFAULT_MAP = {
            id: 99,
            name: "Carte de Test",
            tiles: [
                [1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,0,2,2,0,0,3,0,0,1],
                [1,0,2,2,0,0,0,0,0,1],
                [1,0,0,0,0,5,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,0,7,0,10,0,0,8,0,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,1],
                [1,1,1,1,4,4,1,1,1,1]
            ],
            doors: {
                "4,9": { targetMap: 0, targetX: 5, targetY: 2 },
                "5,9": { targetMap: 0, targetX: 6, targetY: 2 }
            },
            npcs: [
                { type: 'oldMan', x: 5, y: 5, mobile: false },
                { type: 'cat', x: 7, y: 3, mobile: true }
            ]
        };
        
        // Initialisation
        function init() {
            editor.canvas = document.getElementById('editor-canvas');
            editor.ctx = editor.canvas.getContext('2d');
            editor.ctx.imageSmoothingEnabled = false;
            
            // CrÃ©er la palette de tuiles
            createTilePalette();
            
            // Initialiser la carte
            initMap(DEFAULT_WIDTH, DEFAULT_HEIGHT);
            
            // Attacher les Ã©vÃ©nements
            attachEventListeners();
            
            // Dessiner la premiÃ¨re frame
            render();
            
            // Sauvegarder l'Ã©tat initial dans l'historique
            saveHistory();
            
            showStatus("Ã‰diteur prÃªt !");
        }
        
        // CrÃ©er la palette de tuiles
        function createTilePalette() {
            const tilesGrid = document.getElementById('tiles-grid');
            
            Object.keys(TILES).forEach(tileId => {
                const tileData = TILES[tileId];
                const button = document.createElement('div');
                button.className = 'tile-button';
                button.dataset.tileId = tileId;
                
                // CrÃ©er un canvas pour afficher la tuile
                const canvas = document.createElement('canvas');
                canvas.width = TILE_SIZE;
                canvas.height = TILE_SIZE;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                
                // Dessiner la tuile
                drawTilePattern(ctx, tileData.pattern, 0, 0, 1);
                
                button.appendChild(canvas);
                
                // Ajouter le label
                const label = document.createElement('div');
                label.className = 'tile-label';
                label.textContent = tileId;
                button.appendChild(label);
                
                // SÃ©lectionner la premiÃ¨re tuile par dÃ©faut
                if (tileId == 0) {
                    button.classList.add('selected');
                }
                
                // Ã‰vÃ©nement de clic
                button.addEventListener('click', () => selectTile(tileId));
                
                tilesGrid.appendChild(button);
            });
        }
        
        // Dessiner un pattern de tuile
        function drawTilePattern(ctx, pattern, x, y, scale = 1) {
            for (let row = 0; row < TILE_SIZE; row++) {
                for (let col = 0; col < TILE_SIZE; col++) {
                    const colorIndex = pattern[row][col];
                    ctx.fillStyle = COLORS[colorIndex];
                    ctx.fillRect(
                        x + col * scale,
                        y + row * scale,
                        scale,
                        scale
                    );
                }
            }
        }
        
        // SÃ©lectionner une tuile
        function selectTile(tileId) {
            editor.selectedTile = parseInt(tileId);
            
            // Mettre Ã  jour l'UI
            document.querySelectorAll('.tile-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            document.querySelector(`[data-tile-id="${tileId}"]`).classList.add('selected');
            
            // Mettre Ã  jour l'info
            document.getElementById('selected-tile').textContent = `Tuile: ${tileId} (${TILES[tileId].name})`;
        }
        
        // SÃ©lectionner un outil
        function selectTool(tool) {
            editor.currentTool = tool;
            
            // Mettre Ã  jour l'UI
            document.querySelectorAll('.tool-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            document.querySelector(`[data-tool="${tool}"]`).classList.add('selected');
            
            // Changer le curseur
            updateCursor();
        }
        
        // Mettre Ã  jour le curseur
        function updateCursor() {
            const canvas = editor.canvas;
            switch(editor.currentTool) {
                case 'brush':
                    canvas.style.cursor = 'crosshair';
                    break;
                case 'eraser':
                    canvas.style.cursor = 'grab';
                    break;
                case 'fill':
                    canvas.style.cursor = 'cell';
                    break;
                case 'picker':
                    canvas.style.cursor = 'help';
                    break;
                case 'door':
                    canvas.style.cursor = 'pointer';
                    break;
                default:
                    canvas.style.cursor = 'crosshair';
            }
        }
        
        // Initialiser la carte
        function initMap(width, height) {
            editor.mapWidth = width;
            editor.mapHeight = height;
            editor.mapData = [];
            
            // CrÃ©er une carte vide
            for (let y = 0; y < height; y++) {
                const row = [];
                for (let x = 0; x < width; x++) {
                    // Bordures en murs, reste en sol
                    if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                        row.push(1);
                    } else {
                        row.push(0);
                    }
                }
                editor.mapData.push(row);
            }
            
            // Redimensionner le canvas
            updateCanvasSize();
            
            // Mettre Ã  jour l'info
            document.getElementById('map-size').textContent = `Taille: ${width}x${height}`;
            document.getElementById('map-width').value = width;
            document.getElementById('map-height').value = height;
        }
        
        // Mettre Ã  jour la taille du canvas
        function updateCanvasSize() {
            const scale = 2 * editor.zoom;
            editor.canvas.width = editor.mapWidth * TILE_SIZE * scale;
            editor.canvas.height = editor.mapHeight * TILE_SIZE * scale;
            editor.ctx.imageSmoothingEnabled = false;
        }
        
        // Dessiner la carte
        function render() {
            const ctx = editor.ctx;
            const scale = 2 * editor.zoom;
            
            // Effacer le canvas
            ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
            
            // Dessiner les tuiles
            for (let y = 0; y < editor.mapHeight; y++) {
                for (let x = 0; x < editor.mapWidth; x++) {
                    const tileId = editor.mapData[y][x];
                    const tileData = TILES[tileId];
                    if (tileData) {
                        drawTilePattern(
                            ctx,
                            tileData.pattern,
                            x * TILE_SIZE * scale,
                            y * TILE_SIZE * scale,
                            scale
                        );
                    }
                }
            }
            
            // Dessiner la grille
            if (editor.showGrid) {
                ctx.strokeStyle = `rgba(0, 0, 0, ${editor.gridOpacity / 100})`;
                ctx.lineWidth = 1;
                
                for (let x = 0; x <= editor.mapWidth; x++) {
                    ctx.beginPath();
                    ctx.moveTo(x * TILE_SIZE * scale, 0);
                    ctx.lineTo(x * TILE_SIZE * scale, editor.mapHeight * TILE_SIZE * scale);
                    ctx.stroke();
                }
                
                for (let y = 0; y <= editor.mapHeight; y++) {
                    ctx.beginPath();
                    ctx.moveTo(0, y * TILE_SIZE * scale);
                    ctx.lineTo(editor.mapWidth * TILE_SIZE * scale, y * TILE_SIZE * scale);
                    ctx.stroke();
                }
            }
            
            // Dessiner les indicateurs de portes
            Object.keys(editor.doors).forEach(doorKey => {
                const [x, y] = doorKey.split(',').map(Number);
                if (editor.mapData[y] && editor.mapData[y][x] === 4) { // Si c'est toujours une porte
                    ctx.strokeStyle = '#FF0000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(
                        x * TILE_SIZE * scale + 2,
                        y * TILE_SIZE * scale + 2,
                        TILE_SIZE * scale - 4,
                        TILE_SIZE * scale - 4
                    );
                }
            });
            
            // Dessiner les PNJ
            editor.npcs.forEach((npc, index) => {
                ctx.fillStyle = npc.enemy ? '#FF0000' : '#00FF00';
                ctx.font = `${10 * scale}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(
                    npc.enemy ? 'E' : 'N',
                    npc.x * TILE_SIZE * scale + (TILE_SIZE * scale / 2),
                    npc.y * TILE_SIZE * scale + (TILE_SIZE * scale / 2)
                );
            });
        }
        
        // Obtenir les coordonnÃ©es de la tuile
        function getTileCoords(e) {
            const rect = editor.canvas.getBoundingClientRect();
            const scale = 2 * editor.zoom;
            const x = Math.floor((e.clientX - rect.left) / (TILE_SIZE * scale));
            const y = Math.floor((e.clientY - rect.top) / (TILE_SIZE * scale));
            return { x, y };
        }
        
        // Placer une tuile
        function placeTile(x, y) {
            if (x >= 0 && x < editor.mapWidth && y >= 0 && y < editor.mapHeight) {
                if (editor.mapData[y][x] !== editor.selectedTile) {
                    editor.mapData[y][x] = editor.selectedTile;
                    return true;
                }
            }
            return false;
        }
        
        // Effacer une tuile
        function eraseTile(x, y) {
            if (x >= 0 && x < editor.mapWidth && y >= 0 && y < editor.mapHeight) {
                if (editor.mapData[y][x] !== 0) {
                    editor.mapData[y][x] = 0;
                    return true;
                }
            }
            return false;
        }
        
        // Remplir une zone (flood fill)
        function fillArea(x, y) {
            if (x < 0 || x >= editor.mapWidth || y < 0 || y >= editor.mapHeight) {
                return;
            }
            
            const targetTile = editor.mapData[y][x];
            if (targetTile === editor.selectedTile) {
                return;
            }
            
            const toFill = [[x, y]];
            const filled = new Set();
            
            while (toFill.length > 0) {
                const [fx, fy] = toFill.pop();
                const key = `${fx},${fy}`;
                
                if (filled.has(key)) continue;
                if (fx < 0 || fx >= editor.mapWidth || fy < 0 || fy >= editor.mapHeight) continue;
                if (editor.mapData[fy][fx] !== targetTile) continue;
                
                editor.mapData[fy][fx] = editor.selectedTile;
                filled.add(key);
                
                toFill.push([fx + 1, fy]);
                toFill.push([fx - 1, fy]);
                toFill.push([fx, fy + 1]);
                toFill.push([fx, fy - 1]);
            }
        }
        
        // Dessiner un rectangle
        function drawRectangle(x1, y1, x2, y2) {
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    placeTile(x, y);
                }
            }
        }
        
        // Pipette
        function pickTile(x, y) {
            if (x >= 0 && x < editor.mapWidth && y >= 0 && y < editor.mapHeight) {
                selectTile(editor.mapData[y][x]);
                selectTool('brush');
            }
        }
        
        // GÃ©rer l'historique
        function saveHistory() {
            // Supprimer l'historique aprÃ¨s la position actuelle
            editor.history = editor.history.slice(0, editor.historyIndex + 1);
            
            // Ajouter l'Ã©tat actuel
            editor.history.push({
                mapData: JSON.parse(JSON.stringify(editor.mapData)),
                doors: JSON.parse(JSON.stringify(editor.doors)),
                npcs: JSON.parse(JSON.stringify(editor.npcs))
            });
            
            // Limiter la taille de l'historique
            if (editor.history.length > editor.maxHistory) {
                editor.history.shift();
            } else {
                editor.historyIndex++;
            }
            
            updateUndoRedoButtons();
        }
        
        function undo() {
            if (editor.historyIndex > 0) {
                editor.historyIndex--;
                const state = editor.history[editor.historyIndex];
                editor.mapData = JSON.parse(JSON.stringify(state.mapData));
                editor.doors = JSON.parse(JSON.stringify(state.doors));
                editor.npcs = JSON.parse(JSON.stringify(state.npcs));
                render();
                updateLists();
                updateUndoRedoButtons();
            }
        }
        
        function redo() {
            if (editor.historyIndex < editor.history.length - 1) {
                editor.historyIndex++;
                const state = editor.history[editor.historyIndex];
                editor.mapData = JSON.parse(JSON.stringify(state.mapData));
                editor.doors = JSON.parse(JSON.stringify(state.doors));
                editor.npcs = JSON.parse(JSON.stringify(state.npcs));
                render();
                updateLists();
                updateUndoRedoButtons();
            }
        }
        
        function updateUndoRedoButtons() {
            document.getElementById('undo-btn').disabled = editor.historyIndex <= 0;
            document.getElementById('redo-btn').disabled = editor.historyIndex >= editor.history.length - 1;
        }
        
        // Gestion des portes
        function addDoor(x, y) {
            const doorKey = `${x},${y}`;
            
            // VÃ©rifier que c'est une tuile porte
            if (editor.mapData[y] && editor.mapData[y][x] !== 4) {
                showStatus("Placez d'abord une tuile porte (4) !");
                return;
            }
            
            // Demander les paramÃ¨tres
            const targetMap = prompt("ID de la carte cible:", "0");
            if (targetMap === null) return;
            
            const targetX = prompt("Position X de destination:", "5");
            if (targetX === null) return;
            
            const targetY = prompt("Position Y de destination:", "5");
            if (targetY === null) return;
            
            editor.doors[doorKey] = {
                targetMap: parseInt(targetMap),
                targetX: parseInt(targetX),
                targetY: parseInt(targetY)
            };
            
            updateLists();
            render();
            saveHistory();
            showStatus(`Porte ajoutÃ©e en ${x},${y}`);
        }
        
        // Gestion des PNJ
        function addNPC() {
            const x = prompt("Position X du PNJ:", "5");
            if (x === null) return;
            
            const y = prompt("Position Y du PNJ:", "5");
            if (y === null) return;
            
            // CrÃ©er une liste de sÃ©lection des types
            const types = Object.keys(NPC_TYPES).map(key => 
                `${key}: ${NPC_TYPES[key].name}`
            ).join('\n');
            
            const type = prompt(`Type de PNJ:\n${types}\n\nEntrez le type:`, "oldMan");
            if (type === null || !NPC_TYPES[type]) return;
            
            const npcData = NPC_TYPES[type];
            
            editor.npcs.push({
                type: type,
                x: parseInt(x),
                y: parseInt(y),
                mobile: npcData.mobile || false,
                enemy: npcData.enemy || false,
                merchant: npcData.merchant || false
            });
            
            updateLists();
            render();
            saveHistory();
            showStatus(`PNJ ${NPC_TYPES[type].name} ajoutÃ© en ${x},${y}`);
        }
        
        // Mettre Ã  jour les listes
        function updateLists() {
            // Liste des portes
            const doorsList = document.getElementById('doors-list');
            doorsList.innerHTML = '';
            
            Object.keys(editor.doors).forEach(doorKey => {
                const [x, y] = doorKey.split(',').map(Number);
                const door = editor.doors[doorKey];
                
                const item = document.createElement('div');
                item.className = 'list-item';
                item.innerHTML = `
                    <span>[${x},${y}] â†’ Carte ${door.targetMap} (${door.targetX},${door.targetY})</span>
                    <button class="delete-btn" onclick="deleteDoor('${doorKey}')">X</button>
                `;
                doorsList.appendChild(item);
            });
            
            // Liste des PNJ
            const npcsList = document.getElementById('npcs-list');
            npcsList.innerHTML = '';
            
            editor.npcs.forEach((npc, index) => {
                const item = document.createElement('div');
                item.className = 'list-item';
                item.innerHTML = `
                    <span>${NPC_TYPES[npc.type].name} [${npc.x},${npc.y}]</span>
                    <button class="delete-btn" onclick="deleteNPC(${index})">X</button>
                `;
                npcsList.appendChild(item);
            });
        }
        
        // Supprimer une porte
        function deleteDoor(doorKey) {
            delete editor.doors[doorKey];
            updateLists();
            render();
            saveHistory();
            showStatus("Porte supprimÃ©e");
        }
        
        // Supprimer un PNJ
        function deleteNPC(index) {
            editor.npcs.splice(index, 1);
            updateLists();
            render();
            saveHistory();
            showStatus("PNJ supprimÃ©");
        }
        
        // Exporter en JSON
        function exportJSON() {
            const mapData = {
                id: parseInt(document.getElementById('map-id').value),
                name: document.getElementById('map-name').value,
                tiles: editor.mapData,
                doors: editor.doors,
                npcs: editor.npcs
            };
            
            // Ajouter les puzzles si nÃ©cessaire
            const puzzleData = detectPuzzles();
            if (puzzleData) {
                mapData.puzzle = puzzleData;
            }
            
            const json = JSON.stringify(mapData, null, 2);
            
            // Afficher dans le modal
            document.getElementById('json-output').textContent = json;
            document.getElementById('export-modal').classList.add('show');
            
            return json;
        }
        
        // DÃ©tecter les Ã©lÃ©ments de puzzle
        function detectPuzzles() {
            const switches = [];
            const blocks = [];
            const plates = [];
            
            for (let y = 0; y < editor.mapHeight; y++) {
                for (let x = 0; x < editor.mapWidth; x++) {
                    const tile = editor.mapData[y][x];
                    if (tile === 8 || tile === 9) {
                        switches.push({ x, y, id: String.fromCharCode(65 + switches.length) });
                    } else if (tile === 7) {
                        blocks.push({ x, y });
                    } else if (tile === 10) {
                        plates.push({ x, y });
                    }
                }
            }
            
            if (switches.length > 0 || blocks.length > 0 || plates.length > 0) {
                const puzzle = { type: 'switches' };
                
                if (switches.length > 0) {
                    puzzle.switches = switches;
                    // SÃ©quence par dÃ©faut
                    puzzle.sequence = switches.map(s => s.id);
                }
                
                if (blocks.length > 0) {
                    puzzle.blocks = blocks;
                }
                
                if (plates.length > 0) {
                    puzzle.plates = plates;
                }
                
                return puzzle;
            }
            
            return null;
        }
        
        // TÃ©lÃ©charger le JSON
        function downloadJSON() {
            const json = exportJSON();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `map_${document.getElementById('map-id').value}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showStatus("Carte tÃ©lÃ©chargÃ©e !");
        }
        
        // Copier le JSON
        function copyJSON() {
            const json = exportJSON();
            navigator.clipboard.writeText(json).then(() => {
                showStatus("JSON copiÃ© dans le presse-papier !");
            });
        }
        
        // Importer un JSON
        function importJSON(jsonString) {
            try {
                const data = JSON.parse(jsonString);
                
                // Valider la structure
                if (!data.tiles || !Array.isArray(data.tiles)) {
                    throw new Error("Structure de carte invalide");
                }
                
                // Charger les donnÃ©es
                editor.mapHeight = data.tiles.length;
                editor.mapWidth = data.tiles[0].length;
                editor.mapData = data.tiles;
                editor.doors = data.doors || {};
                editor.npcs = data.npcs || [];
                
                // Mettre Ã  jour l'UI
                document.getElementById('map-name').value = data.name || "Carte importÃ©e";
                document.getElementById('map-id').value = data.id || 0;
                document.getElementById('map-width').value = editor.mapWidth;
                document.getElementById('map-height').value = editor.mapHeight;
                
                updateCanvasSize();
                updateLists();
                render();
                saveHistory();
                
                showStatus("Carte importÃ©e avec succÃ¨s !");
                return true;
            } catch (e) {
                showStatus("Erreur d'import: " + e.message);
                return false;
            }
        }
        
        // Charger un fichier
        function loadFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                importJSON(e.target.result);
            };
            reader.readAsText(file);
        }
        
        // Redimensionner la carte
        function resizeMap() {
            const newWidth = parseInt(document.getElementById('map-width').value);
            const newHeight = parseInt(document.getElementById('map-height').value);
            
            if (newWidth < 5 || newWidth > 50 || newHeight < 5 || newHeight > 50) {
                showStatus("Taille invalide (5-50)");
                return;
            }
            
            const newMapData = [];
            
            for (let y = 0; y < newHeight; y++) {
                const row = [];
                for (let x = 0; x < newWidth; x++) {
                    if (y < editor.mapHeight && x < editor.mapWidth) {
                        row.push(editor.mapData[y][x]);
                    } else {
                        // Nouvelles cases : murs sur les bords, sol ailleurs
                        if (x === 0 || x === newWidth - 1 || y === 0 || y === newHeight - 1) {
                            row.push(1);
                        } else {
                            row.push(0);
                        }
                    }
                }
                newMapData.push(row);
            }
            
            editor.mapWidth = newWidth;
            editor.mapHeight = newHeight;
            editor.mapData = newMapData;
            
            updateCanvasSize();
            render();
            saveHistory();
            
            document.getElementById('map-size').textContent = `Taille: ${newWidth}x${newHeight}`;
            showStatus(`Carte redimensionnÃ©e: ${newWidth}x${newHeight}`);
        }
        
        // Effacer toute la carte
        function clearMap() {
            if (confirm("Effacer toute la carte ?")) {
                initMap(editor.mapWidth, editor.mapHeight);
                editor.doors = {};
                editor.npcs = [];
                updateLists();
                render();
                saveHistory();
                showStatus("Carte effacÃ©e");
            }
        }
        
        // Tester la carte
        function testMap() {
            const json = exportJSON();
            
            // CrÃ©er une page de test avec le jeu intÃ©grÃ©
            const testHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Test de carte</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: #2d2d2d;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: monospace;
        }
        #game-container {
            background-color: #8b956d;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        canvas {
            background-color: #9BBD0F;
            image-rendering: pixelated;
            border: 2px solid #556B2F;
        }
        #info {
            color: #8b956d;
            margin-top: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="game-container">
        <canvas id="gameCanvas"></canvas>
        <div id="info">
            <p>FlÃ¨ches: DÃ©placer | Ã‰chap: Quitter le test</p>
        </div>
    </div>
    ${'<'}script>
        // Configuration simplifiÃ©e pour le test
        const SCREEN_WIDTH = 160;
        const SCREEN_HEIGHT = 144;
        const TILE_SIZE = 16;
        const SCALE = 4;
        const COLORS = ${JSON.stringify(COLORS)};
        const TILES = ${JSON.stringify(Object.keys(TILES).reduce((acc, key) => {
            acc[key] = TILES[key].pattern;
            return acc;
        }, {}))};
        
        // Carte de test
        const testMap = ${json};
        
        // Canvas
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = SCREEN_WIDTH * SCALE;
        canvas.height = SCREEN_HEIGHT * SCALE;
        ctx.imageSmoothingEnabled = false;
        
        // Joueur
        const player = {
            x: Math.floor(testMap.tiles[0].length / 2),
            y: Math.floor(testMap.tiles.length / 2)
        };
        
        // Trouver une position valide pour le joueur
        for (let y = 1; y < testMap.tiles.length - 1; y++) {
            for (let x = 1; x < testMap.tiles[0].length - 1; x++) {
                if (testMap.tiles[y][x] === 0) {
                    player.x = x;
                    player.y = y;
                    break;
                }
            }
        }
        
        // CamÃ©ra
        const camera = {
            x: 0,
            y: 0
        };
        
        function updateCamera() {
            camera.x = player.x - Math.floor(10 / 2);
            camera.y = player.y - Math.floor(9 / 2);
            camera.x = Math.max(0, Math.min(camera.x, testMap.tiles[0].length - 10));
            camera.y = Math.max(0, Math.min(camera.y, testMap.tiles.length - 9));
        }
        
        function drawTile(pattern, x, y) {
            const screenX = (x - camera.x) * TILE_SIZE;
            const screenY = (y - camera.y) * TILE_SIZE;
            
            for (let row = 0; row < TILE_SIZE; row++) {
                for (let col = 0; col < TILE_SIZE; col++) {
                    const colorIndex = pattern[row][col];
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
        
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dessiner la carte
            const startX = Math.floor(camera.x);
            const endX = Math.min(startX + 11, testMap.tiles[0].length);
            const startY = Math.floor(camera.y);
            const endY = Math.min(startY + 10, testMap.tiles.length);
            
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const tileId = testMap.tiles[y][x];
                    if (TILES[tileId]) {
                        drawTile(TILES[tileId], x, y);
                    }
                }
            }
            
            // Dessiner le joueur (carrÃ© simple)
            ctx.fillStyle = COLORS[3];
            ctx.fillRect(
                (player.x - camera.x) * TILE_SIZE * SCALE + 4 * SCALE,
                (player.y - camera.y) * TILE_SIZE * SCALE + 4 * SCALE,
                8 * SCALE,
                8 * SCALE
            );
            
            // Nom de la carte
            ctx.fillStyle = COLORS[3];
            ctx.font = '16px monospace';
            ctx.fillText(testMap.name, 10, 20);
        }
        
        function isWalkable(tileType) {
            return tileType !== 1 && tileType !== 5 && tileType !== 6 && 
                   tileType !== 7 && tileType !== 8 && tileType !== 9;
        }
        
        // ContrÃ´les
        document.addEventListener('keydown', (e) => {
            let newX = player.x;
            let newY = player.y;
            
            switch(e.key) {
                case 'ArrowUp': newY--; break;
                case 'ArrowDown': newY++; break;
                case 'ArrowLeft': newX--; break;
                case 'ArrowRight': newX++; break;
                case 'Escape':
                    window.close();
                    return;
            }
            
            if (newX >= 0 && newX < testMap.tiles[0].length &&
                newY >= 0 && newY < testMap.tiles.length &&
                isWalkable(testMap.tiles[newY][newX])) {
                player.x = newX;
                player.y = newY;
                updateCamera();
                render();
            }
        });
        
        // Boucle de jeu
        updateCamera();
        render();
    ${'<'}/script>
</body>
</html>`;
            
            // Ouvrir dans une nouvelle fenÃªtre
            const testWindow = window.open('', '_blank');
            testWindow.document.write(testHTML);
            testWindow.document.close();
            
            showStatus("Test lancÃ© dans une nouvelle fenÃªtre");
        }
        
        // Afficher un message de status
        function showStatus(message) {
            const statusDiv = document.getElementById('status-message');
            statusDiv.textContent = message;
            statusDiv.classList.add('show');
            
            setTimeout(() => {
                statusDiv.classList.remove('show');
            }, 3000);
        }
        
        // Attacher les Ã©vÃ©nements
        function attachEventListeners() {
            // Canvas
            editor.canvas.addEventListener('mousedown', handleMouseDown);
            editor.canvas.addEventListener('mousemove', handleMouseMove);
            editor.canvas.addEventListener('mouseup', handleMouseUp);
            editor.canvas.addEventListener('mouseleave', handleMouseUp);
            editor.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            
            // Outils
            document.querySelectorAll('.tool-button').forEach(btn => {
                btn.addEventListener('click', () => selectTool(btn.dataset.tool));
            });
            
            // Actions
            document.getElementById('undo-btn').addEventListener('click', undo);
            document.getElementById('redo-btn').addEventListener('click', redo);
            document.getElementById('clear-btn').addEventListener('click', clearMap);
            
            // PropriÃ©tÃ©s
            document.getElementById('resize-map').addEventListener('click', resizeMap);
            document.getElementById('show-grid').addEventListener('change', (e) => {
                editor.showGrid = e.target.checked;
                render();
            });
            document.getElementById('grid-opacity').addEventListener('input', (e) => {
                editor.gridOpacity = parseInt(e.target.value);
                render();
            });
            
            // Portes et PNJ
            document.getElementById('add-door').addEventListener('click', () => {
                const x = prompt("Position X de la porte:", "5");
                if (x === null) return;
                const y = prompt("Position Y de la porte:", "5");
                if (y === null) return;
                addDoor(parseInt(x), parseInt(y));
            });
            document.getElementById('add-npc').addEventListener('click', addNPC);
            
            // Import/Export
            document.getElementById('import-btn').addEventListener('click', () => {
                document.getElementById('import-file').click();
            });
            document.getElementById('import-file').addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    loadFile(e.target.files[0]);
                }
            });
            document.getElementById('export-btn').addEventListener('click', exportJSON);
            document.getElementById('copy-json').addEventListener('click', copyJSON);
            document.getElementById('test-map').addEventListener('click', testMap);
            
            // Modal
            document.querySelector('.close-modal').addEventListener('click', () => {
                document.getElementById('export-modal').classList.remove('show');
            });
            document.getElementById('download-json').addEventListener('click', () => {
                downloadJSON();
                document.getElementById('export-modal').classList.remove('show');
            });
            document.getElementById('copy-modal-json').addEventListener('click', () => {
                const json = document.getElementById('json-output').textContent;
                navigator.clipboard.writeText(json).then(() => {
                    showStatus("JSON copiÃ© !");
                });
            });
            
            // Zoom
            document.getElementById('zoom-in').addEventListener('click', () => {
                if (editor.zoom < 3) {
                    editor.zoom += 0.25;
                    updateCanvasSize();
                    render();
                    document.getElementById('zoom-level').textContent = `${Math.round(editor.zoom * 100)}%`;
                }
            });
            document.getElementById('zoom-out').addEventListener('click', () => {
                if (editor.zoom > 0.5) {
                    editor.zoom -= 0.25;
                    updateCanvasSize();
                    render();
                    document.getElementById('zoom-level').textContent = `${Math.round(editor.zoom * 100)}%`;
                }
            });
            
            // Raccourcis clavier
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key) {
                        case 'z':
                            e.preventDefault();
                            if (e.shiftKey) {
                                redo();
                            } else {
                                undo();
                            }
                            break;
                        case 'y':
                            e.preventDefault();
                            redo();
                            break;
                        case 's':
                            e.preventDefault();
                            exportJSON();
                            break;
                        case 'o':
                            e.preventDefault();
                            document.getElementById('import-file').click();
                            break;
                    }
                } else {
                    // Raccourcis outils
                    switch(e.key) {
                        case 'b': selectTool('brush'); break;
                        case 'e': selectTool('eraser'); break;
                        case 'f': selectTool('fill'); break;
                        case 'r': selectTool('rect'); break;
                        case 'p': selectTool('picker'); break;
                        case 'd': selectTool('door'); break;
                        case 'g': 
                            document.getElementById('show-grid').checked = !editor.showGrid;
                            editor.showGrid = !editor.showGrid;
                            render();
                            break;
                    }
                }
            });
        }
        
        // Gestion de la souris
        function handleMouseDown(e) {
            const coords = getTileCoords(e);
            editor.isDrawing = true;
            
            // Mettre Ã  jour les infos du curseur
            document.getElementById('cursor-info').textContent = `X: ${coords.x}, Y: ${coords.y}`;
            
            let needsSave = false;
            
            switch(editor.currentTool) {
                case 'brush':
                    needsSave = placeTile(coords.x, coords.y);
                    break;
                case 'eraser':
                    needsSave = eraseTile(coords.x, coords.y);
                    break;
                case 'fill':
                    fillArea(coords.x, coords.y);
                    needsSave = true;
                    break;
                case 'rect':
                    editor.rectStart = coords;
                    break;
                case 'picker':
                    pickTile(coords.x, coords.y);
                    break;
                case 'door':
                    addDoor(coords.x, coords.y);
                    needsSave = true;
                    break;
            }
            
            if (needsSave && editor.currentTool !== 'rect') {
                render();
            }
        }
        
        function handleMouseMove(e) {
            const coords = getTileCoords(e);
            
            // Mettre Ã  jour les infos du curseur
            document.getElementById('cursor-info').textContent = `X: ${coords.x}, Y: ${coords.y}`;
            
            if (editor.isDrawing) {
                switch(editor.currentTool) {
                    case 'brush':
                        if (placeTile(coords.x, coords.y)) {
                            render();
                        }
                        break;
                    case 'eraser':
                        if (eraseTile(coords.x, coords.y)) {
                            render();
                        }
                        break;
                    case 'rect':
                        if (editor.rectStart) {
                            // PrÃ©visualisation du rectangle
                            render();
                            const ctx = editor.ctx;
                            const scale = 2 * editor.zoom;
                            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                            ctx.lineWidth = 2;
                            const minX = Math.min(editor.rectStart.x, coords.x);
                            const minY = Math.min(editor.rectStart.y, coords.y);
                            const width = Math.abs(coords.x - editor.rectStart.x) + 1;
                            const height = Math.abs(coords.y - editor.rectStart.y) + 1;
                            ctx.strokeRect(
                                minX * TILE_SIZE * scale,
                                minY * TILE_SIZE * scale,
                                width * TILE_SIZE * scale,
                                height * TILE_SIZE * scale
                            );
                        }
                        break;
                }
            }
        }
        
        function handleMouseUp(e) {
            if (editor.isDrawing) {
                if (editor.currentTool === 'rect' && editor.rectStart) {
                    const coords = getTileCoords(e);
                    drawRectangle(editor.rectStart.x, editor.rectStart.y, coords.x, coords.y);
                    render();
                    editor.rectStart = null;
                }
                
                if (editor.currentTool !== 'picker') {
                    saveHistory();
                }
            }
            
            editor.isDrawing = false;
        }
        
        // Rendre les fonctions globales pour les boutons inline
        window.deleteDoor = deleteDoor;
        window.deleteNPC = deleteNPC;
        
        // Charger la carte de test au dÃ©marrage
        function loadDefaultMap() {
            importJSON(JSON.stringify(DEFAULT_MAP));
        }
        
        // Initialiser l'Ã©diteur
        init();
        loadDefaultMap();
   
// SystÃ¨me de cartes multiples
let customMaps = {}; // Cartes chargÃ©es par l'utilisateur

// Fusionner les cartes par défaut et custom
function initMaps() {
    // Charger les cartes custom depuis localStorage
    const saved = localStorage.getItem('customMaps');
    if (saved) {
        try {
            customMaps = JSON.parse(saved);
            console.log("Cartes custom chargées:", Object.keys(customMaps).length);
        } catch (e) {
            console.error("Erreur chargement cartes custom:", e);
            customMaps = {};
        }
    }
    
    // Fusionner avec les cartes par défaut
    maps = { ...defaultMaps, ...customMaps };
    updateMapList();
}

// Charger une carte spécifique par ID
function loadMapById(mapId) {
    if (!maps[mapId]) {
        showStatus(`Carte ${mapId} introuvable!`, 'error');
        return false;
    }
    
    const map = maps[mapId];
    
    // Vérifier que le joueur peut être placé sur cette carte
    let validPosition = false;
    for (let y = 1; y < map.tiles.length - 1 && !validPosition; y++) {
        for (let x = 1; x < map.tiles[0].length - 1 && !validPosition; x++) {
            if (isWalkable(map.tiles[y][x])) {
                if (currentMapId !== mapId) {
                    player.x = x;
                    player.y = y;
                }
                validPosition = true;
            }
        }
    }
    
    if (!validPosition) {
        showStatus("Erreur: Aucune position valide trouvée sur cette carte!", 'error');
        return false;
    }
    
    currentMapId = mapId;
    loadNPCs(); // Recharger les PNJ
    updateCamera();
    
    showStatus(`Carte "${map.name}" chargée!`, 'success');
    updateMapList();
    return true;
}

// Charger un fichier JSON
function loadMapFile() {
    document.getElementById('map-file').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const mapData = JSON.parse(e.target.result);
            addCustomMap(mapData);
        } catch (error) {
            showStatus("Erreur: Fichier JSON invalide!", 'error');
        }
    };
    reader.readAsText(file);
}

// Charger depuis texte
function loadFromText() {
    const json = prompt("Collez le JSON de la carte ici:");
    if (!json) return;
    
    try {
        const mapData = JSON.parse(json);
        addCustomMap(mapData);
    } catch (error) {
        showStatus("Erreur: JSON invalide!", 'error');
    }
}

// Ajouter une carte custom
function addCustomMap(mapData) {
    // Validation basique
    if (!mapData.tiles || !Array.isArray(mapData.tiles)) {
        showStatus("Erreur: Structure de carte invalide! (tiles manquant)", 'error');
        return;
    }
    
    if (!mapData.name) {
        mapData.name = "Carte sans nom";
    }
    
    // Assigner un ID si nécessaire ou en cas de conflit
    if (mapData.id === undefined || maps[mapData.id]) {
        const maxId = Math.max(...Object.keys(maps).map(Number));
        mapData.id = isNaN(maxId) ? 100 : maxId + 1;
    }
    
    // Valeurs par défaut
    if (!mapData.doors) mapData.doors = {};
    if (!mapData.npcs) mapData.npcs = [];
    
    // Ajouter la carte
    customMaps[mapData.id] = mapData;
    maps[mapData.id] = mapData;
    
    // Sauvegarder
    localStorage.setItem('customMaps', JSON.stringify(customMaps));
    
    // Mettre à jour l'interface et charger la carte
    updateMapList();
    loadMapById(mapData.id);
}

// Charger les cartes par défaut uniquement
function loadDefaultMaps() {
    if (confirm("Retourner aux cartes par défaut ? Les cartes custom seront conservées mais désactivées.")) {
        maps = { ...defaultMaps };
        updateMapList();
        loadMapById(0);
        showStatus("Cartes par défaut restaurées!", 'success');
    }
}

// Effacer les cartes custom
function clearCustomMaps() {
    if (confirm("Effacer définitivement toutes les cartes custom ?")) {
        customMaps = {};
        localStorage.removeItem('customMaps');
        maps = { ...defaultMaps };
        updateMapList();
        
        // Si on était sur une carte custom, retourner à la carte 0
        if (!defaultMaps[currentMapId]) {
            loadMapById(0);
        }
        
        showStatus("Cartes custom effacées!", 'success');
    }
}

// Mettre à jour la liste des cartes
function updateMapList() {
    const mapList = document.getElementById('map-list');
    if (!mapList) return;
    
    mapList.innerHTML = '';
    
    // Séparer cartes par défaut et custom
    const defaultIds = Object.keys(defaultMaps);
    const customIds = Object.keys(customMaps);
    
    // Cartes par défaut
    defaultIds.forEach(mapId => {
        if (maps[mapId]) {
            const map = maps[mapId];
            const button = document.createElement('button');
            button.className = 'map-button';
            if (mapId == currentMapId) button.classList.add('active');
            button.textContent = `${mapId}: ${map.name}`;
            button.onclick = () => loadMapById(mapId);
            button.title = "Carte par défaut";
            mapList.appendChild(button);
        }
    });
    
    // Séparateur si il y a des cartes custom
    if (customIds.length > 0) {
        const separator = document.createElement('div');
        separator.style.width = '100%';
        separator.style.textAlign = 'center';
        separator.style.color = '#9BBD0F';
        separator.style.fontSize = '10px';
        separator.style.margin = '5px 0';
        separator.textContent = '--- CARTES CUSTOM ---';
        mapList.appendChild(separator);
        
        // Cartes custom
        customIds.forEach(mapId => {
            if (maps[mapId]) {
                const map = maps[mapId];
                const button = document.createElement('button');
                button.className = 'map-button';
                if (mapId == currentMapId) button.classList.add('active');
                button.textContent = `${mapId}: ${map.name}`;
                button.onclick = () => loadMapById(mapId);
                button.title = "Carte custom";
                button.style.borderColor = '#8BAC0F';
                mapList.appendChild(button);
            }
        });
    }
}

// Afficher un status
function showStatus(message, type = 'success') {
    const status = document.getElementById('status');
    if (!status) return;
    
    status.textContent = message;
    status.className = type;
    setTimeout(() => {
        status.textContent = '';
        status.className = '';
    }, 3000);
}

// Basculer l'affichage du map loader
function toggleMapLoader() {
    const mapLoader = document.getElementById('map-loader');
    if (mapLoader.style.display === 'none' || mapLoader.style.display === '') {
        mapLoader.style.display = 'flex';
        updateMapList();
    } else {
        mapLoader.style.display = 'none';
    }
}

// Gestion des collisions et téléportations
function isWalkable(tileType) {
    // Les murs (1), coffres fermés (5), coffres ouverts (6), blocs (7) et interrupteurs (8,9) bloquent le passage
    return tileType !== 1 && tileType !== 5 && tileType !== 6 && tileType !== 7 && tileType !== 8 && tileType !== 9;
}

function checkDoor(x, y) {
    const currentMap = maps[currentMapId];
    const doorKey = `${x},${y}`;
    if (currentMap.doors && currentMap.doors[doorKey]) {
        const door = currentMap.doors[doorKey];
        // Téléportation
        currentMapId = door.targetMap;
        player.x = door.targetX;
        player.y = door.targetY;
        loadNPCs(); // Charger les PNJ de la nouvelle carte
        updateCamera();
        return true;
    }
    return false;
}

// Charger les données des cartes (pour réinitialisation)
function loadMapData() {
    // Réinitialiser la carte 3 (Temple Est) dans les cartes par défaut
    defaultMaps[3].tiles = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,4,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
        [1,0,1,7,0,0,0,0,0,0,0,7,1,0,1],
        [1,0,1,0,0,8,0,0,0,8,0,0,1,0,1],
        [1,0,1,0,0,0,0,5,0,0,0,0,1,0,1],
        [1,0,1,0,0,8,0,0,0,8,0,0,1,0,1],
        [1,0,1,10,0,0,0,0,0,0,0,10,1,0,1],
        [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    
    // Refusionner les cartes
    maps = { ...defaultMaps, ...customMaps };
}
# Game Boy Engine - Documentation Technique

## Vue d'ensemble

Moteur de RPG rétro inspiré de la Game Boy, développé en JavaScript/HTML5 avec fidélité aux contraintes techniques de la console originale.

---

## 1. Spécifications Techniques

### 1.1 Affichage
- **Résolution native** : 160x144 pixels
- **Upscaling** : x4 (640x576 pixels affichés)
- **Palette** : 4 couleurs vertes Game Boy
  - `#9BBD0F` - Vert clair (indice 0)
  - `#8BAC0F` - Vert moyen clair (indice 1)
  - `#306230` - Vert moyen foncé (indice 2)
  - `#0F380F` - Vert très foncé (indice 3)
  - `-1` (T) - Transparent

### 1.2 Système de Tiles
- **Taille des tiles** : 16x16 pixels
- **Zone visible** : 10x9 tiles (160x144 pixels)
- **Format** : Tableaux 2D avec indices de couleur (0-3) ou T (-1)
- **Transparence** : Supportée via T = -1

### 1.3 Caméra
- **Type** : Suivi du joueur centré
- **Limites** : Contrainte aux bordures de la carte
- **Calcul** : Position centrée avec ajustement selon les dimensions

---

## 2. Architecture du Projet

### 2.1 Structure des Fichiers

```
index.html          Interface principale, canvas, contrôles
├── config.js       Configuration globale et constantes
├── data.js         Bibliothèque de sprites (tiles, entités)
├── state.js        État global du jeu (joueur, monde, UI)
├── maps.js         Système de cartes et données de niveau
├── game.js         Logique gameplay (PNJ, interactions, énigmes)
├── combat.js       Système de combat au tour par tour
├── render.js       Moteur de rendu (tiles, sprites, UI)
├── input.js        Gestion des entrées clavier/gamepad
├── ui.js           Interface utilisateur (dialogues, menus)
├── ui-sprites.js   Sprites de cadres d'interface
├── font-sprites.js Police pixelisée 8x8
├── save.js         Sauvegarde/chargement (localStorage)
└── main.js         Boucle principale et initialisation
```

### 2.2 Flux de Données

```
Input → State → Game Logic → Render
  ↓       ↓         ↓           ↓
Clavier  Global   Combat    Canvas
Gamepad  Joueur   Énigmes   Sprites
         Monde    PNJ       UI
         UI       Items     Texte
```

---

## 3. Système d'État (state.js)

### 3.1 Structure Globale

```javascript
const state = {
  // Joueur
  player: {
    x, y,           // Position en pixels
    direction,      // 'up', 'down', 'left', 'right'
    hp, maxHP,
    mp, maxMP,
    level, xp,
    gold,
    inventory: [],
    equipment: { weapon, armor, accessory },
    spells: []
  },
  
  // Monde
  world: {
    currentMap: 'map1',
    npcs: [],       // PNJ avec position et état
    switches: {},   // État des interrupteurs
    puzzles: {},    // État des énigmes
    chests: {},     // Coffres ouverts
    flags: {}       // Flags de progression
  },
  
  // Combat
  combat: {
    active: false,
    enemy: {},
    turn: 'player',
    cooldowns: {},
    log: []
  },
  
  // Interface
  ui: {
    dialog: null,
    menu: null,
    shopOpen: false,
    inventoryOpen: false
  },
  
  // Technique
  camera: { x, y },
  moving: false,
  paused: false
}
```

### 3.2 Coordonnées et Positionnement

**Pixels Canvas** (non mis à l'échelle)
- Joueur, PNJ, objets : en pixels (0-160 largeur, 0-144 hauteur)
- Tiles : position × 16 pixels
- Caméra : position en pixels pour défilement fluide

**Tiles Grid**
- Cartes : tableaux 2D d'indices de tiles
- Collisions : basées sur les tiles
- Conversion : `pixelX / 16 = tileX`

---

## 4. Système de Cartes (maps.js)

### 4.1 Format de Carte

```javascript
maps.mapName = {
  name: "Nom Affiché",
  width: 20,      // Largeur en tiles
  height: 15,     // Hauteur en tiles
  
  // Couches de rendu
  groundLayer: [  // Tableau 2D d'indices de tiles
    [1, 1, 2, ...],
    [1, 3, 2, ...],
    ...
  ],
  
  decorLayer: [], // Décorations par-dessus le sol
  
  // Données de collision
  collision: [    // 1 = bloqué, 0 = passable
    [0, 0, 1, ...],
    ...
  ],
  
  // Points d'intérêt
  spawns: {
    player: { x: 5, y: 7 }  // Position de spawn
  },
  
  // Transitions de carte
  warps: [
    { x: 10, y: 0, toMap: 'map2', toX: 10, toY: 14 }
  ]
}
```

### 4.2 Chargeur de Cartes Custom

**Format JSON Supporté**
```json
{
  "name": "Nom",
  "width": 20,
  "height": 15,
  "groundLayer": [...],
  "decorLayer": [...],
  "collision": [...],
  "spawns": { "player": { "x": 5, "y": 7 } },
  "warps": [...]
}
```

**Chargement**
```javascript
loadCustomMap(jsonData)  // Charge depuis JSON
changeMap(mapName)        // Change de carte
```

---

## 5. Systèmes de Gameplay

### 5.1 Mouvement

**Caractéristiques**
- Vitesse : 2 pixels par frame
- Interpolation fluide sur 16 pixels (1 tile)
- Vérification de collision avant mouvement
- Caméra suit automatiquement le joueur

**Flux**
```
Input → Vérif collision → État moving → Interpolation → Mise à jour caméra
```

### 5.2 Combat

**Type** : Tour par tour avec système de cooldowns

**Structure d'Ennemi**
```javascript
{
  name: "Gobelin",
  sprite: SPRITES.goblin,
  hp: 50,
  maxHP: 50,
  attack: 10,
  defense: 5,
  gold: 25,
  xp: 30,
  pattern: ['attack', 'attack', 'defend']
}
```

**Actions Disponibles**
- Attaque physique (dégâts basés sur arme)
- Magie (sorts avec coût MP et cooldown)
- Défense (+50% défense pour 1 tour)
- Fuite (chance d'échapper au combat)

**Formule de Dégâts**
```javascript
damage = attackerAttack - (targetDefense * 0.5)
magicDamage = spellPower (ignore défense)
```

### 5.3 PNJ et IA

**Types de PNJ**
1. **Statiques** : Position fixe, dialogues
2. **Patrouille** : Mouvement sur chemin défini
3. **Ennemis** : Poursuit le joueur si proche

**Structure PNJ**
```javascript
{
  id: "npc1",
  type: "enemy",
  x: 80,
  y: 64,
  sprite: SPRITES.goblin,
  hp: 50,
  patrol: [{ x: 80, y: 64 }, { x: 96, y: 64 }],
  chaseRange: 64,  // Distance de détection
  dialog: ["Texte..."]
}
```

**IA d'Ennemi**
```
Calculer distance au joueur
SI distance < chaseRange :
  Déplacer vers le joueur (pathfinding simple)
  SI collision avec joueur : Déclencher combat
SINON :
  Reprendre patrouille
```

### 5.4 Énigmes

**Types Implémentés**

1. **Blocs Poussables**
```javascript
{
  type: "pushable",
  x: 96,
  y: 80,
  sprite: SPRITES.pushBlock
}
```

2. **Interrupteurs et Portes**
```javascript
{
  type: "switch",
  x: 64,
  y: 64,
  target: "door1",
  active: false
}
```

3. **Plaques de Pression**
```javascript
{
  type: "pressurePlate",
  x: 80,
  y: 96,
  target: "gate1",
  requiresBlock: true
}
```

**Logique**
- Vérification de collision avec objets d'énigme
- Mise à jour de `state.world.puzzles`
- Activation/désactivation de mécanismes liés

### 5.5 Dialogues

**Format**
```javascript
dialog: [
  "Première ligne...",
  "Deuxième ligne...",
  "Troisième ligne..."
]
```

**Caractéristiques**
- Pagination automatique (3 lignes max par page)
- Cadre UI avec bordures Game Boy
- Progression avec touche A/Entrée
- Wrapping de texte automatique

---

## 6. Système de Rendu (render.js)

### 6.1 Pipeline de Rendu

```
1. Clear canvas
2. Calculer zone visible (viewport)
3. Render groundLayer (tiles de sol)
4. Render decorLayer (décorations)
5. Render objets d'énigme
6. Render PNJ
7. Render joueur
8. Render UI (dialogues, menus, HUD)
```

### 6.2 Optimisation

**Culling de Viewport**
- Ne dessine que les tiles visibles (10x9 + marges)
- Calcul : `cameraTile ± viewportSize`

**Sprite Rendering**
```javascript
drawSprite(sprite, x, y) {
  Pour chaque pixel du sprite :
    SI pixel !== T :
      Dessiner pixel à la couleur de palette
}
```

### 6.3 Police et Texte

**Font 8x8 Pixels**
- Caractères A-Z, a-z, 0-9, ponctuation
- Sprites dans `font-sprites.js`
- Wrapping automatique selon largeur

**Rendu de Texte**
```javascript
drawText(text, x, y, maxWidth) {
  Diviser en mots
  Pour chaque mot :
    SI dépasse maxWidth : Nouvelle ligne
    Dessiner caractère par caractère
}
```

---

## 7. Systèmes Secondaires

### 7.1 Inventaire et Équipement

**Objets**
```javascript
{
  id: "sword1",
  name: "Épée de fer",
  type: "weapon",
  attack: 10,
  price: 50,
  description: "Une épée basique."
}
```

**Types**
- `weapon` : Arme (augmente attaque)
- `armor` : Armure (augmente défense)
- `accessory` : Accessoire (bonus divers)
- `consumable` : Consommable (potions)
- `key` : Objet clé (progression)

### 7.2 Shop (Magasin)

**Format**
```javascript
{
  name: "Magasin",
  items: ["potion", "sword1", "armor1"],
  buyMultiplier: 1.0,   // Prix d'achat
  sellMultiplier: 0.5   // Prix de revente
}
```

**Actions**
- Acheter : Dépense or, ajoute à inventaire
- Vendre : Retire de inventaire, gagne or

### 7.3 Sauvegarde

**Slots Disponibles**
- 3 slots manuels (Save 1, 2, 3)
- 1 slot auto-save

**Données Sauvegardées**
```javascript
{
  player: { ... },      // Stats et équipement
  world: { ... },       // Progression du monde
  timestamp: Date.now() // Horodatage
}
```

**Stockage** : localStorage (JSON sérialisé)

---

## 8. Convention de Code

### 8.1 Sprites

**Format Standard**
```javascript
SPRITES.spriteName = [
  [T, 0, 0, T, ...],  // Ligne 1
  [0, 1, 1, 0, ...],  // Ligne 2
  ...
]
```
- T = -1 = Transparent
- 0-3 = Indices de palette

### 8.2 Nommage

**Variables**
- `camelCase` pour variables et fonctions
- `UPPER_CASE` pour constantes
- Préfixes : `is`, `has`, `can` pour booléens

**Fonctions**
- Verbes d'action : `updatePlayer()`, `renderMap()`
- Getters : `getPlayerTile()`, `isColliding()`

### 8.3 Organisation

**Séparation des Responsabilités**
- `data.js` : Données pures (sprites, items)
- `state.js` : État mutable uniquement
- `game.js` : Logique métier
- `render.js` : Affichage uniquement
- Pas de logique dans `render.js`
- Pas de rendu dans `game.js`

---

## 9. Préparation pour Système d'Événements

### 9.1 Besoins Identifiés

**Événements à Supporter**
1. **Triggers Spatiaux** : Entrée dans zone, contact avec objet
2. **Triggers Temporels** : Après X secondes, à moment précis
3. **Triggers Conditionnels** : Si flag actif, si item possédé
4. **Triggers de Progression** : Après quête, après combat
5. **Triggers UI** : Clic, dialogue terminé, menu fermé

### 9.2 Données à Étendre

**Ajouts à state.js**
```javascript
state.events = {
  active: [],      // Événements en cours
  completed: [],   // Événements terminés
  triggers: {}     // Triggers positionnés sur carte
}
```

**Ajouts aux Cartes**
```javascript
maps.mapName = {
  // ... existant
  events: [
    {
      id: "event1",
      trigger: { type: "enter", area: { x: 5, y: 3, w: 2, h: 2 } },
      condition: { flag: "talked_to_npc" },
      actions: [
        { type: "dialog", text: ["..."] },
        { type: "setFlag", flag: "event1_done" }
      ]
    }
  ]
}
```

### 9.3 Architecture Proposée

**event-system.js** (nouveau fichier)
```javascript
// Gestionnaire d'événements
const EventSystem = {
  checkTriggers(triggerType, data) { ... },
  executeEvent(event) { ... },
  registerTrigger(trigger, callback) { ... },
  
  // Actions d'événement
  actions: {
    dialog(params) { ... },
    setFlag(params) { ... },
    giveItem(params) { ... },
    changeMap(params) { ... },
    spawnNPC(params) { ... },
    playSound(params) { ... }
  }
}
```

**Intégration dans Boucle Principale**
```javascript
function gameLoop() {
  if (!state.paused) {
    updatePlayer();
    updateNPCs();
    updateCombat();
    
    // NOUVEAU
    EventSystem.update();
    EventSystem.checkTriggers('spatial', {
      x: state.player.x,
      y: state.player.y
    });
  }
  render();
}
```

### 9.4 Types d'Actions Suggérées

**Actions de Base**
- `dialog` : Afficher dialogue
- `setFlag` : Activer flag de progression
- `giveItem` : Ajouter item à inventaire
- `removeItem` : Retirer item
- `changeMap` : Téléporter vers autre carte
- `spawnNPC` : Faire apparaître PNJ
- `removeNPC` : Retirer PNJ
- `modifyStat` : Modifier HP/MP/Gold/XP
- `startCombat` : Déclencher combat
- `playAnimation` : Animation custom
- `cameraEffect` : Shake, zoom, pan
- `conditional` : Exécuter si condition
- `sequence` : Chaîner plusieurs actions
- `wait` : Pause temporelle

**Actions Avancées**
- `cutscene` : Séquence cinématique
- `moveNPC` : Déplacer PNJ (pathfinding)
- `cameraFollow` : Suivre autre entité
- `fadeOut/In` : Transitions
- `saveGame` : Force sauvegarde
- `achievement` : Débloquer succès

---

## 10. Points d'Extension

### 10.1 Améliorations Possibles

**Gameplay**
- Système de quêtes avec journal
- Compétences/talents (arbre de progression)
- Crafting (combinaison d'objets)
- Mini-jeux (pêche, puzzle)
- Météo et cycle jour/nuit

**Technique**
- Audio (musique, SFX)
- Particules (poussière, magie)
- Shaders CRT pour effet authentique
- Support mobile (touch controls)
- Éditeur de carte visuel

**Contenu**
- Plus de sorts et capacités
- Système d'affinités élémentaires
- Boss avec patterns complexes
- Dialogue branches (choix multiples)
- Collectibles et secrets

### 10.2 Optimisations

**Performance**
- Spatial hashing pour collisions
- Object pooling pour sprites
- Lazy loading des cartes
- Web Workers pour IA

**Code**
- Migration vers modules ES6
- TypeScript pour typage
- État immutable avec reducers
- Tests unitaires

---

## 11. Ressources et Conventions

### 11.1 Palette de Couleurs

```javascript
COLORS = [
  "#9BBD0F",  // 0 - Vert clair
  "#8BAC0F",  // 1 - Vert moyen clair
  "#306230",  // 2 - Vert moyen foncé
  "#0F380F"   // 3 - Vert très foncé
]
```

### 11.2 Dimensions Standards

- **Tile** : 16x16 px
- **Sprite Joueur** : 16x16 px
- **Sprite PNJ** : 16x16 px
- **Sprite UI** : Variable (cadres, icônes)
- **Caractère** : 8x8 px

### 11.3 Constantes Importantes

```javascript
TILE_SIZE = 16
VIEWPORT_WIDTH = 10   // tiles
VIEWPORT_HEIGHT = 9   // tiles
CANVAS_WIDTH = 160    // pixels
CANVAS_HEIGHT = 144   // pixels
SCALE = 4             // upscaling
MOVE_SPEED = 2        // pixels/frame
```

---

## 12. Workflow de Développement

### 12.1 Ajout d'une Nouvelle Fonctionnalité

1. **Définir les données** dans `data.js` ou `state.js`
2. **Créer la logique** dans `game.js` ou fichier dédié
3. **Ajouter le rendu** dans `render.js` ou `ui.js`
4. **Connecter les inputs** dans `input.js` si nécessaire
5. **Tester** dans plusieurs contextes
6. **Documenter** changements et usage

### 12.2 Création de Carte

1. Définir dimensions (width, height)
2. Créer `groundLayer` (tiles de base)
3. Ajouter `decorLayer` (décorations optionnelles)
4. Définir `collision` (1 = bloqué, 0 = libre)
5. Placer `spawns` (joueur, PNJ)
6. Configurer `warps` (transitions)
7. Ajouter PNJ et objets interactifs
8. Tester collisions et transitions

### 12.3 Création de Sprite

```javascript
// Template 16x16
const SPRITES.newSprite = [
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
  [T,T,T,0,0,0,0,0,0,0,0,0,0,T,T,T],
  // ... 13 lignes supplémentaires
]
```

**Conseils**
- Utiliser symétrie pour gain de temps
- Limiter détails (16x16 = petit)
- Contraste entre couleurs adjacentes
- Tester in-game tôt

---

## Conclusion

Ce moteur Game Boy offre une base solide pour créer des RPG rétro. L'architecture modulaire facilite l'extension et la maintenance. Le système d'événements proposé permettra d'ajouter une narration riche et des interactions dynamiques tout en conservant la simplicité du code existant.

**Prochaines Étapes Recommandées**
1. Implémenter le système d'événements de base
2. Créer quelques événements exemples
3. Tester l'intégration avec systèmes existants
4. Documenter les nouveaux patterns
5. Étendre progressivement les capacités
// Police de caractères pixelisée pour Game Boy (8x8 pixels par caractère)
// Version affinée inspirée des polices Game Boy authentiques
// T = -1 pour la transparence

// Alias pour la transparence
// const T = -1;

const FONT_SPRITES = {
    // Lettres majuscules - Version affinée (traits de 1 pixel)
    'A': [
        [T,T,3,3,3,T,T,T],
        [T,3,T,T,T,3,T,T],
        [T,3,T,T,T,3,T,T],
        [3,3,3,3,3,3,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    'B': [
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [3,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'C': [
        [T,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,3,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'D': [
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,3,T,T],
        [3,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'E': [
        [3,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'F': [
        [3,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'G': [
        [T,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,3,3,3,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'H': [
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,3,3,3,3,3,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    'I': [
        [T,3,3,3,3,3,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'J': [
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'K': [
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,3,T,T,T],
        [3,T,T,3,T,T,T,T],
        [3,3,3,T,T,T,T,T],
        [3,T,T,3,T,T,T,T],
        [3,T,T,T,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'L': [
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'M': [
        [3,T,T,T,T,T,3,T],
        [3,3,T,T,T,3,3,T],
        [3,T,3,T,3,T,3,T],
        [3,T,T,3,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    'N': [
        [3,T,T,T,T,T,3,T],
        [3,3,T,T,T,T,3,T],
        [3,T,3,T,T,T,3,T],
        [3,T,T,3,T,T,3,T],
        [3,T,T,T,3,T,3,T],
        [3,T,T,T,T,3,3,T],
        [3,T,T,T,T,T,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    'O': [
        [T,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'P': [
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'Q': [
        [T,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,3,T,3,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    'R': [
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [3,3,3,3,3,T,T,T],
        [3,T,T,3,T,T,T,T],
        [3,T,T,T,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'S': [
        [T,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'T': [
        [3,3,3,3,3,3,3,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'U': [
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'V': [
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,3,T,T,T,3,T,T],
        [T,3,T,T,T,3,T,T],
        [T,T,3,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'W': [
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,3,T,T,3,T],
        [3,T,3,T,3,T,3,T],
        [3,3,T,T,T,3,3,T],
        [3,T,T,T,T,T,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    'X': [
        [3,T,T,T,T,T,3,T],
        [T,3,T,T,T,3,T,T],
        [T,T,3,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,3,T,T,T],
        [T,3,T,T,T,3,T,T],
        [3,T,T,T,T,T,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    'Y': [
        [3,T,T,T,T,T,3,T],
        [T,3,T,T,T,3,T,T],
        [T,T,3,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'Z': [
        [3,3,3,3,3,3,3,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [3,3,3,3,3,3,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    
    // Chiffres - Version affinée
    '0': [
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,3,3,T,T],
        [3,T,T,3,T,3,T,T],
        [3,T,3,T,T,3,T,T],
        [3,3,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '1': [
        [T,T,3,3,T,T,T,T],
        [T,3,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '2': [
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,3,3,T,T,T],
        [T,3,3,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '3': [
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,3,3,3,T,T,T],
        [T,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '4': [
        [T,T,T,3,3,T,T,T],
        [T,T,3,T,3,T,T,T],
        [T,3,T,T,3,T,T,T],
        [3,T,T,T,3,T,T,T],
        [3,3,3,3,3,3,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '5': [
        [3,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,T,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '6': [
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '7': [
        [3,3,3,3,3,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '8': [
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '9': [
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,3,T,T],
        [3,T,T,T,T,3,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    
    // Caractères spéciaux
    ' ': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '.': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    ',': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,3,T,T,T,T,T,T]
    ],
    '!': [
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '?': [
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,3,3,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    ':': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '-': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '/': [
        [T,T,T,T,T,T,3,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [3,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '>': [
        [T,T,T,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,3,T,T,T,T,T,T]
    ],
    '<': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,T,T,3,T,T]
    ],
    '$': [
        [T,T,T,3,T,T,T,T],
        [T,3,3,3,3,3,T,T],
        [3,T,T,3,T,T,T,T],
        [T,3,3,3,3,T,T,T],
        [T,T,T,3,T,3,T,T],
        [3,3,3,3,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '♥': [ // Coeur
        [T,3,T,T,T,3,T,T],
        [3,T,3,T,3,T,3,T],
        [3,T,T,3,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,3,T,T,T,3,T,T],
        [T,T,3,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '†': [ // Épée
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [3,3,3,3,3,3,3,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '◆': [ // Diamant
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,3,T,T,T],
        [T,3,T,T,T,3,T,T],
        [3,T,T,T,T,T,3,T],
        [T,3,T,T,T,3,T,T],
        [T,T,3,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '§': [ // Clé
        [T,T,3,3,3,T,T,T],
        [T,3,T,T,T,3,T,T],
        [T,3,T,T,T,3,T,T],
        [T,T,3,3,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,3,T,T,T],
        [T,T,T,3,T,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '(': [
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    ')': [
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,T,3,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '+': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [3,3,3,3,3,3,3,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '=': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '~': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,3,T,T,T,3,3,T],
        [3,T,3,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'É': [
        [T,T,T,3,3,T,T,T],
        [T,T,3,T,T,T,T,T],
        [3,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'È': [
        [T,T,3,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [3,3,3,3,3,3,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,T,T,T],
        [3,T,T,T,T,T,T,T],
        [3,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    'À': [
        [T,T,3,3,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,3,3,3,T,T,T],
        [T,3,T,T,T,3,T,T],
        [3,3,3,3,3,3,3,T],
        [3,T,T,T,T,T,3,T],
        [3,T,T,T,T,T,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    "'": [
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '^': [ // Flèche haut
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,3,T,T,T],
        [T,3,T,T,T,3,T,T],
        [3,T,T,T,T,T,3,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '"': [
        [T,3,T,T,3,T,T,T],
        [T,3,T,T,3,T,T,T],
        [3,T,T,3,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '*': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,3,T,T,T,T],
        [3,T,T,3,T,T,3,T],
        [T,3,T,3,T,3,T,T],
        [T,T,3,3,3,T,T,T],
        [T,3,T,3,T,3,T,T],
        [3,T,T,3,T,T,3,T],
        [T,T,T,3,T,T,T,T]
    ],
    '%': [
        [3,3,T,T,T,3,T,T],
        [3,3,T,T,3,T,T,T],
        [T,T,T,3,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [3,T,T,T,3,3,T,T],
        [T,T,T,T,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '&': [
        [T,3,3,T,T,T,T,T],
        [3,T,T,3,T,T,T,T],
        [3,T,T,3,T,T,T,T],
        [T,3,3,T,T,T,T,T],
        [3,T,T,3,T,3,T,T],
        [3,T,T,T,3,T,T,T],
        [T,3,3,3,T,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '#': [
        [T,3,T,T,3,T,T,T],
        [T,3,T,T,3,T,T,T],
        [3,3,3,3,3,3,T,T],
        [T,3,T,T,3,T,T,T],
        [3,3,3,3,3,3,T,T],
        [T,3,T,T,3,T,T,T],
        [T,3,T,T,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '@': [
        [T,3,3,3,3,T,T,T],
        [3,T,T,T,T,3,T,T],
        [3,T,3,3,T,3,T,T],
        [3,T,3,T,3,3,T,T],
        [3,T,3,3,3,T,T,T],
        [3,T,T,T,T,T,T,T],
        [T,3,3,3,3,3,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '[': [
        [T,3,3,3,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,3,T,T,T,T,T,T],
        [T,3,3,3,T,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    ']': [
        [T,T,3,3,3,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,T,T,3,T,T,T],
        [T,T,3,3,3,T,T,T],
        [T,T,T,T,T,T,T,T]
    ],
    '_': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [3,3,3,3,3,3,3,T],
        [T,T,T,T,T,T,T,T]
    ],
    ';': [
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,T,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,T,3,T,T,T,T,T],
        [T,3,T,T,T,T,T,T]
    ]
};

// Fonction pour dessiner du texte avec les sprites
function drawPixelText(ctx, text, x, y, scale = SCALE, color = null) {
    let currentX = x;
    let currentY = y;
    const charWidth = 8;
    const charHeight = 8;
    const spacing = 1; // Espace entre les caractères
    
    // Convertir en majuscules car nous n'avons que des majuscules
    text = text.toUpperCase();
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const sprite = FONT_SPRITES[char];
        
        if (char === '\n') {
            // Nouvelle ligne
            currentX = x;
            currentY += (charHeight + 2);
            continue;
        }
        
        if (sprite) {
            // Dessiner le caractère (NE PAS multiplier par scale ici)
            for (let row = 0; row < charHeight; row++) {
                for (let col = 0; col < charWidth; col++) {
                    let colorIndex = sprite[row][col];
                    
                    // Ignorer les pixels transparents
                    if (colorIndex === -1 || colorIndex === T) {
                        continue;
                    }
                    
                    // Remplacer les couleurs si spécifié
                    if (color !== null && colorIndex !== T) {
                        colorIndex = color;
                    }
                    
                    ctx.fillStyle = COLORS[colorIndex];
                    ctx.fillRect(
                        (currentX + col) * scale,
                        (currentY + row) * scale,
                        scale,
                        scale
                    );
                }
            }
        }
        
        // Passer au caractère suivant
        currentX += (charWidth + spacing);
    }
}

// Fonction pour mesurer la largeur d'un texte en pixels
function measurePixelText(text) {
    const charWidth = 8;
    const spacing = 1;
    // Retourner la largeur en pixels (sans scale)
    return text.length * (charWidth + spacing) - spacing;
}

// Fonction pour wrapper le texte sur plusieurs lignes
function wrapPixelText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    const charWidth = 9; // 8 + 1 spacing
    
    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const lineWidth = testLine.length * charWidth;
        
        if (lineWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}
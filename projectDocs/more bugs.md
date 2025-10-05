# More Bugs
## Document de Game Design

---

### 📋 Vue d'ensemble

**Genre** : RPG Rétro  
**Style visuel** : Game Boy Classic  
**Plateforme** : JavaScript/HTML5  
**Thème** : Aventure d'insectes dans un monde corrompu

---

### 🎮 Concept de jeu

#### Prémisse initiale
Le joueur incarne un insecte qui, après une quête tutoriel, découvre sa colonie complètement détruite. Il devra découvrir l'origine de la corruption qui menace tout le monde des insectes.

#### Options narratives considérées

**Option écartée** : Isekai avec humain réduit  
- Concept similaire à "Epic", "Minimoys" ou "Bugs War"
- *Raison du rejet* : Peu original, risque d'incohérences narratives

**Option retenue** : Groupe entièrement constitué d'insectes  
- Fort potentiel de storytelling unique
- Cohérence narrative maintenue

---

### 📖 Structure narrative

#### Acte 1 : Tutoriel
- **Quête solo** en début de jeu
- Mécaniques de base : fetch quest, combat simple
- Retour à la colonie → Découverte du massacre

#### Acte 2 : Investigation
- Apparition progressive d'ennemis malades/corrompus
- Indices sur l'origine de la corruption
- Découverte progressive de l'étendue du désastre

#### Acte 3 : Révélation
- **Twist** : Le monde entier (un jardin de pavillon) est corrompu
- Les insectes découvrent l'existence d'entités "suprêmes" (les humains)
- Aspect **Eldritch Horror** à la Lovecraft : les humains sont des entités cosmiques incompréhensibles

---

### ⚔️ Système de combat

#### Techniques spécifiques par espèce
Chaque espèce d'insecte possède des capacités uniques basées sur leur biologie réelle :

- **Fourmi** : 
  - Jet d'acide formique
  - Attaque aux mandibules
  - Bonus d'esprit de groupe

- *[Autres espèces à définir]*

---

### 🎭 Fins multiples

Le jeu propose plusieurs fins basées sur la préparation et l'exécution du rituel d'invocation :

#### Mauvaise fin 0 : "L'insignifiance"
> Le rituel n'est même pas connu. Tu n'es qu'un insecte et on t'écrase sans autre forme de procès. Ton existence est futile.

#### Mauvaise fin 1 : "L'extermination"
> L'insecte exécute le rituel sans préparation : l'humain voit une infestation et passe tout le jardin à l'insecticide. Tu es la première victime. Tu as fait plus de mal que ton propre ennemi.

#### Mauvaise fin 2 : "La captivité"
> Le rituel est incomplet. L'humain remarque ta particularité et t'enferme avec tes camarades dans un vivarium. La corruption continue d'avancer sous tes yeux, impuissant.

#### Mauvaise fin 3 : "Roi de rien"
> Le rituel a été exécuté, partiellement, et ta demande a été entendue. Ta requête a été mal comprise - ou était-ce ton véritable message ? Te voilà seul survivant d'un jardin désherbé. Tes camarades sont morts. Vous êtes devenu le roi de rien.

#### Fin neutre 1 : "L'humanité"
> Le rituel a été exécuté, correctement, et ta demande a été entendue. L'humain a découvert l'origine de la pourriture et nettoie la partie du jardin qui a été touchée. Il ne reste qu'un désert de terre battue à la place, personne n'a été sauvé à proprement parler, mais le mal a été écarté. L'humain est conscient de votre avancée et s'intéresse de plus en plus à vous. Le moindre de vos faits et gestes est à présent scruté. Depuis ce jour, l'ombre de l'humanité est une menace incompréhensible qui est constamment présente. La vie n'est plus jamais la même et vos enfants ne connaîtront pas d'autre monde que celui-là.

#### Fin neutre 2 : "Reine-mère"

Vous êtes devenu une reine. Au-delà des prérogatives biologiques individuelles, vous avez la possibilité et le devoir de créer une nouvelle colonie. Cette terre est morte, l'avenir est ailleurs, et vos ailes vous permettent d'aller le poursuivre. La corruption s'étend, mais reste loin derrière vous. Vous ne savez pas combien de temps il vous reste avant d'être touché par le mal que vous avez fui, mais vous êtes une mère à présent : il ne vous reste plus que l'espoir pour vivre. Allez-vous sacrifier vos enfants, comme un parent indigne ? L'avenir nous le dira. Longue vie à la reine.

#### Fin positive 1 : "Le soulèvement"

Après avoir récupéré tous les artefacts pour le rituel, vous réalisez une chose pourtant évidente : tu as su allier des espèces pour une cause commune, tu t'es entouré d'amis et tous les espoirs se portent sur toi à présent. Pourquoi invoquer un humain, cette entité antédiluvienne, aussi puissante qu'incompréhensible ? Vous faites front commun, et ensemble, vous vous débarrassez de l'origine de la corruption. Vous perdez la vie dans le processus, mais une chose est sûre : votre courte existence va laisser une empreinte durable sur le monde qui vous entoure. Vous ne devez rien à personne. Vos enfants connaîtront la paix et la prospérité.

#### Fin positive 2 : "La métamorphose"

Vous avez accompli l'impossible. Vous êtes devenu une reine, plus encore, une héroïne. Votre dernier combat vous a gravement blessé et vous ne serez plus jamais la même. Sans votre métamorphose, vous auriez sans doute péri... Mais vous êtes en vie. Vos exploits sont légendaires et bien que vous n'ayez pas de décendance, vous laissez derrière vous un monde qui connaitra demain.

#### Fin positive 3 : "L'avenir"
Vous avez tout donné, jusqu'à votre vie, pour offrir un avenir à autrui. Avant de mourir, vous avez laissé deux oeufs derrière vous, deux de vos enfants qui auront un avenir qui ne connaitra jamais l'horreur de la corruption. Félicitation, vous êtes une héroïne et une mère dévouée.

#### [Bonne fin à définir]
Préparation complète du rituel avec artefacts humains :
- Bouchon de bouteille
- Trombone
- Élastique
- *[Autres objets à définir]*

---

### 🔧 Requis techniques

#### Fonctionnalités essentielles
- **État global** pour modifier le monde à chaque étape narrative
- **Éditeur de cartes** capable de gérer :
  - Différences de statut selon l'état global
  - Changements de position des éléments
  - Évolution du monde corrompu

#### Système de groupe
- Groupe de **4 personnages jouables**
- Gestion des capacités spécifiques par espèce
- Interface de gestion du groupe

---

### 📝 Notes de développement

#### Points forts du concept
- Originalité du point de vue insecte
- Mélange unique RPG classique / horreur cosmique
- Fins multiples offrant de la rejouabilité
- Mécaniques basées sur la biologie réelle des insectes

#### Défis à anticiper
- Cohérence de l'échelle insecte/humain
- Balance entre humour et horreur
- Clarté du système de rituel pour le joueur
- Gestion de la progression avec état global
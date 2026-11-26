# Reprise intégrale de GaiaRP

Source immuable : [GaiaRP @ 6a5324d5bea9758c94e19305bc8c3e25979897e8](https://github.com/ShiivMods/GaiaRP/tree/6a5324d5bea9758c94e19305bc8c3e25979897e8).

- 31 fichiers source utiles : repris dans src/legacy/ (dont 3 adaptations explicites). Les autres fichiers sont copiés sans réécriture.
- 53 fichiers publics : copie exacte dans public/, vérification par empreinte Git. Le fichier 404.html de GitHub Pages est archivé, car Next.js gère les routes.
- 20 fichiers de référence (documentation originale, configuration Vite, point d’entrée et versions originales des trois adaptateurs) : conservés dans migration/reference/ dans le dépôt.
- Le manifeste migration/manifest.json inventorie chaque fichier source, chaque asset et chaque fichier de référence.

## Écrans

Accueil visiteur, pont joueur, carte galactique/secteurs/systèmes/planètes/zones/lieux et installations, navigation historique, personnages, membres, dynasties, configuration des vaisseaux, missions, RP, combat actif et archive historique, lore (histoire, factions, espèces, faune, religions, découvertes/technologies), événements, compte. Aucun nouveau contenu de jeu n'est ajouté.

## Adaptations

L'ancien projet utilisait déjà React/TypeScript. Next.js remplace Vite comme point d'entrée et serveur. Le catch-all rétablit les routes historiques et l'App garde sa navigation. Les boutons inscription et connexion ouvrent les routes locales existantes. Le compte historique reste /compte, le compte persistant /compte/local. Le combat historique reste accessible et l'instance de test connectée est accessible depuis l'écran actif et /dev/combat. Les simulations historiques sont conservées, non présentées comme des fonctions serveur terminées.

Le lint de la nouvelle application reste actif ; la copie historique est temporairement exclue du lint React moderne afin de ne pas modifier silencieusement les composants de la maquette. TypeScript et le build Next.js vérifient toujours les sources importées.

Les binaires et références ont été importés dans Git, après vérification des empreintes. Le workflow ponctuel d'import est retiré après cette opération ; npm run assets:sync reste disponible pour restaurer des fichiers manquants depuis le commit historique. Pas de téléchargement au lancement, ni service externe nécessaire après import.

La parité visuelle et interactive nécessite encore une recette navigateur ; la présence du code n'est pas une preuve de parité.

Les liens de retour à l'accueil depuis les pages locales utilisent une navigation complète pour isoler les feuilles de style ; exception ESLint ciblée et documentée.

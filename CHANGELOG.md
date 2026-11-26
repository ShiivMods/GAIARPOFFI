# Changelog GAIA RP officiel

## 0.1.0-dev.8 (26 novembre 2026)
- Sexe et factions disponibles par espèce, Homme/Femme/Non-défini pour Humain ; descriptions facultatives.
- Migration locale v4 préservant les personnages ; tests de validation.
- Relecture des notes de conception retrouvées, sans appliquer les arbitrages non validés.

## 0.1.0-dev.7 (26 novembre 2026)
- Inscription 1.1/1.2 selon le croquis, identifiants vérifiés puis personnage et dynastie créés uniquement à Embarquer.
- Migration SQLite v3 non destructive, brouillon temporaire, mot de passe haché, connexion avec mot de passe.
- Règles âge/académie et unicité des dynasties ; aucune compétence ou description d’académie inventée.
- Correction de la dernière erreur TypeScript du routeur historique ; tests à valider.

## 0.1.0-dev.6 (26 novembre 2026)
- Reprise intégrale des écrans et données TypeScript/React de GaiaRP dans Next.js, accueil et URL d’origine.
- Comptes SQLite et terrain de combat connecté conservés, reliés depuis les écrans historiques.
- Copie des fichiers publics originaux avec contrôle d’empreinte ; aucune invention de contenu.
- CI et parité navigateur à confirmer.

## 0.1.0-dev.5 (26 novembre 2026)
- Restauration de l’interface de combat historique et de ses styles, récupération vérifiée des illustrations d’origine au lancement.
- Caractéristiques persistantes, communications RP, scanner initial, rapports et archives, décision de reddition.
- Arbitrage MJ manuel provisoire, sans inventer de formule automatique de tir.
- Correction du lint des tests SQLite ; nouveaux tests de parcours. Recette navigateur et CI à confirmer.

## 0.1.0-dev.4 (26 novembre 2026)
- Remplacement de PostgreSQL/Docker par SQLite intégré à Node.js 22.13+.
- Initialisation automatique des comptes et du scénario au premier accès, aucune commande DB nécessaire.
- Conservation des sessions, permissions, ordres et transactions de combat.
- Tests DB isolés sans conteneurs, documentation et CI mises à jour. Ancienne CI dev.3 échouée sur le test DB ; nouvelle validation à confirmer.
- Pas d'import automatique des anciennes données PostgreSQL ; aucun hébergement activé.

## 0.1.0-dev.3 (26 novembre 2026)
- Scénario Starlight persistant PostgreSQL, trois joueurs et contrôle MJ.
- Interface de planification, synchronisation périodique, ordres, Ready et reddition.
- Verrou transactionnel, révision, projection par participant et réinitialisation réservée au MJ.
- Tests d’intégration DB (concurrence, persistance et permissions) ; validation à confirmer.
- CI dev.2 réussie (45769088467). Pas de résolution automatique.

## 0.1.0-dev.2 (26 novembre 2026)
- Reprise des règles de dégâts, seuils et actions de la maquette.
- Planification pure des tours, Ready Check, reddition majoritaire, propriété du participant et projection des ordres.
- Documentation COMBAT.md et tests unitaires ; aucune résolution de tir automatique ni persistance de combat à ce stade.
- CI dev.1 réussie (run 45768821948).

## 0.1.0-dev.1 (26 novembre 2026)
- Stratégie Local First : PostgreSQL 17 Docker, migrations SQL et fixtures de cinq comptes.
- Inscription et connexion simulées, profil, déconnexion, sessions persistantes, outils de test.
- Mode local interdit hors développement, e-mails fictifs uniquement, rôles côté serveur.
- CI avec PostgreSQL et tests de la couche auth ; validation à confirmer.
- Aucun service cloud activé.

## 0.1.0-dev.0 (25 novembre 2026)
- Création du socle Next.js App Router / TypeScript strict.
- Séparation prévue de l'interface, des modules, des règles de jeu et du serveur.
- Mise à jour des documents de cadrage et réinitialisation du suivi officiel.
- Aucun système de jeu ni authentification implémenté.
- Installation, lockfile, compilation et audit à valider.

---

> **Archive de la maquette (ShiivMods/GaiaRP).** Le texte qui suit est conservé pour les règles métier et les décisions de conception. Les mentions d'implémentation, de versions, de routes, de GitHub Pages, de Vite, de dépendances et les cases cochées décrivent uniquement l'ancien dépôt. Elles ne prouvent rien sur GAIARPOFFI. En cas de conflit technique, la section officielle ci-dessus prévaut. Les règles métier non remplacées restent applicables.

## 0.6.dev52
- Ajout d'une page Évènements avec un état vide lorsqu'aucun évènement n'est actif.
- Ajout d'une page Compte présentant le futur cycle de 7 bonus de connexion sur une fenêtre de 11 jours et le bonus du premier RP du jour, sans inventer les récompenses encore non définies.
- Les personnages peuvent désormais enregistrer jusqu'à deux Grands Avatars ; le Grand Avatar choisi au moment de publier un RP est mémorisé avec le message.
- Mise en place d'un routing léger basé sur l'History API : Accueil, pont joueur, carte, Membres, personnages, dynasties, vaisseaux, RP, combat, Lore, Évènements, Compte et accès admin disposent désormais d'URL dédiées.
- Les boutons précédent/suivant du navigateur restaurent les pages principales et les liens directs sont compatibles avec GitHub Pages grâce à une page 404 de redirection vers la SPA.

## 0.6.dev51
- Correctif GitHub Pages : le script `build` utilise désormais directement Vite au lieu de lancer `tsc -b` avant la compilation.
- Cela contourne le blocage TS2882 de TypeScript 7 sur l’import CSS `./styles.css`, qui empêchait toute nouvelle version d’être déployée.
- Le correctif des chemins d’assets de la dev49/dev50 est conservé : les images utilisent `import.meta.env.BASE_URL` pour fonctionner sous `/GaiaRP/`.
- Le script `typecheck` reste disponible séparément pour les contrôles TypeScript locaux.

## 0.6.dev50
- Correctif de build GitHub Pages : désactivation explicite de `noUncheckedSideEffectImports` pour empêcher TypeScript de bloquer sur `import './styles.css'`.
- Conservation du correctif dev49 pour les chemins d’assets basés sur `import.meta.env.BASE_URL`.
- Déclaration CSS conservée dans `src/vite-env.d.ts` pour compatibilité.

## 0.6.dev49
- Correction globale des chemins d’assets pour GitHub Pages et les déploiements sous un sous-dossier comme `/GaiaRP/`.
- Ajout d’un résolveur central basé sur `import.meta.env.BASE_URL` pour les planètes, lunes, stations, avatars, vaisseaux et illustrations du Lore.
- Les deux décors CSS du vaisseau sont désormais gérés comme assets Vite afin de respecter automatiquement le chemin de base du déploiement.
- Ajout de `src/vite-env.d.ts` dans la version distribuée pour que le build TypeScript/Vite fonctionne aussi sur GitHub Actions.
- Aucun contenu de jeu ni placement de la carte n’a été modifié.

## 0.6.dev48
- Inversion des illustrations de panneau entre Station Hélios et Argos, comme demandé.
- Reprise du visuel de Starlight avec l’image validée, mieux intégrée au centre de la carte système.
- Starlight devient cliquable sur la carte système et affiche désormais sa propre fiche avec type, température et rayon.

## 0.6.dev47
- Correction de l’affichage du soleil de Starlight sur la carte système : image recentrée, agrandie et découpée proprement en cercle pour supprimer l’effet de carré noir.

## 0.6.dev46
- Intégration des nouveaux visuels de carte pour Argos, Station Hélios et Bastion Elysia dans le système Starlight.
- Remplacement du soleil stylisé de Starlight par l’illustration dédiée sur la carte système.
- Les panneaux détaillés des installations conservent leurs images existantes ; seuls les marqueurs de carte utilisent les nouveaux PNG.

# Changelog dev45

- La zone Lore remonte désormais automatiquement en haut lors de l’ouverture d’une nouvelle page, fiche ou vue de lecture.
- Le comportement est notamment appliqué aux fiches Archives, aux retours de fiche, aux changements Chronologie / Archives et aux autres sous-pages du Lore.
- Base : dev44.

# Changelog dev44

## Base
- Reprise propre depuis la dev41, sans réutiliser la branche cassée suivante.

## Lore > Histoire Galactique > Archives
- Ajout d’un panneau visuel dans la fiche d’archive.
- Intégration du portrait validé d’Elias Kern.
- Ajout d’un placeholder de "mode édition" pour préparer le futur module d’administration.
- Renommage de la catégorie "Institutions historiques" en "Institutions".
- Ajout des archives de test : Le Directoire, La Commission, Alecto.

## Factions > Humanis
- Remplacement du texte générique par un texte d’histoire/société de test basé sur tes consignes.

## Assets
- Ajout de /public/elias-kern-grand.png.

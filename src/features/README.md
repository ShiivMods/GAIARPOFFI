# Modules fonctionnels

Un dossier par module lorsque son implémentation commence : auth, combat, roleplay, progression. Les composants visuels ne décident pas du résultat des actions. Les règles de jeu indépendantes résident dans `src/game/` ; les opérations privilégiées et accès aux données dans `src/server/`.

Aucun module fonctionnel n'est implémenté à ce stade.

---

> **Archive de la maquette (ShiivMods/GaiaRP).** Le texte qui suit est conservé pour les règles métier et les décisions de conception. Les mentions d'implémentation, de versions, de routes, de GitHub Pages, de Vite, de dépendances et les cases cochées décrivent uniquement l'ancien dépôt. Elles ne prouvent rien sur GAIARPOFFI. En cas de conflit technique, la section officielle ci-dessus prévaut. Les règles métier non remplacées restent applicables.

# Fonctionnalités

Chaque dossier de `features/` regroupe désormais une partie fonctionnelle du site.

Règle de travail :

- les fichiers `*Data.ts` contiennent en priorité les données faciles à modifier ;
- les fichiers `*.tsx` contiennent l'affichage et les interactions ;
- éviter de remettre de grosses listes de données directement dans `App.tsx`.

`App.tsx` doit rester le coordinateur général de la navigation, pas redevenir le fichier unique de tout le projet.

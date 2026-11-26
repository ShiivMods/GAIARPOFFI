# GAIA RP

Plateforme de jeu de rôle écrit de science-fiction. Priorités : inscription, combats, RP, progression.

## Lancer en local

Prérequis : Node.js 22.13 ou supérieur (22 LTS recommandé) et npm. Dans le dossier du projet :

```cmd
npm install
npm run dev
```

Ouvrir http://127.0.0.1:3000. Aucun Docker, VM, service PostgreSQL, fichier .env ni compte cloud n'est requis. SQLite est intégré à Node.js ; le fichier .gaia/local.sqlite et les cinq comptes fictifs sont initialisés automatiquement au premier accès à la base. Une éventuelle alerte ExperimentalWarning de Node sur SQLite n'est pas une erreur. Les données locales restent sur le disque et sont ignorées par Git.

Ancienne configuration PostgreSQL : les anciennes variables DATABASE_URL ne sont plus utilisées. Les données PostgreSQL ne sont pas importées. Ne pas supprimer une ancienne base si elle contient des données à conserver.

## Terrain d'essai

Sur /dev, incarner Joueur 01 et Joueur 02 (Raviolo) et Joueur 03 (K-17) dans trois profils de navigateur distincts, puis ouvrir /dev/combat. Tester les ordres, Ready et la reddition. Synchronisation toutes les 3 secondes. Le MJ peut réinitialiser le scénario. Les tirs ne sont pas encore résolus.

## Validation

```cmd
npm run check
npm test
npm audit
```

Les tests DB utilisent chacun un dossier temporaire indépendant et ne touchent pas aux données de jeu. Le mode comptes fictifs est réservé à next dev sur localhost ; option GAIA_LOCAL_AUTH=0 pour le désactiver. Aucun déploiement public n'est configuré. L'intégration Supabase/Auth/Vercel sera traitée lors de la mise en ligne, qui ne marque pas la fin du développement.

[PROJECT.md](PROJECT.md) · [SCOPE.md](SCOPE.md) · [SECURITY.md](SECURITY.md) · [CHECKLIST.md](CHECKLIST.md) · [COMBAT.md](COMBAT.md) · [CHANGELOG.md](CHANGELOG.md)

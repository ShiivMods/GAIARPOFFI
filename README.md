# GAIA RP

Plateforme web de support à un jeu de rôle écrit de science-fiction. Le RP et les MJ gardent le contrôle narratif ; les règles mécaniques sont exécutées par un moteur de jeu autoritaire côté serveur.

## État

Dépôt officiel en initialisation. Aucun compte ni système de jeu opérationnel. Aucun déploiement public configuré.

Priorités : inscription, combats, RP, progression. L'ancien dépôt [GaiaRP](https://github.com/ShiivMods/GaiaRP) demeure la référence de la maquette, pas l'état technique courant.

## Développement local

Prérequis : Node.js 22.13+ (branche 22 recommandée) et npm. Depuis la racine :

```sh
npm install
npm run dev
```

Ouvrir http://localhost:3000. Le premier `npm install` doit produire un `package-lock.json` à versionner après vérification ; ensuite utiliser `npm ci`.

```sh
npm run lint
npm run typecheck
npm run build
npm audit
```

Le démarrage ne nécessite pas de compte Supabase à ce stade. Copier `.env.example` vers `.env.local` seulement lorsque le projet Supabase dédié sera disponible. Ne jamais commiter `.env.local` ni de clé privilégiée.

## Documentation

- [PROJECT.md](PROJECT.md) : architecture et conventions
- [SCOPE.md](SCOPE.md) : exigences métier
- [SECURITY.md](SECURITY.md) : sécurité
- [CHECKLIST.md](CHECKLIST.md) : suivi actuel
- [CHANGELOG.md](CHANGELOG.md) : historique

La documentation historique est conservée dans les sections d'archive et dans le commit de transfert initial.

# GAIA RP

Plateforme de jeu de rôle écrit de science-fiction. Priorités : comptes locaux, combats, RP, progression.

## Démarrage local (Windows)

Prérequis : Node.js 22.13+ et npm, Docker Desktop démarré (conteneurs Linux). Depuis la racine du dépôt :

```powershell
Copy-Item .env.example .env.local
npm install
npm run db:up
npm run db:setup
npm run dev
```

Ouvrir http://127.0.0.1:3000. Conserver la même adresse pour les cookies. L’inscription accepte seulement des adresses fictives @example.test, sans mot de passe. /dev donne accès à trois joueurs, un MJ et un administrateur. Utiliser plusieurs profils de navigateur pour des sessions simultanées. Ne jamais utiliser de données réelles ni exposer le serveur sur le réseau. Les données persistent dans un volume Docker. `npm run db:down` arrête PostgreSQL sans effacer ses données.

## Validation

```powershell
npm run check
$env:NODE_ENV = "development"
npm run test:auth
Remove-Item Env:NODE_ENV
npm audit
```

Le lockfile généré par npm install doit être versionné ; ensuite utiliser npm ci. Les services Supabase/Auth/Vercel sont volontairement différés. L’application de production ne permet aucun parcours local, même avec GAIA_LOCAL_AUTH=1. Aucun déploiement public configuré.

## Documentation

[PROJECT.md](PROJECT.md) · [SCOPE.md](SCOPE.md) · [SECURITY.md](SECURITY.md) · [CHECKLIST.md](CHECKLIST.md) · [CHANGELOG.md](CHANGELOG.md)

Ancienne maquette : [GaiaRP](https://github.com/ShiivMods/GaiaRP).

# Couche serveur

AuthProvider sépare l'identité métier du fournisseur. SQLite local (node:sqlite) et initialisation automatique dans db/local.ts ; sessions et combat utilisent des requêtes paramétrées et transactions. Le mode local n'est actif qu'en développement et peut être désactivé par GAIA_LOCAL_AUTH=0. Le futur stockage hébergé devra remplacer ces adaptateurs, sans transférer les sessions simulées.

Inscription locale en deux étapes : registration.ts, password.ts et migration SQLite v3. Compte, dynastie et personnage créés atomiquement. Ne pas transférer les brouillons, mots de passe de test ou sessions locales au fournisseur hébergé.

# Couche serveur

Cette couche hébergera les opérations d'authentification, permissions, transactions, accès PostgreSQL et appels éventuels à l'IA. Les modules contenant des secrets ou des accès privilégiés devront être protégés contre l'import côté client. La validation serveur et les politiques RLS s'appliqueront avant toute mutation sensible.

Pas de fournisseur connecté, pas de secret, pas d'opération serveur métier à ce stade.

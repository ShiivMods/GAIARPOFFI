# Administration
Décision : 26 novembre 2026.

Page /administration réservée aux rôles administrateur et maître du jeu. Bouton de navigation affiché uniquement pour ces comptes, permissions calculées à partir de la session serveur. Les visiteurs sont redirigés vers la connexion ; les joueurs connectés ne peuvent pas accéder à la page.

Le futur espace sert à gérer les joueurs dans leur ensemble. Les modules exacts et leurs permissions seront définis ultérieurement. Aucun nouveau module de gestion n'est créé dans cette version.

## Accès existants provisoires
- Vue d'ensemble : administrateur et MJ.
- Validation des diplômes : MJ exclusivement (règle déjà validée).
- Aperçu administratif historique de la carte : administrateur. Le bouton Admin de la carte et la route historique /admin sont restreints. Le changement de mois historique est une simulation locale, pas un outil de gestion du temps définitif.

Les rôles restent distincts : l'administrateur n'obtient pas implicitement les fonctions du MJ. Le catalogue de permissions est explicite ; tout futur module et action devra contrôler ses droits côté serveur. Les données historiques de carte restent intégrées au client : masquer le mode Admin ne les rend pas secrètes. Leur séparation sera nécessaire avant publication. Les outils de changement de compte restent uniquement accessibles en mode développement local.

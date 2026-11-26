# Combat spatial : GAIA Core

Référence historique : GaiaRP, branche main, `src/features/combat/combatRules.ts`, `combatData.ts`, `CombatPage.tsx` et SCOPE.md §16. Les archives de combat de la maquette sont des exemples écrits, pas des résultats calculés.

## Règles reprises

- Dégâts standards : bouclier, blindage, coque dans cet ordre. Débordement transféré à la couche suivante ; coque à zéro = destruction.
- Propulsion : intégrité 0 = vitesse/esquive 0 ; 1–20 % = 50 % vitesse / 30 % esquive ; >20–65 % = 75 % / 90 % ; >65 % = 100 % / 100 %.
- Armement : intégrité 0 = dégâts 0 ; 1–20 % = 50 % ; >20–65 % = 75 % ; >65 % = 100 %.
- 2 PA par participant dans la maquette. Actions distinctes : tir (1), double salve (2), esquive (1), renfort bouclier (1), scan (1).
- Ordres simultanés. Ready exige au moins un ordre valide ; modifiable après annulation Ready tant que la résolution n'a pas commencé.
- Ready et vote de reddition mutuellement exclusifs. Majorité stricte des membres d'un équipage pour la reddition.
- Adversaires : statut visible, ordres cachés jusqu'à résolution. Alliés : ordres validés visibles.

## Implémentation actuelle

Moteur TypeScript pur : calculs de dégâts, catalogue et budget, commandes de planification, propriété du participant, révision optimiste, projection filtrée, détection du Ready Check et de la majorité. Aucun calcul de résolution automatique n'est inventé. Les commandes sont désormais reliées à un scénario de test local persistant, sous contrôle de la session serveur.

Décisions techniques provisoires : scénario limité à deux vaisseaux ; une majorité suspend globalement la planification et peut être annulée avant la décision de reddition (la maquette montre la suspension lorsqu'un adversaire a déjà validé, mais ne décrit pas complètement les autres cas). Le dernier Ready signale une résolution possible, il ne lance pas encore de dégâts ; annulation possible tant que celle-ci n'est pas exécutée. Validation stricte des nombres et des identifiants. La révision est vérifiée sous verrou transactionnel et les comptes sont identifiés via session.

## À définir / retrouver avant résolution complète

- Formules de toucher, esquive, dégâts d'armes, ciblage et avaries de systèmes.
- Effets exacts du renfort bouclier et du scan, durée et cumul des effets.
- Répartition des actions par poste, équipement et nombre de participants ; exceptions au budget.
- Arbitrage du simultané, décision du capitaine sur la reddition et cas de refus, retrait, destruction mutuelle.
- Archivage des tours, intégration RP, progression, permissions MJ complètes et recette multijoueur.

La projection ne doit jamais être remplacée par l'état brut dans une réponse client. Aucun résultat de combat ne sera accepté depuis le navigateur.

## Terrain d’essai local (dev.3)

Route `/dev/combat`. Scénario unique Starlight : joueur 01/Lysa et joueur 02/Nael à bord du Raviolo ; joueur 03/Poste A à bord du K-17. Fixtures jetables, pas de personnages définitifs. Le MJ peut réinitialiser uniquement ce scénario ; l’administrateur n’hérite pas de droits de jeu. Les choix sont enregistrés immédiatement dans SQLite (état JSON de la planification locale) et synchronisés par rafraîchissement toutes les 3 secondes lorsque la page est visible. Chaque mutation exige une session, vérifie la propriété via l’UUID serveur, ouvre une transaction d’écriture (`BEGIN IMMEDIATE`), contrôle la révision et renvoie uniquement une projection filtrée. En cas de conflit, une commande est rejetée et doit être renouvelée. La réinitialisation augmente la révision, évitant la réutilisation d’anciens formulaires. Le MJ ne voit que les compteurs et peut réinitialiser, pas les ordres privés. Ce modèle est un banc de test local ; le stockage durable des vaisseaux, personnages, historiques et participants définitifs reste à concevoir. Aucun tir, changement de points de vie ou passage au tour suivant n’est simulé sans formule validée.

## dev.4 : simplification locale
Le scénario et les comptes sont initialisés automatiquement dans .gaia/local.sqlite. Aucun Docker. Chaque opération ouvre et ferme sa connexion SQLite ; les écritures restent transactionnelles avec contrôle de révision. Les tests travaillent sur des bases temporaires, pas le fichier utilisateur. Les mécaniques de combat ne changent pas.

## dev.5 : retour à la référence historique
La présentation et les styles de la maquette sont repris (cartes des vaisseaux, intégrité, ordres, équipages, Ready, reddition, rapports, communications). Les cinq illustrations originales sont récupérées au premier lancement depuis le commit historique et contrôlées par leurs empreintes Git ; pas de service requis après récupération. Les valeurs du Raviolo et du K-17 sont celles de la maquette. Le scan révèle la première estimation de vitesse après un tour résolu. Les communications de bord restent privées à l’équipage, le canal externe est partagé. Les ordres résolus et les messages visibles sont archivés. Confirmation du dernier Ready. Le capitaine adverse peut accepter ou refuser une reddition majoritaire. Une résolution manuelle MJ (dégâts reçus et renforts) sert de banc de test temporaire ; le serveur applique les réparations avant les dégâts du même tour, puis bouclier/blindage/coque, détecte la destruction, archive et ouvre le tour suivant. Pas de nouvelle formule de tir. Les permissions de poste, avaries ciblées, paliers du scan, effets exacts d’esquive, armes et règles de cumul des PA restent à finaliser. La liaison à un vrai RP n’existe pas encore.

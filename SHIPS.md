# Vaisseaux : règles confirmées

Références : Vaisseaux.txt (notes historiques) et arbitrages du 26 novembre 2026.

- Le type de vaisseau ne fournit aucun PA. Les PA proviennent des personnages ; équilibrage séparé.
- La navette est un modèle spécial pour débutants, sans emplacements ordinaires. Hors exception, les équipements T1 de base (moteur, propulseur, scanner, bouclier) sont exempts de poids.
- Capacité du bouclier = capacité du générateur installé, sans réserve de coque supplémentaire.
- Un point de poids retire un point de vitesse ; multiplicateurs de vitesse après le calcul de poids, passifs d'équipage en dernier. Minimum de vitesse avec équipement : 1 ; pas de plafond. Propulsion endommagée en combat reste un calcul séparé.
- Armes de pilote et modules dédiés reviennent au titulaire du poste, sinon au capitaine. Le capitaine peut occuper un poste disponible mais ne combine pas deux postes dans un tour.

## Implémentation
Le calcul pur src/game/ships/stats.ts est raccordé au panneau de modification historique. Les bonus plats du prototype sont conservés provisoirement ; aucune masse ou valeur de bonus de passager n'a été inventée. Les poids non renseignés sont signalés et la vitesse affichée comme provisoire. Les valeurs numériques, les conventions de cumul des pourcentages et les passifs réels restent à équilibrer. Le catalogue actuel ne représente pas les modèles définitifs.
Le validateur de postes src/game/combat/stations.ts est testé indépendamment ; les ordres actuels ne désignent pas encore leur arme/poste précis, donc la restriction ne peut pas être appliquée sans arbitrage sur le catalogue. Les caractéristiques du combat de test restent distinctes des équipements configurables ; leur liaison est à faire.

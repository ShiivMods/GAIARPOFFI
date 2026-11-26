# Inscription 1.1 et 1.2

Référence : croquis et consignes du 26 novembre 2026.

## 1.1
E-mail et mot de passe, validation de format, de longueur et d'unicité côté serveur. Aucun compte, dynastie ou personnage créé à ce stade. Un brouillon temporaire (30 minutes) stocke uniquement l'e-mail normalisé et le hash salé du mot de passe ; cookie HttpOnly contenant un jeton aléatoire. Pas d'envoi d'e-mail en local. Critère de mot de passe provisoire : 12 à 128 caractères ; à réévaluer avec l'authentification hébergée. Les identifiants de test doivent rester fictifs.

## 1.2
Nom de dynastie unique, prénom, espèce, sexe et faction (listes autorisées par espèce : Humain → Homme, Femme, Non-défini ; Humanis uniquement), taille (cm), poids (kg), âge, académie (Sciences, Ingénierie, Militaire, Politique), histoire et caractère/traits physiques facultatifs, modifiables ultérieurement. Conseils contextuels et infobulles. Âge inférieur à 16 ans : aucune académie. À partir de 16 ans, diplôme obligatoire pour Humanis. Les bonus et compétences innées ainsi que les descriptions détaillées des spécialités ne sont pas inventés. Les noms de dynasties de l'annuaire historique sont réservés ; l'unicité locale est insensible à la casse et aux espaces de bord. Le rattachement à une dynastie existante sera développé séparément.

## Embarquer
Revalidation côté serveur des identifiants (disponibilité et brouillon non expiré) et du formulaire. Une transaction SQLite crée les trois entités et la session ou n'en crée aucune. Le brouillon est consommé après succès. Le profil enregistré est consultable dans /compte/local. Les écrans historiques de personnages, dynasties et membres ne sont pas encore alimentés par ces nouvelles données. Le mot de passe est exigé pour les nouvelles connexions ; seules les cinq fixtures Dev Tools peuvent être incarnées sans mot de passe. Les anciens comptes locaux créés sans mot de passe hors fixtures restent en base mais ne sont plus connectables. Pas de migration destructrice.

## Validation à faire
Tests navigateur et CI ; confirmation de propriété e-mail, récupération, protections anti-abus, fournisseur d'authentification hébergé à la mise en ligne.

## dev.8
Catalogue partagé client/serveur des sexes et factions disponibles par espèce ; aucune autre espèce ajoutée. Migration v4 : personnages locaux existants préservés et sexe initialisé à Non-défini, faute d’information. Les nouvelles inscriptions exigent un choix explicite. Les deux textes sont facultatifs. La modification ultérieure des fiches reste à implémenter. L’âge de 16 ans reste en vigueur pour le formulaire en attendant arbitrage des notes retrouvées (14/18 ans). Voir NOTES-REVIEW.md.

## Arbitrages du 26 novembre 2026
Sciences → Scientifique ; Ingénierie → Technicien ; Militaire → Soldat ; Politique → Officiel. La « surspécialisation » intervient plus tard et reste un terme de conception, pas une appellation officielle dans le lore. Le compte de référence est créé avec le premier personnage et peut en contenir d'autres ; le joueur sélectionnera son personnage actif. Âge et académie restent en discussion ; aucun changement de seuil dans cette version.

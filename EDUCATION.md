# Formation et âge chez Humanis

Décision validée le 26 novembre 2026.

| Âge | Formation | Gains de spécialisation |
| --- | --- | --- |
| 0–13 | Enfance, aucune académie | 0 % |
| 14–17 | Académie accessible, étudiant si inscrit | 25 % en formation |
| 18–20 | Première majorité ; diplôme à la création ou après RP validé par MJ | 100 % si diplômé, 25 % si encore étudiant |
| 21+ | Seconde majorité ; permis de vaisseau et capitainerie accessibles selon les règles RP | Selon statut de formation |

À la création d'un adulte (18+) l'académie est obligatoire et le personnage est diplômé. Pour un étudiant existant, l'âge seul ne déclenche jamais un diplôme : accomplissement RP puis activation exclusive par un MJ à partir de 18 ans. Le statut de formation est persistant et distinct de l'âge. Interprétation opérationnelle du choix facultatif à 14–17 ans : sans académie, aucun gain de spécialisation ; l'inscription ultérieure en académie reste à développer.

Sciences → Scientifique ; Ingénierie → Technicien ; Militaire → Soldat ; Politique → Officiel. La spécialisation est acquise au diplôme ; la surspécialisation est une orientation ultérieure, terme de conception seulement. Les gains ne sont pas encore distribués : seul le taux est défini et exposé.

## Validation MJ
/dev/academies : outil local provisoire, réservé au rôle MJ (pas administrateur par défaut). Référence du RP obligatoire, vérification humaine, transaction de validation et trace du MJ, référence, date. Pas de doublon ni d'activation avant 18 ans. La validation devra être intégrée au futur outil RP/MJ ; aucun contrôle automatique d'existence du RP tant que les RP ne sont pas persistants. Aucun outil de vieillissement ajouté.

Migration SQLite v5 : préserve les personnages existants et leur académie. Les anciens inscrits de 16–17 ans avec académie deviennent étudiants ; les anciens adultes avec académie sont considérés diplômés à la création. Les autres restent sans académie.

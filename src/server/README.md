# Couche serveur

L’interface AuthProvider sépare le moteur de l’authentification. local-provider utilise PostgreSQL exclusivement local ; session.ts est marqué server-only et gère les cookies. Les comptes disposent d’UUID métier stables et de rôles stockés en base. La future intégration Auth réelle devra remplacer le fournisseur et mapper les identités vérifiées sans importer les sessions de développement. Les opérations métier devront toujours vérifier le compte et ses permissions côté serveur. Aucun secret cloud ni service externe.

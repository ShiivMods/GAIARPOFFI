INSERT INTO app_accounts (email, username, role) VALUES
  ('joueur1@example.test', 'joueur_01', 'player'),
  ('joueur2@example.test', 'joueur_02', 'player'),
  ('joueur3@example.test', 'joueur_03', 'player'),
  ('mj@example.test', 'maitre_du_jeu', 'gm'),
  ('admin@example.test', 'administrateur', 'admin')
ON CONFLICT DO NOTHING;

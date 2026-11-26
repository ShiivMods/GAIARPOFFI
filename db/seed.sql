INSERT INTO app_accounts (email, username, role) VALUES
  ('joueur1@example.test', 'joueur_01', 'player'),
  ('joueur2@example.test', 'joueur_02', 'player'),
  ('joueur3@example.test', 'joueur_03', 'player'),
  ('mj@example.test', 'maitre_du_jeu', 'gm'),
  ('admin@example.test', 'administrateur', 'admin')
ON CONFLICT DO NOTHING;

-- Create the shared test scenario once; subsequent setup runs preserve orders.
WITH roster(email, member_id, ship_id, member_name, station, position) AS (
  VALUES ('joueur1@example.test', 'lysa', 'raviolo', 'Lysa Arven', 'Capitaine', 1),
         ('joueur2@example.test', 'nael', 'raviolo', 'Nael Coris', 'Pilote', 2),
         ('joueur3@example.test', 'k17-captain', 'k17', 'Poste A', 'Commandement', 3)
)
INSERT INTO local_combat_scenarios (id, state)
SELECT 'starlight', jsonb_build_object('turn', 1, 'revision', 0, 'members',
  jsonb_agg(jsonb_build_object('id', r.member_id, 'accountId', a.id::text,
  'shipId', r.ship_id, 'name', r.member_name, 'station', r.station,
  'orders', '[]'::jsonb, 'commitment', 'none') ORDER BY r.position))
FROM roster r JOIN app_accounts a ON a.email = r.email
HAVING count(*) = 3
ON CONFLICT (id) DO NOTHING;

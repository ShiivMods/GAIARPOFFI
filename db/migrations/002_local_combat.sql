-- Isolated local test scenarios. No production data or credentials.
CREATE TABLE local_combat_scenarios (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9-]{1,80}$'),
  state jsonb NOT NULL CHECK (jsonb_typeof(state) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,24}$'),
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player','gm','admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Disposable development credentials, not part of the future production auth schema.
CREATE TABLE local_auth_sessions (
  token_hash text PRIMARY KEY CHECK (length(token_hash) = 64),
  account_id uuid NOT NULL REFERENCES app_accounts(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX local_auth_sessions_account_idx ON local_auth_sessions(account_id);

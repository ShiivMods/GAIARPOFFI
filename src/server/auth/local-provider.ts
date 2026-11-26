import postgres from "postgres";
import { createHash, randomBytes } from "node:crypto";
import { localDatabaseUrl, normalizeEmail, normalizeUsername } from "./config.ts";
import type { Account, AuthProvider, Session } from "./types.ts";

export const SESSION_SECONDS = 8 * 60 * 60;
let connection: ReturnType<typeof postgres> | undefined;
function db() {
  const url = localDatabaseUrl(); // Check at every operation, including cached connections.
  connection ??= postgres(url, { max: 5, connect_timeout: 5 });
  return connection;
}

function hash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newSession(account: Account): Session {
  return { account, token: randomBytes(32).toString("hex"), expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) };
}

export const localAuth: AuthProvider = {
  async register(inputEmail, inputUsername) {
    const sql = db();
    const email = normalizeEmail(inputEmail);
    const username = normalizeUsername(inputUsername);
    if (!email || !username) return null;
    return sql.begin(async tx => {
      const [account] = await tx<Account[]>`
        insert into app_accounts (email, username) values (${email}, ${username})
        on conflict do nothing returning id, email, username, role
      `;
      if (!account) return null;
      const session = newSession(account);
      await tx`insert into local_auth_sessions (token_hash, account_id, expires_at)
        values (${hash(session.token)}, ${account.id}, ${session.expiresAt})`;
      return session;
    });
  },
  async signIn(inputEmail) {
    const sql = db();
    const email = normalizeEmail(inputEmail);
    if (!email) return null;
    return sql.begin(async tx => {
      const [account] = await tx<Account[]>`select id, email, username, role from app_accounts where email = ${email}`;
      if (!account) return null;
      const session = newSession(account);
      await tx`insert into local_auth_sessions (token_hash, account_id, expires_at)
        values (${hash(session.token)}, ${account.id}, ${session.expiresAt})`;
      return session;
    });
  },
  async getAccount(token) {
    const sql = db();
    if (!/^[0-9a-f]{64}$/.test(token)) return null;
    const [account] = await sql<Account[]>`
      select a.id, a.email, a.username, a.role from app_accounts a
      join local_auth_sessions s on s.account_id = a.id
      where s.token_hash = ${hash(token)} and s.expires_at > now()
    `;
    return account ?? null;
  },
  async signOut(token) {
    const sql = db();
    if (/^[0-9a-f]{64}$/.test(token)) await sql`delete from local_auth_sessions where token_hash = ${hash(token)}`;
  },
};

export async function closeLocalAuthConnection() {
  await connection?.end();
  connection = undefined;
}

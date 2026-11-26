import { createHash, randomBytes } from "node:crypto";
import { normalizeEmail } from "./config.ts";
import { withLocalDb, transaction } from "../db/local.ts";
import type { DatabaseSync } from "node:sqlite";
import { verifyPassword } from "./password.ts";
import type { Account, AuthProvider, Session } from "./types.ts";

export const SESSION_SECONDS = 8 * 60 * 60;
function hash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
function accountFrom(row: Record<string, unknown> | undefined): Account | null {
  if (!row) return null;
  return {id: row.id as string, email: row.email as string, username: row.username as string, role: row.role as Account["role"]};
}
export function issueSession(db: DatabaseSync, account: Account): Session {
  const session = {account, token:randomBytes(32).toString("hex"), expiresAt:new Date(Date.now()+SESSION_SECONDS*1000)};
  db.prepare("DELETE FROM local_auth_sessions WHERE expires_at <= ?").run(Date.now());
  db.prepare("INSERT INTO local_auth_sessions(token_hash,account_id,expires_at) VALUES(?,?,?)")
    .run(hash(session.token),account.id,session.expiresAt.getTime());
  return session;
}
export const localAuth: AuthProvider = {
  async signIn(inputEmail,password) {
    const email=normalizeEmail(inputEmail);
    if(!email) return null;
    return withLocalDb(db=>transaction(db,()=>{
      const row=db.prepare("SELECT id,email,username,role,password_hash FROM app_accounts WHERE email=?").get(email);
      if(!row || typeof row.password_hash!=="string" || !verifyPassword(password,row.password_hash))return null;
      const account=accountFrom(row);
      return account ? issueSession(db,account) : null;
    }));
  },
  async getAccount(token) {
    return withLocalDb(db=>{
      if(!/^[0-9a-f]{64}$/.test(token)) return null;
      return accountFrom(db.prepare("SELECT a.id,a.email,a.username,a.role FROM app_accounts a JOIN local_auth_sessions s ON s.account_id=a.id WHERE s.token_hash=? AND s.expires_at>?").get(hash(token),Date.now()));
    });
  },
  async signOut(token) {
    withLocalDb(db=>{
      if(/^[0-9a-f]{64}$/.test(token)) db.prepare("DELETE FROM local_auth_sessions WHERE token_hash=?").run(hash(token));
    });
  },
};

const TEST_EMAILS=new Set(["joueur1@example.test","joueur2@example.test","joueur3@example.test","mj@example.test","admin@example.test"]);
export async function signInTestAccount(inputEmail:string):Promise<Session|null>{
  const email=normalizeEmail(inputEmail);
  if(!email||!TEST_EMAILS.has(email))return null;
  return withLocalDb(db=>transaction(db,()=>{
    const account=accountFrom(db.prepare("SELECT id,email,username,role FROM app_accounts WHERE email=? AND password_hash IS NULL").get(email));
    return account?issueSession(db,account):null;
  }));
}

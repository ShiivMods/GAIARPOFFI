import "server-only";
import { cookies } from "next/headers";
import { localModeEnabled } from "./config";
import { localAuth, SESSION_SECONDS } from "./local-provider";
import type { Account, AuthProvider, Session } from "./types";

const COOKIE = "gaia_dev_session";
export function authProvider(): AuthProvider {
  if (!localModeEnabled()) throw new Error("Aucun fournisseur d'authentification configuré.");
  return localAuth;
}
export async function currentAccount(): Promise<Account | null> {
  if (!localModeEnabled()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? authProvider().getAccount(token) : null;
}
export async function setSession(session: Session) {
  const provider = authProvider();
  const store = await cookies();
  const old = store.get(COOKIE)?.value;
  if (old) await provider.signOut(old);
  store.set(COOKIE, session.token, {
    httpOnly: true, sameSite: "strict", secure: false, path: "/",
    maxAge: SESSION_SECONDS,
  });
}
export async function endSession() {
  const provider = authProvider();
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await provider.signOut(token);
  store.delete(COOKIE);
}

export type AccountRole = "player" | "gm" | "admin";

export type Account = {
  id: string;
  email: string;
  username: string;
  role: AccountRole;
};

export type Session = { account: Account; token: string; expiresAt: Date };

// Le moteur consomme Account.id et les permissions serveur, pas le fournisseur.
export interface AuthProvider {
  signIn(email: string, password: string): Promise<Session | null>;
  getAccount(token: string): Promise<Account | null>;
  signOut(token: string): Promise<void>;
}

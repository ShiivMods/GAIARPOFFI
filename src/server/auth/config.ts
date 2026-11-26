import { join } from "node:path";

export function localModeEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.GAIA_LOCAL_AUTH !== "0";
}

export function localDatabasePath(): string {
  if (!localModeEnabled()) throw new Error("Authentification locale désactivée.");
  return join(process.cwd(), ".gaia", "local.sqlite");
}

export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._+-]{0,62}@example\.test$/.test(email) ? email : null;
}

export function normalizeUsername(input: string): string | null {
  const username = input.trim().toLowerCase();
  return /^[a-z0-9_]{3,24}$/.test(username) ? username : null;
}

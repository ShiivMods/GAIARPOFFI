export function localModeEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.GAIA_LOCAL_AUTH === "1";
}

export function localDatabaseUrl(): string {
  if (!localModeEnabled()) throw new Error("Authentification locale désactivée.");
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (url.protocol !== "postgresql:" || !["127.0.0.1", "localhost"].includes(url.hostname) || url.port !== "54329" || url.pathname !== "/gaiarp_dev") {
    throw new Error("Base locale GAIA RP non configurée.");
  }
  return url.toString();
}

export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._+-]{0,62}@example\.test$/.test(email) ? email : null;
}

export function normalizeUsername(input: string): string | null {
  const username = input.trim().toLowerCase();
  return /^[a-z0-9_]{3,24}$/.test(username) ? username : null;
}

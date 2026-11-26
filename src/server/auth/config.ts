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
  if (email.length > 254) return null;
  const [local, domain, extra] = email.split("@");
  if (extra !== undefined || !local || !domain || local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  if (!/^[a-z0-9.!#$%&'*+/=?^_~|-]+$/.test(local)) return null;
  const labels = domain.split(".");
  return labels.length >= 2 && labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) ? email : null;
}

export function normalizeUsername(input: string): string | null {
  const username = input.trim().toLowerCase();
  return /^[a-z0-9_]{3,24}$/.test(username) ? username : null;
}

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;
export function validPassword(value: string): boolean {
  return typeof value === "string" && value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX;
}
export function hashPassword(password: string): string {
  if (!validPassword(password)) throw new Error("Invalid password");
  const salt = randomBytes(16);
  const digest = scryptSync(password, salt, 64);
  return "scrypt$"+salt.toString("hex")+"$"+digest.toString("hex");
}
export function verifyPassword(password: string, stored: string): boolean {
  if (!validPassword(password)) return false;
  const [algorithm,salt,digest,extra]=stored.split("$");
  if (algorithm!=="scrypt" || extra!==undefined || !/^[0-9a-f]{32}$/.test(salt??"") || !/^[0-9a-f]{128}$/.test(digest??"")) return false;
  return timingSafeEqual(scryptSync(password,Buffer.from(salt,"hex"),64),Buffer.from(digest,"hex"));
}

"use server";
import { notFound, redirect } from "next/navigation";
import { localModeEnabled } from "@/server/auth/config";
import { authProvider, endSession, setSession } from "@/server/auth/session";
import type { Session } from "@/server/auth/types";

function field(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" && value.length <= 128 ? value : "";
}
export async function registerAction(data: FormData) {
  if (!localModeEnabled()) notFound();
  let session: Session | null;
  try {
    session = await authProvider().register(field(data, "email"), field(data, "username"));
    if (session) await setSession(session);
  } catch {
    redirect("/inscription?error=database");
  }
  if (!session) redirect("/inscription?error=invalid");
  redirect("/compte/local");
}
export async function signInAction(data: FormData) {
  if (!localModeEnabled()) notFound();
  let session: Session | null;
  try {
    session = await authProvider().signIn(field(data, "email"));
    if (session) await setSession(session);
  } catch {
    redirect("/connexion?error=database");
  }
  if (!session) redirect("/connexion?error=invalid");
  redirect("/compte/local");
}
export async function signOutAction() {
  if (!localModeEnabled()) notFound();
  await endSession();
  redirect("/");
}

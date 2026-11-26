import "server-only";
import { notFound, redirect } from "next/navigation";
import { currentAccount } from "../auth/session";
import { hasStaffPermission } from "../../features/administration/permissions";
import type { StaffPermission } from "../../features/administration/permissions";

export async function requireStaffPermission(permission: StaffPermission) {
  const account = await currentAccount();
  if (!account) redirect("/connexion");
  if (!hasStaffPermission(account.role, permission)) notFound();
  return account;
}

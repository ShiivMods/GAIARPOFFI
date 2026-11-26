import type { AccountRole } from "../../server/auth/types.ts";

export type StaffPermission = "administration:access" | "map:preview" | "education:validate";
const permissions: Readonly<Record<AccountRole, readonly StaffPermission[]>> = {
  player: [],
  gm: ["administration:access", "education:validate"],
  admin: ["administration:access", "map:preview"],
};

export function hasStaffPermission(role: AccountRole | null | undefined, permission: StaffPermission): boolean {
  return !!role && Object.hasOwn(permissions, role) && permissions[role].includes(permission);
}

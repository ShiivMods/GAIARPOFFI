import postgres from "postgres";
import { localDatabaseUrl } from "../auth/config.ts";
import { applyCommand, createTurn, projectTurn, summarizeTurn } from "../../game/combat/turn.ts";
import type { Command, TurnState } from "../../game/combat/turn.ts";

export const TEST_SCENARIO_ID = "starlight";
let connection: ReturnType<typeof postgres> | undefined;
function db() {
  const url = localDatabaseUrl();
  connection ??= postgres(url, { max: 5, connect_timeout: 5 });
  return connection;
}
function validId(id: string) {
  if (!/^[a-z0-9-]{1,80}$/.test(id)) throw new Error("Invalid scenario");
}
export async function getCombatView(id: string, accountId: string) {
  validId(id);
  const sql = db();
  const [row] = await sql<{state: TurnState}[]>`select state from local_combat_scenarios where id = ${id}`;
  if (!row) return null;
  const member = row.state.members.find(m => m.accountId === accountId);
  if (!member) return null;
  return { ...projectTurn(row.state, accountId, member.id), ownMemberId: member.id };
}

export async function submitCombatCommand(id: string, accountId: string, expectedRevision: number, command: Command) {
  validId(id);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new Error("Invalid revision");
  const sql = db();
  return sql.begin(async tx => {
    const [row] = await tx<{state: TurnState}[]>`select state from local_combat_scenarios where id = ${id} for update`;
    if (!row) throw new Error("Unknown scenario");
    const member = row.state.members.find(m => m.accountId === accountId);
    if (!member) throw new Error("Forbidden participant");
    const next = applyCommand(row.state, accountId, member.id, expectedRevision, command);
    await tx`update local_combat_scenarios set state = ${JSON.stringify(next)}::jsonb, updated_at = now() where id = ${id}`;
    return projectTurn(next, accountId, member.id);
  });
}

// MJ and administrator have separate account roles. Only MJ resets this local fixture.
export async function getResetView(id: string, accountId: string) {
  validId(id);
  const sql = db();
  const [actor] = await sql<{role: string}[]>`select role from app_accounts where id = ${accountId}`;
  if (actor?.role !== "gm") return null;
  const [row] = await sql<{state: TurnState}[]>`select state from local_combat_scenarios where id = ${id}`;
  if (!row) return null;
  return { revision: row.state.revision, ...summarizeTurn(row.state) };
}
export async function resetCombat(id: string, accountId: string, expectedRevision: number) {
  validId(id);
  const sql = db();
  return sql.begin(async tx => {
    const [actor] = await tx<{role: string}[]>`select role from app_accounts where id = ${accountId} for share`;
    if (actor?.role !== "gm") throw new Error("Forbidden reset");
    const [row] = await tx<{state: TurnState}[]>`select state from local_combat_scenarios where id = ${id} for update`;
    if (!row) throw new Error("Unknown scenario");
    if (row.state.revision !== expectedRevision) throw new Error("Stale revision");
    const participants = row.state.members.map(({ id, accountId, shipId, name, station }) => ({ id, accountId, shipId, name, station }));
    const next = { ...createTurn(participants), revision: row.state.revision + 1 };
    await tx`update local_combat_scenarios set state = ${JSON.stringify(next)}::jsonb, updated_at = now() where id = ${id}`;
  });
}
export async function closeCombatConnection() {
  await connection?.end();
  connection = undefined;
}

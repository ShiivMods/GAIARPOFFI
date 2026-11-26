import { ACTION_BUDGET, validateOrders } from "./actions.ts";
import type { ActionId } from "./actions.ts";

export type Participant = Readonly<{
  id: string;
  accountId: string;
  shipId: string;
  name: string;
  station: string;
}>;
export type Commitment = "none" | "ready" | "surrender";
export type MemberState = Participant & Readonly<{ orders: readonly ActionId[]; commitment: Commitment }>;
export type TurnState = Readonly<{ turn: number; revision: number; members: readonly MemberState[] }>;
export type TurnPhase = "planning" | "ready-for-resolution" | "surrender-pending";
export type Command =
  | { kind: "orders"; orders: readonly unknown[] }
  | { kind: "ready" }
  | { kind: "cancel-ready" }
  | { kind: "surrender" }
  | { kind: "cancel-surrender" };

export function createTurn(participants: readonly Participant[], turn = 1): TurnState {
  if (!Number.isSafeInteger(turn) || turn < 1) throw new Error("Invalid turn");
  if (participants.length < 2 || new Set(participants.map(p => p.shipId)).size !== 2)
    throw new Error("This prototype requires two opposing ships");
  if (new Set(participants.map(p => p.id)).size !== participants.length ||
      participants.some(p => !p.id || !p.accountId || !p.shipId || !p.name || !p.station))
    throw new Error("Invalid participants");
  return { turn, revision: 0, members: participants.map(p => ({ ...p, orders: [], commitment: "none" })) };
}
export function summarizeTurn(state: TurnState) {
  const ships = [...new Set(state.members.map(m => m.shipId))].map(shipId => {
    const members = state.members.filter(m => m.shipId === shipId);
    const surrenderVotes = members.filter(m => m.commitment === "surrender").length;
    return { shipId, total: members.length, ready: members.filter(m => m.commitment === "ready").length,
      surrenderVotes, surrenderMajority: surrenderVotes > members.length / 2 };
  });
  const phase: TurnPhase = ships.some(s => s.surrenderMajority) ? "surrender-pending" :
    ships.every(s => s.ready === s.total) ? "ready-for-resolution" : "planning";
  return { phase, ships };
}

// Trusted server supplies actor accountId from the session, never from the request body.
// Revision must also be checked under a database lock before persisting a command.
export function applyCommand(state: TurnState, actorAccountId: string, memberId: string, expectedRevision: number, command: Command): TurnState {
  if (state.revision !== expectedRevision) throw new Error("Stale revision");
  const member = state.members.find(m => m.id === memberId);
  if (!member || member.accountId !== actorAccountId) throw new Error("Forbidden participant");
  const phase = summarizeTurn(state).phase;
  if (phase === "surrender-pending" && command.kind !== "cancel-surrender")
    throw new Error("Awaiting surrender decision");
  let next: MemberState;
  switch (command.kind) {
    case "orders": {
      if (member.commitment !== "none") throw new Error("Orders locked");
      const { orders } = validateOrders(command.orders);
      next = { ...member, orders };
      break;
    }
    case "ready":
      if (member.commitment !== "none" || member.orders.length === 0) throw new Error("Cannot ready");
      validateOrders(member.orders);
      next = { ...member, commitment: "ready" };
      break;
    case "cancel-ready":
      if (member.commitment !== "ready") throw new Error("Not ready");
      next = { ...member, commitment: "none" };
      break;
    case "surrender":
      if (member.commitment !== "none") throw new Error("Cancel commitment first");
      next = { ...member, commitment: "surrender" };
      break;
    case "cancel-surrender":
      if (member.commitment !== "surrender") throw new Error("No surrender vote");
      next = { ...member, commitment: "none" };
      break;
    default:
      throw new Error("Unknown command");
  }
  return { ...state, revision: state.revision + 1, members: state.members.map(m => m.id === memberId ? next : m) };
}

// Do not serialize the authoritative state into a page or API response.
export function projectTurn(state: TurnState, actorAccountId: string, memberId: string) {
  const viewer = state.members.find(m => m.id === memberId && m.accountId === actorAccountId);
  if (!viewer) throw new Error("Forbidden participant");
  const summary = summarizeTurn(state);
  return {
    turn: state.turn, revision: state.revision, phase: summary.phase,
    ships: summary.ships,
    actionBudget: ACTION_BUDGET,
    members: state.members.map(m => ({
      id: m.id, shipId: m.shipId, name: m.name, station: m.station, commitment: m.commitment,
      ...(m.id === viewer.id || (m.shipId === viewer.shipId && m.commitment === "ready") ? { orders: [...m.orders] } : {}),
    })),
  };
}

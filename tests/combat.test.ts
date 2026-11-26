import assert from "node:assert/strict";
import { test } from "node:test";
import { applyStandardDamage, integrityPercent, propulsionPerformance, armamentPerformance } from "../src/game/combat/damage.ts";
import { validateOrders } from "../src/game/combat/actions.ts";
import { createTurn, applyCommand, summarizeTurn, projectTurn } from "../src/game/combat/turn.ts";
import type { Participant, TurnState, Command } from "../src/game/combat/turn.ts";

const durability = (current: number, max = current) => ({ current, max });
test("damage crosses shield, armor, hull without mutating input", () => {
  const original = { shield: durability(50), armor: durability(20), hull: durability(100) };
  const result = applyStandardDamage(90, original);
  assert.deepEqual(result.absorbed, { shield: 50, armor: 20, hull: 20 });
  assert.equal(result.hull.current, 80);
  assert.equal(original.shield.current, 50);
  assert.equal(result.destroyed, false);
  const destroyed = applyStandardDamage(1000, original);
  assert.equal(destroyed.hull.current, 0);
  assert.equal(destroyed.destroyed, true);
  assert.equal(applyStandardDamage(0, original).hull.current, 100);
  for (const invalid of [-1, NaN, Infinity]) assert.throws(() => applyStandardDamage(invalid, original));
  assert.throws(() => applyStandardDamage(10, { ...original, hull: durability(101, 100) }));
  assert.equal(integrityPercent(durability(0)), 0);
});
test("historical system thresholds", () => {
  assert.equal(propulsionPerformance(0).speedMultiplier, 0);
  assert.equal(propulsionPerformance(20).evasionMultiplier, .3);
  assert.equal(propulsionPerformance(21).speedMultiplier, .75);
  assert.equal(propulsionPerformance(65).evasionMultiplier, .9);
  assert.equal(propulsionPerformance(66).speedMultiplier, 1);
  assert.equal(armamentPerformance(0).damageMultiplier, 0);
  assert.equal(armamentPerformance(20).damageMultiplier, .5);
  assert.equal(armamentPerformance(21).damageMultiplier, .75);
  assert.equal(armamentPerformance(65).damageMultiplier, .75);
  assert.equal(armamentPerformance(66).damageMultiplier, 1);
  assert.throws(() => armamentPerformance(NaN));
});
test("action budget and allowlist", () => {
  assert.equal(validateOrders(["fire", "scan"]).spent, 2);
  assert.equal(validateOrders(["double-fire"]).spent, 2);
  for (const orders of [["double-fire","scan"],["fire","fire"],["unknown"],["__proto__"],["fire","scan","evasion"]])
    assert.throws(() => validateOrders(orders));
});
const participants: Participant[] = [
  { id: "a", accountId: "1", shipId: "ally", name: "A", station: "Capitaine" },
  { id: "b", accountId: "2", shipId: "ally", name: "B", station: "Pilote" },
  { id: "c", accountId: "3", shipId: "enemy", name: "C", station: "Capitaine" },
];
const cmd = (s: TurnState, member: Participant, command: Command) => applyCommand(s, member.accountId, member.id, s.revision, command);
test("ready, cancellation, all participants and stale revision", () => {
  let state = createTurn(participants);
  assert.throws(() => cmd(state, participants[0], { kind: "ready" }));
  assert.throws(() => applyCommand(state,"3","a",0,{kind:"orders",orders:["fire"]}));
  state = cmd(state, participants[0], { kind: "orders", orders: ["fire"] });
  assert.throws(() => applyCommand(state,"1","a",0,{kind:"ready"}));
  state = cmd(state, participants[0], { kind: "ready" });
  assert.throws(() => cmd(state,participants[0],{kind:"orders",orders:["scan"]}));
  assert.throws(() => cmd(state,participants[0],{kind:"surrender"}));
  state = cmd(state,participants[0],{kind:"cancel-ready"});
  assert.equal(summarizeTurn(state).phase,"planning");
  for (const p of participants) {
    state = cmd(state,p,{kind:"orders",orders:["scan"]});
    state = cmd(state,p,{kind:"ready"});
  }
  assert.equal(summarizeTurn(state).phase,"ready-for-resolution");
  state = cmd(state,participants[2],{kind:"cancel-ready"});
  assert.equal(summarizeTurn(state).phase,"planning");
});
test("adversarial orders remain hidden, including when all are ready", () => {
  let state = createTurn(participants);
  for (const p of participants) {
    state = cmd(state,p,{kind:"orders",orders:["fire"]});
    state = cmd(state,p,{kind:"ready"});
  }
  const view = projectTurn(state,"1","a");
  assert.deepEqual(view.members.find(m=>m.id==="a")?.orders,["fire"]);
  assert.deepEqual(view.members.find(m=>m.id==="b")?.orders,["fire"]);
  assert.equal(Object.hasOwn(view.members.find(m=>m.id==="c")!,"orders"),false);
  assert.equal(JSON.stringify(view).includes("accountId"),false);
  assert.throws(()=>projectTurn(state,"3","a"));
});
test("strict surrender majority, mutual exclusion and suspension", () => {
  let state = createTurn(participants);
  state = cmd(state,participants[0],{kind:"surrender"});
  assert.equal(summarizeTurn(state).phase,"planning");
  assert.throws(()=>cmd(state,participants[0],{kind:"ready"}));
  state = cmd(state,participants[1],{kind:"surrender"});
  assert.equal(summarizeTurn(state).phase,"surrender-pending");
  assert.throws(()=>cmd(state,participants[2],{kind:"orders",orders:["fire"]}));
  state = cmd(state,participants[1],{kind:"cancel-surrender"});
  assert.equal(summarizeTurn(state).phase,"planning");
});

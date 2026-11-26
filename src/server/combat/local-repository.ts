import { withLocalDb, transaction } from "../db/local.ts";
import type { DatabaseSync } from "node:sqlite";
import { applyCommand, createTurn, projectTurn, summarizeTurn } from "../../game/combat/turn.ts";
import type { Command, TurnState } from "../../game/combat/turn.ts";

export const TEST_SCENARIO_ID = "starlight";
function validId(id: string) {
  if (!/^[a-z0-9-]{1,80}$/.test(id)) throw new Error("Invalid scenario");
}
function readState(db: DatabaseSync, id: string): TurnState | null {
  const row=db.prepare("SELECT state FROM local_combat_scenarios WHERE id=?").get(id);
  return row ? JSON.parse(String(row.state)) as TurnState : null;
}
function writeState(db: DatabaseSync,id:string,state:TurnState) {
  db.prepare("UPDATE local_combat_scenarios SET state=?,updated_at=? WHERE id=?")
    .run(JSON.stringify(state),Date.now(),id);
}
export async function getCombatView(id:string,accountId:string) {
  validId(id);
  return withLocalDb(db=>{
    const state=readState(db,id);
    const member=state?.members.find(m=>m.accountId===accountId);
    if(!state || !member) return null;
    return {...projectTurn(state,accountId,member.id),ownMemberId:member.id};
  });
}
export async function submitCombatCommand(id:string,accountId:string,expectedRevision:number,command:Command) {
  validId(id);
  if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0) throw new Error("Invalid revision");
  return withLocalDb(db=>transaction(db,()=>{
    const state=readState(db,id);
    if(!state) throw new Error("Unknown scenario");
    const member=state.members.find(m=>m.accountId===accountId);
    if(!member) throw new Error("Forbidden participant");
    const next=applyCommand(state,accountId,member.id,expectedRevision,command);
    writeState(db,id,next);
    return projectTurn(next,accountId,member.id);
  }));
}
export async function getResetView(id:string,accountId:string) {
  validId(id);
  return withLocalDb(db=>{
    const actor=db.prepare("SELECT role FROM app_accounts WHERE id=?").get(accountId);
    if(actor?.role!=="gm") return null;
    const state=readState(db,id);
    return state ? {revision:state.revision,...summarizeTurn(state)} : null;
  });
}
export async function resetCombat(id:string,accountId:string,expectedRevision:number) {
  validId(id);
  return withLocalDb(db=>transaction(db,()=>{
    const actor=db.prepare("SELECT role FROM app_accounts WHERE id=?").get(accountId);
    if(actor?.role!=="gm") throw new Error("Forbidden reset");
    const state=readState(db,id);
    if(!state) throw new Error("Unknown scenario");
    if(state.revision!==expectedRevision) throw new Error("Stale revision");
    const participants=state.members.map(({id,accountId,shipId,name,station})=>({id,accountId,shipId,name,station}));
    writeState(db,id,{...createTurn(participants),revision:state.revision+1});
  }));
}

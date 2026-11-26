import {randomUUID} from "node:crypto";
import type {DatabaseSync} from "node:sqlite";
import {withLocalDb,transaction} from "../db/local.ts";
import {initialExperience,visibleExperience,resolveManual,CHANNELS} from "../../game/combat/experience.ts";
import type {Experience,Channel,ManualInput} from "../../game/combat/experience.ts";
import {createTurn,projectTurn,summarizeTurn} from "../../game/combat/turn.ts";
import type {TurnState} from "../../game/combat/turn.ts";

export function readExperience(db:DatabaseSync,id:string):Experience{
  const row=db.prepare("SELECT experience FROM local_combat_experience WHERE id=?").get(id);
  return row?JSON.parse(String(row.experience)) as Experience:initialExperience();
}
export function writeExperience(db:DatabaseSync,id:string,data:Experience){
  db.prepare("INSERT INTO local_combat_experience(id,experience) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET experience=excluded.experience").run(id,JSON.stringify(data));
}
function readTurn(db:DatabaseSync,id:string):TurnState{
  const row=db.prepare("SELECT state FROM local_combat_scenarios WHERE id=?").get(id);
  if(!row)throw new Error("Unknown scenario");
  return JSON.parse(String(row.state)) as TurnState;
}
function saveTurn(db:DatabaseSync,id:string,state:TurnState){
  db.prepare("UPDATE local_combat_scenarios SET state=?,updated_at=? WHERE id=?").run(JSON.stringify(state),Date.now(),id);
}
function requireRevision(state:TurnState,revision:number){if(state.revision!==revision)throw new Error("Stale revision");}
export async function getExperienceView(id:string,accountId:string){
  return withLocalDb(db=>{
    const state=readTurn(db,id);
    const member=state.members.find(m=>m.accountId===accountId);
    if(!member)return null;
    return {...projectTurn(state,accountId,member.id),ownMemberId:member.id,experience:visibleExperience(readExperience(db,id),member.shipId)};
  });
}
export async function getGmExperience(id:string,accountId:string){
  return withLocalDb(db=>{
    if(db.prepare("SELECT role FROM app_accounts WHERE id=?").get(accountId)?.role!=="gm")return null;
    const state=readTurn(db,id);
    const data=readExperience(db,id);
    const summary=summarizeTurn(state);
    return {revision:state.revision,...summary,ships:data.ships.map(s=>({id:s.id,name:s.name})),result:data.result,turn:state.turn,orders:summary.phase==='ready-for-resolution'?state.members.map(m=>({name:m.name,shipId:m.shipId,orders:[...m.orders]})):[]};
  });
}
export async function postCombatMessage(id:string,accountId:string,mention:string,text:string){
  if(!CHANNELS.includes(mention as Channel)||!text.trim()||text.trim().length>2000)throw new Error("Invalid message");
  return withLocalDb(db=>transaction(db,()=>{
    const state=readTurn(db,id),data=readExperience(db,id);
    const member=state.members.find(m=>m.accountId===accountId);
    if(!member||data.result)throw new Error("Forbidden participant");
    writeExperience(db,id,{...data,messages:[...data.messages,{id:randomUUID(),memberId:member.id,author:member.name,shipId:member.shipId,turn:state.turn,mention:mention as Channel,text:text.trim(),createdAt:Date.now()}]});
  }));
}
export async function adjudicateCombat(id:string,accountId:string,revision:number,input:ManualInput){
  return withLocalDb(db=>transaction(db,()=>{
    if(db.prepare("SELECT role FROM app_accounts WHERE id=?").get(accountId)?.role!=="gm")throw new Error("Forbidden reset");
    const state=readTurn(db,id);
    requireRevision(state,revision);
    const next=resolveManual(state,readExperience(db,id),input);
    writeExperience(db,id,next);
    saveTurn(db,id,next.result?{...state,revision:state.revision+1}:{...createTurn(state.members,state.turn+1),revision:state.revision+1});
  }));
}
export async function decideSurrender(id:string,accountId:string,revision:number,accept:boolean){
  return withLocalDb(db=>transaction(db,()=>{
    const state=readTurn(db,id),data=readExperience(db,id);
    requireRevision(state,revision);
    const captain=state.members.find(m=>m.accountId===accountId&&(m.station==="Capitaine"||m.station==="Commandement"));
    const majority=summarizeTurn(state).ships.filter(s=>s.surrenderMajority);
    if(data.result||!captain||majority.length!==1||majority[0].shipId===captain.shipId)throw new Error("Forbidden participant");
    const surrendered=majority[0].shipId;
    if(accept){
      const winner=data.ships.find(s=>s.id===captain.shipId)!;
      writeExperience(db,id,{...data,result:winner.name+" : victoire par reddition",messages:[],history:[...data.history,{turn:state.turn,orders:state.members.filter(m=>m.commitment==="ready").map(m=>({shipId:m.shipId,name:m.name,orders:[...m.orders]})),events:[{shipId:surrendered,label:"Reddition",text:"Reddition acceptée par "+captain.name+"."}],messages:data.messages}]});
      saveTurn(db,id,{...state,revision:state.revision+1});
    }else{
      // Keep the current turn and other commitments; return the surrendering crew to planning.
      saveTurn(db,id,{...state,revision:state.revision+1,members:state.members.map(m=>m.shipId===surrendered&&m.commitment==="surrender"?{...m,commitment:"none"}:m)});
    }
  }));
}

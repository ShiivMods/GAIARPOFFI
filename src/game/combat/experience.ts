import { applyStandardDamage, propulsionPerformance } from "./damage.ts";
import type { Defenses } from "./damage.ts";
import type { TurnState } from "./turn.ts";
export type Ship = Defenses & {id:string; name:string; role:string; image:string; accent:string; propulsionIntegrity:number; armamentIntegrity:number; baseSpeed:number; baseEvasion:number; offensiveEquipmentCount:number};
export const fixtureShips: readonly Ship[] = [
  {id:"raviolo",name:"VVF Raviolo",role:"Exploration · Tier I",image:"ship-lysa-exploration.png",accent:"#69c4d9",hull:{current:3000,max:3000},shield:{current:4950,max:5000},armor:{current:0,max:0},propulsionIntegrity:100,armamentIntegrity:100,baseSpeed:58,baseEvasion:55,offensiveEquipmentCount:2},
  {id:"k17",name:"Contact hostile K-17",role:"Combat · Modèle inconnu",image:"ship-seris-combat.png",accent:"#cf6f78",hull:{current:7600,max:7600},shield:{current:4200,max:4200},armor:{current:2800,max:2800},propulsionIntegrity:88,armamentIntegrity:92,baseSpeed:135,baseEvasion:70,offensiveEquipmentCount:3},
];
export const CHANNELS=["","Canal externe","Intercom","Passerelle","Poste de tir"] as const;
export type Channel=typeof CHANNELS[number];
export type Message={id:string;memberId:string;author:string;shipId:string;turn:number;mention:Channel;text:string;createdAt:number};
export type Report={turn:number;orders:{shipId:string;name:string;orders:string[]}[];events:{shipId:string;label:string;text:string}[];messages:Message[]};
export type Experience={ships:Ship[];scans:string[];messages:Message[];history:Report[];result:string|null};
export function initialExperience(): Experience {
  return {ships:fixtureShips.map(s=>({...s,hull:{...s.hull},shield:{...s.shield},armor:{...s.armor}})),scans:[],messages:[],history:[],result:null};
}
export function visibleMessages(messages:Message[],shipId:string){return messages.filter(m=>m.shipId===shipId||m.mention==="Canal externe");}
export function visibleExperience(data:Experience,shipId:string){
  return {result:data.result,ships:data.ships.map(ship=>{
    const own=ship.id===shipId||Boolean(data.result);
    const scanned=data.scans.includes(shipId);
    const base={id:ship.id,name:ship.name,role:ship.role,image:ship.image,accent:ship.accent,hull:ship.hull,shield:ship.shield,armor:ship.armor,offensiveEquipmentCount:ship.offensiveEquipmentCount};
    return {...base,systems:own?{propulsionIntegrity:ship.propulsionIntegrity,armamentIntegrity:ship.armamentIntegrity,baseSpeed:ship.baseSpeed,baseEvasion:ship.baseEvasion}:null,
      estimatedSpeed:!own&&scanned?Math.round(ship.baseSpeed*propulsionPerformance(ship.propulsionIntegrity).speedMultiplier):null};
  }),messages:visibleMessages(data.messages,shipId),history:data.history.map(h=>({...h,messages:visibleMessages(h.messages,shipId)}))};
}
// Test-only adjudication: incoming damage and repairs are determined by the MJ, not an invented hit formula.
export type ManualInput=Record<string,{damage:number;repair:number}>;
export function resolveManual(state:TurnState,data:Experience,input:ManualInput):Experience{
  if(data.result||!state.members.every(m=>m.commitment==="ready"))throw new Error("Turn not ready");
  const events:Report["events"]=[];
  const ships=data.ships.map(ship=>{
    const values=input[ship.id];
    if(!values||![values.damage,values.repair].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000))throw new Error("Invalid damage or repair");
    if(values.repair>0&&!state.members.some(m=>m.shipId===ship.id&&m.orders.includes("shield-boost")))throw new Error("No shield boost order");
    const shield={...ship.shield,current:Math.min(ship.shield.max,ship.shield.current+values.repair)};
    const actualRepair=shield.current-ship.shield.current;
    const damage=applyStandardDamage(values.damage,{shield,armor:ship.armor,hull:ship.hull});
    events.push({shipId:ship.id,label:ship.name,text:"Renfort : "+actualRepair+" · Dégâts reçus : "+values.damage+" (bouclier "+damage.absorbed.shield+", blindage "+damage.absorbed.armor+", coque "+damage.absorbed.hull+")."});
    return {...ship,shield:damage.shield,armor:damage.armor,hull:damage.hull};
  });
  const scans=[...new Set([...data.scans,...state.members.filter(m=>m.orders.includes("scan")).map(m=>m.shipId)])];
  const destroyed=ships.filter(s=>s.hull.current===0);
  const result=destroyed.length===2?"Destruction mutuelle":destroyed.length===1?ships.find(s=>s.hull.current>0)!.name+" : victoire par destruction":null;
  return {...data,ships,scans,result,messages:[],history:[...data.history,{turn:state.turn,orders:state.members.map(m=>({shipId:m.shipId,name:m.name,orders:[...m.orders]})),events,messages:data.messages}]};
}

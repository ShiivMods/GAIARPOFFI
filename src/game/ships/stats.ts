export type BaseShipStats = {
  firepower:number; speed:number; dodge:number; shield:number; shieldRegen:number;
  hull:number; armor:number; armorRegen:number; crew:number; firingPosts:number;
};
export type EquipmentStats = Partial<BaseShipStats> & {
  id:string; weight?:number; weightExempt?:boolean; speedPercent?:number;
  powerCapacity?:number; powerUse?:number; propulsion?:string; ammo?:string; technology?:string;
};
export type InstalledEquipment={slot:{kind:string;id:string};component:EquipmentStats};
export type CrewPassiveStats={speed?:number; speedPercent?:number; firepower?:number; dodge?:number; shieldRegen?:number; armorRegen?:number};

// All values are supplied by the equipment/crew catalog; no balance values inferred here.
export function calculateShipStats(base:BaseShipStats,installed:readonly InstalledEquipment[],passives:CrewPassiveStats={}){
  const result={...base,shield:0,powerCapacity:0,powerUse:0,propulsion:"Non renseignée",ammo:new Set<string>(),technology:new Set<string>(),knownWeight:0,missingWeights:[] as string[]};
  let speedMultiplier=1;
  let generatorInstalled=false;
  for(const {slot,component:c} of installed){
    result.firepower+=c.firepower??0;
    result.speed+=c.speed??0;
    result.dodge+=c.dodge??0;
    if(slot.kind==="shield"&&c.id!=="empty"){
      if(generatorInstalled)throw new Error("Multiple shield generators");
      generatorInstalled=true;
      result.shield=c.shield??0;
    }
    result.shieldRegen+=c.shieldRegen??0;
    result.hull+=c.hull??0;
    result.armor+=c.armor??0;
    result.armorRegen+=c.armorRegen??0;
    result.crew+=c.crew??0;
    result.firingPosts+=c.firingPosts??0;
    result.powerCapacity+=c.powerCapacity??0;
    result.powerUse+=c.powerUse??0;
    if(c.propulsion)result.propulsion=c.propulsion;
    if(c.ammo)result.ammo.add(c.ammo);
    if(c.technology)result.technology.add(c.technology);
    if(c.id!=="empty"&&!c.weightExempt){
      if(c.weight===undefined)result.missingWeights.push(slot.id);
      else {
        if(!Number.isFinite(c.weight)||c.weight<0)throw new Error("Invalid equipment weight");
        result.knownWeight+=c.weight;
      }
    }
    if(c.speedPercent!==undefined){
      if(!Number.isFinite(c.speedPercent)||c.speedPercent< -100)throw new Error("Invalid speed modifier");
      speedMultiplier*=1+c.speedPercent/100;
    }
  }
  // Flat equipment bonuses are legacy provisional values; weights are subtracted before percent modifiers.
  result.speed=Math.max(1,(result.speed-result.knownWeight)*speedMultiplier);
  // Crew modifiers apply only after equipment. The final bonus values and stacking are not yet balanced.
  result.speed=Math.max(1,(result.speed+(passives.speed??0))*(1+(passives.speedPercent??0)/100));
  result.firepower+=passives.firepower??0;
  result.dodge+=passives.dodge??0;
  result.shieldRegen+=passives.shieldRegen??0;
  result.armorRegen+=passives.armorRegen??0;
  return result;
}

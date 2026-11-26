import assert from "node:assert/strict";
import {test} from "node:test";
import {calculateShipStats} from "../src/game/ships/stats.ts";
import type {BaseShipStats,InstalledEquipment} from "../src/game/ships/stats.ts";
const base:BaseShipStats={firepower:2,speed:100,dodge:40,shield:6000,shieldRegen:0,hull:1000,armor:0,armorRegen:0,crew:2,firingPosts:0};
const equipment=(id:string,kind:string,component:InstalledEquipment["component"]):InstalledEquipment=>({slot:{id,kind},component});
test("shield capacity comes solely from the installed generator",()=>{
  const module=equipment("module","module",{id:"module",shield:9000,weight:2});
  const generator=equipment("shield","shield",{id:"gen",shield:2500,weightExempt:true});
  assert.equal(calculateShipStats(base,[module,generator]).shield,2500);
  assert.equal(calculateShipStats(base,[module]).shield,0);
  assert.throws(()=>calculateShipStats(base,[generator,generator]),/Multiple/);
});
test("weight precedes equipment percentages and crew bonuses apply last",()=>{
  const modules=[equipment("engine","engine",{id:"engine",speed:10,weight:20,speedPercent:20}),equipment("stock","scanner",{id:"stock",weight:500,weightExempt:true})];
  const stats=calculateShipStats(base,modules,{speedPercent:10,firepower:3});
  assert.ok(Math.abs(stats.speed-118.8)<1e-8);
  assert.equal(stats.knownWeight,20);
  assert.equal(stats.firepower,5);
  assert.deepEqual(stats.missingWeights,[]);
  assert.equal(calculateShipStats(base,[equipment("heavy","armor",{id:"heavy",weight:1000})]).speed,1);
  assert.equal(calculateShipStats(base,[equipment("fast","module",{id:"fast",weight:0,speed:500})]).speed,600);
});
test("undefined weights are surfaced, not presented as balanced values",()=>{
  const stats=calculateShipStats(base,[equipment("unknown","module",{id:"prototype"}),equipment("empty","module",{id:"empty"})]);
  assert.deepEqual(stats.missingWeights,["unknown"]);
  assert.equal(stats.knownWeight,0);
  assert.throws(()=>calculateShipStats(base,[equipment("bad","module",{id:"bad",weight:-1})]),/Invalid/);
});

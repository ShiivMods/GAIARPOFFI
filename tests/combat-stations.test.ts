import assert from "node:assert/strict";
import {test} from "node:test";
import {validateStationOrders} from "../src/game/combat/stations.ts";
test("captain can occupy an available post, but not mix posts",()=>{
  const captain={memberId:"c",stationId:"command",isCaptain:true};
  validateStationOrders(captain,[{stationId:"scanner"},{stationId:"scanner"}]);
  assert.throws(()=>validateStationOrders(captain,[{stationId:"gunner"},{stationId:"scanner"}]),/combine/);
  assert.throws(()=>validateStationOrders(captain,[{stationId:"pilot",assignedAccountMemberId:"p"}]),/assigned/);
  const pilot={memberId:"p",stationId:"pilot",isCaptain:false};
  validateStationOrders(pilot,[{stationId:"pilot",assignedAccountMemberId:"p"}]);
  assert.throws(()=>validateStationOrders(pilot,[{stationId:"scanner"}]),/Forbidden/);
});

import assert from "node:assert/strict";
import {test} from "node:test";
import {nextGameMonth} from "../src/game/time/calendar.ts";
test("calendar increments exactly one year at month 12",()=>{
  const december={year:153,month:12};
  assert.deepEqual(nextGameMonth(december),{year:154,month:1});
  assert.deepEqual(nextGameMonth(december),{year:154,month:1});
  assert.deepEqual(december,{year:153,month:12});
  assert.deepEqual(nextGameMonth({year:153,month:11}),december);
});
test("12 and 24 successive months advance one and two years",()=>{
  let date={year:153,month:1};
  for(let i=0;i<12;i++)date=nextGameMonth(date);
  assert.deepEqual(date,{year:154,month:1});
  for(let i=0;i<12;i++)date=nextGameMonth(date);
  assert.deepEqual(date,{year:155,month:1});
});

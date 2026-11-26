import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes } from "node:crypto";
import { withLocalDb } from "../src/server/db/local.ts";
import { setupIsolatedLocalDb } from "./local-fixture.ts";
import { getCombatView, getResetView, resetCombat, submitCombatCommand } from "../src/server/combat/local-repository.ts";

setupIsolatedLocalDb();
test("persistent shared planning, permissions, concurrency and reset", async () => {
  const id = "test-" + randomBytes(8).toString("hex");
  try {
    const rows = withLocalDb(db=>db.prepare("SELECT id,email FROM app_accounts").all()).map(row=>({id:String(row.id),email:String(row.email)}));
    const account = (email: string) => { const row = rows.find(r => r.email === email + "@example.test"); assert.ok(row); return row.id; };
    const a = account("joueur1"), b = account("joueur2"), c = account("joueur3"), gm = account("mj"), admin = account("admin");
    withLocalDb(db=>db.prepare("INSERT INTO local_combat_scenarios(id,state,updated_at) SELECT ?,state,updated_at FROM local_combat_scenarios WHERE id='starlight'").run(id));
    const initial = await getCombatView(id,a);
    assert.ok(initial);
    await resetCombat(id,gm,initial.revision);
    const start = await getCombatView(id,a);
    assert.ok(start);
    assert.equal(start.phase,"planning");
    assert.equal(await getCombatView(id,gm),null);
    assert.equal(await getCombatView(id,admin),null);
    assert.equal(await getResetView(id,admin),null);
    assert.equal(await getResetView(id,a),null);
    assert.ok(await getResetView(id,gm));
    await assert.rejects(submitCombatCommand(id,gm,start.revision,{kind:"orders",orders:["fire"]}), /Forbidden/);
    await assert.rejects(resetCombat(id,admin,start.revision), /Forbidden/);
    const concurrent = await Promise.allSettled([
      submitCombatCommand(id,a,start.revision,{kind:"orders",orders:["fire"]}),
      submitCombatCommand(id,c,start.revision,{kind:"orders",orders:["scan"]}),
    ]);
    assert.equal(concurrent.filter(x=>x.status==="fulfilled").length,1);
    const rejected = concurrent.find(x=>x.status==="rejected");
    assert.equal(rejected?.status,"rejected");
    assert.match(String(rejected.reason),/Stale revision/);
    let current = await getCombatView(id,a);
    assert.ok(current);
    for (const actor of [a,b,c]) {
      await submitCombatCommand(id,actor,current.revision,{kind:"orders",orders:["fire"]});
      current = await getCombatView(id,a);
      assert.ok(current);
      await submitCombatCommand(id,actor,current.revision,{kind:"ready"});
      current = await getCombatView(id,a);
      assert.ok(current);
    }
    assert.equal(current.phase,"ready-for-resolution");
    assert.deepEqual(current.members.find(m=>m.id==="nael")?.orders,["fire"]);
    assert.equal(Object.hasOwn(current.members.find(m=>m.id==="k17-captain")!,"orders"),false);
    assert.equal(JSON.stringify(current).includes("accountId"),false);
    const enemyView = await getCombatView(id,c);
    assert.ok(enemyView);
    assert.equal(Object.hasOwn(enemyView.members.find(m=>m.id==="lysa")!,"orders"),false);
    const persisted = await getCombatView(id,a);
    assert.deepEqual(persisted,current);
    await resetCombat(id,gm,current.revision);
    const reset = await getCombatView(id,a);
    assert.ok(reset);
    assert.equal(reset.phase,"planning");
    assert.equal(reset.turn,1);
    assert.equal(reset.revision,current.revision+1);
    assert.deepEqual(reset.members.find(m=>m.id==="lysa")?.orders,[]);
    await assert.rejects(submitCombatCommand(id,a,current.revision,{kind:"orders",orders:["fire"]}), /Stale revision/);
  } finally {
    withLocalDb(db=>db.prepare("DELETE FROM local_combat_scenarios WHERE id=?").run(id));
  }
});

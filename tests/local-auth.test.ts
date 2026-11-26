import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes } from "node:crypto";
import { normalizeEmail, normalizeUsername, localDatabasePath } from "../src/server/auth/config.ts";
import { localAuth } from "../src/server/auth/local-provider.ts";

import { useIsolatedLocalDb } from "./local-fixture.ts";
useIsolatedLocalDb();
test("validation et isolation du mode local", () => {
  assert.equal(normalizeEmail(" Test@EXAMPLE.TEST "), "test@example.test");
  assert.equal(normalizeEmail("person@example.com"), null);
  assert.equal(normalizeUsername("a b"), null);
  const original = process.env.GAIA_LOCAL_AUTH;
  try {
    process.env.GAIA_LOCAL_AUTH = "0";
    assert.throws(localDatabasePath);
    process.env.GAIA_LOCAL_AUTH = "1";
    Object.assign(process.env, { NODE_ENV: "production" });
    try { assert.throws(localDatabasePath); } finally { Object.assign(process.env, { NODE_ENV: "development" }); }
  } finally {
    if (original === undefined) delete process.env.GAIA_LOCAL_AUTH;
    else process.env.GAIA_LOCAL_AUTH = original;
  }
});
test("inscription, unicité, sessions séparées, rôles, révocation", async () => {
  const suffix = randomBytes(6).toString("hex");
  const email = "test" + suffix + "@example.test";
  const username = "test_" + suffix;
  const created = await localAuth.register(email, username);
  assert.ok(created);
  assert.equal(created.account.role, "player");
  assert.equal(await localAuth.register(email, username + "x"), null);
  assert.equal(await localAuth.register("other" + suffix + "@example.test", username), null);
  assert.deepEqual(await localAuth.getAccount(created.token), created.account);
  const second = await localAuth.signIn(email);
  assert.ok(second);
  assert.notEqual(created.token, second.token);
  assert.equal(second.account.id, created.account.id);
  const gm = await localAuth.signIn("mj@example.test");
  const admin = await localAuth.signIn("admin@example.test");
  assert.ok(gm && admin);
  assert.equal(gm.account.role, "gm");
  assert.equal(admin.account.role, "admin");
  assert.notEqual(gm.account.id, admin.account.id);
  assert.notEqual(gm.account.id, created.account.id);
  await localAuth.signOut(created.token);
  assert.equal(await localAuth.getAccount(created.token), null);
  assert.ok(await localAuth.getAccount(second.token));
  await Promise.all([second, gm, admin].map(s => localAuth.signOut(s.token)));
});

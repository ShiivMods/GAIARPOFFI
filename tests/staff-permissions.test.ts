import assert from "node:assert/strict";
import {test} from "node:test";
import {hasStaffPermission} from "../src/features/administration/permissions.ts";
test("only staff can open administration; GM and admin permissions remain distinct",()=>{
  for(const role of [null,undefined,"player"] as const){
    assert.equal(hasStaffPermission(role,"administration:access"),false);
    assert.equal(hasStaffPermission(role,"map:preview"),false);
    assert.equal(hasStaffPermission(role,"education:validate"),false);
  }
  assert.equal(hasStaffPermission("admin","administration:access"),true);
  assert.equal(hasStaffPermission("gm","administration:access"),true);
  assert.equal(hasStaffPermission("admin","map:preview"),true);
  assert.equal(hasStaffPermission("gm","map:preview"),false);
  assert.equal(hasStaffPermission("gm","education:validate"),true);
  assert.equal(hasStaffPermission("admin","education:validate"),false);
});

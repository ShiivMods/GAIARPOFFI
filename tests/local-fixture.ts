import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after } from "node:test";

export function setupIsolatedLocalDb() {
  const original=process.cwd();
  const dir=mkdtempSync(join(tmpdir(),"gaiarp-test-"));
  process.chdir(dir);
  Object.assign(process.env, { NODE_ENV: "development" });
  process.env.GAIA_LOCAL_AUTH="1";
  after(()=>{
    process.chdir(original);
    rmSync(dir,{recursive:true,force:true});
  });
}

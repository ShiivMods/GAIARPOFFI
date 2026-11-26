import {withLocalDb,transaction} from "../db/local.ts";
import type {DatabaseSync} from "node:sqlite";
import {GRADUATION_MIN_AGE} from "../../game/characters/education.ts";
function requireGm(db:DatabaseSync,accountId:string){
  if(db.prepare("SELECT role FROM app_accounts WHERE id=?").get(accountId)?.role!=="gm")throw new Error("Forbidden GM");
}
export function listStudents(gmAccountId:string){
  return withLocalDb(db=>{
    requireGm(db,gmAccountId);
    return db.prepare("SELECT c.id,c.first_name,d.name AS dynasty,c.age,c.academy FROM app_characters c JOIN app_dynasties d ON d.id=c.dynasty_id WHERE c.education_status='student' ORDER BY c.first_name").all().map(r=>({id:String(r.id),name:String(r.first_name)+" "+String(r.dynasty),age:Number(r.age),academy:String(r.academy)}));
  });
}
export function validateGraduation(gmAccountId:string,characterId:string,rpReference:string){
  const reference=rpReference.trim();
  if(!reference||reference.length>500)throw new Error("RP reference required");
  return withLocalDb(db=>transaction(db,()=>{
    requireGm(db,gmAccountId);
    const row=db.prepare("SELECT age,academy,education_status FROM app_characters WHERE id=?").get(characterId);
    if(!row||row.education_status!=="student"||!row.academy)throw new Error("Not a student");
    if(Number(row.age)<GRADUATION_MIN_AGE)throw new Error("Graduation age");
    db.prepare("UPDATE app_characters SET education_status='graduate' WHERE id=?").run(characterId);
    db.prepare("INSERT INTO academy_graduations(character_id,gm_account_id,rp_reference,validated_at) VALUES(?,?,?,?)").run(characterId,gmAccountId,reference,Date.now());
  }));
}

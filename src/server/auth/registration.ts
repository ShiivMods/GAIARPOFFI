import {createHash,randomBytes,randomUUID} from "node:crypto";
import {normalizeEmail} from "./config.ts";
import {hashPassword,validPassword} from "./password.ts";
import {withLocalDb,transaction} from "../db/local.ts";
import {issueSession} from "./local-provider.ts";
import {validateCharacter,HISTORICAL_DYNASTIES} from "../../features/auth/registration-rules.ts";
import type {CharacterInput} from "../../features/auth/registration-rules.ts";
import type {Account} from "./types.ts";
import type {DatabaseSync} from "node:sqlite";

export const DRAFT_SECONDS=30*60;
export const DRAFT_COOKIE="gaia_registration";
function tokenHash(token:string){return createHash("sha256").update(token).digest("hex");}
function tokenValid(token:string){return /^[a-f0-9]{64}$/.test(token);}
function availableEmail(db:DatabaseSync,email:string){return !db.prepare("SELECT id FROM app_accounts WHERE email=?").get(email);}
function draftRow(db:DatabaseSync,token:string){
  if(!tokenValid(token))return undefined;
  return db.prepare("SELECT email,password_hash FROM registration_drafts WHERE token_hash=? AND expires_at>?").get(tokenHash(token),Date.now());
}
export function startRegistration(inputEmail:string,password:string,previousToken?:string){
  const email=normalizeEmail(inputEmail);
  if(!email)throw new Error("email");
  if(!validPassword(password))throw new Error("password");
  return withLocalDb(db=>transaction(db,()=>{
    if(!availableEmail(db,email))throw new Error("email-used");
    const digest=hashPassword(password),token=randomBytes(32).toString("hex");
    db.prepare("DELETE FROM registration_drafts WHERE expires_at<=?").run(Date.now());
    if(previousToken&&tokenValid(previousToken))db.prepare("DELETE FROM registration_drafts WHERE token_hash=?").run(tokenHash(previousToken));
    db.prepare("INSERT INTO registration_drafts(token_hash,email,password_hash,expires_at) VALUES(?,?,?,?)").run(tokenHash(token),email,digest,Date.now()+DRAFT_SECONDS*1000);
    return token;
  }));
}
export function pendingRegistration(token:string){
  return withLocalDb(db=>{const row=draftRow(db,token);return row?{email:String(row.email)}:null;});
}
export function cancelRegistration(token:string){
  withLocalDb(db=>{if(tokenValid(token))db.prepare("DELETE FROM registration_drafts WHERE token_hash=?").run(tokenHash(token));});
}
export function completeRegistration(token:string,input:CharacterInput){
  const character=validateCharacter(input);
  return withLocalDb(db=>transaction(db,()=>{
    const draft=draftRow(db,token);
    if(!draft)throw new Error("expired");
    const email=String(draft.email);
    if(!availableEmail(db,email))throw new Error("email-used");
    if(HISTORICAL_DYNASTIES.has(character.nameKey)||db.prepare("SELECT id FROM app_dynasties WHERE name_key=?").get(character.nameKey))throw new Error("dynasty-used");
    const account:Account={id:randomUUID(),email,username:"p_"+randomUUID().replace(/-/g,""),role:"player"};
    const dynastyId=randomUUID(),characterId=randomUUID();
    db.prepare("INSERT INTO app_accounts(id,email,username,role,created_at,password_hash) VALUES(?,?,?,?,?,?)").run(account.id,email,account.username,account.role,Date.now(),String(draft.password_hash));
    db.prepare("INSERT INTO app_dynasties(id,name,name_key,founder_account_id) VALUES(?,?,?,?)").run(dynastyId,character.dynasty,character.nameKey,account.id);
    db.prepare("INSERT INTO app_characters(id,account_id,dynasty_id,first_name,species,sex,faction,height_cm,weight_kg,age,academy,history,traits,education_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(characterId,account.id,dynastyId,character.firstName,character.species,character.sex,character.faction,character.heightCm,character.weightKg,character.age,character.academy,character.history,character.traits,character.educationStatus);
    db.prepare("DELETE FROM registration_drafts WHERE token_hash=?").run(tokenHash(token));
    return issueSession(db,account);
  }));
}
export function getRegisteredCharacter(accountId:string){
  return withLocalDb(db=>{
    const row=db.prepare("SELECT c.id,c.first_name,c.species,c.sex,c.faction,c.height_cm,c.weight_kg,c.age,c.academy,c.education_status,c.history,c.traits,d.name AS dynasty FROM app_characters c JOIN app_dynasties d ON d.id=c.dynasty_id WHERE c.account_id=? ORDER BY c.rowid LIMIT 1").get(accountId);
    return row?{id:String(row.id),firstName:String(row.first_name),dynasty:String(row.dynasty),species:String(row.species),sex:String(row.sex),faction:String(row.faction),heightCm:Number(row.height_cm),weightKg:Number(row.weight_kg),age:Number(row.age),academy:row.academy===null?null:String(row.academy),educationStatus:String(row.education_status) as import("../../game/characters/education.ts").EducationStatus,history:String(row.history),traits:String(row.traits)}:null;
  });
}

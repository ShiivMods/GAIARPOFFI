export const ACADEMIES=["Sciences","Ingénierie","Militaire","Politique"] as const;
export type Academy=typeof ACADEMIES[number];
export const ACADEMY_MIN_AGE=16;
export type CharacterInput={
  dynasty:string; firstName:string; species:string; faction:string;
  height:string; weight:string; age:string; academy:string; history:string; traits:string;
};
export type CharacterData={
  dynasty:string; nameKey:string; firstName:string; species:"Humain"; faction:"Humanis";
  heightCm:number; weightKg:number; age:number; academy:Academy|null; history:string; traits:string;
};
export function dynastyKey(name:string){return name.normalize("NFKC").trim().replace(/\s+/g," ").toLocaleLowerCase("fr");}
function cleanName(name:string){return name.normalize("NFKC").trim().replace(/\s+/g," ");}
function nameValid(name:string){return name.length>0&&name.length<=60&&/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name);}
function positive(raw:string){
  if(!/^\d{1,8}(?:[.,]\d{1,3})?$/.test(raw.trim()))return NaN;
  return Number(raw.trim().replace(",","."));
}
export function validateCharacter(input:CharacterInput):CharacterData{
  const dynasty=cleanName(input.dynasty),firstName=cleanName(input.firstName);
  if(!nameValid(dynasty)||!nameValid(firstName))throw new Error("name");
  if(input.species!=="Humain"||input.faction!=="Humanis")throw new Error("faction");
  const heightCm=positive(input.height),weightKg=positive(input.weight);
  if(!Number.isFinite(heightCm)||heightCm<=0||!Number.isFinite(weightKg)||weightKg<=0)throw new Error("measurements");
  const age=Number(input.age);
  if(!/^\d+$/.test(input.age.trim())||!Number.isSafeInteger(age)||age<0)throw new Error("age");
  let academy:Academy|null=null;
  if(age<ACADEMY_MIN_AGE){if(input.academy)throw new Error("academy-age");}
  else {
    if(!ACADEMIES.includes(input.academy as Academy))throw new Error("academy-required");
    academy=input.academy as Academy;
  }
  const history=input.history.trim(),traits=input.traits.trim();
  if(history.length>10000||traits.length>10000||!traits)throw new Error("traits");
  return {dynasty,nameKey:dynastyKey(dynasty),firstName,species:"Humain",faction:"Humanis",heightCm,weightKg,age,academy,history,traits};
}
// Names shown in the historical member directory; no new dynasty names invented.
export const HISTORICAL_DYNASTIES=new Set(["Arven","Vaelor","Coris","Solan","Nemor","Orven","Taal","Marek","Kell","Meris","Ryn","Ilyan","Vel","Daren","Var","Tenn","Dross","Venn","Kader","Ahn","Myr","Oss"].map(dynastyKey));

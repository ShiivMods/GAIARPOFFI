export const ACADEMIES=["Sciences","Ingénierie","Militaire","Politique"] as const;
export type Academy=typeof ACADEMIES[number];
export const ACADEMY_MIN_AGE=16;
// Shared catalog: only species and combinations currently authorized at registration.
export const SPECIES_OPTIONS: Readonly<Record<string,{sexes:readonly string[];factions:readonly string[]}>>={
  Humain:{sexes:["Homme","Femme","Non-défini"],factions:["Humanis"]},
};
export function optionsForSpecies(species:string){return Object.hasOwn(SPECIES_OPTIONS,species)?SPECIES_OPTIONS[species]:null;}
export type CharacterInput={
  dynasty:string; firstName:string; species:string; sex:string; faction:string;
  height:string; weight:string; age:string; academy:string; history:string; traits:string;
};
export type CharacterData={
  dynasty:string; nameKey:string; firstName:string; species:string; sex:string; faction:string;
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
  const options=optionsForSpecies(input.species);
  if(!options||!options.factions.includes(input.faction))throw new Error("faction");
  if(!options.sexes.includes(input.sex))throw new Error("sex");
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
  if(history.length>10000||traits.length>10000)throw new Error("traits");
  return {dynasty,nameKey:dynastyKey(dynasty),firstName,species:input.species,sex:input.sex,faction:input.faction,heightCm,weightKg,age,academy,history,traits};
}
// Names shown in the historical member directory; no new dynasty names invented.
export const HISTORICAL_DYNASTIES=new Set(["Arven","Vaelor","Coris","Solan","Nemor","Orven","Taal","Marek","Kell","Meris","Ryn","Ilyan","Vel","Daren","Var","Tenn","Dross","Venn","Kader","Ahn","Myr","Oss"].map(dynastyKey));

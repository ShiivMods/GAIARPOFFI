export const ACADEMY_MIN_AGE=14;
export const GRADUATION_MIN_AGE=18;
export const SHIP_LICENSE_MIN_AGE=21;
export const SPECIALIZATIONS={Sciences:"Scientifique","Ingénierie":"Technicien",Militaire:"Soldat",Politique:"Officiel"} as const;
export type Academy=keyof typeof SPECIALIZATIONS;
export type EducationStatus="none"|"student"|"graduate";
export function initialEducation(age:number,academy:Academy|null):EducationStatus{
  if(!academy)return "none";
  return age>=GRADUATION_MIN_AGE?"graduate":"student";
}
// Progression rate is a design rule, not a grant of points; the progression engine will consume it.
export function educationProgressionRate(age:number,status:EducationStatus):number{
  if(age<ACADEMY_MIN_AGE||status==="none")return 0;
  return status==="graduate"?1:0.25;
}
export function acquiredSpecialization(academy:Academy|null,status:EducationStatus){
  return academy&&status==="graduate"?SPECIALIZATIONS[academy]:null;
}

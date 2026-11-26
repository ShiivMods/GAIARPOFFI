"use server";
import {notFound,redirect} from "next/navigation";
import {cookies} from "next/headers";
import {localModeEnabled} from "@/server/auth/config";
import {authProvider,endSession,setSession} from "@/server/auth/session";
import {signInTestAccount} from "@/server/auth/local-provider";
import {startRegistration,completeRegistration,cancelRegistration,DRAFT_SECONDS,DRAFT_COOKIE} from "@/server/auth/registration";
import type {CharacterInput} from "./registration-rules";
import type {Session} from "@/server/auth/types";

function field(data:FormData,key:string,max=10000){
  const value=data.get(key);
  return typeof value==="string"&&value.length<=max?value:"";
}
function allowed(){if(!localModeEnabled())notFound();}
const errors:Record<string,string>={
  email:"Adresse e-mail invalide.",password:"Le mot de passe doit contenir de 12 à 128 caractères.",
  "email-used":"Cette adresse e-mail est déjà utilisée.","dynasty-used":"Ce nom de dynastie est déjà pris.",
  name:"Renseignez un nom et un prénom valides.",faction:"Espèce ou faction non disponible.",
  measurements:"Indiquez une taille et un poids positifs.",age:"Indiquez un âge entier valide.",
  "academy-age":"Avant 16 ans, aucune académie ne peut être choisie.",
  "academy-required":"Choisissez une académie pour votre citoyen d’Humanis.",
  traits:"Renseignez le caractère et les traits physiques (10 000 caractères maximum).",
  expired:"Votre inscription a expiré. Reprenez la première étape.",
};
function errorMessage(error:unknown){
  if(error instanceof Error&&Object.hasOwn(errors,error.message))return errors[error.message];
  return "Une erreur locale est survenue. Réessayez.";
}
export async function beginRegistrationAction(_previous:string,data:FormData):Promise<string>{
  allowed();
  const store=await cookies();
  try{
    const token=startRegistration(field(data,"email",254),field(data,"password",128),store.get(DRAFT_COOKIE)?.value);
    store.set(DRAFT_COOKIE,token,{httpOnly:true,sameSite:"strict",secure:false,path:"/",maxAge:DRAFT_SECONDS});
  }catch(error){return errorMessage(error);}
  redirect("/inscription/personnage");
}
export async function finishRegistrationAction(_previous:string,data:FormData):Promise<string>{
  allowed();
  const store=await cookies(),token=store.get(DRAFT_COOKIE)?.value;
  if(!token)redirect("/inscription?error=expired");
  const input:CharacterInput={dynasty:field(data,"dynasty",60),firstName:field(data,"firstName",60),species:field(data,"species",30),faction:field(data,"faction",30),height:field(data,"height",30),weight:field(data,"weight",30),age:field(data,"age",20),academy:field(data,"academy",30),history:field(data,"history"),traits:field(data,"traits")};
  let session:Session;
  try{session=completeRegistration(token,input);}catch(error){
    if(error instanceof Error&&(error.message==="expired"||error.message==="email-used")){
      cancelRegistration(token);store.delete(DRAFT_COOKIE);
      redirect("/inscription?error="+error.message);
    }
    return errorMessage(error);
  }
  store.delete(DRAFT_COOKIE);
  await setSession(session);
  redirect("/compte/local");
}
export async function cancelRegistrationAction(){
  allowed();
  const store=await cookies(),token=store.get(DRAFT_COOKIE)?.value;
  if(token)cancelRegistration(token);
  store.delete(DRAFT_COOKIE);
  redirect("/inscription");
}
export async function signInAction(data:FormData){
  allowed();
  let session:Session|null;
  try{session=await authProvider().signIn(field(data,"email",254),field(data,"password",128));if(session)await setSession(session);}
  catch{redirect("/connexion?error=database");}
  if(!session)redirect("/connexion?error=invalid");
  redirect("/compte/local");
}
export async function devSignInAction(data:FormData){
  allowed();
  let session:Session|null;
  try{session=await signInTestAccount(field(data,"email",254));if(session)await setSession(session);}
  catch{redirect("/connexion?error=database");}
  if(!session)redirect("/connexion?error=invalid");
  redirect("/compte/local");
}
export async function signOutAction(){
  allowed();await endSession();redirect("/");
}

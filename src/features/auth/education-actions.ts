"use server";
import {notFound,redirect} from "next/navigation";
import {localModeEnabled} from "@/server/auth/config";
import {currentAccount} from "@/server/auth/session";
import {validateGraduation} from "@/server/characters/education";
export async function validateGraduationAction(data:FormData){
  if(!localModeEnabled())notFound();
  const account=await currentAccount();
  if(!account||account.role!=="gm")notFound();
  const id=data.get("characterId"),reference=data.get("rpReference");
  if(typeof id!=="string"||typeof reference!=="string")redirect("/dev/academies?error=invalid");
  try{validateGraduation(account.id,id,reference);}catch{redirect("/dev/academies?error=invalid");}
  redirect("/dev/academies?validated=1");
}

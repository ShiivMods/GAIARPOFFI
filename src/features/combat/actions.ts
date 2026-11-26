"use server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { localModeEnabled } from "@/server/auth/config";
import { currentAccount } from "@/server/auth/session";
import { resetCombat, submitCombatCommand, TEST_SCENARIO_ID } from "@/server/combat/local-repository";
import type { Command } from "@/game/combat/turn";
import {postCombatMessage,adjudicateCombat,decideSurrender} from "@/server/combat/experience-repository";

function revisionFrom(data: FormData): number {
  const raw = data.get("revision");
  if (typeof raw !== "string" || !/^(0|[1-9][0-9]{0,14})$/.test(raw)) throw new Error("Invalid revision");
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) throw new Error("Invalid revision");
  return value;
}
function commandFrom(data: FormData): Command {
  const kind = data.get("kind");
  switch (kind) {
    case "orders": return { kind, orders: data.getAll("order") };
    case "ready": case "cancel-ready": case "surrender": case "cancel-surrender": return { kind };
    default: throw new Error("Invalid command");
  }
}
function errorCode(error: unknown) {
  if (error instanceof Error && error.message === "Stale revision") return "stale";
  if (error instanceof Error && ["Forbidden participant", "Forbidden reset"].includes(error.message)) return "forbidden";
  return "invalid";
}
export async function combatAction(data: FormData) {
  if (!localModeEnabled()) notFound();
  const account = await currentAccount();
  if (!account) redirect("/connexion");
  try {
    await submitCombatCommand(TEST_SCENARIO_ID, account.id, revisionFrom(data), commandFrom(data));
  } catch (error) {
    redirect("/dev/combat?error=" + errorCode(error));
  }
  revalidatePath("/dev/combat");
  redirect("/dev/combat");
}
export async function resetCombatAction(data: FormData) {
  if (!localModeEnabled()) notFound();
  const account = await currentAccount();
  if (!account) redirect("/connexion");
  try {
    await resetCombat(TEST_SCENARIO_ID, account.id, revisionFrom(data));
  } catch (error) {
    redirect("/dev/combat?error=" + errorCode(error));
  }
  revalidatePath("/dev/combat");
  redirect("/dev/combat");
}

export async function rpMessageAction(data:FormData){
  if(!localModeEnabled())notFound();
  const account=await currentAccount();
  if(!account)redirect("/connexion");
  const mention=data.get("mention"),text=data.get("text");
  if(typeof mention!=="string"||typeof text!=="string")redirect("/dev/combat?error=invalid");
  try{await postCombatMessage(TEST_SCENARIO_ID,account.id,mention,text);}catch(error){redirect("/dev/combat?error="+errorCode(error));}
  revalidatePath("/dev/combat");
}
export async function resolveCombatAction(data:FormData){
  if(!localModeEnabled())notFound();
  const account=await currentAccount();
  if(!account)redirect("/connexion");
  const num=(name:string)=>{const value=data.get(name);if(typeof value!=="string"||!/^\d{1,7}$/.test(value))throw new Error("Invalid number");return Number(value);};
  try{await adjudicateCombat(TEST_SCENARIO_ID,account.id,revisionFrom(data),{raviolo:{damage:num("raviolo-damage"),repair:num("raviolo-repair")},k17:{damage:num("k17-damage"),repair:num("k17-repair")}});}catch(error){redirect("/dev/combat?error="+errorCode(error));}
  revalidatePath("/dev/combat");
  redirect("/dev/combat");
}
export async function surrenderDecisionAction(data:FormData){
  if(!localModeEnabled())notFound();
  const account=await currentAccount();
  if(!account)redirect("/connexion");
  const decision=data.get("decision");
  if(decision!=="accept"&&decision!=="refuse")redirect("/dev/combat?error=invalid");
  try{await decideSurrender(TEST_SCENARIO_ID,account.id,revisionFrom(data),decision==="accept");}catch(error){redirect("/dev/combat?error="+errorCode(error));}
  revalidatePath("/dev/combat");
  redirect("/dev/combat");
}

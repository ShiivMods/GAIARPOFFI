import {notFound,redirect} from "next/navigation";
import {cookies} from "next/headers";
import {localModeEnabled} from "@/server/auth/config";
import {DRAFT_COOKIE,pendingRegistration} from "@/server/auth/registration";
import {cancelRegistrationAction} from "@/features/auth/actions";
import {CharacterForm} from "@/features/auth/registration-form";

export const dynamic="force-dynamic";
export default async function CharacterPage(){
  if(!localModeEnabled())notFound();
  const token=(await cookies()).get(DRAFT_COOKIE)?.value;
  if(!token||!pendingRegistration(token))redirect("/inscription?error=expired");
  return <main className="registration-main registration-character">
    <div className="registration-card">
      <div className="registration-kicker">INSCRIPTION · 1.2 / 1.2</div>
      <h2>Créer votre personnage</h2>
      <div className="registration-steps"><span>1.1 · Identifiants vérifiés</span><span className="current">1.2 · Personnage</span></div>
      <CharacterForm/>
      <form action={cancelRegistrationAction} className="registration-back"><button type="submit">‹ Retour aux identifiants</button></form>
    </div>
  </main>;
}

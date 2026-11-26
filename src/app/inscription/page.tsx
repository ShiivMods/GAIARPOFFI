import {notFound} from "next/navigation";
import {localModeEnabled} from "@/server/auth/config";
import {CredentialsForm} from "@/features/auth/registration-form";

export const dynamic="force-dynamic";
export default async function RegisterPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  if(!localModeEnabled())notFound();
  const {error}=await searchParams;
  return <main className="registration-main registration-credentials">
    <div className="registration-card">
      <div className="registration-kicker">INSCRIPTION · 1.1 / 1.2</div>
      <h2>Créer votre compte</h2>
      <div className="registration-steps"><span className="current">1.1 · Identifiants</span><span>1.2 · Personnage</span></div>
      <p className="registration-intro">Renseignez votre adresse e-mail et votre mot de passe. Votre compte ne sera créé qu’après la validation de votre personnage.</p>
      {error==="expired"&&<p role="alert" className="registration-error">Votre inscription a expiré. Reprenez cette étape.</p>}
      {error==="email-used"&&<p role="alert" className="registration-error">Cette adresse e-mail est désormais utilisée. Choisissez une autre adresse.</p>}
      <CredentialsForm/>
      <p className="registration-local">Développement local : utilisez une adresse et un mot de passe de test. Aucun e-mail n’est envoyé.</p>
    </div>
  </main>;
}

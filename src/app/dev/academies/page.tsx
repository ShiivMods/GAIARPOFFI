import "@/app/globals.css";
import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {localModeEnabled} from "@/server/auth/config";
import {currentAccount} from "@/server/auth/session";
import {listStudents} from "@/server/characters/education";
import {validateGraduationAction} from "@/features/auth/education-actions";
import {GRADUATION_MIN_AGE} from "@/game/characters/education";
export const dynamic="force-dynamic";
export default async function AcademyDevPage({searchParams}:{searchParams:Promise<{error?:string;validated?:string}>}){
  if(!localModeEnabled())notFound();
  const account=await currentAccount();
  if(!account)redirect("/connexion");
  if(account.role!=="gm")notFound();
  const students=listStudents(account.id),query=await searchParams;
  return <main><Link href="/dev">Outils de test</Link><h1>Validation des diplômes</h1>
    <p className="notice">Interface locale provisoire, réservée au MJ. Après accomplissement du RP de formation, renseigner sa référence et valider le diplôme. Le RP est contrôlé par le MJ, pas automatiquement par le système. Aucun diplôme automatique au dix-huitième anniversaire.</p>
    {query.error&&<p role="alert">Validation refusée. Vérifier l’âge, le statut et la référence RP.</p>}
    {query.validated&&<p role="status">Diplôme activé.</p>}
    {!students.length&&<p>Aucun étudiant enregistré.</p>}
    {students.map(s=><section key={s.id}><h2>{s.name}</h2><p>{s.age} ans · {s.academy}</p>
      {s.age>=GRADUATION_MIN_AGE?<form action={validateGraduationAction}>
        <input type="hidden" name="characterId" value={s.id}/><label htmlFor={"rp-"+s.id}>Référence du RP validé</label><input id={"rp-"+s.id} name="rpReference" required maxLength={500}/><button type="submit">Valider le diplôme</button>
      </form>:<p>Formation en cours · diplôme possible à partir de 18 ans.</p>}
    </section>)}
  </main>;
}

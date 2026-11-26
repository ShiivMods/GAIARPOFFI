import Link from "next/link";
import { notFound } from "next/navigation";
import { localModeEnabled } from "@/server/auth/config";
import { signInAction } from "@/features/auth/actions";
import { testAccounts } from "@/features/auth/test-accounts";

export const dynamic = "force-dynamic";
export default function DevPage() {
  if (!localModeEnabled()) notFound();
  return <main>
    <Link href="/">Accueil</Link>
    <h1>Outils de test</h1>
    <p className="notice">LOCAL uniquement. Chaque compte possède sa propre identité. Pour un combat multijoueur, ouvrir des profils de navigateur distincts.</p>
    <p><Link href="/dev/combat">Ouvrir le terrain d’essai : combat spatial</Link></p>
    <p>Joueurs 01 et 02 : Raviolo. Joueur 03 : K-17. MJ : réinitialisation.</p>
    <div className="test-grid">{testAccounts.map(account => <form key={account.email} action={signInAction} className="test-account">
      <input type="hidden" name="email" value={account.email} />
      <strong>{account.label}</strong>
      <span>{account.role}</span>
      <button type="submit">Incarner</button>
    </form>)}</div>
  </main>;
}

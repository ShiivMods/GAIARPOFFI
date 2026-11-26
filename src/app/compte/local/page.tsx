import "@/app/globals.css";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { localModeEnabled } from "@/server/auth/config";
import { currentAccount } from "@/server/auth/session";
import { signOutAction } from "@/features/auth/actions";

export const dynamic = "force-dynamic";
export default async function AccountPage() {
  if (!localModeEnabled()) notFound();
  const account = await currentAccount();
  if (!account) redirect("/connexion");
  const labels = { player: "Joueur", gm: "Maître du jeu", admin: "Administrateur" };
  return <main>
    <a href="/">Accueil</a>
    <h1>Mon compte</h1>
    <dl>
      <dt>Pseudo</dt><dd>{account.username}</dd>
      <dt>Adresse fictive</dt><dd>{account.email}</dd>
      <dt>Rôle</dt><dd>{labels[account.role]}</dd>
      <dt>Identifiant de compte</dt><dd>{account.id}</dd>
    </dl>
    <form action={signOutAction}><button type="submit">Se déconnecter</button></form>
    <p><Link href="/dev/combat">Terrain d’essai : combat spatial</Link></p>
    <p><Link href="/dev">Changer de compte de test</Link></p>
  </main>;
}

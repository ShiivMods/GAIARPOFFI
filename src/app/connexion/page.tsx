import "@/app/globals.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localModeEnabled } from "@/server/auth/config";
import { signInAction } from "@/features/auth/actions";

export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!localModeEnabled()) notFound();
  const { error } = await searchParams;
  return <main>
    <a href="/">Accueil</a>
    <h1>Connexion locale</h1>
    <p className="notice">Simulation sans mot de passe : ne jamais exposer ce mode sur un réseau public.</p>
    {error && <p role="alert">{error === "database" ? "Base locale indisponible. Vérifiez sa configuration." : "Compte de test introuvable."}</p>}
    <form action={signInAction}>
      <label htmlFor="email">Adresse e-mail fictive</label>
      <input id="email" name="email" type="email" required maxLength={76} placeholder="joueur1@example.test" />
      <button type="submit">Se connecter</button>
    </form>
    <p><Link href="/inscription">Créer un compte</Link> · <Link href="/dev">Comptes de test</Link></p>
  </main>;
}

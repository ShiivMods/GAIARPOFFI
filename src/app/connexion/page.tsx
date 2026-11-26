/* eslint-disable @next/next/no-html-link-for-pages -- The restored legacy application has its own global stylesheet; a full document navigation isolates the two shells. */
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
    <p className="notice">Développement local : utilisez uniquement des identifiants de test. Les cinq comptes de simulation restent accessibles dans les outils de test.</p>
    {error && <p role="alert">{error === "database" ? "Base locale indisponible. Vérifiez sa configuration." : "Adresse e-mail ou mot de passe incorrect."}</p>}
    <form action={signInAction}>
      <label htmlFor="email">Adresse e-mail</label>
      <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="explorateur@example.test" />
      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" required autoComplete="current-password" maxLength={128}/>
      <button type="submit">Se connecter</button>
    </form>
    <p><Link href="/inscription">Créer un compte</Link> · <Link href="/dev">Comptes de test</Link></p>
  </main>;
}

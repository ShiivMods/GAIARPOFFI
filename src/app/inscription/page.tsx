/* eslint-disable @next/next/no-html-link-for-pages -- The restored legacy application has its own global stylesheet; a full document navigation isolates the two shells. */
import "@/app/globals.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localModeEnabled } from "@/server/auth/config";
import { registerAction } from "@/features/auth/actions";

export const dynamic = "force-dynamic";
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!localModeEnabled()) notFound();
  const { error } = await searchParams;
  return <main>
    <a href="/">Accueil</a>
    <h1>Inscription locale</h1>
    <p className="notice">Simulation de développement. Utiliser uniquement une adresse fictive @example.test. Aucun mot de passe ni e-mail réel.</p>
    {error && <p role="alert">{error === "database" ? "Base locale indisponible. Vérifiez sa configuration." : "Adresse ou pseudo invalide ou déjà utilisé."}</p>}
    <form action={registerAction}>
      <label htmlFor="email">Adresse e-mail fictive</label>
      <input id="email" name="email" type="email" required maxLength={76} placeholder="explorateur@example.test" />
      <label htmlFor="username">Pseudo (3 à 24 lettres, chiffres ou _)</label>
      <input id="username" name="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]{3,24}" autoComplete="off" />
      <button type="submit">Créer mon compte de test</button>
    </form>
    <p><Link href="/connexion">Déjà un compte ?</Link></p>
  </main>;
}

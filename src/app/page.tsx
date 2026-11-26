import Link from "next/link";
import { localModeEnabled } from "@/server/auth/config";

export const dynamic = "force-dynamic";
export default function HomePage() {
  const local = localModeEnabled();
  return (
    <main>
      <h1>GAIA RP</h1>
      <p>Plateforme de jeu de rôle écrit de science-fiction.</p>
      {local ? <>
        <p className="notice">Développement local : comptes fictifs, aucun e-mail envoyé.</p>
        <nav aria-label="Compte">
          <Link href="/inscription">Créer un compte</Link>
          <Link href="/connexion">Connexion</Link>
          <Link href="/compte">Mon compte</Link>
          <Link href="/dev">Outils de test</Link>
        </nav>
      </> : <p>La plateforme officielle est en cours d’initialisation.</p>}
    </main>
  );
}

/* eslint-disable @next/next/no-html-link-for-pages -- Navigate between the historical and local shells with a full reload. */
import type {ReactNode} from "react";
import "./registration.css";

export default function RegistrationLayout({children}:{children:ReactNode}){
  return <div className="registration-shell">
    <header className="registration-topbar"><div><div className="registration-kicker">GAÏA // INTERFACE DE NAVIGATION</div><h1>Inscription</h1></div>
      <nav aria-label="Navigation"><a href="/">Accueil</a><a href="/connexion">Se connecter</a></nav>
    </header>{children}
  </div>;
}

/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation between the historical and local shells. */
import "@/legacy/styles.css";
import "./administration.css";
import {requireStaffPermission} from "@/server/administration/access";
import {hasStaffPermission} from "@/features/administration/permissions";

export const dynamic="force-dynamic";

export default async function AdministrationPage(){
  const account=await requireStaffPermission("administration:access");
  const canValidate=hasStaffPermission(account.role,"education:validate");
  const canPreviewMap=hasStaffPermission(account.role,"map:preview");
  const roleLabel=account.role==="admin"?"Administrateur":"Maître du jeu";
  return <div id="root" className="administration-root">
    <div className="app-shell administration-app">
      <header className="topbar standalone-topbar">
        <div className="brand-block"><div className="eyebrow">GAÏA // INTERFACE DE NAVIGATION</div><h1>Administration</h1></div>
        <nav className="administration-global-nav" aria-label="Navigation principale">
          <a href="/">Accueil</a><a href="/evenements">Évènements</a><a href="/reglement">Règlement</a><a href="/lore/histoire">Lore</a><a href="/membres">Membres</a><a href="/administration" aria-current="page">Administration</a><a href="/compte/local">Compte</a>
        </nav>
      </header>
      <main className="lore-page administration-page">
        <section className="lore-shell administration-shell">
          <div className="lore-page-title"><span>ADMINISTRATION</span><strong>{roleLabel}</strong></div>
          <div className="administration-layout">
            <aside className="administration-sidebar">
              <span className="eyebrow">ESPACE DE GESTION</span>
              <nav aria-label="Menus d’administration">
                <a href="/administration" aria-current="page">Vue d’ensemble</a>
                {canValidate&&<a href="/dev/academies">Validation des diplômes</a>}
                {canPreviewMap&&<a href="/admin">Aperçu administratif de la carte</a>}
              </nav>
            </aside>
            <div className="lore-content administration-content">
              <span className="eyebrow">GAÏA // GESTION DU FORUM</span>
              <h2>Vue d’ensemble</h2>
              <p>Espace réservé à l’équipe de GAÏA RP, destiné à la gestion des joueurs et de leurs personnages.</p>
              <div className="administration-role"><span>Rôle connecté</span><strong>{roleLabel}</strong><p>{account.role==="gm"?"Vous avez accès uniquement aux outils qui vous sont attribués.":"Les outils administratifs seront ajoutés progressivement."}</p></div>
              <section className="administration-tools"><h3>Outils existants</h3>
                {canValidate&&<a href="/dev/academies"><strong>Validation des diplômes</strong><span>Outil local de validation RP par les MJ.</span></a>}
                {canPreviewMap&&<a href="/admin"><strong>Aperçu administratif de la carte</strong><span>Interface de prévisualisation héritée de la maquette.</span></a>}
              </section>
              <p className="administration-note">Les futurs modules de gestion seront définis ultérieurement.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>;
}

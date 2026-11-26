/* eslint-disable @next/next/no-html-link-for-pages -- The restored legacy application has its own global stylesheet; a full document navigation isolates the two shells. */
import "@/app/globals.css";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { localModeEnabled } from "@/server/auth/config";
import { currentAccount } from "@/server/auth/session";
import {acquiredSpecialization,educationProgressionRate} from "@/game/characters/education";
import type {Academy} from "@/game/characters/education";
import {getRegisteredCharacter} from "@/server/auth/registration";
import { signOutAction } from "@/features/auth/actions";

export const dynamic = "force-dynamic";
export default async function AccountPage() {
  if (!localModeEnabled()) notFound();
  const account = await currentAccount();
  if (!account) redirect("/connexion");
  const character = getRegisteredCharacter(account.id);
  const labels = { player: "Joueur", gm: "Maître du jeu", admin: "Administrateur" };
  return <main>
    <a href="/">Accueil</a>
    <h1>Mon compte</h1>
    <dl>
      <dt>{character?"Personnage":"Compte de test"}</dt><dd>{character?character.firstName+" "+character.dynasty:account.username}</dd>
      <dt>Adresse e-mail</dt><dd>{account.email}</dd>
      <dt>Rôle</dt><dd>{labels[account.role]}</dd>
      <dt>Identifiant de compte</dt><dd>{account.id}</dd>
    </dl>
    {character&&<section><h2>Premier personnage</h2><dl>
      <dt>Dynastie</dt><dd>{character.dynasty}</dd>
      <dt>Sexe</dt><dd>{character.sex}</dd>
      <dt>Espèce / faction</dt><dd>{character.species} · {character.faction}</dd>
      <dt>Âge</dt><dd>{character.age} ans</dd>
      <dt>Taille / poids</dt><dd>{character.heightCm} cm · {character.weightKg} kg</dd>
      <dt>Académie</dt><dd>{character.academy??"Aucune"}</dd>
      <dt>Formation</dt><dd>{character.educationStatus==="graduate"?"Diplômé":character.educationStatus==="student"?"Étudiant":"Sans académie"}</dd>
      <dt>Spécialisation acquise</dt><dd>{acquiredSpecialization(character.academy as Academy|null,character.educationStatus)??"Aucune"}</dd>
      <dt>Gains de spécialisation (barème)</dt><dd>{educationProgressionRate(character.age,character.educationStatus)*100} %</dd>
      {character.history&&<><dt>Histoire</dt><dd style={{whiteSpace:"pre-wrap"}}>{character.history}</dd></>}
      <dt>Caractère &amp; traits physiques</dt><dd style={{whiteSpace:"pre-wrap"}}>{character.traits||"Non renseigné"}</dd>
    </dl></section>}
    <form action={signOutAction}><button type="submit">Se déconnecter</button></form>
    <p><Link href="/dev/combat">Terrain d’essai : combat spatial</Link></p>
    <p><Link href="/dev">Changer de compte de test</Link></p>
  </main>;
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { localModeEnabled } from "@/server/auth/config";
import { currentAccount } from "@/server/auth/session";
import { getCombatView, getResetView, TEST_SCENARIO_ID } from "@/server/combat/local-repository";
import { ACTIONS, validateOrders } from "@/game/combat/actions";
import type { ActionId } from "@/game/combat/actions";
import { combatAction, resetCombatAction } from "@/features/combat/actions";
import { LiveRefresh } from "@/features/combat/live-refresh";
import { CommandButton } from "@/features/combat/command-button";

export const dynamic = "force-dynamic";
const shipNames: Record<string, string> = { raviolo: "VVF Raviolo", k17: "Contact hostile K-17" };
const commitmentLabels = { none: "En attente", ready: "Prêt", surrender: "Reddition" };
const phaseLabels = { planning: "Choix des ordres", "ready-for-resolution": "Tous prêts · résolution à implémenter", "surrender-pending": "Reddition majoritaire · suspendu" };
const errors: Record<string, string> = {
  stale: "Un autre participant a modifié le combat. L’état a été actualisé : réessayez.",
  forbidden: "Cette action n’est pas autorisée pour votre compte.",
  invalid: "Action refusée ou base locale indisponible. Vérifiez l’état du combat.",
};

export default async function CombatTestPage({ searchParams }: { searchParams: Promise<{error?: string}> }) {
  if (!localModeEnabled()) notFound();
  const account = await currentAccount();
  if (!account) redirect("/connexion");
  const { error } = await searchParams;
  const [view, resetView] = await Promise.all([
    getCombatView(TEST_SCENARIO_ID, account.id), getResetView(TEST_SCENARIO_ID, account.id),
  ]);
  const errorText = typeof error === "string" && Object.hasOwn(errors, error) ? errors[error] : undefined;
  return <main className="combat-lab">
    <nav><Link href="/dev">Outils de test</Link><Link href="/compte">Mon compte</Link></nav>
    <header className="combat-heading">
      <div><small>LOCAL · TERRAIN D’ESSAI</small><h1>Engagement dans l’espace de Starlight</h1><p>VVF Raviolo contre Contact hostile K-17</p></div>
      <LiveRefresh />
    </header>
    <p className="notice">Planification persistante et partagée. Les tirs, effets, dégâts et décisions de reddition ne sont pas encore résolus. Actualisation automatique toutes les 3 secondes lorsque l’onglet est visible.</p>
    {errorText && <p role="alert" className="combat-error">{errorText}</p>}
    {!view && !resetView && <section className="combat-panel">
      <h2>Vous ne participez pas à ce scénario</h2><p>Choisissez l’un des trois comptes joueurs depuis les outils de test. Le MJ peut réinitialiser le scénario ; l’administrateur n’a pas de permission de jeu automatique.</p><Link href="/dev">Changer de compte</Link>
    </section>}
    {resetView && <section className="combat-panel">
      <h2>Contrôle MJ</h2><p>Révision {resetView.revision} · {phaseLabels[resetView.phase]}</p>
      {resetView.ships.map(s => <p key={s.shipId}>{shipNames[s.shipId]} : {s.ready}/{s.total} prêts, {s.surrenderVotes}/{s.total} votes de reddition.</p>)}
      <form action={resetCombatAction}>
        <input type="hidden" name="revision" value={resetView.revision} />
        <CommandButton confirmText="Réinitialiser tous les ordres et votes du scénario de test ?">Réinitialiser le scénario</CommandButton>
      </form>
    </section>}
    {view && <CombatContent view={view} />}
  </main>;
}

type View = NonNullable<Awaited<ReturnType<typeof getCombatView>>>;
function CombatContent({ view }: { view: View }) {
  const own = view.members.find(m => m.id === view.ownMemberId)!;
  const orders = own.orders ?? [];
  const spent = validateOrders(orders).spent;
  const paused = view.phase === "surrender-pending";
  const locked = paused || own.commitment !== "none";
  return <>
    <section className="combat-status"><div><small>TOUR</small><strong>{view.turn}</strong></div><div><small>ÉTAT</small><strong>{phaseLabels[view.phase]}</strong></div><div><small>RÉVISION</small><strong>{view.revision}</strong></div></section>
    <section className="combat-ships" aria-label="Équipages">
      {view.ships.map(ship => <article className="combat-panel" key={ship.shipId}>
        <h2>{shipNames[ship.shipId]}</h2>
        <p>{ship.shipId === own.shipId ? "Votre équipage" : "Équipage adverse"} · {ship.ready}/{ship.total} prêts</p>
        <progress value={ship.ready} max={ship.total} aria-label={shipNames[ship.shipId] + " participants prêts"} />
        <p>Reddition : {ship.surrenderVotes}/{ship.total}{ship.surrenderMajority ? " (majorité)" : ""}</p>
        {view.members.filter(m => m.shipId === ship.shipId).map(member => <div className="combat-member" key={member.id}>
          <div><strong>{member.name}{member.id === own.id ? " (vous)" : ""}</strong><br/><small>{member.station}</small></div>
          <div>{commitmentLabels[member.commitment]}{member.orders && member.orders.length > 0 && <small className="combat-orders">{member.orders.map(id => ACTIONS[id].label).join(" + ")}</small>}</div>
        </div>)}
      </article>)}
    </section>
    <section className="combat-panel">
      <h2>Ordres : {own.name}</h2><p>{view.actionBudget-spent}/{view.actionBudget} PA disponibles</p>
      <div className="combat-actions">
        {(Object.keys(ACTIONS) as ActionId[]).map(id => {
          const chosen = orders.includes(id);
          const next = chosen ? orders.filter(o => o !== id) : [...orders, id];
          return <form key={id} action={combatAction} className={chosen ? "combat-choice selected" : "combat-choice"}>
            <input type="hidden" name="revision" value={view.revision} />
            <input type="hidden" name="kind" value="orders" />
            {next.map(order => <input key={order} type="hidden" name="order" value={order} />)}
            <CommandButton disabled={locked || (!chosen && spent + ACTIONS[id].cost > view.actionBudget)}>
              {chosen ? "Retirer : " : "Choisir : "}{ACTIONS[id].label} · {ACTIONS[id].cost} PA
            </CommandButton>
          </form>;
        })}
      </div>
      <p>Ordres enregistrés : {orders.length ? orders.map(id => ACTIONS[id].label).join(" + ") : "Aucun"}</p>
      <div className="combat-controls">
        <form action={combatAction}>
          <input type="hidden" name="revision" value={view.revision} />
          <input type="hidden" name="kind" value={own.commitment === "ready" ? "cancel-ready" : "ready"} />
          <CommandButton disabled={paused || own.commitment === "surrender" || (own.commitment === "none" && !orders.length)}>
            {own.commitment === "ready" ? "Annuler Ready" : "Ready"}
          </CommandButton>
        </form>
        <form action={combatAction}>
          <input type="hidden" name="revision" value={view.revision} />
          <input type="hidden" name="kind" value={own.commitment === "surrender" ? "cancel-surrender" : "surrender"} />
          <CommandButton disabled={own.commitment === "ready" || (paused && own.commitment !== "surrender")}>
            {own.commitment === "surrender" ? "Annuler reddition" : "Voter la reddition"}
          </CommandButton>
        </form>
      </div>
    </section>
  </>;
}

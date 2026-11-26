/* eslint-disable @next/next/no-img-element -- Original combat illustrations are copied locally, without an external image optimizer. */
import Link from "next/link";
import type {CSSProperties} from "react";
import {notFound,redirect} from "next/navigation";
import {localModeEnabled} from "@/server/auth/config";
import {currentAccount} from "@/server/auth/session";
import {TEST_SCENARIO_ID} from "@/server/combat/local-repository";
import {getExperienceView,getGmExperience} from "@/server/combat/experience-repository";
import {ACTIONS,validateOrders} from "@/game/combat/actions";
import type {ActionId} from "@/game/combat/actions";
import {armamentPerformance,propulsionPerformance} from "@/game/combat/damage";
import {CHANNELS} from "@/game/combat/experience";
import type {Message,Report} from "@/game/combat/experience";
import {combatAction,resetCombatAction,rpMessageAction,resolveCombatAction,surrenderDecisionAction} from "@/features/combat/actions";
import {LiveRefresh} from "@/features/combat/live-refresh";
import {CommandButton} from "@/features/combat/command-button";
import "@/app/globals.css";
import "../../combat-legacy.css";

export const dynamic="force-dynamic";
type View=NonNullable<Awaited<ReturnType<typeof getExperienceView>>>;
type Ship=View["experience"]["ships"][number];
type GmView=NonNullable<Awaited<ReturnType<typeof getGmExperience>>>;
const names:Record<string,string>={raviolo:"VVF Raviolo",k17:"Contact hostile K-17"};
const phases={planning:"Choix des actions","ready-for-resolution":"Tous les équipages sont prêts","surrender-pending":"Combat suspendu"};
const labels={none:"ATTENTE",ready:"PRÊT",surrender:"REDDITION"};
const descriptions:Record<ActionId,string>={
  fire:"Effectue un tir avec l’armement actuellement opérationnel.",
  "double-fire":"Deux tirs successifs. Mobilise toute l’attention du poste offensif.",
  evasion:"Augmente fortement les chances d’éviter les tirs reçus pendant ce tour.",
  "shield-boost":"Détourne temporairement de l’énergie vers la protection du vaisseau.",
  scan:"Révèle progressivement les informations techniques du vaisseau adverse.",
};
const errors:Record<string,string>={stale:"Un autre participant a modifié le combat. Réessayez avec l’état actuel.",forbidden:"Action non autorisée.",invalid:"Action refusée : vérifiez les ordres, les valeurs et l’état du combat."};

export default async function CombatPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  if(!localModeEnabled())notFound();
  const account=await currentAccount();
  if(!account)redirect("/connexion");
  const {error}=await searchParams;
  const [view,gm]=await Promise.all([getExperienceView(TEST_SCENARIO_ID,account.id),getGmExperience(TEST_SCENARIO_ID,account.id)]);
  return <main className="combat-page"><section className="combat-shell">
    <header className="combat-page-head">
      <div><Link className="combat-back" href="/dev">‹ Retour aux outils de test</Link><div className="eyebrow">INSTANCE MÉCANIQUE · COMBAT SPATIAL</div><h2>Engagement dans l’espace de Starlight</h2></div>
      <div className="combat-turn-state"><small>{view?.experience.result?"INSTANCE":"TOUR ACTUEL"}</small><strong>{view?.experience.result?"✓":String(view?.turn??gm?.turn??1).padStart(2,"0")}</strong><span>{view?.experience.result?"Combat terminé":view?phases[view.phase]:gm?phases[gm.phase]:"Hors combat"}</span></div>
    </header>
    <div className="combat-local-toolbar"><Link href="/compte/local">Mon compte</Link><span>Local · Résolution manuelle MJ provisoire</span><LiveRefresh/></div>
    {typeof error==="string"&&Object.hasOwn(errors,error)&&<p role="alert" className="combat-error">{errors[error]}</p>}
    {!view&&!gm&&<section className="combat-panel"><h2>Vous ne participez pas à cette instance</h2><p>Incarnez un des trois joueurs de test. Le MJ peut arbitrer ou réinitialiser le scénario.</p><Link href="/dev">Changer de compte</Link></section>}
    {gm&&<GmPanel gm={gm}/>}
    {view&&<PlayerCombat view={view}/>}
  </section></main>;
}
function Hidden({name,value}:{name:string;value:string|number}){return <input type="hidden" name={name} value={value}/>;}
function PlayerCombat({view}:{view:View}){
  const own=view.members.find(m=>m.id===view.ownMemberId)!;
  const ally=view.experience.ships.find(s=>s.id===own.shipId)!;
  const enemy=view.experience.ships.find(s=>s.id!==own.shipId)!;
  const allyStatus=view.ships.find(s=>s.shipId===ally.id)!;
  const enemyStatus=view.ships.find(s=>s.shipId===enemy.id)!;
  const orders=own.orders??[];
  const spent=validateOrders(orders).spent;
  const ready=own.commitment==="ready",surrender=own.commitment==="surrender",finished=Boolean(view.experience.result),paused=view.phase==="surrender-pending";
  const locked=finished||paused||own.commitment!=="none";
  const lastReady=!ready&&view.members.every(m=>m.id===own.id||m.commitment==="ready");
  const captain=(own.station==="Capitaine"||own.station==="Commandement");
  const canDecide=paused&&!finished&&captain&&enemyStatus.surrenderMajority&&!allyStatus.surrenderMajority;
  const history=view.experience.history;
  return <>
    <section className="combat-versus">
      <ShipCombatCard ship={ally} side="player" status={finished?"Rapport final":allyStatus.ready+" / "+allyStatus.total+" prêts"}/>
      <div className="combat-versus-center"><span>VS</span><b>{finished?"ARCHIVE DE COMBAT":"ORDRES SIMULTANÉS"}</b><small>{finished?"Instance terminée.":"Les choix adverses restent masqués jusqu’à la résolution."}</small></div>
      <ShipCombatCard ship={enemy} side="enemy" status={finished?"Rapport final":enemyStatus.ready+" / "+enemyStatus.total+" prêts"}/>
    </section>
    {finished&&<section className="combat-completed-summary"><div><span>RÉSULTAT</span><h3>{view.experience.result}</h3><p>{history.length} rapport(s) de tour conservé(s).</p></div></section>}
    {!finished&&<>
      {paused&&<div className="combat-surrender-banner"><b>REDDITION MAJORITAIRE</b><span>Le signal a été transmis. Le combat attend la décision du capitaine adverse.</span>{canDecide&&<form action={surrenderDecisionAction}><Hidden name="revision" value={view.revision}/><button name="decision" value="accept">Accepter la reddition</button> <button name="decision" value="refuse">Poursuivre le combat</button></form>}</div>}
      {view.phase==="ready-for-resolution"&&<p className="combat-notice">Tous les ordres sont validés. Le MJ peut résoudre ce tour. Ready reste annulable jusqu’à la résolution.</p>}
      <section className="combat-control-grid">
        <div className="combat-actions-panel">
          <div className="combat-section-heading"><div><span>POSTE ACTIF</span><b>{own.name} · {own.station}</b></div><div className="combat-ap"><span>POINTS D’ACTION</span><b>{view.actionBudget-spent} / {view.actionBudget}</b></div></div>
          <div className="combat-action-list">{(Object.keys(ACTIONS) as ActionId[]).map(id=>{
            const selected=orders.includes(id);
            const next=selected?orders.filter(o=>o!==id):[...orders,id];
            return <form key={id} action={combatAction}>
              <Hidden name="revision" value={view.revision}/><Hidden name="kind" value="orders"/>{next.map(o=><Hidden key={o} name="order" value={o}/>)}
              <CommandButton className={"combat-action "+(selected?"selected ":"")+ACTIONS[id].category} pressed={selected} disabled={locked||(!selected&&spent+ACTIONS[id].cost>view.actionBudget)}>
                <div><strong>{ACTIONS[id].label}</strong><span>{descriptions[id]}</span></div><b>{ACTIONS[id].cost} PA</b>
              </CommandButton>
            </form>;
          })}</div>
          <div className="combat-order-summary"><div><span>Ordres sélectionnés</span><b>{orders.length?orders.map(id=>ACTIONS[id].label).join(" + "):"Aucun ordre"}</b><small>{ready?"Ready peut être annulé tant que le tour n’est pas résolu.":surrender?"Vote de reddition actif.":"Les ordres restent modifiables jusqu’à validation."}</small></div>
            <div className="combat-commit-actions">
              <form action={combatAction}><Hidden name="revision" value={view.revision}/><Hidden name="kind" value={ready?"cancel-ready":"ready"}/><CommandButton className={"ready-toggle"+(ready?" is-ready":"")} disabled={paused||surrender||(!ready&&!orders.length)} confirmText={lastReady?"Tous les participants seront prêts. Valider les ordres ?":undefined}>{ready?"Annuler Ready":lastReady?"Valider Ready":"Ready"}</CommandButton></form>
              <form action={combatAction}><Hidden name="revision" value={view.revision}/><Hidden name="kind" value={surrender?"cancel-surrender":"surrender"}/><CommandButton className={"surrender-toggle"+(surrender?" active":"")} disabled={ready||(paused&&!surrender)}>{surrender?"Annuler reddition":"Se rendre"}</CommandButton></form>
            </div>
          </div>
        </div>
        <aside className="combat-ready-panel"><div className="combat-section-heading compact"><div><span>READY CHECK & REDDITION</span><b>Équipages engagés</b></div></div>
          <div className="combat-ready-layout">{[allyStatus,enemyStatus].map(ship=><section key={ship.shipId} className={"combat-ready-group "+(ship.shipId===own.shipId?"ally":"enemy")}>
            <div className="combat-ready-group-head"><b>{names[ship.shipId]}</b><span>{ship.ready}/{ship.total} prêts</span></div>
            <div className="combat-crew-ready compact-grid">{view.members.filter(m=>m.shipId===ship.shipId).map(member=><div key={member.id} className={member.commitment==="none"?"":member.commitment}><span><b>{member.name}{member.id===own.id?" (vous)":""}</b><small>{member.station}</small>{member.commitment==="ready"&&member.orders?.length?<em>{member.orders.map(id=>ACTIONS[id].label).join(" + ")}</em>:null}</span><strong>{labels[member.commitment]}</strong></div>)}</div>
          </section>)}</div><div className="combat-ready-note compact-note"><span>{allyStatus.surrenderVotes}/{allyStatus.total}</span><p>Votes de reddition de votre équipage. La majorité transmet le signal au capitaine adverse.</p></div>
        </aside>
      </section>
      <section className="combat-history"><div className="combat-history-head"><div><span>TOUR PRÉCÉDENT</span><h3>Dernière résolution</h3></div><b>{history.length?"TERMINÉ":"EN ATTENTE"}</b></div>
        {history.length?<EventList report={history[history.length-1]} ownShip={own.shipId}/>:<p className="combat-empty">Aucun tour résolu pour cette instance.</p>}
      </section>
      <section className="combat-rp-interlude"><div className="combat-rp-head"><div><span>INTERLUDE RP · ENTRE LES TOURS</span><h3>Communications & réactions</h3></div><small>Optionnel · dialogues courts</small></div>
        <RpFeed messages={view.experience.messages} ownShip={own.shipId}/>
        <form action={rpMessageAction} className="combat-rp-composer"><div><label htmlFor="combat-mention">MENTION OPTIONNELLE</label><select id="combat-mention" name="mention">{CHANNELS.map(c=><option key={c} value={c}>{c||"Aucune"}</option>)}</select></div><textarea name="text" required maxLength={2000} aria-label="Message RP" placeholder="Quelques lignes de dialogue ou de réaction entre deux tours…"/><CommandButton>Publier</CommandButton></form>
      </section>
    </>}
    {history.length>0&&<section className="combat-archive-timeline"><h3>{finished?"Archive du combat":"Historique des tours"}</h3>{history.map((report,index)=><article key={index} className="combat-archive-turn"><header><div><span>TOUR {String(report.turn).padStart(2,"0")}</span><h3>Ordres révélés & résolution</h3></div><b>ARCHIVÉ</b></header>
      <div className="combat-archive-orders">{[ally,enemy].map(ship=><div key={ship.id} className={ship.id===enemy.id?"enemy":""}><span>{ship.name}</span>{report.orders.filter(o=>o.shipId===ship.id).map((o,i)=><b key={i}>{o.name} : {o.orders.map(id=>ACTIONS[id as ActionId]?.label??id).join(" + ")}</b>)}</div>)}</div>
      <EventList report={report} ownShip={own.shipId}/><RpFeed messages={report.messages} ownShip={own.shipId}/>
    </article>)}</section>}
  </>;
}
function ShipCombatCard({ship,side,status}:{ship:Ship;side:"player"|"enemy";status:string}){
  const systems=ship.systems;
  const prop=systems?propulsionPerformance(systems.propulsionIntegrity):null;
  const arm=systems?armamentPerformance(systems.armamentIntegrity):null;
  return <article className={"combat-ship-card "+side} style={{"--combat-accent":side==="player"?"#69c4d9":"#cf6f78"} as CSSProperties}>
    <div className="combat-ship-image"><img src={"/"+ship.image} alt={ship.name}/></div>
    <div className="combat-ship-title"><div><span>{ship.role}</span><h3>{ship.name}</h3></div><b>{status}</b></div>
    <CombatStat label="Coque" {...ship.hull}/><CombatStat label="Boucliers" {...ship.shield}/><CombatStat label="Blindage" {...ship.armor}/>
    {systems&&prop&&arm?<div className="combat-observed-row exact"><div><span>Propulsion</span><b>{systems.propulsionIntegrity}%</b><small>Vitesse {Math.round(systems.baseSpeed*prop.speedMultiplier)} · Esquive {Math.round(systems.baseEvasion*prop.evasionMultiplier)}%</small></div><div><span>Armement</span><b>{systems.armamentIntegrity}%</b><small>Dégâts {Math.round(arm.damageMultiplier*100)}%</small></div></div>:<div className="combat-observed-row"><div><span>Vitesse estimée</span><b>{ship.estimatedSpeed===null?"???":"≈ "+ship.estimatedSpeed}</b><small>{ship.estimatedSpeed===null?"Non analysée":"Première estimation scanner"}</small></div><div><span>Équipements offensifs visibles</span><b>{ship.offensiveEquipmentCount}</b><small>Observation visuelle uniquement</small></div></div>}
  </article>;
}
function CombatStat({label,current,max}:{label:string;current:number;max:number}){
  return <div className="combat-stat"><div><span>{label}</span><b>{max>0?current.toLocaleString("fr-FR")+" / "+max.toLocaleString("fr-FR"):"Aucun"}</b></div><div className="combat-stat-track"><span style={{width:(max>0?100*current/max:0)+"%"}}/></div></div>;
}
function EventList({report,ownShip}:{report:Report;ownShip:string}){
  return <div className="combat-event-list">{report.events.map((event,i)=><div key={i} className={"combat-event "+(event.shipId===ownShip?"player":"enemy")}><span>{event.label}</span><p>{event.text}</p></div>)}</div>;
}
function RpFeed({messages,ownShip}:{messages:Message[];ownShip:string}){
  if(!messages.length)return null;
  return <div className="combat-rp-feed">{messages.map(m=><article key={m.id} className={"combat-message "+(m.shipId===ownShip?"ally":"enemy")}><img src={"/"+(m.memberId==="lysa"?"lysa-dialogue-realistic.png":m.memberId==="nael"?"character-dialogue-avatar.png":"character-grand-avatar.png")} alt=""/><div className="combat-message-bubble"><header><b>{m.author}</b>{m.mention&&<span className={m.mention==="Canal externe"?"external":""}>&lt; {m.mention} &gt;</span>}</header><p>« {m.text} »</p></div></article>)}</div>;
}
function GmPanel({gm}:{gm:GmView}){
  return <section className="combat-gm"><h2>Contrôle MJ</h2><p>{gm.result??phases[gm.phase]} · Révision {gm.revision}</p>
    {gm.ships.map(s=><p key={s.id}>{s.name} : {gm.orders.filter(o=>o.shipId===s.id).map(o=>o.name+": "+o.orders.map(id=>ACTIONS[id].label).join(" + ")).join(" · ")||"En attente de résolution"}</p>)}
    {!gm.result&&gm.phase==="ready-for-resolution"&&<form action={resolveCombatAction}><Hidden name="revision" value={gm.revision}/><h3>Arbitrer le tour {gm.turn}</h3><p>Outil local provisoire : renseignez les dégâts reçus et les réparations de bouclier. Le moteur applique l’ordre bouclier, blindage, coque. Aucun calcul de toucher automatique.</p>
      {gm.ships.map(s=><fieldset key={s.id}><legend>{s.name}</legend><label>Dégâts reçus <input type="number" name={s.id+"-damage"} min={0} max={1000000} step={1} defaultValue={0} required/></label><label>Réparation de bouclier <input type="number" name={s.id+"-repair"} min={0} max={1000000} step={1} defaultValue={0} required/></label></fieldset>)}
      <CommandButton confirmText="Résoudre ce tour et archiver les ordres ?">Résoudre le tour</CommandButton>
    </form>}
    <form action={resetCombatAction}><Hidden name="revision" value={gm.revision}/><CommandButton confirmText="Effacer les ordres, messages et rapports de ce scénario de test ?">Réinitialiser le scénario</CommandButton></form>
  </section>;
}

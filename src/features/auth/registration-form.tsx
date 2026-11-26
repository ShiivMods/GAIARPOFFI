"use client";
import {useActionState,useState} from "react";
import {beginRegistrationAction,finishRegistrationAction} from "./actions";
import {ACADEMIES,ACADEMY_MIN_AGE,GRADUATION_MIN_AGE,SPECIALIZATIONS,SPECIES_OPTIONS,optionsForSpecies} from "./registration-rules";

const HELP={
  name:"Votre nom représente votre dynastie. Un nom déjà pris ne peut pas être réutilisé. Vous pourrez par la suite rejoindre la dynastie d’un autre joueur.",
  firstName:"Le prénom identifie votre personnage au sein de sa dynastie.",
  species:"Pour le moment, seule l’espèce humaine est disponible.",
  sex:"Les choix de sexe dépendent de l’espèce sélectionnée.",
  faction:"Les factions accessibles dépendent de l’espèce. Humanis est actuellement la seule faction disponible à l’inscription.",
  height:"Indiquez la taille en centimètres, par exemple 183 cm.",
  weight:"Indiquez le poids en kilogrammes, par exemple 80 kg.",
  age:"Avant 14 ans, aucune académie ni progression de spécialisation. De 14 à 17 ans, formation possible avec 25 % des gains. Première majorité à 18 ans ; permis de vaisseau accessible à 21 ans.",
  academy:"L’académie mène à une spécialisation. Un personnage créé à partir de 18 ans est diplômé ; un étudiant doit obtenir son diplôme en RP et le faire valider par un MJ.",
  history:"L’histoire du personnage est facultative.",
  traits:"Facultatif. Vous pourrez compléter le caractère et les traits physiques plus tard.",
};
type HelpKey=keyof typeof HELP;

export function CredentialsForm(){
  const [error,action,pending]=useActionState(beginRegistrationAction,"");
  const [email,setEmail]=useState("");
  return <form action={action} className="registration-form">
    <label htmlFor="reg-email">Adresse e-mail</label>
    <input id="reg-email" name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={e=>setEmail(e.target.value)} placeholder="explorateur@example.test"/>
    <label htmlFor="reg-password">Mot de passe</label>
    <input id="reg-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required aria-describedby="password-hint"/>
    <small id="password-hint">12 à 128 caractères.</small>
    {error&&<p role="alert" className="registration-error">{error}</p>}
    <div className="registration-footer"><button className="registration-primary" disabled={pending} type="submit">{pending?"Vérification…":"Continuer"}</button></div>
  </form>;
}
export function CharacterForm(){
  const [error,action,pending]=useActionState(finishRegistrationAction,"");
  const [values,setValues]=useState({dynasty:"",firstName:"",height:"",weight:"",age:"",history:"",traits:""});
  const [academy,setAcademy]=useState("");
  const [species,setSpecies]=useState("Humain");
  const [sex,setSex]=useState("");
  const [faction,setFaction]=useState("Humanis");
  const options=optionsForSpecies(species);
  function changeSpecies(next:string){
    const allowed=optionsForSpecies(next);
    setSpecies(next);
    setSex(old=>allowed?.sexes.includes(old)?old:"");
    setFaction(old=>allowed?.factions.includes(old)?old:allowed?.factions[0]??"");
  }
  const [help,setHelp]=useState<HelpKey>("name");
  const eligible=values.age.trim()!==""&&Number.isInteger(Number(values.age))&&Number(values.age)>=ACADEMY_MIN_AGE;
  const mustChoose=eligible&&Number(values.age)>=GRADUATION_MIN_AGE;
  function change(key:keyof typeof values,value:string){
    setValues(old=>({...old,[key]:value}));
    if(key==="age"&&(value.trim()===""||Number(value)<ACADEMY_MIN_AGE||!Number.isInteger(Number(value))))setAcademy("");
  }
  function tip(key:HelpKey){return <button className="registration-tip" type="button" aria-label={"Conseil : "+key} title={HELP[key]} onClick={()=>setHelp(key)}>(?)</button>;}
  return <form action={action} className="registration-form character-form">
    <div className="registration-grid">
      <div className="registration-identity">
        <div className="registration-field"><label htmlFor="reg-dynasty">Nom {tip("name")}</label><input id="reg-dynasty" name="dynasty" required maxLength={60} value={values.dynasty} onChange={e=>change("dynasty",e.target.value)} onFocus={()=>setHelp("name")}/></div>
        <div className="registration-field"><label htmlFor="reg-firstname">Prénom</label><input id="reg-firstname" name="firstName" required maxLength={60} value={values.firstName} onChange={e=>change("firstName",e.target.value)} onFocus={()=>setHelp("firstName")}/></div>
        <div className="registration-field"><label htmlFor="reg-species">Espèce {tip("species")}</label><select id="reg-species" name="species" required value={species} onChange={e=>changeSpecies(e.target.value)} onFocus={()=>setHelp("species")}>{Object.keys(SPECIES_OPTIONS).map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="registration-field"><label htmlFor="reg-sex">Sexe {tip("sex")}</label><select id="reg-sex" name="sex" required value={sex} onChange={e=>setSex(e.target.value)} onFocus={()=>setHelp("sex")}><option value="" disabled>Choisir</option>{options?.sexes.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="registration-measurements">
        <div className="registration-field"><label htmlFor="reg-faction">Faction {tip("faction")}</label><select id="reg-faction" name="faction" required value={faction} onChange={e=>setFaction(e.target.value)} onFocus={()=>setHelp("faction")}>{options?.factions.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="registration-field"><label htmlFor="reg-height">Taille (cm)</label><input id="reg-height" name="height" inputMode="decimal" placeholder="183 cm" required maxLength={12} value={values.height} onChange={e=>change("height",e.target.value)} onFocus={()=>setHelp("height")}/></div>
        <div className="registration-field"><label htmlFor="reg-weight">Poids (kg)</label><input id="reg-weight" name="weight" inputMode="decimal" placeholder="80 kg" required maxLength={12} value={values.weight} onChange={e=>change("weight",e.target.value)} onFocus={()=>setHelp("weight")}/></div>
        <div className="registration-field registration-age"><label htmlFor="reg-age">Âge {tip("age")}</label><input id="reg-age" name="age" type="number" min={0} step={1} required value={values.age} onChange={e=>change("age",e.target.value)} onFocus={()=>setHelp("age")}/></div>
      </div>
      <section className="registration-summary registration-faction"><div className="registration-kicker">FACTION SÉLECTIONNÉE</div><h3>{faction}</h3>{faction==="Humanis"&&<><p>Faction humaine. La Commission incarne le cœur politique d’Humanis.</p><a href="/lore/factions/humanis" target="_blank" rel="noreferrer">Consulter le lore ↗</a></>}</section>
      <aside className="registration-summary registration-help" aria-live="polite"><div className="registration-kicker">CONSEIL</div><p>{HELP[help]}</p></aside>
    </div>
    <fieldset className="registration-academy"><legend>Académie {tip("academy")}</legend>
      <div className="registration-academies">{ACADEMIES.map(name=><label key={name} className={academy===name?"chosen":""}><input type="radio" name="academy" value={name} checked={academy===name} disabled={!eligible} required={mustChoose} onChange={()=>{setAcademy(name);setHelp("academy");}}/><span>{name}</span></label>)}</div>
      {eligible&&!mustChoose&&academy&&<button type="button" className="registration-tip" onClick={()=>setAcademy("")}>Ne pas choisir d’académie</button>}
      <div className="registration-summary registration-specialization"><div className="registration-kicker">SPÉCIALISATION SÉLECTIONNÉE</div><p>{!eligible?"Académie indisponible avant 14 ans (renseignez l’âge).":academy?`${SPECIALIZATIONS[academy as keyof typeof SPECIALIZATIONS]} · ${mustChoose?"Diplômé à la création":"Formation en cours · 25 % des gains"}`:mustChoose?"Choisissez une académie.":"Académie facultative · aucune progression de spécialisation hors formation."}</p></div>
    </fieldset>
    <div className="registration-field"><label htmlFor="reg-history">Histoire du personnage <small>(optionnel)</small></label><textarea id="reg-history" name="history" rows={5} maxLength={10000} value={values.history} onChange={e=>change("history",e.target.value)} onFocus={()=>setHelp("history")}/></div>
    <div className="registration-field"><label htmlFor="reg-traits">Caractère &amp; traits physiques <small>(optionnel)</small></label><textarea id="reg-traits" name="traits" rows={5} maxLength={10000} value={values.traits} onChange={e=>change("traits",e.target.value)} onFocus={()=>setHelp("traits")}/></div>
    {error&&<p role="alert" className="registration-error">{error}</p>}
    <div className="registration-footer"><button className="registration-primary" type="submit" disabled={pending}>{pending?"Validation…":"Embarquer ➤"}</button></div>
  </form>;
}

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { rulesTabs, specificTopics } from './rulesData'
import type { RulesSection } from './rulesData'

type Props = { section: RulesSection; onSectionChange: (section: RulesSection) => void }

export function RulesPage({ section, onSectionChange }: Props) {
  const content = useRef<HTMLDivElement>(null)
  useEffect(() => { content.current?.scrollTo({ top: 0 }) }, [section])
  const current = rulesTabs.find(tab => tab.id === section)!
  function jumpTo(id: string) {
    const panel = content.current
    const target = document.getElementById('rules-' + id)
    if (panel && target) panel.scrollTo({ top: panel.scrollTop + target.getBoundingClientRect().top - panel.getBoundingClientRect().top - 20, behavior: 'smooth' })
  }
  return (
    <main className="lore-page rules-page">
      <section className="lore-shell rules-shell">
        <div className="lore-page-title"><span>RÈGLEMENT</span><strong>{current.label}</strong></div>
        <nav className="lore-tabs rules-tabs" aria-label="Sections du règlement">
          {rulesTabs.map(tab => <button key={tab.id} type="button" className={section === tab.id ? 'active' : ''} aria-current={section === tab.id ? 'page' : undefined} onClick={() => onSectionChange(tab.id)}>{tab.label}</button>)}
        </nav>
        <div className="rules-layout">
          {section === 'gaia' && <aside className="rules-index"><span className="eyebrow">SOMMAIRE</span>
            <nav aria-label="Sommaire des informations spécifiques">{specificTopics.map((topic, index) => <button key={topic.id} type="button" onClick={() => jumpTo(topic.id)}><small>{String(index + 1).padStart(2, '0')}</small><span>{topic.title}</span></button>)}</nav>
          </aside>}
          <div className="lore-content rules-content" ref={content}>
            {section === 'general' ? <div className="rules-document"><div className="rules-intro"><span className="eyebrow">VIE DU FORUM</span><h2>Règlement général</h2><p>Cette section accueillera les règles générales du forum. Sa rédaction est en cours.</p><button type="button" className="rules-inline-button" onClick={() => onSectionChange('gaia')}>Consulter les informations spécifiques à GAIARP</button></div></div> : <SpecificRules />}
          </div>
        </div>
      </section>
    </main>
  )
}

function RuleSection({ index, children }: { index: number; children: ReactNode }) {
  const topic = specificTopics[index]
  return <section id={'rules-' + topic.id} className="rules-chapter"><header><span className="rules-number">{String(index + 1).padStart(2, '0')}</span><h3>{topic.title}</h3></header>{children}</section>
}

function SpecificRules() {
  return <article className="rules-document">
    <div className="rules-intro"><span className="eyebrow">GAÏA // GUIDE DU JOUEUR</span><h2>Informations spécifiques à GAIARP</h2><p>Comprendre le fonctionnement du jeu, son univers et la place de vos personnages dans l'histoire de Gaïa.</p></div>
    <RuleSection index={0}>
      <p>Les RP sont divisés en plusieurs catégories, bien qu'elles ne soient pas explicitement indiquées comme telles.</p>
      <dl className="rules-definitions">
        <div><dt>Lore majeur</dt><dd>Implique généralement plusieurs factions et peut avoir un impact sur la galaxie. Il constitue le fil conducteur principal de l'histoire.</dd></div>
        <div><dt>Lore secondaire</dt><dd>RP généralement liés à une faction, une espèce ou une planète. Leur impact sur le jeu peut parfois être comparable à celui du lore majeur ; dans d'autres cas, leurs conséquences seront plus localisées ou moins visibles.</dd></div>
        <div><dt>Lore tertiaire</dt><dd>Contenu créé entre les joueurs uniquement, sans intervention extérieure. Ces RP alimentent généralement vos personnages et leurs conséquences sur le jeu sont très variables.</dd></div>
      </dl>
      <p className="rules-note">Rien n'est figé dans le marbre. Ces catégories n'ont qu'une fonction administrative. Un RP créé entre deux joueurs peut mener à quelque chose de bien plus grand, sans que les MJ l'aient prévu en amont.</p>
    </RuleSection>
    <RuleSection index={1}>
      <p>Si vous avez consulté le Lore du forum, vous avez pu constater qu'il est divisé en trois catégories : Optionnel, Profond et Essentiel. Bien qu'elles servent avant tout à vous indiquer l'importance d'une partie de l'histoire, elles peuvent également représenter le niveau de connaissance de votre personnage en RP.</p>
      <dl className="rules-definitions rules-knowledge">
        <div><dt>Essentiel</dt><dd>Presque n'importe quel personnage sait que l'humanité a fui la Terre plusieurs générations plus tôt, à bord d'Arches gigantesques, lorsque les étoiles commençaient à s'éteindre dans sa galaxie d'origine.</dd></div>
        <div><dt>Profond</dt><dd>Il est moins courant qu'un personnage sache nommer les Arches et connaisse la tragique histoire derrière cet exil.</dd></div>
        <div><dt>Optionnel</dt><dd>Il est encore moins probable qu'un personnage connaisse l'histoire de l'humanité avant le Siècle Novateur et la découverte du Redium, ou sache comment la première force spatiale fut créée.</dd></div>
      </dl>
      <p>Il faut également conserver une logique propre à votre personnage. Celui-ci peut connaître l'histoire de l'humanité sur le bout des doigts, tout en négligeant certains éléments pourtant importants. Cela peut découler de son éducation ou tout simplement de sa personnalité. Vous êtes libres sur ce point, mais la cohérence demeure importante.</p>
      <p className="rules-note">Il est recommandé à un nouveau joueur d'éviter d'interpréter un personnage supposé disposer de très nombreuses connaissances, car cela demande de véritablement connaître le lore du forum.</p>
    </RuleSection>
    <RuleSection index={2}>
      <p>Tôt ou tard au cours de votre aventure, vous finirez au cœur de confrontations. Parfois malgré vous… ou parce que vous aurez sciemment cherché les ennuis.</p>
      <p>Il existe deux types d'affrontements, chacun ayant ses propres spécificités, bien que le système initial reste similaire.</p>
      <div className="rules-subchapter"><h4>Les affrontements spatiaux</h4>
        <p>Ils se déroulent à bord de vaisseaux. Chaque vaisseau dispose de ses propres statistiques, de sa propre personnalisation et d'une limite de membres d'équipage joueurs pouvant être embarqués. L'utilisation du système de combat y est fortement recommandée.</p>
        <ul>
          <li>Les combats se déroulent au tour par tour et chaque camp joue en même temps. Le système de jeu calcule lui-même le résultat du tour.</li>
          <li>Les vaisseaux conventionnels disposent tous d'un bouclier et d'une coque représentant leur état. Les vaisseaux plus spécialisés disposent d'un blindage supplémentaire.</li>
          <li>Posséder un équipage plus grand confère un avantage certain. Les points d'action dépendent du personnage et de son poste, non du vaisseau lui-même. De fait, des personnages très expérimentés pourraient rendre un vaisseau de tier I particulièrement redoutable.</li>
          <li>Les messages RP intégrés au système de combat sont destinés aux dialogues. Ils sont facultatifs.</li>
        </ul>
        <p>Gardez à l'esprit qu'il reste rare qu'un affrontement spatial se termine par la destruction d'un vaisseau. Si ce n'est par bonté d'âme envers son prochain, les vaisseaux, même les plus simples, sont d'une grande valeur, et ce que peut contenir leur inventaire l'est d'autant plus. Si un vaisseau est détruit, son inventaire l'est également. Un équipage en difficulté préférera donc se rendre.</p>
        <p className="rules-note">Il ne s'agit toutefois que d'une règle tacite. Certains n'accordent aucune importance à la vie ou au matériel.</p>
      </div>
      <div className="rules-subchapter"><h4>Les affrontements au sol</h4>
        <p>Ils sont similaires aux combats spatiaux, mais dépendent davantage de votre propre équipement et de vos compétences. Un système de combat dédié est prévu sur le même principe. Les affrontements purement RP sont toutefois plus que bienvenus.</p>
        <p>Un combat au sol est bien plus dangereux que dans l'espace. Là où les vaisseaux se ressemblent les uns les autres et où la fuite est plus simple, l'équipement ou tout simplement la nature de votre adversaire pourrait rendre un combat impossible à remporter. C'est pourquoi l'exploration solitaire est peu recommandée. Une équipe diversifiée sera bien plus à même de venir à bout des dangers dont regorge Gaïa.</p>
      </div>
      <div className="rules-subchapter"><h4>Les munitions et les armes de corps à corps</h4>
        <p>Il existe actuellement deux types de munitions, chacun ayant ses propres avantages et inconvénients.</p>
        <dl className="rules-definitions">
          <div><dt>Cinétique</dt><dd>Armement ordinaire pouvant abattre aisément une cible non protégée. Inefficace face à un bouclier si le tir n'est pas soutenu. Certaines armes spéciales permettent également de traverser directement les blindages, mais ces équipements sont rares et chers.</dd></div>
          <div><dt>Laser</dt><dd>Particulièrement efficaces face aux boucliers ou à la chair, les lasers sont néanmoins inutiles face à un blindage trop épais. Certains équipements défensifs permettent même de dévier les tirs laser. De plus, ces armes sont facilement sujettes à la surchauffe, ce qui leur impose de refroidir entre chaque utilisation. Au sein d'Humanis, les armes laser sont rares, chères et surtout réservées aux vaisseaux militaires spécialisés.</dd></div>
          <div><dt>Corps à corps</dt><dd>Les armes de corps à corps constituent un style de combat spécifique. Elles ignorent complètement le bouclier adverse, mais il est impossible d'attaquer et de se protéger simultanément. Si n'importe qui peut en utiliser, un personnage talentueux avec ce type d'arme peut réaliser de véritables prouesses.</dd></div>
        </dl>
      </div>
    </RuleSection>
    <RuleSection index={3}>
      <p>Une grande partie du récit principal fut rédigée avant même la création du forum. Cela n'a néanmoins pas pour but de vous guider dans une histoire linéaire dans laquelle vos personnages ne seraient que secondaires. L'histoire n'est pas figée pour autant : il s'agit simplement d'un principe de cohérence sur le long terme.</p>
      <p>Peu importe combien de temps un personnage vit, celui-ci peut tout à fait avoir un impact majeur sur le déroulement de l'histoire.</p>
      <p>Cette dernière est écrite de façon à vous laisser l'influencer, parfois de manière drastique, et je l'espère, au-delà de ma propre imagination !</p>
    </RuleSection>
    <RuleSection index={4}>
      <p>Oui, l'histoire peut virtuellement se terminer, et je dirais que c'est même l'objectif. Mais peut-être pas de la manière dont vous l'imaginez.</p>
      <p>Même si l'histoire initiale est prévue pour s'étirer sur de nombreux chapitres, chacun apporte son lot de nouveautés et de dangers. Qui sait ce qu'un joueur imprudent pourrait provoquer ? Toutefois, la fin d'une histoire n'annonce pas nécessairement la fin du jeu.</p>
      <p>Le jeu est conçu pour que vous jouiez plusieurs personnages à travers le temps (qui, selon l'activité, peut s'écouler très vite !), que vous exploriez Gaïa sous plusieurs angles et y découvriez ses secrets.</p>
    </RuleSection>
    <RuleSection index={5}>
      <p>Humanis ne sera pas la seule faction jouable, et l'humanité ne sera pas la seule espèce. Toutefois, chaque ajout demande un travail en amont : si le lore est déjà écrit, ce n'est pas nécessairement le cas des compétences ou des équipements exclusifs. Cela demande autant un travail créatif qu'une vérification de l'équilibrage.</p>
      <p>Le mot « jouable » est néanmoins important. Il n'est pas exclu que certaines espèces ou factions soient réservées au lore et ne soient pas ouvertes aux inscriptions directes. L'accès à ces personnages uniques fait notamment partie des récompenses pouvant vous être accordées.</p>
      <p>La fréquence de ces ajouts dépend notamment des joueurs et de leurs découvertes. Certaines choses sont déjà fixées, d'autres peuvent apparaître ponctuellement.</p>
      <p>Il n'est pour l'heure pas prévu d'ajouter des factions et espèces jouables créées par les joueurs. Toutefois, votre participation est la bienvenue si vous souhaitez créer une planète de A à Z et vous improviser MJ lors du jeu sur cette dernière ! Nous n'acceptons évidemment pas l'intégralité des propositions.</p>
    </RuleSection>
    <RuleSection index={6}>
      <p>Oui, un joueur peut bénéficier d'une attention particulière si le staff reconnaît ce qu'il apporte au forum, que ce soit en termes de jeu, de présence ou tout simplement d'ambiance.</p>
      <p>Sans communauté, nous n'existons tout simplement pas, et il semble tout à fait normal de récompenser ceux qui permettent à celle-ci d'exister sous tous ses aspects. Nous ne parlons pas ici de récompenses injustes bouleversant l'équilibre même du jeu, mais surtout d'opportunités pour les joueurs qui ont à cœur de faire vivre le forum.</p>
      <p className="rules-note">Toutefois, l'inverse est faux, et c'est une règle d'or : nous ne sommes pas élitistes, et chacun est le bienvenu. Que vous débutiez dans le RP ou que vous soyez vétéran, chacun peut se faire sa place.</p>
      <p>Les règles du jeu vont d'ailleurs dans ce sens : nous encourageons une collaboration constante face à votre véritable ennemi commun… les MJ.</p>
      <p>Nous ferons toujours en sorte de vous guider, de répondre à vos questions et de prendre du temps pour jouer avec vous. Mais gardez en tête que tout n'arrive pas du jour au lendemain et que chaque membre, peu importe son rôle, reste humain.</p>
    </RuleSection>
  </article>
}

// Historical bridge view preserved for a potential V2. Not used in the current navigation.
import type {ReactNode} from 'react'

export function ShipHome({
  onOpen,
}: {
  onOpen: (target: 'map' | 'ship' | 'character') => void
}) {
  return (
    <div className="ship-home">
      <div className="ship-home-vignette" />

      <div className="ship-home-copy">
        <div className="eyebrow">VVF RAVIOLO · PONT PRINCIPAL</div>
        <h2>Bienvenue à bord</h2>
        <p>
          Sélectionne un élément du vaisseau ou utilise le panneau de droite.
        </p>
      </div>

      <button
        className="ship-hotspot hotspot-exo"
        onClick={() => onOpen('character')}
        aria-label="Ouvrir les informations du personnage"
      >
        <span className="hotspot-ring" />
        <span className="hotspot-label">
          <b>Équipement personnel</b>
          <small>Personnage · Exo-combinaison</small>
        </span>
      </button>

      <button
        className="ship-hotspot hotspot-map"
        onClick={() => onOpen('map')}
        aria-label="Ouvrir la carte galactique"
      >
        <span className="hotspot-ring" />
        <span className="hotspot-label">
          <b>Navigation</b>
          <small>Carte galactique · Gaïa</small>
        </span>
      </button>

      <button
        className="ship-hotspot hotspot-command"
        onClick={() => onOpen('ship')}
        aria-label="Ouvrir les informations du vaisseau"
      >
        <span className="hotspot-ring" />
        <span className="hotspot-label">
          <b>Poste de commandement</b>
          <small>État et gestion du vaisseau</small>
        </span>
      </button>

      <div className="ship-home-hint">
        Survole un poste pour l’identifier · Les mêmes accès restent disponibles à droite
      </div>
    </div>
  )
}

export function HomeNavigationInspector({ onOpenMap }: { onOpenMap: () => void }) {
  return (
    <div className="home-nav-panel cozy-panel">
      <div className="inspector-kicker">NAVIGATION</div>
      <h2>Table galactique</h2>
      <p className="description">La projection centrale donne accès à Gaïa, aux secteurs connus et à leurs systèmes. La carte 0.4.0 reste inchangée derrière cet écran d’accueil.</p>
      <button className="edit-primary" onClick={onOpenMap}>Ouvrir la carte galactique</button>
      <SectionLabel>Raccourcis du pont</SectionLabel>
      <div className="home-shortcuts">
        <div><b>Centre</b><span>Navigation galactique</span></div>
        <div><b>Gauche</b><span>Personnage / Exo</span></div>
        <div><b>Droite</b><span>Vaisseau / Commandement</span></div>
      </div>
    </div>
  )
}


function SectionLabel({children}:{children:ReactNode}) { return <div className="section-label">{children}</div> }

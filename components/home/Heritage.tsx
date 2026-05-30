import Link from 'next/link'

export default function Heritage() {
  return (
    <section className="heritage">
      <div className="fk-container">
        <div className="heritage-grid">
          <div className="heritage-year reveal">
            <span className="counter" data-target="2020">0</span>
            <small>L&apos;année où tout commence</small>
          </div>
          <div className="heritage-text reveal">
            <span className="kicker">Notre histoire</span>
            <h2>
              L&apos;histoire commence à <em>Kinshasa</em>, au cœur du Congo.
            </h2>
            <p>
              Fondée par Fortune Khonde, FK Éditions est née d&apos;une conviction
              simple : la littérature congolaise mérite ses propres voix, ses
              propres pages, sa propre maison. Une maison où les manuscrits trouvent
              un foyer, où les auteurs sont accompagnés avec exigence, et où chaque
              livre devient un objet de transmission.
            </p>
            <p>
              Depuis cinq ans, nous accompagnons une nouvelle génération d&apos;écrivains
              dans leur cheminement. Récit, essai, témoignage, poésie : autant de
              formes pour dire le monde tel qu&apos;il est — et tel que nous le rêvons.
            </p>
            <Link href="/auteurs" className="link-arrow" style={{ marginTop: 24, display: 'inline-flex' }}>
              Découvrir la maison
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

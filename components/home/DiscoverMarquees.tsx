import Link from 'next/link'

const rows = [
  ['Littérature', 'Récit', 'Essai', 'Témoignage', 'Poésie', 'Histoire'],
  ['Spiritualité', 'Jeunesse', 'Documents', 'Biographie', 'Théâtre', 'Roman'],
  ['Revue littéraire', 'Magazine', 'Numérique', 'Audio', 'Manuscrits', 'Ateliers'],
]

export default function DiscoverMarquees() {
  return (
    <section className="discover">
      <div className="fk-container">
        <div className="reveal">
          <span className="kicker">Explorer</span>
          <h2 className="section-title">
            Découvrir par <em className="serif-i">thématique</em>
          </h2>
        </div>
      </div>
      <div className="discover-marquees">
        {rows.map((row, ri) => (
          <div key={ri} className="discover-row">
            <div className="discover-track">
              {[...row, ...row].map((item, i) => (
                <Link key={i} href={`/livres?categorie=${encodeURIComponent(item)}`}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

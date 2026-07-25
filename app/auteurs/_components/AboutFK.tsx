/** Encart « À propos de FK Éditions » en bas de la page auteurs. */
export default function AboutFK() {
  return (
    <div style={{ marginTop: 40, padding: 'clamp(32px, 6vw, 64px)', background: 'var(--bg-elev)', border: '1px solid var(--line)' }}>
      <span className="kicker">Notre histoire</span>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink)', marginTop: 16, marginBottom: 32 }}>
        À propos de <em className="serif-i" style={{ color: 'var(--accent)' }}>FK Éditions</em>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
          FK Éditions est une maison d&apos;édition basée à Kinshasa, en République
          Démocratique du Congo. Fondée en 2020 par Fortune Khonde, elle est
          une voix par laquelle auteurs, écrivains et hommes de lettres
          s&apos;expriment et partagent leurs expériences ainsi que leur parcours.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
          Ce voyage, nous voulons le partager avec vous. Chaque livre publié
          par FK Éditions est le fruit d&apos;une collaboration sincère entre
          l&apos;auteur et notre équipe éditoriale, dans un engagement commun pour
          l&apos;excellence littéraire et l&apos;authenticité des voix africaines.
        </p>
      </div>
    </div>
  )
}

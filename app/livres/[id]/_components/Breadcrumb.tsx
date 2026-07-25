import Link from 'next/link'

const linkStyle = { textDecoration: 'none', color: 'inherit', textTransform: 'uppercase' } as const

/** Fil d'Ariane Accueil / Livres / {title}. */
export default function Breadcrumb({ title }: { title: string }) {
  return (
    <div style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--line)', padding: '14px 0', fontSize: 12, letterSpacing: '0.06em' }}>
      <div className="fk-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-mute)' }}>
          <Link href="/" style={linkStyle}>Accueil</Link>
          <span>/</span>
          <Link href="/livres" style={linkStyle}>Livres</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, letterSpacing: 0, textTransform: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
            {title}
          </span>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

/** Encart invitant les visiteurs non connectés à s'identifier. */
export default function LoginPrompt() {
  return (
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', padding: 32, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--ink)', marginBottom: 14 }}>
        Connectez-vous pour laisser un message
      </p>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 22 }}>
        Pour préserver la qualité des échanges, seuls les comptes inscrits
        peuvent contribuer au livre d&apos;or.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
        <Link href="/login?callbackUrl=/avis" className="btn btn-primary">
          <span>Se connecter</span>
          <span className="shimmer" />
        </Link>
        <Link href="/register" className="btn btn-ghost">
          Créer un compte
        </Link>
      </div>
    </div>
  )
}

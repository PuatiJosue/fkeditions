import Link from 'next/link'
import type { ReactNode } from 'react'

/** En-tête de section avec titre, compteur optionnel et contenu additionnel. */
export function SectionHeader({ title, count, children }: { title: string; count?: number; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--ink)', fontWeight: 500 }}>
        {title}
        {typeof count === 'number' && (
          <span style={{ color: 'var(--ink-mute)', marginLeft: 10, fontStyle: 'normal', fontSize: 16, fontFamily: 'var(--sans)' }}>({count})</span>
        )}
      </h2>
      {children}
    </div>
  )
}

/** Bandeau des commandes Mobile Money en attente de validation. */
export function PendingBanner({ count }: { count: number }) {
  return (
    <div style={{ background: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.3)', padding: 20, color: '#ea580c' }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>
        {count} commande{count > 1 ? 's' : ''} en attente de validation
      </p>
      <p style={{ fontSize: 13, opacity: 0.85 }}>
        Votre paiement Mobile Money est en cours de vérification par notre équipe (sous 24h). Vous recevrez un accès dès la validation.
      </p>
    </div>
  )
}

/** État affiché lorsque la bibliothèque est totalement vide. */
export function EmptyLibrary() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 28, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 12 }}>
        Votre bibliothèque est vide
      </p>
      <p style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 32 }}>
        Achetez un ebook ou abonnez-vous à la revue pour commencer votre collection.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        <Link href="/livres" className="btn btn-primary">
          <span>Découvrir les livres</span>
          <span className="shimmer" />
        </Link>
        <Link href="/flysys" className="btn btn-ghost">
          Découvrir FLYSYS
        </Link>
      </div>
    </div>
  )
}

/** Encart d'invitation à s'abonner à FLYSYS (lecteurs sans abonnement actif). */
export function SubscribeCta() {
  return (
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', padding: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
      <div>
        <p className="kicker" style={{ marginBottom: 8 }}>FLYSYS</p>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>
          Abonnez-vous à la revue
        </h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          Accédez à tous nos numéros et archives depuis votre bibliothèque.
        </p>
      </div>
      <Link href="/flysys#abonnements" className="btn btn-primary">
        <span>Voir les abonnements</span>
        <span className="shimmer" />
      </Link>
    </div>
  )
}

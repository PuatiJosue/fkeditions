import BookFormatSelector from '@/components/checkout/BookFormatSelector'
import type { BookWithAuthor } from '@/lib/services/books'

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 15, color: 'var(--ink)' }}>{value}</p>
    </div>
  )
}

function accessLabel(preOrder: boolean, releaseDate?: string) {
  if (preOrder && releaseDate) {
    return `Le ${new Date(releaseDate).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long' })}`
  }
  return 'Immédiat après achat'
}

type Props = {
  book: BookWithAuthor
  releaseDate?: string
  releaseLong: string | null
  successParam?: string
  cancelledParam?: string
}

/** Colonne d'information et d'achat d'un livre (titre, auteur, format, réassurance). */
export default function BookInfo({ book, releaseDate, releaseLong, successParam, cancelledParam }: Props) {
  const reassurance = [
    { icon: '🔒', text: 'Paiement sécurisé' },
    book.preOrder && releaseDate
      ? { icon: '📅', text: `Livraison le ${new Date(releaseDate).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long' })}` }
      : { icon: '⚡', text: 'Accès immédiat' },
    { icon: '📱', text: 'Lisible sur tous appareils' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <span className="kicker" style={{ color: 'var(--accent)', margin: 0 }}>{book.category}</span>
        {book.year && <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>· {book.year}</span>}
      </div>

      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.05, color: 'var(--ink)', marginBottom: 24 }}>
        {book.title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ width: 2, height: 36, background: 'var(--accent)' }} />
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 4 }}>
            {book.coAuthors ? 'Auteurs' : 'Auteur'}
          </p>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--ink)' }}>
            {book.author?.name ?? 'FK Éditions'}
            {book.coAuthors && <span style={{ color: 'var(--ink-soft)' }}> & {book.coAuthors}</span>}
          </p>
        </div>
      </div>

      <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: 28 }}>{book.description}</p>

      {book.preOrder && releaseLong && (
        <div style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent-deep)', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 28 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Pré-commande</p>
            <p style={{ fontSize: 14 }}>
              Payez maintenant et recevez votre livre dès le <strong>{releaseLong}</strong>.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, padding: '24px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
        <MetaItem
          label="Format"
          value={book.pricePhysical ? 'Ebook PDF · Livre physique' : book.type === 'EBOOK' ? 'Ebook (PDF)' : 'Livre physique'}
        />
        {book.pages && <MetaItem label="Pages" value={`${book.pages} pages`} />}
        <MetaItem label="Langue" value="Français" />
        <MetaItem label="Accès" value={accessLabel(book.preOrder, releaseDate)} />
      </div>

      <BookFormatSelector
        bookId={book.slug}
        bookTitle={book.title}
        price={book.price}
        pricePhysical={book.pricePhysical}
        priceAudio={book.priceAudio}
        successParam={successParam}
        cancelledParam={cancelledParam}
        preOrder={book.preOrder}
        releaseDate={releaseDate}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingTop: 20, marginTop: 4 }}>
        {reassurance.map((badge) => (
          <div key={badge.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-mute)' }}>
            <span>{badge.icon}</span>
            <span>{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

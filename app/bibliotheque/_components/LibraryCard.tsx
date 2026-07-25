import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { MONTHS_FR } from '@/lib/constants'
import type { RevueIssue } from '@/lib/services/library'

/** Forme minimale d'un livre acheté affiché dans la bibliothèque. */
export type LibraryBook = {
  slug: string
  title: string
  category: string
  coverImage: string | null
  preOrder: boolean
  releaseDate: Date | string | null
  type: string
  audioFile: string | null
}

const kickerStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  fontWeight: 600,
}

const titleStyle: CSSProperties = {
  fontFamily: 'var(--serif)',
  fontSize: 17,
  lineHeight: 1.25,
  color: 'var(--ink)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

/** Enveloppe commune : cadre + couverture (avec fallback « FK ») + badge. */
function CardShell({
  coverImage,
  alt,
  badge,
  children,
}: {
  coverImage: string | null
  alt: string
  badge: ReactNode
  children: ReactNode
}) {
  return (
    <article style={{ background: 'var(--paper)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '2 / 3', background: 'var(--bg-deep)' }}>
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 40, color: 'var(--line)' }}>
            FK
          </div>
        )}
        {badge}
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>{children}</div>
    </article>
  )
}

function CardBadge({ background, color, children }: { background: string; color: string; children: ReactNode }) {
  return (
    <span style={{ position: 'absolute', top: 10, left: 10, background, color, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
      {children}
    </span>
  )
}

export function PurchasedBookCard({ book, now }: { book: LibraryBook; now: Date }) {
  const isLocked = Boolean(book.preOrder && book.releaseDate && new Date(book.releaseDate) > now)

  return (
    <CardShell
      coverImage={book.coverImage}
      alt={book.title}
      badge={
        <CardBadge background={isLocked ? 'var(--accent)' : 'var(--ink)'} color={isLocked ? '#fff' : 'var(--bg)'}>
          {isLocked ? 'Pré-commandé' : 'Acheté'}
        </CardBadge>
      }
    >
      <div>
        <p style={{ ...kickerStyle, marginBottom: 4 }}>{book.category}</p>
        <h3 style={titleStyle}>{book.title}</h3>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLocked ? (
          <div style={{ padding: '10px 12px', border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent-deep)', textAlign: 'center', fontSize: 11 }}>
            <p style={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Pré-commande</p>
            <p style={{ fontSize: 10, opacity: 0.85 }}>
              Dispo le {new Date(book.releaseDate!).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        ) : book.type === 'EBOOK' ? (
          <>
            <Link href={`/livres/${book.slug}/lire`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 11 }}>
              <span>📖 Lire le livre</span>
              <span className="shimmer" />
            </Link>
            {book.audioFile && (
              <Link href={`/livres/${book.slug}/ecouter`} style={{ display: 'block', textAlign: 'center', padding: '10px 12px', border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent-deep)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700 }}>
                🎧 Écouter
              </Link>
            )}
          </>
        ) : (
          <div style={{ padding: '10px 12px', border: '1px solid var(--line)', color: 'var(--ink-mute)', textAlign: 'center', fontSize: 11 }}>
            Livre physique — livraison en cours
          </div>
        )}
        <Link href={`/livres/${book.slug}`} style={{ display: 'block', textAlign: 'center', padding: '8px 12px', border: '1px solid var(--line)', color: 'var(--ink-soft)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}>
          Voir la fiche
        </Link>
      </div>
    </CardShell>
  )
}

export function RevueIssueCard({ issue }: { issue: RevueIssue }) {
  return (
    <CardShell coverImage={issue.coverImage} alt={issue.title} badge={<CardBadge background="var(--accent)" color="#fff">FLYSYS</CardBadge>}>
      <p style={kickerStyle}>{MONTHS_FR[issue.month]} {issue.year}</p>
      <h3 style={titleStyle}>{issue.title}</h3>
      {issue.description && (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {issue.description}
        </p>
      )}
      <div style={{ marginTop: 'auto' }}>
        {issue.pdfFile || issue.epubFile ? (
          <Link href={`/flysys/${issue.id}/lire`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 11 }}>
            <span>Lire la revue</span>
            <span className="shimmer" />
          </Link>
        ) : (
          <div style={{ padding: '10px 12px', border: '1px solid var(--line)', color: 'var(--ink-mute)', textAlign: 'center', fontSize: 11 }}>
            Bientôt disponible
          </div>
        )}
      </div>
    </CardShell>
  )
}

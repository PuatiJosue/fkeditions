import BookFormatSelector from '@/components/checkout/BookFormatSelector'
import type { BookWithAuthor } from '@/lib/services/books'

const HEADING_PREFIXES = ['Chapitre', 'Prologue', 'Introduction']
const isHeading = (p: string) => HEADING_PREFIXES.some((prefix) => p.startsWith(prefix))

const paragraphStyle = {
  fontFamily: 'var(--serif)',
  fontSize: 17,
  lineHeight: 1.8,
  color: 'var(--ink-soft)',
  textIndent: '2em',
} as const

type Props = { content: string[]; book: BookWithAuthor; releaseDate?: string }

/** Extrait gratuit d'un livre, dégradé de flou + relance d'achat. */
export default function BookExcerpt({ content, book, releaseDate }: Props) {
  return (
    <section className="spotlight" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(60px, 8vh, 100px)' }}>
      <div className="fk-container" style={{ maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Extrait</span>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink)', marginTop: 16 }}>
            Avant-goût du <em className="serif-i" style={{ color: 'var(--accent)' }}>livre</em>
          </h2>
        </div>

        <div style={{ position: 'relative' }}>
          {content.slice(0, 3).map((paragraph, i) =>
            isHeading(paragraph) ? (
              <h3 key={i} style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--accent)', fontSize: 22, marginTop: 28, marginBottom: 12 }}>
                {paragraph}
              </h3>
            ) : (
              <p key={i} style={{ ...paragraphStyle, marginBottom: 14 }}>{paragraph}</p>
            )
          )}
          <div style={{ position: 'relative', marginTop: 14 }}>
            <p style={{ ...paragraphStyle, opacity: 0.4, userSelect: 'none' }}>{content[3] ?? '...'}</p>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, var(--bg-elev) 80%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div style={{ marginTop: 40, padding: 'clamp(32px, 4vw, 48px)', border: '1px solid var(--line)', background: 'var(--paper)', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 6 }}>
            Vous avez atteint la fin de l&apos;extrait gratuit
          </p>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)', marginBottom: 24 }}>
            Continuez la lecture pour <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>{book.price} $ USD</span>
          </p>
          <BookFormatSelector
            bookId={book.slug}
            bookTitle={book.title}
            price={book.price}
            pricePhysical={book.pricePhysical}
            priceAudio={book.priceAudio}
            preOrder={book.preOrder}
            releaseDate={releaseDate}
          />
        </div>
      </div>
    </section>
  )
}

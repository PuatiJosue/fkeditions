import Link from 'next/link'
import type { BookWithAuthor } from '@/lib/services/books'

/** Grille « Vous aimerez aussi » de livres suggérés. */
export default function RelatedBooks({ books }: { books: BookWithAuthor[] }) {
  return (
    <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)' }}>
      <div className="fk-container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Vous aimerez aussi</span>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink)', marginTop: 16 }}>
            Autres titres <em className="serif-i" style={{ color: 'var(--accent)' }}>FK Éditions</em>
          </h2>
        </div>
        <div className="book-grid">
          {books.map((b) => (
            <Link key={b.slug} href={`/livres/${b.slug}`} className="book-card">
              <div className="book-card-cover-wrap">
                <span className={`book-badge ${b.preOrder ? 'preorder' : ''}`}>
                  {b.preOrder ? 'Pré-commande' : b.category}
                </span>
                <span className="book-price">{b.price} $</span>
                {b.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.coverImage} alt={b.title} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))' }} />
                )}
                <div className="book-card-overlay">
                  <span className="book-card-overlay-text">
                    Voir le livre
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="book-meta">
                <span className="cat">{b.category}</span>
              </div>
              <h3 className="book-title">{b.title}</h3>
              {b.author?.name && <p className="book-author">{b.author.name}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

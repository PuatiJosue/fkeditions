'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export interface LivreItem {
  slug: string
  title: string
  price: number
  priceAudio?: number | null
  hasAudio?: boolean
  coverImage: string
  category: string
  author: string | null
  preOrder: boolean
  releaseDate: string | null
  year?: number | null
}

const CATEGORIES = ['Tous', '🎧 Audio', 'Roman', 'Jeunesse', 'Essai', 'Poésie', 'Thriller', 'Fantasy', 'Biographie', 'Portrait', 'Histoire', 'Géographie', 'Politique', 'Pratique', 'Cuisine', 'Éducation']

function formatReleaseLabel(book: LivreItem): string {
  if (book.releaseDate) {
    try {
      const d = new Date(book.releaseDate)
      const months = [
        'Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
      ]
      return `${book.preOrder ? 'À paraître · ' : 'Parution · '}${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      /* no-op */
    }
  }
  if (book.year) return `Parution · ${book.year}`
  return 'Disponible'
}

function BookCard({ book }: { book: LivreItem }) {
  return (
    <Link href={`/livres/${book.slug}`} className="book-card">
      <div className="book-card-cover-wrap">
        <span className={`book-badge ${book.preOrder ? 'preorder' : ''}`}>
          {book.preOrder ? 'Pré-commande' : book.category}
        </span>
        <span className="book-price">{book.price} $</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.coverImage}
          alt={book.title}
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
            const parent = t.parentElement
            if (parent) {
              parent.style.background =
                'linear-gradient(135deg, var(--accent), var(--accent-deep))'
            }
          }}
        />
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
        <span className="cat">{book.category}</span>
        <span>{formatReleaseLabel(book)}</span>
      </div>
      <h3 className="book-title">{book.title}</h3>
      {book.author && <p className="book-author">{book.author}</p>}
    </Link>
  )
}

export default function LivresClient({ books }: { books: LivreItem[] }) {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return books.filter((b) => {
      const matchCategory =
        activeCategory === 'Tous'
          ? true
          : activeCategory === '🎧 Audio'
          ? Boolean(b.hasAudio)
          : b.category === activeCategory
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.author ?? '').toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [books, activeCategory, query])

  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Catalogue</span>
          <h1
            className="section-title"
            style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: 900 }}
          >
            Nos <em className="serif-i">livres</em>
          </h1>
          <p
            style={{
              marginTop: 28,
              color: 'var(--ink-soft)',
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 560,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Découvrez notre sélection d&apos;ebooks et de livres numériques publiés par
            FK Éditions.
          </p>
        </div>
      </section>

      <section className="fk-section" style={{ paddingTop: 0 }}>
        <div className="fk-container">
          {/* Search */}
          <div
            style={{
              position: 'relative',
              maxWidth: 520,
              marginBottom: 32,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              style={{
                position: 'absolute',
                left: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ink-mute)',
                pointerEvents: 'none',
              }}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un livre ou un auteur…"
              style={{
                width: '100%',
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: 15,
                padding: '14px 44px 14px 46px',
                borderRadius: 999,
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-soft)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: 18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-mute)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                aria-label="Effacer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="section-tabs" style={{ marginTop: 0, marginBottom: 48, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`tab ${activeCategory === cat ? 'is-active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-mute)' }}>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20 }}>
                {query
                  ? `Aucun résultat pour « ${query} »`
                  : 'Aucun livre dans cette catégorie pour le moment.'}
              </p>
            </div>
          ) : (
            <div
              className="book-grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 'clamp(20px, 3vw, 40px)',
              }}
            >
              {filtered.map((book) => (
                <BookCard key={book.slug} book={book} />
              ))}
            </div>
          )}

          <p
            style={{
              textAlign: 'center',
              color: 'var(--ink-mute)',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: 48,
            }}
          >
            {filtered.length} {filtered.length > 1 ? 'livres' : 'livre'} affiché{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </section>
    </>
  )
}

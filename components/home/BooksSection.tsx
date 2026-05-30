'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface BookCardData {
  slug: string
  title: string
  author: string | null
  price: number
  priceAudio?: number | null
  coverImage: string
  category: string
  preOrder: boolean
  releaseDate: string | null
  year?: number | null
  hasAudio?: boolean
}

interface BooksSectionProps {
  newReleases: BookCardData[]
  upcoming: BookCardData[]
  bestsellers: BookCardData[]
  audio: BookCardData[]
}

type Tab = 'new' | 'upcoming' | 'bestsellers' | 'audio'

function formatReleaseLabel(book: BookCardData): string {
  if (book.releaseDate) {
    try {
      const d = new Date(book.releaseDate)
      const months = [
        'Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
      ]
      return `${book.preOrder ? 'À paraître · ' : 'Parution · '}${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      // fallthrough
    }
  }
  if (book.year) return `Parution · ${book.year}`
  return 'Disponible'
}

function BookCard({ book, ctaLabel }: { book: BookCardData; ctaLabel: string }) {
  return (
    <Link href={`/livres/${book.slug}`} className="book-card">
      <div className="book-card-cover-wrap">
        <span className={`book-badge ${book.preOrder ? 'preorder' : ''}`}>
          {book.preOrder ? 'Pré-commande' : 'Nouveauté'}
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
            {ctaLabel}
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

export default function BooksSection({ newReleases, upcoming, bestsellers, audio }: BooksSectionProps) {
  const [tab, setTab] = useState<Tab>('new')

  const getBooks = (): BookCardData[] => {
    if (tab === 'new') return newReleases
    if (tab === 'upcoming') return upcoming
    if (tab === 'audio') return audio
    return bestsellers
  }
  const ctaByTab: Record<Tab, string> = {
    new: 'Voir le livre',
    upcoming: 'Pré-commander',
    bestsellers: 'Acheter le livre',
    audio: '🎧 Écouter l\'extrait',
  }

  return (
    <section className="fk-section" id="livres">
      <div className="fk-container">
        <div className="section-head reveal">
          <div className="section-head-left">
            <span className="kicker">Catalogue</span>
            <h2 className="section-title">
              Les livres de la <em className="serif-i">maison FK</em>
            </h2>
            <div className="section-tabs">
              <button
                className={`tab ${tab === 'new' ? 'is-active' : ''}`}
                onClick={() => setTab('new')}
              >
                Nouveautés
              </button>
              <button
                className={`tab ${tab === 'upcoming' ? 'is-active' : ''}`}
                onClick={() => setTab('upcoming')}
              >
                À paraître
              </button>
              <button
                className={`tab ${tab === 'bestsellers' ? 'is-active' : ''}`}
                onClick={() => setTab('bestsellers')}
              >
                Bestsellers
              </button>
              {audio.length > 0 && (
                <button
                  className={`tab ${tab === 'audio' ? 'is-active' : ''}`}
                  onClick={() => setTab('audio')}
                >
                  🎧 Livres audio
                </button>
              )}
            </div>
          </div>
          <Link href="/livres" className="link-arrow">
            Voir tout le catalogue
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="book-grid reveal-stagger">
          {getBooks().map((book) => (
            <BookCard key={book.slug} book={book} ctaLabel={ctaByTab[tab]} />
          ))}
          {getBooks().length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--ink-mute)' }}>
              Aucun livre dans cette catégorie pour le moment.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

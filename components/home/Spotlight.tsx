'use client'

import Link from 'next/link'

interface SpotlightProps {
  book: {
    slug: string
    title: string
    titleHtml: string
    coverImage: string
    quote?: string
  }
  author: {
    name: string
    role: string
    photo: string
  }
}

export default function Spotlight({ book, author }: SpotlightProps) {
  return (
    <section className="spotlight">
      <div className="fk-container">
        <div className="spotlight-grid">
          <div className="spotlight-visual reveal">
            <span className="spotlight-tag">Coup de cœur</span>
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
                    'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)'
                }
              }}
            />
          </div>
          <div className="spotlight-content reveal">
            <span className="kicker">Lumière sur</span>
            <h2 dangerouslySetInnerHTML={{ __html: book.titleHtml }} />
            <p className="spotlight-quote">
              {book.quote ||
                "« Un récit d'une rare sensibilité, où chaque page semble porter la mémoire d'un peuple et la lumière d'un espoir. »"}
            </p>
            <div className="spotlight-byline">
              <div className="spotlight-byline-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={author.photo}
                  alt={author.name}
                  onError={(e) => {
                    const t = e.currentTarget
                    t.style.display = 'none'
                    const parent = t.parentElement
                    if (parent) parent.style.background = 'var(--accent)'
                  }}
                />
              </div>
              <div className="spotlight-byline-text">
                <div className="spotlight-byline-name">{author.name}</div>
                <div className="spotlight-byline-role">{author.role}</div>
              </div>
            </div>
            <Link href={`/livres/${book.slug}`} className="btn btn-primary">
              <span>En savoir plus</span>
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
              <span className="shimmer"></span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

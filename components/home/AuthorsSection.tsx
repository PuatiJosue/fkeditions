'use client'

import Link from 'next/link'

export interface AuthorCardData {
  id: string
  name: string
  firstName?: string
  lastName?: string
  role: string
  photo?: string | null
  placeholder?: boolean
}

interface AuthorsSectionProps {
  authors: AuthorCardData[]
}

function AuthorCard({ author }: { author: AuthorCardData }) {
  const first = author.firstName || author.name.split(' ')[0]
  const last = author.lastName || author.name.split(' ').slice(1).join(' ')

  return (
    <Link href={`/auteurs#${author.id}`} className="author-card">
      <div className={`author-portrait ${author.placeholder ? 'author-placeholder' : ''}`}>
        {author.placeholder ? (
          'FK'
        ) : author.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.photo}
            alt={author.name}
            onError={(e) => {
              const t = e.currentTarget
              t.style.display = 'none'
              const parent = t.parentElement
              if (parent) {
                parent.classList.add('author-placeholder')
                parent.textContent = (first[0] || '') + (last[0] || '')
              }
            }}
          />
        ) : (
          (first[0] || '') + (last[0] || '')
        )}
      </div>
      <h3 className="author-name">
        {last ? (
          <>
            <strong>{first}</strong> {last}
          </>
        ) : (
          <strong>{first}</strong>
        )}
      </h3>
      <p className="author-role">{author.role}</p>
    </Link>
  )
}

export default function AuthorsSection({ authors }: AuthorsSectionProps) {
  const displayed: AuthorCardData[] = [...authors]
  while (displayed.length < 3) {
    displayed.push({
      id: `placeholder-${displayed.length}`,
      name: 'En devenir',
      firstName: "L'auteur·rice",
      lastName: 'en devenir',
      role: 'Manuscrits ouverts',
      placeholder: true,
    })
  }

  return (
    <section className="authors-section" id="auteurs">
      <div className="fk-container">
        <div className="section-head reveal">
          <div className="section-head-left">
            <span className="kicker">Voix de la maison</span>
            <h2 className="section-title">
              Nos <em className="serif-i">auteurs</em>
            </h2>
          </div>
          <Link href="/auteurs" className="link-arrow">
            Tous les auteurs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="authors-grid reveal-stagger">
          {displayed.slice(0, 3).map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      </div>
    </section>
  )
}

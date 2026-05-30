'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export interface HeroBook {
  slug: string
  title: string
  titleHtml: string
  author: string
  category: string
  description: string
  price: number
  coverImage: string
}

export default function Hero({ books }: { books: HeroBook[] }) {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const userMovingRef = useRef(false)
  const initializedRef = useRef(false)

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % books.length)
    }, 6000)
  }

  const goTo = (i: number) => {
    if (initializedRef.current) {
      setFading(true)
      setTimeout(() => {
        setIndex(((i % books.length) + books.length) % books.length)
        setFading(false)
      }, 380)
    } else {
      setIndex(((i % books.length) + books.length) % books.length)
      initializedRef.current = true
    }
    resetTimer()
  }

  useEffect(() => {
    resetTimer()
    initializedRef.current = true
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books.length])

  /* Hero F parallax + book parallax on scroll */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const hero = heroRef.current
      if (hero) {
        const offset = Math.min(y, 800)
        hero.style.setProperty('--bg-shift', offset * 0.3 + 'px')
      }
      const heroBook = document.querySelector<HTMLElement>('.hero-book.is-active .hero-book-cover')
      if (heroBook && y < 1200 && !userMovingRef.current) {
        heroBook.style.transform = `translateY(${y * -0.08}px) rotateY(-6deg) rotateX(2deg)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Mouse parallax on book covers */
  useEffect(() => {
    const container = document.querySelector('.hero-books')
    if (!container) return
    const onMove = (e: Event) => {
      const ev = e as MouseEvent
      const rect = (container as HTMLElement).getBoundingClientRect()
      const x = (ev.clientX - rect.left) / rect.width - 0.5
      const y = (ev.clientY - rect.top) / rect.height - 0.5
      const active = container.querySelector<HTMLElement>('.hero-book.is-active .hero-book-cover')
      if (active) {
        userMovingRef.current = true
        active.style.transform = `rotateY(${-6 + x * 6}deg) rotateX(${2 - y * 4}deg) translateY(${y * -8}px)`
        active.style.animation = 'none'
      }
    }
    const onLeave = () => {
      const active = container.querySelector<HTMLElement>('.hero-book.is-active .hero-book-cover')
      if (active) {
        userMovingRef.current = false
        active.style.transform = ''
        active.style.animation = ''
      }
    }
    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const active = books[index]

  return (
    <section className="hero" ref={heroRef}>
      <div className="fk-container">
        <div className="hero-meta">
          <span className="dot"></span>
          <span>{active?.category}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>FK Éditions, Kinshasa — RDC</span>
        </div>

        <div className="hero-grid">
          <div className="hero-text">
            <span className="kicker">À la une</span>
            <h1
              className={`hero-title ${fading ? 'fading' : ''}`}
              dangerouslySetInnerHTML={{ __html: active?.titleHtml || '' }}
            />
            <p className={`hero-desc ${fading ? 'fading' : ''}`}>{active?.description}</p>
            <div className="cta-row">
              <Link href="/livres" className="btn btn-primary">
                <span>Découvrir nos livres</span>
                <svg
                  className="arrow"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
                <span className="shimmer"></span>
              </Link>
              <Link href="/auteurs" className="btn btn-ghost">
                Nos auteurs
              </Link>
            </div>
          </div>

          <div className="hero-books">
            {books.map((b, i) => (
              <div key={b.slug} className={`hero-book ${i === index ? 'is-active' : ''}`}>
                <div className="hero-book-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      const t = e.currentTarget
                      t.style.display = 'none'
                      const parent = t.parentElement
                      if (parent) {
                        parent.style.background =
                          'linear-gradient(135deg, var(--accent), var(--accent-deep))'
                        const fallback = document.createElement('div')
                        fallback.style.cssText =
                          'color:#fff;font-family:var(--serif);font-style:italic;font-size:24px;text-align:center;padding:40px;height:100%;display:flex;align-items:center;justify-content:center;'
                        fallback.textContent = b.title
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                </div>
                <div className="hero-book-badge">{b.price} $</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-progress">
          <div className="hero-progress-dots">
            {books.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === index ? 'is-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="hero-counter">
            <b>{String(index + 1).padStart(2, '0')}</b> / {String(books.length).padStart(2, '0')}
          </div>
          <div className="hero-nav">
            <button className="icon-btn" onClick={() => goTo(index - 1)} aria-label="Précédent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button className="icon-btn" onClick={() => goTo(index + 1)} aria-label="Suivant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

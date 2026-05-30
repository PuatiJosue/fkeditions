'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function GlobalEffects() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    /* ---------- Scroll progress bar ---------- */
    const progressBar = document.querySelector('.scroll-progress') as HTMLElement | null
    function updateProgress() {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0
      if (progressBar) progressBar.style.width = pct + '%'
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    /* ---------- Scroll reveal ---------- */
    const revealEls = Array.from(document.querySelectorAll('.reveal, .reveal-stagger'))
    function checkReveals() {
      const vh = window.innerHeight
      revealEls.forEach((el) => {
        if (el.classList.contains('is-in')) return
        const r = el.getBoundingClientRect()
        if (r.top < vh - 60 && r.bottom > 0) el.classList.add('is-in')
      })
    }
    checkReveals()
    window.addEventListener('scroll', checkReveals, { passive: true })
    window.addEventListener('resize', checkReveals)

    let revealObserver: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-in')
              revealObserver?.unobserve(e.target)
            }
          })
        },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
      )
      revealEls.forEach((el) => revealObserver?.observe(el))
    }
    const revealSafetyTimer = setTimeout(
      () => revealEls.forEach((el) => el.classList.add('is-in')),
      3000
    )

    /* ---------- Word-by-word reveal ---------- */
    function splitWords(el: Element) {
      const htmlEl = el as HTMLElement
      if (htmlEl.dataset.split) return
      htmlEl.dataset.split = '1'
      function process(node: Node) {
        const children = Array.from(node.childNodes)
        children.forEach((c) => {
          if (c.nodeType === Node.TEXT_NODE) {
            const text = c.textContent || ''
            if (!text.trim()) return
            const frag = document.createDocumentFragment()
            const words = text.split(/(\s+)/)
            words.forEach((w) => {
              if (!w.trim()) {
                frag.appendChild(document.createTextNode(w))
              } else {
                const wrap = document.createElement('span')
                wrap.className = 'word'
                const inner = document.createElement('span')
                inner.textContent = w
                wrap.appendChild(inner)
                frag.appendChild(wrap)
              }
            })
            c.parentNode?.replaceChild(frag, c)
          } else if (c.nodeType === Node.ELEMENT_NODE) {
            const elNode = c as HTMLElement
            if (elNode.classList?.contains('word')) return
            process(c)
          }
        })
      }
      process(el)
      el.classList.add('word-reveal')
      Array.from(el.querySelectorAll('.word > span')).forEach((s, i) => {
        ;(s as HTMLElement).style.setProperty('--i', String(i))
      })
    }
    document
      .querySelectorAll('.section-title, .heritage-text h2, .spotlight-content h2, .newsletter-section h2')
      .forEach(splitWords)

    const wordObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            const wordCount = e.target.querySelectorAll('.word').length
            const delay = 1100 + wordCount * 60 + 200
            setTimeout(() => e.target.classList.add('settled'), delay)
            wordObserver.unobserve(e.target)
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.word-reveal').forEach((el) => wordObserver.observe(el))

    const heroWordTimer = setTimeout(() => {
      document.querySelectorAll('.hero .word-reveal').forEach((el) => el.classList.add('is-in'))
    }, 1300)

    /* ---------- Counter ---------- */
    const counters = document.querySelectorAll<HTMLElement>('.counter')
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          const target = parseInt(el.dataset.target || el.textContent || '0', 10)
          if (isNaN(target)) return
          counterObserver.unobserve(el)
          const dur = 1800
          const start = performance.now()
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / dur)
            const eased = 1 - Math.pow(1 - t, 3)
            el.textContent = String(Math.floor(target * eased))
            if (t < 1) requestAnimationFrame(step)
            else el.textContent = String(target)
          }
          requestAnimationFrame(step)
        })
      },
      { threshold: 0.4 }
    )
    counters.forEach((c) => counterObserver.observe(c))

    /* ---------- Cleanup ---------- */
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('scroll', checkReveals)
      window.removeEventListener('resize', checkReveals)
      revealObserver?.disconnect()
      wordObserver.disconnect()
      counterObserver.disconnect()
      clearTimeout(revealSafetyTimer)
      clearTimeout(heroWordTimer)
    }
  }, [pathname])

  // Page-load curtain — only on homepage
  useEffect(() => {
    if (!isHome) return
    const sessionKey = 'fk-curtain-shown'
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, '1')

    const curtain = document.createElement('div')
    curtain.className = 'curtain'
    curtain.innerHTML = `
      <div class="curtain-panel left"></div>
      <div class="curtain-panel right"></div>
      <div class="curtain-logo">
        <span>F</span><span class="k">k</span>
        <span class="tagline">Éditions · Kinshasa</span>
      </div>
    `
    document.body.appendChild(curtain)
    const logo = curtain.querySelector('.curtain-logo')
    const t1 = setTimeout(() => logo?.classList.add('visible'), 100)
    const t2 = setTimeout(() => {
      curtain.classList.add('lifted')
      setTimeout(() => curtain.remove(), 2200)
    }, 1100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      curtain.remove()
    }
  }, [isHome])

  return <div className="scroll-progress" />
}

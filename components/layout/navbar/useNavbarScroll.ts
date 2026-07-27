'use client'

import { useEffect, useState } from 'react'

/** Le style « scrolled » (fond plus opaque + bordure) s'active au-delà de ce point. */
const SCROLLED_AT = 40

/**
 * Suit le défilement pour styliser l'en-tête :
 * - `scrolled` : au-delà de 40px (fond plus opaque, bordure du bas).
 *
 * Le header reste **toujours visible** (pas d'auto-masquage au scroll). On
 * n'anime donc plus aucun `transform` : c'est cette animation, relancée/inversée
 * au changement de direction, qui faisait trembler le header sur `position:
 * sticky` (artefact compositeur GPU). Sans elle → header stable, zéro tremblement.
 *
 * `hidden` est conservé (toujours `false`) pour ne pas casser le composant Navbar.
 */
export function useNavbarScroll() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let ticking = false
    const update = () => {
      ticking = false
      setScrolled(window.scrollY > SCROLLED_AT)
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { scrolled, hidden: false }
}

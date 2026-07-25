'use client'

import { useEffect, useState } from 'react'

/** Au-delà de ce seuil (px) de mouvement, on considère un vrai changement de
 *  direction. En dessous, on ignore : c'est la zone morte anti-flickering qui
 *  neutralise les micro-oscillations sous-pixel du scroll inertiel. */
const SCROLL_DELTA = 8
/** Le header reste toujours visible tant qu'on est dans cette zone haute. */
const SHOW_ZONE = 200
/** Le style « scrolled » (fond opaque + bordure) s'active au-delà de ce point. */
const SCROLLED_AT = 40

/**
 * Suit le défilement pour styliser l'en-tête :
 * - `scrolled` : au-delà de 40px (fond plus opaque, bordure).
 * - `hidden`   : masque la barre quand on descend, la ré-affiche quand on monte.
 *
 * Une hystérésis de {@link SCROLL_DELTA}px empêche l'état `hidden` de basculer
 * sur les micro-variations de `scrollY` (trackpad, momentum), ce qui évite le
 * clignotement du header dû aux transitions `transform` sans cesse relancées.
 */
export function useNavbarScroll() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const update = () => {
      ticking = false
      const y = Math.max(0, window.scrollY)

      setScrolled(y > SCROLLED_AT)

      if (y <= SHOW_ZONE) {
        // Toujours visible en haut de page.
        setHidden(false)
        lastY = y
        return
      }

      const diff = y - lastY
      if (Math.abs(diff) > SCROLL_DELTA) {
        // Mouvement significatif : on cache en descendant, on montre en montant.
        setHidden(diff > 0)
        lastY = y
      }
      // Sous le seuil : on ne touche à rien (zone morte) → pas de clignotement.
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { scrolled, hidden }
}

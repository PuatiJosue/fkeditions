'use client'

import { useEffect, useState } from 'react'

/**
 * Suit le défilement pour styliser l'en-tête : `scrolled` au-delà de 40px,
 * `hidden` lorsqu'on descend au-delà de 200px (masquage auto de la barre).
 */
export function useNavbarScroll() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = 0
    let rafId: number | null = null
    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY
        const newScrolled = y > 40
        const newHidden = y > 200 && y > lastY
        setScrolled((prev) => (prev !== newScrolled ? newScrolled : prev))
        setHidden((prev) => (prev !== newHidden ? newHidden : prev))
        lastY = y
        rafId = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return { scrolled, hidden }
}

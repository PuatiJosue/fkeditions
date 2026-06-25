import type { Book } from '@prisma/client'

/** Slug stable à partir d'un nom de vedette (joueur / club). */
export function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export interface MagazineGroup {
  /** Clé d'URL : slug de la vedette (ou slug du magazine si pas de vedette). */
  key: string
  /** Nom affiché (vedette ou titre). */
  name: string
  /** Photo affichée dans la galerie. */
  photo: string | null
  /** Rencontre / événement (optionnel). */
  event: string | null
  /** Au moins une édition en pré-commande. */
  preOrder: boolean
  /** Éditions du même joueur, triées Premium puis Gold. */
  editions: Book[]
}

const TIER_ORDER: Record<string, number> = { PREMIUM: 0, GOLD: 1 }

/** Clé de regroupement d'un magazine : sa vedette, sinon son propre slug. */
function groupKey(book: Book): string {
  return book.featuredName ? slugifyName(book.featuredName) : book.slug
}

/**
 * Regroupe une liste de magazines par vedette (joueur / club).
 * Chaque groupe rassemble les éditions Premium / Gold du même basketteur.
 */
export function groupMagazines(magazines: Book[]): MagazineGroup[] {
  const map = new Map<string, MagazineGroup>()

  for (const mag of magazines) {
    const key = groupKey(mag)
    const existing = map.get(key)
    if (existing) {
      existing.editions.push(mag)
      if (mag.preOrder) existing.preOrder = true
      if (!existing.event && mag.featuredEvent) existing.event = mag.featuredEvent
      if (!existing.photo) existing.photo = mag.featuredImage || mag.coverImage
    } else {
      map.set(key, {
        key,
        name: mag.featuredName || mag.title,
        photo: mag.featuredImage || mag.coverImage,
        event: mag.featuredEvent ?? null,
        preOrder: mag.preOrder,
        editions: [mag],
      })
    }
  }

  for (const group of map.values()) {
    group.editions.sort((a, b) => {
      const ta = TIER_ORDER[a.tier ?? ''] ?? 2
      const tb = TIER_ORDER[b.tier ?? ''] ?? 2
      if (ta !== tb) return ta - tb
      return a.price - b.price
    })
  }

  return [...map.values()]
}

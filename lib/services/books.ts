import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/** Livre accompagné de son auteur (forme utilisée par les pages livre). */
export type BookWithAuthor = Prisma.BookGetPayload<{ include: { author: true } }>

/** Livre par slug, sans filtre de publication (utilisé pour les métadonnées). */
export function getBookBySlug(slug: string) {
  return prisma.book.findUnique({ where: { slug }, include: { author: true } })
}

/** Livre publié par slug, ou null. */
export function getPublishedBook(slug: string) {
  return prisma.book.findUnique({ where: { slug, published: true }, include: { author: true } })
}

/** Jusqu'à 3 autres livres publiés (hors magazines) à suggérer. */
export function getRelatedBooks(slug: string) {
  return prisma.book.findMany({
    where: { published: true, slug: { not: slug }, isMagazine: false },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  })
}

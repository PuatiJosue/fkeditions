import { prisma } from '@/lib/prisma'
import { authors as staticAuthors } from '@/data/authors'
import { books as staticBooks } from '@/data/books'

export interface AuthorDetail {
  id: string
  slug: string
  name: string
  role: string
  bio: string | null
  photo: string | null
  facebook?: string | null
  instagram?: string | null
  books: { slug: string; title: string }[]
}

/**
 * Liste des auteurs avec leurs livres publiés.
 * Repli sur les données statiques si la base est injoignable.
 */
export async function getAuthorsDetail(): Promise<AuthorDetail[]> {
  try {
    const dbAuthors = await prisma.author.findMany({
      orderBy: { createdAt: 'asc' },
      include: { books: { where: { published: true }, select: { slug: true, title: true } } },
    })
    return dbAuthors.map((a) => ({
      id: a.id, slug: a.slug, name: a.name, role: a.role, bio: a.bio, photo: a.photo,
      facebook: a.facebook, instagram: a.instagram, books: a.books,
    }))
  } catch (err) {
    console.warn('[getAuthorsDetail] DB unreachable, falling back to static data.', err)
    return staticAuthors.map((a) => ({
      id: a.id, slug: a.id, name: a.name, role: a.role, bio: a.bio, photo: a.photo,
      facebook: a.social?.facebook ?? null,
      instagram: a.social?.instagram ?? null,
      books: a.books
        .map((bId) => staticBooks.find((b) => b.id === bId))
        .filter((b): b is NonNullable<typeof b> => Boolean(b))
        .map((b) => ({ slug: b.id, title: b.title })),
    }))
  }
}

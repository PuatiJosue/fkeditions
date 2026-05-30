import { prisma } from '@/lib/prisma'
import { books as staticBooks } from '@/data/books'
import LivresClient, { LivreItem } from './LivresClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Catalogue — FK Éditions' }

async function fetchBooks(): Promise<LivreItem[]> {
  try {
    const books = await prisma.book.findMany({
      where: { published: true, isMagazine: false },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    })
    return books.map((b) => ({
      slug: b.slug,
      title: b.title,
      price: b.price,
      priceAudio: b.priceAudio,
      hasAudio: Boolean(b.audioFile && b.priceAudio),
      coverImage: b.coverImage || '/images/books/placeholder.jpg',
      category: b.category,
      author: b.author?.name ?? b.coAuthors ?? null,
      preOrder: b.preOrder,
      releaseDate: b.releaseDate?.toISOString() ?? null,
      year: b.year ?? null,
    }))
  } catch (err) {
    console.warn('[LivresPage] DB unreachable, falling back to static data.', err)
    return staticBooks.map((b) => ({
      slug: b.id,
      title: b.title,
      price: b.price,
      priceAudio: null,
      hasAudio: false,
      coverImage: b.coverImage,
      category: b.category,
      author: b.author,
      preOrder: b.preOrder ?? false,
      releaseDate: b.releaseDate ?? null,
      year: b.year ?? null,
    }))
  }
}

export default async function LivresPage() {
  const books = await fetchBooks()
  return <LivresClient books={books} />
}

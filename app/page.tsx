import { prisma } from '@/lib/prisma'
import { books as staticBooks } from '@/data/books'
import { authors as staticAuthors } from '@/data/authors'
import { events as staticEvents } from '@/data/events'
import Hero, { HeroBook } from '@/components/home/Hero'
import Marquee from '@/components/home/Marquee'
import BooksSection, { BookCardData } from '@/components/home/BooksSection'
import Spotlight from '@/components/home/Spotlight'
import Heritage from '@/components/home/Heritage'
import AuthorsSection, { AuthorCardData } from '@/components/home/AuthorsSection'
import EventsSection, { EventCardData } from '@/components/home/EventsSection'
import DiscoverMarquees from '@/components/home/DiscoverMarquees'
import Newsletter from '@/components/home/Newsletter'

export const dynamic = 'force-dynamic'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function italicizeLastWord(title: string): string {
  const safe = escapeHtml(title.trim())
  const parts = safe.split(' ')
  if (parts.length <= 1) return `<em>${safe}</em>`
  const last = parts.pop()!
  return `${parts.join(' ')} <em>${last}</em>`
}

const defaultCover = '/images/books/placeholder.jpg'
const defaultAuthorPhoto = '/images/authors/placeholder.jpg'

interface HomeData {
  books: Array<{
    slug: string
    title: string
    description: string
    price: number
    priceAudio: number | null
    audioFile: string | null
    coverImage: string
    category: string
    preOrder: boolean
    releaseDate: string | null
    year: number | null
    author: { name: string; role: string; photo: string | null } | null
    coAuthors: string | null
  }>
  authors: Array<{ slug: string; name: string; role: string; photo: string | null }>
  events: Array<{ id: string; title: string; date: Date; location: string; description: string }>
}

async function fetchData(): Promise<HomeData> {
  try {
    const [dbBooks, dbAuthors, dbEvents] = await Promise.all([
      prisma.book.findMany({
        where: { published: true, isMagazine: false },
        orderBy: { createdAt: 'desc' },
        include: { author: true },
        take: 12,
      }),
      prisma.author.findMany({ take: 3, orderBy: { createdAt: 'asc' } }),
      prisma.event.findMany({
        where: { published: true, date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 3,
      }),
    ])

    return {
      books: dbBooks.map((b) => ({
        slug: b.slug,
        title: b.title,
        description: b.description,
        price: b.price,
        priceAudio: b.priceAudio,
        audioFile: b.audioFile,
        coverImage: b.coverImage || defaultCover,
        category: b.category,
        preOrder: b.preOrder,
        releaseDate: b.releaseDate ? b.releaseDate.toISOString() : null,
        year: b.year ?? null,
        author: b.author
          ? { name: b.author.name, role: b.author.role, photo: b.author.photo }
          : null,
        coAuthors: b.coAuthors,
      })),
      authors: dbAuthors.map((a) => ({
        slug: a.slug,
        name: a.name,
        role: a.role,
        photo: a.photo,
      })),
      events: dbEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location || '',
        description: e.description || '',
      })),
    }
  } catch (err) {
    // Fallback to static data when DB is unreachable
    console.warn('[HomePage] Database unreachable, falling back to static data.', err)
    return {
      books: staticBooks.map((b) => ({
        slug: b.id,
        title: b.title,
        description: b.description,
        price: b.price,
        priceAudio: null,
        audioFile: null,
        coverImage: b.coverImage,
        category: b.category,
        preOrder: b.preOrder ?? false,
        releaseDate: b.releaseDate ?? null,
        year: b.year ?? null,
        author: null,
        coAuthors: b.author,
      })),
      authors: staticAuthors.map((a) => ({
        slug: a.id,
        name: a.name,
        role: a.role,
        photo: a.photo,
      })),
      events: staticEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: new Date(),
        location: `${e.location} · ${e.city}`,
        description: e.description,
      })),
    }
  }
}

export default async function HomePage() {
  const { books, authors, events } = await fetchData()

  const allCards: BookCardData[] = books.map((b) => ({
    slug: b.slug,
    title: b.title,
    author: b.author?.name ?? b.coAuthors ?? null,
    price: b.price,
    priceAudio: b.priceAudio,
    coverImage: b.coverImage,
    category: b.category,
    preOrder: b.preOrder,
    releaseDate: b.releaseDate,
    year: b.year,
    hasAudio: Boolean(b.audioFile && b.priceAudio),
  }))

  const newReleases = allCards.filter((b) => !b.preOrder).slice(0, 3)
  const upcoming = allCards.filter((b) => b.preOrder).slice(0, 3)
  const bestsellers = allCards.slice(0, 3)
  const audio = allCards.filter((b) => b.hasAudio).slice(0, 6)

  const heroBooks: HeroBook[] = books.slice(0, 3).map((b) => ({
    slug: b.slug,
    title: b.title,
    titleHtml: italicizeLastWord(b.title),
    author: b.author?.name ?? b.coAuthors ?? 'FK Éditions',
    category: `${b.category} · ${b.preOrder ? 'Pré-commande' : 'Nouveauté'}`,
    description:
      b.description?.slice(0, 200).trim() || 'Découvrez ce livre dans notre catalogue.',
    price: b.price,
    coverImage: b.coverImage,
  }))

  const spotlightBook = books.find((b) => !b.preOrder) || books[0]

  const authorCards: AuthorCardData[] = authors.map((a) => {
    const parts = a.name.trim().split(/\s+/)
    return {
      id: a.slug,
      name: a.name,
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
      role: a.role,
      photo: a.photo,
    }
  })

  const eventCards: EventCardData[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    location: e.location,
    city: '',
    description: e.description,
  }))

  return (
    <>
      {heroBooks.length > 0 && <Hero books={heroBooks} />}
      <Marquee />
      <BooksSection
        newReleases={newReleases}
        upcoming={upcoming}
        bestsellers={bestsellers}
        audio={audio}
      />
      {spotlightBook && (
        <Spotlight
          book={{
            slug: spotlightBook.slug,
            title: spotlightBook.title,
            titleHtml: italicizeLastWord(spotlightBook.title),
            coverImage: spotlightBook.coverImage,
          }}
          author={{
            name: spotlightBook.author?.name || 'Fortune Khonde',
            role: spotlightBook.author?.role || 'Auteur · Fondateur FK Éditions',
            photo: spotlightBook.author?.photo || defaultAuthorPhoto,
          }}
        />
      )}
      <Heritage />
      <AuthorsSection authors={authorCards} />
      <EventsSection events={eventCards} />
      <DiscoverMarquees />
      <Newsletter />
    </>
  )
}

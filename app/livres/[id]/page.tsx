import { notFound } from 'next/navigation'
import { getBookBySlug, getPublishedBook, getRelatedBooks } from '@/lib/services/books'
import BookCover from './BookCover'
import Breadcrumb from './_components/Breadcrumb'
import BookInfo from './_components/BookInfo'
import BookExcerpt from './_components/BookExcerpt'
import RelatedBooks from './_components/RelatedBooks'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string; cancelled?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  try {
    const book = await getBookBySlug(id)
    if (!book) return {}

    const image = book.coverImage
      ? { url: book.coverImage, width: 400, height: 600, alt: book.title }
      : { url: '/og-image.jpg', width: 1200, height: 630, alt: book.title }

    return {
      title: book.title,
      description: book.description,
      openGraph: {
        type: 'book',
        title: book.title,
        description: book.description,
        url: `/livres/${book.slug}`,
        images: [image],
        authors: book.author?.name ? [book.author.name] : ['FK Éditions'],
      },
      twitter: {
        card: 'summary_large_image',
        title: book.title,
        description: book.description,
        images: [image.url],
      },
    }
  } catch {
    return { title: id }
  }
}

export default async function BookPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams

  const book = await getPublishedBook(id)
  if (!book) notFound()

  const related = await getRelatedBooks(id)

  const content = Array.isArray(book.content) ? (book.content as string[]) : null
  const releaseDate = book.releaseDate?.toISOString() ?? undefined
  const releaseLong = releaseDate
    ? new Date(releaseDate).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <>
      <Breadcrumb title={book.title} />

      <section className="fk-section" style={{ paddingTop: 'clamp(48px, 6vh, 80px)', paddingBottom: 'clamp(60px, 8vh, 100px)' }}>
        <div className="fk-container">
          <div className="book-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 1.4fr', gap: 'clamp(40px, 6vw, 96px)', alignItems: 'start' }}>
            <BookCover src={book.coverImage} title={book.title} preOrder={book.preOrder} price={book.price} />
            <BookInfo book={book} releaseDate={releaseDate} releaseLong={releaseLong} successParam={sp.success} cancelledParam={sp.cancelled} />
          </div>
        </div>
      </section>

      {content && content.length > 0 && <BookExcerpt content={content} book={book} releaseDate={releaseDate} />}

      {related.length > 0 && <RelatedBooks books={related} />}
    </>
  )
}

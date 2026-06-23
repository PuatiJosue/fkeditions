import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BookForm from '../../livres/BookForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditMagazinePage({ params }: Props) {
  const { id } = await params
  const [book, authors] = await Promise.all([
    prisma.book.findUnique({ where: { id } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!book) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-cream">Modifier le magazine</h1>
        <p className="text-xs text-cream-muted mt-1 truncate max-w-md">{book.title}</p>
      </div>
      <BookForm
        authors={authors.map((a) => ({ id: a.id, name: a.name }))}
        initial={{
          id: book.id,
          slug: book.slug,
          title: book.title,
          description: book.description,
          content: Array.isArray(book.content) ? (book.content as string[]).join('\n\n') : '',
          price: String(book.price),
          pricePhysical: book.pricePhysical != null ? String(book.pricePhysical) : '',
          category: book.category,
          type: book.type,
          stock: book.stock != null ? String(book.stock) : '',
          year: book.year != null ? String(book.year) : '',
          pages: book.pages != null ? String(book.pages) : '',
          coverImage: book.coverImage ?? '',
          pdfFile: book.pdfFile ?? '',
          epubFile: book.epubFile ?? '',
          published: book.published,
          preOrder: book.preOrder,
          isMagazine: book.isMagazine,
          featuredName: book.featuredName ?? '',
          featuredImage: book.featuredImage ?? '',
          featuredEvent: book.featuredEvent ?? '',
          releaseDate: book.releaseDate ? book.releaseDate.toISOString().split('T')[0] : '',
          authorId: book.authorId ?? '',
          coAuthors: book.coAuthors ?? '',
        }}
      />
    </div>
  )
}

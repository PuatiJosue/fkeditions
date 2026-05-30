import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import AuthorActions from './AuthorActions'

export default async function AdminAuteursPage() {
  const authors = await prisma.author.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { books: true } } },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cream">Auteurs</h1>
          <p className="text-xs text-cream-muted mt-1">{authors.length} auteur{authors.length > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/auteurs/nouveau"
          className="bg-gold hover:bg-gold-light text-dark text-xs font-semibold px-4 py-2.5 uppercase tracking-widest transition-colors"
        >
          + Ajouter un auteur
        </Link>
      </div>

      <div className="grid gap-4">
        {authors.map((author) => (
          <div key={author.id} className="bg-dark-3 border border-dark-4 p-5 flex items-center gap-5">
            <div className="w-12 h-12 bg-dark-4 shrink-0 overflow-hidden relative">
              {author.photo ? (
                <Image
                  src={author.photo}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold text-lg font-serif">
                  {author.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-cream font-medium">{author.name}</p>
              <p className="text-xs text-cream-muted mt-0.5">{author.role}</p>
              <p className="text-xs text-gold mt-1">{author._count.books} livre{author._count.books > 1 ? 's' : ''}</p>
            </div>
            <AuthorActions authorId={author.id} />
          </div>
        ))}
        {authors.length === 0 && (
          <div className="bg-dark-3 border border-dark-4 p-10 text-center text-cream-muted text-sm">
            Aucun auteur.{' '}
            <Link href="/admin/auteurs/nouveau" className="text-gold underline">
              Ajouter le premier
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

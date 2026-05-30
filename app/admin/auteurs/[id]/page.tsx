import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AuthorForm from '../AuthorForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditAuteurPage({ params }: Props) {
  const { id } = await params
  const author = await prisma.author.findUnique({ where: { id } })
  if (!author) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-cream">Modifier l&apos;auteur</h1>
        <p className="text-xs text-cream-muted mt-1">{author.name}</p>
      </div>
      <AuthorForm
        initial={{
          id: author.id,
          slug: author.slug,
          name: author.name,
          role: author.role,
          bio: author.bio ?? '',
          photo: author.photo ?? '',
          facebook: author.facebook ?? '',
          instagram: author.instagram ?? '',
        }}
      />
    </div>
  )
}

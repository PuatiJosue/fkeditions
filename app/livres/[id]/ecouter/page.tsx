import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AudioPlayer from './AudioPlayer'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ListenPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/login?callbackUrl=/livres/${id}/ecouter`)
  }

  const book = await prisma.book.findUnique({
    where: { slug: id },
    include: { author: true },
  })

  if (!book || !book.audioFile) notFound()

  // Check access: admin OR completed purchase of audio version
  const isAdmin = session.user.role === 'ADMIN'
  let hasAccess = isAdmin

  if (!hasAccess) {
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        bookSlug: book.slug,
        status: 'COMPLETED',
      },
    })
    hasAccess = Boolean(purchase)
  }

  if (!hasAccess) {
    redirect(`/livres/${book.slug}?audio_required=1`)
  }

  return (
    <AudioPlayer
      bookSlug={book.slug}
      title={book.title}
      author={book.author?.name ?? book.coAuthors ?? 'FK Éditions'}
      coverImage={book.coverImage ?? null}
      audioUrl={`/api/download/audio/${book.slug}`}
      duration={book.audioDuration ?? 0}
    />
  )
}

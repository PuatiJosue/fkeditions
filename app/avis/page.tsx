import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AvisClient from './AvisClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: "Livre d'or — FK Éditions" }

interface CommentItem {
  id: string
  content: string
  createdAt: string
  user: { name: string | null; avatar: string | null }
}

async function fetchComments(): Promise<CommentItem[]> {
  try {
    const dbComments = await prisma.comment.findMany({
      where: {
        approved: true,
        user: { blocked: false, deletedAt: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { name: true, avatar: true } } },
    })
    return dbComments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: { name: c.user.name, avatar: c.user.avatar },
    }))
  } catch {
    return []
  }
}

export default async function AvisPage() {
  const [comments, session] = await Promise.all([fetchComments(), getServerSession(authOptions)])
  const isLogged = Boolean(session?.user)
  const userName = session?.user?.name ?? null

  return <AvisClient comments={comments} isLogged={isLogged} userName={userName} />
}

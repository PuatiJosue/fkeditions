import { prisma } from '@/lib/prisma'
import AvisModerationClient from './AvisModerationClient'

export const dynamic = 'force-dynamic'

export default async function AdminAvisPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true, avatar: true } } },
  })

  const initial = comments.map((c) => ({
    id: c.id,
    content: c.content,
    approved: c.approved,
    createdAt: c.createdAt.toISOString(),
    user: { id: c.userId, name: c.user.name, email: c.user.email, avatar: c.user.avatar },
  }))

  return <AvisModerationClient initial={initial} />
}

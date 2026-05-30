import { prisma } from '@/lib/prisma'
import UsersClient, { UserRow } from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function UtilisateursPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { purchases: true, comments: true } } },
  })

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    purchaseCount: u._count.purchases,
    commentCount: u._count.comments,
    blocked: u.blocked,
    blockedReason: u.blockedReason,
    blockedAt: u.blockedAt?.toISOString() ?? null,
    deletedAt: u.deletedAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }))

  return <UsersClient initial={rows} />
}

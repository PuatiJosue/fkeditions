import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/auditLog'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

// POST — soft delete (suspend account)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params
  if (session.user.id === id) {
    return NextResponse.json({ error: 'Impossible de se suspendre soi-même' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  if (target.role === 'ADMIN') {
    return NextResponse.json({ error: 'Impossible de suspendre un admin' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      currentSessionId: null,
      currentSessionAt: null,
    },
    select: { id: true, email: true, deletedAt: true },
  })

  await logAdminAction(session.user.id, session.user.email!, 'SUSPEND_USER', user.email)
  return NextResponse.json(user)
}

// DELETE — restore suspended account
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const user = await prisma.user.update({
    where: { id },
    data: { deletedAt: null },
    select: { id: true, email: true, deletedAt: true },
  })

  await logAdminAction(session.user.id, session.user.email!, 'RESTORE_USER', user.email)
  return NextResponse.json(user)
}

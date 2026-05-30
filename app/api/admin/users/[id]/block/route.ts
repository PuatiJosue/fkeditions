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

// POST — block user
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params
  if (session.user.id === id) {
    return NextResponse.json({ error: 'Impossible de se bloquer soi-même' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  if (target.role === 'ADMIN') {
    return NextResponse.json({ error: 'Impossible de bloquer un admin' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const reason = String(body.reason || '').trim().slice(0, 500) || null

  const user = await prisma.user.update({
    where: { id },
    data: {
      blocked: true,
      blockedAt: new Date(),
      blockedReason: reason,
      currentSessionId: null,
      currentSessionAt: null,
    },
    select: { id: true, email: true, blocked: true, blockedReason: true, blockedAt: true },
  })

  await logAdminAction(
    session.user.id,
    session.user.email!,
    'BLOCK_USER',
    user.email,
    reason ?? '(sans raison)'
  )

  return NextResponse.json(user)
}

// DELETE — unblock user
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const user = await prisma.user.update({
    where: { id },
    data: { blocked: false, blockedAt: null, blockedReason: null },
    select: { id: true, email: true, blocked: true },
  })

  await logAdminAction(session.user.id, session.user.email!, 'UNBLOCK_USER', user.email)
  return NextResponse.json(user)
}

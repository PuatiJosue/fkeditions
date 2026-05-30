import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/auditLog'

const PLAN_MONTHS: Record<string, number> = {
  mensuel: 1, trimestriel: 3, semestriel: 6, annuel: 12,
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params
  const { action } = await req.json()

  const sub = await prisma.subscription.findUnique({ where: { id } })
  if (!sub) return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 })

  if (action === 'validate') {
    const months = PLAN_MONTHS[sub.plan] ?? 1
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)

    await prisma.subscription.update({
      where: { id },
      data: { status: 'COMPLETED', startDate, endDate },
    })
    await logAdminAction(session.user.id, session.user.email!, 'VALIDATE_SUBSCRIPTION', id, sub.plan)
    return NextResponse.json({ success: true })
  }

  if (action === 'reject') {
    await prisma.subscription.update({
      where: { id },
      data: { status: 'FAILED' },
    })
    await logAdminAction(session.user.id, session.user.email!, 'REJECT_SUBSCRIPTION', id, sub.plan)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}

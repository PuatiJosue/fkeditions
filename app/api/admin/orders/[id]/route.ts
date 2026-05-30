import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/auditLog'
import { sendPurchaseConfirmation } from '@/lib/email'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { id } = await params
  const { action, adminNote } = await req.json()

  if (!['validate', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  // Vérifie que la commande existe (protection IDOR)
  const existing = await prisma.purchase.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  if (action === 'validate') {
    await prisma.purchase.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        validatedAt: new Date(),
        adminNote: adminNote ?? 'Validé par admin',
      },
    })
    await logAdminAction(session.user.id, session.user.email!, 'VALIDATE_ORDER', id, existing.bookTitle)

    // Envoie email de confirmation au client
    const user = await prisma.user.findUnique({ where: { id: existing.userId }, select: { email: true } })
    if (user?.email) {
      sendPurchaseConfirmation(user.email, existing.bookTitle, existing.amount).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'Accès activé' })
  }

  await prisma.purchase.update({
    where: { id },
    data: { status: 'FAILED', adminNote: adminNote ?? 'Rejeté par admin' },
  })
  await logAdminAction(session.user.id, session.user.email!, 'REJECT_ORDER', id, existing.bookTitle)
  return NextResponse.json({ success: true, message: 'Commande rejetée' })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/auditLog'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params
  const { role } = await req.json()

  if (session.user.id === id) {
    return NextResponse.json({ error: 'Impossible de modifier son propre rôle' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, role: true },
  })
  await logAdminAction(session.user.id, session.user.email!, 'CHANGE_ROLE', user.email, role)
  return NextResponse.json(user)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await params

  if (session.user.id === id) {
    return NextResponse.json({ error: 'Impossible de supprimer son propre compte' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  if (user.role === 'ADMIN') return NextResponse.json({ error: 'Impossible de supprimer un admin' }, { status: 400 })

  await prisma.user.delete({ where: { id } })
  await logAdminAction(session.user.id, session.user.email!, 'DELETE_USER', user.email)
  return NextResponse.json({ success: true })
}

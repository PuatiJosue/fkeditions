import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, name: true } } },
  })

  return NextResponse.json({ subscriptions: subs })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const orders = await prisma.purchase.findMany({
    where: status ? { status: status as any } : {},
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ orders })
}

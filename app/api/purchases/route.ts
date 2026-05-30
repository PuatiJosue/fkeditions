import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ purchased: false })
  }

  const { searchParams } = new URL(req.url)
  const bookSlug = searchParams.get('bookSlug')

  if (bookSlug) {
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        bookSlug,
        status: 'COMPLETED',
      },
    })
    return NextResponse.json({ purchased: !!purchase })
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id, status: 'COMPLETED' },
    select: { bookSlug: true, bookTitle: true, createdAt: true },
  })
  return NextResponse.json({ purchases })
}

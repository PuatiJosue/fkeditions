import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/signedToken'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  const { id } = await params
  const isAdmin = session.user.role === 'ADMIN'

  if (!isAdmin) {
    const now = new Date()
    const sub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: 'COMPLETED', endDate: { gt: now } },
    })
    if (!sub) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const issue = await prisma.revueIssue.findUnique({
    where: { id },
    select: { epubFile: true, pdfFile: true },
  })

  const token = createToken(session.user.id, `revue:${id}`)
  return NextResponse.json({
    token,
    hasEpub: !!issue?.epubFile,
    hasPdf: !!issue?.pdfFile,
  })
}

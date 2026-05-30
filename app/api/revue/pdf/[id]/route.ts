import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'
import { verifyToken } from '@/lib/signedToken'
import { getObjectFromS3, privateKey } from '@/lib/s3'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { id } = await params
  const isAdmin = session.user.role === 'ADMIN'

  if (!isAdmin) {
    const token = new URL(req.url).searchParams.get('token')
    if (!token || !verifyToken(token, session.user.id, `revue:${id}`)) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 403 })
    }
  }

  if (!isAdmin) {
    const now = new Date()
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        endDate: { gt: now },
      },
    })
    if (!subscription) {
      return NextResponse.json({ error: 'Abonnement actif requis' }, { status: 403 })
    }
  }

  const issue = await prisma.revueIssue.findUnique({
    where: { id, published: true },
  })

  if (!issue?.pdfFile) {
    return NextResponse.json({ error: 'Numéro introuvable' }, { status: 404 })
  }

  const safeName = path.basename(issue.pdfFile)

  const s3 = await getObjectFromS3(privateKey('revues', safeName))
  if (s3) {
    return new Response(s3.buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Content-Length': s3.contentLength.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    })
  }

  const filePath = path.join(process.cwd(), 'private', 'revues', safeName)
  try {
    const file = await readFile(filePath)
    return new Response(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Content-Length': file.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  }
}

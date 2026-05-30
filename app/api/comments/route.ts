import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

// GET — public list of approved comments (hides blocked/deleted users)
export async function GET() {
  const comments = await prisma.comment.findMany({
    where: {
      approved: true,
      user: { blocked: false, deletedAt: null },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { name: true, avatar: true } },
    },
  })
  return NextResponse.json({ comments })
}

// POST — logged-in users submit a comment (unapproved by default)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  if (!rateLimit(getClientIp(req), 'comments', { limit: 3, window: 3600 })) {
    return NextResponse.json(
      { error: 'Trop de commentaires. Réessayez dans 1 heure.' },
      { status: 429 }
    )
  }

  // Refuse si l'utilisateur est bloqué ou supprimé
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blocked: true, deletedAt: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 })
  }
  if (user.blocked || user.deletedAt) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas publier de commentaires pour le moment.' },
      { status: 403 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const content = String(body.content || '').trim()

  if (!content || content.length < 10) {
    return NextResponse.json(
      { error: 'Le commentaire doit faire au moins 10 caractères' },
      { status: 400 }
    )
  }
  if (content.length > 1500) {
    return NextResponse.json(
      { error: 'Commentaire trop long (max 1500 caractères)' },
      { status: 400 }
    )
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      content,
      approved: false,
    },
  })

  return NextResponse.json({
    success: true,
    message:
      'Merci pour votre message ! Il apparaîtra une fois validé par notre équipe.',
    comment: { id: comment.id, createdAt: comment.createdAt },
  })
}

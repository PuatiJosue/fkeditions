import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ hasAccess: false, subscription: null, issues: [] })
  }

  const isAdmin = session.user.role === 'ADMIN'
  const now = new Date()

  if (isAdmin) {
    const issues = await prisma.revueIssue.findMany({
      where: { published: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: { id: true, title: true, month: true, year: true, description: true, coverImage: true, pdfFile: true, epubFile: true },
    })
    return NextResponse.json({ hasAccess: true, subscription: { plan: 'admin', endDate: null }, issues })
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: 'COMPLETED',
      endDate: { gt: now },
    },
    orderBy: { endDate: 'desc' },
  })

  if (!subscription) {
    return NextResponse.json({ hasAccess: false, subscription: null, issues: [] })
  }

  // Règle d'accès selon le plan :
  // - mensuel → uniquement le numéro du mois en cours (année + mois actuels)
  // - tous les autres plans → tous les numéros publiés (archives incluses)
  const isMensuel = subscription.plan === 'mensuel'

  const issueWhere = isMensuel
    ? {
        published: true,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      }
    : { published: true }

  const issues = await prisma.revueIssue.findMany({
    where: issueWhere,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    select: { id: true, title: true, month: true, year: true, description: true, coverImage: true, pdfFile: true, epubFile: true },
  })

  return NextResponse.json({
    hasAccess: true,
    subscription: {
      plan: subscription.plan,
      endDate: subscription.endDate,
    },
    issues,
  })
}

import { prisma } from '@/lib/prisma'

/** Numéro de revue FLYSYS tel que sélectionné pour la bibliothèque. */
export type RevueIssue = {
  id: string
  title: string
  month: number
  year: number
  description: string | null
  coverImage: string | null
  pdfFile: string | null
  epubFile: string | null
}

export type RevueSubscriptionInfo = { plan: string; endDate: Date | null }

const REVUE_ISSUE_SELECT = {
  id: true, title: true, month: true, year: true,
  description: true, coverImage: true, pdfFile: true, epubFile: true,
} as const

/** Numéros de revue auxquels un abonné a droit selon son plan. */
async function getRevueIssuesForPlan(plan: string, now: Date): Promise<RevueIssue[]> {
  const isMensuel = plan === 'mensuel'
  return prisma.revueIssue.findMany({
    where: isMensuel
      ? { published: true, year: now.getFullYear(), month: now.getMonth() + 1 }
      : { published: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    select: REVUE_ISSUE_SELECT,
  })
}

/**
 * Charge l'ensemble des données de la bibliothèque d'un utilisateur :
 * livres achetés, commandes, et accès à la revue FLYSYS (admin ou abonnement).
 */
export async function getUserLibrary(userId: string, isAdmin: boolean) {
  const now = new Date()

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const completedSlugs = purchases
    .filter((p) => p.status === 'COMPLETED')
    .map((p) => p.bookSlug)

  const books = completedSlugs.length > 0
    ? await prisma.book.findMany({ where: { slug: { in: completedSlugs } } })
    : []

  const pending = purchases.filter((p) => p.status === 'PENDING')

  let revueIssues: RevueIssue[] = []
  let revueSubscription: RevueSubscriptionInfo | null = null

  if (isAdmin) {
    revueIssues = await prisma.revueIssue.findMany({
      where: { published: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: REVUE_ISSUE_SELECT,
    })
    revueSubscription = { plan: 'admin', endDate: null }
  } else {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: 'COMPLETED', endDate: { gt: now } },
      orderBy: { endDate: 'desc' },
    })
    if (sub) {
      revueSubscription = { plan: sub.plan, endDate: sub.endDate }
      revueIssues = await getRevueIssuesForPlan(sub.plan, now)
    }
  }

  return { now, purchases, books, pending, revueIssues, revueSubscription }
}

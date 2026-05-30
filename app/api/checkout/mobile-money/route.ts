import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  // Max 5 commandes Mobile Money par IP par heure
  if (!rateLimit(getClientIp(req), 'checkout-mm', { limit: 5, window: 3600 })) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 1 heure.' }, { status: 429 })
  }
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { bookSlug, bookTitle, amount, mobilePhone, mobileOperator, customerName } =
    await req.json()

  if (!mobilePhone || !mobileOperator) {
    return NextResponse.json({ error: 'Téléphone et opérateur requis' }, { status: 400 })
  }

  const count = await prisma.purchase.count()
  const reference = `FK-${String(count + 1).padStart(4, '0')}`

  const purchase = await prisma.purchase.create({
    data: {
      userId: session.user.id,
      bookSlug,
      bookTitle,
      amount,
      currency: 'USD',
      paymentMethod: 'MOBILE_MONEY',
      status: 'PENDING',
      reference,
      mobilePhone,
      mobileOperator,
      customerName,
    },
  })

  return NextResponse.json({
    success: true,
    purchaseId: purchase.id,
    reference: purchase.reference,
    message: `Commande enregistrée. Référence : ${purchase.reference}`,
  })
}

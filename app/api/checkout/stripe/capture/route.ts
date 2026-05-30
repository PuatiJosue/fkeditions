import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendPurchaseConfirmation, sendPreOrderConfirmation } from '@/lib/email'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { paymentIntentId, bookSlug, bookTitle, amount, preOrder, releaseDate } = await req.json()

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (intent.status !== 'succeeded') {
    return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 })
  }

  const existing = await prisma.purchase.findFirst({ where: { stripeId: paymentIntentId } })
  if (existing) return NextResponse.json({ success: true })

  const count = await prisma.purchase.count()
  const reference = `FK-${String(count + 1).padStart(4, '0')}`

  await prisma.purchase.create({
    data: {
      userId: session.user.id,
      bookSlug,
      bookTitle,
      amount: parseFloat(amount),
      paymentMethod: 'STRIPE',
      status: 'COMPLETED',
      stripeId: paymentIntentId,
      reference,
      validatedAt: new Date(),
    },
  })

  if (session.user.email) {
    if (preOrder && releaseDate) {
      await sendPreOrderConfirmation(session.user.email, bookTitle, parseFloat(amount), releaseDate)
    } else {
      await sendPurchaseConfirmation(session.user.email, bookTitle, parseFloat(amount))
    }
  }

  return NextResponse.json({ success: true })
}

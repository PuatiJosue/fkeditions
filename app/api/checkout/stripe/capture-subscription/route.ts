import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Formules FLYSYS — toutes donnent accès aux contenus pendant 1 mois.
const PLANS: Record<string, { months: number; price: number }> = {
  standard: { months: 1, price: 5 },
  premium:  { months: 1, price: 10 },
  flysys_x: { months: 1, price: 30 },
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { paymentIntentId, planId } = await req.json()
  const plan = PLANS[planId]
  if (!plan) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (intent.status !== 'succeeded') {
    return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 })
  }

  const existing = await prisma.subscription.findFirst({ where: { stripeSubId: paymentIntentId } })
  if (existing) return NextResponse.json({ success: true })

  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + plan.months)

  await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan: planId,
      amount: plan.price,
      status: 'COMPLETED',
      paymentMethod: 'STRIPE',
      stripeSubId: paymentIntentId,
      startDate,
      endDate,
    },
  })

  return NextResponse.json({ success: true })
}

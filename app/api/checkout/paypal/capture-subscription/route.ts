import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { capturePayPalOrder } from '@/lib/paypal'
import { prisma } from '@/lib/prisma'
import { sendSubscriptionConfirmation } from '@/lib/email'

const PLANS: Record<string, { label: string; months: number; price: number }> = {
  mensuel:     { label: '1 mois',   months: 1,  price: 4  },
  trimestriel: { label: '3 mois',   months: 3,  price: 8  },
  semestriel:  { label: '6 mois',   months: 6,  price: 16 },
  annuel:      { label: '12 mois',  months: 12, price: 20 },
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { orderId, planId } = await req.json()
  const plan = PLANS[planId]
  if (!plan) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

  const capture = await capturePayPalOrder(orderId)
  if (capture.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 })
  }

  // Idempotency
  const existing = await prisma.subscription.findFirst({
    where: { stripeSubId: orderId },
  })
  if (existing) return NextResponse.json({ success: true })

  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + plan.months)

  await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan: planId,
      amount: plan.price,
      paymentMethod: 'STRIPE',
      status: 'COMPLETED',
      stripeSubId: orderId,
      startDate,
      endDate,
    },
  })

  if (session.user.email) {
    await sendSubscriptionConfirmation(session.user.email, plan.label, plan.price, endDate)
  }

  return NextResponse.json({ success: true })
}

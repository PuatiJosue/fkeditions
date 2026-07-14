import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { capturePayPalOrder } from '@/lib/paypal'
import { prisma } from '@/lib/prisma'
import { sendSubscriptionConfirmation } from '@/lib/email'

// Formules FLYSYS — toutes donnent accès aux contenus pendant 1 mois.
const PLANS: Record<string, { label: string; months: number; price: number }> = {
  standard: { label: 'Standard', months: 1, price: 5  },
  premium:  { label: 'Premium',  months: 1, price: 10 },
  flysys_x: { label: 'FLYSYS X', months: 1, price: 30 },
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

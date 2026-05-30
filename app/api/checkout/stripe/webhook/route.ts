import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendPurchaseConfirmation, sendPreOrderConfirmation } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const { userId, userEmail, bookSlug, bookTitle, amount, preOrder, releaseDate } = intent.metadata

    if (!userId || !bookSlug) return NextResponse.json({ received: true })

    const existing = await prisma.purchase.findFirst({ where: { stripeId: intent.id } })
    if (existing) return NextResponse.json({ received: true })

    const count = await prisma.purchase.count()
    const reference = `FK-${String(count + 1).padStart(4, '0')}`

    await prisma.purchase.create({
      data: {
        userId,
        bookSlug,
        bookTitle,
        amount: parseFloat(amount),
        paymentMethod: 'STRIPE',
        status: 'COMPLETED',
        stripeId: intent.id,
        reference,
        validatedAt: new Date(),
      },
    })

    if (userEmail) {
      if (preOrder === 'true' && releaseDate) {
        await sendPreOrderConfirmation(userEmail, bookTitle, parseFloat(amount), releaseDate)
      } else {
        await sendPurchaseConfirmation(userEmail, bookTitle, parseFloat(amount))
      }
    }
  }

  return NextResponse.json({ received: true })
}

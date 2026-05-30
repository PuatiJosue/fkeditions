import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

const PLANS: Record<string, { months: number; price: number }> = {
  mensuel:     { months: 1,  price: 4  },
  trimestriel: { months: 3,  price: 8  },
  semestriel:  { months: 6,  price: 16 },
  annuel:      { months: 12, price: 20 },
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { planId } = await req.json()
  const plan = PLANS[planId]
  if (!plan) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(plan.price * 100),
    currency: 'usd',
    description: `FK Éditions — Abonnement revue ${planId}`,
    metadata: {
      type: 'subscription',
      userId: session.user.id,
      userEmail: session.user.email ?? '',
      planId,
      amount: String(plan.price),
    },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPayPalOrder } from '@/lib/paypal'

// Formules FLYSYS — toutes donnent accès aux contenus pendant 1 mois.
const PLANS: Record<string, { label: string; months: number; price: number }> = {
  standard: { label: 'Standard', months: 1, price: 5  },
  premium:  { label: 'Premium',  months: 1, price: 10 },
  flysys_x: { label: 'FLYSYS X', months: 1, price: 30 },
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { planId } = await req.json()
  const plan = PLANS[planId]
  if (!plan) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const order = await createPayPalOrder(
    plan.price,
    `FLYSYS — Abonnement ${plan.label}`
  )

  if (order.id) {
    return NextResponse.json({ orderId: order.id, plan })
  }

  return NextResponse.json({ error: 'Erreur PayPal' }, { status: 500 })
}

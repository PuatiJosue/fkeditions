import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPayPalOrder } from '@/lib/paypal'

const PLANS: Record<string, { label: string; months: number; price: number }> = {
  mensuel:     { label: '1 mois',   months: 1,  price: 4  },
  trimestriel: { label: '3 mois',   months: 3,  price: 8  },
  semestriel:  { label: '6 mois',   months: 6,  price: 16 },
  annuel:      { label: '12 mois',  months: 12, price: 20 },
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
    `Revue FK Éditions — Abonnement ${plan.label}`
  )

  if (order.id) {
    return NextResponse.json({ orderId: order.id, plan })
  }

  return NextResponse.json({ error: 'Erreur PayPal' }, { status: 500 })
}

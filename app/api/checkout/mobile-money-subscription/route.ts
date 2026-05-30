import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const PLANS: Record<string, { label: string; months: number; price: number }> = {
  mensuel:     { label: '1 mois',  months: 1,  price: 4  },
  trimestriel: { label: '3 mois',  months: 3,  price: 8  },
  semestriel:  { label: '6 mois',  months: 6,  price: 16 },
  annuel:      { label: '12 mois', months: 12, price: 20 },
}

export async function POST(req: Request) {
  if (!rateLimit(getClientIp(req), 'checkout-mm-sub', { limit: 5, window: 3600 })) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 1 heure.' }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const { planId, mobilePhone, mobileOperator } = await req.json()

  const plan = PLANS[planId]
  if (!plan) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  if (!mobilePhone || !mobileOperator) {
    return NextResponse.json({ error: 'Téléphone et opérateur requis' }, { status: 400 })
  }

  const sub = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan: planId,
      amount: plan.price,
      paymentMethod: 'MOBILE_MONEY',
      status: 'PENDING',
      mobilePhone,
      mobileOperator,
    },
  })

  const reference = `SUB-${sub.id.slice(-6).toUpperCase()}`

  return NextResponse.json({
    success: true,
    reference,
    message: `Abonnement enregistré. Référence : ${reference}`,
  })
}

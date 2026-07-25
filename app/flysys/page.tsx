'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import SectionTitle from '@/components/ui/SectionTitle'
import { DEFAULT_MPESA_NUMBER, DEFAULT_AIRTEL_NUMBER } from '@/lib/constants'
import { PLANS, DEFAULT_OPERATORS, buildOperators, type Operator } from './_data'
import SubscriptionCardForm from './_components/SubscriptionCardForm'
import PlanMobileMoneyForm from './_components/PlanMobileMoneyForm'
import SubscriberContent, { type RevueAccess } from './_components/SubscriberContent'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function RevueContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const successParam = searchParams.get('success')
  const cancelledParam = searchParams.get('cancelled')

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [payTab, setPayTab] = useState<'card' | 'mm'>('card')
  const [mmPhone, setMmPhone] = useState('')
  const [mmOperator, setMmOperator] = useState('M_PESA')
  const [mmLoading, setMmLoading] = useState(false)
  const [mmError, setMmError] = useState('')
  const [mmReference, setMmReference] = useState('')
  const [subSuccess, setSubSuccess] = useState(false)
  const [access, setAccess] = useState<RevueAccess | null>(null)
  const [operators, setOperators] = useState<Operator[]>(DEFAULT_OPERATORS)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((data) => {
      setOperators(buildOperators(data.mpesa_number || DEFAULT_MPESA_NUMBER, data.airtel_number || DEFAULT_AIRTEL_NUMBER))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!session) return
    fetch('/api/revue/access').then((r) => r.json()).then(setAccess)
  }, [session, successParam])

  function refreshAccess() {
    fetch('/api/revue/access').then((r) => r.json()).then(setAccess)
  }

  function handleSubscribe(planId: string) {
    if (!session) { router.push('/login?callbackUrl=/flysys'); return }
    setMmError('')
    setMmReference('')
    setMmPhone('')
    setSelectedPlan(planId === selectedPlan ? null : planId)
  }

  async function handleMmSubmit(e: React.FormEvent, plan: { id: string; price: number }) {
    e.preventDefault()
    const activeOp = operators.find((o) => o.value === mmOperator)!
    if (!mmPhone.trim()) { setMmError('Veuillez entrer votre numéro de téléphone'); return }
    if (!activeOp.prefixes.some((p) => mmPhone.trim().startsWith(p))) {
      setMmError(`Un numéro ${activeOp.label} doit commencer par ${activeOp.prefixes.join(' ou ')}`)
      return
    }
    setMmLoading(true); setMmError('')
    try {
      const res = await fetch('/api/checkout/mobile-money-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, mobilePhone: mmPhone.trim(), mobileOperator: mmOperator }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur Mobile Money')
      setMmReference(data.reference ?? '')
      setMmPhone('')
    } catch (err: unknown) {
      setMmError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setMmLoading(false)
    }
  }

  return (
    <>
      <section className="fk-section" style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}>
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>FK Éditions présente</span>
          <h1 className="section-title">
            <em className="serif-i">FLYSYS</em>
          </h1>
          <p style={{ marginTop: 24, color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.65, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            Plateforme d&apos;apprentissage, de cours et de développement.
            Choisissez votre formule et accédez à l&apos;exclusivité des contenus
            pendant <strong style={{ color: 'var(--ink)' }}>1 mois entier</strong>.
          </p>
        </div>
      </section>

      <div className="fk-container" style={{ paddingBottom: 'clamp(60px, 8vh, 100px)' }}>
        {(successParam === '1' || subSuccess) && (
          <div className="mb-8 bg-green-900/30 border border-green-600/40 text-green-400 text-sm px-5 py-4 text-center">Abonnement activé ! Vos contenus sont disponibles ci-dessous.</div>
        )}
        {cancelledParam === '1' && (
          <div className="mb-8 bg-yellow-900/20 border border-yellow-600/30 text-yellow-400 text-sm px-5 py-4 text-center">Paiement annulé. Vous pouvez réessayer à tout moment.</div>
        )}

        <div id="abonnements" className="mb-10 text-center">
          <SectionTitle label="Nos formules" center />
          <h2 className="font-serif text-3xl text-cream mt-3 mb-12">Choisissez votre abonnement</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative flex flex-col bg-dark-3 border transition-all duration-200 overflow-hidden ${plan.best ? 'border-gold' : 'border-dark-4 hover:border-gold/30'}`}>
              {plan.best && <div className="bg-gold text-dark text-xs font-bold tracking-widest uppercase text-center py-1.5">Institutions</div>}
              {plan.popular && !plan.best && <div className="bg-dark-4 text-gold text-xs tracking-widest uppercase text-center py-1.5">Le plus choisi</div>}
              <div className="p-5 flex flex-col flex-1 gap-4">
                <div>
                  <p className="text-xs text-gold uppercase tracking-widest mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl text-cream font-bold">{plan.price}$</span>
                    <span className="text-xs text-cream-muted">USD / mois</span>
                  </div>
                  <p className="text-xs text-cream-muted mt-0.5">{plan.tagline}</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-cream-muted">
                      <svg className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors ${plan.best ? 'bg-gold hover:bg-gold-light text-dark' : 'border border-gold/40 hover:border-gold hover:bg-gold/5 text-gold'} ${selectedPlan === plan.id ? 'opacity-60' : ''}`}>
                  {selectedPlan === plan.id ? 'Choisir le paiement ↓' : "S'abonner"}
                </button>
                {selectedPlan === plan.id && (
                  <div className="mt-2 flex flex-col gap-3">
                    <div className="flex border border-dark-4">
                      <button onClick={() => { setPayTab('card'); setMmError(''); setMmReference('') }}
                        className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors ${payTab === 'card' ? 'bg-gold text-dark' : 'text-cream-muted hover:text-cream'}`}>Carte bancaire</button>
                      <button onClick={() => { setPayTab('mm') }}
                        className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors ${payTab === 'mm' ? 'bg-gold text-dark' : 'text-cream-muted hover:text-cream'}`}>Mobile Money</button>
                    </div>

                    {payTab === 'card' && (
                      <Elements stripe={stripePromise}>
                        <SubscriptionCardForm
                          planId={plan.id}
                          price={plan.price}
                          onSuccess={() => { setSubSuccess(true); setSelectedPlan(null); refreshAccess() }}
                        />
                      </Elements>
                    )}

                    {payTab === 'mm' && (
                      <PlanMobileMoneyForm
                        plan={plan}
                        operators={operators}
                        mmOperator={mmOperator}
                        setMmOperator={setMmOperator}
                        mmPhone={mmPhone}
                        setMmPhone={setMmPhone}
                        mmError={mmError}
                        mmLoading={mmLoading}
                        mmReference={mmReference}
                        onSubmit={(e) => handleMmSubmit(e, plan)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-cream-muted mt-8">
          Paiement sécurisé par Stripe (carte bancaire) ou Mobile Money (M-Pesa · Airtel).
          {!session && <span className="block mt-1 text-gold">Vous devrez vous connecter pour finaliser votre abonnement.</span>}
        </p>

        {access?.hasAccess && <SubscriberContent access={access} />}
      </div>
    </>
  )
}

export default function RevuePage() {
  return <Suspense><RevueContent /></Suspense>
}

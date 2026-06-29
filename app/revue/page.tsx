'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import SectionTitle from '@/components/SectionTitle'
import { useTheme } from '@/lib/useTheme'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const MONTHS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

interface Operator {
  value: string
  label: string
  number: string
  prefixes: string[]
  placeholder: string
}

function buildOperators(mpesa: string, airtel: string): Operator[] {
  return [
    { value: 'M_PESA', label: 'M-Pesa',       number: mpesa,  prefixes: ['081', '082'], placeholder: 'ex: 0810000000 ou 0820000000' },
    { value: 'AIRTEL', label: 'Airtel Money', number: airtel, prefixes: ['099'],        placeholder: 'ex: 0990000000' },
  ]
}

const DEFAULT_OPERATORS = buildOperators('0829082048', '0991316128')

interface RevueIssue { id: string; title: string; month: number; year: number; description: string | null; pdfFile: string | null; epubFile: string | null }

const DEFAULT_PRICES = { plan_1m_price: 4, plan_3m_price: 8, plan_6m_price: 16, plan_12m_price: 20 }

function buildPlans(p: typeof DEFAULT_PRICES) {
  return [
    { id: 'mensuel',     duration: '1 mois',  price: p.plan_1m_price,  perMonth: p.plan_1m_price,                   features: ['Tous les numéros du mois', 'Accès mobile et desktop'] },
    { id: 'trimestriel', duration: '3 mois',  price: p.plan_3m_price,  perMonth: +(p.plan_3m_price / 3).toFixed(2), features: ['Tous les numéros du trimestre', 'Archives complètes', 'Accès mobile et desktop'], popular: true, savings: `-${Math.round((1 - p.plan_3m_price / (p.plan_1m_price * 3)) * 100)}%` },
    { id: 'semestriel',  duration: '6 mois',  price: p.plan_6m_price,  perMonth: +(p.plan_6m_price / 6).toFixed(2), features: ['Tous les numéros du semestre', 'Archives complètes', 'Accès mobile et desktop', 'Newsletter exclusive'], savings: `-${Math.round((1 - p.plan_6m_price / (p.plan_1m_price * 6)) * 100)}%` },
    { id: 'annuel',      duration: '12 mois', price: p.plan_12m_price, perMonth: +(p.plan_12m_price / 12).toFixed(2), features: ["Tous les numéros de l'année", 'Archives complètes', 'Accès mobile et desktop', 'Newsletter exclusive', 'Accès anticipé aux nouveautés'], savings: `-${Math.round((1 - p.plan_12m_price / (p.plan_1m_price * 12)) * 100)}%`, best: true },
  ]
}

function SubscriptionCardForm({ planId, price, onSuccess }: { planId: string; price: number; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const { theme } = useTheme()
  const cardText = theme === 'light' ? '#2a2118' : '#e8dcc8'
  const cardPlaceholder = theme === 'light' ? '#9a8f7d' : '#6b6252'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    fetch('/api/checkout/stripe/create-subscription-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    }).then(r => r.json()).then(d => { if (d.clientSecret) setClientSecret(d.clientSecret) })
  }, [planId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return
    setLoading(true); setError('')
    const card = elements.getElement(CardElement)
    if (!card) return
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })
    if (stripeError) { setError(stripeError.message ?? 'Erreur de paiement'); setLoading(false); return }
    if (paymentIntent?.status === 'succeeded') {
      const res = await fetch('/api/checkout/stripe/capture-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id, planId }),
      })
      const result = await res.json()
      if (result.success) onSuccess()
      else setError(result.error ?? 'Erreur de confirmation')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="border border-dark-4 bg-dark-2 px-3 py-2.5">
        <CardElement key={theme} options={{ style: { base: { fontSize: '13px', color: cardText, fontFamily: 'monospace', '::placeholder': { color: cardPlaceholder } }, invalid: { color: '#f87171' } } }} />
      </div>
      {error && <p className="text-[10px] text-red-400 border border-red-800/40 px-2 py-1.5">{error}</p>}
      <button type="submit" disabled={!stripe || !clientSecret || loading}
        className="bg-gold hover:bg-gold-light disabled:opacity-50 text-dark font-semibold py-2.5 text-[10px] tracking-widest uppercase transition-colors">
        {loading ? 'Traitement...' : `Payer ${price} USD`}
      </button>
      <p className="text-[9px] text-cream-muted/50 text-center">Visa · Mastercard · Amex</p>
    </form>
  )
}

function RevueContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const successParam = searchParams.get('success')
  const cancelledParam = searchParams.get('cancelled')

  const [prices, setPrices] = useState(DEFAULT_PRICES)
  const plans = buildPlans(prices)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [payTab, setPayTab] = useState<'card' | 'mm'>('card')
  const [mmPhone, setMmPhone] = useState('')
  const [mmOperator, setMmOperator] = useState('M_PESA')
  const [mmLoading, setMmLoading] = useState(false)
  const [mmError, setMmError] = useState('')
  const [mmReference, setMmReference] = useState('')
  const [subSuccess, setSubSuccess] = useState(false)
  const [access, setAccess] = useState<{ hasAccess: boolean; subscription: { plan: string; endDate: string } | null; issues: RevueIssue[] } | null>(null)
  const [operators, setOperators] = useState<Operator[]>(DEFAULT_OPERATORS)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((data) => {
      if (data.plan_1m_price) setPrices({ plan_1m_price: parseFloat(data.plan_1m_price), plan_3m_price: parseFloat(data.plan_3m_price), plan_6m_price: parseFloat(data.plan_6m_price), plan_12m_price: parseFloat(data.plan_12m_price) })
      setOperators(buildOperators(data.mpesa_number || '0829082048', data.airtel_number || '0991316128'))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!session) return
    fetch('/api/revue/access').then(r => r.json()).then(setAccess)
  }, [session, successParam])

  function handleSubscribe(planId: string) {
    if (!session) { router.push('/login?callbackUrl=/revue'); return }
    setMmError('')
    setMmReference('')
    setMmPhone('')
    setSelectedPlan(planId === selectedPlan ? null : planId)
  }

  async function handleMmSubmit(e: React.FormEvent, plan: { id: string; price: number }) {
    e.preventDefault()
    const activeOp = operators.find(o => o.value === mmOperator)!
    if (!mmPhone.trim()) { setMmError('Veuillez entrer votre numéro de téléphone'); return }
    if (!activeOp.prefixes.some(p => mmPhone.trim().startsWith(p))) {
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
      <section
        className="fk-section"
        style={{ paddingTop: 'clamp(60px, 8vh, 100px)', paddingBottom: 'clamp(40px, 6vh, 60px)' }}
      >
        <div className="fk-container" style={{ textAlign: 'center' }}>
          <span className="kicker" style={{ justifyContent: 'center' }}>Revue FK Éditions</span>
          <h1 className="section-title">
            La <em className="serif-i">Revue</em>
          </h1>
          <p
            style={{
              marginTop: 24,
              color: 'var(--ink-soft)',
              fontSize: 17,
              lineHeight: 1.65,
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Bienvenue dans notre cabinet de curiosités contemporain. Chaque revue est un voyage,
            chaque magazine est une escale. Au fil des pages, nous donnons la parole aux esprits
            libres, aux plumes audacieuses et aux regards qui éclairent notre monde.
          </p>
        </div>
      </section>

      <div className="fk-container" style={{ paddingBottom: 'clamp(60px, 8vh, 100px)' }}>

        {/* Banners */}
        {(successParam === '1' || subSuccess) && (
          <div className="mb-8 bg-green-900/30 border border-green-600/40 text-green-400 text-sm px-5 py-4 text-center">Abonnement activé ! Vos numéros sont disponibles ci-dessous.</div>
        )}
        {cancelledParam === '1' && (
          <div className="mb-8 bg-yellow-900/20 border border-yellow-600/30 text-yellow-400 text-sm px-5 py-4 text-center">Paiement annulé. Vous pouvez réessayer à tout moment.</div>
        )}


        {/* Plans */}
        <div id="abonnements" className="mb-10 text-center">
          <SectionTitle label="Nos formules" center />
          <h2 className="font-serif text-3xl text-cream mt-3 mb-12">Choisissez votre abonnement</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative flex flex-col bg-dark-3 border transition-all duration-200 overflow-hidden ${plan.best ? 'border-gold' : 'border-dark-4 hover:border-gold/30'}`}>
              {plan.best && <div className="bg-gold text-dark text-xs font-bold tracking-widest uppercase text-center py-1.5">Meilleure valeur</div>}
              {plan.popular && !plan.best && <div className="bg-dark-4 text-gold text-xs tracking-widest uppercase text-center py-1.5">Populaire</div>}
              <div className="p-5 flex flex-col flex-1 gap-4">
                <div>
                  <p className="text-xs text-gold uppercase tracking-widest mb-1">{plan.duration}</p>
                  {plan.savings && <span className="inline-block text-xs bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 mb-2">{plan.savings}</span>}
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl text-cream font-bold">{plan.price}$</span>
                    <span className="text-xs text-cream-muted">USD</span>
                  </div>
                  <p className="text-xs text-cream-muted mt-0.5">≈ {plan.perMonth.toFixed(2)}$/mois USD</p>
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
                      <button
                        onClick={() => { setPayTab('card'); setMmError(''); setMmReference('') }}
                        className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors ${payTab === 'card' ? 'bg-gold text-dark' : 'text-cream-muted hover:text-cream'}`}
                      >Carte bancaire</button>
                      <button
                        onClick={() => { setPayTab('mm') }}
                        className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors ${payTab === 'mm' ? 'bg-gold text-dark' : 'text-cream-muted hover:text-cream'}`}
                      >Mobile Money</button>
                    </div>

                    {payTab === 'card' && (
                      <Elements stripe={stripePromise}>
                        <SubscriptionCardForm
                          planId={plan.id}
                          price={plan.price}
                          onSuccess={() => { setSubSuccess(true); setSelectedPlan(null); fetch('/api/revue/access').then(r => r.json()).then(setAccess) }}
                        />
                      </Elements>
                    )}

                    {payTab === 'mm' && (
                      mmReference ? (
                        <div className="bg-green-900/30 border border-green-600/40 text-green-400 text-xs px-3 py-3 leading-relaxed space-y-1">
                          <p>Abonnement enregistré ! Envoyez <span className="text-cream font-semibold">{plan.price} $</span> via Mobile Money au numéro FK Éditions.</p>
                          <p>Votre référence :{' '}
                            <span className="font-bold text-gold text-sm tracking-widest">{mmReference}</span>
                            {' '}— Gardez-la précieusement.
                          </p>
                          <p className="text-cream-muted">Votre abonnement sera activé sous 24h après réception du paiement.</p>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleMmSubmit(e, plan)} className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-cream-muted uppercase tracking-widest">Opérateur</label>
                            <select
                              value={mmOperator}
                              onChange={(e) => setMmOperator(e.target.value)}
                              className="bg-dark-2 border border-dark-4 text-cream text-xs px-3 py-2 focus:outline-none focus:border-gold/50"
                            >
                              {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-cream-muted uppercase tracking-widest">Numéro de téléphone</label>
                            <input
                              type="text"
                              inputMode="tel"
                              value={mmPhone}
                              onChange={(e) => setMmPhone(e.target.value)}
                              placeholder={operators.find(o => o.value === mmOperator)?.placeholder}
                              className="bg-dark-2 border border-dark-4 text-cream text-xs px-3 py-2 placeholder:text-cream-muted/50 focus:outline-none focus:border-gold/50"
                            />
                          </div>
                          {mmError && <p className="text-[10px] text-red-400 border border-red-800/40 px-2 py-1.5">{mmError}</p>}
                          <button
                            type="submit"
                            disabled={mmLoading}
                            className="bg-gold hover:bg-gold-light disabled:opacity-60 text-dark font-semibold py-2.5 text-[10px] tracking-widest uppercase transition-colors"
                          >
                            {mmLoading ? 'Envoi...' : `Confirmer — ${plan.price} $`}
                          </button>
                          <div
                            style={{
                              background: 'var(--accent-soft)',
                              border: '2px solid var(--accent)',
                              padding: 12,
                              color: 'var(--accent-deep)',
                              fontSize: 11,
                              lineHeight: 1.5,
                            }}
                          >
                            <p>
                              Envoyez <strong>{plan.price} $</strong> via{' '}
                              <strong>{operators.find(o => o.value === mmOperator)?.label}</strong> au :
                            </p>
                            <div
                              style={{
                                margin: '8px 0',
                                padding: '10px 12px',
                                background: 'var(--paper)',
                                border: '1px dashed var(--accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
                                flexWrap: 'wrap',
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: 'var(--serif)',
                                  fontSize: 'clamp(18px, 3vw, 24px)',
                                  fontWeight: 700,
                                  letterSpacing: '0.05em',
                                  color: 'var(--accent)',
                                }}
                              >
                                {operators.find(o => o.value === mmOperator)?.number}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const num = operators.find(o => o.value === mmOperator)?.number
                                  if (num) navigator.clipboard?.writeText(num)
                                }}
                                style={{
                                  background: 'var(--accent)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '6px 10px',
                                  fontSize: 10,
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  borderRadius: 4,
                                }}
                                title="Copier"
                              >
                                📋 Copier
                              </button>
                            </div>
                            <p style={{ fontSize: 10, opacity: 0.85 }}>
                              Abonnement activé sous 24h après paiement.
                            </p>
                          </div>
                        </form>
                      )
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

        {/* Numéros abonnés */}
        {access?.hasAccess && (
          <div className="mt-20">
            <div className="mb-8 text-center">
              <SectionTitle label="Mon abonnement" center />
              <h2 className="font-serif text-2xl text-cream mt-3">Mes numéros disponibles</h2>
              {access.subscription && access.subscription.plan !== 'admin' && access.subscription.endDate && (
                <p className="text-xs text-cream-muted mt-2">
                  Abonnement actif jusqu&apos;au <span className="text-gold">{new Date(access.subscription.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </p>
              )}
            </div>
            {access.issues.length === 0 ? (
              <div className="text-center py-12 bg-dark-3 border border-dark-4">
                <p className="text-cream-muted text-sm">Aucun numéro disponible pour le moment. Revenez bientôt !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {access.issues.map(issue => (
                  <div key={issue.id} className="bg-dark-3 border border-dark-4 overflow-hidden flex flex-col">
                    <div className="bg-gold px-5 py-4">
                      <p className="text-xs text-dark/70 uppercase tracking-widest font-semibold">{MONTHS[issue.month]} {issue.year}</p>
                      <h3 className="font-serif text-base text-dark font-bold leading-snug mt-0.5">{issue.title}</h3>
                    </div>
                    <div className="p-5 flex flex-col flex-1 gap-4">
                      {issue.description && <p className="text-xs text-cream-muted leading-relaxed line-clamp-3">{issue.description}</p>}
                      <div className="mt-auto">
                        {(issue.pdfFile || issue.epubFile)
                          ? <a href={`/revue/${issue.id}/lire`} className="block w-full text-center bg-gold hover:bg-gold-light text-dark font-semibold py-2.5 text-xs uppercase tracking-widest transition-colors">Lire la revue</a>
                          : <div className="block w-full text-center border border-dark-4 text-cream-muted py-2.5 text-xs uppercase tracking-widest">Bientôt disponible</div>
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default function RevuePage() {
  return <Suspense><RevueContent /></Suspense>
}

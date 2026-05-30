'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import SectionTitle from '@/components/SectionTitle'

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

const COLLABORATEURS = [
  {
    name: 'Josué Kawela Kandonda', photo: '/images/collaborateur/JOSUE%20KAWELA%20KANDONDA.jpeg',
    subtitle: 'Kinshasa, RDC · né le 20 mars',
    values: ['Foi', 'Travail', 'Intégrité', 'Service'],
    quote: 'Animé par des valeurs de foi, de travail, d\'intégrité et de service, il poursuit son engagement avec la conviction que chaque action porte en elle le pouvoir de transformer des vies.',
    bio: [
      'Né à Kinshasa le 20 mars, Josué Kawela Kandonda est docteur en sciences pharmaceutiques, logisticien et entrepreneur congolais engagé dans le développement communautaire, l\'innovation et la promotion du leadership des jeunes en RDC.',
      'Doté d\'un profil multidisciplinaire alliant sciences de la santé, gestion et stratégie organisationnelle, il évolue à l\'intersection de la pharmacie, de l\'entrepreneuriat et de l\'action sociale.',
      'Président de la structure Mbongwana, il œuvre pour inspirer une jeunesse ambitieuse. Il occupe également le poste de CFO au sein de l\'entreprise Galactik et est administrateur chez FK Éditions.',
    ],
  },
  {
    name: 'Alpha Lutete', photo: '/images/collaborateur/ALPHA%20LUTETE.jpeg',
    subtitle: '« Le Thérapeute du Peuple »',
    values: [],
    quote: 'La santé des uns ne va pas sans celle des autres et de leur environnement.',
    bio: [
      'Alpha Lutete, connu sous le pseudonyme « Le Thérapeute du Peuple », est pharmacien d\'officine de formation et de cœur. Pour lui, bien soigner, c\'est d\'abord bien utiliser ce que l\'on a entre les mains.',
      'Fondateur du groupe LKA Empire, il est Vice-Président du club « Une Santé RDC » (One Health RDC) et membre de la cellule santé publique de l\'ANep.',
      'Conférencier et écrivain, il utilise la parole et l\'écrit pour vulgariser les bonnes pratiques et faire du bon usage du médicament le premier geste de santé publique.',
    ],
  },
]

const FEATURES = [
  { title: 'Articles exclusifs', desc: 'Essais littéraires, critiques de livres et découvertes culturelles.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { title: "Interviews d'auteurs", desc: 'Rencontres exclusives avec nos auteurs et personnalités du monde littéraire.', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
  { title: 'Coulisses éditoriales', desc: "Découvrez le processus de création et la vie de notre maison d'édition.", icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
]

function SubscriptionCardForm({ planId, price, onSuccess }: { planId: string; price: number; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
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
        <CardElement options={{ style: { base: { fontSize: '13px', color: '#e8dcc8', fontFamily: 'monospace', '::placeholder': { color: '#6b6252' } }, invalid: { color: '#f87171' } } }} />
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


        {/* Numéro 1 */}
        <div className="mb-16 bg-dark-3 border border-dark-4 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative aspect-[3/4] md:aspect-auto min-h-[400px] bg-dark-4">
              <img src="/images/revue/sante-essentielle.jpg" alt="Santé Essentielle — Numéro 1" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-gold text-dark text-xs font-bold uppercase tracking-widest px-3 py-1">Numéro 1</div>
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center gap-5">
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-2">Nouveau projet</p>
                <h2 className="font-serif text-3xl text-cream leading-tight">Santé Essentielle</h2>
                <p className="text-xs text-cream-muted mt-1">Par Josué Kawela Kandonda & Alpha Lutete</p>
              </div>
              <div className="w-12 h-px bg-gold/40" />
              <p className="text-sm text-cream-dim leading-relaxed">
                Nous sommes fiers de vous dévoiler notre tout nouveau projet : <strong className="text-cream">La Revue Santé Essentielle</strong> !
                Parce que comprendre son corps est le premier pas vers une vie meilleure, nous avons créé ce rendez-vous unique.
              </p>
              <p className="text-sm text-gold font-medium">Rejoignez l&apos;aventure — l&apos;aventure commence maintenant !</p>
              <button onClick={() => document.getElementById('abonnements')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gold hover:bg-gold-light text-dark font-semibold py-3 px-6 text-xs uppercase tracking-widest transition-colors self-start">
                S&apos;abonner maintenant
              </button>
            </div>
          </div>
        </div>

        {/* Collaborateurs */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <SectionTitle label="L'équipe" center />
            <h2 className="font-serif text-2xl text-cream mt-3">Les collaborateurs de Santé Essentielle</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {COLLABORATEURS.map((c) => (
              <div key={c.name} className="bg-dark-3 border border-dark-4 overflow-hidden max-w-sm w-full sm:w-auto">
                <div className="relative aspect-[4/5] bg-dark-4">
                  <img src={c.photo} alt={c.name} className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-6">
                  <p className="text-xs text-gold uppercase tracking-widest mb-1">Collaborateur</p>
                  <h3 className="font-serif text-xl text-cream mb-0.5">{c.name}</h3>
                  <p className="text-xs text-cream-muted mb-4">{c.subtitle}</p>
                  <div className="w-10 h-px bg-gold/40 mb-4" />
                  {c.bio.map((p, i) => <p key={i} className="text-xs text-cream-dim leading-relaxed mb-3">{p}</p>)}
                  <p className="text-xs text-gold italic leading-relaxed">&ldquo;{c.quote}&rdquo;</p>
                  {c.values.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {c.values.map((v) => <span key={v} className="text-xs border border-gold/30 text-gold/80 px-2 py-0.5">{v}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-dark-3 border border-dark-4 p-6 flex gap-4">
              <div className="text-gold shrink-0 mt-0.5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} /></svg>
              </div>
              <div>
                <h3 className="font-serif text-base text-cream mb-1.5">{f.title}</h3>
                <p className="text-xs text-cream-muted leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

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

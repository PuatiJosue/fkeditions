'use client'

import type { Operator, Plan } from '../_data'

type Props = {
  plan: Plan
  operators: Operator[]
  mmOperator: string
  setMmOperator: (v: string) => void
  mmPhone: string
  setMmPhone: (v: string) => void
  mmError: string
  mmLoading: boolean
  mmReference: string
  onSubmit: (e: React.FormEvent) => void
}

/** Formulaire Mobile Money pour un abonnement (contrôlé par la page FLYSYS). */
export default function PlanMobileMoneyForm({
  plan, operators, mmOperator, setMmOperator, mmPhone, setMmPhone, mmError, mmLoading, mmReference, onSubmit,
}: Props) {
  const activeOp = operators.find((o) => o.value === mmOperator)

  if (mmReference) {
    return (
      <div className="bg-green-900/30 border border-green-600/40 text-green-400 text-xs px-3 py-3 leading-relaxed space-y-1">
        <p>Abonnement enregistré ! Envoyez <span className="text-cream font-semibold">{plan.price} $</span> via Mobile Money au numéro FK Éditions.</p>
        <p>Votre référence :{' '}
          <span className="font-bold text-gold text-sm tracking-widest">{mmReference}</span>
          {' '}— Gardez-la précieusement.
        </p>
        <p className="text-cream-muted">Votre abonnement sera activé sous 24h après réception du paiement.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-cream-muted uppercase tracking-widest">Opérateur</label>
        <select value={mmOperator} onChange={(e) => setMmOperator(e.target.value)}
          className="bg-dark-2 border border-dark-4 text-cream text-xs px-3 py-2 focus:outline-none focus:border-gold/50">
          {operators.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-cream-muted uppercase tracking-widest">Numéro de téléphone</label>
        <input type="text" inputMode="tel" value={mmPhone} onChange={(e) => setMmPhone(e.target.value)}
          placeholder={activeOp?.placeholder}
          className="bg-dark-2 border border-dark-4 text-cream text-xs px-3 py-2 placeholder:text-cream-muted/50 focus:outline-none focus:border-gold/50" />
      </div>
      {mmError && <p className="text-[10px] text-red-400 border border-red-800/40 px-2 py-1.5">{mmError}</p>}
      <button type="submit" disabled={mmLoading}
        className="bg-gold hover:bg-gold-light disabled:opacity-60 text-dark font-semibold py-2.5 text-[10px] tracking-widest uppercase transition-colors">
        {mmLoading ? 'Envoi...' : `Confirmer — ${plan.price} $`}
      </button>
      <div style={{ background: 'var(--accent-soft)', border: '2px solid var(--accent)', padding: 12, color: 'var(--accent-deep)', fontSize: 11, lineHeight: 1.5 }}>
        <p>
          Envoyez <strong>{plan.price} $</strong> via <strong>{activeOp?.label}</strong> au :
        </p>
        <div style={{ margin: '8px 0', padding: '10px 12px', background: 'var(--paper)', border: '1px dashed var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent)' }}>
            {activeOp?.number}
          </span>
          <button type="button" onClick={() => { if (activeOp?.number) navigator.clipboard?.writeText(activeOp.number) }}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '6px 10px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', borderRadius: 4 }}
            title="Copier">
            📋 Copier
          </button>
        </div>
        <p style={{ fontSize: 10, opacity: 0.85 }}>Abonnement activé sous 24h après paiement.</p>
      </div>
    </form>
  )
}

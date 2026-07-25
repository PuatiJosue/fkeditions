'use client'

const CRITERIA = [
  { label: 'Au moins 8 caractères',       test: (p: string) => p.length >= 8 },
  { label: 'Au moins 12 caractères',      test: (p: string) => p.length >= 12 },
  { label: 'Une lettre majuscule (A-Z)',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une lettre minuscule (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre (0-9)',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'Un caractère spécial (!@#…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(p: string) {
  const score = CRITERIA.filter((c) => c.test(p)).length
  if (!p)        return { score: 0, label: '', color: '' }
  if (score <= 2) return { score, label: 'Très faible', color: 'bg-red-500' }
  if (score === 3) return { score, label: 'Faible',     color: 'bg-orange-400' }
  if (score === 4) return { score, label: 'Moyen',      color: 'bg-yellow-400' }
  if (score === 5) return { score, label: 'Fort',       color: 'bg-lime-500' }
  return             { score, label: 'Très fort',       color: 'bg-green-500' }
}

export function isPasswordValid(p: string) {
  return [CRITERIA[0], CRITERIA[2], CRITERIA[3], CRITERIA[4], CRITERIA[5]].every((c) => c.test(p))
}

export default function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = getStrength(password)
  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-dark-4 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-300 rounded-full ${color}`} style={{ width: `${(score / 6) * 100}%` }} />
        </div>
        <span className={`text-[11px] font-medium min-w-[70px] text-right ${
          score <= 2 ? 'text-red-400' : score === 3 ? 'text-orange-400' :
          score === 4 ? 'text-yellow-400' : score === 5 ? 'text-lime-400' : 'text-green-400'
        }`}>{label}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {CRITERIA.map((c, i) => {
          const met = c.test(password)
          return (
            <div key={i} className={`flex items-center gap-1.5 text-[11px] transition-colors ${met ? 'text-green-400' : 'text-cream-muted'}`}>
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {met
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
              </svg>
              {c.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

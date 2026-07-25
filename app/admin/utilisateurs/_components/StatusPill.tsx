import type { ReactNode } from 'react'
import type { UserRow } from './types'

function Pill({ bg, border, color, children }: { bg: string; border: string; color: string; children: ReactNode }) {
  return (
    <span style={{ background: bg, border: `1px solid ${border}`, color, padding: '3px 10px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, display: 'inline-block' }}>
      {children}
    </span>
  )
}

/** Pastille de statut d'un compte (suspendu / bloqué / admin / actif). */
export default function StatusPill({ user }: { user: UserRow }) {
  if (user.deletedAt) return <Pill bg="rgba(127, 29, 29, 0.1)" border="rgba(127, 29, 29, 0.4)" color="#7f1d1d">Suspendu</Pill>
  if (user.blocked) return <Pill bg="rgba(234, 88, 12, 0.1)" border="rgba(234, 88, 12, 0.3)" color="#ea580c">Bloqué</Pill>
  if (user.role === 'ADMIN') return <Pill bg="var(--accent-soft)" border="var(--accent)" color="var(--accent-deep)">Admin</Pill>
  return <Pill bg="rgba(34, 197, 94, 0.1)" border="rgba(34, 197, 94, 0.3)" color="#16a34a">Actif</Pill>
}

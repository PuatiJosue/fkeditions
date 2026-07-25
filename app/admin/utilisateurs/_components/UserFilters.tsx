import type { FilterKey } from './types'

type Counts = Record<FilterKey, number>

const TABS: { key: FilterKey; label: (c: Counts) => string }[] = [
  { key: 'all', label: (c) => `Tous (${c.all})` },
  { key: 'active', label: (c) => `Actifs (${c.active})` },
  { key: 'blocked', label: (c) => `🟠 Bloqués (${c.blocked})` },
  { key: 'suspended', label: (c) => `🔴 Suspendus (${c.suspended})` },
  { key: 'admin', label: (c) => `Admins (${c.admin})` },
]

type Props = {
  query: string
  onQueryChange: (v: string) => void
  filter: FilterKey
  onFilterChange: (f: FilterKey) => void
  counts: Counts
}

/** Barre de recherche + onglets de filtrage des utilisateurs. */
export default function UserFilters({ query, onQueryChange, filter, onFilterChange, counts }: Props) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Rechercher par email ou nom…"
          style={{ width: '100%', maxWidth: 400, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 14, outline: 'none' }}
        />
      </div>

      <div className="section-tabs" style={{ marginTop: 0, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button key={tab.key} className={`tab ${filter === tab.key ? 'is-active' : ''}`} onClick={() => onFilterChange(tab.key)}>
            {tab.label(counts)}
          </button>
        ))}
      </div>
    </>
  )
}

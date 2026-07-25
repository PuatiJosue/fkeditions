'use client'

import { useState, useMemo } from 'react'
import type { UserRow, FilterKey } from './_components/types'
import { useUserActions } from './_components/useUserActions'
import UserFilters from './_components/UserFilters'
import UsersTable from './_components/UsersTable'

export type { UserRow } from './_components/types'

export default function UsersClient({ initial }: { initial: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initial)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [query, setQuery] = useState('')
  const actions = useUserActions(setUsers)

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => !u.blocked && !u.deletedAt && u.role !== 'ADMIN').length,
      blocked: users.filter((u) => u.blocked).length,
      suspended: users.filter((u) => u.deletedAt).length,
      admin: users.filter((u) => u.role === 'ADMIN').length,
    }),
    [users]
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return users.filter((u) => {
      if (filter === 'active' && (u.blocked || u.deletedAt || u.role === 'ADMIN')) return false
      if (filter === 'blocked' && !u.blocked) return false
      if (filter === 'suspended' && !u.deletedAt) return false
      if (filter === 'admin' && u.role !== 'ADMIN') return false
      if (q && !u.email.toLowerCase().includes(q) && !(u.name ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [users, filter, query])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="kicker">Gestion des comptes</span>
        <h1 className="admin-page-title" style={{ marginTop: 12 }}>Utilisateurs</h1>
        <p className="admin-page-subtitle">
          {counts.all} compte{counts.all > 1 ? 's' : ''}
          {counts.blocked > 0 && ` · ${counts.blocked} bloqué${counts.blocked > 1 ? 's' : ''}`}
          {counts.suspended > 0 && ` · ${counts.suspended} suspendu${counts.suspended > 1 ? 's' : ''}`}
        </p>
      </div>

      <UserFilters query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} counts={counts} />
      <UsersTable users={filtered} actions={actions} />
    </div>
  )
}

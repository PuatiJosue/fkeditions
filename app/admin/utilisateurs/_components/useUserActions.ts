'use client'

import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { UserRow } from './types'

async function apiError(res: Response): Promise<string> {
  const err = await res.json().catch(() => ({}))
  return err.error || 'Erreur'
}

/** Actions de modération sur les comptes (blocage, suspension, rôle). */
export function useUserActions(setUsers: Dispatch<SetStateAction<UserRow[]>>) {
  const [busy, setBusy] = useState<string | null>(null)

  function patch(id: string, changes: Partial<UserRow>) {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, ...changes } : u)))
  }

  async function run(id: string, req: () => Promise<Response>, onOk: () => void) {
    setBusy(id)
    try {
      const res = await req()
      if (!res.ok) { alert(await apiError(res)); return }
      onOk()
    } finally {
      setBusy(null)
    }
  }

  async function blockUser(id: string) {
    const reason = prompt('Raison du blocage (optionnelle) :')
    if (reason === null) return // annulé
    await run(
      id,
      () => fetch(`/api/admin/users/${id}/block`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) }),
      () => patch(id, { blocked: true, blockedReason: reason || null, blockedAt: new Date().toISOString() })
    )
  }

  async function unblockUser(id: string) {
    if (!confirm('Débloquer cet utilisateur ?')) return
    await run(
      id,
      () => fetch(`/api/admin/users/${id}/block`, { method: 'DELETE' }),
      () => patch(id, { blocked: false, blockedReason: null, blockedAt: null })
    )
  }

  async function suspendUser(id: string) {
    if (!confirm('Suspendre ce compte ? Le compte sera désactivé mais les données conservées (achats, etc.). Réversible.')) return
    await run(
      id,
      () => fetch(`/api/admin/users/${id}/suspend`, { method: 'POST' }),
      () => patch(id, { deletedAt: new Date().toISOString() })
    )
  }

  async function restoreUser(id: string) {
    if (!confirm('Réactiver ce compte ?')) return
    await run(
      id,
      () => fetch(`/api/admin/users/${id}/suspend`, { method: 'DELETE' }),
      () => patch(id, { deletedAt: null })
    )
  }

  async function toggleRole(id: string, currentRole: string) {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
    if (!confirm(`Changer le rôle en ${newRole === 'ADMIN' ? 'Administrateur' : 'Client'} ?`)) return
    await run(
      id,
      () => fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) }),
      () => patch(id, { role: newRole })
    )
  }

  return { busy, blockUser, unblockUser, suspendUser, restoreUser, toggleRole }
}

export type UserActions = ReturnType<typeof useUserActions>

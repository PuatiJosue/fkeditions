'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Props {
  userId: string
  currentRole: string
  userEmail: string
}

export default function RoleToggle({ userId, currentRole, userEmail }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isSelf = session?.user?.email === userEmail
  const isAdmin = currentRole === 'ADMIN'

  async function toggle() {
    if (isSelf) return
    const newRole = isAdmin ? 'CUSTOMER' : 'ADMIN'
    const label = newRole === 'ADMIN' ? 'promouvoir Admin' : 'rétrograder en Client'
    if (!confirm(`Voulez-vous ${label} ${userEmail} ?`)) return
    setLoading(true)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    router.refresh()
    setLoading(false)
  }

  async function deleteUser() {
    if (!confirm(`Supprimer définitivement le compte de ${userEmail} ? Cette action est irréversible.`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error); setLoading(false); return }
    router.refresh()
    setLoading(false)
  }

  if (isSelf) return <span className="text-cream-muted/40 text-[10px]">vous-même</span>

  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={toggle}
        disabled={loading}
        className={`text-[10px] uppercase tracking-wide px-2 py-1 border transition-colors disabled:opacity-40 ${
          isAdmin
            ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10'
            : 'border-gold/40 text-gold hover:bg-gold/10'
        }`}
      >
        {loading ? '...' : isAdmin ? '→ Client' : '→ Admin'}
      </button>
      {!isAdmin && (
        <button
          onClick={deleteUser}
          disabled={loading}
          className="text-[10px] uppercase tracking-wide px-2 py-1 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
        >
          Supprimer
        </button>
      )}
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function EventActions({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Supprimer cet événement ?')) return
    setLoading(true)
    await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      <Link href={`/admin/evenements/${eventId}`} className="text-cream-muted hover:text-gold transition-colors">
        Modifier
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40"
      >
        {loading ? '...' : 'Supprimer'}
      </button>
    </div>
  )
}

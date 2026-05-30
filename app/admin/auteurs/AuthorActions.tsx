'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function AuthorActions({ authorId }: { authorId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Supprimer cet auteur ? Les livres liés ne seront pas supprimés.')) return
    setLoading(true)
    await fetch(`/api/admin/authors/${authorId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4 shrink-0">
      <Link href={`/admin/auteurs/${authorId}`} className="text-xs text-cream-muted hover:text-gold transition-colors">
        Modifier
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40"
      >
        {loading ? '...' : 'Supprimer'}
      </button>
    </div>
  )
}

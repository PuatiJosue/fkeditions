'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function BookActions({ bookId, bookSlug, hasPdf, hasEpub, editBase = '/admin/livres' }: { bookId: string; bookSlug: string; hasPdf: boolean; hasEpub: boolean; editBase?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Supprimer ce livre définitivement ?')) return
    setLoading(true)
    await fetch(`/api/admin/books/${bookId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      {(hasEpub || hasPdf) && (
        <Link
          href={`/livres/${bookSlug}/lire`}
          className="text-cream-muted hover:text-cream transition-colors"
        >
          {hasEpub ? 'ePub' : 'PDF'}
        </Link>
      )}
      <Link
        href={`${editBase}/${bookId}`}
        className="text-cream-muted hover:text-gold transition-colors"
      >
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

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false })
const EPUBViewer = dynamic(() => import('@/components/EPUBViewer'), { ssr: false })

const REFRESH_INTERVAL = 25 * 60 * 1000

export default function LireRevuePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [blob, setBlob] = useState<Blob | null>(null)
  const [format, setFormat] = useState<'epub' | 'pdf' | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [width, setWidth] = useState(390)
  const tokenRef = useRef<string>('')

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setWidth(node.clientWidth)
  }, [])

  async function fetchToken(): Promise<{ token: string; hasEpub: boolean; hasPdf: boolean } | null> {
    const res = await fetch(`/api/revue/token/${id}`, { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    tokenRef.current = data.token
    return data
  }

  useEffect(() => {
    async function load() {
      const info = await fetchToken()
      if (!info) { setError('Accès refusé'); setLoading(false); return }

      const { token, hasEpub, hasPdf } = info

      const url = hasEpub
        ? `/api/revue/epub/${id}?token=${token}`
        : `/api/revue/pdf/${id}?token=${token}`

      fetch(url, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`Erreur ${res.status}`)
          return res.blob()
        })
        .then(b => {
          setBlob(b)
          setFormat(hasEpub ? 'epub' : hasPdf ? 'pdf' : null)
          setLoading(false)
        })
        .catch(err => { setError(err.message); setLoading(false) })
    }
    load()

    const interval = setInterval(fetchToken, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [id])

  return (
    <div className="min-h-screen bg-dark">
      <div className="sticky top-0 z-10 bg-dark-2 border-b border-dark-4 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-gold text-xs uppercase tracking-widest hover:text-gold-light transition-colors">
          ← Retour
        </button>
        <span className="text-cream-muted text-xs">
          {loading ? 'Chargement...' : numPages > 0 ? `${numPages} page${numPages > 1 ? 's' : ''}` : ''}
        </span>
      </div>

      <div ref={containerRef} className="max-w-3xl mx-auto">
        {loading && (
          <div className="text-center py-20">
            <p className="text-cream-muted text-sm animate-pulse">Chargement...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-20 px-6">
            <p className="text-red-400 text-sm mb-2">Une erreur est survenue.</p>
            <p className="text-xs text-cream-muted mb-6">Veuillez retourner à FLYSYS et réessayer.</p>
            <button onClick={() => router.back()} className="bg-gold text-dark text-xs font-semibold px-6 py-2.5 uppercase tracking-widest">
              ← Retour à FLYSYS
            </button>
          </div>
        )}
        {blob && format === 'epub' && (
          <EPUBViewer
            blob={blob}
            width={width}
            onLoadSuccess={setNumPages}
            onError={setError}
            userEmail={session?.user?.email ?? ''}
            isAdmin={session?.user?.role === 'ADMIN'}
          />
        )}
        {blob && format === 'pdf' && (
          <PDFViewer
            blob={blob}
            width={width}
            onLoadSuccess={setNumPages}
            onError={setError}
            userEmail={session?.user?.email ?? ''}
            isAdmin={session?.user?.role === 'ADMIN'}
          />
        )}
      </div>
    </div>
  )
}

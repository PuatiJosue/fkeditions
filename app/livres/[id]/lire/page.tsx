'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(() => import('@/components/reader/PDFViewer'), { ssr: false })
const EPUBViewer = dynamic(() => import('@/components/reader/EPUBViewer'), { ssr: false })

const REFRESH_INTERVAL = 25 * 60 * 1000

export default function LireLivrePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const [fileBlob, setFileBlob] = useState<Blob | null>(null)
  const [format, setFormat] = useState<'epub' | 'pdf' | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [bookPages, setBookPages] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [width, setWidth] = useState(390)
  const tokenRef = useRef<string>('')

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setWidth(node.clientWidth)
  }, [])

  async function fetchToken(): Promise<string | null> {
    const res = await fetch(`/api/download/token/${id}`, { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    tokenRef.current = data.token
    setFormat(data.format ?? 'epub')
    setBookPages(typeof data.pages === 'number' ? data.pages : null)
    return data.token
  }

  useEffect(() => {
    async function load() {
      const token = await fetchToken()
      if (!token) { setError('Accès refusé'); setLoading(false); return }

      fetch(`/api/download/${id}?token=${token}`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`Erreur ${res.status}`)
          return res.blob()
        })
        .then(blob => { setFileBlob(blob); setLoading(false) })
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
            <p className="text-cream-muted text-sm">Chargement du livre...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-20 px-6">
            <p className="text-red-400 text-sm mb-2">Une erreur est survenue.</p>
            <p className="text-xs text-cream-muted mb-6">Veuillez retourner à votre bibliothèque et réessayer.</p>
            <button onClick={() => router.back()} className="bg-gold text-dark text-xs font-semibold px-6 py-2.5 uppercase tracking-widest">
              ← Retour à ma bibliothèque
            </button>
          </div>
        )}
        {fileBlob && format === 'epub' && format !== null && (
          <EPUBViewer
            blob={fileBlob}
            width={width}
            onLoadSuccess={setNumPages}
            onError={setError}
            userEmail={session?.user?.email ?? ''}
            isAdmin={session?.user?.role === 'ADMIN'}
            bookPages={bookPages}
          />
        )}
        {fileBlob && format === 'pdf' && (
          <PDFViewer
            blob={fileBlob}
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

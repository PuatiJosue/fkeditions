'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  blob: Blob
  width: number
  onLoadSuccess: (numPages: number) => void
  onError: (msg: string) => void
  userEmail?: string
  isAdmin?: boolean
}

function resolvePath(base: string, relative: string): string {
  if (relative.startsWith('/')) return relative.slice(1)
  const parts = (base + relative).split('/')
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return resolved.join('/')
}

/** Décode un chemin encodé (%20, %C3%A9…) sans planter sur une séquence invalide. */
function safeDecode(path: string): string {
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

async function parseEpub(blob: Blob): Promise<string[]> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  // ZIP magic bytes: PK = 0x50 0x4B
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4B) {
    throw new Error(`Format invalide (taille=${blob.size}, type=${blob.type}, octets=${bytes[0]},${bytes[1]},${bytes[2]},${bytes[3]})`)
  }
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(buffer)

  const containerXml = await zip.file('META-INF/container.xml')?.async('string')
  if (!containerXml) throw new Error('Fichier ePub invalide')

  const rootfilePath = containerXml.match(/full-path="([^"]+)"/)?.[1]
  if (!rootfilePath) throw new Error('Fichier ePub invalide')

  const opfContent = await zip.file(rootfilePath)?.async('string')
  if (!opfContent) throw new Error('Fichier ePub invalide')

  const baseDir = rootfilePath.includes('/')
    ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1)
    : ''

  const manifest: Record<string, string> = {}
  const navIds = new Set<string>()
  for (const m of opfContent.matchAll(/<item\b([^>]*)\/?\>/g)) {
    const attrs = m[1]
    const idMatch = attrs.match(/\bid="([^"]+)"/)
    const hrefMatch = attrs.match(/\bhref="([^"]+)"/)
    if (idMatch && hrefMatch) {
      manifest[idMatch[1]] = hrefMatch[1]
      if (/\bproperties="[^"]*\bnav\b/.test(attrs)) navIds.add(idMatch[1])
    }
  }

  const spine = [...opfContent.matchAll(/<itemref\b[^>]*\bidref="([^"]+)"/g)]
    .filter(m => !navIds.has(m[1]))
    .map(m => baseDir + (manifest[m[1]] ?? ''))
    .filter(p => p !== baseDir)

  // Build image base64 map
  const imageMap: Record<string, string> = {}
  for (const [path, file] of Object.entries(zip.files)) {
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(path)) {
      const data = await file.async('base64')
      const ext = path.split('.').pop()!.toLowerCase()
      const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
      imageMap[path] = `data:${mime};base64,${data}`
    }
  }

  const chapters: string[] = []
  for (const chapterPath of spine) {
    const cleanPath = chapterPath.split('#')[0]
    // Tolère l'encodage d'URL : les hrefs de l'OPF peuvent être encodés
    // (espaces/accents) alors que l'archive stocke les noms en clair.
    const file = zip.file(cleanPath) ?? zip.file(safeDecode(cleanPath))
    if (!file) continue

    let html = await file.async('string')
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    let content = bodyMatch?.[1] ?? html

    const chapterDir = cleanPath.includes('/')
      ? cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1)
      : ''

    content = content.replace(/src="([^"]+)"/g, (_, src) => {
      const absPath = resolvePath(chapterDir, safeDecode(src))
      return `src="${imageMap[absPath] ?? ''}"`
    })
    // Handle SVG <image> elements used by Calibre and similar tools for cover pages
    // (cover.xhtml uses <image xlink:href="..."> not <img src="...">)
    content = content.replace(/(<image\b[^>]*)(?:xlink:href|href)="([^"#][^"]*)"/gi, (_, before, href) => {
      const absPath = resolvePath(chapterDir, safeDecode(href))
      const b64 = imageMap[absPath]
      return b64 ? `${before}href="${b64}"` : `${before}href=""`
    })
    content = content.replace(/<script[\s\S]*?<\/script>/gi, '')
    content = content.replace(/\bon\w+="[^"]*"/gi, '')
    // Strip external hrefs on <a> elements only — NOT on SVG <image> elements
    content = content.replace(/(<a\b[^>]*)href="[^"#][^"]*"/gi, '$1href="#"')

    if (content.trim()) chapters.push(content)
  }

  return chapters
}

export default function EPUBViewer({ blob, width, onLoadSuccess, onError, userEmail, isAdmin }: Props) {
  const originalPrintRef = useRef<typeof window.print | null>(null)
  const [chapters, setChapters] = useState<string[]>([])
  const [currentChapter, setCurrentChapter] = useState(0)
  const [ready, setReady] = useState(false)

  const protect = !isAdmin

  useEffect(() => {
    if (!protect) return

    originalPrintRef.current = window.print
    window.print = () => {}

    const style = document.createElement('style')
    style.id = 'fk-print-block'
    style.textContent = '@media print { body { display: none !important; } }'
    document.head.appendChild(style)

    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const key = e.key.toLowerCase()
      if (ctrl && !shift && ['u', 'p', 's', 'a', 'c', 'x'].includes(key)) {
        e.preventDefault(); e.stopPropagation(); return
      }
      if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return }
      if (ctrl && shift && ['i', 'j', 'c', 'k'].includes(key)) {
        e.preventDefault(); e.stopPropagation(); return
      }
      if (e.key === 'PrintScreen') navigator.clipboard.writeText('').catch(() => {})
    }

    const handleDrag = (e: DragEvent) => e.preventDefault()
    // Block text selection on all devices including mobile
    const selectStyle = document.createElement('style')
    selectStyle.id = 'fk-select-block'
    selectStyle.textContent = `
      .fk-epub-content, .fk-epub-content * {
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
        -moz-user-select: none !important;
        user-select: none !important;
      }
    `
    document.head.appendChild(selectStyle)

    const handleSelect = (e: Event) => e.preventDefault()
    document.addEventListener('selectstart', handleSelect, true)
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('dragstart', handleDrag, true)

    return () => {
      if (originalPrintRef.current) window.print = originalPrintRef.current
      document.getElementById('fk-print-block')?.remove()
      document.getElementById('fk-select-block')?.remove()
      document.removeEventListener('selectstart', handleSelect, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('dragstart', handleDrag, true)
    }
  }, [protect])

  useEffect(() => {
    let cancelled = false
    parseEpub(blob)
      .then(chs => {
        if (cancelled) return
        setChapters(chs)
        setReady(true)
        onLoadSuccess(chs.length)
      })
      .catch(err => {
        if (!cancelled) onError(err?.message ?? 'Erreur de chargement du livre')
      })
    return () => { cancelled = true }
  }, [blob])

  if (!ready) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-cream-muted text-sm animate-pulse">Chargement du livre...</p>
    </div>
  )

  return (
    <div
      onContextMenu={protect ? e => e.preventDefault() : undefined}
      style={protect ? { userSelect: 'none', WebkitUserSelect: 'none' } : undefined}
    >
      <div className="relative">
        <div
          className={`px-6 py-10 bg-white${protect ? ' fk-epub-content' : ''}`}
          style={{
            fontSize: '16px',
            lineHeight: '1.85',
            color: '#1a1a1a',
            fontFamily: 'Georgia, "Times New Roman", serif',
            minHeight: '70vh',
            userSelect: protect ? 'none' : 'auto',
            WebkitUserSelect: protect ? 'none' : 'auto',
            ...(protect ? {
              WebkitTouchCallout: 'none' as any,
              touchAction: 'pan-y',
              MozUserSelect: 'none' as any,
            } : {}),
          }}
          dangerouslySetInnerHTML={{ __html: `<style>img{max-width:100%;height:auto;display:block;margin:0 auto}</style>${chapters[currentChapter] ?? ''}` }}
        />

      </div>

      {chapters.length > 1 && (
        <div className="flex items-center justify-center gap-6 py-4 bg-dark-2 border-t border-dark-4">
          <button
            onClick={() => setCurrentChapter(c => Math.max(0, c - 1))}
            disabled={currentChapter === 0}
            className="px-4 py-2 text-xs uppercase tracking-widest text-cream-muted hover:text-gold disabled:opacity-30 transition-colors"
          >
            ← Précédent
          </button>
          <span className="text-xs text-cream-muted">
            {currentChapter + 1} / {chapters.length}
          </span>
          <button
            onClick={() => setCurrentChapter(c => Math.min(chapters.length - 1, c + 1))}
            disabled={currentChapter === chapters.length - 1}
            className="px-4 py-2 text-xs uppercase tracking-widest text-cream-muted hover:text-gold disabled:opacity-30 transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}

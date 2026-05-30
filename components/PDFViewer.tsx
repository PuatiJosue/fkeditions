'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface Props {
  blob: Blob
  width: number
  onLoadSuccess: (numPages: number) => void
  onError: (msg: string) => void
  userEmail?: string
  isAdmin?: boolean
}

export default function PDFViewer({ blob, width, onLoadSuccess, onError, userEmail, isAdmin }: Props) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const originalPrintRef = useRef<typeof window.print | null>(null)

  const protect = !isAdmin

  useEffect(() => {
    if (!protect) return

    // Override window.print
    originalPrintRef.current = window.print
    window.print = () => {}

    // Inject print-blocking CSS
    const style = document.createElement('style')
    style.id = 'fk-print-block'
    style.textContent = '@media print { body { display: none !important; } }'
    document.head.appendChild(style)

    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const key = e.key.toLowerCase()

      // Ctrl+U (source), Ctrl+P (print), Ctrl+S (save), Ctrl+A (select all)
      // Ctrl+C (copy), Ctrl+X (cut)
      if (ctrl && !shift && ['u', 'p', 's', 'a', 'c', 'x'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      // Ctrl+Shift+I / J / C / K (DevTools)
      if (ctrl && shift && ['i', 'j', 'c', 'k'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      // PrintScreen — clear clipboard immediately
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('').catch(() => {})
      }
    }

    // Block drag & drop
    const handleDrag = (e: DragEvent) => e.preventDefault()

    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('dragstart', handleDrag, true)

    return () => {
      if (originalPrintRef.current) window.print = originalPrintRef.current
      document.getElementById('fk-print-block')?.remove()
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('dragstart', handleDrag, true)
    }
  }, [protect])

  return (
    <div
      onContextMenu={protect ? (e) => e.preventDefault() : undefined}
      style={protect ? { userSelect: 'none', WebkitUserSelect: 'none', position: 'relative' } : undefined}
    >

      <Document
        file={blob}
        onLoadSuccess={({ numPages }) => { setNumPages(numPages); onLoadSuccess(numPages) }}
        onLoadError={(err) => onError(err.message)}
      >
        <div className="relative">
          <Page
            pageNumber={currentPage}
            width={width}
            renderTextLayer={!protect}
            renderAnnotationLayer={false}
          />
          {protect && userEmail && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              style={{ zIndex: 9999 }}
            >
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="absolute w-full flex items-center justify-center" style={{ top: `${15 + i * 22}%` }}>
                  <p
                    className="font-mono select-none whitespace-nowrap"
                    style={{ fontSize: '14px', letterSpacing: '0.05em', color: '#000000', opacity: 0.25, transform: 'rotate(-35deg)' }}
                  >
                    {userEmail} · FK Éditions · usage personnel
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Document>

      {/* Navigation */}
      {numPages > 1 && (
        <div className="flex items-center justify-center gap-6 py-4 bg-dark-2 border-t border-dark-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-xs uppercase tracking-widest text-cream-muted hover:text-gold disabled:opacity-30 transition-colors"
          >
            ← Précédent
          </button>
          <span className="text-xs text-cream-muted">
            {currentPage} / {numPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
            disabled={currentPage === numPages}
            className="px-4 py-2 text-xs uppercase tracking-widest text-cream-muted hover:text-gold disabled:opacity-30 transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}
